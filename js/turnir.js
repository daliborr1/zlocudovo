(function(){
  var Z = window.ZlocudovoAkcije;

  var ROUND_ORDER = ["Grupna faza", "Pretkolo", "1/16 finala", "Osmina finala", "Četvrtfinale", "Polufinale", "Finale"];

  function roundIndex(name){
    var i = ROUND_ORDER.indexOf(name);
    return i === -1 ? ROUND_ORDER.length : i;
  }

  function esc(s){ return Z ? Z.escapeHtml(s) : String(s == null ? '' : s); }

  function fetchJson(url, fallback){
    return fetch(url, { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : fallback; })
      .catch(function(){ return fallback; });
  }

  function scoreHtml(score){
    return (score || score === 0) ? '<span class="score">' + esc(score) + '</span>' : '';
  }

  function matchHtml(m){
    var row1 = '<div class="t-match-team"><span>' + esc(m.tim1) + '</span>' + scoreHtml(m.rezultat1) + '</div>';
    if(!m.tim2){
      return '<div class="t-match">' + row1 + '<div class="bye">slobodno (bye)</div></div>';
    }
    var row2 = '<div class="t-match-team"><span>' + esc(m.tim2) + '</span>' + scoreHtml(m.rezultat2) + '</div>';
    return '<div class="t-match">' + row1 + row2 + '</div>';
  }

  function renderBracket(matches){
    if(!matches.length){
      return '<p class="t-empty">Žreb još nije objavljen.</p>';
    }
    var byRound = {};
    var order = [];
    matches.forEach(function(m){
      var r = m.runda || 'Ostalo';
      if(!byRound[r]){ byRound[r] = []; order.push(r); }
      byRound[r].push(m);
    });
    order.sort(function(a, b){ return roundIndex(a) - roundIndex(b); });
    var cols = order.map(function(r){
      return '<div class="t-round"><div class="t-round-name">' + esc(r) + '</div>' +
        '<div class="t-round-matches">' + byRound[r].map(matchHtml).join('') + '</div></div>';
    }).join('');
    return '<div class="t-bracket-wrap"><div class="t-bracket">' + cols + '</div></div>';
  }

  function renderSchedule(matches){
    var withInfo = matches.filter(function(m){ return m.datum || m.vreme || m.teren; });
    if(!withInfo.length){
      return '<p class="t-empty">Termini će biti objavljeni čim se potvrde.</p>';
    }
    return '<div class="t-schedule">' + withInfo.map(function(m){
      var teams = m.tim2 ? (esc(m.tim1) + ' — ' + esc(m.tim2)) : esc(m.tim1);
      var meta = [];
      if(m.datum) meta.push('📅 ' + esc(m.datum));
      if(m.vreme) meta.push('🕒 ' + esc(m.vreme));
      if(m.teren) meta.push('📍 ' + esc(m.teren));
      return '<div class="t-schedule-item"><div class="teams">' + teams + '</div>' +
        meta.map(function(x){ return '<div class="meta">' + x + '</div>'; }).join('') + '</div>';
    }).join('') + '</div>';
  }

  function renderNews(items){
    if(!items.length){
      return '<p class="t-empty">Još nema objava.</p>';
    }
    return '<div class="t-news">' + items.map(function(n){
      return '<div class="t-news-item">' +
        '<div class="t-news-date">' + esc(n.datum || '') + '</div>' +
        '<div><div class="t-news-title">' + esc(n.naslov) + '</div>' +
        '<div class="t-news-body">' + (Z ? Z.renderMarkdown(n.tekst) : esc(n.tekst)) + '</div></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderSponsors(items){
    if(!items.length){
      return '<p class="t-empty">Uskoro.</p>';
    }
    return '<div class="t-sponsors">' + items.map(function(s){
      var img = '<img src="' + esc(s.logo) + '" alt="' + esc(s.naziv || '') + '">';
      return s.link
        ? '<a class="t-sponsor" href="' + esc(s.link) + '" target="_blank" rel="noopener">' + img + '</a>'
        : '<div class="t-sponsor">' + img + '</div>';
    }).join('') + '</div>';
  }

  function statNum(val, label){
    return val ? '<div><div class="num">' + esc(val) + '</div><div class="lbl">' + esc(label) + '</div></div>' : '';
  }

  Promise.all([
    fetchJson('/data/turnir-podesavanja.json', {}),
    fetchJson('/data/turnir-utakmice.json', { items: [] }),
    fetchJson('/data/turnir-novosti.json', { items: [] }),
    fetchJson('/data/turnir-sponzori.json', { items: [] })
  ]).then(function(results){
    var s = results[0] || {};
    var matches = (results[1] && results[1].items) || [];
    var news = (results[2] && results[2].items) || [];
    var sponsors = (results[3] && results[3].items) || [];

    var naziv = s.naziv || 'Turnir';
    document.title = naziv + ' — Zloćudovo';

    var yearLabel = document.getElementById('turnirYearLabel');
    if(yearLabel){
      var yearMatch = naziv.match(/\d{4}/);
      yearLabel.textContent = yearMatch ? '/ Turnir ' + yearMatch[0] : '/ Turnir';
    }

    var showWinner = !!s.prikazi_pobednika;
    var showSponsors = !!s.prikazi_sponzore;
    var navPobednik = document.getElementById('navPobednik');
    var navSponzori = document.getElementById('navSponzori');
    if(showWinner && navPobednik) navPobednik.style.display = '';
    if(showSponsors && navSponzori) navSponzori.style.display = '';

    var sekcija = 0;
    function tag(){ sekcija += 1; return String(sekcija).padStart(2, '0'); }

    var html = '';

    html += '<section class="t-hero">' +
      '<div class="t-eyebrow">Omladinski pokret „Familija" predstavlja</div>' +
      '<h1>' + esc(naziv) + '</h1>' +
      (s.opis ? '<div class="lede">' + (Z ? Z.renderInline(s.opis) : esc(s.opis)) + '</div>' : '') +
      '<div class="t-status"><span class="dot"></span>Status: ' + esc(s.status || 'Uskoro') + '</div>' +
      '<div class="t-stats">' +
        statNum(s.broj_ekipa, 'ekipa') +
        statNum(s.sport, 'sport') +
        statNum(s.format, 'format') +
        statNum(s.datum, 'datum') +
      '</div>' +
    '</section>';

    if(showWinner){
      html += '<section class="t-section alt" id="pobednik">' +
        '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Objava pobednika</h2></div>' +
        '<div class="t-winner">' +
          (s.pobednik_slika ? '<img src="' + esc(s.pobednik_slika) + '" alt="' + esc(s.pobednik_naziv || '') + '">' : '') +
          '<div>' +
            '<div class="lbl">Pobednik turnira</div>' +
            '<div class="name">' + esc(s.pobednik_naziv || 'Biće objavljeno') + '</div>' +
            (s.pobednik_cestitka ? '<div class="cestitka">' + (Z ? Z.renderMarkdown(s.pobednik_cestitka) : esc(s.pobednik_cestitka)) + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</section>';
    }

    html += '<section class="t-section" id="zdreb">' +
      '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Žreb</h2></div>' +
      '<p class="lede">Parovi kup sistema. Rezultati se upisuju čim se meč odigra.</p>' +
      renderBracket(matches) +
    '</section>';

    html += '<section class="t-section alt" id="raspored">' +
      '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Raspored mečeva</h2></div>' +
      renderSchedule(matches) +
    '</section>';

    html += '<section class="t-section" id="novosti">' +
      '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Novosti</h2></div>' +
      renderNews(news) +
    '</section>';

    if(showSponsors){
      html += '<section class="t-section alt" id="sponzori">' +
        '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Sponzori i podrška</h2></div>' +
        renderSponsors(sponsors) +
      '</section>';
    }

    html += '<section class="t-section" id="kontakt">' +
      '<div class="section-head"><span class="tag">' + tag() + '</span><h2>Kontakt</h2></div>' +
      '<div class="t-contact-links">' +
        '<a href="mailto:mz.zlocudovo@leskovac.rs">mz.zlocudovo@leskovac.rs</a>' +
        '<a href="https://www.instagram.com/zlocudovo/" target="_blank" rel="noopener">Instagram — @zlocudovo</a>' +
        '<a href="https://www.facebook.com/p/Zlo%C4%87udovo-Familija-100010956094103/" target="_blank" rel="noopener">Facebook — Zloćudovo Familija</a>' +
      '</div>' +
    '</section>';

    var contentEl = document.getElementById('turnirContent');
    if(contentEl) contentEl.innerHTML = html;
  });
})();
