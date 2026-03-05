# Vercel Deployment Configuration
# Đây là file hướng dẫn deploy frontend lên Vercel

## Bước 1: Tạo tài khoản Vercel
1. Truy cập https://vercel.com
2. Đăng ký/Đăng nhập bằng GitHub

## Bước 2: Deploy Frontend
1. Click "Add New Project"
2. Import repository từ GitHub
3. Cấu hình:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Bước 3: Cấu hình Environment Variables
1. Vào Settings > Environment Variables
2. Thêm biến:
   - Name: `VITE_API_URL`
   - Value: URL backend của bạn (ví dụ: https://your-backend.railway.app/api)

## Bước 4: Deploy
1. Click "Deploy"
2. Đợi build hoàn thành
3. Truy cập URL được cung cấp

## Lưu ý
- Mỗi lần push code lên GitHub, Vercel sẽ tự động deploy lại
- Có thể xem logs trong dashboard
- Domain mặc định: https://your-project.vercel.app

