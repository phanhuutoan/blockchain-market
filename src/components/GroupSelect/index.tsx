import { Flex, Select, Text } from "@chakra-ui/react"
import { GroupLevel } from "../../services/DataStore"
import { ContractTypeEnum } from "../../services/Datafeed"

export interface GroupSelectProps {
  onSelectGroup(groupLevel: GroupLevel): void
  groupLevel: GroupLevel
  contract?: ContractTypeEnum
}

export const GroupSelect = (props: GroupSelectProps) => {
  const {onSelectGroup, groupLevel, contract = ContractTypeEnum.BTUSD} = props;

  function _getOptions() {
    if (contract === ContractTypeEnum.ETHUSD) {
      return [
        {val: 0.05, title: 'Group 0.05'},
        {val: 0.1, title: 'Group 0.1'},
        {val: 0.25, title: 'Group 0.25'},
      ]
    } else {
      return [
        {val: 0.5, title: 'Group 0.50'},
        {val: 1, title: 'Group 1'},
        {val: 2.5, title: 'Group 2.50'},
      ]
    }
  }

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <Text as="p" color="inherit" fontSize={"1.2rem"}>
        Order book
      </Text>
      <Select
        w="8rem"
        value={groupLevel}
        onChange={(e) => onSelectGroup(+e.target.value as GroupLevel)}
      >
        {
          _getOptions().map(opt => (
            <option key={opt.title} value={opt.val}>{opt.title}</option>
          ))
        }
      </Select>
    </Flex>
  )
}