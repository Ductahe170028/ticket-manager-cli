import {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  type TicketPriority,
  type TicketStatus,
} from "../../models/tickets/ticket";

/**
 * Kiểm tra title bắt buộc (không trống / không chỉ khoảng trắng).
 * Trả về title đã trim; lỗi thì throw.
 */
export function requireTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("title is required");
  }
  return trimmed;
}

/**
 * Chuẩn hóa status: hợp lệ → TicketStatus; sai → null.
 */
function tryParseStatus(value: string): TicketStatus | null {
  const normalized = value.trim().toLowerCase();
  if ((ALLOWED_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as TicketStatus;
  }
  return null;
}

/**
 * Chuẩn hóa priority: hợp lệ → TicketPriority; sai → null.
 */
function tryParsePriority(value: string): TicketPriority | null {
  const normalized = value.trim().toLowerCase();
  if ((ALLOWED_PRIORITIES as readonly string[]).includes(normalized)) {
    return normalized as TicketPriority;
  }
  return null;
}

/**
 * Status khi create: không truyền → mặc định; có truyền thì phải hợp lệ.
 */
export function resolveStatus(value: string | undefined): TicketStatus {
  if (value === undefined) return DEFAULT_STATUS;
  return requireStatus(value);
}

/**
 * Bắt buộc status thuộc danh sách cho phép.
 * Chuẩn hóa trim + chữ thường trước khi so khớp (Open → open).
 */
export function requireStatus(value: string): TicketStatus {
  const parsed = tryParseStatus(value);
  if (parsed === null) {
    throw new Error(`invalid status: ${value}`);
  }
  return parsed;
}

/**
 * Priority khi create: không truyền → mặc định; có truyền thì phải hợp lệ.
 */
export function resolvePriority(value: string | undefined): TicketPriority {
  if (value === undefined) return DEFAULT_PRIORITY;
  return requirePriority(value);
}

/**
 * Bắt buộc priority thuộc danh sách cho phép.
 * Chuẩn hóa trim + chữ thường trước khi so khớp (High → high).
 */
export function requirePriority(value: string): TicketPriority {
  const parsed = tryParsePriority(value);
  if (parsed === null) {
    throw new Error(`invalid priority: ${value}`);
  }
  return parsed;
}

/**
 * Status khi list: không truyền → undefined; hợp lệ → status; sai → null (list trả []).
 */
export function parseListStatus(
  value: string | undefined
): TicketStatus | null | undefined {
  if (value === undefined) return undefined;
  return tryParseStatus(value);
}

/**
 * Priority khi list: không truyền → undefined; hợp lệ → priority; sai → null (list trả []).
 */
export function parseListPriority(
  value: string | undefined
): TicketPriority | null | undefined {
  if (value === undefined) return undefined;
  return tryParsePriority(value);
}

/**
 * Chuẩn hóa tags: trim, chữ thường, bỏ tag rỗng, gộp trùng (giữ thứ tự lần đầu).
 * Ví dụ [" Bug ", "bug", "UI"] → ["bug", "ui"].
 */
export function normalizeTags(tags: string[] | undefined): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of tags ?? []) {
    const tag = raw.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }

  return result;
}

/**
 * Id ticket bắt buộc, format TKT-001… (trim; chuẩn hóa chữ hoa + pad số).
 * Trống / sai format → lỗi input.
 */
export const TICKET_ID_REGEX = /^TKT-(\d+)$/i;

/** Format số thành id TKT-001… */
export function formatTicketId(n: number): string {
  return `TKT-${String(n).padStart(3, "0")}`;
}

/**
 * Id ticket bắt buộc, format TKT-001… (trim; chuẩn hóa chữ hoa + pad số).
 * Trống / sai format → lỗi input.
 */
export function requireTicketId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error("id is required");
  }
  const match = TICKET_ID_REGEX.exec(trimmed);
  if (!match) {
    throw new Error(`invalid id: ${id}`);
  }
  return formatTicketId(Number(match[1]));
}
