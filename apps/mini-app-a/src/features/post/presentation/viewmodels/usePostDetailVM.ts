import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    createCommentRequested, 
    getCommentsRequested, 
    getPostDetailRequested, 
    selectComments, 
    selectPost, 
    selectPostError, 
    selectPostLoading 
} from "../state/post.slice";

export const usePostDetailVM = (postId: number) => {
    const dispatch = useDispatch();

    const loading = useSelector(selectPostLoading);
    const error = useSelector(selectPostError);
    const listComment = useSelector(selectComments);
    const post = useSelector(selectPost);

    const fetchCommentsAndDetail = useCallback(() => {
        if (!postId) return;
        dispatch(getPostDetailRequested({ id: postId }));
        dispatch(getCommentsRequested({ postId }));
    }, [dispatch, postId]);

    useEffect(() => {
        fetchCommentsAndDetail();
    }, [fetchCommentsAndDetail]);

    const handleCreateComment = useCallback((body: string) => {
        if (!postId) return;
        dispatch(createCommentRequested({
            postId,
            name: "User Me",
            email: "me@example.com",
            body,
        }));
    }, [dispatch, postId]);

    return {
        listComment,
        loading,
        error,
        post,
        handleCreateComment,
        fetchComments: fetchCommentsAndDetail
    };
};