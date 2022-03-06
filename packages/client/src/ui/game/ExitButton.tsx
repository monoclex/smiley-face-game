//@ts-check
import React, { useRef } from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material";
import LogoutIcon from "../icons/LogoutIcon.jsx"
import { useNavigate } from "react-router";

const Clickable = styled(IconButton)({
    pointerEvents: "all",
});  

const ExitButton = () => {

    const navigate = useNavigate();

    const ref = useRef<HTMLButtonElement>(null);

    return (
      <>
        <Clickable
          ref={ref}
          // TODO: what does it want here?
          // variant="contained"
          aria-haspopup="true"
          onClick={() => navigate('/lobby')}
          color="primary"
          aria-label="world settings"
          // TODO: what does it want here?
          // component="span"
          size="large"
        >
          <LogoutIcon />
        </Clickable>
      </>
    );
};

export default ExitButton;