import type { Command } from "commander";
import type { TicketService } from "../../services/tickets/ticket-service";
import { parseTagsOption } from "../parse-tags";

/**
 * Đăng ký lệnh `tickets list` vào Commander.
 * Không filter → liệt kê tất cả; có flag → lọc theo status/priority/tags.
 */
export function registerListCommand(program: Command, service: TicketService): void {
  program
    .command("list")
    .option("--status <status>", "Lọc theo status")
    .option("--priority <priority>", "Lọc theo priority")
    .option("--tags <tags>", "Lọc theo tag (phẩy)")
    .action(async (options: {
      status?: string;
      priority?: string;
      tags?: string;
    }) => {
      const tickets = await service.list({
        status: options.status,
        priority: options.priority,
        tags: parseTagsOption(options.tags),
      });

      for (const ticket of tickets) {
        console.log(`${ticket.id} ${ticket.title}`);
      }
    });
}
