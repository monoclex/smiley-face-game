import { ThunkAction } from "redux-thunk";
import { SlotId } from '../../../client/Slot';
import { BlockBarActions, UPDATE_SELECTED_SLOT } from '../actionTypes/blockBar';
import { BlockBarState } from '../reducers/blockBar';

export function updatePrimary(blockId: SlotId): ThunkAction<void, BlockBarState, unknown, BlockBarActions> {
  return dispatch => {
    dispatch({
      type: UPDATE_SELECTED_SLOT,
      slot: blockId,
    });
  }
}
