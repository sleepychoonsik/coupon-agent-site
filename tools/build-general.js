// 패션1팀 결과물을 복사해 범용(쿠폰 에이전트 전용) 버전을 general/ 에 만든다. 원본 파일은 읽기만 한다.
const fs = require('fs'), path = require('path');
const R = process.argv[2]; const OUT = path.join(R, 'general'); fs.mkdirSync(OUT, { recursive: true });
const read = (f) => fs.readFileSync(path.join(R, f), 'utf8').replace(/\r\n/g, '\n');
const BASE = 'https://sleepychoonsik.github.io/coupon-agent-site/';
const GBASE = BASE + 'general/';
function rep(s, from, to, n = 1, label = '') {
  const c = s.split(from).length - 1;
  if (c !== n) throw new Error(`[${label}] 찾은 개수 ${c} ≠ ${n}: ${String(from).slice(0, 80)}`);
  return s.split(from).join(to);
}

// ---------- 1) 에이전트 ----------
let ag = read('agent.txt');
ag = rep(ag, "// 승인 모드(PLAN.mode === 'approve', 승인자 PC에서 실행): 쿠폰코드로 조회해 기간·할인·부담이 계획과 같으면 [승인]을 누른다.\n// 승인 모드에서는 [추가]·[저장]을 누르지 않고, 등록 모드에서는 [승인]을 누르지 않는다.\n", '// 범용 버전: 승인 기능 없음. 상품-쿠폰 일괄 등록 중 추가 요청 창이 뜨면 사용자가 직접 처리한다.\n', 1, 'agent 머리말');
ag = rep(ag, `const VALIDATOR_URL = '${BASE}';`, `const VALIDATOR_URL = '${GBASE}';`, 1, 'agent 검증주소');
ag = rep(ag, ', extra: handleContribDialog });', ' });', 1, 'agent 공헌 자동요청');
ag = rep(ag, "msgs.push('공헌이익 승인요청: 당사직매입 상품으로 [요청]');", "msgs.push('추가 요청 창 처리');", 1, 'agent 문구');
ag = rep(ag, '[쿠폰 상품 일괄등록]을 눌렀지만 완료 안내를 못 봤어요. 화면을 확인해 주세요.', '[쿠폰 상품 일괄등록]을 눌렀지만 완료 안내를 못 봤어요. 화면을 확인해 주세요(요청 사유를 묻는 창이 떠 있으면 직접 골라 [요청]을 눌러 주세요).', 1, 'agent 안내');
ag = rep(ag, '승인은 누르지 않아요(다른 분이 승인)', '승인은 누르지 않아요', 1, 'agent 승인 문구');
// 북마크 방식으로 통일 (콘솔 붙여넣기 안내 제거)
ag = rep(ag, '<div class="hint">예전 방식(검증 화면의 [세일즈원 입력 코드 복사] → 콘솔에 붙여넣기)도 그대로 돼요. 계획 내용(JSON)을 직접 붙여넣을 수도 있어요.</div>', '<div class="hint">계획 내용(JSON)을 직접 붙여넣을 수도 있어요.</div>', 1, 'agent 콘솔 안내');
ag = rep(ag, "붙여넣은 내용을 읽지 못했어요. 사전검증 도구에서 복사한 코드를 콘솔에 붙여넣어 주세요.", "붙여넣은 내용을 읽지 못했어요. 검증 화면의 [에이전트로 보내기]를 써 주세요.", 1, 'agent 콘솔 알림');
fs.writeFileSync(path.join(OUT, 'agent.txt'), ag);

// ---------- 2) 검증 사이트 ----------
let ix = read('index.html');
const agOrig = read('agent.txt');
ix = rep(ix, `<script id="fillercode" type="text/plain">${agOrig}</script>`, `<script id="fillercode" type="text/plain">${ag}</script>`, 1, 'index 에이전트 교체');
ix = rep(ix, `const AGENT_URL = '${BASE}agent.txt';`, `const AGENT_URL = '${GBASE}agent.txt';`, 1, 'index 에이전트 주소');
// 팀 고정 → 사용자가 입력
ix = rep(ix, "  team: '패션1팀', // 사용자 팀 고정 (2026-10-08)\n", "  team: '', // 범용: 화면의 [팀구분] 칸에서 받는다\n", 1, 'index 팀 기본값');
ix = rep(ix, '<li><label class="field"><span>브랜드</span> <input id="prefix" spellcheck="false" placeholder="예: 와니" style="width:120px"></label></li>',
  '<li><label class="field"><span>브랜드</span> <input id="prefix" spellcheck="false" placeholder="예: 브랜드명" style="width:120px"></label></li>\n      <li><label class="field"><span>팀구분</span> <input id="team" spellcheck="false" placeholder="예: 패션2팀" style="width:120px"></label> <span class="muted">세일즈원 쿠폰등록의 [팀구분]에 보이는 이름 그대로 적어 주세요 (이 PC에 기억돼요)</span></li>', 1, 'index 팀 칸');
ix = rep(ix, "  if (!targets.length) { alert('상품코드와 가격 또는 할인(예: 89000, 15%, -9000)을 붙여넣어 주세요.'); return; }\n",
  "  if (!targets.length) { alert('상품코드와 가격 또는 할인(예: 89000, 15%, -9000)을 붙여넣어 주세요.'); return; }\n  if (!$('team').value.trim()) { alert('1번 칸의 [팀구분]을 적어 주세요. 세일즈원 쿠폰등록의 팀구분에 보이는 이름 그대로 적으면 돼요.'); $('team').focus(); return; }\n", 1, 'index 팀 필수');
ix = rep(ix, "annitude1005: $('anni').checked, prefix: $('prefix').value.trim(),", "annitude1005: false, team: $('team').value.trim(), prefix: $('prefix').value.trim(),", 1, 'index 옵션');
ix = rep(ix, "  annitude1005: true, // 엔니튜드", "  annitude1005: false, // 범용: 끔. 엔니튜드", 1, 'index 엔니튜드 기본');
// 엔니튜드 고급 설정 줄 삭제
{ const a = ix.indexOf('      <div class="row" style="margin-top:8px">\n        <label class="field"><input type="checkbox" id="anni" checked>');
  const b = ix.indexOf('</div>\n', a) + 7; if (a < 0) throw new Error('엔니튜드 줄 없음'); ix = ix.slice(0, a) + ix.slice(b); }
ix = rep(ix, '공헌이익 승인 대상일 수 있습니다.', '마진을 확인해 주세요.', 1, 'index G7');
ix = rep(ix, '김지연"></textarea>', '홍길동"></textarea>', 1, 'index 예시 등록자');
// 패션1팀 화면과 저장값이 섞이지 않게 저장 키를 따로 쓴다 (같은 github.io 주소라 저장소를 같이 씀)
ix = rep(ix, 'couponValidator.inputs.v1', 'couponValidatorGeneral.inputs.v1', 1, 'key1');
ix = rep(ix, 'couponValidator.defaults.v1', 'couponValidatorGeneral.defaults.v1', 1, 'key2');
ix = rep(ix, 'couponValidator.vip.v1', 'couponValidatorGeneral.vip.v1', 2, 'key3');
// 북마크 방식으로 통일: 콘솔용 버튼은 숨기고(코드가 버튼을 찾으므로 지우지는 않음) 안내 문구에서 콘솔을 뺀다
ix = rep(ix, '<button id="socode" class="ghost" title=', '<button id="socode" class="ghost" style="display:none" title=', 1, 'index 콘솔 버튼');
ix = rep(ix, '<button id="cpfill" class="big" disabled title=', '<button id="cpfill" class="big" disabled style="display:none" title=', 1, 'index 입력코드 버튼');
ix = rep(ix, ' (북마크가 안 되는 PC는 [콘솔용 코드 복사] → 세일즈원 창에서 F12 → Console → Ctrl+V → Enter.)</p>', ' 북마크는 누를 때마다 최신 버전을 받아 오니 한 번만 만들면 돼요.</p>', 1, 'index 첫 안내');
ix = rep(ix, '(북마크가 없으면 [🤖 북마크 코드 복사]로 먼저 만들거나, [콘솔용 코드 복사] → F12 → Console → Ctrl+V → Enter.)', '(북마크가 없으면 [🤖 북마크 코드 복사]로 먼저 만들어 주세요.)', 1, 'index 열기 안내');
ix = rep(ix, "'자동 복사가 막혀 있어요. [콘솔용 코드 복사] 방법을 써 주세요.'", "'자동 복사가 막혀 있어요. 설명서의 [🤖 북마크 코드 복사]로 다시 해 보세요.'", 1, 'index 복사 실패');
ix = rep(ix, "$('cphint').textContent = plan.plannedCoupons.length ? '' : '만들 쿠폰이 없어서 복사 버튼이 꺼져 있어요.';", "$('cphint').textContent = plan.plannedCoupons.length ? (agent.win ? '' : '세일즈원 창에서 북마크 🤖 쿠폰 에이전트를 누르면 이어지고, 이어지면 [에이전트로 보내기]로 보낼 수 있어요.') : '만들 쿠폰이 없어요.';", 1, 'index 4번 안내');
ix = rep(ix, ` 그 창에서 <b>[쿠폰 전부 등록 시작]</b>을 누르면 돼요. 아니면 아래 순서로 넣으세요.</p>
      <ol>
        <li>위 <b>[세일즈원 입력 코드 복사]</b>를 누르세요.</li>
        <li>세일즈원 <b>쿠폰관리 &gt; 쿠폰등록</b> 화면에서 <kbd>F12</kbd> → <b>Console</b> 탭을 여세요.</li>
        <li>붙여넣고 <kbd>Enter</kbd>. 오른쪽 아래에 <b>🤖 쿠폰 에이전트</b>가 열리면 <b>[남은 쿠폰 전부 등록]</b>을 누르세요.</li>
      </ol>`, ` 그 창에서 <b>[남은 쿠폰 전부 등록]</b>을 누르면 돼요.</p>
      <ol>
        <li>안 이어져 있으면 세일즈원 <b>쿠폰관리 &gt; 쿠폰등록</b> 창에서 북마크 <b>🤖 쿠폰 에이전트</b>를 누르세요.</li>
        <li>이어지면 위 <b>[에이전트로 보내기]</b>가 나타나요. 눌러서 쿠폰을 보내세요.</li>
        <li>에이전트 창에서 <b>[남은 쿠폰 전부 등록]</b>을 누르세요.</li>
      </ol>`, 1, 'index 4번 순서');
ix = rep(ix, '<title>🤖 쿠폰 에이전트 - 쿠폰 사전검증</title>', '<title>🤖 쿠폰 에이전트 - 쿠폰 사전검증 (범용)</title>', 1, 'index title');
fs.writeFileSync(path.join(OUT, 'index.html'), ix);

// ---------- 3) 설명서 (공유 버전 기반) ----------
const J = (x) => JSON.stringify(x).split('</').join('<\\/');
let gd = read('guide-share.html');
gd = rep(gd, `<script type="application/json" id="agentCode">${J(agOrig)}</script>`, `<script type="application/json" id="agentCode">${J(ag)}</script>`, 1, 'guide 에이전트');
gd = rep(gd, `const url = '${BASE}agent.txt';`, `const url = '${GBASE}agent.txt';`, 1, 'guide 북마크 주소');
gd = rep(gd, `href="${BASE}agent.txt"`, `href="${GBASE}agent.txt"`, 1, 'guide agent 링크');
gd = rep(gd, `${BASE}guide-share.html`, `${GBASE}guide.html`, 2, 'guide 자기 링크');
gd = gd.split(`"${BASE}"`).join(`"${GBASE}"`);
if (gd.includes(`"${BASE}"`)) throw new Error('guide 원본 주소 남음');
gd = rep(gd, '<p class="sub">패션1팀 · 세일즈원 쿠폰 등록을 자동으로 해 주는 도구</p>', '<p class="sub">세일즈원 쿠폰 등록을 자동으로 해 주는 도구 (범용)</p>', 1, 'guide 부제');
gd = rep(gd, '<span class="link-u">공유 버전</span>', '<span class="link-u">범용 버전</span>', 1, 'guide 링크명');
gd = rep(gd, "<div class=\"link\"><span class=\"link-i\">🤖</span><span class=\"link-b\"><span class=\"link-n\">쿠폰 에이전트</span><span class=\"link-u\">쿠폰 사전검증 · 세일즈원 등록</span></span>", "<div class=\"link\"><span class=\"link-i\">🧮</span><span class=\"link-b\"><span class=\"link-n\">사전검증 페이지</span><span class=\"link-u\">화면 1 · 계획/검증 · 여기서 시작해요</span></span>", 1, 'guide 카드 사전검증');
gd = rep(gd, "<div class=\"link\"><span class=\"link-i\">📖</span>", "<div class=\"link\"><span class=\"link-i\">🤖</span><span class=\"link-b\"><span class=\"link-n\">에이전트 패널</span><span class=\"link-u\">화면 2 · 실행 · 세일즈원에서 북마크로 띄워요</span></span><span class=\"link-a\"><button class=\"bmc\" data-code=\"bookmarkCode\">북마크 코드 복사</button></span></div>\n      <div class=\"link\"><span class=\"link-i\">📖</span>", 1, 'guide 카드 패널');
gd = rep(gd, '</style>', '.latest button.bmc{font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:7px 14px;line-height:1.2;cursor:pointer;background:var(--accent);color:#fff;border:1px solid var(--accent);white-space:nowrap}.latest button.bmc.done{background:#2e8b57;border-color:#2e8b57}\n</style>', 1, 'guide 카드 패널 스타일');
gd = rep(gd, "document.querySelectorAll('button.copy').forEach((b) => {", `document.querySelectorAll('button.bmc').forEach((b) => {
  const label = b.textContent;
  b.addEventListener('click', async () => {
    const code = JSON.parse(document.getElementById(b.dataset.code).textContent); let ok = false;
    try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove();
    }
    b.textContent = ok ? '✓ 복사됨' : '복사 실패'; b.classList.toggle('done', ok);
    setTimeout(() => { b.textContent = label; b.classList.remove('done'); }, 2500);
  });
});
document.querySelectorAll('button.copy').forEach((b) => {`, 1, 'guide 카드 패널 스크립트');
gd = rep(gd, '<li>쿠폰 기간과 <b>브랜드</b>를 적습니다.', '<li>쿠폰 기간과 <b>브랜드</b>, <b>팀구분</b>을 적습니다. 팀구분은 세일즈원 쿠폰등록의 [팀구분]에 보이는 이름 그대로(예: 패션2팀) 적고, 한 번 적으면 이 PC에 기억돼요.', 1, 'guide 팀구분');
gd = rep(gd, " 중간에 <b>공헌이익 승인요청</b> 창이 뜨면 요청사유 '당사직매입 상품'을 골라 [요청]까지 알아서 눌러요.", ' 중간에 요청 사유를 묻는 창이 뜨면 팀 기준에 맞게 직접 골라 [요청]을 눌러 주세요.', 1, 'guide 공헌 단계');
gd = rep(gd, '      <li>승인권자에게 <b>승인 요청</b>을 알립니다. (승인 전에는 쿠폰이 적용되지 않아요.)</li>\n', '      <li>등록한 쿠폰은 승인된 뒤에 적용돼요. 승인은 각 팀 절차대로 진행해 주세요.</li>\n', 1, 'guide 승인 단계');
gd = rep(gd, '      <li><b>엔니튜드</b> 15% 쿠폰은 당사 10% / 협력사 5% 부담으로 만들어요. 1번 칸 아래 <b>고급 설정</b>의 엔니튜드 체크(기본 켜짐)를 끄면 다른 위수탁 상품처럼 반반(7.5% / 7.5%)이에요.</li>\n', '', 1, 'guide 엔니튜드');
gd = rep(gd, '      <li>공헌이익이 마이너스가 되는 상품은 승인권자가 따로 승인해야 해요.</li>\n', '', 1, 'guide 공헌');
gd = rep(gd, '기간과 고급 설정은 이 PC에 자동으로 기억돼요.', '기간·팀구분과 고급 설정은 이 PC에 자동으로 기억돼요.', 1, 'guide 기억');
gd = rep(gd, '고객쿠폰(등록자 신지원·이진선·나희석, 쿠폰설명에 마이샵·매장 전용·리모콘·VIP가 들어간 쿠폰)은 계산에서 빼요.', '고객쿠폰(2번 칸 아래 <b>고급 설정</b>의 계산 제외 등록자가 만든 쿠폰, 쿠폰설명에 마이샵·매장 전용·리모콘·VIP가 들어간 쿠폰)은 계산에서 빼요. 팀에 맞게 바꿔 쓰세요.', 1, 'guide 고객쿠폰');
// ----- 북마크 방식으로 통일 (콘솔 붙여넣기 안내 전부 제거) -----
const swapSection = (s, id, html) => {
  const a = s.indexOf(`<section class="card" id="${id}">`); if (a < 0) throw new Error(`섹션 ${id} 없음`);
  const b = s.indexOf('</section>', a) + '</section>'.length; return s.slice(0, a) + html + s.slice(b);
};
gd = rep(gd, '<a href="#start">처음 한 번만</a>', '<a href="#start">북마크 만들기</a>', 1, 'guide nav');
gd = rep(gd, '<nav>\n    <a href="#start">', '<nav>\n    <a href="#overview">한눈에 보기</a>\n    <a href="#start">', 1, 'guide nav 한눈에');
{ const a = gd.indexOf('<section class="card">\n    <h2>한눈에 보기</h2>'); if (a < 0) throw new Error('한눈에 보기 섹션 없음');
  const b = gd.indexOf('</section>', a) + '</section>'.length;
  gd = gd.slice(0, a) + "<section class=\"card\" id=\"overview\">\n    <h2>한눈에 보기: 계획/검증 화면과 실행 화면</h2>\n    <div class=\"pair\">\n      <div class=\"pair-i\"><span class=\"pair-n\">화면 1 · 계획/검증</span><b>사전검증 페이지</b><span>맨 위 <b>사전검증 페이지 [열기]</b>로 열어요. 상품코드와 가격을 넣으면 어떤 쿠폰을 만들지 <b>계획</b>하고, 최종가·마진·겹치는 쿠폰을 <b>검증</b>해요.</span></div>\n      <div class=\"pair-i\"><span class=\"pair-n\">화면 2 · 실행</span><b>세일즈원 + 🤖 에이전트 패널</b><span>세일즈원에서 북마크로 띄워요. 계획한 쿠폰을 세일즈원에 <b>등록·저장</b>하고 상품까지 연결해요.</span></div>\n    </div>\n    <p>두 화면은 서로 알아서 주고받아요. <b>복사·붙여넣기 없이 버튼만</b> 누르면 돼요.</p>\n    <div class=\"flowfig\" role=\"img\" aria-label=\"사전검증 페이지와 세일즈원 에이전트 패널이 주고받는 순서 그림\">\n      <svg viewBox=\"0 0 760 364\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Pretendard, 'Malgun Gothic', system-ui, sans-serif\">\n        <defs>\n          <marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--accent)\"/></marker>\n        </defs>\n        <!-- 화면 1: 계획/검증 (머리: 제목 + 역할) -->\n        <rect x=\"8\" y=\"8\" width=\"252\" height=\"300\" rx=\"12\" style=\"fill:var(--card);stroke:var(--line)\" stroke-width=\"1.5\"/>\n        <rect x=\"8\" y=\"8\" width=\"252\" height=\"58\" rx=\"12\" style=\"fill:var(--soft)\"/>\n        <rect x=\"8\" y=\"54\" width=\"252\" height=\"12\" style=\"fill:var(--soft)\"/>\n        <circle cx=\"26\" cy=\"26\" r=\"4\" style=\"fill:var(--line)\"/><circle cx=\"40\" cy=\"26\" r=\"4\" style=\"fill:var(--line)\"/>\n        <text x=\"134\" y=\"31\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" style=\"fill:var(--ink)\">화면 1 · 사전검증 페이지</text>\n        <text x=\"134\" y=\"54\" text-anchor=\"middle\" font-size=\"13.5\" font-weight=\"700\" style=\"fill:var(--accent)\">🧮 계산하는 곳</text>\n        <g font-size=\"12.5\" style=\"fill:var(--sub)\">\n          <rect x=\"24\" y=\"78\" width=\"220\" height=\"38\" rx=\"7\" style=\"fill:var(--bg);stroke:var(--line)\"/>\n          <text x=\"36\" y=\"102\">1 상품코드 | 가격·할인</text>\n          <rect x=\"24\" y=\"124\" width=\"220\" height=\"38\" rx=\"7\" style=\"fill:var(--bg);stroke:var(--line)\"/>\n          <text x=\"36\" y=\"148\">2·3 조회 결과 (자동으로 채워짐)</text>\n          <rect x=\"24\" y=\"170\" width=\"220\" height=\"38\" rx=\"7\" style=\"fill:var(--bg);stroke:var(--line)\"/>\n          <text x=\"36\" y=\"194\">기간 · 브랜드 · 팀구분</text>\n        </g>\n        <rect x=\"24\" y=\"224\" width=\"108\" height=\"34\" rx=\"7\" style=\"fill:var(--accent)\"/>\n        <text x=\"78\" y=\"246\" text-anchor=\"middle\" font-size=\"12.5\" font-weight=\"700\" fill=\"#fff\">쿠폰 만들기</text>\n        <rect x=\"138\" y=\"224\" width=\"106\" height=\"34\" rx=\"7\" style=\"fill:var(--card);stroke:var(--accent)\"/>\n        <text x=\"191\" y=\"246\" text-anchor=\"middle\" font-size=\"12.5\" font-weight=\"700\" style=\"fill:var(--accent)\">세일즈원 열기</text>\n\n        <!-- 화면 2: 실행 (머리: 제목 + 역할) -->\n        <rect x=\"500\" y=\"8\" width=\"252\" height=\"300\" rx=\"12\" style=\"fill:var(--card);stroke:var(--line)\" stroke-width=\"1.5\"/>\n        <rect x=\"500\" y=\"8\" width=\"252\" height=\"58\" rx=\"12\" style=\"fill:var(--soft)\"/>\n        <rect x=\"500\" y=\"54\" width=\"252\" height=\"12\" style=\"fill:var(--soft)\"/>\n        <circle cx=\"518\" cy=\"26\" r=\"4\" style=\"fill:var(--line)\"/><circle cx=\"532\" cy=\"26\" r=\"4\" style=\"fill:var(--line)\"/>\n        <text x=\"626\" y=\"31\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" style=\"fill:var(--ink)\">화면 2 · 세일즈원 쿠폰등록</text>\n        <text x=\"626\" y=\"54\" text-anchor=\"middle\" font-size=\"13.5\" font-weight=\"700\" style=\"fill:var(--accent)\">✍️ 세일즈원에 입력하는 곳</text>\n        <g style=\"fill:var(--line)\"><rect x=\"516\" y=\"80\" width=\"140\" height=\"9\" rx=\"3\"/><rect x=\"516\" y=\"96\" width=\"100\" height=\"9\" rx=\"3\"/><rect x=\"516\" y=\"112\" width=\"120\" height=\"9\" rx=\"3\"/></g>\n        <rect x=\"560\" y=\"132\" width=\"180\" height=\"150\" rx=\"10\" style=\"fill:var(--card);stroke:var(--accent)\" stroke-width=\"2\"/>\n        <text x=\"650\" y=\"156\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"700\" style=\"fill:var(--ink)\">🤖 에이전트 패널</text>\n        <rect x=\"574\" y=\"168\" width=\"152\" height=\"30\" rx=\"6\" style=\"fill:var(--accent)\"/>\n        <text x=\"650\" y=\"188\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">남은 쿠폰 전부 등록</text>\n        <rect x=\"574\" y=\"206\" width=\"152\" height=\"30\" rx=\"6\" style=\"fill:var(--card);stroke:var(--accent)\"/>\n        <text x=\"650\" y=\"226\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" style=\"fill:var(--accent)\">상품-쿠폰 일괄 등록</text>\n        <text x=\"650\" y=\"262\" text-anchor=\"middle\" font-size=\"11.5\" style=\"fill:var(--sub)\">승인은 누르지 않아요</text>\n\n        <!-- 주고받기 화살표 -->\n        <g font-size=\"12.5\" text-anchor=\"middle\">\n          <line x1=\"268\" y1=\"92\" x2=\"492\" y2=\"92\" style=\"stroke:var(--accent)\" stroke-width=\"2\" marker-end=\"url(#ah)\"/>\n          <text x=\"380\" y=\"80\" font-weight=\"700\" style=\"fill:var(--ink)\">① [세일즈원 열기]</text>\n          <text x=\"380\" y=\"110\" style=\"fill:var(--sub)\">세일즈원이 새로 열려요</text>\n\n          <line x1=\"268\" y1=\"152\" x2=\"492\" y2=\"152\" style=\"stroke:var(--accent)\" stroke-width=\"2\" marker-start=\"url(#ah)\"/>\n          <text x=\"380\" y=\"140\" font-weight=\"700\" style=\"fill:var(--ink)\">② 북마크 🤖 클릭</text>\n          <text x=\"380\" y=\"170\" style=\"fill:var(--sub)\">패널이 뜨고 \"연결됐어요\"</text>\n\n          <line x1=\"268\" y1=\"212\" x2=\"492\" y2=\"212\" style=\"stroke:var(--accent)\" stroke-width=\"2\" marker-start=\"url(#ah)\" marker-end=\"url(#ah)\"/>\n          <text x=\"380\" y=\"200\" font-weight=\"700\" style=\"fill:var(--ink)\">③ [2·3번 불러오기]</text>\n          <text x=\"380\" y=\"230\" style=\"fill:var(--sub)\">패널이 조회해서 돌려줘요</text>\n\n          <line x1=\"268\" y1=\"272\" x2=\"492\" y2=\"272\" style=\"stroke:var(--accent)\" stroke-width=\"2\" marker-end=\"url(#ah)\"/>\n          <text x=\"380\" y=\"260\" font-weight=\"700\" style=\"fill:var(--ink)\">④ [쿠폰 만들기]</text>\n          <text x=\"380\" y=\"290\" style=\"fill:var(--sub)\">쿠폰이 패널로 자동 전송</text>\n        </g>\n        <path d=\"M626 312 V330\" style=\"stroke:var(--accent)\" stroke-width=\"2\" marker-end=\"url(#ah)\"/>\n        <text x=\"626\" y=\"352\" text-anchor=\"middle\" font-size=\"13.5\" font-weight=\"700\" style=\"fill:var(--accent)\">⑤ 패널에서 등록 → 일괄 등록</text>\n      </svg>\n    </div>\n    <ol class=\"steps5\">\n      <li><b>사전검증 페이지</b>에서 <b class=\"btn\">세일즈원 열기</b>를 눌러요.</li>\n      <li>열린 세일즈원 화면에서 북마크 <b>🤖 쿠폰 에이전트</b>를 눌러요. 패널에 \"검증 화면과 연결됐어요\"가 나오면 준비 끝이에요.</li>\n      <li>사전검증 1번 칸에 상품코드·가격을 붙여넣고 기간·브랜드·팀구분을 적은 뒤 <b class=\"btn\">세일즈원에서 2·3번 불러오기</b>를 눌러요.</li>\n      <li><b class=\"btn\">쿠폰 만들기</b>를 누르면 만든 쿠폰이 패널로 자동으로 들어가요.</li>\n      <li>패널에서 <b class=\"btn\">남은 쿠폰 전부 등록</b> → <b class=\"btn\">상품-쿠폰 일괄 등록</b>을 누르면 끝이에요.</li>\n    </ol>\n    <p class=\"muted\">처음이라면 아래 <a href=\"#start\">북마크 만들기</a>를 먼저 해 주세요. 단계별 자세한 설명은 <a href=\"#a1\">쿠폰 에이전트</a>에 있어요.</p>\n  </section>" + gd.slice(b); }
gd = rep(gd, '</style>', ".pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:12px 0 6px}\n.pair-i{display:flex;flex-direction:column;gap:2px;border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--bg);font-size:14px;line-height:1.55}\n.pair-i>b{font-size:16px}\n.pair-n{font-size:12px;font-weight:700;color:var(--accent)}\n.flowfig{margin:14px 0 6px;overflow-x:auto;-webkit-overflow-scrolling:touch}\n.flowfig svg{display:block;width:100%;min-width:600px;height:auto}\n.steps5 li{margin:6px 0}\n" + '</style>', 1, 'guide 한눈에 스타일');
gd = swapSection(gd, 'start', `<section class="card" id="start">
    <h2>처음 한 번만: 🤖 쿠폰 에이전트 북마크 만들기</h2>
    <p>쿠폰 에이전트는 크롬 <b>북마크</b>로 실행해요. 따로 설치하거나 코드를 붙여넣을 필요가 없어요. 북마크는 누를 때마다 <b>최신 버전</b>을 받아 오니, 한 번 만들면 다시 만들 필요가 없어요.</p>
    <p>먼저 크롬 북마크바가 보이게 해 주세요. 안 보이면 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>.</p>
    <h3>북마크 등록하기</h3>
    <ol>
      <li><button class="copy" data-code="bookmarkCode">🤖 북마크 코드 복사</button>를 누릅니다.</li>
      <li>북마크바 빈 곳에서 오른쪽 클릭 → <b>페이지 추가</b>.</li>
      <li>이름에 <b>🤖 쿠폰 에이전트</b>, URL 칸은 원래 내용을 지우고 <kbd>Ctrl</kbd>+<kbd>V</kbd> → <b>저장</b>.</li>
    </ol>
    <div class="ok">세일즈원 화면을 <b>새로고침하면 에이전트 창이 사라져요.</b> 북마크를 한 번 더 누르면 다시 떠요. 등록한 쿠폰 내역은 기억하고 있어서 이어서 할 수 있어요.</div>
  </section>`);
gd = rep(gd, '<li>크롬 북마크바의 <b>🤖 쿠폰 에이전트</b> 북마크. <b>처음 한 번만</b> 만들어요: 아래 <button class="copy" data-code="bookmarkCode">🤖 북마크 코드 복사</button> → 북마크바에서 오른쪽 클릭 → <b>페이지 추가</b> → 이름 <b>🤖 쿠폰 에이전트</b>, URL 칸에 <b>Ctrl+V</b> → 저장. (북마크바가 안 보이면 Ctrl+Shift+B. 검증 화면의 [🤖 북마크 코드 복사]와 같은 코드이고, 누를 때마다 최신 코드를 받아 오니 한 번 만들면 계속 써요.)</li>',
  '<li>크롬 북마크바의 <b>🤖 쿠폰 에이전트</b> 북마크 (없으면 위 <a href="#start">북마크 만들기</a>를 먼저 해 주세요)</li>', 1, 'guide 준비물 북마크');
{ const a = gd.indexOf('    <p class="muted">북마크를 못 쓰는 PC라면:'); if (a < 0) throw new Error('콘솔 대안 문단 없음');
  gd = gd.slice(0, a) + gd.slice(gd.indexOf('</p>\n', a) + 5); }
gd = rep(gd, ' 두 창이 안 이어져 있으면 ④ 카드의 <b class="btn">세일즈원 입력 코드 복사</b> → 세일즈원 콘솔에 붙여넣기로 넣을 수 있어요.', ' 두 창이 안 이어져 있으면 세일즈원 창에서 북마크 <b>🤖 쿠폰 에이전트</b>를 한 번 더 누른 뒤 ④ 카드의 <b class="btn">에이전트로 보내기</b>를 누르세요.', 1, 'guide 4번 콘솔');
gd = swapSection(gd, 'faq', `<section class="card" id="faq">
    <h2>막히면</h2>
    <ul>
      <li><b>북마크를 눌러도 아무 일이 없어요</b> → 세일즈원(nsalesone.gshs.co.kr) 쿠폰관리 화면에서 눌렀는지 확인해 주세요. 그래도 안 되면 북마크를 오른쪽 클릭 → 수정에서 URL이 <code>javascript:</code>로 시작하는지 보고, 아니면 지우고 다시 만들어 주세요.</li>
      <li><b>에이전트 창이 안 보여요</b> → 세일즈원 화면 오른쪽([옮기기]를 눌렀다면 왼쪽)을 확인해 주세요. 새로고침했다면 북마크를 다시 누르세요.</li>
      <li><b>검증 화면과 안 이어져요</b> → 검증 화면의 <b class="btn">세일즈원 열기</b>로 연 세일즈원 창에서 북마크를 눌러야 이어져요. 세일즈원에서 먼저 띄웠다면 에이전트 창의 <b class="btn">🔎 사전검증 열기</b>를 쓰세요.</li>
      <li><b>등록 중 멈췄어요</b> → 창에 적힌 이유를 읽고, 세일즈원에서 해당 쿠폰이 저장됐는지 확인한 뒤 이어서 진행.</li>
      <li>그 밖의 문제는 창의 내용을 캡처해서 팀 담당자에게 공유해 주세요.</li>
    </ul>
  </section>`);
if (/콘솔|Console|F12|allow pasting/.test(gd.replace(/<script[\s\S]*?<\/script>/g, ''))) throw new Error('guide 본문에 콘솔 안내가 남음');
// ----- 사용자 중심 정리 (2026-11-05) -----
gd = swapSection(gd, 'a1', "<section class=\"card\" id=\"a1\">\n    <h2>자세한 사용법</h2>\n\n    <h3>언제 쓰나요</h3>\n    <p>상품 가격을 쿠폰으로 맞춰야 할 때 써요. 예) 모바일라이브 방송 쿠폰, 기간 행사 쿠폰. <b>상품코드와 원하는 고객 가격</b>(또는 할인율·할인액)만 알면 돼요.</p>\n\n    <h3>준비물</h3>\n    <ul>\n      <li>크롬 북마크바의 <b>🤖 쿠폰 에이전트</b> 북마크. 없으면 위 <a href=\"#start\">북마크 만들기</a>를 먼저 해 주세요.</li>\n      <li>엑셀에 정리한 <b>상품코드 | 가격 또는 할인</b> 두 열 (최종가 <b>89000</b>, 할인율 <b>15%</b>, 할인액 <b>-9000</b>)</li>\n      <li>쿠폰 기간 (모바일라이브면 방송 시작 시각만)</li>\n      <li>세일즈원 쿠폰등록 화면의 <b>팀구분</b> 이름 (예: 패션2팀)</li>\n    </ul>\n\n    <h3>순서</h3>\n    <ol class=\"steps\">\n      <li><b>사전검증 페이지 열기</b><br>맨 위 <b>사전검증 페이지 [열기]</b>를 누르고, 1번 칸 아래 <b class=\"btn\">세일즈원 열기</b>를 눌러요. 세일즈원 쿠폰관리 화면이 새로 열려요(로그인이 필요하면 로그인).\n        <span class=\"chk\">✔ 세일즈원이 안 열리면 주소창 오른쪽의 팝업 차단 표시를 눌러 허용해 주세요.</span></li>\n      <li><b>에이전트 패널 띄우기</b><br>방금 열린 세일즈원 화면에서 북마크바의 <b>🤖 쿠폰 에이전트</b>를 눌러요. 화면 오른쪽 아래에 에이전트 패널이 떠요. 패널이 세일즈원 버튼을 가리면 패널의 <b class=\"btn\">옮기기</b>로 왼쪽으로 옮길 수 있어요.\n        <span class=\"chk\">✔ 패널에 \"검증 화면과 연결됐어요\"가 보이면 돼요.</span></li>\n      <li><b>상품과 가격 넣기</b><br>사전검증 페이지 <b>1번 칸</b>에 엑셀의 두 열을 복사해 붙여넣어요. 숫자만 쓰면 <b>고객 최종가</b>(89000), %를 붙이면 <b>할인율</b>(15%), 앞에 -를 붙이면 <b>할인액</b>(-9000)이에요. 할인율·할인액은 판매가 기준이고, 상품마다 섞어 써도 돼요.</li>\n      <li><b>기간·브랜드·팀구분 적기</b><br>일반 행사는 시작·종료 날짜와 시간을 골라요(종료 기본값은 시작과 같은 날 23:59). 모바일라이브는 <b>모바일라이브 방송 쿠폰</b>을 켜고 방송일시와 방송 시간(분)만 넣으면, 쿠폰 기간이 방송 30분 전부터 방송 끝까지로 잡혀요. 팀구분은 세일즈원 쿠폰등록의 [팀구분]에 보이는 이름 그대로 적어요.\n        <span class=\"chk\">✔ 기간·팀구분은 이 PC에 기억돼서 다음부터는 바뀐 것만 고치면 돼요.</span></li>\n      <li><b>세일즈원 정보 불러오기</b><br><b class=\"btn\">세일즈원에서 2·3번 불러오기</b>를 눌러요. 지금 판매가와 이미 걸린 쿠폰을 세일즈원에서 가져와 2·3번 칸이 자동으로 채워져요.\n        <span class=\"chk\">✔ 할인율·할인액으로만 적었다면 이 단계는 건너뛰어도 돼요.</span></li>\n      <li><b>쿠폰 만들고 가격 확인하기</b><br><b class=\"btn\">쿠폰 만들기</b>를 누르면 아래에 <b>만들 쿠폰</b>과 <b>고객 최종가 미리보기</b>가 나와요. 만든 쿠폰은 에이전트 패널로 자동으로 들어가요.\n        <span class=\"chk\">✔ <b>고객 최종가가 원하는 가격인지 꼭 확인</b>해 주세요. <b>차단</b>이 보이면 이유를 읽고 고친 뒤 다시 눌러요.</span></li>\n      <li><b>쿠폰 등록하기</b><br>에이전트 패널에서 <b class=\"btn\">남은 쿠폰 전부 등록</b>을 눌러요. 쿠폰을 한 장씩 세일즈원에 등록·저장하고 쿠폰코드를 기록해요. 도는 동안에는 세일즈원 화면을 건드리지 마세요.\n        <span class=\"chk\">✔ 패널에 \"쿠폰 N장 중 N장 저장됨\"이 다 차면 끝이에요.</span></li>\n      <li><b>상품 연결하기</b><br>패널에서 <b class=\"btn\">상품-쿠폰 일괄 등록</b>을 눌러요. 쿠폰과 상품을 한 번에 연결해요. 중간에 요청 사유를 묻는 창이 뜨면 팀 기준에 맞게 골라 [요청]을 눌러 주세요.\n        <span class=\"chk\">✔ 패널에 \"상품-쿠폰 일괄 등록 완료\"가 보이면 끝이에요.</span></li>\n      <li><b>다음 작업 전 정리</b><br>새 쿠폰 작업을 시작하기 전에 패널의 <b class=\"btn\">쿠폰 내역 초기화</b>를 눌러 지난 내역을 지워요.</li>\n    </ol>\n    <div class=\"ok\">등록한 쿠폰은 <b>승인된 뒤에</b> 고객에게 적용돼요. 승인은 각 팀 절차대로 진행해 주세요. (에이전트는 승인 버튼을 누르지 않아요.)</div>\n\n    <h3>주의할 점</h3>\n    <ul>\n      <li>쿠폰을 등록하는 동안에는 세일즈원 화면을 클릭하거나 다른 탭으로 옮기지 마세요. 멈춰야 하면 패널의 <b class=\"btn\">닫기</b>를 눌러요.</li>\n      <li>세일즈원에 들어간 값이 계획과 다르면 저장하지 않고 멈춰요. 패널에 적힌 이유를 읽고, 직접 고쳐 저장했다면 <b class=\"btn\">직접 저장했어요 → 쿠폰코드 기록</b>으로 코드를 넣어 주세요.</li>\n      <li>저장만 실패했으면 <b class=\"btn\">저장 다시 시도</b>, 쿠폰코드가 잘못 기록됐으면 <b class=\"btn\">코드 고치기</b>를 눌러요. 한 장만 다시 하려면 쿠폰별 <b class=\"btn\">이 쿠폰만 등록</b>을 써요.</li>\n    </ul>\n\n    <h3>알아 두면 좋은 것</h3>\n    <ul>\n      <li><b>쿠폰 이름</b>은 자동으로 들어가요. 쿠폰설명 = <code>브랜드_날짜_쿠폰율/액_당사·반반</code>, 노출쿠폰명 = <code>브랜드 앱할인 쿠폰율/액</code>.</li>\n      <li><b>계산에서 빼는 쿠폰</b>: 고객쿠폰처럼 일반 판매가에 안 걸리는 쿠폰은 계산에서 빼요. 사전검증 2번 칸 아래 <b>고급 설정</b>의 <b>계산 제외 등록자</b>(고객쿠폰을 만드는 사람)와 <b>쿠폰설명에 있으면 제외</b>(기본: 마이샵·매장 전용·리모콘·VIP)를 팀에 맞게 고쳐 쓰세요.</li>\n      <li><b>더블쿠폰</b>은 세일즈원 표에 표시가 없어서, 같은 고급 설정의 <b>더블쿠폰 코드</b>에 직접 적어 주세요. 안 적으면 일반쿠폰으로 계산해요.</li>\n      <li><b>VOD 매장</b>: 채널은 기본으로 인터넷·M커머스 + VOD 매장이 들어가요. 1번 칸의 <b>VOD 전용 쿠폰</b>을 켜면 VOD 매장만, <b>VOD 매장 제외</b>를 켜면 인터넷·M커머스만 넣어요.</li>\n      <li><b>직접 넣기</b>: 불러오기가 안 되면 세일즈원 <b>상품코드 쿠폰조회</b>와 <b>상품 조회/수정</b>에서 조회한 표를 복사해 2번·3번 칸에 붙여넣어도 돼요. 상품-쿠폰 연결을 직접 하려면 패널의 <b class=\"btn\">엑셀 받기</b>로 양식 파일만 받을 수 있어요.</li>\n      <li>세일즈원에서 에이전트 패널을 먼저 띄웠다면, 패널의 <b class=\"btn\">🔎 사전검증 열기</b>로 사전검증 페이지를 열어도 똑같이 이어져요.</li>\n    </ul>\n  </section>");
gd = swapSection(gd, 'faq', "<section class=\"card\" id=\"faq\">\n    <h2>막히면</h2>\n    <ul>\n      <li><b>북마크를 눌러도 아무 일이 없어요</b> → 세일즈원(nsalesone.gshs.co.kr) 쿠폰관리 화면에서 눌렀는지 확인해 주세요. 그래도 안 되면 북마크를 오른쪽 클릭 → 수정에서 URL이 <code>javascript:</code>로 시작하는지 보고, 아니면 지우고 다시 만들어 주세요.</li>\n      <li><b>에이전트 패널이 안 보여요</b> → 세일즈원 화면 오른쪽 아래([옮기기]를 눌렀다면 왼쪽)를 확인해 주세요. 세일즈원을 새로고침했다면 북마크를 다시 누르면 떠요. 등록 내역은 그대로 남아 있어요.</li>\n      <li><b>사전검증 페이지와 안 이어져요</b> → 사전검증 페이지의 <b class=\"btn\">세일즈원 열기</b>로 연 세일즈원 화면에서 북마크를 눌러야 이어져요. 이어진 뒤 사전검증 페이지 ④ 카드의 <b class=\"btn\">에이전트로 보내기</b>를 누르면 쿠폰이 패널로 들어가요.</li>\n      <li><b>등록 중에 멈췄어요</b> → 패널에 적힌 이유를 읽고, 세일즈원에서 그 쿠폰이 저장됐는지 확인한 뒤 위 <a href=\"#a1\">주의할 점</a>대로 이어서 해 주세요.</li>\n      <li>그 밖의 문제는 패널 화면을 캡처해서 팀 담당자에게 공유해 주세요.</li>\n    </ul>\n  </section>");
gd = rep(gd, '<a href="#a1">쿠폰 에이전트</a>\n', '<a href="#a1">자세한 사용법</a>\n', 1, 'guide nav 자세한');
gd = rep(gd, '단계별 자세한 설명은 <a href="#a1">쿠폰 에이전트</a>에 있어요.', '단계별 자세한 설명은 <a href="#a1">자세한 사용법</a>에 있어요.', 1, 'guide 한눈에 링크');
gd = rep(gd, '따로 설치하거나 코드를 붙여넣을 필요가 없어요.', '이 북마크를 누르면 세일즈원 화면에 <b>에이전트 패널</b>이 떠요. 따로 설치하거나 코드를 붙여넣을 필요가 없어요.', 1, 'guide 북마크=패널');
gd = rep(gd, '<button class="copy" data-code="bookmarkCode">🤖 북마크 코드 복사</button>를 누릅니다.</li>', '<button class="copy" data-code="bookmarkCode">🤖 북마크 코드 복사</button>를 눌러요.</li>', 1, 'guide 말투1');
gd = rep(gd, '<li>북마크바 빈 곳에서 오른쪽 클릭 → <b>페이지 추가</b>.</li>', '<li>북마크바 빈 곳에서 오른쪽 클릭 → <b>페이지 추가</b>를 눌러요.</li>', 1, 'guide 말투2');
gd = rep(gd, '<b>Ctrl</b>+<b>V</b> → <b>저장</b>.</li>'.replace(/<b>(Ctrl|V)<\/b>/g, '<kbd>$1</kbd>'), '<kbd>Ctrl</kbd>+<kbd>V</kbd> → <b>저장</b>을 눌러요.</li>', 1, 'guide 말투3');
gd = rep(gd, '<b>새로고침하면 에이전트 창이 사라져요.</b>', '<b>새로고침하면 에이전트 패널이 사라져요.</b>', 1, 'guide 패널 용어');
gd = rep(gd, '</style>', '.steps>li{margin:10px 0}.chk{display:block;margin-top:4px;font-size:13.5px;color:var(--sub)}.chk b{color:var(--ink)}\n</style>', 1, 'guide 확인 스타일');
{ const body = gd.slice(gd.indexOf('<main>'), gd.indexOf('</main>'));
  if (/등록하는 사람|에이전트 창|검증 화면[^과]|누릅니다|지웁니다/.test(body.replace(/<script[\s\S]*?<\/script>/g, ''))) throw new Error('옛 용어·말투가 남음: ' + body.match(/등록하는 사람|에이전트 창|검증 화면[^과]|누릅니다|지웁니다/)[0]); }
// 상단 링크 카드에서 설명서 카드 빼기 (이 화면이 설명서라서)
{ const a = gd.indexOf('<div class="link"><span class="link-i">📖</span>'); if (a < 0) throw new Error('설명서 카드 없음');
  const b = gd.indexOf('</div>', a) + '</div>'.length; const s0 = gd.lastIndexOf('\n', a);
  gd = gd.slice(0, s0) + gd.slice(b); }
gd = gd.replace(/<title>([^<]*)<\/title>/, (m, t) => `<title>${t} (범용)</title>`);
fs.writeFileSync(path.join(OUT, 'guide.html'), gd);

// ---------- 점검 ----------
for (const f of ['agent.txt', 'index.html', 'guide.html']) {
  const t = fs.readFileSync(path.join(OUT, f), 'utf8');
  const hits = ['패션1팀', '김지영', '엔니튜드는', 'handleContribDialog });', '공헌이익 승인요청: ', 'approve-', 'guide-share', 'PLAN.mode === '].filter((k) => t.includes(k));
  const orig = t.split(BASE).length - 1, gen = t.split(GBASE).length - 1;
  console.log(f, t.length, 'left:', hits.join(',') || '-', 'origURL:', orig - gen, 'generalURL:', gen);
}
