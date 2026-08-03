export interface ListPostResponse extends Array<PostDto> { }

export interface PostDto {
    userId: number;
    id: number;
    title: string;
    body: string;
}