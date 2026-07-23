import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("접근성에 필요한 문서 구조와 대체 입력을 제공한다", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(layout, /<html lang="ko">/);
  assert.match(page, /href="#main-content"/);
  assert.match(page, /id="main-content"/);
  assert.match(page, /role="progressbar"/);
  assert.match(page, /aria-valuenow=/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /aria-describedby="drawing-help"/);
  assert.match(page, /<label htmlFor="text-hint">/);
  assert.match(page, /<textarea id="text-hint"/);
  assert.match(page, /id="drawer-answer"/);
  assert.match(page, /const \[drawerAnswer, setDrawerAnswer\]/);
  assert.match(page, /const \[choiceOptions, setChoiceOptions\]/);
  assert.match(page, /question\.suggestions/);
  assert.match(page, /const drawerPlayer = demoCouple\[quizIndex % 2\]/);
  assert.match(page, /const guesserPlayer = demoCouple\[\(quizIndex \+ 1\) % 2\]/);
  assert.match(page, /Math\.floor\(quizIndex \/ 2\) \+ 1/);
  assert.match(page, /Math\.round\(\(score \/ quizQuestions\.length\) \* 100\)/);
  assert.match(page, /const burgerOrders/);
  assert.match(page, /"burger-intro" \| "burger-play" \| "burger-result"/);
  assert.match(page, /screen\.startsWith\("burger-"\)/);
  assert.match(page, /title: "달콤한 주방"/);
  assert.match(page, /setBurgerTime\(\(time\) =>/);
  assert.match(page, /aria-label="현재 쌓은 햄버거"/);
  assert.match(page, /type KitchenOrder/);
  assert.match(page, /const sideInfo:/);
  assert.match(page, /setBurgerRoleIndex\(Math\.random\(\) < 0\.5 \? 0 : 1\)/);
  assert.match(page, /aria-label="대기 중인 메뉴판"/);
  assert.match(page, /role="status"><span>✓<\/span><b>주문 통과!/);
  assert.match(page, /currentOrder\.sides\.includes\(side\)/);
  assert.match(page, /\| "final-result"/);
  assert.match(page, /title: "우리가 주인공"/);
  assert.match(page, /musicRound === "roundFive"/);
  assert.match(page, /"sawtooth"/);
  assert.match(page, /const medalInfo =/);
  assert.match(page, /🥇/);
  assert.match(page, /🥈/);
  assert.match(page, /🥉/);
  assert.match(page, /"final-choice-first"/);
  assert.match(page, /"final-choice-second"/);
  assert.match(page, /"final-reveal"/);
  assert.match(page, /"private-chat"/);
  assert.match(page, /title: "둘만의 고요한 밤"/);
  assert.match(page, /aria-label="대화 내용"/);
  assert.match(page, /htmlFor="chat-message"/);
  assert.match(page, /데모 메시지는 서버로 전송되지 않으며/);
  assert.match(page, /const \[chatSeconds, setChatSeconds\] = useState\(3600\)/);
  assert.match(page, /Math\.max\(0, seconds - 1\)/);
  assert.match(page, /대화 종료/);
  assert.match(page, /const \[friendStatus, setFriendStatus\]/);
  assert.match(page, /500 마일리지로 1시간 대화/);
  assert.match(page, /setMileageBalance\(\(balance\) => balance - 500\)/);
  assert.match(page, /aria-label=\{`내 마일리지 \$\{mileageBalance\}`\}/);
  assert.match(page, /결제 정책 준비 중/);
  assert.match(page, /const finalRanking =/);
  assert.match(page, /aria-label="최종 커플 순위"/);
  assert.match(page, /각자 <b>\{mileage\} 마일리지/);
  assert.match(page, /최종 결과 보기/);
  assert.match(page, /disabled=\{!drawerAnswer\.trim\(\)\}/);
  assert.match(page, /disabled=\{!textHint\.trim\(\)\}/);
  assert.doesNotMatch(page, /question\.answer/);
  assert.match(page, /canvas\.toDataURL\("image\/png"\)/);
  assert.match(page, /src=\{drawingImage\}/);
  assert.match(page, /aria-pressed=\{musicStarted && !isMuted\}/);
  assert.match(page, /setIsMuted/);
  assert.match(page, /const musicThemes:/);
  assert.match(page, /title: "첫눈에"/);
  assert.match(page, /title: "우리의 대화"/);
  assert.match(page, /title: "마음의 온도"/);
  assert.match(page, /const compatibilityQuestions/);
  assert.match(page, /aria-label="상황 궁합 진행률"/);
  assert.match(page, /첫 번째 사람의 답은 안전하게 숨겨졌어요/);
  assert.match(page, /playVoice\(melodyNote \* 2/);
  assert.match(page, /playVoice\(chord\[0\] \/ 2/);
  assert.match(page, /aria-label="볼륨 줄이기"/);
  assert.match(page, /aria-label="볼륨 키우기"/);
  assert.match(page, /Math\.max\(10, level - 10\)/);
  assert.match(page, /Math\.min\(100, level \+ 10\)/);
  assert.match(page, /role="status"/);
  assert.match(page, /둘만의 다음 장면으로 걸어가는 중/);
  assert.match(page, /aria-busy=\{isTransitioning\}/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /forced-colors:\s*active/);
});

test("지원 브라우저 범위를 명시한다", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.deepEqual(packageJson.browserslist, [
    "last 2 Chrome versions",
    "last 2 Edge versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "not dead",
  ]);
});
