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

/**
 * Chạy `tickets ...` với TICKETS_PATH trỏ file tạm.
 * Mặc định luôn ép KB_CLIENT/KB_API_URL rỗng (-> MockKBClient) để test không bị ảnh hưởng bởi
 * file `.env` trên máy dev (ví dụ ai đó đang để KB_CLIENT=http lúc test tay server thật).
 * `extraEnv` — biến môi trường bổ sung (ví dụ KB_CLIENT, KB_API_URL cho case G) — key có
 * mặt trong `extraEnv` sẽ đè lên 2 giá trị mặc định rỗng bên trên.
 */
export async function runTickets(
  args: string[],
  ticketsPath: string,
  extraEnv: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [tsxCli, indexTs, ...args],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          TICKETS_PATH: ticketsPath,
          KB_CLIENT: "",
          KB_API_URL: "",
          ...extraEnv,
        },
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

/**
 * Tạo 1 file nguồn tạm (nội dung `content`, tên `filename`) để test `kb add --file <path>` —
 * dùng file thật (không mock fs) vì bản thân việc đọc file cũng nằm trong hành vi cần kiểm.
 * Xong thì xóa cả thư mục tạm.
 */
export async function withTempSourceFile(
  content: string,
  run: (filePath: string) => Promise<void>,
  filename = "sample-doc.md"
): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kb-add-source-"));
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, "utf8");
  try {
    await run(filePath);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
