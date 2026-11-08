---
name: bat-dau
description: Hướng dẫn người mới dùng Bộ video y khoa có nguồn mà không cần Terminal - điền hồ sơ kênh qua hỏi đáp, đổi tên kênh trên video, mở .env bằng TextEdit để tự dán khoá API, mở video mẫu trong trình duyệt, mở thư mục Raw/Output trong Finder, kiểm tra máy và cập nhật bộ skill. Dùng khi người dùng nói "bắt đầu", "hướng dẫn tôi dùng", "mở video mẫu", "xem các mẫu", "tôi để video ở đâu", "mở thư mục video", "nhập khoá PubMed", "cập nhật bộ skill", "kiểm tra cài đặt", hoặc lần đầu mở thư mục bộ công cụ.
---

# Bắt đầu

Người dùng có thể không biết Terminal. Claude tự chạy mọi lệnh, mỗi bước nói một câu tiếng Việt dễ hiểu, không bảo người dùng gõ lệnh. Mở thứ gì cho người dùng xem thì dùng `open` (Finder, trình duyệt, TextEdit).

**Gốc bộ công cụ** (`$GOC`): thư mục có `cai-dat.sh`. Đang mở thư mục khác hoặc skill được nối ra `~/.claude/skills` thì gốc là thư mục thật của skill (`readlink -f`) đi lên ba cấp, thường là `~/bo-video-y-khoa`. Đọc `$GOC/CLAUDE.md` trước khi làm việc nội dung.

## Lần đầu

1. **Kiểm tra cài đặt:** `bash $GOC/cai-dat.sh --kiem-tra`. Có `THIẾU` thì chạy `bash $GOC/cai-dat.sh --tu-dong --lien-ket` ở chế độ chạy nền và xử lý theo phần "Dành cho Claude Code" trong `$GOC/README.md`.
2. **Hồ sơ kênh:** hỏi từng câu ngắn, có ví dụ, không hỏi dồn: tên kênh; lĩnh vực; ai làm nội dung; ai duyệt nội dung chuyên môn; người xem chính; nơi đăng; giọng văn mong muốn. Điền vào các chỗ `<...>` trong `$GOC/CLAUDE.md`, giữ nguyên các luật còn lại. Đọc lại phần đã điền cho người dùng xác nhận.
3. **Tên trên video:** sửa `name` (và `newsTitle` nếu người dùng muốn đặt tên bản tin) trong `$GOC/remotion-demo/src/brand.ts`, rồi `(cd $GOC/remotion-demo && npx tsc --noEmit)`.
4. **Khoá PubMed (nên có, miễn phí):**
   - Giải thích: khoá giúp tra PubMed nhanh và ổn định hơn; không có vẫn chạy được.
   - Mở trang lấy khoá: `open https://account.ncbi.nlm.nih.gov/settings/` (đăng nhập NCBI, kéo xuống "API Key Management", bấm "Create an API Key").
   - Mở file khoá: `open -e $GOC/.env`. Hướng dẫn dán khoá sau `PUBMED_API_KEY=`, điền email sau `NCBI_EMAIL=`, rồi bấm ⌘S để lưu và đóng TextEdit.
   - **Không hỏi, không đọc, không in khoá trong chat.** Người dùng lỡ dán khoá vào chat thì nhắc họ tạo khoá mới sau, và không lặp lại khoá trong câu trả lời.
   - Kiểm tra mà không lộ khoá: `grep -c '^PUBMED_API_KEY=.\+' $GOC/.env`.
5. **Xem video mẫu:** chạy `(cd $GOC/remotion-demo && npx remotion studio --port 3123 --no-open)` ở chế độ chạy nền, chờ dòng báo sẵn sàng, rồi `open http://localhost:3123`. Giải thích thanh bên trái: mỗi mục là một mẫu; 1-Bac-si-noi-kem-slide, 2-Anh-minh-hoa, 3-Dinh-dang, 4-Studio. Mở video giới thiệu: `open $GOC/docs/gioi-thieu.mp4`.
6. **Gợi ý câu nói đầu tiên** (in thành danh sách):
   - "Kiểm chứng nguồn cho kịch bản này: …" (dán kịch bản)
   - "Tôi có clip bác sĩ nói, dựng video có slide và nguồn"
   - "Tôi có file ghi âm, làm video không lộ mặt"
   - "Làm bản tin từ một nghiên cứu mới về …"
   - "Chuyển kịch bản này thành video hoạt hình có giọng đọc AI"

## Đưa video, ghi âm vào

- Mở thư mục cho người dùng: `mkdir -p $GOC/Raw && open $GOC/Raw`. Hướng dẫn tạo một thư mục con theo tên video (ví dụ `retinol`) rồi kéo clip hoặc file ghi âm vào đó, xong báo tên thư mục.
- Người dùng kéo file thẳng vào ô chat thì Claude nhận được đường dẫn: chép file vào `$GOC/Raw/<ten-video>/`.
- Không mở hay gửi đi file có hình hoặc thông tin người bệnh khi người dùng chưa xác nhận có sự đồng ý; kể cả có đồng ý, không gửi lên công cụ AI bên ngoài.

## Lấy video đã làm

- Video xuất nằm trong `$GOC/Output/`. Mở đúng thư mục bằng `open $GOC/Output/<...>` hoặc chọn sẵn file: `open -R <file.mp4>`.
- Muốn xem trước một khung: render bằng `npx remotion still` rồi `open` ảnh.

## Cập nhật bộ skill

1. `git -C $GOC status --short`. Có file người dùng đã sửa (`CLAUDE.md`, `brand.ts`, kho bằng chứng) thì nói rõ và giữ lại: `git -C $GOC stash` trước khi cập nhật, `git -C $GOC stash pop` sau đó. Gặp xung đột thì cho người dùng xem hai bản và để họ chọn, không tự bỏ phần của họ.
2. `git -C $GOC pull --ff-only`, rồi `bash $GOC/cai-dat.sh --tu-dong --lien-ket` ở chế độ chạy nền.
3. Tóm tắt có gì mới bằng `git -C $GOC log --oneline -5`.

## Khi có lỗi

- Đọc lỗi, sửa nếu sửa được, rồi nói ngắn gọn đã làm gì. Không dán nguyên log dài cho người dùng.
- Cần người dùng thao tác (hộp thoại cài đặt, đăng nhập trang web, cho phép quyền) thì mô tả đúng nút cần bấm.
- Lỗi lặp lại sau hai lần sửa thì dừng, nói rõ đang vướng ở đâu và gợi ý xem `HUONG-DAN-CAI-DAT.md` mục "Lỗi hay gặp".
