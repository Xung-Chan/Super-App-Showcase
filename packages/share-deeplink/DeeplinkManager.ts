// export class DeeplinkManager {
//     private static instance: DeeplinkManager | null = null;
//     private readonly sessionStore = new Map<string, string>();

//     public static getInstance(): DeeplinkManager {
//         if (!this.instance) {
//             this.instance = new DeeplinkManager();
//         }
//         return this.instance;
//     }
//     get(bundleId: string): string | undefined {
//         return this.sessionStore.get(bundleId);
//     }
//     set(bundleId:string, url:string){
//         this.sessionStore.set(bundleId, url);
//     }
//     delete(bundleId:string){
//         this.sessionStore.delete(bundleId);
//     }
// }
