import { parseCsv, LIMITS, toCsv } from './csv.js';
import { validate, compareDatasets, comparisonReportRows } from './analysis.js';
import { countLabel } from './format.js';
import { suggestColumns } from './suggest.js';
import { whyIssueMatters, plainIssueTitle, plainIssueDetail, plainComparisonSummary } from './explain.js';
import { loadColumnPrefs, saveColumnPrefs, clearAllColumnPrefs } from './prefs.js';
import {
  PREVIEW_PAGE_SIZE,
  findingContext,
  filterDatasetRows,
  pageCount,
  pageForIndex,
  slicePage,
  findRowByRecordId,
  dataRowNumberForLine,
  type HighlightTarget
} from './inspect.js';
import { viewportTopForElement, containerScrollForHighlight } from './scroll.js';
import type { Dataset, DataRow, Issue, ValidationResult, ComparisonResult, ComparisonRow, CellDifference } from './types.js';

type WorkflowMode = 'check' | 'compare';
type LastOperation = 'none' | 'check' | 'compare';
const QUICK_PREVIEW_ROWS = 8;

const currentInput = document.querySelector<HTMLInputElement>('#current-file')!;
const baselineInput = document.querySelector<HTMLInputElement>('#baseline-file')!;
const currentInfo = document.querySelector<HTMLElement>('#current-info')!;
const baselineInfo = document.querySelector<HTMLElement>('#baseline-info')!;
const currentFileName = document.querySelector<HTMLElement>('#current-file-name')!;
const baselineFileName = document.querySelector<HTMLElement>('#baseline-file-name')!;
const currentPickerLabel = document.querySelector<HTMLElement>('#current-picker-label')!;
const baselinePickerLabel = document.querySelector<HTMLElement>('#baseline-picker-label')!;
const currentBox = document.querySelector<HTMLElement>('#current-box')!;
const baselineBox = document.querySelector<HTMLElement>('#baseline-box')!;
const baselinePanel = document.querySelector<HTMLElement>('#baseline-panel')!;
const currentOpenPreview = document.querySelector<HTMLButtonElement>('#current-open-preview')!;
const baselineOpenPreview = document.querySelector<HTMLButtonElement>('#baseline-open-preview')!;
const keySelect = document.querySelector<HTMLSelectElement>('#key-column')!;
const requiredFields = document.querySelector<HTMLElement>('#required-columns')!;
const numericFields = document.querySelector<HTMLElement>('#numeric-columns')!;
const validationButton = document.querySelector<HTMLButtonElement>('#validate-button')!;
const compareButton = document.querySelector<HTMLButtonElement>('#compare-button')!;
const rememberButton = document.querySelector<HTMLButtonElement>('#remember-prefs')!;
const clearPrefsButton = document.querySelector<HTMLButtonElement>('#clear-prefs')!;
const issuesButton = document.querySelector<HTMLButtonElement>('#download-issues')!;
const compareDownloadButton = document.querySelector<HTMLButtonElement>('#download-comparison')!;
const issueBody = document.querySelector<HTMLElement>('#issue-body')!;
const compareBody = document.querySelector<HTMLElement>('#comparison-body')!;
const status = document.querySelector<HTMLElement>('#status')!;
const stats = document.querySelector<HTMLElement>('#stats')!;
const loadBanner = document.querySelector<HTMLElement>('#load-banner')!;
const suggestBanner = document.querySelector<HTMLElement>('#suggest-banner')!;
const summaryCard = document.querySelector<HTMLElement>('#summary-card')!;
const operationLabel = document.querySelector<HTMLElement>('#operation-label')!;
const summaryHeadline = document.querySelector<HTMLElement>('#summary-headline')!;
const summaryDetail = document.querySelector<HTMLElement>('#summary-detail')!;
const nextSteps = document.querySelector<HTMLElement>('#next-steps')!;
const nextStepsList = document.querySelector<HTMLElement>('#next-steps-list')!;
const validationResults = document.querySelector<HTMLElement>('#validation-results')!;
const comparisonResults = document.querySelector<HTMLElement>('#comparison-results')!;
const modeCheck = document.querySelector<HTMLButtonElement>('#mode-check')!;
const modeCompare = document.querySelector<HTMLButtonElement>('#mode-compare')!;
const loadSampleButton = document.querySelector<HTMLButtonElement>('#load-sample')!;
const currentRoleTag = document.querySelector<HTMLElement>('#current-role-tag')!;
const currentUploadTitle = document.querySelector<HTMLElement>('#current-upload-title')!;
const currentUploadHint = document.querySelector<HTMLElement>('#current-upload-hint')!;
const currentPreviewTitle = document.querySelector<HTMLElement>('#current-preview-title')!;
const previewModal = document.querySelector<HTMLElement>('#preview-modal')!;
const modalTitle = document.querySelector<HTMLElement>('#modal-title')!;
const modalKindLabel = document.querySelector<HTMLElement>('#modal-kind-label')!;
const modalSourceLabel = document.querySelector<HTMLElement>('#modal-source-label')!;
const modalMeta = document.querySelector<HTMLElement>('#modal-meta')!;
const modalSearch = document.querySelector<HTMLInputElement>('#modal-search')!;
const modalPageLabel = document.querySelector<HTMLElement>('#modal-page-label')!;
const modalHighlightNote = document.querySelector<HTMLElement>('#modal-highlight-note')!;
const modalHead = document.querySelector<HTMLElement>('#modal-head')!;
const modalBody = document.querySelector<HTMLElement>('#modal-body')!;
const modalPrev = document.querySelector<HTMLButtonElement>('#modal-prev')!;
const modalNext = document.querySelector<HTMLButtonElement>('#modal-next')!;
const modalTableControls = document.querySelector<HTMLElement>('#modal-table-controls')!;
const modalTableWrap = document.querySelector<HTMLElement>('#modal-table-wrap')!;
const modalRecordView = document.querySelector<HTMLElement>('#modal-record-view')!;
const resultsHeading = document.querySelector<HTMLElement>('#results-heading')!;
const comparisonHeading = document.querySelector<HTMLElement>('#comparison-heading')!;
const feedback = document.querySelector<HTMLAnchorElement>('#feedback-link')!;
const feedbackUrl = 'https://github.com/Marshall-Studio/FieldCheck/issues/new';
if (feedbackUrl) { feedback.href = feedbackUrl; feedback.hidden = false; }

let mode: WorkflowMode = 'check';
let lastOperation: LastOperation = 'none';
let current: Dataset | undefined;
let baseline: Dataset | undefined;
let currentOrigin = '';
let baselineOrigin = '';
let lastValidation: ValidationResult | undefined;
let lastComparison: ComparisonResult | undefined;

interface TableModalState {
  view: 'table';
  dataset: Dataset;
  originNote: string;
  query: string;
  page: number;
  highlight?: HighlightTarget;
}
interface RecordModalState {
  view: 'record';
  kind: 'added' | 'removed' | 'changed';
  recordId: string;
  primaryFile: string;
  olderFile?: string;
  newerFile?: string;
  older?: DataRow;
  newer?: DataRow;
  columns: string[];
  highlightColumns: string[];
  csvLine?: number;
  dataRowNumber?: number;
  tableDataset?: Dataset;
  tableOrigin?: string;
}
type ModalState = TableModalState | RecordModalState;
let modalState: ModalState | undefined;

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
function setNextSteps(items: string[]): void {
  clear(nextStepsList);
  if (!items.length) { nextSteps.hidden = true; return; }
  nextSteps.hidden = false;
  for (const item of items) nextStepsList.append(el('li', item));
}
let modalScrollLockY = 0;

function scrollElementUnderHeader(node: HTMLElement): void {
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 74;
  // Instant scroll after layout so results land under the sticky header reliably
  // (smooth animation raced with Inspect record and left the viewport mid-page).
  const run = () => {
    const absoluteTop = node.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: viewportTopForElement(absoluteTop, headerHeight), behavior: 'auto' });
  };
  requestAnimationFrame(() => requestAnimationFrame(run));
}
function focusCheckResults(): void {
  validationResults.hidden = false;
  comparisonResults.hidden = true;
  scrollElementUnderHeader(resultsHeading);
}
function focusCompareResults(): void {
  comparisonResults.hidden = false;
  validationResults.hidden = true;
  scrollElementUnderHeader(comparisonHeading);
}
function resetSummary(): void {
  summaryCard.classList.remove('has-issues', 'is-clean');
  operationLabel.textContent = 'No operation run yet';
  summaryHeadline.textContent = 'No results yet.';
  summaryDetail.textContent = mode === 'compare'
    ? 'Load an older and newer file, review the suggested ID column, then compare.'
    : 'Load a file, review suggested checks, then look for problems.';
  setNextSteps([]);
}
function renderEmptyResults(): void {
  clear(issueBody); clear(compareBody);
  issueBody.append(emptyRow(5, 'Load a dataset and check for problems.'));
  compareBody.append(emptyRow(6, 'Load older and newer datasets to compare.'));
  document.querySelector<HTMLElement>('#issue-count')!.textContent = 'No check run yet.';
  document.querySelector<HTMLElement>('#comparison-count')!.textContent = 'No comparison run yet.';
  lastOperation = 'none';
  renderStats([
    ['Records', '—'],
    ['Rows with issues', '—'],
    ['Added', '—'],
    ['Changed', '—'],
    ['Removed', '—']
  ]);
  resetSummary();
}

function renderQuickPreview(dataset: Dataset | undefined, head: HTMLElement, body: HTMLElement, meta: HTMLElement, emptyLabel: string): void {
  clear(head); clear(body);
  if (!dataset) {
    meta.textContent = emptyLabel;
    body.append(emptyRow(1, 'No rows to preview yet.'));
    return;
  }
  meta.textContent = `${dataset.name} · ${dataset.rows.length.toLocaleString()} records · ${dataset.columns.length} columns · showing first ${Math.min(QUICK_PREVIEW_ROWS, dataset.rows.length)}`;
  const hr = el('tr');
  hr.append(el('th', 'CSV line'), el('th', 'Data row'));
  for (const col of dataset.columns) hr.append(el('th', col));
  head.append(hr);
  const rows = dataset.rows.slice(0, QUICK_PREVIEW_ROWS);
  if (!rows.length) {
    body.append(emptyRow(dataset.columns.length + 2, 'This file has headers but no data rows.'));
    return;
  }
  rows.forEach((row, index) => {
    const tr = el('tr');
    tr.append(el('td', String(row.line)), el('td', String(index + 1)));
    for (const col of dataset.columns) {
      const value = row.values[col] ?? '';
      tr.append(el('td', value === '' ? '·' : value, value === '' ? 'empty-cell' : undefined));
    }
    body.append(tr);
  });
}

function refreshPreviews(): void {
  renderQuickPreview(baseline, document.querySelector('#baseline-preview-head')!, document.querySelector('#baseline-preview-body')!, document.querySelector('#baseline-preview-meta')!, 'Load an older file to see rows here.');
  renderQuickPreview(current, document.querySelector('#current-preview-head')!, document.querySelector('#current-preview-body')!, document.querySelector('#current-preview-meta')!, mode === 'compare' ? 'Load a newer file to see rows here.' : 'Load a file to see rows here.');
}

function controlGroup(container: HTMLElement, columns: string[], selected: Set<string>, suggested: Set<string>, suggestedSuffix: string): void {
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
    label.append(cb, document.createTextNode(suggested.has(column) ? `${column} (${suggestedSuffix})` : column));
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

  const rememberedRequired = (remembered?.requiredColumns ?? []).map(c => matchColumn(dataset.columns, c)).filter((c): c is string => !!c);
  const rememberedNumeric = (remembered?.numericColumns ?? []).map(c => matchColumn(dataset.columns, c)).filter((c): c is string => !!c);
  const requiredSelected = new Set(remembered ? rememberedRequired : suggestions.requiredColumns);
  const numericSelected = new Set(remembered ? rememberedNumeric : suggestions.numericColumns);
  controlGroup(requiredFields, dataset.columns, requiredSelected, new Set(suggestions.requiredColumns), 'suggested · has blanks');
  controlGroup(numericFields, dataset.columns, numericSelected, new Set(suggestions.numericColumns), 'suggested · looks numeric');

  const parts: string[] = [];
  if (remembered) parts.push('Restored your saved checking preferences for this header layout.');
  if (suggestions.keyReason) parts.push(suggestions.keyReason);
  else if (suggestions.notes[0]) parts.push(suggestions.notes[0]);
  parts.push('Suggestions are optional heuristics — never invented IDs.');
  suggestBanner.textContent = parts.join(' ');
}

function updateFileCard(kind: 'current' | 'baseline'): void {
  const data = kind === 'current' ? current : baseline;
  const origin = kind === 'current' ? currentOrigin : baselineOrigin;
  const nameEl = kind === 'current' ? currentFileName : baselineFileName;
  const infoEl = kind === 'current' ? currentInfo : baselineInfo;
  const box = kind === 'current' ? currentBox : baselineBox;
  const picker = kind === 'current' ? currentPickerLabel : baselinePickerLabel;
  const openBtn = kind === 'current' ? currentOpenPreview : baselineOpenPreview;
  box.classList.toggle('is-loaded', !!data);
  openBtn.disabled = !data;
  if (!data) {
    nameEl.textContent = 'None loaded';
    infoEl.textContent = kind === 'baseline' ? 'Choose an older CSV to begin.' : 'Choose a CSV to begin.';
    picker.textContent = 'Choose CSV…';
    return;
  }
  nameEl.textContent = data.name;
  infoEl.textContent = `${origin ? `${origin} · ` : ''}${data.rows.length.toLocaleString()} records · ${data.columns.length} columns · stays in this browser`;
  picker.textContent = 'Replace CSV…';
}

function updateActions(): void {
  validationButton.disabled = !current;
  compareButton.disabled = !(current && baseline) || mode !== 'compare';
  compareButton.hidden = mode !== 'compare';
  rememberButton.disabled = !current;
  issuesButton.disabled = !lastValidation;
  compareDownloadButton.disabled = !lastComparison;
  comparisonResults.hidden = mode !== 'compare' && lastOperation !== 'compare';
  if (mode === 'check' && lastOperation !== 'compare') comparisonResults.hidden = true;
  updateFileCard('current');
  updateFileCard('baseline');
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
    currentUploadTitle.textContent = 'Newer dataset';
    currentUploadHint.textContent = 'The later export to compare';
    currentPreviewTitle.textContent = 'CSV table snippet · newer';
  } else {
    currentRoleTag.textContent = 'File to check';
    currentUploadTitle.textContent = 'Dataset';
    currentUploadHint.textContent = 'Required for checking problems';
    currentPreviewTitle.textContent = 'CSV table snippet · file to check';
  }
  updateActions();
  if (lastOperation === 'none') resetSummary();
  if (opts.announce) {
    setStatus(mode === 'compare'
      ? 'Compare mode: load an older file and a newer file, then review the unique ID.'
      : 'Check mode: load one CSV to look for data-quality problems.');
  }
}

function updateDataset(kind: 'current' | 'baseline', data: Dataset | undefined, originNote = ''): void {
  if (kind === 'current') {
    current = data;
    currentOrigin = data ? originNote : '';
    if (data) applyConfiguration(data);
    else {
      clear(keySelect);
      keySelect.append(new Option('Choose record ID column', ''));
      clear(requiredFields); requiredFields.append(el('span', 'Load a dataset first.', 'muted small'));
      clear(numericFields); numericFields.append(el('span', 'Load a dataset first.', 'muted small'));
      suggestBanner.textContent = 'Load a dataset to get safe column suggestions. Suggestions are heuristics you can override — they never invent IDs or prove a column must be required.';
    }
  } else {
    baseline = data;
    baselineOrigin = data ? originNote : '';
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
    setStatus(previous ? `The file exceeds the 8 MB V1 limit. Previous dataset was kept.` : 'The file exceeds the 8 MB V1 limit.', { bad: true });
    return;
  }
  try {
    setStatus(`Reading ${file.name}…`, { busy: true });
    const dataset = parseCsv(await file.text(), file.name);
    updateDataset(kind, dataset, 'Loaded from your device');
    const label = kind === 'baseline' ? 'older' : (mode === 'compare' ? 'newer' : 'current');
    setLoadBanner(`Loaded ${label} file “${dataset.name}” with ${dataset.rows.length.toLocaleString()} data rows. Browse CSV table to inspect pages.`);
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

function scrollHighlightInsideModal(): void {
  const target = modalTableWrap.querySelector<HTMLElement>('.cell-highlight, .row-highlight');
  if (!target) return;
  const itemOffset = target.getBoundingClientRect().top - modalTableWrap.getBoundingClientRect().top;
  modalTableWrap.scrollTop = containerScrollForHighlight(itemOffset, modalTableWrap.scrollTop, modalTableWrap.clientHeight);
}

function renderTableModal(state: TableModalState): void {
  modalKindLabel.textContent = 'CSV table preview · reconstructed from imported values';
  modalTableControls.hidden = false;
  modalTableWrap.hidden = false;
  modalRecordView.hidden = true;
  clear(modalRecordView);
  const filtered = filterDatasetRows(state.dataset, state.query);
  const pages = pageCount(filtered.length);
  state.page = Math.min(Math.max(1, state.page), pages);
  const pageRows = slicePage(filtered, state.page);
  modalTitle.textContent = state.dataset.name;
  modalSourceLabel.textContent = `${state.originNote || 'Loaded CSV'} · not an Excel/Google Sheets document`;
  modalMeta.textContent = `${filtered.length.toLocaleString()} matching records · ${state.dataset.columns.length} columns · page ${state.page} of ${pages}`;
  modalPageLabel.textContent = `Page ${state.page} of ${pages}`;
  modalPrev.disabled = state.page <= 1;
  modalNext.disabled = state.page >= pages;
  if (state.highlight) {
    modalHighlightNote.hidden = false;
    const idPart = state.highlight.recordId ? `Record ID ${state.highlight.recordId}. ` : '';
    const colPart = state.highlight.column && state.highlight.column !== '(whole row)' ? `Highlighted column “${state.highlight.column}”. ` : '';
    modalHighlightNote.textContent = `${idPart}${colPart}CSV line ${state.highlight.csvLine} · data row ${dataRowNumberForLine(state.dataset, state.highlight.csvLine) ?? '—'}.`;
  } else {
    modalHighlightNote.hidden = true;
    modalHighlightNote.textContent = '';
  }
  clear(modalHead); clear(modalBody);
  const hr = el('tr');
  hr.append(el('th', 'CSV line'), el('th', 'Data row'));
  for (const col of state.dataset.columns) hr.append(el('th', col));
  modalHead.append(hr);
  if (!pageRows.length) {
    modalBody.append(emptyRow(state.dataset.columns.length + 2, 'No records match this search.'));
    return;
  }
  for (const row of pageRows) {
    const dataRowNumber = state.dataset.rows.findIndex(r => r.line === row.line) + 1;
    const tr = el('tr');
    const isTarget = state.highlight?.csvLine === row.line;
    if (isTarget) tr.className = 'row-highlight';
    tr.append(el('td', String(row.line)), el('td', String(dataRowNumber)));
    for (const col of state.dataset.columns) {
      const value = row.values[col] ?? '';
      const td = el('td', value === '' ? '·' : value, value === '' ? 'empty-cell' : undefined);
      if (isTarget && state.highlight?.column === col) td.classList.add('cell-highlight');
      tr.append(td);
    }
    modalBody.append(tr);
  }
  window.setTimeout(scrollHighlightInsideModal, 30);
}

function renderRecordModal(state: RecordModalState): void {
  modalKindLabel.textContent = 'Inspect record';
  modalTableControls.hidden = true;
  modalTableWrap.hidden = true;
  modalRecordView.hidden = false;
  clear(modalHead); clear(modalBody); clear(modalRecordView);
  modalTitle.textContent = `Record ${state.recordId}`;
  modalSourceLabel.textContent = state.kind === 'changed'
    ? `Comparing ${state.olderFile} → ${state.newerFile}`
    : `Source file · ${state.primaryFile}`;
  const location = [
    state.csvLine ? `CSV line ${state.csvLine}` : '',
    state.dataRowNumber ? `data row ${state.dataRowNumber}` : ''
  ].filter(Boolean).join(' · ');
  modalMeta.textContent = location || 'Record values from the loaded CSV';
  modalHighlightNote.hidden = false;
  modalHighlightNote.textContent = state.kind === 'changed'
    ? 'Changed fields are highlighted. Values come from the imported CSV tables, not an editable spreadsheet workbook.'
    : `${state.kind === 'added' ? 'Added' : 'Removed'} record values from ${state.primaryFile}.`;

  const meta = el('div', undefined, 'record-meta');
  meta.append(el('span', `Record ID ${state.recordId}`));
  meta.append(el('span', `Change · ${state.kind}`));
  meta.append(el('span', state.primaryFile));
  modalRecordView.append(meta);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = el('tr');
  headRow.append(el('th', 'Column'));
  if (state.kind === 'changed') {
    headRow.append(el('th', `Older · ${state.olderFile ?? ''}`), el('th', `Newer · ${state.newerFile ?? ''}`));
  } else {
    headRow.append(el('th', 'Value'));
  }
  thead.append(headRow);
  table.append(thead);
  const tbody = document.createElement('tbody');
  for (const column of state.columns) {
    const tr = el('tr');
    const changed = state.highlightColumns.includes(column);
    const colCell = el('td', column, changed ? 'changed-col' : undefined);
    tr.append(colCell);
    if (state.kind === 'changed') {
      const before = state.older?.values[column] ?? '';
      const after = state.newer?.values[column] ?? '';
      tr.append(
        el('td', before === '' ? '(blank)' : before, changed ? 'cell-old changed-col' : 'cell-old'),
        el('td', after === '' ? '(blank)' : after, changed ? 'cell-new changed-col' : 'cell-new')
      );
    } else {
      const row = state.kind === 'added' ? state.newer : state.older;
      const value = row?.values[column] ?? '';
      tr.append(el('td', value === '' ? '(blank)' : value));
    }
    tbody.append(tr);
  }
  table.append(tbody);
  modalRecordView.append(table);

  if (state.tableDataset) {
    const browse = el('button', 'Browse this row in CSV table', 'button subtle');
    browse.type = 'button';
    browse.addEventListener('click', () => {
      const row = state.kind === 'removed' ? state.older : state.newer;
      if (!row || !state.tableDataset) return;
      openCsvTable(state.tableDataset, state.tableOrigin || state.primaryFile, {
        csvLine: row.line,
        column: state.highlightColumns[0],
        recordId: state.recordId
      }, state.recordId);
    });
    modalRecordView.append(browse);
  }
}

function renderModal(): void {
  if (!modalState) return;
  if (modalState.view === 'table') renderTableModal(modalState);
  else renderRecordModal(modalState);
}

function openModalShell(): void {
  modalScrollLockY = window.scrollY;
  document.body.style.top = `-${modalScrollLockY}px`;
  previewModal.hidden = false;
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  renderModal();
}

function openCsvTable(dataset: Dataset, originNote: string, highlight?: HighlightTarget, searchSeed = ''): void {
  let page = 1;
  if (highlight) {
    const filtered = filterDatasetRows(dataset, searchSeed);
    const index = filtered.findIndex(row => row.line === highlight.csvLine);
    page = pageForIndex(index);
  }
  modalState = { view: 'table', dataset, originNote, query: searchSeed, page, highlight };
  modalSearch.value = searchSeed;
  openModalShell();
}

function openRecordInspect(state: Omit<RecordModalState, 'view'>): void {
  modalState = { view: 'record', ...state };
  openModalShell();
}

function closePreview(): void {
  previewModal.hidden = true;
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo({ top: modalScrollLockY, behavior: 'auto' });
  modalState = undefined;
}

currentOpenPreview.addEventListener('click', () => { if (current) openCsvTable(current, currentOrigin || 'File to check'); });
baselineOpenPreview.addEventListener('click', () => { if (baseline) openCsvTable(baseline, baselineOrigin || 'Older file'); });
modalPrev.addEventListener('click', () => {
  if (!modalState || modalState.view !== 'table') return;
  modalState.page -= 1;
  renderModal();
});
modalNext.addEventListener('click', () => {
  if (!modalState || modalState.view !== 'table') return;
  modalState.page += 1;
  renderModal();
});
modalSearch.addEventListener('input', () => {
  if (!modalState || modalState.view !== 'table') return;
  modalState.query = modalSearch.value;
  modalState.page = 1;
  renderModal();
});
previewModal.querySelectorAll('[data-close-modal]').forEach(node => node.addEventListener('click', closePreview));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !previewModal.hidden) closePreview();
});

function inspectFinding(issue: Issue): void {
  if (!current) return;
  const key = keySelect.value || undefined;
  const context = findingContext(current, issue, key);
  openCsvTable(current, currentOrigin || 'Checked file', {
    csvLine: issue.row,
    column: issue.column === '(whole row)' ? undefined : issue.column,
    recordId: context.recordId
  }, context.recordId ?? '');
}

function addIssueRow(issue: Issue): void {
  if (!current) return;
  const key = keySelect.value || undefined;
  const context = findingContext(current, issue, key);
  const tr = el('tr');
  const finding = el('td');
  finding.append(el('span', plainIssueTitle(issue), 'badge badge-issue'));
  finding.append(el('div', plainIssueDetail(issue, context)));
  tr.append(finding);

  const where = el('td');
  where.append(el('div', context.fileName));
  where.append(el('div', context.recordId ? `Record ID ${context.recordId}` : 'Record ID unavailable', 'muted small'));
  where.append(el('div', `CSV line ${context.csvLine}${context.dataRowNumber ? ` · data row ${context.dataRowNumber}` : ''}`, 'muted small'));
  where.append(el('div', `Column “${context.column}”`, 'muted small'));
  tr.append(where);

  tr.append(el('td', context.value === '' ? '(blank)' : context.value));
  tr.append(el('td', whyIssueMatters(issue.code)));

  const action = el('td');
  const button = el('button', 'Inspect record', 'button subtle');
  button.type = 'button';
  button.addEventListener('click', () => inspectFinding(issue));
  action.append(button);
  tr.append(action);
  issueBody.append(tr);
}

function renderIssueTable(result: ValidationResult): void {
  clear(issueBody);
  const shown = result.issues.slice(0, 250);
  if (!shown.length) issueBody.append(emptyRow(5, 'No problems found for the selected checks.'));
  else for (const issue of shown) addIssueRow(issue);
  document.querySelector<HTMLElement>('#issue-count')!.textContent =
    `${countLabel(result.issues.length, 'finding')} across ${countLabel(result.issueRows, 'row')}` +
    (shown.length < result.issues.length ? ' · first 250 shown; export includes all' : '');
}

function inspectComparisonRecord(kind: 'added' | 'removed' | 'changed', item: ComparisonRow, keyColumn: string, diffs: CellDifference[] = []): void {
  if (!baseline || !current) return;
  const older = findRowByRecordId(baseline, keyColumn, item.key);
  const newer = findRowByRecordId(current, keyColumn, item.key);
  const columns = [...new Set([...baseline.columns, ...current.columns])];
  const primary = kind === 'removed' ? baseline : current;
  const primaryRow = kind === 'removed' ? older : newer;
  openRecordInspect({
    kind,
    recordId: item.key,
    primaryFile: primary.name,
    olderFile: baseline.name,
    newerFile: current.name,
    older,
    newer,
    columns,
    highlightColumns: diffs.map(d => d.column),
    csvLine: primaryRow?.line,
    dataRowNumber: primaryRow ? dataRowNumberForLine(primary, primaryRow.line) : undefined,
    tableDataset: primary,
    tableOrigin: kind === 'removed' ? baselineOrigin : currentOrigin
  });
}

function renderComparison(result: ComparisonResult): void {
  clear(compareBody);
  if (!baseline || !current) return;
  const rows: HTMLTableRowElement[] = [];

  function addSimple(kind: 'Added' | 'Removed', item: ComparisonRow): void {
    const tr = el('tr');
    const badgeCell = el('td');
    badgeCell.append(el('span', kind, kind === 'Added' ? 'badge badge-added' : 'badge badge-removed'));
    tr.append(badgeCell, el('td', item.key), el('td', '—'));
    if (kind === 'Added') tr.append(el('td', '—', 'empty-cell'), el('td', `In ${current!.name}`, 'cell-new'));
    else tr.append(el('td', `In ${baseline!.name}`, 'cell-old'), el('td', '—', 'empty-cell'));
    const inspect = el('td');
    const button = el('button', 'Inspect record', 'button subtle');
    button.type = 'button';
    button.addEventListener('click', () => inspectComparisonRecord(kind === 'Added' ? 'added' : 'removed', item, result.keyColumn));
    inspect.append(button);
    tr.append(inspect);
    rows.push(tr);
  }

  for (const item of result.added) addSimple('Added', item);
  for (const item of result.removed) addSimple('Removed', item);

  const changedById = new Map<string, ComparisonRow>();
  for (const item of result.changed) changedById.set(item.key, item);
  for (const item of changedById.values()) {
    for (const diff of item.differences) {
      const tr = el('tr');
      const badgeCell = el('td');
      badgeCell.append(el('span', 'Changed', 'badge badge-changed'));
      tr.append(
        badgeCell,
        el('td', item.key),
        el('td', diff.column),
        el('td', diff.before === '' ? '(blank)' : diff.before, 'cell-old'),
        el('td', diff.after === '' ? '(blank)' : diff.after, 'cell-new')
      );
      const inspect = el('td');
      const button = el('button', 'Inspect record', 'button subtle');
      button.type = 'button';
      button.addEventListener('click', () => inspectComparisonRecord('changed', item, result.keyColumn, item.differences));
      inspect.append(button);
      tr.append(inspect);
      rows.push(tr);
    }
  }

  const shown = rows.slice(0, 250);
  if (!shown.length) compareBody.append(emptyRow(6, 'No differences found for matching IDs.'));
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
    lastOperation = 'check';
    renderIssueTable(lastValidation);
    issuesButton.disabled = false;
    comparisonResults.hidden = true;
    renderStats([
      ['Records checked', String(lastValidation.rowCount), true],
      ['Rows with issues', String(lastValidation.issueRows), lastValidation.issueRows > 0],
      ['Findings', String(lastValidation.issues.length), lastValidation.issues.length > 0]
    ]);
    operationLabel.textContent = `Latest operation · Check for problems · ${current.name}`;
    if (lastValidation.issues.length === 0) {
      summaryCard.classList.remove('has-issues');
      summaryCard.classList.add('is-clean');
      summaryHeadline.textContent = 'No problems found for the selected checks.';
      summaryDetail.textContent = `Reviewed ${countLabel(lastValidation.rowCount, 'record')} in “${current.name}”.`;
      setNextSteps(['Optional: export the empty findings report for your records.', 'If you still need a version comparison, switch to Compare two versions.']);
    } else {
      summaryCard.classList.add('has-issues');
      summaryCard.classList.remove('is-clean');
      summaryHeadline.textContent = `Found ${countLabel(lastValidation.issues.length, 'problem')} in ${countLabel(lastValidation.issueRows, 'row')}.`;
      summaryDetail.textContent = 'Each finding names the file, record ID, CSV line, data row, column, and value. Use Inspect record to open the highlighted CSV cell.';
      setNextSteps([
        'Inspect a finding (sample: either finding opens WO-1007).',
        'Export issues CSV if you need a checklist.',
        'Fix the original spreadsheet outside FieldCheck, then reload the corrected CSV.'
      ]);
    }
    setStatus(`Check complete on “${current.name}”: ${countLabel(lastValidation.issues.length, 'finding')} in ${countLabel(lastValidation.issueRows, 'row')}.`);
    focusCheckResults();
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Validation failed.', { bad: true }); }
});

compareButton.addEventListener('click', () => {
  if (!current || !baseline) return;
  if (!keySelect.value) { setStatus('Choose an existing unique record ID column before comparing.', { bad: true }); return; }
  try {
    setStatus('Comparing older and newer files by record ID…', { busy: true });
    lastComparison = compareDatasets(baseline, current, keySelect.value);
    lastOperation = 'compare';
    renderComparison(lastComparison);
    compareDownloadButton.disabled = false;
    renderStats([
      ['Newer records', String(current.rows.length)],
      ['Added', String(lastComparison.added.length), lastComparison.added.length > 0],
      ['Changed', String(lastComparison.changed.length), lastComparison.changed.length > 0],
      ['Removed', String(lastComparison.removed.length), lastComparison.removed.length > 0],
      ['Unchanged', String(lastComparison.unchangedCount)]
    ]);
    const summary = plainComparisonSummary(lastComparison);
    operationLabel.textContent = `Latest operation · Compare older vs newer · ${baseline.name} → ${current.name}`;
    summaryCard.classList.remove('has-issues', 'is-clean');
    if (lastComparison.added.length + lastComparison.removed.length + lastComparison.changed.length === 0) {
      summaryCard.classList.add('is-clean');
      summaryHeadline.textContent = 'Older and newer files match for every shared ID.';
    } else {
      summaryHeadline.textContent = summary.headline;
    }
    summaryDetail.textContent = `${summary.detail}. Use Inspect record to review values for a specific ID.`;
    setNextSteps([
      'Inspect added, removed, or changed records.',
      'Export the comparison CSV if needed.',
      'Update source spreadsheets outside FieldCheck, then reload.'
    ]);
    setStatus('Comparison complete. Records were matched by ID, not by spreadsheet row order.');
    validationResults.hidden = true;
    focusCompareResults();
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Comparison failed.', { bad: true }); }
});

rememberButton.addEventListener('click', () => {
  if (!current) return;
  saveColumnPrefs(current.columns, {
    keyColumn: keySelect.value || undefined,
    requiredColumns: checkedColumns(requiredFields),
    numericColumns: checkedColumns(numericFields)
  });
  setStatus('Saved checking preferences on this device (column choices only — not your spreadsheet contents).');
  suggestBanner.textContent = 'Checking preferences saved locally for this header layout. Clear them anytime with Clear saved preferences.';
});
clearPrefsButton.addEventListener('click', () => {
  clearAllColumnPrefs();
  if (current) applyConfiguration(current);
  setStatus('Cleared saved checking preferences from this browser.');
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
  const context = current ? findingContext(current, issue, keySelect.value || undefined) : undefined;
  return [
    context?.fileName ?? '',
    context?.recordId ?? '',
    String(issue.row),
    context?.dataRowNumber ? String(context.dataRowNumber) : '',
    issue.code.replaceAll('_', ' '),
    issue.column,
    issue.value,
    issue.message,
    whyIssueMatters(issue.code)
  ];
}
issuesButton.addEventListener('click', () => {
  if (!lastValidation) return;
  download('fieldcheck-issues.csv', toCsv([
    ['File', 'Record ID', 'CSV Line', 'Data Row', 'Issue', 'Column', 'Value', 'Description', 'Why it matters'],
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
    updateDataset('baseline', parseCsv(a, 'maintenance-before.csv'), 'Built-in sample · older');
    updateDataset('current', parseCsv(b, 'maintenance-current.csv'), 'Built-in sample · newer');
    keySelect.value = 'work_order_id';
    for (const cb of requiredFields.querySelectorAll<HTMLInputElement>('input')) cb.checked = ['property', 'status'].includes(cb.value);
    for (const cb of numericFields.querySelectorAll<HTMLInputElement>('input')) cb.checked = ['cost', 'hours'].includes(cb.value);
    setLoadBanner('Sample loaded: maintenance-before.csv (older) and maintenance-current.csv (newer). CSV table snippets are reconstructed from imported values.');
    setStatus('Sample ready. Next: Check for problems, then Compare older vs newer.');
    suggestBanner.textContent = 'Sample suggestions selected for work_order_id, property/status, and hours/cost. Change anytime.';
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
