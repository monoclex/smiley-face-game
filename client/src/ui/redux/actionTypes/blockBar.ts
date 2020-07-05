import { SlotId } from '../../../client/Slot';

export const UPDATE_SELECTED_SLOT = 'UPDATE_SELECTED_SLOT';
interface UpdateSelectedSlot {
  type: typeof UPDATE_SELECTED_SLOT;
  slot: SlotId;
}

export type BlockBarActions =
  | UpdateSelectedSlot
  ;