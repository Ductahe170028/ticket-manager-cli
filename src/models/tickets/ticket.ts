/** Danh sách status hợp lệ — vừa dùng validate runtime, vừa suy ra type. */
export const ALLOWED_STATUSES = ["open", "in_progress", "done"] as const;

/** Danh sách priority hợp lệ — vừa dùng validate runtime, vừa suy ra type. */
export const ALLOWED_PRIORITIES = ["low", "medium", "high"] as const;

/** Trạng thái ticket được phép. */
export type TicketStatus = (typeof ALLOWED_STATUSES)[number];

/** Mức ưu tiên ticket được phép. */
export type TicketPriority = (typeof ALLOWED_PRIORITIES)[number];

/** Hình dạng một ticket trong hệ thống. */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
}

/** Status mặc định khi create không truyền --status. */
export const DEFAULT_STATUS: TicketStatus = "open";

/** Priority mặc định khi create không truyền --priority. */
export const DEFAULT_PRIORITY: TicketPriority = "medium";
