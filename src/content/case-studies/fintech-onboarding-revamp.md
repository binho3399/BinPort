---
title: "Tái thiết kế Quy trình Cập nhật Thông tin Fintech"
slug: "fintech-onboarding-revamp"
summary: "Thiết kế lại quy trình đăng ký tài khoản và cập nhật thông tin (onboarding) nhằm gia tăng tỷ lệ chuyển đổi nạp tiền lần đầu và giảm tải ma sát cho bộ phận hỗ trợ khách hàng."
tags: ["fintech", "onboarding", "tỷ lệ chuyển đổi"]
featured: true
publishedAt: "2026-04-03"
role: "Thiết kế trưởng Sản phẩm"
timeline: "4 tháng"
impact: "Tăng 21% tỷ lệ chuyển đổi nạp tiền lần đầu, Giảm 34% số lượng yêu cầu hỗ trợ đăng ký"
tools: ["Figma", "Amplitude", "Maze", "Notion"]
visibility: "public"
domain: "Công nghệ Tài chính (Fintech)"
capabilityTags: ["Nghiên cứu", "Chiến lược", "UX/UI", "Xây dựng nguyên mẫu"]
---
## Bối cảnh
Ứng dụng fintech tiêu dùng có lượng đăng ký mới mạnh mẽ nhưng tỷ lệ kích hoạt tài khoản trong tuần đầu tiên lại rất thấp.

## Vấn đề cần giải quyết
Người dùng mới bị tắc nghẽn ở các bước xác minh danh tính không rõ ràng và không biết tiến trình thực hiện của mình.

## Vai trò và Ràng buộc
Tôi dẫn dắt đội ngũ thiết kế sản phẩm cùng với một PM và năm kỹ sư phần mềm. Các yêu cầu tuân thủ pháp lý hạn chế khả năng tối giản hóa quy trình xác thực danh tính khách hàng (KYC).

## Hiện vật Chiến lược (Strategic Artifacts)
- Tài liệu định nghĩa vấn đề giúp thống nhất rủi ro giữa các bộ phận pháp lý, vận hành và sản phẩm.
- Bản đồ JTBD (Jobs-To-Be-Done) phân tách nhu cầu người dùng giữa "đăng ký nhanh" và "thiết lập tài khoản tin cậy".
- Chỉ số định hướng (North-star metric) tập trung vào giao dịch nạp tiền thành công đầu tiên trong vòng 72 giờ.

## Hiện vật Thiết kế (Design Artifacts)
- Tái cấu trúc quy trình onboarding thành ba giai đoạn lũy tiến rõ ràng.
- Bổ sung các thẻ hướng dẫn theo ngữ cảnh xuất hiện đúng lúc người dùng gặp bối rối.
- Giới thiệu một thành phần trạng thái có thể tái sử dụng để hiển thị tiến trình xác thực.

## Hiện vật Thực chứng (Proof Artifacts)
- Biểu đồ phễu trước và sau cải tiến ghi nhận tỷ lệ bỏ cuộc giảm rõ rệt tại bước tải lên tài liệu pháp lý.
- Trích dẫn từ đối tác: "Đây là lần đầu tiên quy trình đăng ký được phòng pháp chế phê duyệt ngay lập tức mà không cần qua nhiều vòng chỉnh sửa."
- Đã xuất bản chính thức trong phiên bản v5.11 với lộ trình triển khai từng giai đoạn.

## Câu chuyện Quyết định (Decision Narrative)
Chúng tôi chọn phương pháp tiết lộ thông tin lũy tiến (progressive disclosure) thay vì hoàn thành trên một màn hình duy nhất. Đánh đổi: thêm một bước nhỏ đối với một số người dùng; lợi ích: giảm tỷ lệ lỗi nhập liệu và tỷ lệ rời bỏ quy trình một cách rõ rệt.

## Kết quả và Bài học
Kết quả giúp cải thiện tỷ lệ chuyển đổi và hiệu quả hỗ trợ trong khi vẫn đảm bảo tuân thủ tuyệt đối các quy định pháp luật. Bài học cốt lõi: các quy trình nặng tính pháp lý vẫn có thể tối ưu hóa thông qua nhịp điệu tương tác hợp lý và các tín hiệu xây dựng lòng tin.
