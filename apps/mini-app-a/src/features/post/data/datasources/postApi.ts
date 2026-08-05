import { ENDPOINTS } from "@api/endpoints"
import { api } from "@api/fetch"
import { PostDetailRequest, PostDetailResponse } from "@post/data/dtos/PostDto"
import { CommentResponse, CreateCommentRequest, ViewCommentRequest } from "../dtos/CommentDto"

export const postApi = {
    async getListPost(params?: { userId?: number }): Promise<PostDetailResponse[]> {
        return api.get<PostDetailResponse[]>(
            ENDPOINTS.POSTS.LIST,
            { params }
        )
    },

    async getPostDetail(request: PostDetailRequest): Promise<PostDetailResponse> {
        return api.get<PostDetailResponse>(
            ENDPOINTS.POSTS.DETAIL(request.id)
        )
    },

    async getCommentByPost(request: ViewCommentRequest): Promise<CommentResponse[]> {
        return api.get<CommentResponse[]>(
            ENDPOINTS.POSTS.COMMENTS(request.postId)
        )
    },

    async createComment(request: CreateCommentRequest): Promise<CommentResponse> {
        return api.post<CommentResponse>(
            ENDPOINTS.POSTS.COMMENTS(request.postId),
            request
        )
    }
}