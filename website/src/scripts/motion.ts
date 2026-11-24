// ọjịugo motion — playful, a little eccentric. GSAP + ScrollTrigger on top of Lenis smooth scrolling.
// Nothing here runs for people who ask their device for reduced motion.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;          // mouse / trackpad, not touch
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const rand = gsap.utils.random;

/* ---------- a little bird chirp, made in the browser (no sound file) ---------- */
let ac: AudioContext | undefined, lastChirp = 0;
function chirp() {
  const now = performance.now(); if (now - lastChirp < 250) return; lastChirp = now;
  try {
    ac ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime, notes = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < notes; i++) {
      const t = t0 + i * 0.09, o = ac.createOscillator(), g = ac.createGain(), base = 2600 + Math.random() * 900;
      o.type = 'sine';
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 1.55, t + 0.035);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.07);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.08);
    }
  } catch { /* no audio, no problem */ }
}

// browsers keep pages silent until the first click/tap/key — wake the chirp then
const wake = () => { try { ac ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch { /* */ } };
['pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, wake, { once: true, passive: true }));

// header shadow after a little scroll (cheap, always on)
const onScroll = () => document.documentElement.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

if (reduce) {
  document.documentElement.classList.add('motion-off');
} else {
  document.documentElement.classList.add('motion-on');

  /* ---------- glide: weighted smooth scroll wired into ScrollTrigger ---------- */
  const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  new MutationObserver(() => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start()))
    .observe(document.body, { attributes: true, attributeFilter: ['style'] });

  /* ---------- split helpers ---------- */
  const splitWords = (el: HTMLElement) => {
    const walk = (node: Node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent!.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !(n as HTMLElement).classList.contains('birds')) walk(n);
      });
    };
    walk(el);
    // a solid gap before "birds" so it can never squash up against "the"
    $('.birds', el).forEach((b) => { const p = b.previousSibling; if (p?.nodeType === 3 && !p.textContent!.trim()) { const g = document.createElement('span'); g.className = 'gap'; p.replaceWith(g); } });
    return $('.w, .birds', el);
  };
  const splitChars = (el: HTMLElement) => {
    const t = el.textContent ?? ''; el.textContent = '';
    return [...t].map((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.append(s); return s; });
  };

  /* ---------- page entrance: headline words tumble in ---------- */
  const h1 = document.querySelector<HTMLElement>('main h1');
  if (h1) {
    const words = splitWords(h1);
    // tumble in: each word drops from a little below with a tilt and lands with a soft bounce.
    // Starts straight away (no delay); opacity eases quickly so nothing feels like it's waiting.
    gsap.set(words, { transformOrigin: '50% 90%' });
    gsap.from(words, { yPercent: 70, rotation: () => rand(-16, 16), scale: 0.86, duration: 0.85, ease: 'back.out(1.9)', stagger: 0.05 });
    gsap.from(words, { opacity: 0, duration: 0.35, ease: 'power1.out', stagger: 0.05 });
  }
  document.documentElement.classList.remove('h1-wait');
  gsap.from($('main section:first-of-type :is(.t-overline, .lede, .t-body-lg, .badges, .nl, .intro-text > p)'), { y: 12, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.2 });

  // "birds" flaps its letters on a loop, and hops when you hover it
  $('.birds').forEach((el) => {
    const chars = splitChars(el);
    gsap.set(chars, { transformOrigin: '50% 100%' });
    // a quick double wing-flap: letters lift and tilt left/right, then settle with a little bounce
    let busy = false;
    const flap = (sing = true) => {
      if (busy) return; busy = true;
      if (sing) chirp();
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(chars, { y: -6, rotation: (i) => (i % 2 ? 9 : -9), duration: 0.13, ease: 'power2.out', stagger: 0.025 })
        .to(chars, { y: -2, rotation: (i) => (i % 2 ? -6 : 6), duration: 0.12, ease: 'sine.inOut', stagger: 0.025 })
        .to(chars, { y: 0, rotation: 0, duration: 0.45, ease: 'back.out(2.6)', stagger: 0.025 });
    };
    el.addEventListener('mouseenter', () => flap()); el.addEventListener('click', () => flap());
    // …and on its own every few seconds while it's on screen (it can only chirp once the visitor has clicked or tapped somewhere — browsers keep pages silent until then)
    let seen = false;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(el);
    const again = () => setTimeout(() => { if (seen && !document.hidden) flap(); again(); }, rand(3800, 6200));
    setTimeout(() => { if (seen) flap(false); again(); }, 1400);
  });

  /* ---------- below the first screen: just parallax ---------- */
  // text drifts a little slower than the page. Foliage and illustrations stay fixed to their backgrounds.
  // App previews stay still (they only tilt on hover — see motion.css).
  const drift = (els: HTMLElement[], from: number, to: number) => els.forEach((el) =>
    gsap.fromTo(el, { y: from }, { y: to, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  const later = (sel: string) => $(`main section:not(:first-of-type) :is(${sel})`);
  drift(later('h2, .t-overline').filter((el) => !el.closest('.card, .soon')), 12, -12);
  drift(later('.t-body-lg, .t-body-md').filter((el) => !el.closest('.card, .soon, .row, .top')), 8, -8);

  /* ---------- buttons burst into feathers (and chirp) when pressed ---------- */
  const FEATHER = '<svg viewBox="0 0 24 24"><path class="vane" d="M19 3C11 4 6 9 5 17l2 1c6-1 11-6 12-15Z"/><path class="rachis" d="M4 21 16 7"/></svg>';
  const TONES = ['#8a5a3c', '#6f7a4c', '#c79b5b', '#a8714a', '#5c6640'];
  const burst = (x: number, y: number) => {
    for (let i = 0; i < 9; i++) {
      const f = document.createElement('div'); f.className = 'oj-feather'; f.setAttribute('aria-hidden', 'true');
      f.innerHTML = FEATHER; f.style.setProperty('--tone', TONES[i % TONES.length]);
      document.body.append(f);
      const ang = rand(-Math.PI, 0) + rand(-0.3, 0.3), dist = rand(50, 130);
      gsap.set(f, { left: x - 11, top: y - 11, scale: rand(0.6, 1.1), rotate: rand(0, 360) });
      gsap.timeline({ onComplete: () => f.remove() })
        .to(f, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, rotate: `+=${rand(-160, 160)}`, duration: 0.45, ease: 'power3.out' })
        .to(f, { y: `+=${rand(90, 170)}`, x: `+=${rand(-40, 40)}`, rotate: `+=${rand(-120, 120)}`, opacity: 0, duration: rand(0.9, 1.4), ease: 'sine.in' });
    }
  };
  const PRESSABLE = '.btn, .get, .badge, .cta-btn, .add, button, .pill, .site-header a, .menu-links a, footer a';
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>(PRESSABLE); if (!el) return;
    const r = el.getBoundingClientRect();
    burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2); chirp();
    // let the feathers fly for a beat before an in-site link changes the page
    const a = el.closest('a');
    if (a && a.origin === location.origin && !a.target && !a.hasAttribute('download') && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) && !a.getAttribute('href')?.startsWith('#')) {
      e.preventDefault(); setTimeout(() => { location.href = a.href; }, 420);
    }
  });

  /* ---------- the eye cursor (mouse only) ---------- */
  if (fine) {
    const eye = document.createElement('div'); eye.className = 'oj-cursor'; eye.setAttribute('aria-hidden', 'true');
    eye.innerHTML = '<span class="pupil"></span>';
    document.body.append(eye);
    const xTo = gsap.quickTo(eye, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(eye, 'y', { duration: 0.35, ease: 'power3' });
    const pupil = eye.querySelector<HTMLElement>('.pupil')!;
    let px = 0, py = 0;
    addEventListener('mousemove', (e) => {
      xTo(e.clientX); yTo(e.clientY);
      gsap.to(pupil, { x: gsap.utils.clamp(-4, 4, (e.clientX - px) * 0.4), y: gsap.utils.clamp(-4, 4, (e.clientY - py) * 0.4), duration: 0.3 });
      px = e.clientX; py = e.clientY;
    });
    document.addEventListener('mouseover', (e) => eye.classList.toggle('big', !!(e.target as Element).closest('a, button, select, input, .card, .birds')));
    document.addEventListener('mousedown', () => gsap.to(eye, { scaleY: 0.1, duration: 0.08, yoyo: true, repeat: 1 }));   // blink
    document.addEventListener('mouseleave', () => gsap.to(eye, { opacity: 0, duration: 0.2 }));
    document.addEventListener('mouseenter', () => gsap.to(eye, { opacity: 1, duration: 0.2 }));
    // it blinks on its own now and then
    const blink = () => { gsap.to(eye, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1 }); gsap.delayedCall(rand(3, 7), blink); };
    gsap.delayedCall(3, blink);
  }

  // safety net: anything whose trigger sits below the last scroll position still shows once you hit the bottom
  lenis.on('scroll', ({ progress }: { progress: number }) => {
    if (progress < 0.995) return;
    ScrollTrigger.getAll().forEach((st) => { if (!st.vars.scrub && st.animation && st.animation.progress() === 0) st.animation.play(); });
  });

  // images that load late shift layouts — keep trigger positions honest
  addEventListener('load', () => { ScrollTrigger.refresh(); setTimeout(() => ScrollTrigger.refresh(), 1600); });
}
