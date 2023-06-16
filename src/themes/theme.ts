import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        fontFamily: 'Inconsolata, monospace'
      }
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});
