# Tiệm Vàng — Bảng giá TV + Web

App cực gọn, không cần backend:
- **Google Sheet** = nơi nhập giá (sửa trên app Google Sheets điện thoại)
- **Web tĩnh** (TV + di động) = hiển thị, có nút **Cập nhật giá mới**

---

## Cấu trúc file

```
tiem-vang/
├── index.html         ← Web khách xem trên điện thoại
├── tv.html            ← Bảng giá TV fullscreen
├── style.css          ← Thiết kế (dùng chung)
├── app.js             ← Logic fetch + render
├── config.js          ← Dán SHEET_ID vào đây
├── sheet-template.md  ← Cấu trúc Google Sheet mẫu
└── README.md          ← File này
```

---

## Setup — 4 bước

### Bước 1. Tạo Google Sheet

Làm theo hướng dẫn trong `sheet-template.md`:
- Tạo file Sheet mới với 2 tab: `Config` và `Prices`
- Nhập tên tiệm, sản phẩm, giá mua/bán
- **Quan trọng**: Share `Anyone with the link → Viewer`

### Bước 2. Lấy Sheet ID

Mở Sheet bạn vừa tạo. Trong URL:

```
https://docs.google.com/spreadsheets/d/   1aBcDeFg…XyZ   /edit
                                       └────── ID ──────┘
```

Copy phần ở giữa `/d/` và `/edit`.

### Bước 3. Dán ID vào `config.js`

Mở `config.js`, đổi:

```js
SHEET_ID: "PASTE_YOUR_SHEET_ID_HERE",
```

thành ID bạn vừa copy:

```js
SHEET_ID: "1aBcDeFg…XyZ",
```

### Bước 4. Mở thử

**Cách nhanh nhất (test trên máy):**
- Tải toàn bộ folder về máy
- Click đúp `index.html` → mở trên trình duyệt → kiểm tra giá hiện đúng

> ⚠️ Nếu mở bằng `file://` mà không thấy giá: dùng cách deploy ở dưới (browser chặn fetch trên file:// trong vài trường hợp).

---

## Deploy lên web (chọn 1 trong 3)

### Option A — Netlify Drop (dễ nhất, 30 giây)

1. Mở https://app.netlify.com/drop
2. Kéo cả folder `tiem-vang/` vào trang
3. Xong! Netlify cho 1 URL kiểu `random-name.netlify.app`
4. URL `index.html` = trang khách. URL `tv.html` = TV.

### Option B — GitHub Pages (free, ổn định)

1. Tạo repo GitHub mới
2. Push folder lên
3. Settings → Pages → Source: `main`
4. URL: `https://yourname.github.io/repo-name/`

### Option C — Vercel

1. Tạo tài khoản https://vercel.com
2. New Project → Import folder hoặc Git repo
3. Deploy (không cần config gì)

---

## Đặt lên TV

1. Cắm TV vào 1 thiết bị có browser:
   - **Android TV / Smart TV**: dùng app Chrome / Firefox
   - **TV thường**: cắm Chromecast / Fire Stick / hoặc 1 PC mini (Raspberry Pi, mini PC)
2. Mở URL `tv.html` (ví dụ `https://your-site.netlify.app/tv.html`)
3. Bấm **F11** (hoặc **F** trên bàn phím nếu có) để fullscreen
4. (Tuỳ chọn) Cài extension "Auto Refresh Plus" để tự reload trang mỗi vài phút phòng khi web bị treo

### Phím tắt trên TV
- `R` → Refresh (cập nhật giá ngay)
- `F` → Toggle fullscreen

---

## Cập nhật giá hằng ngày

1. Mở app **Google Sheets** trên điện thoại
2. Mở file `Bảng giá tiệm vàng` → tab `Prices`
3. Sửa số ở cột `buy` / `sell`
4. (Sheet tự lưu)
5. Trên TV/web — bấm nút **Cập nhật giá mới**, hoặc đợi auto refresh (30 giây)

> Web có cache khoảng 1–2 phút từ Google. Nếu sửa xong mà chưa thấy đổi — đợi thêm 1–2 phút rồi bấm refresh.

---

## Tuỳ chỉnh

### Đổi tên / slogan tiệm
→ Sửa cell `value` trong tab `Config` của Sheet.

### Đổi tốc độ auto-refresh
→ `config.js`: đổi `AUTO_REFRESH_SECONDS` (đặt `0` để tắt).

### Thêm sản phẩm mới
→ Thêm dòng mới trong tab `Prices`.

### Ẩn 1 sản phẩm tạm thời
→ Xoá số ở `buy` và `sell` (để trống). Dòng đó sẽ không hiển thị.

### Đổi màu / font
→ Sửa biến CSS trong `style.css` (đầu file, mục "DESIGN TOKENS").

---

## Không hoạt động? Kiểm tra:

1. **Sheet đã share chưa?** Phải là `Anyone with the link → Viewer`. Nếu để `Restricted` → web không đọc được.
2. **SHEET_ID đúng chưa?** Mở Console (F12) xem có lỗi không.
3. **Tên tab đúng chưa?** Phải đúng `Prices` và `Config` (chữ hoa P và C).
4. **Header dòng 1 đúng chưa?** Tab `Prices` phải có cột: `name`, `unit`, `buy`, `sell`. Tab `Config` phải có: `key`, `value`.
5. **Mở qua `file://` không chạy?** Deploy lên Netlify (Option A) — luôn chạy được.

---

## Roadmap v2 (tương lai)

- Lịch sử giá (lưu mỗi lần cập nhật)
- Cảnh báo khi giá thị trường thay đổi lớn
- Auto-fetch giá tham khảo từ SJC/BTMC/PNJ (cần thêm Apps Script)
