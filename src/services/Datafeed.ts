import {
  DataFeedEvent,
  DatafeedSubscriber,
  SocketErrorHanlder,
} from "./interfaces";

export enum ContractTypeEnum {
  BTUSD = "PI_XBTUSD",
  ETHUSD = "PI_ETHUSD",
}
export class Datafeed {
  currentContract = ContractTypeEnum.BTUSD;

  private readonly SOCKET_PLAYLOAD = (
    contract: ContractTypeEnum,
    isSubscribe: boolean
  ) => ({
    event: isSubscribe ? "subscribe" : "unsubscribe",
    feed: "book_ui_1",
    product_ids: [contract],
  });

  private readonly SOCKET_HOST = "wss://www.cryptofacilities.com/ws/v1";
  private readonly SOCKET_HOST_ERR = "wss://www.cryptofacilities.com/error";

  private eventList: DataFeedEvent[] = [];
  private socket: WebSocket;

  private subscriberMaps = new Map<number, DatafeedSubscriber>();
  private index = 0;
  private isError = false;
  private interval: any;

  constructor() {
    this.socket = new WebSocket(this.SOCKET_HOST);
  }

  initDatafeed() {
    this.socket.onopen = () => {
      this.socketSendData(this.SOCKET_PLAYLOAD(ContractTypeEnum.BTUSD, true));
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as DataFeedEvent;
        if (data.product_id === this.currentContract) {
          this.storeToList(JSON.parse(event.data));
          this.index++;
        }
      };
    };

    // update data every 0.8s
    this.interval = setInterval(this.triggerSubscribers.bind(this), 800);
  }

  subscribe(subscriber: DatafeedSubscriber) {
    this.index += 1;
    this.subscriberMaps.set(this.index, subscriber);
    return this.index;
  }

  unsubscribe(subscribeId: number) {
    this.subscriberMaps.delete(subscribeId);
  }

  registerSocketErrorHandler(handler: SocketErrorHanlder) {
    this.socket.addEventListener("error", handler);
  }

  throwError() {
    this.closeConnection();
    this.socket = new WebSocket(
      this.isError ? this.SOCKET_HOST : this.SOCKET_HOST_ERR
    );
    this.initDatafeed();
    this.isError = !this.isError;
  }

  closeConnection() {
    clearInterval(this.interval)
    this.socket.close();
  }

  clearList() {
    this.eventList = [];
  }

  switchContract() {
    // ubsub current contract
    this.socketSendData(this.SOCKET_PLAYLOAD(this.currentContract, false));

    if (this.currentContract === ContractTypeEnum.BTUSD) {
      this.currentContract = ContractTypeEnum.ETHUSD;
      this.socketSendData(this.SOCKET_PLAYLOAD(ContractTypeEnum.ETHUSD, true));
    } else if (this.currentContract === ContractTypeEnum.ETHUSD) {
      this.currentContract = ContractTypeEnum.BTUSD;
      this.socketSendData(this.SOCKET_PLAYLOAD(ContractTypeEnum.BTUSD, true));
    }
  }

  private socketSendData(objectData: unknown) {
    this.socket.send(JSON.stringify(objectData));
  }

  private triggerSubscribers() {
    this.subscriberMaps.forEach((fn) => {
      fn(this.eventList);
    });
    this.clearList();
  }

  private storeToList(event: DataFeedEvent) {
    this.eventList.push(event);
  }
}

export const datafeedSingleton = new Datafeed();
