import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';
