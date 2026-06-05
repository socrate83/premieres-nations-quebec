/**
 * Génère locales/nations.json (fr, en, es) à partir de la structure FR + traductions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const frStruct = JSON.parse(
  fs.readFileSync(path.join(root, 'locales', 'nations-structure-fr.json'), 'utf8')
);

const homeCards = {
  abenaquis: {
    tag: 'Algonquienne · Montérégie',
    name: 'Les Abénaquis',
    desc: 'Wôbanakiak — « Peuple de l\'aube »',
  },
  algonquins: {
    tag: 'Algonquienne · Outaouais & Laurentides',
    name: 'Les Algonquins',
    desc: 'Anishinaabe — Gardiens de la rivière des Outaouais',
  },
  atikamekw: {
    tag: 'Algonquienne · Haute-Mauricie',
    name: 'Les Atikamekw',
    desc: 'Nehirowisiwok — Peuple du Nitaskinan',
  },
  cris: { tag: 'Algonquienne · Baie-James', name: 'Les Cris', desc: 'Eeyou — Peuple de la Baie-James' },
  huronswendat: {
    tag: 'Iroquoienne · Wendake · Québec',
    name: 'Les Hurons-Wendat',
    desc: 'Wendat — Gardiens du feu, peuple de l\'île',
  },
  innus: {
    tag: 'Algonquienne · Côte-Nord',
    name: 'Les Innus',
    desc: 'Innu — « Être humain » · Peuple du Nitassinan',
  },
  malecites: {
    tag: 'Algonquienne · Bas-Saint-Laurent',
    name: 'Les Malécites',
    desc: 'Wolastoqiyik — Peuple de la belle rivière',
  },
  micmacs: {
    tag: 'Algonquienne · Gaspésie',
    name: 'Les Micmacs',
    desc: 'Mi\'kmaq — « Mes amis » · Gardiens de Gespeg',
  },
  mohawks: {
    tag: 'Iroquoienne · Vallée du Saint-Laurent',
    name: 'Les Mohawks',
    desc: 'Kanien\'kehá:ka — Peuple du pays du silex',
  },
  naskapis: {
    tag: 'Algonquienne · Labrador québécois',
    name: 'Les Naskapis',
    desc: 'Gens des confins — Gardiens du caribou nordique',
  },
  inuit: {
    tag: 'Inuit · Nunavik · Grand Nord',
    name: 'Les Inuit',
    desc: 'Inuit — « Êtres humains » · Gardiens du Nunavik',
  },
};

const navFr = [
  'Origines',
  'Territoire',
  'Culture',
  'Histoire',
  'Contact européen',
  'Migrations',
  'Colonisation',
  'Résistance',
  'Communautés',
  'Aujourd\'hui',
];

const navEn = [
  'Origins',
  'Territory',
  'Culture',
  'History',
  'European contact',
  'Migrations',
  'Colonization',
  'Resistance',
  'Communities',
  'Today',
];

const navEs = [
  'Orígenes',
  'Territorio',
  'Cultura',
  'Historia',
  'Contacto europeo',
  'Migraciones',
  'Colonización',
  'Resistencia',
  'Comunidades',
  'Hoy',
];

function mapNav(frNav) {
  return frNav.map((label, i) => {
    const idx = navFr.indexOf(label);
    if (idx >= 0) return { fr: label, en: navEn[idx], es: navEs[idx] };
    const colonIdx = navFr.indexOf('Colonisation');
    if (label === 'Colonisation' && colonIdx >= 0)
      return { fr: label, en: navEn[colonIdx], es: navEs[colonIdx] };
    if (label === 'Communautés' || label.startsWith('Les '))
      return { fr: label, en: label === 'Communautés' ? 'Communities' : label, es: label === 'Communautés' ? 'Comunidades' : label };
    if (label === 'Aujourd\'hui') return { fr: label, en: 'Today', es: 'Hoy' };
    return { fr: label, en: label, es: label };
  });
}

function trLabel(fr, lang) {
  const m = {
    'Aux racines du temps': { en: 'At the roots of time', es: 'En las raíces del tiempo' },
    'Aux racines du monde': { en: 'At the roots of the world', es: 'En las raíces del mundo' },
    'Aux racines du monde arctique': { en: 'At the roots of the Arctic world', es: 'En las raíces del mundo ártico' },
    'Terres ancestrales': { en: 'Ancestral lands', es: 'Tierras ancestrales' },
    'Terres sacrées': { en: 'Sacred lands', es: 'Tierras sagradas' },
    'Traditions vivantes': { en: 'Living traditions', es: 'Tradiciones vivantes' },
    'Des millénaires d\'histoire': { en: 'Millennia of history', es: 'Milenios de historia' },
    'XVIe – XVIIe siècles': { en: '16th–17th centuries', es: 'Siglos XVI–XVII' },
    'XVIIe – XIXe siècles': { en: '17th–19th centuries', es: 'Siglos XVII–XIX' },
    'Survivre et se réaffirmer': { en: 'Surviving and reaffirming', es: 'Sobrevivir y reaffirmarse' },
    'Survivre et renaître': { en: 'Surviving and renewing', es: 'Sobrevivir y renacer' },
    'XXIe siècle': { en: '21st century', es: 'Siglo XXI' },
    'Nitaskinan': { en: 'Nitaskinan', es: 'Nitaskinan' },
    'Eeyou Istchee': { en: 'Eeyou Istchee', es: 'Eeyou Istchee' },
    'Organisation politique': { en: 'Political organization', es: 'Organización política' },
    'Agriculture sacrée': { en: 'Sacred agriculture', es: 'Agricultura sagrada' },
    'L\'animal sacré': { en: 'The sacred animal', es: 'El animal sagrado' },
    'Génie arctique': { en: 'Arctic ingenuity', es: 'Ingenio ártico' },
    'Notre terre': { en: 'Our land', es: 'Nuestra tierra' },
  };
  return m[fr]?.[lang] || fr;
}

function trTitle(fr, lang, nationId) {
  const common = {
    'Origines et identité': { en: 'Origins and identity', es: 'Orígenes e identidad' },
    'Territoire et géographie': { en: 'Territory and geography', es: 'Territorio y geografía' },
    'Culture, langue et traditions': { en: 'Culture, language and traditions', es: 'Cultura, lengua y tradiciones' },
    'Histoire ancienne et organisation sociale': {
      en: 'Ancient history and social organization',
      es: 'Historia antigua y organización social',
    },
    'Le contact avec les Européens': { en: 'Contact with Europeans', es: 'El contacto con los europeos' },
    'Résistance, résilience et revendications': {
      en: 'Resistance, resilience and claims',
      es: 'Resistencia, resiliencia y reivindicaciones',
    },
  };
  if (common[fr]?.[lang]) return common[fr][lang];
  const id = nationId || '';
  const endsToday = fr.match(/aujourd'hui$/i);
  if (endsToday) {
    const name = fr.replace(/\s+aujourd'hui$/i, '');
    return lang === 'en' ? name + ' today' : lang === 'es' ? name + ' hoy' : fr;
  }
  return fr;
}

const cardEn = {
  abenaquis: { tag: 'Algonquian · Montérégie', name: 'The Abenaki', desc: 'Wôbanakiak — “People of the Dawn”' },
  algonquins: { tag: 'Algonquian · Outaouais & Laurentians', name: 'The Algonquin', desc: 'Anishinaabe — Guardians of the Ottawa River' },
  atikamekw: { tag: 'Algonquian · Upper Mauricie', name: 'The Atikamekw', desc: 'Nehirowisiwok — People of Nitaskinan' },
  cris: { tag: 'Algonquian · James Bay', name: 'The Cree', desc: 'Eeyou — People of James Bay' },
  huronswendat: { tag: 'Iroquoian · Wendake · Quebec', name: 'The Huron-Wendat', desc: 'Wendat — Keepers of the fire' },
  innus: { tag: 'Algonquian · North Shore', name: 'The Innu', desc: 'Innu — “Human beings” · People of Nitassinan' },
  malecites: { tag: 'Algonquian · Lower St. Lawrence', name: 'The Maliseet', desc: 'Wolastoqiyik — People of the beautiful river' },
  micmacs: { tag: 'Algonquian · Gaspésie', name: 'The Mi\'kmaq', desc: 'Mi\'kmaq — “My friends” · Guardians of Gespeg' },
  mohawks: { tag: 'Iroquoian · St. Lawrence Valley', name: 'The Mohawk', desc: 'Kanien\'kehá:ka — People of the flint country' },
  naskapis: { tag: 'Algonquian · Quebec Labrador', name: 'The Naskapi', desc: 'People of the far north — Caribou guardians' },
  inuit: { tag: 'Inuit · Nunavik · Far North', name: 'The Inuit', desc: 'Inuit — “Human beings” · Guardians of Nunavik' },
};

const cardEs = {
  abenaquis: { tag: 'Algonquiana · Montérégie', name: 'Los Abenaki', desc: 'Wôbanakiak — « Pueblo del amanecer »' },
  algonquins: { tag: 'Algonquiana · Outaouais y Laurentides', name: 'Los Algonquin', desc: 'Anishinaabe — Guardianes del río Outaouais' },
  atikamekw: { tag: 'Algonquiana · Alta Mauricie', name: 'Los Atikamekw', desc: 'Nehirowisiwok — Pueblo del Nitaskinan' },
  cris: { tag: 'Algonquiana · Bahía James', name: 'Los Cree', desc: 'Eeyou — Pueblo de la Bahía James' },
  huronswendat: { tag: 'Iroquesa · Wendake · Québec', name: 'Los Huron-Wendat', desc: 'Wendat — Guardianes del fuego' },
  innus: { tag: 'Algonquiana · Costa Norte', name: 'Los Innu', desc: 'Innu — « Seres humanos » · Pueblo del Nitassinan' },
  malecites: { tag: 'Algonquiana · Bajo San Lorenzo', name: 'Los Maliseet', desc: 'Wolastoqiyik — Pueblo del hermoso río' },
  micmacs: { tag: 'Algonquiana · Gaspesia', name: 'Los Mi\'kmaq', desc: 'Mi\'kmaq — « Mis amigos » · Guardianes de Gespeg' },
  mohawks: { tag: 'Iroquesa · Valle del San Lorenzo', name: 'Los Mohawk', desc: 'Kanien\'kehá:ka — Pueblo del país del pedernal' },
  naskapis: { tag: 'Algonquiana · Labrador quebequense', name: 'Los Naskapi', desc: 'Gente de los confines — Guardianes del caribú' },
  inuit: { tag: 'Inuit · Nunavik · Gran Norte', name: 'Los Inuit', desc: 'Inuit — « Seres humanos » · Guardianes del Nunavik' },
};

const introEn = {
  abenaquis:
    'The <strong>Abenaki</strong> — or <em>W8banakiak</em> in their own language — are among the oldest Indigenous peoples of northeastern North America. Their name means <strong>“People of the lands of dawn”</strong> or <strong>“People of the east”</strong>, referring to ancestral territory touched by the rising sun. For millennia they have lived across a vast region from the St. Lawrence Valley to New England.',
  algonquins:
    'The <strong>Algonquin</strong> — or <em>Anishinaabe</em> in their own language — are among the founding peoples of Quebec. Their name means <strong>“People of the good way”</strong> or <strong>“Pure people”</strong>. For millennia they have inhabited the boreal forests and lake-and-river lands of the Outaouais and Abitibi-Témiscamingue.',
  atikamekw:
    'The <strong>Atikamekw</strong> — or <em>Nehirowisiwok</em> — have lived in the heart of Quebec’s boreal forest for millennia. Guardians of <em>Nitaskinan</em>, their ancestral territory, they developed a civilization deeply tied to forest rhythms, water cycles and ancestral wisdom.',
  cris:
    'The <strong>Cree</strong> — or <em>Eeyou</em> (“the true people”) — are one of the most powerful and organized Indigenous nations in Quebec. Guardians of vast <strong>Eeyou Istchee</strong> around James Bay, they have negotiated a strong place in modern Quebec while preserving millennial identity and traditions.',
  huronswendat:
    'The <strong>Huron-Wendat</strong> — <em>Wendat</em> (“people of the island”) — are among the most influential Indigenous nations in Quebec and Canadian history. Unlike nomadic Algonquian neighbours, the Wendat were <strong>sedentary farmers</strong> living in fortified villages that could hold thousands of people.',
  innus:
    'The <strong>Innu</strong> are the <strong>most populous Indigenous nation in Quebec</strong>. Their name simply means <em>“human being”</em>. They inhabit the vast territory of <strong>Nitassinan</strong> — “our land” — from the North Shore to Labrador.',
  malecites:
    'The <strong>Maliseet</strong> — <em>Wolastoqiyik</em> (“people of the beautiful shining river”) — are the smallest Indigenous nation in Quebec, yet among the most resilient. They are guardians of the <strong>Wolastoq</strong> (St. John River) and the Lower St. Lawrence.',
  micmacs:
    'The <strong>Mi\'kmaq</strong> — “my friends” or “my allies” — are guardians of the <strong>Gaspé</strong> and <strong>Chaleur Bay</strong> coasts. A maritime nation, they developed one of the <strong>only pre-colonial Indigenous writing systems</strong> in the Americas.',
  mohawks:
    'The <strong>Mohawk</strong> — <em>Kanien\'kehá:ka</em> (“people of the flint country”) — are the eastern gatekeepers of the great <strong>Haudenosaunee</strong> (Iroquois) Confederacy. They live in three Quebec communities: <strong>Kahnawake, Kanesatake and Akwesasne</strong>.',
  naskapis:
    'The <strong>Naskapi</strong> are the northernmost Indigenous people of Quebec — guardians of the vast subarctic plateaus of <strong>Quebec Labrador</strong>. Close cousins of the Innu, they followed great caribou herds for millennia.',
  inuit:
    'The <strong>Inuit</strong> — <em>Inuit</em> means simply <em>“human beings”</em> — inhabit <strong>Nunavik</strong>, Quebec’s Far North beyond the 55th parallel. Over 4,000 years they developed among the most sophisticated survival techniques on the planet.',
};

const introEs = {
  abenaquis:
    'Los <strong>Abenaki</strong> — o <em>W8banakiak</em> en su lengua — están entre los pueblos indígenas más antiguos del noreste de América del Norte. Su nombre significa <strong>« Pueblo de las tierras del amanecer »</strong>. Desde hace milenios habitan un vasto territorio desde el valle del San Lorenzo hasta Nueva Inglaterra.',
  algonquins:
    'Los <strong>Algonquin</strong> — o <em>Anishinaabe</em> en su lengua — están entre los pueblos fundadores de Québec. Su nombre significa <strong>« Los hombres del buen camino »</strong>. Desde hace milenios habitan los bosques boreales y los territorios de lagos y ríos de Outaouais y Abitibi-Témiscamingue.',
  atikamekw:
    'Los <strong>Atikamekw</strong> — o <em>Nehirowisiwok</em> — habitan el corazón del bosque boreal de Québec desde hace milenios. Guardianes del <em>Nitaskinan</em>, su territorio ancestral.',
  cris:
    'Los <strong>Cree</strong> — o <em>Eeyou</em> (« el verdadero pueblo ») — son una de las naciones indígenas más poderosas y organizadas de Québec. Guardianes del vasto <strong>Eeyou Istchee</strong> alrededor de la Bahía James.',
  huronswendat:
    'Los <strong>Huron-Wendat</strong> — <em>Wendat</em> (« pueblo de la isla ») — están entre las naciones indígenas más influyentes de la historia de Québec. Eran <strong>agricultores sedentarios</strong> en aldeas fortificadas.',
  innus:
    'Los <strong>Innu</strong> son la <strong>nación indígena más poblada de Québec</strong>. Su nombre significa simplemente <em>« ser humano »</em>. Habitan el vasto territorio del <strong>Nitassinan</strong>.',
  malecites:
    'Los <strong>Maliseet</strong> — <em>Wolastoqiyik</em> — son la nación indígena más pequeña de Québec, pero una de las más resilientes. Guardianes del río <strong>Wolastoq</strong>.',
  micmacs:
    'Los <strong>Mi\'kmaq</strong> — « mis amigos » — son guardianes de las costas de <strong>Gaspesia</strong> y la <strong>Bahía de Chaleur</strong>. Desarrollaron uno de los pocos sistemas de escritura indígena precoloniales.',
  mohawks:
    'Los <strong>Mohawk</strong> — <em>Kanien\'kehá:ka</em> — son los guardianes orientales de la gran <strong>Confederación Haudenosaunee</strong>. Habitan tres comunidades en Québec.',
  naskapis:
    'Los <strong>Naskapi</strong> son el pueblo indígena más septentrional de Québec — guardianes de los vastos plateaux subárticos del <strong>Labrador quebequense</strong>.',
  inuit:
    'Los <strong>Inuit</strong> — <em>Inuit</em> significa <em>« seres humanos »</em> — habitan el <strong>Nunavik</strong>, el Gran Norte de Québec más allá del paralelo 55.',
};

function metaEn(fr, id) {
  const base = fr.replace(' | Premières Nations du Québec', '').replace(' — Histoire et Culture', '');
  const names = {
    abenaquis: 'The Abenaki — People of the Lands of Dawn',
    algonquins: 'The Algonquin — History and Culture',
    atikamekw: 'The Atikamekw — History and Culture',
    cris: 'The Cree — History and Culture',
    huronswendat: 'The Huron-Wendat — History and Culture',
    innus: 'The Innu — History and Culture',
    malecites: 'The Maliseet — History and Culture',
    micmacs: 'The Mi\'kmaq — History and Culture',
    mohawks: 'The Mohawk — History and Culture',
    naskapis: 'The Naskapi — History and Culture',
    inuit: 'The Inuit — History and Culture',
  };
  return (names[id] || base) + ' | First Nations of Quebec';
}

function metaEs(fr, id) {
  const names = {
    abenaquis: 'Los Abenaki — Pueblo de las Tierras del Amanecer',
    algonquins: 'Los Algonquin — Historia y cultura',
    atikamekw: 'Los Atikamekw — Historia y cultura',
    cris: 'Los Cree — Historia y cultura',
    huronswendat: 'Los Huron-Wendat — Historia y cultura',
    innus: 'Los Innu — Historia y cultura',
    malecites: 'Los Maliseet — Historia y cultura',
    micmacs: 'Los Mi\'kmaq — Historia y cultura',
    mohawks: 'Los Mohawk — Historia y cultura',
    naskapis: 'Los Naskapi — Historia y cultura',
    inuit: 'Los Inuit — Historia y cultura',
  };
  return (names[id] || fr) + ' | Primeras Naciones de Québec';
}

function buildLang(n, lang) {
  const card = lang === 'fr' ? homeCards[n.id] : lang === 'en' ? cardEn[n.id] : cardEs[n.id];
  const html = fs.readFileSync(path.join(root, n.file), 'utf8');
  let nav = n.nav;
  if (!nav.length) {
    const navBlock = html.match(/<nav class="(?:nav-chapitres|nav)"[^>]*>([\s\S]*?)<\/nav>/i);
    if (navBlock) {
      nav = [...navBlock[1].matchAll(/<a[^>]*>([^<]+)<\/a>/gi)].map((m) => m[1].trim());
    }
  }
  const navMapped = mapNav(nav).map((x) => x[lang]);
  return {
    metaTitle: lang === 'fr' ? n.metaTitle : lang === 'en' ? metaEn(n.metaTitle, n.id) : metaEs(n.metaTitle, n.id),
    heroNation:
      lang === 'fr'
        ? n.heroNation
        : lang === 'en'
          ? 'First Nations of Quebec'
          : 'Pueblos indígenas de Québec',
    heroTitle: lang === 'en' ? card.name : lang === 'es' ? card.name : n.heroTitle,
    heroTagline: n.heroTagline,
    scroll: lang === 'fr' ? '↓ Découvrir' : lang === 'en' ? '↓ Discover' : '↓ Descubrir',
    card,
    nav: navMapped,
    sections: n.sections.map((s) => ({
      id: s.id,
      label: lang === 'fr' ? s.label : trLabel(s.label, lang),
      title: lang === 'fr' ? s.title : trTitle(s.title, lang, n.id),
    })),
    introHtml: lang === 'fr' ? n.introHtml : lang === 'en' ? introEn[n.id] : introEs[n.id],
  };
}

const out = {
  common: {
    fr: { scroll: '↓ Découvrir', heroNation: 'Premières Nations du Québec' },
    en: { scroll: '↓ Discover', heroNation: 'First Nations of Quebec' },
    es: { scroll: '↓ Descubrir', heroNation: 'Pueblos indígenas de Québec' },
  },
  nations: frStruct.nations.map((n) => ({
    id: n.id,
    file: n.file,
    fr: buildLang(n, 'fr'),
    en: buildLang(n, 'en'),
    es: buildLang(n, 'es'),
  })),
};

fs.writeFileSync(path.join(root, 'locales', 'nations.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('locales/nations.json généré —', out.nations.length, 'nations.');
