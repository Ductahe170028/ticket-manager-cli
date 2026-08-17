/**
 * Unit test cho MockKBClient.search — case B4 (xem docs/plans/week-3/tasks.vi.md).
 * Test trực tiếp MockKBClient (không qua kb-service) với 3 doc mẫu đã chốt
 * (docs/plans/week-3/decisions.vi.md mục 4).
 */
import { createMockKbClient } from "../../../src/clients/mock-kb-client";

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
