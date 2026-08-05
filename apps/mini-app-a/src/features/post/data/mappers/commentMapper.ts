import { CommentEntity } from "@post/domain/entities/CommentEntity"
import { CommentResponse } from "../dtos/CommentDto"

export const commentMapper = {
    toDomain(response: CommentResponse): CommentEntity {
        return {
            ...response
        }
    }
}