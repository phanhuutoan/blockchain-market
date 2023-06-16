import { defineStyle } from "@chakra-ui/react";

export const appStyle = defineStyle({
  root: {
    w: '50rem',
    bgColor: 'gray.800',
    borderRadius: '.4rem',
    p: '1.4rem',
    height: '35rem',
    overflowY: 'auto',
    boxShadow: 'xl',

    '& p': {
      color: 'gray.100'
    }
  }
})