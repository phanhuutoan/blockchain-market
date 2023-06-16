
export type Price = number;
export type Size = number;

/**
 * TransactionDataSet = [price, size]
 */
export type TransactionDataSet = [Price, Size]

export interface DataFeedEvent {
    feed: string,
    product_id: string
    bids: TransactionDataSet[],
    asks: TransactionDataSet[]
  }

export type DatafeedSubscriber = (datafeedEvents: DataFeedEvent[]) => void