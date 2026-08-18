/**
 * Integration: CLI `tickets kb list [--node] [--limit]` — case C5.
 * Dùng MockKBClient mặc định (KB_CLIENT không set → mock, theo decisions.vi.md mục 5).
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";

describe("CLI kb list", () => {
  it('kb list --node "/templates/email" -> in đúng 2 document trong node đó', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list", "--node", "/templates/email"], filePath);

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(2);
      expect(result.stdout).toMatch(/doc-001/);
      expect(result.stdout).toMatch(/doc-002/);
    });
  });

  it("kb list --node không tồn tại -> exit 0, không in dòng nào", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list", "--node", "/khong-ton-tai"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout.trim()).toBe("");
    });
  });

  it("kb list không truyền --node -> liệt kê toàn bộ 10 document mẫu", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list"], filePath);

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(10);
    });
  });

  it("kb list --limit giới hạn đúng số dòng in ra", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list", "--limit", "1"], filePath);

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(1);
    });
  });

  it("kb list --node và --limit dùng cùng lúc -> lọc đúng node rồi mới giới hạn đúng limit", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["kb", "list", "--node", "/templates/email", "--limit", "1"],
        filePath
      );

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(1);
    });
  });
});
