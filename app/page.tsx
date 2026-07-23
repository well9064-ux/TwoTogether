"use client";

import { useMemo, useRef, useState } from "react";

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

type Screen = "landing" | "signal" | "match-result" | "quiz-intro" | "draw" | "guess" | "quiz-result";

const players: Player[] = [
  { id: "a1", name: "민준", age: 29, job: "서비스 기획자", intro: "좋은 카페와 느긋한 산책을 좋아해요.", interests: ["커피", "여행"], avatar: "민", color: "#7456f1", team: "A" },
  { id: "a2", name: "도윤", age: 31, job: "건축 디자이너", intro: "주말엔 요리하고 사진을 찍습니다.", interests: ["요리", "사진"], avatar: "도", color: "#3178e0", team: "A" },
  { id: "a3", name: "현우", age: 28, job: "마케터", intro: "같이 웃을 수 있는 사람이 좋아요.", interests: ["공연", "러닝"], avatar: "현", color: "#26a77b", team: "A" },
  { id: "b1", name: "서연", age: 28, job: "콘텐츠 에디터", intro: "새로운 장소와 다정한 대화를 좋아해요.", interests: ["전시", "맛집"], avatar: "서", color: "#ed5f89", team: "B" },
  { id: "b2", name: "지우", age: 30, job: "제품 디자이너", intro: "작은 일상도 재미있게 보내는 편이에요.", interests: ["영화", "반려동물"], avatar: "지", color: "#e67a45", team: "B" },
  { id: "b3", name: "하린", age: 27, job: "연구원", intro: "계획 없는 여행과 보드게임을 즐겨요.", interests: ["여행", "게임"], avatar: "하", color: "#bd57c7", team: "B" },
];

const quizQuestions = [
  { prompt: "내가 가장 좋아하는 음식은?", answer: "떡볶이", options: ["떡볶이", "초밥", "파스타", "삼겹살"] },
  { prompt: "함께 가고 싶은 여행지는?", answer: "제주도", options: ["제주도", "파리", "뉴욕", "삿포로"] },
  { prompt: "쉬는 날 가장 하고 싶은 것은?", answer: "늦잠", options: ["늦잠", "등산", "쇼핑", "드라이브"] },
  { prompt: "내가 좋아하는 계절은?", answer: "가을", options: ["봄", "여름", "가을", "겨울"] },
  { prompt: "첫 데이트로 가장 좋은 장소는?", answer: "놀이공원", options: ["영화관", "놀이공원", "미술관", "한강"] },
];

const initialVotes: Record<string, string> = {
  a1: "b2", a2: "b1", a3: "b3", b1: "a2", b2: "a3", b3: "a3",
};

const stages = ["첫인상", "취향 퀴즈", "상황 궁합", "최종 선택"];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>(initialVotes);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [textHint, setTextHint] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const current = players[currentIndex];
  const candidates = players.filter((player) => player.team !== current.team);
  const mutualMatches = useMemo(
    () => players
      .filter((player) => player.team === "A")
      .flatMap((player) => {
        const target = players.find((item) => item.id === votes[player.id]);
        return target && votes[target.id] === player.id ? [[player, target] as const] : [];
      }),
    [votes],
  );
  const demoCouple = mutualMatches[0] ?? [players[1], players[3]];
  const question = quizQuestions[quizIndex];

  const resetAll = () => {
    setCurrentIndex(0);
    setVotes(initialVotes);
    setQuizIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer("");
    setTextHint("");
    setScreen("signal");
  };

  const confirmChoice = () => {
    if (currentIndex < players.length - 1) setCurrentIndex((index) => index + 1);
    else setScreen("match-result");
  };

  const prepareCanvas = () => {
    setScreen("draw");
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(2, 2);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 5;
        context.strokeStyle = "#231f2d";
        context.fillStyle = "#fffdf8";
        context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    });
  };

  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startLine = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    const point = position(event);
    context?.beginPath();
    context?.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const drawLine = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = event.currentTarget.getContext("2d");
    const point = position(event);
    context?.lineTo(point.x, point.y);
    context?.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  };

  const submitGuess = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === question.answer;
    setAnswers((previous) => [...previous, correct]);
    if (correct) setScore((previous) => previous + 1);
      setSelectedAnswer("");
      setTextHint("");
    if (quizIndex === quizQuestions.length - 1) setScreen("quiz-result");
    else {
      setQuizIndex((index) => index + 1);
      setScreen("quiz-intro");
    }
  };

  return (
    <>
      <a className="skipLink" href="#main-content">게임 본문으로 건너뛰기</a>
      <main id="main-content">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("landing")} aria-label="처음 화면으로">
          <span className="brandMark">♥</span><span>HEART ROUND</span>
        </button>
        <span className="prototypeBadge">PRIVATE BETA · 6 PLAYERS</span>
      </header>

      {screen === "landing" && (
        <section className="landing">
          <div className="heroCopy">
            <p className="eyebrow">어색함은 게임에게 맡겨요</p>
            <h1>처음 만난 우리,<br /><em>얼마나 잘 맞을까?</em></h1>
            <p className="heroDescription">6명이 함께하는 소셜 게임. 첫인상부터 취향과 가치관까지 자연스럽게 알아가세요.</p>
            <div className="heroActions">
              <button className="primaryButton" onClick={resetAll}>데모 시작하기 <span>→</span></button>
              <span className="sessionInfo"><b>2개 라운드</b><small>첫인상 + 취향 퀴즈</small></span>
            </div>
          </div>
          <div className="orbit" aria-label="참가자 6명">
            <div className="orbitCore"><span>♥</span><b>6</b><small>PLAYERS</small></div>
            {players.map((player, index) => (
              <div className={`orbitAvatar avatar${index + 1}`} key={player.id} style={{ "--avatar-color": player.color } as React.CSSProperties}>
                {player.avatar}<span>{player.name}</span>
              </div>
            ))}
          </div>
          <div className="stageStrip">
            {stages.map((stage, index) => (
              <div className={`stageItem ${index < 2 ? "available" : ""}`} key={stage} aria-current={index === 0 ? "step" : undefined}>
                <span>0{index + 1}</span><b>{stage}</b>{index < stages.length - 1 && <i>—</i>}
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "signal" && (
        <section className="gameScreen">
          <div className="roundHeading">
            <div><p>ROUND 01</p><h2>첫인상 시그널</h2></div>
            <div className="progressText"><b>{currentIndex + 1}</b> / {players.length}</div>
          </div>
          <div className="progressTrack" role="progressbar" aria-label="첫인상 선택 진행률" aria-valuemin={1} aria-valuemax={players.length} aria-valuenow={currentIndex + 1}>
            <span style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }} />
          </div>
          <div className="playerTurn">
            <span style={{ background: current.color }}>{current.avatar}</span>
            <p><b>{current.name}</b>님의 선택입니다<small>가장 대화해 보고 싶은 한 사람을 골라주세요</small></p>
          </div>
          <div className="profileGrid">
            {candidates.map((candidate) => {
              const selected = votes[current.id] === candidate.id;
              return (
                <button key={candidate.id} className={`profileCard ${selected ? "selected" : ""}`}
                  onClick={() => setVotes((previous) => ({ ...previous, [current.id]: candidate.id }))} aria-pressed={selected}>
                  <div className="portrait" style={{ background: `linear-gradient(145deg, ${candidate.color}, #181526)` }}>
                    <span>{candidate.avatar}</span>{selected && <i>♥ MY SIGNAL</i>}
                  </div>
                  <div className="profileBody">
                    <p><b>{candidate.name}</b><span>{candidate.age}</span></p><small>{candidate.job}</small>
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

      {screen === "match-result" && (
        <section className="resultScreen">
          <p className="eyebrow">ROUND 01 · RESULT</p>
          <h2>서로의 마음이<br /><em>이어졌어요</em></h2>
          <div className="matchCount"><b>{mutualMatches.length}</b><span>개의 상호 시그널</span></div>
          <div className="matchList">
            {mutualMatches.length ? mutualMatches.map(([left, right]) => (
              <div className="matchCard" key={`${left.id}-${right.id}`}>
                <div><span style={{ background: left.color }}>{left.avatar}</span><b>{left.name}</b></div><i>♥</i>
                <div><span style={{ background: right.color }}>{right.avatar}</span><b>{right.name}</b></div>
                <small>취향 퀴즈 첫 번째 커플</small>
              </div>
            )) : <p className="emptyMatch">상호 선택이 없어 데모 커플이 자동 배정됩니다.</p>}
          </div>
          <div className="resultActions">
            <button className="secondaryButton" onClick={resetAll}>다시 선택하기</button>
            <button className="primaryButton" onClick={() => setScreen("quiz-intro")}>취향 퀴즈로 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "quiz-intro" && (
        <section className="quizScreen">
          <div className="roundHeading">
            <div><p>ROUND 02 · QUESTION {quizIndex + 1}</p><h2>그림으로 취향 맞히기</h2></div>
            <div className="scorePill">현재 <b>{score}점</b></div>
          </div>
          <div className="quizCouple">
            <div><span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><b>{demoCouple[0].name}</b><small>그리는 사람</small></div>
            <i>♥</i>
            <div><span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span><b>{demoCouple[1].name}</b><small>맞히는 사람</small></div>
          </div>
          <div className="questionReveal">
            <small>그리는 사람만 확인하세요</small>
            <h3>{question.prompt}</h3>
            <p>정답 <b>{question.answer}</b></p>
          </div>
          <p className="passDevice">정답을 확인했다면 상대방에게 화면이 보이지 않게 하고 그림을 그려주세요.</p>
          <button className="primaryButton centerButton" onClick={prepareCanvas}>그림 그리기 시작 <span>→</span></button>
        </section>
      )}

      {screen === "draw" && (
        <section className="quizScreen">
          <div className="roundHeading">
            <div><p>ROUND 02 · DRAW</p><h2>{question.prompt}</h2></div>
            <div className="questionNumber">{quizIndex + 1} / {quizQuestions.length}</div>
          </div>
          <div className="canvasToolbar">
            <span>검은색 펜으로 힌트를 그려주세요</span>
            <button className="secondaryButton compactButton" onClick={clearCanvas}>모두 지우기</button>
          </div>
          <canvas ref={canvasRef} className="drawCanvas" onPointerDown={startLine} onPointerMove={drawLine}
            onPointerUp={() => setIsDrawing(false)} onPointerCancel={() => setIsDrawing(false)}
            aria-label="마우스 또는 터치로 그림을 그리는 영역" aria-describedby="drawing-help">
            이 브라우저는 그림판을 지원하지 않습니다. 아래의 글 힌트 입력란을 이용해 주세요.
          </canvas>
          <div className="accessibleHint">
            <label htmlFor="text-hint">그림을 사용하기 어려우면 글로 힌트 설명하기</label>
            <p id="drawing-help">키보드나 화면 읽기 프로그램 이용자는 정답 단어를 제외한 설명을 입력할 수 있습니다.</p>
            <textarea id="text-hint" value={textHint} onChange={(event) => setTextHint(event.target.value)}
              maxLength={100} placeholder="예: 맵고 빨간색이며 분식집에서 자주 먹어요" />
            <small>{textHint.length} / 100자</small>
          </div>
          <button className="primaryButton centerButton" onClick={() => setScreen("guess")}>그림 완성 · 정답 맞히기 <span>→</span></button>
        </section>
      )}

      {screen === "guess" && (
        <section className="quizScreen">
          <div className="roundHeading">
            <div><p>ROUND 02 · GUESS</p><h2>그림이 표현한 답은?</h2></div>
            <div className="scorePill">현재 <b>{score}점</b></div>
          </div>
          <div className="guessLayout">
            <div className="drawingPreview">
              <p>파트너가 그린 그림</p>
              <canvas className="mirrorCanvas" ref={(canvas) => {
                if (!canvas || !canvasRef.current) return;
                canvas.width = canvasRef.current.width;
                canvas.height = canvasRef.current.height;
                canvas.getContext("2d")?.drawImage(canvasRef.current, 0, 0);
              }} />
              {textHint && <div className="textHintPreview"><b>글 힌트</b><p>{textHint}</p></div>}
            </div>
            <div className="answerPanel">
              <p>하나를 선택하세요</p>
              <div className="answerGrid">
                {question.options.map((option, index) => (
                  <button key={option} className={selectedAnswer === option ? "chosen" : ""}
                    onClick={() => setSelectedAnswer(option)} aria-pressed={selectedAnswer === option}>
                    <span>{index + 1}</span>{option}
                  </button>
                ))}
              </div>
              <button className="primaryButton fullButton" disabled={!selectedAnswer} onClick={submitGuess}>정답 제출하기</button>
            </div>
          </div>
        </section>
      )}

      {screen === "quiz-result" && (
        <section className="resultScreen quizFinal">
          <p className="eyebrow">ROUND 02 · COMPLETE</p>
          <h2>우리의 취향 싱크는<br /><em>{score * 20}%</em></h2>
          <div className="finalScore" aria-live="polite"><b>{score}</b><span>/ {quizQuestions.length} 정답</span></div>
          <div className="answerHistory">
            {answers.map((correct, index) => <span className={correct ? "correct" : "wrong"} key={index}>{index + 1}</span>)}
          </div>
          <p className="resultMessage">{score >= 4 ? "말하지 않아도 통하는 환상의 호흡이에요!" : score >= 2 ? "서로의 취향을 알아가는 좋은 시작이에요." : "다른 취향만큼 알아갈 이야기도 많겠네요!"}</p>
          <div className="resultActions">
            <button className="secondaryButton" onClick={() => { setQuizIndex(0); setScore(0); setAnswers([]); setScreen("quiz-intro"); }}>퀴즈 다시 하기</button>
            <button className="primaryButton" onClick={() => setScreen("landing")}>처음으로 <span>→</span></button>
          </div>
          <p className="privacyNote">실제 온라인 버전에서는 모든 커플이 동시에 플레이하고 점수 순위가 집계됩니다.</p>
        </section>
      )}
      </main>
    </>
  );
}
