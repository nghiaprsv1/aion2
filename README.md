# AION2 Energy & Kina Manager

Hệ thống quản lý năng lượng và Kina cho game AION2 với tính năng tự động tính toán năng lượng theo thời gian.

## Tính năng

- ✅ Quản lý nhiều tài khoản và nhân vật
- ✅ Tự động tính toán năng lượng (15 năng lượng vào 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h giờ VN, tối đa 840)
- ✅ Hiển thị thời gian đầy năng lượng
- ✅ Quản lý năng lượng phụ (tùy chỉnh)
- ✅ Theo dõi Kina và sức mạnh
- ✅ Giao diện đẹp, responsive
- ✅ Cập nhật real-time

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm run install:all
```

### Chạy development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Build production

```bash
npm run build
```

## Deployment

### Frontend (Vercel)
1. Push code lên GitHub
2. Import project vào Vercel
3. Set root directory: `frontend`
4. Deploy

### Backend (Railway/Render)
1. Push code lên GitHub
2. Import project vào Railway/Render
3. Set root directory: `backend`
4. Set start command: `npm start`
5. Deploy

## Cấu trúc dự án

```
AION2/
├── frontend/          # React + TypeScript + Tailwind
├── backend/           # Express + TypeScript + SQLite
├── package.json       # Root package
└── README.md
```

## License

MIT

# aion2
