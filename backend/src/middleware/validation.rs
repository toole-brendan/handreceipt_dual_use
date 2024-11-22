use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, body::MessageBody,
};
use actix_http::body::BoxBody;
use futures::future::{ok, Ready};
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use log::{info, warn, debug, trace};

pub struct RequestValidator;

impl RequestValidator {
    pub fn new() -> Self {
        info!("Initializing RequestValidator middleware");
        debug!("RequestValidator configuration: default");
        RequestValidator
    }
}

impl<S, B> Transform<S, ServiceRequest> for RequestValidator
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static + Clone,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = RequestValidatorMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RequestValidatorMiddleware { service })
    }
}

pub struct RequestValidatorMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for RequestValidatorMiddleware<S>
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
        trace!("RequestValidator processing request: {:?}", req.path());
        debug!("Request headers: {:?}", req.headers());
        info!("Entering RequestValidator middleware for path: {}", req.path());

        let fut = self.service.call(req);

        Box::pin(async move {
            match fut.await {
                Ok(res) => {
                    debug!("Request validated successfully");
                    info!("Exiting RequestValidator middleware successfully");
                    Ok(res.map_into_boxed_body())
                },
                Err(err) => {
                    warn!("Validation error in middleware: {}", err);
                    debug!("Validation error details: {:?}", err);
                    Err(err)
                }
            }
        })
    }
}

pub trait Validate {
    fn validate(&self) -> Result<(), String>;
}

pub async fn validate_request<T>(payload: &T) -> Result<(), String>
where
    T: Validate,
{
    payload.validate()
}