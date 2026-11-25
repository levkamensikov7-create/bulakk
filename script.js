(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);

  /* Товары слайдера: фото лежат в папке img (PNG/WebP с прозрачным фоном) */
  const items = [
    { name: 'Джинсы', img: 'img/jeans.webp', text: 'Тёмные джинсы свободного кроя с потёртостями. Садятся высоко, не сковывают движения.' },
    { name: 'Рабочая куртка', img: 'img/carhartt.webp', text: 'Плотная куртка в стиле ворквир с вельветовым воротником и тёплой подкладкой.' },
    { name: 'Пуховик', img: 'img/puffer.webp', text: 'Объёмный пуховик с капюшоном и светлой окантовкой. Тёплый на всю зиму.' },
    { name: 'Куртка на меху', img: 'img/shearling.webp', text: 'Замшевая куртка на меху. Мягкая, держит форму и хорошо греет в мороз.' },
    { name: 'Кроссовки тёмные', img: 'img/newbalance.webp', text: 'Тёмные беговые кроссовки с амортизирующей подошвой. Для города на каждый день.' },
    { name: 'Кроссовки серые', img: 'img/dunk.webp', text: 'Низкие кроссовки в серой гамме. Подойдут к любым штанам и курткам.' },
    { name: 'Спортивные штаны', img: 'img/sweatpants.webp', text: 'Свободные штаны из плотного футера на резинке. Чёрные, без лишних деталей.' }
  ];
  items.forEach((it) => { new Image().src = it.img; });
  const sizes = ['S', 'M', 'L', 'XL'];
  let i = 0, busy = false;

  const figure = $('#figure'), thumb = $('#thumb');
  const sizeBox = $('#sizes');
  sizes.forEach((s, n) => {
    const b = document.createElement('button');
    b.textContent = s; b.type = 'button';
    if (n === 1) b.classList.add('on');
    b.onclick = () => {
      sizeBox.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    };
    sizeBox.append(b);
  });

  const paint = () => {
    figure.src = items[i].img;
    figure.alt = items[i].name;
    thumb.src = items[(i + 1) % items.length].img;
    $('#itemText').textContent = items[i].text;
    $('#itemName').textContent = items[i].name;
  };
  paint();

  const go = (dir) => {
    if (busy) return;
    busy = true;
    const swap = () => { i = (i + dir + items.length) % items.length; paint(); };
    if (still) { swap(); busy = false; return; }
    gsap.timeline({ onComplete: () => (busy = false) })
      .to([figure, '#itemText', '#itemName'], { autoAlpha: 0, x: -40 * dir, duration: .45, ease: 'power3.in' })
      .add(swap)
      .fromTo([figure, '#itemText', '#itemName'], { autoAlpha: 0, x: 40 * dir }, { autoAlpha: 1, x: 0, duration: .8, ease: 'expo.out', stagger: .06 });
  };
  $('#next').onclick = () => go(1);
  $('#prev').onclick = () => go(-1);

  /* Статус работы: 10:00–22:00 по Бишкеку */
  const status = $('#status');
  const hour = +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Bishkek' }).format(new Date());
  const open = hour >= 10 && hour < 22;
  status.textContent = open ? 'Открыто до 22:00' : 'Откроемся в 10:00';
  status.classList.toggle('closed', !open);

  if (still) return;

  /* Плавный скролл */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.4 }); }
    }));

  /* Одно вступление: буквы поднимаются, товар выплывает, кольца раскрываются */
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.word span', { yPercent: 110, duration: 1.3, stagger: .07 })
    .from('.ring', { scale: .7, autoAlpha: 0, duration: 1.8, stagger: .15 }, 0)
    .from('#figure', { y: 60, autoAlpha: 0, duration: 1.4 }, .2)
    .from(['.lead', '.sizes', '.btn', '.hero-right', '.top'], { y: 24, autoAlpha: 0, duration: 1, stagger: .08 }, .5);

  /* Медленное дыхание товара и колец */
  gsap.to('#figure', { y: -12, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.r1', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });

  /* Параллакс товара при скролле */
  gsap.to('.stage', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Линии списка прорисовываются, заголовки появляются */
  gsap.utils.toArray('.rows li').forEach((li) =>
    gsap.fromTo(li, { '--line': 0 }, { '--line': 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 88%' } }));
  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
})();
