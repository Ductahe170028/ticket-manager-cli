/**
 * Integration: CLI `tickets kb list [--node] [--limit]` — case C5.
 * Dùng MockKBClient mặc định (KB_CLIENT không set → mock, theo decisions.vi.md mục 5).
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";
import { SEED_DOCUMENTS } from "../../../src/clients/mock-kb-client";

describe("CLI kb list", () => {
  it('kb list --node "/templates/email" -> in đúng các document trong node đó', async () => {
    const expectedIds = SEED_DOCUMENTS.filter((d) => d.nodePath === "/templates/email").map(
      (d) => d.id
    );

    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list", "--node", "/templates/email"], filePath);

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(expectedIds.length);
      for (const id of expectedIds) {
        expect(result.stdout).toMatch(new RegExp(id));
      }
    });
  });

  it("kb list --node không tồn tại -> exit 0, không in dòng nào", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list", "--node", "/khong-ton-tai"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout.trim()).toBe("");
    });
  });

  it("kb list không truyền --node -> liệt kê toàn bộ document mẫu hiện có", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["kb", "list"], filePath);

      expect(result.code).toBe(0);
      const lines = result.stdout.trim().split("\n").filter(Boolean);
      expect(lines).toHaveLength(SEED_DOCUMENTS.length);
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
