import { LinkingOptions, getStateFromPath as getStateFromPathDefault } from "@react-navigation/native";
import { RootStackParamList } from "../navigation-type";
import { REMOTE_APPS } from "../../constants/remoteAppList";

export const getStateFromPath: typeof getStateFromPathDefault = (path, options) => {
    // path nhận vào ví dụ: "remote-app/mini_a?path=/post/101"
    console.log("path", path)
    const [host, queryString] = path.split("?")
    const [scope, appKey] = host.split("/")
    if (scope === "remote-app" && appKey && REMOTE_APPS[appKey]) {
        const queryParams = new URLSearchParams(queryString || '');
        const subPath = queryParams.get('path') || undefined;
        const state: ReturnType<typeof getStateFromPathDefault> = {
            routes: [
                {
                    name: "RemoteApp",
                    params: {
                        appKey: appKey,
                        path: subPath
                    },

                }
            ]
        }
        return state
    }


    return getStateFromPathDefault(path, options)



}
