import type { AddressInfo } from "net";
import { createKbServer } from "../../../../src/server/create-kb-server";

/**
 * Khởi động server KB thật (createKbServer — dùng chung logic với src/server/index.ts,
 * không viết route 2 lần — xem decisions.vi.md mục 9) ở cổng ngẫu nhiên (`.listen(0)`),
 * dùng cho test HTTPKBClient. Trả về `url` để client trỏ tới + `close()` để tắt sau test.
 */
export async function startFakeKbServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createKbServer();

  await new Promise<void>((resolve) => server.listen(0, resolve));

  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}`;

  return {
    url,
    close: () => new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}
