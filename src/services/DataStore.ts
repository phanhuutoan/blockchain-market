import { action, observable, makeObservable } from "mobx";
import { datafeedService } from ".";
import { Datafeed } from "./Datafeed";
import { DataFeedEvent, Price, Size, TransactionDataSet } from "./interfaces";
import "reflect-metadata";

type GroupLevel = 0.5 | 1 | 2.5;

export class DataStore {
  orderSellTableData: Array<number[]> = [];
  orderBuyTableData: Array<number[]> = [];

  private temporarySellData = new Map<Price, Size>();
  private temporaryBuyData = new Map<Price, Size>();
  private groupLevel: GroupLevel = 0.5;
  private datafeedService: Datafeed;

  constructor() {
    makeObservable(this, {
      orderSellTableData: observable,
      orderBuyTableData: observable,
      datafeedSubsriber: action,
      updateTableData: action
    });
    this.datafeedService = datafeedService;
    this.subscribeDatafeed();
  }

  subscribeDatafeed() {
    this.datafeedService.subscribe(this.datafeedSubsriber.bind(this));
  }

  datafeedSubsriber(datafeedEvents: DataFeedEvent[]) {
    const snapshotData = this.getSnapshotData(datafeedEvents);
    if (snapshotData) {
      this.calculateSnapshotData(snapshotData);
    }

    this.updateTempData(datafeedEvents, 'buy');
    this.updateTempData(datafeedEvents, 'sell');
    this.updateTableData()
  }

  updateTableData() {
    const arrayBuyData = Array.from(this.temporaryBuyData) as Array<TransactionDataSet>
    const arraySellData = Array.from(this.temporarySellData) as Array<TransactionDataSet>

    this.orderBuyTableData = this.buildTableData(arrayBuyData)
    this.orderSellTableData = this.buildTableData(arraySellData)
  }

  private calculateSnapshotData(datafeedEventData: DataFeedEvent) {
    this.orderBuyTableData = this.transformToTableData(
      datafeedEventData,
      "buy"
    );

    this.orderSellTableData = this.transformToTableData(
      datafeedEventData,
      "sell"
    );
  }

  private updateTempData(
    datasets: DataFeedEvent[],
    tableType: "sell" | "buy" = "sell"
  ) {
    let tempData =
      tableType === "buy" ? this.temporaryBuyData : this.temporarySellData;
    
    if(datasets.length === 0) {
      return;
    }

    datasets.forEach((dataset) => {
      const newTransactionData =
        tableType === "buy" ? dataset.bids : dataset.asks;

      if (!newTransactionData){
        return;
      }

      if (tempData.size !== 0) {
        tempData = new Map(newTransactionData);
      }

      newTransactionData.forEach((transaction) => {
        const price = transaction[0];
        const size = transaction[1];
        if (tempData.has(price) && size === 0) {
          tempData.delete(price);
        } else {
          tempData.set(price, size);
        }
      });
    });

    console.log('TEMP DATA', tempData);

    if (tableType === "buy") {
      this.temporaryBuyData = tempData;
    } else if (tableType === "sell") {
      this.temporarySellData = tempData;
    }
  }

  private getSnapshotData(datafeedEvents: DataFeedEvent[]) {
    let snapshotData: DataFeedEvent | null = null;
    for (const dEvent of datafeedEvents) {
      if (dEvent.feed === "book_ui_1_snapshot") {
        snapshotData = dEvent;
        break;
      }
    }

    return snapshotData;
  }

  private transformToTableData(
    dataset: DataFeedEvent,
    tableType: "buy" | "sell" = "buy"
  ) {
    let buyData = dataset.bids;
    let sellData = dataset.asks;

    this.temporaryBuyData = new Map(buyData)
    this.temporarySellData = new Map(sellData)

    // filter out data using group level
    const data = tableType === "buy" ? buyData : sellData;

    if (!data) {
      return [];
    }

    const filteredData = data.filter(
      (bData) => bData[0] % this.groupLevel === 0
    );
    let tableData: Array<number[]> = this.buildTableData(filteredData);

    return tableType === "buy"
      ? tableData
      : tableData.map((tData) => tData.reverse());
  }

  private buildTableData(dataset: TransactionDataSet[]) {
    const filteredData = dataset.filter(
      (bData) => bData[0] % this.groupLevel === 0
    );

    let tableData: Array<number[]> = [];
    for (let i = 0; i < filteredData.length; i++) {
      const currentData = filteredData[i];
      const previousTotal = tableData[i - 1]?.[0] || 0;
      const total = currentData[1] + previousTotal;
      tableData.push([
        total,
        currentData[1], // size
        currentData[0], // price
      ]);
    }

    return tableData;
  }
}
