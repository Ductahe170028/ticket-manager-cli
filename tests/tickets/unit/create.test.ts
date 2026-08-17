/**
 * Unit test cho createTicketService.create.
 * Tên từng `it(...)` mô tả case đang kiểm — không cần comment lặp lại trong body.
 */
import { createTicketService } from "../../../src/services/tickets/ticket-service";
import { createInMemoryStore } from "./helpers/in-memory-store";

describe("createTicketService.create", () => {
  it("từ chối khi title trống", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(service.create({ title: "" })).rejects.toThrow(/title/i);
  });

  it("tạo được ticket khi title hợp lệ và có id TKT-001", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login" });

    expect(ticket.title).toBe("Bug login");
    expect(ticket.id).toBe("TKT-001");
  });

  it('không truyền description → lưu ""', async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login" });

    expect(ticket.description).toBe("");
  });

  it("không truyền status / priority → mặc định open / medium", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login" });

    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("medium");
  });

  it("title chỉ khoảng trắng → từ chối như trống", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(service.create({ title: "   " })).rejects.toThrow(/title/i);
  });

  it("tạo ticket thứ hai → id TKT-002", async () => {
    const service = createTicketService(createInMemoryStore());

    await service.create({ title: "First" });
    const second = await service.create({ title: "Second" });

    expect(second.id).toBe("TKT-002");
    expect(second.title).toBe("Second");
  });

  it("tags chữ hoa → lưu chữ thường", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login", tags: ["Bug", "UI"] });

    expect(ticket.tags).toEqual(["bug", "ui"]);
  });

  it("tags có khoảng trắng và trùng (hoa/thường) → trim + gộp một lần", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({
      title: "Bug login",
      tags: [" Bug ", "bug", "Bug", "  UI  "],
    });

    expect(ticket.tags).toEqual(["bug", "ui"]);
  });

  it("status chữ hoa / có khoảng trắng → chuẩn hóa rồi nhận", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login", status: " Open " });

    expect(ticket.status).toBe("open");
  });

  it("priority chữ hoa → chuẩn hóa rồi nhận", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({ title: "Bug login", priority: "HIGH" });

    expect(ticket.priority).toBe("high");
  });

  it("status ngoài danh sách → từ chối", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(
      service.create({ title: "Bug login", status: "xyz" })
    ).rejects.toThrow(/status/i);
  });

  it("priority ngoài danh sách → từ chối", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(
      service.create({ title: "Bug login", priority: "urgent" })
    ).rejects.toThrow(/priority/i);
  });

  it("happy path đủ field → lưu đúng toàn bộ (sau chuẩn hóa)", async () => {
    const service = createTicketService(createInMemoryStore());

    const ticket = await service.create({
      title: "Bug login",
      description: "Không vào được trang login",
      status: "In_Progress",
      priority: "HIGH",
      tags: [" Bug ", "bug", "UI"],
    });

    expect(ticket).toEqual({
      id: "TKT-001",
      title: "Bug login",
      description: "Không vào được trang login",
      status: "in_progress",
      priority: "high",
      tags: ["bug", "ui"],
    });
  });
});
