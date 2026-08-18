import type { Document } from "../models/kb/document";

/**
 * Dữ liệu khởi tạo cho server KB thật — CỐ TÌNH khác hoàn toàn nội dung với SEED_DOCUMENTS
 * bên clients/mock-kb-client.ts, để lúc test tay (search/list/retrieve) nhìn kết quả là biết
 * ngay đang nói chuyện với Mock hay với server thật, không lẫn 2 nguồn.
 *
 * Vẫn giữ cấu trúc tương tự để dễ so sánh: đúng 10 document, có 1 cặp cùng nodePath
 * (/server-docs/monitoring), có 1 từ khóa chỉ khớp title 1 document (để test match đơn),
 * và 1 từ khóa khớp content của 2 document (để test topK).
 */
export const SEED_DOCUMENTS: readonly Document[] = Object.freeze([
  {
    id: "doc-001",
    title: "Server Status Page Guide",
    nodePath: "/server-docs/monitoring",
    tags: ["server", "monitoring"],
    content:
      "Chào mừng bạn đến với hệ thống server thật (không phải Mock). Đội ngũ vận hành server theo dõi trạng thái 24/7 qua trang status.",
  },
  {
    id: "doc-002",
    title: "Server Restart Procedure",
    nodePath: "/server-docs/monitoring",
    tags: ["server", "monitoring", "restart"],
    content:
      "Quy trình khởi động lại (restart) server: thông báo trước 15 phút, đội ngũ vận hành server xác nhận trạng thái ổn định sau khi restart.",
  },
  {
    id: "doc-003",
    title: "Load Balancer Configuration",
    nodePath: "/server-docs/network",
    tags: ["server", "network"],
    content:
      "Cấu hình load balancer cho server: định tuyến traffic đều giữa các node, tự động chuyển sang node khác khi 1 node lỗi.",
  },
  {
    id: "doc-004",
    title: "Database Backup Policy",
    nodePath: "/server-docs/database",
    tags: ["server", "database"],
    content:
      "Chính sách backup database của server: sao lưu mỗi 6 giờ, lưu trữ 30 ngày, kiểm tra khôi phục hàng tuần.",
  },
  {
    id: "doc-005",
    title: "SSL Certificate Renewal",
    nodePath: "/server-docs/security",
    tags: ["server", "security"],
    content:
      "Gia hạn chứng chỉ SSL cho server: kiểm tra hạn trước 30 ngày, gia hạn tự động qua Let's Encrypt.",
  },
  {
    id: "doc-006",
    title: "API Gateway Setup",
    nodePath: "/server-docs/network",
    tags: ["server", "network", "api"],
    content:
      "Thiết lập API Gateway trên server: định nghĩa route, giới hạn tốc độ request, xác thực bằng token.",
  },
  {
    id: "doc-007",
    title: "Container Deployment Guide",
    nodePath: "/server-docs/deployment",
    tags: ["server", "deployment"],
    content:
      "Hướng dẫn triển khai container lên server: build image, đẩy lên registry, deploy qua pipeline CI/CD.",
  },
  {
    id: "doc-008",
    title: "Logging Aggregation Setup",
    nodePath: "/server-docs/logging",
    tags: ["server", "logging"],
    content:
      "Thiết lập tập trung log của server: gom log từ nhiều node về 1 nơi, cảnh báo khi tỉ lệ lỗi vượt ngưỡng.",
  },
  {
    id: "doc-009",
    title: "Firewall Rules Reference",
    nodePath: "/server-docs/security",
    tags: ["server", "security", "firewall"],
    content:
      "Danh sách quy tắc firewall của server: chỉ mở các port cần thiết, tự động chặn IP có dấu hiệu tấn công.",
  },
  {
    id: "doc-010",
    title: "Disaster Recovery Plan",
    nodePath: "/server-docs/ops",
    tags: ["server", "ops", "recovery"],
    content:
      "Kế hoạch khôi phục sau thảm hoạ của hệ thống server: server dự phòng ở khu vực khác, tự động chuyển traffic khi cần.",
  },
]);
