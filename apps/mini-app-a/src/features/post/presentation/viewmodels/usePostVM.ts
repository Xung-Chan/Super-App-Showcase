import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/navigation-types";
import { useDispatch, useSelector } from "react-redux";
import { filterByUserId, getListPostRequested, selectPostError, selectPostList, selectPostLoading } from "../state/post.slice";
import { useCallback, useEffect } from "react";

export const usePostVM = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const listPost = useSelector(selectPostList);
    const loading = useSelector(selectPostLoading);
    const error = useSelector(selectPostError);

    const fetchPosts = useCallback(() => {
        dispatch(getListPostRequested());
    }, [dispatch]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onPressPost = useCallback((postId: number) => {
        navigation.navigate('PostDetailScreen', { id: postId });
    }, [navigation]);

    const searchByUserId = useCallback((userId: number) => {
        dispatch(filterByUserId({ userId }));
    }, [dispatch]);

    return {
        listPost,
        loading,
        error,
        onPressPost,
        searchByUserId,
        fetchPosts,
    };
};