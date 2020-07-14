import { TileId } from '@smiley-face-game/api/src/models/TileId';
import { ThunkAction } from "redux-thunk";
import { SlotId } from '../../../client/Slot';
import { BlockBarActions, SUPPLY_TEXTURE_LOADER, UPDATE_SELECTED_SLOT } from '../actionTypes/blockBar';
import { BlockBarState } from '../reducers/blockBar';

export function updatePrimary(blockId: SlotId): ThunkAction<void, BlockBarState, unknown, BlockBarActions> {
  return dispatch => {
    dispatch({
      type: UPDATE_SELECTED_SLOT,
      slot: blockId,
    });
  };
}

export function supplyTextureLoader(loader: (id: TileId) => Promise<HTMLImageElement>): ThunkAction<void, BlockBarState, unknown, BlockBarActions> {
  return dispatch => {
    dispatch({
      type: SUPPLY_TEXTURE_LOADER,
      loader
    });
  };
}