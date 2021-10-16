//@ts-check
import React, { useState, useRef, useEffect } from "react";
import { Scrollbars, ScrollbarProps } from "react-custom-scrollbars";
import { SpringSystem } from "rebound";

// turned into a FC from https://github.com/malte-wessel/react-custom-scrollbars/blob/master/examples/simple/components/SpringScrollbars/SpringScrollbars.js
const SpringScrollbars = (props: ScrollbarProps) => {
  const scrollbars = useRef<Scrollbars>(null);

  const [springSystem] = useState(new SpringSystem());
  const [spring] = useState(springSystem.createSpring());
  useEffect(() => {
    if (scrollbars.current === null) throw new Error("impossible");

    // this fixes an issue where once there are new messages, you have to manually
    // scroll down to see more
    scrollbars.current.scrollToBottom();

    spring.addListener({
      onSpringUpdate: (spring) => {
        if (scrollbars.current === null) throw new Error("impossible");

        const val = spring.getCurrentValue();
        scrollbars.current.scrollTop(val);
      },
    });

    return () => {
      springSystem.deregisterSpring(spring);
      springSystem.removeAllListeners();
      spring.destroy();
    };
  });

  return <Scrollbars {...props} ref={scrollbars} />;
};

export default SpringScrollbars;
