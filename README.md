# PCRU CS CONNECT

แพลตฟอร์มแลกเปลี่ยนความรู้สำหรับนักศึกษาและอาจารย์ สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยราชภัฏเพชรบูรณ์

## ✨ Features

- 🔐 **Custom Authentication** - ระบบล็อกอินด้วยรหัสนักศึกษา/อาจารย์
- 💬 **Q&A System** - ระบบถาม-ตอบแบบมีโครงสร้าง
- 🏷️ **Category Management** - จัดหมวดหมู่กระทู้
- 👍 **Like System** - ระบบกดถูกใจ
- 📊 **Admin Dashboard** - แดชบอร์ดสำหรับผู้ดูแลระบบ
- 🌙 **Dark/Light Theme** - สลับธีมได้
- 🌐 **Multi-language** - รองรับภาษาไทย/อังกฤษ
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- ✨ **Modern Glass UI** - ดิไซน์แบบ iOS-like Glass Morphism

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT + bcrypt
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **UI Components**: shadcn/ui + Radix UI
- **Email**: Resend
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ หรือ Bun
- Supabase Account
- Resend Account (สำหรับส่งอีเมล)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pcru-cs-connect
```

2. **Install dependencies**
```bash
bun install
# หรือ
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret for custom auth
JWT_SECRET=your_jwt_secret_key

# Resend API Key for email
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup Database**

รันคำสั่ง SQL ในไฟล์ `supabase-schema.sql` ใน Supabase SQL Editor:

```bash
# เปิดไฟล์ supabase-schema.sql และคัดลอกไปรันใน Supabase
```

5. **Run Development Server**
```bash
bun dev
# หรือ
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── features/         # Feature components
├── lib/                  # Core utilities
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Auth utilities
│   ├── i18n.ts           # Internationalization
│   └── utils.ts          # General utilities
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── styles/               # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: #FF6B1A (Orange)
- **Glass Effects**: Various opacity levels
- **Gradients**: Primary-based gradients

### Components
- **Glass Morphism**: Backdrop blur effects
- **Liquid Animations**: Smooth morphing animations
- **Floating Cards**: Elevated glass cards
- **Responsive Layout**: Mobile-first design

## 👥 User Roles

### Student (s)
- สร้างและดูกระทู้
- แสดงความคิดเห็น
- กดถูกใจ
- รายงานเนื้อหา

### Teacher (t)
- ทุกสิทธิ์ของนักศึกษา
- ตรวจสอบและตอบคำถาม

### Admin (a)
- ทุกสิทธิ์ของอาจารย์
- จัดการผู้ใช้
- จัดการหมวดหมู่
- จัดการรายงาน
- ดูสถิติระบบ

## 🔧 Development

### Available Scripts

```bash
# Development
bun dev

# Build
bun run build

# Start production
bun start

# Lint
bun run lint
```

### Adding New Features

1. สร้าง types ใน `src/types/`
2. สร้าง API routes ใน `src/app/api/`
3. สร้าง components ใน `src/components/`
4. สร้าง pages ใน `src/app/`
5. เพิ่ม translations ใน `src/lib/i18n.ts`

## 📧 Email Templates

ระบบใช้ Resend สำหรับส่งอีเมล:
- Reset Password
- Welcome Email (อนาคต)
- Notifications (อนาคต)

## 🔒 Security

- JWT-based authentication
- bcrypt password hashing
- Row Level Security (RLS) ใน Supabase
- Input validation ด้วย Zod
- CSRF protection
- XSS protection

## 🌐 Internationalization

รองรับภาษา:
- ไทย (th) - ภาษาเริ่มต้น
- อังกฤษ (en)

เพิ่มภาษาใหม่ใน `src/lib/i18n.ts`

## 📱 Responsive Breakpoints

```css
sm: 640px   # Mobile landscape
md: 768px   # Tablet
lg: 1024px  # Desktop
xl: 1280px  # Large desktop
2xl: 1536px # Extra large
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ไป GitHub
2. Connect repository ใน Vercel
3. Set environment variables
4. Deploy

### Other Platforms

- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- **PCRU CS Department** - Initial work

## 🙏 Acknowledgments

- มหาวิทยาลัยราชภัฏเพชรบูรณ์
- สาขาวิชาวิทยาการคอมพิวเตอร์
- Next.js Team
- Supabase Team
- shadcn/ui