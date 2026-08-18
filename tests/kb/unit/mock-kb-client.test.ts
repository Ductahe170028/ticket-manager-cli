/**
 * Unit test cho MockKBClient.search — case B4 (xem docs/plans/week-3/tasks.vi.md).
 * Test trực tiếp MockKBClient (không qua kb-service) với 3 doc mẫu đã chốt
 * (docs/plans/week-3/decisions.vi.md mục 4).
 */
import { createMockKbClient, SEED_DOCUMENTS } from "../../../src/clients/mock-kb-client";

describe("createMockKbClient.search", () => {
  it("B4: từ khóa khớp title -> trả đúng document (doc-002 'refund')", async () => {
    const client = createMockKbClient();

    const results = await client.search("refund");

    expect(results).toHaveLength(1);
    expect(results[0].document.id).toBe("doc-002");
    expect(results[0].matchType).toBe("title");
  });

  it("B4: từ khóa chỉ có trong content (không có trong title) -> vẫn tìm ra document", async () => {
    const client = createMockKbClient();

    const results = await client.search("mã đơn hàng");

    expect(results).toHaveLength(1);
    expect(results[0].document.id).toBe("doc-002");
    expect(results[0].matchType).toBe("content");
  });

  it("B4: từ khóa không khớp gì -> trả mảng rỗng, không lỗi", async () => {
    const client = createMockKbClient();

    const results = await client.search("khong-ton-tai-xyz");

    expect(results).toEqual([]);
  });

  it("B4: topK giới hạn đúng số lượng kết quả trả về (2 doc cùng khớp 'chúng tôi', topK=1)", async () => {
    const client = createMockKbClient();

    const all = await client.search("chúng tôi");
    const limited = await client.search("chúng tôi", 1);

    expect(all.length).toBeGreaterThan(1);
    expect(limited).toHaveLength(1);
  });
});

describe("createMockKbClient.list", () => {
  it("C: nodePath có document -> trả đúng danh sách trong node đó", async () => {
    const client = createMockKbClient();
    const expectedIds = SEED_DOCUMENTS.filter((d) => d.nodePath === "/templates/email").map(
      (d) => d.id
    );

    const results = await client.list("/templates/email");

    expect(results.map((d) => d.id)).toEqual(expectedIds);
  });

  it("C: nodePath không có document nào -> trả mảng rỗng, không lỗi", async () => {
    const client = createMockKbClient();

    const results = await client.list("/khong-ton-tai");

    expect(results).toEqual([]);
  });

  it("C: không truyền nodePath -> liệt kê toàn bộ document mẫu hiện có", async () => {
    const client = createMockKbClient();

    const results = await client.list();

    expect(results).toHaveLength(SEED_DOCUMENTS.length);
  });

  it("C: limit giới hạn đúng số lượng kết quả trả về", async () => {
    const client = createMockKbClient();

    const results = await client.list(undefined, 1);

    expect(results).toHaveLength(1);
  });

  it("C: nodePath + limit dùng cùng lúc -> lọc đúng node rồi mới giới hạn đúng limit", async () => {
    const client = createMockKbClient();
    const firstExpectedId = SEED_DOCUMENTS.filter((d) => d.nodePath === "/templates/email")[0].id;

    const results = await client.list("/templates/email", 1);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(firstExpectedId);
  });
});

describe("createMockKbClient.retrieve", () => {
  it("D: docId tồn tại -> trả đúng document đầy đủ (title, content, nodePath, tags)", async () => {
    const client = createMockKbClient();

    const result = await client.retrieve("doc-002");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("doc-002");
    expect(result?.title).toBe("Refund Request Reply");
    expect(result?.nodePath).toBe("/templates/email");
    expect(result?.tags).toEqual(["template", "email", "refund"]);
    expect(result?.content).toContain("hoàn tiền");
  });

  it("D: docId không tồn tại -> trả null, không throw", async () => {
    const client = createMockKbClient();

    const result = await client.retrieve("doc-khong-ton-tai");

    expect(result).toBeNull();
  });
});
