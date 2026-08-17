/**
 * Integration: CLI `tickets list` với file JSON tạm (TICKETS_PATH).
 * Seed bằng CLI create trên cùng file — không đụng data/tickets.json.
 *
 * Output list kỳ vọng: stdout chứa id (TKT-xxx) của ticket được liệt kê.
 */
import { runTickets, withTempTicketsFile } from "../../helpers/run-cli";

describe("CLI tickets list", () => {
  it("kho trống → exit 0, không in TKT-", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["list"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout).not.toMatch(/TKT-\d+/i);
    });
  });

  it("có ticket, không filter → hiện đủ id đã create", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(["create", "--title", "First"], filePath);
      await runTickets(["create", "--title", "Second"], filePath);

      const result = await runTickets(["list"], filePath);

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).toMatch(/TKT-002/i);
    });
  });

  it("--status=open → chỉ ticket open", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Open one", "--status", "open"],
        filePath
      );
      await runTickets(
        ["create", "--title", "Done one", "--status", "done"],
        filePath
      );

      const result = await runTickets(
        ["list", "--status", "open"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).not.toMatch(/TKT-002/i);
    });
  });

  it("--priority=high → chỉ ticket high", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "High one", "--priority", "high"],
        filePath
      );
      await runTickets(
        ["create", "--title", "Low one", "--priority", "low"],
        filePath
      );

      const result = await runTickets(
        ["list", "--priority", "high"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).not.toMatch(/TKT-002/i);
    });
  });

  it("--tags=bug,ui → AND (phải có đủ cả hai tag)", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Both", "--tags", "bug,ui"],
        filePath
      );
      await runTickets(
        ["create", "--title", "Only bug", "--tags", "bug"],
        filePath
      );

      const result = await runTickets(
        ["list", "--tags", "bug,ui"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).not.toMatch(/TKT-002/i);
    });
  });

  it("--status=open --priority=high → AND giữa hai loại filter", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        [
          "create",
          "--title",
          "Open high",
          "--status",
          "open",
          "--priority",
          "high",
        ],
        filePath
      );
      await runTickets(
        [
          "create",
          "--title",
          "Open low",
          "--status",
          "open",
          "--priority",
          "low",
        ],
        filePath
      );
      await runTickets(
        [
          "create",
          "--title",
          "Done high",
          "--status",
          "done",
          "--priority",
          "high",
        ],
        filePath
      );

      const result = await runTickets(
        ["list", "--status", "open", "--priority", "high"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);
      expect(result.stdout).not.toMatch(/TKT-002/i);
      expect(result.stdout).not.toMatch(/TKT-003/i);
    });
  });

  it("filter hợp lệ nhưng không khớp → exit 0, không in TKT-", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Open only", "--status", "open"],
        filePath
      );

      const result = await runTickets(
        ["list", "--status", "done"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).not.toMatch(/TKT-\d+/i);
    });
  });

  it("--status không hợp lệ → exit 0, không in TKT-", async () => {
    await withTempTicketsFile(async (filePath) => {
      await runTickets(
        ["create", "--title", "Open only", "--status", "open"],
        filePath
      );

      const result = await runTickets(
        ["list", "--status", "not-a-status"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).not.toMatch(/TKT-\d+/i);
    });
  });
});
