# Navigation Của Mini App A: Thay Đổi, Ưu Nhược Điểm Và Cải Tiến

Tài liệu này mô tả lần refactor navigation của `mini-app-a` (React Navigation 7.x, Module Federation), gồm những gì đã đổi, vì sao đổi, ưu nhược điểm và hướng cải tiến tiếp theo.

File chính: [AppNavigation.tsx](apps/mini-app-a/src/core/navigation/AppNavigation.tsx)

> [!NOTE]
> Code đã qua `tsc --noEmit` nhưng **chưa được kiểm thử runtime** trên thiết bị/giả lập. Các hành vi mô tả ở mục "Hạn chế" cần được xác nhận khi chạy thật.

---

## 1. Bối cảnh

Mini App được Host App nạp động qua Module Federation (`WrapperRSPack`) bên trong màn hình `RemoteApp`. Host truyền `initialRoute` (path deeplink nội bộ Mini App, ví dụ `post/42`) xuống Mini App.

### Trước khi thay đổi

| Hạng mục | Hiện trạng cũ |
| :--- | :--- |
| Container | Không có `NavigationContainer`, dùng chung navigator của Host |
| Xử lý deeplink | `useEffect` parse path rồi `navigation.navigate(...)` sau khi mount |
| Cold Start | Render `PostManagementScreen` trước, sau đó mới navigate sang Detail (**chớp màn hình**) |
| Ép kiểu param | Thủ công: `params.id = Number(params.id)` |
| Backstack khi vào thẳng deeplink | Chỉ khớp `initialRouteName` của stack, không có cơ chế tổng quát |
| Nút Back Android | Không có xử lý riêng cho Mini App |
| Thêm màn hình mới | Sửa ở 3 nơi: `Stack.Screen`, bảng linking, logic điều hướng |

---

## 2. Những thay đổi

### 2.1. Cây điều hướng độc lập (`NavigationIndependentTree`)

```tsx
<NavigationIndependentTree>
  <NavigationContainer ref={navRef} initialState={initialState}>
    ...
  </NavigationContainer>
</NavigationIndependentTree>
```

- Mini App sở hữu cây điều hướng riêng, không xung đột với `RootNavigator` của Host.
- Ngăn lỗi "nested NavigationContainers".
- Ở React Navigation 7, prop `independent` đã bị bỏ. `NavigationIndependentTree` là cách tương đương.

### 2.2. Registry khai báo màn hình (`SCREENS`)

```ts
const SCREENS: Record<ScreenName, ScreenDefinition> = {
  PostManagementScreen: { component: PostManagementScreen, path: '' },
  PostDetailScreen: {
    component: PostDetailScreen,
    path: 'post/:id',
    parentScreen: 'PostManagementScreen',
    parse: { id: Number },
  },
};
```

Một nguồn sự thật duy nhất, từ đó sinh ra:
- `LINKING_CONFIG` (ánh xạ URL, `parse` ép kiểu)
- Danh sách `<Stack.Screen>`
- Phả hệ màn hình (`parentScreen`)

Thêm màn hình mới chỉ cần thêm một entry.

### 2.3. Synthetic Backstack Engine (`parentScreen`)

`getAncestors(name)` lần theo chuỗi `parentScreen` từ màn hình đích lên gốc. Kết quả được dùng để dựng ngăn xếp `[ancestors…, target]`.

```
Deeplink post/42
Không có engine:  [ PostDetail(42) ]                    -> Back thoát luôn Mini App
Có engine:        [ PostManagement, PostDetail(42) ]    -> Back về danh sách trước
```

Chuỗi nhiều cấp (Comment -> Detail -> Management) tự dựng, không cần code thủ công.

### 2.4. Cold Start dùng `initialState`

`buildSyntheticState(initialRoute)` dựng sẵn ngăn xếp từ lần render đầu và truyền vào `NavigationContainer`. Không còn bước "render Management rồi mới nhảy sang Detail".

### 2.5. Warm Start: mỗi deeplink dựng lại ngăn xếp (RESET, giữ key phả hệ)

Host chỉ cập nhật prop `initialRoute`. Mini App không bị unmount (component federated được cache bằng `React.lazy`). Bên trong, `useEffect` theo dõi prop và gọi `navigateToPath`, hàm này **luôn** dựng lại ngăn xếp `[ancestors…, target]` rồi dispatch `CommonActions.reset`:

| Route trong ngăn xếp mới | Key |
| :--- | :--- |
| Màn hình phả hệ trùng tên **và** cùng vị trí với route đang có | **Giữ nguyên key cũ** -> không remount, giữ state |
| Màn hình phả hệ chưa có | Tạo mới |
| Màn hình đích | Luôn tạo mới (key mới) -> tải dữ liệu theo params mới |

Nhờ vậy ngăn xếp luôn khớp đúng URL, không còn màn hình cũ nằm sót ở giữa, mà màn hình cha không bị chớp.

URL vẫn được parse bằng `getStateFromPath` của React Navigation. `getActionFromState` không còn được dùng, vì nó không tạo được `RESET` có giữ `key`; thay vào đó dùng `CommonActions.reset` trực tiếp.

### 2.6. Hardware Back trên Android

```ts
if (nav.isReady() && nav.canGoBack()) { nav.goBack(); return true; }
if (onExitMiniApp) { onExitMiniApp(); return true; }
return false;
```

Còn màn hình trong ngăn xếp thì pop nội bộ. Chỉ khi về trang chủ Mini App mới gọi `onExitMiniApp()` để Host đóng container.

### 2.7. Thay đổi phía Host

| File | Thay đổi |
| :--- | :--- |
| [App.tsx](apps/mini-app-a/App.tsx) | Nhận thêm prop `onExitMiniApp`, truyền xuống `AppContainer` |
| [WrapperRSPack.tsx](apps/host-app/src/federation/WrapperRSPack.tsx) | Thêm prop `onExitMiniApp`, chuyển tiếp cho `FederatedComponent` |
| [RemoteAppScreen.tsx](apps/host-app/src/screens/RemoteAppScreen.tsx) | Truyền `onExitMiniApp={() => navigation.goBack()}` |

---

## 3. Ưu điểm

| Ưu điểm | Giải thích |
| :--- | :--- |
| **Cô lập navigation** | Mini App không phụ thuộc cấu trúc navigator của Host, dễ chạy standalone và tránh cảnh báo nested |
| **Không chớp màn hình khi Cold Start** | Ngăn xếp đúng ngay từ render đầu tiên |
| **Back đúng kỳ vọng người dùng** | Vào thẳng màn hình sâu vẫn lùi được qua các màn hình cha |
| **Mở rộng bằng khai báo** | Thêm màn hình = thêm một entry trong `SCREENS`, linking config và screen list tự sinh |
| **Ít code parse thủ công** | `parse` trong config thay cho ép kiểu tay, dùng API chuẩn của thư viện |
| **Warm Start không mất state màn hình cha** | Route phả hệ đang có được giữ nguyên `key` khi reset nên không remount |
| **Ngăn xếp luôn khớp URL** | Mỗi deeplink dựng lại `[ancestors…, target]`, không còn màn hình cũ nằm sót hoặc chồng trùng |
| **Logic đơn giản** | Một đường xử lý duy nhất, không còn nhánh `popToTop` / `NAVIGATE` / `RESET` |
| **Ranh giới Back rõ ràng** | Mini App quyết định pop nội bộ, Host quyết định đóng container |

---

## 4. Nhược điểm và hạn chế

| Hạn chế | Chi tiết |
| :--- | :--- |
| **Mất lịch sử điều hướng của người dùng** | Reset xóa các màn hình người dùng đã đi qua (ví dụ đang ở Comment, nhận deeplink sang product khác thì Comment bị bỏ) |
| **State màn hình đích luôn bị tạo mới** | Màn hình đích dùng key mới nên mất state cục bộ (form đang nhập). Kể cả khi deeplink trỏ cùng màn hình đang mở |
| **Giữ key chỉ theo tên và vị trí** | Màn hình phả hệ trùng tên nhưng khác `params` vẫn được giữ lại với `params` cũ |
| **Bỏ qua deeplink trùng path** | `handledPath` chống xử lý lặp. Nếu người dùng đã điều hướng đi chỗ khác rồi nhận lại đúng path cũ, nó **không** điều hướng lại, vì prop không đổi |
| **Mất deeplink nếu container chưa sẵn sàng** | Nếu `navRef.isReady()` là false khi prop đổi, thay đổi bị bỏ qua, không có hàng đợi |
| **`parentScreen` chỉ là một cha duy nhất** | Mô hình cây, không biểu diễn được đường vào khác nhau cho cùng một màn hình (ví dụ Detail đến từ danh sách hoặc từ yêu thích) |
| **`parse` chỉ xử lý được kiểu đơn giản** | Cần thêm xử lý riêng cho boolean, mảng, giá trị không hợp lệ (`Number('abc')` ra `NaN`) |
| **`LINKING_CONFIG` ép kiểu `as any`** | Mất type-safety ở lớp config |
| **Phụ thuộc thứ tự BackHandler** | Giả định listener của Mini App đăng ký sau và được gọi trước listener của Host. Cần kiểm tra trên thiết bị thật |
| **Chưa có kiểm thử tự động** | Engine là hàm thuần (`getAncestors`, `buildSyntheticState`) nên rất dễ unit test, nhưng chưa có test |
| **Chưa kiểm chứng runtime** | Cần kiểm tra trên thiết bị rằng reset với `key` cũ thật sự không remount màn hình phả hệ |

---

## 5. So sánh các chiến lược khi nhận deeplink lúc Mini App đang mở

| | Hybrid (phiên bản trước) | Reset hoàn toàn | Reset giữ key phả hệ (hiện tại) |
| :--- | :--- | :--- | :--- |
| Ngăn xếp luôn khớp URL | Không tuyệt đối | Có | Có |
| Giữ state màn hình cha | Có | Không | Có (giữ key) |
| Chớp màn hình cha | Ít | Có thể có | Ít |
| Độ phức tạp | Cao (nhiều nhánh) | Thấp | Thấp - trung bình |
| Mất lịch sử người dùng đã đi | Không | Có | Có |

Chiến lược hiện tại là phương án trung gian: luôn `RESET`, nhưng tái sử dụng `key` của route phả hệ đang có để chúng không remount.

---

## 6. Hướng cải tiến

1. **Giữ key theo cả `params`:** chỉ tái sử dụng key phả hệ khi `params` không đổi, tránh giữ màn hình với dữ liệu cũ.
2. **Hàng đợi deeplink chờ `onReady`:** lưu path chờ xử lý nếu container chưa sẵn sàng, rồi xử lý trong `onReady`.
3. **Cho phép làm mới cùng path:** dùng token hoặc timestamp (ví dụ `{ path, nonce }`) thay vì so sánh chuỗi để nhận biết deeplink mới.
4. **Validate param trong `parse`:** trả về lỗi hoặc điều hướng về màn hình mặc định khi `id` không hợp lệ.
5. **Type-safe cho `SCREENS`:** sinh kiểu `LinkingOptions` từ registry thay cho `as any`.
6. **Unit test cho engine:** test `getAncestors` (chuỗi nhiều cấp, vòng lặp, không có cha), `buildSyntheticState`, các nhánh của `navigateToPath`.
7. **Phát hiện vòng lặp `parentScreen` khi khởi động:** hiện chỉ chặn bằng `visited`, có thể cảnh báo rõ ràng ở môi trường dev.
8. **Chuẩn hóa tên prop:** hiện là `initialRoute`; cân nhắc đổi thành `initialPath` cho đúng ngữ nghĩa (cần sửa cả Host).
9. **Dọn `RootNavigation.tsx`:** file này tạo `navigationRef` toàn cục nhưng chưa được dùng bởi container mới. Cần thống nhất dùng `navRef` cục bộ hay ref toàn cục.

---

## 7. Luồng tổng quan

```
Host nhận deeplink (Push / URL)
        │  điều hướng RemoteApp { appKey, path }
        ▼
RemoteAppScreen ──(path)──► WrapperRSPack ──(initialRoute, onExitMiniApp)──► Mini App
                                                                                 │
                        ┌────────────────────────────────────────────────────────┤
                        ▼                                                        ▼
                  Cold Start                                              Warm Start
        buildSyntheticState(path)                                  useEffect([initialRoute])
        -> initialState [cha…, đích]                               navigateToPath(path)
                                                                     dựng [cha…, đích] -> RESET
                                                                     (giữ key route phả hệ đang có)
                                                                     

Nút Back Android
  canGoBack() ? goBack() nội bộ : onExitMiniApp() -> Host goBack()
```
