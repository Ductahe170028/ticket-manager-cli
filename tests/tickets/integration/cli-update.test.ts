/**
 * Integration: CLI `tickets update <id> --status ...` với file JSON tạm.
 * Seed bằng CLI create — không đụng data/tickets.json.
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";

describe("CLI tickets update", () => {
  it("update TKT-001 --status=done → exit 0; show thấy done", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Bug login", "--status", "open"],
        filePath
      );

      const updated = await runTickets(
        ["update", "TKT-001", "--status", "done"],
        filePath
      );
      expect(updated.code).toBe(0);

      const shown = await runTickets(["show", "TKT-001"], filePath);
      expect(shown.code).toBe(0);
      expect(shown.stdout).toMatch(/status:\s*done/i);
      expect(shown.stdout).toMatch(/Bug login/i);
    });
  });

  it("update TKT-999 → exit ≠ 0, stderr not found", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Exists"], filePath);

      const result = await runTickets(
        ["update", "TKT-999", "--status", "done"],
        filePath
      );

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/not found/i);
    });
  });

  it("thiếu <id> → exit ≠ 0", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["update", "--status", "done"],
        filePath
      );

      expect(result.code).not.toBe(0);
    });
  });

  it("thiếu --status → exit ≠ 0", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Exists"], filePath);

      const result = await runTickets(["update", "TKT-001"], filePath);

      expect(result.code).not.toBe(0);
    });
  });

  it("status không hợp lệ → exit ≠ 0, invalid status", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "Exists"], filePath);

      const result = await runTickets(
        ["update", "TKT-001", "--status", "nope"],
        filePath
      );

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/invalid status/i);
    });
  });

  it("id sai format → exit ≠ 0, invalid/id", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["update", "abc", "--status", "done"],
        filePath
      );

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/invalid|id/i);
    });
  });

  it("status Done → chuẩn hóa thành done", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Bug login", "--status", "open"],
        filePath
      );

      const updated = await runTickets(
        ["update", "TKT-001", "--status", "Done"],
        filePath
      );
      expect(updated.code).toBe(0);

      const shown = await runTickets(["show", "TKT-001"], filePath);
      expect(shown.stdout).toMatch(/status:\s*done/i);
    });
  });

  it('id "   " → exit ≠ 0, invalid/id/required', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["update", "   ", "--status", "done"],
        filePath
      );

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/invalid|id|required/i);
    });
  });
});
