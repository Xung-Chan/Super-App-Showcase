import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "../navigation-type";
import { getStateFromPath } from "./deelinkConfig";
export const linkingConfig :LinkingOptions<RootStackParamList> = {
    prefixes:["superapp://"],
    config:{
        screens:{
            Home:'',
            RemoteApp:'remote-app/:appKey',
        }
    },
    getStateFromPath
}
