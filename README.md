# Bộ video y khoa có nguồn

Bộ công cụ cho Claude Code để dựng video dọc ngắn về sức khoẻ: lời nói có phụ đề karaoke, slide số liệu, ảnh minh hoạ, và **dòng nguồn PubMed trên màn hình** để người xem tự kiểm tra. Bộ được tách ra từ quy trình đang dùng thật ở một phòng khám da liễu, đã bỏ mọi thông tin riêng.

Bạn nói với Claude bằng tiếng Việt, ví dụ "kiểm chứng nguồn cho kịch bản này", "dựng video slide cho clip X" hay "làm bản tin từ bài PubMed này". Claude sẽ tự chọn skill phù hợp.

## Bộ này làm được gì

| Skill | Bạn đưa vào | Bạn nhận về |
|---|---|---|
| `kiem-chung-nguon` | Kịch bản, phụ đề hoặc slide | Bảng claim chấm ✅ 🟡 ⚪ 🔴, danh mục nguồn có PMID/DOI, kho bằng chứng dùng lại được |
| `video-slide-chuyen-mon` | Clip người nói | Video 9:16 có khung tròn người nói, slide nội dung, slide số liệu nghiên cứu, nhạc nền tự giảm |
| `video-flow-minh-hoa` | Clip hoặc file ghi âm | Video không lộ mặt: ảnh minh hoạ (Google Flow) xen slide số liệu, giá và nguồn |
| `dinh-dang-video` | Clip, ghi âm hoặc chỉ text | Chọn một trong 6 định dạng: Thẳng mặt, Tạp chí, Phủ đồ hoạ, Bản ngang 16:9, Hoạt hình, Sổ tay |
| `ban-tin-pubmed` | Một chủ đề | Bản tin 60 giây từ toàn văn một nghiên cứu, có chặn số sai, giọng AI |
| `bat-dau` | "bắt đầu", "mở video mẫu", "cập nhật bộ skill" | Điền hồ sơ kênh, nhập khoá, xem mẫu, mở thư mục, cập nhật, không cần Terminal |
| `goi-codex`, `goi-gemini`, `goi-antigravity` | (tuỳ chọn) | Giao phần viết code, góp ý hình cho tác nhân khác để tiết kiệm token Claude |

## Cài đặt: chỉ cần dán link vào Claude Code

Không cần biết Terminal.

1. Mở app **Claude** trên Mac, vào tab **Code**.
2. Dán vào ô chat: **Cài bộ skill này cho tôi: https://github.com/PrankMedic/bo-video-y-khoa**
3. Claude tự làm hết. Khi Claude xin phép chạy lệnh, bấm **Cho phép**. Nếu máy hiện hộp thoại cài đặt của Apple hoặc trình cài Homebrew, bấm **Cài đặt** và nhập mật khẩu máy Mac của bạn (chỉ nhập vào hộp thoại của máy, không nhập vào ô chat).
4. Cài xong (5–15 phút, tuỳ mạng), mở thư mục **bo-video-y-khoa** (trong thư mục nhà của bạn) bằng Claude Code và nói **"bắt đầu"**. Claude sẽ hỏi tên kênh, lĩnh vực, người duyệt nội dung, rồi mở video mẫu cho bạn xem.

Sau đó chỉ cần nói việc muốn làm, ví dụ "kiểm chứng nguồn cho kịch bản này", "dựng video slide cho clip tôi vừa bỏ vào thư mục Raw", "làm bản tin từ bài PubMed về vitamin C". Cập nhật bản mới: nói "cập nhật bộ skill".

Xem video giới thiệu 52 giây: [docs/gioi-thieu.mp4](docs/gioi-thieu.mp4).

### Dành cho Claude Code: cách cài khi người dùng dán link này

Người dùng có thể không biết Terminal. Tự chạy mọi lệnh, giải thích từng bước bằng một câu tiếng Việt, không bảo người dùng gõ lệnh.

1. Thư mục cài là `~/bo-video-y-khoa`. Đã có thư mục đó thì `git -C ~/bo-video-y-khoa pull --ff-only` thay vì tải lại.
2. Chưa có thì tải về: `git clone https://github.com/PrankMedic/bo-video-y-khoa.git ~/bo-video-y-khoa`. Máy chưa có Command Line Tools thì lệnh `git` sẽ làm macOS hiện hộp thoại cài: nói người dùng bấm Cài đặt, chờ họ báo xong rồi chạy lại.
3. Chạy `bash ~/bo-video-y-khoa/cai-dat.sh --tu-dong --lien-ket` ở chế độ chạy nền (tải model Whisper khoảng 0,5 GB và thư viện khoảng 1 GB), đọc kết quả khi xong.
   - Kết quả có `CẦN_HOMEBREW`: script đã mở trang tải Homebrew. Hướng dẫn người dùng tải file `.pkg` mới nhất ở mục Assets, bấm đúp, cài, nhập mật khẩu máy trong trình cài. Không tự cài Homebrew bằng lệnh có `sudo`, không hỏi mật khẩu trong chat. Người dùng báo xong thì chạy lại bước 3.
   - Kết quả có `CẦN_CLT`: hộp thoại cài Command Line Tools đã mở; chờ người dùng cài xong rồi chạy lại bước 3.
   - Mục `THIẾU` khác: xử lý theo `HUONG-DAN-CAI-DAT.md` trong thư mục cài, rồi chạy lại bước 3.
4. Thấy `XONG`: mở ảnh khung thử cho người dùng xem bằng `open ~/bo-video-y-khoa/Output/mau/khung-thu.jpg`.
5. Nói người dùng: mở thư mục `bo-video-y-khoa` trong thư mục nhà bằng Claude Code (app Claude → Code → chọn thư mục), rồi nói "bắt đầu". Skill `bat-dau` lo phần còn lại: hồ sơ kênh, khoá API, xem video mẫu.

Trợ lý khác (Codex, Antigravity): cài giống hệt; skill nằm ở `.agents/skills/` của thư mục cài, mở thư mục đó là dùng được. `--lien-ket` chỉ nối cho Claude Code.

Không đọc, in hay hỏi xin khoá API trong chat. Người dùng tự dán khoá vào `.env` (skill `bat-dau` mở file bằng TextEdit cho họ).

Người dùng quen Terminal có thể tự chạy ba lệnh: `git clone` như bước 2, `cd ~/bo-video-y-khoa`, `bash cai-dat.sh`. Chi tiết từng thư viện, cách cài tay và sửa lỗi: [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md).

## Cấu trúc

```
bo-video-y-khoa/
├── CLAUDE.md                 hồ sơ kênh và luật nội dung, Claude đọc mỗi phiên
├── AGENTS.md                 luật tương tự cho Codex và Antigravity
├── .env.example              mẫu khoá API (chép thành .env)
├── cai-dat.sh                cài và kiểm tra máy
├── .claude/skills/           các skill
├── work/                     script Python dùng chung (gỡ băng, dò nói vấp, giọng AI, kiểm số)
├── remotion-demo/            dự án Remotion: component và video mẫu
├── tai-lieu/kho-bang-chung/  kho bài báo đã kiểm chứng, lớn dần theo thời gian
├── tai-lieu/nghien-cuu/      bảng claim của từng video
├── Raw/                      video, ghi âm gốc (không lên git)
└── Output/                   dự án và video xuất ra (không lên git)
```

## Giấy phép và trách nhiệm

- **Remotion** miễn phí cho cá nhân và công ty tối đa 3 người. Công ty lớn hơn cần mua giấy phép: https://www.remotion.dev/license
- **Google Flow, Gemini, Codex, Antigravity** dùng theo điều khoản và tài khoản của chính bạn. Đọc điều khoản dùng thương mại của Flow trước khi đăng ảnh tạo bằng Flow.
- **PubMed/NCBI**: dùng E-utilities theo hướng dẫn của NCBI, khoá API miễn phí ở tài khoản NCBI.
- Bộ công cụ không thay thế người có chuyên môn. Mọi nội dung y khoa cần người có chuyên môn của kênh duyệt. Nội dung quảng cáo dịch vụ y tế chịu quy định quảng cáo của nơi bạn đăng.
- Không đưa thông tin nhận diện người bệnh (tên, ảnh, kết quả xét nghiệm) vào prompt hay file gửi cho bất kỳ công cụ AI nào, kể cả khi người bệnh đồng ý cho đăng. Ảnh hoặc video có người bệnh chỉ đăng khi có đồng ý bằng văn bản, và tự dựng phần đó, không gửi lên AI.

Nhạc nền và SFX trong bộ được tổng hợp bằng script, không lấy mẫu từ nguồn ngoài. Khi có nhạc có giấy phép, thay file `remotion-demo/public/music/bg-pad.wav`.
