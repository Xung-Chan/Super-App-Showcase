import { call, put, takeLatest } from "redux-saga/effects";
import { filterByUserId, getListPostFailure, getListPostRequested, getListPostSuccess } from "./post.slice";
import { postApi } from "@post/data/datasources/postApi";

function* getListPostSaga(action: ReturnType<typeof getListPostRequested>): Generator<any, void, any> {
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
export function* postSaga() {
    // takeLatest: Nếu người dùng bấm login liên tục, chỉ lấy lần bấm cuối cùng
    yield takeLatest(getListPostRequested.type, getListPostSaga);
    yield takeLatest(filterByUserId.type, filterByUserIdSaga);
}