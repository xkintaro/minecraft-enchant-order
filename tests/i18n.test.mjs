import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { createTranslator } from 'next-intl';

const catalog = JSON.parse(
  readFileSync(new URL('../src/i18n/locales.json', import.meta.url), 'utf8'),
);
const locales = Object.keys(catalog);

test('every registered locale has exactly one dictionary', () => {
  assert.deepEqual(
    readdirSync(new URL('../messages', import.meta.url))
      .filter((file) => file.endsWith('.json'))
      .sort(),
    locales.map((locale) => `${locale}.json`).sort(),
  );
  assert.ok(locales.includes('en'));
  for (const [locale, name] of Object.entries(catalog)) {
    assert.equal(Intl.getCanonicalLocales(locale)[0], locale);
    assert.ok(name.trim());
  }
});
const dictionaries = Object.fromEntries(
  locales.map((locale) => [
    locale,
    JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')),
  ]),
);

function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [[path, value]] : flatten(value, path);
  });
}

for (const locale of locales) {
  test(`${locale}: complete dictionary and valid ICU messages`, () => {
    const entries = flatten(dictionaries[locale]);
    assert.deepEqual(
      entries.map(([key]) => key).sort(),
      flatten(dictionaries.en)
        .map(([key]) => key)
        .sort(),
    );
    const translate = createTranslator({
      locale,
      messages: dictionaries[locale],
      onError(error) {
        throw error;
      },
    });
    for (const [key, value] of entries) {
      assert.ok(value.trim(), `${key} must not be empty`);
      for (const count of [0, 1, 2, 5, 21])
        assert.ok(translate(key, { count, level: 3, number: 2 }));
    }
    assert.equal(translate('calculate'), translate('ui.calculateShort'));
    for (const key of ['guideOneBody', 'guideTwoBody', 'guideThreeBody', 'guideNoteBody']) {
      assert.ok(dictionaries[locale].ui[key].trim(), `missing guide: ${key}`);
    }
  });
}

test('English and Russian use locale-specific plural rules', () => {
  const en = createTranslator({ locale: 'en', messages: dictionaries.en });
  const ru = createTranslator({ locale: 'ru', messages: dictionaries.ru });
  assert.equal(en('stepCount', { count: 1 }), '1 step');
  assert.equal(en('stepCount', { count: 2 }), '2 steps');
  assert.equal(ru('stepCount', { count: 1 }), '1 шаг');
  assert.equal(ru('stepCount', { count: 2 }), '2 шага');
  assert.equal(ru('stepCount', { count: 5 }), '5 шагов');
  assert.equal(ru('stepCount', { count: 21 }), '21 шаг');
});

test('new locales use translated instructions rather than English placeholders', () => {
  for (const locale of locales.filter((locale) => locale !== 'en')) {
    for (const key of [
      'guideOneBody',
      'guideTwoBody',
      'guideThreeBody',
      'guideNoteBody',
      'settingsHint',
    ]) {
      assert.notEqual(dictionaries[locale].ui[key], dictionaries.en.ui[key], `${locale}: ${key}`);
    }
  }
});
