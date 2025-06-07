
create or replace function delete_video_cascade(video_id uuid)
returns void
language plpgsql
security definer
as $$
begin
 
  delete from highlights where video_id = $1;
  
 
  delete from summaries where video_id = $1;
  

  delete from videos where id = $1;
end;
$$;
