#!/usr/bin/env node
import path from "path";
import { Command } from "commander";
import { registerCreateCommand } from "./commands/tickets/create";
import { registerListCommand } from "./commands/tickets/list";
import { registerShowCommand } from "./commands/tickets/show";
import { registerUpdateCommand } from "./commands/tickets/update";
import { createTicketService } from "./services/tickets/ticket-service";
import { createJsonTicketStore } from "./storage/json-ticket-store";
import { registerKbSearchCommand } from "./commands/kb/kb-search";
import { registerKbListCommand } from "./commands/kb/kb-list";
import { registerKbRetrieveCommand } from "./commands/kb/kb-retrieve";
import { createKbService } from "./services/kb/kb-service";
import { createMockKbClient } from "./clients/mock-kb-client";

/**
 * Điểm vào CLI: gắn JSON store + service + đăng ký các lệnh tickets, kb.
 */
async function main(): Promise<void> {
  const dataPath =
    process.env.TICKETS_PATH ?? path.join(process.cwd(), "data", "tickets.json");

  const store = createJsonTicketStore(dataPath);
  const service = createTicketService(store);

  // KB_CLIENT (mock | http) — env switch sẽ làm ở case G. Hiện luôn dùng MockKBClient.
  const kbClient = createMockKbClient();
  const kbService = createKbService(kbClient);

  const program = new Command();
  program.name("tickets").description("Ticket Manager CLI").version("1.0.0");

  registerCreateCommand(program, service);
  registerListCommand(program, service);
  registerShowCommand(program, service);
  registerUpdateCommand(program, service);

  const kbCommand = program.command("kb").description("Thao tác với Knowledge Base");
  registerKbSearchCommand(kbCommand, kbService);
  registerKbListCommand(kbCommand, kbService);
  registerKbRetrieveCommand(kbCommand, kbService);

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
