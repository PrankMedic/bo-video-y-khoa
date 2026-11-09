# Hook và nhịp cho video ngắn

Dùng chung cho mọi skill video: `video-slide-chuyen-mon`, `video-flow-minh-hoa`, `dinh-dang-video`, `ban-tin-pubmed`. Viết kịch bản và đặt hook theo file này, rồi chấm bằng `work/kiem_hook.py`.

Có hai loại cơ sở và không được trộn lẫn:

- **Bằng chứng:** các nghiên cứu trong mục cuối, nói về cơ chế (dopamine, cái mới, tò mò, chờ đợi). Chưa có nghiên cứu nào đo trực tiếp việc rải hook trong video ngắn.
- **Kinh nghiệm thực hành:** cẩm nang MrBeast và các thư viện hook trên GitHub. Các ngưỡng dưới đây (1,5 giây, 5 giây, 10 giây) là quy ước của bộ skill để chấm, không phải kết quả nghiên cứu.

## Cấu trúc cũ và mới

| | Cũ | Mới |
|---|---|---|
| Câu mở | Giới thiệu tên hoặc chủ đề | Vấn đề, câu hỏi hoặc con số. Tên đến sau |
| 0–3 giây | Chủ yếu là lời nói | Ba lớp cùng lúc: chữ trên màn hình, câu thoại, tiếng nhấn. Hình đổi trong 3 giây |
| Hook âm thanh | Một loại tiếng, đặt đều 8–10 giây | Ít nhất 3 loại tiếng theo vai trò. Không quá 2 tiếng giống nhau liền nhau. Cách nhau không quá 10 giây và không đều như máy đếm |
| Vòng tò mò | Không có | Mở trong 3 giây đầu, đóng ở cuối. Có thể mở vòng nhỏ khác trước khi đóng vòng lớn |
| Giữa video | Liệt kê đều nhau | Một câu gợi lại (re-hook) ở khoảng 50–80% thời lượng, kèm riser |
| Kết | Chỉ có lời kêu gọi hành động | Trả đúng lời hứa của câu mở, rồi mới đến lời kêu gọi |

## Bảy nguyên tắc

1. **Mở bằng vấn đề, không bằng tên.** Câu đầu là câu hỏi người xem tự hỏi, một con số lạ, hoặc một lời đồn sắp bị bác. Tên kênh và tên sản phẩm đến sau. Cẩm nang MrBeast coi phút đầu là đoạn người xem bỏ đi nhiều nhất. Với clip 30–60 giây, đoạn này là 1–3 giây đầu.
2. **Ba lớp trong 3 giây.** Chữ hook hiện từ khung hình 0, đứng một mình đọc vẫn hiểu, vì nhiều người xem không bật tiếng. Câu thoại nói cùng ý. Một tiếng `hit` nhấn đúng lúc chữ hiện. Hình phải đổi ít nhất một lần trước giây thứ 3.
3. **Mở một vòng tò mò và giữ lời.** Hứa một điều sẽ có ở cuối, ví dụ "cuối video là lệnh cài chỉ một dòng". Đến cuối phải trả đúng điều đã hứa, nói lại bằng chính chữ đó. Lời hứa không giữ được làm mất lòng tin, và trái với quy tắc không cam kết kết quả.
4. **Đổi loại hook, không lặp một kiểu.** Tế bào dopamine phản ứng với sai lệch dự đoán: phần thưởng đã đoán trước được thì phản ứng dời về tín hiệu báo trước (Schultz 1997, nghiên cứu trên linh trưởng với phần thưởng thật). Suy luận của bộ skill, chưa được kiểm chứng trên video: hook lặp đều sẽ thành điều đoán trước được và nhạt dần. Vì vậy xoay vòng loại hook: chữ, thoại, hình, âm thanh. Trong âm thanh, mỗi loại tiếng giữ một vai trò riêng (bảng dưới).
5. **Hình đổi 2–4 giây, không để khoảng trống quá 5 giây.** Mỗi lần đổi là một hook hình: cảnh mới, zoom, chữ mới hoặc số liệu bật lên.
6. **Gợi lại ở khoảng 2/3 video.** Đây là chỗ người xem dễ lướt đi khi nội dung bắt đầu thành danh sách. Đặt một câu như "Mẫu cuối gần như tự chạy" và tiếng `riser` dẫn vào. Khi nghe nhạc, dopamine tiết ra ở cả lúc chờ lẫn lúc cao trào cảm xúc (Salimpoor 2011). Dùng riser để tạo pha chờ là suy luận của bộ skill từ nghiên cứu về âm nhạc, chưa được đo trên video ngắn.
7. **Nguồn PubMed cũng là hook.** "Nghiên cứu năm 2021 trên NeuroImage..." vừa là cái mới vừa giúp người xem tự kiểm tra. Không dùng hook cam kết kết quả hay từ tuyệt đối.

## Vai trò từng tiếng

Tạo bằng `cd work && python3 tao_sfx.py`, đặt đỉnh tiếng đúng mốc bằng `<Sfx kind=... atMs=...>` trong `formats/effects.tsx`.

| Tiếng | Vai trò | Âm lượng gợi ý |
|---|---|---|
| `hit` | Câu hook mở đầu, cú chốt lời hứa ở cuối | 0,5 |
| `whoosh` | Sang phần mới | 0,3 |
| `tick` | Mục nhỏ trong cùng một phần, ví dụ từng template | 0,25 |
| `digital` | Số liệu hoặc dòng nguồn hiện ra | 0,3 |
| `riser` | 1,5 giây dẫn vào câu gợi lại hoặc phần kết | 0,35 |

Skill `video-slide-chuyen-mon` còn dùng tiếng `ding` và `switch` lấy từ remotion.media. Đếm các tiếng này là các loại khác nhau.

## Bản đồ hook và cách chấm

Mỗi video ghi một file `hooks.json` cạnh `words.json`: mỗi dòng có mốc (ms), loại (`am-thanh`, `chu`, `thoai`, `hinh`), nhãn, tên tiếng (với âm thanh), `loop: "mo:x"` hoặc `"dong:x"`, và `rehook: true` cho câu gợi lại.

```bash
cd work && python3 -I kiem_hook.py ../Output/<video>/hooks.json
cd work && python3 -I kiem_hook.py --so-sanh ../Output/<cu>/hooks.json ../Output/<moi>/hooks.json
```

Luật H1–H6 tương ứng với các nguyên tắc 1–6. Có luật TRƯỢT thì sửa trước khi render. Luật CẢNH BÁO thì ghi một dòng cho người duyệt, không chặn việc đăng.

## Nguồn

Bằng chứng (PubMed, truy cập 09/11/2026):

- Schultz W, Dayan P, Montague PR. A neural substrate of prediction and reward. *Science* 1997;275:1593–9. PMID 9054347. https://doi.org/10.1126/science.275.5306.1593
- Bunzeck N, Düzel E. Absolute coding of stimulus novelty in the human substantia nigra/VTA. *Neuron* 2006;51:369–79. PMID 16880131. https://doi.org/10.1016/j.neuron.2006.06.021
- Gruber MJ, Gelman BD, Ranganath C. States of curiosity modulate hippocampus-dependent learning via the dopaminergic circuit. *Neuron* 2014;84:486–96. PMID 25284006. https://doi.org/10.1016/j.neuron.2014.08.060
- Salimpoor VN và cộng sự. Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nat Neurosci* 2011;14:257–62. PMID 21217764. https://doi.org/10.1038/nn.2726
- Su C và cộng sự. Viewing personalized video clips recommended by TikTok activates default mode network and ventral tegmental area. *NeuroImage* 2021;237:118136. PMID 33951514. https://doi.org/10.1016/j.neuroimage.2021.118136

Kinh nghiệm thực hành (truy cập 09/11/2026):

- MrBeast Productions, "How to Succeed in MrBeast Production" (tài liệu nội bộ bị lộ năm 2024, chưa được xác nhận chính thức): https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/
- vyralcontent/content-skills (hook ba lớp: hình, lời, chữ): https://github.com/vyralcontent/content-skills
- shixinzhang/tiktok-viral-hooks (mốc giữ chân ở giây 7, 14, 21): https://github.com/shixinzhang/tiktok-viral-hooks
- alchaincyf/mrbeast-skill: https://github.com/alchaincyf/mrbeast-skill
