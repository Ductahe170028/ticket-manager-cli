/**
 * Integration test cho JsonTicketStore (đọc/ghi file JSON thật).
 */
import * as fs from "fs/promises";
import type { Ticket } from "../../../src/models/tickets/ticket";
import { createJsonTicketStore } from "../../../src/storage/json-ticket-store";
import { withTempTicketsFile } from "../../helpers/run-cli";

const sampleTicket: Ticket = {
  id: "TKT-001",
  title: "Bug login",
  description: "",
  status: "open",
  priority: "medium",
  tags: ["bug"],
};

describe("createJsonTicketStore", () => {
  it("save rồi load → đọc lại đúng danh sách đã ghi", async () => {
    await withTempTicketsFile(async (filePath) => {
      const store = createJsonTicketStore(filePath);

      await store.save([sampleTicket]);
      const loaded = await store.load();

      expect(loaded).toEqual([sampleTicket]);
    }, "tickets-store-");
  });

  it("file chưa tồn tại → load trả về mảng rỗng", async () => {
    await withTempTicketsFile(async (filePath) => {
      const store = createJsonTicketStore(filePath);

      const loaded = await store.load();

      expect(loaded).toEqual([]);
    }, "tickets-store-");
  });

  it("file JSON hỏng → load báo lỗi rõ", async () => {
    await withTempTicketsFile(async (filePath) => {
      await fs.writeFile(filePath, "{ not-valid-json", "utf8");
      const store = createJsonTicketStore(filePath);

      await expect(store.load()).rejects.toThrow(/corrupt|invalid|parse/i);
    }, "tickets-store-");
  });
});
