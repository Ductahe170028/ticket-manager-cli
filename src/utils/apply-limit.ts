/**
 * Cắt danh sách theo limit nếu có; không truyền limit → giữ nguyên.
 * Dùng chung giữa services/ và clients/ (2 tầng không phụ thuộc lẫn nhau) —
 * chỗ trung lập cho logic nhỏ, tổng quát, không thuộc riêng domain nào.
 */
export function applyLimit<T>(items: T[], limit?: number): T[] {
  return limit !== undefined ? items.slice(0, limit) : items;
}
