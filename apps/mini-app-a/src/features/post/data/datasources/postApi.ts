import { ENDPOINTS } from "@api/endpoints"
import { api } from "@api/fetch"
import { PostDetailRequest, PostDetailResponse } from "@post/data/dtos/PostDto"

export const postApi = {
    async getListPost(): Promise<PostDetailResponse[]> {
        return api.get<PostDetailResponse[]>(
            ENDPOINTS.POSTS.LIST
        )
    },

    async getPostDetail(request: PostDetailRequest): Promise<PostDetailResponse> {
        return api.get<PostDetailResponse>(
            ENDPOINTS.POSTS.DETAIL(request.id)
        )
    }
}