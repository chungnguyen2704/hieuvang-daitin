# CLAUDE.md — Bảng giá vàng Đại Tín

## Dự án là gì

Static web app hiển thị bảng giá vàng cho **DNTN Hiệu Vàng Đại Tín** (302–304 Lê Duẩn, An Nhơn, Gia Lai). Không có backend — dữ liệu giá lấy từ Google Sheet qua GViz CSV API, render thẳng trên browser. Deploy trên **GitHub Pages**: https://chungnguyen2704.github.io/hieuvang-daitin/

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

### FX Effects (trong `tv.html`)

7 hiệu ứng header (tự động đổi mỗi giờ theo thứ tự):

| Key | Tên | Mô tả |
|---|---|---|
| `kimsa` | Kim Sa Rơi | Hạt vàng rơi hai bên |
| `sparkle` | Ánh Sao Lấp Lánh | Kim cương bắt sáng |
| `coins` | Tiền Xu Xoay Rơi | Xu vàng xoay 3D |
| `chars` | Chữ Phúc Lộc Thọ | 福壽財祿 nổi lên |
| `bokeh` | Bokeh Vàng | Ánh sáng mờ nhòe |
| `ripple` | Sóng Nước Vàng | Vòng sóng lan tỏa |
| `rays` | Hào Quang | Tia sáng từ trung tâm |

2 hiệu ứng logo (chỉ chọn thủ công, không auto-rotate):

| Key | Tên | Mô tả |
|---|---|---|
| `logoWm` | Logo Watermark | Logo Đại Tín mờ phủ toàn trang (background layer) |
| `logoFloat` | Logo Thăng Hoa | Logo nhỏ drift lên như hạt vàng |

**Auto-rotate**: 7 header effects tự đổi mỗi giờ tròn (`hourIndex % 7`). Khi user chọn thủ công, giữ nguyên đến giờ kế tiếp rồi reset.

**Pool tách biệt**: `FX_AUTO_KEYS` (7 header effects) dùng cho auto-rotate; `FX_KEYS` (9 effects) dùng cho panel/keyboard.

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

**Tab `Config`**: cột `key` | `value`

| key | value |
|---|---|
| `shop_name` | HIỆU VÀNG ĐẠI TÍN |
| `tagline` | Vàng bạc đá quý — Trang sức phong thuỷ |
| `address` | 304 Lê Duẩn, An Nhơn, Gia Lai |

**Tab `Prices`**: cột `name` | `unit` | `buy` | `sell` — bỏ qua dòng có buy/sell trống

| name | unit | buy | sell |
|---|---|---|---|
| Vàng nhẫn 99% | đồng/chỉ | 7850000 | 7950000 |
| Vàng miếng SJC | đồng/chỉ | 8050000 | 8150000 |
| Bạc | đồng/chỉ | 80000 | 90000 |

Nhập số nguyên VNĐ (không dấu chấm) — hệ thống tự format. Để trống `buy`/`sell` → ẩn dòng đó.

**Bắt buộc**: Share Sheet → `Anyone with the link` → Viewer (web không đọc được nếu để Restricted).

## Keyboard shortcuts (TV view)

- `R` → Refresh ngay
- `F` → Toggle fullscreen
- `T` → Mở/đóng panel chọn FX/design
- `1–9` → Chọn nhanh FX effect (1–7 header, 8=logoWm, 9=logoFloat)
- `← →` → Chuyển FX khi panel mở

## Icon logic (app.js: getProductIcon)

Match theo keyword trong tên sản phẩm (bỏ dấu):
- `nhan`, `99`, `98`, `24k` → ring icon
- `mieng`, `sjc`, `thoi` → bar icon (gold bar 3D)
- `bac`, `silver` → coin/ingot icon
- `18k`, `14k`, `da quy`, `kim cuong` → gem icon

## Setup (lần đầu)

1. Tạo Google Sheet với 2 tab `Config` và `Prices` theo schema trên
2. Share `Anyone with the link → Viewer`
3. Copy Sheet ID từ URL (`/d/ID_HERE/edit`) → dán vào `config.js`
4. Push lên GitHub → GitHub Pages tự deploy sau ~1 phút
5. TV: mở `https://chungnguyen2704.github.io/hieuvang-daitin/tv.html` → nhấn `F` để fullscreen

## Cập nhật giá hằng ngày

1. Mở Google Sheets trên điện thoại → tab `Prices`
2. Sửa số cột `buy` / `sell` (tự động lưu)
3. TV tự refresh sau 30 giây, hoặc nhấn `R` để refresh ngay

## Git & Deploy

- `master` — production (branch duy nhất)
- Push lên GitHub → GitHub Pages build sau ~1 phút
- URL production: https://chungnguyen2704.github.io/hieuvang-daitin/

## Lưu ý khi sửa

- Không có build step — sửa file trực tiếp, refresh browser là thấy ngay
- `config.js` chứa SHEET_ID thật (production) — không commit giá trị fake
- Mỗi `style-*.css` dùng CSS custom properties `:root { --c-void, --c-gold-*, ... }` — màu sắc chính ở đầu file
- `app.js` là IIFE, không dùng module/bundler
- `tv.html` là self-contained — tất cả logic JS inline ở cuối file
- Design themes được swap bằng cách enable/disable `<link disabled>` — không reload trang
- Gradient `tv__shop-name` và `col-title` dùng pure gold (không lẫn accent color của theme)
- Luôn cập nhật file này trước khi push lên GitHub
