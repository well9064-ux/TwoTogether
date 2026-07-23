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
