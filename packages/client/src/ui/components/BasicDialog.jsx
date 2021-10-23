import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Close as CloseIcon } from "mdi-material-ui";

export const BasicDialog = ({ open, onClose, title, content, fullWidth = true, maxWidth = "md", actions = null }) => {
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth={fullWidth} maxWidth={maxWidth}>
      <DialogTitle sx={{ paddingBottom: 1 }}>
        {title}
        {onClose ? (
          <IconButton
            size="small"
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers={title && actions && true}>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};
