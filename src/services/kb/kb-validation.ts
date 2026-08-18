/**
 * Validate/chuẩn hóa input cho các lệnh kb — vai trò giống
 * services/tickets/ticket-validation.ts nhưng chỉ dùng cho domain kb.
 */

/**
 * Chuẩn hóa danh sách tags: trim, chữ thường, bỏ tag rỗng, gộp trùng (giữ thứ tự lần đầu).
 * Ví dụ [" Bug ", "bug", "UI"] → ["bug", "ui"]. Logic giống normalizeTags bên tickets.
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
 * Title bắt buộc, không rỗng/không chỉ khoảng trắng (giống requireTitle bên tickets).
 * Commander chỉ đảm bảo có giá trị, không đảm bảo giá trị đó không toàn khoảng trắng.
 */
export function requireTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("title is required");
  }
  return trimmed;
}

/** nodePath bắt buộc, không rỗng/không chỉ khoảng trắng — cùng lý do với requireTitle. */
export function requireNodePath(nodePath: string): string {
  const trimmed = nodePath.trim();
  if (!trimmed) {
    throw new Error("nodePath is required");
  }
  return trimmed;
}
