/**
 * Unit test cho createTicketService.show.
 * D1–D3: id tồn tại; không tìm thấy; id trống / sai format → lỗi input.
 */
import { createTicketService } from "../../src/services/ticket-service";
import { createInMemoryStore } from "./helpers/in-memory-store";

describe("createTicketService.show", () => {
  it("id tồn tại → trả đúng ticket", async () => {
    const service = createTicketService(createInMemoryStore());
    const created = await service.create({
      title: "Bug login",
      description: "chi tiết",
      status: "open",
      priority: "high",
      tags: ["bug"],
    });

    const shown = await service.show(created.id);

    expect(shown).toEqual(created);
  });

  it("id không có trong kho → lỗi not found", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Exists" });

    await expect(service.show("TKT-999")).rejects.toThrow(/not found/i);
  });

  it("id trống / khoảng trắng → lỗi input", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(service.show("")).rejects.toThrow(/invalid|id|required/i);
    await expect(service.show("   ")).rejects.toThrow(/invalid|id|required/i);
  });

  it("id sai format → lỗi input", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Exists" });

    await expect(service.show("abc")).rejects.toThrow(/invalid|id/i);
    await expect(service.show("TKT-")).rejects.toThrow(/invalid|id/i);
  });
});
