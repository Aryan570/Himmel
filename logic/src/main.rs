use async_std::task::block_on;
use logic::server;
fn main() {
    // use the port 8000 as the server
    let connect = server("127.0.0.1:8000");
    let _connect = block_on(connect);
}
