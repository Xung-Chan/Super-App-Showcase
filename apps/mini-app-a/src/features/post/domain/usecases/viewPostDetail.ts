import { PostDetailInput, PostEntity } from "@post/domain/entities/PostEntity";

export interface ViewPostDetailRepository {
    getPostDetail(
        input: PostDetailInput
    ): Promise<PostEntity>;
}


export const viewPostDetail = (repository: ViewPostDetailRepository) => async (input: PostDetailInput): Promise<PostEntity> => {
    return repository.getPostDetail(input);
}