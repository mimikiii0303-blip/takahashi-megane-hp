/* =====================================================
   コンタクトデビューLP（高校生・大学生向け）
   - スクロールフェードイン
   - FAQ アコーディオン
   - 下部固定CTA の表示制御
   ===================================================== */

(function () {
  'use strict';

  // フェードイン制御は廃止しました（プレビュー環境で非表示になる事象が
  // あったため）。視覚演出は CSS の hover などのみで対応します。

  // ---------------------------
  // FAQ アコーディオン
  // ---------------------------
  const faqItems = document.querySelectorAll('.cl-faq__item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.cl-faq__q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // ---------------------------
  // 下部固定CTAの表示制御
  // ファーストビューを過ぎたら表示、最下部CTA付近で非表示
  // ---------------------------
  const sticky = document.getElementById('cl-sticky');
  const hero = document.querySelector('.cl-hero');
  const finalSec = document.querySelector('.cl-final');

  if (sticky && hero) {
    const updateSticky = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const finalTop = finalSec ? finalSec.getBoundingClientRect().top : Infinity;
      const viewportH = window.innerHeight;

      // ファーストビューを通過し、かつ最終CTAに到達する前は表示
      const passedHero = heroBottom < 0;
      const beforeFinal = finalTop > viewportH * 0.6;
      if (passedHero && beforeFinal) {
        sticky.classList.add('is-visible');
      } else {
        sticky.classList.remove('is-visible');
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateSticky();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    updateSticky();
  }

  // ---------------------------
  // スムーススクロール（aria-current 用）
  // ヘッダー sticky の高さぶんオフセットを補正
  // ---------------------------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.cl-header')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
