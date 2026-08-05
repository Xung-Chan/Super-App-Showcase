
import { CommentEntity, ViewCommentInput } from "../entities/CommentEntity";

export interface ViewCommentRepository {
    getCommentByPost(
        input: ViewCommentInput
    ): Promise<CommentEntity[]>;
}


export const viewComment = (repository: ViewCommentRepository) => async (input: ViewCommentInput): Promise<CommentEntity[]> => {
    return repository.getCommentByPost(input);
}