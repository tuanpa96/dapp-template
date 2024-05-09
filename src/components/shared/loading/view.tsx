import LoadingIndicator from "@/assets/icons/loading-indicator.svg";
import { keyframes, Box } from "@mui/material";
import Image from "next/image";

const spin = keyframes`
  100% {
    transform: rotate(1turn);
  }
`;

interface Props {
  size?: "xs" | "lg";
}

const Loading = ({ size = "xs" }: Props) => {
  return (
    <Box
      sx={{
        display: "inline-block",
        animation: `${spin} 1s linear infinite`,
      }}
      data-cy={"loading"}
    >
      <Box
        sx={{
          borderRadius: "50%",
          padding: size === "lg" ? "20px" : "8px",
          backgroundColor: "rgb(33, 217, 105, 0.2)",
          display: "flex",
        }}
      >
        <Image
          src={LoadingIndicator}
          alt="loading-icon"
          width={size === "lg" ? 48 : 20}
          height={size === "lg" ? 48 : 20}
        />
      </Box>
    </Box>
  );
};

export default Loading;
