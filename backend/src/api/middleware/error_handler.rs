use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse, body::MessageBody,
};
use actix_http::body::BoxBody;
use futures::future::{ok, Ready};
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use serde_json::json;
use tracing::{info, error, debug, trace};
use chrono::Utc;

pub struct ErrorHandler;

impl ErrorHandler {
    pub fn new() -> Self {
        info!("Initializing ErrorHandler middleware");
        debug!("ErrorHandler configuration: default");
        ErrorHandler
    }
}

impl<S, B> Transform<S, ServiceRequest> for ErrorHandler
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static + Clone,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = ErrorHandlerMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ErrorHandlerMiddleware { service })
    }
}

pub struct ErrorHandlerMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ErrorHandlerMiddleware<S>
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
        trace!("ErrorHandler processing request: {:?}", req.path());
        debug!("Request headers: {:?}", req.headers());
        info!("Entering ErrorHandler middleware for path: {}", req.path());
        
        let service = self.service.clone();
        let (http_req, _) = req.into_parts();

        Box::pin(async move {
            let new_req = ServiceRequest::from_request(http_req.clone());
            match service.call(new_req).await {
                Ok(res) => {
                    debug!("Request processed successfully");
                    info!("Exiting ErrorHandler middleware successfully");
                    Ok(res.map_body(|_, body| BoxBody::new(body)))
                },
                Err(err) => {
                    error!("Error processing request: {:?}", err);
                    debug!("Creating error response");
                    let response = HttpResponse::InternalServerError()
                        .json(json!({
                            "error": true,
                            "message": err.to_string(),
                            "timestamp": Utc::now().to_rfc3339(),
                        }));

                    Ok(ServiceResponse::new(
                        http_req,
                        response,
                    ).map_body(|_, body| BoxBody::new(body)))
                }
            }
        })
    }
}
