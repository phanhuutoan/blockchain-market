import { Box, Center, Divider, Flex, Select, Text } from "@chakra-ui/react";
import { appStyle } from "./styles";
import OrderTable from "./components/tables/OrderTable";
import { headingBuy, headingSell } from "./mock/data";
import { useStoreContext } from "./services";
import { observer } from "mobx-react-lite";
import './global.css'

function App() {
  const dataStore = useStoreContext().dataStore;

  return (
    <Center className="App" flexDir={"column"}>
      <Text mb="2rem" as="h2" fontSize="2rem">
        The Order book
      </Text>
      <Box sx={appStyle.root} id="order-book">
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Text as="p" color="inherit" fontSize={"1.2rem"}>
            Order book
          </Text>
          <Select w="8rem" defaultValue="0.5">
            <option value="0.5">Group 0.5</option>
            <option value="1">Group 1</option>
            <option value="2.5">Group 2.5</option>
          </Select>
        </Flex>
        <Divider mt="1rem" />
        {dataStore.orderBuyTableData && dataStore.orderSellTableData ? (
          <Flex>
            <Box w="100%">
              <OrderTable
                listHeading={headingBuy}
                listRows={dataStore.orderBuyTableData}
                textAlign="right"
                tableType="buy"
              />
            </Box>
            <Box w="100%">
              <OrderTable
                listHeading={headingSell}
                listRows={dataStore.orderSellTableData}
                textAlign="left"
                tableType="sell"
              />
            </Box>
          </Flex>
        ) : (
          <Text m="2rem" fontSize={"2.5rem"}>
            Wait for loading data...
          </Text>
        )}
      </Box>
    </Center>
  );
}

export default observer(App);
