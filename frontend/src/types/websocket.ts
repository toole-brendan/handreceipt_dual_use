import { Asset, SecurityClassification } from './shared';

export enum WebSocketMessageType {
  AssetUpdate = 'ASSET_UPDATE',
  AssetCountUpdate = 'ASSET_COUNT_UPDATE',
  SystemStatus = 'SYSTEM_STATUS',
  Error = 'ERROR'
}

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
  classification: SecurityClassification;
}

export interface AssetUpdateMessage extends WebSocketMessage<Asset> {
  type: WebSocketMessageType.AssetUpdate;
}

export interface AssetCountMessage extends WebSocketMessage<{ count: number }> {
  type: WebSocketMessageType.AssetCountUpdate;
}

export interface SystemStatusMessage extends WebSocketMessage<{ status: string }> {
  type: WebSocketMessageType.SystemStatus;
}

export interface ErrorMessage extends WebSocketMessage<{ error: string }> {
  type: WebSocketMessageType.Error;
} 