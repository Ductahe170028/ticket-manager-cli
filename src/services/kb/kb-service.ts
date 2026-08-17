import type { KBClient } from "../../models/kb/kb-client";
import type { SearchResult } from "../../models/kb/document";

/** Các thao tác nghiệp vụ KB mà commands được phép gọi. */
export interface KBService {
  search(query: string, topK?: number): Promise<SearchResult[]>;
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
      return topK !== undefined ? results.slice(0, topK) : results;
    },
  };
}
