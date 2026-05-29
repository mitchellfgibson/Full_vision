'use strict';

/* ============================================================
   BTHI · Supabase client
   The publishable key is safe to ship in the browser — RLS
   policies on the DB do the real access control.
============================================================ */
const SUPABASE_URL = 'https://avnndunwixpgyygdtkqk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jSy1DyD67paW5f_iT7OYRw_WMR2QIIk';

window.bthiSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
