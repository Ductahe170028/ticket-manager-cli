# Ticket Manager CLI

Đây là công cụ gõ lệnh trên terminal để quản lý ticket (việc cần làm), lưu trên máy bằng file JSON.

Phần mềm cần có sẵn: Node.js (nên dùng bản LTS) và npm.

---

## Installation (Cài đặt)

Làm lần lượt:

1. Mở terminal, vào thư mục project:

```powershell
cd ticket-manager-cli
```

2. Cài thư viện cần thiết:

```powershell
npm install
```

3. (Không bắt buộc) Build và gắn lệnh `tickets` để gõ ở mọi nơi:

```powershell
npm run build
npm link
```

Sau bước này bạn có thể gõ `tickets list`, `tickets create ...` mà không cần `npm.cmd run ...`.

Nếu bỏ qua bước 3 cũng được — dùng cách chạy trong mục Usage bên dưới.

4. Nên chạy test một lần để chắc máy mình ổn:

```powershell
npm test
```

---

## Configuration (Cấu hình)

### File `.env` (tuỳ chọn)

Copy `.env.example` thành `.env` rồi chỉnh giá trị nếu muốn đổi cấu hình mà không cần set biến môi trường mỗi lần gõ lệnh:

```powershell
Copy-Item .env.example .env
```

`.env` không commit lên git (đã có trong `.gitignore`) — mỗi máy tự giữ bản riêng.

### File lưu ticket

- Mặc định mọi ticket nằm ở `data/tickets.json`.
- Đường dẫn tính theo thư mục bạn đang đứng khi gõ lệnh.
- File là một danh sách (mảng) ticket dạng JSON.
- Lần đầu tạo ticket, nếu chưa có thư mục `data/` thì chương trình tự tạo.

Mỗi ticket gồm:

- `id` — mã tự sinh, ví dụ `TKT-001`, `TKT-002`, …
- `title` — tiêu đề
- `description` — mô tả (có thể để trống)
- `status` — một trong: `open`, `in_progress`, `done` (tạo mới mặc định `open`)
- `priority` — một trong: `low`, `medium`, `high` (tạo mới mặc định `medium`)
- `tags` — danh sách nhãn; khi nhập sẽ được cắt khoảng trắng, viết thường, bỏ trùng

### Đổi chỗ lưu file (tuỳ chọn)

Muốn dùng file JSON khác (không phải `data/tickets.json`), set biến môi trường `TICKETS_PATH`.

Ví dụ trên PowerShell:

```powershell
$env:TICKETS_PATH="C:\temp\my-tickets.json"
npm.cmd run tickets -- list
Remove-Item Env:TICKETS_PATH
```

Lưu ý: khi chạy `npm test`, test dùng file tạm riêng, không đụng vào `data/tickets.json` của bạn.

### Nếu bạn dùng PowerShell trên Windows

Hãy gọi bằng `npm.cmd` (có chữ `.cmd`):

```powershell
npm.cmd run tickets -- list
```

Nếu chỉ gõ `npm run ...`, đôi khi Windows “nuốt” mất các tham số kiểu `--title=...`, lệnh sẽ báo thiếu option dù bạn đã gõ đủ.

Nên viết tham số dạng có dấu `=`, ví dụ: `--title="Bug login"`.

---

## Usage (Cách dùng)

### Hai cách chạy

Cách 1 — đang làm trong thư mục project (không cần build):

```powershell
npm.cmd run tickets -- <lệnh> ...
```

Cách 2 — đã `npm run build` và `npm link`:

```powershell
tickets <lệnh> ...
```

Các ví dụ bên dưới dùng **cách 1**. Nếu dùng cách 2, bỏ đoạn `npm.cmd run tickets --` phía trước là được.

---

### Tạo ticket — `create`

Bắt buộc có `--title`. Các thứ còn lại không bắt buộc.

```powershell
# Chỉ cần tiêu đề
npm.cmd run tickets -- create --title="Bug login"

# Đủ thông tin
npm.cmd run tickets -- create --title="Bug login" --description="Sai mật khẩu vẫn vào được" --status=open --priority=high --tags=bug,auth
```

- Không ghi `--description` thì mô tả để trống.
- Gõ `Done` hay `done` đều được — chương trình tự chuẩn hóa.
- Nhiều tag thì cách nhau bằng dấu phẩy, ví dụ `bug,auth`.
- Tạo xong sẽ in ra id mới, ví dụ `TKT-001`.

---

### Xem danh sách — `list`

```powershell
# Hiện tất cả
npm.cmd run tickets -- list

# Lọc theo điều kiện
npm.cmd run tickets -- list --status=open
npm.cmd run tickets -- list --priority=high
npm.cmd run tickets -- list --tags=bug,auth
npm.cmd run tickets -- list --status=open --priority=high
```

- Không gắn bộ lọc → hiện hết.
- Gắn nhiều bộ lọc cùng lúc → phải thỏa **tất cả** (AND).
- Nhiều tag trong `--tags` → ticket phải có **đủ** các tag đó.
- Mỗi dòng hiện `id` và `title`.
- Nếu lọc bằng status/priority không hợp lệ → không in ticket nào (không báo lỗi).

---

### Xem một ticket — `show`

```powershell
npm.cmd run tickets -- show TKT-001
```

- In đầy đủ: id, title, description, status, priority, tags.
- Sai id, id không tồn tại, hoặc để trống → báo lỗi.

---

### Đổi trạng thái — `update`

Tuần này chỉ đổi **status**. Các field khác giữ nguyên.

```powershell
npm.cmd run tickets -- update TKT-001 --status=done
npm.cmd run tickets -- update TKT-001 --status=Done
```

- Phải có id và `--status`.
- Viết hoa/thường đều được.
- Thành công thì in id kèm status mới.

---

### Chạy test

```powershell
npm test
```

Có test đơn vị (logic) và test tích hợp (file JSON tạm + chạy lệnh CLI thật).

---

## Cấu trúc thư mục (xem nhanh)

```text
ticket-manager-cli/
├── src/
│   ├── commands/         # Nhận lệnh từ người dùng
│   │   ├── parse-tags.ts #   dùng chung (tickets + kb)
│   │   ├── tickets/      #   lệnh tickets create/list/show/update
│   │   └── kb/           #   lệnh kb search/list/retrieve/add (Tuần 3)
│   ├── services/         # Xử lý nghiệp vụ
│   │   ├── tickets/
│   │   └── kb/           #   (Tuần 3)
│   ├── models/           # Hình dạng dữ liệu
│   │   ├── tickets/
│   │   └── kb/           #   (Tuần 3)
│   ├── storage/          # Đọc/ghi file JSON (ticket)
│   ├── clients/          # Gọi Knowledge Base — mock/HTTP (Tuần 3)
│   └── index.ts          # Điểm vào chương trình
├── tests/
│   ├── helpers/          # dùng chung (chạy CLI thật)
│   ├── tickets/          # unit/ + integration/
│   └── kb/               # unit/ + integration/ (Tuần 3)
├── data/tickets.json     # Dữ liệu khi bạn chạy tay
└── README.md
```

Code viết theo kiểu function/factory, không dùng class.

---

## Lệnh mẫu (copy nhanh)

Chạy trong thư mục `ticket-manager-cli` trên PowerShell:

```powershell
npm.cmd run tickets -- create --title="Bug login"
npm.cmd run tickets -- create --title="Bug login" --description="Sai mật khẩu vẫn vào được" --status=open --priority=high --tags=bug,auth
npm.cmd run tickets -- list
npm.cmd run tickets -- list --status=open
npm.cmd run tickets -- list --priority=high
npm.cmd run tickets -- list --tags=bug,auth
npm.cmd run tickets -- list --status=open --priority=high
npm.cmd run tickets -- show TKT-001
npm.cmd run tickets -- update TKT-001 --status=done
npm.cmd run tickets -- update TKT-001 --status=open
npm test
```

Nếu đã `npm run build` và `npm link`, bỏ tiền tố `npm.cmd run tickets --`, chỉ giữ phần lệnh. Ví dụ:

```powershell
tickets create --title="Bug login"
tickets list
tickets show TKT-001
tickets update TKT-001 --status=done
```
