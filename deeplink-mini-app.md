# Cẩm Nang Toàn Diện Về Deeplink Trong React Navigation

Tài liệu này phân tích bản chất kiến trúc, vòng đời xử lý, hệ sinh thái API và các kịch bản cấu hình thực tế của Deeplink (Custom URL Scheme và Universal/App Links) trong ứng dụng React Native sử dụng React Navigation.

---

## 1. Bản Chất Và Luồng Hoạt Động Cốt Lõi (Architecture & Lifecycle)

Deeplink trong React Native không đơn thuần là việc "bấm link nhảy vào app", mà là sự phối hợp giữa **Hệ điều hành di động (Native OS)**, **React Native Native Bridge / TurboModule (`LinkingManager`)**, và **Bộ máy điều hướng (React Navigation State Machine)**.

### 1.1. Luồng kích hoạt ở tầng Hệ Điều Hành (OS Layer)

Khi người dùng nhấn vào một URL (`myapp://product/42` hoặc `https://myapp.com/product/42`):

1. **Android (Intent System):**
   * OS duyệt qua toàn bộ ứng dụng để tìm các `<intent-filter>` đăng ký khớp với `scheme` và `host` trong `AndroidManifest.xml`.
   * Tạo một `Intent` với action `android.intent.action.VIEW` chứa Data URI.
   * Gửi Intent tới `MainActivity`. Thuộc tính `android:launchMode="singleTask"` quyết định Activity được khởi động mới hay tái sử dụng qua hàm `onNewIntent(Intent intent)`.
   * *(Xem ví dụ cấu hình code XML chi tiết tại [Mục 2.4. Cấu Hình Tầng Native OS](#24-cấu-hình-tầng-native-os-android-intent-system--ios))*

2. **iOS (URL Types & Associated Domains):**
   * Với **URL Scheme**: OS gọi method `application:openURL:options:` trong `AppDelegate`.
   * Với **Universal Link**: OS gọi method `application:continueUserActivity:restorationHandler:` với `NSUserActivityTypeBrowsingWeb`.
   * Cả hai đều chuyển URL vào mô-đun `RCTLinkingManager` của React Native.

---

### 1.2. Hai kịch bản vòng đời (Cold Start vs. Warm / Hot Start)

```
[Người dùng click link / quét QR / Push Notification]
                         │
                         ▼
             [Hệ điều hành (iOS / Android)]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [Cold Start]                      [Warm Start]
(App chưa chạy ngầm)             (App đang chạy background)
        │                                 │
        ▼                                 ▼
Khởi động Process & JS Runtime      Kích hoạt onNewIntent / openURL
        │                                 │
        ▼                                 ▼
Linking.getInitialURL()            Linking.addEventListener('url')
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        [React Navigation Container (linking prop)]
                         │
                         ├── 1. Lọc URL (filter)
                         ├── 2. Parse URL sang State (getStateFromPath)
                         ├── 3. Kiểm tra Navigation State hiện tại
                         ▼
             [Dispatch Action vào State]
                         │
                         ▼
        [Render màn hình tương ứng với URL]
```

#### A. Kịch bản Cold Start (App đang đóng hoàn toàn)
1. OS khởi tạo process của ứng dụng từ đầu.
2. Native code lưu giữ URL kích hoạt ban đầu.
3. JavaScript bundle được nạp và khởi chạy.
4. `NavigationContainer` gọi hàm `Linking.getInitialURL()` để lấy URL ban đầu.
5. React Navigation biến đổi URL này thành initial navigation state trước khi render cây component đầu tiên.

#### B. Kịch bản Warm / Hot Start (App đang chạy nền hoặc mở sẵn)
1. OS không tạo process mới mà đưa app từ background lên foreground.
2. OS bắn sự kiện native URL event vào React Native Bridge.
3. `RCTDeviceEventEmitter` phát ra sự kiện JavaScript `'url'`.
4. Listener của `NavigationContainer` (được đăng ký qua `Linking.addEventListener`) nhận URL mới.
5. React Navigation phân tích URL và thực hiện `dispatch(CommonActions.navigate(...))` để chuyển màn hình mà không làm mất trạng thái cũ của app.

---

### 1.3. Mô Hình Tư Duy (Mental Model): Deeplink Tương Đương REST API Router

Cách hiểu **"Điều hướng Deeplink hoạt động tương tự như một Backend API Endpoint Router"** là **hoàn toàn chính xác (99%)**. Cả hai đều áp dụng triết lý cốt lõi của Web Architecture: **Định danh tài nguyên qua URL (URI-based Resource Addressing)**.

#### A. Bảng Đối Chiếu 1-1: Backend API Router vs. React Navigation Deeplink

| Thành phần kiến trúc | Trong Backend REST API (Express / NestJS / Spring) | Trong React Navigation Deeplink |
| :--- | :--- | :--- |
| **Giao thức & Base URL** | `https://api.myapp.com` | `prefixes: ['myapp://', 'https://myapp.com']` |
| **Định tuyến (Route Path)** | `@Get('/products/:id')` hoặc `app.get('/products/:id')` | `ProductDetail: { path: 'products/:id' }` |
| **Handler / View Controller** | Hàm Controller xử lý: `(req, res) => renderView()` | Khai báo màn hình: `<Stack.Screen name="ProductDetail" component={ProductDetailScreen} />` |
| **Path Parameter (`:id`)** | Lấy qua `req.params.id` | Lấy qua `route.params.id` (hook `useRoute()`) |
| **Query Parameter (`?sort=asc`)**| Lấy qua `req.query.sort` | Lấy qua `route.params.sort` (tự động gom chung vào `route.params`) |
| **Router con lồng nhau** | `app.use('/settings', settingsRouter)` | Nested Navigators: `MainTabs` lồng `SettingsTab` $\rightarrow$ `SecuritySettings` |
| **Middleware / Auth Guard** | `app.use(authMiddleware)` hoặc `@UseGuards(AuthGuard)` | Can thiệp tại hàm `getStateFromPath` hoặc `DeeplinkInterceptor` |
| **Xử lý 404 Route** | `app.use('*', notFoundController)` | Khai báo wildcard: `NotFound: '*'` |

---

#### B. Luồng Xử Lý Chi Tiết (Pipeline 4 Bước):

Giả sử URL kích hoạt là: `myapp://products/101?source=facebook&campaign=summer`

```
[URL đầu vào]: myapp://products/101?source=facebook&campaign=summer
       │
       ▼  (Bước 1: Khớp tiền tố - Prefix Match)
[Tách Scheme]: 'myapp://' khớp với prefixes: ['myapp://'] ──> Phần còn lại: 'products/101?source=facebook&campaign=summer'
       │
       ▼  (Bước 2: Khớp Route Path trong linkingConfig)
[Khớp Pattern]: 'products/101' khớp với path: 'products/:id' ──> Nhận diện Screen tương ứng là 'ProductDetail'
       │
       ▼  (Bước 3: Bóc tách và đóng gói Params)
[Gộp Parameters]:
  - Path param:  id = '101'
  - Query params: source = 'facebook', campaign = 'summer'
  ===> route.params = { id: '101', source: 'facebook', campaign: 'summer' }
       │
       ▼  (Bước 4: Tra cứu Navigator & Render UI)
[Stack.Navigator]: Tìm <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  ===> Render ProductDetailScreen với props { route: { params: { ... } } }
```

---

#### C. Hai Điểm Khác Biệt Quan Trọng Cần Lưu Ý So Với API Endpoint:

Dù có cùng mô hình tư duy, lập trình viên cần nắm vững **2 điểm khác biệt sống còn** của ứng dụng di động:

1. **Xây dựng ngăn xếp điều hướng (Navigation Back Stack vs. Stateless API):**
   * **Backend API là Stateless**: Request gọi `/products/101` chỉ trả về dữ liệu của sản phẩm 101, không quan tâm người dùng vừa đi từ đâu tới.
   * **Mobile Deeplink có trạng thái (Stateful Stack)**: Khi mở thẳng `myapp://products/101` từ link bên ngoài, React Navigation không chỉ render mỗi màn hình chi tiết, mà nó **tự động dựng thêm màn hình gốc (`Home`) nằm phía dưới ngăn xếp**. Nhờ đó, người dùng bấm nút **Back** sẽ quay về trang Home của ứng dụng, thay vì bị văng/thoát app ra màn hình chính của điện thoại.

2. **Kiểu dữ liệu của Params (Mặc định luôn là `string`):**
   * Giống như `req.query` và `req.params` của HTTP request, tất cả giá trị bóc tách từ chuỗi URL đều là **chuỗi (`string`)**, kể cả khi bạn truyền `?page=2` hay `:id` là số `101`.
   * Muốn nhận dạng số hoặc boolean trong `route.params`, bạn cần:
     * Tự ép kiểu trong Component: `const page = Number(route.params.page)`.
     * Hoặc cấu hình hàm chuyển đổi trong `linkingConfig`:
       ```ts
       ProductDetail: {
         path: 'products/:id',
         parse: { id: Number }, // Chuyển "101" -> 101 kiểu number
       }
       ```

---

## 2. Hệ Thống API & Thuộc Tính Liên Quan

### 2.1. API Native `Linking` (`react-native`)

| API | Kiểu trả về | Mục đích sử dụng |
| :--- | :--- | :--- |
| `Linking.getInitialURL()` | `Promise<string \| null>` | Lấy URL đã kích hoạt ứng dụng khi app khởi động từ trạng thái tắt (Cold Start). |
| `Linking.addEventListener('url', callback)` | `EmitterSubscription` | Lắng nghe các URL mới được bắn vào khi app đang chạy ngầm hoặc trên màn hình. |
| `Linking.openURL(url)` | `Promise<any>` | Mở một URL ra ngoài ứng dụng (mở trình duyệt hoặc ứng dụng khác). |
| `Linking.canOpenURL(url)` | `Promise<boolean>` | Kiểm tra xem trên máy có app nào đăng ký xử lý scheme này hay không. |

---

### 2.2. Prop `linking` Trong `NavigationContainer` (`@react-navigation/native`)

Cấu hình `linking` nhận vào một object với các thuộc tính điều khiển cấp cao:

```typescript
import { LinkingOptions } from '@react-navigation/native';

const linking: LinkingOptions<RootStackParamList> = {
  // 1. Danh sách các URL scheme và domain app chấp nhận
  prefixes: ['myapp://', 'https://myapp.com', 'https://*.myapp.com'],

  // 2. Cây cấu hình ánh xạ URL path sang màn hình
  config: {
    initialRouteName: 'MainTabs',
    screens: {
      Home: 'home',
      Profile: 'user/:id',
    },
  },

  // 3. Tự định nghĩa cách lấy URL ban đầu (VD: lấy từ Push Notification SDK)
  async getInitialURL() {
    // Cho phép can thiệp trước khi React Navigation khởi tạo
    const url = await Linking.getInitialURL();
    return url;
  },

  // 4. Tự định nghĩa luồng lắng nghe URL
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => subscription.remove();
  },

  // 5. Tự định nghĩa bộ parser URL -> Navigation State
  getStateFromPath(path, options) {
    // Can thiệp bóc tách URL thủ công nếu cần
  },

  // 6. Tự định nghĩa chuyển Navigation State -> URL
  getPathFromState(state, options) {
    // Dùng cho web navigation hoặc analytics
  },

  // 7. Lọc bỏ các URL không muốn React Navigation tự động xử lý
  filter(url) {
    return !url.includes('auth-callback'); // Trả về false nếu muốn bỏ qua
  },
};
```

---

### 2.3. Tích Hợp Vào `AppNavigator` (Nơi Gắn Cấu Hình `linking` Vào `NavigationContainer`)

`NavigationContainer` là component gốc nắm giữ toàn bộ cây trạng thái (navigation state tree). Để hệ thống nhận diện và tự động phân giải URL từ hệ điều hành, ta truyền cấu hình `linking` trực tiếp vào prop `linking` của `NavigationContainer`.

```tsx
import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { linkingConfig } from './linkingConfig';
import { RootNavigator } from './RootNavigator';
import { RootStackParamList } from './navigation-type';

// 1. Tạo navigation reference toàn cục để điều hướng ngoài UI (VD: từ push notification, socket, native bridge)
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      // 2. fallback: Hiển thị màn hình chờ trong lúc React Navigation giải mã initial URL (tránh chớp nháy màn hình)
      fallback={
        <View style={styles.fallbackContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      }
      // 3. onReady: Kích hoạt khi container đã mount và URL ban đầu đã được parse xong
      onReady={() => {
        console.log('[Navigator] NavigationContainer đã sẵn sàng đón nhận Deeplink!');
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
```

#### Các thuộc tính cốt lõi khi gắn `linking` vào `NavigationContainer`:
1. **`linking={linkingConfig}`**: Kết nối bộ quy tắc bóc tách URL với máy trạng thái của Navigator.
2. **`fallback={<Component />}`**: Cực kỳ quan trọng khi hàm `getInitialURL()` là async (ví dụ preload bundle từ xa, fetch feature flags, hoặc kiểm tra token). Prop này ngăn việc render màn hình mặc định chớp qua trước khi nhảy vào màn hình deeplink đích.
3. **`onReady`**: Callback được gọi sau khi `NavigationContainer` hoàn tất parse URL ban đầu và sẵn sàng render. Giúp tránh race-condition khi gọi navigation từ bên ngoài.
4. **`ref={navigationRef}`**: Giúp các service độc lập (như Firebase Messaging, OneSignal, Zalo Bridge, Native EventEmitter) có thể trigger điều hướng an toàn (`navigationRef.navigate(...)`) mà không cần truyền `navigation` prop qua nhiều tầng component.

---

### 2.4. Cấu Hình Tầng Native OS: Android (Intent System) & iOS

Để URL từ bên ngoài (trình duyệt, Zalo, Messenger, SMS, Push Notification) có thể kích hoạt và chuyển vào React Native, bắt buộc phải đăng ký quyền đón nhận URL ở tầng hệ điều hành Native.

#### A. Cấu Hình Android (Intent System Trong `AndroidManifest.xml`)

Trong Android, khi người dùng click vào một đường link, hệ điều hành sẽ tạo một **Implicit Intent** với hành động `android.intent.action.VIEW`. 

Mở file `android/app/src/main/AndroidManifest.xml` và thêm các thẻ `<intent-filter>` vào bên trong `<activity android:name=".MainActivity">`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

  <application ...>
    <activity
      android:name=".MainActivity"
      android:label="@string/app_name"
      android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
      android:windowSoftInputMode="adjustResize"
      <!-- 1. BẮT BUỘC: singleTask giúp tái sử dụng Activity thay vì tạo mới đè lên -->
      android:launchMode="singleTask"
      <!-- 2. BẮT BUỘC từ Android 12: exported="true" cho phép app khác gọi vào -->
      android:exported="true">

      <!-- Intent mặc định khi bấm icon mở app từ màn hình chính -->
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>

      <!-- ======================================================== -->
      <!-- CẤU HÌNH 1: Custom URL Scheme (VD: myapp:// hoặc superapp://) -->
      <!-- ======================================================== -->
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <!-- Khai báo scheme mà app sẽ đón nhận -->
        <data android:scheme="myapp" />
        <!-- Nếu là Super App, có thể đăng ký thêm: <data android:scheme="superapp" /> -->
      </intent-filter>

      <!-- ======================================================== -->
      <!-- CẤU HÌNH 2: Android App Links (Domain Web: https://myapp.com) -->
      <!-- ======================================================== -->
      <!-- autoVerify="true" yêu cầu OS xác thực qua assetlinks.json để mở thẳng app không qua hộp thoại hỏi -->
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <!-- Khai báo giao thức HTTPS và domain xác thực -->
        <data
          android:scheme="https"
          android:host="myapp.com"
          android:pathPrefix="/products" />
      </intent-filter>

    </activity>
  </application>
</manifest>
```

##### Bảng giải thích chi tiết các thuộc tính Intent System trong Android:

| Thuộc tính / Thẻ XML | Vai trò & Lý do bắt buộc |
| :--- | :--- |
| **`android:launchMode="singleTask"`** | **Cực kỳ quan trọng**: Nếu để `standard` (mặc định), mỗi lần click vào một link từ Zalo/Chrome, Android sẽ khởi tạo một Activity mới đè lên cây điều hướng cũ, gây nhân đôi màn hình, rò rỉ bộ nhớ và làm mất trạng thái cũ. Với `singleTask`, Android sẽ tái sử dụng Activity cũ và bắn URL vào callback `onNewIntent(Intent intent)`. |
| **`android:exported="true"`** | Bắt buộc từ Android 12 (API 31+). Nếu đặt `false`, các ứng dụng bên ngoài (trình duyệt web, ứng dụng chat) sẽ không có quyền kích hoạt Activity của bạn, gây lỗi crash bảo mật `SecurityException`. |
| **`<action android:name="android.intent.action.VIEW" />`** | Báo hiệu cho hệ thống Android biết Activity này có khả năng "Xem / Hiển thị" dữ liệu của URI được gửi đến. |
| **`<category android:name="android.intent.category.DEFAULT" />`** | Cho phép Activity phản hồi các **Implicit Intent** (Intent ngầm định không chỉ đích danh package name). Thiếu thẻ này thì app sẽ không nhận được link. |
| **`<category android:name="android.intent.category.BROWSABLE" />`** | **Bắt buộc để mở từ trình duyệt web**: Đảm bảo Intent có thể được kích hoạt an toàn khi người dùng click vào liên kết trên trang web trong trình duyệt (Chrome, Samsung Internet,...). |
| **`<data android:scheme="..." />`** | Định nghĩa tiền tố scheme (ví dụ `myapp`, `superapp`, `fb`). Khớp với `prefixes: ['myapp://']` trong React Navigation. |
| **`android:autoVerify="true"`** | Dành riêng cho **Android App Links**. Hệ điều hành sẽ tự động tải file `https://myapp.com/.well-known/assetlinks.json` về kiểm tra chữ ký số SHA256. Nếu khớp, link web sẽ mở thẳng vào app mà **không hiện hộp thoại hỏi** chọn trình duyệt hay app. |

---

#### B. Cấu Hình Tương Ứng Trên iOS (`Info.plist` & Entitlements)

Để đồng bộ trên cả hai nền tảng, trên iOS bạn cấu hình như sau:

##### 1. Custom URL Scheme (`ios/PodProject/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>myapp</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
      <string>superapp</string>
    </array>
  </dict>
</array>
```

##### 2. Universal Links (`ios/PodProject.entitlements`):
```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:myapp.com</string>
  <string>applinks:*.myapp.com</string>
</array>
```

---

#### C. Sơ Đồ Chuyển Tiếp Từ Native Intent Vào React Navigation:

```
[Người dùng click link / Intent được phát]
                   │
                   ▼
       AndroidManifest.xml
   (Khớp action VIEW & data scheme)
                   │
                   ▼
         MainActivity.java / .kt
                   │
                   ├── Nếu Cold Start:  Lưu URI vào Intent ban đầu ──> Linking.getInitialURL()
                   └── Nếu Warm Start:  onNewIntent(intent) ─────────> Linking.addEventListener('url')
                                                                               │
                                                                               ▼
                                                                  [NavigationContainer linking={...}]
                                                                               │
                                                                               ▼
                                                                     [Mở đúng Stack Screen]
```

---

## 3. Các Kịch Bản Cấu Hình Thực Tế (Use Cases & Config Examples)

Mỗi kịch bản dưới đây đều được chuẩn hóa đầy đủ **4 thành phần kiến trúc**:
1. **Cấu hình Type & Linking (`linkingConfig`)**: Ánh xạ URL sang Route & Params.
2. **Navigator tổng (`AppNavigator.tsx`)**: Nơi khởi tạo `NavigationContainer`, gắn `linking={...}` cùng fallback & cây Stack/Tab Screens.
3. **Màn hình đích (Target Screen)**: Cách bóc tách và sử dụng params từ `route.params` (với TypeScript type-safety).
4. **Nơi gọi điều hướng (Source Screen / Callers)**: Code từ màn hình khác gọi `navigation.navigate` (nội bộ) hoặc mở qua Deeplink URL (`Linking.openURL`).

---

### Case 1: Điều Hướng Cơ Bản & Bóc Tách Params (Path & Query Params)

**Yêu cầu:** 
* URL dạng path param: `myapp://products/101` $\rightarrow$ Mở màn hình `ProductDetail` với `{ id: '101' }`.
* URL dạng query string: `myapp://search?keyword=sneaker&sort=asc` $\rightarrow$ Mở màn hình `Search` với `{ keyword: 'sneaker', sort: 'asc' }`.

#### 1. Định nghĩa Type & Cấu hình Linking
```typescript
import React from 'react';
import { LinkingOptions } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { id: string };
  Search: { keyword?: string; sort?: string };
};

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: '',
      // Cú pháp :paramName đại diện cho path parameter
      ProductDetail: {
        path: 'products/:id',
        parse: {
          id: (id: string) => `PROD-${id}`, // Transform dữ liệu nếu cần
        },
        stringify: {
          id: (id: string) => id.replace('PROD-', ''),
        },
      },
      // Query parameters (?keyword=...&sort=...) được tự động parse vào route.params
      Search: {
        path: 'search',
      },
    },
  },
};
```

#### 2. Code `AppNavigator.tsx` (Gắn `linkingConfig` vào `NavigationContainer`)
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import { linkingConfig } from './linkingConfig';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer
      linking={linkingConfig}
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      }
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang Chủ' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi Tiết Sản Phẩm' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm Kiếm' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### 3. Code Màn Hình Đích Sử Dụng Params (`ProductDetailScreen.tsx` & `SearchScreen.tsx`)
```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './types';

// --- Màn hình Chi tiết Sản phẩm: Nhận path param 'id' ---
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  // Bóc tách param 'id' đã được parse (VD: "PROD-101")
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<{ name: string; price: number } | null>(null);

  useEffect(() => {
    // Dùng param 'id' để gọi API tải dữ liệu chi tiết
    setLoading(true);
    setTimeout(() => {
      setProduct({ name: `Sản phẩm ${id}`, price: 299000 });
      setLoading(false);
    }, 600);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text>Đang tải chi tiết cho mã: {id}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi Tiết Sản Phẩm</Text>
      <Text style={styles.badge}>Mã SP: {id}</Text>
      <Text style={styles.desc}>Tên: {product?.name}</Text>
      <Text style={styles.desc}>Giá: {product?.price.toLocaleString('vi-VN')} VNĐ</Text>
    </View>
  );
};

// --- Màn hình Tìm kiếm: Nhận query params 'keyword' và 'sort' ---
type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>;

export const SearchScreen = () => {
  const route = useRoute<SearchRouteProp>();
  // Bóc tách query params (?keyword=sneaker&sort=asc)
  const { keyword = '', sort = 'default' } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết Quả Tìm Kiếm</Text>
      <Text>Từ khóa: <Text style={styles.bold}>{keyword || '(Trống)'}</Text></Text>
      <Text>Thứ tự sắp xếp: <Text style={styles.bold}>{sort}</Text></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  badge: { fontSize: 14, color: '#0066cc', fontWeight: '600', marginBottom: 8 },
  desc: { fontSize: 16, marginVertical: 4 },
  bold: { fontWeight: 'bold' },
});
```

#### 4. Code Màn Hình Khác Gọi Điều Hướng Tới (`HomeScreen.tsx`)
```tsx
import React from 'react';
import { View, Text, Button, Linking, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';

type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavProp>();

  // Cách 1: Điều hướng nội bộ bằng Native Navigation (Type-safe)
  const openProductViaNav = (productId: string) => {
    navigation.navigate('ProductDetail', { id: productId });
  };

  const openSearchViaNav = () => {
    navigation.navigate('Search', { keyword: 'sneaker', sort: 'asc' });
  };

  // Cách 2: Kích hoạt thông qua URL Deeplink (Giả lập mở từ Web/Noti/Ngoại vi)
  const openProductViaDeeplink = async (productId: string) => {
    const url = `myapp://products/${productId}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Lỗi', `Không thể mở URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trang Chủ (Host App)</Text>

      {/* Điều hướng nội bộ */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>1. Gọi nội bộ (navigation.navigate):</Text>
        <Button title="Mở Sản phẩm 101" onPress={() => openProductViaNav('101')} />
        <Button title="Mở Tìm kiếm (sneaker - asc)" onPress={openSearchViaNav} />
      </View>

      {/* Điều hướng qua URL Deeplink */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>2. Gọi qua URL Deeplink (Linking.openURL):</Text>
        <Button
          color="#2e7d32"
          title="Mở myapp://products/202 qua Linking"
          onPress={() => openProductViaDeeplink('202')}
        />
        <Button
          color="#2e7d32"
          title="Mở myapp://search?keyword=giay&sort=desc"
          onPress={() => Linking.openURL('myapp://search?keyword=giay&sort=desc')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', gap: 16 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  group: { padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, gap: 8 },
  groupTitle: { fontWeight: '600', marginBottom: 4 },
});
```

---

### Case 2: Nested Navigators (Cấu Trúc Tab lồng Stack Phức Tạp)

**Vấn đề:** Khi mở một màn hình con nằm sâu trong một Tab (ví dụ: Tab `Settings` $\rightarrow$ Màn hình `SecuritySettings`), nếu không cấu hình lồng nhau đúng cách, ứng dụng sẽ không xác định được tab cha và dễ làm vỡ cấu trúc hiển thị của Bottom Tab Bar.

**Cấu trúc Navigation:**
* `RootStack` (Stack ngoài cùng)
  * `MainTabs` (Bottom Tab Navigator)
    * `HomeTab`
    * `SettingsTab` (Stack lồng trong Tab)
      * `SettingsMenu`
      * `SecuritySettings`

#### 1. Định nghĩa Cây Navigation & Linking
```typescript
import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';

export type SettingsStackParamList = {
  SettingsMenu: undefined;
  SecuritySettings: { highlightSection?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  LoginModal: undefined;
};

export const nestedLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: 'home',
          SettingsTab: {
            screens: {
              SettingsMenu: 'settings',
              // URL: myapp://settings/security?highlightSection=2fa
              SecuritySettings: 'settings/security',
            },
          },
        },
      },
      LoginModal: 'login',
    },
  },
};
```

#### 2. Code `AppNavigator.tsx` (Gắn `nestedLinking` vào `NavigationContainer` lồng nhau)
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, SettingsStackParamList } from './types';
import { nestedLinking } from './nestedLinking';
import { FeedScreen } from '../screens/FeedScreen';
import { SettingsMenuScreen } from '../screens/SettingsMenuScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { LoginModalScreen } from '../screens/LoginModalScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen name="SettingsMenu" component={SettingsMenuScreen} options={{ title: 'Cài Đặt' }} />
    <SettingsStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ title: 'Bảo Mật' }} />
  </SettingsStack.Navigator>
);

const MainTabsNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="HomeTab" component={FeedScreen} options={{ title: 'Bản Tin' }} />
    <Tab.Screen name="SettingsTab" component={SettingsNavigator} options={{ headerShown: false, title: 'Cài Đặt' }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer linking={nestedLinking}>
      <RootStack.Navigator>
        <RootStack.Screen name="MainTabs" component={MainTabsNavigator} options={{ headerShown: false }} />
        <RootStack.Screen name="LoginModal" component={LoginModalScreen} options={{ presentation: 'modal' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
```

#### 3. Code Màn Hình Đích Bóc Tách Param Lồng Nhau (`SecuritySettingsScreen.tsx`)
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SettingsStackParamList } from './types';

type SecurityRouteProp = RouteProp<SettingsStackParamList, 'SecuritySettings'>;

export const SecuritySettingsScreen = () => {
  const route = useRoute<SecurityRouteProp>();
  const { highlightSection } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài Đặt Bảo Mật</Text>
      
      <View style={[styles.card, highlightSection === '2fa' && styles.highlighted]}>
        <Text style={styles.cardTitle}>Xác thực 2 yếu tố (2FA)</Text>
        <Text>Bảo vệ tài khoản với OTP mã hóa.</Text>
        {highlightSection === '2fa' && <Text style={styles.tag}>[Được chọn từ liên kết]</Text>}
      </View>

      <View style={[styles.card, highlightSection === 'password' && styles.highlighted]}>
        <Text style={styles.cardTitle}>Đổi mật khẩu</Text>
        <Text>Đổi mật khẩu định kỳ 6 tháng/lần.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, marginVertical: 8, elevation: 1 },
  highlighted: { borderColor: '#0066cc', borderWidth: 2, backgroundColor: '#e6f0fa' },
  cardTitle: { fontWeight: '600', fontSize: 16 },
  tag: { color: '#0066cc', fontWeight: 'bold', marginTop: 4 },
});
```

#### 4. Code Từ Màn Hình Khác Gọi Điều Hướng Lồng Nhau (`FeedScreen.tsx` hoặc Banner)
```tsx
import React from 'react';
import { View, Text, Button, Linking, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const FeedScreen = () => {
  const navigation = useNavigation<any>();

  // Cách 1: Điều hướng nội bộ xuyên qua các tầng Navigator
  const navigateToSecurity = () => {
    navigation.navigate('MainTabs', {
      screen: 'SettingsTab',
      params: {
        screen: 'SecuritySettings',
        params: { highlightSection: '2fa' },
      },
    });
  };

  // Cách 2: Mở qua Deeplink URL ngắn gọn
  const openViaDeeplink = () => {
    Linking.openURL('myapp://settings/security?highlightSection=2fa');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Bản Tin (HomeTab)</Text>
      <Text style={styles.desc}>Cảnh báo bảo mật: Bạn chưa kích hoạt 2FA!</Text>

      <Button title="Bật 2FA ngay (Navigate lồng nhau)" onPress={navigateToSecurity} />
      <View style={{ height: 10 }} />
      <Button color="#e65100" title="Bật 2FA qua URL (myapp://settings/security)" onPress={openViaDeeplink} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  desc: { color: '#d32f2f', marginBottom: 16 },
});
```

---

### Case 3: Deeplink Có Kiểm Tra Xác Thực & Phân Quyền (Auth Guard Middleware)

**Vấn đề:** Người dùng nhấp vào link thanh toán đơn hàng `myapp://checkout/order_888`. Nếu người dùng **chưa đăng nhập**, ứng dụng không được phép mở thẳng màn `Checkout`, mà phải mở màn `Login`, đồng thời lưu lại link đích để sau khi đăng nhập thành công thì chuyển tiếp tới màn `Checkout`.

#### 1. Định nghĩa Type & Bộ Chặn `getStateFromPath`
```typescript
import { getStateFromPath, LinkingOptions } from '@react-navigation/native';
import { authManager } from './services/AuthManager';

export type RootStackParamList = {
  Home: undefined;
  Login: { redirectTo?: string; redirectParams?: Record<string, any> };
  Checkout: { orderId: string };
};

export const authGuardedLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Checkout: 'checkout/:orderId',
    },
  },
  getStateFromPath(path, options) {
    const state = getStateFromPath(path, options);
    if (!state) return undefined;

    // Lấy route đích cuối cùng trong chuỗi điều hướng
    const targetRoute = state.routes[state.routes.length - 1];
    const isProtectedRoute = targetRoute.name === 'Checkout';
    const isAuthenticated = authManager.isLoggedIn();

    // Nếu chưa xác thực -> Chuyển về màn hình Login kèm thông tin callback
    if (isProtectedRoute && !isAuthenticated) {
      return {
        routes: [
          {
            name: 'Login',
            params: {
              redirectTo: targetRoute.name,
              redirectParams: targetRoute.params,
            },
          },
        ],
      };
    }

    return state;
  },
};
```

#### 2. Code `AppNavigator.tsx` (Gắn `authGuardedLinking` vào `NavigationContainer`)
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import { authGuardedLinking } from './authGuardedLinking';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer
      linking={authGuardedLinking}
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      }
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng Nhập' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh Toán' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### 3. Code Màn Hình Login Nhận Params & Chuyển Tiếp (`LoginScreen.tsx`)
```tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { authManager } from './services/AuthManager';

type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const route = useRoute<LoginRouteProp>();
  const navigation = useNavigation<LoginNavProp>();

  // Bóc tách thông tin chuyển tiếp được lưu từ Deeplink Guard
  const { redirectTo, redirectParams } = route.params || {};

  const handleLoginSuccess = () => {
    // 1. Đánh dấu đã đăng nhập thành công
    authManager.setLoggedIn(true);

    // 2. Kiểm tra nếu có màn hình đích được lưu từ Deeplink
    if (redirectTo) {
      // Dùng navigation.replace để không thể bấm back lại màn Login
      navigation.replace(redirectTo as any, redirectParams);
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập Tài Khoản</Text>
      {redirectTo && (
        <Text style={styles.notice}>
          Đăng nhập để tiếp tục đến đơn hàng: {redirectParams?.orderId}
        </Text>
      )}
      <Button title="Xác nhận Đăng Nhập" onPress={handleLoginSuccess} />
    </View>
  );
};

// --- Màn hình Thanh toán đơn hàng ---
type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

export const CheckoutScreen = () => {
  const route = useRoute<CheckoutRouteProp>();
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh Toán Đơn Hàng</Text>
      <Text style={styles.highlight}>Mã đơn hàng: {orderId}</Text>
      <Button title="Thanh toán ngay bằng Ví" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  notice: { color: '#e65100', marginBottom: 16, textAlign: 'center' },
  highlight: { fontSize: 18, color: '#0066cc', marginBottom: 20, fontWeight: '600' },
});
```

#### 4. Code Nơi Gọi / Kích Hoạt Đơn Hàng (`CartScreen.tsx` & Push Notification)
```tsx
import React from 'react';
import { View, Button, Linking, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

export const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1. Gọi trực tiếp bằng navigation
  const onCheckoutClick = (orderId: string) => {
    navigation.navigate('Checkout', { orderId });
  };

  // 2. Kích hoạt bằng URL (Mô phỏng trường hợp click Push Notification)
  const onSimulatePushNotification = (orderId: string) => {
    Linking.openURL(`myapp://checkout/${orderId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Giỏ hàng của bạn (Đơn #ORD-999)</Text>
      <Button title="Thanh Toán (In-App)" onPress={() => onCheckoutClick('ORD-999')} />
      <View style={{ height: 10 }} />
      <Button
        color="#c2185b"
        title="Giả lập Push Noti (myapp://checkout/ORD-999)"
        onPress={() => onSimulatePushNotification('ORD-999')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  text: { fontSize: 18, marginBottom: 16, textAlign: 'center' },
});
```

---

### Case 4: Mở Remote Mini App / Dynamic Bundle (Kiến Trúc Super App)

**Yêu cầu:** URL có dạng `superapp://miniapp?appKey=mini_food&path=/restaurant/10`. Trước khi màn hình mở ra, cần kích hoạt quá trình tải bundle của Mini App từ CDN, kiểm tra chữ ký mã nguồn (signature verification), và hiển thị màn hình Loading.

#### 1. Cấu hình Linking Hỗ Trợ Dynamic Preload
```typescript
import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';
import { BundleManager } from './services/BundleManager';

export type RootStackParamList = {
  Home: undefined;
  RemoteApp: {
    appKey: string;
    path?: string;
  };
};

export const superAppLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['superapp://'],
  
  // 1. Xử lý Cold Start: Tải bundle ngầm trước khi mount navigation
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url && url.startsWith('superapp://miniapp')) {
      const parsedUrl = new URL(url.replace('superapp://', 'https://fake/'));
      const appKey = parsedUrl.searchParams.get('appKey');
      if (appKey) {
        await BundleManager.preloadBundle(appKey);
      }
    }
    return url;
  },

  // 2. Xử lý Runtime Event (Warm Start)
  subscribe(listener) {
    const onReceiveURL = async ({ url }: { url: string }) => {
      if (url.startsWith('superapp://miniapp')) {
        const parsedUrl = new URL(url.replace('superapp://', 'https://fake/'));
        const appKey = parsedUrl.searchParams.get('appKey');
        if (appKey) {
          await BundleManager.preloadBundle(appKey);
        }
      }
      listener(url);
    };

    const sub = Linking.addEventListener('url', onReceiveURL);
    return () => sub.remove();
  },

  config: {
    screens: {
      Home: '',
      RemoteApp: {
        path: 'miniapp',
        parse: {
          appKey: (appKey: string) => appKey,
          path: (path: string) => decodeURIComponent(path),
        },
      },
    },
  },
};
```

#### 2. Code `AppNavigator.tsx` (Gắn `superAppLinking` vào `NavigationContainer` của Host App)
> **Ghi chú kiến trúc:** Trong mô hình Module Federation / Super App, Host App chỉ cần khai báo **duy nhất** một màn hình Gateway (`RemoteApp`) để đón nhận tất cả các Mini App từ xa, không cần tạo thủ công nhiều Screen (`MiniAppScreenA`, `MiniAppScreenB`).

```tsx
import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './navigation-type';
import { superAppLinking } from './superAppLinking';
import { HomeScreen } from '../screens/MainScreen';
import { RemoteAppScreen } from '../screens/RemoteAppScreen';

// Navigation reference toàn cục cho Host App
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={superAppLinking}
      // fallback quan trọng: Giữ màn hình loading trong khi getInitialURL đang preload bundle từ CDN
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      }
      onReady={() => {
        console.log('[HostApp] AppNavigator đã sẵn sàng đón nhận Deeplink!');
      }}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Host App' }}
        />
        {/* Gateway duy nhất cho tất cả các remote miniapp */}
        <Stack.Screen
          name="RemoteApp"
          component={RemoteAppScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### 3. Code Màn Hình Gateway Container (`RemoteAppScreen.tsx`)
```tsx
import React, { Suspense } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { REMOTE_APPS } from '../constants/remoteAppList';
import { WrapperRSPack } from '../federation/WrapperRSPack';

type RemoteAppRouteProp = RouteProp<RootStackParamList, 'RemoteApp'>;

export const RemoteAppScreen = () => {
  const route = useRoute<RemoteAppRouteProp>();
  // 1. Trích xuất appKey và sub-path bên trong miniapp
  const { appKey, path } = route.params;
  const config = REMOTE_APPS[appKey];

  if (!config) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Lỗi Không Tìm Thấy Ứng Dụng</Text>
        <Text>Không tồn tại Mini App có mã: {appKey}</Text>
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang nạp Mini App: {config.displayName}...</Text>
        </View>
      }
    >
      {/* 2. Truyền config và sub-path vào Wrapper nạp Module Federation */}
      <WrapperRSPack
        remoteConfig={config}
        moduleExpose="App"
        initialRoute={path}
      />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 },
});
```

#### 4. Code Từ Nơi Khác Gọi Mở Mini App

##### A. Gọi từ Host App (`MainScreen.tsx`)
```tsx
import React from 'react';
import { View, Button, StyleSheet, Text, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

export const MainScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Cách 1: Gọi nội bộ Host App bằng navigation
  const openFoodApp = () => {
    navigation.navigate('RemoteApp', {
      appKey: 'mini_food',
      path: '/restaurant/10',
    });
  };

  // Cách 2: Gọi thông qua Deeplink URL (Khuyến nghị cho Super App Gateway)
  const openFoodAppViaDeeplink = () => {
    Linking.openURL('superapp://miniapp?appKey=mini_food&path=%2Frestaurant%2F10');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super App Dashboard</Text>
      <Button title="Mở Mini App Đồ Ăn (navigation.navigate)" onPress={openFoodApp} />
      <View style={{ height: 10 }} />
      <Button
        color="#2e7d32"
        title="Mở Mini App Đồ Ăn (Qua Deeplink URL)"
        onPress={openFoodAppViaDeeplink}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
});
```

##### B. Gọi chéo giữa các Mini App (Cross Mini-App: Từ `MiniAppRide` mở `MiniAppFood`)
Do `MiniAppRide` đóng gói độc lập và không sở hữu instance `navigation` của Host App, Mini App sẽ gửi yêu cầu mở thông qua URL scheme hoặc Bridge:
```tsx
import React from 'react';
import { View, Button, Linking } from 'react-native';

export const RideCompletedBanner = () => {
  // Mini App gọi Deeplink để yêu cầu Host App mở Mini App khác
  const handleOpenFoodMiniApp = async () => {
    const targetUrl = 'superapp://miniapp?appKey=mini_food&path=/deals';
    const canOpen = await Linking.canOpenURL(targetUrl);
    if (canOpen) {
      await Linking.openURL(targetUrl);
    }
  };

  return (
    <View>
      <Button title="Đặt món ăn khao tài xế (Mở MiniApp Food)" onPress={handleOpenFoodMiniApp} />
    </View>
  );
};
```

---

### Case 5: Xử Lý 404 & Ký Tự Đại Diện (Wildcard / Catch-All)

**Yêu cầu:** Khi người dùng mở một đường link không tồn tại hoặc phiên bản ứng dụng cũ không còn hỗ trợ URL đó, app không được crash hoặc rơi vào trạng thái đơ màn hình, mà phải điều hướng về một màn hình `NotFound` hiển thị rõ path lỗi và có nút quay về Trang chủ an toàn.

#### 1. Cấu hình Wildcard trong Linking
```typescript
import { LinkingOptions } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  NotFound: { unmatchedPath?: string };
};

export const wildcardLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      // '*' bắt toàn bộ các path không trùng khớp với các cấu hình trên
      NotFound: '*',
    },
  },
};
```

#### 2. Code `AppNavigator.tsx` (Gắn `wildcardLinking` vào `NavigationContainer`)
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { wildcardLinking } from './wildcardLinking';
import { HomeScreen } from '../screens/HomeScreen';
import { NotFoundScreen } from '../screens/NotFoundScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer linking={wildcardLinking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* Màn hình bắt lỗi 404 cho mọi link sai */}
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{ title: 'Không Tìm Thấy Trang', headerLeft: () => null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### 3. Code Màn Hình `NotFoundScreen.tsx` Sử Dụng Params
```tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

type NotFoundRouteProp = RouteProp<RootStackParamList, 'NotFound'>;

export const NotFoundScreen = () => {
  const route = useRoute<NotFoundRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // React Navigation gán phần path chưa match vào route.params
  const unmatchedPath = (route.params as any)?.['*'] || 'Không xác định';

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Liên kết không hợp lệ</Text>
      <Text style={styles.desc}>Đường dẫn sau không tồn tại hoặc đã hết hạn:</Text>
      <Text style={styles.pathBadge}>{unmatchedPath}</Text>

      <Button
        title="Về Trang Chủ"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  code: { fontSize: 64, fontWeight: '900', color: '#ff5252' },
  title: { fontSize: 20, fontWeight: '700', marginVertical: 8 },
  desc: { color: '#666', textAlign: 'center', marginBottom: 8 },
  pathBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontFamily: 'monospace',
    marginBottom: 24,
  },
});
```

#### 4. Code Mô Phỏng Gọi Test Link Hỏng
```tsx
import React from 'react';
import { View, Button, Linking } from 'react-native';

export const TestBrokenLinkButton = () => {
  const testInvalidLink = () => {
    // Mở một path không tồn tại trong cấu hình
    Linking.openURL('myapp://some/non-existent/route/123');
  };

  return (
    <View>
      <Button color="#d32f2f" title="Test Thử Link Hỏng 404" onPress={testInvalidLink} />
    </View>
  );
};
```

---

## 4. Bảng So Sánh Các Phương Thức Triển Khai URL

| Tiêu chí | Custom URL Scheme (`myapp://`) | Universal Links (iOS) / App Links (Android) |
| :--- | :--- | :--- |
| **Giao thức** | Tùy biến (`myapp://path`) | Chuẩn Web (`https://domain.com/path`) |
| **Bảo mật** | Thấp (app khác có thể đăng ký trùng scheme để đánh cắp dữ liệu) | Rất cao (yêu cầu sở hữu domain và cấu hình file xác thực AASA/assetlinks) |
| **Trải nghiệm khi chưa cài app** | Lỗi hiển thị trình duyệt ("URL can't be opened") | Tự động mở trang web tương ứng trên trình duyệt bình thường |
| **Độ phức tạp cấu hình** | Rất đơn giản (chỉ thêm trong Manifest/Xcode) | Trung bình - Cao (cần server HTTPS, cấu hình SSL và DNS) |
| **Khuyến nghị sử dụng** | Test nội bộ, tích hợp cổng thanh toán Sandbox, Mini App routing nội bộ | Môi trường Production cho người dùng cuối |

---

## 5. Checklist Kiểm Thử & Gỡ Lỗi (Debugging Guide)

### 1. Tránh tạo nhiều Activity trên Android
Luôn đảm bảo thuộc tính `android:launchMode="singleTask"` trong thẻ `<activity>` của `AndroidManifest.xml`. Nếu đặt là `standard`, mỗi khi mở link từ bên ngoài, Android sẽ tạo thêm một Activity mới đè lên, gây tràn bộ nhớ và nhân bản màn hình.

### 2. Tránh Race Condition khi nạp Token/Splash Screen
Nếu ứng dụng có màn hình Splash để kiểm tra token từ AsyncStorage hoặc nạp font:
* Truyền prop `fallback={<SplashScreen />}` vào `NavigationContainer`.
* Không gọi `navigation.navigate()` thủ công khi `NavigationContainer` chưa sẵn sàng (`onReady` chưa chạy).

### 3. Câu lệnh CLI kiểm tra nhanh trên Terminal

```bash
# 1. Kiểm tra Android bằng adb (Scheme & Web Domain)
adb shell am start -W -a android.intent.action.VIEW -d "myapp://products/101" com.yourpackage.name
adb shell am start -W -a android.intent.action.VIEW -d "https://myapp.com/products/101" com.yourpackage.name

# 2. Kiểm tra iOS Simulator bằng xcrun
xcrun simctl openurl booted "myapp://products/101"
xcrun simctl openurl booted "https://myapp.com/products/101"

# 3. Sử dụng công cụ uri-scheme (Đa nền tảng)
npx uri-scheme open "myapp://products/101" --android
npx uri-scheme open "myapp://products/101" --ios
```