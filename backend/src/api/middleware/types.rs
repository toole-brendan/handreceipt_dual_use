use actix_web::{dev::ServiceResponse, Error, body::MessageBody};
use actix_http::body::BoxBody;
use std::future::Future;
use std::pin::Pin;

pub type MiddlewareFuture<B> = Pin<Box<dyn Future<Output = Result<ServiceResponse<B>, Error>> + 'static>>;

pub trait MiddlewareService<B: MessageBody + 'static> {
    fn transform_response(response: ServiceResponse<B>) -> ServiceResponse<BoxBody>;
} 