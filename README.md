# ViệtFlow — Nền tảng Luyện 4 Kỹ Năng Tiếng Việt (A2–B1) & Flashcard Studio

**ViệtFlow** là ứng dụng web dành cho **người lớn học tiếng Việt trình độ Pre-Intermediate (A2–B1)**, kết hợp 4 trò chơi tương tác rèn luyện toàn diện **Nghe · Nói · Đọc · Phát âm** trên 6 chủ đề đời sống thực tế cùng **Flashcard Studio** hỗ trợ tạo thẻ thông minh, phát âm chuẩn và chấm điểm giọng nói trực tiếp.

---

## Tính năng nổi bật

- **6 Chủ đề Giao tiếp A2–B1 thực tế**:
  1. **Bản thân** (*Myself & Background*)
  2. **Ẩm thực & Sở thích ăn uống** (*Food & Eating Habits*)
  3. **Sinh hoạt hằng ngày** (*Daily Routine*)
  4. **Thời tiết** (*Weather & Seasons*)
  5. **Cảm xúc** (*Emotions & Reactions*)
  6. **Quan điểm cơ bản** (*Basic Opinions*)
- **4 Chế độ Trò chơi Kỹ năng**:
  - **Đấu Trường Nghe & Hiểu**: Hội thoại đời sống, chỉnh tốc độ (`0.75x / 1.0x / 1.15x`), bản chữ, gợi ý và từ vựng nghe lại tức thì.
  - **Phòng Lab Phát Âm & 6 Thanh Điệu**: Luyện cặp từ tối thiểu (*mới/mời*, *nắng/nặng*...) và đọc câu thực tế với chấm điểm chi tiết theo từng âm tiết & thanh điệu.
  - **Nhập Vai Đối Thoại Thực Tế**: Hội thoại tương tác 4 lượt bằng giọng nói hoặc chọn câu phản hồi có hướng dẫn.
  - **Đọc Hiểu & Ghép Câu Giao Tiếp**: Đoạn văn A2–B1 tích hợp từ điển chạm phát âm ngay tại chỗ + trò chơi ghép câu phản xạ.
- **Flashcard Studio**:
  - Giao diện dark-navy tối giản, lật thẻ 3D, phím tắt `←` `→` `Space` `Enter`, tự động phát âm khi chuyển thẻ và nút micro luyện phát âm ngay trên thẻ.
  - **Tạo Flashcard nhanh**: Nhập từng thẻ (Từ vựng, Loại từ, Phiên âm, Định nghĩa, Ví dụ) hoặc **Nhập hàng loạt thông minh** (dán danh sách từ + định nghĩa + ví dụ → xem trước và tạo ngay).
- **Giọng đọc Tiếng Việt ổn định (`/api/tts`)**: Serverless TTS proxy trả MP3 tiếng Việt rõ ràng trên mọi trình duyệt, tự động dự phòng bằng Web Speech API (`vi-VN`).
- **Chạy ngay không cần đăng nhập + Sẵn sàng đồng bộ Supabase**: Tự động lưu dữ liệu trong `localStorage` khi chưa cấu hình biến môi trường; tự động kích hoạt Đăng nhập / Đăng ký và đồng bộ đa thiết bị khi kết nối Supabase.

---

## Chạy phát triển cục bộ (Local Development)

Yêu cầu: **Node.js 20+**

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ Vite hiển thị (mặc định `http://localhost:5173`).

> **Lưu ý:** Không cần cấu hình `.env` vẫn có thể sử dụng đầy đủ 100% tính năng — bộ thẻ, flashcard tùy chỉnh, điểm 4 kỹ năng, XP và chuỗi ngày học được lưu tự động trong `localStorage`. Dev server của Vite cũng tích hợp sẵn middleware `/api/tts` để phát âm thanh tiếng Việt ngay trên máy.

Các lệnh hữu ích khác:

```bash
npm test          # Chạy bộ kiểm thử đơn vị (Vitest)
npm run build     # Build bản production vào thư mục dist/
npm run preview   # Xem trước bản build cục bộ
```

---

## Cấu hình Supabase (Đồng bộ tài khoản & Đám mây)

1. Tạo một project mới trên [Supabase](https://supabase.com/).
2. Mở **SQL Editor** trong Supabase Dashboard, sao chép toàn bộ nội dung file:
   ```text
   supabase/migrations/001_initial_schema.sql
   ```
   và nhấn **Run**. Migration sẽ tự động tạo 5 bảng (`user_profiles`, `flashcard_decks`, `flashcards`, `game_sessions`, `skill_progress`), trigger `updated_at`, trigger tự khởi tạo hồ sơ khi đăng ký và đầy đủ chính sách bảo mật **Row Level Security (RLS)**.
3. Vào **Project Settings → API** và sao chép:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **Project API Keys → `anon` `public`** (`VITE_SUPABASE_ANON_KEY`)
4. Nếu muốn kiểm thử đồng bộ Supabase ngay ở máy cục bộ, tạo file `.env.local` từ `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Sau khi đăng nhập, bạn có thể mở mục trạng thái góc trên bên phải và chọn **“Đồng bộ dữ liệu local lên Supabase”** để đẩy toàn bộ bộ thẻ và lịch sử luyện tập sẵn có trên trình duyệt lên đám mây.

---

## Triển khai lên Vercel

1. Truy cập [Vercel](https://vercel.com/) → **Add New… → Project**.
2. Import repository GitHub **`harmon134r/vietnamese_neee`** (`https://github.com/harmon134r/vietnamese_neee`).
3. Tại mục cấu hình dự án:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Mở mục **Environment Variables** và thêm 2 biến môi trường từ Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   *(Nếu muốn chạy thử trước ở chế độ Local không cần Supabase, bạn vẫn có thể bỏ trống 2 biến này và thêm sau.)*
5. Nhấn **Deploy**.

File `vercel.json` đã cấu hình sẵn:
- Route `/api/*` cho Serverless Function `api/tts.js` (giọng đọc tiếng Việt có cache CDN).
- Fallback SPA về `/index.html` cho mọi đường dẫn frontend.
- Header `Permissions-Policy: microphone=(self)` và `Content-Security-Policy` cho phép ghi âm luyện phát âm và kết nối tới `*.supabase.co`.

---

## Cấu trúc thư mục chính

```text
vietnamese_neee/
├── api/
│   └── tts.js                          # Vercel Serverless TTS proxy tiếng Việt
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Schema PostgreSQL + RLS + triggers
├── src/
│   ├── App.jsx                         # Điều hướng chính, trạng thái & CRUD lưu trữ
│   ├── styles.css                      # Hệ thống giao diện dark-navy ViệtFlow
│   ├── data/                           # 6 chủ đề A2–B1, starter decks, bài nghe/đọc/đối thoại
│   ├── hooks/
│   │   └── useVietnameseSpeech.js      # React hook TTS + STT + ghi âm
│   ├── lib/
│   │   ├── contracts.js                # Hằng số & bộ chuẩn hóa dữ liệu dùng chung
│   │   ├── supabase.js                 # Supabase client + Auth helpers (null-safe)
│   │   ├── storage.js                  # Tầng lưu trữ tự chuyển đổi Supabase / localStorage
│   │   ├── speech.js                   # Động cơ phát âm & nhận diện giọng nói vi-VN
│   │   ├── pronunciation.js            # Phân tích 6 thanh điệu & chấm điểm phát âm
│   │   └── flashcardParser.js          # Trình phân tích nhập flashcard hàng loạt
│   └── components/
│       ├── layout/                     # Navbar, Dashboard, TopicOverview, AuthModal
│       ├── flashcards/                 # FlashcardStudio, FlashcardStage, Creator, DeckManager
│       └── games/                      # GameHub, Listening, PronunciationLab, Dialogue, Reading
├── .env.example
├── vercel.json
└── vite.config.js
```
