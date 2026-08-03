export interface ListPostEntity extends Array<PostItem> { }

export interface PostItem {
    userId: number;
    id: number;
    title: string;
    body: string;
}