# Railway Deployment Configuration
# Đây là file hướng dẫn deploy backend lên Railway

## Bước 1: Tạo tài khoản Railway
1. Truy cập https://railway.app
2. Đăng ký/Đăng nhập bằng GitHub

## Bước 2: Deploy Backend
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway sẽ tự động detect và deploy

## Bước 3: Cấu hình
1. Vào Settings > Root Directory: đặt là `backend`
2. Vào Variables > Add Variable:
   - PORT: 3000
   - NODE_ENV: production
   - DATABASE_PATH: /app/database.sqlite

## Bước 4: Lấy URL
1. Vào Settings > Domains
2. Generate domain
3. Copy URL (ví dụ: https://your-app.railway.app)

## Bước 5: Cấu hình Frontend
1. Tạo file `.env` trong thư mục `frontend`
2. Thêm: VITE_API_URL=https://your-app.railway.app/api

