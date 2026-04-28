# Google Sheet Template — Tiệm Vàng

Toàn bộ hệ thống chỉ cần **1 file Google Sheet duy nhất** với 2 tab.

## Tạo Sheet

1. Mở https://sheets.new
2. Đặt tên file: `Bảng giá tiệm vàng`
3. Tạo **2 tab**: `Config` và `Prices` (đặt tên đúng chính tả)

---

## Tab `Config` — thông tin tiệm

Cấu trúc 2 cột. Hàng 1 là header.

| key       | value                                       |
|-----------|---------------------------------------------|
| shop_name | HIỆU VÀNG ĐẠI TÍN                           |
| tagline   | Vàng bạc đá quý — Trang sức phong thuỷ      |
| address   | 304 Lê Duẩn, An Nhơn, Gia Lai               |

> Đổi `shop_name`, `tagline`, `address` thành thông tin tiệm bạn.
> Mẹo: viết `shop_name` IN HOA HẾT để hiển thị đúng phong cách Roman caps.

---

## Tab `Prices` — bảng giá

Hàng 1 là header. Mỗi hàng tiếp là một loại sản phẩm.

| name              | unit       | buy     | sell    |
|-------------------|------------|---------|---------|
| Vàng nhẫn 99%     | đồng/chỉ   | 7850000 | 7950000 |
| Vàng nhẫn 98%     | đồng/chỉ   | 7800000 | 7900000 |
| Vàng 18K          | đồng/chỉ   | 5800000 | 6100000 |
| Vàng miếng SJC    | đồng/chỉ   | 8050000 | 8150000 |
| Bạc               | đồng/chỉ   | 80000   | 90000   |

**Quy tắc:**
- `name`: tên sản phẩm (hiển thị trên TV/web)
- `unit`: đơn vị (hiển thị nhỏ dưới tên)
- `buy`: giá **mua vào** (tiệm mua từ khách)
- `sell`: giá **bán ra** (tiệm bán cho khách)
- **Nhập đầy đủ số tiền VND**: ví dụ giá `7.850.000đ/chỉ` → ô ghi `7850000` (không có dấu chấm). Hệ thống tự format khi hiển thị thành `7.850.000`.
- Muốn ẩn 1 dòng tạm thời? Xoá số ở `buy` và `sell` (để trống) → sẽ không hiển thị.
- Thứ tự dòng trong Sheet = thứ tự hiển thị trên TV/web.

---

## Mở quyền truy cập (BẮT BUỘC)

Web không đọc được Sheet nếu chưa share. Làm 1 lần:

1. Click **Share** (góc trên phải)
2. Đổi `Restricted` → **`Anyone with the link`**
3. Quyền: **Viewer**
4. Click **Done**

> Sheet vẫn an toàn — không ai sửa được nếu không có quyền edit. Họ chỉ xem được.

---

## Lấy Sheet ID

Copy ID trong URL:

```
https://docs.google.com/spreadsheets/d/    1aBcDeFgHiJkLmNoPqRsTuVwXyZ    /edit
                                       └────────── đây là Sheet ID ──────────┘
```

Dán Sheet ID này vào `config.js` ở bước tiếp theo.

---

## Cập nhật giá hằng ngày

Đơn giản nhất:
1. Mở app **Google Sheets** trên điện thoại
2. Vào tab `Prices`
3. Sửa số ở cột `buy` / `sell`
4. (Tự động save)
5. Lên TV/web bấm nút **Cập nhật** → giá mới hiện ngay
