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
    /** Tìm document theo từ khóa; chuyển thẳng cho KBClient xử lý so khớp. */
    async search(query: string, topK?: number): Promise<SearchResult[]> {
      return client.search(query, topK);
    },
  };
}
