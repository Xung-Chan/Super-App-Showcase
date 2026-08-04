import { PostEntity } from "@post/domain/entities/PostEntity";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootReducerType } from "src/core/store/reducers";

export interface PostState {
    loading: boolean;
    error: string | null;
    list: PostEntity[];
}


const initialState: PostState = {
    loading: false,
    error: null,
    list: []
}


const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        getListPostRequested(state, _action: PayloadAction<void>) {
            state.loading = true;
            state.error = null
        },

        getListPostSuccess(state, action: PayloadAction<PostEntity[]>) {
            state.loading = false;
            state.error = null;
            state.list = action.payload;
        },

        getListPostFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { getListPostRequested, getListPostSuccess, getListPostFailure } = postSlice.actions;

export default postSlice.reducer;


export const postReducer = postSlice.reducer;


export const selectPostReducer = (state: RootReducerType) => state.postReducer

export const selectPostLoading = (state: RootReducerType) => selectPostReducer(state).loading

export const selectPostError = (state: RootReducerType) => selectPostReducer(state).error

export const selectPostList = (state: RootReducerType) => selectPostReducer(state).list