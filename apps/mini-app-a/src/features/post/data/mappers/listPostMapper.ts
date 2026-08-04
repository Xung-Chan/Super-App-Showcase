import { ListPostEntity } from "@post/domain/entities/PostEntity"
import { ListPostResponse } from "@post/data/dtos/PostDto"

export const listPostMapper = {
    toDomain(response: ListPostResponse): ListPostEntity {
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