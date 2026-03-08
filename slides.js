/* ═══════════════════════════════════════════════════════════
   SLIDE ENGINE  +  PERSON PANEL ENGINE
   Light-theme version for fobizz-workshop-pres-v2
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────
  // SLIDE STATE
  // ────────────────────────────────────────────────────────
  let currentSlide = 0;
  const slides     = Array.from(document.querySelectorAll('.slide'));
  const dots       = Array.from(document.querySelectorAll('.dot'));
  const total      = slides.length;

  const progressBar  = document.getElementById('progress-bar');
  const slideCounter = document.getElementById('slide-counter');
  const keyHint      = document.getElementById('key-hint');
  const btnPrev      = document.getElementById('btn-prev');
  const btnNext      = document.getElementById('btn-next');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // ────────────────────────────────────────────────────────
  // PERSON PANEL STATE
  // Person sequence: overview → tina → pietro → christof → claude → next slide
  // ────────────────────────────────────────────────────────
  const PERSONS    = ['tina', 'pietro', 'christof', 'claude'];
  let personIndex  = -1;

  const overview   = document.getElementById('team-overview');
  const panels     = {
    tina:     document.getElementById('panel-tina'),
    pietro:   document.getElementById('panel-pietro'),
    christof: document.getElementById('panel-christof'),
    claude:   document.getElementById('panel-claude'),
  };

  // ────────────────────────────────────────────────────────
  // MENTI SLIDE click counter
  // ────────────────────────────────────────────────────────
  let mentiClicksUsed = 0;

  function isMentiSlide(slideIndex) {
    return slides[slideIndex] && slides[slideIndex].hasAttribute('data-menti-slide');
  }

  function getMentiClicks(slideIndex) {
    const el = slides[slideIndex];
    return el ? parseInt(el.getAttribute('data-menti-clicks') || '3', 10) : 3;
  }

  // ────────────────────────────────────────────────────────
  // SLIDE FUNCTIONS
  // ────────────────────────────────────────────────────────
  function goTo(index) {
    index = ((index % total) + total) % total;
    if (index === currentSlide) return;

    if (currentSlide === 1) closePanelSilent();
    if (isMentiSlide(currentSlide)) mentiClicksUsed = 0;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    if (isRevealSlide(currentSlide)) resetReveal(currentSlide);
    if (isColRevealSlide(currentSlide)) resetColReveal(currentSlide);
    if (isMentiSlide(currentSlide)) mentiClicksUsed = 0;

    updateSlideUI();

    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function updateSlideUI() {
    if (progressBar) {
      progressBar.style.width = ((currentSlide + 1) / total * 100) + '%';
    }
    if (slideCounter) {
      slideCounter.textContent = (currentSlide + 1) + ' / ' + total;
    }
    if (btnPrev) btnPrev.style.opacity = currentSlide === 0 ? '0.35' : '1';
    if (btnNext) btnNext.style.opacity = currentSlide === total - 1 ? '0.35' : '1';
  }

  // ────────────────────────────────────────────────────────
  // PERSON PANEL FUNCTIONS
  // ────────────────────────────────────────────────────────
  function showPerson(name) {
    resetAllHighlights();
    Object.values(panels).forEach(p => p && p.classList.remove('active'));

    if (name === null) {
      personIndex = -1;
      overview.classList.remove('dimmed');
    } else {
      personIndex = PERSONS.indexOf(name);
      overview.classList.add('dimmed');
      const panel = panels[name];
      if (panel) panel.classList.add('active');
    }
  }

  function closePanelSilent() {
    resetAllHighlights();
    Object.values(panels).forEach(p => p && p.classList.remove('active'));
    if (overview) overview.classList.remove('dimmed');
    personIndex = -1;
  }

  function advancePerson() {
    if (personIndex === -1) {
      showPerson(PERSONS[0]);
      return;
    }

    const personName = PERSONS[personIndex];
    const numSections = 3;

    if (highlightStep < numSections - 1) {
      applyHighlight(personName, highlightStep + 1);
    } else {
      if (personIndex < PERSONS.length - 1) {
        showPerson(PERSONS[personIndex + 1]);
      } else {
        closePanelSilent();
        goTo(currentSlide + 1);
      }
    }
  }

  function retreatPerson() {
    if (personIndex === -1) {
      goTo(currentSlide - 1);
    } else if (highlightStep >= 0) {
      if (highlightStep > 0) {
        applyHighlight(PERSONS[personIndex], highlightStep - 1);
      } else {
        resetAllHighlights();
      }
    } else if (personIndex > 0) {
      showPerson(PERSONS[personIndex - 1]);
    } else {
      showPerson(null);
    }
  }

  // ────────────────────────────────────────────────────────
  // SPOTLIGHT / LICHTKEGEL (person panels)
  // ────────────────────────────────────────────────────────
  const HIGHLIGHTS = {
    tina:     [0, 0, 0],
    pietro:   [0, 0, 0],
    christof: [0, 0, 0],
    claude:   [0, 0, 0],
  };

  let highlightStep = -1;

  function resetAllHighlights() {
    document.querySelectorAll('.panel-list li.lit').forEach(li => li.classList.remove('lit'));
    document.querySelectorAll('.panel-right').forEach(pr => pr.classList.remove('spotlit'));
    highlightStep = -1;
  }

  function applyHighlight(personName, step) {
    resetAllHighlights();
    if (step < 0) return;

    const panel = panels[personName];
    if (!panel) return;

    const sections = Array.from(panel.querySelectorAll('.panel-section'));
    const section  = sections[step];
    if (!section) return;

    const itemIndex = (HIGHLIGHTS[personName] || [])[step] ?? 0;
    const items     = Array.from(section.querySelectorAll('.panel-list li'));
    const target    = items[itemIndex];
    if (!target) return;

    const panelRight = panel.querySelector('.panel-right');
    if (panelRight) panelRight.classList.add('spotlit');
    target.classList.add('lit');
    highlightStep = step;
  }

  // ────────────────────────────────────────────────────────
  // SPOTLIGHT SLIDES (data-reveal-slide)
  // ────────────────────────────────────────────────────────
  const spotlightState = new Map();

  function getRevealItems(slideIndex) {
    return Array.from(slides[slideIndex].querySelectorAll('.rev-item'));
  }

  function isRevealSlide(slideIndex) {
    return slides[slideIndex] && slides[slideIndex].hasAttribute('data-reveal-slide');
  }

  function getSlideContent(slideIndex) {
    return slides[slideIndex] ? slides[slideIndex].querySelector('.rlp-content') : null;
  }

  function getSubItems(box) {
    return Array.from(box.querySelectorAll('.sublit-item'));
  }

  function clearSubSpotlight(box) {
    box.classList.remove('sub-spotlit');
    box.querySelectorAll('.sublit-item').forEach(li => li.classList.remove('sublit-active'));
  }

  function applySubSpotlight(box, subStep) {
    const subItems = getSubItems(box);
    box.classList.add('sub-spotlit');
    subItems.forEach(li => li.classList.remove('sublit-active'));
    if (subStep >= 0 && subStep < subItems.length) {
      subItems[subStep].classList.add('sublit-active');
    }
  }

  function resetReveal(slideIndex) {
    const items = getRevealItems(slideIndex);
    items.forEach(el => {
      el.classList.remove('lit');
      clearSubSpotlight(el);
    });
    const content = getSlideContent(slideIndex);
    if (content) content.classList.remove('rlp-spotlit');
    spotlightState.set(slideIndex, { box: -1, sub: -1 });
  }

  function revealNext(slideIndex) {
    const items = getRevealItems(slideIndex);
    const state = spotlightState.get(slideIndex) ?? { box: -1, sub: -1 };
    const content = getSlideContent(slideIndex);

    if (state.box === -1) {
      if (items.length === 0) return false;
      items.forEach(el => el.classList.remove('lit'));
      items[0].classList.add('lit');
      if (content) content.classList.add('rlp-spotlit');
      spotlightState.set(slideIndex, { box: 0, sub: -1 });
      return true;
    }

    const currentBox = items[state.box];
    const subItems = getSubItems(currentBox);

    if (subItems.length > 0 && state.sub < subItems.length - 1) {
      const nextSub = state.sub + 1;
      applySubSpotlight(currentBox, nextSub);
      spotlightState.set(slideIndex, { box: state.box, sub: nextSub });
      return true;
    }

    clearSubSpotlight(currentBox);
    const nextBox = state.box + 1;
    if (nextBox < items.length) {
      items.forEach(el => el.classList.remove('lit'));
      items[nextBox].classList.add('lit');
      spotlightState.set(slideIndex, { box: nextBox, sub: -1 });
      return true;
    }

    const doneKey = 'done_' + slideIndex;
    if (!spotlightState.get(doneKey)) {
      spotlightState.set(doneKey, true);
      return true;
    }
    spotlightState.set(doneKey, false);
    resetReveal(slideIndex);
    return false;
  }

  function revealPrev(slideIndex) {
    const items = getRevealItems(slideIndex);
    const state = spotlightState.get(slideIndex) ?? { box: -1, sub: -1 };
    const content = getSlideContent(slideIndex);

    spotlightState.set('done_' + slideIndex, false);

    if (state.box === -1) return false;

    const currentBox = items[state.box];
    const subItems = getSubItems(currentBox);

    if (state.sub > 0) {
      const prevSub = state.sub - 1;
      applySubSpotlight(currentBox, prevSub);
      spotlightState.set(slideIndex, { box: state.box, sub: prevSub });
      return true;
    }

    if (state.sub === 0) {
      clearSubSpotlight(currentBox);
      spotlightState.set(slideIndex, { box: state.box, sub: -1 });
      return true;
    }

    if (state.box > 0) {
      currentBox.classList.remove('lit');
      const prevBoxIdx = state.box - 1;
      const prevBox = items[prevBoxIdx];
      items.forEach(el => el.classList.remove('lit'));
      prevBox.classList.add('lit');
      const prevSubs = getSubItems(prevBox);
      if (prevSubs.length > 0) {
        applySubSpotlight(prevBox, prevSubs.length - 1);
        spotlightState.set(slideIndex, { box: prevBoxIdx, sub: prevSubs.length - 1 });
      } else {
        spotlightState.set(slideIndex, { box: prevBoxIdx, sub: -1 });
      }
      return true;
    }

    items.forEach(el => { el.classList.remove('lit'); clearSubSpotlight(el); });
    if (content) content.classList.remove('rlp-spotlit');
    spotlightState.set(slideIndex, { box: -1, sub: -1 });
    return true;
  }

  // ────────────────────────────────────────────────────────
  // COLUMN-REVEAL SLIDES (data-col-reveal-slide)
  // ────────────────────────────────────────────────────────
  const colRevealState = new Map();
  const COL_REVEAL_TOTAL = 3;

  function isColRevealSlide(slideIndex) {
    return slides[slideIndex] && slides[slideIndex].hasAttribute('data-col-reveal-slide');
  }

  function applyColClasses(slideIndex, step) {
    slides[slideIndex].querySelectorAll('.zirk-table').forEach(tbl => {
      tbl.classList.remove('col-spotlit', 'col-step-1', 'col-step-2', 'col-step-3');
      if (step > 0) tbl.classList.add('col-spotlit', 'col-step-' + step);
    });
  }

  function resetColReveal(slideIndex) {
    applyColClasses(slideIndex, 0);
    colRevealState.set(slideIndex, 0);
    colRevealState.set('col_done_' + slideIndex, false);
  }

  function colRevealNext(slideIndex) {
    const step = colRevealState.get(slideIndex) ?? 0;
    if (step < COL_REVEAL_TOTAL) {
      applyColClasses(slideIndex, step + 1);
      colRevealState.set(slideIndex, step + 1);
      return true;
    }
    const doneKey = 'col_done_' + slideIndex;
    if (!colRevealState.get(doneKey)) {
      colRevealState.set(doneKey, true);
      return true;
    }
    colRevealState.set(doneKey, false);
    resetColReveal(slideIndex);
    return false;
  }

  function colRevealPrev(slideIndex) {
    colRevealState.set('col_done_' + slideIndex, false);
    const step = colRevealState.get(slideIndex) ?? 0;
    if (step <= 0) return false;
    applyColClasses(slideIndex, step - 1);
    colRevealState.set(slideIndex, step - 1);
    return true;
  }

  // ────────────────────────────────────────────────────────
  // KEYBOARD
  // ────────────────────────────────────────────────────────
  function handleKey(e) {
    if (currentSlide === 1) {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault(); advancePerson(); return;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault(); retreatPerson(); return;
        case 'Escape':
          e.preventDefault(); showPerson(null); return;
      }
    } else if (isMentiSlide(currentSlide)) {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault();
          mentiClicksUsed++;
          if (mentiClicksUsed >= getMentiClicks(currentSlide)) {
            mentiClicksUsed = 0;
            goTo(currentSlide + 1);
          }
          return;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault();
          mentiClicksUsed = 0;
          goTo(currentSlide - 1);
          return;
      }
    } else if (isRevealSlide(currentSlide)) {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault();
          if (!revealNext(currentSlide)) goTo(currentSlide + 1);
          return;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault();
          if (!revealPrev(currentSlide)) goTo(currentSlide - 1);
          return;
      }
    } else if (isColRevealSlide(currentSlide)) {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault();
          if (!colRevealNext(currentSlide)) goTo(currentSlide + 1);
          return;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault();
          if (!colRevealPrev(currentSlide)) goTo(currentSlide - 1);
          return;
      }
    } else {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault(); goTo(currentSlide + 1); return;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault(); goTo(currentSlide - 1); return;
      }
    }

    switch (e.key) {
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End':  e.preventDefault(); goTo(total - 1); break;
      case 'f': case 'F': toggleFullscreen(); break;
    }
  }

  // ────────────────────────────────────────────────────────
  // TOUCH
  // ────────────────────────────────────────────────────────
  let touchStartX = null;
  let touchStartY = null;

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (isMobileView()) {
      if (dist < 12) {
        const tgt = e.target || e.srcElement;
        const tag = tgt.tagName.toLowerCase();
        const ignore = ['button', 'a', 'input', 'iframe', 'select', 'textarea'];
        const inMenti = tgt.closest && tgt.closest('.menti-wrapper');
        if (!ignore.includes(tag) && !inMenti) {
          if (currentSlide === 1) advancePerson();
          else if (isMentiSlide(currentSlide)) {
            mentiClicksUsed++;
            if (mentiClicksUsed >= getMentiClicks(currentSlide)) {
              mentiClicksUsed = 0; goTo(currentSlide + 1);
            }
          } else if (isRevealSlide(currentSlide)) {
            if (!revealNext(currentSlide)) goTo(currentSlide + 1);
          } else if (isColRevealSlide(currentSlide)) {
            if (!colRevealNext(currentSlide)) goTo(currentSlide + 1);
          } else {
            goTo(currentSlide + 1);
          }
        }
      }
    } else {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (currentSlide === 1) {
          dx < 0 ? advancePerson() : retreatPerson();
        } else if (isMentiSlide(currentSlide)) {
          if (dx < 0) {
            mentiClicksUsed++;
            if (mentiClicksUsed >= getMentiClicks(currentSlide)) {
              mentiClicksUsed = 0; goTo(currentSlide + 1);
            }
          } else {
            mentiClicksUsed = 0; goTo(currentSlide - 1);
          }
        } else if (isRevealSlide(currentSlide)) {
          if (dx < 0) { if (!revealNext(currentSlide)) goTo(currentSlide + 1); }
          else         { if (!revealPrev(currentSlide)) goTo(currentSlide - 1); }
        } else if (isColRevealSlide(currentSlide)) {
          if (dx < 0) { if (!colRevealNext(currentSlide)) goTo(currentSlide + 1); }
          else         { if (!colRevealPrev(currentSlide)) goTo(currentSlide - 1); }
        } else {
          goTo(dx < 0 ? currentSlide + 1 : currentSlide - 1);
        }
      }
    }
    touchStartX = null;
    touchStartY = null;
  }

  // ────────────────────────────────────────────────────────
  // NAV BUTTONS
  // ────────────────────────────────────────────────────────
  function bindNavButtons() {
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentSlide === 1) retreatPerson();
        else if (isMentiSlide(currentSlide)) { mentiClicksUsed = 0; goTo(currentSlide - 1); }
        else if (isRevealSlide(currentSlide)) { if (!revealPrev(currentSlide)) goTo(currentSlide - 1); }
        else if (isColRevealSlide(currentSlide)) { if (!colRevealPrev(currentSlide)) goTo(currentSlide - 1); }
        else goTo(currentSlide - 1);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentSlide === 1) advancePerson();
        else if (isMentiSlide(currentSlide)) {
          mentiClicksUsed++;
          if (mentiClicksUsed >= getMentiClicks(currentSlide)) {
            mentiClicksUsed = 0; goTo(currentSlide + 1);
          }
        }
        else if (isRevealSlide(currentSlide)) { if (!revealNext(currentSlide)) goTo(currentSlide + 1); }
        else if (isColRevealSlide(currentSlide)) { if (!colRevealNext(currentSlide)) goTo(currentSlide + 1); }
        else goTo(currentSlide + 1);
      });
    }
  }

  // ────────────────────────────────────────────────────────
  // PANEL CLOSE BUTTONS
  // ────────────────────────────────────────────────────────
  function bindCloseButtons() {
    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPerson(null);
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // FULLSCREEN
  // ────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (btnFullscreen) btnFullscreen.textContent = '\u22A0';
    } else {
      document.exitFullscreen().catch(() => {});
      if (btnFullscreen) btnFullscreen.textContent = '\u26F6';
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (btnFullscreen) {
      btnFullscreen.textContent = document.fullscreenElement ? '\u22A0' : '\u26F6';
    }
  });

  // ────────────────────────────────────────────────────────
  // INIT
  // ────────────────────────────────────────────────────────
  function init() {
    if (!slides.length) return;

    slides[0].classList.add('active');
    if (dots[0]) dots[0].classList.add('active');
    updateSlideUI();

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (currentSlide === 1) closePanelSilent();
        if (isMentiSlide(currentSlide)) mentiClicksUsed = 0;
        goTo(i);
      });
    });

    bindNavButtons();
    bindCloseButtons();

    document.addEventListener('keydown', handleKey);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', toggleFullscreen);
    }

    if (keyHint) {
      setTimeout(() => keyHint.classList.add('hidden'), 6000);
      document.addEventListener('keydown', () => keyHint.classList.add('hidden'), { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
