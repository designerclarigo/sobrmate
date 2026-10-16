import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTextMetrics } from '../src/design-system/typography/resolveTextMetrics';
import { fontFamilies, typography } from '../src/design-system/tokens/typography';

test('loaded Plus Jakarta Sans faces carry their own weight without synthetic Android bold', () => {
  for (const [weight, family] of [['400', fontFamilies.sans], ['500', fontFamilies.medium], ['600', fontFamilies.semibold], ['bold', fontFamilies.bold]] as const) {
    const style = resolveTextMetrics(typography.body, false, weight);
    assert.equal(style.fontFamily, family); assert.equal(style.fontWeight, 'normal');
  }
});

test('editorial typography uses Georgia and display line heights remain compact', () => {
  const italic = resolveTextMetrics({ ...typography.display, fontStyle: 'italic' }, true);
  assert.equal(italic.fontFamily, 'Georgia'); assert.equal(italic.fontStyle, 'italic');
  assert.equal(italic.lineHeight, 36);
  assert.equal(resolveTextMetrics({ fontSize: 64, lineHeight: 78 }).lineHeight, 78);
  assert.equal(resolveTextMetrics({ fontSize: 9, lineHeight: 10 }).fontSize, 12);
  assert.ok(resolveTextMetrics({ fontSize: 9, lineHeight: 10 }).lineHeight! >= 16);
});
