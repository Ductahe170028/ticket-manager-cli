# Ticket Manager CLI

CLI quản lý ticket, có tích hợp thêm Knowledge Base (KB). Tài liệu được tách riêng theo từng tuần:

- **[README-Tickets.md](./README-Tickets.md)** — Tuần 2: quản lý ticket (`create`, `list`, `show`, `update`).
- **[README-KB.md](./README-KB.md)** — Tuần 3: tích hợp Knowledge Base (`kb search/list/retrieve/add`, chạy mock hoặc server thật).

## Chạy thử sau khi clone

Tuần 2 và tuần 3 **cùng một lệnh** `tickets`. Cài một lần là dùng được cả hai.

```powershell
cd ticket-manager-cli
npm install
npm run build
npm link
```

Sau đó gõ được ngay:

```powershell
tickets list
tickets kb list
```

`tickets kb ...` mặc định dùng dữ liệu mẫu (mock), **không cần bật server**. Muốn thử server thật thì xem [README-KB.md](./README-KB.md).

Chi tiết cài đặt, cấu hình, lệnh ticket: [README-Tickets.md](./README-Tickets.md).
