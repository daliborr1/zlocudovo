window.ZlocudovoAkcije = (function(){
  var DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

  function slugify(str){
    return String(str || '')
      .normalize('NFD').replace(DIACRITICS_RE, '')
      .toLowerCase()
      .replace(/đ/g, 'dj')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function slugFor(item){
    return (item.godina || '') + '-' + slugify(item.naslov || '');
  }

  function fetchAkcije(){
    return fetch('/data/akcije.json', { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : { akcije: [] }; })
      .then(function(data){ return (data && data.akcije) ? data.akcije : []; })
      .catch(function(){ return []; });
  }

  return { slugify: slugify, escapeHtml: escapeHtml, slugFor: slugFor, fetchAkcije: fetchAkcije };
})();
