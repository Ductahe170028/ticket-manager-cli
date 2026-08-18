import * as http from "http";
import type { Document, SearchResult } from "../models/kb/document";
import { applyLimit } from "../utils/apply-limit";
import { SEED_DOCUMENTS } from "./kb-seed-data";

/** Tìm nơi khớp keyword — ưu tiên title trước, sau đó mới xét content (giống MockKBClient). */
function findMatchType(doc: Document, keyword: string): "title" | "content" | null {
  if (doc.title.toLowerCase().includes(keyword)) return "title";
  if (doc.content.toLowerCase().includes(keyword)) return "content";
  return null;
}

/** Đọc + parse JSON body của request; ném lỗi nếu body không phải JSON hợp lệ. */
function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Server tự validate title/nodePath không rỗng — không tin tưởng tuyệt đối request gửi
 * tới, vì server có thể bị gọi thẳng (bỏ qua CLI/kb-service, ví dụ ai đó gọi trực tiếp
 * bằng Postman/curl). Logic giống requireTitle/requireNodePath ở services/kb/kb-validation.ts
 * nhưng viết riêng — server/ không phụ thuộc code phía CLI.
 */
function requireNonBlank(value: unknown, field: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    throw new Error(`${field} is required`);
  }
  return trimmed;
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  // Khai báo rõ charset=utf-8 — thiếu phần này 1 số HTTP client (PowerShell Invoke-RestMethod)
  // sẽ đoán sai bảng mã lúc giải mã, làm tiếng Việt hiển thị sai (mojibake) dù dữ liệu gửi đi đúng.
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload, "utf8");
}

/**
 * Server KB thật (contract xem docs/plans/week-3/decisions.vi.md mục 8-9) — chạy độc lập,
 * không phụ thuộc CLI/clients/. Dùng chung cho cả chạy thật (src/server/index.ts) lẫn
 * fake server trong integration test (tests/kb/integration/helpers/fake-kb-server.ts).
 *
 * Trả về http.Server chưa listen — caller tự gọi .listen(port).
 */
export function createKbServer(): http.Server {
  const documents: Document[] = [...SEED_DOCUMENTS];

  return http.createServer((req, res) => {
    void (async () => {
      try {
        if (req.method !== "POST") {
          sendJson(res, 404, { error: "not found" });
          return;
        }

        const body = await readJsonBody(req);

        switch (req.url) {
          case "/search": {
            const keyword = String(body.query ?? "")
              .trim()
              .toLowerCase();
            const topK = body.topK as number | undefined;
            const results: SearchResult[] = [];
            if (keyword) {
              for (const doc of documents) {
                const matchType = findMatchType(doc, keyword);
                if (matchType) {
                  results.push({
                    document: { id: doc.id, title: doc.title, nodePath: doc.nodePath },
                    matchType,
                  });
                }
              }
            }
            sendJson(res, 200, applyLimit(results, topK));
            return;
          }

          case "/list": {
            const nodePath = body.nodePath as string | undefined;
            const limit = body.limit as number | undefined;
            const filtered =
              nodePath !== undefined
                ? documents.filter((doc) => doc.nodePath === nodePath)
                : [...documents];
            sendJson(res, 200, applyLimit(filtered, limit));
            return;
          }

          case "/retrieve": {
            const docId = body.docId as string;
            const found = documents.find((doc) => doc.id === docId) ?? null;
            sendJson(res, 200, found);
            return;
          }

          case "/add": {
            let title: string;
            let nodePath: string;
            try {
              title = requireNonBlank(body.title, "title");
              nodePath = requireNonBlank(body.nodePath, "nodePath");
            } catch (err) {
              sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
              return;
            }

            const id = `doc-${String(documents.length + 1).padStart(3, "0")}`;
            const created: Document = {
              id,
              title,
              content: body.content as string,
              nodePath,
              tags: (body.tags as string[] | undefined) ?? [],
            };
            documents.push(created);
            sendJson(res, 200, created);
            return;
          }

          default:
            sendJson(res, 404, { error: "not found" });
        }
      } catch (err) {
        sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
      }
    })();
  });
}
