# API 文檔

## 影片 API

### 新增影片

```http
POST /api/videos
```

請求體:
```json
{
  "url": "https://www.youtube.com/watch?v=xxxxx"
}
```

### 獲取影片資訊

```http
GET /api/videos/{id}
```

### 獲取字幕

```http
GET /api/videos/{id}/subtitles
```

### 更新字幕

```http
PATCH /api/videos/{id}/subtitles
```

請求體:
```json
{
  "subtitles": [
    {
      "start": 0,
      "duration": 5,
      "text": "字幕內容"
    }
  ]
}
```

## 摘要 API

### 生成摘要

```http
POST /api/videos/{id}/generate-summary
```

請求體:
```json
{
  "subtitles": [...],
  "model": "openai" | "gemini"
}
```

## 翻譯 API

### 翻譯字幕

```http
POST /api/videos/{id}/translate
```

請求體:
```json
{
  "subtitles": [...]
}
```

## 標記 API

### 創建標記

```http
POST /api/videos/{id}/highlights
```

請求體:
```json
{
  "video_id": "uuid",
  "content": "標記內容",
  "start_offset": 10,
  "end_offset": 15,
  "type": "subtitle",
  "color": "#FFD700"
}
```

### 獲取標記

```http
GET /api/videos/{id}/highlights
```

### 更新標記

```http
PATCH /api/videos/{id}/highlights/{highlightId}
```

### 刪除標記

```http
DELETE /api/videos/{id}/highlights/{highlightId}
```

## 搜尋 API

### 搜尋影片內容

```http
GET /api/search
```

查詢參數:
```
q: 搜尋關鍵字
type: "subtitle" | "highlight" | "note"
category: "分類 ID"
```

## 錯誤處理

所有 API 端點在出錯時會返回以下格式：

```json
{
  "error": "錯誤訊息",
  "message": "詳細說明",
  "status": 400
}
```

通用狀態碼：
- 200: 成功
- 400: 請求錯誤
- 401: 未授權
- 404: 資源不存在
- 500: 伺服器錯誤

## 資料庫結構

### videos 表
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### highlights 表
```sql
CREATE TABLE highlights (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id),
  content TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### summaries 表
```sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id),
  zh_summary TEXT,
  en_summary TEXT,
  classification TEXT,
  subtitles JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
);
