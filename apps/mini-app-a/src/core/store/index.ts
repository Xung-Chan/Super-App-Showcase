import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware, { Middleware } from 'redux-saga';
import rootReducers from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: rootReducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

// Chạy saga middleware sau khi store đã được tạo
sagaMiddleware.run(rootSaga);
export type RootState = ReturnType<typeof store.getState>;