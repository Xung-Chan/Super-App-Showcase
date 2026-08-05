import { postApi } from "@post/data/datasources/postApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { createCommentFailure, createCommentRequested, createCommentSuccess, filterByUserId, getCommentsFailure, getCommentsRequested, getCommentsSuccess, getPostDetailFailure, getPostDetailRequested, getPostDetailSuccess, getListPostFailure, getListPostRequested, getListPostSuccess } from "./post.slice";

function* getListPostSaga(_action: ReturnType<typeof getListPostRequested>): Generator<any, void, any> {
    try {
        const response = yield call(postApi.getListPost)
        yield put(getListPostSuccess(response))
    } catch (error: any) {
        yield put(getListPostFailure(error ?? "Get Post Failed"))
    }
}
function* filterByUserIdSaga(action: ReturnType<typeof filterByUserId>): Generator<any, void, any> {
    try {
        const response = yield call(postApi.getListPost, { userId: action.payload.userId })
        yield put(getListPostSuccess(response))
    } catch (error: any) {
        yield put(getListPostFailure(error ?? "Get Post Failed"))
    }
}

function* getCommentsRequestedSaga(action: ReturnType<typeof getCommentsRequested>): Generator<any, void, any> {
    try {
        const response = yield call(postApi.getCommentByPost, { postId: action.payload.postId })
        yield put(getCommentsSuccess(response))
    } catch (error: any) {
        yield put(getCommentsFailure(error ?? "Get Comment Failed"))
    }
}

function* createCommentsRequestedSaga(action: ReturnType<typeof createCommentRequested>): Generator<any, void, any> {
    try {
        const response = yield call(postApi.createComment, action.payload)
        yield put(createCommentSuccess(response))
    } catch (error: any) {
        yield put(createCommentFailure(error ?? "Get Comment Failed"))
    }
}

function* getPostDetailRequestedSaga(action: ReturnType<typeof getPostDetailRequested>): Generator<any, void, any> {
    try {
        const response = yield call(postApi.getPostDetail, { id: action.payload.id })
        yield put(getPostDetailSuccess(response))
    } catch (error: any) {
        yield put(getPostDetailFailure(error ?? "Get Post Detail Failed"))
    }
}






export function* postSaga() {
    // takeLatest: Nếu người dùng bấm login liên tục, chỉ lấy lần bấm cuối cùng
    yield takeLatest(getListPostRequested.type, getListPostSaga);
    yield takeLatest(filterByUserId.type, filterByUserIdSaga);
    yield takeLatest(getCommentsRequested.type, getCommentsRequestedSaga)
    yield takeLatest(createCommentRequested.type, createCommentsRequestedSaga)
    yield takeLatest(getPostDetailRequested.type, getPostDetailRequestedSaga)
}