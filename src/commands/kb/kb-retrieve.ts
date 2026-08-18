import type { Command } from "commander";
import type { KBService } from "../../services/kb/kb-service";

/**
 * Đăng ký lệnh `kb retrieve <docId>` (con của lệnh nhóm `kb`) vào Commander.
 * In đầy đủ document (khác search/list chỉ in id + title) — chỉ parse tham số và gọi service.
 */
export function registerKbRetrieveCommand(kbCommand: Command, service: KBService): void {
  kbCommand
    .command("retrieve <docId>")
    .description("Lấy đầy đủ nội dung 1 document trong Knowledge Base theo id")
    .action(async (docId: string) => {
      const doc = await service.retrieve(docId);
      console.log(`id: ${doc.id}`);
      console.log(`title: ${doc.title}`);
      console.log(`nodePath: ${doc.nodePath}`);
      console.log(`tags: ${doc.tags.join(", ")}`);
      console.log(`content: ${doc.content}`);
    });
}
