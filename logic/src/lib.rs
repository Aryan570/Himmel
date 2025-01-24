//#![allow(dead_code)]
use std::{collections::{HashMap, VecDeque}, sync::Arc};
use serde::{Serialize,Deserialize};
use futures::{channel::mpsc::{unbounded, UnboundedSender}, SinkExt, StreamExt};
use uuid::Uuid;
use async_std::{net::{TcpListener, TcpStream, ToSocketAddrs}, sync::{Mutex, RwLock}, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}, WebSocketStream};
type PlayerId = Uuid;

#[derive(Serialize,Deserialize)]
struct Move {
    h1 : i8, // health of player 1
    h2 : i8, // health of player 2
    buffs_player_1 : u8,
    buffs_player_2 : u8,
    debuffs_player_1 : u8,
    debuffs_player_2 : u8,
    // true => player1 is hitting player 2, false => player2 is hitting
    // player1,(will refactor this part later on)
    attacker : Option<bool>,
    move_type : u8, // only from 1 -> 5 (Some moves add buffs and debuffs, with the damage too) =>
    // 0 if initiliasing the object
}
impl Move {
    fn new() -> Self {
        Move { h1: 100, h2: 100, buffs_player_1: 0, buffs_player_2: 0, debuffs_player_1: 0, debuffs_player_2: 0, attacker: None, move_type: 0 }
    }
    // also add, how to calculate the remaining health
}

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
    async fn add_session(&self, p1 : &PlayerId, p2 : &PlayerId, game_session : GameSession){
        let mut i_t_s = self.id_to_session.write().await;
        i_t_s.insert(*p1, game_session.clone());
        i_t_s.insert(*p2, game_session);
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
    async fn match_player(&self) -> Option<(PlayerId,PlayerId)>{
        let mut queue = self.q.lock().await;
        if queue.len() >=2 {
            let p1 = queue.pop_front().unwrap();
            let p2 = queue.pop_front().unwrap();
            return Some((p1,p2));
        }
        None
    }
}

async fn handle_connection(socket_stream : WebSocketStream<TcpStream>, server_state : &Arc<Mutex<ServerState>>, player : PlayerId){
    let (mut ws_sender, mut ws_recv) = socket_stream.split();
    let (tx, mut rx) = unbounded();
    server_state.lock().await.add_player(player, tx.clone()).await;
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
            let c = server_state.lock().await.get_session(&player).await;
            if let Some(session) = c {
                println!("Here!! I'm");
                handle_move(&session, &server_state, player, txt).await;
            }
        }
    }
    server_state.lock().await.remove_player(&player).await;
}

async fn handle_move(game_session : &GameSession, server_state : &Arc<Mutex<ServerState>>, player : PlayerId, data : String){
    if let Some(id) = game_session.get_opponent(&player) {
        let msg = format!("{{\"move\": {data} }}");
        if server_state.lock().await.send_to_player(&id, msg).await {
            println!("Move sent to : {:?}",id);
        }else {
            println!("Failed to send moves : {:?}",id);
        }
    }
}

pub async fn server(addr : impl ToSocketAddrs) -> Result<()>{
    let listener = TcpListener::bind(addr).await?;
    let mut incoming = listener.incoming();
    let state = Arc::new(Mutex::new(ServerState::new()));
    let match_making = Arc::new(Mutex::new(MatchMaking::new()));
    while let Some(stream) = incoming.next().await {
        let stream = stream?;
        let state_clone = state.clone();
        let mm_clone = match_making.clone();
        spawn(async move {
            let callback = |_req : &Request, res : Response| {
                Ok(res)
            };
            let websocket = accept_hdr_async(stream, callback).await.expect("error in msg");
            let new_player = Uuid::new_v4();
            mm_clone.lock().await.add_player(new_player).await;
            if let Some((p1,p2)) = mm_clone.lock().await.match_player().await {
                let game = GameSession::new(p1, p2);
                state_clone.lock().await.add_session(&p1, &p2, game).await;
            }
            handle_connection(websocket, &state_clone, new_player).await;
        });
    }
    Ok(())
}
