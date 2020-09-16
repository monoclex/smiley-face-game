//@ts-check
import { useRef, useEffect } from "react";
import { useRecoilState } from "recoil";

// https://recoiljs.org/docs/guides/asynchronous-state-sync/
export default ({ subscribe, unsubscribe, update, state }) => {
  const [recoilState, setRecoilState] = useRecoilState(state);
  const currentState = useRef(recoilState);

  // Subscribe server changes to update atom state
  useEffect(() => {
    function handleChange(newState) {
      currentState.current = newState;
      setRecoilState(newState);
    }

    subscribe(handleChange);
    // Specify how to cleanup after this effect
    return unsubscribe;
  }, [currentState]);

  // Subscribe atom changes to update server state
  useEffect(() => {
    if (recoilState !== currentState.current) {
      currentState.current = recoilState;
      update(recoilState);
    }
  }, [recoilState, currentState.current]);

  // Send initial state
  useEffect(() => {
    update(recoilState);
  }, []);

  return null;
};