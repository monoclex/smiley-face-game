import { AnyAction, applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { BlockBarActions } from './actionTypes/blockBar';
import { BlockBarState } from './reducers/blockBar';
import rootReducer from './reducers/index';

export interface StoreState {
  blockBar: BlockBarState;
}

//@ts-ignore
const store: Store<StoreState, AnyAction> = createStore(
  rootReducer,
  applyMiddleware<undefined, BlockBarActions>(thunk)
);

export default store;