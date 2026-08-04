import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { selectPostError, selectPostList, selectPostLoading } from "../state/post.slice";

const usePostVM = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();

    const listPost = useSelector(selectPostList);
    const loading = useSelector(selectPostLoading)
    const error = useSelector(selectPostError)

}