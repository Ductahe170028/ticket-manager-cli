#!/usr/bin/env node
import path from "path";
import { Command } from "commander";
import { registerCreateCommand } from "./commands/tickets/create";
import { registerListCommand } from "./commands/tickets/list";
import { registerShowCommand } from "./commands/tickets/show";
import { registerUpdateCommand } from "./commands/tickets/update";
import { createTicketService } from "./services/tickets/ticket-service";
import { createJsonTicketStore } from "./storage/json-ticket-store";

/**
 * Điểm vào CLI: gắn JSON store + service + đăng ký các lệnh tickets.
 */
async function main(): Promise<void> {
  const dataPath =
    process.env.TICKETS_PATH ?? path.join(process.cwd(), "data", "tickets.json");

  const store = createJsonTicketStore(dataPath);
  const service = createTicketService(store);

  const program = new Command();
  program.name("tickets").description("Ticket Manager CLI").version("1.0.0");

  registerCreateCommand(program, service);
  registerListCommand(program, service);
  registerShowCommand(program, service);
  registerUpdateCommand(program, service);

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
