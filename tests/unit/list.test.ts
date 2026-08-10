/**
 * Unit test cho createTicketService.list.
 * Rule: nhiều loại filter = AND; nhiều tags = AND;
 * status/priority không hợp lệ → [].
 */
import { createTicketService } from "../../src/services/ticket-service";
import { createInMemoryStore } from "./helpers/in-memory-store";

describe("createTicketService.list", () => {
  it("kho trống → trả []", async () => {
    const service = createTicketService(createInMemoryStore());

    await expect(service.list()).resolves.toEqual([]);
  });

  it("đã có ticket → trả đúng toàn bộ", async () => {
    const service = createTicketService(createInMemoryStore());
    const a = await service.create({ title: "First" });
    const b = await service.create({ title: "Second" });

    const listed = await service.list();

    expect(listed).toEqual([a, b]);
  });

  it("không truyền filter / filter rỗng → hiện tất cả", async () => {
    const service = createTicketService(createInMemoryStore());
    const a = await service.create({ title: "First" });
    const b = await service.create({ title: "Second" });

    await expect(service.list()).resolves.toEqual([a, b]);
    await expect(service.list({})).resolves.toEqual([a, b]);
  });

  it("lọc status → chỉ ticket đúng status", async () => {
    const service = createTicketService(createInMemoryStore());
    const open = await service.create({ title: "Open one", status: "open" });
    await service.create({ title: "Done one", status: "done" });

    const listed = await service.list({ status: "open" });

    expect(listed).toEqual([open]);
  });

  it("lọc priority → chỉ ticket đúng priority", async () => {
    const service = createTicketService(createInMemoryStore());
    const high = await service.create({ title: "High one", priority: "high" });
    await service.create({ title: "Low one", priority: "low" });

    const listed = await service.list({ priority: "high" });

    expect(listed).toEqual([high]);
  });

  it("lọc một tag → ticket có tag đó", async () => {
    const service = createTicketService(createInMemoryStore());
    const withBug = await service.create({
      title: "Has bug",
      tags: ["bug", "ui"],
    });
    await service.create({ title: "No bug", tags: ["ui"] });

    const listed = await service.list({ tags: ["bug"] });

    expect(listed).toEqual([withBug]);
  });

  it("lọc nhiều tags → AND (phải có đủ mọi tag)", async () => {
    const service = createTicketService(createInMemoryStore());
    const both = await service.create({
      title: "Bug and ui",
      tags: ["bug", "ui"],
    });
    await service.create({ title: "Only bug", tags: ["bug"] });
    await service.create({ title: "Only ui", tags: ["ui"] });

    const listed = await service.list({ tags: ["bug", "ui"] });

    expect(listed).toEqual([both]);
  });

  it("status + priority → AND giữa các loại filter", async () => {
    const service = createTicketService(createInMemoryStore());
    const match = await service.create({
      title: "Open high",
      status: "open",
      priority: "high",
    });
    await service.create({
      title: "Open low",
      status: "open",
      priority: "low",
    });
    await service.create({
      title: "Done high",
      status: "done",
      priority: "high",
    });

    const listed = await service.list({ status: "open", priority: "high" });

    expect(listed).toEqual([match]);
  });

  it("filter hợp lệ nhưng không khớp ai → []", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Open", status: "open" });

    const listed = await service.list({ status: "done" });

    expect(listed).toEqual([]);
  });

  it("status không hợp lệ → []", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Open", status: "open" });

    const listed = await service.list({ status: "not-a-status" });

    expect(listed).toEqual([]);
  });

  it("priority không hợp lệ → []", async () => {
    const service = createTicketService(createInMemoryStore());
    await service.create({ title: "Normal", priority: "medium" });

    const listed = await service.list({ priority: "not-a-priority" });

    expect(listed).toEqual([]);
  });
});
