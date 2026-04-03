// ─── SMPPI Dashboard — Client-Side JavaScript ──────────────────────────────
'use strict';

let state = {
    lang: window.LANG || 'en',
    sources: window.DATA_SOURCES || [],
    translations: window.TRANSLATIONS || {},
    currentSourceId: '',
    columns: [],
    allData: [],
    filteredData: [],
    search: '',
    columnFilters: {},
    sortKey: '',
    sortDir: 'asc',
    page: 1,
    pageSize: 10,
    showFilters: false,
    chart: null,
    joinResult: null,
    savedJoins: JSON.parse(localStorage.getItem('smppi_joins') || '[]')
};

// ─── Init ───────────────────────────────────────────────────────────────────
function initDashboard() {
    if (state.sources.length > 0) {
        selectSource(state.sources[0].id, document.querySelector('#sourceTabs .nav-link'));
    }
}

// ─── Language Toggle ────────────────────────────────────────────────────────
function toggleLang() {
    const newLang = state.lang === 'en' ? 'ms' : 'en';
    window.location.href = '/?lang=' + newLang;
}

// ─── Source Selection ───────────────────────────────────────────────────────
function selectSource(sourceId, tabEl) {
    state.currentSourceId = sourceId;
    state.search = '';
    state.columnFilters = {};
    state.sortKey = '';
    state.page = 1;
    document.getElementById('globalSearch').value = '';

    // Update active tab
    document.querySelectorAll('#sourceTabs .nav-link').forEach(el => el.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');

    // Get column config
    const src = state.sources.find(s => s.id === sourceId);
    state.columns = src ? src.columns : [];

    // Load data
    loadData();
    loadSampleQueries();
    populateVizSelectors();
}

async function loadData() {
    showLoading();
    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sourceId: state.currentSourceId,
                search: state.search,
                columnFilters: state.columnFilters,
                sortKey: state.sortKey,
                sortDir: state.sortDir,
                page: state.page,
                pageSize: state.pageSize
            })
        });
        const data = await res.json();
        state.allData = data.rows;
        state.filteredData = data.rows;
        renderTable(data);
        renderPagination(data);
        updateFilterBadge();
        renderColumnFilters();
    } catch (e) {
        console.error('Load error:', e);
    }
}

// ─── Table Render ───────────────────────────────────────────────────────────
function renderTable(data) {
    const thead = document.getElementById('dataTableHead');
    const tbody = document.getElementById('dataTableBody');
    const empty = document.getElementById('emptyState');

    // Header
    let headerHtml = '<tr><th style="width:40px">#</th>';
    state.columns.forEach(col => {
        const t = state.translations[col.label] || col.label;
        const arrow = state.sortKey === col.key
            ? (state.sortDir === 'asc' ? ' ↑' : ' ↓')
            : '';
        headerHtml += `<th onclick="sortBy('${col.key}')">${t}${arrow}</th>`;
    });
    headerHtml += '</tr>';

    // Filter row
    if (state.showFilters) {
        headerHtml += '<tr class="bg-light">';
        headerHtml += '<th></th>';
        state.columns.forEach(col => {
            const val = state.columnFilters[col.key] || '';
            headerHtml += `<th><input class="form-control filter-input" type="text"
                placeholder="..." value="${esc(val)}"
                oninput="setColumnFilter('${col.key}', this.value)" /></th>`;
        });
        headerHtml += '</tr>';
    }
    thead.innerHTML = headerHtml;

    // Body
    if (!data.rows || data.rows.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('d-none');
        return;
    }
    empty.classList.add('d-none');

    let bodyHtml = '';
    data.rows.forEach((row, idx) => {
        const rowNum = (data.page - 1) * data.pageSize + idx + 1;
        bodyHtml += `<tr><td class="text-muted">${rowNum}</td>`;
        state.columns.forEach(col => {
            const val = row[col.key] || '-';
            bodyHtml += `<td title="${esc(val)}" onclick="explainCell('${esc(val)}','${esc(state.translations[col.label] || col.label)}')">${esc(val)}</td>`;
        });
        bodyHtml += '</tr>';
    });
    tbody.innerHTML = bodyHtml;

    // Result info
    const info = document.getElementById('resultInfo');
    const t = state.translations;
    info.textContent = `${data.filteredCount} ${t['page_of'] || 'of'} ${data.totalCount} ${t['table_rows_selected'] || 'records'}`;
}

function showLoading() {
    document.getElementById('dataTableBody').innerHTML =
        '<tr><td colspan="99" class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></td></tr>';
}

// ─── Pagination ─────────────────────────────────────────────────────────────
function renderPagination(data) {
    const pag = document.getElementById('pagination');
    if (data.totalPages <= 1) { pag.innerHTML = ''; return; }

    let html = '';
    html += `<li class="page-item ${data.page <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goPage(1);return false">&laquo;</a></li>`;
    html += `<li class="page-item ${data.page <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goPage(${data.page - 1});return false">&lsaquo;</a></li>`;

    const start = Math.max(1, data.page - 2);
    const end = Math.min(data.totalPages, data.page + 2);
    for (let i = start; i <= end; i++) {
        html += `<li class="page-item ${i === data.page ? 'active' : ''}">
            <a class="page-link" href="#" onclick="goPage(${i});return false">${i}</a></li>`;
    }

    html += `<li class="page-item ${data.page >= data.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goPage(${data.page + 1});return false">&rsaquo;</a></li>`;
    html += `<li class="page-item ${data.page >= data.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goPage(${data.totalPages});return false">&raquo;</a></li>`;

    pag.innerHTML = html;
}

function goPage(p) { state.page = p; loadData(); }
function changePageSize() {
    state.pageSize = parseInt(document.getElementById('pageSizeSelect').value);
    state.page = 1;
    loadData();
}

// ─── Search ─────────────────────────────────────────────────────────────────
let searchTimer;
function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.search = document.getElementById('globalSearch').value;
        state.page = 1;
        loadData();
    }, 300);
}
function clearSearch() {
    document.getElementById('globalSearch').value = '';
    state.search = '';
    state.page = 1;
    loadData();
}

// ─── Sort ───────────────────────────────────────────────────────────────────
function sortBy(key) {
    if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortKey = key;
        state.sortDir = 'asc';
    }
    state.page = 1;
    loadData();
}

// ─── Column Filters ─────────────────────────────────────────────────────────
function toggleColumnFilters() {
    state.showFilters = !state.showFilters;
    const panel = document.getElementById('columnFiltersPanel');
    if (state.showFilters) {
        panel.classList.remove('d-none');
        renderColumnFilters();
    } else {
        panel.classList.add('d-none');
    }
    // Also re-render table to show/hide filter row in thead
    loadData();
}

function renderColumnFilters() {
    const container = document.getElementById('columnFiltersContainer');
    let html = '';
    state.columns.forEach(col => {
        const t = state.translations[col.label] || col.label;
        const val = state.columnFilters[col.key] || '';
        html += `<div class="col-md-3 col-sm-6">
            <label class="form-label small">${t}</label>
            <input class="form-control form-control-sm filter-input" type="text"
                value="${esc(val)}" placeholder="..."
                oninput="setColumnFilter('${col.key}', this.value)" />
        </div>`;
    });
    container.innerHTML = html;
}

function setColumnFilter(key, value) {
    if (value) {
        state.columnFilters[key] = value;
    } else {
        delete state.columnFilters[key];
    }
    state.page = 1;
    loadData();
}

function clearAllFilters() {
    state.columnFilters = {};
    state.search = '';
    document.getElementById('globalSearch').value = '';
    state.page = 1;
    loadData();
}

function updateFilterBadge() {
    const count = Object.keys(state.columnFilters).filter(k => state.columnFilters[k]).length
        + (state.search ? 1 : 0);
    const badge = document.getElementById('filterBadge');
    const exportBtn = document.getElementById('btnExportFiltered');
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('d-none');
        exportBtn.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
        exportBtn.classList.add('d-none');
    }
}

// ─── Export ──────────────────────────────────────────────────────────────────
async function exportData(type) {
    const body = {
        sourceId: state.currentSourceId,
        search: type === 'filtered' ? state.search : '',
        columnFilters: type === 'filtered' ? state.columnFilters : {},
        page: 1,
        pageSize: 100000
    };
    try {
        const res = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SMPPI_${state.currentSourceId}_${type}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('Export failed: ' + e.message);
    }
}

// ─── AI Query ───────────────────────────────────────────────────────────────
function toggleAiPanel() {
    document.getElementById('aiPanel').classList.toggle('d-none');
}

async function loadSampleQueries() {
    try {
        const res = await fetch(`/api/ai/samples/${state.currentSourceId}?lang=${state.lang}`);
        const samples = await res.json();
        const container = document.getElementById('sampleQueriesContainer');
        container.innerHTML = samples.map(s =>
            `<button class="btn btn-outline-info btn-sm me-1 mb-1" onclick="document.getElementById('aiPrompt').value='${esc(s)}'">${esc(s)}</button>`
        ).join('');
    } catch {}
}

async function runAiQuery() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    if (!prompt) return;

    try {
        const res = await fetch('/api/ai/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, sourceId: state.currentSourceId, lang: state.lang })
        });
        const data = await res.json();
        document.getElementById('aiSqlOutput').textContent = data.sql;
        document.getElementById('aiExplanationOutput').textContent = data.explanation;
        document.getElementById('aiResults').classList.remove('d-none');

        // Store results for execute
        state.aiQueryResults = data.results;
    } catch (e) {
        alert('AI query failed: ' + e.message);
    }
}

function runAiExecute() {
    const results = state.aiQueryResults;
    if (!results || results.length === 0) {
        document.getElementById('aiQueryResults').innerHTML = '<p class="text-muted">No results</p>';
        document.getElementById('aiQueryResults').classList.remove('d-none');
        return;
    }

    const cols = Object.keys(results[0]);
    let html = '<thead><tr>' + cols.map(c => `<th>${esc(c)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    results.slice(0, 50).forEach(row => {
        html += '<tr>' + cols.map(c => `<td>${esc(row[c] || '')}</td>`).join('') + '</tr>';
    });
    html += '</tbody>';

    document.getElementById('aiResultsTable').innerHTML = html;
    document.getElementById('aiQueryResults').classList.remove('d-none');
}

// ─── Explain Cell ───────────────────────────────────────────────────────────
async function explainCell(value, columnLabel) {
    if (!value || value === '-') return;

    const modal = new bootstrap.Modal(document.getElementById('explainModal'));
    document.getElementById('explainContent').innerHTML =
        `<p class="mb-1"><small class="text-muted">${esc(columnLabel)}</small></p>
         <p class="fw-bold">${esc(value)}</p>
         <div class="text-center"><div class="spinner-border spinner-border-sm"></div></div>`;
    modal.show();

    try {
        const res = await fetch('/api/ai/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, columnLabel, lang: state.lang })
        });
        const data = await res.json();
        document.getElementById('explainContent').innerHTML =
            `<p class="mb-1"><small class="text-muted">${esc(columnLabel)}</small></p>
             <p class="fw-bold">${esc(value)}</p>
             <div class="alert alert-light mb-0">${esc(data.explanation)}</div>`;
    } catch {
        document.getElementById('explainContent').innerHTML =
            `<p class="text-danger">Failed to explain.</p>`;
    }
}

// ─── Join Builder ───────────────────────────────────────────────────────────
function toggleJoinPanel() {
    document.getElementById('joinPanel').classList.toggle('d-none');
}

async function onJoinSourceChange() {
    const checked = [...document.querySelectorAll('.join-source-check:checked')].map(c => c.value);
    const select = document.getElementById('joinColumnSelect');

    if (checked.length < 2) {
        select.innerHTML = '<option>Select at least 2 sources</option>';
        select.disabled = true;
        return;
    }

    try {
        const res = await fetch(`/api/join/common-columns?sourceIds=${checked.join(',')}`);
        const cols = await res.json();
        select.disabled = false;
        select.innerHTML = cols.map(c => `<option value="${c}">${c}</option>`).join('');
        if (cols.length === 0) {
            select.innerHTML = '<option>No common columns</option>';
            select.disabled = true;
        }
    } catch {
        select.innerHTML = '<option>Error loading columns</option>';
        select.disabled = true;
    }
}

async function executeJoin() {
    const sourceIds = [...document.querySelectorAll('.join-source-check:checked')].map(c => c.value);
    const joinColumn = document.getElementById('joinColumnSelect').value;
    const joinType = document.getElementById('joinTypeSelect').value;

    if (sourceIds.length < 2 || !joinColumn) {
        alert('Select at least 2 sources and a join column');
        return;
    }

    try {
        const res = await fetch('/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceIds, joinColumn, joinType })
        });
        const data = await res.json();
        state.joinResult = data;

        // Render join results table
        const table = document.getElementById('joinResultsTable');
        let html = '<thead><tr>' + data.columns.map(c => `<th>${esc(c)}</th>`).join('') + '</tr></thead>';
        html += '<tbody>';
        data.rows.forEach(row => {
            html += '<tr>' + data.columns.map(c => `<td>${esc(row[c] || '')}</td>`).join('') + '</tr>';
        });
        html += '</tbody>';
        table.innerHTML = html;
        document.getElementById('joinResults').classList.remove('d-none');
    } catch (e) {
        alert('Join failed: ' + e.message);
    }
}

function saveJoin() {
    if (!state.joinResult) return;
    const name = prompt(state.lang === 'ms' ? 'Nama gabungan:' : 'Join name:');
    if (!name) return;

    const join = {
        id: Date.now().toString(36),
        name: name,
        sourceIds: [...document.querySelectorAll('.join-source-check:checked')].map(c => c.value),
        joinColumn: document.getElementById('joinColumnSelect').value,
        joinType: document.getElementById('joinTypeSelect').value,
        createdAt: new Date().toISOString(),
        data: state.joinResult
    };
    state.savedJoins.push(join);
    localStorage.setItem('smppi_joins', JSON.stringify(state.savedJoins));
    alert(state.lang === 'ms' ? 'Berjaya disimpan!' : 'Saved successfully!');
}

function loadJoinsList() {
    const panel = document.getElementById('savedJoinsPanel');
    const list = document.getElementById('savedJoinsList');
    panel.classList.remove('d-none');

    if (state.savedJoins.length === 0) {
        list.innerHTML = '<p class="text-muted small">No saved joins</p>';
        return;
    }

    list.innerHTML = state.savedJoins.map(j =>
        `<div class="d-flex justify-content-between align-items-center border rounded p-2 mb-1">
            <div>
                <strong>${esc(j.name)}</strong>
                <small class="text-muted d-block">${j.sourceIds.join(' + ')} — ${new Date(j.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary" onclick="loadSavedJoin('${j.id}')">Load</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSavedJoin('${j.id}')">×</button>
            </div>
        </div>`
    ).join('');
}

function loadSavedJoin(id) {
    const join = state.savedJoins.find(j => j.id === id);
    if (!join || !join.data) return;

    state.joinResult = join.data;
    const table = document.getElementById('joinResultsTable');
    let html = '<thead><tr>' + join.data.columns.map(c => `<th>${esc(c)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    join.data.rows.forEach(row => {
        html += '<tr>' + join.data.columns.map(c => `<td>${esc(row[c] || '')}</td>`).join('') + '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
    document.getElementById('joinResults').classList.remove('d-none');
}

function deleteSavedJoin(id) {
    if (!confirm(state.lang === 'ms' ? 'Padam gabungan ini?' : 'Delete this join?')) return;
    state.savedJoins = state.savedJoins.filter(j => j.id !== id);
    localStorage.setItem('smppi_joins', JSON.stringify(state.savedJoins));
    loadJoinsList();
}

// ─── Visualization ──────────────────────────────────────────────────────────
function toggleVizPanel() {
    document.getElementById('vizPanel').classList.toggle('d-none');
    populateVizSelectors();
}

function populateVizSelectors() {
    const xSel = document.getElementById('vizXAxis');
    const ySel = document.getElementById('vizYAxis');
    if (!xSel || !ySel) return;

    xSel.innerHTML = state.columns.map(c => {
        const t = state.translations[c.label] || c.label;
        return `<option value="${c.key}">${t}</option>`;
    }).join('');

    ySel.innerHTML = '<option value="__count">Count</option>' +
        state.columns.map(c => {
            const t = state.translations[c.label] || c.label;
            return `<option value="${c.key}">${t}</option>`;
        }).join('');
}

function generateChart() {
    const chartType = document.getElementById('vizChartType').value;
    const xKey = document.getElementById('vizXAxis').value;
    const yKey = document.getElementById('vizYAxis').value;
    const agg = document.getElementById('vizAggregate').value;

    if (state.allData.length === 0) return;

    // Aggregate data
    const groups = {};
    state.allData.forEach(row => {
        const xVal = row[xKey] || '(blank)';
        if (!groups[xVal]) groups[xVal] = [];
        const yVal = parseFloat(row[yKey]);
        groups[xVal].push(isNaN(yVal) ? 0 : yVal);
    });

    const labels = Object.keys(groups).slice(0, 30);
    const values = labels.map(lbl => {
        const vals = groups[lbl];
        if (agg === 'count') return vals.length;
        if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
        if (agg === 'avg') return vals.reduce((a, b) => a + b, 0) / vals.length;
        return vals.length;
    });

    const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899',
                     '#06b6d4','#84cc16','#f97316','#6366f1','#14b8a6','#e11d48'];

    const canvas = document.getElementById('vizCanvas');
    if (state.chart) { state.chart.destroy(); state.chart = null; }

    state.chart = new Chart(canvas.getContext('2d'), {
        type: chartType === 'scatter' ? 'scatter' : chartType,
        data: {
            labels: labels,
            datasets: [{
                label: yKey === '__count' ? 'Count' : yKey,
                data: values,
                backgroundColor: chartType === 'line' ? 'rgba(59,130,246,0.1)'
                    : labels.map((_, i) => COLORS[i % COLORS.length]),
                borderColor: chartType === 'line' ? '#3b82f6'
                    : labels.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: chartType === 'line' ? 2 : 1,
                fill: chartType === 'line'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: (chartType === 'pie' || chartType === 'doughnut') ? 'right' : 'top' }
            }
        }
    });
}

// ─── Utility ────────────────────────────────────────────────────────────────
function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
