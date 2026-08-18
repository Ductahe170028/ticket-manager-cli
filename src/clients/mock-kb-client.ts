import type { AddDocumentInput, KBClient } from "../models/kb/kb-client";
import type { Document, SearchResult } from "../models/kb/document";
import { applyLimit } from "../utils/apply-limit";

/**
 * 10 document mẫu cố định — xem docs/plans/week-3/decisions.vi.md mục 4.
 * doc-004..doc-010 cố tình khác nodePath và không trùng từ khóa với doc-001..doc-003
 * (để không phá test cũ đang xanh của case B/C).
 *
 * Export ra ngoài (đóng băng bằng Object.freeze) để test tự tính lại kết quả mong đợi
 * (số lượng, danh sách id...) từ chính dữ liệu này — không gõ tay số cố định trong test.
 * Nhờ vậy test luôn đúng dù sau này thêm/bớt document mẫu, không cần sửa test theo tay.
 */
export const SEED_DOCUMENTS: readonly Document[] = Object.freeze([
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
  {
    id: "doc-004",
    title: "Password Reset Instructions",
    nodePath: "/templates/security",
    tags: ["template", "security"],
    content:
      "Hướng dẫn đặt lại mật khẩu: nhấn vào đường dẫn được gửi qua email, nhập mật khẩu mới có ít nhất 8 ký tự.",
  },
  {
    id: "doc-005",
    title: "Onboarding Checklist for New Engineers",
    nodePath: "/onboarding/engineering",
    tags: ["onboarding", "engineering"],
    content:
      "Ngày đầu tiên: cài đặt môi trường, truy cập repo, đọc tài liệu kiến trúc hệ thống, gặp mentor được phân công.",
  },
  {
    id: "doc-006",
    title: "Incident Response Runbook",
    nodePath: "/runbooks/incident",
    tags: ["runbook", "incident"],
    content:
      "Khi xảy ra sự cố: xác nhận mức độ nghiêm trọng, thông báo nhóm liên quan, ghi log thời gian xử lý, viết báo cáo sau sự cố.",
  },
  {
    id: "doc-007",
    title: "Vacation Request Policy",
    nodePath: "/hr/policies",
    tags: ["hr", "policy"],
    content:
      "Nhân viên cần gửi yêu cầu nghỉ phép trước ít nhất 3 ngày làm việc, quản lý trực tiếp phê duyệt trên hệ thống.",
  },
  {
    id: "doc-008",
    title: "API Rate Limit Guide",
    nodePath: "/docs/api",
    tags: ["api", "guide"],
    content: "Giới hạn 100 request mỗi phút cho mỗi API key, vượt ngưỡng sẽ nhận mã lỗi 429.",
  },
  {
    id: "doc-009",
    title: "Code Review Checklist",
    nodePath: "/engineering/process",
    tags: ["engineering", "process"],
    content:
      "Kiểm tra tên biến rõ nghĩa, có test đi kèm, không để lại code comment thừa, đúng chuẩn style project.",
  },
  {
    id: "doc-010",
    title: "Customer Escalation Template",
    nodePath: "/templates/support",
    tags: ["template", "support", "escalation"],
    content:
      "Kính gửi khách hàng, đội ngũ hỗ trợ đang ưu tiên xử lý yêu cầu escalation của bạn ngay lập tức.",
  },
]);

/** Tìm nơi khớp keyword — ưu tiên title trước, sau đó mới xét content. */
function findMatchType(doc: Document, keyword: string): "title" | "content" | null {
  if (doc.title.toLowerCase().includes(keyword)) return "title";
  if (doc.content.toLowerCase().includes(keyword)) return "content";
  return null;
}

/**
 * Tạo KBClient giả lập với 10 document mẫu cố định trong bộ nhớ (mất khi restart chương trình).
 * Style: factory function — không dùng class, giống createJsonTicketStore.
 * add() chưa implement — sẽ làm ở case E.
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

      return applyLimit(results, topK);
    },

    async list(nodePath?: string, limit?: number): Promise<Document[]> {
      const filtered =
        nodePath !== undefined
          ? documents.filter((doc) => doc.nodePath === nodePath)
          : [...documents];

      return applyLimit(filtered, limit);
    },

    async retrieve(): Promise<Document | null> {
      throw new Error("MockKBClient: retrieve() chưa implement — xem case D");
    },

    async add(_input: AddDocumentInput): Promise<Document> {
      throw new Error("MockKBClient: add() chưa implement — xem case E");
    },
  };
}
