// scripts/fetch-mapillary.js
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const token = process.env.MAPILLARY_TOKEN;
if (!token) {
  console.error("❌ MAPILLARY_TOKEN отсутствует. Добавь его в .env");
  process.exit(1);
}

// Путь к исходным данным
const fountainsPath = path.join(__dirname, "../data/valencia_fountains.json");
if (!fs.existsSync(fountainsPath)) {
  console.error(`❌ Файл не найден: ${fountainsPath}`);
  process.exit(1);
}
const fountains = JSON.parse(fs.readFileSync(fountainsPath, "utf8"));

// Функция запроса фото с Mapillary
async function fetchPhoto(lat, lon) {
  const bboxSize = 0.0005; // радиус поиска
  const bbox = [
    lon - bboxSize,
    lat - bboxSize,
    lon + bboxSize,
    lat + bboxSize
  ].join(",");

  const url = `https://graph.mapillary.com/images?fields=id,thumb_1024_url&bbox=${bbox}&limit=1&access_token=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].thumb_1024_url;
    }
  } catch (e) {
    console.error("Ошибка загрузки фото:", e);
  }
  return null;
}

(async () => {
  const results = [];
  for (const feature of fountains.features) {
    const [lon, lat] = feature.geometry.coordinates;
    const photoUrl = await fetchPhoto(lat, lon);
    results.push({
      ...feature,
      properties: {
        ...feature.properties,
        imageUrl: photoUrl
      }
    });
    console.log(`✅ ${feature.properties.description || "Фонтан"}: ${photoUrl || "Фото не найдено"}`);
  }

  const outPath = path.join(__dirname, "../src/data/fountains_with_photos.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`💾 Сохранено в ${outPath}`);
})();


