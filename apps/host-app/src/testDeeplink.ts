import { deeplinkSession } from "@superapp/share-deeplink";

export const testDeeplink = () => {
    deeplinkSession.set("123", "https://example.com")
    console.log('host-app deeplink: ',deeplinkSession.get("123"))
}