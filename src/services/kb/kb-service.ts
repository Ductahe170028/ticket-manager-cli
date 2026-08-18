import type { KBClient } from "../../models/kb/kb-client";
import type { Document, SearchResult } from "../../models/kb/document";
import { applyLimit } from "../../utils/apply-limit";
import { normalizeTags, requireNodePath, requireTitle } from "./kb-validation";

/**
 * Input cho KBService.add — khác AddDocumentInput (models/kb/kb-client.ts) ở chỗ `tags`
 * không bắt buộc: service tự chuẩn hóa + mặc định `[]` trước khi gửi cho KBClient.
 */
export interface AddDocumentServiceInput {
  title: string;
  content: string;
  nodePath: string;
  tags?: string[];
}

/** Các thao tác nghiệp vụ KB mà commands được phép gọi. */
export interface KBService {
  search(query: string, topK?: number): Promise<SearchResult[]>;
  list(nodePath?: string, limit?: number): Promise<Document[]>;
  retrieve(docId: string): Promise<Document>;
  add(input: AddDocumentServiceInput): Promise<Document>;
}

/**
 * Tạo service nghiệp vụ KB — nhận KBClient từ ngoài (hexa nhẹ, giống createTicketService(store)).
 * Style: factory function — không dùng class.
 */
export function createKbService(client: KBClient): KBService {
  return {
    /**
     * Tìm document theo từ khóa; KBClient xử lý so khớp, service tự giới hạn
     * lại đúng topK trước khi trả về — không tin tưởng tuyệt đối vào client.
     */
    async search(query: string, topK?: number): Promise<SearchResult[]> {
      const results = await client.search(query, topK);
      return applyLimit(results, topK);
    },

    /**
     * Liệt kê document theo node; KBClient xử lý lọc, service tự giới hạn
     * lại đúng limit trước khi trả về — không tin tưởng tuyệt đối vào client.
     */
    async list(nodePath?: string, limit?: number): Promise<Document[]> {
      const results = await client.list(nodePath, limit);
      return applyLimit(results, limit);
    },

    /**
     * Lấy document đầy đủ theo id; KBClient trả null nếu không có →
     * service chuyển thành lỗi rõ nghĩa "not found" cho tầng CLI xử lý.
     */
    async retrieve(docId: string): Promise<Document> {
      const doc = await client.retrieve(docId);
      if (!doc) {
        throw new Error(`document not found: ${docId}`);
      }
      return doc;
    },

    /**
     * Thêm document mới; service chuẩn hóa tags (giống tuần 2) rồi mới gửi cho KBClient —
     * KBClient không cần biết/lo việc chuẩn hóa.
     */
    async add(input: AddDocumentServiceInput): Promise<Document> {
      return client.add({
        title: requireTitle(input.title),
        content: input.content,
        nodePath: requireNodePath(input.nodePath),
        tags: normalizeTags(input.tags),
      });
    },
  };
}
