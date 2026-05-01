/* ============================================
   髙橋メガネ - FAQチャットボット
   キーワードマッチング + あいまい検索
   ============================================ */

/* --- FAQ データベース --- */
const faqData = [
  {
    keywords: ['営業時間', '何時', '開店', '閉店', 'オープン'],
    answer: '営業時間は10:00〜19:00です。店舗により異なる場合がございますので、詳しくは<a href="shop.html">店舗案内</a>をご覧ください。'
  },
  {
    keywords: ['定休日', '休み', 'お休み', '休業'],
    answer: '定休日は水曜日です。祝日・年末年始は変更になる場合がございます。'
  },
  {
    keywords: ['場所', '住所', 'アクセス', '行き方', '駅', '地図'],
    answer: '各店舗の住所・アクセスは<a href="shop.html">店舗案内ページ</a>をご覧ください。JR大阪駅から徒歩5分の本店がございます。'
  },
  {
    keywords: ['電話', '電話番号', 'TEL', '連絡'],
    answer: '天六本店の電話番号は <a href="tel:06-6351-3842">06-6351-3842</a> です。お気軽にお問い合わせください。'
  },
  {
    keywords: ['コンタクト', 'コンタクトレンズ', 'CL'],
    answer: 'コンタクトレンズの取り扱いがございます。初めての方でも安心してご相談いただけます。詳しくは<a href="contactlens.html">コンタクトページ</a>をご覧ください。'
  },
  {
    keywords: ['処方箋', '処方', '眼科'],
    answer: 'コンタクトレンズは眼科の処方箋をお持ちいただくとスムーズです。処方箋がない場合もご相談ください。'
  },
  {
    keywords: ['修理', '壊れた', '折れた', '曲がった'],
    answer: 'メガネの修理・調整を承っております。他店でお買い求めのメガネも可能な範囲で対応いたします。お気軽にお持ちください。'
  },
  {
    keywords: ['補聴器', '聞こえ', '聞こえない', '耳'],
    answer: '補聴器のご相談・試聴を承っております。初めての方も安心してご相談ください。詳しくは<a href="hochouki.html">補聴器ページ</a>をご覧ください。'
  },
  {
    keywords: ['子供', 'こども', 'キッズ', '子ども', '学校検診'],
    answer: 'お子様用メガネの取り扱いがございます。学校検診後のご相談もお気軽にどうぞ。詳しくは<a href="kodomo.html">子供メガネページ</a>をご覧ください。'
  },
  {
    keywords: ['遠近', '遠近両用', '老眼', '見えにくい'],
    answer: '遠近両用メガネのご相談を承っております。見え方のお悩みに合わせて最適なレンズをご提案します。詳しくは<a href="enkinhoryou.html">遠近両用ページ</a>をご覧ください。'
  },
  {
    keywords: ['駐車場', '車', 'パーキング'],
    answer: '店舗により駐車場のご用意がございます。詳しくは<a href="shop.html">店舗案内ページ</a>をご確認ください。'
  },
  {
    keywords: ['予約', '相談', '問い合わせ', '電話'],
    answer: 'ご予約なしでもご来店いただけます。事前のご相談はお電話（<a href="tel:06-6351-3842">06-6351-3842</a>）でも承っております。お気軽にどうぞ。'
  },
  {
    keywords: ['初めて', 'はじめて', '初回'],
    answer: '初めてのご来店でも安心してお越しください。ご来店の流れは<a href="hajimete.html">初めての方へページ</a>をご覧ください。'
  },
  {
    keywords: ['ブランド', '取扱', 'メーカー'],
    answer: '国内外の多数のブランドフレーム・レンズを取り扱っております。お好みやご予算に合わせてお選びいただけます。'
  },
  {
    keywords: ['調整', 'フィッティング', 'ずれる', 'きつい'],
    answer: 'メガネのフィッティング調整は無料で承っております。掛け心地が気になる方はお気軽にお持ちください。'
  }
];

/* --- チャットボット制御 --- */
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');

if (chatbotToggle && chatbotWindow) {
  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('open');
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('open');
  });
}

/* --- メッセージ送信 --- */
function sendChat(text) {
  const input = document.getElementById('chatbotInput');
  const msg = text || (input ? input.value.trim() : '');
  if (!msg) return;

  // ユーザーメッセージ追加
  addMessage(msg, 'user');
  if (input) input.value = '';

  // ボット応答（少し遅延）
  setTimeout(() => {
    const answer = findAnswer(msg);
    addMessage(answer, 'bot');
  }, 500);
}

/* --- メッセージ追加 --- */
function addMessage(text, type) {
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg ' + type;
  msgEl.innerHTML = text;
  chatbotMessages.appendChild(msgEl);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

/* --- 回答検索（あいまいマッチング） --- */
function findAnswer(input) {
  const normalized = input.toLowerCase().replace(/\s/g, '');
  let bestScore = 0;
  let bestAnswer = '';

  faqData.forEach(faq => {
    let score = 0;
    faq.keywords.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (normalized.includes(kw)) {
        score += kw.length;
      }
      // バイグラムによる部分一致
      if (kw.length >= 2) {
        for (let i = 0; i < kw.length - 1; i++) {
          if (normalized.includes(kw.substring(i, i + 2))) {
            score += 0.5;
          }
        }
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = faq.answer;
    }
  });

  if (bestScore >= 1) {
    return bestAnswer;
  }
  return '申し訳ありません、お答えが見つかりませんでした。お電話（<a href="tel:06-6351-3842">06-6351-3842</a>）でお気軽にお問い合わせください。';
}
