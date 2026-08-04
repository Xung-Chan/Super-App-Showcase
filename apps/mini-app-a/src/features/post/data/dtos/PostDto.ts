
export interface PostDetailResponse {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export interface PostDetailRequest {
    id: number;
}