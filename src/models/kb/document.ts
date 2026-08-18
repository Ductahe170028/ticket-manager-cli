/** Hình dạng một document trong Knowledge Base. */
export interface Document {
  id: string;
  title: string;
  content: string;
  nodePath: string;
  tags: string[];
}

/** Một kết quả tìm kiếm — không nhất thiết có đủ content như retrieve. */
export interface SearchResult {
  document: Pick<Document, "id" | "title" | "nodePath">;
  matchType?: string;
}
