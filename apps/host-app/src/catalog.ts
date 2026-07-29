import React from 'react';

export const appCatalog = [
    {
        id: 'mini_app_a',
        name: 'Ứng dụng Đặt Xe',
        // Sử dụng import() chuẩn ES6 nhờ cấu hình remotes ở Webpack
        component: React.lazy(() => import('mini_app_a/App')),
    },
    {
        id: 'mini_app_b',
        name: 'Giao Đồ Ăn',
        component: React.lazy(() => import('mini_app_b/App')),
    }
];
