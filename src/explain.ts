import type { Issue, IssueCode, ComparisonResult } from './types.js';

const WHY: Record<IssueCode, string> = {
  MISSING_REQUIRED: 'Blank required values can break imports, reports, and handoffs to other systems.',
  DUPLICATE_KEY: 'Two records sharing an ID make merges and comparisons ambiguous — the tool cannot safely pick one.',
  DUPLICATE_ROW: 'Identical full rows often mean accidental double entry or a bad export.',
  INVALID_NUMBER: 'Non-numeric text in a numeric field can fail totals, filters, and downstream calculations.'
};

export function whyIssueMatters(code: IssueCode): string {
  return WHY[code];
}

export function plainIssueTitle(issue: Issue): string {
  switch (issue.code) {
    case 'MISSING_REQUIRED':
      return issue.column.toLocaleLowerCase().includes('id') || /identifier/i.test(issue.message)
        ? 'Missing record ID'
        : `Missing ${issue.column}`;
    case 'DUPLICATE_KEY':
      return `Duplicate ID “${issue.value || '(blank)'}”`;
    case 'DUPLICATE_ROW':
      return 'Duplicate entire row';
    case 'INVALID_NUMBER':
      return `Invalid number in ${issue.column}`;
  }
}

export function plainIssueDetail(issue: Issue): string {
  const shown = issue.value === '' ? '(blank)' : issue.value;
  return `CSV line ${issue.row} · column “${issue.column}” · value ${shown}. ${issue.message}`;
}

export interface ComparisonSummaryText {
  headline: string;
  detail: string;
}

export function plainComparisonSummary(result: ComparisonResult): ComparisonSummaryText {
  const parts = [
    `${result.added.length} added`,
    `${result.removed.length} removed`,
    `${result.changed.length} changed`,
    `${result.unchangedCount} unchanged`
  ];
  return {
    headline: `Compared by “${result.keyColumn}” (not by row order).`,
    detail: parts.join(' · ')
  };
}
