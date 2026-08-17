/**
 * Unit test cho kb-service.search — case B1 (xem docs/plans/week-3/tasks.vi.md).
 * Dùng FakeKBClient — không đụng MockKBClient/HTTPKBClient thật.
 */
import { createKbService } from "../../../src/services/kb/kb-service";
import { createFakeKBClient } from "./helpers/fake-kb-client";
import type { SearchResult } from "../../../src/models/kb/document";

describe("createKbService.search", () => {
  it("B1: từ khóa khớp title/content -> trả đúng danh sách kết quả từ KBClient", async () => {
    const expected: SearchResult[] = [
      {
        document: { id: "doc-002", title: "Refund Request Reply", nodePath: "/templates/email" },
        matchType: "title",
      },
    ];
    const client = createFakeKBClient(expected);
    const service = createKbService(client);

    const results = await service.search("refund");

    expect(results).toEqual(expected);
    expect(client.lastSearchCall).toEqual({ query: "refund", topK: undefined });
  });

  it("B2: KBClient không tìm thấy gì -> kb-service trả mảng rỗng, không lỗi", async () => {
    const client = createFakeKBClient([]);
    const service = createKbService(client);

    const results = await service.search("khong-ton-tai-xyz");

    expect(results).toEqual([]);
  });

  it("B3: KBClient trả nhiều hơn topK -> kb-service tự giới hạn đúng topK", async () => {
    const threeResults: SearchResult[] = [
      { document: { id: "doc-001", title: "A", nodePath: "/x" } },
      { document: { id: "doc-002", title: "B", nodePath: "/x" } },
      { document: { id: "doc-003", title: "C", nodePath: "/x" } },
    ];
    const client = createFakeKBClient(threeResults);
    const service = createKbService(client);

    const results = await service.search("x", 2);

    expect(results).toHaveLength(2);
    expect(results).toEqual(threeResults.slice(0, 2));
  });
});
