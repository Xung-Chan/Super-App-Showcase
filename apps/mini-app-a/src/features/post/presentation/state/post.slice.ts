import { CommentEntity, CreateCommentInput } from "@post/domain/entities/CommentEntity";
import { PostEntity } from "@post/domain/entities/PostEntity";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootReducerType } from "src/core/store/reducers";

export interface PostState {
    loading: boolean;
    error: string | null;
    list: PostEntity[];
    comments: CommentEntity[],
    postDetail: PostEntity | null
}


const initialState: PostState = {
    loading: false,
    error: null,
    list: [],
    comments: [],
    postDetail: null,
}


const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        filterByUserId(state, _action: PayloadAction<{
            userId: number;
        }>) {
            state.loading = true;
            state.error = null
        },
        getListPostRequested(state) {
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
        },
        getCommentsRequested(state, _action: PayloadAction<{
            postId: number
        }>) {
            state.loading = true;
            state.error = null
        },
        getCommentsSuccess(state, action: PayloadAction<CommentEntity[]>) {
            state.loading = false;
            state.error = null;
            state.comments = action.payload;
        },
        getCommentsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        createCommentRequested(state, _action: PayloadAction<CreateCommentInput>) {
            state.loading = true;
            state.error = null
        },

        createCommentSuccess(state, action: PayloadAction<CommentEntity>) {
            state.loading = false;
            state.error = null;
            state.comments.unshift(action.payload);
        },

        createCommentFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        getPostDetailRequested(state, _action: PayloadAction<{ id: number }>) {
            state.loading = true;
            state.error = null;
        },
        getPostDetailSuccess(state, action: PayloadAction<PostEntity>) {
            state.loading = false;
            state.error = null;
            state.postDetail = action.payload;
        },
        getPostDetailFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const {
    getListPostRequested,
    getListPostSuccess,
    getListPostFailure,
    filterByUserId,
    getCommentsRequested,
    getCommentsFailure,
    getCommentsSuccess,
    createCommentRequested,
    createCommentFailure,
    createCommentSuccess,
    getPostDetailRequested,
    getPostDetailSuccess,
    getPostDetailFailure
} = postSlice.actions;

export default postSlice.reducer;


export const postReducer = postSlice.reducer;


export const selectPostReducer = (state: RootReducerType) => state.postReducer

export const selectPostLoading = (state: RootReducerType) => selectPostReducer(state).loading

export const selectPostError = (state: RootReducerType) => selectPostReducer(state).error

export const selectPostList = (state: RootReducerType) => selectPostReducer(state).list

export const selectComments = (state: RootReducerType) => selectPostReducer(state).comments

export const selectPost = (state: RootReducerType) => selectPostReducer(state).postDetail
