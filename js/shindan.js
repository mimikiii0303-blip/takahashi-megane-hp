/* =====================================================
   見え方のもったいない発見チェック
   診断ロジック（データ＋判定）。画面表示とは分離して管理。
   ・外部送信/保存は一切なし（すべてブラウザ内で完結）
   ・再読み込みで回答は初期化される
   ===================================================== */
(function () {
  'use strict';

  /* --- 結果タイプの定義（5種類） --- */
  /* body は改行（\n）で段落を分ける。断定を避けたやわらかい表現。 */
  var RESULTS = {
    near: {
      icon: '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      name: '近くを見る時間が長い、集中タイプ',
      body: 'パソコンやスマートフォン、本など、近くを見る時間が長い生活を送っているようです。\nこのメガネで問題なく見えていても、見る距離や作業時間によっては、夕方に疲れを感じたり、ピントの切り替えに負担を感じたりすることがあります。\n仕事用や手元用など、使う場面に合わせてメガネを見直すことで、より快適に過ごせる場合があります。',
      point: '「よく見えるメガネ」と「長時間快適に見られるメガネ」は、同じとは限りません。'
    },
    drive: {
      icon: '<svg viewBox="0 0 24 24"><path d="M5 17H3v-5l2-5h12l2 5v5h-2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      name: '夜の見え方を大切にしたい、ドライブタイプ',
      body: '運転や外出など、遠くを見る場面が多い生活を送っているようです。\n特に夜や雨の日は、明るい時間帯とは見え方が異なり、光のまぶしさや見えにくさを感じる方もいます。\n度数だけでなく、レンズの設計やコーティングなどを見直すことで、見え方が変わる場合があります。',
      point: '昼間によく見えていても、夜の見え方まで快適とは限りません。'
    },
    'switch': {
      icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      name: '遠くも近くも頑張る、切り替えタイプ',
      body: '遠くを見る場面と、手元を見る場面の両方が多い生活を送っているようです。\nスマートフォンを見た後に遠くを見る、仕事中に人の顔と資料を交互に見るなど、視線の切り替えが多いと、見え方に違和感を覚えることがあります。\n生活の中でよく見る距離を確認し、それに合ったメガネを選ぶことで、より自然に見られる場合があります。',
      point: '視力だけでなく、「何を、どの距離で見るか」もメガネ選びの大切な基準です。'
    },
    daily: {
      icon: '<svg viewBox="0 0 24 24"><circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M10 15a2 2 0 0 1 4 0"/><line x1="2" y1="12" x2="4" y2="10"/><line x1="22" y1="12" x2="20" y2="10"/></svg>',
      name: '掛け心地を見直したい、毎日メガネタイプ',
      body: 'メガネを長時間使用し、生活の一部として毎日掛けているようです。\n見え方に問題がなくても、ずれや重さ、鼻や耳への負担などが、知らないうちに小さなストレスになっていることがあります。\nフレームの調整や鼻パッドの交換など、少しのメンテナンスで掛け心地が変わる場合があります。',
      point: 'メガネの快適さは、レンズだけでなくフィッティングによっても変わります。'
    },
    longlife: {
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      name: '今のメガネを大切に使う、長持ちタイプ',
      body: '現在のメガネを長く大切に使っているようです。\n大きな不便がなくても、視力や生活スタイル、フレームの状態は少しずつ変化することがあります。\n今のメガネが現在の暮らしに合っているか、定期的に確認することで、快適な状態を保ちやすくなります。',
      point: '壊れていなくても、今の生活に合っているかを確認することが、メガネを長く快適に使うことにつながります。'
    }
  };

  /* 同点だったときの優先順位（先にある方を優先） */
  var PRIORITY = ['near', 'drive', 'switch', 'daily', 'longlife'];

  /* --- 質問と選択肢（各選択肢が各タイプに加点する） --- */
  var QUESTIONS = [
    {
      q: '普段、一番長い時間見ているものはどれですか？',
      options: [
        { label: 'パソコン', scores: { near: 2 } },
        { label: 'スマートフォン', scores: { near: 2 } },
        { label: '車の運転中の景色', scores: { drive: 2 } },
        { label: '人の顔や手元', scores: { 'switch': 1, near: 1 } },
        { label: 'テレビ', scores: { drive: 1, 'switch': 1 } },
        { label: '本や新聞', scores: { near: 2 } },
        { label: '趣味やスポーツで見るもの', scores: { drive: 1, 'switch': 1 } }
      ]
    },
    {
      q: '今のメガネを使っていて、気になることはありますか？',
      options: [
        { label: '夕方になると目が疲れる', scores: { near: 2 } },
        { label: '夜や雨の日に見えにくく感じる', scores: { drive: 2 } },
        { label: '小さい文字や手元が見づらい', scores: { near: 1, 'switch': 1 } },
        { label: 'メガネが重い、ずれる、痛くなる', scores: { daily: 2 } },
        { label: '遠くと近くの切り替えがしづらい', scores: { 'switch': 2 } },
        { label: '特に困っていない', scores: { longlife: 2 } },
        { label: 'うまく言葉にできないが、少し違和感がある', scores: { longlife: 1 } }
      ]
    },
    {
      q: 'メガネを使う時間が長いのは、どんな場面ですか？',
      options: [
        { label: '仕事中', scores: { near: 1 } },
        { label: '家事や日常生活', scores: { daily: 1 } },
        { label: '車の運転', scores: { drive: 2 } },
        { label: '外出や買い物', scores: { drive: 1, 'switch': 1 } },
        { label: '読書や手芸などの趣味', scores: { near: 2 } },
        { label: 'スポーツや屋外活動', scores: { drive: 1 } },
        { label: '一日中ほとんど掛けている', scores: { daily: 2 } }
      ]
    },
    {
      q: '今のメガネを選ぶとき、最も重視したことは何ですか？',
      options: [
        { label: 'よく見えること', scores: { near: 1, 'switch': 1 } },
        { label: 'デザイン', scores: { daily: 1 } },
        { label: '価格', scores: { longlife: 1 } },
        { label: '軽さ', scores: { daily: 2 } },
        { label: '丈夫さ', scores: { daily: 1, longlife: 1 } },
        { label: '店員からの提案', scores: { longlife: 1 } },
        { label: '特に意識せず選んだ', scores: { longlife: 2 } }
      ]
    },
    {
      q: '今のメガネは、どれくらい使用していますか？',
      options: [
        { label: '1年未満', scores: {} },
        { label: '1年以上2年未満', scores: {} },
        { label: '2年以上3年未満', scores: { longlife: 1 } },
        { label: '3年以上', scores: { longlife: 2 } },
        { label: 'いつ作ったか覚えていない', scores: { longlife: 2 } },
        { label: 'メガネを複数使い分けている', scores: { 'switch': 2 } }
      ]
    }
  ];

  /* --- 状態管理 --- */
  var answers = [];   // 各質問で選んだ選択肢のindex（未回答は undefined）
  var current = 0;    // 現在の質問番号（0始まり）

  /* --- DOM参照 --- */
  var elIntro, elStage, elResult;
  var elProgressLabel, elProgressFill, elQTitle, elOptions, elPrev, elNext, elResultBody;

  document.addEventListener('DOMContentLoaded', function () {
    elIntro = document.getElementById('quiz-intro');
    elStage = document.getElementById('quiz-stage');
    elResult = document.getElementById('quiz-result');
    elProgressLabel = document.getElementById('q-progress-label');
    elProgressFill = document.getElementById('q-progress-fill');
    elQTitle = document.getElementById('q-title');
    elOptions = document.getElementById('q-options');
    elPrev = document.getElementById('q-prev');
    elNext = document.getElementById('q-next');
    elResultBody = document.getElementById('result-body');

    if (!elStage) { return; } // 診断ページ以外では何もしない

    document.getElementById('quiz-start').addEventListener('click', startQuiz);
    elPrev.addEventListener('click', goPrev);
    elNext.addEventListener('click', goNext);
  });

  /* 診断開始 */
  function startQuiz() {
    answers = [];
    current = 0;
    elIntro.hidden = true;
    elResult.hidden = true;
    elStage.hidden = false;
    renderQuestion();
    elStage.focus();
  }

  /* 現在の質問を描画 */
  function renderQuestion() {
    var total = QUESTIONS.length;
    var qData = QUESTIONS[current];

    // 進捗表示
    elProgressLabel.textContent = (current + 1) + ' / ' + total;
    elProgressFill.style.width = ((current + 1) / total * 100) + '%';

    // 質問文
    elQTitle.textContent = qData.q;

    // 選択肢
    elOptions.innerHTML = '';
    qData.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = opt.label;
      btn.setAttribute('role', 'radio');
      var selected = (answers[current] === i);
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) { btn.classList.add('selected'); }
      btn.addEventListener('click', function () { selectOption(i); });
      elOptions.appendChild(btn);
    });

    // ナビゲーションボタン
    elPrev.disabled = (current === 0);
    elNext.textContent = (current === total - 1) ? '結果を見る' : '次へ　→';
    elNext.disabled = (answers[current] === undefined); // 未回答は先へ進めない
  }

  /* 選択肢を選ぶ（1問1つだけ） */
  function selectOption(index) {
    answers[current] = index;
    // 表示更新（選択状態の反映＋次へ有効化）
    var buttons = elOptions.querySelectorAll('.quiz-option');
    buttons.forEach(function (b, i) {
      var on = (i === index);
      b.classList.toggle('selected', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    elNext.disabled = false;
  }

  /* 前の質問へ */
  function goPrev() {
    if (current > 0) {
      current--;
      renderQuestion();
      scrollToTop();
    }
  }

  /* 次の質問へ／結果へ */
  function goNext() {
    if (answers[current] === undefined) { return; }
    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
      scrollToTop();
    } else {
      // 全問回答済みか最終確認
      if (answers.length < QUESTIONS.length || answers.indexOf(undefined) !== -1) { return; }
      showResult();
    }
  }

  /* 回答からスコアを集計してタイプを決める */
  function calcScores() {
    var scores = { near: 0, drive: 0, 'switch': 0, daily: 0, longlife: 0 };
    answers.forEach(function (ansIndex, qi) {
      var opt = QUESTIONS[qi].options[ansIndex];
      if (!opt) { return; }
      for (var key in opt.scores) {
        if (opt.scores.hasOwnProperty(key)) {
          scores[key] += opt.scores[key];
        }
      }
    });
    return scores;
  }

  /* スコアを高い順に並べる（同点は優先順位で決定） */
  function rankTypes(scores) {
    return PRIORITY.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) { return scores[b] - scores[a]; }
      return PRIORITY.indexOf(a) - PRIORITY.indexOf(b);
    });
  }

  /* 結果を描画 */
  function showResult() {
    var scores = calcScores();
    var ranked = rankTypes(scores);
    var mainKey = ranked[0];
    var subKey = ranked[1];
    var main = RESULTS[mainKey];

    var html = '';

    // メイン結果
    html += '<div class="quiz-result-card">';
    html += '  <div class="quiz-result-icon">' + main.icon + '</div>';
    html += '  <p class="quiz-result-label">あなたはこのタイプ</p>';
    html += '  <h2 class="quiz-result-name">' + main.name + '</h2>';
    html += '  <div class="quiz-result-text">' + toParagraphs(main.body) + '</div>';
    html += '  <div class="quiz-result-point"><span class="quiz-point-label">気づきのポイント</span>' + main.point + '</div>';
    html += '</div>';

    // サブタイプ（2番目のスコアが1点以上あるときのみ）
    if (subKey && scores[subKey] > 0) {
      var sub = RESULTS[subKey];
      html += '<div class="quiz-sub-card">';
      html += '  <p class="quiz-sub-lead">今回の回答からは、このような傾向も考えられます</p>';
      html += '  <h3 class="quiz-sub-heading">あなたには、こちらの傾向もありそうです</h3>';
      html += '  <div class="quiz-sub-inner"><span class="quiz-sub-icon">' + sub.icon + '</span>';
      html += '  <div><p class="quiz-sub-name">' + sub.name + '</p>';
      html += '  <p class="quiz-sub-point">' + sub.point + '</p></div></div>';
      html += '</div>';
    }

    // 締めのメッセージ＋CTA
    html += '<div class="quiz-closing">';
    html += '  <p class="quiz-closing-lead">「メガネは、視力に合わせるだけでなく、暮らしに合わせて選ぶもの。」</p>';
    html += '  <p class="quiz-closing-body">髙橋メガネでは、どんな場面で見えにくいのか、どのようにメガネを使っているのかを丁寧に伺いながら、一人ひとりに合った見え方をご提案しています。<br>「少し気になる」「うまく説明できない」という段階でも、どうぞお気軽にご相談ください。</p>';
    html += '  <div class="quiz-result-cta">';
    /* TODO: 専用の予約・問い合わせページを新設した場合は、下記リンク先をそのページのURLに差し替える */
    html += '    <a href="tel:06-6351-3842" class="btn btn-primary btn-lg">髙橋メガネに相談する</a>';
    html += '    <a href="shop.html" class="btn btn-secondary btn-lg">店舗情報を見る</a>';
    html += '    <button type="button" class="btn btn-outline btn-lg" id="quiz-restart">もう一度診断する</button>';
    html += '  </div>';
    html += '</div>';

    // 注意書き
    html += '<div class="quiz-disclaimer">';
    html += '  <p>このチェックは、回答内容をもとにメガネ選びのヒントをご案内するもので、医療的な診断や視力検査に代わるものではありません。</p>';
    html += '  <p>急な視力低下、目の痛み、視野の異常、強いかすみなどがある場合は、眼科医療機関へのご相談をご検討ください。</p>';
    html += '</div>';

    elResultBody.innerHTML = html;

    // もう一度診断するボタン
    var restart = document.getElementById('quiz-restart');
    if (restart) { restart.addEventListener('click', startQuiz); }

    // 画面切り替え
    elStage.hidden = true;
    elIntro.hidden = true;
    elResult.hidden = false;
    scrollToTop();
  }

  /* 改行区切りの本文を<p>段落へ */
  function toParagraphs(text) {
    return text.split('\n').map(function (line) {
      return '<p>' + line + '</p>';
    }).join('');
  }

  /* 診断エリアの先頭へスクロール */
  function scrollToTop() {
    var anchor = document.getElementById('quiz');
    if (anchor && anchor.scrollIntoView) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
})();
