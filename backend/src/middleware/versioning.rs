use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse, body::MessageBody,
};
use actix_http::body::BoxBody;
use futures::future::{ok, Ready};
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use semver::Version;
use serde_json::json;
use log::{info, warn, debug, trace};

#[derive(Clone)]
pub struct ApiVersioning {
    min_version: Version,
    current_version: Version,
}

impl ApiVersioning {
    pub fn new(min_version: &str, current_version: &str) -> Self {
        info!("Initializing ApiVersioning middleware");
        debug!("Version configuration - Min: {}, Current: {}", min_version, current_version);
        
        let min_v = Version::parse(min_version).unwrap();
        let current_v = Version::parse(current_version).unwrap();
        
        trace!("Parsed versions - Min: {:?}, Current: {:?}", min_v, current_v);
        
        ApiVersioning {
            min_version: min_v,
            current_version: current_v,
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for ApiVersioning
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static + Clone,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = ApiVersioningMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ApiVersioningMiddleware {
            service,
            min_version: self.min_version.clone(),
            current_version: self.current_version.clone(),
        })
    }
}

pub struct ApiVersioningMiddleware<S> {
    service: S,
    min_version: Version,
    current_version: Version,
}

impl<S, B> Service<ServiceRequest> for ApiVersioningMiddleware<S>
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
        trace!("ApiVersioning processing request: {:?}", req.path());
        debug!("Request headers: {:?}", req.headers());
        info!("Entering ApiVersioning middleware for path: {}", req.path());
        
        let service = self.service.clone();
        let min_version = self.min_version.clone();
        let current_version = self.current_version.clone();
        let (http_req, _) = req.into_parts();

        Box::pin(async move {
            let version = http_req
                .headers()
                .get("Api-Version")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| Version::parse(v).ok())
                .unwrap_or_else(|| current_version.clone());

            debug!("Requested API version: {}", version);

            if version < min_version {
                let error_msg = format!(
                    "API version {} is no longer supported. Minimum supported version is {}",
                    version, min_version
                );
                warn!("API version mismatch: {}", error_msg);
                debug!("Version details - Requested: {}, Min: {}, Current: {}", 
                    version, min_version, current_version);
                
                let response = HttpResponse::BadRequest()
                    .json(json!({
                        "error": true,
                        "message": error_msg,
                        "min_version": min_version.to_string(),
                        "current_version": current_version.to_string(),
                        "timestamp": chrono::Utc::now().to_rfc3339(),
                    }));
                return Ok(ServiceResponse::new(
                    http_req,
                    response,
                ).map_body(|_, body| BoxBody::new(body)));
            }

            info!("Exiting ApiVersioning middleware");
            debug!("Version check passed successfully");
            let new_req = ServiceRequest::from_request(http_req);
            service.call(new_req).await.map(|res| res.map_body(|_, body| BoxBody::new(body)))
        })
    }
}
