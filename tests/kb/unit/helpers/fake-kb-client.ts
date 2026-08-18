import type { AddDocumentInput, KBClient } from "../../../../src/models/kb/kb-client";
import type { Document, SearchResult } from "../../../../src/models/kb/document";

/**
 * KBClient giả cho unit test kb-service — không đụng MockKBClient/HTTPKBClient thật.
 * search() trả về `searchResult` cố định mỗi lần gọi; ghi lại tham số lần gọi gần nhất để assert.
 * list/retrieve/add chưa cần cho case B (search) — gọi tới sẽ throw để lộ ra ngay nếu dùng nhầm.
 */
export interface FakeKBClient extends KBClient {
  lastSearchCall: { query: string; topK?: number } | null;
  lastListCall: { nodePath?: string; limit?: number } | null;
}

/**
 * `searchResult` — kết quả cố định trả về mỗi lần gọi search().
 * `listResult` — kết quả cố định trả về mỗi lần gọi list().
 */
export function createFakeKBClient(
  searchResult: SearchResult[] = [],
  listResult: Document[] = []
): FakeKBClient {
  const fake: FakeKBClient = {
    lastSearchCall: null,
    lastListCall: null,
    async search(query: string, topK?: number) {
      fake.lastSearchCall = { query, topK };
      return searchResult;
    },
    async list(nodePath?: string, limit?: number): Promise<Document[]> {
      fake.lastListCall = { nodePath, limit };
      return listResult;
    },
    async retrieve(): Promise<Document | null> {
      throw new Error("fake KBClient: retrieve() chưa dùng ở case B/C");
    },
    async add(_input: AddDocumentInput): Promise<Document> {
      throw new Error("fake KBClient: add() chưa dùng ở case B/C");
    },
  };
  return fake;
}
