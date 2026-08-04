import { PostEntity } from "@post/domain/entities/PostEntity"
import { PostDetailResponse } from "@post/data/dtos/PostDto"

export const postMapper = {
    toDomain(response: PostDetailResponse): PostEntity {
        return {
            ...response
        }
    }
}