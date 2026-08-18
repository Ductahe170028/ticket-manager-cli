import { createKbServer } from "./create-kb-server";

/**
 * Entry chạy server KB thật: `npm run kb-server` → nghe liên tục ở PORT (mặc định 4000).
 * Dùng để demo `tickets kb ...` chạy qua HTTP thật (KB_CLIENT=http), không cần server công ty.
 */
const port = Number(process.env.PORT ?? 4000);

const server = createKbServer();
server.listen(port, () => {
  console.log(`KB server đang chạy tại http://localhost:${port}`);
});
