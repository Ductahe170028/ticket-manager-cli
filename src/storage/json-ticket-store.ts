import * as fs from "fs/promises";
import * as path from "path";
import type { Ticket } from "../models/tickets/ticket";
import type { TicketStore } from "../models/tickets/ticket-store";

/**
 * Tạo kho lưu ticket bằng một file JSON (mảng).
 * Style: factory function — không dùng class.
 */
export function createJsonTicketStore(filePath: string): TicketStore {
  /** Đảm bảo thư mục chứa file JSON đã tồn tại. */
  async function ensureParentDir(): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }

  return {
    /**
     * Đọc ticket từ file JSON.
     * File chưa có → []; JSON hỏng → lỗi có chữ invalid/parse/corrupt.
     */
    async load(): Promise<Ticket[]> {
      let raw: string;
      try {
        raw = await fs.readFile(filePath, "utf8");
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === "ENOENT") {
          return [];
        }
        throw err;
      }

      try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          throw new Error("invalid tickets JSON: expected an array");
        }
        return parsed as Ticket[];
      } catch (err) {
        if (err instanceof Error && /invalid tickets JSON/i.test(err.message)) {
          throw err;
        }
        throw new Error("corrupt or invalid JSON: cannot parse tickets file");
      }
    },

    /** Ghi danh sách ticket ra file JSON. */
    async save(tickets: Ticket[]): Promise<void> {
      await ensureParentDir();
      await fs.writeFile(filePath, JSON.stringify(tickets, null, 2), "utf8");
    },
  };
}
