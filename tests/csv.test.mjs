import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, CsvError, toCsv } from '../site/assets/csv.js';

test('reads ordinary CSV and preserves blank cells',()=>{
 const d=parseCsv('id,name,qty\nA,Ada,2\nB,,0\n');
 assert.equal(d.rows.length,2);assert.equal(d.rows[1].values.name,'');assert.equal(d.rows[1].line,3);
});
test('handles BOM, escaped quotes, embedded comma and quoted newline',()=>{
 const d=parseCsv('\uFEFFid,note\r\n1,"Hello, ""world""\r\nagain"\r\n');
 assert.equal(d.rows[0].values.note,'Hello, "world"\nagain');
 assert.equal(d.rows[0].line,2);
});
test('rejects unclosed quoted field',()=>assert.throws(()=>parseCsv('id,note\n1,"bad'),CsvError));
test('rejects duplicate headers ignoring case',()=>assert.throws(()=>parseCsv('ID,id\n1,2'),/duplicate column/));
test('rejects malformed row lengths',()=>assert.throws(()=>parseCsv('id,name\n1'),/expected 2/));
test('rejects unexpected text after closing quote',()=>assert.throws(()=>parseCsv('id,note\n1,"a"oops'),/Unexpected character/));
test('protects CSV output from spreadsheet-formula injection',()=>{
 const csv=toCsv([['label','value'],['unsafe','=HYPERLINK("evil")'],['negative','-10'],['nul','\u0000=cmd']]);
 assert.match(csv,/"'=HYPERLINK\(""evil""\)"/);
 assert.match(csv,/"'-10"/);
 assert.match(csv,/"'\u0000=cmd"/);
});

test('tracks physical CSV line numbers after multiline quoted cells', () => {
 const csv = 'id,note,qty\r\nA,"first\r\nsecond",2\r\nB,"more\nlines",oops\r\nC,plain,3\r\n';
 const d = parseCsv(csv, 'multiline.csv');
 assert.deepEqual(d.rows.map(row => row.line), [2, 4, 6]);
 assert.equal(d.rows[0].values.note, 'first\nsecond');
 assert.equal(d.rows[1].values.note, 'more\nlines');
 assert.equal(d.rows[2].values.id, 'C');
});

test('reports the starting physical line for malformed rows following multiline cells', () => {
 const csv = 'id,note\r\nA,"first\r\nsecond"\r\nB,one,two\r\n';
 assert.throws(() => parseCsv(csv), /Line 4: found 3 columns; expected 2\./);
});
