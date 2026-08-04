import { postReducer } from "@post/presentation/state/post.slice";
import { combineReducers } from "@reduxjs/toolkit";
import { RootState } from "..";


const rootReducers = (state: any, action: any) => {
  if (action.type === 'RESET_APP') {
    state = {} as RootState;
  }
  return allReducers(state, action);
};


const postReducers = {
  postReducer
};

const allReducers = combineReducers({
  ...postReducers
});

export type RootReducerType = ReturnType<typeof rootReducers>;

export default rootReducers;