# APP CHOICE WEB

## 📝 Mô tả dự án

**APP CHOICE WEB** là ứng dụng web frontend cho hệ thống thi trắc nghiệm trực tuyến, được xây dựng bằng React và Vite. Ứng dụng này dành cho giáo viên và giám thị để quản lý bài thi, theo dõi sinh viên và xem báo cáo kết quả.

### Đặc điểm chính:
- 🎨 Giao diện hiện đại với Ant Design
- 📱 Responsive design cho mọi thiết bị
- 🔐 Xác thực người dùng với JWT
- 📊 Dashboard quản lý bài thi
- 👀 Theo dõi sinh viên real-time
- 📈 Báo cáo và thống kê chi tiết
- 🚀 Performance cao với Vite

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống:
- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Backend API đang chạy

### Bước 1: Clone repository
```bash
git clone https://github.com/ThuKhuong/APP_CHOICE_WEB.git
cd APP_CHOICE_WEB
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình API endpoint
Mở file `src/api/axiosClient.js` và kiểm tra baseURL:
```javascript
const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/teacher", // Đảm bảo đúng với backend
});
```

### Bước 4: Chạy ứng dụng
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 📖 Cách sử dụng

### Tính năng chính

#### 1. Đăng nhập/Đăng ký
- Truy cập trang chủ để đăng nhập
- Sử dụng email và password để đăng nhập
- Token JWT được lưu trong localStorage

#### 2. Quản lý bài thi
- Tạo bài thi mới với câu hỏi trắc nghiệm
- Chỉnh sửa và xóa bài thi
- Xem danh sách tất cả bài thi
- Cấu hình thời gian và cài đặt thi

#### 3. Theo dõi sinh viên
- Xem danh sách sinh viên đang thi
- Monitor real-time quá trình làm bài
- Phát hiện và báo cáo vi phạm
- Xem thống kê thời gian làm bài

#### 4. Báo cáo và thống kê
- Xem kết quả thi của sinh viên
- Thống kê điểm số và tỷ lệ đúng/sai
- Xuất báo cáo dưới dạng PDF/Excel
- Phân tích xu hướng điểm số

### Ví dụ sử dụng

#### Tạo bài thi mới
1. Đăng nhập với tài khoản giáo viên
2. Vào trang "Quản lý bài thi"
3. Click "Tạo bài thi mới"
4. Điền thông tin bài thi và câu hỏi
5. Lưu và phát hành bài thi

#### Theo dõi sinh viên
1. Vào trang "Giám sát thi"
2. Chọn bài thi đang diễn ra
3. Xem danh sách sinh viên đang thi
4. Click vào sinh viên để xem chi tiết
5. Báo cáo vi phạm nếu có

## 📦 Dependencies

### Production Dependencies:
- **react** (^19.1.1) - React library
- **react-dom** (^19.1.1) - React DOM
- **react-router-dom** (^7.9.4) - Client-side routing
- **antd** (^5.27.5) - UI component library
- **axios** (^1.12.2) - HTTP client

### Development Dependencies:
- **vite** (^7.1.7) - Build tool
- **@vitejs/plugin-react** (^5.0.4) - React plugin for Vite
- **eslint** (^9.36.0) - Code linting
- **@types/react** (^19.1.16) - TypeScript types for React
- **@types/react-dom** (^19.1.9) - TypeScript types for React DOM

## 🐛 Khắc phục lỗi phổ biến

### 1. Lỗi kết nối API
```
Network Error: Failed to fetch
```
**Giải pháp:**
- Kiểm tra backend API đã chạy chưa
- Kiểm tra URL trong `axiosClient.js`
- Kiểm tra CORS configuration

### 2. Lỗi authentication
```
401 Unauthorized
```
**Giải pháp:**
- Kiểm tra token trong localStorage
- Đăng nhập lại nếu token hết hạn
- Kiểm tra JWT_SECRET ở backend

### 3. Lỗi build
```
Build failed with errors
```
**Giải pháp:**
- Chạy `npm run lint` để kiểm tra lỗi code
- Cài đặt lại dependencies: `rm -rf node_modules && npm install`
- Kiểm tra version Node.js

### 4. Lỗi routing
```
404 Not Found
```
**Giải pháp:**
- Kiểm tra cấu hình routes trong `App.jsx`
- Đảm bảo component được import đúng
- Kiểm tra path trong `react-router-dom`

## ❓ Câu hỏi thường gặp

**Q: Làm sao để thay đổi theme của ứng dụng?**
A: Sử dụng Ant Design ConfigProvider để customize theme trong `main.jsx`

**Q: Có thể deploy lên hosting nào?**
A: Có thể deploy lên Vercel, Netlify, hoặc bất kỳ hosting nào hỗ trợ static files

**Q: Làm sao để thêm tính năng mới?**
A: Tạo component mới trong `src/components/` và thêm route trong `App.jsx`

**Q: Có hỗ trợ PWA không?**
A: Hiện tại chưa, nhưng có thể thêm service worker và manifest

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy tắc đóng góp:
- Code phải tuân thủ ESLint rules
- Sử dụng Prettier để format code
- Viết component theo functional component pattern
- Thêm PropTypes hoặc TypeScript cho type safety
- Test responsive design trên nhiều thiết bị

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Documentation](https://ant.design/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

## 🐛 Lỗi đã biết

1. **Memory leak với large datasets** - Cần implement virtualization
2. **Slow rendering với nhiều câu hỏi** - Cần optimize component re-rendering
3. **Mobile responsiveness issues** - Một số component chưa responsive hoàn hảo
4. **Browser compatibility** - Có thể có vấn đề với IE11 và Safari cũ