export interface ListPostEntity extends Array<PostEntity> { }

export interface PostEntity {
    id: number;
    title: string;
    body: string;
    userId: number;
}

export interface PostDetailInput {
    id: number;
}