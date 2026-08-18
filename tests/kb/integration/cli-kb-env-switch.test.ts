/**
 * Integration: CLI chuyển đổi KBClient qua biến môi trường KB_CLIENT/KB_API_URL — case G1-G3
 * (xem docs/plans/week-3/tasks.vi.md). Chạy `tickets` thật (qua run-cli.ts), không import
 * trực tiếp index.ts — đúng hành vi thật khi người dùng gõ lệnh với biến môi trường khác nhau.
 *
 * Truyền `""` (rỗng) cho key muốn coi là "chưa set" — vì dotenv (đọc từ .env của máy) không
 * ghi đè biến đã có mặt trong env của tiến trình con, nên key rỗng vẫn thắng .env, đảm bảo
 * test không bị ảnh hưởng bởi nội dung .env thật trên máy chạy test.
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";
import { startFakeKbServer } from "./helpers/fake-kb-server";
import { createHttpKbClient } from "../../../src/clients/http-kb-client";

describe("CLI — chuyển đổi KBClient qua biến môi trường (Module G)", () => {
  it("G1: KB_CLIENT rỗng/không set -> dùng MockKBClient (thấy đúng document mẫu)", async () => {
    await withTempTicketsFile(async (ticketsPath) => {
      const result = await runTickets(["kb", "retrieve", "doc-001"], ticketsPath, {
        KB_CLIENT: "",
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/Customer Response Template/);
    });
  });

  it("G1: KB_CLIENT=mock -> dùng MockKBClient", async () => {
    await withTempTicketsFile(async (ticketsPath) => {
      const result = await runTickets(["kb", "retrieve", "doc-001"], ticketsPath, {
        KB_CLIENT: "mock",
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/Customer Response Template/);
    });
  });

  it("G2: KB_CLIENT=http + KB_API_URL hợp lệ -> CLI thực sự gọi qua HTTPKBClient tới server đó (không phải Mock)", async () => {
    // Chèn 1 document "đánh dấu" thẳng vào fake server (không qua CLI) — MockKBClient của
    // tiến trình CLI (nếu lỡ vẫn được dùng do env chưa gắn đúng) không thể nào biết doc này,
    // vì nó chỉ tồn tại trong bộ nhớ của fake server. Nhờ vậy test phân biệt được rõ CLI có
    // thực sự đi qua HTTPKBClient/server hay đang âm thầm dùng Mock — tránh xanh giả (2 nguồn
    // seed data giống nhau nên nếu chỉ search "refund" thì Mock cũng ra kết quả tương tự).
    const server = await startFakeKbServer();
    try {
      const seedingClient = createHttpKbClient(server.url);
      const marker = await seedingClient.add({
        title: "G2 Marker Doc — chỉ có trên fake server",
        content: "nội dung đánh dấu, không tồn tại ở MockKBClient",
        nodePath: "/g2-marker",
        tags: [],
      });

      await withTempTicketsFile(async (ticketsPath) => {
        const result = await runTickets(["kb", "retrieve", marker.id], ticketsPath, {
          KB_CLIENT: "http",
          KB_API_URL: server.url,
        });

        expect(result.code).toBe(0);
        expect(result.stdout).toMatch(/G2 Marker Doc/);
      });
    } finally {
      await server.close();
    }
  });

  it("G2 (đối chứng): cùng docId đánh dấu nhưng KB_CLIENT=mock -> không tìm thấy (chứng minh 2 nguồn dữ liệu tách biệt)", async () => {
    const server = await startFakeKbServer();
    try {
      const seedingClient = createHttpKbClient(server.url);
      const marker = await seedingClient.add({
        title: "G2 Marker Doc — chỉ có trên fake server",
        content: "nội dung đánh dấu",
        nodePath: "/g2-marker",
        tags: [],
      });

      await withTempTicketsFile(async (ticketsPath) => {
        const result = await runTickets(["kb", "retrieve", marker.id], ticketsPath, {
          KB_CLIENT: "mock",
        });

        expect(result.code).not.toBe(0);
      });
    } finally {
      await server.close();
    }
  });

  it("G3: KB_CLIENT=http nhưng thiếu KB_API_URL -> báo lỗi rõ lúc khởi động, exit khác 0, không crash mập mờ", async () => {
    await withTempTicketsFile(async (ticketsPath) => {
      const result = await runTickets(["kb", "search", "refund"], ticketsPath, {
        KB_CLIENT: "http",
        KB_API_URL: "",
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/KB_API_URL/i);
    });
  });
});
