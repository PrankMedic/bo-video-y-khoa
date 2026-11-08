---
name: goi-gemini
description: Giao việc cho Gemini qua Gemini API bằng khoá API (script gemini.py) để có ý kiến thứ hai, review văn bản hoặc tóm tắt, rồi đọc và kiểm tra kết quả. Dùng khi người dùng nói "nhờ Gemini", "hỏi Gemini", "để Gemini review/viết thử". Không điều khiển app Antigravity.
---

# Gọi Gemini

Script gọi thẳng Gemini API bằng `GEMINI_API_KEY` trong `.env`. Gemini chỉ đọc nội dung được gửi và trả lời văn bản, không tự mở, sửa file hay chạy lệnh. Việc ghi file do Claude làm sau khi kiểm tra.

## Trước khi gọi

- Không đưa thông tin nhận diện người bệnh vào prompt hoặc file đính kèm.
- Không dùng Gemini để tư vấn y tế hay ra quyết định lâm sàng: điều khoản Gemini API không cho phép (https://ai.google.dev/gemini-api/terms).
- Với gói miễn phí, Google có thể dùng dữ liệu gửi lên để cải thiện sản phẩm. Chưa biết khoá thuộc gói nào thì coi là miễn phí và không gửi tài liệu nội bộ.
- Gemini không đọc `CLAUDE.md`: viết quy tắc liên quan thẳng vào prompt.

## Lệnh

Chạy từ gốc bộ công cụ, prompt truyền qua stdin:

```bash
python3 .claude/skills/goi-gemini/scripts/gemini.py -f "<file đính kèm>" -o /tmp/gemini_ket_qua.txt - < /tmp/gemini_prompt.txt
```

- `-f` đính kèm file văn bản, dùng được nhiều lần. Chỉ đính kèm file cần thiết.
- `-m` đổi model; `--models` xem các model khoá này gọi được. Script dừng sau 120 giây nếu không có phản hồi.
- Dòng token và lý do kết thúc in ra stderr. Có cảnh báo câu trả lời bị cắt hoặc bị chặn thì báo lại người dùng.

## Sau khi gọi

Kết quả là bản nháp. Nội dung y khoa từ Gemini chưa được coi là có nguồn: PMID/DOI tra lại theo skill `kiem-chung-nguon`. Nói rõ phần nào do Gemini làm.

Muốn Gemini xem ảnh hoặc thư mục file (tờ duyệt khung hình) thì dùng skill `goi-antigravity`.
