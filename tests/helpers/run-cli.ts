/**
 * Helper chạy CLI tickets với file JSON tạm (TICKETS_PATH).
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

const execFileAsync = promisify(execFile);
const projectRoot = path.join(__dirname, "../..");
const tsxCli = require.resolve("tsx/cli");
const indexTs = path.join(projectRoot, "src", "index.ts");

/** Chạy `tickets ...` với TICKETS_PATH trỏ file tạm. */
export async function runTickets(
  args: string[],
  ticketsPath: string
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [tsxCli, indexTs, ...args],
      {
        cwd: projectRoot,
        env: { ...process.env, TICKETS_PATH: ticketsPath },
        encoding: "utf8",
      }
    );
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      code: typeof e.code === "number" ? e.code : 1,
    };
  }
}

/** Tạo file JSON tạm cho mỗi test, xong thì xóa. */
export async function withTempTicketsFile(
  run: (filePath: string) => Promise<void>,
  prefix = "tickets-cli-"
): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  const filePath = path.join(dir, "tickets.json");
  try {
    await run(filePath);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
