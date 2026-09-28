import { parseCsv, LIMITS, toCsv } from './csv.js';
import { validate, compareDatasets, comparisonReportRows } from './analysis.js';
import { countLabel } from './format.js';
import { suggestColumns } from './suggest.js';
import { whyIssueMatters, plainIssueTitle, plainIssueDetail, plainComparisonSummary } from './explain.js';
import { loadColumnPrefs, saveColumnPrefs } from './prefs.js';
import type { Dataset, Issue, ValidationResult, ComparisonResult } from './types.js';

type WorkflowMode = 'check' | 'compare';
const PREVIEW_ROWS = 8;

const currentInput = document.querySelector<HTMLInputElement>('#current-file')!;
const baselineInput = document.querySelector<HTMLInputElement>('#baseline-file')!;
const currentInfo = document.querySelector<HTMLElement>('#current-info')!;
const baselineInfo = document.querySelector<HTMLElement>('#baseline-info')!;
const currentBox = currentInput.closest('.upload-box')!;
const baselineBox = baselineInput.closest('.upload-box')!;
const baselinePanel = document.querySelector<HTMLElement>('#baseline-panel')!;
const keySelect = document.querySelector<HTMLSelectElement>('#key-column')!;
const requiredFields = document.querySelector<HTMLElement>('#required-columns')!;
const numericFields = document.querySelector<HTMLElement>('#numeric-columns')!;
const validationButton = document.querySelector<HTMLButtonElement>('#validate-button')!;
const compareButton = document.querySelector<HTMLButtonElement>('#compare-button')!;
const rememberButton = document.querySelector<HTMLButtonElement>('#remember-prefs')!;
const issuesButton = document.querySelector<HTMLButtonElement>('#download-issues')!;
const compareDownloadButton = document.querySelector<HTMLButtonElement>('#download-comparison')!;
const issueBody = document.querySelector<HTMLElement>('#issue-body')!;
const compareBody = document.querySelector<HTMLElement>('#comparison-body')!;
const status = document.querySelector<HTMLElement>('#status')!;
const stats = document.querySelector<HTMLElement>('#stats')!;
const loadBanner = document.querySelector<HTMLElement>('#load-banner')!;
const suggestBanner = document.querySelector<HTMLElement>('#suggest-banner')!;
const summaryCard = document.querySelector<HTMLElement>('#summary-card')!;
const summaryHeadline = document.querySelector<HTMLElement>('#summary-headline')!;
const summaryDetail = document.querySelector<HTMLElement>('#summary-detail')!;
const validationResults = document.querySelector<HTMLElement>('#validation-results')!;
const comparisonResults = document.querySelector<HTMLElement>('#comparison-results')!;
const modeCheck = document.querySelector<HTMLButtonElement>('#mode-check')!;
const modeCompare = document.querySelector<HTMLButtonElement>('#mode-compare')!;
const loadSampleButton = document.querySelector<HTMLButtonElement>('#load-sample')!;
const currentRoleTag = document.querySelector<HTMLElement>('#current-role-tag')!;
const currentUploadTitle = document.querySelector<HTMLElement>('#current-upload-title')!;
const currentUploadHint = document.querySelector<HTMLElement>('#current-upload-hint')!;
const currentPreviewTitle = document.querySelector<HTMLElement>('#current-preview-title')!;
const feedback = document.querySelector<HTMLAnchorElement>('#feedback-link')!;
const feedbackUrl = 'https://github.com/Marshall-Studio/FieldCheck/issues/new';
if (feedbackUrl) { feedback.href = feedbackUrl; feedback.hidden = false; }

let mode: WorkflowMode = 'check';
let current: Dataset | undefined;
let baseline: Dataset | undefined;
let lastValidation: ValidationResult | undefined;
let lastComparison: ComparisonResult | undefined;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, value?: string, cls?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (cls) node.className = cls;
  return node;
}
function clear(element: Element): void { element.replaceChildren(); }
function setStatus(message: string, opts: { bad?: boolean; busy?: boolean } = {}): void {
  status.textContent = message;
  status.classList.toggle('error', !!opts.bad);
  status.classList.toggle('is-busy', !!opts.busy);
}
function setLoadBanner(message: string, bad = false): void {
  loadBanner.hidden = !message;
  loadBanner.textContent = message;
  loadBanner.classList.toggle('is-error', bad);
}
function emptyRow(columns: number, message: string): HTMLTableRowElement {
  const row = el('tr');
  const cell = el('td', message, 'empty-cell');
  cell.colSpan = columns;
  row.append(cell);
  return row;
}
function renderStats(items: Array<[string, string, boolean?]>): void {
  clear(stats);
  for (const [label, num, emphasis] of items) {
    const box = el('div', undefined, emphasis ? 'stat emphasis' : 'stat');
    box.append(el('strong', num), el('span', label));
    stats.append(box);
  }
}
function resetSummary(): void {
  summaryCard.classList.remove('has-issues', 'is-clean');
  summaryHeadline.textContent = 'No results yet.';
  summaryDetail.textContent = mode === 'compare'
    ? 'Load an older and newer file, review the suggested ID column, then compare.'
    : 'Load a file, review suggested checks, then look for problems.';
}
function renderEmptyResults(): void {
  clear(issueBody); clear(compareBody);
  issueBody.append(emptyRow(4, 'Load a dataset and check for problems.'));
  compareBody.append(emptyRow(5, 'Load older and newer datasets to compare.'));
  document.querySelector<HTMLElement>('#issue-count')!.textContent = 'No check run yet.';
  document.querySelector<HTMLElement>('#comparison-count')!.textContent = 'No comparison run yet.';
  renderStats([
    ['Records', '—'],
    ['Rows with issues', '—'],
    ['Added', '—'],
    ['Changed', '—'],
    ['Removed', '—']
  ]);
  resetSummary();
}

function renderPreview(dataset: Dataset | undefined, head: HTMLElement, body: HTMLElement, meta: HTMLElement, emptyLabel: string): void {
  clear(head); clear(body);
  if (!dataset) {
    meta.textContent = emptyLabel;
    body.append(emptyRow(1, 'No rows to preview yet.'));
    return;
  }
  meta.textContent = `${dataset.name} · ${dataset.rows.length.toLocaleString()} records · ${dataset.columns.length} columns · showing first ${Math.min(PREVIEW_ROWS, dataset.rows.length)}`;
  const hr = el('tr');
  hr.append(el('th', 'Line'));
  for (const col of dataset.columns) hr.append(el('th', col));
  head.append(hr);
  const rows = dataset.rows.slice(0, PREVIEW_ROWS);
  if (!rows.length) {
    body.append(emptyRow(dataset.columns.length + 1, 'This file has headers but no data rows.'));
    return;
  }
  for (const row of rows) {
    const tr = el('tr');
    tr.append(el('td', String(row.line)));
    for (const col of dataset.columns) {
      const value = row.values[col] ?? '';
      tr.append(el('td', value === '' ? '·' : value, value === '' ? 'empty-cell' : undefined));
    }
    body.append(tr);
  }
}

function refreshPreviews(): void {
  renderPreview(
    baseline,
    document.querySelector('#baseline-preview-head')!,
    document.querySelector('#baseline-preview-body')!,
    document.querySelector('#baseline-preview-meta')!,
    'Load an older file to see rows here.'
  );
  renderPreview(
    current,
    document.querySelector('#current-preview-head')!,
    document.querySelector('#current-preview-body')!,
    document.querySelector('#current-preview-meta')!,
    mode === 'compare' ? 'Load a newer file to see rows here.' : 'Load a file to see rows here.'
  );
}

function controlGroup(container: HTMLElement, columns: string[], selected: Set<string>, suggested: Set<string>): void {
  clear(container);
  if (!columns.length) {
    container.append(el('span', 'Load a dataset first.', 'muted small'));
    return;
  }
  for (const column of columns) {
    const label = el('label', undefined, suggested.has(column) ? 'check-option is-suggested' : 'check-option');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = column;
    cb.checked = selected.has(column);
    label.append(cb, document.createTextNode(suggested.has(column) ? `${column} (suggested)` : column));
    container.append(label);
  }
}
function checkedColumns(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLInputElement>('input:checked')].map(x => x.value);
}

function matchColumn(columns: string[], desired?: string): string | undefined {
  if (!desired) return undefined;
  return columns.find(c => c.toLocaleLowerCase() === desired.toLocaleLowerCase());
}

function applyConfiguration(dataset: Dataset): void {
  clear(keySelect);
  keySelect.append(new Option('Choose record ID column', ''));
  for (const col of dataset.columns) keySelect.append(new Option(col, col));

  const remembered = loadColumnPrefs(dataset.columns);
  const suggestions = suggestColumns(dataset);
  const key = matchColumn(dataset.columns, remembered?.keyColumn) ?? suggestions.keyColumn;
  if (key) keySelect.value = key;

  const rememberedRequired = (remembered?.requiredColumns ?? [])
    .map(c => matchColumn(dataset.columns, c))
    .filter((c): c is string => !!c);
  const rememberedNumeric = (remembered?.numericColumns ?? [])
    .map(c => matchColumn(dataset.columns, c))
    .filter((c): c is string => !!c);
  const requiredSelected = new Set(remembered ? rememberedRequired : suggestions.requiredColumns);
  const numericSelected = new Set(remembered ? rememberedNumeric : suggestions.numericColumns);
  controlGroup(requiredFields, dataset.columns, requiredSelected, new Set(suggestions.requiredColumns));
  controlGroup(numericFields, dataset.columns, numericSelected, new Set(suggestions.numericColumns));

  const parts: string[] = [];
  if (remembered) parts.push('Restored your saved column choices for this header layout.');
  if (suggestions.keyReason) parts.push(suggestions.keyReason);
  else if (suggestions.notes[0]) parts.push(suggestions.notes[0]);
  parts.push('Suggestions only use columns that already exist — FieldCheck never invents IDs. Change anything before running.');
  suggestBanner.textContent = parts.join(' ');
  suggestBanner.classList.remove('is-error');
}

function updateActions(): void {
  validationButton.disabled = !current;
  compareButton.disabled = !(current && baseline) || mode !== 'compare';
  compareButton.hidden = mode !== 'compare';
  rememberButton.disabled = !current;
  issuesButton.disabled = !lastValidation;
  compareDownloadButton.disabled = !lastComparison;
  validationResults.hidden = false;
  comparisonResults.hidden = mode !== 'compare';
}

function setMode(next: WorkflowMode, opts: { announce?: boolean } = {}): void {
  mode = next;
  document.body.classList.toggle('mode-compare', mode === 'compare');
  modeCheck.classList.toggle('is-active', mode === 'check');
  modeCompare.classList.toggle('is-active', mode === 'compare');
  modeCheck.setAttribute('aria-selected', String(mode === 'check'));
  modeCompare.setAttribute('aria-selected', String(mode === 'compare'));
  baselinePanel.hidden = mode !== 'compare';
  if (mode === 'compare') {
    currentRoleTag.textContent = 'Newer version';
    currentRoleTag.className = 'role-tag newer';
    currentUploadTitle.textContent = 'Newer dataset';
    currentUploadHint.textContent = 'The later export to compare';
    currentPreviewTitle.textContent = 'Preview · newer file';
  } else {
    currentRoleTag.textContent = 'File to check';
    currentRoleTag.className = 'role-tag newer';
    currentUploadTitle.textContent = 'Dataset';
    currentUploadHint.textContent = 'Required for checking problems';
    currentPreviewTitle.textContent = 'Preview · file to check';
  }
  updateActions();
  resetSummary();
  if (opts.announce) {
    setStatus(mode === 'compare'
      ? 'Compare mode: load an older file and a newer file, then review the unique ID.'
      : 'Check mode: load one CSV to look for data-quality problems.');
  }
}

function updateDataset(kind: 'current' | 'baseline', data: Dataset | undefined): void {
  if (kind === 'current') {
    current = data;
    currentInfo.textContent = data
      ? `Loaded · ${data.name} · ${data.rows.length.toLocaleString()} records · ${data.columns.length} columns`
      : 'No file selected.';
    currentBox.classList.toggle('is-loaded', !!data);
    if (data) applyConfiguration(data);
    else {
      clear(keySelect);
      keySelect.append(new Option('Choose record ID column', ''));
      clear(requiredFields); requiredFields.append(el('span', 'Load a dataset first.', 'muted small'));
      clear(numericFields); numericFields.append(el('span', 'Load a dataset first.', 'muted small'));
      suggestBanner.textContent = 'Load a dataset to get safe column suggestions. You can override anything.';
    }
  } else {
    baseline = data;
    baselineInfo.textContent = data
      ? `Loaded · ${data.name} · ${data.rows.length.toLocaleString()} records · ${data.columns.length} columns`
      : 'No older file selected.';
    baselineBox.classList.toggle('is-loaded', !!data);
  }
  lastValidation = undefined;
  lastComparison = undefined;
  refreshPreviews();
  renderEmptyResults();
  updateActions();
}

async function readFile(file: File, kind: 'current' | 'baseline'): Promise<void> {
  if (file.size > LIMITS.bytes) {
    const previous = kind === 'current' ? current : baseline;
    setStatus(previous
      ? `The file exceeds the 8 MB V1 limit. Previous ${kind === 'current' ? 'newer' : 'older'} dataset was kept.`
      : 'The file exceeds the 8 MB V1 limit.', { bad: true });
    return;
  }
  try {
    setStatus(`Reading ${file.name}…`, { busy: true });
    const dataset = parseCsv(await file.text(), file.name);
    updateDataset(kind, dataset);
    const label = kind === 'baseline' ? 'older' : (mode === 'compare' ? 'newer' : 'current');
    setLoadBanner(`Loaded ${label} file “${dataset.name}” with ${dataset.rows.length.toLocaleString()} data rows. Preview is below.`);
    setStatus(`Loaded ${dataset.name} locally. Contents stay in this browser tab.`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Could not read this file.';
    const previous = kind === 'current' ? current : baseline;
    setStatus(previous ? `${detail} Previous dataset was kept.` : detail, { bad: true });
    setLoadBanner(detail, true);
  }
}

currentInput.addEventListener('change', () => { const file = currentInput.files?.[0]; if (file) void readFile(file, 'current'); });
baselineInput.addEventListener('change', () => { const file = baselineInput.files?.[0]; if (file) void readFile(file, 'baseline'); });
modeCheck.addEventListener('click', () => setMode('check', { announce: true }));
modeCompare.addEventListener('click', () => setMode('compare', { announce: true }));

function addIssueRow(issue: Issue): void {
  const tr = el('tr');
  const finding = el('td');
  finding.append(el('span', plainIssueTitle(issue), 'badge badge-issue'), document.createTextNode(' '));
  finding.append(el('div', plainIssueDetail(issue)));
  tr.append(finding);
  tr.append(el('td', `Line ${issue.row}`));
  tr.append(el('td', issue.value === '' ? '(blank)' : issue.value));
  tr.append(el('td', whyIssueMatters(issue.code)));
  issueBody.append(tr);
}

function renderIssueTable(result: ValidationResult): void {
  clear(issueBody);
  const shown = result.issues.slice(0, 250);
  if (!shown.length) issueBody.append(emptyRow(4, 'No problems found for the selected checks.'));
  else for (const issue of shown) addIssueRow(issue);
  document.querySelector<HTMLElement>('#issue-count')!.textContent =
    `${countLabel(result.issues.length, 'finding')} across ${countLabel(result.issueRows, 'row')}` +
    (shown.length < result.issues.length ? ' · first 250 shown; export includes all' : '');
}

function renderComparison(result: ComparisonResult): void {
  clear(compareBody);
  const rows: HTMLTableRowElement[] = [];
  for (const r of result.added) {
    const tr = el('tr');
    tr.append(el('td')); tr.firstElementChild!.append(el('span', 'Added', 'badge badge-added'));
    tr.append(el('td', r.key), el('td', '—'), el('td', '—', 'empty-cell'), el('td', 'New record in newer file', 'cell-new'));
    rows.push(tr);
  }
  for (const r of result.removed) {
    const tr = el('tr');
    tr.append(el('td')); tr.firstElementChild!.append(el('span', 'Removed', 'badge badge-removed'));
    tr.append(el('td', r.key), el('td', '—'), el('td', 'Present only in older file', 'cell-old'), el('td', '—', 'empty-cell'));
    rows.push(tr);
  }
  for (const r of result.changed) for (const d of r.differences) {
    const tr = el('tr');
    tr.append(el('td')); tr.firstElementChild!.append(el('span', 'Changed', 'badge badge-changed'));
    tr.append(el('td', r.key), el('td', d.column), el('td', d.before === '' ? '(blank)' : d.before, 'cell-old'), el('td', d.after === '' ? '(blank)' : d.after, 'cell-new'));
    rows.push(tr);
  }
  const shown = rows.slice(0, 250);
  if (!shown.length) compareBody.append(emptyRow(5, 'No differences found for matching IDs.'));
  else for (const row of shown) compareBody.append(row);
  const summary = plainComparisonSummary(result);
  document.querySelector<HTMLElement>('#comparison-count')!.textContent =
    `${summary.detail}${rows.length > shown.length ? ' · first 250 change rows shown' : ''}`;
}

validationButton.addEventListener('click', () => {
  if (!current) return;
  try {
    setStatus('Checking for problems…', { busy: true });
    lastValidation = validate(current, {
      keyColumn: keySelect.value || undefined,
      requiredColumns: checkedColumns(requiredFields),
      numericColumns: checkedColumns(numericFields)
    });
    renderIssueTable(lastValidation);
    issuesButton.disabled = false;
    const c = lastComparison;
    renderStats([
      ['Records', String(lastValidation.rowCount), true],
      ['Rows with issues', String(lastValidation.issueRows), lastValidation.issueRows > 0],
      ['Added', c ? String(c.added.length) : '—'],
      ['Changed', c ? String(c.changed.length) : '—'],
      ['Removed', c ? String(c.removed.length) : '—']
    ]);
    if (lastValidation.issues.length === 0) {
      summaryCard.classList.remove('has-issues');
      summaryCard.classList.add('is-clean');
      summaryHeadline.textContent = 'No problems found for the selected checks.';
      summaryDetail.textContent = `Reviewed ${countLabel(lastValidation.rowCount, 'record')} in “${current.name}”.`;
    } else {
      summaryCard.classList.add('has-issues');
      summaryCard.classList.remove('is-clean');
      summaryHeadline.textContent = `Found ${countLabel(lastValidation.issues.length, 'problem')} in ${countLabel(lastValidation.issueRows, 'row')}.`;
      summaryDetail.textContent = 'Each finding shows the affected line, the value that failed, and why it matters. Export includes the full list.';
    }
    setStatus(`Check complete: ${countLabel(lastValidation.issues.length, 'finding')} in ${countLabel(lastValidation.issueRows, 'row')}.`);
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Validation failed.', { bad: true }); }
});

compareButton.addEventListener('click', () => {
  if (!current || !baseline) return;
  if (!keySelect.value) { setStatus('Choose an existing unique record ID column before comparing.', { bad: true }); return; }
  try {
    setStatus('Comparing older and newer files by record ID…', { busy: true });
    lastComparison = compareDatasets(baseline, current, keySelect.value);
    renderComparison(lastComparison);
    compareDownloadButton.disabled = false;
    const v = lastValidation;
    renderStats([
      ['Records', String(current.rows.length)],
      ['Rows with issues', v ? String(v.issueRows) : '—'],
      ['Added', String(lastComparison.added.length), lastComparison.added.length > 0],
      ['Changed', String(lastComparison.changed.length), lastComparison.changed.length > 0],
      ['Removed', String(lastComparison.removed.length), lastComparison.removed.length > 0]
    ]);
    const summary = plainComparisonSummary(lastComparison);
    summaryCard.classList.remove('has-issues', 'is-clean');
    if (lastComparison.added.length + lastComparison.removed.length + lastComparison.changed.length === 0) {
      summaryCard.classList.add('is-clean');
      summaryHeadline.textContent = 'Older and newer files match for every shared ID.';
    } else {
      summaryHeadline.textContent = summary.headline;
    }
    summaryDetail.textContent = `${summary.detail}. Older values and newer values are shown side by side below.`;
    setStatus('Comparison complete. Records were matched by ID, not by spreadsheet row order.');
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Comparison failed.', { bad: true }); }
});

rememberButton.addEventListener('click', () => {
  if (!current) return;
  saveColumnPrefs(current.columns, {
    keyColumn: keySelect.value || undefined,
    requiredColumns: checkedColumns(requiredFields),
    numericColumns: checkedColumns(numericFields)
  });
  setStatus('Saved these column choices on this device for spreadsheets with the same headers.');
  suggestBanner.textContent = 'Saved on this device. Next time the same headers appear, FieldCheck will restore these choices. Still never invents IDs.';
});

function download(name: string, text: string): void {
  const objectUrl = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
function reportRow(issue: Issue): string[] {
  return [String(issue.row), issue.code.replaceAll('_', ' '), issue.column, issue.value, issue.message, whyIssueMatters(issue.code)];
}
issuesButton.addEventListener('click', () => {
  if (!lastValidation) return;
  download('fieldcheck-issues.csv', toCsv([
    ['Line', 'Issue', 'Column', 'Value', 'Description', 'Why it matters'],
    ...lastValidation.issues.map(reportRow)
  ]));
});
compareDownloadButton.addEventListener('click', () => {
  if (!lastComparison) return;
  download('fieldcheck-comparison.csv', toCsv(comparisonReportRows(lastComparison)));
});

loadSampleButton.addEventListener('click', async () => {
  loadSampleButton.disabled = true;
  setMode('compare');
  setStatus('Loading maintenance sample files…', { busy: true });
  setLoadBanner('Loading older and newer sample spreadsheets…');
  try {
    const [a, b] = await Promise.all([
      fetch('./sample-data/maintenance-before.csv').then(r => { if (!r.ok) throw new Error('Could not load older sample.'); return r.text(); }),
      fetch('./sample-data/maintenance-current.csv').then(r => { if (!r.ok) throw new Error('Could not load newer sample.'); return r.text(); })
    ]);
    updateDataset('baseline', parseCsv(a, 'maintenance-before.csv (sample · older)'));
    updateDataset('current', parseCsv(b, 'maintenance-current.csv (sample · newer)'));
    // Sample intentionally demonstrates missing property + invalid cost.
    keySelect.value = 'work_order_id';
    for (const cb of requiredFields.querySelectorAll<HTMLInputElement>('input')) cb.checked = ['property', 'status'].includes(cb.value);
    for (const cb of numericFields.querySelectorAll<HTMLInputElement>('input')) cb.checked = ['cost', 'hours'].includes(cb.value);
    setLoadBanner('Sample loaded: older maintenance-before.csv (5 rows) and newer maintenance-current.csv (6 rows). Scroll to the previews, then check for problems or compare.');
    setStatus('Sample ready. Previews show the spreadsheet contents. Next: Check for problems, then Compare older vs newer.');
    suggestBanner.textContent = 'Sample configuration: unique ID work_order_id; required property + status; numeric hours + cost. You can change these.';
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sample could not load.';
    setStatus(message, { bad: true });
    setLoadBanner(message, true);
  } finally {
    loadSampleButton.disabled = false;
  }
});

setMode('check');
refreshPreviews();
renderEmptyResults();
updateActions();
