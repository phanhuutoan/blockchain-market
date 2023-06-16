import { DataFeedEvent, DatafeedSubscriber } from "./interfaces";

export class Datafeed {
  private readonly SOCKET_PLAYLOAD = {
    event: "subscribe",
    feed: "book_ui_1",
    product_ids: ["PI_XBTUSD"],
  };
  private readonly SOCKET_HOST = 'wss://www.cryptofacilities.com/ws/v1';  
  private eventList: DataFeedEvent[] = [];
  private socket =  new WebSocket(this.SOCKET_HOST);

  private subscriberMaps = new Map<number, DatafeedSubscriber>()
  private index = 0;

  initDatafeed() {
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify(this.SOCKET_PLAYLOAD))
      this.socket.onmessage = (event) => {
        this.storeToList(JSON.parse(event.data))
      }
    }
    setInterval(this.triggerSubscribers.bind(this), 1000)
  }

  subscribe(subscriber: DatafeedSubscriber ) {
    this.index += 1;
    this.subscriberMaps.set(this.index, subscriber)
    return this.index
  }

  unsubscribe(subscribeId: number) {
    this.subscriberMaps.delete(subscribeId)
  }

  closeConnection() {
    this.socket.close()
  }

  clearList() {
    this.eventList = [];
  }

  private triggerSubscribers() {
    this.subscriberMaps.forEach((fn) => {
      fn(this.eventList)
    })
    this.clearList()
  }

  private storeToList(event: DataFeedEvent) {
    this.eventList.push(event)
  }
}


export const datafeedSingleton = new Datafeed();
