import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmvtcqculovobamtcbfc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kMp-ipU8GVNPunupGgqjJw_HhNTC_pB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
