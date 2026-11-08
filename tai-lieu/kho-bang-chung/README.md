# Kho bằng chứng

Kho lớn dần sau mỗi video: bài nào đã tra và đọc thì lưu lại, lần sau không phải tra lại, và mọi video dùng chung một cách chấm claim.

| Thư mục | Nội dung |
|---|---|
| `INDEX.md` | Mỗi bài một dòng. Luôn đọc đầu tiên. |
| `bai/<PMID>.md` | Trích dẫn đầy đủ, loại nghiên cứu, đối tượng, kết quả có số, trích ngắn, hạn chế, xung đột lợi ích, ngày kiểm chứng, đã dùng trong video nào. |
| `chu-de/<chu-de>.md` | Thư viện claim đã chấm ✅ 🟡 ⚪ 🔴 kèm PMID, kể cả claim đã tìm mà không thấy nguồn. |
| `nguon-khac/` | Tài liệu kê toa, guideline PDF, quy định. Dùng cho liều, cách dùng, chống chỉ định. |
| `nguon-khac/notebook/<chu-de>.md` | Ghi chú chép từ NotebookLM hoặc sách, mỗi dòng có tên tài liệu và trang. |
| `.cache/` | Bản gốc PubMed do `pubmed.py fetch` lưu, không lên git. |

## Mẫu `bai/<PMID>.md`

```markdown
# <Họ tác giả> <năm> – <tiêu đề>

<Trích dẫn đầy đủ dòng do pubmed.py fetch in ra>

PMID: <số> · https://doi.org/<doi>

- **Loại nghiên cứu:** ...
- **Đối tượng:** ...
- **Chủ đề:** [<chu-de>](../chu-de/<chu-de>.md)
- **Kiểm chứng qua PubMed:** YYYY-MM-DD

## Kết quả chính
- ... (giữ nguyên số và đơn vị như bài gốc)

## Trích dẫn
> "<câu tiếng Anh dưới 25 từ>"

## Hạn chế
...

## Đã dùng trong
- <tên video>
```
