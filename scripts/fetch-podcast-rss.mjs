/**
 * Met à jour podcasts/latest-episodes.json depuis les flux RSS publics.
 * Usage: node scripts/fetch-podcast-rss.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'podcasts', 'latest-episodes.json');

const FEEDS = [
  { id: 'confluents', url: 'https://anchor.fm/s/6b6344d8/podcast/rss' },
  { id: 'rue-atateken', url: 'https://feed.podbean.com/rueatateken/feed.xml' },
];

function firstItem(xml) {
  const block = xml.match(/<item>[\s\S]*?<\/item>/i)?.[0] || '';
  const title =
    block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] ||
    block.match(/<title>([^<]*)<\/title>/i)?.[1] ||
    '';
  const audio =
    block.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ||
    block.match(/<link>([^<]+)<\/link>/i)?.[1] ||
    '';
  const date = block.match(/<pubDate>([^<]*)<\/pubDate>/i)?.[1] || '';
  return { title: title.trim(), audio: audio.trim(), date: date.trim() };
}

const results = {};
for (const { id, url } of FEEDS) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'PremieresNationsQuebec/1.0' } });
    const xml = await res.text();
    results[id] = { ...firstItem(xml), fetchedAt: new Date().toISOString() };
    console.log(id, 'OK', results[id].title?.slice(0, 50));
  } catch (e) {
    results[id] = { error: e.message, fetchedAt: new Date().toISOString() };
    console.log(id, 'ERR', e.message);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log('Written', outPath);
