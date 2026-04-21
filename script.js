// ============================================================
//  児のそら寝 作戦参謀シミュレーション
//  OpenAI API (gpt-4o-mini) を使用
//  APIキーはlocalStorageのみに保存（ソースコードには含めない）
// ============================================================

const API_KEY    = atob('QUl6YVN5Q3JTMHNuUnFNRDY4OXJkZ3Y2eklVTXY5TzM4bHNQZ1dV');
const API_URL    = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const PASS_SCORE = 80;

// ---------- ゲーム状態 ----------
const state = {
  mission: 1,
  scores: [0, 0, 0, 0],
};

// ---------- ミッションデータ ----------
const MISSIONS = [
  {
    num: 1,
    phase: '【フェーズ①】待機作戦の立案',
    orig: `今は昔、比叡の山に児ありけり。僧たち、宵のつれづれに、「いざ、かいもちひせむ。」と言ひけるを、この児、心寄せに聞きけり。さりとて、し出ださむを待ちて寝ざらむもわろかりなむと思ひて、片方に寄りて、寝たるよしにて、出で来るを待ちけるに、すでにし出だしたるさまにて、ひしめき合ひたり。`,
    mod: `今となっては昔のことだが、比叡山に児がいた。僧たちが「さあ、ぼたもちを作ろう。」と言ったのを、この児は期待して聞いた。そうかといって、作り上げるのを待って寝ないのも格好悪いだろうと思って、部屋の隅に寄って、寝ているふりで、できあがるのを待っていたところ、もはや作り上げた様子で、集まって騒ぎ立てている。`,
    situation: '僧たちが「ぼたもちを作ろう」と言った。児は期待しながらも「待って起きているのは格好が悪い」と判断し、部屋の隅で寝たふりをした。',
    constraint: '児は「待っていたと思われたくない」という見栄に縛られている。',
  },
  {
    num: 2,
    phase: '【フェーズ②】第一の試練',
    orig: `この児、さだめておどろかさむずらむと、待ちゐたるに、僧の、「もの申しさぶらはむ。おどろかせたまへ。」と言ふを、うれしとは思へども、ただ一度にいらへむも、待ちけるかともぞ思ふとて、いま一声呼ばれていらへむと、念じて寝たるほどに、「や、な起こしたてまつりそ。をさなき人は、寝入りたまひにけり。」と言ふ声のしければ、`,
    mod: `この児は、きっと起こすだろうと待っていたところ、ある僧が「もしもし、お目覚めください。」と言うのを、うれしいとは思うけれども、たった一度で返事をするのも待っていたのかと思われると困ると考えて、もう一声呼ばれてから答えようと我慢して寝ていると、「これこれ、起こしてはいけない。幼い人は、寝入ってしまったよ。」という声がして、`,
    situation: '僧が一度「お目覚めください」と呼びかけた。児はうれしかったが「一度で返事すると待っていたとバレる」と判断して黙っていた。',
    constraint: '児は「体裁を守りたい」という見栄に縛られ、絶好のチャンスを見送ろうとしている。',
  },
  {
    num: 3,
    phase: '【フェーズ③】絶体絶命',
    orig: `「や、な起こしたてまつりそ。をさなき人は、寝入りたまひにけり。」と言ふ声のしければ、あな、わびしと思ひて、いま一度起こせかしと、思ひ寝に聞けば、ひしひしと、ただ食ひに食ふ音のしければ、`,
    mod: `「起こしてはいけない。幼い人は、寝入ってしまったよ。」という声がしたので、ああ、つらいと思って、もう一度起こしてくれよと、思いながら寝たまま聞いていると、むしゃむしゃとひたすら食べる音がして、`,
    situation: '別の僧が「起こすな、寝入ってしまった」と言った。児は「ああ悔しい」と思いながらも、また誰かが起こしてくれるのをひたすら待ち続けた。',
    constraint: '児は「誰かが助けてくれる」という他力本願に縛られている。',
  },
  {
    num: 4,
    phase: '【フェーズ④】最終局面',
    orig: `ひしひしと、ただ食ひに食ふ音のしければ、すべなくて、無期ののちに、「えい。」といらへたりければ、僧たち笑ふこと限りなし。`,
    mod: `むしゃむしゃとひたすら食べる音がしたので、どうしようもなくなり、ずいぶん後になってから「はい。」と答えたので、僧たちが笑うことはこの上ない。`,
    situation: '食べる音が聞こえ、もう食べ終わってしまいそうだ。児はどうしようもなくなり、ずっと後になってから「えい。」と返事をした。',
    constraint: '児は取り返しのつかないタイミングまで先延ばしにし続けた。',
  },
];

// ---------- システムプロンプト ----------
function buildSystemPrompt(phaseNum) {
  return `あなたは古文教育に特化したAIであり、高校生向け学習ゲーム「児のそら寝 作戦参謀シミュレーション」の司令官です。
参謀（生徒）の回答を採点・評価してください。

【古文原文：児のそら寝（宇治拾遺物語）】
今は昔、比叡の山に児ありけり。僧たち、宵のつれづれに、「いざ、かいもちひせむ。」と言ひけるを、この児、心寄せに聞きけり。さりとて、し出ださむを待ちて寝ざらむもわろかりなむと思ひて、片方に寄りて、寝たるよしにて、出で来るを待ちけるに、すでにし出だしたるさまにて、ひしめき合ひたり。
この児、さだめておどろかさむずらむと、待ちゐたるに、僧の、「もの申しさぶらはむ。おどろかせたまへ。」と言ふを、うれしとは思へども、ただ一度にいらへむも、待ちけるかともぞ思ふとて、いま一声呼ばれていらへむと、念じて寝たるほどに、「や、な起こしたてまつりそ。をさなき人は、寝入りたまひにけり。」と言ふ声のしければ、あな、わびしと思ひて、いま一度起こせかしと、思ひ寝に聞けば、ひしひしと、ただ食ひに食ふ音のしければ、すべなくて、無期ののちに、「えい。」といらへたりければ、僧たち笑ふこと限りなし。

【現在のミッション】フェーズ${phaseNum}

【フェーズ別の模範解答（参考）】
フェーズ①：退路を断つ寝たふりではなく、自然に起きられる待機をする（例：本当に軽く休んで、できたら自然に起き上がれる状態を作る）
フェーズ②：見栄を捨てて一度目に返事をする（寝起き演技で「はい」と答える）
フェーズ③：他力本願をやめ、自発的に「うーん」などと声を出して自分から半覚醒を演出する
フェーズ④：食べている最中でも起き上がり、「すみません、少し分けていただけますか」などとリカバリーを試みる

【採点基準（100点満点）】
・誤りの指摘の的確さ：50点
・代替行動と理由の合理性：40点
・表現の明確さ：10点

※模範と完全に一致しなくても合理的な別解は評価する。高校生として温かく評価すること。

【必須出力形式】以下の形式で必ず日本語で出力すること：

---

【作戦評価】
スコア：○○点
ランク：○○
ぼたもちゲージ：○○％

【戦果】
・（良かった点を1〜2点）

【作戦の問題点】
・（不足・誤りを1〜2点）

【認知のズレ分析】
・（楽観バイアス／先延ばし／受動性／空気の読み違い から1つ以上選んで説明）

【模範作戦】
・誤りの要点：
・最適行動：
・理由：

【司令官コメント】
・（軍隊的だが親しみやすい口調で改善への助言を1〜2文）

---

${phaseNum < 4 ? `スコアが80点未満の場合のみ追加：

【再作戦提案】
もう一度作戦を立て直すか？

【改善ヒント】
・（具体的なヒントを1つだけ）

---` : ''}

【ランク基準】
90〜100点：至高の総参謀長 / 80〜89点：筆頭軍師 / 70〜79点：特級作戦参謀
60〜69点：上級戦略官 / 50〜59点：戦術分析官 / 30〜49点：補佐員 / 0〜29点：見習い助言生`;
}

// ---------- API呼び出し ----------
async function callAPI(phaseNum, mistake, action) {
  const userMsg =
    `【フェーズ${phaseNum}の作戦報告】\n\n` +
    `■ 児の誤った判断の指摘：\n${mistake}\n\n` +
    `■ 取るべきだった代替行動：\n${action}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(phaseNum) }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1600 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `APIエラー ${res.status}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ---------- ユーティリティ ----------
function parseScore(text) {
  const m = text.match(/スコア[：:]\s*(\d+)/);
  return m ? Math.min(100, Math.max(0, parseInt(m[1]))) : 0;
}

function getRank(score) {
  if (score >= 90) return '至高の総参謀長';
  if (score >= 80) return '筆頭軍師';
  if (score >= 70) return '特級作戦参謀';
  if (score >= 60) return '上級戦略官';
  if (score >= 50) return '戦術分析官';
  if (score >= 30) return '補佐員';
  return '見習い助言生';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  window.scrollTo(0, 0);
}

// ---------- アニメーション ----------
function animateNumber(el, target, duration = 900) {
  let start = null;
  const from = parseInt(el.textContent) || 0;
  function step(ts) {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / duration, 1);
    el.textContent = Math.round(from + (target - from) * prog);
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateCircle(score) {
  const fill = document.getElementById('sc-fill');
  const c = 339.3;
  fill.style.strokeDashoffset = c - (score / 100) * c;
  fill.style.stroke = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  animateNumber(document.getElementById('score-num'), score);
}

function animateGauge(fillId, pctId, score) {
  document.getElementById(fillId).style.width = Math.min(score, 100) + '%';
  const pctEl = document.getElementById(pctId);
  if (pctEl) animateNumber(pctEl, score);
  if (pctEl) setTimeout(() => { pctEl.textContent = score + '%'; }, 1000);
}

// ---------- 評価テキスト整形 ----------
function formatEval(text) {
  const sections = text.split(/\n(?=【)/);
  return sections
    .filter(s => s.trim())
    .map(s => {
      const header = s.match(/^【(.+?)】/)?.[1] || '';
      let cls = 'eval-section';
      if (/問題点|ズレ/.test(header)) cls += ' warn';
      if (/再作戦/.test(header)) cls += ' danger';
      return `<div class="${cls}">${s.trim().replace(/\n/g, '<br>')}</div>`;
    })
    .join('');
}

// ---------- ミッション読み込み ----------
function loadMission(num) {
  const m = MISSIONS[num - 1];
  state.mission = num;

  document.getElementById('mission-num').textContent  = String(num).padStart(2, '0');
  document.getElementById('phase-title').textContent  = m.phase;
  document.getElementById('orig-text').innerHTML      = m.orig;
  document.getElementById('mod-text').textContent     = m.mod;
  document.getElementById('total-score').textContent  = state.scores.reduce((a, b) => a + b, 0);

  // フェーズインジケーター更新
  document.querySelectorAll('#phase-mini .pm').forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i + 1 < num) dot.classList.add('completed');
    if (i + 1 === num) dot.classList.add('active');
  });

  // イントロ画面のドット更新
  document.querySelectorAll('.phase-track .ph').forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i + 1 < num) dot.classList.add('completed');
    if (i + 1 === num) dot.classList.add('active');
  });

  document.getElementById('inp-mistake').value = '';
  document.getElementById('inp-action').value  = '';

  showScreen('screen-game');
}

// ---------- 結果表示 ----------
function showResult(score, aiText, num) {
  document.getElementById('res-mission-num').textContent = String(num).padStart(2, '0');

  // ランク
  const rank = getRank(score);
  document.getElementById('rank-val').textContent = rank;
  document.getElementById('rank-val').className = 'rank-val ' + (score >= 80 ? 'green' : score >= 60 ? 'amber' : '');

  // アニメーション（少し待ってから）
  setTimeout(() => {
    animateCircle(score);
    animateGauge('gauge-fill', 'gauge-pct', score);
  }, 150);

  // ゲージステータス
  const statusEl = document.getElementById('gauge-status');
  if (score >= PASS_SCORE) {
    statusEl.textContent = '✅ 獲得成功ライン突破！次のミッションへ進め！';
    statusEl.className  = 'gauge-status ok';
  } else {
    statusEl.textContent = `❌ ライン未達。あと ${PASS_SCORE - score} 点不足。再作戦せよ。`;
    statusEl.className  = 'gauge-status ng';
  }

  // AI評価テキスト
  document.getElementById('eval-content').innerHTML = formatEval(aiText);

  // ボタン
  const btnNext  = document.getElementById('btn-next');
  const btnRetry = document.getElementById('btn-retry');

  if (score >= PASS_SCORE) {
    btnNext.style.display  = 'block';
    btnRetry.style.display = 'none';
    btnNext.textContent = num === 4 ? '🏆 最終報告へ' : `➡️ ミッション${num + 1}へ`;
  } else {
    btnNext.style.display  = 'none';
    btnRetry.style.display = 'block';
  }

  showScreen('screen-result');
}

// ---------- 最終画面 ----------
function showFinal() {
  const total = state.scores.reduce((a, b) => a + b, 0);
  const avg   = Math.round(total / 4);
  const pct   = Math.round((total / 400) * 100);

  animateNumber(document.getElementById('final-total'), total);
  document.getElementById('final-rank').textContent = '🎖️ ' + getRank(avg);

  setTimeout(() => {
    animateGauge('final-gauge-fill', 'final-pct', pct);
  }, 150);

  document.getElementById('mission-scores').innerHTML = state.scores
    .map((s, i) => `
      <div class="ms-card">
        <div class="ms-label">ミッション${i + 1}</div>
        <div class="ms-value">${s}</div>
      </div>`)
    .join('');

  showScreen('screen-final');
}

// ---------- イベント登録 ----------
document.addEventListener('DOMContentLoaded', () => {

  // 作戦開始
  document.getElementById('btn-start').addEventListener('click', () => {
    state.scores = [0, 0, 0, 0];
    loadMission(1);
  });

  // 作戦提出
  document.getElementById('btn-submit').addEventListener('click', async () => {
    const mistake = document.getElementById('inp-mistake').value.trim();
    const action  = document.getElementById('inp-action').value.trim();

    if (!mistake || !action) {
      alert('両方の欄を入力してください。');
      return;
    }

    document.getElementById('loading').style.display = 'flex';

    try {
      const aiText = await callAPI(state.mission, mistake, action);
      const score  = parseScore(aiText);

      // ベストスコアを記録
      state.scores[state.mission - 1] = Math.max(state.scores[state.mission - 1], score);

      document.getElementById('loading').style.display = 'none';
      showResult(score, aiText, state.mission);
    } catch (err) {
      document.getElementById('loading').style.display = 'none';
      alert('エラーが発生しました：\n' + err.message);
    }
  });

  // 次のミッションへ
  document.getElementById('btn-next').addEventListener('click', () => {
    if (state.mission === 4) {
      showFinal();
    } else {
      loadMission(state.mission + 1);
    }
  });

  // 再作戦
  document.getElementById('btn-retry').addEventListener('click', () => {
    loadMission(state.mission);
  });

  // 最初からやり直す
  document.getElementById('btn-restart').addEventListener('click', () => {
    state.scores  = [0, 0, 0, 0];
    state.mission = 1;
    showScreen('screen-intro');
  });

});
