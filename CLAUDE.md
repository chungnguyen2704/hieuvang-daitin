# CLAUDE.md — Bảng giá vàng Đại Tín

## Dự án là gì

Static web app hiển thị bảng giá vàng cho **DNTN Hiệu Vàng Đại Tín** (302–304 Lê Duẩn, An Nhơn, Gia Lai). Không có backend — dữ liệu giá lấy từ Google Sheet qua GViz CSV API, render thẳng trên browser.

## Cấu trúc file

| File | Vai trò |
|---|---|
| `config.js` | SHEET_ID + cấu hình (auto-refresh, tên tab) |
| `app.js` | Logic duy nhất: fetch CSV → parse → render. Expose `window.TiemVang.init(view)` |
| `index.html` | View **mobile/public** — khách xem trên điện thoại |
| `tv.html` | View **TV fullscreen** — đặt màn hình tại quầy |
| `style.css` | CSS dùng chung cho cả 2 view chính |

### Variant files (đang thử nghiệm UI mới)
- `index-a/b/c.html` + `style-a/b/c.css` — 3 phương án thiết kế trang mobile
- `tv-a/b/c.html` — 3 phương án thiết kế trang TV
- `tv-demo-effects.html` — prototype hiệu ứng riêng lẻ
- **`tv-dragon.html`** — **file TV latest & đầy đủ nhất** (737 dòng, self-contained): chứa FX effects (kim sa rơi, sparkle, v.v.), panel chọn theme + design, đồng hồ + âm lịch inline, keyboard shortcuts đầy đủ. Đây là file đang được phát triển chính cho TV view.
- `preview.html` — trang preview so sánh các variant

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

## Icon logic (app.js: getProductIcon)

Match theo keyword trong tên sản phẩm (bỏ dấu):
- `nhan`, `99`, `98`, `24k` → ring icon
- `mieng`, `sjc`, `thoi` → bar icon (gold bar 3D)
- `bac`, `silver` → coin/ingot icon
- `18k`, `14k`, `da quy`, `kim cuong` → gem icon

## Git branches

- `master` — production
- `new-ui` — branch đang làm (hiện tại)

## Lưu ý khi sửa

- Không có build step — sửa file trực tiếp, refresh browser là thấy ngay
- `config.js` chứa SHEET_ID thật (production) — không commit giá trị fake
- CSS dùng CSS custom properties (`--c-gold-*`, `--c-bg-*`, v.v.) — sửa ở đầu `style.css`
- `app.js` là IIFE, không dùng module/bundler
- Variant files (a/b/c) là độc lập — mỗi file tự load CSS riêng của nó
