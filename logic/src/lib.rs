use std::collections::VecDeque;
use async_std::{net::{TcpListener, ToSocketAddrs}, stream::StreamExt, sync::Mutex, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}};
struct MatchMaking {
    q : Mutex<VecDeque<String>>
}
impl MatchMaking {
    fn new() -> Self {
        MatchMaking { q : Mutex::new(VecDeque::new()) }
    }
    async fn add(&self, player_id : String){
        let mut queue = self.q.lock().await;
        queue.push_back(player_id);
    }
    async fn match_players(&self) -> Option<(String,String)>{
        let mut queue = self.q.lock().await;
        match queue.len() > 1{
            true => {
                let p1 = queue.pop_front().unwrap();
                let p2 = queue.pop_front().unwrap();
                Some((p1,p2))
            }
            _ => None
        }
    }
}
pub async fn server(addr : impl ToSocketAddrs) -> Result<()>{
    let listener = TcpListener::bind(addr).await?;
    let mut incoming = listener.incoming();
    while let Some(stream) = incoming.next().await {
        let stream = stream?;
        spawn( async move {
            let callback = |_req : &Request, res : Response| {
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
