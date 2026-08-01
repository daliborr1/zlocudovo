(function(){
  if(!window.CMS || !window.createClass || !window.h) return;
  var Z = window.ZlocudovoAkcije;

  // "akcije" je sad folder kolekcija (jedan fajl po akciji) - jedan entry
  // = jedna akcija, pa preview prikazuje samo nju, ne celu listu.
  var AkcijaPreview = createClass({
    render: function(){
      var entry = this.props.entry;
      var data = entry.get('data');
      var item = data ? data.toJS() : {};
      var html = Z ? Z.renderAkcijaHtml(item, { slideshowId: 'preview-slide' }) : '';
      return h('div', { className: 'preview-wrap', dangerouslySetInnerHTML: { __html: html } });
    }
  });

  // "najave" je sad takodje folder kolekcija (jedan fajl po najavi) - isti
  // princip kao za akcije, jedan entry = jedna najava.
  var NajavaPreview = createClass({
    render: function(){
      var entry = this.props.entry;
      var data = entry.get('data');
      var item = data ? data.toJS() : {};
      var flag = item.aktivna ? ' — AKTIVNA (prikazuje se na sajtu)' : ' — nije aktivna (podrazumevana poruka ostaje na sajtu)';
      var body = Z ? Z.renderNajavaHtml(item) : '';
      var html = '<div class="preview-item-label">Najava' + flag + '</div><div class="fact-plank">' + body + '</div>';
      return h('div', { className: 'preview-wrap', dangerouslySetInnerHTML: { __html: html } });
    }
  });

  // Pojedinacna fotografija u jednoj od dve homepage galerije - jedan
  // entry = jedna slika + opis.
  var GalleryPhotoPreview = createClass({
    render: function(){
      var entry = this.props.entry;
      var data = entry.get('data');
      var item = data ? data.toJS() : {};
      var esc = Z ? Z.escapeHtml : function(s){ return s; };
      var img = item.slika
        ? '<img class="preview-photo" src="' + esc(item.slika) + '" alt="' + esc(item.opis || '') + '">'
        : '<div class="preview-empty">Nema izabrane slike.</div>';
      var html = img + (item.opis ? '<p class="preview-caption">' + esc(item.opis) + '</p>' : '');
      return h('div', { className: 'preview-wrap', dangerouslySetInnerHTML: { __html: html } });
    }
  });

  // Sve su folder kolekcije, pa se registruju po imenu kolekcije direktno.
  CMS.registerPreviewTemplate('akcije', AkcijaPreview);
  CMS.registerPreviewTemplate('najave', NajavaPreview);
  CMS.registerPreviewTemplate('familija-galerija', GalleryPhotoPreview);
  CMS.registerPreviewTemplate('akcije-galerija', GalleryPhotoPreview);

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  CMS.registerPreviewStyle('/akcije/akcija.css');
  CMS.registerPreviewStyle(
    'body{ background:#f1e6cd; }' +
    '.preview-empty{ padding:32px; font-family:"IBM Plex Mono",monospace; color:rgba(43,32,21,0.6); }' +
    '.preview-item-label{ font-family:"IBM Plex Mono",monospace; font-size:0.75rem; letter-spacing:0.05em; text-transform:uppercase; color:#c08a3e; background:#2b2015; padding:6px 16px; }' +
    '.preview-sep{ border:none; border-top:2px dashed rgba(43,32,21,0.3); margin:0; }' +
    '.fact-plank{ background:#e7d8b8; border-left:4px solid #3d7d96; padding:16px 20px; margin:16px; font-size:0.92rem; font-family:"Work Sans",sans-serif; color:#221913; }' +
    '.fact-plank b{ display:block; font-family:"Fraunces",serif; font-size:1.1rem; margin-bottom:4px; }' +
    '.preview-photo{ display:block; width:100%; max-width:480px; height:auto; margin:16px; }' +
    '.preview-caption{ font-family:"IBM Plex Mono",monospace; font-size:0.85rem; color:#221913; margin:0 16px 16px; }',
    { raw: true }
  );
})();
