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
    gsap.from(words, { yPercent: 120, rotate: () => rand(-14, 14), opacity: 0, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.06, delay: 0.1 });
  }
  gsap.from($('main section:first-of-type :is(.t-overline, .lede, .t-body-lg, .badges, .nl, .intro-text > p)'), { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.35 });

  // "birds" flaps its letters on a loop, and hops when you hover it
  $('.birds').forEach((el) => {
    const chars = splitChars(el);
    gsap.to(chars, { y: -6, rotate: (i) => (i % 2 ? 8 : -8), duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 0.06, repeatDelay: 0, delay: 1.4,
      onComplete() { gsap.delayedCall(4, () => this.restart(true)); } });
    const hop = () => { chirp(); gsap.fromTo(chars, { y: 0 }, { y: -14, rotate: () => rand(-20, 20), duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1, stagger: 0.04 }); };
    el.addEventListener('mouseenter', hop); el.addEventListener('click', hop);
  });

  /* ---------- below the first screen: just parallax ---------- */
  // text drifts a little slower than the page. Foliage and illustrations stay fixed to their backgrounds.
  // App previews stay still (they only tilt on hover — see motion.css).
  const drift = (els: HTMLElement[], from: number, to: number) => els.forEach((el) =>
    gsap.fromTo(el, { y: from }, { y: to, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } }));
  const later = (sel: string) => $(`main section:not(:first-of-type) :is(${sel})`);
  drift(later('h2, .t-overline').filter((el) => !el.closest('.card, .soon')), 40, -40);
  drift(later('.t-body-lg, .t-body-md').filter((el) => !el.closest('.card, .soon, .row, .top')), 25, -25);

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
