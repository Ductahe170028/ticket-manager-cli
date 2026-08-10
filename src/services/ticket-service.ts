import type { Ticket } from "../models/ticket";
import type { TicketStore } from "../models/ticket-store";
import {
  formatTicketId,
  normalizeTags,
  parseListPriority,
  parseListStatus,
  requireStatus,
  requireTicketId,
  requireTitle,
  resolvePriority,
  resolveStatus,
  TICKET_ID_REGEX,
} from "./ticket-validation";

/** Dữ liệu đầu vào khi tạo ticket (từ CLI hoặc test). */
export interface CreateTicketInput {
  title: string;
  description?: string;
  /** Chuỗi thô từ CLI — validate trong ticket-validation. */
  status?: string;
  priority?: string;
  tags?: string[];
}

/** Bộ lọc khi liệt kê ticket (chuỗi thô từ CLI; không hợp lệ → []). */
export interface ListTicketFilter {
  status?: string;
  priority?: string;
  tags?: string[];
}

/** Các thao tác nghiệp vụ ticket mà commands được phép gọi. */
export interface TicketService {
  create(input: CreateTicketInput): Promise<Ticket>;
  list(filter?: ListTicketFilter): Promise<Ticket[]>;
  show(id: string): Promise<Ticket>;
  /** status: chuỗi thô từ CLI — chuẩn hóa / validate trong service. */
  updateStatus(id: string, status: string): Promise<Ticket>;
}

/**
 * Sinh id tiếp theo dạng TKT-001, TKT-002… theo số lớn nhất đang có.
 */
function nextTicketId(tickets: Ticket[]): string {
  let max = 0;
  for (const ticket of tickets) {
    const match = TICKET_ID_REGEX.exec(ticket.id);
    if (match) {
      const n = Number(match[1]);
      if (n > max) max = n;
    }
  }
  return formatTicketId(max + 1);
}

/**
 * Tạo service nghiệp vụ ticket — nhận TicketStore từ ngoài (hexa nhẹ).
 * Style: factory function — không dùng class.
 */
export function createTicketService(store: TicketStore): TicketService {
  /**
   * Load kho và tìm ticket theo id đã chuẩn hóa; không có → not found.
   */
  async function findByIdOrThrow(
    id: string
  ): Promise<{ tickets: Ticket[]; index: number; ticket: Ticket }> {
    const tickets = await store.load();
    const index = tickets.findIndex((t) => t.id === id);
    if (index < 0) {
      throw new Error(`ticket not found: ${id}`);
    }
    return { tickets, index, ticket: tickets[index] };
  }

  return {
    /** Tạo ticket mới, validate, lưu qua store, trả về ticket đã tạo. */
    async create(input: CreateTicketInput): Promise<Ticket> {
      const title = requireTitle(input.title);
      const status = resolveStatus(input.status);
      const priority = resolvePriority(input.priority);

      const tickets = await store.load();
      const ticket: Ticket = {
        id: nextTicketId(tickets),
        title,
        description: input.description ?? "",
        status,
        priority,
        tags: normalizeTags(input.tags),
      };

      await store.save([...tickets, ticket]);
      return ticket;
    },

    /**
     * Liệt kê ticket; filter tùy chọn.
     * AND giữa status/priority/tags; nhiều tags = AND; status/priority sai → [].
     */
    async list(filter?: ListTicketFilter): Promise<Ticket[]> {
      const status = parseListStatus(filter?.status);
      if (status === null) return [];

      const priority = parseListPriority(filter?.priority);
      if (priority === null) return [];

      const requiredTags = normalizeTags(filter?.tags);
      const tickets = await store.load();

      return tickets.filter((ticket) => {
        if (status !== undefined && ticket.status !== status) return false;
        if (priority !== undefined && ticket.priority !== priority) return false;
        if (
          requiredTags.length > 0 &&
          !requiredTags.every((tag) => ticket.tags.includes(tag))
        ) {
          return false;
        }
        return true;
      });
    },

    /** Xem một ticket theo id; id sai format → lỗi input; không có → not found. */
    async show(rawId: string): Promise<Ticket> {
      const id = requireTicketId(rawId);
      const { ticket } = await findByIdOrThrow(id);
      return ticket;
    },

    /**
     * Cập nhật status ticket (ghi đè tại chỗ).
     * Id/status không hợp lệ → lỗi; không tìm thấy → not found.
     */
    async updateStatus(rawId: string, rawStatus: string): Promise<Ticket> {
      const id = requireTicketId(rawId);
      const status = requireStatus(rawStatus);
      const { tickets, index, ticket } = await findByIdOrThrow(id);

      const updated: Ticket = { ...ticket, status };
      const next = [...tickets];
      next[index] = updated;
      await store.save(next);
      return updated;
    },
  };
}
