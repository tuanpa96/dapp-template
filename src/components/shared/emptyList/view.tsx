import ListEmpty from "@/assets/images/list_empty.png";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import * as styles from "./styles";

type EmptyListProps = {
  height?: number;
  content?: string;
};

const EmptyList = ({ height, content }: EmptyListProps) => {
  return (
    <Box sx={[styles.boxStyle, height ? { height } : {}]}>
      <Stack direction="column" spacing={1}>
        <Box sx={styles.centerStyle}>
          <Image src={ListEmpty} alt="background" width={144} height={144} />
        </Box>
        <Typography sx={styles.labelTextStyle}>
          {content || "You don't have any safe yet"}
        </Typography>
      </Stack>
    </Box>
  );
};

export default EmptyList;
