const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public/images/schools');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const universities = [
  { slug: 'enugu-state-university-of-science-and-technology', edurank: 'enugu-state-university-of-science-and-technology-logo.png', aliases: ['esut.png'] },
  { slug: 'university-of-nigeria-nsukka', edurank: 'university-of-nigeria-logo.png', aliases: ['unn.png', 'university-of-nigeria.png'] },
  { slug: 'university-of-lagos', edurank: 'university-of-lagos-logo.png', aliases: ['unilag.png'] },
  { slug: 'university-of-ibadan', edurank: 'university-of-ibadan-logo.png', aliases: ['ui.png'] },
  { slug: 'obafemi-awolowo-university', edurank: 'obafemi-awolowo-university-logo.png', aliases: ['oau.png', 'oau-ile-ife.png'] },
  { slug: 'ahmadu-bello-university', edurank: 'ahmadu-bello-university-logo.png', aliases: ['abu.png', 'abu-zaria.png'] },
  { slug: 'covenant-university', edurank: 'covenant-university-logo.png', aliases: ['cu.png'] },
  { slug: 'federal-university-of-technology-owerri', edurank: 'federal-university-of-technology-owerri-logo.png', aliases: ['futo.png'] },
  { slug: 'federal-university-of-technology-akure', edurank: 'federal-university-of-technology-akure-logo.png', aliases: ['futa.png'] },
  { slug: 'federal-university-of-technology-minna', edurank: 'federal-university-of-technology-minna-logo.png', aliases: ['futminna.png'] },
  { slug: 'federal-university-of-agriculture-abeokuta', edurank: 'federal-university-of-agriculture-abeokuta-logo.png', aliases: ['funaab.png'] },
  { slug: 'lagos-state-university', edurank: 'lagos-state-university-logo.png', aliases: ['lasu.png'] },
  { slug: 'nnamdi-azikiwe-university', edurank: 'nnamdi-azikiwe-university-logo.png', aliases: ['unizik.png'] },
  { slug: 'university-of-benin', edurank: 'university-of-benin-logo.png', aliases: ['uniben.png'] },
  { slug: 'university-of-port-harcourt', edurank: 'university-of-port-harcourt-logo.png', aliases: ['uniport.png'] },
  { slug: 'university-of-ilorin', edurank: 'university-of-ilorin-logo.png', aliases: ['unilorin.png'] },
  { slug: 'babcock-university', edurank: 'babcock-university-logo.png', aliases: ['bu.png'] },
  { slug: 'bayero-university-kano', edurank: 'bayero-university-kano-logo.png', aliases: ['buk.png'] },
  { slug: 'university-of-calabar', edurank: 'university-of-calabar-logo.png', aliases: ['unical.png'] },
  { slug: 'university-of-jos', edurank: 'university-of-jos-logo.png', aliases: ['unijos.png'] },
  { slug: 'university-of-uyo', edurank: 'university-of-uyo-logo.png', aliases: ['uniuyo.png'] },
  { slug: 'university-of-maiduguri', edurank: 'university-of-maiduguri-logo.png', aliases: ['unimaid.png'] },
  { slug: 'university-of-abuja', edurank: 'university-of-abuja-logo.png', aliases: ['uniabuja.png'] },
  { slug: 'ekiti-state-university', edurank: 'ekiti-state-university-logo.png', aliases: ['eksu.png'] },
  { slug: 'olabisi-onabanjo-university', edurank: 'olabisi-onabanjo-university-logo.png', aliases: ['oou.png'] },
  { slug: 'adekunle-ajasin-university', edurank: 'adekunle-ajasin-university-logo.png', aliases: ['aaua.png'] },
  { slug: 'ambrose-alli-university', edurank: 'ambrose-alli-university-logo.png', aliases: ['aau.png'] },
  { slug: 'delta-state-university', edurank: 'delta-state-university-logo.png', aliases: ['delsu.png'] },
  { slug: 'imo-state-university', edurank: 'imo-state-university-logo.png', aliases: ['imsu.png'] },
  { slug: 'abia-state-university', edurank: 'abia-state-university-logo.png', aliases: ['absu.png'] },
  { slug: 'benue-state-university', edurank: 'benue-state-university-logo.png', aliases: ['bsu.png'] },
  { slug: 'kogi-state-university', edurank: 'kogi-state-university-logo.png', aliases: ['ksu.png'] },
  { slug: 'kaduna-state-university', edurank: 'kaduna-state-university-logo.png', aliases: ['kasu.png'] },
  { slug: 'nasarawa-state-university', edurank: 'nasarawa-state-university-logo.png', aliases: ['nsuk.png'] },
  { slug: 'rivers-state-university', edurank: 'rivers-state-university-logo.png', aliases: ['rsu.png'] },
  { slug: 'osun-state-university', edurank: 'osun-state-university-logo.png', aliases: ['uniosun.png'] },
  { slug: 'kwara-state-university', edurank: 'kwara-state-university-logo.png', aliases: ['kwasu.png'] },
  { slug: 'ebonyi-state-university', edurank: 'ebonyi-state-university-logo.png', aliases: ['ebsu.png'] },
  { slug: 'national-open-university-of-nigeria', edurank: 'national-open-university-of-nigeria-logo.png', aliases: ['noun.png'] },
  { slug: 'american-university-of-nigeria', edurank: 'american-university-of-nigeria-logo.png', aliases: ['aun.png'] },
  { slug: 'baze-university', edurank: 'baze-university-logo.png', aliases: ['baze.png'] },
  { slug: 'lead-city-university', edurank: 'lead-city-university-logo.png', aliases: ['lcu.png'] },
  { slug: 'bowen-university', edurank: 'bowen-university-logo.png', aliases: ['bowen.png'] },
  { slug: 'afe-babalola-university', edurank: 'afe-babalola-university-logo.png', aliases: ['abuad.png'] },
  { slug: 'federal-university-oye-ekiti', edurank: 'federal-university-oye-ekiti-logo.png', aliases: ['fuoye.png'] },
  { slug: 'federal-university-lokoja', edurank: 'federal-university-lokoja-logo.png', aliases: ['ful.png'] },
  { slug: 'federal-university-dutse', edurank: 'federal-university-dutse-logo.png', aliases: ['fud.png'] },
  { slug: 'federal-university-lafia', edurank: 'federal-university-lafia-logo.png', aliases: ['fulafia.png'] },
  { slug: 'federal-university-wukari', edurank: 'federal-university-wukari-logo.png', aliases: ['fuw.png'] },
  { slug: 'federal-university-kashere', edurank: 'federal-university-kashere-logo.png', aliases: ['fuk.png'] },
  { slug: 'federal-university-gusau', edurank: 'federal-university-gusau-logo.png', aliases: ['fugus.png'] },
  { slug: 'federal-university-birnin-kebbi', edurank: 'federal-university-birnin-kebbi-logo.png', aliases: ['fubk.png'] },
  { slug: 'federal-university-gashua', edurank: 'federal-university-gashua-logo.png', aliases: ['fugashua.png'] },
  { slug: 'university-of-ghana', edurank: 'university-of-ghana-logo.png', aliases: ['ug.png'] },
  { slug: 'kwame-nkrumah-university-of-science-and-technology', edurank: 'kwame-nkrumah-university-of-science-and-technology-logo.png', aliases: ['knust.png'] },
  { slug: 'university-of-nairobi', edurank: 'university-of-nairobi-logo.png', aliases: ['uon.png'] },
  { slug: 'makerere-university', edurank: 'makerere-university-logo.png', aliases: ['mak.png'] },
  { slug: 'university-of-cape-town', edurank: 'university-of-cape-town-logo.png', aliases: ['uct.png'] },
  { slug: 'university-of-the-witwatersrand', edurank: 'university-of-the-witwatersrand-logo.png', aliases: ['wits.png'] },
  { slug: 'stellenbosch-university', edurank: 'stellenbosch-university-logo.png', aliases: ['su.png'] },
  { slug: 'addis-ababa-university', edurank: 'addis-ababa-university-logo.png', aliases: ['aau.png'] }
];

function downloadLogo(uni) {
  return new Promise((resolve) => {
    const url = `https://edurank.org/assets/img/uni-logos/${uni.edurank}`;
    const mainFile = path.join(targetDir, `${uni.slug}.png`);

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        const data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(data);
          fs.writeFileSync(mainFile, buffer);
          if (uni.aliases) {
            for (const alias of uni.aliases) {
              fs.writeFileSync(path.join(targetDir, alias), buffer);
            }
          }
          console.log(`[SUCCESS] Downloaded authentic logo for ${uni.slug} (${buffer.length} bytes)`);
          resolve(true);
        });
      } else {
        console.log(`[SKIP] Status ${res.statusCode} for ${uni.slug}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`[ERROR] ${uni.slug}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`Starting download of authentic university logos (${universities.length} universities)...`);
  for (const uni of universities) {
    await downloadLogo(uni);
  }
  console.log('Finished downloading authentic logos!');
}

run();
