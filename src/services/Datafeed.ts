import { io } from "socket.io-client";

class Datafeed {
  private readonly socketBTUSDPayload = {
    event: "subscribe",
    feed: "book_ui_1",
    product_ids: ["PI_XBTUSD"],
  };
  private socket = io("wss://www.cryptofacilities.com/ws/v1", {
    query: this.socketBTUSDPayload,
    autoConnect: false
  });

  constructor() {}

  initDatafeed() {
    this.socket.connect()
    this.socket.on('connected', (data) => {
      console.log('Connected');
      console.log('DATA', data);
    })
  }
}

export const datafeedSingleton = new Datafeed();
