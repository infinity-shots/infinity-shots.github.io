(() => {
  'use strict';
  const root = document.querySelector('[data-capabilities]');
  if (!root) return;
  const demos = window.DEMOS || [];
  const chapters = [
    {
      id: 'story', label: 'Long-form storytelling', zh: '长程叙事',
      title: 'A story that keeps moving.',
      description: 'A morning becomes an adventure. A plan becomes a transformation. Follow how a minute-long sequence unfolds across many shots, with each moment building on what came before.',
      examples: [
        { id: 'demo-05', note: 'Breakfast, a hurried ride, and a classroom confrontation: 22 shots carry one morning forward.', cues: [[1, 'The morning begins'], [11, 'A reason to hurry'], [16, 'A new scene, the same story']] },
        { id: 'demo-04', note: 'A conversation sets the task. A ritual brings the characters together. The landscape begins to change.', cues: [[1, 'Establish the task'], [5, 'Set the ritual in motion'], [12, 'The world starts to change']] }
      ]
    },
    {
      id: 'cast', label: 'Characters across shots', zh: '跨镜头人物与互动',
      title: 'New angles. Familiar characters.',
      description: 'A story needs a cast you can follow. Explore recurring subjects through close-ups, group shots, and changing relationships, from a live-action ensemble to an animated reunion.',
      examples: [
        { id: 'legacy-03', note: 'Six characters, shifting loyalties, and a confrontation across five chunks. Follow their positions and reactions as the camera cuts.', cues: [[2, 'Introduce the ensemble'], [21, 'Reframe the confrontation'], [34, 'Return to the relationship']] },
        { id: 'demo-08', note: 'An animated ensemble travels together and reunites with family, moving from a shared journey to intimate reactions.', cues: [[1, 'Travel together'], [9, 'Follow a familiar face'], [13, 'Bring the cast together']] }
      ]
    },
    {
      id: 'direction', label: 'Shot-level direction', zh: '逐镜头指令与运动',
      title: 'Move through the scene. Change the view.',
      description: 'Describe the action and how to see it. Tracking shots, aerial views, and close-ups give a sequence its rhythm. Compare each moment with its original shot prompt.',
      examples: [
        { id: 'demo-06', note: 'From take-off to open sky: one flight seen from the ground, the air, and a pilot’s point of view.', cues: [[4, 'Track the take-off'], [7, 'Open up the valley'], [11, 'Enter the pilot’s view']] },
        { id: 'demo-16', note: 'A desert pursuit unfolds through aerial views and recurring mirror shots. The same framing reveals how the chase has changed.', cues: [[4, 'Establish the convoy'], [8, 'Look back through the mirror'], [21, 'Return as the pursuit closes in']] },
        { id: 'legacy-14', note: 'A confrontation builds into a duel across four chunks, moving between faces, weapons, and wide action.', cues: [[21, 'Isolate a detail'], [25, 'Follow the movement'], [27, 'Reveal the impact']] }
      ]
    },
    {
      id: 'sound', label: 'Audio-visual generation', zh: '音画联合生成',
      title: 'Hear the story unfold.',
      description: 'Speech, music, and environmental sound are part of the generated sequence. Listen as narration connects distant places, or dialogue and reactions set the pace of a comedy.',
      examples: [
        { id: 'demo-03', note: 'Narration connects meadows, kelp forests, and the open ocean. Listen for the change in ambience and the rise of the score.', cues: [[3, 'Voice and the natural world'], [9, 'Continue the narration'], [12, 'Let the score build']] },
        { id: 'demo-13', note: 'Talking dogs, off-screen voices, and backstage reactions shape a fast-cut comedy. Watch with sound to follow the exchanges.', cues: [[2, 'An off-screen voice'], [8, 'A physical punchline'], [26, 'A reply across the cut']] }
      ]
    }
  ];
  const node = (tag, cls, text) => {
    const element = document.createElement(tag);
    if (cls) element.className = cls;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const fmt = seconds => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };
  const cleanPrompt = text => String(text || '').replace(/<shot_\d+>\s*/g, '').replace(/<\d+(?:\.\d+)?-\d+(?:\.\d+)?>\s*/g, '').replace(/\[(?:Camera|Subject) reference frame\]\.\s*/g, '').replace(/<sub_(\d+)>/g, 'character $1');
  const open = (demo, startTime = 0) => {
    document.getElementById('hy-feature-video')?.pause();
    window.InfinityViewer?.open(demo, { startTime });
  };
  const button = (cls, label, action) => {
    const element = node('button', cls, label);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
  };
  const intro = node('div', 'cap-intro');
  const heading = node('h2', '', 'Many shots. One unfolding story.');
  heading.id = 'capabilities-title';
  intro.append(node('p', 'cap-kicker', 'CAPABILITIES / 能力展示'), heading, node('p', '', 'Explore four dimensions of multi-shot generation, illustrated through complete sequences and the prompts behind them.'));
  root.append(intro);
  const index = node('nav', 'cap-index');
  index.setAttribute('aria-label', 'Explore generation capabilities');
  const indexItems = [...chapters.map(c => ({ ...c, target: `cap-${c.id}` })), { label: 'Diversity across genres', zh: '多题材与风格', target: root.dataset.diversityTarget }];
  indexItems.forEach((chapter, i) => {
    const link = node('a');
    link.href = `#${chapter.target}`;
    link.append(node('span', 'cap-index-number', `0${i + 1} ↘`), node('span', 'cap-index-label', chapter.label), node('small', '', chapter.zh));
    index.append(link);
  });
  root.append(index);

  chapters.forEach((chapter, i) => {
    const section = node('section', 'cap-chapter');
    section.id = `cap-${chapter.id}`;
    section.setAttribute('aria-labelledby', `${section.id}-title`);
    const header = node('div', 'cap-heading');
    const headingCopy = node('div');
    const title = node('h2', '', chapter.title);
    title.id = `${section.id}-title`;
    headingCopy.append(node('p', 'cap-kicker', `0${i + 1} / ${chapter.label.toUpperCase()}`), title);
    header.append(headingCopy, node('p', 'cap-description', chapter.description));
    const selector = node('div', 'cap-examples');
    selector.setAttribute('role', 'group');
    selector.setAttribute('aria-label', `${chapter.label} examples`);
    const stage = node('div', 'cap-stage');
    stage.id = `${section.id}-stage`;

    function showExample(example) {
      const demo = demos.find(d => d.id === example.id);
      if (!demo) return;
      for (const item of selector.children) item.setAttribute('aria-pressed', String(item.dataset.demo === demo.id));
      stage.replaceChildren();
      const film = node('div', 'cap-film');
      const poster = button('cap-poster', undefined, () => open(demo));
      poster.setAttribute('aria-label', `Watch ${demo.title} with prompts`);
      const image = node('img');
      image.src = demo.feature_poster || demo.poster;
      image.alt = demo.title;
      image.loading = 'lazy';
      image.width = 864; image.height = 480;
      poster.append(image, node('span', 'cap-play', '▶'), node('span', 'cap-watch', chapter.id === 'sound' ? 'Watch with sound & prompts ↗' : 'Watch film & prompts ↗'));
      const caption = node('div', 'cap-caption');
      caption.append(node('p', 'cap-film-genre', `${demo.category_en} / ${demo.category_zh}`), node('h3', '', demo.title), node('p', 'cap-watch-note', example.note));
      const meta = node('div', 'cap-meta');
      meta.append(node('span', '', `${fmt(demo.duration)} duration`), node('span', '', `${demo.shot_count} shots`));
      if (demo.chunks?.length) meta.append(node('span', '', `${demo.chunks.length} chunks`));
      meta.append(node('span', '', 'Video + audio'));
      caption.append(meta);
      film.append(poster, caption);
      const moments = node('aside', 'cap-moments');
      moments.setAttribute('aria-label', `Selected moments from ${demo.title}`);
      moments.append(node('p', 'cap-kicker', chapter.id === 'sound' ? 'LISTEN FOR THE DETAILS' : 'FOLLOW THE SEQUENCE'), node('p', 'cap-moment-hint', 'Choose a moment to open the film at that shot.'));
      for (const [shotIndex, label] of example.cues) {
        const shot = demo.shots?.find(s => s.index === shotIndex);
        if (!shot) continue;
        const cue = button('cap-moment', undefined, () => open(demo, shot.start));
        cue.setAttribute('aria-label', `${label} — watch ${demo.title} at ${fmt(shot.start)}`);
        const top = node('span', 'cap-moment-top');
        top.append(node('span', 'cap-time', `${fmt(shot.start)} / SHOT ${String(shot.index).padStart(2, '0')}`), node('span', '', '↗'));
        cue.append(top, node('strong', '', label), node('span', 'cap-excerpt', cleanPrompt(shot.prompt_en)));
        moments.append(cue);
      }
      moments.append(node('p', 'cap-cue-footnote', 'Original prompt excerpts. Full English / 中文 prompts and the complete timeline are available in the viewer.'));
      stage.append(film, moments);
    }

    for (const example of chapter.examples) {
      const demo = demos.find(d => d.id === example.id);
      if (!demo) continue;
      const option = button('cap-example', undefined, () => showExample(example));
      option.dataset.demo = demo.id;
      option.setAttribute('aria-controls', stage.id);
      option.setAttribute('aria-pressed', 'false');
      const thumb = node('img');
      thumb.src = demo.feature_poster || demo.poster; thumb.alt = ''; thumb.loading = 'lazy';
      const text = node('span');
      text.append(node('strong', '', demo.title), node('small', '', `${demo.category_en} · ${demo.category_zh}`));
      option.append(thumb, text);
      selector.append(option);
    }
    section.append(header, selector, stage);
    root.append(section);
    showExample(chapter.examples[0]);
  });
  const bridge = node('div', 'cap-bridge');
  bridge.append(node('p', 'cap-kicker', '05 / DIVERSITY ACROSS GENRES'), node('h3', '', 'The same idea. Many kinds of stories.'), node('p', '', 'Animation, nature, science fiction, modern drama, wuxia, and more. Explore all 14 scene categories below.'));
  const link = node('a', 'cap-link', 'Explore the genres ↘');
  link.href = `#${root.dataset.diversityTarget}`;
  bridge.append(link);
  root.append(bridge);
  // These anchors are rendered after parsing the document; honor direct chapter links too.
  if (chapters.some(chapter => location.hash === `#cap-${chapter.id}`)) {
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
})();
