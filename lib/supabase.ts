import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 客戶端使用
export const supabase = createClientComponentClient();

// 常量
export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';
