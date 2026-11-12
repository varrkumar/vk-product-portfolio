/*
 * case-study.ts — loads on case study pages only (via ProgressRail.astro).
 * Handles: progress rail, pen toggle + note animations, end-of-entry signature.
 */

const STORAGE_KEY = 'vk-notes';
const SEEN_KEY    = 'vk-seen';
const EASE        = [0.6, 0.05, 0.35, 1] as const;
const easeStr     = `cubic-bezier(${EASE.join(',')})`;

// ── 1. Progress rail ─────────────────────────────────────────

function initRail() {
  const block      = document.getElementById('cs-gutter-block');
  const railList   = document.getElementById('cs-rail-list');
  const fill       = document.getElementById('cs-rail-fill');
  const mobileBar  = document.getElementById('cs-mobile-bar');
  const mobileLabel = document.getElementById('cs-mobile-label');
  const mobileFill  = document.getElementById('cs-mobile-fill');
  if (!block || !railList) return;

  /* Discover sections in DOM order */
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-section-num]')
  );
  if (!sections.length) return;

  /* Build nav list */
  sections.forEach((section, i) => {
    const num   = section.dataset.sectionNum ?? '';
    const label = section.dataset.sectionLabel ?? '';

    /* Ensure section has an id for anchor links */
    if (!section.id) section.id = `section-${num.replace(/\s/g, '-')}`;

    const li = document.createElement('li');
    li.className = 'cs-rail-item';

    const a = document.createElement('a');
    a.href      = `#${section.id}`;
    a.className = 'cs-rail-link';
    a.setAttribute('tabindex', '0');
    a.innerHTML = `<span class="cs-rail-num mono">${num}</span><span class="cs-rail-label">${label}</span>`;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    });

    li.appendChild(a);
    railList.appendChild(li);
  });

  const navItems = Array.from(railList.querySelectorAll<HTMLElement>('.cs-rail-item'));
  const totalSections = sections.length;
  let rafId   = 0;
  let lastCurrent = -2;
  let blockVisible = false;

  function update() {
    const vh30 = window.innerHeight * 0.3;
    const vh75 = window.innerHeight * 0.75;

    /* Show gutter block once first section top < 75vh */
    const firstTop = sections[0].getBoundingClientRect().top;
    const shouldShow = firstTop < vh75;

    if (shouldShow !== blockVisible) {
      blockVisible = shouldShow;
      if (shouldShow) {
        block.classList.add('is-visible');
        block.removeAttribute('aria-hidden');
        document.documentElement.classList.add('rail-active');
        mobileBar?.classList.add('is-visible');
        mobileBar?.removeAttribute('aria-hidden');
      } else {
        block.classList.remove('is-visible');
        block.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('rail-active');
        mobileBar?.classList.remove('is-visible');
        mobileBar?.setAttribute('aria-hidden', 'true');
      }
    }

    /* Current section: last one whose top < 30vh */
    let current = -1;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh30) current = i;
    });

    if (current !== lastCurrent) {
      lastCurrent = current;
      navItems.forEach((item, i) => {
        const a = item.querySelector('a');
        if (i < current) {
          item.dataset.state = 'read';
          a?.removeAttribute('aria-current');
        } else if (i === current) {
          item.dataset.state = 'current';
          a?.setAttribute('aria-current', 'true');
        } else {
          item.dataset.state = 'upcoming';
          a?.removeAttribute('aria-current');
        }
      });

      /* Mobile label */
      if (mobileLabel && current >= 0) {
        const s = sections[current];
        const num   = s.dataset.sectionNum ?? '';
        const label = s.dataset.sectionLabel ?? '';
        const pad   = String(totalSections).padStart(2, '0');
        mobileLabel.textContent = `${num} / ${pad} · ${label}`;
      }
    }

    /* Rail fill height */
    if (fill) {
      const firstRect = sections[0].getBoundingClientRect();
      const lastRect  = sections[sections.length - 1].getBoundingClientRect();
      const totalRange = lastRect.bottom - firstRect.top;
      const progress   = totalRange > 0 ? (vh30 - firstRect.top) / totalRange : 0;
      const pct        = Math.max(0, Math.min(1, progress));
      const trackEl    = block.querySelector<HTMLElement>('.cs-rail-track');
      if (trackEl) fill.style.height = `${pct * trackEl.offsetHeight}px`;
    }

    /* Mobile fill */
    if (mobileFill) {
      const firstRect = sections[0].getBoundingClientRect();
      const lastRect  = sections[sections.length - 1].getBoundingClientRect();
      const totalRange = lastRect.bottom - firstRect.top;
      const progress   = totalRange > 0 ? (vh30 - firstRect.top) / totalRange : 0;
      mobileFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    }
  }

  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { update(); rafId = 0; });
  }, { passive: true });
  update();

  /* Trigger first-visit prompt once rail appears */
  maybeTriggerFirstVisit(block);
}

// ── 2. Pen toggle ────────────────────────────────────────────

function initPen() {
  const desktopBtn = document.getElementById('cs-pen-btn') as HTMLButtonElement | null;
  const mobileBtn  = document.getElementById('cs-mobile-pen') as HTMLButtonElement | null;
  if (!desktopBtn && !mobileBtn) return;

  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 1024;

  /* Sync aria-pressed to match html class set by inline script */
  const notesOn = document.documentElement.classList.contains('notes-on');
  syncBtns(notesOn);

  /* Apply initial visual state without animation */
  if (notesOn) {
    getAllNotes().forEach(el => {
      el.removeAttribute('aria-hidden');
      el.style.visibility = 'visible';
      el.style.clipPath = 'inset(0 0 0 0)';
    });
    expandForkPaths(false);
  } else {
    getAllNotes().forEach(el => {
      el.setAttribute('aria-hidden', 'true');
    });
  }

  /* Idle wiggle on desktop pen (every 10s) */
  let isHovered = false;
  let isMidFlight = false;
  let wiggleTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleWiggle() {
    wiggleTimer = setTimeout(() => {
      if (!isHovered && !isMidFlight && !reduced && !isMobile()) {
        const svg = desktopBtn?.querySelector<SVGElement>('.pen-svg');
        if (svg) {
          svg.animate([
            { transform: 'rotate(0deg) translateY(0px)' },
            { transform: 'rotate(-9deg) translateY(-2px)' },
            { transform: 'rotate(6deg) translateY(-1px)' },
            { transform: 'rotate(-2deg) translateY(0px)' },
            { transform: 'rotate(0deg) translateY(0px)' },
          ], { duration: 700, easing: 'ease-out' });
        }
      }
      scheduleWiggle();
    }, 10000);
  }

  desktopBtn?.addEventListener('mouseenter', () => { isHovered = true; });
  desktopBtn?.addEventListener('mouseleave', () => { isHovered = false; });
  desktopBtn?.addEventListener('focusin',    () => { isHovered = true; });
  desktopBtn?.addEventListener('focusout',   () => { isHovered = false; });
  if (!reduced) scheduleWiggle();

  /* Click handler (shared) */
  function handleClick() {
    if (isMidFlight) return;
    const wasOn   = document.documentElement.classList.contains('notes-on');
    const willBeOn = !wasOn;

    document.documentElement.classList.toggle('notes-on', willBeOn);
    syncBtns(willBeOn);
    try { localStorage.setItem(STORAGE_KEY, willBeOn ? 'on' : 'off'); } catch {}

    /* Dismiss first-visit line on first click */
    const fv = document.getElementById('cs-first-visit');
    if (fv && !fv.classList.contains('cs-first-visit--done')) {
      fv.classList.add('cs-first-visit--done');
    }

    if (reduced || isMobile()) {
      /* No animation — just show/hide */
      if (willBeOn) {
        getAllNotes().forEach(el => {
          el.removeAttribute('aria-hidden');
          el.style.visibility = 'visible';
          el.style.clipPath = 'inset(0 0 0 0)';
        });
        expandForkPaths(false);
      } else {
        getAllNotes().forEach(el => {
          el.setAttribute('aria-hidden', 'true');
          el.style.visibility = 'hidden';
          el.style.clipPath = 'inset(0 100% 0 0)';
        });
        collapseForkPaths(false);
      }
      if (willBeOn) setupPendingNotes();
      return;
    }

    /* Desktop animation */
    isMidFlight = true;
    const btn = isMobile() ? mobileBtn! : desktopBtn!;

    if (willBeOn) {
      flyAndWrite(btn, () => { isMidFlight = false; });
    } else {
      flyAndErase(btn, () => { isMidFlight = false; });
    }
  }

  desktopBtn?.addEventListener('click', handleClick);
  mobileBtn?.addEventListener('click', handleClick);
}

function syncBtns(on: boolean) {
  const label = on ? 'Hide margin notes' : 'Show margin notes';
  const pressed = String(on);
  document.getElementById('cs-pen-btn')?.setAttribute('aria-pressed', pressed);
  document.getElementById('cs-pen-btn')?.setAttribute('aria-label', label);
  document.getElementById('cs-mobile-pen')?.setAttribute('aria-pressed', pressed);
  document.getElementById('cs-mobile-pen')?.setAttribute('aria-label', label);
}

function getAllNotes(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.sw-note'));
}

function getViewportNotes(): HTMLElement[] {
  return getAllNotes().filter(el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  });
}

function noteDuration(el: HTMLElement): number {
  return Math.min(1500, 500 + (el.textContent?.length ?? 80) * 14);
}

function writeNote(el: HTMLElement, delay = 0) {
  const dur = noteDuration(el);
  el.removeAttribute('aria-hidden');
  el.style.visibility = 'visible';
  el.animate(
    [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: dur, delay, easing: easeStr, fill: 'forwards' }
  );
}

function eraseNote(el: HTMLElement, delay = 0) {
  const dur = Math.round(noteDuration(el) * 0.75);
  const anim = el.animate(
    [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }],
    { duration: dur, delay, easing: easeStr, fill: 'forwards' }
  );
  anim.onfinish = () => {
    el.style.visibility = 'hidden';
    el.setAttribute('aria-hidden', 'true');
  };
}

function expandForkPaths(animate: boolean) {
  document.querySelectorAll<HTMLElement>('.fork-path').forEach(el => {
    el.style.transition = animate ? 'max-height .35s ease' : 'none';
    el.style.maxHeight = '120px';
  });
}

function collapseForkPaths(animate: boolean) {
  document.querySelectorAll<HTMLElement>('.fork-path').forEach(el => {
    el.style.transition = animate ? 'max-height .35s ease' : 'none';
    el.style.maxHeight = '0';
    el.style.overflow = 'hidden';
  });
}

function flyAndWrite(btn: HTMLElement, done: () => void) {
  const vpNotes = getViewportNotes();

  /* Make all viewport notes layout-ready */
  vpNotes.forEach(el => {
    el.removeAttribute('aria-hidden');
    el.style.visibility = 'visible';
    el.style.clipPath = 'inset(0 100% 0 0)';
  });

  if (!vpNotes.length) {
    done();
    setupPendingNotes();
    return;
  }

  const penSvg = btn.querySelector<SVGElement>('.pen-svg');
  if (!penSvg) { done(); return; }

  const firstNote = vpNotes[0];
  const btnRect   = btn.getBoundingClientRect();
  const noteRect  = firstNote.getBoundingClientRect();

  /* Clone pen as a fixed-position flier */
  const flier = penSvg.cloneNode(true) as SVGElement;
  const startX = btnRect.left + btnRect.width / 2 - 13;
  const startY = btnRect.top  + btnRect.height / 2 - 13;
  const landX  = noteRect.left;
  const landY  = noteRect.top + 4;
  const glideX = landX + Math.min(260, noteRect.width * 0.9);

  Object.assign(flier.style, {
    position:      'fixed',
    left:          `${startX}px`,
    top:           `${startY}px`,
    width:         '26px',
    height:        '26px',
    pointerEvents: 'none',
    zIndex:        '9999',
    color:         'var(--pencil)',
  });
  document.body.appendChild(flier);

  const flyDur = 900;

  /* Phase 1: dock → land */
  flier.animate([
    { left: `${startX}px`, top: `${startY}px`, transform: 'scale(1)' },
    { left: `${landX}px`,  top: `${landY}px`,  transform: 'scale(1.1)' },
  ], { duration: flyDur * 0.5, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });

  /* At ~32% of flight, start writing the first note */
  setTimeout(() => {
    writeNote(firstNote, 0);
    /* Remaining viewport notes staggered */
    vpNotes.slice(1).forEach((n, i) => writeNote(n, 700 + 220 * i));
    expandForkPaths(true);
  }, Math.round(flyDur * 0.32));

  /* Phase 2: glide along first line */
  setTimeout(() => {
    const glide = flier.animate([
      { left: `${landX}px`,  top: `${landY}px` },
      { left: `${glideX}px`, top: `${landY}px` },
    ], { duration: flyDur * 0.5, easing: 'ease-out', fill: 'forwards' });

    /* Phase 3: return to dock */
    glide.onfinish = () => {
      flier.animate([
        { left: `${glideX}px`, top: `${landY}px`, opacity: 1 },
        { left: `${startX}px`, top: `${startY}px`, opacity: 0 },
      ], { duration: 500, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }).onfinish = () => {
        flier.remove();
        done();
        setupPendingNotes();
      };
    };
  }, flyDur * 0.5);
}

function flyAndErase(btn: HTMLElement, done: () => void) {
  const vpNotes = getViewportNotes();

  vpNotes.forEach((n, i) => eraseNote(n, 160 * i));

  /* Off-screen notes hide instantly */
  getAllNotes().filter(n => !vpNotes.includes(n)).forEach(n => {
    n.style.clipPath  = 'inset(0 100% 0 0)';
    n.style.visibility = 'hidden';
    n.setAttribute('aria-hidden', 'true');
  });

  collapseForkPaths(true);

  const totalDur = vpNotes.length ? 160 * (vpNotes.length - 1) + noteDuration(vpNotes[vpNotes.length - 1]) * 0.75 : 0;
  setTimeout(done, totalDur + 100);
}

/* IntersectionObserver for notes that scroll into view while notes are on */
let pendingObs: IntersectionObserver | null = null;

function setupPendingNotes() {
  pendingObs?.disconnect();
  pendingObs = new IntersectionObserver((entries) => {
    if (!document.documentElement.classList.contains('notes-on')) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      /* Only animate notes that haven't been revealed yet */
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || el.getAttribute('aria-hidden') === 'true') {
        writeNote(el, 0);
      }
    });
  }, { rootMargin: '0px 0px -15% 0px' });

  getAllNotes().forEach(el => pendingObs!.observe(el));
}

// ── 3. Signature ─────────────────────────────────────────────

function initSignature() {
  const trigger = document.querySelector<HTMLElement>('[data-entry-end]');
  const signEl  = document.querySelector<HTMLElement>('.cs-sign');
  const nextQ   = document.querySelector<HTMLElement>('.cs-next-q-wrap');
  if (!trigger || !signEl) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fired = false;

  const obs = new IntersectionObserver((entries) => {
    if (fired || !entries[0].isIntersecting) return;
    fired = true;
    obs.disconnect();

    if (reduced) {
      signEl.style.visibility = 'visible';
      signEl.style.clipPath = 'inset(0 0 0 0)';
      if (nextQ) { nextQ.style.visibility = 'visible'; nextQ.style.clipPath = 'inset(0 0 0 0)'; }
      return;
    }

    signEl.style.visibility = 'visible';
    signEl.animate(
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 1100, easing: easeStr, fill: 'forwards' }
    );

    if (nextQ) {
      nextQ.style.visibility = 'visible';
      nextQ.animate(
        [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 1200, delay: 900, easing: easeStr, fill: 'forwards' }
      );
    }
  }, { threshold: 0.6 });

  obs.observe(trigger);
}

// ── 4. First-visit line ──────────────────────────────────────

function maybeTriggerFirstVisit(block: HTMLElement) {
  if (window.innerWidth < 1024) return;

  let seen = false;
  try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch {}
  if (seen) return;
  if (document.documentElement.classList.contains('notes-on')) return;

  const fv = document.getElementById('cs-first-visit');
  if (!fv) return;

  /* Watch for block becoming visible */
  const mo = new MutationObserver(() => {
    if (!block.classList.contains('is-visible')) return;
    mo.disconnect();

    setTimeout(() => {
      if (document.documentElement.classList.contains('notes-on')) return;
      fv.classList.add('is-visible');
      const textEl = fv.querySelector<HTMLElement>('.cs-first-visit-text');
      if (textEl) {
        textEl.animate(
          [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
          { duration: 1100, easing: easeStr, fill: 'forwards' }
        );
      }
      try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
    }, 900);
  });

  mo.observe(block, { attributes: true, attributeFilter: ['class'] });
}

// ── Entry point ──────────────────────────────────────────────

initRail();
initPen();
initSignature();
