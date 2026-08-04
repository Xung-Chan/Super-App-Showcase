export interface ListPostResponse extends Array<PostDetailResponse> { }

export interface PostDetailResponse {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export interface PostDetailRequest {
    id: number;
}