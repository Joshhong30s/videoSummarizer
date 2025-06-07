-- Enable the pg_trgm extension for text search
create extension if not exists pg_trgm;

-- Add generated columns for search
alter table videos
add column if not exists search_text tsvector
generated always as (
  setweight(to_tsvector('chinese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('chinese', coalesce(summary, '')), 'B')
) stored;

-- Add generated columns for search in subtitles
alter table subtitles
add column if not exists search_text tsvector
generated always as (
  setweight(to_tsvector('chinese', coalesce(content, '')), 'C')
) stored;

-- Add generated columns for search in highlights
alter table highlights 
add column if not exists search_text tsvector
generated always as (
  setweight(to_tsvector('chinese', coalesce(content, '')), 'C')
) stored;

-- Add generated columns for search in notes
alter table notes
add column if not exists search_text tsvector
generated always as (
  setweight(to_tsvector('chinese', coalesce(content, '')), 'C')
) stored;

-- Create GIN indexes for full text search
create index if not exists videos_search_idx on videos using gin(search_text);
create index if not exists subtitles_search_idx on subtitles using gin(search_text);
create index if not exists highlights_search_idx on highlights using gin(search_text);
create index if not exists notes_search_idx on notes using gin(search_text);

-- Create a view for unified search
create or replace view video_content_search as
select 
  v.id as video_id,
  v.title as video_title,
  v.youtube_id,
  v.thumbnail_url,
  'video' as content_type,
  null as timestamp,
  v.title as content,
  v.search_text
from videos v
union all
select 
  s.video_id,
  v.title as video_title,
  v.youtube_id,
  v.thumbnail_url,
  'subtitle' as content_type,
  s.start_time as timestamp,
  s.content,
  s.search_text
from subtitles s
join videos v on v.id = s.video_id
union all
select 
  h.video_id,
  v.title as video_title,
  v.youtube_id,
  v.thumbnail_url,
  'highlight' as content_type,
  h.timestamp,
  h.content,
  h.search_text
from highlights h
join videos v on v.id = h.video_id
union all
select 
  n.video_id,
  v.title as video_title,
  v.youtube_id,
  v.thumbnail_url,
  'note' as content_type,
  n.timestamp,
  n.content,
  n.search_text
from notes n
join videos v on v.id = n.video_id;

-- Create function for searching video content
create or replace function search_video_content(
  search_query text,
  content_types text[] default array['video', 'subtitle', 'highlight', 'note'],
  category_ids text[] default null,
  start_time float8 default null,
  end_time float8 default null
) returns table (
  video_id text,
  video_title text,
  youtube_id text,
  thumbnail_url text,
  content_type text,
  timestamp float8,
  content text,
  rank float4
) language sql stable as $$
  select
    video_id,
    video_title,
    youtube_id,
    thumbnail_url,
    content_type,
    timestamp,
    content,
    ts_rank(search_text, websearch_to_tsquery('chinese', search_query)) as rank
  from video_content_search
  where 
    content_type = any(content_types)
    and (category_ids is null or exists (
      select 1 from video_categories vc 
      where vc.video_id = video_content_search.video_id 
      and vc.category_id = any(category_ids)
    ))
    and (
      start_time is null 
      or end_time is null 
      or (
        timestamp is not null 
        and timestamp >= start_time 
        and timestamp <= end_time
      )
    )
    and search_text @@ websearch_to_tsquery('chinese', search_query)
  order by rank desc, timestamp asc;
$$;
