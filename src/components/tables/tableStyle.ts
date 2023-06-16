import { defineStyle } from "@chakra-ui/react";

export const tableStyle = (type: "sell" | "buy" = "sell", width: number) => {
  const cssObject: any = {
    pos: "absolute",
    top: 0,
  };

  if (type === "buy") {
    cssObject.right = 0;
    cssObject.bgColor = "#27533d30";
  } else {
    cssObject.left = 0;
    cssObject.bgColor = "#79232f30";
  }

  return defineStyle({
    row: {
      pos: "relative",

      _after: {
        content: '""',
        height: "100%",
        width: `${width}%`,
        ...cssObject,
      },
    },
  });
};
