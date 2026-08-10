import type { Command } from "commander";
import type { TicketService } from "../services/ticket-service";

/**
 * Đăng ký lệnh `tickets update <id> --status ...` vào Commander.
 * Parse id + status → gọi service.updateStatus → in kết quả.
 */
export function registerUpdateCommand(program: Command, service: TicketService): void {
  program
    .command("update")
    .argument("<id>", "Id ticket, ví dụ TKT-001")
    .requiredOption("--status <status>", "Status mới: open | in_progress | done")
    .action(async (id: string, options: { status: string }) => {
      const ticket = await service.updateStatus(id, options.status);
      console.log(`${ticket.id} ${ticket.status}`);
    });
}
