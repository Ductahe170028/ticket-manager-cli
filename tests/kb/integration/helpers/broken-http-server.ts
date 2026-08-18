import * as http from "http";
import type { AddressInfo } from "net";

/**
 * Server "hỏng" dùng riêng cho test lỗi (F5-F6) — luôn trả về status/body cố định
 * bất kể request gì, mô phỏng server thật bị lỗi (4xx/5xx) hoặc trả response không
 * phải JSON hợp lệ. Không dùng createKbServer thật vì đây là hành vi LỖI, không phải
 * hành vi đúng của server.
 */
export async function startBrokenServer(
  status: number,
  body: string
): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer((_req, res) => {
    res.writeHead(status, { "Content-Type": "text/plain" });
    res.end(body);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}`;

  return {
    url,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
