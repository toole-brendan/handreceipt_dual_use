// backend/src/actors/websocket_actor.rs

use actix::{Actor, StreamHandler, ActorContext, AsyncContext, Handler};
use actix_web_actors::ws;
use std::sync::Arc;
use uuid::Uuid;
use bytestring::ByteString;
use futures::future::{self, Future};
use actix::fut::{ActorFuture, WrapFuture};

use crate::types::{
    app::BlockchainService,
    security::SecurityContext,
    audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
    blockchain::Transaction,
    sync::{BroadcastMessage, SyncPriority},
    error::CoreError,
};

pub struct WebSocketActor {
    security_context: SecurityContext,
    blockchain: Arc<dyn BlockchainService>,
}

impl WebSocketActor {
    pub fn new(security_context: SecurityContext, blockchain: Arc<dyn BlockchainService>) -> Self {
        Self {
            security_context,
            blockchain,
        }
    }

    async fn handle_transaction(&self, transaction: Transaction) -> Result<(), CoreError> {
        // Create audit event
        let event = AuditEvent {
            id: Uuid::new_v4(),
            timestamp: chrono::Utc::now(),
            event_type: AuditEventType::AssetTransferred,
            status: AuditStatus::Success,
            details: serde_json::json!({
                "transaction_id": transaction.id,
                "timestamp": transaction.timestamp,
            }),
            context: AuditContext {
                user_id: Some(self.security_context.user_id.to_string()),
                resource_id: Some(transaction.id.to_string()),
                action: "HANDLE_TRANSACTION".to_string(),
                severity: AuditSeverity::Medium,
                metadata: None,
            },
        };

        // Submit transaction to blockchain
        self.blockchain.submit_transaction(transaction.data.as_bytes().to_vec()).await?;

        Ok(())
    }

    fn handle_ws_message(&mut self, text: String, ctx: &mut ws::WebsocketContext<Self>) {
        if let Ok(transaction) = serde_json::from_str::<Transaction>(&text) {
            let blockchain = self.blockchain.clone();

            let fut = async move {
                match blockchain.submit_transaction(transaction.data.as_bytes().to_vec()).await {
                    Ok(_) => ByteString::from("Transaction submitted"),
                    Err(e) => ByteString::from(format!("Error: {}", e)),
                }
            };

            ctx.spawn(
                Box::pin(
                    fut.into_actor(self)
                        .map(|res, _, ctx| ctx.text(res))
                )
            );
        }
    }
}

impl Actor for WebSocketActor {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        log::info!("WebSocket connection started");
    }

    fn stopped(&mut self, ctx: &mut Self::Context) {
        log::info!("WebSocket connection closed");
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WebSocketActor {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                self.handle_ws_message(text.to_string(), ctx);
            },
            Ok(ws::Message::Binary(bin)) => {
                log::info!("Received binary message: {:?}", bin);
            },
            Ok(ws::Message::Close(reason)) => {
                log::info!("WebSocket closing: {:?}", reason);
                ctx.close(reason);
                ctx.stop();
            },
            _ => (),
        }
    }
} 