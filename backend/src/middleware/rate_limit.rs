use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse, body::MessageBody,
};
use actix_http::body::BoxBody;
use futures::future::{ok, Ready};
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::sync::{Arc, RwLock};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use serde_json::json;
use log::{info, warn, debug, trace};

#[derive(Clone, Debug)]
pub struct Config {
    pub requests_per_minute: u32,
    pub burst_size: u32,
}

pub struct RateLimiter {
    clients: Arc<RwLock<HashMap<String, (u32, DateTime<Utc>)>>>,
    config: Config,
}

impl RateLimiter {
    pub fn new(config: Config) -> Self {
        info!("Initializing RateLimiter middleware");
        debug!("RateLimiter configuration: {:?}", config);
        trace!("Creating new RateLimiter instance");
        RateLimiter {
            clients: Arc::new(RwLock::new(HashMap::new())),
            config,
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static + Clone,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = RateLimitMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RateLimitMiddleware {
            service,
            clients: self.clients.clone(),
            config: self.config.clone(),
        })
    }
}

pub struct RateLimitMiddleware<S> {
    service: S,
    clients: Arc<RwLock<HashMap<String, (u32, DateTime<Utc>)>>>,
    config: Config,
}

impl<S, B> Service<ServiceRequest> for RateLimitMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static + Clone,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        trace!("RateLimiter processing request: {:?}", req.path());
        debug!("Request headers: {:?}", req.headers());
        info!("Entering RateLimiter middleware for path: {}", req.path());
        
        let clients = self.clients.clone();
        let config = self.config.clone();
        let service = self.service.clone();
        let client_ip = req
            .connection_info()
            .realip_remote_addr()
            .unwrap_or("unknown")
            .to_string();

        debug!("Client IP: {}", client_ip);

        Box::pin(async move {
            let mut clients_guard = clients.write().unwrap();
            let now = Utc::now();

            let (count, last_reset) = clients_guard
                .entry(client_ip.clone())
                .or_insert((0, now));

            debug!("Current request count for {}: {}", client_ip, count);
            trace!("Last reset time for {}: {}", client_ip, last_reset);

            if now.signed_duration_since(*last_reset).num_minutes() >= 1 {
                debug!("Resetting counter for {}", client_ip);
                *count = 1;
                *last_reset = now;
            } else if *count >= config.requests_per_minute {
                warn!("Rate limit exceeded for IP: {} (Count: {})", client_ip, count);
                debug!("Rate limit details - Limit: {}, Current: {}", config.requests_per_minute, count);
                let response = HttpResponse::TooManyRequests()
                    .json(json!({
                        "error": true,
                        "message": "Rate limit exceeded. Please try again later",
                        "retry_after": 60 - now.signed_duration_since(*last_reset).num_seconds(),
                        "timestamp": now.to_rfc3339(),
                    }));
                let (req_parts, _) = req.into_parts();
                return Ok(ServiceResponse::new(
                    req_parts,
                    response,
                ).map_body(|_, body| BoxBody::new(body)))
            } else {
                *count += 1;
                debug!("Incremented request count for {} to {}", client_ip, count);
            }

            info!("Exiting RateLimiter middleware");
            drop(clients_guard);
            service.call(req).await.map(|res| res.map_body(|_, body| BoxBody::new(body)))
        })
    }
} 