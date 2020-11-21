import React, { useState, useRef, useEffect } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { SpringSystem } from "rebound";

// turned into a FC from https://github.com/malte-wessel/react-custom-scrollbars/blob/master/examples/simple/components/SpringScrollbars/SpringScrollbars.js
const SpringScollbars = (props: any) => {
  const scrollbars = useRef<Scrollbars>();

  const [springSystem] = useState(new SpringSystem());
  const [spring] = useState(springSystem.createSpring());
  useEffect(() => {
    // this fixes an issue where once there are new messages, you have to manually
    // scroll down to see more
    scrollbars.current!.scrollToBottom();

    spring.addListener({
      onSpringUpdate: (spring) => {
        console.log("onSpringUpdate", spring);
        const val = spring.getCurrentValue();
        console.log("springUpdate", val);
        scrollbars.current!.scrollTop(val);
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

export default SpringScollbars;
