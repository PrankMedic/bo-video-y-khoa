import type { BanTinProps } from '../BanTin';
import { base } from './mau';
export default {
  ...base, episode: 1, source: 'Nguồn: thay bằng PMID đã kiểm chứng',
  scenes: [
    { kind: 'hook', atPhrase: 'Xin chào', label: 'Bản tin mẫu', items: [{ atPhrase: 'đây là video mẫu', text: 'Thay bằng nội dung của bạn' }] },
    { kind: 'study', atPhrase: 'mỗi ý', label: 'Cách sử dụng', items: [{ atPhrase: 'mỗi ý', text: 'Mỗi ý trên màn hình' }, { atPhrase: 'bám theo lời nói', text: 'Neo vào lời đọc' }] },
    { kind: 'bars', atPhrase: 'khi có số liệu', label: 'Số liệu minh hoạ', items: [{ atPhrase: 'khi có số liệu', text: 'Mẫu A · minh hoạ', value: 40, suffix: '%' }, { atPhrase: 'video hiện thêm', text: 'Mẫu B · minh hoạ', value: 60, suffix: '%' }] },
    { kind: 'readClosely', atPhrase: 'dòng nguồn', label: 'Kiểm tra nguồn', items: [{ atPhrase: 'dòng nguồn', text: 'Thay bằng nguồn đã kiểm chứng' }] },
    { kind: 'cta', atPhrase: 'hãy thay giọng', label: 'Bắt đầu video của bạn', items: [{ atPhrase: 'hãy thay giọng', text: 'Thay giọng mẫu bằng giọng của bạn' }] },
  ],
} satisfies BanTinProps;
