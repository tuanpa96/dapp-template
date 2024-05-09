import { Stack, Typography } from "@mui/material";

const ItemStartWithIcon = ({
  icon,
  description,
  style,
}: {
  icon: string;
  description: string;
  style: any;
}) => {
  return (
    <Stack direction="row" spacing={1}>
      <Typography sx={style}>{`${icon}`}</Typography>
      <Typography sx={style}>{description}</Typography>
    </Stack>
  );
};

export default ItemStartWithIcon;
