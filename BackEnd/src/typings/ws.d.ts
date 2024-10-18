import { WebSocket } from "ws";

declare module "ws" {
  interface WebSocket {
    userInfo: any;
  }
}
