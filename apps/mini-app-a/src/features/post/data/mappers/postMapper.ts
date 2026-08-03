import { ListPostEntity } from "../../domain/entities/PostEntity";
import { ListPostResponse } from "../dtos/listPostDto";

export const postMapper = {
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