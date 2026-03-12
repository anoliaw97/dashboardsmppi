/**
 * SMPPI Dashboard — Client-Side JavaScript
 * Handles: data fetching, filtering, sorting, pagination, AI query, join builder, visualization.
 *
 * All API calls go to the ASP.NET Core backend (DataController, JoinController).
 * In the static demo (Next.js), this logic lives in React components.
 */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
    lang: window.SMPPI?.lang ?? 'en',
    dataSources: window.SMPPI?.dataSources ?? [],
    savedJoins: window.SMPPI?.savedJoins ?? [],
    selectedSource: null,
    currentColumns: [],
    currentData: [],
    filteredData: [],
    sortKey: '',
    sortDir: 'asc',
    page: 0,
    pageSize: 10,
    globalSearch: '',
    columnFilters: {},
    showColumnFilters: true,
    // Custom (joined) data
    customData: null,
    customColumns: [],
    customLabel: '',
    // AI
    generatedSql: '',
    sqlExplanation: '',
    aiResults: null,
    // Join builder
    joinPreviewData: null,
    joinPreviewColumns: [],
    joinPreviewLabel: '',
    // Chart
    chartInstance: null,
};

const ms = () => state.lang === 'ms';

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initSourceTabs();
    initSearchBar();
    initToolbarButtons();
    initPagination();
    initJoinBuilder();
    initVisualization();
    initExplainPopover();

    // Select first source
    if (state.dataSources.length > 0)
        selectSource(state.dataSources[0].id);
});

// ─── Data Source Tabs ─────────────────────────────────────────────────────────

function initSourceTabs() {
    document.querySelectorAll('.source-tab').forEach(btn => {
        btn.addEventListener('click', () => selectSource(btn.dataset.id));
    });
}

async function selectSource(id) {
    state.selectedSource = id;
    state.globalSearch = '';
    state.columnFilters = {};
    state.sortKey = '';
    state.page = 0;
    state.generatedSql = '';
    state.aiResults = null;

    // Update active tab
    document.querySelectorAll('.source-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.id === id);
    });

    const src = state.dataSources.find(s => s.id === id);
    document.getElementById('source-description').textContent = src?.description ?? '';

    // If there's custom/joined data, keep it. Otherwise load source data.
    if (!state.customData) {
        await loadSourceData(id);
    }

    // Reset AI panel
    document.getElementById('ai-prompt').value = '';
    document.getElementById('ai-result-section').classList.add('hidden');
    document.getElementById('ai-results-table').classList.add('hidden');
    loadAiSamples(id);
}

async function loadSourceData(id) {
    showTableLoading();
    try {
        const response = await fetchApi('POST', '/api/data/query', {
            sourceId: id,
            globalSearch: '',
            columnFilters: {},
            sortKey: '',
            sortDirection: 'asc',
            page: 0,
            pageSize: 100000,
            lang: state.lang,
        });
        const src = state.dataSources.find(s => s.id === id);
        state.currentColumns = src?.columns ?? [];
        state.currentData = response.rows ?? [];
        applyFiltersAndRender();
    } catch (e) {
        showTableError(e.message);
    }
}

// ─── Search + Filters ─────────────────────────────────────────────────────────

function initSearchBar() {
    const searchInput = document.getElementById('global-search');
    searchInput.addEventListener('input', () => {
        state.globalSearch = searchInput.value;
        state.page = 0;
        applyFiltersAndRender();
    });

    document.getElementById('reset-all-btn').addEventListener('click', () => {
        state.globalSearch = '';
        state.columnFilters = {};
        state.sortKey = '';
        state.page = 0;
        searchInput.value = '';
        applyFiltersAndRender();
    });
}

function applyFiltersAndRender() {
    const data = state.customData ?? state.currentData;
    const columns = state.customData ? state.customColumns : state.currentColumns;
    let result = [...data];

    // Global search
    if (state.globalSearch) {
        const lower = state.globalSearch.toLowerCase();
        result = result.filter(row =>
            columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(lower))
        );
    }

    // Column filters
    Object.entries(state.columnFilters).forEach(([key, val]) => {
        if (!val) return;
        const lower = val.toLowerCase();
        result = result.filter(row =>
            String(row[key] ?? '').toLowerCase().includes(lower)
        );
    });

    // Sort
    if (state.sortKey) {
        result.sort((a, b) => {
            const av = String(a[state.sortKey] ?? '');
            const bv = String(b[state.sortKey] ?? '');
            const cmp = av.localeCompare(bv, undefined, { numeric: true });
            return state.sortDir === 'asc' ? cmp : -cmp;
        });
    }

    state.filteredData = result;
    renderTable(columns);
    updateResultsSummary(data.length, result.length);
    updateToolbarBadges();
}

// ─── Table Render ─────────────────────────────────────────────────────────────

function renderTable(columns) {
    const container = document.getElementById('table-container');
    const totalPages = Math.max(1, Math.ceil(state.filteredData.length / state.pageSize));
    if (state.page >= totalPages) state.page = 0;

    const pageData = state.filteredData.slice(
        state.page * state.pageSize,
        (state.page + 1) * state.pageSize
    );

    if (!pageData.length) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-16 text-slate-400 text-center">
                <div><p class="text-4xl mb-2">🔍</p>
                <p>${ms() ? 'Tiada rekod ditemui' : 'No records found'}</p></div>
            </div>`;
        updatePagination(0, 0);
        return;
    }

    const filterRow = state.showColumnFilters ? buildFilterRow(columns) : '';

    const thead = `<thead>
        <tr>${'<th style="width:42px">#</th>' + columns.map(col => `
            <th onclick="handleSort('${col.key}')" title="${col.label}">
                ${col.label} ${state.sortKey === col.key ? (state.sortDir === 'asc' ? '↑' : '↓') : ''}
            </th>`).join('')}
        </tr>${filterRow}</thead>`;

    const tbody = `<tbody>${pageData.map((row, idx) => `
        <tr>
            <td style="color:#94a3b8">${state.page * state.pageSize + idx + 1}</td>
            ${columns.map(col => {
                const val = String(row[col.key] ?? '-');
                return `<td title="${escHtml(val)}" onclick="openExplainPopover(event,'${escJs(val)}','${escJs(col.label)}')">${escHtml(val)}</td>`;
            }).join('')}
        </tr>`).join('')}</tbody>`;

    container.innerHTML = `<table>${thead}${tbody}</table>`;
    updatePagination(state.page, totalPages);
}

function buildFilterRow(columns) {
    return `<tr class="filter-row">
        <th></th>
        ${columns.map(col => {
            const val = state.columnFilters[col.key] ?? '';
            return `<th>
                <input class="filter-input ${val ? 'active' : ''}" type="text"
                    placeholder="${ms() ? 'Tapis...' : 'Filter...'}"
                    value="${escHtml(val)}"
                    oninput="setColumnFilter('${col.key}', this.value)"
                />
            </th>`;
        }).join('')}
    </tr>`;
}

function setColumnFilter(key, value) {
    state.columnFilters[key] = value;
    state.page = 0;
    applyFiltersAndRender();
}

function handleSort(key) {
    if (state.sortKey === key)
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    else { state.sortKey = key; state.sortDir = 'asc'; }
    applyFiltersAndRender();
}

function showTableLoading() {
    document.getElementById('table-container').innerHTML = `
        <div class="flex items-center justify-center py-16 text-slate-400 text-center">
            <div><p style="font-size:2rem" class="animate-spin mb-2">⏳</p>
            <p>${ms() ? 'Memuatkan...' : 'Loading...'}</p></div>
        </div>`;
}

function showTableError(msg) {
    document.getElementById('table-container').innerHTML = `
        <div class="flex items-center justify-center py-16 text-red-500 text-center">
            <div><p style="font-size:2rem">⚠</p><p>${escHtml(msg)}</p></div>
        </div>`;
}

// ─── Results Summary ──────────────────────────────────────────────────────────

function updateResultsSummary(total, filtered) {
    const el = document.getElementById('results-summary');
    const activeFilters = Object.values(state.columnFilters).filter(Boolean).length
        + (state.globalSearch ? 1 : 0);
    let text = `${filtered} ${ms() ? 'daripada' : 'of'} ${total} ${ms() ? 'rekod' : 'records'}`;
    if (activeFilters > 0)
        text += ` (${activeFilters} ${ms() ? 'penapis aktif' : 'active filters'})`;
    if (state.customLabel)
        text += ` — ${state.customLabel}`;
    el.textContent = text;

    // Show export filtered btn
    document.getElementById('export-filtered-btn').classList.toggle('hidden', activeFilters === 0);
}

function updateToolbarBadges() {
    const activeFilters = Object.values(state.columnFilters).filter(Boolean).length
        + (state.globalSearch ? 1 : 0);
    const badge = document.getElementById('filter-count-badge');
    if (activeFilters > 0) {
        badge.textContent = activeFilters;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    document.getElementById('reset-all-btn').classList.toggle('hidden', activeFilters === 0);
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function initPagination() {
    document.getElementById('page-first').addEventListener('click', () => { state.page = 0; applyFiltersAndRender(); });
    document.getElementById('page-prev').addEventListener('click',  () => { state.page--; applyFiltersAndRender(); });
    document.getElementById('page-next').addEventListener('click',  () => { state.page++; applyFiltersAndRender(); });
    document.getElementById('page-last').addEventListener('click',  () => {
        state.page = Math.ceil(state.filteredData.length / state.pageSize) - 1;
        applyFiltersAndRender();
    });
    document.getElementById('page-size-select').addEventListener('change', e => {
        state.pageSize = Number(e.target.value);
        state.page = 0;
        applyFiltersAndRender();
    });
}

function updatePagination(page, totalPages) {
    const info = document.getElementById('page-info');
    info.textContent = `${ms() ? 'Halaman' : 'Page'} ${page + 1} / ${totalPages}`;
    document.getElementById('page-first').disabled = page === 0;
    document.getElementById('page-prev').disabled  = page === 0;
    document.getElementById('page-next').disabled  = page >= totalPages - 1;
    document.getElementById('page-last').disabled  = page >= totalPages - 1;
}

// ─── Toolbar Buttons ──────────────────────────────────────────────────────────

function initToolbarButtons() {
    document.getElementById('toggle-filters-btn').addEventListener('click', () => {
        state.showColumnFilters = !state.showColumnFilters;
        const btn = document.getElementById('toggle-filters-btn');
        btn.classList.toggle('active-blue', state.showColumnFilters);
        applyFiltersAndRender();
    });

    document.getElementById('toggle-ai-btn').addEventListener('click', () => {
        const panel = document.getElementById('ai-panel');
        const btn = document.getElementById('toggle-ai-btn');
        const hidden = panel.classList.toggle('hidden');
        btn.classList.toggle('active-purple', !hidden);
    });

    document.getElementById('toggle-join-btn').addEventListener('click', () => {
        const panel = document.getElementById('join-panel');
        const btn = document.getElementById('toggle-join-btn');
        const hidden = panel.classList.toggle('hidden');
        btn.classList.toggle('active-orange', !hidden);
    });

    document.getElementById('toggle-viz-btn').addEventListener('click', () => {
        const panel = document.getElementById('viz-panel');
        const btn = document.getElementById('toggle-viz-btn');
        const hidden = panel.classList.toggle('hidden');
        btn.classList.toggle('active-teal', !hidden);
        if (!hidden) populateVizSelectors();
    });

    document.getElementById('close-join-btn')?.addEventListener('click', () => {
        document.getElementById('join-panel').classList.add('hidden');
        document.getElementById('toggle-join-btn').classList.remove('active-orange');
    });

    document.getElementById('close-viz-btn')?.addEventListener('click', () => {
        document.getElementById('viz-panel').classList.add('hidden');
        document.getElementById('toggle-viz-btn').classList.remove('active-teal');
    });

    document.getElementById('clear-custom-btn')?.addEventListener('click', clearCustomData);

    // Export buttons
    document.getElementById('export-all-btn').addEventListener('click', exportAll);
    document.getElementById('export-filtered-btn').addEventListener('click', exportFiltered);

    // AI buttons
    document.getElementById('ai-generate-btn').addEventListener('click', generateAiSql);
    document.getElementById('ai-run-btn').addEventListener('click', runAiQuery);
}

// ─── AI Query Builder ─────────────────────────────────────────────────────────

async function loadAiSamples(sourceId) {
    try {
        const samples = await fetchApi('GET', `/api/data/sample-queries?sourceId=${sourceId}&lang=${state.lang}`);
        const container = document.getElementById('ai-samples');
        container.innerHTML = samples.map(s =>
            `<button class="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 border border-purple-200"
                onclick="document.getElementById('ai-prompt').value='${escJs(s)}'"
            >${escHtml(s)}</button>`
        ).join('');
    } catch { /* ignore */ }
}

async function generateAiSql() {
    const prompt = document.getElementById('ai-prompt').value.trim();
    if (!prompt) return;

    const btn = document.getElementById('ai-generate-btn');
    btn.disabled = true;
    btn.textContent = '⏳ ...';

    try {
        const result = await fetchApi('POST', '/api/data/ai-query', {
            sourceId: state.selectedSource,
            prompt,
            lang: state.lang,
        });
        state.generatedSql = result.sql;
        state.sqlExplanation = result.explanation;

        document.getElementById('ai-sql-output').textContent = result.sql;
        document.getElementById('ai-explanation').textContent = result.explanation;
        document.getElementById('ai-result-section').classList.remove('hidden');
        document.getElementById('ai-results-table').classList.add('hidden');
        document.getElementById('ai-result-count').textContent = '';
    } finally {
        btn.disabled = false;
        btn.innerHTML = `✨ ${ms() ? 'Jana' : 'Generate'}`;
    }
}

async function runAiQuery() {
    if (!state.generatedSql) return;
    const btn = document.getElementById('ai-run-btn');
    btn.disabled = true;

    try {
        // Execute the query via the standard query endpoint, applying the generated SQL
        // For the demo, we re-run the NL query against the mock data client-side.
        // In production, send the SQL to a safe execution endpoint.
        const result = await fetchApi('POST', '/api/data/query', {
            sourceId: state.selectedSource,
            globalSearch: document.getElementById('ai-prompt').value,
            columnFilters: {},
            sortKey: '',
            sortDirection: 'asc',
            page: 0,
            pageSize: 100,
            lang: state.lang,
        });

        const rows = result.rows ?? [];
        state.aiResults = rows;

        document.getElementById('ai-result-count').textContent =
            `${rows.length} ${ms() ? 'rekod' : 'records'}`;

        const src = state.dataSources.find(s => s.id === state.selectedSource);
        const cols = src?.columns ?? [];
        const tableHtml = buildMiniTable(rows, cols);
        const tableEl = document.getElementById('ai-results-table');
        tableEl.innerHTML = tableHtml;
        tableEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
    }
}

function buildMiniTable(rows, columns) {
    if (!rows.length) return `<p class="p-4 text-slate-400">${ms() ? 'Tiada rekod' : 'No records'}</p>`;
    const head = columns.map(c => `<th>${escHtml(c.label)}</th>`).join('');
    const body = rows.slice(0, 50).map((r, i) =>
        `<tr><td>${i + 1}</td>${columns.map(c => `<td>${escHtml(String(r[c.key] ?? '-'))}</td>`).join('')}</tr>`
    ).join('');
    return `<table><thead><tr><th>#</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

// ─── Join Builder ─────────────────────────────────────────────────────────────

function initJoinBuilder() {
    // Update common columns when sources are checked
    document.querySelectorAll('.join-source-check').forEach(chk => {
        chk.addEventListener('change', updateJoinColumns);
    });

    document.getElementById('preview-join-btn').addEventListener('click', previewJoin);
    document.getElementById('load-join-btn')?.addEventListener('click', loadJoinIntoTable);
    document.getElementById('export-join-btn')?.addEventListener('click', exportJoin);
    document.getElementById('save-join-btn')?.addEventListener('click', saveJoin);

    // Saved join actions (delegated)
    document.getElementById('saved-joins-list')?.addEventListener('click', e => {
        const row = e.target.closest('[data-join-id]');
        if (!row) return;
        if (e.target.classList.contains('load-saved-join-btn'))
            loadSavedJoin(row.dataset.joinId);
        if (e.target.classList.contains('delete-saved-join-btn'))
            deleteSavedJoin(row.dataset.joinId);
    });
}

function getSelectedJoinSources() {
    return [...document.querySelectorAll('.join-source-check:checked')].map(c => c.value);
}

async function updateJoinColumns() {
    const sources = getSelectedJoinSources();
    const select = document.getElementById('join-column-select');
    if (sources.length < 2) {
        select.innerHTML = `<option value="">${ms() ? 'Pilih sekurang-kurangnya 2 sumber' : 'Select at least 2 sources'}</option>`;
        return;
    }
    try {
        const cols = await fetchApi('GET', `/api/join/common-columns?${sources.map(s => `sources=${s}`).join('&')}&lang=${state.lang}`);
        select.innerHTML = `<option value="">${ms() ? 'Pilih lajur...' : 'Select column...'}</option>` +
            cols.map(c => `<option value="${c}">${c}</option>`).join('');
    } catch (e) {
        select.innerHTML = `<option value="">${ms() ? 'Ralat memuat lajur' : 'Error loading columns'}</option>`;
    }
}

async function previewJoin() {
    const sourceIds = getSelectedJoinSources();
    const joinColumn = document.getElementById('join-column-select').value;
    const joinType = document.getElementById('join-type-select').value;

    if (sourceIds.length < 2 || !joinColumn) {
        alert(ms() ? 'Sila pilih sekurang-kurangnya 2 sumber dan lajur gabungan.' : 'Select at least 2 sources and a join column.');
        return;
    }

    const btn = document.getElementById('preview-join-btn');
    btn.disabled = true;
    btn.textContent = `⏳ ${ms() ? 'Memproses...' : 'Processing...'}`;

    try {
        const result = await fetchApi('POST', '/api/join/preview', { sourceIds, joinColumn, joinType, lang: state.lang });

        state.joinPreviewData = result.rows;
        state.joinPreviewColumns = result.columns;
        state.joinPreviewLabel = result.label;

        const title = document.getElementById('join-preview-title');
        title.textContent = `${result.label} — ${result.rowCount} ${ms() ? 'rekod' : 'records'} (${ms() ? 'pratonton 30 baris' : 'preview 30 rows'})`;

        const tableContainer = document.getElementById('join-preview-table');
        tableContainer.innerHTML = buildMiniTable(result.rows.slice(0, 30), result.columns);
        document.getElementById('join-preview-container').classList.remove('hidden');
        document.getElementById('load-join-btn').classList.remove('hidden');
        document.getElementById('export-join-btn').classList.remove('hidden');
        document.getElementById('join-save-section').classList.remove('hidden');
    } catch (e) {
        alert(`${ms() ? 'Ralat' : 'Error'}: ${e.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `👁 ${ms() ? 'Pratonton Gabungan' : 'Preview Join'}`;
    }
}

function loadJoinIntoTable() {
    if (!state.joinPreviewData) return;
    state.customData = state.joinPreviewData;
    state.customColumns = state.joinPreviewColumns;
    state.customLabel = state.joinPreviewLabel;
    state.page = 0;
    state.globalSearch = '';
    state.columnFilters = {};

    showCustomDataBanner(state.customLabel, state.customData.length);
    applyFiltersAndRender();
    document.getElementById('join-panel').classList.add('hidden');
    document.getElementById('toggle-join-btn').classList.remove('active-orange');
}

function clearCustomData() {
    state.customData = null;
    state.customColumns = [];
    state.customLabel = '';
    state.page = 0;
    state.columnFilters = {};
    document.getElementById('custom-data-banner').classList.add('hidden');
    loadSourceData(state.selectedSource);
}

function showCustomDataBanner(label, count) {
    document.getElementById('custom-data-label').textContent = label;
    document.getElementById('custom-data-count').textContent =
        `${count} ${ms() ? 'rekod digabungkan' : 'joined records'}`;
    document.getElementById('custom-data-banner').classList.remove('hidden');
}

async function saveJoin() {
    const name = document.getElementById('join-save-name').value.trim();
    if (!name) return;

    const sourceIds = getSelectedJoinSources();
    const joinColumn = document.getElementById('join-column-select').value;
    const joinType = document.getElementById('join-type-select').value;

    try {
        const result = await fetchApi('POST', '/api/join/save', {
            sourceIds, joinColumn, joinType, saveName: name, lang: state.lang
        });
        alert(`${ms() ? 'Berjaya disimpan' : 'Saved successfully'} (${result.rowCount} ${ms() ? 'rekod' : 'records'})`);
        document.getElementById('join-save-name').value = '';
    } catch (e) {
        alert(`${ms() ? 'Ralat' : 'Error'}: ${e.message}`);
    }
}

async function loadSavedJoin(id) {
    try {
        const result = await fetchApi('POST', `/api/join/load/${id}?lang=${state.lang}`);
        state.customData = result.rows;
        state.customColumns = result.columns;
        state.customLabel = result.label;
        state.page = 0;
        state.columnFilters = {};
        showCustomDataBanner(result.label, result.rows.length);
        applyFiltersAndRender();
    } catch (e) {
        alert(`${ms() ? 'Ralat' : 'Error'}: ${e.message}`);
    }
}

async function deleteSavedJoin(id) {
    if (!confirm(ms() ? 'Padam gabungan ini?' : 'Delete this saved join?')) return;
    try {
        await fetchApi('DELETE', `/api/join/${id}`);
        document.querySelector(`[data-join-id="${id}"]`)?.remove();
    } catch (e) {
        alert(`${ms() ? 'Ralat' : 'Error'}: ${e.message}`);
    }
}

async function exportJoin() {
    const sourceIds = getSelectedJoinSources();
    const joinColumn = document.getElementById('join-column-select').value;
    const joinType = document.getElementById('join-type-select').value;

    const res = await fetch('/api/join/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceIds, joinColumn, joinType, lang: state.lang }),
    });
    if (!res.ok) { alert('Export failed'); return; }
    const blob = await res.blob();
    downloadBlob(blob, `SMPPI_Join_${Date.now()}.xlsx`);
}

// ─── Visualization ────────────────────────────────────────────────────────────

function initVisualization() {
    document.getElementById('viz-generate-btn').addEventListener('click', generateChart);
    document.getElementById('viz-ai-suggest-btn').addEventListener('click', aiSuggestViz);
}

function populateVizSelectors() {
    const columns = state.customData ? state.customColumns : state.currentColumns;
    const xSel = document.getElementById('viz-x-axis');
    const ySel = document.getElementById('viz-y-axis');

    xSel.innerHTML = columns.map(c => `<option value="${c.key}">${c.label}</option>`).join('');
    ySel.innerHTML = `<option value="__count">Count</option>` +
        columns.filter(c => c.dataType === 'decimal' || c.dataType === 'number')
            .map(c => `<option value="${c.key}">${c.label}</option>`).join('');
}

function aggregateData(data, xKey, yKey, aggregation) {
    const groups = {};
    data.forEach(row => {
        const xVal = String(row[xKey] ?? '(blank)');
        if (!groups[xVal]) groups[xVal] = [];
        const yRaw = row[yKey];
        const yNum = parseFloat(yRaw);
        groups[xVal].push(isNaN(yNum) ? 0 : yNum);
    });

    const labels = Object.keys(groups).slice(0, 30);
    const values = labels.map(lbl => {
        const vals = groups[lbl];
        if (aggregation === 'count') return vals.length;
        if (aggregation === 'sum')   return vals.reduce((a, b) => a + b, 0);
        if (aggregation === 'avg')   return vals.reduce((a, b) => a + b, 0) / vals.length;
        return vals.length;
    });

    return { labels, values };
}

function generateChart() {
    const data = state.filteredData.length ? state.filteredData : (state.customData ?? state.currentData);
    if (!data.length) return;

    const chartType = document.getElementById('viz-chart-type').value;
    const xKey = document.getElementById('viz-x-axis').value;
    const yKey = document.getElementById('viz-y-axis').value;
    const aggregation = document.getElementById('viz-aggregation').value;

    const { labels, values } = aggregateData(data, xKey, yKey === '__count' ? '__count_sentinel' : yKey, aggregation);

    document.getElementById('viz-chart-container').classList.remove('hidden');
    const canvas = document.getElementById('viz-chart');

    if (state.chartInstance) { state.chartInstance.destroy(); state.chartInstance = null; }

    const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1','#14b8a6','#e11d48'];

    state.chartInstance = new Chart(canvas.getContext('2d'), {
        type: chartType === 'doughnut' ? 'doughnut' : chartType,
        data: {
            labels,
            datasets: [{
                label: document.getElementById('viz-y-axis').options[document.getElementById('viz-y-axis').selectedIndex]?.text ?? aggregation,
                data: values,
                backgroundColor: chartType === 'line'
                    ? 'rgba(59,130,246,0.1)'
                    : labels.map((_, i) => COLORS[i % COLORS.length]),
                borderColor: chartType === 'line'
                    ? '#3b82f6'
                    : labels.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: chartType === 'line' ? 2 : 1,
                fill: chartType === 'line',
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: chartType === 'pie' || chartType === 'doughnut' ? 'right' : 'top' },
            },
        },
    });
}

function aiSuggestViz() {
    const columns = state.customData ? state.customColumns : state.currentColumns;
    // Suggest: first string col for X, first numeric col for Y, bar chart
    const xCol = columns.find(c => c.dataType === 'string') ?? columns[0];
    const yCol = columns.find(c => c.dataType === 'decimal' || c.dataType === 'number');

    if (xCol) document.getElementById('viz-x-axis').value = xCol.key;
    if (yCol) {
        document.getElementById('viz-y-axis').value = yCol.key;
        document.getElementById('viz-aggregation').value = 'sum';
        document.getElementById('viz-chart-type').value = 'bar';
    } else {
        document.getElementById('viz-y-axis').value = '__count';
        document.getElementById('viz-aggregation').value = 'count';
        document.getElementById('viz-chart-type').value = 'pie';
    }
    generateChart();
}

// ─── Export ───────────────────────────────────────────────────────────────────

async function exportAll() {
    const src = state.dataSources.find(s => s.id === state.selectedSource);
    try {
        const res = await fetch('/api/data/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sourceId: state.selectedSource,
                lang: state.lang,
                filteredOnly: false,
            }),
        });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        downloadBlob(blob, `SMPPI_${state.selectedSource}_all.xlsx`);
    } catch (e) {
        alert(e.message);
    }
}

async function exportFiltered() {
    try {
        const res = await fetch('/api/data/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sourceId: state.selectedSource,
                lang: state.lang,
                filteredOnly: true,
                queryRequest: {
                    sourceId: state.selectedSource,
                    globalSearch: state.globalSearch,
                    columnFilters: state.columnFilters,
                    sortKey: state.sortKey,
                    sortDirection: state.sortDir,
                    page: 0,
                    pageSize: 100000,
                    lang: state.lang,
                },
            }),
        });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        downloadBlob(blob, `SMPPI_${state.selectedSource}_filtered.xlsx`);
    } catch (e) {
        alert(e.message);
    }
}

// ─── Explain Popover ──────────────────────────────────────────────────────────

function initExplainPopover() {
    document.getElementById('explain-close').addEventListener('click', closeExplainPopover);
    document.getElementById('explain-action-btn').addEventListener('click', explainValue);
    document.addEventListener('mousedown', e => {
        const popover = document.getElementById('explain-popover');
        if (!popover.contains(e.target)) closeExplainPopover();
    });
}

let _currentExplainValue = '';
let _currentExplainCol = '';

function openExplainPopover(event, value, columnLabel) {
    if (!value || value === '-') return;
    _currentExplainValue = value;
    _currentExplainCol = columnLabel;

    const popover = document.getElementById('explain-popover');
    document.getElementById('explain-col-label').textContent = columnLabel;
    document.getElementById('explain-value').textContent = value;
    document.getElementById('explain-result').classList.add('hidden');
    document.getElementById('explain-result').textContent = '';
    document.getElementById('explain-action-btn').classList.remove('hidden');

    const rect = event.target.getBoundingClientRect();
    const pw = 320, ph = 180;
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + pw > window.innerWidth) left = window.innerWidth - pw - 16;
    if (top + ph > window.innerHeight) top = rect.top - ph - 4;

    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
    popover.classList.remove('hidden');
    event.stopPropagation();
}

async function explainValue() {
    document.getElementById('explain-action-btn').classList.add('hidden');
    document.getElementById('explain-result').textContent = ms() ? 'Menjana penjelasan...' : 'Generating explanation...';
    document.getElementById('explain-result').classList.remove('hidden');

    try {
        const result = await fetchApi('POST', '/api/data/explain', {
            value: _currentExplainValue,
            columnLabel: _currentExplainCol,
            lang: state.lang,
        });
        document.getElementById('explain-result').textContent = result.explanation;
    } catch {
        document.getElementById('explain-result').textContent = ms() ? 'Gagal menjana penjelasan.' : 'Failed to generate explanation.';
    }
}

function closeExplainPopover() {
    document.getElementById('explain-popover').classList.add('hidden');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

async function fetchApi(method, url, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escJs(s) {
    return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"');
}
