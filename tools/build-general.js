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
ix = rep(ix, "'자동 복사가 막혀 있어요. [콘솔용 코드 복사] 방법을 써 주세요.'", "'자동 복사가 막혀 있어요. 설명서의 [🤖 쿠폰 에이전트] 버튼을 북마크바로 끌어다 놓아 만들어 주세요.'", 1, 'index 복사 실패');
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
gd = swapSection(gd, 'start', `<section class="card" id="start">
    <h2>처음 한 번만: 🤖 쿠폰 에이전트 북마크 만들기</h2>
    <p>쿠폰 에이전트는 크롬 <b>북마크</b>로 실행해요. 따로 설치하거나 코드를 붙여넣을 필요가 없어요. 북마크는 누를 때마다 <b>최신 버전</b>을 받아 오니, 한 번 만들면 다시 만들 필요가 없어요.</p>
    <p>먼저 크롬 북마크바가 보이게 해 주세요. 안 보이면 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>.</p>
    <h3>방법 1 · 끌어다 놓기 (가장 쉬워요)</h3>
    <p>아래 버튼을 마우스로 잡아 <b>북마크바로 끌어다 놓으면</b> 끝이에요. (이 화면에서 누르면 실행되지 않고 안내만 나와요.)</p>
    <p style="margin:12px 0"><a id="bmdrag" class="bmdrag" href="#" draggable="true">🤖 쿠폰 에이전트</a></p>
    <h3>방법 2 · 직접 추가</h3>
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
      <li><b>끌어다 놓기가 안 돼요</b> → 방법 2(코드 복사 → 페이지 추가)로 만들어 주세요.</li>
      <li><b>에이전트 창이 안 보여요</b> → 세일즈원 화면 오른쪽([옮기기]를 눌렀다면 왼쪽)을 확인해 주세요. 새로고침했다면 북마크를 다시 누르세요.</li>
      <li><b>검증 화면과 안 이어져요</b> → 검증 화면의 <b class="btn">세일즈원 열기</b>로 연 세일즈원 창에서 북마크를 눌러야 이어져요. 세일즈원에서 먼저 띄웠다면 에이전트 창의 <b class="btn">🔎 사전검증 열기</b>를 쓰세요.</li>
      <li><b>등록 중 멈췄어요</b> → 창에 적힌 이유를 읽고, 세일즈원에서 해당 쿠폰이 저장됐는지 확인한 뒤 이어서 진행.</li>
      <li>그 밖의 문제는 창의 내용을 캡처해서 팀 담당자에게 공유해 주세요.</li>
    </ul>
  </section>`);
// 끌어다 놓기 버튼: 북마크 코드를 주소로 넣고, 이 화면에서 누르면 실행 대신 안내
gd = rep(gd, "document.querySelectorAll('button.copy').forEach((b) => {", `(() => { const a = document.getElementById('bmdrag'); if (!a) return;
  a.href = JSON.parse(document.getElementById('bookmarkCode').textContent);
  a.addEventListener('click', (e) => { e.preventDefault(); const t = a.textContent; a.textContent = '여기서 누르지 말고 북마크바로 끌어다 놓아 주세요'; setTimeout(() => { a.textContent = t; }, 2500); }); })();
document.querySelectorAll('button.copy').forEach((b) => {`, 1, 'guide 끌어놓기 스크립트');
gd = rep(gd, '</style>', '.bmdrag{display:inline-block;padding:10px 18px;border-radius:999px;background:#1f6feb;color:#fff;font-weight:700;text-decoration:none;cursor:grab;box-shadow:0 1px 3px rgba(0,0,0,.2)}.bmdrag:active{cursor:grabbing}\n</style>', 1, 'guide 끌어놓기 스타일');
if (/콘솔|Console|F12|allow pasting/.test(gd.replace(/<script[\s\S]*?<\/script>/g, ''))) throw new Error('guide 본문에 콘솔 안내가 남음');
gd = gd.replace(/<title>([^<]*)<\/title>/, (m, t) => `<title>${t} (범용)</title>`);
fs.writeFileSync(path.join(OUT, 'guide.html'), gd);

// ---------- 점검 ----------
for (const f of ['agent.txt', 'index.html', 'guide.html']) {
  const t = fs.readFileSync(path.join(OUT, f), 'utf8');
  const hits = ['패션1팀', '김지영', '엔니튜드는', 'handleContribDialog });', '공헌이익 승인요청: ', 'approve-', 'guide-share', 'PLAN.mode === '].filter((k) => t.includes(k));
  const orig = t.split(BASE).length - 1, gen = t.split(GBASE).length - 1;
  console.log(f, t.length, 'left:', hits.join(',') || '-', 'origURL:', orig - gen, 'generalURL:', gen);
}
