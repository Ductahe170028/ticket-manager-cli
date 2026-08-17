import type { AddDocumentInput, KBClient } from "../models/kb/kb-client";
import type { Document, SearchResult } from "../models/kb/document";

/** 3 document mẫu cố định — xem docs/plans/week-3/decisions.vi.md mục 4. */
const SEED_DOCUMENTS: Document[] = [
  {
    id: "doc-001",
    title: "Customer Response Template",
    nodePath: "/templates/email",
    tags: ["template", "email"],
    content:
      "Xin chào quý khách, cảm ơn bạn đã liên hệ với đội ngũ hỗ trợ của chúng tôi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
  },
  {
    id: "doc-002",
    title: "Refund Request Reply",
    nodePath: "/templates/email",
    tags: ["template", "email", "refund"],
    content:
      "Chúng tôi đã nhận được yêu cầu hoàn tiền (refund) của bạn. Vui lòng cung cấp mã đơn hàng để chúng tôi xử lý.",
  },
  {
    id: "doc-003",
    title: "DevOps On-call Schedule",
    nodePath: "/team/devops",
    tags: ["team", "devops"],
    content:
      "Lịch trực DevOps hàng tuần: Thứ 2 - Anh A, Thứ 3 - Chị B, cuối tuần luân phiên trực.",
  },
];

/** Tìm nơi khớp keyword — ưu tiên title trước, sau đó mới xét content. */
function findMatchType(doc: Document, keyword: string): "title" | "content" | null {
  if (doc.title.toLowerCase().includes(keyword)) return "title";
  if (doc.content.toLowerCase().includes(keyword)) return "content";
  return null;
}

/**
 * Tạo KBClient giả lập với 3 document mẫu cố định trong bộ nhớ (mất khi restart chương trình).
 * Style: factory function — không dùng class, giống createJsonTicketStore.
 * list/retrieve/add chưa implement — sẽ làm ở case C/D/E.
 */
export function createMockKbClient(): KBClient {
  const documents: Document[] = [...SEED_DOCUMENTS];

  return {
    async search(query: string, topK?: number): Promise<SearchResult[]> {
      const keyword = query.trim().toLowerCase();
      if (!keyword) return [];

      const results: SearchResult[] = [];
      for (const doc of documents) {
        const matchType = findMatchType(doc, keyword);
        if (matchType) {
          results.push({
            document: { id: doc.id, title: doc.title, nodePath: doc.nodePath },
            matchType,
          });
        }
      }

      return topK !== undefined ? results.slice(0, topK) : results;
    },

    async list(): Promise<Document[]> {
      throw new Error("MockKBClient: list() chưa implement — xem case C");
    },

    async retrieve(): Promise<Document | null> {
      throw new Error("MockKBClient: retrieve() chưa implement — xem case D");
    },

    async add(_input: AddDocumentInput): Promise<Document> {
      throw new Error("MockKBClient: add() chưa implement — xem case E");
    },
  };
}
