import http from "http";

declare module "http" {
  interface IncomingMessage {
    userInfo: any;
  }
}
