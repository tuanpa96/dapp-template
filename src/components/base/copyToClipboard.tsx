import { Button, Tooltip } from "@mui/material";
import copy from "copy-to-clipboard";
import { useState } from "react";

export type CopyToClipboardProps = {
  text: string;
  children: any;
  sx?: any;
};

const CopyToClipboard = ({ text, children, sx }: CopyToClipboardProps) => {
  const [copiedText, setCopiedText] = useState<string>("");

  const handleClickCopy = () => {
    copy(text);
    setCopiedText(text);
  };

  return (
    <Tooltip title={copiedText === text ? "Copied" : "Copy To Clipboard"}>
      <Button
        sx={{ backgroundColor: "grayDark", ...sx }}
        onClick={handleClickCopy}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

export default CopyToClipboard;
