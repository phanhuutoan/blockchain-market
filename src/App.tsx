import { Box, Center, Divider, Flex, Select, Text } from "@chakra-ui/react";
import { appStyle } from "./styles";
import OrderTable from "./components/tables/OrderTable";
import { headingBuy, headingSell, rowBuy, rowSell } from "./mock/data";

function App() {
  return (
    <Center className="App" flexDir={"column"}>
      <Text mb="2rem" as="h2" fontSize="2rem">
        The Order book
      </Text>
      <Box sx={appStyle.root}>
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
        <Flex>
          <Box w="100%">
            <OrderTable
              listHeading={headingBuy}
              listRows={rowBuy}
              textAlign="right"
              tableType="buy"
            />
          </Box>
          <Box w="100%">
            <OrderTable
              listHeading={headingSell}
              listRows={rowSell}
              textAlign="left"
              tableType="sell"
            />
          </Box>
        </Flex>
      </Box>
    </Center>
  );
}

export default App;
