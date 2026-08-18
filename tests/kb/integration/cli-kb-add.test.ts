/**
 * Integration: CLI `tickets kb add --file <path> --path <nodePath> [--tags] [--title]` — case E1-E6.
 * Dùng MockKBClient mặc định. Đụng file thật (không mock fs) vì đây đúng là hành vi cần kiểm.
 */
import { runTickets, withTempTicketsFile, withTempSourceFile } from "../../helpers/run-cli";

describe("CLI kb add", () => {
  it("E1/E6: --file + --path + --tags hợp lệ -> exit 0, tạo document mới với content đúng file, tags chuẩn hóa", async () => {
    await withTempSourceFile(
      "Nội dung tài liệu mới cần thêm vào Knowledge Base.",
      async (filePath) => {
        await withTempTicketsFile(async (ticketsPath) => {
          const result = await runTickets(
            [
              "kb",
              "add",
              "--file",
              filePath,
              "--path",
              "/new/node",
              "--tags",
              " Bug , bug, UI",
            ],
            ticketsPath
          );

          expect(result.code).toBe(0);
          expect(result.stdout).toMatch(/id:\s*\S+/);
          expect(result.stdout).toMatch(/nodePath:\s*\/new\/node/);
          expect(result.stdout).toMatch(/Nội dung tài liệu mới cần thêm vào Knowledge Base\./);
          expect(result.stdout).toMatch(/tags:\s*bug,\s*ui/);
        });
      }
    );
  });

  it("E6: không truyền --tags -> vẫn thành công, tags rỗng", async () => {
    await withTempSourceFile("Nội dung không kèm tags.", async (filePath) => {
      await withTempTicketsFile(async (ticketsPath) => {
        const result = await runTickets(
          ["kb", "add", "--file", filePath, "--path", "/new/node"],
          ticketsPath
        );

        expect(result.code).toBe(0);
        expect(result.stdout).toMatch(/tags:\s*($|\n)/m);
      });
    });
  });

  it("Không truyền --title -> title lấy từ tên file (bỏ đuôi .md)", async () => {
    await withTempSourceFile(
      "Nội dung.",
      async (filePath) => {
        await withTempTicketsFile(async (ticketsPath) => {
          const result = await runTickets(
            ["kb", "add", "--file", filePath, "--path", "/new/node"],
            ticketsPath
          );

          expect(result.code).toBe(0);
          expect(result.stdout).toMatch(/title:\s*refund-template/);
        });
      },
      "refund-template.md"
    );
  });

  it("Có --title -> ưu tiên dùng --title, không lấy từ tên file", async () => {
    await withTempSourceFile(
      "Nội dung.",
      async (filePath) => {
        await withTempTicketsFile(async (ticketsPath) => {
          const result = await runTickets(
            [
              "kb",
              "add",
              "--file",
              filePath,
              "--path",
              "/new/node",
              "--title",
              "Tên tùy chỉnh",
            ],
            ticketsPath
          );

          expect(result.code).toBe(0);
          expect(result.stdout).toMatch(/title:\s*Tên tùy chỉnh/);
        });
      },
      "refund-template.md"
    );
  });

  it("E2: thiếu --file -> exit ≠ 0, không tạo document", async () => {
    await withTempTicketsFile(async (ticketsPath) => {
      const result = await runTickets(["kb", "add", "--path", "/new/node"], ticketsPath);

      expect(result.code).not.toBe(0);
    });
  });

  it("E3: --file trỏ tới file không tồn tại -> exit ≠ 0, báo lỗi rõ, không crash", async () => {
    await withTempTicketsFile(async (ticketsPath) => {
      const result = await runTickets(
        ["kb", "add", "--file", "/khong/ton/tai/xyz.md", "--path", "/new/node"],
        ticketsPath
      );

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/not found|no such file|enoent/i);
    });
  });

  it("E4: thiếu --path -> exit ≠ 0, không tạo document", async () => {
    await withTempSourceFile("Nội dung.", async (filePath) => {
      await withTempTicketsFile(async (ticketsPath) => {
        const result = await runTickets(["kb", "add", "--file", filePath], ticketsPath);

        expect(result.code).not.toBe(0);
      });
    });
  });

  it('--path "   " (chỉ khoảng trắng) -> exit ≠ 0, không tạo document', async () => {
    await withTempSourceFile("Nội dung.", async (filePath) => {
      await withTempTicketsFile(async (ticketsPath) => {
        const result = await runTickets(
          ["kb", "add", "--file", filePath, "--path", "   "],
          ticketsPath
        );

        expect(result.code).not.toBe(0);
        expect(result.stderr).toMatch(/nodePath/i);
      });
    });
  });
});
