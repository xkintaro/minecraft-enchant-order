import { readFile, writeFile } from 'node:fs/promises';

// Game terms come from Mojang assets; generic equipment categories come from upstream.
// Pin the game version so terminology changes are explicit and reviewable.
const version = '26.3';
const sources = {
  en: ['en.json', 'en_us'],
  tr: ['tr-TR.json', 'tr_tr'],
  ru: ['ru-RU.json', 'ru_ru'],
  de: ['de.json', 'de_de'],
  ja: ['ja-JP.json', 'ja_jp'],
  es: ['es-ES.json', 'es_es'],
  fr: ['fr-FR.json', 'fr_fr'],
  'pt-BR': ['pt-BR.json', 'pt_br'],
  ko: ['ko-KR.json', 'ko_kr'],
  'zh-CN': ['zh-CN.json', 'zh_cn'],
};
// Spears have material-specific item IDs in Minecraft; the planner selects a generic type.
const spearNames = {
  en: 'Spear',
  tr: 'Mızrak',
  ru: 'Копьё',
  de: 'Speer',
  ja: '槍',
  es: 'Lanza',
  fr: 'Lance',
  'pt-BR': 'Lança',
  ko: '창',
  'zh-CN': '长矛',
};

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.json();
}

const manifest = await json('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
const release = manifest.versions.find((entry) => entry.id === version);
if (!release) throw new Error(`Missing Minecraft version ${version}`);
const metadata = await json(release.url);
const index = await json(metadata.assetIndex.url);
const template = JSON.parse(
  await readFile(new URL('../messages/en.json', import.meta.url), 'utf8'),
);

for (const [locale, [upstreamFile, gameLocale]] of Object.entries(sources)) {
  const upstream = await json(
    `https://raw.githubusercontent.com/iamcal/enchant-order/main/languages/${upstreamFile}`,
  );
  const asset = index.objects[`minecraft/lang/${gameLocale}.json`];
  const game = asset
    ? await json(`https://resources.download.minecraft.net/${asset.hash.slice(0, 2)}/${asset.hash}`)
    : null;
  const path = new URL(`../messages/${locale}.json`, import.meta.url);
  const dictionary = JSON.parse(await readFile(path, 'utf8'));

  dictionary.items = Object.fromEntries(
    Object.keys(template.items).map((id) => {
      const gameId = id === 'turtle_shell' ? 'turtle_helmet' : id;
      const value =
        game?.[`item.minecraft.${gameId}`] ??
        game?.[`block.minecraft.${gameId}`] ??
        upstream.items[id] ??
        (id === 'spear' ? spearNames[locale] : undefined);
      if (typeof value !== 'string' || !value.trim())
        throw new Error(`${locale}: missing item ${id}`);
      return [id, value];
    }),
  );
  dictionary.enchants = Object.fromEntries(
    Object.keys(template.enchants).map((id) => {
      const gameId = id === 'sweeping' ? 'sweeping_edge' : id;
      const value = game ? game[`enchantment.minecraft.${gameId}`] : upstream.enchants[id];
      if (typeof value !== 'string' || !value.trim())
        throw new Error(`${locale}: missing enchantment ${id}`);
      return [id, value];
    }),
  );
  await writeFile(path, `${JSON.stringify(dictionary, null, 2)}\n`);
  console.log(
    `${locale}: ${Object.keys(dictionary.items).length} items, ${Object.keys(dictionary.enchants).length} enchantments (Minecraft ${version}${game ? ', Mojang assets' : ', upstream English'})`,
  );
}
