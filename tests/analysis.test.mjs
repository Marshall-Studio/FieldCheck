import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../site/assets/csv.js';
import { validate, compareDatasets, comparisonReportRows } from '../site/assets/analysis.js';

test('flags missing required values, bad numbers, duplicate IDs and identical rows',()=>{
 const d=parseCsv('id,property,cost\n1,Oak,12\n2,,invalid\n2,,invalid\n');
 const r=validate(d,{keyColumn:'id',requiredColumns:['property'],numericColumns:['cost']});
 assert.equal(r.issues.filter(i=>i.code==='MISSING_REQUIRED').length,2);
 assert.equal(r.issues.filter(i=>i.code==='INVALID_NUMBER').length,2);
 assert.equal(r.issues.filter(i=>i.code==='DUPLICATE_KEY').length,1);
 assert.equal(r.issues.filter(i=>i.code==='DUPLICATE_ROW').length,1);
 assert.equal(r.issueRows,2);
});
test('detects empty key once even if required also lists key',()=>{
 const d=parseCsv('id,property\n,Oak\n');
 assert.equal(validate(d,{keyColumn:'id',requiredColumns:['id']}).issues.length,1);
});
test('reconciliation matches by ID regardless of row position',()=>{
 const a=parseCsv('id,name,qty\nA,Alpha,1\nB,Beta,2\nC,Gamma,3');
 const b=parseCsv('id,name,qty\nB,Beta,4\nD,Delta,1\nA,Alpha,1');
 const r=compareDatasets(a,b,'id');
 assert.deepEqual([r.added.length,r.removed.length,r.changed.length,r.unchangedCount],[1,1,1,1]);
 assert.equal(r.changed[0].differences[0].column,'qty');
 assert.equal(r.changed[0].differences[0].before,'2');
 assert.equal(r.changed[0].differences[0].after,'4');
 assert.equal(comparisonReportRows(r).length,4);
});
test('comparison uses case-insensitive header correspondence',()=>{
 const a=parseCsv('ID,Qty\nA,1');const b=parseCsv('id,qty\nA,2');
 const r=compareDatasets(a,b,'id');assert.equal(r.changed.length,1);
});
test('comparison refuses ambiguous duplicate key rather than guessing',()=>{
 const a=parseCsv('id,n\nA,1\nA,2');const b=parseCsv('id,n\nA,3');
 assert.throws(()=>compareDatasets(a,b,'id'),/duplicate identifier/);
});
test('comparison refuses missing record ID',()=>{
 const a=parseCsv('id,n\n,1');const b=parseCsv('id,n\nA,3');
 assert.throws(()=>compareDatasets(a,b,'id'),/blank identifier/);
});
test('comparison refuses missing match column',()=>{
 const a=parseCsv('code,n\nA,1');const b=parseCsv('id,n\nA,3');
 assert.throws(()=>compareDatasets(a,b,'id'),/missing column/);
});
test('does not trim ordinary cell values during comparison',()=>{
 const a=parseCsv('id,name\nA,Sam');const b=parseCsv('id,name\nA, Sam');
 assert.equal(compareDatasets(a,b,'id').changed.length,1);
});
