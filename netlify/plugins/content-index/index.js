const fs = require('fs');
const path = require('path');

function readJsonFiles(dir){
  let names;
  try {
    names = fs.readdirSync(dir).filter(function(f){ return f.endsWith('.json'); }).sort();
  } catch (e) {
    return [];
  }
  return names.map(function(name){
    const raw = fs.readFileSync(path.join(dir, name), 'utf8');
    return JSON.parse(raw);
  });
}

function writeIndex(root, contentFolder, outFile, key){
  const items = readJsonFiles(path.join(root, 'content', contentFolder));
  const outDir = path.join(root, 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const data = {};
  data[key] = items;
  fs.writeFileSync(path.join(outDir, outFile), JSON.stringify(data, null, 2));
  console.log('content-index: spojeno ' + items.length + ' u data/' + outFile);
}

module.exports = {
  onPreBuild: async () => {
    const root = process.cwd();
    writeIndex(root, 'akcije', 'akcije.json', 'akcije');
    writeIndex(root, 'najave', 'najave.json', 'najave');
    writeIndex(root, 'familija-galerija', 'familija-galerija.json', 'items');
    writeIndex(root, 'akcije-galerija', 'akcije-galerija.json', 'items');
  }
};
