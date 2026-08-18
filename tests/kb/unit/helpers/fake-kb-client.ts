import type { AddDocumentInput, KBClient } from "../../../../src/models/kb/kb-client";
import type { Document, SearchResult } from "../../../../src/models/kb/document";

/**
 * KBClient giả cho unit test kb-service — không đụng MockKBClient/HTTPKBClient thật.
 * search()/list()/retrieve()/add() trả về kết quả cố định mỗi lần gọi; ghi lại tham số lần
 * gọi gần nhất để assert.
 */
export interface FakeKBClient extends KBClient {
  lastSearchCall: { query: string; topK?: number } | null;
  lastListCall: { nodePath?: string; limit?: number } | null;
  lastRetrieveCall: string | null;
  lastAddCall: AddDocumentInput | null;
}

/**
 * `searchResult` — kết quả cố định trả về mỗi lần gọi search().
 * `listResult` — kết quả cố định trả về mỗi lần gọi list().
 * `retrieveResult` — kết quả cố định trả về mỗi lần gọi retrieve() (null = không tìm thấy).
 * `addResult` — document trả về mỗi lần gọi add(); không truyền → tự ghép input + id giả "doc-fake".
 */
export function createFakeKBClient(
  searchResult: SearchResult[] = [],
  listResult: Document[] = [],
  retrieveResult: Document | null = null,
  addResult: Document | null = null
): FakeKBClient {
  const fake: FakeKBClient = {
    lastSearchCall: null,
    lastListCall: null,
    lastRetrieveCall: null,
    lastAddCall: null,
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
    async add(input: AddDocumentInput): Promise<Document> {
      fake.lastAddCall = input;
      return addResult ?? { id: "doc-fake", ...input };
    },
  };
  return fake;
}
