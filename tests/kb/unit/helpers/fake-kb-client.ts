import type { AddDocumentInput, KBClient } from "../../../../src/models/kb/kb-client";
import type { Document, SearchResult } from "../../../../src/models/kb/document";

/**
 * KBClient giả cho unit test kb-service — không đụng MockKBClient/HTTPKBClient thật.
 * search()/list()/retrieve() trả về kết quả cố định mỗi lần gọi; ghi lại tham số lần gọi
 * gần nhất để assert. add() chưa cần cho case B/C/D — gọi tới sẽ throw để lộ ra ngay nếu dùng nhầm.
 */
export interface FakeKBClient extends KBClient {
  lastSearchCall: { query: string; topK?: number } | null;
  lastListCall: { nodePath?: string; limit?: number } | null;
  lastRetrieveCall: string | null;
}

/**
 * `searchResult` — kết quả cố định trả về mỗi lần gọi search().
 * `listResult` — kết quả cố định trả về mỗi lần gọi list().
 * `retrieveResult` — kết quả cố định trả về mỗi lần gọi retrieve() (null = không tìm thấy).
 */
export function createFakeKBClient(
  searchResult: SearchResult[] = [],
  listResult: Document[] = [],
  retrieveResult: Document | null = null
): FakeKBClient {
  const fake: FakeKBClient = {
    lastSearchCall: null,
    lastListCall: null,
    lastRetrieveCall: null,
    async search(query: string, topK?: number) {
      fake.lastSearchCall = { query, topK };
      return searchResult;
    },
    async list(nodePath?: string, limit?: number): Promise<Document[]> {
      fake.lastListCall = { nodePath, limit };
      return listResult;
    },
    async retrieve(docId: string): Promise<Document | null> {
      fake.lastRetrieveCall = docId;
      return retrieveResult;
    },
    async add(_input: AddDocumentInput): Promise<Document> {
      throw new Error("fake KBClient: add() chưa dùng ở case B/C/D");
    },
  };
  return fake;
}
