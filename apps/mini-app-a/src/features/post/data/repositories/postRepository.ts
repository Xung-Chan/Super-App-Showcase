import { ViewListPostRepository, ViewPostDetailRepository } from "@post/domain/usecases";
import { postApi } from "@post/data/datasources/postApi";
import { PostDetailRequest } from "@post/data/dtos/PostDto";
import { listPostMapper } from "@post/data/mappers/listPostMapper";
import { postMapper } from "@post/data/mappers/postMapper";

export const postRepository: ViewListPostRepository & ViewPostDetailRepository = {
    getListPost: async () => {
        const response = await postApi.getListPost();
        return listPostMapper.toDomain(response);
    },
    getPostDetail: async (input: PostDetailRequest) => {
        const response = await postApi.getPostDetail(input);
        return postMapper.toDomain(response);
    }
}
