import React from "react";

import FullscreenBackdropLoading from "./components/FullscreenBackdropLoading";

const Loading = ({ message = "Loading..." }) => {
  // show message?
  return <FullscreenBackdropLoading />;
};

export default Loading;
