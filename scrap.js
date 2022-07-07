const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const districts = [
  {
    id: 1,
    code: 'nansouty',
    name: 'Nansouty',
    ma_code: 'nansouty',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_nansouty-170491825/'
  },
  {
    id: 3,
    code: 'la_bastide',
    name: 'La Bastide',
    ma_code: 'la_bastide',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_la-bastide-170489513/'
  },
  {
    id: 4,
    code: 'saint_augustin',
    name: 'Saint Augustin',
    ma_code: 'saint_augustin',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_saint-augustin-170493985/'
  },
  {
    id: 5,
    code: 'villa_primerose_parc_bordelais_cauderan',
    name: 'Villa Primerose / Parc Bordelais / Cauderan',
    ma_code: 'villa_primerose_parc_bordelais_cauderan',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_villa-primerose-parc-bordelais-cauderan-170494226/'
  },
  {
    id: 6,
    code: 'saint_bruno_saint_victor',
    name: 'Saint-Bruno / Saint-Victor',
    ma_code: 'saint_bruno_saint_victor',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_saint-bruno-saint-victor-170491987/'
  },
  {
    id: 7,
    code: 'saint_seurin_fondaudege',
    name: 'Saint Seurin / Fondaudège',
    ma_code: 'saint_seurin_fondaudege',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_saint-seurin-fondaudege-170492384/'

  },
  {
    id: 8,
    code: 'chartrons_grand_parc',
    name: 'Chartrons',
    ma_code: 'chartrons_grand_parc',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_chartrons-grand-parc-170493895/'
  },
  {
    id: 9,
    code: 'hotel_de_ville_quinconces',
    name: 'Hotel de Ville / Quinconces',
    ma_code: 'hotel_de_ville_quinconces',
    ma_url: 'https://www.meilleursagents.com/prix-immobilier/bordeaux-33000/quartier_hotel-de-ville-quinconces-170491639/'
  }
];


const getData = async (browser, district) => {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
  await page.goto(district.ma_url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('body');
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    const selector = "#prices-summary-sell > div.prices-summary__prices--container > div.prices-summary__apartment-prices > ul";
    const pricesSummary = document.querySelector(selector).innerText;
    // removing the thousand space separator, the " €" and replacing the line break by a simple splace
    const clearText = pricesSummary.replace(/\u202f/g, '').replace(/\u00a0€/g, '').replace(/\n/g, ' ')
    const myArr = clearText.split(' ');

    // date key construction
    const now = new Date();
    let mm = now.getMonth() + 1;
    if (mm < 10)
      mm = `0${mm}`;

    const dateKey = `${now.getFullYear()}${mm}`;

    const prix_moy = parseInt(myArr[3]);
    const prix_max = parseInt(myArr[7]);
    const prix_min = parseInt(myArr[5]);
    return { [dateKey]: { prix_moy, prix_max, prix_min }}
  });
  return { ...district, prices: { ...result } };
}

const scrap = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=1920,1080`],
    defaultViewport: { width:1920, height:1080 }
  });

  const results = await Promise.all(districts.map(district => getData(browser, district)));

  await browser.close();
  return results;
}

const exportResult = async (result) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  let mm = now.getMonth() + 1, dd = now.getDate();
  if (dd < 10) dd = `0${dd}`;
  if (mm < 10) mm = `0${mm}`;
  const dateString = `${yyyy}-${mm}-${dd}`;

  const fileName = `output/output_${dateString}.json`;
  const fileContent = JSON.stringify(result, null, 2);

  try {
    await fs.writeFile(fileName, fileContent, 'utf8');
    console.log(`JSON file has been saved here: ./${fileName}`);
  } catch (err) {
    console.error("An error occured while writing JSON Object to File.", err);
  }
}

scrap()
  .then(res => exportResult(res))
  .catch(err => console.error(err));