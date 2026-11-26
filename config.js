// TrustMed Academy — runtime config.
// The Supabase URL and publishable (anon) key are PUBLIC by design:
// the publishable key is safe to ship in client-side code (RLS enforces access).
// To override (e.g. a different project), set window.__TRUSTMED_CONFIG__
// BEFORE app.js loads, or replace these values. NEVER put a service_role key here.
window.__TRUSTMED_CONFIG__ = Object.assign({
  SUPABASE_URL: "https://jezkxfmrwfebevwrfnal.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_NMCB9M85WDGMZ_WMv2T5hw_gQrbUkeQ"
}, window.__TRUSTMED_CONFIG__ || {});
