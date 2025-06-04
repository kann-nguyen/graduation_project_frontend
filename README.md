# Hệ Thống Frontend - Đồ Án Tốt Nghiệp

Giao diện người dùng cho hệ thống quản lý lỗ hổng bảo mật, rủi ro và ticket. Hệ thống cung cấp các chức năng trực quan để theo dõi và quản lý các lỗ hổng bảo mật được phát hiện trong hình ảnh container.

## Cài Đặt

1. Cài đặt phiên bản mới nhất của [Node.js](https://nodejs.org/en/download)
2. Cài đặt [pnpm](https://pnpm.io/installation)
3. Chạy lệnh `pnpm install` để cài đặt các gói phụ thuộc
4. Chạy lệnh `npm run dev` để khởi động máy chủ phát triển

## Cấu Trúc Dự Án

Dự án frontend bao gồm các thành phần sau:
- **public**: Chứa các tài nguyên tĩnh như hình ảnh, favicon và các tệp công khai khác
- **src**: Mã nguồn chính của ứng dụng, xử lý logic nghiệp vụ và UI components


## Yêu Cầu Hệ Thống

- Node.js v16 trở lên
- Ít nhất 4GB RAM
- 2GB dung lượng đĩa trống

## Môi Trường Phát Triển

Dự án sử dụng TypeScript với các công nghệ sau:
- React: Thư viện JavaScript để xây dựng giao diện người dùng
- TypeScript: Ngôn ngữ lập trình với kiểu dữ liệu tĩnh
- Vite: Công cụ build nhanh cho ứng dụng web
- React Router: Quản lý điều hướng trong ứng dụng
- Material UI: Thư viện components UI
- Axios: Thư viện để thực hiện các yêu cầu HTTP
- Chart.js: Thư viện để tạo biểu đồ và trực quan hóa dữ liệu


## Biến Môi Trường

Tạo file `.env` trong thư mục gốc với các biến sau:
```
VITE_API_URL=http://localhost:8000
```

## Chức Năng Hệ Thống

### 1. Quản Lý Lỗ Hổng Bảo Mật
Đây là chức năng cốt lõi của giao diện người dùng, cho phép:
- Xem danh sách các lỗ hổng được phát hiện
- Lọc và tìm kiếm lỗ hổng theo nhiều tiêu chí
- Xem chi tiết về mỗi lỗ hổng, bao gồm mức độ nghiêm trọng, mô tả và cách khắc phục
- Cập nhật trạng thái lỗ hổng (đã xác minh, đang xử lý, đã giải quyết, v.v.)

### 2. Quản Lý Rủi Ro
Giao diện để đánh giá và quản lý rủi ro:
- Hiển thị ma trận rủi ro trực quan
- Xem các biện pháp đề xuất để giảm thiểu rủi ro
- Thiết lập mức ưu tiên cho các rủi ro được phát hiện

### 3. Quản Lý Ticket
Hệ thống quản lý ticket tích hợp:
- Xem danh sách các ticket hiện tại
- Tạo ticket mới cho lỗ hổng được phát hiện
- Theo dõi trạng thái và tiến độ của các ticket
- Phân công người phụ trách

### 4. Quét Lỗ Hổng Trong Container Images
Giao diện cho chức năng quét hình ảnh Docker:
- Tải lên và quản lý Docker images
- Hiển thị kết quả quét theo thời gian thực
- Xem chi tiết về các lỗ hổng được phát hiện trong container

### 5. Quản Lý Artifacts
Giao diện để quản lý các artifacts:
- Tải lên artifact mới (hình ảnh container)
- Xem lịch sử quét cho mỗi artifact
- Theo dõi trạng thái quét và kết quả
- Xem các lỗ hổng được phát hiện trong mỗi artifact

### 6. Tích Hợp GitHub, GitLab
Giao diện để tích hợp với các dịch vụ Git:
- Đăng nhập và xác thực thông qua GitHub, GitLab
- Đồng bộ các repository được chỉ định

### 7. Báo Cáo và Phân Tích
Các công cụ báo cáo nâng cao:
- Tạo báo cáo tùy chỉnh về lỗ hổng và rủi ro
- Xuất báo cáo dưới nhiều định dạng (PDF, CSV, v.v.)
- Trực quan hóa dữ liệu theo nhiều góc nhìn khác nhau
- Theo dõi các xu hướng và mẫu trong dữ liệu lỗ hổng



