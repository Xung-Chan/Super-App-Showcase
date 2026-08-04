import { postSaga } from "@post/presentation/state/post.saga";
import { all, fork } from "redux-saga/effects";

function* rootSaga() {
    yield all([
        fork(postSaga)
    ]);
}

export default rootSaga;