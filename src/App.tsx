/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { appStyle } from "./styles";
import OrderTable from "./components/tables/OrderTable";
import { headingBuy, headingSell } from "./mock/data";
import { useStoreContext } from "./services";
import { observer } from "mobx-react-lite";
import "./global.css";
import { GroupLevel } from "./services/DataStore";
import { GroupSelect } from "./components/GroupSelect";
import { SwitchIcon } from "./Icons/icon-svg";
import { WarningIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

function App() {
  const dataStore = useStoreContext().dataStore;
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true);
  
  function _onSelectGroup(groupLevel: GroupLevel) {
    dataStore.changeGroupLevel(groupLevel);
  }

  dataStore.registerSocketErrHanlder((err) => {
    toast({
      title: 'An error cause.',
      description: "Please re-check your websocket",
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  })

  
  useEffect(() => {
    let renderCheck = false;
    if(dataStore.orderBuyTableData.length > 0 && !renderCheck) {
      setIsLoading(false)
      renderCheck = true;
    } else if (dataStore.orderBuyTableData.length === 0) {
      setIsLoading(true)
    }
  }, [dataStore.orderBuyTableData])

  function _renderOrderBookTable() {
    if (!isLoading) {
      return (
        <Flex role="ORDER_TABLE">
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
      )
    } else {
      return (
        <Center h="70%">
          <Spinner color='gray.500' mr={4} size={'lg'}/>
          <Text data-testid="LOADING_TEXT">Loading data...</Text>
        </Center>
      )
    }
  }

  return (
    <Center className="App" flexDir={"column"}>
      <Text mb="2rem" as="h2" fontSize="2rem">
        The Order book: {dataStore.currentContract}
      </Text>
      <Box sx={appStyle.root} id="order-book">
        <GroupSelect
          onSelectGroup={_onSelectGroup}
          groupLevel={dataStore.groupLevel}
          contract={dataStore.currentContract}
        />
        <Divider mt="1rem" />
        {_renderOrderBookTable()}
      </Box>
      <Flex mt="1.5rem">
        <Button
          mr="1rem"
          onClick={() => dataStore.switchContract()}
          bgColor="purple.500"
          leftIcon={<SwitchIcon boxSize={"1.5rem"} fill={"gray.100"} />}
        >
          Toggle feed
        </Button>

        <Button
          bgColor="red.500"
          onClick={() => dataStore.throwError()}
          leftIcon={<WarningIcon boxSize={"1.5rem"} fill={"gray.100"} />}
        >
          Kill feed
        </Button>
      </Flex>
    </Center>
  );
}

export default observer(App);
