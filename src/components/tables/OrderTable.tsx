import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { uniqueId } from "lodash";
import { tableStyle } from "./tableStyle";
import _ from "lodash";

interface OrderTableProps {
  listHeading: string[];
  listRows: Array<number[]>;
  textAlign?: "left" | "right";
  tableType?: "sell" | "buy";
}

const OrderTable = (props: OrderTableProps) => {
  const { listHeading, listRows, textAlign = "left", tableType } = props;
  const formater = new Intl.NumberFormat()
  const maxTotal = (tableType === 'buy' ? _.last(listRows)?.[0] :  _.last(listRows)?.[2]) || 0

  function _colorCompute(index: number) {
    const priceColor = tableType === "sell" ? "red.500" : "green.500";
    if (tableType === "buy") {
      return index === 2 ? priceColor : "";
    } else if (tableType === "sell") {
      return index === 0 ? priceColor : "";
    }
  }

  function _renderRows() {
    return listRows.map((row) => {
      const rowIndex = listRows.indexOf(row);
      const percent = (tableType === 'buy' ? row[0] / maxTotal : row[2] / maxTotal) * 100
      return (
        <Tr key={rowIndex} sx={tableStyle(tableType, percent).row}>
          {row.map((cell, index) => (
            <Td
              key={`row-${rowIndex}-${uniqueId()}`}
              textAlign={textAlign}
              color={_colorCompute(index)}
              py="6.5px"
              fontSize={'16px'}
            >
              {formater.format(cell)}
            </Td>
          ))}
        </Tr>
      );
    });
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            {listHeading.map((heading) => (
              <Th key={heading} textAlign={textAlign}>
                {heading}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{_renderRows()}</Tbody>
      </Table>
    </TableContainer>
  );
};

export default OrderTable;
