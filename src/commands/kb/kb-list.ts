import type { Command } from "commander";
import type { KBService } from "../../services/kb/kb-service";

/**
 * Đăng ký lệnh `kb list` (con của lệnh nhóm `kb`) vào Commander.
 * Không truyền `--node` → liệt kê toàn bộ. Chỉ parse tham số và gọi service.
 */
export function registerKbListCommand(kbCommand: Command, service: KBService): void {
  kbCommand
    .command("list")
    .description("Liệt kê document trong Knowledge Base (không lọc --node -> liệt kê toàn bộ)")
    .option("--node <nodePath>", "Lọc theo node path")
    .option("--limit <n>", "Số kết quả tối đa")
    .action(async (options: { node?: string; limit?: string }) => {
      const limit = options.limit !== undefined ? Number(options.limit) : undefined;
      const documents = await service.list(options.node, limit);
      for (const doc of documents) {
        console.log(`${doc.id} ${doc.title}`);
      }
    });
}
