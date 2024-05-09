export const main = {
  p: { xs: 4, sm: 8 },
  color: "#fff",
  maxWidth: 1600,
};

export const titleLabelStyle = {
  fontSize: 24,
  fontWeight: 600,
  color: "#fff",
  wordWrap: "break-word",
  overflowWrap: "break-words",
};

export const titleContentStyle = {
  fontSize: { xs: 16, md: 20 },
  fontWeight: 600,
  color: "#fff",
};

export const contentTextStyle = {
  fontSize: { xs: 14, md: 16 },
  fontWeight: 700,
  color: "#D0D1D8",
};

export const contentSmallTextStyle = {
  fontSize: 13,
  fontWeight: 400,
  color: "#8C8FA3",
};

export const boxStyle = {
  backgroundColor: "#191B29",
  borderRadius: 6,
  p: { xs: 1, sm: 3 },
};

export const boxStatusStyle = {
  height: "100%",
  backgroundColor: "#191B29",
  borderRadius: 6,
  p: { xs: 1, sm: 3 },
};

export const btnStyle = {
  borderRadius: 2,
  height: 40,
  px: { sx: 2, sm: 4 },
  py: { sx: 1, sm: 2 },
  "&:disabled": {
    backgroundColor: "#B0B2BE",
  },
};

export const btnCancelStyle = {
  ...btnStyle,
  borderColor: "#C1C5E1",
};

export const textBtnStyle = {
  fontWeight: 700,
  fontSize: 16,
  color: "inherit",
};

export const deleteTextStyle = {
  ...textBtnStyle,
  color: "#C1C5E1",
};

export const btnAddContactStyle = {
  borderRadius: 2,
  px: { sx: 2, sm: 4 },
  py: { sx: 1, sm: 2 },
  "&:disabled": {
    backgroundColor: "#B0B2BE",
  },
  borderColor: "#C1C5E1",
  maxHeight: "50px",
};

export const boxFieldStyle = {
  border: "1px solid #B0B2BE",
  borderRadius: 2,
  p: 1.5,
};

export const tableHeaderTextStyle = {
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
};

export const tableBodyTextStyle = {
  color: "#B0B2BE",
  fontWeight: 400,
  fontSize: 13,
};

export const tableRowStyle = {
  "&:last-child td, &:last-child th": { border: 0 },
};

export const flexCenterStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
