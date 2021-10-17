import React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Grid } from "@mui/material";
import { Close as CloseIcon } from "mdi-material-ui";

export const BasicDialog = ({ open, onClose, title, content, fullWidth = true, maxWidth = "md", actions = null }) => {
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth={fullWidth} maxWidth={maxWidth}>
      <DialogTitle>
        <Grid container justifyContent="space-between">
          <Grid item>{title}</Grid>
          <Grid item>
            {onClose && (
              <IconButton onClick={() => onClose()}>
                <CloseIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};
