import { CommentEntity, CreateCommentInput } from "../entities/CommentEntity";

export interface CreateCommentReposotiry {
    createComment(
        input: CreateCommentInput
    ): Promise<CommentEntity>;
}


export const createComment = (repository: CreateCommentReposotiry) => async (input: CreateCommentInput): Promise<CommentEntity> => {
    return repository.createComment(input)
}