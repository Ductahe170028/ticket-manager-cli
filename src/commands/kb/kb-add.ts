import type { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import type { KBService } from "../../services/kb/kb-service";
import { parseTagsOption } from "../parse-tags";

/**
 * Đăng ký lệnh `kb add` (con của lệnh nhóm `kb`) vào Commander.
 * Đọc nội dung từ `--file` (bắt buộc), suy ra title từ tên file nếu không có `--title`.
 * Việc đọc file/suy title nằm ở đây (tầng CLI) — service chỉ nhận dữ liệu đã sẵn sàng.
 */
export function registerKbAddCommand(kbCommand: Command, service: KBService): void {
  kbCommand
    .command("add")
    .description("Thêm document mới vào Knowledge Base (nội dung đọc từ file --file)")
    .requiredOption("--file <path>", "Đường dẫn file nội dung (bắt buộc)")
    .requiredOption("--path <nodePath>", "Node path để lưu document (bắt buộc)")
    .option("--tags <tags>", "Tags cách nhau bởi dấu phẩy, ví dụ bug,ui")
    .option("--title <title>", "Tiêu đề tùy chỉnh (ưu tiên nếu có, mặc định lấy từ tên file)")
    .action(
      async (options: { file: string; path: string; tags?: string; title?: string }) => {
        let content: string;
        try {
          content = fs.readFileSync(options.file, "utf8");
        } catch {
          throw new Error(`file not found: ${options.file}`);
        }

        const title = options.title ?? path.basename(options.file, ".md");

        const doc = await service.add({
          title,
          content,
          nodePath: options.path,
          tags: parseTagsOption(options.tags),
        });

        console.log(`id: ${doc.id}`);
        console.log(`title: ${doc.title}`);
        console.log(`nodePath: ${doc.nodePath}`);
        console.log(`tags: ${doc.tags.join(", ")}`);
        console.log(`content: ${doc.content}`);
      }
    );
}
