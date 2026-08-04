import { postRepository } from "@post/data/repositories/postRepository"
import { viewListPost, viewPostDetail } from "@post/domain/usecases"

export const postUsecases = {
    getListPost: viewListPost(postRepository),
    getPostDetail: viewPostDetail(postRepository)
}