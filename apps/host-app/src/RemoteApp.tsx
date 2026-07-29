// import React, { Suspense } from 'react';
// import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
// import { appCatalog } from './catalog';

// export function RemoteApp({ route }: any) {
//     // Nhận appId từ tham số điều hướng
//     const { appId } = route.params;

//     // Lấy Lazy Component ra từ danh mục đã định nghĩa
//     const appConfig = appCatalog.find((app) => app.id === appId);

//     if (!appConfig) {
//         return <Text style={styles.center}>Không tìm thấy ứng dụng {appId}</Text>;
//     }

//     const MiniAppComponent = appConfig.component;

//     return (
//         <Suspense
//             fallback={
//                 <View style={styles.center}>
//                     <ActivityIndicator size="large" color="#0000ff" />
//                     <Text style={{ marginTop: 10 }}>Đang tải {appConfig.name}...</Text>
//                 </View>
//             }
//         >
//             <MiniAppComponent />
//         </Suspense>
//     );
// }

// const styles = StyleSheet.create({
//     center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
