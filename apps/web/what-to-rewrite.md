apa yang mau di-rewrite?
here it is : 
- [x] ganti service router-nya jadi pakai library tanstack router.
- [x] gunakan juga tanstack query buat handle server state management.
- [x] semua flow fetch jadi menggunakan custom hook + tRPC-nya milik package 'hono/client'
- [x] hapus semua informasi dummy dari tampilan di web.
- [x] ubah struktur jadi feature-based. 
  ```
  src/
  ├── app/                  # Konfigurasi global app (router, provider, store)
  │   ├── providers/
  │   └── routes/
  ├── components/           # Komponen UI global yang reusable (Button, Input, Modal)
  ├── features/             # Modul berdasarkan fitur bisnis (misal: auth, dashboard, products)
  │   ├── auth/
  │   │   ├── components/   # Komponen khusus fitur auth
  │   │   ├── hooks/        # Hook khusus fitur auth
  │   │   ├── services/     # API call untuk auth
  │   │   └── types/        # TypeScript types untuk auth
  │   └── dashboard/
  ├── hooks/                # Global custom hooks
  ├── lib/                  # Konfigurasi third-party library
  ├── services/             # API/HTTP client global
  ├── types/                # Global TypeScript types/interfaces
  ├── utils/                # Helper / fungsi utilitas murni (format date, currency)
  └── assets/               # Gambar, font, icon global
  ```

next : 
- [ ] putuskan apakah tetap gunakan packages/contract atau sudah tidak perlu. 
- [ ] hapus constant routes karena sudah safetype by tanstack-router
- [ ] hapus directory pages, gunakan/pindahkan file pages ke directory features (components) sebagaimana tersedia.
- [ ] hapus directory libs. pindahkan isinya ke directory lib (plural).
- [ ] hapus file http.ts dan pindahkan isinya (flow refresh token ke auth feature dengan menggunakan tRPC hono seperti request lain).
