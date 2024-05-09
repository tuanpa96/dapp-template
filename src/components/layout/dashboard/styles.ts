export const mainLayoutStyle = {
  display: "flex",
  flexDirection: "column",
  position: "relative",
  minHeight: "calc(100vh - 75px)",
  backgroundColor: "#0D0F1A",
  "& > *:not(:first-child)": {
    zIndex: 1,
    position: "relative",
  },
};

export const layoutContainerStyle = {
  position: "relative",
  display: "flex",
  height: "100%",
  width: "100%",
};
