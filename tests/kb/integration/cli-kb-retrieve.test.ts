/**
 * Integration: CLI `tickets kb retrieve <docId>` — case D3-D4.
 * Dùng MockKBClient mặc định (KB_CLIENT không set → mock, theo decisions.vi.md mục 5).
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";

describe("CLI kb retrieve", () => {
  it("kb retrieve doc-001 -> exit 0, in đầy đủ id/title/content/nodePath/tags", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "retrieve", "doc-001"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/doc-001/);
      expect(result.stdout).toMatch(/Customer Response Template/);
      expect(result.stdout).toMatch(/\/templates\/email/);
      expect(result.stdout).toMatch(/template/);
      // content đầy đủ phải được in ra, không chỉ id/title/nodePath/tags
      expect(result.stdout).toMatch(/cảm ơn bạn đã liên hệ/);
    });
  });

  it("kb retrieve doc-khong-ton-tai -> exit ≠ 0, stderr not found", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "retrieve", "doc-khong-ton-tai"], filePath);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/not found/i);
    });
  });

  it("kb retrieve thiếu docId (không truyền tham số) -> exit ≠ 0", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "retrieve"], filePath);

      expect(result.code).not.toBe(0);
    });
  });
});
