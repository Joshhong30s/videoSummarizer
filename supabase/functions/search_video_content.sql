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
