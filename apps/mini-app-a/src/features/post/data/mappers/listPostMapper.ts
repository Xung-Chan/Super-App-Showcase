import { PostDetailResponse } from "@post/data/dtos/PostDto"
import { PostEntity } from "@post/domain/entities/PostEntity"

export const listPostMapper = {
    toDomain(response: PostDetailResponse[]): PostEntity[] {
        return response.map(
            (item) => ({
                userId: item.userId,
                id: item.id,
                title: item.title,
                body: item.body,
            })
        )
    }
}