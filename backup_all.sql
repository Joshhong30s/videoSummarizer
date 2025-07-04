

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."process_subtitle_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM subtitles_flat WHERE video_id = NEW.video_id;
  
  WITH flat_subtitles AS (
    SELECT 
      NEW.video_id,
      (jsonb_array_elements(NEW.subtitles)->>'start')::double precision as timestamp,
      jsonb_array_elements(NEW.subtitles)->>'text' as content
  )
  INSERT INTO subtitles_flat (video_id, timestamp, content, search_text)
  SELECT 
    video_id, 
    timestamp, 
    content,
    to_tsvector('simple', content) as search_text
  FROM flat_subtitles;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."process_subtitle_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_video_content"("search_query" "text", "content_types" "text"[] DEFAULT ARRAY['video'::"text", 'summary'::"text", 'note'::"text", 'subtitle'::"text"], "category_ids" "uuid"[] DEFAULT NULL::"uuid"[], "start_time" double precision DEFAULT NULL::double precision, "end_time" double precision DEFAULT NULL::double precision, "context_window" integer DEFAULT 100) RETURNS TABLE("video_id" "uuid", "video_title" "text", "youtube_id" "text", "thumbnail_url" "text", "content_type" "text", "timestamp" double precision, "content" "text", "rank" real)
    LANGUAGE "sql" STABLE
    AS $$
  with matched_content as (
    select
      video_id,
      video_title,
      youtube_id,
      thumbnail_url,
      content_type,
      "timestamp",
      content,
      ts_rank(search_text, websearch_to_tsquery('simple', search_query)) as rank,
      -- ???寥?雿蔭??敺?
      case
        when content_type = 'subtitle' then
          substring(
            content,
            greatest(1, length(content) - context_window),
            least(context_window * 2, length(content))
          )
        else content
      end as content_with_context
    from video_content_search
    where 
      content_type = any(content_types)
      and (category_ids is null or exists (
        select 1 from unnest(category_ids) cid
        where cid = any(video_content_search.category_ids)
      ))
      and (
        start_time is null 
        or end_time is null 
        or (
          "timestamp" is not null 
          and "timestamp" >= start_time 
          and "timestamp" <= end_time
        )
      )
      and search_text @@ websearch_to_tsquery('simple', search_query)
  )
  select
    video_id,
    video_title,
    youtube_id,
    thumbnail_url,
    content_type,
    "timestamp",
    content_with_context as content,
    rank
  from matched_content
  order by rank desc, "timestamp" asc;
$$;


ALTER FUNCTION "public"."search_video_content"("search_query" "text", "content_types" "text"[], "category_ids" "uuid"[], "start_time" double precision, "end_time" double precision, "context_window" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."highlights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_id" "uuid",
    "content" "text" NOT NULL,
    "start_offset" integer NOT NULL,
    "end_offset" integer NOT NULL,
    "type" "text" NOT NULL,
    "color" "text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "highlights_type_check" CHECK (("type" = ANY (ARRAY['subtitle'::"text", 'summary'::"text"])))
);


ALTER TABLE "public"."highlights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subtitle_translations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_id" "uuid",
    "start_time" integer NOT NULL,
    "end_time" integer NOT NULL,
    "original_text" "text" NOT NULL,
    "translated_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subtitle_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subtitles_flat" (
    "video_id" "uuid",
    "timestamp" double precision,
    "content" "text",
    "search_text" "tsvector"
);


ALTER TABLE "public"."subtitles_flat" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."summaries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_id" "uuid",
    "zh_summary" "text",
    "en_summary" "text",
    "classification" "text",
    "subtitles" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "search_text" "tsvector" GENERATED ALWAYS AS ((("setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("zh_summary", ''::"text")), 'A'::"char") || "setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("en_summary", ''::"text")), 'B'::"char")) || "setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("classification", ''::"text")), 'C'::"char"))) STORED
);


ALTER TABLE "public"."summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."video_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_id" "uuid",
    "type" "text",
    "content" "text" NOT NULL,
    "timestamp" integer,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "search_text" "tsvector" GENERATED ALWAYS AS ("setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("content", ''::"text")), 'A'::"char")) STORED,
    CONSTRAINT "video_notes_type_check" CHECK (("type" = ANY (ARRAY['highlight'::"text", 'takeaway'::"text", 'summary'::"text"])))
);


ALTER TABLE "public"."video_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "youtube_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "thumbnail_url" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "category_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "search_text" "tsvector" GENERATED ALWAYS AS ("setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("title", ''::"text")), 'A'::"char")) STORED,
    "published_at" timestamp with time zone
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."video_content_search" AS
 SELECT "v"."id" AS "video_id",
    "v"."title" AS "video_title",
    "v"."youtube_id",
    "v"."thumbnail_url",
    "v"."category_ids",
    'video'::"text" AS "content_type",
    NULL::double precision AS "timestamp",
    "v"."title" AS "content",
    "setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("v"."title", ''::"text")), 'A'::"char") AS "search_text"
   FROM "public"."videos" "v"
UNION ALL
 SELECT "s"."video_id",
    "v"."title" AS "video_title",
    "v"."youtube_id",
    "v"."thumbnail_url",
    "v"."category_ids",
    'summary'::"text" AS "content_type",
    NULL::double precision AS "timestamp",
    ((((COALESCE("s"."zh_summary", ''::"text") || ' '::"text") || COALESCE("s"."en_summary", ''::"text")) || ' '::"text") || COALESCE("s"."classification", ''::"text")) AS "content",
    "s"."search_text"
   FROM ("public"."summaries" "s"
     JOIN "public"."videos" "v" ON (("v"."id" = "s"."video_id")))
UNION ALL
 SELECT "f"."video_id",
    "v"."title" AS "video_title",
    "v"."youtube_id",
    "v"."thumbnail_url",
    "v"."category_ids",
    'subtitle'::"text" AS "content_type",
    "f"."timestamp",
    "f"."content",
    "f"."search_text"
   FROM ("public"."subtitles_flat" "f"
     JOIN "public"."videos" "v" ON (("v"."id" = "f"."video_id")))
UNION ALL
 SELECT "n"."video_id",
    "v"."title" AS "video_title",
    "v"."youtube_id",
    "v"."thumbnail_url",
    "v"."category_ids",
    "n"."type" AS "content_type",
    ("n"."timestamp")::double precision AS "timestamp",
    "n"."content",
    "setweight"("to_tsvector"('"simple"'::"regconfig", COALESCE("n"."content", ''::"text")), 'B'::"char") AS "search_text"
   FROM ("public"."video_notes" "n"
     JOIN "public"."videos" "v" ON (("v"."id" = "n"."video_id")));


ALTER TABLE "public"."video_content_search" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subtitle_translations"
    ADD CONSTRAINT "subtitle_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."summaries"
    ADD CONSTRAINT "summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."video_notes"
    ADD CONSTRAINT "video_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_youtube_id_key" UNIQUE ("youtube_id");



CREATE INDEX "idx_highlights_video_id" ON "public"."highlights" USING "btree" ("video_id");



CREATE INDEX "idx_subtitle_translations_start_time" ON "public"."subtitle_translations" USING "btree" ("start_time");



CREATE INDEX "idx_subtitle_translations_video_id" ON "public"."subtitle_translations" USING "btree" ("video_id");



CREATE INDEX "idx_summaries_video_id" ON "public"."summaries" USING "btree" ("video_id");



CREATE INDEX "idx_video_notes_type" ON "public"."video_notes" USING "btree" ("type");



CREATE INDEX "idx_video_notes_video_id" ON "public"."video_notes" USING "btree" ("video_id");



CREATE INDEX "idx_videos_category_ids" ON "public"."videos" USING "gin" ("category_ids");



CREATE INDEX "idx_videos_metadata" ON "public"."videos" USING "gin" ("metadata");



CREATE INDEX "idx_videos_youtube_id" ON "public"."videos" USING "btree" ("youtube_id");



CREATE INDEX "subtitles_flat_search_idx" ON "public"."subtitles_flat" USING "gin" ("search_text");



CREATE INDEX "summaries_search_idx" ON "public"."summaries" USING "gin" ("search_text");



CREATE INDEX "video_notes_search_idx" ON "public"."video_notes" USING "gin" ("search_text");



CREATE INDEX "videos_search_idx" ON "public"."videos" USING "gin" ("search_text");



CREATE OR REPLACE TRIGGER "flatten_subtitles" AFTER INSERT OR UPDATE OF "subtitles" ON "public"."summaries" FOR EACH ROW EXECUTE FUNCTION "public"."process_subtitle_changes"();



CREATE OR REPLACE TRIGGER "update_videos_updated_at" BEFORE UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subtitle_translations"
    ADD CONSTRAINT "subtitle_translations_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."summaries"
    ADD CONSTRAINT "summaries_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."video_notes"
    ADD CONSTRAINT "video_notes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



CREATE POLICY "Allow delete for all" ON "public"."categories" FOR DELETE USING (true);



CREATE POLICY "Allow update for all" ON "public"."categories" FOR UPDATE USING (true);



CREATE POLICY "Enable delete access" ON "public"."highlights" FOR DELETE USING (true);



CREATE POLICY "Enable delete access" ON "public"."summaries" FOR DELETE USING (true);



CREATE POLICY "Enable delete access" ON "public"."videos" FOR DELETE USING (true);



CREATE POLICY "Enable insert access" ON "public"."categories" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public delete access" ON "public"."video_notes" FOR DELETE USING (true);



CREATE POLICY "Public insert access" ON "public"."highlights" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."subtitle_translations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."summaries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."video_notes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert access" ON "public"."videos" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public read access" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."highlights" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."subtitle_translations" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."summaries" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."video_notes" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."videos" FOR SELECT USING (true);



CREATE POLICY "Public update access" ON "public"."highlights" FOR UPDATE USING (true);



CREATE POLICY "Public update access" ON "public"."summaries" FOR UPDATE USING (true);



CREATE POLICY "Public update access" ON "public"."video_notes" FOR UPDATE USING (true);



CREATE POLICY "Public update access" ON "public"."videos" FOR UPDATE USING (true);



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."highlights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subtitle_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_subtitle_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_subtitle_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_subtitle_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_video_content"("search_query" "text", "content_types" "text"[], "category_ids" "uuid"[], "start_time" double precision, "end_time" double precision, "context_window" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_video_content"("search_query" "text", "content_types" "text"[], "category_ids" "uuid"[], "start_time" double precision, "end_time" double precision, "context_window" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_video_content"("search_query" "text", "content_types" "text"[], "category_ids" "uuid"[], "start_time" double precision, "end_time" double precision, "context_window" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."highlights" TO "anon";
GRANT ALL ON TABLE "public"."highlights" TO "authenticated";
GRANT ALL ON TABLE "public"."highlights" TO "service_role";



GRANT ALL ON TABLE "public"."subtitle_translations" TO "anon";
GRANT ALL ON TABLE "public"."subtitle_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."subtitle_translations" TO "service_role";



GRANT ALL ON TABLE "public"."subtitles_flat" TO "anon";
GRANT ALL ON TABLE "public"."subtitles_flat" TO "authenticated";
GRANT ALL ON TABLE "public"."subtitles_flat" TO "service_role";



GRANT ALL ON TABLE "public"."summaries" TO "anon";
GRANT ALL ON TABLE "public"."summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."summaries" TO "service_role";



GRANT ALL ON TABLE "public"."video_notes" TO "anon";
GRANT ALL ON TABLE "public"."video_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."video_notes" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";



GRANT ALL ON TABLE "public"."video_content_search" TO "anon";
GRANT ALL ON TABLE "public"."video_content_search" TO "authenticated";
GRANT ALL ON TABLE "public"."video_content_search" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
