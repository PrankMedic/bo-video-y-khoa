# Hồ sơ kênh

Claude đọc file này đầu mỗi phiên. Điền các chỗ `<...>` trước khi dùng. Sau này khi bạn sửa một lỗi Claude có thể lặp lại, Claude sẽ đề xuất thêm một dòng luật vào đây.

## Kênh

- Tên kênh: `<TÊN KÊNH>` (cũng đổi trong `remotion-demo/src/brand.ts`)
- Lĩnh vực: `<ví dụ: da liễu thẩm mỹ, dược lâm sàng, dinh dưỡng>`
- Người làm nội dung: `<tên hoặc vai trò>`
- Người duyệt nội dung chuyên môn: `<tên hoặc vai trò>`
- Người xem chính: `<ví dụ: người 20–35 tuổi tìm hiểu chăm sóc da>`
- Nơi đăng: `<TikTok, Facebook Reels, YouTube Shorts...>`

## Cách làm việc

- Trả lời và viết nội dung bằng tiếng Việt. Thuật ngữ chuyên môn có thể giữ tiếng Anh trong ngoặc.
- Mọi thông tin y khoa phải có nguồn: tác giả hoặc tổ chức, năm, link, ngày truy cập. Không tìm được nguồn thì nói rõ, không suy đoán.
- Gọi thuốc theo tên hoạt chất. Chỉ dùng tên thương mại khi bối cảnh thực sự cần.
- Chỉ trích PMID/DOI đã tra được trong phiên làm việc, hoặc có trong `tai-lieu/kho-bang-chung/` kèm ngày kiểm chứng. Không ghi từ trí nhớ.
- Câu hỏi về hoạt chất, liệu trình: đọc `tai-lieu/kho-bang-chung/INDEX.md` trước khi tìm trên PubMed.
- Trước khi báo xong, tự kiểm tra: chạy thử script, mở file vừa tạo, xem khung hình, đối chiếu số liệu với nguồn.

## Nội dung

- Giọng văn: `<ví dụ: chuyên môn nhưng gần gũi, như bác sĩ giải thích cho người bệnh>`.
- Không cam kết kết quả điều trị, không dùng từ tuyệt đối ("tốt nhất", "duy nhất", "khỏi hẳn"), không so sánh hạ thấp nơi khác.
- Nội dung về hoạt chất, liệu trình, thiết bị phải nêu chống chỉ định hoặc lưu ý khi có.
- Dòng nguồn trên video là điểm khác biệt của kênh: luôn kiểm chứng trên PubMed và hiện nguồn, để người xem tự kiểm tra.
- Câu không chắc có được phép quảng cáo hay không: đánh dấu để người duyệt quyết, Claude không tự quyết.
- Video quảng bá dịch vụ của chính kênh: bật khai báo nội dung thương mại của nền tảng. Hình hoặc giọng tạo bằng AI: gắn nhãn AI.
- Ảnh trước/sau hoặc ảnh người bệnh chỉ đăng khi đã có sự đồng ý bằng văn bản. Kể cả khi đã đồng ý, không gửi ảnh, video hay thông tin người bệnh cho Claude, Codex, Gemini hay Google Flow: tự dựng phần đó.

## Dữ liệu nhạy cảm

- Không đưa thông tin nhận diện người bệnh, khách hàng hay kết quả xét nghiệm của một người cụ thể vào file, prompt hay video. Gặp dữ liệu như vậy thì dừng lại và hỏi trước.
- Khoá API để trong `.env`, không viết vào code hay file này.
- Prompt gửi cho Codex, Gemini, Antigravity hay Google Flow đều ra khỏi máy: chỉ gửi phần cần thiết, không gửi dữ liệu người bệnh.

## Video

- `Raw/<tên-video>/`: clip hoặc ghi âm gốc. `Output/`: dự án và video xuất. Cả hai không lên git.
- Dùng lại script trong `work/`, không viết lại từ đầu. Kiểm tra máy: `python3 work/cong_cu.py`.
- Trước khi dựng: review nội dung một vòng, đề xuất một định dạng phù hợp nhất, chờ chọn rồi mới dựng. Đã nói rõ định dạng thì không hỏi lại.
- Giọng thật: chạy `work/tim_loi_noi.py` trên âm thanh gốc trước khi cắt và trên bản cuối, vì phụ đề rút gọn sẽ che chỗ nói vấp.
- Phụ đề đúng chính tả, đúng thuật ngữ. Tên hoạt chất giữ cách viết quốc tế (ví dụ azelaic acid).
- Remotion luôn chạy với `--port` khác 3000. Không render MP4 khi chưa được yêu cầu xuất; trong lúc làm kiểm tra bằng khung hình tĩnh.
