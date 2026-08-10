/**
 * Tách chuỗi tags CLI ("bug,ui") thành mảng; không truyền → undefined.
 */
export function parseTagsOption(tags: string | undefined): string[] | undefined {
  if (tags === undefined) return undefined;
  return tags.split(",");
}
