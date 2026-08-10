import type { Command } from "commander";
import type { TicketService } from "../services/ticket-service";

/**
 * Đăng ký lệnh `tickets show <id>` vào Commander.
 * Parse id → gọi service.show → in chi tiết ticket.
 */
export function registerShowCommand(program: Command, service: TicketService): void {
  program
    .command("show")
    .argument("<id>", "Id ticket, ví dụ TKT-001")
    .action(async (id: string) => {
      const ticket = await service.show(id);
      console.log(`id: ${ticket.id}`);
      console.log(`title: ${ticket.title}`);
      console.log(`description: ${ticket.description}`);
      console.log(`status: ${ticket.status}`);
      console.log(`priority: ${ticket.priority}`);
      console.log(`tags: ${ticket.tags.join(", ")}`);
    });
}
