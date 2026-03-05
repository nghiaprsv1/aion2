# Render Deployment Configuration (Alternative to Railway)
# Đây là file hướng dẫn deploy backend lên Render

## Bước 1: Tạo tài khoản Render
1. Truy cập https://render.com
2. Đăng ký/Đăng nhập bằng GitHub

## Bước 2: Deploy Backend
1. Click "New +" > "Web Service"
2. Connect repository từ GitHub
3. Cấu hình:
   - Name: aion2-backend
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## Bước 3: Cấu hình Environment Variables
1. Scroll xuống Environment Variables
2. Thêm:
   - PORT: 3000
   - NODE_ENV: production
   - DATABASE_PATH: /opt/render/project/src/database.sqlite

## Bước 4: Chọn Plan
1. Chọn Free plan (hoặc paid nếu cần)
2. Click "Create Web Service"

## Bước 5: Lấy URL
1. Sau khi deploy xong, copy URL
2. URL dạng: https://aion2-backend.onrender.com

## Lưu ý
- Free plan sẽ sleep sau 15 phút không hoạt động
- Lần đầu truy cập sau khi sleep sẽ mất ~30s để wake up
- Database SQLite sẽ bị reset khi deploy lại (nên dùng PostgreSQL cho production)

