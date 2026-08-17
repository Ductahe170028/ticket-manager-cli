/**
 * Integration: createTicketService + JsonTicketStore (file JSON thật).
 * Case B3: tạo xong → có trong file JSON.
 */
import * as fs from "fs/promises";
import { createTicketService } from "../../../src/services/tickets/ticket-service";
import { createJsonTicketStore } from "../../../src/storage/json-ticket-store";
import { withTempTicketsFile } from "../../helpers/run-cli";

describe("create với JsonTicketStore", () => {
  it("tạo xong → load từ store thấy ticket vừa tạo", async () => {
    await withTempTicketsFile(async (filePath) => {
      const store = createJsonTicketStore(filePath);
      const service = createTicketService(store);

      const created = await service.create({ title: "Bug login" });
      const loaded = await store.load();

      expect(loaded).toHaveLength(1);
      expect(loaded[0]).toEqual(created);
      expect(created.id).toBe("TKT-001");
    }, "tickets-create-");
  });

  it("tạo xong → nội dung file JSON chứa ticket đó", async () => {
    await withTempTicketsFile(async (filePath) => {
      const store = createJsonTicketStore(filePath);
      const service = createTicketService(store);

      const created = await service.create({
        title: "Bug login",
        tags: ["Bug"],
      });

      const raw = await fs.readFile(filePath, "utf8");
      const fromFile = JSON.parse(raw);

      expect(fromFile).toEqual([created]);
    }, "tickets-create-");
  });
});
