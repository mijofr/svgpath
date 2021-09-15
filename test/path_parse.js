


var assert  = require('assert');
var fs      = require('fs');
var path    = require('path');

import { SvgPath } from './../lib/svgpath';


describe('Path parse', function () {

  it('big batch', function () {
    var batch = fs.readFileSync(path.join(__dirname, '/fixtures/big.txt'), 'utf8').split(/[\r\n]/);

    for (var i = 0; i < batch.length; i++) {
      if (!batch[i]) { continue; }
      assert.strictEqual(batch[i], new SvgPath(batch[i]).toString());
    }
  });


  it('empty string', function () {
    assert.strictEqual(new SvgPath('').toString(), '');
  });


  it('line terminators', function () {
    assert.strictEqual(new SvgPath('M0\r 0\n\u1680l2-3\nz').toString(), 'M0 0l2-3z');
  });


  it('params formats', function () {
    assert.strictEqual(new SvgPath('M 0.0 0.0').toString(),  'M0 0');
    assert.strictEqual(new SvgPath('M 1e2 0').toString(),    'M100 0');
    assert.strictEqual(new SvgPath('M 1e+2 0').toString(),   'M100 0');
    assert.strictEqual(new SvgPath('M +1e+2 0').toString(),  'M100 0');
    assert.strictEqual(new SvgPath('M 1e-2 0').toString(),   'M0.01 0');
    assert.strictEqual(new SvgPath('M 0.1e-2 0').toString(), 'M0.001 0');
    assert.strictEqual(new SvgPath('M .1e-2 0').toString(),  'M0.001 0');
  });

  it('repeated', function () {
    assert.strictEqual(new SvgPath('M 0 0 100 100').toString(),  'M0 0L100 100');
    assert.strictEqual(new SvgPath('m 0 0 100 100').toString(),  'M0 0l100 100');
    assert.strictEqual(new SvgPath('M 0 0 R 1 1 2 2').toString(),  'M0 0R1 1 2 2');
    assert.strictEqual(new SvgPath('M 0 0 r 1 1 2 2').toString(),  'M0 0r1 1 2 2');
  });

  it('arc flags', function () {
    assert.strictEqual(
      new SvgPath('M 0 0 a.625.625 0 01.84-.925').toString(),
      'M0 0a0.625 0.625 0 0 1 0.84-0.925'
    );
  });

  it('errors', function () {
    assert.strictEqual(new SvgPath('0').err, 'SvgPath: bad command 0 (at pos 0)');
    assert.strictEqual(new SvgPath('U').err, 'SvgPath: bad command U (at pos 0)');
    assert.strictEqual(new SvgPath('M0 0G 1').err, 'SvgPath: bad command G (at pos 4)');
    assert.strictEqual(new SvgPath('z').err, 'SvgPath: string should start with `M` or `m`');
    assert.strictEqual(new SvgPath('M+').err, 'SvgPath: param should start with 0..9 or `.` (at pos 2)');
    assert.strictEqual(new SvgPath('M00').err, 'SvgPath: numbers started with `0` such as `09` are illegal (at pos 1)');
    assert.strictEqual(new SvgPath('M0e').err, 'SvgPath: invalid float exponent (at pos 3)');
    assert.strictEqual(new SvgPath('M0').err, 'SvgPath: missed param (at pos 2)');
    assert.strictEqual(new SvgPath('M0,0,').err, 'SvgPath: missed param (at pos 5)');
    assert.strictEqual(new SvgPath('M0 .e3').err, 'SvgPath: invalid float exponent (at pos 4)');
    assert.strictEqual(new SvgPath('M0 0a2 2 2 2 2 2 2').err, 'SvgPath: arc flag can be 0 or 1 only (at pos 11)');
  });
});
