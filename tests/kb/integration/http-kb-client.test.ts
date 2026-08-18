/**
 * Integration: HTTPKBClient — case F1-F6 (xem docs/plans/week-3/tasks.vi.md).
 * F1-F4 dùng fake server thật (createKbServer, cùng logic với src/server/index.ts —
 * xem decisions.vi.md mục 9) chạy ở cổng ngẫu nhiên — không mock axios, đi qua HTTP thật.
 * F5-F6 dùng server "hỏng" riêng (broken-http-server.ts) hoặc cổng không ai nghe,
 * để mô phỏng đúng tình huống lỗi cần kiểm.
 */
import { createHttpKbClient } from "../../../src/clients/http-kb-client";
import type { Document } from "../../../src/models/kb/document";
import { SEED_DOCUMENTS } from "../../../src/server/kb-seed-data";
import { startFakeKbServer } from "./helpers/fake-kb-server";
import { startBrokenServer } from "./helpers/broken-http-server";

describe("HTTPKBClient — F1: search()", () => {
  let server: Awaited<ReturnType<typeof startFakeKbServer>>;

  beforeAll(async () => {
    server = await startFakeKbServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("F1: gửi đúng POST /search, tìm khớp title/content và parse response đúng", async () => {
    const client = createHttpKbClient(server.url);

    const results = await client.search("refund");

    expect(results).toHaveLength(1);
    expect(results[0].document.id).toBe("doc-002");
  });

  it("F1: topK giới hạn đúng số lượng kết quả trả về", async () => {
    const client = createHttpKbClient(server.url);

    const results = await client.search("chúng tôi", 1);

    expect(results).toHaveLength(1);
  });

  it("F1: không khớp gì -> trả mảng rỗng, không lỗi", async () => {
    const client = createHttpKbClient(server.url);

    const results = await client.search("từ-khóa-không-tồn-tại-xyz");

    expect(results).toEqual([]);
  });
});

describe("HTTPKBClient — F2: list()", () => {
  let server: Awaited<ReturnType<typeof startFakeKbServer>>;

  beforeAll(async () => {
    server = await startFakeKbServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("F2: gửi đúng POST /list với nodePath -> chỉ trả document đúng node đó", async () => {
    const client = createHttpKbClient(server.url);
    const expectedIds = SEED_DOCUMENTS.filter((d) => d.nodePath === "/templates/email").map(
      (d) => d.id
    );

    const results: Document[] = await client.list("/templates/email");

    expect(results.map((d) => d.id).sort()).toEqual(expectedIds.sort());
  });

  it("F2: không truyền nodePath -> trả toàn bộ document", async () => {
    const client = createHttpKbClient(server.url);

    const results = await client.list();

    expect(results).toHaveLength(SEED_DOCUMENTS.length);
  });

  it("F2: limit giới hạn đúng số lượng", async () => {
    const client = createHttpKbClient(server.url);

    const results = await client.list(undefined, 2);

    expect(results).toHaveLength(2);
  });
});

describe("HTTPKBClient — F3: retrieve()", () => {
  let server: Awaited<ReturnType<typeof startFakeKbServer>>;

  beforeAll(async () => {
    server = await startFakeKbServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("F3: gửi đúng POST /retrieve, docId tồn tại -> trả đúng document đầy đủ", async () => {
    const client = createHttpKbClient(server.url);
    const expected = SEED_DOCUMENTS.find((d) => d.id === "doc-001");

    const result = await client.retrieve("doc-001");

    expect(result).toEqual(expected);
  });

  it("F3: docId không tồn tại -> trả null (không throw ở tầng client)", async () => {
    const client = createHttpKbClient(server.url);

    const result = await client.retrieve("doc-khong-ton-tai");

    expect(result).toBeNull();
  });
});

describe("HTTPKBClient — F4: add()", () => {
  let server: Awaited<ReturnType<typeof startFakeKbServer>>;

  beforeAll(async () => {
    server = await startFakeKbServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("F4: gửi đúng POST /add với đủ field -> tạo document mới, có id mới", async () => {
    const client = createHttpKbClient(server.url);
    const existingIds = SEED_DOCUMENTS.map((d) => d.id);

    const created = await client.add({
      title: "New Doc via HTTP",
      content: "nội dung mới qua HTTP",
      nodePath: "/new/node",
      tags: ["a", "b"],
    });

    expect(created.id).toBeTruthy();
    expect(existingIds).not.toContain(created.id);
    expect(created.title).toBe("New Doc via HTTP");
    expect(created.tags).toEqual(["a", "b"]);
  });

  it("F4: document vừa add() lấy lại được bằng retrieve() (cùng phiên server)", async () => {
    const client = createHttpKbClient(server.url);

    const created = await client.add({
      title: "Retrievable Doc",
      content: "nội dung",
      nodePath: "/new/node",
      tags: [],
    });
    const found = await client.retrieve(created.id);

    expect(found).toEqual(created);
  });
});

describe("HTTPKBClient — F5: server trả lỗi (4xx/5xx)", () => {
  it("F5: server trả 500 -> HTTPKBClient báo lỗi có kiểm soát, không crash", async () => {
    const broken = await startBrokenServer(500, "internal error");
    try {
      const client = createHttpKbClient(broken.url);

      await expect(client.search("refund")).rejects.toThrow(/500|server/i);
    } finally {
      await broken.close();
    }
  });

  it("F5: server trả 404 -> HTTPKBClient báo lỗi có kiểm soát, không crash", async () => {
    const broken = await startBrokenServer(404, "not found");
    try {
      const client = createHttpKbClient(broken.url);

      await expect(client.list()).rejects.toThrow(/404|server/i);
    } finally {
      await broken.close();
    }
  });
});

describe("HTTPKBClient — F6: mất mạng / response không phải JSON hợp lệ", () => {
  it("F6: không kết nối được server (sai URL/mất mạng) -> báo lỗi rõ, không crash", async () => {
    // Cổng 1 gần như chắc chắn không có gì lắng nghe -> mô phỏng mất mạng / server sập.
    const client = createHttpKbClient("http://127.0.0.1:1");

    await expect(client.search("refund")).rejects.toThrow();
  });

  it("F6: response không phải JSON hợp lệ -> báo lỗi rõ, không crash", async () => {
    const broken = await startBrokenServer(200, "<html>không phải JSON</html>");
    try {
      const client = createHttpKbClient(broken.url);

      await expect(client.search("refund")).rejects.toThrow();
    } finally {
      await broken.close();
    }
  });
});
