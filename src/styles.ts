import { defineStyle } from "@chakra-ui/react";

export const appStyle = defineStyle({
  root: {
    w: '50rem',
    minH: '10rem',
    bgColor: 'gray.800',
    borderRadius: '.4rem',
    p: '1.4rem',
    maxH: '35rem',
    overflowY: 'auto',
    boxShadow: 'xl',

    '& p': {
      color: 'gray.100'
    }
  }
})