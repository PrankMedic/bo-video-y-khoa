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
| `goi-codex`, `goi-gemini`, `goi-antigravity` | (tuỳ chọn) | Giao phần viết code, góp ý hình cho tác nhân khác để tiết kiệm token Claude |

## Cài nhanh (Mac)

Mở Terminal (⌘ + dấu cách, gõ Terminal), dán ba dòng sau:

```bash
git clone https://github.com/PrankMedic/bo-video-y-khoa.git ~/bo-video-y-khoa
cd ~/bo-video-y-khoa
bash cai-dat.sh
```

Máy chưa có `git` thì macOS sẽ hỏi cài Command Line Tools: bấm Cài đặt, chờ xong rồi dán lại. Không muốn dùng git: bấm **Code → Download ZIP** trên trang GitHub, giải nén, rồi chạy `bash cai-dat.sh` trong thư mục đó.

Cập nhật bản mới: `cd ~/bo-video-y-khoa && git pull && bash cai-dat.sh`. File của bạn (`.env`, `CLAUDE.md` đã điền, `Raw/`, `Output/`, kho bằng chứng) không bị ghi đè khi pull, trừ khi bản mới sửa đúng file đó; khi đó git sẽ báo để bạn chọn.

Xem video giới thiệu 52 giây: [docs/gioi-thieu.mp4](docs/gioi-thieu.mp4).

Script kiểm tra máy, cài phần còn thiếu bằng Homebrew (hỏi trước khi cài), tải model Whisper, cài thư viện Remotion, rồi tạo một video mẫu để thử cả dây chuyền. Chi tiết từng thư viện, cách cài tay và cách sửa lỗi xem [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md).

Sau khi cài:

1. Mở `CLAUDE.md`, điền hồ sơ kênh: tên, người duyệt nội dung, giọng văn, lĩnh vực.
2. Mở `remotion-demo/src/brand.ts`, đổi `TÊN KÊNH` thành tên của bạn.
3. Điền khoá vào `.env`. Nên có `PUBMED_API_KEY` và `NCBI_EMAIL` (miễn phí, tra PubMed nhanh hơn); không có vẫn chạy được nhưng chậm hơn.
4. Mở thư mục này trong Claude Code, rồi gõ vào ô chat với Claude (không phải Terminal): "mở studio xem các video mẫu".

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
