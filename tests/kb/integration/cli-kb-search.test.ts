/**
 * Integration: CLI `tickets kb search <query> [--top-k]` — case B5.
 * Dùng MockKBClient mặc định (KB_CLIENT không set → mock, theo decisions.vi.md mục 5).
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";

describe("CLI kb search", () => {
  it('kb search "refund" -> exit 0, in ra doc-002', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "search", "refund"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/doc-002/);
    });
  });

  it('kb search "chúng tôi" --top-k 1 -> chỉ in đúng 1 dòng', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["kb", "search", "chúng tôi", "--top-k", "1"],
        filePath
      );

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(1);
    });
  });

  it("kb search từ khóa không khớp gì -> exit 0, không in dòng nào", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "search", "khong-ton-tai-xyz"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout.trim()).toBe("");
    });
  });
});
