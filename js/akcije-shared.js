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

  // Mali markdown-lite renderer: naslovi (#, ##, ###), **podebljano**, *kurziv*,
  // [link](url), ![slika](url), > citat, liste (- / 1.). Sav tekst se escape-uje
  // pre nego sto se markdown sintaksa pretvori u HTML, pa je bezbedno od XSS-a.
  function inlineMd(text){
    var s = text;
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function(m, alt, url){
      return '<img class="akcija-hero-img" src="' + url + '" alt="' + alt + '">';
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function(m, txt, url){
      return '<a href="' + url + '" target="_blank" rel="noopener">' + txt + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
    return s;
  }

  function renderMarkdown(raw){
    var text = String(raw || '').replace(/\r\n/g, '\n');
    var blocks = text.split(/\n{2,}/)
      .map(function(b){ return b.replace(/^\n+|\n+$/g, ''); })
      .filter(function(b){ return b.trim().length; });

    return blocks.map(function(block){
      var lines = block.split('\n');

      var headingMatch = lines.length === 1 && block.match(/^(#{1,6})\s+(.+)$/);
      if(headingMatch){
        var level = Math.min(headingMatch[1].length + 1, 4);
        return '<h' + level + '>' + inlineMd(escapeHtml(headingMatch[2].trim())) + '</h' + level + '>';
      }

      if(lines.every(function(l){ return /^>\s?/.test(l); })){
        var qtext = lines.map(function(l){ return l.replace(/^>\s?/, ''); }).join(' ');
        return '<p class="akcija-quote">' + inlineMd(escapeHtml(qtext)) + '</p>';
      }

      if(lines.every(function(l){ return /^[-*]\s+/.test(l); })){
        var uitems = lines.map(function(l){
          return '<li>' + inlineMd(escapeHtml(l.replace(/^[-*]\s+/, ''))) + '</li>';
        }).join('');
        return '<ul class="akcija-facts">' + uitems + '</ul>';
      }

      if(lines.every(function(l){ return /^\d+\.\s+/.test(l); })){
        var oitems = lines.map(function(l){
          return '<li>' + inlineMd(escapeHtml(l.replace(/^\d+\.\s+/, ''))) + '</li>';
        }).join('');
        return '<ol>' + oitems + '</ol>';
      }

      var para = lines.map(function(l){ return inlineMd(escapeHtml(l)); }).join('<br>');
      return '<p>' + para + '</p>';
    }).join('');
  }

  // Zajednicka HTML struktura jedne akcije (hero + telo) - koristi je i
  // akcije/prikaz.html (prava stranica) i admin/preview.js (CMS preview),
  // tako da preview stvarno izgleda kao prava stranica.
  function renderAkcijaHtml(item, opts){
    opts = opts || {};
    var slideId = opts.slideshowId || 'akcijaSlideshow';

    function sizeClass(v){ return (v === 'mala' || v === 'velika') ? v : 'srednja'; }

    function mediaBlock(velicina, inner, extraClass){
      return '<div class="akcija-media-block size-' + sizeClass(velicina) + (extraClass ? ' ' + extraClass : '') + '">' + inner + '</div>';
    }

    function mediaRow(pos, velicina, mediaInner, textHtml){
      var p = (pos === 'right') ? 'right' : 'left';
      return '<div class="akcija-media-row pos-' + p + ' size-' + sizeClass(velicina) + '">' +
        '<div class="akcija-media-slot">' + mediaInner + '</div>' +
        '<div class="akcija-text-slot">' + textHtml + '</div>' +
      '</div>';
    }

    function captionHtml(text){
      return text ? '<p class="slideshow-note">' + escapeHtml(text) + '</p>' : '';
    }

    var imgInner = item.slika
      ? '<img class="akcija-hero-img" src="' + escapeHtml(item.slika) + '" alt="' + escapeHtml(item.naslov) + '">' + captionHtml(item.opis_slike)
      : '';

    var galerija = Array.isArray(item.galerija)
      ? item.galerija.map(function(g){ return typeof g === 'string' ? g : (g && g.slika); }).filter(Boolean)
      : [];
    var galleryInner = '';
    if(galerija.length){
      var slides = galerija.map(function(src, i){
        return '<div class="slide' + (i === 0 ? ' active' : '') + '"><img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.naslov) + '"></div>';
      }).join('');
      var controls = galerija.length > 1
        ? '<button type="button" class="slide-nav prev" aria-label="Prethodna slika">‹</button>' +
          '<button type="button" class="slide-nav next" aria-label="Sledeća slika">›</button>' +
          '<div class="slide-dots"></div>'
        : '';
      galleryInner = '<div class="slideshow" id="' + slideId + '">' + slides + controls + '</div>' + captionHtml(item.opis_galerije);
    }

    var izgled = item.izgled || 'top';
    var izgledG = item.izgled_galerije || 'top';
    var textHtml = renderMarkdown(item.tekst);

    var pre = [];
    var post = [];
    var rowUsed = false;

    if(imgInner && (izgled === 'left' || izgled === 'right')){
      textHtml = mediaRow(izgled, item.velicina_slike, imgInner, textHtml);
      rowUsed = true;
    } else if(imgInner && izgled === 'top'){
      pre.push(mediaBlock(item.velicina_slike, imgInner));
    }

    if(galleryInner){
      if(!rowUsed && (izgledG === 'left' || izgledG === 'right')){
        textHtml = mediaRow(izgledG, item.velicina_galerije, galleryInner, textHtml);
        rowUsed = true;
      } else if(izgledG === 'end'){
        post.push(mediaBlock(item.velicina_galerije, galleryInner, 'akcija-gallery pos-end'));
      } else {
        pre.push(mediaBlock(item.velicina_galerije, galleryInner, 'akcija-gallery'));
      }
    }

    return '<section class="akcija-hero"><div class="akcija-hero-inner">' +
        '<span class="yr">' + escapeHtml(item.godina) + '</span>' +
        '<h1>' + escapeHtml(item.naslov) + '</h1>' +
        '<p class="lede">' + escapeHtml(item.opis || '') + '</p>' +
      '</div></section>' +
      '<article class="akcija-body">' +
        pre.join('') +
        textHtml +
        post.join('') +
      '</article>';
  }

  return {
    slugify: slugify,
    escapeHtml: escapeHtml,
    slugFor: slugFor,
    fetchAkcije: fetchAkcije,
    renderMarkdown: renderMarkdown,
    renderAkcijaHtml: renderAkcijaHtml
  };
})();
