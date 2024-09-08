use async_std::{net::{TcpListener, ToSocketAddrs}, stream::StreamExt, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}};
// type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;
pub async fn server(addr : impl ToSocketAddrs) -> Result<()>{
    let listener = TcpListener::bind(addr).await?;
    let mut incoming = listener.incoming();
    while let Some(stream) = incoming.next().await {
        let stream = stream?;
        spawn( async move {
            let callback = |req : &Request, res : Response| {
                println!("Request from the client");
                println!("Path of the request is : {}", req.uri().path());
                for (ref header, _) in req.headers(){
                    println!("* {header}");
                }
                Ok(res)
            };
            let mut websocket = accept_hdr_async(stream, callback).await.expect("error in msg");
            while let Some(Ok(message)) = websocket.next().await {
                match message {
                    Message::Text(text) => println!("Text message received: {}",text),
                    Message::Binary(bin) => println!("Binary message received: {:?}",bin),
                    Message::Close(_) => println!("Client disconnected"),
                    _ => {},
                }
            }
        });
    }
    Ok(())
}