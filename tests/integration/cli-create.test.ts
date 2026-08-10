/**
 * Integration: chạy CLI thật (`tickets create`) với file JSON tạm.
 * Dùng env TICKETS_PATH — không ghi vào data/tickets.json của project.
 */
import * as fs from "fs/promises";
import { runTickets, withTempTicketsFile } from "./helpers/run-cli";

describe("CLI tickets create", () => {
  it("create --title → exit 0, in id, và ghi vào file JSON", async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(
        ["create", "--title", "Bug login"],
        filePath
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/TKT-001/i);

      const fromFile = JSON.parse(await fs.readFile(filePath, "utf8"));
      expect(fromFile).toHaveLength(1);
      expect(fromFile[0].title).toBe("Bug login");
      expect(fromFile[0].id).toBe("TKT-001");
    });
  });

  it('title "" → không tạo ticket, exit khác 0', async () => {
    await withTempTicketsFile(async (filePath) => {
      const result = await runTickets(["create", "--title", ""], filePath);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/title/i);

      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });
  });
});
