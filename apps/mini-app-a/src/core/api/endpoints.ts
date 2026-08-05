/**
 * REST API Endpoints Configuration
 * Supporting full CRUD operations, Filtering, and Nested Resources
 */

export const ENDPOINTS = {
    POSTS: {
        LIST: '/posts',
        DETAIL: (id: string | number) => `/posts/${id}`,
        CREATE: '/posts',
        UPDATE: (id: string | number) => `/posts/${id}`,
        PATCH: (id: string | number) => `/posts/${id}`,
        DELETE: (id: string | number) => `/posts/${id}`,
        COMMENTS: (postId: string | number) => `/posts/${postId}/comments`,
    },

} as const;
