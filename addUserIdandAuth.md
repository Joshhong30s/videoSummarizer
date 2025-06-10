階段 1：準備工作和備份

1. 備份當前數據庫

```sql
pg_dump your_database > backup.sql
```

2. 創建新的遷移文件：`supabase/migrations/20250608_add_user_auth.sql`

```sql
-- 可以回滾的遷移文件
BEGIN;

-- 先創建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 添加外鍵但允許為空（安全）
ALTER TABLE videos ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE summaries ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE highlights ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE video_notes ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE categories ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE subtitle_translations ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE subtitles_flat ADD COLUMN user_id UUID REFERENCES users(id);

COMMIT;
```

階段 2：安裝和配置 NextAuth

1. 安裝依賴：

```bash
npm install next-auth
```

2. 創建 Google OAuth 憑證

- 訪問 Google Cloud Console
- 創建 OAuth 2.0 憑證
- 設置重定向 URI：`/api/auth/callback/google`

3. 設置 NextAuth：

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
});
```

階段 3：數據遷移（最關鍵部分）

1. 為自己創建用戶記錄：

```sql
INSERT INTO users (id, email, name)
VALUES ('your-uuid', 'your-email', 'your-name')
RETURNING id;
```

2. 保存返回的 UUID，然後更新現有數據：

```sql
-- 先測試查詢
SELECT COUNT(*) FROM videos WHERE user_id IS NULL;

-- 確認數量正確後再更新
UPDATE videos SET user_id = 'your-uuid' WHERE user_id IS NULL;
UPDATE summaries SET user_id = 'your-uuid' WHERE user_id IS NULL;
-- ... 其他表格
```

階段 4：前端整合

1. 修改 layout.tsx 添加登入狀態
2. 添加登入按鈕
3. 修改 API 調用添加用戶認證

每個階段的檢查點：

- 階段 1 後：確認表格結構正確，無報錯
- 階段 2 後：確認 Google 登入功能正常
- 階段 3 後：確認數據遷移無誤，原有功能正常
- 階段 4 後：確認新用戶可以正常使用

你想從哪個階段開始？我可以提供更詳細的步驟和檢查方法。
