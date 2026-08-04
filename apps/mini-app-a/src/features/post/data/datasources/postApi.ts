import { api } from "@api/fetch"
import { ENDPOINTS } from "@api/endpoints"
import { ListPostResponse, PostDetailRequest, PostDetailResponse } from "@post/data/dtos/PostDto"

export const postApi = {
    async getListPost(): Promise<ListPostResponse> {
        return api.get<ListPostResponse>(
            ENDPOINTS.POSTS.LIST
        )
    },

    async getPostDetail(request: PostDetailRequest): Promise<PostDetailResponse> {
        return api.get<PostDetailResponse>(
            ENDPOINTS.POSTS.DETAIL(request.id)
        )
    }
}