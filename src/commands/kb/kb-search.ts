import type { Command } from "commander";
import type { KBService } from "../../services/kb/kb-service";

/**
 * Đăng ký lệnh `kb search <query>` (con của lệnh nhóm `kb`) vào Commander.
 * Chỉ parse tham số và gọi service — không chứa rule nghiệp vụ.
 */
export function registerKbSearchCommand(kbCommand: Command, service: KBService): void {
  kbCommand
    .command("search <query>")
    .description("Tìm document trong Knowledge Base theo từ khóa (khớp title trước, content sau)")
    .option("--top-k <n>", "Số kết quả tối đa", "5")
    .action(async (query: string, options: { topK: string }) => {
      const results = await service.search(query, Number(options.topK));
      for (const result of results) {
        console.log(`${result.document.id} ${result.document.title}`);
      }
    });
}
