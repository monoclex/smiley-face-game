import { MutableVariable } from "@/util/MutableVariable";
import { ReactMutableVariable } from "@/util/ReactMutableVariable";

export const blockInspectorEnabled = new MutableVariable(false);
export const blockInspectorVisible = new ReactMutableVariable(false);
