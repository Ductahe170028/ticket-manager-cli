/**
 * Integration: CLI `tickets show <id>` với file JSON tạm (TICKETS_PATH).
 * Seed bằng CLI create — không đụng data/tickets.json.
 */
import { runTickets, withTempTicketsFile } from "./helpers/run-cli";

describe("CLI tickets show", () => {
  it("show TKT-001 → exit 0, in id và title", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Bug login"], filePath);

      const result = await runTickets(["show", "TKT-001"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).toMatch(/Bug login/i);
    });
  });

  it("show TKT-999 → exit ≠ 0, stderr not found", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Exists"], filePath);

      const result = await runTickets(["show", "TKT-999"], filePath);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/not found/i);
    });
  });

  it("show thiếu argument → exit ≠ 0", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["show"], filePath);

      expect(result.code).not.toBe(0);
    });
  });

  it("show abc → exit ≠ 0, stderr invalid/id", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Exists"], filePath);

      const result = await runTickets(["show", "abc"], filePath);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/invalid|id/i);
    });
  });

  it('show "   " → exit ≠ 0, stderr invalid/id/required', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["show", "   "], filePath);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/invalid|id|required/i);
    });
  });
});
