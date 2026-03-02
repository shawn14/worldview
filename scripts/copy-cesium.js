const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const cesiumSource = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const publicCesium = path.join(__dirname, "..", "public", "cesium");

// Ensure target dir exists
fs.mkdirSync(publicCesium, { recursive: true });

const dirs = ["Workers", "Assets", "Widgets", "ThirdParty"];
for (const dir of dirs) {
  const src = path.join(cesiumSource, dir);
  const dest = path.join(publicCesium, dir);
  if (fs.existsSync(src)) {
    execSync(`cp -r "${src}" "${dest}"`);
    console.log(`Copied ${dir}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}

console.log("Cesium assets copied to public/cesium/");
