/* スクロールに合わせた軽いフェードイン表示 */
(function () {
  // JSが有効なときだけフェードイン用のクラスを付ける
  document.documentElement.classList.add('js');

  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // IntersectionObserver 非対応環境ではそのまま表示
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();
