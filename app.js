/* TrustMed Academy — standalone PWA (static, talks directly to Supabase).
   No passwords or secrets are stored here. Only the PUBLIC Supabase URL +
   publishable key (safe for client code, RLS enforces access). */
const CFG = window.__TRUSTMED_CONFIG__ || {};
/* Defensive init (fix for frozen login page): if the Supabase JS library did
   not load (CDN blocked/slow) or the config is missing, the old code threw
   here on line 5 and NO event handler ever attached — every button dead,
   including the language toggle. Now we fail soft: sb stays null, the
   handlers still attach, and the login area shows a clear Arabic error. */
const SUPABASE_LOAD_ERROR = "تعذر تحميل مكتبة الدخول — تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة";
let sb = null;
try {
  if (!window.supabase || typeof window.supabase.createClient !== "function") throw new Error("sb library missing");
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) throw new Error("sb config missing");
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
} catch (e) { console.warn("Supabase init failed:", e.message); sb = null; }

const I18N = {
  ar: { dashboard:"لوحة التحكم", schedule:"الجدول الرئيسي", group_progress:"تقدم المجموعات", late_groups:"المجموعات المتأخرة", schedules:"الجداول اليومية والأسبوعية", library:"المكتبة", notifications:"الإشعارات", reports:"التقارير", messages:"الرسائل والتنسيق", assistant:"مساعد الذكاء الاصطناعي", users:"المستخدمون وطلبات الدخول", settings:"الإعدادات", logout:"تسجيل الخروج", faculty:"كلية الطب البشري — الدفعة 11", login_sub:"نظام الإدارة الأكاديمية والجداول والمحاضرات والتقارير", email:"البريد الإلكتروني", password:"كلمة السر", login:"تسجيل الدخول", create_account:"إنشاء حساب جديد", first_admin_note:"أول Super Admin: سجّل بحساب جديد ثم اطلب من المشرف تعيين دورك، أو عيّن الدور من Supabase (انظر README).", pending_title:"طلبك قيد المراجعة", pending_body:"تم استلام طلب دخولك. لن تتمكن من الوصول إلى بيانات المنصة حتى يوافق Super Admin على طلبك ويحدد دورك ومجموعتك. ستتلقى إشعاراً عند القبول.", pending_email:"البريد", subject_progress:"تقدم المواد", group_comparison:"مقارنة المجموعات", all_status:"كل الحالات", not_taken:"لم تُؤخذ", completed:"مكتملة", postponed:"مؤجلة", cancelled:"ملغاة", filter:"تصفية", add_lecture:"إضافة محاضرة", subject:"المادة", group:"المجموعة", lecture_number:"رقم المحاضرة", lecture_type:"نوع المحاضرة", theory:"نظري", practical:"عملي", lab:"معمل", clinical:"سريري", title:"عنوان المحاضرة", date:"التاريخ", start:"وقت البداية", end:"وقت النهاية", doctor:"الدكتور", room:"القاعة", status:"الحالة", notes:"ملاحظات", save:"حفظ", cancel:"إلغاء", quick_entry:"إدخال سريع لمجموعات متعددة", quick_entry_hint:"اختر عدة مجموعات لإنشاء محاضرة مستقلة لكل مجموعة بنفس المادة والرقم والتاريخ.", quick_add:"إضافة للمجموعات المحددة", all_groups:"كل المجموعات", late_hint:"كل مجموعة ناقصها محاضرات، مع المادة والعدد والأرقام الناقصة بالضبط.", publish_daily:"نشر جدول يومي", publish:"نشر", daily_list:"الجداول اليومية", publish_weekly:"نشر جدول أسبوعي", week_start:"بداية الأسبوع", week_end:"نهاية الأسبوع", weekly_list:"الجداول الأسبوعية", lecture_files:"ملفات المحاضرات", upload_file:"رفع ملف", upload:"رفع", references:"المراجع العلمية (Google Drive)", all_subjects:"كل المواد", search:"بحث", add_reference:"إضافة مرجع", author:"المؤلف", year:"سنة النشر", mark_all_read:"تعليم الكل كمقروء", report_type:"نوع التقرير", rep_group:"تقرير مجموعة", rep_all:"تقرير كل المجموعات", rep_subject:"تقرير مادة", rep_comp:"مقارنة المجموعات", rep_audit:"تقرير التدقيق", generate:"توليد التقرير", print_pdf:"طباعة / حفظ PDF", conversations:"المحادثات", message:"رسالة", send:"إرسال", assistant_hint:"يجيب من بيانات المنصة الحقيقية فقط، حسب دورك ومجموعتك.", ask:"اسأل", clear_history:"مسح السجل", pending_requests:"طلبات الدخول المعلقة", all_users:"كل المستخدمين", connection:"حالة الاتصال بـ Supabase", logo:"شعار المنصة", remove:"إزالة", logo_note:"يُحفظ الشعار في متصفحك فقط لعرضه في الترويسة والتقارير.", oauth_note:"لنشر تطبيق Google OAuth للجميع تحتاج رابط الصفحة الرئيسية ورابط سياسة الخصوصية للمنصة بعد نشرها على Vercel. أدخلهما هنا ليُحفظا للرجوع إليهما.", homepage_url:"رابط الصفحة الرئيسية", privacy_url:"رابط سياسة الخصوصية", },
  en: { dashboard:"Dashboard", schedule:"Master Schedule", group_progress:"Group Progress", late_groups:"Late Groups", schedules:"Daily & Weekly Schedules", library:"Library", notifications:"Notifications", reports:"Reports", messages:"Messages", assistant:"AI Assistant", users:"Users & Access Requests", settings:"Settings", logout:"Log out", faculty:"Faculty of Human Medicine — Batch 11", login_sub:"Academic management, schedules, lectures and reports system", email:"Email", password:"Password", login:"Sign in", create_account:"Create new account", first_admin_note:"First Super Admin: create a new account, then ask a supervisor to assign your role, or assign the role from Supabase (see README).", pending_title:"Your request is under review", pending_body:"Your access request was received. You cannot access platform data until a Super Admin approves your request and assigns your role and group. You will be notified when accepted.", pending_email:"Email", subject_progress:"Subject progress", group_comparison:"Group comparison", all_status:"All statuses", not_taken:"Not taken", completed:"Completed", postponed:"Postponed", cancelled:"Cancelled", filter:"Filter", add_lecture:"Add lecture", subject:"Subject", group:"Group", lecture_number:"Lecture number", lecture_type:"Lecture type", theory:"Theory", practical:"Practical", lab:"Lab", clinical:"Clinical", title:"Lecture title", date:"Date", start:"Start time", end:"End time", doctor:"Doctor", room:"Room", status:"Status", notes:"Notes", save:"Save", cancel:"Cancel", quick_entry:"Quick entry for multiple groups", quick_entry_hint:"Select several groups to create an independent lecture for each group with the same subject, number and date.", quick_add:"Add to selected groups", all_groups:"All groups", late_hint:"Each group with missing lectures, with the subject, count and exact missing numbers.", publish_daily:"Publish daily schedule", publish:"Publish", daily_list:"Daily schedules", publish_weekly:"Publish weekly schedule", week_start:"Week start", week_end:"Week end", weekly_list:"Weekly schedules", lecture_files:"Lecture files", upload_file:"Upload file", upload:"Upload", references:"Scientific references (Google Drive)", all_subjects:"All subjects", search:"Search", add_reference:"Add reference", author:"Author", year:"Year", mark_all_read:"Mark all as read", report_type:"Report type", rep_group:"Group report", rep_all:"All groups report", rep_subject:"Subject report", rep_comp:"Group comparison", rep_audit:"Audit report", generate:"Generate report", print_pdf:"Print / Save PDF", conversations:"Conversations", message:"Message", send:"Send", assistant_hint:"Answers only from real platform data, according to your role and group.", ask:"Ask", clear_history:"Clear history", pending_requests:"Pending access requests", all_users:"All users", connection:"Supabase connection status", logo:"Platform logo", remove:"Remove", logo_note:"The logo is stored in your browser only, to show in the header and reports.", oauth_note:"To publish the Google OAuth app for everyone you need the platform homepage URL and privacy policy URL after publishing on Vercel. Enter them here to save them for reference.", homepage_url:"Homepage URL", privacy_url:"Privacy policy URL", }
};
let LANG = localStorage.getItem("tm_lang") || "ar";
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.ar[k] || k;

const TYPE_AR = { theory:"نظري", practical:"عملي", lab:"معمل", clinical:"سريري" };
const TYPE_EN = { theory:"Theory", practical:"Practical", lab:"Lab", clinical:"Clinical" };
const STATUS_AR = { not_taken:"لم تُؤخذ", completed:"مكتملة", postponed:"مؤجلة", cancelled:"ملغاة" };
const STATUS_EN = { not_taken:"Not taken", completed:"Completed", postponed:"Postponed", cancelled:"Cancelled" };
const typeName = (v) => LANG === "ar" ? (TYPE_AR[v] || v) : (TYPE_EN[v] || v);
const statusName = (v) => LANG === "ar" ? (STATUS_AR[v] || v) : (STATUS_EN[v] || v);
const subjName = (s) => LANG === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar);

const state = {
  user: null, profile: null, batch: null,
  groups: [], subjects: [], doctors: [], rooms: [], lectures: [],
  notifications: [], files: [], refs: [], weekly: [], daily: [],
  tables: { conversations: false, messages: false, references: false, daily: false, weekly: false },
  conv: null, convMsgs: []
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const todayStr = () => new Date().toISOString().slice(0, 10);
const tomorrowStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const arNum = (n) => n; // keep western digits for clarity in mixed text

function show(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}
function setMsg(el, text, ok) { if (el) { el.textContent = text || ""; el.className = "msg" + (ok ? " ok" : ""); } }
/* If Supabase failed to initialise, say so visibly instead of a frozen page. */
if (!sb) setMsg($("loginMsg"), SUPABASE_LOAD_ERROR);
function canManage() { return state.profile && ["super_admin", "admin"].includes(state.profile.role); }
function canEditLecture(lec) {
  if (!state.profile) return false;
  if (["super_admin", "admin"].includes(state.profile.role)) return true;
  if (state.profile.role === "representative") return true; // create/schedule; update of other groups blocked in UI by scope
  return false;
}
function isStudent() { return state.profile && state.profile.role === "student"; }
function isRep() { return state.profile && state.profile.role === "representative"; }
function visibleGroups() {
  if (!state.profile) return [];
  if (["super_admin", "admin"].includes(state.profile.role)) return state.groups;
  if (state.profile.role === "representative") return state.groups; // rep sees all groups on Late board/progress (read-only view)
  if (state.profile.group_id) return state.groups.filter((g) => g.id === state.profile.group_id);
  return state.groups;
}
function visibleLectures() {
  if (!state.profile) return [];
  if (["super_admin", "admin", "representative", "doctor"].includes(state.profile.role)) return state.lectures;
  if (state.profile.group_id) return state.lectures.filter((l) => l.group_id === state.profile.group_id);
  return state.lectures;
}

/* ---------- i18n / language ---------- */
function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => { const k = el.dataset.i18n; if (I18N[LANG][k]) el.textContent = I18N[LANG][k]; });
  $("langBtn").textContent = LANG === "ar" ? "English" : "العربية";
  localStorage.setItem("tm_lang", LANG);
  renderNav();
}
$("langBtn").onclick = () => { LANG = LANG === "ar" ? "en" : "ar"; applyLang(); renderAll(); };

/* ---------- Auth ---------- */
async function loadProfile(user) {
  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) { console.warn("profile load", error.message); return null; }
  return data;
}
async function afterAuth(user) {
  state.user = user;
  state.profile = await loadProfile(user);
  $("logoutBtn").classList.remove("hidden");
  if (!state.profile) {
    // Trigger handle_new_user should have created it; retry once after a moment.
    await new Promise((r) => setTimeout(r, 1500));
    state.profile = await loadProfile(user);
  }
  if (!state.profile) { setMsg($("loginMsg"), LANG === "ar" ? "تعذر قراءة الملف الشخصي — تأكد من تشغيل SQL في Supabase." : "Could not read profile — check the SQL was run in Supabase."); return; }
  const p = state.profile;
  const isPrivileged = ["super_admin", "admin"].includes(p.role);
  // Pending approval gate: a student with no batch/group assigned is still waiting.
  if (p.role === "student" && !p.batch_id && !p.group_id && !isPrivileged) {
    $("pendingEmail").textContent = p.email || user.email || "";
    show("view-pending");
    return;
  }
  if (p.is_active === false && !isPrivileged) {
    $("pendingEmail").textContent = p.email || user.email || "";
    show("view-pending");
    return;
  }
  await loadData();
  $("mainNav").classList.remove("hidden");
  renderNav();
  show("view-dashboard");
  renderAll();
}
async function signOut() {
  if (sb) await sb.auth.signOut();
  state.user = null; state.profile = null;
  $("logoutBtn").classList.add("hidden");
  $("mainNav").classList.add("hidden");
  show("view-login");
}
$("logoutBtn").onclick = signOut;
$("pendingLogoutBtn").onclick = signOut;

$("googleBtn").onclick = async () => {
  if (!sb) return setMsg($("loginMsg"), SUPABASE_LOAD_ERROR);
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) setMsg($("loginMsg"), error.message);
};
$("emailLoginBtn").onclick = async () => {
  if (!sb) return setMsg($("loginMsg"), SUPABASE_LOAD_ERROR);
  const email = $("emailInput").value.trim(), password = $("passwordInput").value;
  if (!email || !password) return setMsg($("loginMsg"), LANG === "ar" ? "أدخل البريد وكلمة السر." : "Enter email and password.");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return setMsg($("loginMsg"), error.message);
  await afterAuth(data.user);
};
$("signupBtn").onclick = async () => {
  if (!sb) return setMsg($("loginMsg"), SUPABASE_LOAD_ERROR);
  const email = $("emailInput").value.trim(), password = $("passwordInput").value;
  if (!email || !password) return setMsg($("loginMsg"), LANG === "ar" ? "أدخل البريد وكلمة السر لإنشاء الحساب." : "Enter email and password to sign up.");
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return setMsg($("loginMsg"), error.message);
  setMsg($("loginMsg"), LANG === "ar" ? "تم إنشاء الحساب — أكمل الدخول وسيظهر طلبك قيد المراجعة حتى يوافق المشرف." : "Account created — sign in; your request will be pending until an admin approves it.", true);
  if (data.user) await afterAuth(data.user);
};

if (sb) sb.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user && !state.profile) await afterAuth(session.user);
});

/* ---------- Data loading ---------- */
async function probeTable(name) {
  const { error } = await sb.from(name).select("id").limit(1);
  return !error;
}
async function loadData() {
  const [b, g, s, d, r, l] = await Promise.all([
    sb.from("batches").select("*").eq("is_active", true).limit(1).maybeSingle(),
    sb.from("groups").select("*").order("number"),
    sb.from("subjects").select("*").order("code"),
    sb.from("doctors").select("*").order("full_name"),
    sb.from("rooms").select("*").order("name"),
    sb.from("lectures").select("*").order("lecture_date").order("start_time")
  ]);
  state.batch = b.data || null;
  state.groups = g.data || [];
  state.subjects = s.data || [];
  state.doctors = d.data || [];
  state.rooms = r.data || [];
  state.lectures = l.data || [];
  const [conv, msgs, refs, daily, weekly] = await Promise.all([
    probeTable("conversations"), probeTable("messages"), probeTable("scientific_references"),
    probeTable("daily_schedules"), probeTable("weekly_schedules")
  ]);
  state.tables = { conversations: conv, messages: msgs, references: refs, daily, weekly };
  await loadNotifications();
  await loadFiles();
  if (state.tables.references) await loadRefs();
  if (state.tables.weekly) {
    const { data } = await sb.from("weekly_schedules").select("*").order("created_at", { ascending: false }).limit(50);
    state.weekly = data || [];
  }
  if (state.tables.daily) {
    const { data } = await sb.from("daily_schedules").select("*").order("created_at", { ascending: false }).limit(50);
    state.daily = data || [];
  }
}
async function loadNotifications() {
  if (!state.user) return;
  let q = sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (!canManage()) q = q.eq("user_id", state.user.id);
  const { data } = await q;
  state.notifications = data || [];
}
async function loadFiles() {
  const { data } = await sb.from("lecture_files").select("*").order("created_at", { ascending: false }).limit(100);
  state.files = data || [];
}
async function loadRefs() {
  const { data } = await sb.from("scientific_references").select("*").order("created_at", { ascending: false }).limit(200);
  state.refs = data || [];
}
function refreshLectures() {
  return sb.from("lectures").select("*").order("lecture_date").order("start_time")
    .then(({ data }) => { state.lectures = data || []; });
}

/* ---------- Navigation ---------- */
const NAV = [
  ["dashboard", "view-dashboard", null],
  ["schedule", "view-schedule", null],
  ["group_progress", "view-progress", null],
  ["late_groups", "view-late", ["super_admin", "admin", "representative"]],
  ["schedules", "view-schedules", null],
  ["library", "view-library", null],
  ["notifications", "view-notifications", null],
  ["reports", "view-reports", null],
  ["messages", "view-messages", ["super_admin", "admin", "representative", "doctor"]],
  ["assistant", "view-assistant", null],
  ["users", "view-users", ["super_admin", "admin"]],
  ["settings", "view-settings", null]
];
let currentView = "view-dashboard";
function renderNav() {
  const nav = $("mainNav");
  if (!state.profile) { nav.classList.add("hidden"); return; }
  nav.innerHTML = "";
  NAV.forEach(([key, view, roles]) => {
    if (roles && !roles.includes(state.profile.role)) return;
    const b = document.createElement("button");
    b.textContent = t(key);
    b.className = currentView === view ? "active" : "";
    b.onclick = () => { currentView = view; show(view); renderNav(); renderAll(); };
    nav.appendChild(b);
  });
}
function renderAll() {
  if (!state.profile) return;
  fillSelects();
  renderDashboard(); renderSchedule(); renderProgress(); renderLate();
  renderSchedules(); renderLibrary(); renderNotifications(); renderReportsForm();
  renderMessages(); renderAssistant(); renderUsers(); renderSettings();
}

/* ---------- Selects ---------- */
function fillSelects() {
  const groupOpts = (all) => (all ? `<option value="">${LANG === "ar" ? "كل المجموعات" : "All groups"}</option>` : "") +
    visibleGroups().map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("");
  const subjOpts = (all) => (all ? `<option value="">${LANG === "ar" ? "كل المواد" : "All subjects"}</option>` : "") +
    state.subjects.map((s) => `<option value="${s.id}">${esc(subjName(s))}</option>`).join("");
  const set = (id, html) => { const el = $(id); if (el) { const v = el.value; el.innerHTML = html; if (v) el.value = v; } };
  set("fGroup", groupOpts(true)); set("fSubject", subjOpts(true));
  set("lecGroup", groupOpts(false)); set("lecSubject", subjOpts(false));
  set("progGroup", groupOpts(false)); set("repGroup", groupOpts(true)); set("repSubject", subjOpts(true));
  set("dailyGroup", groupOpts(true)); set("weeklyGroup", groupOpts(true));
  set("fileSubject", subjOpts(false)); set("refSubject", subjOpts(true)); set("refSubjectAdd", subjOpts(false));
  set("lecDoctor", `<option value="">—</option>` + state.doctors.map((d) => `<option value="${d.id}">${esc(d.full_name)}</option>`).join(""));
  set("lecRoom", `<option value="">—</option>` + state.rooms.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join(""));
  const qg = $("quickGroups");
  if (qg && !qg.dataset.done) {
    qg.dataset.done = "1";
    qg.innerHTML = visibleGroups().map((g) => `<label><input type="checkbox" value="${g.id}"> ${esc(g.name)}</label>`).join("");
  }
  if ($("progGroup") && !$("progGroup").value && state.profile && state.profile.group_id) $("progGroup").value = state.profile.group_id;
}

/* ---------- Progress computation (shared) ---------- */
function progressFor(groupId, subjectId) {
  const subj = state.subjects.find((s) => s.id === subjectId);
  const planned = subj ? (subj.planned_lectures || 10) : 10;
  const completed = state.lectures
    .filter((l) => l.group_id === groupId && l.subject_id === subjectId && l.status === "completed")
    .map((l) => l.lecture_number).sort((a, b) => a - b);
  const set = new Set(completed);
  const missing = [];
  for (let n = 1; n <= planned; n++) if (!set.has(n)) missing.push(n);
  return { planned, completed, missing, pct: planned ? Math.round((completed.length / planned) * 100) : 0 };
}
function groupTotals(groupId) {
  let done = 0, planned = 0;
  state.subjects.forEach((s) => { const p = progressFor(groupId, s.id); done += p.completed.length; planned += p.planned; });
  return { done, planned, pct: planned ? Math.round((done / planned) * 100) : 0 };
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const total = state.lectures.length;
  const completed = state.lectures.filter((l) => l.status === "completed").length;
  const today = state.lectures.filter((l) => l.lecture_date === todayStr()).length;
  const unread = state.notifications.filter((n) => !n.is_read).length;
  $("dashStats").innerHTML = [
    [LANG === "ar" ? "المجموعات" : "Groups", state.groups.length],
    [LANG === "ar" ? "المواد" : "Subjects", state.subjects.length],
    [LANG === "ar" ? "المحاضرات" : "Lectures", total],
    [LANG === "ar" ? "مكتملة" : "Completed", completed],
    [LANG === "ar" ? "محاضرات اليوم" : "Today", today],
    [LANG === "ar" ? "إشعارات غير مقروءة" : "Unread", unread]
  ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("");
  $("subjectProgress").innerHTML = state.subjects.map((s) => {
    let done = 0, planned = 0;
    state.groups.forEach((g) => { const p = progressFor(g.id, s.id); done += p.completed.length; planned += p.planned; });
    const pct = planned ? Math.round((done / planned) * 100) : 0;
    return `<div>${esc(subjName(s))} — ${done}/${planned} (${pct}%)<div style="background:#e8edf3;border-radius:6px;height:10px"><div style="width:${pct}%;background:var(--blue2);height:10px;border-radius:6px"></div></div></div>`;
  }).join("");
  const rows = visibleGroups().map((g) => {
    const tt = groupTotals(g.id);
    return `<tr><td>${esc(g.name)}</td><td>${tt.done}</td><td>${tt.planned}</td><td>${tt.pct}%</td></tr>`;
  }).join("");
  $("groupComparison").innerHTML = `<table><tr><th>${LANG === "ar" ? "المجموعة" : "Group"}</th><th>${LANG === "ar" ? "مكتملة" : "Done"}</th><th>${LANG === "ar" ? "المخطط" : "Planned"}</th><th>%</th></tr>${rows}</table>`;
}

/* ---------- Schedule ---------- */
function lectureRow(l) {
  const g = state.groups.find((x) => x.id === l.group_id);
  const s = state.subjects.find((x) => x.id === l.subject_id);
  const d = state.doctors.find((x) => x.id === l.doctor_id);
  const editable = canEditLecture(l) && !isStudent();
  return `<tr>
    <td>${esc(l.lecture_date || "")}</td><td>${esc(l.start_time || "")}–${esc(l.end_time || "")}</td>
    <td>${g ? esc(g.name) : ""}</td><td>${s ? esc(subjName(s)) : ""}</td>
    <td>${esc(l.lecture_number)}</td><td>${esc(typeName(l.activity_type))}</td>
    <td>${esc(l.title || "")}</td><td>${d ? esc(d.full_name) : ""}</td>
    <td><span class="badge ${l.status}">${esc(statusName(l.status))}</span></td>
    <td>${editable ? `<button class="btn small" onclick="editLecture('${l.id}')">${LANG === "ar" ? "تعديل" : "Edit"}</button>
      <button class="btn small danger" onclick="deleteLecture('${l.id}')">${LANG === "ar" ? "حذف" : "Delete"}</button>` : ""}</td>
  </tr>`;
}
function renderSchedule() {
  const gf = $("fGroup").value, sf = $("fSubject").value, st = $("fStatus").value, dt = $("fDate").value;
  let list = visibleLectures();
  if (gf) list = list.filter((l) => l.group_id === gf);
  if (sf) list = list.filter((l) => l.subject_id === sf);
  if (st) list = list.filter((l) => l.status === st);
  if (dt) list = list.filter((l) => l.lecture_date === dt);
  $("lectureList").innerHTML = list.length
    ? `<table><tr><th>${LANG === "ar" ? "التاريخ" : "Date"}</th><th>${LANG === "ar" ? "الوقت" : "Time"}</th><th>${LANG === "ar" ? "المجموعة" : "Group"}</th><th>${LANG === "ar" ? "المادة" : "Subject"}</th><th>#</th><th>${LANG === "ar" ? "النوع" : "Type"}</th><th>${LANG === "ar" ? "العنوان" : "Title"}</th><th>${LANG === "ar" ? "الدكتور" : "Doctor"}</th><th>${LANG === "ar" ? "الحالة" : "Status"}</th><th></th></tr>${list.map(lectureRow).join("")}</table>`
    : `<p class="muted">${LANG === "ar" ? "لا توجد محاضرات مطابقة." : "No matching lectures."}</p>`;
  $("lectureFormCard").style.display = isStudent() ? "none" : "";
}
$("fApply").onclick = renderSchedule;

async function createLectureRow(row) {
  if (row.end_time <= row.start_time) throw new Error(LANG === "ar" ? "وقت النهاية يجب أن يكون بعد وقت البداية." : "End time must be after start time.");
  const dup = state.lectures.find((l) => l.group_id === row.group_id && l.subject_id === row.subject_id &&
    l.lecture_number === row.lecture_number && l.status === "completed");
  if (dup) throw new Error(LANG === "ar" ? "رقم المحاضرة مكرر: هذه المحاضرة مأخوذة أصلاً في نفس المادة والمجموعة." : "Duplicate lecture number for this subject and group.");
  const payload = { ...row, batch_id: state.batch ? state.batch.id : null, duration_minutes: 90, created_by: state.user ? state.user.id : null };
  const { data, error } = await sb.from("lectures").insert(payload).select().single();
  if (error) {
    if (String(error.code) === "23505" || /duplicate/i.test(error.message)) throw new Error(LANG === "ar" ? "رقم المحاضرة مكرر: هذه المحاضرة مأخوذة أصلاً في نفس المادة والمجموعة." : "Duplicate lecture number for this subject and group.");
    throw new Error(error.message);
  }
  // Verify the row is actually readable in Supabase (mirror check).
  const { data: check } = await sb.from("lectures").select("id").eq("id", data.id).maybeSingle();
  if (!check) throw new Error("SUPABASE_WRITE_FAILED");
  state.lectures.push(data);
  return data;
}
$("lectureForm").onsubmit = async (e) => {
  e.preventDefault();
  const row = {
    subject_id: $("lecSubject").value, group_id: $("lecGroup").value,
    lecture_number: parseInt($("lecNumber").value, 10),
    activity_type: $("lecType").value, title: $("lecTitle").value.trim(),
    lecture_date: $("lecDate").value, start_time: $("lecStart").value, end_time: $("lecEnd").value,
    doctor_id: $("lecDoctor").value || null, room_id: $("lecRoom").value || null,
    status: $("lecStatus").value, notes: $("lecNotes").value.trim() || null
  };
  const id = $("lecId").value;
  try {
    if (id) {
      if (row.end_time <= row.start_time) throw new Error(LANG === "ar" ? "وقت النهاية يجب أن يكون بعد وقت البداية." : "End time must be after start time.");
      const { error } = await sb.from("lectures").update({ ...row, updated_by: state.user.id }).eq("id", id);
      if (error) throw new Error(error.message);
      await refreshLectures();
      setMsg($("lecMsg"), LANG === "ar" ? "تم التعديل بنجاح." : "Updated.", true);
    } else {
      await createLectureRow(row);
      setMsg($("lecMsg"), LANG === "ar" ? "تمت إضافة المحاضرة." : "Lecture added.", true);
      await notifyGroup(row.group_id, LANG === "ar" ? `محاضرة جديدة — ${subjName(state.subjects.find((s) => s.id === row.subject_id) || {})} (${typeName(row.activity_type)})` : "New lecture", `${row.title} — ${row.lecture_date} ${row.start_time}`);
    }
  } catch (err) { setMsg($("lecMsg"), err.message); return; }
  $("lectureForm").reset(); $("lecId").value = "";
  renderAll();
};
$("lecCancel").onclick = () => { $("lectureForm").reset(); $("lecId").value = ""; };
window.editLecture = (id) => {
  const l = state.lectures.find((x) => x.id === id); if (!l) return;
  $("lecId").value = l.id; $("lecSubject").value = l.subject_id; $("lecGroup").value = l.group_id;
  $("lecNumber").value = l.lecture_number; $("lecType").value = l.activity_type || "theory";
  $("lecTitle").value = l.title; $("lecDate").value = l.lecture_date;
  $("lecStart").value = l.start_time; $("lecEnd").value = l.end_time;
  $("lecDoctor").value = l.doctor_id || ""; $("lecRoom").value = l.room_id || "";
  $("lecStatus").value = l.status; $("lecNotes").value = l.notes || "";
  $("lectureFormCard").scrollIntoView({ behavior: "smooth" });
};
window.deleteLecture = async (id) => {
  if (!confirm(LANG === "ar" ? "هل أنت متأكد من حذف هذه المحاضرة؟" : "Delete this lecture?")) return;
  const { error } = await sb.from("lectures").delete().eq("id", id);
  if (error) return alert(error.message);
  // Verify the row is gone in Supabase (live re-read, retry once).
  let gone = false;
  for (let i = 0; i < 2 && !gone; i++) {
    const { data } = await sb.from("lectures").select("id").eq("id", id).maybeSingle();
    gone = !data;
    if (!gone) await sb.from("lectures").delete().eq("id", id);
  }
  if (!gone) return alert(LANG === "ar" ? "فشل حذف المحاضرة من Supabase — أعد المحاولة." : "Could not delete the lecture from Supabase — retry.");
  await refreshLectures(); renderAll();
};
$("quickBtn").onclick = async () => {
  const groups = [...document.querySelectorAll("#quickGroups input:checked")].map((c) => c.value);
  if (!groups.length) return setMsg($("quickMsg"), LANG === "ar" ? "اختر مجموعة واحدة على الأقل." : "Select at least one group.");
  const base = {
    subject_id: $("lecSubject").value, lecture_number: parseInt($("lecNumber").value, 10),
    activity_type: $("lecType").value, title: $("lecTitle").value.trim(),
    lecture_date: $("lecDate").value, start_time: $("lecStart").value, end_time: $("lecEnd").value,
    doctor_id: $("lecDoctor").value || null, room_id: $("lecRoom").value || null,
    status: $("lecStatus").value, notes: $("lecNotes").value.trim() || null
  };
  if (!base.subject_id || !base.lecture_number || !base.title || !base.lecture_date || !base.start_time || !base.end_time)
    return setMsg($("quickMsg"), LANG === "ar" ? "أكمل حقول المحاضرة أولاً." : "Complete the lecture fields first.");
  let ok = 0, fail = 0;
  for (const gid of groups) {
    try { await createLectureRow({ ...base, group_id: gid }); ok++; }
    catch (e) { fail++; console.warn(e.message); }
  }
  setMsg($("quickMsg"), `${LANG === "ar" ? "تمت إضافة" : "Added"} ${ok} — ${LANG === "ar" ? "فشل" : "failed"} ${fail}`, fail === 0);
  renderAll();
};
async function notifyGroup(groupId, title, body) {
  if (!state.user) return;
  try {
    const { data: users } = await sb.from("profiles").select("id").eq("group_id", groupId);
    const rows = (users || []).map((u) => ({ user_id: u.id, group_id: groupId, batch_id: state.batch ? state.batch.id : null, title, body, kind: "lecture_new" }));
    if (rows.length) await sb.from("notifications").insert(rows);
  } catch (e) { console.warn("notify", e.message); }
}

/* ---------- Progress ---------- */
function renderProgress() {
  const gid = $("progGroup").value || (state.profile && state.profile.group_id) || (state.groups[0] && state.groups[0].id);
  if (!gid) return;
  const g = state.groups.find((x) => x.id === gid);
  $("progTitle").textContent = g ? `${esc(g.name)} — ${state.batch ? esc(state.batch.name) : ""}` : "";
  $("progTable").innerHTML = `<table><tr><th>${LANG === "ar" ? "المادة" : "Subject"}</th><th>${LANG === "ar" ? "مكتملة" : "Done"}</th><th>${LANG === "ar" ? "الأرقام المكتملة" : "Completed #"}</th><th>${LANG === "ar" ? "المتبقية" : "Remaining"}</th><th>%</th></tr>` +
    state.subjects.map((s) => { const p = progressFor(gid, s.id);
      return `<tr><td>${esc(subjName(s))}</td><td>${p.completed.length}/${p.planned}</td><td>${p.completed.join("، ") || "—"}</td><td>${p.missing.join("، ") || "—"}</td><td>${p.pct}%</td></tr>`; }).join("") + `</table>`;
  $("progAll").innerHTML = `<table><tr><th>${LANG === "ar" ? "المجموعة" : "Group"}</th>${state.subjects.map((s) => `<th>${esc(subjName(s))}</th>`).join("")}<th>${LANG === "ar" ? "المجموع" : "Total"}</th></tr>` +
    visibleGroups().map((gr) => {
      const cells = state.subjects.map((s) => { const p = progressFor(gr.id, s.id); return `<td>${p.completed.length}/${p.planned}</td>`; }).join("");
      const tt = groupTotals(gr.id);
      return `<tr><td>${esc(gr.name)}</td>${cells}<td>${tt.done}/${tt.planned} (${tt.pct}%)</td></tr>`;
    }).join("") + `</table>`;
}
$("progGroup").onchange = renderProgress;

/* ---------- Late groups ---------- */
function lateEntries() {
  const out = [];
  visibleGroups().forEach((g) => {
    state.subjects.forEach((s) => {
      const p = progressFor(g.id, s.id);
      if (p.missing.length) {
        const txt = LANG === "ar"
          ? `${g.name} ناقصها ${p.missing.length} ${p.missing.length === 1 ? "محاضرة" : "محاضرات"} في ${subjName(s)} - المحاضرات رقم ${p.missing.join("، ")} (أخذت ${p.completed.join("، ") || "لا شيء"} من ${p.planned})`
          : `${g.name} is missing ${p.missing.length} lecture(s) in ${subjName(s)} — numbers ${p.missing.join(", ")} (taken ${p.completed.join(", ") || "none"} of ${p.planned})`;
        out.push({ group: g, subject: s, missing: p.missing, text: txt });
      }
    });
  });
  return out;
}
function renderLate() {
  const list = lateEntries();
  $("lateList").innerHTML = list.length ? list.map((e, i) => `
    <div class="card late-card"><p><b>${esc(e.text)}</b></p>
    <button class="btn primary small" onclick="scheduleMissing('${e.group.id}','${e.subject.id}')">${LANG === "ar" ? "جدولة المحاضرة الناقصة ليوم غد" : "Schedule the missing lecture for tomorrow"}</button>
    <span class="msg" id="lateMsg${i}"></span></div>`).join("")
    : `<p class="muted">${LANG === "ar" ? "لا توجد مجموعات متأخرة — كل المجموعات أكملت محاضراتها المخططة." : "No late groups — all groups completed their planned lectures."}</p>`;
}
window.scheduleMissing = async (groupId, subjectId) => {
  const p = progressFor(groupId, subjectId);
  if (!p.missing.length) return;
  const num = p.missing[0];
  const s = state.subjects.find((x) => x.id === subjectId);
  try {
    await createLectureRow({
      group_id: groupId, subject_id: subjectId, lecture_number: num,
      activity_type: "theory", title: `${subjName(s)} — ${LANG === "ar" ? "محاضرة" : "Lecture"} ${num}`,
      lecture_date: tomorrowStr(), start_time: "09:00", end_time: "10:30",
      doctor_id: null, room_id: null, status: "not_taken", notes: LANG === "ar" ? "جدولة تلقائية من لوحة المتأخرة" : "Auto-scheduled from Late Groups"
    });
    await notifyGroup(groupId, LANG === "ar" ? `محاضرة مجدولة — ${subjName(s)}` : "Scheduled lecture", `${LANG === "ar" ? "المحاضرة رقم" : "Lecture"} ${num} — ${tomorrowStr()}`);
    renderAll();
    alert(LANG === "ar" ? `تمت جدولة المحاضرة رقم ${num} ليوم غد.` : `Lecture ${num} scheduled for tomorrow.`);
  } catch (e) { alert(e.message); }
};

/* ---------- Daily / weekly schedules ---------- */
function schedRow(r, kind) {
  const g = state.groups.find((x) => x.id === r.group_id);
  const date = r.date || r.day || r.week_start || "";
  const end = r.week_end ? ` – ${esc(r.week_end)}` : "";
  const canEdit = canManage() || isRep();
  return `<tr><td>${esc(r.title || "")}</td><td>${esc(date)}${end}</td><td>${g ? esc(g.name) : (LANG === "ar" ? "كل المجموعات" : "All groups")}</td>
  <td>${esc(r.lecture_count ?? "")}</td>
  <td>${canEdit ? `<button class="btn small" onclick="editSchedule('${kind}','${r.id}')">${LANG === "ar" ? "تعديل" : "Edit"}</button>
  <button class="btn small danger" onclick="deleteSchedule('${kind}','${r.id}')">${LANG === "ar" ? "حذف" : "Delete"}</button>` : ""}</td></tr>`;
}
function renderSchedules() {
  const head = `<tr><th>${LANG === "ar" ? "العنوان" : "Title"}</th><th>${LANG === "ar" ? "التاريخ" : "Date"}</th><th>${LANG === "ar" ? "المجموعة" : "Group"}</th><th>#</th><th></th></tr>`;
  $("dailyList").innerHTML = state.tables.daily
    ? (state.daily.length ? `<table>${head}${state.daily.map((r) => schedRow(r, "daily")).join("")}</table>` : `<p class="muted">${LANG === "ar" ? "لا توجد جداول يومية." : "No daily schedules."}</p>`)
    : `<p class="muted">${LANG === "ar" ? "جدول daily_schedules غير موجود في Supabase — شغّل sql/missing_tables.sql في SQL Editor لتفعيل الجداول اليومية." : "daily_schedules table is missing in Supabase — run sql/missing_tables.sql to enable daily schedules."}</p>`;
  $("weeklyList").innerHTML = state.tables.weekly
    ? (state.weekly.length ? `<table>${head}${state.weekly.map((r) => schedRow(r, "weekly")).join("")}</table>` : `<p class="muted">${LANG === "ar" ? "لا توجد جداول أسبوعية." : "No weekly schedules."}</p>`)
    : `<p class="muted">${LANG === "ar" ? "جدول weekly_schedules غير موجود — شغّل sql/missing_tables.sql." : "weekly_schedules table is missing — run sql/missing_tables.sql."}</p>`;
  $("dailyForm").style.display = isStudent() ? "none" : "";
  $("weeklyForm").style.display = isStudent() ? "none" : "";
}
$("dailyForm").onsubmit = async (e) => {
  e.preventDefault();
  if (!state.tables.daily) return setMsg($("dailyMsg"), LANG === "ar" ? "جدول daily_schedules غير موجود — شغّل sql/missing_tables.sql أولاً." : "daily_schedules table is missing — run sql/missing_tables.sql first.");
  const row = { date: $("dailyDate").value, group_id: $("dailyGroup").value || null, title: $("dailyTitle").value.trim(), notes: $("dailyNotes").value.trim() || null, batch_id: state.batch ? state.batch.id : null, lecture_count: 0, published_by: state.user.id };
  const { error } = await sb.from("daily_schedules").insert(row);
  if (error) return setMsg($("dailyMsg"), error.message);
  setMsg($("dailyMsg"), LANG === "ar" ? "تم نشر الجدول اليومي." : "Daily schedule published.", true);
  await loadData(); renderAll();
};
$("weeklyForm").onsubmit = async (e) => {
  e.preventDefault();
  if (!state.tables.weekly) return setMsg($("weeklyMsg"), LANG === "ar" ? "جدول weekly_schedules غير موجود — شغّل sql/missing_tables.sql أولاً." : "weekly_schedules table is missing — run sql/missing_tables.sql first.");
  const row = { week_start: $("weeklyStart").value, week_end: $("weeklyEnd").value, group_id: $("weeklyGroup").value || null, title: $("weeklyTitle").value.trim(), batch_id: state.batch ? state.batch.id : null, lecture_count: 0, published_by: state.user.id };
  const { error } = await sb.from("weekly_schedules").insert(row);
  if (error) return setMsg($("weeklyMsg"), error.message);
  setMsg($("weeklyMsg"), LANG === "ar" ? "تم نشر الجدول الأسبوعي." : "Weekly schedule published.", true);
  await loadData(); renderAll();
};
window.editSchedule = async (kind, id) => {
  const title = prompt(LANG === "ar" ? "العنوان الجديد:" : "New title:");
  if (!title) return;
  const table = kind === "daily" ? "daily_schedules" : "weekly_schedules";
  const { error } = await sb.from(table).update({ title }).eq("id", id);
  if (error) return alert(error.message);
  await loadData(); renderAll();
};
window.deleteSchedule = async (kind, id) => {
  if (!confirm(LANG === "ar" ? "حذف هذا الجدول؟" : "Delete this schedule?")) return;
  const table = kind === "daily" ? "daily_schedules" : "weekly_schedules";
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) return alert(error.message);
  await loadData(); renderAll();
};

/* ---------- Library ---------- */
function driveUrls(url) {
  const m = String(url || "").match(/\/d\/([a-zA-Z0-9_-]+)/) || String(url || "").match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  const id = m[1];
  return { view: `https://drive.google.com/file/d/${id}/view`, download: `https://drive.google.com/uc?export=download&id=${id}` };
}
function renderLibrary() {
  $("fileList").innerHTML = state.files.length ? `<table><tr><th>${LANG === "ar" ? "العنوان" : "Title"}</th><th>${LANG === "ar" ? "النوع" : "Type"}</th><th></th></tr>` +
    state.files.map((f) => {
      const path = f.storage_path || f.file_path || f.path || "";
      const title = f.title || path.split("/").pop() || f.id;
      return `<tr><td>${esc(title)}</td><td>${esc(f.file_type || "")}</td><td><button class="btn small" onclick="downloadFile('${esc(path)}')">${LANG === "ar" ? "تحميل" : "Download"}</button></td></tr>`;
    }).join("") + `</table>` : `<p class="muted">${LANG === "ar" ? "لا توجد ملفات بعد." : "No files yet."}</p>`;
  $("uploadBox").style.display = (isStudent() || isRep()) ? "none" : "";
  if (!state.tables.references) {
    $("refNote").textContent = LANG === "ar" ? "جدول scientific_references غير موجود في Supabase — شغّل sql/missing_tables.sql في SQL Editor لتفعيل المراجع العلمية." : "scientific_references table is missing in Supabase — run sql/missing_tables.sql to enable scientific references.";
    $("refList").innerHTML = "";
    $("refFormBox").style.display = "none";
    return;
  }
  $("refNote").textContent = "";
  $("refFormBox").style.display = (isStudent() || isRep()) ? "none" : "";
  const subj = $("refSubject").value, q = ($("refSearch").value || "").toLowerCase();
  let list = state.refs;
  if (subj) list = list.filter((r) => r.subject_id === subj);
  if (q) list = list.filter((r) => (r.title || "").toLowerCase().includes(q) || (r.author || "").toLowerCase().includes(q));
  $("refList").innerHTML = list.length ? list.map((r) => {
    const urls = driveUrls(r.drive_url || r.url);
    const s = state.subjects.find((x) => x.id === r.subject_id);
    return `<div class="card"><b>${esc(r.title)}</b> — ${s ? esc(subjName(s)) : ""} ${r.author ? "— " + esc(r.author) : ""} ${r.year ? "(" + esc(r.year) + ")" : ""}
    <br>${urls ? `<a class="btn small" href="${urls.view}" target="_blank" rel="noopener">${LANG === "ar" ? "فتح في Drive" : "Open in Drive"}</a>
    <a class="btn small primary" href="${urls.download}" target="_blank" rel="noopener">${LANG === "ar" ? "تحميل مباشر" : "Direct download"}</a>` : ""}
    ${canManage() ? `<button class="btn small danger" onclick="deleteRef('${r.id}')">${LANG === "ar" ? "حذف" : "Delete"}</button>` : ""}</div>`;
  }).join("") : `<p class="muted">${LANG === "ar" ? "لا توجد مراجع بعد." : "No references yet."}</p>`;
}
window.downloadFile = async (path) => {
  if (!path) return alert(LANG === "ar" ? "لا يوجد مسار للملف." : "No file path.");
  const { data, error } = await sb.storage.from("lecture-files").createSignedUrl(path, 3600);
  if (error || !data) return alert(error ? error.message : "—");
  window.open(data.signedUrl, "_blank");
};
$("uploadBtn").onclick = async () => {
  const file = $("fileInput").files[0];
  if (!file) return setMsg($("uploadMsg"), LANG === "ar" ? "اختر ملفاً أولاً." : "Choose a file first.");
  const path = `${state.batch ? state.batch.code : "B11"}/${Date.now()}_${file.name}`;
  const { error: upErr } = await sb.storage.from("lecture-files").upload(path, file);
  if (upErr) return setMsg($("uploadMsg"), upErr.message);
  const { error } = await sb.from("lecture_files").insert({
    title: file.name, storage_path: path, file_type: file.type, file_size: file.size,
    subject_id: $("fileSubject").value || null, batch_id: state.batch ? state.batch.id : null,
    uploaded_by: state.user.id
  });
  if (error) return setMsg($("uploadMsg"), error.message);
  setMsg($("uploadMsg"), LANG === "ar" ? "تم الرفع." : "Uploaded.", true);
  await loadFiles(); renderLibrary();
};
$("refSearchBtn").onclick = renderLibrary;
$("refForm").onsubmit = async (e) => {
  e.preventDefault();
  const url = $("refUrl").value.trim();
  if (!driveUrls(url)) return setMsg($("refMsg"), LANG === "ar" ? "رابط Google Drive غير صالح." : "Invalid Google Drive link.");
  const { error } = await sb.from("scientific_references").insert({
    title: $("refTitle").value.trim(), subject_id: $("refSubjectAdd").value,
    author: $("refAuthor").value.trim() || null, year: $("refYear").value ? parseInt($("refYear").value, 10) : null,
    drive_url: url, batch_id: state.batch ? state.batch.id : null, created_by: state.user.id
  });
  if (error) return setMsg($("refMsg"), error.message);
  setMsg($("refMsg"), LANG === "ar" ? "تمت إضافة المرجع." : "Reference added.", true);
  await loadRefs(); renderLibrary();
};
window.deleteRef = async (id) => {
  if (!confirm(LANG === "ar" ? "حذف هذا المرجع؟" : "Delete this reference?")) return;
  const { error } = await sb.from("scientific_references").delete().eq("id", id);
  if (error) return alert(error.message);
  await loadRefs(); renderLibrary();
};

/* ---------- Notifications ---------- */
function renderNotifications() {
  $("notifList").innerHTML = state.notifications.length ? state.notifications.map((n) => `
    <div class="card" style="${n.is_read ? "opacity:.65" : ""}"><b>${esc(n.title)}</b> — ${esc(n.body || "")}
    <br><span class="muted small">${esc(n.created_at || "")}</span>
    ${!n.is_read ? `<button class="btn small" onclick="markRead('${n.id}')">${LANG === "ar" ? "تعليم كمقروء" : "Mark read"}</button>` : ""}</div>`).join("")
    : `<p class="muted">${LANG === "ar" ? "لا توجد إشعارات." : "No notifications."}</p>`;
}
window.markRead = async (id) => {
  await sb.from("notifications").update({ is_read: true }).eq("id", id);
  await loadNotifications(); renderNotifications();
};
$("markAllRead").onclick = async () => {
  await sb.from("notifications").update({ is_read: true }).eq("user_id", state.user.id).eq("is_read", false);
  await loadNotifications(); renderNotifications();
};

/* ---------- Reports ---------- */
function renderReportsForm() {
  const stu = isStudent();
  $("repKind").innerHTML = `
    <option value="group">${LANG === "ar" ? "تقرير مجموعة" : "Group report"}</option>
    <option value="all_groups" ${stu ? "disabled" : ""}>${LANG === "ar" ? "تقرير كل المجموعات" : "All groups report"}</option>
    <option value="subject">${LANG === "ar" ? "تقرير مادة" : "Subject report"}</option>
    <option value="comparison" ${stu ? "disabled" : ""}>${LANG === "ar" ? "مقارنة المجموعات" : "Group comparison"}</option>
    <option value="audit" ${canManage() ? "" : "disabled"}>${LANG === "ar" ? "تقرير التدقيق (إدارة فقط)" : "Audit report (admin only)"}</option>`;
}
$("reportForm").onsubmit = (e) => {
  e.preventDefault();
  const kind = $("repKind").value;
  if (kind === "audit" && !canManage()) return alert(LANG === "ar" ? "تقرير التدقيق للإدارة فقط." : "Audit report is admin-only.");
  if ((kind === "all_groups" || kind === "comparison") && isStudent()) return alert(LANG === "ar" ? "هذا التقرير ليس للطلاب." : "Not available for students.");
  const gid = $("repGroup").value, sid = $("repSubject").value;
  const g = state.groups.find((x) => x.id === gid);
  const s = state.subjects.find((x) => x.id === sid);
  let rows = "", title = "";
  const now = new Date().toLocaleDateString(LANG === "ar" ? "ar-EG" : "en-GB");
  if (kind === "group" || kind === "subject" || kind === "comparison" || kind === "all_groups") {
    const groups = kind === "group" ? (g ? [g] : visibleGroups().slice(0, 1)) : visibleGroups();
    const subjects = kind === "subject" ? (s ? [s] : state.subjects) : state.subjects;
    title = kind === "group" ? `${LANG === "ar" ? "تقرير مجموعة" : "Group report"} — ${g ? esc(g.name) : ""}` : (LANG === "ar" ? "تقرير المقارنة بين المجموعات" : "Group comparison report");
    rows = `<table><tr><th>${LANG === "ar" ? "المجموعة" : "Group"}</th>${subjects.map((x) => `<th>${esc(subjName(x))}</th>`).join("")}<th>${LANG === "ar" ? "المجموع" : "Total"}</th></tr>` +
      groups.map((gr) => {
        const cells = subjects.map((x) => { const p = progressFor(gr.id, x.id); return `<td>${p.completed.length}/${p.planned} (${p.pct}%)</td>`; }).join("");
        const tt = groupTotals(gr.id);
        return `<tr><td>${esc(gr.name)}</td>${cells}<td>${tt.done}/${tt.planned} (${tt.pct}%)</td></tr>`;
      }).join("") + `</table>`;
  } else if (kind === "audit") {
    title = LANG === "ar" ? "تقرير التدقيق" : "Audit report";
    rows = `<p>${LANG === "ar" ? "سجل التدقيق الكامل موجود في Supabase (جدول audit_logs) — هذا التقرير يعرض ملخص النشاط من بيانات المنصة الحالية." : "The full audit log lives in Supabase (audit_logs table) — this report summarises current platform activity."}</p>
    <table><tr><th>${LANG === "ar" ? "البند" : "Item"}</th><th>${LANG === "ar" ? "العدد" : "Count"}</th></tr>
    <tr><td>${LANG === "ar" ? "المحاضرات" : "Lectures"}</td><td>${state.lectures.length}</td></tr>
    <tr><td>${LANG === "ar" ? "الإشعارات" : "Notifications"}</td><td>${state.notifications.length}</td></tr>
    <tr><td>${LANG === "ar" ? "الملفات" : "Files"}</td><td>${state.files.length}</td></tr></table>`;
  }
  $("reportOut").innerHTML = `
    <div style="text-align:center"><h3>TRUST IN MED</h3>
    <p>Faculty of Human Medicine — ${LANG === "ar" ? "كلية الطب البشري" : "Faculty of Human Medicine"}</p>
    <p><b>${title}</b></p><p>${state.batch ? esc(state.batch.name) : ""} — ${now}</p></div>
    ${rows}
    <hr><p class="muted small">TRUST IN MED — Telegram: https://t.me/Trustin_Med</p>`;
};
$("printBtn").onclick = () => window.print();

/* ---------- Messaging (needs conversations/messages tables) ---------- */
async function renderMessages() {
  if (!state.tables.conversations || !state.tables.messages) {
    $("msgNote").textContent = LANG === "ar" ? "المراسلة غير مفعّلة بعد: جدولا conversations و messages غير موجودين في Supabase — شغّل sql/missing_tables.sql في SQL Editor لتفعيل المراسلة بين المندوب والدكاترة." : "Messaging is not enabled yet: conversations and messages tables are missing in Supabase — run sql/missing_tables.sql to enable rep↔doctor messaging.";
    $("convList").innerHTML = ""; $("msgThread").innerHTML = "";
    return;
  }
  $("msgNote").textContent = "";
  const { data } = await sb.from("conversations").select("*").order("created_at", { ascending: false }).limit(30);
  const convs = data || [];
  $("convList").innerHTML = convs.length ? convs.map((c) => `<div class="card"><button class="btn small" onclick="openConv('${c.id}')">${esc(c.title || ("#" + String(c.id).slice(0, 8)))}</button></div>`).join("") : `<p class="muted">${LANG === "ar" ? "لا توجد محادثات بعد." : "No conversations yet."}</p>`;
  if (state.profile.role === "representative") {
    const docs = state.doctors;
    $("convList").innerHTML += docs.length ? `<h4>${LANG === "ar" ? "بدء محادثة مع دكتور" : "Start a conversation with a doctor"}</h4>` + docs.map((d) => `<button class="btn small" onclick="startConv('${d.id}')">${esc(d.full_name)}</button> `).join("") : "";
  }
}
window.openConv = async (id) => {
  state.conv = id;
  const { data } = await sb.from("messages").select("*").eq("conversation_id", id).order("created_at");
  state.convMsgs = data || [];
  $("convTitle").textContent = "#" + String(id).slice(0, 8);
  $("msgThread").innerHTML = state.convMsgs.map((m) => `<div class="msg-bubble ${m.sender_id === state.user.id ? "me" : ""}"><div>${esc(m.body)}</div><div class="meta">${esc(m.created_at || "")}</div></div>`).join("") || `<p class="muted">${LANG === "ar" ? "لا توجد رسائل بعد." : "No messages yet."}</p>`;
};
window.startConv = async (doctorId) => {
  const { data, error } = await sb.from("conversations").insert({ doctor_id: doctorId, representative_id: state.user.id, batch_id: state.batch ? state.batch.id : null, title: "rep-doctor" }).select().single();
  if (error) return alert(error.message);
  await renderMessages(); openConv(data.id);
};
$("msgForm").onsubmit = async (e) => {
  e.preventDefault();
  if (!state.conv) return alert(LANG === "ar" ? "اختر محادثة أولاً." : "Choose a conversation first.");
  const body = $("msgText").value.trim(); if (!body) return;
  const { error } = await sb.from("messages").insert({ conversation_id: state.conv, sender_id: state.user.id, body, kind: "text" });
  if (error) return alert(error.message);
  $("msgText").value = "";
  await openConv(state.conv);
};

/* ---------- AI assistant (rule-based, live data only) ---------- */
function aiHistory() { try { return JSON.parse(localStorage.getItem("tm_ai_" + (state.user ? state.user.id : "x")) || "[]"); } catch { return []; } }
function aiSave(h) { localStorage.setItem("tm_ai_" + (state.user ? state.user.id : "x"), JSON.stringify(h.slice(-40))); }
function renderAssistant() {
  const h = aiHistory();
  $("aiThread").innerHTML = h.map((m) => `<div class="msg-bubble ${m.me ? "me" : ""}"><div>${esc(m.text)}</div></div>`).join("") || `<p class="muted">${LANG === "ar" ? "اسألني عن محاضراتك، أو تقدم مجموعتك، أو المجموعات المتأخرة." : "Ask me about your lectures, your group progress, or late groups."}</p>`;
}
function aiAnswer(q) {
  const s = q.toLowerCase();
  const myGroups = visibleGroups();
  const myLects = visibleLectures();
  const has = (...ws) => ws.some((w) => s.includes(w));
  const fmtLect = (l) => { const sub = state.subjects.find((x) => x.id === l.subject_id); const g = state.groups.find((x) => x.id === l.group_id);
    return `${l.lecture_date} ${l.start_time} — ${sub ? subjName(sub) : ""} ${typeName(l.activity_type)} #${l.lecture_number} (${g ? g.name : ""}) ${statusName(l.status)}`; };
  if (has("غد", "tomorrow", "بكر")) {
    const list = myLects.filter((l) => l.lecture_date === tomorrowStr());
    return list.length ? (LANG === "ar" ? "محاضراتك غداً:\n" + list.map(fmtLect).join("\n") : "Your lectures tomorrow:\n" + list.map(fmtLect).join("\n"))
      : (LANG === "ar" ? "لا توجد محاضرات لك غداً." : "You have no lectures tomorrow.");
  }
  if (has("اليوم", "today")) {
    const list = myLects.filter((l) => l.lecture_date === todayStr());
    return list.length ? (LANG === "ar" ? "محاضراتك اليوم:\n" + list.map(fmtLect).join("\n") : "Your lectures today:\n" + list.map(fmtLect).join("\n"))
      : (LANG === "ar" ? "لا توجد محاضرات لك اليوم." : "You have no lectures today.");
  }
  if (has("متأخر", "ناقص", "late", "missing", "behind")) {
    if (isStudent()) return LANG === "ar" ? "هذه المعلومة غير موجودة في بيانات المنصة المتاحة لي." : "This information is not available in the data I can see.";
    const late = lateEntries();
    if (!late.length) return LANG === "ar" ? "لا توجد مجموعات متأخرة حالياً." : "No late groups right now.";
    const summary = late.slice(0, 10).map((e) => e.text).join("\n");
    const suggestion = LANG === "ar" ? "\n\nاقتراح الغد: جدولة المحاضرة الناقصة الأولى لكل مجموعة من لوحة «المجموعات المتأخرة»." : "\n\nSuggestion for tomorrow: schedule the first missing lecture of each group from the Late Groups board.";
    return summary + suggestion;
  }
  if (has("تقدم", "progress", "كم محاضرة", "عدد")) {
    const lines = myGroups.slice(0, 19).map((g) => { const tt = groupTotals(g.id); return `${g.name}: ${tt.done}/${tt.planned} (${tt.pct}%)`; });
    return (LANG === "ar" ? "تقدم المجموعات:\n" : "Group progress:\n") + lines.join("\n");
  }
  if (has("جدول", "schedule")) {
    const list = myLects.filter((l) => l.lecture_date >= todayStr()).slice(0, 8);
    return list.length ? (LANG === "ar" ? "محاضراتك القادمة:\n" + list.map(fmtLect).join("\n") : "Your upcoming lectures:\n" + list.map(fmtLect).join("\n"))
      : (LANG === "ar" ? "لا توجد محاضرات قادمة مجدولة لك." : "No upcoming lectures scheduled for you.");
  }
  return LANG === "ar" ? "أستطيع الإجابة عن: محاضراتك غداً أو اليوم، تقدم مجموعتك، المجموعات المتأخرة، وجدولك القادم — من بيانات المنصة الحقيقية." : "I can answer about: your lectures tomorrow or today, your group progress, late groups, and your upcoming schedule — from real platform data.";
}
$("aiForm").onsubmit = (e) => {
  e.preventDefault();
  const q = $("aiInput").value.trim(); if (!q) return;
  const h = aiHistory();
  h.push({ me: true, text: q });
  h.push({ me: false, text: aiAnswer(q) });
  aiSave(h); $("aiInput").value = ""; renderAssistant();
  $("aiThread").scrollTop = $("aiThread").scrollHeight;
};
$("aiClear").onclick = () => { aiSave([]); renderAssistant(); };

/* ---------- Users & access requests (admin) ---------- */
async function renderUsers() {
  if (!canManage()) return;
  const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  const users = data || [];
  const pending = users.filter((u) => u.role === "student" && !u.batch_id && !u.group_id);
  $("pendingList").innerHTML = pending.length ? pending.map((u) => `
    <div class="card"><b>${esc(u.full_name || u.email)}</b> — ${esc(u.email)} — ${esc(u.created_at || "")}
    <br><button class="btn small primary" onclick="approveUser('${u.id}')">${LANG === "ar" ? "قبول وتعيين" : "Approve & assign"}</button>
    <button class="btn small danger" onclick="rejectUser('${u.id}')">${LANG === "ar" ? "رفض" : "Reject"}</button></div>`).join("")
    : `<p class="muted">${LANG === "ar" ? "لا توجد طلبات معلقة." : "No pending requests."}</p>`;
  $("userList").innerHTML = `<table><tr><th>${LANG === "ar" ? "الاسم" : "Name"}</th><th>${LANG === "ar" ? "البريد" : "Email"}</th><th>${LANG === "ar" ? "الدور" : "Role"}</th><th>${LANG === "ar" ? "المجموعة" : "Group"}</th><th></th></tr>` +
    users.map((u) => { const g = state.groups.find((x) => x.id === u.group_id);
      return `<tr><td>${esc(u.full_name || "")}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${g ? esc(g.name) : "—"}</td>
      <td>${state.profile.role === "super_admin" ? `<button class="btn small" onclick="editUser('${u.id}')">${LANG === "ar" ? "تعديل الدور" : "Edit role"}</button>` : ""}</td></tr>`; }).join("") + `</table>`;
}
window.approveUser = async (id) => {
  const role = prompt(LANG === "ar" ? "الدور (student / doctor / representative / admin):" : "Role (student / doctor / representative / admin):", "student");
  if (!role) return;
  const gnum = prompt(LANG === "ar" ? "رقم المجموعة (1-19) أو اتركه فارغاً:" : "Group number (1-19) or leave empty:", "");
  const g = gnum ? state.groups.find((x) => x.number === parseInt(gnum, 10)) : null;
  const { error } = await sb.from("profiles").update({ role, batch_id: state.batch ? state.batch.id : null, group_id: g ? g.id : null, is_active: true }).eq("id", id);
  if (error) return alert(error.message);
  alert(LANG === "ar" ? "تم القبول وتفعيل الحساب." : "Approved and activated.");
  renderUsers();
};
window.rejectUser = async (id) => {
  if (!confirm(LANG === "ar" ? "رفض هذا الطلب وتعطيل الحساب؟" : "Reject this request and deactivate the account?")) return;
  const { error } = await sb.from("profiles").update({ is_active: false }).eq("id", id);
  if (error) return alert(error.message);
  renderUsers();
};
window.editUser = async (id) => {
  const role = prompt(LANG === "ar" ? "الدور الجديد (super_admin / admin / doctor / representative / student):" : "New role:", "student");
  if (!role) return;
  const { error } = await sb.from("profiles").update({ role }).eq("id", id);
  if (error) return alert(error.message);
  renderUsers();
};

/* ---------- Settings ---------- */
async function renderSettings() {
  const { data, error } = await sb.from("batches").select("id").limit(1);
  const ok = !error;
  $("connStatus").innerHTML = ok
    ? `<p class="msg ok">${LANG === "ar" ? "متصل بـ Supabase — الدفعات: " : "Connected to Supabase — batches: "}${data ? data.length : 0} — ${CFG.SUPABASE_URL}</p>
       <p class="muted small">${LANG === "ar" ? "الجداول: المحادثات " : "Tables: conversations "}${state.tables.conversations ? "✓" : "✗"} — ${LANG === "ar" ? "الرسائل " : "messages "}${state.tables.messages ? "✓" : "✗"} — ${LANG === "ar" ? "المراجع " : "references "}${state.tables.references ? "✓" : "✗"} — ${LANG === "ar" ? "الجداول اليومية " : "daily "}${state.tables.daily ? "✓" : "✗"} — ${LANG === "ar" ? "الجداول الأسبوعية " : "weekly "}${state.tables.weekly ? "✓" : "✗"}</p>`
    : `<p class="msg">${LANG === "ar" ? "غير متصل: " : "Not connected: "}${esc(error.message)}</p>`;
  const logo = localStorage.getItem("tm_logo");
  if (logo) $("logoImg").src = logo;
  $("homeUrl").value = localStorage.getItem("tm_home_url") || "";
  $("privacyUrl").value = localStorage.getItem("tm_privacy_url") || "";
}
$("logoSave").onclick = () => {
  const f = $("logoInput").files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { localStorage.setItem("tm_logo", r.result); $("logoImg").src = r.result; };
  r.readAsDataURL(f);
};
$("logoRemove").onclick = () => { localStorage.removeItem("tm_logo"); $("logoImg").src = "icon.svg"; };
$("saveUrls").onclick = () => {
  localStorage.setItem("tm_home_url", $("homeUrl").value.trim());
  localStorage.setItem("tm_privacy_url", $("privacyUrl").value.trim());
  setMsg($("urlMsg"), LANG === "ar" ? "تم الحفظ." : "Saved.", true);
};

/* ---------- Init ---------- */
(async function init() {
  applyLang();
  const savedLogo = localStorage.getItem("tm_logo");
  if (savedLogo) $("logoImg").src = savedLogo;
  const { data } = sb ? await sb.auth.getSession() : { data: null };
  if (data && data.session && data.session.user) await afterAuth(data.session.user);
  else show("view-login");
})();
