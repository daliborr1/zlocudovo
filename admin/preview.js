(function(){
  if(!window.CMS || !window.createClass || !window.h) return;
  var Z = window.ZlocudovoAkcije;

  var AkcijePreview = createClass({
    render: function(){
      var entry = this.props.entry;
      var list = entry.getIn(['data', 'akcije']);
      var items = list ? list.toJS() : [];

      if(!items.length){
        return h('div', { className: 'preview-empty' }, 'Nema unetih akcija.');
      }

      var html = items.map(function(item, i){
        var label = '<div class="preview-item-label">Akcija #' + (i + 1) + (item.godina ? ' — ' + item.godina : '') + '</div>';
        var body = Z ? Z.renderAkcijaHtml(item, { slideshowId: 'preview-slide-' + i }) : '';
        return label + body;
      }).join('<hr class="preview-sep">');

      return h('div', { className: 'preview-wrap', dangerouslySetInnerHTML: { __html: html } });
    }
  });

  var NajavePreview = createClass({
    render: function(){
      var entry = this.props.entry;
      var list = entry.getIn(['data', 'najave']);
      var items = list ? list.toJS() : [];

      if(!items.length){
        return h('div', { className: 'preview-empty' }, 'Nema unetih najava.');
      }

      var esc = Z ? Z.escapeHtml : function(s){ return s; };
      var html = items.map(function(item, i){
        var flag = item.aktivna ? ' — AKTIVNA (prikazuje se na sajtu)' : '';
        return '<div class="preview-item-label">Najava #' + (i + 1) + flag + '</div>' +
          '<div class="fact-plank">' +
            '<b>' + esc(item.naslov || 'Sledeća akcija') + '</b>' +
            esc(item.tekst || '') +
          '</div>';
      }).join('<hr class="preview-sep">');

      return h('div', { className: 'preview-wrap', dangerouslySetInnerHTML: { __html: html } });
    }
  });

  // Registruje se po imenu FAJLA (ne kolekcije) - Decap CMS ima poznat bag
  // gde registerPreviewTemplate ne radi kad se registruje po imenu "files"
  // kolekcije, samo po imenu pojedinacnog fajla unutar nje.
  CMS.registerPreviewTemplate('spisak-akcija', AkcijePreview);
  CMS.registerPreviewTemplate('spisak-najave', NajavePreview);

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  CMS.registerPreviewStyle('/akcije/akcija.css');
  CMS.registerPreviewStyle(
    'body{ background:#f1e6cd; }' +
    '.preview-empty{ padding:32px; font-family:"IBM Plex Mono",monospace; color:rgba(43,32,21,0.6); }' +
    '.preview-item-label{ font-family:"IBM Plex Mono",monospace; font-size:0.75rem; letter-spacing:0.05em; text-transform:uppercase; color:#c08a3e; background:#2b2015; padding:6px 16px; }' +
    '.preview-sep{ border:none; border-top:2px dashed rgba(43,32,21,0.3); margin:0; }' +
    '.fact-plank{ background:#e7d8b8; border-left:4px solid #3d7d96; padding:16px 20px; margin:16px; font-size:0.92rem; font-family:"Work Sans",sans-serif; color:#221913; }' +
    '.fact-plank b{ display:block; font-family:"Fraunces",serif; font-size:1.1rem; margin-bottom:4px; }',
    { raw: true }
  );
})();
