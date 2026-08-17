/**
 * Unit test cho createTicketService.updateStatus.
 * Chỉ đổi status (ghi đè); chuẩn hóa hoa/thường + trim.
 */
import { createTicketService } from "../../../src/services/tickets/ticket-service";
import { createInMemoryStore } from "./helpers/in-memory-store";

describe("createTicketService.updateStatus", () => {
  it("đổi status hợp lệ → status mới; field khác không đổi", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({
      title: "Bug login",
      description: "chi tiết",
      status: "open",
      priority: "high",
      tags: ["bug", "auth"],
    });

    const updated = await service.updateStatus(created.id, "done");

    expect(updated.status).toBe("done");
    expect(updated.title).toBe("Bug login");
    expect(updated.description).toBe("chi tiết");
    expect(updated.priority).toBe("high");
    expect(updated.tags).toEqual(["bug", "auth"]);
    expect(updated.id).toBe(created.id);
  });

  it("sau update → show thấy status đã ghi đè", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Bug login", status: "open" });

    await service.updateStatus(created.id, "in_progress");
    const shown = await service.show(created.id);

    expect(shown.status).toBe("in_progress");
  });

  it("id không tồn tại → not found", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Exists" });

    await expect(service.updateStatus("TKT-999", "done")).rejects.toThrow(
      /not found/i
    );
  });

  it("status không hợp lệ → từ chối", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Exists" });

    await expect(
      service.updateStatus(created.id, "nope" as "open")
    ).rejects.toThrow(/invalid status/i);
  });

  it("id trống / khoảng trắng → lỗi input", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(service.updateStatus("", "done")).rejects.toThrow(
      /invalid|id|required/i
    );
    await expect(service.updateStatus("   ", "done")).rejects.toThrow(
      /invalid|id|required/i
    );
  });

  it("id sai format → lỗi input", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Exists" });

    await expect(service.updateStatus("abc", "done")).rejects.toThrow(
      /invalid|id/i
    );
  });

  it("chuẩn hóa hoa/thường: Done / OPEN → done / open", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Bug", status: "open" });

    const toDone = await service.updateStatus(created.id, "Done" as "done");
    expect(toDone.status).toBe("done");

    const toOpen = await service.updateStatus(created.id, "OPEN" as "open");
    expect(toOpen.status).toBe("open");
  });

  it('status có khoảng trắng " done " → trim thành done', async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Bug", status: "open" });

    const updated = await service.updateStatus(
      created.id,
      " done " as "done"
    );

    expect(updated.status).toBe("done");
  });

  it("đổi status 2 lần trên cùng ticket → lần cuối đúng", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Bug", status: "open" });

    await service.updateStatus(created.id, "in_progress");
    const updated = await service.updateStatus(created.id, "done");

    expect(updated.status).toBe("done");
    expect((await service.show(created.id)).status).toBe("done");
  });

  it("đổi sang cùng status hiện tại → vẫn thành công", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({ title: "Bug", status: "open" });

    const updated = await service.updateStatus(created.id, "open");

    expect(updated.status).toBe("open");
  });

  it("update ticket A không đổi status ticket B", async () => {
    const service = createTicketService(createInMemoryStore());
    const a = await service.create({ title: "A", status: "open" });
    const b = await service.create({ title: "B", status: "open" });

    await service.updateStatus(a.id, "done");

    expect((await service.show(a.id)).status).toBe("done");
    expect((await service.show(b.id)).status).toBe("open");
  });
});
