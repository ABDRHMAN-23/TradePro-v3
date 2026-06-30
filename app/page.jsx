"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================================
// CURRENCIES
// ============================================================
const CURRENCIES = [
  { code:"SAR", symbol:"ر.س",  name:"ريال سعودي",    flag:"🇸🇦" },
  { code:"YER", symbol:"ر.ي",  name:"ريال يمني",     flag:"🇾🇪" },
  { code:"USD", symbol:"$",    name:"دولار أمريكي",  flag:"🇺🇸" },
  { code:"EUR", symbol:"€",    name:"يورو",          flag:"🇪🇺" },
  { code:"GBP", symbol:"£",    name:"جنيه إسترليني", flag:"🇬🇧" },
  { code:"AED", symbol:"د.إ",  name:"درهم إماراتي",  flag:"🇦🇪" },
  { code:"KWD", symbol:"د.ك",  name:"دينار كويتي",   flag:"🇰🇼" },
  { code:"BHD", symbol:"د.ب",  name:"دينار بحريني",  flag:"🇧🇭" },
  { code:"QAR", symbol:"ر.ق",  name:"ريال قطري",     flag:"🇶🇦" },
  { code:"OMR", symbol:"ر.ع",  name:"ريال عُماني",   flag:"🇴🇲" },
  { code:"JOD", symbol:"د.أ",  name:"دينار أردني",   flag:"🇯🇴" },
  { code:"EGP", symbol:"ج.م",  name:"جنيه مصري",     flag:"🇪🇬" },
  { code:"TRY", symbol:"₺",    name:"ليرة تركية",    flag:"🇹🇷" },
  { code:"INR", symbol:"₹",    name:"روبية هندية",   flag:"🇮🇳" },
];

const TRADES = {
  electrician:{ar:"كهربائي",           en:"Electrician",         icon:"⚡"},
  plumber:    {ar:"سباك",              en:"Plumber",             icon:"🔧"},
  hvac:       {ar:"تكييف وتبريد",      en:"HVAC Technician",     icon:"❄️"},
  carpenter:  {ar:"نجار",              en:"Carpenter",           icon:"🪚"},
  painter:    {ar:"دهان",              en:"Painter",             icon:"🖌️"},
  welder:     {ar:"حداد / لحام",       en:"Welder",              icon:"🔥"},
  mason:      {ar:"بناء / مقاول أبنية",en:"Mason",               icon:"🧱"},
  tile_layer: {ar:"فرّاش سيراميك",    en:"Tile Layer",           icon:"🏠"},
  aluminum:   {ar:"ألمنيوم وزجاج",    en:"Aluminum & Glass",     icon:"🪟"},
  solar:      {ar:"طاقة شمسية",       en:"Solar Technician",     icon:"☀️"},
  cctv:       {ar:"كاميرات مراقبة",   en:"CCTV Installer",       icon:"📷"},
  network:    {ar:"شبكات وإنترنت",    en:"Network Technician",   icon:"🌐"},
  elevator:   {ar:"مصاعد",            en:"Elevator Technician",  icon:"🛗"},
  generator:  {ar:"مولدات كهربائية",  en:"Generator Tech",       icon:"🔌"},
  landscaping:{ar:"حدائق ومسابح",     en:"Landscaping",          icon:"🌿"},
  cleaning:   {ar:"تنظيف وصيانة",     en:"Cleaning",             icon:"🧹"},
  gas:        {ar:"غاز وأنابيب",      en:"Gas & Piping",         icon:"🔴"},
  roofing:    {ar:"عزل وأسطح",       en:"Roofing & Insulation",  icon:"🏗️"},
  interior:   {ar:"ديكور وتشطيب",    en:"Interior Finishing",    icon:"🏡"},
  general:    {ar:"مقاول عام",        en:"General Contractor",   icon:"🔨"},
};

// ── PRE-BUILT CATALOG per trade ──────────────────────────
const PRESET_CATALOG = {
  electrician:[
    {name:"كيبل كهربائي 1.5مم",         unit_price:8,   unit:"متر",  category:"كابلات"},
    {name:"كيبل كهربائي 2.5مم",         unit_price:12,  unit:"متر",  category:"كابلات"},
    {name:"كيبل كهربائي 4مم",           unit_price:18,  unit:"متر",  category:"كابلات"},
    {name:"كيبل كهربائي 6مم",           unit_price:26,  unit:"متر",  category:"كابلات"},
    {name:"مقبس كهربائي مفرد",          unit_price:15,  unit:"قطعة", category:"مقابس ومفاتيح"},
    {name:"مقبس كهربائي مزدوج",         unit_price:25,  unit:"قطعة", category:"مقابس ومفاتيح"},
    {name:"مفتاح إضاءة مفرد",           unit_price:12,  unit:"قطعة", category:"مقابس ومفاتيح"},
    {name:"مفتاح إضاءة مزدوج",          unit_price:20,  unit:"قطعة", category:"مقابس ومفاتيح"},
    {name:"قاطع تلقائي 16A",            unit_price:35,  unit:"قطعة", category:"قواطع"},
    {name:"قاطع تلقائي 25A",            unit_price:45,  unit:"قطعة", category:"قواطع"},
    {name:"قاطع تلقائي 40A",            unit_price:60,  unit:"قطعة", category:"قواطع"},
    {name:"قاطع تفاضلي 30mA",           unit_price:120, unit:"قطعة", category:"قواطع"},
    {name:"لوحة توزيع 6 خط",            unit_price:150, unit:"قطعة", category:"لوحات"},
    {name:"لوحة توزيع 12 خط",           unit_price:250, unit:"قطعة", category:"لوحات"},
    {name:"أنبوب حماية PVC 20مم",       unit_price:4,   unit:"متر",  category:"أنابيب وملحقات"},
    {name:"أنبوب حماية PVC 25مم",       unit_price:6,   unit:"متر",  category:"أنابيب وملحقات"},
    {name:"علبة توصيل",                 unit_price:5,   unit:"قطعة", category:"أنابيب وملحقات"},
    {name:"مصباح LED 10W",              unit_price:20,  unit:"قطعة", category:"إضاءة"},
    {name:"سبوت LED 7W",                unit_price:15,  unit:"قطعة", category:"إضاءة"},
    {name:"ساعة عمالة كهربائي",         unit_price:80,  unit:"ساعة", category:"عمالة"},
  ],
  plumber:[
    {name:"أنبوب PPR 20مم",             unit_price:8,   unit:"متر",  category:"أنابيب PPR"},
    {name:"أنبوب PPR 25مم",             unit_price:12,  unit:"متر",  category:"أنابيب PPR"},
    {name:"أنبوب PPR 32مم",             unit_price:18,  unit:"متر",  category:"أنابيب PPR"},
    {name:"أنبوب PVC 50مم",             unit_price:15,  unit:"متر",  category:"أنابيب PVC"},
    {name:"أنبوب PVC 110مم",            unit_price:35,  unit:"متر",  category:"أنابيب PVC"},
    {name:"صمام كروي 1/2 بوصة",        unit_price:25,  unit:"قطعة", category:"صمامات"},
    {name:"صمام كروي 3/4 بوصة",        unit_price:35,  unit:"قطعة", category:"صمامات"},
    {name:"صمام كروي 1 بوصة",          unit_price:55,  unit:"قطعة", category:"صمامات"},
    {name:"خلاط حوض",                  unit_price:150, unit:"قطعة", category:"خلاطات"},
    {name:"خلاط دش",                   unit_price:200, unit:"قطعة", category:"خلاطات"},
    {name:"سيفون أرضي",                unit_price:30,  unit:"قطعة", category:"صرف"},
    {name:"ركبة PPR 90",               unit_price:3,   unit:"قطعة", category:"توصيلات"},
    {name:"تيه PPR",                   unit_price:5,   unit:"قطعة", category:"توصيلات"},
    {name:"مثبت كيماوي",               unit_price:40,  unit:"علبة", category:"لوازم"},
    {name:"ساعة عمالة سباك",           unit_price:90,  unit:"ساعة", category:"عمالة"},
  ],
  hvac:[
    {name:"فريون R410A",               unit_price:80,  unit:"كيلو", category:"فريون"},
    {name:"فريون R22",                 unit_price:60,  unit:"كيلو", category:"فريون"},
    {name:"أنبوب نحاسي 1/4",          unit_price:30,  unit:"متر",  category:"أنابيب"},
    {name:"أنبوب نحاسي 3/8",          unit_price:45,  unit:"متر",  category:"أنابيب"},
    {name:"عازل أنابيب تكييف",        unit_price:8,   unit:"متر",  category:"أنابيب"},
    {name:"مرشح هواء داخلي",          unit_price:25,  unit:"قطعة", category:"فلاتر"},
    {name:"مضخة تصريف",               unit_price:120, unit:"قطعة", category:"قطع غيار"},
    {name:"ثرموستات رقمي",            unit_price:150, unit:"قطعة", category:"تحكم"},
    {name:"ساعة عمالة تكييف",         unit_price:100, unit:"ساعة", category:"عمالة"},
  ],
  painter:[
    {name:"دهان جداري ابيض",          unit_price:45,  unit:"لتر",  category:"دهانات"},
    {name:"دهان أكريليك ملون",         unit_price:55,  unit:"لتر",  category:"دهانات"},
    {name:"بوية خارجية",              unit_price:65,  unit:"لتر",  category:"دهانات"},
    {name:"معجون جداري",              unit_price:30,  unit:"كيلو", category:"تحضير"},
    {name:"بادئة أساس",               unit_price:35,  unit:"لتر",  category:"تحضير"},
    {name:"شريط لاصق",               unit_price:5,   unit:"رولو", category:"لوازم"},
    {name:"رولة دهان كبيرة",          unit_price:15,  unit:"قطعة", category:"أدوات"},
    {name:"فرشاة دهان",               unit_price:8,   unit:"قطعة", category:"أدوات"},
    {name:"ورق زجاجي",               unit_price:3,   unit:"قطعة", category:"أدوات"},
    {name:"ساعة عمالة دهان",          unit_price:60,  unit:"ساعة", category:"عمالة"},
  ],
  general:[
    {name:"إسمنت",                    unit_price:25,  unit:"كيس",  category:"بناء"},
    {name:"رمل",                      unit_price:15,  unit:"جوال", category:"بناء"},
    {name:"طابوق",                    unit_price:1,   unit:"قطعة", category:"بناء"},
    {name:"حديد 10مم",                unit_price:120, unit:"قضيب", category:"حديد"},
    {name:"ساعة عمالة عامة",          unit_price:70,  unit:"ساعة", category:"عمالة"},
  ],
};

// ── i18n ─────────────────────────────────────────────────
const TXT = {
  ar:{
    dir:"rtl",dashboard:"الرئيسية",jobs:"المهام",customers:"العملاء",
    invoices:"الفواتير",reports:"التقارير",ai:"المساعد",settings:"الإعدادات",
    newJob:"مهمة جديدة",newCustomer:"عميل جديد",
    search:"ابحث عن عميل أو مهمة...",
    totalPending:"معلق التحصيل",totalPaid:"محصّل الشهر",
    activeJobs:"مهام نشطة",todayJobs:"مهام اليوم",allJobs:"كل المهام",
    noJobs:"لا توجد مهام",noCustomers:"لا يوجد عملاء",noInvoices:"لا توجد فواتير",
    addFirst:"اضغط + للإضافة",name:"الاسم",phone:"الجوال",
    address:"العنوان",notes:"ملاحظات",jobTitle:"وصف المهمة",
    selectCustomer:"اختر العميل...",scheduledAt:"الموعد",
    laborHours:"ساعات العمل",laborRate:"سعر الساعة",
    materials:"المواد",materialName:"اسم المادة",qty:"الكمية",unitPrice:"السعر",
    addMaterial:"+ أضف مادة",laborTotal:"إجمالي العمالة",matsTotal:"إجمالي المواد",
    grandTotal:"الإجمالي",save:"حفظ",cancel:"إلغاء",delete:"حذف",edit:"تعديل",
    markPaid:"تم الدفع ✓",sendWhatsApp:"إرسال عبر واتساب",
    resendReminder:"إعادة إرسال التذكير",createInvoice:"إنشاء فاتورة",
    viewInvoice:"عرض الفاتورة",changeStatus:"تغيير الحالة",
    jobDetails:"تفاصيل المهمة",invoiceDetails:"تفاصيل الفاتورة",
    customerDetails:"تفاصيل العميل",back:"رجوع",
    scheduled:"مجدول",in_progress:"جارٍ",done:"منتهي",invoiced:"مفوتر",
    draft:"مسودة",sent:"مُرسَل",paid:"مدفوع",overdue:"متأخر",
    online:"متصل",offline:"غير متصل",offlineBanner:"بدون إنترنت — بياناتك محفوظة",
    syncSuccess:"تمت المزامنة",dataSaved:"محفوظ",savedLocally:"محفوظ على الجهاز",
    language:"اللغة",profile:"الملف الشخصي",businessName:"اسم النشاط",
    trade:"المهنة",invoicePrefix:"بادئة الفاتورة",
    subtotal:"قبل الضريبة",tax:"الضريبة",total:"الإجمالي",
    dueDate:"تاريخ الاستحقاق",paidOn:"تم الدفع في",invoiceNumber:"رقم الفاتورة",
    call:"اتصال",jobHistory:"سجل المهام",confirmDelete:"هل أنت متأكد؟",
    noResults:"لا توجد نتائج",fullName:"الاسم الكامل",
    currency:"العملة",taxRate:"نسبة الضريبة (%)",
    revenue:"الإيرادات",totalJobs:"إجمالي المهام",completedJobs:"مكتملة",
    totalCustomers:"إجمالي العملاء",lastActivity:"آخر نشاط",thisMonth:"هذا الشهر",
    quickNote:"ملاحظة سريعة",saveNote:"حفظ",
    clearData:"مسح جميع البيانات",pendingInvoices:"فواتير معلقة",welcome:"مرحباً",
    aiTitle:"المساعد الذكي ⚡",aiSubtitle:"مساعد ذكي مدعوم بـ Claude AI",
    aiPlaceholder:"اسأل مثلاً: ما إجمالي إيراداتي هذا الشهر؟",
    aiSend:"إرسال",aiClear:"مسح",aiThinking:"جارٍ التحليل...",
    exportPDF:"تصدير PDF",addPhoto:"إضافة صورة",photos:"صور المشروع",
    exportExcel:"تصدير CSV",enableNotifications:"تفعيل الإشعارات",
    notificationsEnabled:"الإشعارات مفعّلة",
    expenses:"المصروفات",addExpense:"إضافة مصروف",expenseName:"اسم المصروف",
    expenseAmt:"المبلغ",expenseDate:"التاريخ",expenseCategory:"الفئة",
    profit:"الربح الصافي",totalExpenses:"إجمالي المصروفات",
    monthlyRevenue:"الإيرادات الشهرية",jobsByStatus:"توزيع المهام",
    topCustomers:"أفضل العملاء",avgJobValue:"متوسط الفاتورة",
    quotes:"عروض الأسعار",newQuote:"عرض سعر جديد",noQuotes:"لا توجد عروض",
    quoteDetails:"تفاصيل عرض السعر",convertToInvoice:"تحويل لفاتورة",
    quoteSent:"مُرسَل",quoteAccepted:"مقبول",quoteRejected:"مرفوض",quoteDraft:"مسودة",
    calendar:"التقويم",
    catalog:"كتالوج الأسعار",addCatalogItem:"إضافة عنصر",catalogEmpty:"الكتالوج فارغ",
    catalogSearch:"ابحث في الكتالوج...",addFromCatalog:"أضف من الكتالوج",
    team:"الفريق",addMember:"إضافة عضو",memberName:"اسم العضو",memberRole:"الدور",
    signature:"توقيع العميل",signHere:"وقّع هنا",clearSig:"مسح",saveSig:"حفظ",
    signed:"موقّع",notSigned:"غير موقّع",
    copyLink:"نسخ الرابط",linkCopied:"تم نسخ الرابط!",
    help:"دليل الاستخدام",helpTitle:"كيف تستخدم TradePro؟",
    aiApiKey:"مفتاح Claude AI (اختياري)",aiApiKeyInfo:"أضف مفتاح Anthropic للحصول على ذكاء اصطناعي متقدم",
    smartReminders:"التذكيرات الذكية",voiceNote:"ملاحظة صوتية",
    profitMargin:"هامش الربح",quickAdd:"إضافة سريعة",
    allCategories:"كل التصنيفات",presetLoaded:"تم تحميل الكتالوج",
  },
  en:{
    dir:"ltr",dashboard:"Dashboard",jobs:"Jobs",customers:"Customers",
    invoices:"Invoices",reports:"Reports",ai:"Assistant",settings:"Settings",
    newJob:"New Job",newCustomer:"New Customer",
    search:"Search jobs or customers...",
    totalPending:"Pending",totalPaid:"Collected",
    activeJobs:"Active Jobs",todayJobs:"Today",allJobs:"All Jobs",
    noJobs:"No jobs yet",noCustomers:"No customers yet",noInvoices:"No invoices yet",
    addFirst:"Tap + to add",name:"Name",phone:"Phone",
    address:"Address",notes:"Notes",jobTitle:"Job Description",
    selectCustomer:"Select customer...",scheduledAt:"Scheduled At",
    laborHours:"Labor Hours",laborRate:"Hourly Rate",
    materials:"Materials",materialName:"Material Name",qty:"Qty",unitPrice:"Price",
    addMaterial:"+ Add Material",laborTotal:"Labor Total",matsTotal:"Materials Total",
    grandTotal:"Grand Total",save:"Save",cancel:"Cancel",delete:"Delete",edit:"Edit",
    markPaid:"Mark Paid ✓",sendWhatsApp:"Send via WhatsApp",
    resendReminder:"Resend Reminder",createInvoice:"Create Invoice",
    viewInvoice:"View Invoice",changeStatus:"Change Status",
    jobDetails:"Job Details",invoiceDetails:"Invoice Details",
    customerDetails:"Customer Details",back:"Back",
    scheduled:"Scheduled",in_progress:"In Progress",done:"Done",invoiced:"Invoiced",
    draft:"Draft",sent:"Sent",paid:"Paid",overdue:"Overdue",
    online:"Online",offline:"Offline",offlineBanner:"Offline — data saved locally",
    syncSuccess:"Synced",dataSaved:"Saved",savedLocally:"Saved on device",
    language:"Language",profile:"Profile",businessName:"Business Name",
    trade:"Trade",invoicePrefix:"Invoice Prefix",
    subtotal:"Subtotal",tax:"Tax",total:"Total",
    dueDate:"Due Date",paidOn:"Paid on",invoiceNumber:"Invoice #",
    call:"Call",jobHistory:"Job History",confirmDelete:"Are you sure?",
    noResults:"No results",fullName:"Full Name",
    currency:"Currency",taxRate:"Tax Rate (%)",
    revenue:"Revenue",totalJobs:"Total Jobs",completedJobs:"Completed",
    totalCustomers:"Total Customers",lastActivity:"Last Activity",thisMonth:"This Month",
    quickNote:"Quick Note",saveNote:"Save",
    clearData:"Clear All Data",pendingInvoices:"Pending Invoices",welcome:"Welcome",
    aiTitle:"AI Assistant ⚡",aiSubtitle:"Powered by Claude AI",
    aiPlaceholder:"Ask e.g.: What's my revenue this month?",
    aiSend:"Send",aiClear:"Clear",aiThinking:"Analyzing...",
    exportPDF:"Export PDF",addPhoto:"Add Photo",photos:"Project Photos",
    exportExcel:"Export CSV",enableNotifications:"Enable Notifications",
    notificationsEnabled:"Notifications On",
    expenses:"Expenses",addExpense:"Add Expense",expenseName:"Expense Name",
    expenseAmt:"Amount",expenseDate:"Date",expenseCategory:"Category",
    profit:"Net Profit",totalExpenses:"Total Expenses",
    monthlyRevenue:"Monthly Revenue",jobsByStatus:"Jobs by Status",
    topCustomers:"Top Customers",avgJobValue:"Avg Invoice",
    quotes:"Quotes",newQuote:"New Quote",noQuotes:"No quotes yet",
    quoteDetails:"Quote Details",convertToInvoice:"Convert to Invoice",
    quoteSent:"Sent",quoteAccepted:"Accepted",quoteRejected:"Rejected",quoteDraft:"Draft",
    calendar:"Calendar",
    catalog:"Price Catalog",addCatalogItem:"Add Item",catalogEmpty:"Catalog empty",
    catalogSearch:"Search catalog...",addFromCatalog:"Add from Catalog",
    team:"Team",addMember:"Add Member",memberName:"Member Name",memberRole:"Role",
    signature:"Client Signature",signHere:"Sign Here",clearSig:"Clear",saveSig:"Save",
    signed:"Signed",notSigned:"Not Signed",
    copyLink:"Copy Link",linkCopied:"Link Copied!",
    help:"User Guide",helpTitle:"How to use TradePro?",
    aiApiKey:"Claude AI Key (optional)",aiApiKeyInfo:"Add Anthropic key for advanced AI",
    smartReminders:"Smart Reminders",voiceNote:"Voice Note",
    profitMargin:"Profit Margin",quickAdd:"Quick Add",
    allCategories:"All Categories",presetLoaded:"Catalog loaded",
  },
};

const SK   = "tradepro_v6";
// ملاحظة: لم يعد هناك تخزين لمفتاح AI في المتصفح — المفتاح يعيش فقط على السيرفر (.env)
const INIT = {
  lang:"ar",
  profile:{fullName:"",businessName:"",trade:"electrician",phone:"",invoicePrefix:"INV-",taxRate:15,currency:"SAR"},
  customers:[],jobs:[],invoices:[],notes:[],expenses:[],quotes:[],catalog:[],team:[],
  invoiceCounter:1,quoteCounter:1,
};

const uid    = () => `${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const jTotal = (j) => (j.labor_hours||0)*(j.labor_rate||0)+(j.materials||[]).reduce((s,m)=>s+(m.qty||0)*(m.unit_price||0),0);
const fmtM   = (n,sym) => `${Number(n||0).toLocaleString("ar-SA",{minimumFractionDigits:0,maximumFractionDigits:2})} ${sym}`;
const fmtD   = (d) => d?new Date(d).toLocaleDateString("ar-SA",{day:"numeric",month:"short",year:"numeric"}):"—";
const fmtT   = (d) => d?new Date(d).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}):"";

const SC={scheduled:{bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6"},in_progress:{bg:"#FFFBEB",text:"#B45309",dot:"#F59E0B"},done:{bg:"#F0FDF4",text:"#166534",dot:"#10B981"},invoiced:{bg:"#F5F3FF",text:"#6D28D9",dot:"#8B5CF6"}};
const IC={draft:{bg:"#F8FAFC",text:"#475569",dot:"#94A3B8"},sent:{bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6"},paid:{bg:"#F0FDF4",text:"#166534",dot:"#10B981"},overdue:{bg:"#FEF2F2",text:"#991B1B",dot:"#EF4444"}};
const QC={draft:{bg:"#F8FAFC",text:"#475569",dot:"#94A3B8"},sent:{bg:"#FFFBEB",text:"#B45309",dot:"#F59E0B"},accepted:{bg:"#F0FDF4",text:"#166534",dot:"#10B981"},rejected:{bg:"#FEF2F2",text:"#991B1B",dot:"#EF4444"}};

// ── AI Engine (Gemini via secure server proxy) ───────────
// المفتاح لا يصل أبداً إلى المتصفح — يبقى فقط على السيرفر (server.js)
// التطبيق يستدعي السيرفر، والسيرفر يستدعي Gemini API
const AI_SERVER_URL = (typeof window !== "undefined" && window.localStorage.getItem("tradepro_server")) || "";

async function callServerAI(messages, systemPrompt) {
  const base = AI_SERVER_URL || ""; // فارغ = نفس الدومين (Same-origin)
  const res = await fetch(`${base}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error (${res.status})`);
  }
  const data = await res.json();
  return data.text || "";
}

function buildAISystemPrompt(S, sym, lang) {
  const ar = lang === "ar";
  const pAmt  = S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").reduce((s,i)=>s+i.total,0);
  const cAmt  = S.invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0);
  const mo    = new Date().toISOString().slice(0,7);
  const moAmt = S.invoices.filter(i=>i.status==="paid"&&(i.paid_at||i.created_at||"").startsWith(mo)).reduce((s,i)=>s+i.total,0);
  const totalExp = (S.expenses||[]).reduce((s,e)=>s+(e.amount||0),0);
  const tr = TRADES[S.profile.trade];

  return `أنت مساعد ذكي احترافي مدمج في تطبيق TradePro لإدارة أعمال المقاولين.
اسم المقاول: ${S.profile.fullName||"غير محدد"}
النشاط: ${S.profile.businessName||"غير محدد"}
المهنة: ${tr?tr[lang]:S.profile.trade}
العملة: ${sym} | الضريبة: ${S.profile.taxRate}%
اليوم: ${new Date().toLocaleDateString("ar-SA")}

=== الإحصائيات الحالية ===
العملاء: ${S.customers.length} | المهام: ${S.jobs.length} | الفواتير: ${S.invoices.length}
محصّل الكل: ${fmtM(cAmt,sym)} | هذا الشهر: ${fmtM(moAmt,sym)}
معلق التحصيل: ${fmtM(pAmt,sym)} | مصروفات: ${fmtM(totalExp,sym)}
ربح صافي: ${fmtM(cAmt-totalExp,sym)}
فواتير متأخرة: ${S.invoices.filter(i=>i.status==="overdue").length}
مهام نشطة: ${S.jobs.filter(j=>j.status==="scheduled"||j.status==="in_progress").length}

=== آخر 10 مهام ===
${S.jobs.slice(-10).map(j=>{
  const cu=S.customers.find(c=>c.id===j.customer_id);
  return `- [${j.status}] ${j.title} | ${cu?.name||"?"} | ${fmtM(jTotal(j),sym)}`;
}).join("\n")||"لا يوجد"}

=== أفضل 10 عملاء ===
${S.customers.slice(0,10).map(c=>{
  const jobs=S.jobs.filter(j=>j.customer_id===c.id);
  const paid=S.invoices.filter(i=>S.jobs.find(j=>j.id===i.job_id&&j.customer_id===c.id)&&i.status==="paid").reduce((s,i)=>s+i.total,0);
  return `- ${c.name} (${c.phone}) | ${jobs.length} مهمة | ${fmtM(paid,sym)}`;
}).join("\n")||"لا يوجد"}

=== آخر 8 فواتير ===
${S.invoices.slice(-8).map(i=>{
  const j=S.jobs.find(x=>x.id===i.job_id);
  const c=S.customers.find(x=>x.id===j?.customer_id);
  return `- ${i.invoice_number} [${i.status}] ${c?.name||"?"} | ${fmtM(i.total,sym)}`;
}).join("\n")||"لا يوجد"}

=== تعليماتك ===
- أنت خبير في إدارة أعمال المقاولين وتسعير الخدمات
- استخدم الأرقام الفعلية من البيانات أعلاه دائماً
- أجب بإيجاز وعملية — المقاول مشغول في الميدان
- قدم نصائح عملية قابلة للتطبيق فوراً
- إذا طُلب رسالة واتساب أو PDF أو محتوى — أنشئه كاملاً
- أجب باللغة التي يكتب بها المستخدم (عربي أو إنجليزي)
- لا تتجاوز 300 كلمة إلا إذا طُلب تفصيل`;
}

// ── Fallback AI (offline, no key) ────────────────────────
function localAI(msg, S, sym, t) {
  const m = msg.toLowerCase();
  const pAmt  = S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").reduce((s,i)=>s+i.total,0);
  const cAmt  = S.invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0);
  const mo    = new Date().toISOString().slice(0,7);
  const moAmt = S.invoices.filter(i=>i.status==="paid"&&(i.paid_at||i.created_at||"").startsWith(mo)).reduce((s,i)=>s+i.total,0);
  const exp   = (S.expenses||[]).reduce((s,e)=>s+(e.amount||0),0);
  const ar    = S.lang==="ar";

  if(m.includes("ايراد")||m.includes("دخل")||m.includes("revenue")||m.includes("income"))
    return ar
      ? `📊 **إيراداتك:**\n• هذا الشهر: **${fmtM(moAmt,sym)}**\n• الكل: **${fmtM(cAmt,sym)}**\n• معلق: **${fmtM(pAmt,sym)}**\n• ربح صافي: **${fmtM(cAmt-exp,sym)}**`
      : `📊 **Revenue:**\n• This month: **${fmtM(moAmt,sym)}**\n• Total: **${fmtM(cAmt,sym)}**\n• Pending: **${fmtM(pAmt,sym)}**\n• Net profit: **${fmtM(cAmt-exp,sym)}**`;

  if(m.includes("فاتور")||m.includes("invoice")||m.includes("معلق")||m.includes("pending")) {
    const pending=S.invoices.filter(i=>i.status==="sent"||i.status==="overdue");
    if(!pending.length) return ar?"✅ لا فواتير معلقة!":"✅ No pending invoices!";
    return ar
      ? `💰 **${pending.length} فاتورة معلقة — ${fmtM(pAmt,sym)}**\n\n${pending.slice(0,4).map(inv=>{const j=S.jobs.find(x=>x.id===inv.job_id);const c=S.customers.find(x=>x.id===j?.customer_id);return`• ${inv.invoice_number} — ${c?.name||"?"} — ${fmtM(inv.total,sym)} [${t[inv.status]}]`;}).join("\n")}`
      : `💰 **${pending.length} pending — ${fmtM(pAmt,sym)}**\n\n${pending.slice(0,4).map(inv=>{const j=S.jobs.find(x=>x.id===inv.job_id);const c=S.customers.find(x=>x.id===j?.customer_id);return`• ${inv.invoice_number} — ${c?.name||"?"} — ${fmtM(inv.total,sym)}`;}).join("\n")}`;
  }

  if(m.includes("مهم")||m.includes("شغل")||m.includes("job")||m.includes("task"))
    return ar
      ? `⚙️ **مهامك:**\n• الكل: ${S.jobs.length}\n• مجدولة: ${S.jobs.filter(j=>j.status==="scheduled").length}\n• جارية: ${S.jobs.filter(j=>j.status==="in_progress").length}\n• منتهية: ${S.jobs.filter(j=>j.status==="done").length}`
      : `⚙️ **Jobs:** Total:${S.jobs.length} | Active:${S.jobs.filter(j=>j.status==="in_progress").length} | Done:${S.jobs.filter(j=>j.status==="done").length}`;

  if(m.includes("واتساب")||m.includes("whatsapp")||m.includes("رسالة")||m.includes("تذكير")) {
    const inv=S.invoices.find(i=>i.status==="sent"||i.status==="overdue");
    if(!inv) return ar?"لا فواتير معلقة ✅":"No pending invoices ✅";
    const j=S.jobs.find(x=>x.id===inv.job_id);
    const c=S.customers.find(x=>x.id===j?.customer_id);
    return ar
      ? `💬 **رسالة واتساب:**\n\n---\nالسلام عليكم ${c?.name||""},\nنذكّركم بفاتورة رقم **${inv.invoice_number}**\nالمبلغ: **${fmtM(inv.total,sym)}**\nاستحقاق: ${fmtD(inv.due_date)}\n\nشكراً 🙏 ${S.profile.fullName||""}\n---`
      : `💬 **WhatsApp:**\n\n---\nHello ${c?.name||""},\nReminder: Invoice **${inv.invoice_number}** — ${fmtM(inv.total,sym)}\nDue: ${fmtD(inv.due_date)}\nThank you 🙏\n---`;
  }

  if(m.includes("سعر")||m.includes("تسعير")||m.includes("price")||m.includes("rate")) {
    const rates={electrician:"50–120",plumber:"60–150",hvac:"80–200",carpenter:"60–130",painter:"40–100",general:"70–180"};
    const r=rates[S.profile.trade]||"60–150";
    return ar
      ? `💰 **نطاق السوق لـ${TRADES[S.profile.trade]?.ar}:**\n• ${r} ${sym}/ساعة\n\n📌 **نصيحة التسعير:**\n• تكلفة المواد × 1.3 + ساعات × سعرك\n• أضف 15-20% هامش ربح`
      : `💰 **Market rate:** ${r} ${sym}/hr\n\n📌 Formula: (materials×1.3) + (hours×rate) + 15% margin`;
  }

  if(m.includes("ربح")||m.includes("profit")||m.includes("مصروف")||m.includes("expense"))
    return ar
      ? `📊 **الأرباح:**\n• محصّل: ${fmtM(cAmt,sym)}\n• مصروفات: ${fmtM(exp,sym)}\n• **ربح صافي: ${fmtM(cAmt-exp,sym)}**`
      : `📊 **Profit:** Collected:${fmtM(cAmt,sym)} | Expenses:${fmtM(exp,sym)} | **Net:${fmtM(cAmt-exp,sym)}**`;

  const sugg=ar
    ?["إيراداتي هذا الشهر","الفواتير المعلقة","رسالة واتساب للعميل","نصائح التسعير","ربحي الصافي","أفضل عملائي"]
    :["Revenue this month","Pending invoices","WhatsApp message","Pricing tips","Net profit","Top clients"];
  return ar
    ? `🤖 يمكنني مساعدتك في:\n\n${sugg.map(s=>`• "${s}"`).join("\n")}\n\n💡 أضف مفتاح Claude API في الإعدادات للحصول على ذكاء أقوى!`
    : `🤖 I can help with:\n\n${sugg.map(s=>`• "${s}"`).join("\n")}\n\n💡 Add Claude API key in Settings for advanced AI!`;
}

// ── PDF Generator ─────────────────────────────────────────
function generatePDF(inv, job, cu, profile, sym) {
  const taxAmt = inv.total - inv.subtotal;
  const tr = TRADES[profile.trade];
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Cairo',sans-serif;padding:36px;color:#1E293B;background:#fff;font-size:13px;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #0F172A;}
.biz h1{font-size:20px;font-weight:900;color:#0F172A;margin:0 0 3px;}
.biz p{color:#64748B;font-size:11px;margin:2px 0;}
.inv-meta{text-align:left;}
.inv-meta .num{font-size:16px;font-weight:800;color:#0F172A;}
.inv-meta p{color:#64748B;font-size:11px;margin:2px 0;}
.badge{background:#FEF3C7;color:#92400E;padding:3px 10px;border-radius:16px;font-size:10px;font-weight:700;display:inline-block;margin-top:4px;}
.section{margin-bottom:16px;}
.lbl{font-size:9px;font-weight:700;color:#94A3B8;letter-spacing:1px;margin-bottom:5px;}
.cname{font-size:14px;font-weight:700;margin-bottom:3px;}
.cinfo{font-size:11px;color:#64748B;margin:1px 0;}
.job-box{background:#F8FAFC;border-radius:8px;padding:10px 12px;margin-bottom:14px;}
.job-title{font-weight:700;font-size:13px;}
.job-desc{color:#64748B;font-size:11px;margin-top:3px;}
table{width:100%;border-collapse:collapse;margin-bottom:14px;}
th{background:#0F172A;color:#fff;padding:8px 10px;font-size:11px;text-align:right;font-weight:700;}
td{padding:7px 10px;border-bottom:1px solid #F1F5F9;font-size:12px;}
tr:nth-child(even) td{background:#F9FAFB;}
.totals{background:#F8FAFC;border-radius:10px;padding:12px 14px;}
.t-row{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748B;}
.grand{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:2px solid #0F172A;}
.g-lbl{font-size:15px;font-weight:700;color:#F97316;}
.g-val{font-size:18px;font-weight:900;color:#F97316;}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:10px;}
.status-paid{background:#D1FAE5;color:#065F46;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block;margin-top:8px;}
@media print{body{padding:16px;}@page{margin:1cm;}}
</style></head><body>
<div class="hdr">
<div class="biz">
  <h1>${profile.businessName||"TradePro"}</h1>
  ${tr?`<p>${tr.icon} ${tr.ar}</p>`:""}
  ${profile.phone?`<p>📞 ${profile.phone}</p>`:""}
</div>
<div class="inv-meta">
  <div class="num">${inv.invoice_number}</div>
  <p>📅 ${fmtD(inv.created_at)}</p>
  <div class="badge">استحقاق: ${fmtD(inv.due_date)}</div>
  ${inv.status==="paid"?`<div class="status-paid">✅ مدفوع — ${fmtD(inv.paid_at)}</div>`:""}
</div>
</div>
${cu?`<div class="section">
<div class="lbl">العميل</div>
<div class="cname">${cu.name}</div>
<div class="cinfo">📞 ${cu.phone}</div>
${cu.address?`<div class="cinfo">📍 ${cu.address}</div>`:""}
</div>`:""}
${job?`<div class="job-box">
<div class="lbl">الخدمة المقدمة</div>
<div class="job-title">${job.title}</div>
${job.notes?`<div class="job-desc">${job.notes}</div>`:""}
</div>`:""}
${(job?.materials||[]).length>0?`
<div class="section"><div class="lbl">المواد المستخدمة</div>
<table>
<tr><th>المادة</th><th>الكمية</th><th>الوحدة</th><th>سعر الوحدة</th><th>الإجمالي</th></tr>
${(job.materials||[]).map(m=>`<tr><td>${m.name}</td><td>${m.qty}</td><td>${m.unit||""}</td><td>${fmtM(m.unit_price,sym)}</td><td><b>${fmtM(m.qty*m.unit_price,sym)}</b></td></tr>`).join("")}
</table></div>`:""}
<div class="totals">
${(job?.labor_hours||0)>0?`<div class="t-row"><span>عمالة — ${job.labor_hours} ساعة × ${fmtM(job.labor_rate||0,sym)}</span><span>${fmtM((job.labor_hours||0)*(job.labor_rate||0),sym)}</span></div>`:""}
${(job?.materials||[]).length>0?`<div class="t-row"><span>مواد (${job.materials.length} قطعة)</span><span>${fmtM(job.materials.reduce((s,m)=>s+m.qty*m.unit_price,0),sym)}</span></div>`:""}
<div class="t-row"><span>المجموع قبل الضريبة</span><span>${fmtM(inv.subtotal,sym)}</span></div>
${inv.tax_rate>0?`<div class="t-row"><span>ضريبة القيمة المضافة (${inv.tax_rate}%)</span><span>${fmtM(taxAmt,sym)}</span></div>`:""}
<div class="grand"><span class="g-lbl">الإجمالي النهائي</span><span class="g-val">${fmtM(inv.total,sym)}</span></div>
</div>
<div class="footer">
<p>شكراً جزيلاً لثقتكم — ${profile.businessName||"TradePro"}</p>
<p style="margin-top:3px">تم إنشاء هذه الفاتورة بواسطة TradePro</p>
</div>
</body></html>`;
  const w = window.open("","_blank");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);}
}

// ── CSV Export (Smart) ────────────────────────────────────
function exportSmartCSV(data, type, t, sym, customers, jobs) {
  const bom = "\uFEFF";
  let rows = [];

  if(type==="invoices") {
    rows = [
      [t.invoiceNumber, "العميل","الهاتف","الخدمة",t.subtotal,`${t.tax}`,t.total,t.dueDate,"الحالة","تاريخ الإنشاء","تاريخ الدفع"],
      ...data.map(inv=>{
        const job=jobs.find(j=>j.id===inv.job_id);
        const cu=customers.find(c=>c.id===job?.customer_id);
        return [
          inv.invoice_number, cu?.name||"", cu?.phone||"", job?.title||"",
          inv.subtotal.toFixed(2), `${inv.tax_rate}%`, inv.total.toFixed(2),
          fmtD(inv.due_date), t[inv.status]||inv.status,
          fmtD(inv.created_at), inv.paid_at?fmtD(inv.paid_at):""
        ];
      })
    ];
  } else if(type==="jobs") {
    rows = [
      ["العميل","الهاتف","المهمة","الحالة","الموعد","ساعات العمل","سعر الساعة","إجمالي العمالة","إجمالي المواد","الإجمالي","تاريخ الإنشاء"],
      ...data.map(j=>{
        const cu=customers.find(c=>c.id===j.customer_id);
        const labor=(j.labor_hours||0)*(j.labor_rate||0);
        const mats=(j.materials||[]).reduce((s,m)=>s+m.qty*m.unit_price,0);
        return [
          cu?.name||"",cu?.phone||"",j.title,t[j.status]||j.status,
          j.scheduled_at?fmtD(j.scheduled_at):"", j.labor_hours||0, j.labor_rate||0,
          labor.toFixed(2), mats.toFixed(2), (labor+mats).toFixed(2), fmtD(j.created_at)
        ];
      })
    ];
  } else if(type==="customers") {
    rows = [
      ["الاسم","الهاتف","العنوان","عدد المهام","إجمالي المدفوع","آخر نشاط","ملاحظات"],
      ...data.map(c=>{
        const cj=jobs.filter(j=>j.customer_id===c.id);
        const paid=0;
        const last=cj.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
        return [c.name,c.phone||"",c.address||"",cj.length,paid.toFixed(2),last?fmtD(last.created_at):"",c.notes||""];
      })
    ];
  } else if(type==="expenses") {
    rows = [
      ["اسم المصروف","المبلغ","الفئة","التاريخ"],
      ...data.map(e=>[e.name, e.amount.toFixed(2), e.category||"", fmtD(e.date)])
    ];
    const total = data.reduce((s,e)=>s+(e.amount||0),0);
    rows.push(["","","",""]);
    rows.push(["الإجمالي", total.toFixed(2),"",""]);
  }

  const csv = rows.map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const a   = document.createElement("a");
  a.href    = URL.createObjectURL(new Blob([bom+csv],{type:"text/csv;charset=utf-8;"}));
  a.download = `tradepro-${type}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function TradePro() {
  const [mounted,  setMounted]  = useState(false);
  const [S,        setS_]       = useState(INIT);
  const [screen,   setScreen]   = useState("dashboard");
  const [selId,    setSelId]    = useState(null);
  const [modal,    setModal]    = useState(null);
  const [searchQ,  setSearchQ]  = useState("");
  const [soOpen,   setSoOpen]   = useState(false);
  const [online,   setOnline]   = useState(true);
  const [toast,    setToast]    = useState(null);
  const [drawer,   setDrawer]   = useState(false);
  const [cdel,     setCdel]     = useState(null);
  const [jf,       setJf]       = useState("all");
  const [aiMsgs,   setAiMsgs]   = useState([]);
  const [aiInput,  setAiInput]  = useState("");
  const [aiLoad,   setAiLoad]   = useState(false);
  const [aiServerOk, setAiServerOk] = useState(true); // متفائل افتراضياً، يتحدث بعد أول محاولة فعلية
  const [notifOn,  setNotifOn]  = useState(false);
  const [photoMdl, setPhotoMdl] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const aiRef   = useRef(null);
  const srchRef = useRef(null);
  const fileRef = useRef(null);
  const aiInputRef = useRef(null);

  // ── HYDRATION FIX ────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) setS_({ ...INIT, ...JSON.parse(raw) });
    } catch {}
    setMounted(true);
    setOnline(navigator.onLine);
  }, []);

  const t   = TXT[S.lang];
  const dir = t.dir;
  const cur = CURRENCIES.find(c=>c.code===S.profile.currency)||CURRENCIES[0];
  const sym = cur.symbol;

  const setS = useCallback((u) => {
    setS_(p => {
      const n = typeof u==="function" ? u(p) : {...p,...u};
      try { localStorage.setItem(SK, JSON.stringify(n)); } catch {}
      return n;
    });
  }, []);

  // Cross-tab sync
  useEffect(() => {
    if (!mounted) return;
    const h = (e) => {
      if (e.key===SK && e.newValue) {
        try { setS_(JSON.parse(e.newValue)); showToast("🔄 "+t.syncSuccess); } catch {}
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, [mounted]);

  // Network
  useEffect(() => {
    if (!mounted) return;
    const on  = () => { setOnline(true); showToast("✅ "+t.online); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  }, [mounted]);

  // Search outside click
  useEffect(() => {
    const h = (e) => { if (srchRef.current && !srchRef.current.contains(e.target)) setSoOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // AI scroll
  useEffect(() => { aiRef.current?.scrollIntoView({behavior:"smooth"}); }, [aiMsgs]);

  // AI welcome
  useEffect(() => {
    if (aiMsgs.length===0 && mounted) {
      setAiMsgs([{role:"assistant", content:S.lang==="ar"
        ? `مرحباً! 🤖 أنا مساعدك الذكي في TradePro.\n\n${aiServerOk?"أعمل بقوة Gemini AI ✨":"💡 المساعد المحلي مفعّل — للحصول على ذكاء أقوى تأكد من تشغيل السيرفر مع مفتاح Gemini"}\n\nاسألني عن:\n• إيراداتك ومهامك وفواتيرك\n• نصائح التسعير والربح\n• رسائل واتساب جاهزة\n• تحليل أدائك المالي`
        : `Hello! 🤖 I'm your TradePro AI Assistant.\n\n${aiServerOk?"Powered by Gemini AI ✨":"💡 Local assistant active — for advanced AI make sure the server is running with a Gemini key"}\n\nAsk me about:\n• Revenue, jobs, invoices\n• Pricing & profit tips\n• WhatsApp messages\n• Financial analysis`,
        ts: new Date().toISOString()}]);
    }
  }, [mounted]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2500); };
  const nav = (s, id=null) => { setScreen(s); setSelId(id); setDrawer(false); setSoOpen(false); };

  // ── DATA OPS ─────────────────────────────────────────────
  const addCust  = (d) => { setS(p=>({...p,customers:[...p.customers,{id:uid(),...d,created_at:new Date().toISOString()}]})); showToast("✅"); setModal(null); };
  const updCust  = (id,d) => { setS(p=>({...p,customers:p.customers.map(c=>c.id===id?{...c,...d}:c)})); showToast("✅"); setModal(null); };
  const delCust  = (id) => { setS(p=>({...p,customers:p.customers.filter(c=>c.id!==id)})); nav("customers"); showToast("🗑"); };
  const addJob   = (d) => { setS(p=>({...p,jobs:[...p.jobs,{id:uid(),...d,materials:d.materials||[],photos:[],status:"scheduled",created_at:new Date().toISOString()}]})); showToast("✅"); setModal(null); };
  const updJob   = (id,d) => { setS(p=>({...p,jobs:p.jobs.map(j=>j.id===id?{...j,...d}:j)})); showToast("✅"); setModal(null); };
  const updJStat = (id,st) => { setS(p=>({...p,jobs:p.jobs.map(j=>j.id===id?{...j,status:st,completed_at:st==="done"?new Date().toISOString():j.completed_at}:j)})); showToast("✅ "+t[st]); };
  const delJob   = (id) => { setS(p=>({...p,jobs:p.jobs.filter(j=>j.id!==id)})); nav("jobs"); showToast("🗑"); };
  const addExp   = (d) => { setS(p=>({...p,expenses:[...p.expenses,{id:uid(),...d,created_at:new Date().toISOString()}]})); showToast("✅"); };
  const addQuote = (d) => { setS(p=>({...p,quotes:[...p.quotes,{id:uid(),...d,status:"draft",created_at:new Date().toISOString()}]})); showToast("✅"); setModal(null); };
  const addCatItem = (d) => { setS(p=>({...p,catalog:[...p.catalog,{id:uid(),...d,created_at:new Date().toISOString()}]})); showToast("✅"); };
  const delCatItem = (id) => { setS(p=>({...p,catalog:p.catalog.filter(c=>c.id!==id)})); };
  const addTeamMember = (d) => { setS(p=>({...p,team:[...p.team,{id:uid(),...d,created_at:new Date().toISOString()}]})); showToast("✅"); setModal(null); };
  const delTeamMember = (id) => { setS(p=>({...p,team:p.team.filter(m=>m.id!==id)})); showToast("🗑"); };

  const mkInv = (jobId) => {
    const job=S.jobs.find(j=>j.id===jobId); if(!job)return;
    const sub=jTotal(job), taxA=sub*(S.profile.taxRate||0)/100;
    const inv={id:uid(),job_id:jobId,invoice_number:`${S.profile.invoicePrefix}${String(S.invoiceCounter).padStart(4,"0")}`,subtotal:sub,tax_rate:S.profile.taxRate||0,total:sub+taxA,status:"draft",created_at:new Date().toISOString(),due_date:new Date(Date.now()+15*86400000).toISOString().split("T")[0],currency:S.profile.currency};
    setS(p=>({...p,invoices:[...p.invoices,inv],invoiceCounter:p.invoiceCounter+1,jobs:p.jobs.map(j=>j.id===jobId?{...j,status:"invoiced"}:j)}));
    nav("invoice-detail",inv.id); showToast("📋 "+t.createInvoice);
  };
  const updInv = (id,st) => {
    setS(p=>({...p,invoices:p.invoices.map(i=>i.id===id?{...i,status:st,paid_at:st==="paid"?new Date().toISOString():i.paid_at,sent_at:st==="sent"?new Date().toISOString():i.sent_at}:i)}));
    showToast("✅ "+t[st]);
  };
  const convertQtoInv = (qId) => {
    const q=S.quotes.find(x=>x.id===qId); if(!q)return;
    const sub=q.total||0, taxA=sub*(S.profile.taxRate||0)/100;
    const inv={id:uid(),job_id:q.job_id||null,invoice_number:`${S.profile.invoicePrefix}${String(S.invoiceCounter).padStart(4,"0")}`,subtotal:sub,tax_rate:S.profile.taxRate||0,total:sub+taxA,status:"draft",created_at:new Date().toISOString(),due_date:new Date(Date.now()+15*86400000).toISOString().split("T")[0],currency:S.profile.currency,from_quote:qId};
    setS(p=>({...p,invoices:[...p.invoices,inv],invoiceCounter:p.invoiceCounter+1,quotes:p.quotes.map(x=>x.id===qId?{...x,status:"accepted"}:x)}));
    nav("invoice-detail",inv.id); showToast("📋 "+t.createInvoice);
  };

  const addPhoto = (jobId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setS(p=>({...p,jobs:p.jobs.map(j=>j.id===jobId?{...j,photos:[...(j.photos||[]),{id:uid(),url:e.target.result,ts:new Date().toISOString()}]}:j)}));
      showToast("📷 "+t.addPhoto);
    };
    reader.readAsDataURL(file);
  };

  // Load preset catalog for trade
  const loadPresetCatalog = () => {
    const presets = PRESET_CATALOG[S.profile.trade] || PRESET_CATALOG.general;
    const newItems = presets.map(p=>({...p, id:uid(), created_at:new Date().toISOString()}));
    setS(p=>({...p, catalog:[...p.catalog, ...newItems.filter(ni=>!p.catalog.find(ci=>ci.name===ni.name))]}));
    showToast("✅ "+t.presetLoaded);
  };

  // ── AI Handler ───────────────────────────────────────────
  // يحاول استخدام Gemini عبر السيرفر الآمن أولاً، وإن فشل (لا سيرفر / لا مفتاح)
  // يستخدم المساعد المحلي البديل تلقائياً — بدون أي مفتاح في المتصفح أبداً
  const sendAI = async (customMsg) => {
    const msg = (customMsg || aiInput).trim();
    if (!msg || aiLoad) return;
    const um = {role:"user", content:msg, ts:new Date().toISOString()};
    setAiMsgs(p=>[...p, um]);
    setAiInput("");
    setAiLoad(true);
    try {
      const sys = buildAISystemPrompt(S, sym, S.lang);
      const msgs = [...aiMsgs, um].filter(m=>m.role==="user"||m.role==="assistant").map(m=>({role:m.role,content:m.content}));
      const reply = await callServerAI(msgs, sys);
      setAiMsgs(p=>[...p, {role:"assistant", content:reply, ts:new Date().toISOString()}]);
      setAiServerOk(true);
    } catch(e) {
      // فشل السيرفر (غير مشغّل أو بدون مفتاح) — استخدم الذكاء المحلي البديل
      setAiServerOk(false);
      await new Promise(r=>setTimeout(r,250));
      const reply = localAI(msg, S, sym, t);
      setAiMsgs(p=>[...p, {role:"assistant", content:reply, ts:new Date().toISOString()}]);
    } finally {
      setAiLoad(false);
    }
  };

  const QP = S.lang==="ar"
    ? ["إيراداتي هذا الشهر","الفواتير المعلقة","رسالة واتساب للتذكير","نصائح التسعير لمهنتي","ربحي الصافي","أفضل عملائي","مهام اليوم","كيف أزيد دخلي؟"]
    : ["Revenue this month","Pending invoices","WhatsApp reminder","Pricing tips","Net profit","Top clients","Today's jobs","How to grow income?"];

  // ── Search ───────────────────────────────────────────────
  const sRes = useMemo(() => {
    if (searchQ.length < 2) return [];
    const q = searchQ.toLowerCase();
    return [
      ...S.customers.filter(c=>c.name?.toLowerCase().includes(q)||c.phone?.includes(q)).map(c=>({type:"customer",id:c.id,title:c.name,sub:c.phone,icon:"◉"})),
      ...S.jobs.filter(j=>j.title?.toLowerCase().includes(q)).map(j=>({type:"job",id:j.id,title:j.title,sub:S.customers.find(c=>c.id===j.customer_id)?.name||"",icon:"⚙"})),
      ...S.invoices.filter(i=>i.invoice_number?.toLowerCase().includes(q)).map(i=>({type:"invoice",id:i.id,title:i.invoice_number,sub:fmtM(i.total,sym),icon:"◧"})),
    ];
  }, [searchQ, S.customers, S.jobs, S.invoices]);

  // ── Stats ────────────────────────────────────────────────
  const pAmt     = useMemo(()=>S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").reduce((s,i)=>s+i.total,0),[S.invoices]);
  const cAmt     = useMemo(()=>S.invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0),[S.invoices]);
  const aJobs    = useMemo(()=>S.jobs.filter(j=>j.status==="scheduled"||j.status==="in_progress"),[S.jobs]);
  const todayStr = useMemo(()=>new Date().toISOString().split("T")[0],[]);
  const tJobs    = useMemo(()=>S.jobs.filter(j=>j.scheduled_at?.startsWith(todayStr)),[S.jobs,todayStr]);
  const totalExp = useMemo(()=>(S.expenses||[]).reduce((s,e)=>s+(e.amount||0),0),[S.expenses]);
  const selJ  = S.jobs.find(j=>j.id===selId);
  const selC  = S.customers.find(c=>c.id===selId);
  const selI  = S.invoices.find(i=>i.id===selId);
  const selQ  = S.quotes.find(q=>q.id===selId);

  if (!mounted) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0F172A",flexDirection:"column",gap:12}}>
      <div style={{color:"#F97316",fontSize:28,fontWeight:900,fontFamily:"sans-serif"}}>⚡ TradePro</div>
      <div style={{color:"#64748B",fontSize:13,fontFamily:"sans-serif"}}>جارٍ التحميل...</div>
    </div>
  );

  // ── DESIGN ───────────────────────────────────────────────
  const C={sb:"#0F172A",sb2:"#1E293B",acc:"#F97316",accD:"#EA580C",bg:"#F1F5F9",card:"#FFFFFF",bdr:"#E2E8F0",tx:"#0F172A",mu:"#64748B",li:"#94A3B8",ok:"#10B981",er:"#EF4444",wa:"#F59E0B",pu:"#8B5CF6",ai:"#6366F1",aiD:"#4F46E5"};
  const iS={width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.bdr}`,fontSize:14,background:"#fff",color:C.tx,boxSizing:"border-box",fontFamily:"inherit",outline:"none"};

  // Atoms
  const Bdg=({st,map:m})=>{const cc=(m||SC)[st]||{bg:"#eee",text:"#555"};return<span style={{background:cc.bg,color:cc.text,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{t[st]||st}</span>;};
  const Btn=({label,onClick,col,out=false,sm=false,icon="",disabled=false,full=false})=>(
    <button onClick={onClick} disabled={disabled} style={{padding:sm?"6px 12px":"10px 18px",borderRadius:9,border:out?`1.5px solid ${col||C.acc}`:"none",background:out?"transparent":disabled?C.bg:`linear-gradient(135deg,${col||C.acc},${col?col+"cc":C.accD})`,color:out?(col||C.acc):disabled?C.mu:"#fff",fontWeight:700,fontSize:sm?12:13,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:full?0:0,width:full?"100%":"auto",justifyContent:full?"center":"flex-start",opacity:disabled?0.6:1}}>
      {icon&&<span>{icon}</span>}{label}
    </button>
  );
  const Fld=({label,children,half})=>(
    <div style={{marginBottom:12,flex:half?"1 1 45%":"1 1 100%",minWidth:0}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:C.mu,marginBottom:4}}>{label}</label>
      {children}
    </div>
  );
  const IR=({label,value,bold,acc})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
      <span style={{fontSize:12,color:C.mu}}>{label}</span>
      <span style={{fontSize:13,color:acc?C.acc:C.tx,fontWeight:bold?800:500}}>{value}</span>
    </div>
  );
  const Card=({title,children,action})=>(
    <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.bdr}`,marginBottom:14,overflow:"hidden"}}>
      {title&&<div style={{padding:"11px 16px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:700,fontSize:13,color:C.tx}}>{title}</span>{action}
      </div>}
      <div style={{padding:"13px 16px"}}>{children}</div>
    </div>
  );
  const Emp=({icon,label})=>(
    <div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:44,marginBottom:10}}>{icon}</div>
      <p style={{color:C.mu,fontSize:14,margin:"0 0 4px"}}>{label}</p>
      <p style={{color:C.li,fontSize:12}}>{t.addFirst}</p>
    </div>
  );
  const Mdl=({title,onClose,children,wide})=>(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:wide?700:500,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`,position:"sticky",top:0,background:C.card,zIndex:1}}>
          <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
        </div>
        <div style={{padding:"16px 20px"}}>{children}</div>
      </div>
    </div>
  );
  const Stat=({label,value,sub,col,icon})=>(
    <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.bdr}`,padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{color:C.mu,fontSize:11,fontWeight:600,margin:"0 0 6px"}}>{label}</p>
          <p style={{color:col||C.tx,fontSize:19,fontWeight:900,margin:"0 0 2px",letterSpacing:-0.5}}>{value}</p>
          {sub&&<p style={{color:C.li,fontSize:11,margin:0}}>{sub}</p>}
        </div>
        <div style={{width:38,height:38,borderRadius:10,background:`${col||C.acc}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
      </div>
    </div>
  );
  const JRow=({job,onClick})=>{
    const cu=S.customers.find(c=>c.id===job.customer_id);
    return(
      <div onClick={onClick} style={{background:C.card,borderRadius:10,border:`1px solid ${C.bdr}`,padding:"11px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"box-shadow 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
        <div style={{width:8,height:8,borderRadius:"50%",background:SC[job.status]?.dot||"#ccc",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:600,fontSize:13,color:C.tx,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.title}</p>
          <p style={{fontSize:11,color:C.mu,margin:0}}>{cu?.name||"—"}{job.scheduled_at?" · "+fmtD(job.scheduled_at):""}{(job.photos||[]).length>0?` 📷${job.photos.length}`:""}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
          <Bdg st={job.status} map={SC}/>
          <span style={{fontSize:12,fontWeight:700,color:C.tx}}>{fmtM(jTotal(job),sym)}</span>
        </div>
      </div>
    );
  };
  const IRow=({inv,onClick})=>{
    const job=S.jobs.find(j=>j.id===inv.job_id);
    const cu=S.customers.find(c=>c.id===job?.customer_id);
    const iSym=(CURRENCIES.find(c=>c.code===inv.currency)||cur).symbol;
    return(
      <div onClick={onClick} style={{background:C.card,borderRadius:10,border:`1px solid ${C.bdr}`,padding:"11px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"box-shadow 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
        <div style={{width:8,height:8,borderRadius:"50%",background:IC[inv.status]?.dot||"#ccc",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:700,fontSize:13,color:C.tx,margin:"0 0 2px"}}>{inv.invoice_number}</p>
          <p style={{fontSize:11,color:C.mu,margin:0}}>{cu?.name||"—"} · {fmtD(inv.created_at)}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
          <Bdg st={inv.status} map={IC}/>
          <span style={{fontSize:13,fontWeight:800,color:C.tx}}>{fmtM(inv.total,iSym)}</span>
        </div>
      </div>
    );
  };

  // ── SIDEBAR ──────────────────────────────────────────────
  const navItems=[
    {key:"dashboard",icon:"⊞",label:t.dashboard},
    {key:"jobs",icon:"⚙",label:t.jobs,badge:aJobs.length||null},
    {key:"customers",icon:"◉",label:t.customers},
    {key:"quotes",icon:"📝",label:t.quotes},
    {key:"invoices",icon:"◧",label:t.invoices,badge:S.invoices.filter(i=>i.status==="overdue").length||null},
    {key:"calendar",icon:"📅",label:t.calendar},
    {key:"catalog",icon:"🏷",label:t.catalog},
    {key:"expenses",icon:"💸",label:t.expenses},
    {key:"reports",icon:"📊",label:t.reports},
    {key:"team",icon:"👷",label:t.team},
    {key:"ai",icon:"🤖",label:t.ai},
    {key:"settings",icon:"⚙︎",label:t.settings},
  ];
  const SB=()=>(
    <div style={{width:220,minWidth:220,background:C.sb,display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
      <div style={{padding:"18px 14px 12px",borderBottom:"1px solid #1E293B",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.acc},${C.accD})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:15,flexShrink:0}}>T</div>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:14}}>TradePro</div><div style={{color:C.li,fontSize:10}}>أداة المقاول الذكي</div></div>
        </div>
        {S.profile.businessName&&<p style={{color:C.li,fontSize:10,margin:"7px 0 0",paddingTop:7,borderTop:"1px solid #1E293B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{S.profile.businessName}</p>}
      </div>
      <nav style={{flex:1,padding:"7px 7px",overflowY:"auto"}}>
        {navItems.map(item=>{
          const active=screen===item.key;
          const isAI=item.key==="ai";
          return(
            <button key={item.key} onClick={()=>nav(item.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:7,background:active?(isAI?"#312E81":C.sb2):"transparent",border:active?`1px solid ${isAI?"#4338CA":"#334155"}`:"1px solid transparent",cursor:"pointer",marginBottom:1,textAlign:dir==="rtl"?"right":"left"}}>
              <span style={{fontSize:14,color:active?(isAI?C.ai:C.acc):C.li,lineHeight:1,flexShrink:0}}>{item.icon}</span>
              <span style={{color:active?"#fff":C.li,fontWeight:active?700:400,fontSize:12,flex:1,textAlign:"start"}}>{item.label}</span>
              {item.badge>0&&<span style={{background:isAI?C.ai:C.er,color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:16}}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"10px 10px 14px",flexShrink:0,borderTop:"1px solid #1E293B"}}>
        <button onClick={()=>setModal("add-job")} style={{width:"100%",padding:"9px 0",background:`linear-gradient(135deg,${C.acc},${C.accD})`,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",marginBottom:6}}>+ {t.newJob}</button>
        <button onClick={()=>setHelpOpen(true)} style={{width:"100%",padding:"7px 0",background:"#1E293B",color:C.li,border:"none",borderRadius:7,fontWeight:600,fontSize:11,cursor:"pointer",marginBottom:8}}>❓ {t.help}</button>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:online?C.ok:C.er}}/>
            <span style={{color:C.li,fontSize:10}}>{online?t.online:t.offline}</span>
          </div>
          <span style={{color:C.li,fontSize:10}}>{t.savedLocally}</span>
        </div>
      </div>
    </div>
  );

  // ── TOP BAR ──────────────────────────────────────────────
  const detS=["job-detail","invoice-detail","customer-detail","quote-detail"];
  const TB=({title})=>(
    <div style={{background:C.card,borderBottom:`1px solid ${C.bdr}`,padding:"0 12px",height:52,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      <button className="tp-ham" onClick={()=>setDrawer(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.tx,padding:4,lineHeight:1,flexShrink:0}}>☰</button>
      {detS.includes(screen)&&(
        <button onClick={()=>nav(screen==="job-detail"?"jobs":screen==="invoice-detail"?"invoices":screen==="quote-detail"?"quotes":"customers")}
          style={{background:"none",border:"none",cursor:"pointer",color:C.acc,fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap",flexShrink:0}}>
          {dir==="rtl"?"→":"←"} {t.back}
        </button>
      )}
      <h1 style={{fontSize:13,fontWeight:700,color:C.tx,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:"0 1 auto"}}>{title}</h1>
      {/* FIXED SEARCH — uncontrolled value prevents re-render loop */}
      <div ref={srchRef} style={{position:"relative",flex:1,minWidth:0,maxWidth:360}}>
        <input
          defaultValue=""
          onChange={e=>{setSearchQ(e.target.value);setSoOpen(true);}}
          onFocus={()=>setSoOpen(true)}
          placeholder={t.search}
          style={{width:"100%",padding:"6px 10px 6px 30px",borderRadius:7,border:`1.5px solid ${C.bdr}`,fontSize:12,background:C.bg,color:C.tx,outline:"none",boxSizing:"border-box"}}/>
        <span style={{position:"absolute",insetInlineStart:8,top:"50%",transform:"translateY(-50%)",color:C.li,fontSize:12,pointerEvents:"none"}}>🔍</span>
        {soOpen&&searchQ.length>1&&(
          <div style={{position:"absolute",top:"calc(100% + 5px)",insetInlineStart:0,insetInlineEnd:0,background:C.card,borderRadius:8,boxShadow:"0 8px 28px rgba(0,0,0,0.14)",border:`1px solid ${C.bdr}`,zIndex:999,maxHeight:220,overflowY:"auto"}}>
            {sRes.length===0
              ?<div style={{padding:"12px",color:C.mu,fontSize:12,textAlign:"center"}}>{t.noResults}</div>
              :sRes.map(r=>(
                <button key={r.id} onClick={()=>{setSearchQ("");setSoOpen(false);nav(r.type==="customer"?"customer-detail":r.type==="invoice"?"invoice-detail":"job-detail",r.id);}}
                  style={{width:"100%",padding:"9px 12px",textAlign:dir==="rtl"?"right":"left",background:"none",border:"none",borderBottom:`1px solid ${C.bdr}`,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14,flexShrink:0}}>{r.icon}</span>
                  <div><div style={{fontWeight:600,fontSize:12,color:C.tx}}>{r.title}</div><div style={{fontSize:11,color:C.mu}}>{r.sub}</div></div>
                </button>
              ))}
          </div>
        )}
      </div>
      <select value={S.profile.currency} onChange={e=>setS(p=>({...p,profile:{...p.profile,currency:e.target.value}}))}
        style={{padding:"4px 6px",borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:11,background:C.bg,color:C.tx,cursor:"pointer",flexShrink:0,maxWidth:80}}>
        {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
      </select>
      <button onClick={()=>setS(p=>({...p,lang:p.lang==="ar"?"en":"ar"}))}
        style={{background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,color:C.mu,cursor:"pointer",flexShrink:0}}>
        {S.lang==="ar"?"EN":"عربي"}
      </button>
    </div>
  );

  // ── FORMS ────────────────────────────────────────────────
  // FAST Customer Form — inline, no modal needed for quick add
  const CustForm=({init,onSave,onClose})=>{
    const [f,sf]=useState(init||{name:"",phone:"",address:"",notes:""});
    return(
      <>
        <div style={{background:`${C.acc}08`,border:`1px solid ${C.acc}30`,borderRadius:10,padding:"10px 13px",marginBottom:12,fontSize:12,color:C.mu}}>
          💡 {S.lang==="ar"?"الحقول المطلوبة فقط: الاسم والجوال":"Only required: Name and Phone"}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          <Fld label={t.name+" *"} half><input value={f.name} onChange={e=>sf(p=>({...p,name:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"أحمد الزهراني":"John Smith"} autoFocus/></Fld>
          <Fld label={t.phone+" *"} half><input value={f.phone} onChange={e=>sf(p=>({...p,phone:e.target.value}))} style={iS} type="tel" placeholder="05XXXXXXXX"/></Fld>
        </div>
        <Fld label={`${t.address} (${S.lang==="ar"?"اختياري":"optional"})`}><input value={f.address} onChange={e=>sf(p=>({...p,address:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"الحي، الشارع":"Neighborhood, Street"}/></Fld>
        <Fld label={`${t.notes} (${S.lang==="ar"?"اختياري":"optional"})`}><textarea value={f.notes} onChange={e=>sf(p=>({...p,notes:e.target.value}))} style={{...iS,resize:"none"}} rows={2} placeholder={S.lang==="ar"?"أي معلومات مفيدة عن العميل...":"Any useful info about client..."}/></Fld>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:7,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.mu,fontWeight:600,cursor:"pointer",fontSize:13}}>{t.cancel}</button>
          <button onClick={()=>f.name&&f.phone&&onSave(f)} disabled={!f.name||!f.phone}
            style={{flex:2,padding:"9px 0",borderRadius:7,border:"none",background:!f.name||!f.phone?C.bg:`linear-gradient(135deg,${C.acc},${C.accD})`,color:!f.name||!f.phone?C.mu:"#fff",fontWeight:700,cursor:!f.name||!f.phone?"not-allowed":"pointer",fontSize:13}}>
            ✅ {t.save}
          </button>
        </div>
      </>
    );
  };

  // Catalog picker inside job form
  const CatalogPicker=({onSelect})=>{
    const [catSearch,setCatSearch]=useState("");
    const [selCat,setSelCat]=useState("all");
    const cats=["all",...new Set((S.catalog||[]).map(i=>i.category).filter(Boolean))];
    const filtered=(S.catalog||[]).filter(i=>{
      const matchCat = selCat==="all" || i.category===selCat;
      const matchSearch = !catSearch || i.name.toLowerCase().includes(catSearch.toLowerCase());
      return matchCat && matchSearch;
    });
    if((S.catalog||[]).length===0) return(
      <div style={{textAlign:"center",padding:"16px",color:C.mu,fontSize:12}}>
        {S.lang==="ar"?"الكتالوج فارغ — اذهب لصفحة الكتالوج لإضافة مواد":"Catalog empty — go to Catalog page to add items"}
      </div>
    );
    return(
      <div style={{background:C.bg,borderRadius:10,padding:12,marginBottom:12}}>
        <p style={{fontWeight:700,fontSize:12,color:C.mu,margin:"0 0 8px"}}>📦 {t.addFromCatalog}</p>
        <input value={catSearch} onChange={e=>setCatSearch(e.target.value)} placeholder={t.catalogSearch} style={{...iS,fontSize:12,marginBottom:8}}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setSelCat(c)} style={{padding:"3px 10px",borderRadius:16,border:`1px solid ${selCat===c?C.acc:C.bdr}`,background:selCat===c?`${C.acc}15`:"#fff",color:selCat===c?C.accD:C.mu,fontSize:11,fontWeight:selCat===c?700:400,cursor:"pointer"}}>
              {c==="all"?(S.lang==="ar"?"الكل":"All"):c}
            </button>
          ))}
        </div>
        <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
          {filtered.map(item=>(
            <button key={item.id} onClick={()=>onSelect(item)}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:7,border:`1px solid ${C.bdr}`,background:"#fff",cursor:"pointer",textAlign:dir==="rtl"?"right":"left"}}>
              <span style={{fontSize:12,fontWeight:600,color:C.tx}}>{item.name} <span style={{color:C.li,fontWeight:400}}>({item.unit})</span></span>
              <span style={{fontSize:12,fontWeight:700,color:C.acc,flexShrink:0}}>{fmtM(item.unit_price,sym)}</span>
            </button>
          ))}
          {filtered.length===0&&<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"8px 0"}}>{t.noResults}</p>}
        </div>
      </div>
    );
  };

  const JobForm=({init,onSave,onClose})=>{
    const [f,sf]=useState(init||{customer_id:"",title:"",scheduled_at:"",labor_hours:"",labor_rate:"",notes:"",materials:[]});
    const [mat,smat]=useState({name:"",qty:"1",unit_price:"",unit:"قطعة"});
    const [showCatalog,setShowCatalog]=useState(false);
    const [addingCust,setAddingCust]=useState(false);
    const lT=(Number(f.labor_hours)||0)*(Number(f.labor_rate)||0);
    const mT=(f.materials||[]).reduce((s,m)=>s+(m.qty||0)*(m.unit_price||0),0);
    const taxA=(lT+mT)*(S.profile.taxRate||0)/100;

    if(addingCust) return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <button onClick={()=>setAddingCust(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.acc,fontWeight:700,fontSize:13}}>← {t.back}</button>
          <span style={{fontWeight:700,fontSize:14,color:C.tx}}>{t.newCustomer}</span>
        </div>
        <CustForm onSave={(d)=>{addCust(d);setAddingCust(false);}} onClose={()=>setAddingCust(false)}/>
      </div>
    );

    return(
      <>
        <Fld label={t.customers+" *"}>
          <div style={{display:"flex",gap:7}}>
            <select value={f.customer_id} onChange={e=>sf(p=>({...p,customer_id:e.target.value}))} style={{...iS,flex:1,color:f.customer_id?C.tx:C.li}}>
              <option value="">{t.selectCustomer}</option>
              {S.customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
            <button onClick={()=>setAddingCust(true)} style={{padding:"0 12px",borderRadius:8,border:`1.5px solid ${C.acc}`,background:`${C.acc}10`,color:C.acc,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>+ {S.lang==="ar"?"جديد":"New"}</button>
          </div>
        </Fld>
        <Fld label={t.jobTitle+" *"}><input value={f.title} onChange={e=>sf(p=>({...p,title:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"مثال: تمديد كهربائي للمطبخ":"e.g. Kitchen electrical work"}/></Fld>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          <Fld label={t.scheduledAt} half><input value={f.scheduled_at} onChange={e=>sf(p=>({...p,scheduled_at:e.target.value}))} type="datetime-local" style={iS}/></Fld>
          <Fld label={`${t.laborRate} (${sym})`} half><input value={f.labor_rate} onChange={e=>sf(p=>({...p,labor_rate:e.target.value}))} type="number" style={iS} placeholder="0"/></Fld>
          <Fld label={t.laborHours} half><input value={f.labor_hours} onChange={e=>sf(p=>({...p,labor_hours:e.target.value}))} type="number" style={iS} placeholder="0"/></Fld>
        </div>
        <Fld label={t.notes}><textarea value={f.notes} onChange={e=>sf(p=>({...p,notes:e.target.value}))} style={{...iS,resize:"none"}} rows={2}/></Fld>

        {/* Materials section */}
        <div style={{background:C.bg,borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontWeight:700,fontSize:12,color:C.mu,margin:0}}>{t.materials} ({(f.materials||[]).length})</p>
            <button onClick={()=>setShowCatalog(p=>!p)} style={{padding:"4px 10px",borderRadius:16,border:`1.5px solid ${C.pu}`,background:showCatalog?`${C.pu}15`:"#fff",color:C.pu,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {showCatalog?"✕":"📦"} {t.catalog}
            </button>
          </div>

          {showCatalog&&<CatalogPicker onSelect={item=>{
            sf(p=>({...p,materials:[...(p.materials||[]),{id:uid(),name:item.name,qty:1,unit_price:item.unit_price,unit:item.unit}]}));
            setShowCatalog(false);
          }}/>}

          {(f.materials||[]).map((m,i)=>(
            <div key={m.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",marginBottom:4,background:"#fff",borderRadius:7,border:`1px solid ${C.bdr}`}}>
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:12,fontWeight:600,color:C.tx}}>{m.name}</span>
                <span style={{fontSize:11,color:C.mu}}> × {m.qty} {m.unit} = </span>
                <span style={{fontSize:12,fontWeight:700,color:C.acc}}>{fmtM(m.qty*m.unit_price,sym)}</span>
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                <input type="number" value={m.qty} onChange={e=>{const nq=Number(e.target.value)||1;sf(p=>({...p,materials:p.materials.map((x,j)=>j===i?{...x,qty:nq}:x)}));}}
                  style={{width:48,padding:"3px 5px",borderRadius:5,border:`1px solid ${C.bdr}`,fontSize:12,textAlign:"center"}}/>
                <button onClick={()=>sf(p=>({...p,materials:p.materials.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:C.er,fontSize:16,lineHeight:1}}>×</button>
              </div>
            </div>
          ))}

          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:7,marginTop:8}}>
            <input value={mat.name} onChange={e=>smat(p=>({...p,name:e.target.value}))} placeholder={t.materialName} style={{...iS,fontSize:12}}/>
            <input value={mat.qty} onChange={e=>smat(p=>({...p,qty:e.target.value}))} type="number" placeholder={t.qty} style={{...iS,fontSize:12}}/>
            <input value={mat.unit_price} onChange={e=>smat(p=>({...p,unit_price:e.target.value}))} type="number" placeholder={t.unitPrice} style={{...iS,fontSize:12}}/>
          </div>
          <button onClick={()=>{if(!mat.name||!mat.unit_price)return;sf(p=>({...p,materials:[...(p.materials||[]),{...mat,qty:Number(mat.qty),unit_price:Number(mat.unit_price),id:uid()}]}));smat({name:"",qty:"1",unit_price:"",unit:"قطعة"});}}
            style={{marginTop:7,width:"100%",background:"#fff",color:C.acc,border:`1.5px dashed ${C.acc}`,borderRadius:7,padding:"6px 0",cursor:"pointer",fontWeight:600,fontSize:12}}>
            {t.addMaterial}
          </button>
        </div>

        {(lT+mT)>0&&(
          <div style={{background:C.sb,borderRadius:10,padding:"11px 13px",marginBottom:12}}>
            <IR label={t.laborTotal} value={fmtM(lT,sym)}/>
            <IR label={t.matsTotal} value={fmtM(mT,sym)}/>
            {S.profile.taxRate>0&&<IR label={`${t.tax} ${S.profile.taxRate}%`} value={fmtM(taxA,sym)}/>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"1px solid #334155"}}>
              <span style={{color:C.acc,fontWeight:700,fontSize:13}}>{t.grandTotal}</span>
              <span style={{color:C.acc,fontWeight:900,fontSize:17}}>{fmtM(lT+mT+taxA,sym)}</span>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:7,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.mu,fontWeight:600,cursor:"pointer",fontSize:13}}>{t.cancel}</button>
          <button onClick={()=>f.customer_id&&f.title&&onSave(f)} disabled={!f.customer_id||!f.title}
            style={{flex:2,padding:"9px 0",borderRadius:7,border:"none",background:!f.customer_id||!f.title?C.bg:`linear-gradient(135deg,${C.acc},${C.accD})`,color:!f.customer_id||!f.title?C.mu:"#fff",fontWeight:700,cursor:!f.customer_id||!f.title?"not-allowed":"pointer",fontSize:13}}>
            ⚡ {t.save}
          </button>
        </div>
      </>
    );
  };

  // ── SCREENS ──────────────────────────────────────────────
  const Dashboard=()=>(
    <div style={{padding:"16px"}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontSize:17,fontWeight:900,color:C.tx,margin:"0 0 2px"}}>{t.welcome}{S.profile.fullName?`، ${S.profile.fullName}`:""}</h2>
        <p style={{color:C.mu,fontSize:12,margin:0}}>{S.profile.trade&&TRADES[S.profile.trade]?`${TRADES[S.profile.trade].icon} ${TRADES[S.profile.trade][S.lang]} · `:""}{fmtD(new Date().toISOString())}</p>
      </div>
      {S.invoices.filter(i=>i.status==="overdue").length>0&&(
        <div style={{background:"#FEF2F2",border:`1px solid ${C.er}40`,borderRadius:9,padding:"9px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span>⚠️</span>
          <p style={{fontWeight:700,color:C.er,margin:0,fontSize:12,flex:1}}>{S.lang==="ar"?`${S.invoices.filter(i=>i.status==="overdue").length} فاتورة متأخرة — ${fmtM(S.invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.total,0),sym)}`:`${S.invoices.filter(i=>i.status==="overdue").length} overdue invoices`}</p>
          <button onClick={()=>nav("invoices")} style={{background:C.er,color:"#fff",border:"none",borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.invoices}</button>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:9,marginBottom:14}}>
        <Stat label={t.totalPending} value={fmtM(pAmt,sym)} col={C.wa} icon="💰" sub={`${S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").length} ${t.invoices}`}/>
        <Stat label={t.totalPaid} value={fmtM(cAmt,sym)} col={C.ok} icon="✅"/>
        <Stat label={t.profit} value={fmtM(cAmt-totalExp,sym)} col={C.pu} icon="📈" sub={`${t.totalExpenses}: ${fmtM(totalExp,sym)}`}/>
        <Stat label={t.activeJobs} value={aJobs.length} col={C.acc} icon="⚙"/>
        <Stat label={t.totalCustomers} value={S.customers.length} col="#0EA5E9" icon="◉"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12,marginBottom:12}}>
        <Card title={t.todayJobs} action={<button onClick={()=>nav("jobs")} style={{background:"none",border:"none",color:C.acc,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.allJobs} →</button>}>
          {tJobs.length===0?<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"12px 0"}}>📅 {S.lang==="ar"?"لا مهام اليوم":"No jobs today"}</p>
            :tJobs.map(j=><JRow key={j.id} job={j} onClick={()=>nav("job-detail",j.id)}/>)}
        </Card>
        <Card title={t.pendingInvoices}>
          {S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").length===0
            ?<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"12px 0"}}>✅ {S.lang==="ar"?"لا فواتير معلقة":"No pending"}</p>
            :S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").map(i=><IRow key={i.id} inv={i} onClick={()=>nav("invoice-detail",i.id)}/>)}
        </Card>
      </div>
      <Card title={`🤖 ${t.ai} ${aiServerOk?"⚡ Gemini":"— "+t.aiApiKeyInfo}`} action={<button onClick={()=>nav("ai")} style={{background:"none",border:"none",color:C.ai,fontSize:11,fontWeight:700,cursor:"pointer"}}>{S.lang==="ar"?"فتح →":"Open →"}</button>}>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {QP.slice(0,4).map((p,i)=>(
            <button key={i} onClick={()=>{nav("ai");setTimeout(()=>sendAI(p),100);}}
              style={{padding:"5px 10px",borderRadius:16,border:`1.5px solid ${C.ai}30`,background:`${C.ai}08`,color:C.ai,fontSize:11,fontWeight:600,cursor:"pointer"}}>
              {p.length>26?p.slice(0,26)+"...":p}
            </button>
          ))}
        </div>
      </Card>
      <Card title={`📝 ${t.quickNote}`}><QuickNoteBox/></Card>
    </div>
  );

  const QuickNoteBox=()=>{
    const [v,sv]=useState("");
    return(
      <div>
        <textarea value={v} onChange={e=>sv(e.target.value)} rows={2}
          placeholder={S.lang==="ar"?"ملاحظة سريعة...":"Quick note..."}
          style={{...iS,resize:"none",marginBottom:7,fontSize:12}}/>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>{if(!v.trim())return;setS(p=>({...p,notes:[{id:uid(),text:v,ts:new Date().toISOString()},...(p.notes||[])]}));sv("");showToast("📝 "+t.dataSaved);}}
            style={{padding:"5px 12px",borderRadius:6,border:"none",background:C.acc,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>{t.saveNote}</button>
          {(S.notes||[]).slice(0,2).map(n=>(
            <div key={n.id} style={{background:C.bg,borderRadius:6,padding:"4px 9px",fontSize:11,color:C.tx,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:`1px solid ${C.bdr}`}}>{n.text}</div>
          ))}
        </div>
      </div>
    );
  };

  const AIScr=()=>{
    const fmt=(txt)=>txt.split("\n").map((line,i)=>{
      if(/^\*\*(.+)\*\*$/.test(line))return<p key={i} style={{fontWeight:700,color:C.tx,fontSize:13,margin:"3px 0"}}>{line.replace(/\*\*/g,"")}</p>;
      if(line.startsWith("• ")||line.startsWith("- "))return<div key={i} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:C.ai,flexShrink:0}}>•</span><span style={{fontSize:13,color:C.tx,lineHeight:1.6}}>{line.slice(2).replace(/\*\*(.*?)\*\*/g,"$1")}</span></div>;
      if(/^\d+\./.test(line))return<div key={i} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:C.ai,fontWeight:700,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span><span style={{fontSize:13,color:C.tx,lineHeight:1.6}}>{line.replace(/^\d+\.\s*/,"").replace(/\*\*(.*?)\*\*/g,"$1")}</span></div>;
      if(line.startsWith("---"))return<hr key={i} style={{border:"none",borderTop:`1px solid ${C.bdr}`,margin:"6px 0"}}/>;
      if(line==="")return<div key={i} style={{height:4}}/>;
      return<p key={i} style={{fontSize:13,color:C.tx,lineHeight:1.7,margin:"1px 0"}}>{line.replace(/\*\*(.*?)\*\*/g,"$1")}</p>;
    });
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${C.ai},${C.aiD})`,padding:"13px 15px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <h2 style={{color:"#fff",fontWeight:800,fontSize:14,margin:"0 0 2px"}}>{t.aiTitle}</h2>
              <p style={{color:"rgba(255,255,255,0.75)",fontSize:11,margin:0}}>{aiServerOk?"⚡ Gemini AI":"🤖 "+t.aiSubtitle}</p>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setAiMsgs([{role:"assistant",content:S.lang==="ar"?"مرحباً! كيف يمكنني مساعدتك؟":"Hi! How can I help?",ts:new Date().toISOString()}])}
                style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontWeight:600}}>{t.aiClear}</button>
              <button onClick={()=>nav("settings")}
                style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer"}}>⚙</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
            {QP.map((p,i)=>(
              <button key={i} onClick={()=>sendAI(p)} style={{padding:"4px 9px",borderRadius:14,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:10,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {p.length>20?p.slice(0,20)+"...":p}
              </button>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 15px",display:"flex",flexDirection:"column",gap:10}}>
          {aiMsgs.map((msg,i)=>(
            <div key={i} style={{display:"flex",gap:7,flexDirection:msg.role==="user"?(dir==="rtl"?"row":"row-reverse"):(dir==="rtl"?"row-reverse":"row"),alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:7,background:msg.role==="user"?`linear-gradient(135deg,${C.acc},${C.accD})`:`linear-gradient(135deg,${C.ai},${C.aiD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                {msg.role==="user"?"👤":"🤖"}
              </div>
              <div style={{maxWidth:"80%",background:msg.role==="user"?`${C.acc}10`:C.card,border:`1px solid ${msg.role==="user"?C.acc+"30":C.bdr}`,borderRadius:msg.role==="user"?(dir==="rtl"?"13px 3px 13px 13px":"3px 13px 13px 13px"):(dir==="rtl"?"3px 13px 13px 13px":"13px 3px 13px 13px"),padding:"9px 12px"}}>
                {fmt(msg.content)}
                <p style={{fontSize:9,color:C.li,margin:"4px 0 0",textAlign:"end"}}>{fmtT(msg.ts)}</p>
              </div>
            </div>
          ))}
          {aiLoad&&(
            <div style={{display:"flex",gap:7,alignItems:"flex-start",flexDirection:dir==="rtl"?"row-reverse":"row"}}>
              <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${C.ai},${C.aiD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🤖</div>
              <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:"13px 3px 13px 13px",padding:"10px 13px",display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.ai,animation:`tp_b 1.2s ${i*0.2}s infinite`}}/>)}
                <span style={{color:C.mu,fontSize:11,marginInlineStart:5}}>{t.aiThinking}</span>
              </div>
            </div>
          )}
          <div ref={aiRef}/>
        </div>
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.bdr}`,background:C.card,flexShrink:0}}>
          {!aiServerOk&&(
            <div style={{background:`${C.ai}10`,border:`1px solid ${C.ai}25`,borderRadius:8,padding:"8px 11px",marginBottom:8,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <span style={{fontSize:13}}>💡</span>
              <p style={{color:C.ai,fontSize:11,margin:0,flex:1}}>{S.lang==="ar"?"يعمل حالياً بالمساعد المحلي — لتفعيل Gemini شغّل السيرفر مع مفتاح API":"Running on local assistant — start the server with a Gemini API key for advanced AI"}</p>
            </div>
          )}
          {/* FIXED AI INPUT — uses ref to avoid re-render loop */}
          <div style={{display:"flex",gap:7}}>
            <input
              ref={aiInputRef}
              value={aiInput}
              onChange={e=>setAiInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI();}}}
              placeholder={t.aiPlaceholder}
              disabled={aiLoad}
              style={{...iS,flex:1,borderRadius:9,padding:"9px 12px",fontSize:13}}
            />
            <button onClick={()=>sendAI()} disabled={aiLoad||!aiInput.trim()}
              style={{padding:"9px 14px",borderRadius:9,border:"none",background:aiLoad||!aiInput.trim()?C.bg:`linear-gradient(135deg,${C.ai},${C.aiD})`,color:aiLoad||!aiInput.trim()?C.li:"#fff",fontWeight:700,fontSize:13,cursor:aiLoad||!aiInput.trim()?"not-allowed":"pointer",flexShrink:0}}>
              ↑
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Jobs=()=>{
    const fl=jf==="all"?S.jobs:S.jobs.filter(j=>j.status===jf);
    return(
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
          <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.jobs} ({S.jobs.length})</h2>
          <div style={{display:"flex",gap:7}}>
            <Btn label={t.exportExcel} col={C.ok} sm icon="📊" onClick={()=>exportSmartCSV(S.jobs,"jobs",t,sym,S.customers,S.jobs)}/>
            <Btn label={t.newJob} onClick={()=>setModal("add-job")} icon="+"/>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {["all","scheduled","in_progress","done","invoiced"].map(f=>(
            <button key={f} onClick={()=>setJf(f)} style={{padding:"5px 12px",borderRadius:16,cursor:"pointer",fontWeight:jf===f?700:400,fontSize:11,background:jf===f?C.sb:C.card,color:jf===f?"#fff":C.mu,border:`1px solid ${jf===f?C.sb:C.bdr}`}}>
              {f==="all"?(S.lang==="ar"?"الكل":"All"):t[f]}
            </button>
          ))}
        </div>
        {fl.length===0?<Emp icon="⚙" label={t.noJobs}/>:fl.map(j=><JRow key={j.id} job={j} onClick={()=>nav("job-detail",j.id)}/>)}
      </div>
    );
  };

  const JobDetail=()=>{
    if(!selJ)return null;
    const cu=S.customers.find(c=>c.id===selJ.customer_id);
    const tot=jTotal(selJ);const taxA=tot*(S.profile.taxRate||0)/100;
    const ei=S.invoices.find(i=>i.job_id===selJ.id);
    const wa=cu?`https://wa.me/${cu.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`${S.lang==="ar"?"السلام عليكم":"Hello"} ${cu.name},\n${S.lang==="ar"?"تم الانتهاء من:":"Completed:"} ${selJ.title}\n${S.lang==="ar"?"الإجمالي:":"Total:"} ${fmtM(tot,sym)} 🙏`)}`:"#";
    return(
      <div style={{padding:"16px",maxWidth:780}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:7}}>
          <div><h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 6px"}}>{selJ.title}</h2><Bdg st={selJ.status} map={SC}/></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Btn label={t.edit} onClick={()=>setModal("edit-job")} out col={C.mu} sm/>
            <Btn label="📷" sm col="#0EA5E9" onClick={()=>fileRef.current?.click()}/>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>e.target.files[0]&&addPhoto(selJ.id,e.target.files[0])}/>
            <Btn label="🤖" sm col={C.ai} onClick={()=>{nav("ai");setTimeout(()=>sendAI((S.lang==="ar"?"حلل المهمة وأعطني نصائح: ":"Analyze job & give tips: ")+selJ.title+" — "+fmtM(tot,sym)),100);}}/>
            <button onClick={()=>setCdel({type:"job",id:selJ.id})} style={{padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.er}`,background:"transparent",color:C.er,fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:11}}>
          <Card title={t.jobDetails}>
            <IR label={t.customers} value={cu?.name||"—"}/>
            <IR label={t.phone} value={cu?.phone||"—"}/>
            {cu?.address&&<IR label={t.address} value={cu.address}/>}
            <IR label={t.scheduledAt} value={selJ.scheduled_at?fmtD(selJ.scheduled_at)+" "+fmtT(selJ.scheduled_at):"—"}/>
            {selJ.notes&&<IR label={t.notes} value={selJ.notes}/>}
          </Card>
          <Card title={S.lang==="ar"?"الحساب":"Summary"}>
            <IR label={`${t.laborHours} (${selJ.labor_hours||0}h × ${fmtM(selJ.labor_rate||0,sym)})`} value={fmtM((selJ.labor_hours||0)*(selJ.labor_rate||0),sym)}/>
            {(selJ.materials||[]).map((m,i)=>(
              <IR key={i} label={`${m.name} × ${m.qty} ${m.unit||""}`} value={fmtM(m.qty*m.unit_price,sym)}/>
            ))}
            {S.profile.taxRate>0&&<IR label={`${t.tax} ${S.profile.taxRate}%`} value={fmtM(taxA,sym)}/>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:9,background:C.sb,borderRadius:7,padding:"10px 12px"}}>
              <span style={{color:C.acc,fontWeight:700,fontSize:13}}>{t.grandTotal}</span>
              <span style={{color:C.acc,fontWeight:900,fontSize:17}}>{fmtM(tot+taxA,sym)}</span>
            </div>
          </Card>
        </div>
        {(selJ.photos||[]).length>0&&(
          <Card title={`📷 ${t.photos} (${selJ.photos.length})`}>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {(selJ.photos||[]).map(ph=>(
                <div key={ph.id} style={{position:"relative"}}>
                  <img src={ph.url} alt="" style={{width:72,height:72,objectFit:"cover",borderRadius:7,cursor:"pointer"}} onClick={()=>setPhotoMdl(ph.url)}/>
                  <button onClick={()=>setS(p=>({...p,jobs:p.jobs.map(j=>j.id===selJ.id?{...j,photos:(j.photos||[]).filter(x=>x.id!==ph.id)}:j)}))}
                    style={{position:"absolute",top:-5,insetInlineEnd:-5,background:C.er,color:"#fff",border:"none",borderRadius:"50%",width:16,height:16,cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              ))}
              <button onClick={()=>fileRef.current?.click()} style={{width:72,height:72,borderRadius:7,border:`2px dashed ${C.bdr}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.li}}>+</button>
            </div>
          </Card>
        )}
        {selJ.status!=="invoiced"&&(
          <Card title={t.changeStatus}>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {["scheduled","in_progress","done"].map(s=>(
                <button key={s} onClick={()=>updJStat(selJ.id,s)} disabled={selJ.status===s}
                  style={{padding:"7px 13px",borderRadius:7,cursor:selJ.status===s?"default":"pointer",border:`1.5px solid ${SC[s].dot}`,background:selJ.status===s?SC[s].dot:"transparent",color:selJ.status===s?"#fff":SC[s].text,fontWeight:700,fontSize:12}}>
                  {t[s]}
                </button>
              ))}
            </div>
          </Card>
        )}
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {(selJ.status==="done"||selJ.status==="invoiced")&&<Btn label={ei?t.viewInvoice:t.createInvoice} onClick={()=>ei?nav("invoice-detail",ei.id):mkInv(selJ.id)} col={C.pu} icon="📋"/>}
          <a href={wa} target="_blank" rel="noreferrer" style={{padding:"10px 15px",borderRadius:9,background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>💬 {t.sendWhatsApp}</a>
        </div>
      </div>
    );
  };

  const Customers=()=>(
    <div style={{padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
        <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.customers} ({S.customers.length})</h2>
        <div style={{display:"flex",gap:7}}>
          <Btn label={t.exportExcel} col={C.ok} sm icon="📊" onClick={()=>exportSmartCSV(S.customers,"customers",t,sym,S.customers,S.jobs)}/>
          <Btn label={t.newCustomer} onClick={()=>setModal("add-customer")} icon="+"/>
        </div>
      </div>
      {S.customers.length===0?<Emp icon="◉" label={t.noCustomers}/>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:9}}>
          {S.customers.map(c=>{
            const cj=S.jobs.filter(j=>j.customer_id===c.id);
            const cp=S.invoices.filter(i=>S.jobs.find(j=>j.id===i.job_id&&j.customer_id===c.id)&&i.status==="paid").reduce((s,i)=>s+i.total,0);
            const lj=[...cj].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
            return(
              <div key={c.id} onClick={()=>nav("customer-detail",c.id)} style={{background:C.card,borderRadius:11,border:`1px solid ${C.bdr}`,padding:"13px 15px",cursor:"pointer",transition:"box-shadow 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:700,fontSize:13,color:C.tx,margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</p>
                    <p style={{color:C.mu,fontSize:12,margin:"0 0 2px"}}>📞 {c.phone}</p>
                    {c.address&&<p style={{color:C.li,fontSize:11,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {c.address}</p>}
                  </div>
                  <div style={{background:C.bg,borderRadius:7,padding:"5px 9px",textAlign:"center",flexShrink:0,marginInlineStart:8}}>
                    <p style={{fontSize:15,fontWeight:900,color:C.tx,margin:0}}>{cj.length}</p>
                    <p style={{fontSize:9,color:C.li,margin:0}}>{t.jobs}</p>
                  </div>
                </div>
                <div style={{marginTop:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:C.li}}>{lj?t.lastActivity+": "+fmtD(lj.created_at):""}</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.ok}}>{fmtM(cp,sym)}</span>
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );

  const CustDetail=()=>{
    if(!selC)return null;
    const cj=S.jobs.filter(j=>j.customer_id===selC.id);
    const cp=S.invoices.filter(i=>S.jobs.find(j=>j.id===i.job_id&&j.customer_id===selC.id)&&i.status==="paid").reduce((s,i)=>s+i.total,0);
    return(
      <div style={{padding:"16px",maxWidth:760}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:7}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 5px"}}>{selC.name}</h2>
            <span style={{background:`${C.pu}18`,color:C.pu,fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:16}}>{cj.length} {t.jobs}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <Btn label={t.edit} onClick={()=>setModal("edit-customer")} out col={C.mu} sm/>
            <Btn label="🤖" sm col={C.ai} onClick={()=>{nav("ai");setTimeout(()=>sendAI((S.lang==="ar"?"تقرير العميل: ":"Client report: ")+selC.name+" — "+fmtM(cp,sym)),100);}}/>
            <button onClick={()=>setCdel({type:"customer",id:selC.id})} style={{padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.er}`,background:"transparent",color:C.er,fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:11,marginBottom:11}}>
          <Card title={t.customerDetails}>
            <IR label={t.name} value={selC.name}/>
            <IR label={t.phone} value={selC.phone}/>
            {selC.address&&<IR label={t.address} value={selC.address}/>}
            {selC.notes&&<IR label={t.notes} value={selC.notes}/>}
          </Card>
          <Card title="Stats">
            <IR label={t.totalJobs} value={cj.length}/>
            <IR label={t.completedJobs} value={cj.filter(j=>j.status==="done"||j.status==="invoiced").length}/>
            <IR label={S.lang==="ar"?"إجمالي المدفوع":"Total Paid"} value={fmtM(cp,sym)} bold acc/>
          </Card>
        </div>
        <Card title={t.jobHistory}>
          {cj.length===0?<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"12px 0"}}>{t.noJobs}</p>
            :cj.map(j=><JRow key={j.id} job={j} onClick={()=>nav("job-detail",j.id)}/>)}
        </Card>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <a href={`tel:${selC.phone}`} style={{padding:"9px 14px",borderRadius:8,background:"#EFF6FF",color:"#1D4ED8",fontWeight:700,fontSize:13,textDecoration:"none"}}>📞 {t.call}</a>
          <a href={`https://wa.me/${selC.phone?.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:8,background:"#F0FDF4",color:"#166534",fontWeight:700,fontSize:13,textDecoration:"none"}}>💬 WhatsApp</a>
          <Btn label={t.newJob} onClick={()=>{setModal("add-job");}} col={C.acc} sm/>
        </div>
      </div>
    );
  };

  const Quotes=()=>(
    <div style={{padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
        <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.quotes} ({S.quotes.length})</h2>
        <Btn label={t.newQuote} onClick={()=>setModal("add-quote")} icon="+"/>
      </div>
      {S.quotes.length===0?<Emp icon="📝" label={t.noQuotes}/>
        :S.quotes.map(q=>{
          const cu=S.customers.find(c=>c.id===q.customer_id);
          const qc=QC[q.status]||QC.draft;
          return(
            <div key={q.id} onClick={()=>nav("quote-detail",q.id)} style={{background:C.card,borderRadius:10,border:`1px solid ${C.bdr}`,padding:"11px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"box-shadow 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{width:8,height:8,borderRadius:"50%",background:qc.dot,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:600,fontSize:13,color:C.tx,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.title||t.newQuote}</p>
                <p style={{fontSize:11,color:C.mu,margin:0}}>{cu?.name||"—"} · {fmtD(q.created_at)}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                <span style={{background:qc.bg,color:qc.text,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:18}}>{t["quote"+q.status.charAt(0).toUpperCase()+q.status.slice(1)]||q.status}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.tx}}>{fmtM(q.total||0,sym)}</span>
              </div>
            </div>
          );
        })}
    </div>
  );

  const QuoteDetail=()=>{
    if(!selQ)return null;
    const cu=S.customers.find(c=>c.id===selQ.customer_id);
    const wa=cu?`https://wa.me/${cu.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(S.lang==="ar"?`السلام عليكم ${cu.name},\nإليكم عرض سعر:\n${selQ.title||""}\nالإجمالي: ${fmtM(selQ.total||0,sym)}\nصالح حتى: ${fmtD(selQ.valid_until)}\n\nنرجو موافقتكم 🙏`:`Hello ${cu.name},\nPlease find our quote:\n${selQ.title||""}\nTotal: ${fmtM(selQ.total||0,sym)}\nValid until: ${fmtD(selQ.valid_until)}\n\nWaiting for your approval 🙏`)}`:"#";
    return(
      <div style={{padding:"16px",maxWidth:700}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:7}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 6px"}}>{selQ.title||t.newQuote}</h2>
            <span style={{background:QC[selQ.status]?.bg||"#eee",color:QC[selQ.status]?.text||"#555",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:18}}>{t["quote"+selQ.status?.charAt(0).toUpperCase()+selQ.status?.slice(1)]||selQ.status}</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {selQ.status!=="accepted"&&<Btn label={t.convertToInvoice} col={C.ok} sm icon="📋" onClick={()=>convertQtoInv(selQ.id)}/>}
            <button onClick={()=>{setS(p=>({...p,quotes:p.quotes.filter(x=>x.id!==selQ.id)}));nav("quotes");showToast("🗑");}}
              style={{padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.er}`,background:"transparent",color:C.er,fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑</button>
          </div>
        </div>
        <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.bdr}`,padding:"18px",marginBottom:11,boxShadow:"0 4px 20px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,paddingBottom:12,borderBottom:`2px solid ${C.sb}`}}>
            <div>
              <p style={{fontWeight:900,fontSize:15,color:C.sb,margin:"0 0 2px"}}>{S.profile.businessName||"TradePro"}</p>
              <p style={{color:C.mu,fontSize:11,margin:0}}>{S.lang==="ar"?"عرض سعر":"Price Quote"}</p>
            </div>
            <div style={{textAlign:dir==="rtl"?"left":"right"}}>
              <p style={{fontWeight:700,fontSize:12,color:C.sb,margin:"0 0 2px"}}>{fmtD(selQ.created_at)}</p>
              {selQ.valid_until&&<p style={{color:C.er,fontSize:11,margin:0}}>{S.lang==="ar"?"صالح حتى:":"Valid:"} {fmtD(selQ.valid_until)}</p>}
            </div>
          </div>
          {cu&&<div style={{marginBottom:12}}>
            <p style={{color:C.li,fontSize:9,fontWeight:700,margin:"0 0 4px",letterSpacing:1}}>{t.customers.toUpperCase()}</p>
            <p style={{fontWeight:700,color:C.tx,margin:"0 0 2px",fontSize:13}}>{cu.name}</p>
            <p style={{color:C.mu,fontSize:12,margin:0}}>📞 {cu.phone}</p>
          </div>}
          {selQ.description&&<div style={{background:C.bg,borderRadius:7,padding:"8px 10px",marginBottom:12}}>
            <p style={{fontSize:12,color:C.tx,margin:0}}>{selQ.description}</p>
          </div>}
          {(selQ.items||[]).length>0&&(
            <div style={{marginBottom:12}}>
              <p style={{color:C.li,fontSize:9,fontWeight:700,margin:"0 0 6px",letterSpacing:1}}>{t.materials.toUpperCase()}</p>
              {(selQ.items||[]).map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.bdr}`}}>
                  <span style={{fontSize:12,color:C.tx,fontWeight:600}}>{item.name} <span style={{color:C.mu,fontWeight:400}}>× {item.qty} {item.unit||""}</span></span>
                  <span style={{fontWeight:700,fontSize:12,color:C.acc}}>{fmtM(item.qty*(item.unit_price||0),sym)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,background:C.sb,borderRadius:8,padding:"10px 12px"}}>
            <span style={{color:C.acc,fontWeight:700,fontSize:13}}>{t.total}</span>
            <span style={{color:C.acc,fontWeight:900,fontSize:17}}>{fmtM(selQ.total||0,sym)}</span>
          </div>
          {selQ.notes&&<p style={{color:C.mu,fontSize:11,marginTop:8,fontStyle:"italic"}}>{selQ.notes}</p>}
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {selQ.status==="draft"&&(
            <Btn label={t.quoteSent} col={C.acc} sm onClick={()=>{setS(p=>({...p,quotes:p.quotes.map(x=>x.id===selQ.id?{...x,status:"sent"}:x)}));showToast("✅ "+t.quoteSent);}}/>
          )}
          <a href={wa} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:9,background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>💬 {t.sendWhatsApp}</a>
          <Btn label={t.copyLink} col={C.pu} sm onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}/?quote=${selQ.id}`).then(()=>showToast("🔗 "+t.linkCopied));}}/>
        </div>
      </div>
    );
  };

  const Invoices=()=>(
    <div style={{padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
        <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.invoices} ({S.invoices.length})</h2>
        <Btn label={t.exportExcel} col={C.ok} sm icon="📊" onClick={()=>exportSmartCSV(S.invoices,"invoices",t,sym,S.customers,S.jobs)}/>
      </div>
      {pAmt>0&&(
        <div style={{background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:9,padding:"10px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
          <span style={{fontSize:16}}>💰</span>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,color:"#92400E",margin:0,fontSize:12}}>{t.totalPending}: {fmtM(pAmt,sym)}</p>
            <p style={{color:"#B45309",fontSize:11,margin:0}}>{S.invoices.filter(i=>i.status==="sent"||i.status==="overdue").length} {S.lang==="ar"?"معلقة":"pending"}</p>
          </div>
          <Btn label="🤖 AI" sm col={C.ai} onClick={()=>{nav("ai");setTimeout(()=>sendAI(S.lang==="ar"?"اكتب رسائل واتساب لتذكير العملاء بالفواتير المعلقة":"Write WhatsApp reminders for pending invoices"),100);}}/>
        </div>
      )}
      {S.invoices.length===0?<Emp icon="◧" label={t.noInvoices}/>:S.invoices.map(inv=><IRow key={inv.id} inv={inv} onClick={()=>nav("invoice-detail",inv.id)}/>)}
    </div>
  );

  const InvDetail=()=>{
    if(!selI)return null;
    const job=S.jobs.find(j=>j.id===selI.job_id);
    const cu=S.customers.find(c=>c.id===job?.customer_id)||(selI.from_quote?S.customers.find(c=>c.id===S.quotes.find(q=>q.id===selI.from_quote)?.customer_id):null);
    const iSym=(CURRENCIES.find(c=>c.code===selI.currency)||cur).symbol;
    const wa=cu?`https://wa.me/${cu.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`${S.lang==="ar"?"السلام عليكم":"Hello"} ${cu.name},\n\n${t.invoiceNumber}: ${selI.invoice_number}\n${S.lang==="ar"?"الخدمة:":"Service:"} ${job?.title||""}\n${t.total}: ${fmtM(selI.total,iSym)}\n${t.dueDate}: ${fmtD(selI.due_date)}\n\n🙏 ${S.profile.fullName||""}`)}`:"#";
    return(
      <div style={{padding:"16px",maxWidth:740}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:7}}>
          <div><h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 6px"}}>{selI.invoice_number}</h2><Bdg st={selI.status} map={IC}/></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Btn label={t.exportPDF} sm col="#EF4444" icon="📄" onClick={()=>generatePDF(selI,job,cu,S.profile,iSym)}/>
            <Btn label="🤖" sm col={C.ai} onClick={()=>{nav("ai");setTimeout(()=>sendAI((S.lang==="ar"?"ساعدني في متابعة فاتورة: ":"Help follow up invoice: ")+selI.invoice_number+" — "+fmtM(selI.total,iSym)),100);}}/>
          </div>
        </div>
        <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.bdr}`,padding:"20px",marginBottom:11,boxShadow:"0 4px 20px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,paddingBottom:14,borderBottom:`2px solid ${C.sb}`}}>
            <div>
              <p style={{fontWeight:900,fontSize:16,color:C.sb,margin:"0 0 2px"}}>{S.profile.businessName||"TradePro"}</p>
              {S.profile.trade&&TRADES[S.profile.trade]&&<p style={{color:C.mu,fontSize:11,margin:"0 0 2px"}}>{TRADES[S.profile.trade].icon} {TRADES[S.profile.trade][S.lang]}</p>}
              {S.profile.phone&&<p style={{color:C.mu,fontSize:11,margin:0}}>📞 {S.profile.phone}</p>}
            </div>
            <div style={{textAlign:dir==="rtl"?"left":"right"}}>
              <p style={{fontWeight:800,fontSize:14,color:C.sb,margin:"0 0 2px"}}>{selI.invoice_number}</p>
              <p style={{color:C.mu,fontSize:11}}>{fmtD(selI.created_at)}</p>
            </div>
          </div>
          {cu&&<div style={{marginBottom:14}}>
            <p style={{color:C.li,fontSize:9,fontWeight:700,margin:"0 0 4px",letterSpacing:1}}>{t.customers.toUpperCase()}</p>
            <p style={{fontWeight:700,color:C.tx,margin:"0 0 2px",fontSize:13}}>{cu.name}</p>
            <p style={{color:C.mu,fontSize:12,margin:"0 0 2px"}}>📞 {cu.phone}</p>
            {cu.address&&<p style={{color:C.mu,fontSize:11,margin:0}}>📍 {cu.address}</p>}
          </div>}
          {job&&<div style={{background:C.bg,borderRadius:7,padding:"9px 11px",marginBottom:14}}>
            <p style={{color:C.li,fontSize:9,fontWeight:700,margin:"0 0 2px",letterSpacing:1}}>{S.lang==="ar"?"الخدمة":"SERVICE"}</p>
            <p style={{fontWeight:600,color:C.tx,margin:0,fontSize:12}}>{job.title}</p>
          </div>}
          {/* Show materials if from job */}
          {job&&(job.materials||[]).length>0&&(
            <div style={{marginBottom:14}}>
              <p style={{color:C.li,fontSize:9,fontWeight:700,margin:"0 0 6px",letterSpacing:1}}>{t.materials.toUpperCase()}</p>
              {job.materials.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}`}}>
                  <span style={{fontSize:11,color:C.tx}}>{m.name} × {m.qty} {m.unit||""}</span>
                  <span style={{fontWeight:700,fontSize:11,color:C.acc}}>{fmtM(m.qty*m.unit_price,sym)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:10}}>
            {job&&(job.labor_hours||0)>0&&<IR label={`${t.laborHours} (${job.labor_hours}h × ${fmtM(job.labor_rate||0,iSym)})`} value={fmtM((job.labor_hours||0)*(job.labor_rate||0),iSym)}/>}
            <IR label={t.subtotal} value={fmtM(selI.subtotal,iSym)}/>
            {selI.tax_rate>0&&<IR label={`${t.tax} (${selI.tax_rate}%)`} value={fmtM(selI.total-selI.subtotal,iSym)}/>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:9,background:C.sb,borderRadius:8,padding:"11px 13px"}}>
              <span style={{color:C.acc,fontWeight:700,fontSize:13}}>{t.total}</span>
              <span style={{color:C.acc,fontWeight:900,fontSize:19}}>{fmtM(selI.total,iSym)}</span>
            </div>
          </div>
          {selI.due_date&&<p style={{color:C.li,fontSize:11,textAlign:"center",marginTop:7}}>{t.dueDate}: {fmtD(selI.due_date)}</p>}
          {selI.paid_at&&<p style={{color:C.ok,fontSize:11,textAlign:"center",marginTop:3,fontWeight:700}}>✅ {t.paidOn} {fmtD(selI.paid_at)}</p>}
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {selI.status!=="paid"&&<Btn label={t.markPaid} onClick={()=>updInv(selI.id,"paid")} col={C.ok}/>}
          <a href={wa} target="_blank" rel="noreferrer" onClick={()=>selI.status==="draft"&&updInv(selI.id,"sent")}
            style={{padding:"10px 15px",borderRadius:9,background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
            💬 {selI.status==="sent"?t.resendReminder:t.sendWhatsApp}
          </a>
        </div>
      </div>
    );
  };

  const CalendarView=()=>{
    const [wOff,setWOff]=useState(0);
    const today=new Date();
    const wStart=new Date(today);
    wStart.setDate(today.getDate()-today.getDay()+wOff*7);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(wStart);d.setDate(wStart.getDate()+i);return d;});
    const jobsOn=(date)=>S.jobs.filter(j=>j.scheduled_at?.startsWith(date.toISOString().split("T")[0]));
    const isToday=(d)=>d.toISOString().split("T")[0]===today.toISOString().split("T")[0];
    const dayNamesAr=["أح","إث","ث","أر","خم","جم","سب"];
    const dayNamesEn=["Su","Mo","Tu","We","Th","Fr","Sa"];
    const dayNames=S.lang==="ar"?dayNamesAr:dayNamesEn;
    return(
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
          <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.calendar}</h2>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setWOff(p=>p-1)} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${C.bdr}`,background:C.card,cursor:"pointer",fontWeight:700,color:C.mu,fontSize:13}}>←</button>
            <button onClick={()=>setWOff(0)} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${C.bdr}`,background:C.sb,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:11}}>
              {S.lang==="ar"?"هذا الأسبوع":"This Week"}
            </button>
            <button onClick={()=>setWOff(p=>p+1)} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${C.bdr}`,background:C.card,cursor:"pointer",fontWeight:700,color:C.mu,fontSize:13}}>→</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:16}}>
          {days.map((day,i)=>{
            const dj=jobsOn(day);const isTd=isToday(day);
            return(
              <div key={i} style={{background:isTd?`${C.acc}12`:C.card,borderRadius:9,border:`1.5px solid ${isTd?C.acc:C.bdr}`,padding:"7px 5px",minHeight:110}}>
                <p style={{fontSize:10,fontWeight:700,color:isTd?C.acc:C.mu,textAlign:"center",margin:"0 0 3px"}}>{dayNames[day.getDay()]}</p>
                <p style={{fontSize:14,fontWeight:900,color:isTd?C.acc:C.tx,textAlign:"center",margin:"0 0 5px"}}>{day.getDate()}</p>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  {dj.slice(0,3).map(j=>(
                    <div key={j.id} onClick={()=>nav("job-detail",j.id)}
                      style={{background:SC[j.status]?.bg||"#eee",borderRadius:4,padding:"2px 4px",cursor:"pointer"}}>
                      <p style={{fontSize:8,fontWeight:700,color:SC[j.status]?.text||"#333",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.title}</p>
                    </div>
                  ))}
                  {dj.length>3&&<p style={{fontSize:8,color:C.li,textAlign:"center",margin:0}}>+{dj.length-3}</p>}
                </div>
              </div>
            );
          })}
        </div>
        <Card title={S.lang==="ar"?"مهام هذا الأسبوع":"This Week's Jobs"}>
          {S.jobs.filter(j=>{const d=new Date(j.scheduled_at||"");return d>=wStart&&d<new Date(wStart.getTime()+7*86400000);}).length===0
            ?<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"12px 0"}}>{t.noJobs}</p>
            :S.jobs.filter(j=>{const d=new Date(j.scheduled_at||"");return d>=wStart&&d<new Date(wStart.getTime()+7*86400000);})
              .sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))
              .map(j=><JRow key={j.id} job={j} onClick={()=>nav("job-detail",j.id)}/>)}
        </Card>
      </div>
    );
  };

  const Catalog=()=>{
    const [cf,scf]=useState({name:"",unit_price:"",unit:"قطعة",category:""});
    const [catSearch,setCatSearch]=useState("");
    const [selCat,setSelCat]=useState("all");
    const allCats=["all",...new Set((S.catalog||[]).map(i=>i.category).filter(Boolean))];
    const filtered=(S.catalog||[]).filter(i=>{
      const mCat=selCat==="all"||i.category===selCat;
      const mSearch=!catSearch||i.name.toLowerCase().includes(catSearch.toLowerCase());
      return mCat&&mSearch;
    });
    const grouped=filtered.reduce((acc,item)=>{
      const cat=item.category||S.lang==="ar"?"أخرى":"Other";
      if(!acc[cat])acc[cat]=[];
      acc[cat].push(item);
      return acc;
    },{});
    return(
      <div style={{padding:"16px",maxWidth:700}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
          <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.catalog} ({(S.catalog||[]).length})</h2>
          <div style={{display:"flex",gap:7}}>
            <Btn label={S.lang==="ar"?"تحميل الكتالوج الجاهز":"Load Preset"} sm col={C.pu} icon="📦" onClick={loadPresetCatalog}/>
          </div>
        </div>
        {/* Add item */}
        <Card title={t.addCatalogItem}>
          <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
            <Fld label={t.materialName+" *"} half><input value={cf.name} onChange={e=>scf(p=>({...p,name:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"مثال: كيبل 2.5مم":"e.g. 2.5mm Cable"}/></Fld>
            <Fld label={`${t.unitPrice} (${sym}) *`} half><input value={cf.unit_price} onChange={e=>scf(p=>({...p,unit_price:e.target.value}))} type="number" style={iS} placeholder="0"/></Fld>
            <Fld label={t.unit} half>
              <select value={cf.unit} onChange={e=>scf(p=>({...p,unit:e.target.value}))} style={iS}>
                {(S.lang==="ar"?["قطعة","متر","كيلو","لتر","ساعة","رولو","علبة","كيس"]:["piece","meter","kg","liter","hour","roll","box","bag"]).map(u=><option key={u}>{u}</option>)}
              </select>
            </Fld>
            <Fld label={t.expenseCategory} half>
              <input value={cf.category} onChange={e=>scf(p=>({...p,category:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"مثال: كابلات":"e.g. Cables"} list="cat-list"/>
              <datalist id="cat-list">
                {allCats.filter(c=>c!=="all").map(c=><option key={c} value={c}/>)}
              </datalist>
            </Fld>
          </div>
          <Btn label={`+ ${t.addCatalogItem}`} onClick={()=>{
            if(!cf.name||!cf.unit_price)return;
            addCatItem({...cf,unit_price:Number(cf.unit_price)});
            scf({name:"",unit_price:"",unit:"قطعة",category:cf.category});
          }}/>
        </Card>
        {/* Search & filter */}
        <div style={{marginBottom:10}}>
          <input value={catSearch} onChange={e=>setCatSearch(e.target.value)} placeholder={t.catalogSearch} style={{...iS,marginBottom:8}}/>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {allCats.map(c=>(
              <button key={c} onClick={()=>setSelCat(c)} style={{padding:"4px 11px",borderRadius:16,border:`1px solid ${selCat===c?C.acc:C.bdr}`,background:selCat===c?`${C.acc}15`:"#fff",color:selCat===c?C.accD:C.mu,fontSize:11,fontWeight:selCat===c?700:400,cursor:"pointer"}}>
                {c==="all"?(S.lang==="ar"?"كل التصنيفات":t.allCategories):c}
              </button>
            ))}
          </div>
        </div>
        {/* Grouped display */}
        {Object.entries(grouped).map(([cat,items])=>(
          <Card key={cat} title={`📦 ${cat} (${items.length})`}>
            {items.map(item=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <div>
                  <p style={{fontWeight:600,fontSize:13,color:C.tx,margin:"0 0 1px"}}>{item.name}</p>
                  <p style={{fontSize:11,color:C.mu,margin:0}}>{item.unit}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontWeight:700,fontSize:13,color:C.acc}}>{fmtM(item.unit_price,sym)}</span>
                  <button onClick={()=>delCatItem(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.li,fontSize:15}}>×</button>
                </div>
              </div>
            ))}
          </Card>
        ))}
        {filtered.length===0&&(S.catalog||[]).length===0&&<Emp icon="🏷" label={t.catalogEmpty}/>}
      </div>
    );
  };

  const Expenses=()=>{
    const [ef,sef]=useState({name:"",amount:"",date:new Date().toISOString().split("T")[0],category:S.lang==="ar"?"مواد":"Materials"});
    const cats=S.lang==="ar"?["مواد","أدوات","وقود","إيجار","رسوم","أخرى"]:["Materials","Tools","Fuel","Rent","Fees","Other"];
    return(
      <div style={{padding:"16px",maxWidth:680}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:7}}>
          <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.expenses}</h2>
          <Btn label={t.exportExcel} col={C.ok} sm icon="📊" onClick={()=>exportSmartCSV(S.expenses,"expenses",t,sym,S.customers,S.jobs)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:9,marginBottom:12}}>
          <Stat label={t.totalExpenses} value={fmtM(totalExp,sym)} col={C.er} icon="💸"/>
          <Stat label={t.totalPaid} value={fmtM(cAmt,sym)} col={C.ok} icon="✅"/>
          <Stat label={t.profit} value={fmtM(cAmt-totalExp,sym)} col={C.pu} icon="📈"/>
        </div>
        <Card title={t.addExpense}>
          <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
            <Fld label={t.expenseName+" *"} half><input value={ef.name} onChange={e=>sef(p=>({...p,name:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"مثال: شراء كيبل":"e.g. Cable purchase"}/></Fld>
            <Fld label={`${t.expenseAmt} (${sym}) *`} half><input value={ef.amount} onChange={e=>sef(p=>({...p,amount:e.target.value}))} type="number" style={iS} placeholder="0"/></Fld>
            <Fld label={t.expenseDate} half><input value={ef.date} onChange={e=>sef(p=>({...p,date:e.target.value}))} type="date" style={iS}/></Fld>
            <Fld label={t.expenseCategory} half>
              <select value={ef.category} onChange={e=>sef(p=>({...p,category:e.target.value}))} style={iS}>
                {cats.map(c=><option key={c}>{c}</option>)}
              </select>
            </Fld>
          </div>
          <Btn label={`+ ${t.addExpense}`} onClick={()=>{
            if(!ef.name||!ef.amount)return;
            addExp({...ef,amount:Number(ef.amount)});
            sef({name:"",amount:"",date:new Date().toISOString().split("T")[0],category:ef.category});
          }}/>
        </Card>
        <Card title={S.lang==="ar"?"سجل المصروفات":"Expense History"}>
          {(S.expenses||[]).length===0?<Emp icon="💸" label={t.addExpense}/>
            :[...(S.expenses||[])].reverse().map(e=>(
              <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <div>
                  <p style={{fontWeight:600,fontSize:12,color:C.tx,margin:"0 0 1px"}}>{e.name}</p>
                  <p style={{fontSize:11,color:C.mu,margin:0}}>{e.category} · {fmtD(e.date)}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontWeight:700,fontSize:13,color:C.er}}>{fmtM(e.amount,sym)}</span>
                  <button onClick={()=>setS(p=>({...p,expenses:(p.expenses||[]).filter(x=>x.id!==e.id)}))} style={{background:"none",border:"none",cursor:"pointer",color:C.li,fontSize:15}}>×</button>
                </div>
              </div>
            ))}
        </Card>
      </div>
    );
  };

  const Reports=()=>{
    const mo={};
    S.invoices.filter(i=>i.status==="paid").forEach(inv=>{const m=(inv.paid_at||inv.created_at||"").slice(0,7);if(m)mo[m]=(mo[m]||0)+inv.total;});
    const mos=Object.entries(mo).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6);
    const mx=Math.max(...mos.map(m=>m[1]),1);
    const topC=S.customers.map(c=>{
      const cp=S.invoices.filter(i=>S.jobs.find(j=>j.id===i.job_id&&j.customer_id===c.id)&&i.status==="paid").reduce((s,i)=>s+i.total,0);
      return{...c,paid:cp,jobs:S.jobs.filter(j=>j.customer_id===c.id).length};
    }).sort((a,b)=>b.paid-a.paid).slice(0,5);
    const avgInv=S.invoices.length?cAmt/S.invoices.length:0;
    return(
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:7}}>
          <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:0}}>{t.reports}</h2>
          <div style={{display:"flex",gap:6}}>
            <Btn label={t.exportExcel} sm col={C.ok} icon="📊" onClick={()=>exportSmartCSV(S.invoices,"invoices",t,sym,S.customers,S.jobs)}/>
            <Btn label="🤖 AI" sm col={C.ai} onClick={()=>{nav("ai");setTimeout(()=>sendAI(S.lang==="ar"?"أعطني تحليلاً مالياً شاملاً لأدائي ونصائح للتحسين":"Give me a complete financial analysis and improvement tips"),100);}}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:9,marginBottom:14}}>
          <Stat label={t.revenue} value={fmtM(cAmt,sym)} col={C.ok} icon="📈"/>
          <Stat label={t.totalPending} value={fmtM(pAmt,sym)} col={C.wa} icon="⏳"/>
          <Stat label={t.profit} value={fmtM(cAmt-totalExp,sym)} col={C.pu} icon="💰"/>
          <Stat label={t.avgJobValue} value={fmtM(avgInv,sym)} col={C.acc} icon="📊"/>
        </div>
        {mos.length>0&&(
          <Card title={t.monthlyRevenue}>
            <div style={{display:"flex",gap:7,alignItems:"flex-end",height:110,paddingBottom:6}}>
              {mos.map(([m,v])=>(
                <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <span style={{fontSize:9,color:C.mu,fontWeight:600,textAlign:"center"}}>{fmtM(v,sym)}</span>
                  <div style={{width:"100%",background:`linear-gradient(to top,${C.acc},${C.accD})`,borderRadius:"3px 3px 0 0",height:`${(v/mx)*100}px`,minHeight:4,transition:"height 0.4s"}}/>
                  <span style={{fontSize:8,color:C.li}}>{m.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:11}}>
          <Card title={t.jobsByStatus}>
            {["scheduled","in_progress","done","invoiced"].map(s=>{
              const ct=S.jobs.filter(j=>j.status===s).length;
              const pct=S.jobs.length?Math.round(ct/S.jobs.length*100):0;
              return(
                <div key={s} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,color:C.tx,fontWeight:600}}>{t[s]}</span>
                    <span style={{fontSize:11,color:C.mu}}>{ct} ({pct}%)</span>
                  </div>
                  <div style={{background:C.bg,borderRadius:18,height:6,overflow:"hidden"}}>
                    <div style={{height:"100%",background:SC[s].dot,width:`${pct}%`,borderRadius:18,transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card title={t.topCustomers}>
            {topC.map((c,i)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${C.acc}20`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:C.acc,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:600,fontSize:12,color:C.tx,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</p>
                  <p style={{fontSize:10,color:C.mu,margin:0}}>{c.jobs} {t.jobs}</p>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:C.ok,flexShrink:0}}>{fmtM(c.paid,sym)}</span>
              </div>
            ))}
            {topC.length===0&&<p style={{color:C.li,fontSize:12,textAlign:"center",padding:"12px 0"}}>{t.noCustomers}</p>}
          </Card>
        </div>
      </div>
    );
  };

  const Team=()=>{
    const [tf,stf]=useState({name:"",role:"",phone:""});
    const roles=S.lang==="ar"?["كهربائي","سباك","مساعد","سائق","محاسب","مقاول فرعي"]:["Electrician","Plumber","Helper","Driver","Accountant","Sub-contractor"];
    return(
      <div style={{padding:"16px",maxWidth:640}}>
        <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 14px"}}>{t.team}</h2>
        <Card title={t.addMember}>
          <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
            <Fld label={t.memberName+" *"} half><input value={tf.name} onChange={e=>stf(p=>({...p,name:e.target.value}))} style={iS}/></Fld>
            <Fld label={t.phone} half><input value={tf.phone} onChange={e=>stf(p=>({...p,phone:e.target.value}))} style={iS} type="tel"/></Fld>
            <Fld label={t.memberRole} half>
              <select value={tf.role} onChange={e=>stf(p=>({...p,role:e.target.value}))} style={iS}>
                <option value="">{S.lang==="ar"?"اختر الدور":"Select role"}</option>
                {roles.map(r=><option key={r}>{r}</option>)}
              </select>
            </Fld>
          </div>
          <Btn label={`+ ${t.addMember}`} onClick={()=>{if(!tf.name)return;addTeamMember(tf);stf({name:"",role:"",phone:"",});}}/>
        </Card>
        <Card title={`${t.team} (${(S.team||[]).length})`}>
          {(S.team||[]).length===0?<Emp icon="👷" label={t.addMember}/>
            :(S.team||[]).map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:`${C.acc}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>👷</div>
                  <div>
                    <p style={{fontWeight:700,fontSize:12,color:C.tx,margin:"0 0 2px"}}>{m.name}</p>
                    <p style={{fontSize:11,color:C.mu,margin:0}}>{m.role||""}{m.phone?` · 📞${m.phone}`:""}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {m.phone&&<a href={`https://wa.me/${m.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{padding:"4px 8px",borderRadius:6,background:"#F0FDF4",color:"#166534",fontSize:11,fontWeight:700,textDecoration:"none"}}>💬</a>}
                  <button onClick={()=>delTeamMember(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.li,fontSize:15}}>×</button>
                </div>
              </div>
            ))}
        </Card>
      </div>
    );
  };

  const Settings=()=>{
    const [f,sf]=useState({...S.profile});
    return(
      <div style={{padding:"16px",maxWidth:580}}>
        <h2 style={{fontSize:16,fontWeight:800,color:C.tx,margin:"0 0 14px"}}>{t.settings}</h2>
        <Card title={t.profile}>
          <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
            <Fld label={t.fullName} half><input value={f.fullName} onChange={e=>sf(p=>({...p,fullName:e.target.value}))} style={iS}/></Fld>
            <Fld label={t.businessName} half><input value={f.businessName} onChange={e=>sf(p=>({...p,businessName:e.target.value}))} style={iS}/></Fld>
            <Fld label={t.phone} half><input value={f.phone} onChange={e=>sf(p=>({...p,phone:e.target.value}))} style={iS} type="tel"/></Fld>
            <Fld label={t.invoicePrefix} half><input value={f.invoicePrefix} onChange={e=>sf(p=>({...p,invoicePrefix:e.target.value}))} style={iS}/></Fld>
          </div>
          <Fld label={t.trade}>
            <select value={f.trade} onChange={e=>sf(p=>({...p,trade:e.target.value}))} style={iS}>
              {Object.entries(TRADES).map(([k,v])=><option key={k} value={k}>{v.icon} {v[S.lang]}</option>)}
            </select>
          </Fld>
          <Btn label={t.save} onClick={()=>{setS(p=>({...p,profile:f}));showToast("✅ "+t.save);}}/>
        </Card>
        <Card title={`🤖 ${t.ai} — Gemini AI`}>
          <div style={{background:`${aiServerOk?C.ok:C.ai}08`,border:`1px solid ${aiServerOk?C.ok:C.ai}25`,borderRadius:8,padding:"9px 11px",marginBottom:10}}>
            <p style={{color:aiServerOk?C.ok:C.ai,fontSize:12,fontWeight:600,margin:"0 0 4px"}}>
              {aiServerOk
                ? (S.lang==="ar"?"✅ متصل بالسيرفر — Gemini AI مفعّل":"✅ Connected to server — Gemini AI active")
                : (S.lang==="ar"?"🤖 يعمل بالمساعد المحلي حالياً":"🤖 Currently running on local assistant")}
            </p>
            <p style={{color:C.mu,fontSize:11,margin:0,lineHeight:1.6}}>
              {S.lang==="ar"
                ?"لأسباب أمنية، مفتاح الذكاء الاصطناعي لا يُحفَظ أبداً داخل التطبيق أو المتصفح. يضعه مالك السيرفر فقط كمتغيّر بيئة (GEMINI_API_KEY) في ملف server.js — راجع .env.example."
                :"For security, the AI key is never stored in the app or browser. The server owner sets it as an environment variable (GEMINI_API_KEY) in server.js — see .env.example."}
            </p>
          </div>
          <Btn label={S.lang==="ar"?"إعادة محاولة الاتصال":"Retry connection"} col={C.ai} sm
            onClick={async()=>{
              try{ await callServerAI([{role:"user",content:"ping"}], ""); setAiServerOk(true); showToast("✅"); }
              catch{ setAiServerOk(false); showToast("❌"); }
            }}/>
        </Card>
        <Card title={t.taxRate}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
            <input type="range" min="0" max="30" step="0.5" value={f.taxRate||0} onChange={e=>sf(p=>({...p,taxRate:Number(e.target.value)}))} style={{flex:1,accentColor:C.acc}}/>
            <span style={{fontSize:19,fontWeight:900,color:C.acc,minWidth:48}}>{f.taxRate||0}%</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
            {[0,5,10,15,20,25].map(v=>(
              <button key={v} onClick={()=>sf(p=>({...p,taxRate:v}))} style={{padding:"4px 11px",borderRadius:16,border:`1.5px solid ${(f.taxRate||0)===v?C.acc:C.bdr}`,background:(f.taxRate||0)===v?`${C.acc}15`:"#fff",color:(f.taxRate||0)===v?C.accD:C.mu,fontWeight:700,cursor:"pointer",fontSize:12}}>{v}%</button>
            ))}
          </div>
          <Btn label={t.save} sm onClick={()=>{setS(p=>({...p,profile:f}));showToast("✅");}}/>
        </Card>
        <Card title={t.currency}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:6,marginBottom:9}}>
            {CURRENCIES.map(c=>(
              <button key={c.code} onClick={()=>sf(p=>({...p,currency:c.code}))} style={{padding:"7px 8px",borderRadius:8,cursor:"pointer",textAlign:"start",border:`1.5px solid ${f.currency===c.code?C.acc:C.bdr}`,background:f.currency===c.code?`${C.acc}10`:"#fff"}}>
                <div style={{fontSize:15,marginBottom:1}}>{c.flag}</div>
                <div style={{fontWeight:700,fontSize:11,color:f.currency===c.code?C.accD:C.tx}}>{c.code} {c.symbol}</div>
                <div style={{fontSize:9,color:C.mu,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
              </button>
            ))}
          </div>
          <Btn label={t.save} sm onClick={()=>{setS(p=>({...p,profile:f}));showToast("✅");}}/>
        </Card>
        <Card title={t.language}>
          <div style={{display:"flex",gap:8}}>
            {["ar","en"].map(l=>(
              <button key={l} onClick={()=>setS(p=>({...p,lang:l}))} style={{padding:"8px 18px",borderRadius:7,border:`1.5px solid ${S.lang===l?C.acc:C.bdr}`,background:S.lang===l?`${C.acc}15`:"#fff",color:S.lang===l?C.accD:C.mu,fontWeight:S.lang===l?700:400,cursor:"pointer",fontSize:13}}>
                {l==="ar"?"🇸🇦 العربية":"🇬🇧 English"}
              </button>
            ))}
          </div>
        </Card>
        <Card title={S.lang==="ar"?"الإشعارات":"Notifications"}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <button onClick={async()=>{if(!("Notification"in window)){showToast("❌");return;}const p=await Notification.requestPermission();setNotifOn(p==="granted");showToast(p==="granted"?"🔔 "+t.notificationsEnabled:"❌");}}
              style={{padding:"7px 13px",borderRadius:7,border:"none",background:notifOn?C.ok:C.acc,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>
              🔔 {notifOn?t.notificationsEnabled:t.enableNotifications}
            </button>
            <span style={{fontSize:11,color:C.mu}}>{S.lang==="ar"?"تنبيه للفواتير المتأخرة":"Alert for overdue invoices"}</span>
          </div>
        </Card>
        <Card title={S.lang==="ar"?"البيانات":"Data"}>
          <div style={{background:"#F0FDF4",borderRadius:8,padding:"9px 11px",marginBottom:9,border:"1px solid #BBF7D0"}}>
            <p style={{fontWeight:700,color:"#166534",margin:"0 0 2px",fontSize:12}}>✅ {t.dataSaved}</p>
            <p style={{color:"#16A34A",fontSize:11,margin:0}}>{t.offlineBanner}</p>
          </div>
          <button onClick={()=>{if(window.confirm(S.lang==="ar"?"هل أنت متأكد؟ سيتم حذف جميع البيانات!":"Are you sure? All data will be deleted!")){localStorage.removeItem(SK);setS_(INIT);showToast("🗑");}}}
            style={{padding:"6px 13px",borderRadius:7,border:`1.5px solid ${C.er}`,background:"transparent",color:C.er,fontWeight:600,cursor:"pointer",fontSize:12}}>
            {t.clearData}
          </button>
        </Card>
      </div>
    );
  };

  // Help/Guide Modal
  const HelpModal=()=>{
    const steps=S.lang==="ar"?[
      {icon:"1️⃣",title:"أضف عميلاً",desc:"اضغط على 'العملاء' ثم '+' — أدخل الاسم والجوال فقط وهذا كافٍ"},
      {icon:"2️⃣",title:"أنشئ مهمة",desc:"من 'المهام' أو زر '+' الكبير — اختر العميل وصف المهمة والموعد"},
      {icon:"3️⃣",title:"أضف المواد",desc:"في نموذج المهمة — أضف المواد من الكتالوج أو يدوياً مع الكمية والسعر"},
      {icon:"4️⃣",title:"غيّر الحالة",desc:"عند انتهاء العمل غيّر الحالة إلى 'منتهي' ثم أنشئ الفاتورة"},
      {icon:"5️⃣",title:"أرسل الفاتورة",desc:"اضغط 'إرسال عبر واتساب' — الرسالة جاهزة تلقائياً مع كل التفاصيل"},
      {icon:"6️⃣",title:"تابع الدفع",desc:"من 'الفواتير' — اضغط 'تم الدفع' عند استلام المبلغ"},
      {icon:"📦",title:"الكتالوج",desc:"اذهب لـ'كتالوج الأسعار' واضغط 'تحميل الكتالوج الجاهز' لتحميل المواد الشائعة لمهنتك"},
      {icon:"🤖",title:"المساعد الذكي",desc:"اسأل المساعد عن إيراداتك أو اطلب منه رسالة واتساب — أضف مفتاح Claude AI للمزيد"},
      {icon:"📊",title:"التقارير",desc:"من 'التقارير' شاهد إيراداتك الشهرية وأفضل عملاؤك ثم صدّرها CSV"},
      {icon:"📅",title:"التقويم",desc:"من 'التقويم' شاهد مواعيد أسبوعك دفعة واحدة"},
    ]:[
      {icon:"1️⃣",title:"Add Customer",desc:"Go to 'Customers' and tap '+' — Name and Phone is all you need"},
      {icon:"2️⃣",title:"Create Job",desc:"Tap '+' → select customer, describe job, set appointment"},
      {icon:"3️⃣",title:"Add Materials",desc:"In job form — add from catalog or manually with qty and price"},
      {icon:"4️⃣",title:"Change Status",desc:"When done, change to 'Done' then create Invoice"},
      {icon:"5️⃣",title:"Send Invoice",desc:"Tap 'Send via WhatsApp' — message is auto-ready with all details"},
      {icon:"6️⃣",title:"Mark Paid",desc:"From 'Invoices' → tap 'Mark Paid' when you receive payment"},
      {icon:"📦",title:"Catalog",desc:"Go to 'Price Catalog' and tap 'Load Preset' for your trade's common materials"},
      {icon:"🤖",title:"AI Assistant",desc:"Ask about revenue or request WhatsApp messages — add Claude API key for advanced AI"},
      {icon:"📊",title:"Reports",desc:"See monthly revenue, top clients, export to CSV"},
      {icon:"📅",title:"Calendar",desc:"See all your week's appointments at once"},
    ];
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setHelpOpen(false)}>
        <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.card}}>
            <div>
              <h2 style={{margin:0,fontSize:16,fontWeight:800,color:C.tx}}>{t.helpTitle}</h2>
              <p style={{margin:"2px 0 0",fontSize:12,color:C.mu}}>TradePro — {S.lang==="ar"?"دليل الاستخدام السريع":"Quick Start Guide"}</p>
            </div>
            <button onClick={()=>setHelpOpen(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
          </div>
          <div style={{padding:"16px 20px"}}>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:14,padding:"11px 13px",background:C.bg,borderRadius:10,border:`1px solid ${C.bdr}`}}>
                <span style={{fontSize:22,flexShrink:0,lineHeight:1.2}}>{s.icon}</span>
                <div>
                  <p style={{fontWeight:700,fontSize:13,color:C.tx,margin:"0 0 3px"}}>{s.title}</p>
                  <p style={{fontSize:12,color:C.mu,margin:0,lineHeight:1.5}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Quote Form
  const QuoteForm=({init,onSave,onClose})=>{
    const [f,sf]=useState(init||{customer_id:"",title:"",description:"",valid_until:"",notes:"",items:[],total:0});
    const [item,si]=useState({name:"",qty:"1",unit_price:"",unit:"قطعة"});
    const recalc=(items)=>items.reduce((s,m)=>s+(m.qty||0)*(m.unit_price||0),0);
    const addItem=()=>{
      if(!item.name||!item.unit_price)return;
      const ni=[...(f.items||[]),{...item,qty:Number(item.qty),unit_price:Number(item.unit_price),id:uid()}];
      sf(p=>({...p,items:ni,total:recalc(ni)}));
      si({name:"",qty:"1",unit_price:"",unit:"قطعة"});
    };
    return(
      <>
        <Fld label={t.customers+" *"}>
          <select value={f.customer_id} onChange={e=>sf(p=>({...p,customer_id:e.target.value}))} style={{...iS,color:f.customer_id?C.tx:C.li}}>
            <option value="">{t.selectCustomer}</option>
            {S.customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>
        </Fld>
        <Fld label={S.lang==="ar"?"عنوان عرض السعر *":"Quote Title *"}><input value={f.title} onChange={e=>sf(p=>({...p,title:e.target.value}))} style={iS} placeholder={S.lang==="ar"?"مثال: تمديد كهربائي للمطبخ":"e.g. Kitchen electrical work"}/></Fld>
        <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
          <Fld label={S.lang==="ar"?"صالح حتى":"Valid Until"} half><input value={f.valid_until} onChange={e=>sf(p=>({...p,valid_until:e.target.value}))} type="date" style={iS}/></Fld>
        </div>
        <Fld label={S.lang==="ar"?"وصف العمل":"Description"}><textarea value={f.description} onChange={e=>sf(p=>({...p,description:e.target.value}))} style={{...iS,resize:"none"}} rows={2}/></Fld>
        <div style={{background:C.bg,borderRadius:9,padding:11,marginBottom:11}}>
          <p style={{fontWeight:700,fontSize:12,color:C.mu,margin:"0 0 8px"}}>{S.lang==="ar"?"بنود عرض السعر":"Quote Items"}</p>
          {(f.items||[]).map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",marginBottom:4,background:"#fff",borderRadius:7,border:`1px solid ${C.bdr}`}}>
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:12,fontWeight:600,color:C.tx}}>{it.name}</span>
                <span style={{fontSize:11,color:C.mu}}> × {it.qty} {it.unit} = </span>
                <span style={{fontSize:12,fontWeight:700,color:C.acc}}>{fmtM(it.qty*it.unit_price,sym)}</span>
              </div>
              <button onClick={()=>{const ni=(f.items||[]).filter((_,j)=>j!==i);sf(p=>({...p,items:ni,total:recalc(ni)}));}} style={{background:"none",border:"none",cursor:"pointer",color:C.er,fontSize:16}}>×</button>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:7,marginTop:8}}>
            <input value={item.name} onChange={e=>si(p=>({...p,name:e.target.value}))} placeholder={S.lang==="ar"?"البند":"Item"} style={{...iS,fontSize:12}}/>
            <input value={item.qty} onChange={e=>si(p=>({...p,qty:e.target.value}))} type="number" placeholder={t.qty} style={{...iS,fontSize:12}}/>
            <input value={item.unit_price} onChange={e=>si(p=>({...p,unit_price:e.target.value}))} type="number" placeholder={t.unitPrice} style={{...iS,fontSize:12}}/>
          </div>
          <button onClick={addItem} style={{marginTop:7,width:"100%",background:"#fff",color:C.acc,border:`1.5px dashed ${C.acc}`,borderRadius:7,padding:"6px 0",cursor:"pointer",fontWeight:600,fontSize:12}}>+ {S.lang==="ar"?"إضافة بند":"Add Item"}</button>
        </div>
        {f.total>0&&<div style={{background:C.sb,borderRadius:8,padding:"9px 12px",marginBottom:11,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.acc,fontWeight:700,fontSize:13}}>{t.grandTotal}</span>
          <span style={{color:C.acc,fontWeight:900,fontSize:16}}>{fmtM(f.total,sym)}</span>
        </div>}
        <Fld label={t.notes}><textarea value={f.notes} onChange={e=>sf(p=>({...p,notes:e.target.value}))} style={{...iS,resize:"none"}} rows={2}/></Fld>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:7,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.mu,fontWeight:600,cursor:"pointer",fontSize:13}}>{t.cancel}</button>
          <button onClick={()=>f.customer_id&&f.title&&onSave(f)} disabled={!f.customer_id||!f.title}
            style={{flex:2,padding:"9px 0",borderRadius:7,border:"none",background:!f.customer_id||!f.title?C.bg:`linear-gradient(135deg,${C.acc},${C.accD})`,color:!f.customer_id||!f.title?C.mu:"#fff",fontWeight:700,cursor:!f.customer_id||!f.title?"not-allowed":"pointer",fontSize:13}}>
            📝 {t.save}
          </button>
        </div>
      </>
    );
  };

  // ── RENDER ────────────────────────────────────────────────
  const render=()=>{
    switch(screen){
      case"dashboard":       return<Dashboard/>;
      case"jobs":            return<Jobs/>;
      case"job-detail":      return<JobDetail/>;
      case"customers":       return<Customers/>;
      case"customer-detail": return<CustDetail/>;
      case"quotes":          return<Quotes/>;
      case"quote-detail":    return<QuoteDetail/>;
      case"invoices":        return<Invoices/>;
      case"invoice-detail":  return<InvDetail/>;
      case"calendar":        return<CalendarView/>;
      case"catalog":         return<Catalog/>;
      case"expenses":        return<Expenses/>;
      case"reports":         return<Reports/>;
      case"team":            return<Team/>;
      case"ai":              return<AIScr/>;
      case"settings":        return<Settings/>;
      default:               return<Dashboard/>;
    }
  };

  const stitle=
    screen==="job-detail"      ? selJ?.title||t.jobDetails :
    screen==="invoice-detail"  ? selI?.invoice_number||t.invoiceDetails :
    screen==="customer-detail" ? selC?.name||t.customerDetails :
    screen==="quote-detail"    ? selQ?.title||t.quoteDetails :
    (TXT[S.lang][screen]||t.dashboard);

  const mobNav=[
    {key:"dashboard",icon:"⊞",label:t.dashboard},
    {key:"jobs",icon:"⚙",label:t.jobs},
    {key:"ai",icon:"🤖",label:t.ai,center:true},
    {key:"invoices",icon:"◧",label:t.invoices},
    {key:"settings",icon:"⚙︎",label:t.settings},
  ];

  return(
    <div style={{display:"flex",width:"100vw",height:"100vh",background:C.bg,fontFamily:"'Cairo','Segoe UI',Tahoma,sans-serif",direction:dir,overflow:"hidden"}}>

      {/* Desktop Sidebar */}
      <div className="tp-desk"><SB/></div>

      {/* Mobile Drawer */}
      {drawer&&(
        <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:dir==="rtl"?"row-reverse":"row"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}} onClick={()=>setDrawer(false)}/>
          <div style={{position:"relative",width:240,height:"100%",zIndex:301,flexShrink:0}}><SB/></div>
        </div>
      )}

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        {!online&&<div style={{background:"#1E293B",color:C.wa,padding:"5px 14px",fontSize:11,fontWeight:600,textAlign:"center",flexShrink:0}}>📵 {t.offlineBanner}</div>}
        <TB title={stitle}/>
        <div style={{flex:1,overflow:screen==="ai"?"hidden":"auto"}}>{render()}</div>

        {/* Mobile Bottom Nav */}
        <div className="tp-mob" style={{background:C.card,borderTop:`1px solid ${C.bdr}`,display:"none",boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",flexShrink:0}}>
          {mobNav.map(item=>item.center?(
            <button key={item.key} onClick={()=>nav(item.key)} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"5px 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:42,height:42,borderRadius:12,marginTop:-16,background:`linear-gradient(135deg,${C.ai},${C.aiD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 4px 12px ${C.ai}55`}}>🤖</div>
              <span style={{fontSize:9,color:screen===item.key?C.ai:C.li,marginTop:2,fontWeight:screen===item.key?700:400}}>{item.label}</span>
            </button>
          ):(
            <button key={item.key} onClick={()=>nav(item.key)} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"6px 0 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:15,color:screen===item.key?C.acc:C.li}}>{item.icon}</span>
              <span style={{fontSize:9,color:screen===item.key?C.acc:C.li,fontWeight:screen===item.key?700:400}}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal==="add-customer"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`}}>
              <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{t.newCustomer}</h2>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              <CustForm onSave={addCust} onClose={()=>setModal(null)}/>
            </div>
          </div>
        </div>
      )}
      {modal==="edit-customer"&&selC&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`}}>
              <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{t.edit} — {selC.name}</h2>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              <CustForm init={selC} onSave={d=>updCust(selC.id,d)} onClose={()=>setModal(null)}/>
            </div>
          </div>
        </div>
      )}
      {modal==="add-job"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`,position:"sticky",top:0,background:C.card,zIndex:1}}>
              <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{t.newJob}</h2>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              <JobForm onSave={addJob} onClose={()=>setModal(null)}/>
            </div>
          </div>
        </div>
      )}
      {modal==="edit-job"&&selJ&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`,position:"sticky",top:0,background:C.card,zIndex:1}}>
              <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{t.edit} — {selJ.title}</h2>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              <JobForm init={selJ} onSave={d=>updJob(selJ.id,d)} onClose={()=>setModal(null)}/>
            </div>
          </div>
        </div>
      )}
      {modal==="add-quote"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.card,borderRadius:16,width:"100%",maxWidth:600,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.bdr}`,position:"sticky",top:0,background:C.card,zIndex:1}}>
              <h2 style={{margin:0,fontSize:15,fontWeight:700,color:C.tx}}>{t.newQuote}</h2>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.mu}}>×</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              {S.customers.length===0
                ?<div style={{textAlign:"center",padding:"20px 0"}}>
                    <p style={{color:C.mu,marginBottom:14,fontSize:14}}>{S.lang==="ar"?"أضف عميلاً أولاً":"Add a customer first"}</p>
                    <Btn label={t.newCustomer} onClick={()=>setModal("add-customer")}/>
                  </div>
                :<QuoteForm onSave={addQuote} onClose={()=>setModal(null)}/>}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {cdel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.card,borderRadius:14,padding:22,maxWidth:280,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <div style={{fontSize:36,marginBottom:9}}>🗑</div>
            <p style={{fontWeight:700,fontSize:14,color:C.tx,margin:"0 0 16px"}}>{t.confirmDelete}</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setCdel(null)} style={{flex:1,padding:"9px 0",borderRadius:7,border:`1.5px solid ${C.bdr}`,background:"#fff",fontWeight:600,cursor:"pointer",color:C.mu,fontSize:13}}>{t.cancel}</button>
              <button onClick={()=>{
                if(cdel.type==="job") delJob(cdel.id);
                else if(cdel.type==="customer") delCust(cdel.id);
                setCdel(null);
              }} style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",background:C.er,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {photoMdl&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPhotoMdl(null)}>
          <img src={photoMdl} alt="" style={{maxWidth:"92vw",maxHeight:"92vh",borderRadius:10,objectFit:"contain"}}/>
          <button onClick={()=>setPhotoMdl(null)} style={{position:"absolute",top:18,insetInlineEnd:18,background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:"50%",width:38,height:38,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      )}

      {/* Help Modal */}
      {helpOpen&&<HelpModal/>}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",background:C.sb,color:"#fff",padding:"8px 18px",borderRadius:26,fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:3000,whiteSpace:"nowrap",pointerEvents:"none"}}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;height:100%;overflow:hidden;}
        input:focus,textarea:focus,select:focus{border-color:#F97316!important;box-shadow:0 0 0 3px rgba(249,115,22,0.1)!important;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px;}
        @keyframes tp_b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        .tp-desk{display:flex;height:100%;}
        .tp-ham{display:none!important;}
        @media(max-width:768px){
          .tp-desk{display:none!important;}
          .tp-mob{display:flex!important;}
          .tp-ham{display:flex!important;}
        }
      `}</style>
    </div>
  );
}
