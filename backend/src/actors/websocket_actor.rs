// backend/src/actors/websocket_actor.rs

use actix::{Actor, StreamHandler};
use actix_web_actors::ws;
use std::sync::Arc;
use crate::core::SecurityContext;
use crate::services::blockchain::MilitaryBlockchain;

pub struct WebSocketActor {
    security_context: SecurityContext,
    blockchain: Arc<MilitaryBlockchain>,
}

impl WebSocketActor {
    pub fn new(security_context: SecurityContext, blockchain: Arc<MilitaryBlockchain>) -> Self {
        Self {
            security_context,
            blockchain,
        }
    }
}

impl Actor for WebSocketActor {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WebSocketActor {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                println!("Received message: {}", text);
                // Handle incoming messages
            },
            Ok(ws::Message::Binary(bin)) => {
                println!("Received binary: {:?}", bin);
                // Handle binary messages
            },
            _ => (),
        }
    }
} 