import { action, observable, makeObservable } from "mobx";
import { datafeedService } from ".";
import { ContractTypeEnum, Datafeed } from "./Datafeed";
import {
  DataFeedEvent,
  Price,
  Size,
  SocketErrorHanlder,
  TransactionDataSet,
} from "./interfaces";
import _ from "lodash";

export type GroupLevel = 0.5 | 1 | 2.5 | 0.05 | 0.1 | 0.25;

export const DEFAULT_BTC_LEVEL = 0.5;
export const DEFAUTL_ETH_LEVEL = 0.05;
export class DataStore {
  orderSellTableData: Array<number[]> = [];
  orderBuyTableData: Array<number[]> = [];
  groupLevel: GroupLevel = 0.5;
  currentContract = ContractTypeEnum.BTUSD;

  private temporarySellData = new Map<Price, Size>();
  private temporaryBuyData = new Map<Price, Size>();
  private datafeedService: Datafeed;
  private subscribeId?: number;

  constructor() {
    makeObservable(this, {
      orderSellTableData: observable,
      orderBuyTableData: observable,
      groupLevel: observable,
      currentContract: observable,
      datafeedSubsriber: action,
      updateTableData: action,
      changeGroupLevel: action,
      switchContract: action,
    });
    this.datafeedService = datafeedService;
    this.subscribeId = this.subscribeDatafeed();
  }

  registerSocketErrHanlder(hanlder: SocketErrorHanlder) {
    this.datafeedService.registerSocketErrorHandler(hanlder);
  }

  switchContract() {
    this.orderBuyTableData = []
    this.orderSellTableData = []
    this.unsubDatadeed();
    this.groupLevel =
      this.currentContract === ContractTypeEnum.BTUSD
        ? DEFAUTL_ETH_LEVEL
        : DEFAULT_BTC_LEVEL;
    this.datafeedService.switchContract();
    this.currentContract = this.datafeedService.currentContract;
    this.subscribeId = this.subscribeDatafeed();
  }

  changeGroupLevel(groupLevel: GroupLevel) {
    this.groupLevel = groupLevel;
  }

  subscribeDatafeed() {
    return this.datafeedService.subscribe(this.datafeedSubsriber.bind(this));
  }

  throwError() {
    this.datafeedService.throwError();
  }

  datafeedSubsriber(datafeedEvents: DataFeedEvent[]) {
    const snapshotData = this.getSnapshotData(datafeedEvents);
    if (snapshotData) {
      this.calculateSnapshotData(snapshotData);
    }

    if (
      this.orderBuyTableData.length > 0 &&
      this.orderSellTableData.length > 0
    ) {
      this.updateTempData(datafeedEvents, "buy");
      this.updateTempData(datafeedEvents, "sell");
      this.updateTableData();
    }
  }

  updateTableData() {
    const arrayBuyData = Array.from(
      this.temporaryBuyData
    ) as Array<TransactionDataSet>;
    const arraySellData = Array.from(
      this.temporarySellData
    ) as Array<TransactionDataSet>;

    this.orderBuyTableData = this.buildTableData(arrayBuyData);
    this.orderSellTableData = this.buildTableData(arraySellData, "sell");
  }

  private unsubDatadeed() {
    this.subscribeId && this.datafeedService.unsubscribe(this.subscribeId);
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

    if (datasets.length === 0) {
      return;
    }

    datasets.forEach((dataset) => {
      const newTransactionData =
        tableType === "buy" ? dataset.bids : dataset.asks;

      if (!newTransactionData) {
        return;
      }
      for (let transaction of newTransactionData) {
        const price = transaction[0];
        const size = transaction[1];
        if (size === 0) {
          if (tempData.has(price)) {
            tempData.delete(price);
          }
        } else {
          tempData.set(price, size);
        }        
      }
    });

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

    if (tableType === 'buy') {
      this.temporaryBuyData = new Map(buyData);

    } else {
      this.temporarySellData = new Map(sellData);
    }
    // filter out data using group level
    const data = tableType === "buy" ? buyData : sellData;

    if (!data) {
      return [];
    }

    return this.buildTableData(data);
  }

  private calculateGroupData(originalDataset: TransactionDataSet[]) {
    const toGroupPrice: number[] = [];
    originalDataset.forEach((bData) => {
      // price / groupLevel
      if (Number.isInteger(bData[0] / this.groupLevel)) {
        toGroupPrice.push(bData[0]);
      }
    });

    const groupDatasetData: { [key: number]: Array<TransactionDataSet> } = {};
    toGroupPrice.forEach((groupPrice) => {
      const price = groupPrice;
      groupDatasetData[groupPrice] = [];

      const groupedDatasets = originalDataset.filter(
        (oriDataset) =>
          oriDataset[0] >= price && oriDataset[0] < price + this.groupLevel
      );

      if (groupedDatasets) {
        groupDatasetData[groupPrice] = [
          ...groupedDatasets,
        ] as TransactionDataSet[];
      }
    });
    const finalDatasets: TransactionDataSet[] = [];

    _.forOwn(groupDatasetData, (datasets, price) => {
      let totalSize = 0;
      datasets.forEach((d) => {
        totalSize += d[1];
      });
      finalDatasets.push([Number(price), totalSize]);
    });

    return finalDatasets;
  }

  private buildTableData(
    datasets: TransactionDataSet[],
    tableType: "buy" | "sell" = "buy"
  ) {
    const groupedData = this.calculateGroupData(datasets);

    // sort from high price to low price
    const sortGroupData = groupedData.sort(
      (datasetA, datasetB) => datasetB[0] - datasetA[0]
    );

    let tableData: Array<number[]> = [];
    for (let i = 0; i < sortGroupData.length; i++) {
      const currentData = sortGroupData[i];
      const previousTotal = tableData[i - 1]?.[0] || 0;
      const total = currentData[1] + previousTotal;
      tableData.push([
        total,
        currentData[1], // size
        currentData[0], // price
      ]);
    }

    return tableType === "buy"
      ? tableData
      : tableData.map((tData) => tData.reverse());
  }
}
