#![allow(dead_code)]
use std::collections::{HashMap, VecDeque};
use futures::{channel::mpsc::{unbounded, UnboundedSender}, SinkExt, StreamExt};
use uuid::Uuid;
use async_std::{net::{TcpListener, TcpStream, ToSocketAddrs}, sync::{Mutex, RwLock}, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}, WebSocketStream};

type PlayerId = Uuid;

#[derive(Clone)]
struct GameSession {
    p1 : PlayerId,
    p2 : PlayerId
}
impl GameSession {
    fn new(player_1 : PlayerId, player_2 : PlayerId) -> Self{
        GameSession { p1: player_1, p2: player_2 }
    }
    fn get_opponent(&self, player : &PlayerId) -> Option<PlayerId> {
        match player {
            p if p == &self.p1 => Some(self.p2),
            p if p == &self.p2 => Some(self.p1),
            _ => None,
        }
    }
}

struct ServerState {
    players : RwLock<HashMap<PlayerId, UnboundedSender<String>>>,
    id_to_session : RwLock<HashMap<PlayerId,GameSession>> 
}
impl ServerState {
    fn new() -> Self {
        ServerState { players: RwLock::new(HashMap::new()) , id_to_session: RwLock::new(HashMap::new()) }
    }
    async fn add_player(&self, player : PlayerId, sender : UnboundedSender<String>) {
        let mut players = self.players.write().await;
        players.insert(player, sender);
    }
    async fn remove_player(&self, player : &PlayerId){
        let mut players = self.players.write().await;
        players.remove(&player);
    }
    async fn send_to_player(&self, player : &PlayerId, msg : String) -> bool{
        let players = self.players.read().await;
        if let Some(mut sender) = players.get(player) {
            if sender.send(msg).await.is_ok(){
                return true;
            }
        }
        false
    }
    async fn add_session(&self, p1 : &PlayerId, p2 : &PlayerId, game_session : &GameSession){
        let mut i_t_s = self.id_to_session.write().await;
        i_t_s.insert(*p1, game_session.clone());
        i_t_s.insert(*p2, game_session.clone());
    }
    async fn get_session(&self, player : &PlayerId) -> Option<GameSession>{
        let id_session = self.id_to_session.read().await;
        id_session.get(player).cloned()
    }
}

struct MatchMaking {
    q : Mutex<VecDeque<PlayerId>>,
}

impl MatchMaking {
    fn new() -> Self{
        MatchMaking { q : Mutex::new(VecDeque::new()) }
    }
    async fn add_player(&self, player : PlayerId){
        let mut queue = self.q.lock().await;
        queue.push_back(player);
    }
    async fn match_player(&self) -> Option<(Uuid,Uuid)>{
        let mut queue = self.q.lock().await;
        if queue.len() >=2 {
            let p1 = queue.pop_front().unwrap();
            let p2 = queue.pop_front().unwrap();
            return Some((p1,p2));
        }
        None
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
            if let Some(session) = server_state.get_session(&player).await {
                handle_move(&session, &server_state, player, txt).await;
            }
        }
    }
    server_state.remove_player(&player).await;
}

async fn handle_move(game_session : &GameSession, server_state : &ServerState, player : PlayerId, data : String){
    if let Some(id) = game_session.get_opponent(&player) {
        let msg = format!("{{\"move\": {data} }}");
        if server_state.send_to_player(&id, msg).await {
            println!("Move sent to : {:?}",id);
        }else {
            println!("Failed to send moves : {:?}",id);
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
