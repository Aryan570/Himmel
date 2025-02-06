#![allow(dead_code)]
use std::{collections::{HashMap, VecDeque}, sync::Arc};
use serde::{Serialize,Deserialize};
use futures::{channel::mpsc::{unbounded, UnboundedSender}, SinkExt, StreamExt};
use uuid::Uuid;
use async_std::{net::{TcpListener, TcpStream, ToSocketAddrs}, sync::{Mutex, RwLock}, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::{handshake::{client::Request, server::Response}, Message, Result}, WebSocketStream};
type PlayerId = Uuid;

#[derive(Serialize,Deserialize,Clone)]
struct Move {
    charac_p1 : String,
    charac_p2 : String,
    h1 : i8, // health of player 1
    h2 : i8, // health of player 2
    buffs_player_1 : u8,
    buffs_player_2 : u8,
    debuffs_player_1 : u8,
    debuffs_player_2 : u8,
    // true => player1 is hitting player 2, false => player2 is hitting
    // player1,(will refactor this part later on)
    attacker : bool, // should it be of type PlayerId ? or 0,1,2
    move_type : u8, // only from 1 -> 5 (Some moves add buffs and debuffs, with the damage too) =>
    // 0 if initiliasing the object
    locked : u8, // => mask that tells you, which powers are locked & which are not
}
// say buff looks like this int bits -> (can be only 1 or 0, but the abilities depends on
// characters)
// X => amount of health to regenerate on the attacker 
// X => amount of additional damage to be done on opponent (Damage multiplier ?) => Gives debuff
// X => toggle Armor (Reduces damage)
// X => Think Something
// X => Think Something

// say debuff look like this ->
// Y => amount of additional damage to be done to the cur
// can't think of anything else, => should this be a bool only ? (Maybe LifeSteal)
impl Move {
    // We might not need this new(), as we ser/deser Move from the client, the thing is => client
    // has to interact to choose charcaters, maybe => when client connects, first they have to
    // choose character from a list and I send connection request with Character to the server,
    // then again I store the Information according to Uuid in the Server_State | Something to
    // think about for sure.
    fn new(c1 : String, c2 : String) -> Self{
        return Move { charac_p1: c1, charac_p2: c2, h1: 100, h2: 100, buffs_player_1: 0, buffs_player_2: 0, debuffs_player_1: 0, debuffs_player_2: 0, attacker: true, move_type: 0, locked: 0 }
    }
    fn calculate(&mut self){
        let mut diff = 0;
        let mut att = 0;
        match self.attacker {
            true => {
                let tmp = self.buffs_player_1;
                if(tmp & (1 << 0)) == 1{ att += 4; } // should be added according to character
                if(tmp & (1 << 1)) == 1{ diff -= 4; } 
                if(tmp & (1 << 2)) == 1{ diff += 2; } 
                // Do a base damage for all the attacks
                let base = -20;
                // we need to do something about Debuffs
                // Update the Current object
                self.h2 = (base + diff + self.h2).max(0);
                self.h1 = (self.h1 + att).max(100);
            }
            _ => {
                let tmp = self.buffs_player_2;
                if(tmp & (1 << 0)) == 1{ att += 4; } // should be added according to character
                if(tmp & (1 << 1)) == 1{ diff -= 4; } 
                if(tmp & (1 << 2)) == 1{ diff += 2; } 
                // Do a base damage for all the attacks
                let base = -20;
                // we need to do something about Debuffs
                // Update the Current object
                self.h1 = (base + diff + self.h2).max(0);
                self.h2 = (self.h1 + att).max(100);
            }
        }
    }
}

#[derive(Clone,Copy)]
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
    id_to_session : RwLock<HashMap<PlayerId,GameSession>>,
    player_to_character : RwLock<HashMap<PlayerId,String>>
}
impl ServerState {
    fn new() -> Self {
        ServerState { players: RwLock::new(HashMap::new()) , id_to_session: RwLock::new(HashMap::new()) , player_to_character : RwLock::new(HashMap::new())}
    }
    async fn add_player(&self, player : PlayerId, sender : UnboundedSender<String>) {
        let mut players = self.players.write().await;
        players.insert(player, sender);
    }
    async fn remove_player(&self, player : &PlayerId){
        let mut players = self.players.write().await;
        players.remove(&player);
        let opponent = self.id_to_session.read().await.get(player).copied();
        self.id_to_session.write().await.remove(player);
        self.player_to_character.write().await.remove(player);
        match opponent {
            Some(x) => {
                let opponent = x.get_opponent(player).expect("No opponent ?");
                self.id_to_session.write().await.remove(&opponent);
            }
            _ => {
                return;
            }
        }
    }
    async fn send_to_player(&self, player : &PlayerId, msg : String) -> bool{
        // we may want to send the info to both the players
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
        let players = self.players.read().await;
        let p1_char = self.player_to_character.read().await.get(p1).expect("p1_char cannot be None").to_string();
        let p2_char = self.player_to_character.read().await.get(p2).expect("p2_char caanot be None").to_string();
        let msg = serde_json::to_string(&Move::new(p1_char,p2_char)).expect("Couldn't convert to Json String"); 
        if let Some(mut sender) = players.get(p1) {
            if sender.send(msg.clone()).await.is_ok(){
                println!("Sent to player : {}",p1);
            }
        }
        if let Some(mut sender) = players.get(p2) {
            if sender.send(msg).await.is_ok(){
                println!("Sent to player : {}",p2);
            }
        }
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

async fn handle_connection(socket_stream : WebSocketStream<TcpStream>, server_state : &Arc<Mutex<ServerState>>, player : PlayerId, mm : &Arc<Mutex<MatchMaking>>){
    let (mut ws_sender, mut ws_recv) = socket_stream.split();
    let (tx, mut rx) = unbounded();
    server_state.lock().await.add_player(player, tx.clone()).await;
    if let Some((p1,p2)) = mm.lock().await.match_player().await {
        // should update when I match players
        let game = GameSession::new(p1, p2);
        server_state.lock().await.add_session(&p1, &p2, game).await;
    }
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
            let mov : Result<Move,_> = serde_json::from_str(&txt);
            let c = server_state.lock().await.get_session(&player).await;
            if mov.is_err() {
                server_state.lock().await.player_to_character.write().await.insert(player, txt);
                continue;
            }
            if let Some(session) = c {
                println!("Here!! I'm");
                handle_move(&session, &server_state, player, mov.unwrap()).await;
            }
        }
    }
    server_state.lock().await.remove_player(&player).await;
}

async fn handle_move(game_session : &GameSession, server_state : &Arc<Mutex<ServerState>>, player : PlayerId, data : Move){
    if let Some(id) = game_session.get_opponent(&player) {
        let msg = serde_json::to_string(&data).expect("cannot convert the move to the serde string"); 
        // parse the data as struct => Move , then call Move.calculate
        // then convert it to JSON String, using serde_json, to transport on network
        if server_state.lock().await.send_to_player(&id, msg.clone()).await {
            println!("Move sent to : {:?}",id);
        }
        if server_state.lock().await.send_to_player(&player, msg).await {
            println!("Move sent to : {:?}",player);
            return;
        }
        println!("There is some error in sending message to both players");
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
            let mut websocket = accept_hdr_async(stream, callback).await.expect("error in msg");
            let new_player = Uuid::new_v4();
            mm_clone.lock().await.add_player(new_player).await;
            if let Some(Ok(charac)) = websocket.next().await {
                println!("Character selected by player : {} is {}",new_player,charac);
                state_clone.lock().await.player_to_character.write().await.insert(new_player, charac.to_string());
            }
            handle_connection(websocket, &state_clone, new_player, &mm_clone).await;
        });
    }
    Ok(())
}
