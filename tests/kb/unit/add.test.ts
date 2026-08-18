/**
 * Unit test cho kb-service.add — case E5 (chuẩn hóa tags) + hành vi chuyển tiếp cơ bản
 * (xem docs/plans/week-3/tasks.vi.md). Dùng FakeKBClient — không đụng file/CLient thật.
 * Việc đọc --file thật và validate file tồn tại nằm ở tầng CLI (case E1-E4), không test ở đây.
 */
import { createKbService } from "../../../src/services/kb/kb-service";
import { createFakeKBClient } from "./helpers/fake-kb-client";
import type { Document } from "../../../src/models/kb/document";

describe("createKbService.add", () => {
  it("E5: tags có khoảng trắng/hoa/trùng -> kb-service chuẩn hóa trước khi gửi cho KBClient", async () => {
    const client = createFakeKBClient();
    const service = createKbService(client);

    await service.add({
      title: "Note",
      content: "nội dung",
      nodePath: "/x",
      tags: [" Bug ", "BUG", "ui", "UI "],
    });

    expect(client.lastAddCall?.tags).toEqual(["bug", "ui"]);
  });

  it("E5: không truyền tags -> kb-service mặc định mảng rỗng", async () => {
    const client = createFakeKBClient();
    const service = createKbService(client);

    await service.add({ title: "Note", content: "nội dung", nodePath: "/x" });

    expect(client.lastAddCall?.tags).toEqual([]);
  });

  it("chuyển tiếp đúng title/content/nodePath cho KBClient, không tự sửa đổi", async () => {
    const client = createFakeKBClient();
    const service = createKbService(client);

    await service.add({
      title: "Onboarding Guide",
      content: "nội dung đầy đủ",
      nodePath: "/docs/onboarding",
      tags: ["a"],
    });

    expect(client.lastAddCall).toEqual({
      title: "Onboarding Guide",
      content: "nội dung đầy đủ",
      nodePath: "/docs/onboarding",
      tags: ["a"],
    });
  });

  it("trả đúng document mà KBClient.add() tạo ra (bao gồm id mới)", async () => {
    const created: Document = {
      id: "doc-011",
      title: "Note",
      content: "nội dung",
      nodePath: "/x",
      tags: ["bug"],
    };
    const client = createFakeKBClient([], [], null, created);
    const service = createKbService(client);

    const result = await service.add({
      title: "Note",
      content: "nội dung",
      nodePath: "/x",
      tags: ["bug"],
    });

    expect(result).toEqual(created);
  });

  it("title chỉ toàn khoảng trắng -> kb-service báo lỗi, không gọi KBClient.add()", async () => {
    const client = createFakeKBClient();
    const service = createKbService(client);

    await expect(
      service.add({ title: "   ", content: "nội dung", nodePath: "/x" })
    ).rejects.toThrow(/title/i);
    expect(client.lastAddCall).toBeNull();
  });

  it("nodePath chỉ toàn khoảng trắng -> kb-service báo lỗi, không gọi KBClient.add()", async () => {
    const client = createFakeKBClient();
    const service = createKbService(client);

    await expect(
      service.add({ title: "Note", content: "nội dung", nodePath: "   " })
    ).rejects.toThrow(/nodePath/i);
    expect(client.lastAddCall).toBeNull();
  });
});
