# Hướng dẫn cài đặt

> Cách dễ nhất: dán link repo vào Claude Code và nói "cài bộ skill này cho tôi" (xem README). File này dành cho người muốn tự cài bằng Terminal, hoặc để Claude tra khi cài gặp lỗi. `cai-dat.sh --tu-dong` cài không cần hỏi; `--lien-ket` nối skill ra `~/.claude/skills`.

Bộ này viết cho macOS (chip Apple hoặc Intel). `cai-dat.sh` làm hầu hết các bước dưới đây.

**Mọi lệnh trong file này chạy từ thư mục gốc bộ công cụ** (thư mục có `README.md`). Mở Terminal (nhấn ⌘ + dấu cách, gõ Terminal, nhấn Return), gõ `cd ` (có dấu cách), kéo thư mục `bo-video-y-khoa` từ Finder thả vào Terminal, rồi nhấn Return. Lệnh nào cần vào thư mục con đều viết trong ngoặc `( ... )` để tự quay về gốc. Đọc file này khi muốn cài tay, khi script báo thiếu gì đó, hoặc khi cài trên máy thứ hai.

## 0. Cần chuẩn bị

- macOS 13 trở lên, khoảng 6 GB ổ trống (model Whisper 0,5–1,6 GB, thư viện Remotion khoảng 1 GB).
- Claude Code (app Claude trên máy tính, tab Code, hoặc bản dòng lệnh). Mặc định skill chỉ hiện khi mở thư mục bộ công cụ này. Muốn dùng skill khi đang ở thư mục khác thì chạy `bash cai-dat.sh --lien-ket`; skill vẫn chạy script trong thư mục bộ công cụ, nên đừng di chuyển hay đổi tên thư mục sau khi nối.
- Tài khoản NCBI để lấy khoá PubMed miễn phí.

## 1. Công cụ dòng lệnh

Mở Terminal, kiểm tra từng lệnh. Lệnh nào báo `command not found` thì cài.

| Công cụ | Kiểm tra | Cài |
|---|---|---|
| Homebrew | `brew --version` | Xem https://brew.sh (một lệnh dán vào Terminal) |
| Python 3.9+ | `python3 --version` | Có sẵn khi cài Xcode Command Line Tools: `xcode-select --install`. Mac sẽ hiện hộp thoại cài đặt của Apple, bấm Cài đặt và chờ vài phút; đây là bước bình thường |
| Node 22.18+ | `node --version` | `brew install node` |
| ffmpeg | `ffmpeg -version` | `brew install ffmpeg` |
| whisper-cli | `whisper-cli --help` | `brew install whisper-cpp` |
| git (tuỳ chọn) | `git --version` | Có cùng Command Line Tools |

Homebrew nằm ở `/opt/homebrew` trên Mac chip Apple, ở `/usr/local` trên Mac Intel. Script tự tìm cả hai chỗ, nên hầu hết mọi người không cần làm gì thêm. (Người dùng nâng cao cài công cụ ở chỗ khác thì đặt biến môi trường `FFMPEG`, `FFPROBE`, `WHISPER_CLI` trong `~/.zshrc`.)

`ffmpeg-full` (`brew install ffmpeg-full`) là tuỳ chọn, chỉ cần khi bạn muốn bộ lọc ngoài bản thường. Script ưu tiên `ffmpeg-full` nếu có.

## 2. Model Whisper (gỡ băng tiếng Việt)

Model để trong `~/whisper-models/`. Chọn theo RAM:

| RAM | Model | Dung lượng |
|---|---|---|
| 16 GB trở lên | `ggml-large-v3-turbo-q5_0.bin` (chính xác nhất cho tiếng Việt) | khoảng 550 MB |
| 8 GB | `ggml-small.bin` | khoảng 470 MB |

```bash
mkdir -p ~/whisper-models
curl -L -o ~/whisper-models/ggml-large-v3-turbo-q5_0.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin
```

Đổi tên file trong link để tải model khác. Script tự dùng model tốt nhất có trong thư mục. Muốn chỉ định model, đặt `WHISPER_MODEL=/đường/dẫn/model.bin`.

Kiểm tra cả bước 1 và bước 2:

```bash
python3 work/cong_cu.py
```

## 3. Thư viện Remotion

```bash
(cd remotion-demo && npm ci && npx tsc --noEmit)
```

`npm ci` cài đúng phiên bản trong `package-lock.json` (Remotion 4.0.538, React 19). Không chạy `npm update` hay `npx remotion upgrade` khi chưa cần, vì component đã kiểm tra với các phiên bản này.

## 4. Tài nguyên mẫu

```bash
bash work/tao_mau.sh
```

Script tạo giọng đọc mẫu bằng giọng tiếng Việt "Linh" của macOS, gỡ băng bằng Whisper, sửa chữ nghe sai, tạo ảnh và video giả, nhạc nền, SFX và icon. Chạy được tới cuối nghĩa là cả dây chuyền trên máy bạn đã hoạt động.

Chưa có giọng Linh: Cài đặt hệ thống → Trợ năng → Nội dung được đọc → Giọng hệ thống → Quản lý giọng → Tiếng Việt → Linh.

Xem video mẫu:

```bash
(cd remotion-demo && npx remotion studio --port 3123)
```

Mở `http://localhost:3123`. Cổng 3000 hay bị app khác chiếm, nên luôn ghi `--port`.

## 5. Khoá API (`.env`)

```bash
cp .env.example .env
```

| Khoá | Dùng cho | Lấy ở đâu | Bắt buộc |
|---|---|---|---|
| `PUBMED_API_KEY`, `NCBI_EMAIL` | Tra PubMed nhanh hơn, ít bị chặn | ncbi.nlm.nih.gov → Account settings → API Key Management | Nên có |
| `GEMINI_API_KEY` | Giọng AI (`work/tts_gemini.py`), skill `goi-gemini`, Antigravity CLI | aistudio.google.com → API keys | Tuỳ chọn, tính phí theo token khi vượt hạn mức miễn phí |
| `N8N_SEED_URL`, `N8N_SEED_TOKEN` | Workflow n8n tự theo dõi chủ đề | Tự dựng n8n | Không |

`.env` không bao giờ lên git. Claude không đọc hay in khoá; script tự nạp.

## 6. Tác nhân phụ (tuỳ chọn)

Bộ chạy đủ với riêng Claude. Các tác nhân dưới đây giúp tiết kiệm token Claude khi viết file dữ liệu hay xem nhiều khung hình.

- **Codex CLI** (OpenAI): `npm i -g @openai/codex`, rồi `codex login` bằng tài khoản ChatGPT. Mỗi lần gọi dùng hạn mức ChatGPT của bạn.
- **Gemini API**: chỉ cần `GEMINI_API_KEY` ở bước 5.
- **Antigravity CLI** (`agy`): cài theo hướng dẫn của Antigravity, kiểm tra `agy --help`. Bộ chỉ gọi `agy` bằng khoá `GEMINI_API_KEY`, không dùng đăng nhập Google, vì FAQ của Antigravity coi việc phần mềm bên thứ ba truy cập bằng đăng nhập Google là vi phạm điều khoản: https://antigravity.google/docs/faq/
- `agy` hoặc `codex` nằm ngoài PATH thì đặt `AGY_BIN` hoặc `CODEX_BIN`.

## 7. Google Flow (ảnh minh hoạ, tuỳ chọn)

Skill `video-flow-minh-hoa` tạo ảnh trên https://labs.google/fx/tools/flow qua tiện ích Claude in Chrome, bằng tài khoản Google của bạn (cần gói có Flow). Chưa có Flow thì tự dán prompt rồi tải ảnh về, hoặc dùng ảnh của bạn: đặt vào `Output/flow/<tên-video>/img/raw-s01.jpg`, `raw-s02.jpg`...

## 8. Skill bổ trợ của bên thứ ba (tuỳ chọn)

Không bắt buộc, không đi kèm bộ này vì thuộc giấy phép của tác giả khác:

- Skill chính thức của Remotion (hỏi đáp API, render): xem https://www.remotion.dev/docs/ai/skills
- Skill GSAP cho hoạt hình: xem trang của GSAP.

## Lỗi hay gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `whisper-cli: command not found` hoặc `THIẾU model` | Làm lại bước 1, 2, rồi `python3 work/cong_cu.py` |
| Remotion báo cổng đang dùng | Thêm `--port 3123` (hoặc số khác) |
| Log có `objc ... AVFFrameReceiver` | Cảnh báo trùng thư viện của ffmpeg, bỏ qua |
| `node scripts/export-icons.mts` báo lỗi cú pháp | Node cũ hơn 22.18, cập nhật: `brew upgrade node` |
| Phụ đề lệch tiếng sau khi cắt | Chạy lại bước gỡ băng trên file đã cắt, không dùng mốc của file gốc |
| Render chậm hoặc đầy ổ | Kiểm tra `df -h`; xoá `Output/` cũ; render ra ổ ngoài |
| Skill không hiện trong Claude | Mở đúng thư mục bộ công cụ trong Claude Code, hoặc chạy `bash cai-dat.sh --lien-ket` |
| `No such file or directory` khi chạy lệnh | Đang đứng sai thư mục: quay về gốc bộ công cụ (xem đầu file) |
