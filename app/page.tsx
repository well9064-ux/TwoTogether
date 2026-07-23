"use client";

import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  age: number;
  job: string;
  intro: string;
  interests: string[];
  avatar: string;
  color: string;
  team: "A" | "B";
};

const players: Player[] = [
  { id: "a1", name: "민준", age: 29, job: "서비스 기획자", intro: "좋은 카페와 느긋한 산책을 좋아해요.", interests: ["커피", "여행"], avatar: "민", color: "#7456f1", team: "A" },
  { id: "a2", name: "도윤", age: 31, job: "건축 디자이너", intro: "주말엔 요리하고 사진을 찍습니다.", interests: ["요리", "사진"], avatar: "도", color: "#3178e0", team: "A" },
  { id: "a3", name: "현우", age: 28, job: "마케터", intro: "같이 웃을 수 있는 사람이 좋아요.", interests: ["공연", "러닝"], avatar: "현", color: "#26a77b", team: "A" },
  { id: "b1", name: "서연", age: 28, job: "콘텐츠 에디터", intro: "새로운 장소와 다정한 대화를 좋아해요.", interests: ["전시", "맛집"], avatar: "서", color: "#ed5f89", team: "B" },
  { id: "b2", name: "지우", age: 30, job: "제품 디자이너", intro: "작은 일상도 재미있게 보내는 편이에요.", interests: ["영화", "반려동물"], avatar: "지", color: "#e67a45", team: "B" },
  { id: "b3", name: "하린", age: 27, job: "연구원", intro: "계획 없는 여행과 보드게임을 즐겨요.", interests: ["여행", "게임"], avatar: "하", color: "#bd57c7", team: "B" },
];

const initialVotes: Record<string, string> = {
  a1: "b2", a2: "b1", a3: "b3", b1: "a2", b2: "a3", b3: "a3",
};

const stages = ["첫인상", "취향 퀴즈", "상황 궁합", "최종 선택"];

export default function Home() {
  const [screen, setScreen] = useState<"landing" | "game" | "result">("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>(initialVotes);

  const current = players[currentIndex];
  const candidates = players.filter((player) => player.team !== current.team);
  const mutualMatches = useMemo(
    () =>
      players
        .filter((player) => player.team === "A")
        .flatMap((player) => {
          const targetId = votes[player.id];
          const target = players.find((item) => item.id === targetId);
          return target && votes[target.id] === player.id ? [[player, target] as const] : [];
        }),
    [votes],
  );

  const startGame = () => {
    setCurrentIndex(0);
    setVotes(initialVotes);
    setScreen("game");
  };

  const confirmChoice = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      setScreen("result");
    }
  };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("landing")} aria-label="처음 화면으로">
          <span className="brandMark">♥</span>
          <span>HEART ROUND</span>
        </button>
        <span className="prototypeBadge">PRIVATE BETA · 6 PLAYERS</span>
      </header>

      {screen === "landing" && (
        <section className="landing">
          <div className="heroCopy">
            <p className="eyebrow">어색함은 게임에게 맡겨요</p>
            <h1>처음 만난 우리,<br /><em>얼마나 잘 맞을까?</em></h1>
            <p className="heroDescription">
              6명이 함께하는 30분간의 소셜 게임. 첫인상부터 취향, 가치관,
              팀워크까지 자연스럽게 알아가세요.
            </p>
            <div className="heroActions">
              <button className="primaryButton" onClick={startGame}>데모 시작하기 <span>→</span></button>
              <span className="sessionInfo"><b>약 3분</b><small>첫인상 라운드 데모</small></span>
            </div>
          </div>

          <div className="orbit" aria-label="참가자 6명">
            <div className="orbitCore"><span>♥</span><b>6</b><small>PLAYERS</small></div>
            {players.map((player, index) => (
              <div className={`orbitAvatar avatar${index + 1}`} key={player.id} style={{ "--avatar-color": player.color } as React.CSSProperties}>
                {player.avatar}
                <span>{player.name}</span>
              </div>
            ))}
          </div>

          <div className="stageStrip">
            {stages.map((stage, index) => (
              <div className="stageItem" key={stage}>
                <span>0{index + 1}</span>
                <b>{stage}</b>
                {index < stages.length - 1 && <i>—</i>}
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="gameScreen">
          <div className="roundHeading">
            <div><p>ROUND 01</p><h2>첫인상 시그널</h2></div>
            <div className="progressText"><b>{currentIndex + 1}</b> / {players.length}</div>
          </div>
          <div className="progressTrack"><span style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }} /></div>
          <div className="playerTurn">
            <span style={{ background: current.color }}>{current.avatar}</span>
            <p><b>{current.name}</b>님의 선택입니다<small>가장 대화해 보고 싶은 한 사람을 골라주세요</small></p>
          </div>

          <div className="profileGrid">
            {candidates.map((candidate) => {
              const selected = votes[current.id] === candidate.id;
              return (
                <button
                  key={candidate.id}
                  className={`profileCard ${selected ? "selected" : ""}`}
                  onClick={() => setVotes((prev) => ({ ...prev, [current.id]: candidate.id }))}
                  aria-pressed={selected}
                >
                  <div className="portrait" style={{ background: `linear-gradient(145deg, ${candidate.color}, #181526)` }}>
                    <span>{candidate.avatar}</span>
                    {selected && <i>♥ MY SIGNAL</i>}
                  </div>
                  <div className="profileBody">
                    <p><b>{candidate.name}</b><span>{candidate.age}</span></p>
                    <small>{candidate.job}</small>
                    <blockquote>“{candidate.intro}”</blockquote>
                    <div>{candidate.interests.map((interest) => <em key={interest}>#{interest}</em>)}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="primaryButton confirmButton" disabled={!votes[current.id]} onClick={confirmChoice}>
            {currentIndex === players.length - 1 ? "시그널 공개하기" : "이 선택으로 결정"} <span>→</span>
          </button>
        </section>
      )}

      {screen === "result" && (
        <section className="resultScreen">
          <p className="eyebrow">ROUND 01 · RESULT</p>
          <h2>서로의 마음이<br /><em>이어졌어요</em></h2>
          <div className="matchCount"><b>{mutualMatches.length}</b><span>개의 상호 시그널</span></div>
          <div className="matchList">
            {mutualMatches.length ? mutualMatches.map(([left, right]) => (
              <div className="matchCard" key={`${left.id}-${right.id}`}>
                <div><span style={{ background: left.color }}>{left.avatar}</span><b>{left.name}</b></div>
                <i>♥</i>
                <div><span style={{ background: right.color }}>{right.avatar}</span><b>{right.name}</b></div>
                <small>다음 라운드 첫 파트너</small>
              </div>
            )) : <p className="emptyMatch">아직 서로 연결된 시그널이 없어요.<br />다음 라운드에서 새로운 기회가 찾아옵니다.</p>}
          </div>
          <div className="resultActions">
            <button className="secondaryButton" onClick={startGame}>다시 선택하기</button>
            <button className="primaryButton" onClick={() => alert("다음 개발 단계에서 취향 퀴즈가 열립니다!")}>취향 퀴즈로 <span>→</span></button>
          </div>
          <p className="privacyNote">모든 선택은 결과 공개 전까지 다른 참가자에게 보이지 않습니다.</p>
        </section>
      )}
    </main>
  );
}
