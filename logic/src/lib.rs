use std::{collections::VecDeque, sync::Arc};
use async_std::{net::{TcpListener, TcpStream, ToSocketAddrs}, stream::StreamExt, sync::RwLock, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}, WebSocketStream};
// type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;
type WebSocket = Arc<RwLock<WebSocketStream<TcpStream>>>;
pub async fn server(addr : impl ToSocketAddrs) -> Result<()>{
    let listener = TcpListener::bind(addr).await?;
    let mut incoming = listener.incoming();
    let q: Arc<RwLock<VecDeque<WebSocket>>> = Arc::new(RwLock::new(VecDeque::new()));
    while let Some(stream) = incoming.next().await {
        let stream = stream?;
        let q = q.clone();
        spawn( async move {
            let callback = |req : &Request, res : Response| {
                println!("Request from the client");
                println!("Path of the request is : {}", req.uri().path());
                for (ref header, _) in req.headers(){
                    println!("* {header}");
                }
                Ok(res)
            };
            let websocket = Arc::new(RwLock::new(accept_hdr_async(stream, callback).await.expect("error in msg")));
            {
                let mut lock = q.write_arc().await;
                lock.push_back(websocket.clone());
            }
            while let Some(Ok(message)) = websocket.write_arc().await.next().await {
                match message {
                    Message::Text(text) => println!("Text message received: {}",text),
                    Message::Binary(bin) => println!("Binary message received: {:?}",bin),
                    Message::Close(_) => println!("Client disconnected"),
                    _ => {},
                }
            }
            let mut lock = q.write_arc().await;
            if let Some(x) = lock.iter().position(|ws| Arc::ptr_eq(ws, &websocket)){
                lock.remove(x);
            }
            println!("{}",lock.len());
        });
    }
    Ok(())
}