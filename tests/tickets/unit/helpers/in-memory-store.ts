import type { Ticket } from "../../../../src/models/tickets/ticket";
import type { TicketStore } from "../../../../src/models/tickets/ticket-store";

/**
 * Tạo kho giả trong bộ nhớ cho unit test (không đụng file JSON thật).
 * `initial` — danh sách ticket có sẵn khi bắt đầu test (mặc định rỗng).
 */
export function createInMemoryStore(initial: Ticket[] = []): TicketStore {
  let tickets = [...initial];
  return {
    /** Trả về bản sao danh sách ticket hiện có trong nhớ. */
    async load() {
      return [...tickets];
    },
    /** Thay toàn bộ danh sách ticket trong nhớ bằng `next`. */
    async save(next) {
      tickets = [...next];
    },
  };
}
