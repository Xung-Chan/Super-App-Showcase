import { PostEntity } from "../entities/PostEntity";

export interface ViewListPostRepository {
    getListPost(): Promise<PostEntity[]>;
}


export const viewListPost = (repository: ViewListPostRepository) => async (): Promise<PostEntity[]> => {
    return repository.getListPost();
}