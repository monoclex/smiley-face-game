//@ts-check
import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  DYNAMIC_WORLD_WIDTH_MIN,
  DYNAMIC_WORLD_WIDTH_MAX,
  DYNAMIC_WORLD_HEIGHT_MIN,
  DYNAMIC_WORLD_HEIGHT_MAX,
} from "@smiley-face-game/api/types";

const CreateRoomDialog = ({ open, onClose, onCreateRoom }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <form onSubmit={handleSubmit(onCreateRoom)}>
        <DialogTitle>Create New Room</DialogTitle>

        <DialogContent>
          <Box marginTop={1}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Name"
                  defaultValue="smiley face game"
                  autoFocus
                  error={errors && errors.name}
                  helperText={errors && errors.name && "A name is required..."}
                  {...register("name", { required: true })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="width"
                  type="number"
                  label="Width"
                  defaultValue={25}
                  error={errors && errors.width}
                  helperText={errors && errors.width && "A width is required..."}
                  {...register("width", { required: true })}
                  inputProps={{
                    min: DYNAMIC_WORLD_WIDTH_MIN,
                    max: DYNAMIC_WORLD_WIDTH_MAX,
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="height"
                  type="number"
                  label="Height"
                  defaultValue={25}
                  error={errors && errors.height}
                  helperText={errors && errors.height && "A height is required..."}
                  {...register("height", { required: true })}
                  inputProps={{
                    min: DYNAMIC_WORLD_HEIGHT_MIN,
                    max: DYNAMIC_WORLD_HEIGHT_MAX,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button color="inherit" type="submit">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRoomDialog;
