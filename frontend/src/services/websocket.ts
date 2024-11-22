// frontend/src/services/websocket.ts

import { WebSocketMessage, WebSocketMessageType } from '@/types/websocket';

type WebSocketCallback<T> = (data: T) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private callbacks: Map<WebSocketMessageType, WebSocketCallback<any>[]> = new Map();

  constructor(private url: string) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        const callbacks = this.callbacks.get(message.type) || [];
        callbacks.forEach(callback => callback(message.payload));
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  subscribe(type: WebSocketMessageType, callback: WebSocketCallback<any>) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)?.push(callback);
  }

  unsubscribe(type: WebSocketMessageType, callback: WebSocketCallback<any>) {
    const callbacks = this.callbacks.get(type) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

// Create singleton instance
export const wsService = new WebSocketService(`ws://${window.location.host}/ws`); 