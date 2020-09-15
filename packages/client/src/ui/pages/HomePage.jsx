//@ts-check
import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";

export default () => {
  return (
    <>
      <Button component={Link} to="/register">
        Register
      </Button>
      <Button component={Link} to="/login">
        Login
      </Button>
      <Button component={Link} to="/guest">
        Play as Guest
      </Button>
      <Button component={Link} to="/terms">
        Read Terms and Conditions
      </Button>
    </>
  );
};
