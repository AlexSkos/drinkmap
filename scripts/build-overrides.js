// scripts/build-overrides.js
// Генерит src/data/overrides.ts на основе картинок в assets/overrides/**
// Логика:
// 1) Имя вида node_<OSM_ID>.jpg/png → прямое соответствие OSM ID
// 2) Иначе берём GPS из EXIF и находим ближайший фонтан (< 80 м)

import fg from "fast-glob";
import fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import * as exifr from "exifr";

// ---- __dirname для ES-модулей ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- пути ----
const ROOT = path.join(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src", "data", "overrides.ts");
const DATA_FILE = path.join(ROOT, "src", "data", "fountains_with_photos.json");

// подберём любые изображения в папке overrides (вложенные тоже)
const GLOB = ["assets/overrides/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}"];
const DIST_THRESHOLD_M = 80; // радиус матчинга по EXIF GPS

// ---- утилиты ----
function toPosix(p) {
  return p.split(path.sep).join("/");
}
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // м
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function looksLikeNodeName(basename) {
  // node_647921208.jpg → вернёт "node/647921208"
  const m = basename.match(/^node[_-]?(\d+)\.(?:jpe?g|png)$/i);
  return m ? `node/${m[1]}` : null;
}

// ---- чтение датасета фонтанов ----
function loadFountains() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const arr = JSON.parse(raw);
  // файл у нас — GeoJSON FeatureCollection from OSM
  const feats = Array.isArray(arr.features) ? arr.features : [];
  return feats
    .map((f) => {
      const id = String(f?.properties?.["@id"] || f?.id || "");
      const [lng, lat] = f?.geometry?.coordinates || [];
      return { id, lat: Number(lat), lng: Number(lng) };
    })
    .filter((x) => x.id && Number.isFinite(x.lat) && Number.isFinite(x.lng));
}

// ---- основная логика ----
async function main() {
  console.log("Project root:", ROOT);
  console.log("DATA_FILE ->", DATA_FILE);
  console.log("Looking for:", GLOB.join(", "));

  const fountains = loadFountains();

  // Быстрый поиск ближайшей точки (линейный — для наших объёмов ок)
  function nearestByGps(lat, lng) {
    let best = null;
    let bestD = Infinity;
    for (const f of fountains) {
      const d = haversineMeters(lat, lng, f.lat, f.lng);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    return best && bestD <= DIST_THRESHOLD_M ? best.id : null;
  }

  const files = await fg(GLOB, { cwd: ROOT, absolute: true, onlyFiles: true });
  if (!files.length) {
    console.log("No images found in assets/overrides. Put images there like node_123456789.jpg");
    return;
  }

  const overrides = {}; // { "node/123": require("../../assets/overrides/xxx.jpg") }

  for (const abs of files) {
    const base = path.basename(abs);
    // относительный путь от src/data → к файлу (чтобы работал require в .ts)
    const relFromData = toPosix(
      path.relative(path.join(ROOT, "src", "data"), abs)
    ); // ../../assets/overrides/xxx.jpg

    // 1) матч по имени
    const idByName = looksLikeNodeName(base);
    if (idByName) {
      overrides[idByName] = relFromData;
      console.log("Map", idByName, "->", relFromData);
      continue;
    }

    // 2) матч по EXIF GPS
    try {
      const gps = await exifr.gps(abs); // {latitude, longitude}
      if (gps?.latitude && gps?.longitude) {
        const foundId = nearestByGps(gps.latitude, gps.longitude);
        if (foundId) {
          overrides[foundId] = relFromData;
          console.log("GPS", foundId, "->", relFromData);
          continue;
        }
      }
    } catch (e) {
      // пропускаем файл без EXIF
    }
  }

  // ---- генерация TypeScript мапы ----
  function generateTs(obj) {
    const entries = Object.entries(obj)
      .map(
        ([id, rel]) => `  "${id}": require("${toPosix(rel)}")`
      )
      .join(",\n");
    return `// AUTO-GENERATED FILE. Do not edit.\n` +
      `// Built by scripts/build-overrides.js\n\n` +
      `export const OVERRIDES: Record<string, any> = {\n${entries}\n};\n\n` +
      `export default OVERRIDES;\n`;
  }

  const rawTs = generateTs(overrides);
  const pretty = await prettier.format(rawTs, { parser: "typescript" }); // <<< ВАЖНО: await
  fs.writeFileSync(OUT_FILE, pretty, "utf8"); // <<< строка, не Promise
  console.log(`Wrote ${OUT_FILE} with ${Object.keys(overrides).length} entries`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
