use async_std::{net::{TcpListener, ToSocketAddrs}, task::spawn};
use async_tungstenite::{accept_hdr_async, tungstenite::handshake::{client::Request, server::Response}};
type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;
pub async fn server(addr : impl ToSocketAddrs) -> Result<()>{
    let listener = TcpListener::bind(addr).await?;
    for stream in listener.incoming(){
        spawn( (async || {
            let callback = |req : &Request, mut res : Response| {
                println!("Request from the client");
                println!("Path of the request is : " req.uri().path());
                for (ref header, _) in req.headers(){
                    println!("* {header}");
                }
                Ok(res)
            };
            let mut websocket = accept_hdr_async(stream, callback);
        })());
    }
    Ok(())
}