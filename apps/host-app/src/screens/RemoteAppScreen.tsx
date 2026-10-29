import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { REMOTE_APPS } from "../constants/remoteAppList";
import { WrapperRSPack } from "../federation/WrapperRSPack";
import { RootStackParamList } from "../navigation/navigation-type";

type RemoteAppScreenRouteProp = RouteProp<RootStackParamList, 'RemoteApp'>;
type RemoteAppScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RemoteApp'>;

export const RemoteAppScreen = () => {
    const navigation = useNavigation<RemoteAppScreenNavigationProp>()
    const route = useRoute<RemoteAppScreenRouteProp>();
    const { appKey,path } = route.params;
    const remoteConfig = REMOTE_APPS[appKey];
    return (
        <WrapperRSPack
            remoteConfig={remoteConfig}
            initialRoute={path}
            onExitMiniApp={() => navigation.goBack()}
        />
    )
}
