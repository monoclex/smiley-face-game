import { useState } from "react";
import { loadControls } from "@/controls";

export default function useControls() {
  const [controls] = useState(loadControls);
  return controls;
}
