

export interface CommentResponse {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}
export interface ViewCommentRequest {
    postId: number;
}

export interface CreateCommentRequest {
    postId: number;
    name: string;
    email: string;
    body: string;
}

