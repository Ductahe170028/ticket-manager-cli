/**
 * Unit test cho kb-service.list — case C1-C4 (xem docs/plans/week-3/tasks.vi.md).
 * Dùng FakeKBClient — không đụng MockKBClient/HTTPKBClient thật.
 */
import { createKbService } from "../../../src/services/kb/kb-service";
import { createFakeKBClient } from "./helpers/fake-kb-client";
import type { Document } from "../../../src/models/kb/document";

describe("createKbService.list", () => {
  it("C1: --node có document -> trả đúng danh sách từ KBClient cho đúng nodePath", async () => {
    const docs: Document[] = [
      {
        id: "doc-001",
        title: "A",
        content: "nội dung A",
        nodePath: "/templates/email",
        tags: [],
      },
    ];
    const client = createFakeKBClient([], docs);
    const service = createKbService(client);

    const results = await service.list("/templates/email");

    expect(results).toEqual(docs);
    expect(client.lastListCall).toEqual({ nodePath: "/templates/email", limit: undefined });
  });

  it("C2: KBClient không có document nào trong node -> trả mảng rỗng, không lỗi", async () => {
    const client = createFakeKBClient([], []);
    const service = createKbService(client);

    const results = await service.list("/khong-ton-tai");

    expect(results).toEqual([]);
  });

  it("C3: không truyền nodePath -> chuyển undefined cho KBClient (liệt kê toàn bộ)", async () => {
    const docs: Document[] = [
      { id: "doc-001", title: "A", content: "a", nodePath: "/x", tags: [] },
      { id: "doc-002", title: "B", content: "b", nodePath: "/y", tags: [] },
    ];
    const client = createFakeKBClient([], docs);
    const service = createKbService(client);

    const results = await service.list();

    expect(results).toEqual(docs);
    expect(client.lastListCall).toEqual({ nodePath: undefined, limit: undefined });
  });

  it("C4: KBClient trả nhiều hơn limit -> kb-service tự giới hạn đúng limit", async () => {
    const docs: Document[] = [
      { id: "doc-001", title: "A", content: "a", nodePath: "/x", tags: [] },
      { id: "doc-002", title: "B", content: "b", nodePath: "/x", tags: [] },
      { id: "doc-003", title: "C", content: "c", nodePath: "/x", tags: [] },
    ];
    const client = createFakeKBClient([], docs);
    const service = createKbService(client);

    const results = await service.list("/x", 2);

    expect(results).toEqual(docs.slice(0, 2));
  });
});
