# Plan — Quy trình cập nhật Work History

File này định nghĩa quy trình **luôn cập nhật history công việc theo timeline** sau mỗi task.

## Quy trình (áp dụng cho mọi task)

1. **Khi bắt đầu task:** tạo todo list (nếu task 3+ bước) bằng `todowrite`
2. **Khi hoàn thành task:** append entry mới vào `WORKLOG.md` theo format timeline dưới đây
3. **Entry phải có:**
   - Ngày thực hiện (YYYY-MM-DD)
   - Tên task / route / component liên quan
   - Files đã thay đổi (tạo mới / sửa)
   - Table summarize các vấn đề đã làm (`# | Vấn đề | Giải pháp | Kết quả`)
   - Bài học rút ra (nếu có)
4. **Không xóa entry cũ** — chỉ append, giữ nguyên timeline lịch sử
5. **Mỗi entry cách nhau bằng `---`** (horizontal rule) để tách timeline

## Format entry (template)

```markdown
---

## [YYYY-MM-DD] Task: <tên task>

**Files thay đổi:**
- `path/to/file.tsx` (mới/sửa) — mô tả ngắn
- `path/to/other.css` (sửa) — mô tả ngắn

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | <vấn đề> | <giải pháp> | <kết quả> |
| 2 | <vấn đề> | <giải pháp> | <kết quả> |

### Bài học rút ra (optional)
- <bài học / lưu ý cho task sau>
```

## Thứ tự thực hiện

1. Hiểu yêu cầu (đọc code, search, glob)
2. Implement (edit/write files)
3. Verify: `npm run type-check` + `npm run lint` (+ `npm run build` nếu shared shell/WebGL/CSS)
4. **Append entry vào `WORKLOG.md`** theo template trên
5. Báo cáo ngắn gọn cho user

## Lưu ý

- Nếu task là continluation của task trước (cùng route/component), **gộp vào entry cũ** thay vì tạo entry mới — giữ timeline gọn
- Nếu task lớn, tách thành nhiều row trong table cùng entry
- Luôn ghi rõ files thay đổi để dễ trace lại bằng git
- Bài học rút ra chỉ ghi khi có insight kỹ thuật đáng nhớ (perf, bug khó, convention)
