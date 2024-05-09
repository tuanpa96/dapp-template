import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import * as React from "react";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type AlertDialogProps = {
  open: boolean;
  buttonClose?: string;
  handleClose?: () => void;
  buttonConfirm?: string;
  handleConfirm?: () => void;
  title: string;
  content: string;
};

export default function AlertDialog({
  open,
  buttonClose,
  handleClose,
  buttonConfirm,
  handleConfirm,
  title,
  content,
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {buttonClose && <Button onClick={handleClose}>{buttonClose}</Button>}
        {buttonConfirm && (
          <Button onClick={handleConfirm}>{buttonConfirm}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
