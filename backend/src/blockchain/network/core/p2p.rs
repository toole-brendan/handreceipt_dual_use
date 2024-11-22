// backend/src/blockchain/network/core/p2p.rs

use tokio::sync::mpsc;
use libp2p::{
    core::upgrade,
    floodsub::{Floodsub, FloodsubEvent, Topic},
    identity,
    mdns::{Mdns, MdnsEvent},
    swarm::{NetworkBehaviourEventProcess, SwarmEvent},
    NetworkBehaviour, PeerId,
};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

const TRANSFER_TOPIC: &str = "property_transfers";
const BLOCK_TOPIC: &str = "blocks";

#[derive(NetworkBehaviour)]
#[behaviour(event_process = true)]
pub struct BlockchainBehaviour {
    pub floodsub: Floodsub,
    pub mdns: Mdns,
    #[behaviour(ignore)]
    pub response_sender: mpsc::UnboundedSender<BlockchainEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkMessage {
    NewTransaction(Transaction),
    NewBlock(Block),
    RequestChain { from_height: u64 },
    ChainResponse { blocks: Vec<Block> },
    TransferConfirmation { transaction_id: Uuid, confirmer: PeerId },
}

pub struct P2PNetwork {
    swarm: Swarm<BlockchainBehaviour>,
    event_sender: mpsc::UnboundedSender<BlockchainEvent>,
    event_receiver: mpsc::UnboundedReceiver<BlockchainEvent>,
}

impl P2PNetwork {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let id_keys = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(id_keys.public());
        
        let (response_sender, event_receiver) = mpsc::unbounded_channel();
        
        let transport = libp2p::development_transport(id_keys.clone()).await?;
        let behaviour = BlockchainBehaviour {
            floodsub: Floodsub::new(peer_id),
            mdns: Mdns::new(Default::default()).await?,
            response_sender: response_sender.clone(),
        };

        let swarm = Swarm::new(transport, behaviour, peer_id);
        
        Ok(Self {
            swarm,
            event_sender: response_sender,
            event_receiver,
        })
    }

    pub async fn start(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;
        
        loop {
            tokio::select! {
                event = self.swarm.next() => {
                    if let Some(event) = event {
                        self.handle_swarm_event(event).await?;
                    }
                }
                event = self.event_receiver.recv() => {
                    if let Some(event) = event {
                        self.handle_blockchain_event(event).await?;
                    }
                }
            }
        }
    }

    async fn handle_swarm_event(
        &self,
        event: SwarmEvent,
    ) -> Result<(), Box<dyn std::error::Error>> {
        match event {
            SwarmEvent::Behaviour(BehaviourEvent::Mdns(MdnsEvent::Discovered(peers))) => {
                for (peer, _) in peers {
                    self.swarm.behaviour_mut().floodsub.add_node_to_partial_view(peer);
                    self.event_sender.send(BlockchainEvent::NewPeer(peer))?;
                }
            }
            SwarmEvent::Behaviour(BehaviourEvent::Mdns(MdnsEvent::Expired(peers))) => {
                for (peer, _) in peers {
                    self.swarm.behaviour_mut().floodsub.remove_node_from_partial_view(&peer);
                    self.event_sender.send(BlockchainEvent::PeerLeft(peer))?;
                }
            }
            SwarmEvent::Behaviour(BehaviourEvent::Floodsub(FloodsubEvent::Message(message))) => {
                if let Ok(network_msg) = serde_json::from_slice::<NetworkMessage>(&message.data) {
                    match network_msg {
                        NetworkMessage::NewTransaction(transaction) => {
                            self.event_sender.send(BlockchainEvent::NewTransaction(transaction))?;
                        }
                        NetworkMessage::NewBlock(block) => {
                            self.event_sender.send(BlockchainEvent::NewBlock(block))?;
                        }
                        NetworkMessage::TransferConfirmation { transaction_id, confirmer } => {
                            self.handle_transfer_confirmation(transaction_id, confirmer).await?;
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    async fn handle_blockchain_event(
        &self,
        event: BlockchainEvent,
    ) -> Result<(), Box<dyn std::error::Error>> {
        match event {
            BlockchainEvent::NewTransaction(transaction) => {
                let message = NetworkMessage::NewTransaction(transaction);
                self.broadcast_message(TRANSFER_TOPIC, message).await?;
            }
            BlockchainEvent::NewBlock(block) => {
                let message = NetworkMessage::NewBlock(block);
                self.broadcast_message(BLOCK_TOPIC, message).await?;
            }
            _ => {}
        }
        Ok(())
    }

    async fn broadcast_transaction(
        &self,
        transaction: Transaction,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let message = NetworkMessage::NewTransaction(transaction);
        self.broadcast_message(TRANSFER_TOPIC, message).await
    }

    async fn broadcast_message(
        &self,
        topic: &str,
        message: NetworkMessage,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let data = serde_json::to_vec(&message)?;
        self.swarm.behaviour_mut().floodsub.publish(Topic::new(topic), data);
        Ok(())
    }

    async fn handle_transfer_confirmation(
        &self,
        transaction_id: Uuid,
        confirmer: PeerId,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // Track confirmation and notify when sufficient confirmations received
        // Implementation depends on confirmation requirements
        Ok(())
    }
}
