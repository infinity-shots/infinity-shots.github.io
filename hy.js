(() => {
  'use strict';
  const demos = window.DEMOS || [], categories = window.CATEGORIES || [], tags = Array.isArray(window.TAGS) ? window.TAGS : [];
  const $ = id => document.getElementById(id);
  const node = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const button = (cls, text, action) => { const e = node('button', cls, text); e.type = 'button'; if (action) e.addEventListener('click', action); return e; };
  const fmt = duration => { const s = Math.max(0, Math.round(Number(duration) || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const readable = text => String(text || '').replace(/<sub_(\d+)>/g, 'character $1');
  const open = demo => { $('hy-feature-video').pause(); window.InfinityViewer?.open(demo); };
  const tagByKey = key => tags.find(tag => tag.key === key);
  const labelForTag = key => tagByKey(key)?.label_en || ({ costume: 'Costume', modern: 'Modern', drama: 'Drama', dialogue: 'Dialogue', action: 'Action', animation: 'Animation', nature: 'Nature' }[key]) || key;
  const curatedLegacyIds = new Set(['legacy-03', 'legacy-14', 'legacy-04', 'legacy-01']);
  const selectedDemos = demos.filter(d => !d.id.startsWith('legacy-') || curatedLegacyIds.has(d.id));
  let feature, activeTag = 'all', activeCategory = 'all', showAll = false;

  function featuredForCategory(categoryKey) {
    const category = categories.find(c => c.key === categoryKey);
    return demos.find(d => d.id === category?.featured_id && d.category_key === categoryKey)
      || demos.find(d => d.category_key === categoryKey && !d.id.startsWith('legacy'))
      || demos.find(d => d.category_key === categoryKey);
  }
  function setFeature(categoryKey) {
    feature = featuredForCategory(categoryKey);
    if (!feature) return;
    const video = $('hy-feature-video'); video.pause(); video.poster = feature.feature_poster || feature.poster; video.src = feature.video; video.setAttribute('aria-label', feature.title); video.load();
    const category = categories.find(c => c.key === categoryKey);
    $('hy-feature-category').textContent = [category?.label_en || feature.category_en, category?.label_zh || feature.category_zh, `${fmt(feature.duration)} · with sound`].filter(Boolean).join(' / ');
    $('hy-feature-title').textContent = feature.title;
    $('hy-scene-summary').textContent = readable(feature.summary_en || feature.summary_zh || feature.display_note || '');
    for (const b of $('hy-scene-selector').children) b.setAttribute('aria-pressed', String(b.dataset.category === categoryKey));
  }
  const existingCategories = categories.filter(c => demos.some(d => d.category_key === c.key));
  $('hy-total-demos').textContent = String(demos.length);
  $('hy-total-categories').textContent = String(existingCategories.length || new Set(demos.map(d => d.category_key)).size);
  $('hy-selector-count').textContent = `${existingCategories.length} GENRES`;
  for (const category of existingCategories) {
    const d = featuredForCategory(category.key);
    const b = button('hy-scene-button', null, () => setFeature(category.key)); b.dataset.category = category.key; b.setAttribute('aria-pressed', 'false');
    const image = node('img'); image.src = d.feature_poster || d.poster; image.alt = ''; image.loading = 'lazy';
    b.append(image, node('span', '', category.label_en), node('small', '', category.label_zh)); $('hy-scene-selector').append(b);
    const option = node('option', '', `${category.label_en} · ${category.label_zh}`); option.value = category.key; $('hy-category-filter').append(option);
  }
  $('hy-watch').addEventListener('click', () => feature && open(feature));
  setFeature(demos.some(d => d.category_key === 'fantasy') ? 'fantasy' : demos[0]?.category_key);

  function mediaButton(d, cls) {
    const b = button(cls, null, () => open(d)); b.setAttribute('aria-label', `Watch ${d.title}`);
    const image = node('img'); image.src = d.feature_poster || d.poster; image.alt = d.title; image.loading = 'lazy';
    b.append(image, node('span', 'hy-play', '▶'), node('span', 'hy-duration', fmt(d.duration))); return b;
  }

  const availableTags = tags.length ? tags.filter(tag => demos.some(d => d.tags?.includes(tag.key))) : ['costume', 'modern', 'drama', 'dialogue', 'action', 'animation', 'nature'].filter(key => demos.some(d => d.tags?.includes(key))).map(key => ({ key, label_en: labelForTag(key) }));
  for (const tag of [{ key: 'all', label_en: 'All' }, ...availableTags]) {
    const b = button('hy-tag', tag.label_en + (tag.label_zh ? ' / '+tag.label_zh : ''), () => { activeTag = tag.key; renderCollection(); }); b.dataset.tag = tag.key; b.title = tag.label_zh || tag.label_en; b.setAttribute('aria-pressed', String(tag.key === 'all')); $('hy-tag-filters').append(b);
  }
  function renderCollection() {
    const scope = showAll ? demos : selectedDemos;
    const shown = scope.filter(d => (activeTag === 'all' || d.tags?.includes(activeTag)) && (activeCategory === 'all' || d.category_key === activeCategory));
    const rail = $('hy-film-rail'); rail.replaceChildren();
    for (const d of shown) {
      const card = node('article', 'hy-film-card'); card.append(mediaButton(d, 'hy-film-image'));
      card.append(node('p', 'hy-film-category', d.category_en || d.category_zh || ''), node('h3', '', d.title));
      const details = [d.category_zh, d.chunks?.length ? `${d.chunks.length} chunks · ${d.shot_count} shots` : d.shot_count ? `${d.shot_count} prompted shots` : 'Continuation demo'].filter(Boolean);
      card.append(node('p', 'hy-film-detail', details.join(' · ')));
      if (d.tags?.length) { const tagLine = node('div', 'hy-film-tags'); d.tags.slice(0, 4).forEach(key => tagLine.append(node('span', '', labelForTag(key)))); card.append(tagLine); }
      const action = button('hy-film-open', d.shots?.length || d.chunks?.length || d.prompt_en ? 'Watch & explore prompts' : 'Watch full demo', () => open(d)); action.append(node('span', '', '↗')); card.append(action); rail.append(card);
    }
    for (const b of $('hy-tag-filters').children) b.setAttribute('aria-pressed', String(b.dataset.tag === activeTag));
    $('hy-scope-selected').setAttribute('aria-pressed', String(!showAll));
    $('hy-scope-all').setAttribute('aria-pressed', String(showAll));
    $('hy-results').textContent = `${shown.length} video example${shown.length === 1 ? '' : 's'} · ${showAll ? 'Full collection / 全部' : 'Selected / 精选'}${activeTag !== 'all' ? ' · ' + labelForTag(activeTag) : ''}`;
    $('hy-no-results').hidden = shown.length !== 0;
    rail.scrollLeft = 0; requestAnimationFrame(updateArrows);
  }
  function updateArrows() { const rail = $('hy-film-rail'); $('hy-gallery-prev').disabled = rail.scrollLeft < 2; $('hy-gallery-next').disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 3; }
  const selectedGenreCount = new Set(selectedDemos.map(d => d.category_key)).size;
  $('hy-collection-title').textContent = `Selected across ${selectedGenreCount} genres.`;
  $('hy-collection-description').textContent = `${selectedDemos.length} selected videos cover all ${selectedGenreCount} scene categories, spanning science fiction, animation, nature, and drama. Open the full collection to explore all ${demos.length} examples.`;
  $('hy-collection-hint').textContent = `The selected collection covers all ${selectedGenreCount} genres. Switch to Full collection for ${demos.length - selectedDemos.length} additional examples. Scroll sideways and open any video to explore its prompts.`;
  $('hy-scope-selected').textContent = `Selected ${selectedDemos.length} / 精选`;
  $('hy-scope-all').textContent = `Full collection ${demos.length} / 全部`;
  $('hy-scope-selected').addEventListener('click', () => { showAll = false; renderCollection(); });
  $('hy-scope-all').addEventListener('click', () => { showAll = true; renderCollection(); });
  $('hy-category-filter').addEventListener('change', event => { activeCategory = event.target.value; renderCollection(); });
  $('hy-film-rail').addEventListener('scroll', updateArrows, { passive: true }); window.addEventListener('resize', updateArrows, { passive: true });
  $('hy-gallery-prev').addEventListener('click', () => $('hy-film-rail').scrollBy({ left: -Math.max(300, $('hy-film-rail').clientWidth * .75), behavior: 'smooth' }));
  $('hy-gallery-next').addEventListener('click', () => $('hy-film-rail').scrollBy({ left: Math.max(300, $('hy-film-rail').clientWidth * .75), behavior: 'smooth' }));
  renderCollection();

  const methods = [
    { name: 'SHOT-AWARE DATA', title: 'Complete shots become coherent chunks', text: 'A modular data pipeline detects shot boundaries, groups neighboring shots, and assembles longer sequences. Duration-based dynamic programming forms roughly 15–20 second chunks with 2–8 complete shots. SCRL semantic features help refine the split to encourage semantic coherence within each chunk.', diagram: '<div class="hy-shot-diagram"><div class="hy-shot-line">' + Array.from({ length: 9 }, (_, i) => `<span>S${i + 1}</span>`).join('') + '</div><div class="hy-chunk-line"><span>CHUNK 0</span><span>CHUNK 1</span><span>CHUNK 2</span></div></div>', caption: 'Schematic shot grouping. Chunk duration varies with the shot boundaries.' },
    { name: 'CHUNK-WISE LEARNING', title: 'Condition on history. Learn the continuation.', text: 'For teacher forcing, sample a target chunk k. Clean ground-truth chunks 0 through k−1 provide the context, while noise is applied to the target chunk. Compute the training loss on the target only. Future chunks are excluded from the input.', diagram: '<div class="hy-group-flow"><div class="hy-group">G₀<small>CLEAN HISTORY</small></div><div class="hy-group">G₁<small>CLEAN HISTORY</small></div><span class="hy-group-arrow">→</span><div class="hy-group hy-group-target">G₂<small>TARGET · LOSS</small></div><div class="hy-group hy-group-future">G₃<small>EXCLUDED</small></div></div>', caption: 'Example training sample with k = 2. History provides context without contributing to the target loss.' },
    { name: 'GROUP-CAUSAL ATTENTION', title: 'Joint audio-video groups, causal continuation', text: 'H3 packs text, audio, and video into a shared Transformer sequence. Attention is bidirectional inside each group and causal across groups. At inference, the next group reads the committed history through a KV cache, avoiding repeated computation of earlier groups.', diagram: '<div class="hy-attention"><div class="hy-attention-grid">' + Array.from({ length: 16 }, (_, i) => `<span class="${Math.floor(i / 4) === i % 4 ? 'is-current' : Math.floor(i / 4) > i % 4 ? 'is-past' : ''}"></span>`).join('') + '</div><div class="hy-attention-label"><strong>Text + Audio + Video</strong>Within group: bidirectional<br>Across groups: causal<br>Inference: reuse history K/V</div></div>', caption: 'Rows are query groups; columns are key/value groups. Future groups are masked.' },
    { name: 'TRAINING EXTENSION', title: 'Training extension: self-resampled history', text: 'Teacher forcing uses clean history, but inference conditions on generated outputs. Resampling Forcing perturbs the historical context and uses a model step to resample it without gradients. The target then learns continuation from this resampled context. The presentation explores this extension in LTX experiments and proposes its integration with H3.', diagram: '<div class="hy-rf-flow"><div>01 · Clean history<small>GROUND TRUTH</small></div><div>02 · Add noise<small>PERTURB HISTORY</small></div><div>03 · Resample<small>NO GRADIENT</small></div><div>04 · Train target<small>CONTINUATION</small></div></div>', caption: 'RF extension, shown schematically. This overview does not imply that every displayed video uses RF.' }
  ];
  function selectMethod(index) {
    const method = methods[index];
    document.querySelectorAll('[data-hy-method]').forEach(b => { const selected = Number(b.dataset.hyMethod) === index; b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1; });
    const panel = $('hy-method-panel'); panel.setAttribute('aria-labelledby', `hy-method-tab-${index}`); panel.replaceChildren();
    const copy = node('div', 'hy-method-copy'); copy.append(node('p', 'hy-kicker', `${String(index + 1).padStart(2, '0')} / ${method.name}`), node('h3', '', method.title), node('p', '', method.text));
    const visual = node('div', 'hy-method-visual'); const figure = node('div', 'hy-method-figure'); figure.innerHTML = method.diagram; visual.append(figure, node('p', 'hy-method-caption', method.caption)); panel.append(copy, visual);
  }
  document.querySelectorAll('[data-hy-method]').forEach(b => {
    b.addEventListener('click', () => selectMethod(Number(b.dataset.hyMethod)));
    b.addEventListener('keydown', e => { let i = Number(b.dataset.hyMethod); if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (i + 1) % methods.length; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (i + methods.length - 1) % methods.length; else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = methods.length - 1; else return; e.preventDefault(); selectMethod(i); $(`hy-method-tab-${i}`).focus(); });
  });
  selectMethod(0);
  document.addEventListener('visibilitychange', () => { if (document.hidden) $('hy-feature-video').pause(); });
})();
