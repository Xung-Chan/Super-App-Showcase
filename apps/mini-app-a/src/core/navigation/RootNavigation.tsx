import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./navigation-types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export function navigate(name: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function reset(name: any) {
  if (navigationRef.isReady()) {
    navigationRef?.resetRoot({
      index: 0,
      routes: [{ name: name }],
    });
  }
}
