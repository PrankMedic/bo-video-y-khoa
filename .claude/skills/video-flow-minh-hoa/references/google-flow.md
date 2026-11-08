# Tạo ảnh trên Google Flow

Giao diện Flow đổi thường xuyên. Không dùng toạ độ cố định: chụp màn hình nhỏ (scale 0.5) rồi mới bấm.

## Mở dự án

- Dùng Claude in Chrome, Chrome của người dùng đã đăng nhập tài khoản có Flow. Không tự đăng nhập, không dùng tab có sẵn, không đụng dự án cũ.
- Vào `https://labs.google/fx/tools/flow`, bấm tạo dự án mới, đóng hộp giới thiệu nếu có. Tắt chế độ tác nhân và khung trợ lý nếu có.
- Chọn tạo `Hình ảnh`, tỉ lệ `9:16`, một ảnh mỗi lượt. Đọc dòng báo số tín dụng trước khi gửi; tốn tín dụng thì hỏi người dùng.

## Gửi prompt

- Gõ bằng thao tác bàn phím (`computer type`), không chèn bằng JavaScript. Bắt đầu prompt bằng `S01.`.
- **Gửi bằng phím Return, không bấm nút mũi tên.** Prompt dài làm ô nhập phình lên và nút gửi đổi chỗ.
- Khung nhìn có thể đổi kích thước: chụp lại sau ảnh đầu tiên để lấy vị trí ô nhập, rồi mới gom phần còn lại.
- Gom prompt trong một `browser_batch`: bấm ô nhập, gõ, Return, chờ 2 giây. Ảnh xong sau khoảng 30 giây.

## Tải ảnh

- Ảnh mới nhất thường đứng đầu, nên tải từ trái sang phải sẽ ra S10 đến S01 (mặc định `--order newest-first` của `flow_collect.py`).
- Mỗi ảnh: mở ảnh, chờ 2 giây, bấm tải, chọn độ phân giải cao, chờ khoảng 10 giây vì Flow nâng phân giải rồi mới tải.
- Tải 2–3 ảnh mỗi lượt, kiểm tra `~/Downloads` sau mỗi lượt, không chạy song song.
- Ảnh không về sau 3 lần thử: nhờ người dùng tải tay. Không lấy link ảnh qua đường khác.

Đóng tab khi xong. Dự án Flow vẫn nằm trong tài khoản của người dùng.
