import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readProduct = () => Promise.all([
  readFile(new URL("app/page.tsx", root), "utf8"),
  readFile(new URL("app/globals.css", root), "utf8"),
]);

test("회원가입, 프로필, 로비와 방 생성 요구사항을 유지한다", async () => {
  const [page] = await readProduct();

  assert.match(page, /useState\(1000\)/);
  assert.match(page, /가입을 마치면 시작 마일리지 1,000을 드리며/);
  assert.match(page, /profilePhotos\.length \+ files\.length > 5/);
  assert.match(page, /aria-pressed=\{index === primaryProfilePhotoIndex\}/);
  assert.match(page, /filteredLobbyRooms\.slice/);
  assert.match(page, /게임방 목록 페이지/);
  assert.match(page, /role="radiogroup" aria-label="방 테마"/);
  assert.match(page, /남녀 비율은 언제나 1:1/);
  assert.match(page, /방을 만들려면 200 마일리지가 필요해요/);
  assert.match(page, /setMileageBalance\(\(balance\) => balance - 200\)/);
  assert.match(page, /200 마일리지로 방 만들기/);
});

test("대기방의 소통, 프로필 열람과 안전 기능을 유지한다", async () => {
  const [page, css] = await readProduct();

  assert.match(page, /남성 참가자/);
  assert.match(page, /여성 참가자/);
  assert.match(page, /const waitingReactions =/);
  assert.match(page, /👋/);
  assert.match(page, /aria-pressed=\{likedProfiles\.includes\(person\.id\)\}/);
  assert.match(page, /강퇴 투표/);
  assert.match(page, /참가자별 강퇴 투표 현황/);
  assert.match(page, /50 마일리지로 열기/);
  assert.match(page, /setMileageBalance\(\(balance\) => balance - 50\)/);
  assert.match(page, /unlockedPhotoKeys/);
  assert.match(page, /\[0, 1, 2, 3, 4\]\.map/);
  assert.match(page, /`\$\{profileId\}:\$\{index\}`/);
  assert.match(css, /\.profileReactionBubble\s*\{[^}]*right:\s*-12px/);
  assert.match(css, /border-radius:\s*50% 50% 50% 8px/);
  assert.doesNotMatch(css, /\.profileReactionBubble::after/);
});

test("전체 게임 라운드와 결과 흐름을 유지한다", async () => {
  const [page] = await readProduct();

  assert.match(page, /첫인상 시그널/);
  assert.match(page, /그림으로 취향 맞히기/);
  assert.match(page, /const drawerPlayer = demoCouple\[quizIndex % 2\]/);
  assert.match(page, /canvas\.toDataURL\("image\/png"\)/);
  assert.match(page, /src=\{drawingImage\}/);
  assert.match(page, /상황 궁합/);
  assert.match(page, /const compatibilityQuestions/);
  assert.match(page, /버거 조립/);
  assert.match(page, /사이드 준비/);
  assert.match(page, /주문 통과!/);
  assert.match(page, /const medalInfo =/);
  assert.match(page, /🥇/);
  assert.match(page, /🥈/);
  assert.match(page, /🥉/);
  assert.match(page, /\[300, 200, 150\]/);
  assert.match(page, /const firstGameBonus = 200/);
  assert.match(page, /musicRound === "roundFive"/);
  assert.match(page, /musicRound === "roundSix"/);
});

test("친구, 1시간 채팅과 마일리지 정책을 유지한다", async () => {
  const [page] = await readProduct();

  assert.match(page, /useState\(3600\)/);
  assert.match(page, /id="chat-image"/);
  assert.match(page, /대화를 종료했습니다/);
  assert.match(page, /채팅방 나가기/);
  assert.match(page, /로비로 돌아가기/);
  assert.match(page, /300 마일리지로 대화 신청/);
  assert.match(page, /상대가 대화를 거절해 신청 비용의 80%인 240 마일리지가 반환됐어요/);
  assert.match(page, /채팅하기를 원합니다/);
  assert.match(page, /참여하시겠습니까/);
});

test("웹 접근성과 브라우저 호환성 장치를 유지한다", async () => {
  const [page, css] = await readProduct();
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

  assert.match(page, /href="#main-content"/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /aria-busy=\{isTransitioning\}/);
  assert.match(page, /aria-label="볼륨 줄이기"/);
  assert.match(page, /aria-label="볼륨 키우기"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /forced-colors:\s*active/);
  assert.ok(packageJson.browserslist.includes("last 2 Safari versions"));
});
