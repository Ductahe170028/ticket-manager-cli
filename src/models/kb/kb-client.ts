import type { Document, SearchResult } from "./document";

/** Dữ liệu đầu vào khi thêm document mới. */
export interface AddDocumentInput {
  title: string;
  content: string;
  nodePath: string;
  tags: string[];
}

/**
 * Cổng gọi Knowledge Base (hexa nhẹ, giống TicketStore của tickets).
 * KBClient chỉ mô tả interface — MockKBClient / HTTPKBClient sẽ implement.
 */
export interface KBClient {
  search(query: string, topK?: number): Promise<SearchResult[]>;
  list(nodePath?: string, limit?: number): Promise<Document[]>;
  retrieve(docId: string): Promise<Document | null>;
  add(input: AddDocumentInput): Promise<Document>;
}
