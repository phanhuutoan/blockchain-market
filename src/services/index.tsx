import { createContext, PropsWithChildren, useContext } from "react";
import { DataStore } from "./DataStore";

// If I have more time I can implement a nicer DI instead of this
export { datafeedSingleton as datafeedService } from "./Datafeed";

export type IStoreContext = {
  dataStore: DataStore;
};
export const StoreContext = createContext<IStoreContext | null>(null);

const storeContext = {
  dataStore: new DataStore(),
};

interface Props extends PropsWithChildren<any> {}
export const InjectContext = (props: Props) => {
  return (
    <StoreContext.Provider value={storeContext}>
      {props.children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const dataStore = useContext(StoreContext)

  if (!dataStore) {
    throw Error('data store not yet inject')
  }

  return dataStore
}
