/**
 * Unit test cho kb-service.retrieve — case D1-D2 (xem docs/plans/week-3/tasks.vi.md).
 * Dùng FakeKBClient — không đụng MockKBClient/HTTPKBClient thật.
 */
import { createKbService } from "../../../src/services/kb/kb-service";
import { createFakeKBClient } from "./helpers/fake-kb-client";
import type { Document } from "../../../src/models/kb/document";

describe("createKbService.retrieve", () => {
  it("D1: docId tồn tại -> trả đúng document đầy đủ (title, content, nodePath, tags) từ KBClient", async () => {
    const doc: Document = {
      id: "doc-001",
      title: "Customer Response Template",
      content: "Nội dung đầy đủ của document",
      nodePath: "/templates/email",
      tags: ["template", "email"],
    };
    const client = createFakeKBClient([], [], doc);
    const service = createKbService(client);

    const result = await service.retrieve("doc-001");

    expect(result).toEqual(doc);
    expect(client.lastRetrieveCall).toBe("doc-001");
  });

  it("D2: docId không tồn tại (KBClient trả null) -> kb-service báo lỗi 'not found', không crash chương trình", async () => {
    const client = createFakeKBClient([], [], null);
    const service = createKbService(client);

    await expect(service.retrieve("doc-khong-ton-tai")).rejects.toThrow(/not found/i);
  });
});
