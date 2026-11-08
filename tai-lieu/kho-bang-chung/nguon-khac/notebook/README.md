# Ghi chú từ NotebookLM hoặc sách

Dùng cho cơ chế bệnh sinh, phân loại, thông số thiết bị, cách dùng thuốc: những thứ PubMed ít có. Mỗi chủ đề một file `<chu-de>.md`, mỗi dòng ghi tên tài liệu và trang.

Mẫu prompt dán vào NotebookLM khi Claude cần thông tin kiểu sách:

> Với từng câu dưới đây, cho biết tài liệu trong sổ có nói đến không. Nếu có: trích nguyên văn ngắn, tên tài liệu, số trang. Nếu không: ghi "Không có trong nguồn". Không suy luận ngoài tài liệu.
> 1. <câu 1>
> 2. <câu 2>

Chép câu trả lời vào `<chu-de>.md`, giữ mục "Không có trong nguồn" để lần sau biết phải tìm ở PubMed.
