const fs = require('fs');
const path = require('path');

function readJsonFiles(dir){
  let names;
  try {
    names = fs.readdirSync(dir).filter(function(f){ return f.endsWith('.json'); });
  } catch (e) {
    return [];
  }
  return names.map(function(name){
    const raw = fs.readFileSync(path.join(dir, name), 'utf8');
    return JSON.parse(raw);
  });
}

module.exports = {
  onPreBuild: async ({ utils }) => {
    const root = process.cwd();
    const akcije = readJsonFiles(path.join(root, 'content', 'akcije'));

    const outDir = path.join(root, 'data');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'akcije.json'),
      JSON.stringify({ akcije: akcije }, null, 2)
    );

    console.log('akcije-index: spojeno ' + akcije.length + ' akcija u data/akcije.json');
  }
};
