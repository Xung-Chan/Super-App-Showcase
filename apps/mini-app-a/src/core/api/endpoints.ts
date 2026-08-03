/**
 * REST API Endpoints Configuration
 * Supporting full CRUD operations, Filtering, and Nested Resources
 */

export const ENDPOINTS = {
    // ==========================================
    // 1. POSTS RESOURCE (Full CRUD, Filtering, Nested)
    // ==========================================
    POSTS: {
        /** 2. Listing all resources: GET /posts */
        LIST: '/posts',

        /** 1. Getting a resource: GET /posts/:id */
        DETAIL: (id: string | number) => `/posts/${id}`,

        /** 3. Creating a resource: POST /posts */
        CREATE: '/posts',

        /** 4. Updating a resource: PUT /posts/:id */
        UPDATE: (id: string | number) => `/posts/${id}`,

        /** 5. Patching a resource: PATCH /posts/:id */
        PATCH: (id: string | number) => `/posts/${id}`,

        /** 6. Deleting a resource: DELETE /posts/:id */
        DELETE: (id: string | number) => `/posts/${id}`,

        /** 7. Filtering resources: GET /posts?userId=:userId */
        FILTER_BY_USER: (userId: string | number) => `/posts?userId=${userId}`,

        /** 8. Listing nested resources: GET /posts/:id/comments */
        COMMENTS: (postId: string | number) => `/posts/${postId}/comments`,
    },

    // ==========================================
    // 2. USERS RESOURCE (Nested & Filter Examples)
    // ==========================================
    USERS: {
        /** Listing all users: GET /users */
        LIST: '/users',

        /** Getting a user profile: GET /users/:id */
        DETAIL: (id: string | number) => `/users/${id}`,

        /** Creating a user: POST /users */
        CREATE: '/users',

        /** Updating a user: PUT /users/:id */
        UPDATE: (id: string | number) => `/users/${id}`,

        /** Patching a user: PATCH /users/:id */
        PATCH: (id: string | number) => `/users/${id}`,

        /** Deleting a user: DELETE /users/:id */
        DELETE: (id: string | number) => `/users/${id}`,

        /** 8. Listing nested resources: GET /users/:id/posts */
        POSTS: (userId: string | number) => `/users/${userId}/posts`,

        /** 8. Listing nested resources: GET /users/:id/todos */
        TODOS: (userId: string | number) => `/users/${userId}/todos`,
    },

    // ==========================================
    // 3. COMMENTS RESOURCE
    // ==========================================
    COMMENTS: {
        LIST: '/comments',
        DETAIL: (id: string | number) => `/comments/${id}`,
        CREATE: '/comments',
        UPDATE: (id: string | number) => `/comments/${id}`,
        PATCH: (id: string | number) => `/comments/${id}`,
        DELETE: (id: string | number) => `/comments/${id}`,

        /** 7. Filtering resources: GET /comments?postId=:postId */
        FILTER_BY_POST: (postId: string | number) => `/comments?postId=${postId}`,
    },

} as const;
