import { ListPostEntity } from "@post/domain/entities/PostEntity";

export interface ViewListPostRepository {
    getListPost(): Promise<ListPostEntity>;
}


export const viewListPost = (repository: ViewListPostRepository) => async (): Promise<ListPostEntity> => {
    return repository.getListPost();
}