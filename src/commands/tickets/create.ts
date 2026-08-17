import type { Command } from "commander";
import type { TicketService } from "../../services/tickets/ticket-service";
import { parseTagsOption } from "../parse-tags";

/**
 * Đăng ký lệnh `tickets create` vào Commander.
 * Chỉ parse tham số và gọi service — không chứa rule nghiệp vụ.
 */
export function registerCreateCommand(program: Command, service: TicketService): void {
  program
    .command("create")
    .requiredOption("--title <title>", "Tiêu đề ticket (bắt buộc)")
    .option("--description <description>", "Mô tả")
    .option("--status <status>", "open | in_progress | done")
    .option("--priority <priority>", "low | medium | high")
    .option("--tags <tags>", "Tags cách nhau bởi dấu phẩy, ví dụ bug,ui")
    .action(async (options: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      tags?: string;
    }) => {
      const ticket = await service.create({
        title: options.title,
        description: options.description,
        status: options.status,
        priority: options.priority,
        tags: parseTagsOption(options.tags),
      });
      console.log(ticket.id);
    });
}
