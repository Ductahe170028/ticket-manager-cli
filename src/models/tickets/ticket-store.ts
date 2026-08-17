import type { Ticket } from "./ticket";

/**
 * Cổng lưu trữ (hexa nhẹ).
 * Service chỉ phụ thuộc interface này — không biết đang dùng JSON hay kho giả.
 */
export interface TicketStore {
  /** Đọc toàn bộ ticket hiện có. */
  load(): Promise<Ticket[]>;
  /** Ghi đè toàn bộ danh sách ticket. */
  save(tickets: Ticket[]): Promise<void>;
}
