# PropInvest AI — วิธีรันและเผยแพร่

เว็บนี้เป็นแบบ full-stack: React (Vite) สำหรับหน้าเว็บ + Express (`server.ts`) สำหรับ API, Gemini AI, Stripe และระบบหลังบ้าน

## 1. ติดตั้ง (ครั้งแรก)

ต้องมี **Node.js 22+**

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
```

แก้ไฟล์ `.env`:

| ตัวแปร | จำเป็น? | ใช้ทำอะไร |
|---|---|---|
| `GEMINI_API_KEY` | แนะนำ | AI สแกนป้าย (OCR) และบทวิเคราะห์ — ถ้าไม่ใส่ ระบบวิเคราะห์จะใช้สูตรคำนวณแทน แต่สแกนป้ายจะใช้ไม่ได้ |
| `ADMIN_EMAILS` | แนะนำ | Gmail ที่เป็น Super Admin / VIP ไม่จำกัด (คั่นด้วย `,`) — ฝั่ง server |
| `VITE_ADMIN_EMAILS` | แนะนำ | รายชื่อเดียวกัน สำหรับแสดงปุ่มหลังบ้านบนหน้าเว็บ (ต้อง build ใหม่หลังแก้) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | ไม่บังคับ | รับชำระเงินแพ็กเกจจริง |

ขอ Gemini API key ฟรีได้ที่ https://aistudio.google.com/apikey

## 2. รัน

```bash
npm run dev    # โหมดพัฒนา (แก้โค้ดแล้วรีเฟรชอัตโนมัติ)
npm run prod   # build + รันแบบ production
```

เปิด http://localhost:3000

## 3. เผยแพร่ขึ้นเว็บจริง

มี `Dockerfile` ให้แล้ว ใช้ได้กับ Google Cloud Run, Render, Railway, Fly.io ฯลฯ ตัวอย่าง Cloud Run:

```bash
gcloud run deploy propinvest --source . --region asia-southeast1 --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=xxx,ADMIN_EMAILS=you@gmail.com
```

(ถ้าต้องการให้ปุ่มหลังบ้านโชว์ ให้ส่ง `VITE_ADMIN_EMAILS` เป็น build-arg ตอน build image ด้วย)

**สำคัญ — ล็อกอิน Google:** หลังได้โดเมนจริง ต้องเข้า Firebase Console → Authentication → Settings → *Authorized domains* แล้วเพิ่มโดเมนนั้น ไม่งั้นปุ่ม "เข้าสู่ระบบ" จะ error

## สิ่งที่แก้จากซอร์สเดิม

- แก้ `package.json`: esbuild เวอร์ชันชนกับ Vite 8 ทำให้ `npm install` ไม่ผ่าน
- **ช่องโหว่สิทธิ์แอดมิน:** เดิมอีเมลใดก็ตามที่ *มีคำ* ของชื่อเจ้าของอยู่ข้างในจะได้สิทธิ์ Super Admin ทันที — เปลี่ยนเป็นจับคู่ตรงตัวจาก `ADMIN_EMAILS`
- ย้ายอีเมลเจ้าของที่ hardcode ไว้ ~70 จุด ออกไปเป็น env var; ข้อมูลตัวอย่างใน `server/revenue_store.json` เปลี่ยนเป็น `@example.com`
- ปุ่มจำลองล็อกอินแอดมิน (`handleSimulateAdmin`) ใช้ได้เฉพาะโหมด dev
- **ระบบยืนยันตัวตนฝั่ง server:** หน้าเว็บส่ง Firebase ID token มากับทุกคำขอที่ต้องใช้สิทธิ์ แล้ว server ตรวจลายเซ็นด้วย `firebase-admin` และเชื่อเฉพาะอีเมลที่อยู่ใน token
  - `/api/admin/*`, `/api/revenue/stats`, `/api/revenue/settings` → ต้องล็อกอินเป็นอีเมลใน `ADMIN_EMAILS` เท่านั้น (ไม่มี token ตอบ 401, ไม่ใช่แอดมินตอบ 403)
  - การขอสิทธิ์ VIP ไม่จำกัดใน `sync-user`, `select-plan`, `create-checkout-session` → ต้องมี token ของอีเมลนั้นจริง ส่งแค่อีเมลมาอย่างเดียวใช้ไม่ได้แล้ว
  - ทดสอบหลังบ้านบนเครื่องโดยไม่ล็อกอิน: ตั้ง `DEV_SKIP_ADMIN_AUTH=true` แล้วใช้ `npm run dev` (โหมด production จะไม่สนใจค่านี้)
- เพิ่ม `npm run prod` (ใช้ได้ทั้ง Windows/Mac/Linux), `Dockerfile`

## ข้อควรรู้ก่อนเปิดให้คนอื่นใช้

- **ระบบสมาชิกยังเป็น workspace เดียวทั้งเว็บ:** server เก็บสถานะทีม/โควตา/แพ็กเกจไว้ชุดเดียว (`server/workspace_store.json`) ผู้ใช้ทุกคนจึงใช้ข้อมูลชุดเดียวกัน ใครล็อกอินล่าสุดก็กลายเป็นผู้ใช้ที่ active ถ้าจะเปิดให้หลายคนใช้พร้อมกันต้องแยกข้อมูลรายผู้ใช้ (เช่นเก็บใน Firestore ตาม uid)
- `/api/workspace/select-plan` เปลี่ยนเป็นแพ็กเกจ Standard/Pro ได้ทันทีโดยไม่ผ่านการชำระเงิน (เป็นพฤติกรรมของโค้ดเดิม) ถ้าจะเก็บเงินจริงควรให้เปลี่ยนแพ็กเกจผ่าน Stripe webhook เท่านั้น
- ข้อมูลทีม/รายได้เก็บเป็นไฟล์ JSON ใน `server/` — บน Cloud Run ไฟล์จะหายเมื่อ instance รีสตาร์ท ถ้าต้องเก็บถาวรควรย้ายไป Firestore
