# Tuần 3 — Knowledge Base (KB) Integration

> Đây là phần mở rộng của [Ticket Manager CLI](./README-Tickets.md) (Tuần 2). Tài liệu này chỉ nói
> về phần KB — cách CLI kết nối tới một Knowledge Base (kho tài liệu, viết tắt là "KB") bên ngoài
> để tìm kiếm, xem, thêm tài liệu. Lệnh ticket tuần 2 xem ở [README-Tickets.md](./README-Tickets.md).

---

## Chạy thử ngay (nếu bỏ qua tuần 2)

Tuần 2 và tuần 3 **cùng một lệnh** `tickets`. Clone về máy rồi làm lần lượt:

```powershell
cd ticket-manager-cli
npm install
npm run build
npm link
```

Sau đó gõ được ngay (không cần bật server — mặc định dùng dữ liệu mẫu mock):

```powershell
tickets kb list
tickets kb search restart
tickets kb retrieve doc-001
```

Muốn thử server thật: copy `.env.example` thành `.env`, đổi `KB_CLIENT=http`, rồi xem mục 5 bên dưới.

Nếu chưa `npm link`, vẫn chạy được bằng:

```powershell
npm.cmd run tickets -- kb list
```

---

## 1. Mục tiêu & cách làm (TDD)

Toàn bộ phần KB được làm theo quy trình **Test-Driven Development (TDD)** — tức là **viết bài
kiểm tra (test) trước, viết code sau**:

1. Viết test mô tả kết quả mong muốn → chạy thử, thấy **báo lỗi** (vì code thật chưa tồn tại) →
   commit test.
2. Viết code vừa đủ để test đó **chạy qua, không còn báo lỗi** → commit code.
3. Đọc lại xem code/test có chỗ nào rườm rà, trùng lặp thì dọn cho gọn (refactor).

Lịch sử commit trong repo đi đúng theo thứ tự này: mỗi module luôn có 1 commit test rồi mới đến 1
commit code.

Điểm quan trọng nhất của phần này: **KB không chỉ chạy được với dữ liệu giả (để phục vụ test) mà
còn có hẳn một server thật** — chạy bằng lệnh `npm run kb-server`. Chỉ cần đổi 1 dòng trong file
cấu hình, CLI sẽ chuyển từ việc lấy dữ liệu mẫu có sẵn trong bộ nhớ sang việc **gọi qua mạng (HTTP)
tới server thật** để lấy dữ liệu — kể cả server thật của công ty sau này (nếu server đó trả dữ liệu
đúng định dạng), không cần sửa lại code.

---

## 2. Kiến trúc / luồng chạy

```text
CLI (kb search / list / retrieve / add)
      │  đọc lệnh, gọi service, in kết quả ra màn hình
      ▼
KBService
      │  xử lý nghiệp vụ: giới hạn top-k, kiểm tra dữ liệu hợp lệ
      ▼
KBClient  (interface — xem giải thích bên dưới)
      │
      │  chọn theo biến môi trường KB_CLIENT
      │
      ├── KB_CLIENT=mock (mặc định)
      │        │
      │        ▼
      │   MockKBClient
      │   10 tài liệu mẫu, sống trong bộ nhớ,
      │   không cần bật thêm gì
      │
      └── KB_CLIENT=http
               │
               ▼
         HTTPKBClient
         gửi request qua mạng (dùng axios)
         tới địa chỉ KB_API_URL
               │
               │  HTTP tới /search /list /retrieve /add
               ▼
         KB Server thật
         bật bằng lệnh: npm run kb-server
         có 10 tài liệu mẫu riêng, khác
         hẳn bên mock (để test tay biết
         ngay mình đang gọi server thật)
```

Giải thích 2 khái niệm hay gặp trong sơ đồ trên:

- **"interface" (`KBClient`)** — hiểu đơn giản là một "bản cam kết": bất kỳ ai muốn cung cấp dữ
  liệu KB (dù là dữ liệu giả `MockKBClient` hay gọi server thật `HTTPKBClient`) đều phải có đủ 4
  hàm `search`, `list`, `retrieve`, `add`. Nhờ vậy, phần code xử lý nghiệp vụ (`KBService`) chỉ cần
  biết gọi 4 hàm này, **không cần quan tâm** dữ liệu thật ra đang tới từ đâu.
- **"mock"** — dữ liệu/hành vi giả lập, dựng lên chỉ để chạy thử cho nhanh, không phải dữ liệu
  thật. Ở đây là 10 tài liệu mẫu nằm sẵn trong bộ nhớ máy, không cần bật thêm server nào.

Nhờ cách tách này, sau này nối vào server thật của công ty chỉ cần đổi giá trị `KB_API_URL`, hoàn
toàn không cần sửa một dòng code nào.

---

## 3. Cấu hình (biến môi trường)

"Biến môi trường" ở đây là các giá trị cấu hình đặt trong file `.env` — đổi giá trị trong file này
là đổi được hành vi của chương trình mà không cần sửa code.

Nếu chưa có file `.env`, tạo bằng cách copy từ file mẫu (đã hướng dẫn ở README Tuần 2):

```powershell
Copy-Item .env.example .env
```

Các biến liên quan tới KB trong `.env`:

| Biến         | Ý nghĩa                                             | Giá trị mặc định                |
| ------------ | ---------------------------------------------------- | -------------------------------- |
| `KB_CLIENT`  | Chọn nơi lấy dữ liệu KB: `mock` (giả lập) hoặc `http` (gọi server thật) | `mock` (để trống cũng tính là `mock`) |
| `KB_API_URL` | Địa chỉ server KB — **bắt buộc phải có** nếu `KB_CLIENT=http` | `http://localhost:4000`          |
| `PORT`       | Cổng mà server KB thật lắng nghe khi chạy `npm run kb-server` | `4000`                            |

Nếu bạn đặt `KB_CLIENT=http` nhưng quên điền `KB_API_URL`, CLI sẽ báo lỗi ngay khi vừa gõ lệnh
(không để chương trình chạy mập mờ rồi mới báo lỗi giữa chừng).

---

## 4. Chạy ở chế độ Mock (mặc định — không cần bật server)

Đây là cách chạy đơn giản nhất, dùng để thử nhanh mà không cần chuẩn bị gì thêm. Không cần chỉnh
`.env` (mặc định đã là `KB_CLIENT=mock`):

```powershell
tickets kb list
tickets kb search restart
tickets kb retrieve doc-001
```

Chưa `npm link` thì thay `tickets` bằng `npm.cmd run tickets --`.

10 tài liệu mẫu nằm sẵn trong code, ở file `src/clients/mock-kb-client.ts`. Dữ liệu này chỉ tồn tại
trong lúc lệnh đang chạy — mỗi lần gõ lệnh là một lần chương trình khởi động lại từ đầu, nên không
lưu lại được gì giữa các lần gõ lệnh.

---

## 5. Chạy với server KB thật

Cách này mô phỏng đúng tình huống thật: có một server chạy độc lập, giữ dữ liệu, còn CLI chỉ là
một "khách hàng" gửi yêu cầu tới server đó qua mạng.

**Bước 1 — mở một cửa sổ terminal riêng, bật server lên (để terminal này chạy, đừng tắt):**

```powershell
cd ticket-manager-cli
npm run kb-server
```

Server sẽ lắng nghe tại `http://localhost:4000` (đổi cổng bằng biến `PORT` trong `.env` nếu muốn).
Server có sẵn 10 tài liệu mẫu riêng, ở file `src/server/kb-seed-data.ts` — **nội dung khác hoàn
toàn** so với 10 tài liệu mẫu bên mock, để khi bạn test tay là biết ngay mình đang thấy dữ liệu của
server thật chứ không phải nhầm sang mock.

**Bước 2 — mở file `.env`, sửa 2 dòng sau:**

```env
KB_CLIENT=http
KB_API_URL=http://localhost:4000
```

**Bước 3 — mở một cửa sổ terminal khác (terminal ở bước 1 vẫn phải đang chạy server), gõ lệnh như
bình thường:**

```powershell
tickets kb list
tickets kb search monitoring
tickets kb retrieve doc-001
tickets kb add --file note.md --path "/new/node" --title "Ghi chú test"
```

Chưa `npm link` thì thay `tickets` bằng `npm.cmd run tickets --`.

Tài liệu vừa `add` sẽ tồn tại **trong suốt thời gian server còn chạy** — vì dữ liệu được giữ trong
bộ nhớ của chương trình server, hễ tắt server (đóng cửa sổ terminal ở bước 1, hoặc bấm Ctrl+C) là
mất, y hệt cách mock hoạt động. Điểm khác duy nhất là lần này CLI phải gửi yêu cầu qua mạng tới
server thật, thay vì gọi hàm trực tiếp trong cùng chương trình.

Muốn quay lại chạy nhanh bằng mock: mở `.env`, đổi `KB_CLIENT` về `mock`.

---

## 6. Các lệnh

Các ví dụ dưới đây dùng `tickets` (sau `npm link`). Chưa link thì thay bằng `npm.cmd run tickets --`.

### `kb search <query>` — tìm tài liệu theo từ khóa

```powershell
tickets kb search refund
tickets kb search refund --top-k 3
```

- Tìm khớp từ khóa trong **title (tiêu đề) trước, content (nội dung) sau** — nếu 1 tài liệu vừa
  khớp title vừa khớp content, tài liệu đó vẫn chỉ hiện 1 lần, và được ưu tiên đứng trước các tài
  liệu chỉ khớp content.
- `--top-k <n>` giới hạn tối đa bao nhiêu kết quả được hiện ra, mặc định là `5`. Đây là một lớp
  "chốt chặn an toàn" ở tầng xử lý nghiệp vụ: dù nơi cung cấp dữ liệu (mock hoặc server thật) có
  trả về bao nhiêu kết quả đi nữa, CLI cũng chỉ lấy tối đa đúng số lượng `--top-k` để hiện ra.
- Gõ từ khóa không khớp tài liệu nào → không in dòng nào cả, và **không** báo lỗi (vì "không tìm
  thấy" không phải là một lỗi).
- Mỗi dòng kết quả in ra dạng: `id title` (mã tài liệu và tiêu đề).

### `kb list` — liệt kê tài liệu

```powershell
tickets kb list
tickets kb list --node "/templates/email"
tickets kb list --limit 2
```

- Không truyền `--node` → hiện toàn bộ tài liệu đang có.
- `--node <đường-dẫn>` → chỉ hiện tài liệu nằm đúng trong "thư mục" (`nodePath`) đó.
- `--limit <n>` → chỉ hiện tối đa `n` dòng đầu tiên (áp dụng **sau khi** đã lọc theo `--node`, nếu
  có).

### `kb retrieve <docId>` — xem đầy đủ nội dung 1 tài liệu

```powershell
tickets kb retrieve doc-001
```

- In ra đầy đủ mọi thông tin của tài liệu: `id`, `title`, `nodePath`, `tags`, `content`.
- Nếu `docId` không tồn tại → báo lỗi rõ ràng (có chữ `not found`), và chương trình thoát với mã
  lỗi khác 0 (dấu hiệu cho biết lệnh chạy thất bại).

### `kb add` — thêm tài liệu mới

```powershell
tickets kb add --file note.md --path "/new/node" --title "Ghi chú" --tags note,demo
```

- `--file <đường-dẫn-file>` (bắt buộc): đường dẫn tới 1 file văn bản chứa nội dung tài liệu muốn
  thêm — chương trình sẽ đọc toàn bộ nội dung file này (đọc theo chuẩn UTF-8, hỗ trợ tiếng Việt có
  dấu) để làm `content` của tài liệu.
- `--path <đường-dẫn>` (bắt buộc): giá trị `nodePath` của tài liệu.
- `--title <tên>` (không bắt buộc): nếu không truyền, chương trình tự lấy tên file (bỏ đuôi `.md`)
  làm title.
- `--tags <tag1,tag2,...>` (không bắt buộc): danh sách nhãn, các nhãn cách nhau bằng dấu phẩy —
  chương trình tự động cắt khoảng trắng thừa, chuyển hết về chữ thường, và bỏ nhãn trùng lặp.
- Nếu `title` hoặc `nodePath` chỉ toàn khoảng trắng (coi như rỗng) → báo lỗi, **không** tạo tài
  liệu mới. Việc kiểm tra này được làm ở **cả hai nơi**: trong `kb-service` (áp dụng khi gọi qua
  CLI, dù đang chạy mock hay http) và ngay trong bản thân server thật (áp dụng cho cả trường hợp có
  ai đó gọi thẳng vào server, không thông qua CLI này).

---

## 7. Chạy test

```powershell
npm test
```

- **Unit test** (`tests/kb/unit/`): kiểm tra logic của `kb-service` bằng một `KBClient` giả lập rất
  đơn giản (`fake-kb-client.ts`), không đọc/ghi file thật, không gọi mạng thật — chạy rất nhanh.
- **Integration test** (`tests/kb/integration/`) — kiểm tra ở mức "gần với thực tế" hơn:
  - Chạy thử CLI thật (như một chương trình con) với dữ liệu mock — kiểm tra đúng những gì người
    dùng thật sẽ thấy khi gõ lệnh.
  - Chạy thử CLI thật với `HTTPKBClient`, kèm theo một server KB thật được bật tạm riêng cho việc
    test (`helpers/fake-kb-server.ts`, dùng một cổng ngẫu nhiên để không đụng cổng `4000` bạn có
    thể đang dùng) — nhờ vậy kiểm tra được toàn bộ đường đi gọi HTTP thật, không giả lập bất kỳ
    phần nào.
  - Có riêng một bộ test cho việc chuyển đổi qua lại giữa mock và http bằng biến môi trường
    (`cli-kb-env-switch.test.ts`). Bộ test này còn tạo ra một "tài liệu đánh dấu" chỉ tồn tại trên
    server thật (không có bên mock) để chắc chắn 100% rằng CLI **thật sự** đang gọi qua HTTP, chứ
    không phải tình cờ hai bên có dữ liệu giống nhau nên trông như đúng.

Test sẽ luôn cho kết quả đúng dù file `.env` trên máy bạn đang để `mock` hay `http` — vì mỗi lần
chạy thử CLI bên trong test, giá trị `KB_CLIENT`/`KB_API_URL` đều được test tự đặt lại theo đúng ý
đồ của từng test, không phụ thuộc vào `.env` bạn đang dùng để test tay.

---

## 8. Các tình huống lỗi thường gặp

| Tình huống                                       | Chương trình sẽ làm gì                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Đặt `KB_CLIENT=http` nhưng quên điền `KB_API_URL` | Báo lỗi ngay khi vừa gõ lệnh, không chạy tiếp                                  |
| `KB_CLIENT` gõ sai chính tả (không phải `mock`/`http`) | Báo lỗi, nói rõ chỉ chấp nhận 2 giá trị `mock` hoặc `http`                |
| Server chưa bật, hoặc bật sai cổng                | Báo lỗi "Không kết nối được KB server…" (do máy không thấy ai đang lắng nghe ở địa chỉ đó) |
| Server có bật nhưng trả về lỗi (ví dụ thiếu dữ liệu bắt buộc) | CLI đọc thông điệp lỗi mà server trả về và hiện lại cho bạn thấy, kèm mã lỗi (ví dụ 400, 500) |
| `kb add` với `title` hoặc `nodePath` rỗng          | Báo lỗi, không tạo tài liệu mới (chặn từ cả phía CLI lẫn phía server)          |
| `kb retrieve` với `docId` không có thật            | Báo lỗi `not found` (không tìm thấy)                                          |

---

## 9. Cấu trúc file liên quan tới KB

```text
src/
├── clients/
│   ├── mock-kb-client.ts      # Cấp dữ liệu giả lập — 10 tài liệu mẫu, sống trong bộ nhớ
│   └── http-kb-client.ts      # Gọi ra server thật qua HTTP (dùng thư viện axios)
├── commands/kb/                # Nơi khai báo 4 lệnh kb search/list/retrieve/add cho CLI hiểu
├── models/kb/                  # Định nghĩa hình dạng dữ liệu: Document, SearchResult, KBClient
├── server/
│   ├── create-kb-server.ts     # Code server KB thật (viết bằng http thuần, không dùng framework)
│   ├── kb-seed-data.ts         # 10 tài liệu mẫu của server — cố tình khác hẳn bên mock
│   └── index.ts                # Điểm khởi động server (chạy bằng npm run kb-server)
├── services/kb/
│   ├── kb-service.ts           # Nơi xử lý nghiệp vụ: giới hạn top-k, kiểm tra dữ liệu, gọi client
│   └── kb-validation.ts        # Các hàm kiểm tra dữ liệu hợp lệ dùng riêng cho kb add
└── utils/apply-limit.ts        # Hàm dùng chung để giới hạn số lượng kết quả (kb search + kb list)

tests/kb/
├── unit/                        # Test logic kb-service với dữ liệu giả lập đơn giản
└── integration/                 # Test CLI thật (cả với mock lẫn với server HTTP thật)
```
