#![allow(dead_code)]
use std::collections::HashMap;
use futures::{channel::mpsc::{unbounded, UnboundedSender}, SinkExt, StreamExt};
use uuid::Uuid;
use async_std::{net::{TcpListener, TcpStream, ToSocketAddrs}, sync::RwLock, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}, WebSocketStream};
type PlayerId = Uuid;
struct GameSession {
    p1 : PlayerId,
    p2 : PlayerId
}
impl GameSession {
    fn get_opponent(&self, player : &PlayerId) -> Option<PlayerId> {
        match player {
            p if p == &self.p1 => Some(self.p2),
            p if p == &self.p2 => Some(self.p1),
            _ => None,
        }
    }
}

struct ServerState {
    players : RwLock<HashMap<PlayerId, UnboundedSender<String>>>
}
impl ServerState {
    async fn add_player(&self, player : PlayerId, sender : UnboundedSender<String>) {
        let mut players = self.players.write().await;
        players.insert(player, sender);
    }
    async fn remove_player(&self, player : PlayerId){
        let mut players = self.players.write().await;
        players.remove(&player);
    }
}
async fn handle_connection(socket_stream : WebSocketStream<TcpStream>, server_state : ServerState, player : PlayerId){
    let (mut ws_sender, mut ws_recv) = socket_stream.split();
    let (tx, mut rx) = unbounded();
    server_state.add_player(player, tx.clone()).await;
    spawn(async move {
        while let Some(msg) = rx.next().await {
           if ws_sender.send(Message::Text(msg)).await.is_err() {
                println!("Failed to send msg to the player : {:?}",player);
                break;
           } 
        }
    });
    while let Some(Ok(msg)) = ws_recv.next().await {
        if let Message::Text(txt) = msg {
            println!("Received message from player {:?} : {}",player,txt);
            // handle the move
        }
    }
    server_state.remove_player(player).await;
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
