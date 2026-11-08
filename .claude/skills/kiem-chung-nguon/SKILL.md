---
name: kiem-chung-nguon
description: Kiểm chứng nguồn khoa học cho kịch bản, phụ đề (SRT) hoặc slide video sức khoẻ - tách câu khẳng định, tra kho bằng chứng của kênh trước, rồi tìm trên PubMed bằng script pubmed.py (NCBI E-utilities, ít token), chấm mức ủng hộ ✅ 🟡 ⚪ 🔴, lưu bài mới vào kho, ghi danh mục nguồn vào tai-lieu/nghien-cuu/ và gắn dòng nguồn lên slide Remotion. Dùng khi người dùng nói "kiểm chứng nguồn", "tìm nguồn cho video/kịch bản", "fact-check", "gắn trích dẫn lên slide", hoặc trước khi xuất video có nội dung về thuốc, hoạt chất, liệu trình, thiết bị.
---

# Kiểm chứng nguồn

Mục tiêu: mọi câu khẳng định y khoa trên màn hình đều có nguồn đã xác minh, và mọi câu thiếu hoặc trái bằng chứng được đánh dấu để người duyệt của kênh quyết. Claude không tự quyết câu nào được phép quảng cáo.

**Gốc bộ công cụ:** thư mục chứa `CLAUDE.md` và `work/`. Nếu skill được nối ra `~/.claude/skills`, tìm gốc bằng `readlink -f` của thư mục skill rồi đi lên ba cấp. Mọi lệnh dưới đây chạy từ gốc.

## 1. Tách claim

Đọc toàn bộ lời thoại và chữ trên slide. Liệt kê từng câu kiểm chứng được (cơ chế, hiệu quả, tác dụng phụ, nồng độ, thời gian, so sánh), đánh số C1, C2… kèm mốc thời gian. Bỏ câu dẫn dắt.

Đánh dấu riêng, không cần tìm nguồn nhưng phải báo: tên thương mại, từ tuyệt đối hoặc cam kết kết quả ("hết mụn", "tốt nhất", "không đau").

## 2. Tra kho trước

`tai-lieu/kho-bang-chung/` (cấu trúc trong `README.md` của kho):
- `INDEX.md`: luôn đọc đầu tiên.
- `chu-de/<chu-de>.md`: claim đã chấm kèm PMID. Có rồi thì dùng lại mức và nguồn, chỉ kiểm tra claim trong thoại có cụ thể hơn không (con số, thời gian, so sánh).
- `bai/<PMID>.md`: chỉ mở bài cần dùng.
- `nguon-khac/`: tài liệu kê toa, guideline, ghi chú sách. Dùng cho liều, cách dùng, chống chỉ định, cơ chế.

Claim cần thông tin kiểu sách mà kho chưa có: không trả lời từ trí nhớ. Soạn prompt theo `nguon-khac/notebook/README.md` để người dùng hỏi NotebookLM hoặc tra sách, chấm ⚪ cho đến khi có ghi chú.

Chỉ sang bước 3 cho claim kho chưa có, hoặc kho chỉ có bằng chứng yếu mà claim quan trọng.

## 3. Tìm trên PubMed

```bash
S=.claude/skills/kiem-chung-nguon/scripts/pubmed.py
python3 -I $S search '"azelaic acid"[tiab] AND acne' --type "systematic review;guideline" --from 2015 --max 15
python3 -I $S search 'azelaic acid' --mode sr          # chỉ tổng quan hệ thống
python3 -I $S search 32356369 --mode similar --max 10  # bài tương tự
python3 -I $S fetch 32356369 10598760                  # trích dẫn, DOI, PMC, loại bài, gợi ý COI
python3 -I $S fetch 10598760 --abstract                # thêm abstract, chỉ cho bài sẽ dùng
python3 -I $S fulltext <PMID> --out <file.txt>         # toàn văn PMC nếu có
```

- Script đọc `PUBMED_API_KEY`, `NCBI_EMAIL` từ `.env`. Không in, ghi hay hỏi xin khoá.
- `search` đánh ★ cho bài đã có trong kho, PMC cho bài có toàn văn miễn phí. Mặc định lọc có abstract, tiếng Anh.
- `--type`: `rct`, `systematic review`, `meta-analysis`, `guideline`, `consensus`, `review`, `observational`, `phase 3`… (cách nhau bằng `;`).
- `fetch` lưu bản gốc vào `kho-bang-chung/.cache/`, lần sau không gọi mạng.
- Dòng "Gợi ý xung đột lợi ích" chỉ dò tên công ty trong affiliation, vẫn phải đọc lại.
- Lệnh `seed` và `sheet` chỉ dùng khi kênh tự dựng n8n và Google Sheet (biến `N8N_SEED_URL`). Không có thì bỏ qua.

Tiết kiệm token: `search` → loại bài lạc đề theo tiêu đề → `fetch` không abstract → `fetch --abstract` chỉ cho bài dùng làm căn cứ.

Quy tắc dựng truy vấn:
- Tên hoạt chất: `"azelaic acid"[tiab]`.
- Từ chỉ triệu chứng dùng `[tiab]` để PubMed không tự ánh xạ sai (ví dụ "stinging" bị ánh xạ sang côn trùng đốt).
- Thứ bậc: guideline → systematic review/meta-analysis → RCT → review tường thuật → nghiên cứu khác. Mỗi chủ đề, tìm thêm guideline và systematic review mới kể cả khi đã có RCT.
- Claim an toàn: thêm `(stinging[tiab] OR burning[tiab] OR pruritus[tiab] OR irritation[tiab])`.

## 4. Chấm claim

| Mức | Ý nghĩa |
|---|---|
| ✅ Ủng hộ | Nguồn nói đúng ý claim |
| 🟡 Một phần | Đúng hướng nhưng claim cụ thể hơn nguồn |
| ⚪ Chưa tìm được | Đã tìm, không thấy nguồn nêu |
| 🔴 Trái bằng chứng | Nguồn nói khác hoặc ngược lại |

Ghi kèm câu trích ngắn (tiếng Anh, dưới 25 từ) và ghi chú xung đột lợi ích. Claim hiệu quả, so sánh, con số cần guideline, systematic review hoặc RCT. Cơ chế, phân loại dùng được sách hoặc review. Nguồn sách và PubMed nói khác nhau thì ghi cả hai cho người duyệt, không tự chọn.

## 5. Ghi vào kho, rồi ghi bảng claim của video

Cập nhật kho trước: bài mới tạo `bai/<PMID>.md` theo mẫu trong README của kho và thêm một dòng vào `INDEX.md` (tăng tổng số bài); bài đã có thì thêm video hiện tại vào "Đã dùng trong"; claim mới hoặc đổi mức thì cập nhật `chu-de/`, kể cả claim ⚪ và 🔴.

Sau đó ghi `tai-lieu/nghien-cuu/<chu-de>.md`:

```markdown
# <Chủ đề> – kiểm chứng nguồn cho <tên video>
Ngày truy cập: YYYY-MM-DD · Công cụ: PubMed (NCBI) qua pubmed.py

## Bảng claim
| # | Mốc | Claim (thoại) | Mức | Nguồn | Ghi chú cho người duyệt |

## Danh mục nguồn
[1] Họ Tên viết tắt, và cs. Tiêu đề. Tạp chí. Năm;Tập(Số):Trang. PMID: … · DOI: https://doi.org/… · Truy cập YYYY-MM-DD.

## Cần duyệt trước khi đăng
- …
```

## 6. Gắn nguồn lên slide

Slide trong `remotion-demo/src/talking-slides/Slides.tsx` và `src/flow/FlowKit.tsx` nhận prop `source`: `Nguồn: Họ 2007 (PMID 17472690) · Họ 2024 (PMID 39464747)`.

- **Không bao giờ ghi PMID, DOI hay tác giả từ trí nhớ.** Chỉ dùng PMID đã lấy metadata trong phiên này hoặc chép đúng từ `bai/<PMID>.md`.
- Slide chứa claim ⚪ hoặc 🔴: sửa chữ cho khớp bằng chứng (hoặc bỏ con số) và báo trong "Cần duyệt".
- Render vài khung bằng `npx remotion still` để kiểm tra dòng nguồn không đè nội dung.

## 7. Slide số liệu nghiên cứu (StudySlide)

Mỗi video có claim y khoa nên có ít nhất một slide lấy số liệu trực tiếp từ một nghiên cứu. Chọn bài đúng ý lời thoại ở đoạn đặt slide, thiết kế mạnh (có nhóm chứng), số liệu nằm trong abstract hoặc toàn văn đã đọc, đối tượng gần với video (khác thì ghi rõ). Giữ nguyên đơn vị và số thập phân. Không viết kết luận vượt bài gốc.

Props: `chips` (thiết kế, n), `title` (hoạt chất, so với gì), `population`, `bars` (2–3 giá trị cùng chỉ số), `note`, `warning`, `source` (đủ tác giả, tạp chí, năm;tập(số):trang, PMID).

## 8. Báo cáo

Liệt kê claim cần duyệt lên đầu. Mọi bài được nhắc kèm link DOI (hoặc link PubMed).
