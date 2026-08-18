import axios, { type AxiosInstance } from "axios";
import type { AddDocumentInput, KBClient } from "../models/kb/kb-client";
import type { Document, SearchResult } from "../models/kb/document";

/**
 * Gọi 1 endpoint POST trên KB server (contract xem decisions.vi.md mục 8-9), trả về
 * đúng phần data đã parse. Bọc mọi lỗi (mất mạng, status 4xx/5xx) thành 1 Error rõ
 * nghĩa — tầng trên (kb-service, CLI) không cần biết gì về axios.
 */
async function postToKbServer(http: AxiosInstance, path: string, body: unknown): Promise<unknown> {
  try {
    const response = await http.post(path, body);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw new Error(`KB server trả lỗi status ${err.response.status} khi gọi ${path}`);
      }
      throw new Error(`Không kết nối được KB server khi gọi ${path}: ${err.message}`);
    }
    throw err;
  }
}

/** response không đúng hình dạng mong đợi (không phải JSON hợp lệ theo nghĩa nghiệp vụ) → báo lỗi rõ, không trả bừa cho tầng trên. */
function invalidResponse(path: string): never {
  throw new Error(`KB server trả response không hợp lệ cho ${path}`);
}

/**
 * Tạo KBClient gọi qua HTTP tới 1 server KB thật (tự viết hoặc server công ty —
 * HTTPKBClient không phân biệt, chỉ cần đúng contract). Style: factory function,
 * không dùng class — giống MockKBClient.
 */
export function createHttpKbClient(baseUrl: string): KBClient {
  const http = axios.create({ baseURL: baseUrl, timeout: 5000 });

  return {
    async search(query: string, topK?: number): Promise<SearchResult[]> {
      const data = await postToKbServer(http, "/search", { query, topK });
      if (!Array.isArray(data)) return invalidResponse("/search");
      return data as SearchResult[];
    },

    async list(nodePath?: string, limit?: number): Promise<Document[]> {
      const data = await postToKbServer(http, "/list", { nodePath, limit });
      if (!Array.isArray(data)) return invalidResponse("/list");
      return data as Document[];
    },

    async retrieve(docId: string): Promise<Document | null> {
      const data = await postToKbServer(http, "/retrieve", { docId });
      if (data !== null && (typeof data !== "object" || Array.isArray(data))) {
        return invalidResponse("/retrieve");
      }
      return data as Document | null;
    },

    async add(input: AddDocumentInput): Promise<Document> {
      const data = await postToKbServer(http, "/add", input);
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return invalidResponse("/add");
      }
      return data as Document;
    },
  };
}
