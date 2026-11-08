---
name: goi-codex
description: Giao việc cho OpenAI Codex CLI qua `codex exec` (review, viết file dữ liệu, sửa code trong một thư mục), rồi đọc và kiểm tra kết quả. Dùng khi người dùng nói "nhờ Codex", "giao cho Codex", "để Codex làm/review", hoặc muốn ý kiến thứ hai từ GPT. Không dùng cho Gemini hay Antigravity.
---

# Gọi Codex

Cần Codex CLI đã đăng nhập (`npm i -g @openai/codex`, rồi `codex login`). Mỗi lần gọi dùng hạn mức ChatGPT của người dùng.

```bash
CODEX=${CODEX_BIN:-$(command -v codex || echo /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex)}
[ -x "$CODEX" ] || echo "Chưa có Codex CLI, xem HUONG-DAN-CAI-DAT.md mục 6"
```

## Trước khi gọi

- Prompt và mọi file Codex đọc đều gửi lên OpenAI. Không đưa thông tin nhận diện người bệnh hay tài liệu mật vào prompt hoặc thư mục Codex được đọc.
- Không chạy ở thư mục có `.env` khi không cần. Việc chỉ đọc thì chép file cần thiết sang một thư mục riêng.
- Codex đọc `AGENTS.md` ở gốc bộ công cụ. Quy tắc riêng của việc này viết thẳng vào prompt.

## Lệnh

Ghi prompt ra file rồi truyền qua stdin để tránh lỗi dấu ngoặc với tiếng Việt. Câu trả lời cuối nằm trong file của `-o`.

Chỉ đọc (hỏi đáp, review, phân tích):

```bash
"$CODEX" exec --sandbox read-only -C "<thư mục>" -o /tmp/codex_ket_qua.txt - < /tmp/codex_prompt.txt
```

Được sửa file trong thư mục (khi người dùng muốn Codex làm phần viết):

```bash
"$CODEX" exec --sandbox workspace-write -C "<thư mục>" -o /tmp/codex_ket_qua.txt - < /tmp/codex_prompt.txt
```

- Không dùng `--dangerously-bypass-approvals-and-sandbox`.
- Thư mục ngoài git repo thì thêm `--skip-git-repo-check`.
- Việc dài trên 2 phút thì chạy nền. Có giới hạn thời gian sẵn: `.claude/skills/video-flow-minh-hoa/scripts/giao.sh codex <brief.md> [phút]`.

## Sau khi gọi

Kết quả của Codex là bản nháp:

- Codex sửa file: xem `git diff` hoặc so file, chạy thử (`npx tsc --noEmit`, render khung), chỉ giữ những gì đã đọc.
- Nội dung y khoa từ Codex chưa được coi là có nguồn. PMID/DOI phải tra lại theo skill `kiem-chung-nguon`.
- Nói rõ phần nào do Codex làm khi báo lại.
