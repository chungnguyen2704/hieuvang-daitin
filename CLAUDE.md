# CLAUDE.md — Bảng giá vàng Đại Tín

## Dự án là gì

Static web app hiển thị bảng giá vàng cho **DNTN Hiệu Vàng Đại Tín** (302–304 Lê Duẩn, An Nhơn, Gia Lai). Không có backend — dữ liệu giá lấy từ Google Sheet qua GViz CSV API, render thẳng trên browser.

## Cấu trúc file

| File | Vai trò |
|---|---|
| `config.js` | SHEET_ID + cấu hình (auto-refresh, tên tab) |
| `app.js` | Logic duy nhất: fetch CSV → parse → render. Expose `window.TiemVang.init(view)` |
| `index.html` | View **mobile/public** — khách xem trên điện thoại |
| `tv.html` | View **TV fullscreen** — **file production chính**, self-contained: FX effects, panel chọn design/FX, đồng hồ + âm lịch inline, keyboard shortcuts, auto-switch design theo ngày tuần |

### CSS design themes (dùng trong `tv.html`)

| File | Theme | Ngày mặc định |
|---|---|---|
| `style-a.css` | **Đỏ Vàng** — Phú Quý Đỏ (đỏ son + vàng) | Chủ nhật |
| `style.css` | **WOW** — Live / Original | Thứ hai |
| `style-c.css` | **Ngọc Bích** — Xanh ngọc đế vương | Thứ ba |
| `style-d.css` | **Thiên Thanh** — Xanh đại dương (navy + vàng) | Thứ tư |
| `style-e.css` | **Tím Thạch Anh** — Amethyst sang trọng | Thứ năm |
| `style-f.css` | **Bạch Kim Đêm** — Đen bạch kim ultra premium | Thứ sáu |
| `style-g.css` | **Hổ Phách** — Nâu hổ phách ấm áp | Thứ bảy |

`tv.html` tự động chọn design theo ngày trong tuần (Sun=a, Mon=live, Tue=c, Wed=d, Thu=e, Fri=f, Sat=g). Người dùng có thể override thủ công qua panel, reset vào ngày hôm sau.

### FX Effects (header animations trong `tv.html`)

| Key | Tên | Mô tả |
|---|---|---|
| `kimsa` | Kim Sa Rơi | Hạt vàng rơi hai bên |
| `sparkle` | Ánh Sao Lấp Lánh | Kim cương bắt sáng |
| `coins` | Tiền Xu Xoay Rơi | Xu vàng xoay 3D |
| `chars` | Chữ Phúc Lộc Thọ | 福壽財祿 nổi lên |
| `bokeh` | Bokeh Vàng | Ánh sáng mờ nhòe |
| `ripple` | Sóng Nước Vàng | Vòng sóng lan tỏa |
| `rays` | Hào Quang | Tia sáng từ trung tâm |

## Data flow

```
Google Sheet (tab Prices + Config)
  → GViz CSV URL (config.js: SHEET_ID = "1dOoUq7-...")
  → fetch() trong app.js (no-cache, cache-bust bằng timestamp)
  → parseCSV() → rowsToObjects()
  → renderTV() hoặc renderPublic()
```

- **Auto-refresh**: 30 giây (`AUTO_REFRESH_SECONDS` trong config.js)
- **Fallback**: nếu fetch lỗi → hiện demo data (demoData() trong app.js)
- **Price format**: số nguyên VNĐ, hiển thị `toLocaleString('vi-VN')`

## Google Sheet schema

**Tab `Config`**: cột `key` | `value` — các key: `shop_name`, `tagline`, `address`

**Tab `Prices`**: cột `name` | `unit` | `buy` | `sell` — bỏ qua dòng có buy/sell trống

## Keyboard shortcuts (TV view)

- `R` → Refresh ngay
- `F` → Toggle fullscreen
- `T` → Mở/đóng panel chọn FX/design
- `1–7` → Chọn nhanh FX effect
- `← →` → Chuyển FX khi panel mở

## Icon logic (app.js: getProductIcon)

Match theo keyword trong tên sản phẩm (bỏ dấu):
- `nhan`, `99`, `98`, `24k` → ring icon
- `mieng`, `sjc`, `thoi` → bar icon (gold bar 3D)
- `bac`, `silver` → coin/ingot icon
- `18k`, `14k`, `da quy`, `kim cuong` → gem icon

## Git branches

- `master` — production (branch duy nhất, không còn `new-ui`)

## Lưu ý khi sửa

- Không có build step — sửa file trực tiếp, refresh browser là thấy ngay
- `config.js` chứa SHEET_ID thật (production) — không commit giá trị fake
- Mỗi `style-*.css` dùng CSS custom properties `:root { --c-void, --c-gold-*, ... }` — màu sắc chính ở đầu file
- `app.js` là IIFE, không dùng module/bundler
- `tv.html` là self-contained — tất cả logic JS inline ở cuối file
- Design themes được swap bằng cách enable/disable `<link disabled>` — không reload trang
