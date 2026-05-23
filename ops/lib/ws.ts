const WS = process.env.NEXT_PUBLIC_WS ?? "ws://127.0.0.1:8000/ws";

export type BusEvent = { topic: string; payload: any; ts: number };
export type Handler = (e: BusEvent) => void;

class WsClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private retry = 0;
  private connected = false;

  connect() {
    if (typeof window === "undefined") return;
    if (this.connected) return;
    this.connected = true;
    this._open();
  }

  private _open() {
    this.socket = new WebSocket(WS);
    this.socket.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data) as BusEvent;
        this.handlers.forEach((h) => h(m));
      } catch {}
    };
    this.socket.onclose = () => {
      this.retry = Math.min(this.retry + 1, 6);
      setTimeout(() => this._open(), 500 * 2 ** this.retry);
    };
    this.socket.onopen = () => { this.retry = 0; };
  }

  on(h: Handler) {
    this.handlers.add(h);
    return () => { this.handlers.delete(h); };
  }
}

export const wsClient = new WsClient();
