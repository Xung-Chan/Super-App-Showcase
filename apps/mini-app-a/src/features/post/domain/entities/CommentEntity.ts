
export interface CommentEntity {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}

export interface ViewCommentInput {
    postId: number;
}

export interface CreateCommentInput {
    postId: number;
    name: string;
    email: string;
    body: string;
}
