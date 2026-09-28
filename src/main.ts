import { parseCsv, CsvError, LIMITS, toCsv } from './csv.js';
import { validate, compareDatasets, comparisonReportRows } from './analysis.js';
import type { Dataset, Issue, ValidationResult, ComparisonResult } from './types.js';

const currentInput = document.querySelector<HTMLInputElement>('#current-file')!;
const baselineInput = document.querySelector<HTMLInputElement>('#baseline-file')!;
const currentInfo = document.querySelector<HTMLElement>('#current-info')!;
const baselineInfo = document.querySelector<HTMLElement>('#baseline-info')!;
const keySelect = document.querySelector<HTMLSelectElement>('#key-column')!;
const requiredFields = document.querySelector<HTMLElement>('#required-columns')!;
const numericFields = document.querySelector<HTMLElement>('#numeric-columns')!;
const validationButton = document.querySelector<HTMLButtonElement>('#validate-button')!;
const compareButton = document.querySelector<HTMLButtonElement>('#compare-button')!;
const issuesButton = document.querySelector<HTMLButtonElement>('#download-issues')!;
const compareDownloadButton = document.querySelector<HTMLButtonElement>('#download-comparison')!;
const issueBody = document.querySelector<HTMLElement>('#issue-body')!;
const compareBody = document.querySelector<HTMLElement>('#comparison-body')!;
const status = document.querySelector<HTMLElement>('#status')!;
const stats = document.querySelector<HTMLElement>('#stats')!;
const feedback = document.querySelector<HTMLAnchorElement>('#feedback-link')!;
const feedbackUrl = ''; // When GitHub repo is created, add its Issues/new URL here.
if (feedbackUrl) { feedback.href = feedbackUrl; feedback.hidden = false; }

let current: Dataset | undefined;
let baseline: Dataset | undefined;
let lastValidation: ValidationResult | undefined;
let lastComparison: ComparisonResult | undefined;

function setStatus(message: string, bad = false): void {
  status.textContent = message;
  status.classList.toggle('error', bad);
}
function el<K extends keyof HTMLElementTagNameMap>(tag: K, value?: string, cls?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value; // Never inject imported file contents as HTML.
  if (cls) node.className = cls;
  return node;
}
function clear(element: Element): void { element.replaceChildren(); }
function renderStats(items: Array<[string,string]>): void {
  clear(stats);
  for (const [label, num] of items) {
    const box = el('div', undefined, 'stat');
    box.append(el('strong', num), el('span', label));
    stats.append(box);
  }
}
function renderEmpty(): void {
  clear(issueBody); clear(compareBody);
  const issueRow = el('tr'); issueRow.append(el('td', 'Load a dataset and run validation.', 'empty-cell')); issueBody.append(issueRow);
  const compareRow = el('tr'); compareRow.append(el('td', 'Load a baseline and current dataset to compare.', 'empty-cell')); compareBody.append(compareRow);
  renderStats([['Current records','—'],['Issue rows','—'],['Added','—'],['Changed','—'],['Removed','—']]);
}
function controlGroup(container: HTMLElement, columns: string[], type: string): void {
  clear(container);
  for (const column of columns) {
    const label = el('label', undefined, 'check-option');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = column; cb.dataset.kind = type;
    label.append(cb, document.createTextNode(column));
    container.append(label);
  }
}
function checkedColumns(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLInputElement>('input:checked')].map(x => x.value);
}
function updateDataset(kind: 'current' | 'baseline', data: Dataset | undefined): void {
  if (kind === 'current') {
    current = data;
    currentInfo.textContent = data ? `${data.name} · ${data.rows.length.toLocaleString()} records · ${data.columns.length} columns` : 'No file selected.';
    clear(keySelect);
    keySelect.append(new Option('Choose record ID column', ''));
    for (const col of data?.columns ?? []) keySelect.append(new Option(col, col));
    const suggest = data?.columns.find(c => /^(id|record_id|asset_id|work_order_id|sku)$/i.test(c));
    if (suggest) keySelect.value = suggest;
    controlGroup(requiredFields, data?.columns ?? [], 'required');
    controlGroup(numericFields, data?.columns ?? [], 'numeric');
  } else {
    baseline = data;
    baselineInfo.textContent = data ? `${data.name} · ${data.rows.length.toLocaleString()} records` : 'No file selected.';
  }
  validationButton.disabled = !current;
  compareButton.disabled = !current || !baseline;
  issuesButton.disabled = true;
  compareDownloadButton.disabled = true;
  lastValidation = undefined; lastComparison = undefined;
  renderEmpty();
}
async function readFile(file: File, kind: 'current'|'baseline'): Promise<void> {
  if (file.size > LIMITS.bytes) { setStatus('The file exceeds the 8 MB V1 limit.', true); return; }
  try {
    const dataset = parseCsv(await file.text(), file.name);
    updateDataset(kind, dataset);
    setStatus(`Loaded ${dataset.name} locally. Its contents are not uploaded to a server.`);
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not read this file.', true); }
}
currentInput.addEventListener('change', () => { const file = currentInput.files?.[0]; if (file) void readFile(file,'current'); });
baselineInput.addEventListener('change', () => { const file = baselineInput.files?.[0]; if (file) void readFile(file,'baseline'); });

function addTableRow(body: Element, values: string[]): void {
  const tr = el('tr');
  for (const value of values) tr.append(el('td', value));
  body.append(tr);
}
function reportRow(issue: Issue): string[] { return [String(issue.row), issue.code.replaceAll('_',' '), issue.column, issue.value, issue.message]; }
function renderIssueTable(result: ValidationResult): void {
  clear(issueBody);
  const shown = result.issues.slice(0,250);
  if (!shown.length) addTableRow(issueBody, ['—','No issues found for selected rules.','','','']);
  else for (const issue of shown) addTableRow(issueBody, reportRow(issue));
  document.querySelector<HTMLElement>('#issue-count')!.textContent = `${result.issues.length.toLocaleString()} findings${shown.length < result.issues.length ? ' · first 250 displayed, all available in export' : ''}`;
}
validationButton.addEventListener('click', () => {
  if (!current) return;
  try {
    lastValidation = validate(current, {
      keyColumn: keySelect.value || undefined,
      requiredColumns: checkedColumns(requiredFields),
      numericColumns: checkedColumns(numericFields)
    });
    renderIssueTable(lastValidation);
    issuesButton.disabled = false;
    const c = lastComparison;
    renderStats([
      ['Current records',String(lastValidation.rowCount)],['Issue rows',String(lastValidation.issueRows)],
      ['Added', c ? String(c.added.length) : '—'],['Changed',c ? String(c.changed.length) : '—'],['Removed',c ? String(c.removed.length) : '—']
    ]);
    setStatus(`Validation completed: ${lastValidation.issues.length} findings in ${lastValidation.issueRows} rows.`);
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Validation failed.', true); }
});

function renderComparison(result: ComparisonResult): void {
  clear(compareBody);
  const items: Array<[string,string,string,string]> = [];
  for (const r of result.added) items.push(['Added',r.key,'—','New record']);
  for (const r of result.removed) items.push(['Removed',r.key,'—','Missing from current file']);
  for (const r of result.changed) for (const d of r.differences) items.push(['Changed',r.key,d.column,`${d.before} → ${d.after}`]);
  const shown = items.slice(0,250);
  if (!shown.length) addTableRow(compareBody, ['—','No differences found.','','']);
  else for (const row of shown) addTableRow(compareBody, row);
  document.querySelector<HTMLElement>('#comparison-count')!.textContent =
    `${result.added.length} added · ${result.removed.length} removed · ${result.changed.length} changed · ${result.unchangedCount} unchanged${shown.length < items.length ? ' · first 250 changes shown' : ''}`;
}
compareButton.addEventListener('click', () => {
  if (!current || !baseline) return;
  if (!keySelect.value) { setStatus('Choose the unique record ID column before comparing.', true); return; }
  try {
    lastComparison = compareDatasets(baseline,current,keySelect.value);
    renderComparison(lastComparison);
    compareDownloadButton.disabled = false;
    const v = lastValidation;
    renderStats([
      ['Current records',String(current.rows.length)],['Issue rows',v ? String(v.issueRows) : '—'],
      ['Added',String(lastComparison.added.length)],['Changed',String(lastComparison.changed.length)],['Removed',String(lastComparison.removed.length)]
    ]);
    setStatus('Comparison completed. Differences are matched by record ID, not row position.');
  } catch (e) { setStatus(e instanceof Error ? e.message : 'Comparison failed.', true); }
});
function download(name: string, text: string): void {
  const objectUrl = URL.createObjectURL(new Blob([text], {type:'text/csv;charset=utf-8'}));
  const anchor = document.createElement('a'); anchor.href = objectUrl; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
issuesButton.addEventListener('click', () => {
  if (!lastValidation) return;
  download('fieldcheck-issues.csv',toCsv([['Line','Issue','Column','Value','Description'],...lastValidation.issues.map(reportRow)]));
});
compareDownloadButton.addEventListener('click', () => {
  if (!lastComparison) return;
  download('fieldcheck-comparison.csv',toCsv(comparisonReportRows(lastComparison)));
});

document.querySelector<HTMLButtonElement>('#load-sample')!.addEventListener('click', async () => {
  try {
    const [a,b] = await Promise.all([
      fetch('./sample-data/maintenance-before.csv').then(r => { if(!r.ok)throw new Error('Could not load baseline sample.');return r.text(); }),
      fetch('./sample-data/maintenance-current.csv').then(r => { if(!r.ok)throw new Error('Could not load current sample.');return r.text(); })
    ]);
    updateDataset('baseline',parseCsv(a,'Maintenance — baseline sample'));
    updateDataset('current',parseCsv(b,'Maintenance — current sample'));
    keySelect.value='work_order_id';
    for (const cb of requiredFields.querySelectorAll<HTMLInputElement>('input')) if(['property','status'].includes(cb.value)) cb.checked=true;
    for (const cb of numericFields.querySelectorAll<HTMLInputElement>('input')) if(['cost','hours'].includes(cb.value)) cb.checked=true;
    setStatus('Sample loaded. Select “Run validation” or “Compare datasets.”');
  } catch(e) { setStatus(e instanceof Error ? e.message : 'Sample could not load.', true); }
});
renderEmpty();
