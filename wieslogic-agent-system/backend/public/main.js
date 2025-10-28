const $ = (id) => document.getElementById(id);
const on = (id, handler) => { const el = $(id); if (el) el.onclick = handler; };
const out = (data) => { const o=$("out"); if (o) o.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2); };

function baseUrl() {
  const v = $("baseUrl").value.trim();
  return v || window.location.origin;
}

function headers() {
  const token = $("authToken").value.trim();
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function api(path, options={}){
  const url = baseUrl() + path;
  const res = await fetch(url, { headers: headers(), ...options });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if(!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

// Customers
async function loadCustomers(){
  try {
    const cs = await api('/api/wieslogic/customers');
    const sel = $("customerSelect"); if (!sel) return;
    sel.innerHTML = '';
    (cs||[]).forEach((c)=>{
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = `${c.id}${c.email? ' • '+c.email:''}`;
      sel.appendChild(opt);
    });
    const preferred = localStorage.getItem('wl_customer') || $("customerId").value || (cs[0]?.id||'');
    if (preferred) { sel.value = preferred; $("customerId").value = preferred; localStorage.setItem('wl_customer', preferred); }
    $("customersList") && ( $("customersList").textContent = JSON.stringify(cs,null,2) );
  } catch(e){ /* ignore */ }
}
on('btnRefreshCustomers', loadCustomers);
document.addEventListener('change', (ev)=>{
  if (ev.target && ev.target.id === 'customerSelect'){
    const cid = ev.target.value; $("customerId").value = cid; localStorage.setItem('wl_customer', cid);
  }
});

on("btnGetConfig", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/config/${cid}`);
    // Fill form fields
    $("sheetId").value = data.googleSheetId || '';
    $("svcEmail").value = data.serviceAccountEmail || '';
    $("companyName").value = data.companyName || '';
    $("fromEmail").value = data.fromEmail || '';
    $("replyTo").value = data.replyToEmail || '';
    $("webhookBase").value = data.webhookBaseUrl || '';
    // Agent toggles
    const safe = (v, d=false) => (typeof v === 'boolean' ? v : d);
    if ($("agentMaster")) $("agentMaster").checked = safe(data.masterAgentEnabled, true);
    if ($("agentLead")) $("agentLead").checked = safe(data.leadAgentEnabled);
    if ($("agentTech")) $("agentTech").checked = safe(data.techAgentEnabled);
    if ($("agentSales")) $("agentSales").checked = safe(data.salesAgentEnabled);
    if ($("agentService")) $("agentService").checked = safe(data.serviceAgentEnabled);
    if ($("agentLeadGen")) $("agentLeadGen").checked = safe(data.leadGeneratorEnabled);
    if ($("agentContent")) $("agentContent").checked = safe(data.contentAgentEnabled);
    if ($("agentMarketing")) $("agentMarketing").checked = safe(data.marketingAgentEnabled);
    // Details
    $("configDetails").textContent = JSON.stringify(data, null, 2);
    out({ message: 'Config loaded' });
  } catch(e){ out(e.message); }
});

on("btnUpsertConfig", async () => {
  try {
    const cid = $("customerId").value.trim();
    const body = {
      googleSheetId: $("sheetId").value.trim(),
      serviceAccountEmail: $("svcEmail").value.trim(),
      licenseType: 'full',
      activationDate: new Date().toISOString(),
      webhookBaseUrl: $("webhookBase").value.trim(),
      openAIApiKey: 'sk-REDACTED',
      companyName: $("companyName").value.trim(),
      fromEmail: $("fromEmail").value.trim(),
      replyToEmail: $("replyTo").value.trim(),
    };
    // Try PATCH first, else POST
    try {
      const data = await api(`/api/wieslogic/config/${cid}`, { method:'PATCH', body: JSON.stringify(body) });
      out({ message: 'Config updated', data });
    } catch {
      const data = await api(`/api/wieslogic/config/${cid}`, { method:'POST', body: JSON.stringify(body) });
      out({ message: 'Config created', data });
    }
  } catch(e){ out(e.message); }
});

on("btnGetSheets", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/config/${cid}/sheets`);
    renderMappings(data);
    out({ message: 'Mappings loaded', count: Object.keys(data||{}).length });
  } catch(e){ out(e.message); }
});

on("btnUpsertMapping", async () => {
  try {
    const cid = $("customerId").value.trim();
    const body = {
      logicalName: $("mapLogical").value.trim(),
      actualSheetName: $("mapActual").value.trim(),
    };
    const data = await api(`/api/wieslogic/config/${cid}/sheets`, { method:'POST', body: JSON.stringify(body) });
    document.getElementById('btnGetSheets')?.click();
    out({ message: 'Mapping upserted', data });
  } catch(e){ out(e.message); }
});

on("btnSeedMappings", async () => {
  try {
    const cid = $("customerId").value.trim();
    const defaults = {
      inquiries: '01_Inquiries_Log',
      quotations: '02_Quotation_Options',
      customer_profile: '03_Customer_Profile',
      reports: '04_Reports',
      service_log: '05_Service_Log',
      product_portfolio: '06_Product_Portfolio',
      mechanical_specs: '07_Mechanical_Specs',
      electrical_specs: '08_Electrical_Specs',
      packaging_specs: '09_Packaging_Process_Specs',
      marketing_log: '10_Marketing_Activity_Log',
      chart_data: '12_Chart_Data',
      master_log: '13_Master_Log',
      performance_log: '14_Performance_Log',
      health_log: '15_System_Health_Log',
      evaluation_log: '16_Evaluation_Log',
      client_config: '17_Client_Config',
      lead_intelligence: '19_Lead_Intelligence_Log',
    };
    let last;
    for (const [logical, actual] of Object.entries(defaults)) {
      last = await api(`/api/wieslogic/config/${cid}/sheets`, { method:'POST', body: JSON.stringify({ logicalName: logical, actualSheetName: actual }) });
    }
    await $("btnGetSheets").onclick();
    out({ message: 'Default mappings seeded', last });
  } catch(e){ out(e.message); }
});

on("btnTriggerLead", async () => {
  try {
    const data = await api('/api/wieslogic/test/lead', { method:'POST', body: JSON.stringify({}) });
    out(data);
  } catch(e){ out(e.message); }
});

on("btnSaveAgents", async () => {
  try {
    const cid = $("customerId").value.trim();
    const body = {
      masterAgentEnabled: $("agentMaster")?.checked ?? true,
      leadAgentEnabled: $("agentLead")?.checked ?? false,
      techAgentEnabled: $("agentTech")?.checked ?? false,
      salesAgentEnabled: $("agentSales")?.checked ?? false,
      serviceAgentEnabled: $("agentService")?.checked ?? false,
      leadGeneratorEnabled: $("agentLeadGen")?.checked ?? false,
      contentAgentEnabled: $("agentContent")?.checked ?? false,
      marketingAgentEnabled: $("agentMarketing")?.checked ?? false,
      paEnabled: $("agentPA")?.checked ?? false,
    };
    const data = await api(`/api/wieslogic/config/${cid}`, { method:'PATCH', body: JSON.stringify(body) });
    out({ message: 'Agent toggles saved', data });
  } catch(e){ out(e.message); }
});

function renderMappings(map){
  const el = $("mappingsTable");
  if(!map || Object.keys(map).length===0){ el.innerHTML = '<em>No mappings</em>'; return; }
  let html = '<table class="grid-table">';
  html += '<tr><th>Logical</th><th>Actual</th><th>Actions</th></tr>';
  for(const [logical, actual] of Object.entries(map)){
    html += `<tr>
      <td>${logical}</td>
      <td><input data-input="actual" data-logical="${logical}" value="${actual}"></td>
      <td>
        <button data-action="save" data-logical="${logical}">Save</button>
        <button data-action="use-column" data-logical="${logical}">Use Selected Column</button>
      </td>
    </tr>`;
  }
  html += '</table>';
  el.innerHTML = html;
  el.querySelectorAll('button[data-action="save"]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const logical = btn.getAttribute('data-logical');
      const inp = el.querySelector(`input[data-logical="${logical}"]`);
      const actual = inp.value.trim();
      const cid = $("customerId").value.trim();
      await api(`/api/wieslogic/config/${cid}/sheets`, { method:'POST', body: JSON.stringify({ logicalName: logical, actualSheetName: actual }) });
      out({ message: 'Mapping saved', logical, actual });
    });
  });
  el.querySelectorAll('button[data-action="use-column"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const logical = btn.getAttribute('data-logical');
      const sel = $("columnsSelect"); const chosen = sel?.value || '';
      if (!chosen) return;
      const inp = el.querySelector(`input[data-logical="${logical}"]`);
      inp.value = chosen;
    });
  });
}

on("btnTriggerMaster", async () => {
  try {
    const data = await api('/api/wieslogic/test/master', { method:'POST', body: JSON.stringify({}) });
    out(data);
  } catch(e){ out(e.message); }
});

on("btnSheetHealth", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/config/${cid}/sheets/health`);
    $("sheetHealth").textContent = JSON.stringify(data, null, 2);
    out({ message: 'Sheet health updated' });
  } catch(e){ out(e.message); }
});

on("btnGetCatalog", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/config/${cid}/catalog`);
    $("catalog").textContent = JSON.stringify(data, null, 2);
    out({ message: 'Catalog loaded', count: (data||[]).length });
  } catch(e){ out(e.message); }
});

on("btnGetStats", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/stats/${cid}?days=30`);
    $("stats").textContent = JSON.stringify(data, null, 2);
    drawStatsChart(data);
    out({ message: 'Stats loaded' });
  } catch(e){ out(e.message); }
});

let statsChart;
function drawStatsChart(data){
  const el = document.getElementById('statsChart'); if (!el || !window.Chart) return;
  const buckets = {};
  (data.executionSummary||[]).forEach(row=>{
    const key = row.agent+':'+row.status; buckets[key] = (buckets[key]||0) + (row.count||row._count||0);
  });
  const labels = Object.keys(buckets);
  const values = labels.map(l=>buckets[l]);
  const cfg = { type:'bar', data:{ labels, datasets:[{ label:'Executions', data: values, backgroundColor:'#00F0FF' }] }, options:{ responsive:true, plugins:{ legend:{display:false} } } };
  if (statsChart){ statsChart.destroy(); }
  statsChart = new Chart(el, cfg);
}

on("btnImportCatalog", async () => {
  try {
    const cid = $("customerId").value.trim();
    const data = await api(`/api/wieslogic/config/${cid}/catalog/import-from-sheets`, { method:'POST', body: '{}' });
    document.getElementById('btnGetCatalog')?.click();
    out({ message: 'Catalog imported', data });
  } catch(e){ out(e.message); }
});

on("btnGetColumns", async () => {
  try {
    const cid = $("customerId").value.trim();
    const logical = $("mapLogical").value.trim();
    const res = await api(`/api/wieslogic/config/${cid}/sheets/headers?logical=${encodeURIComponent(logical)}`);
    const sel = $("columnsSelect");
    sel.innerHTML = '';
    (res.headers || []).forEach((h)=>{
      const opt = document.createElement('option');
      opt.textContent = h;
      sel.appendChild(opt);
    });
    out({ message: 'Columns loaded', sheet: res.sheet, count: (res.headers||[]).length });
  } catch(e){ out(e.message); }
});

// Persist basic settings in localStorage
['baseUrl','authToken','customerId'].forEach(id=>{
  const el=$(id);
  const key=`wl_${id}`;
  const saved = localStorage.getItem(key);
  if(saved) el.value = saved;
  el.addEventListener('input', ()=> localStorage.setItem(key, el.value));
});
// Tabs
function showTab(name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.getAttribute('data-tab')===name));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('active', p.getAttribute('data-tab-pane')===name));
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>showTab(t.getAttribute('data-tab'))));
showTab('settings');

// Theme toggle
const themeKey='wl_theme';
function applyTheme(v){
  if(v==='light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
}
applyTheme(localStorage.getItem(themeKey)||'dark');
$("themeToggle").onclick=()=>{
  const cur=document.documentElement.classList.contains('light')?'light':'dark';
  const next=cur==='light'?'dark':'light';
  applyTheme(next); localStorage.setItem(themeKey,next);
};

// init customers on load
loadCustomers();
