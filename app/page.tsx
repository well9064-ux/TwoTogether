"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type Screen =
  | "landing" | "signal" | "match-result"
  | "quiz-intro" | "draw" | "guess" | "quiz-result"
  | "compat-intro" | "compat-first" | "compat-second" | "compat-reveal" | "compat-result";

const players: Player[] = [
  { id: "a1", name: "민준", age: 29, job: "서비스 기획자", intro: "좋은 카페와 느긋한 산책을 좋아해요.", interests: ["커피", "여행"], avatar: "민", color: "#7456f1", team: "A" },
  { id: "a2", name: "도윤", age: 31, job: "건축 디자이너", intro: "주말엔 요리하고 사진을 찍습니다.", interests: ["요리", "사진"], avatar: "도", color: "#3178e0", team: "A" },
  { id: "a3", name: "현우", age: 28, job: "마케터", intro: "같이 웃을 수 있는 사람이 좋아요.", interests: ["공연", "러닝"], avatar: "현", color: "#26a77b", team: "A" },
  { id: "b1", name: "서연", age: 28, job: "콘텐츠 에디터", intro: "새로운 장소와 다정한 대화를 좋아해요.", interests: ["전시", "맛집"], avatar: "서", color: "#ed5f89", team: "B" },
  { id: "b2", name: "지우", age: 30, job: "제품 디자이너", intro: "작은 일상도 재미있게 보내는 편이에요.", interests: ["영화", "반려동물"], avatar: "지", color: "#e67a45", team: "B" },
  { id: "b3", name: "하린", age: 27, job: "연구원", intro: "계획 없는 여행과 보드게임을 즐겨요.", interests: ["여행", "게임"], avatar: "하", color: "#bd57c7", team: "B" },
];

const quizQuestions = [
  { prompt: "내가 가장 좋아하는 음식은?", suggestions: ["떡볶이", "초밥", "파스타", "삼겹살", "치킨", "마라탕"] },
  { prompt: "함께 가고 싶은 여행지는?", suggestions: ["제주도", "파리", "뉴욕", "삿포로", "다낭", "부산"] },
  { prompt: "쉬는 날 가장 하고 싶은 것은?", suggestions: ["늦잠", "등산", "쇼핑", "드라이브", "게임", "영화 보기"] },
  { prompt: "내가 좋아하는 계절은?", suggestions: ["봄", "여름", "가을", "겨울", "장마철", "첫눈 오는 날"] },
  { prompt: "첫 데이트로 가장 좋은 장소는?", suggestions: ["영화관", "놀이공원", "미술관", "한강", "아쿠아리움", "맛집"] },
];

const compatibilityQuestions = [
  {
    title: "여행 계획이 틀어졌을 때",
    scenario: "둘이 떠난 여행에서 비행기가 지연되어 예약한 식당에 갈 수 없게 됐어요. 이때 나는?",
    options: [
      "근처 디저트 카페를 찾아 새로운 추억을 만든다",
      "상대를 먼저 위로하고 다음 일정을 차분히 다시 짠다",
      "같이 있는 게 중요하니 재미있는 이야기로 웃게 해준다",
    ],
  },
  {
    title: "연락이 뜸한 하루",
    scenario: "바쁜 하루를 보낸 연인이 밤늦게까지 연락하지 못했어요. 내가 가장 바라는 반응은?",
    options: [
      "무슨 일이 있었는지 다정하게 물어봐 준다",
      "오늘 고생했다며 편히 쉬게 해준다",
      "짧게라도 미리 알려줬으면 좋겠다고 솔직히 말한다",
    ],
  },
  {
    title: "예상치 못한 선물",
    scenario: "기념일이 아닌 평범한 날, 상대가 작은 선물을 준비했어요. 가장 기분 좋은 선물은?",
    options: [
      "내 취향을 기억하고 고른 작은 물건",
      "함께 즐길 수 있는 공연이나 체험",
      "마음이 담긴 손편지와 따뜻한 말",
    ],
  },
  {
    title: "주말 데이트 결정",
    scenario: "둘 다 일정이 없는 토요일이에요. 어떤 하루를 보내고 싶나요?",
    options: [
      "아침부터 계획을 세워 새로운 장소를 돌아본다",
      "늦잠을 자고 동네 맛집과 카페를 천천히 즐긴다",
      "각자 쉬다가 저녁에 만나 편안하게 시간을 보낸다",
    ],
  },
  {
    title: "작은 다툼이 생겼을 때",
    scenario: "사소한 오해로 분위기가 어색해졌어요. 나는 어떻게 풀고 싶나요?",
    options: [
      "감정이 가라앉도록 잠시 시간을 갖는다",
      "바로 대화하며 서로의 생각을 확인한다",
      "먼저 가볍게 분위기를 풀고 천천히 이야기한다",
    ],
  },
];

const initialVotes: Record<string, string> = {
  a1: "b2", a2: "b1", a3: "b3", b1: "a2", b2: "a3", b3: "a3",
};

const stages = ["첫인상", "취향 퀴즈", "상황 궁합", "최종 선택"];

type MusicTheme = { title: string; melody: number[]; chords: number[][]; tempo: number };

const musicThemes: Record<"roundOne" | "roundTwo" | "roundThree", MusicTheme> = {
  roundOne: {
    title: "첫눈에",
    melody: [587.33, 659.25, 739.99, 880, 830.61, 739.99, 659.25, 587.33, 554.37, 659.25, 739.99, 987.77, 880, 830.61, 739.99, 659.25],
    chords: [
      [293.66, 369.99, 440],
      [246.94, 293.66, 369.99],
      [196, 246.94, 293.66],
      [220, 277.18, 329.63],
    ],
    tempo: 325,
  },
  roundTwo: {
    title: "우리의 대화",
    melody: [659.25, 783.99, 880, 987.77, 1046.5, 987.77, 880, 783.99, 698.46, 830.61, 987.77, 1174.66, 1046.5, 987.77, 880, 783.99],
    chords: [
      [261.63, 329.63, 392],
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [196, 246.94, 293.66],
    ],
    tempo: 300,
  },
  roundThree: {
    title: "마음의 온도",
    melody: [523.25, 659.25, 783.99, 880, 783.99, 698.46, 659.25, 587.33, 493.88, 587.33, 698.46, 987.77, 880, 783.99, 698.46, 659.25],
    chords: [
      [261.63, 329.63, 392],
      [196, 246.94, 329.63],
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
    ],
    tempo: 330,
  },
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>(initialVotes);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [drawerAnswer, setDrawerAnswer] = useState("");
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [textHint, setTextHint] = useState("");
  const [drawingImage, setDrawingImage] = useState("");
  const [compatIndex, setCompatIndex] = useState(0);
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [compatScore, setCompatScore] = useState(0);
  const [compatHistory, setCompatHistory] = useState<boolean[]>([]);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

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
  const compatQuestion = compatibilityQuestions[compatIndex];
  const musicRound: keyof typeof musicThemes = screen.startsWith("compat-")
    ? "roundThree"
    : screen === "landing" || screen === "signal" || screen === "match-result"
      ? "roundOne" : "roundTwo";
  const currentTrack = musicThemes[musicRound];

  const ensureMusic = () => {
    const AudioContextClass = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    void context.resume();
    setMusicStarted(true);
    setIsMuted(false);
  };

  useEffect(() => {
    if (!musicStarted || isMuted) return;
    const context = audioContextRef.current;
    if (!context) return;
    const theme = musicThemes[musicRound];
    let index = 0;

    const playVoice = (
      frequency: number,
      start: number,
      duration: number,
      peak: number,
      type: OscillatorType,
    ) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak * (volume / 100), start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    };

    const playSparkle = () => {
      const now = context.currentTime;
      const melodyNote = theme.melody[index % theme.melody.length];

      // 짧은 벨과 한 옥타브 위의 잔향을 겹쳐 반짝이는 하프 느낌을 냅니다.
      playVoice(melodyNote, now, 0.52, 0.045, "sine");
      playVoice(melodyNote * 2, now + 0.055, 0.28, 0.012, "triangle");

      // 네 박마다 피아노 화음과 낮은 현악 베이스를 깔아 로맨틱 영화의 장면처럼 만듭니다.
      if (index % 4 === 0) {
        const chord = theme.chords[Math.floor(index / 4) % theme.chords.length];
        chord.forEach((frequency, chordIndex) => {
          playVoice(frequency, now + chordIndex * 0.025, 1.3, 0.013, "sine");
        });
        playVoice(chord[0] / 2, now, 1.45, 0.01, "triangle");
      }
      index += 1;
    };

    playSparkle();
    const timer = window.setInterval(playSparkle, theme.tempo);
    return () => window.clearInterval(timer);
  }, [musicRound, musicStarted, isMuted, volume]);

  useEffect(() => () => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    void audioContextRef.current?.close();
  }, []);

  const transitionTo = (nextScreen: Screen) => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    setIsTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setScreen(nextScreen);
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, 520);
  };

  useEffect(() => {
    if (screen !== "draw") return;
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
  }, [screen]);

  const resetAll = () => {
    setCurrentIndex(0);
    setVotes(initialVotes);
    setQuizIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer("");
    setDrawerAnswer("");
    setChoiceOptions([]);
    setTextHint("");
    setDrawingImage("");
    setCompatIndex(0);
    setFirstChoice(null);
    setSecondChoice(null);
    setCompatScore(0);
    setCompatHistory([]);
    ensureMusic();
    transitionTo("signal");
  };

  const confirmChoice = () => {
    if (currentIndex < players.length - 1) setCurrentIndex((index) => index + 1);
    else transitionTo("match-result");
  };

  const prepareCanvas = () => {
    const answer = drawerAnswer.trim();
    if (!answer) return;
    const distractors = question.suggestions
      .filter((option) => option.toLocaleLowerCase("ko") !== answer.toLocaleLowerCase("ko"))
      .slice(0, 3);
    const options = [...distractors];
    options.splice((quizIndex * 3 + answer.length) % 4, 0, answer);
    setChoiceOptions(options);
    transitionTo("draw");
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
    const correct = selectedAnswer === drawerAnswer.trim();
    setAnswers((previous) => [...previous, correct]);
    if (correct) setScore((previous) => previous + 1);
      setSelectedAnswer("");
      setDrawerAnswer("");
      setChoiceOptions([]);
      setTextHint("");
      setDrawingImage("");
      if (quizIndex === quizQuestions.length - 1) transitionTo("quiz-result");
      else {
        setQuizIndex((index) => index + 1);
        transitionTo("quiz-intro");
      }
  };

  const startCompatibility = () => {
    setCompatIndex(0);
    setFirstChoice(null);
    setSecondChoice(null);
    setCompatScore(0);
    setCompatHistory([]);
    transitionTo("compat-intro");
  };

  const submitSecondCompatibilityChoice = () => {
    if (firstChoice === null || secondChoice === null) return;
    const matched = firstChoice === secondChoice;
    setCompatHistory((history) => [...history, matched]);
    if (matched) setCompatScore((value) => value + 1);
    transitionTo("compat-reveal");
  };

  const nextCompatibilityQuestion = () => {
    if (compatIndex === compatibilityQuestions.length - 1) {
      transitionTo("compat-result");
      return;
    }
    setCompatIndex((index) => index + 1);
    setFirstChoice(null);
    setSecondChoice(null);
    transitionTo("compat-intro");
  };

  return (
    <>
      <a className="skipLink" href="#main-content">게임 본문으로 건너뛰기</a>
      <main id="main-content" aria-busy={isTransitioning}>
      <header className="topbar">
        <button className="brand" onClick={() => transitionTo("landing")} aria-label="처음 화면으로">
          <span className="brandMark">♥</span><span>HEART ROUND</span>
        </button>
        <div className="topbarActions">
          <span className="prototypeBadge">PRIVATE BETA · 6 PLAYERS</span>
          <button className="soundButton" type="button" aria-pressed={musicStarted && !isMuted}
            onClick={() => {
              if (!musicStarted) ensureMusic();
              else setIsMuted((muted) => !muted);
            }}>
            <span aria-hidden="true">{musicStarted && !isMuted ? "♪" : "♩"}</span>
            {!musicStarted ? "음악 켜기" : isMuted ? "음악 재생" : "음소거"}
          </button>
          <div className="volumeControl" role="group" aria-label="배경음 볼륨">
            <button type="button" onClick={() => setVolume((level) => Math.max(10, level - 10))}
              disabled={volume <= 10} aria-label="볼륨 줄이기">−</button>
            <span aria-live="polite" aria-label={`현재 볼륨 ${volume}%`}>{volume}%</span>
            <button type="button" onClick={() => setVolume((level) => Math.min(100, level + 10))}
              disabled={volume >= 100} aria-label="볼륨 키우기">＋</button>
          </div>
          <span className="trackName" aria-live="polite">♬ {currentTrack.title}</span>
        </div>
      </header>

      {isTransitioning && (
        <div className="loadingOverlay" role="status" aria-live="polite">
          <div className="walkingScene" aria-hidden="true">
            <span className="walker man">🚶‍♂️</span><span className="floatingHeart">♥</span><span className="walker woman">🚶‍♀️</span>
            <i className="walkingRoad" />
          </div>
          <b>둘만의 다음 장면으로 걸어가는 중…</b>
          <small>잠시만 기다려 주세요</small>
        </div>
      )}

      {screen === "landing" && (
        <section className="landing">
          <div className="heroCopy">
            <p className="eyebrow">어색함은 게임에게 맡겨요</p>
            <h1>처음 만난 우리,<br /><em>얼마나 잘 맞을까?</em></h1>
            <p className="heroDescription">6명이 함께하는 소셜 게임. 첫인상부터 취향과 가치관까지 자연스럽게 알아가세요.</p>
            <div className="heroActions">
              <button className="primaryButton" onClick={resetAll}>데모 시작하기 <span>→</span></button>
              <span className="sessionInfo"><b>3개 라운드</b><small>첫인상 + 취향 + 상황 궁합</small></span>
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
              <div className={`stageItem ${index < 3 ? "available" : ""}`} key={stage} aria-current={index === 0 ? "step" : undefined}>
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
            <button className="primaryButton" onClick={() => transitionTo("quiz-intro")}>취향 퀴즈로 <span>→</span></button>
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
            <label htmlFor="drawer-answer">나의 정답을 직접 입력하세요</label>
            <input
              id="drawer-answer"
              value={drawerAnswer}
              onChange={(event) => setDrawerAnswer(event.target.value)}
              maxLength={20}
              autoComplete="off"
              placeholder="예: 김치찌개"
            />
            <small className="inputGuide">입력한 답은 맞히는 사람에게 공개되지 않아요.</small>
          </div>
          <p className="passDevice">정답을 입력했다면 상대방에게 화면이 보이지 않게 하고 그림과 힌트를 준비해 주세요.</p>
          <button className="primaryButton centerButton" disabled={!drawerAnswer.trim()} onClick={prepareCanvas}>그림 그리기 시작 <span>→</span></button>
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
            <label htmlFor="text-hint">상대방에게 보여줄 힌트</label>
            <p id="drawing-help">정답 단어를 직접 쓰지 않고 특징을 설명해 주세요. 키보드나 화면 읽기 프로그램 이용자는 그림 대신 자세한 글 힌트를 사용할 수 있습니다.</p>
            <textarea id="text-hint" value={textHint} onChange={(event) => setTextHint(event.target.value)}
              maxLength={100} placeholder="예: 얼큰하고 따뜻하며 밥과 함께 먹어요" />
            <small>{textHint.length} / 100자</small>
          </div>
          <button className="primaryButton centerButton" disabled={!textHint.trim()} onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) setDrawingImage(canvas.toDataURL("image/png"));
            transitionTo("guess");
          }}>그림과 힌트 완성 · 화면 넘기기 <span>→</span></button>
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
              {drawingImage
                // Canvas가 만든 일회성 data URL이라 이미지 최적화 대상이 아닙니다.
                // eslint-disable-next-line @next/next/no-img-element
                ? <img className="mirrorCanvas" src={drawingImage} alt="파트너가 그린 힌트 그림" />
                : <div className="emptyDrawing" role="status">저장된 그림이 없습니다.</div>}
              {textHint && <div className="textHintPreview"><b>글 힌트</b><p>{textHint}</p></div>}
            </div>
            <div className="answerPanel">
              <p>하나를 선택하세요</p>
              <div className="answerGrid">
                {choiceOptions.map((option, index) => (
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
            <button className="secondaryButton" onClick={() => { setQuizIndex(0); setScore(0); setAnswers([]); setDrawerAnswer(""); setChoiceOptions([]); transitionTo("quiz-intro"); }}>퀴즈 다시 하기</button>
            <button className="primaryButton" onClick={startCompatibility}>상황 궁합으로 <span>→</span></button>
          </div>
          <p className="privacyNote">실제 온라인 버전에서는 모든 커플이 동시에 플레이하고 점수 순위가 집계됩니다.</p>
        </section>
      )}

      {screen === "compat-intro" && (
        <section className="compatScreen">
          <div className="roundHeading">
            <div><p>ROUND 03 · QUESTION {compatIndex + 1}</p><h2>우리라면 어떻게 할까?</h2></div>
            <div className="scorePill">궁합 <b>{compatScore}점</b></div>
          </div>
          <div className="compatProgress" role="progressbar" aria-label="상황 궁합 진행률"
            aria-valuemin={1} aria-valuemax={compatibilityQuestions.length} aria-valuenow={compatIndex + 1}>
            <span style={{ width: `${((compatIndex + 1) / compatibilityQuestions.length) * 100}%` }} />
          </div>
          <div className="scenarioCard">
            <span>SCENE {String(compatIndex + 1).padStart(2, "0")}</span>
            <h3>{compatQuestion.title}</h3>
            <p>{compatQuestion.scenario}</p>
          </div>
          <div className="quizCouple compactCouple">
            <div><span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><b>{demoCouple[0].name}</b></div>
            <i>?</i>
            <div><span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span><b>{demoCouple[1].name}</b></div>
          </div>
          <p className="passDevice">두 사람은 같은 질문에 따로 답합니다. 먼저 첫 번째 사람에게 화면을 건네주세요.</p>
          <button className="primaryButton centerButton" onClick={() => transitionTo("compat-first")}>첫 번째 답변 시작 <span>→</span></button>
        </section>
      )}

      {screen === "compat-first" && (
        <section className="compatScreen">
          <div className="answeringPlayer">
            <span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span>
            <p><b>{demoCouple[0].name}</b>님의 비공개 답변<small>상대방과 상의하지 말고 골라주세요</small></p>
          </div>
          <h2 className="scenarioQuestion">{compatQuestion.scenario}</h2>
          <div className="compatOptions">
            {compatQuestion.options.map((option, index) => (
              <button key={option} className={firstChoice === index ? "chosen" : ""}
                onClick={() => setFirstChoice(index)} aria-pressed={firstChoice === index}>
                <span>{index + 1}</span><p>{option}</p>
              </button>
            ))}
          </div>
          <button className="primaryButton confirmButton" disabled={firstChoice === null}
            onClick={() => transitionTo("compat-second")}>답변 숨기고 화면 넘기기 <span>→</span></button>
        </section>
      )}

      {screen === "compat-second" && (
        <section className="compatScreen">
          <div className="answeringPlayer">
            <span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span>
            <p><b>{demoCouple[1].name}</b>님의 비공개 답변<small>첫 번째 사람의 답은 안전하게 숨겨졌어요</small></p>
          </div>
          <h2 className="scenarioQuestion">{compatQuestion.scenario}</h2>
          <div className="compatOptions">
            {compatQuestion.options.map((option, index) => (
              <button key={option} className={secondChoice === index ? "chosen" : ""}
                onClick={() => setSecondChoice(index)} aria-pressed={secondChoice === index}>
                <span>{index + 1}</span><p>{option}</p>
              </button>
            ))}
          </div>
          <button className="primaryButton confirmButton" disabled={secondChoice === null}
            onClick={submitSecondCompatibilityChoice}>두 사람의 답 공개하기 <span>→</span></button>
        </section>
      )}

      {screen === "compat-reveal" && firstChoice !== null && secondChoice !== null && (
        <section className="compatScreen revealScreen">
          <p className="eyebrow">ROUND 03 · REVEAL</p>
          <h2>{firstChoice === secondChoice ? "마음이 통했어요!" : "서로 다른 매력을 발견했어요"}</h2>
          <div className={`compatReveal ${firstChoice === secondChoice ? "matched" : ""}`} aria-live="polite">
            <div><span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><b>{demoCouple[0].name}</b><p>{compatQuestion.options[firstChoice]}</p></div>
            <i>{firstChoice === secondChoice ? "+1 ♥" : "↔"}</i>
            <div><span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span><b>{demoCouple[1].name}</b><p>{compatQuestion.options[secondChoice]}</p></div>
          </div>
          <p className="resultMessage">{firstChoice === secondChoice ? "같은 상황에서 비슷한 선택을 하는 커플이네요." : "다른 선택을 한 이유를 서로 이야기해 보세요."}</p>
          <button className="primaryButton centerButton" onClick={nextCompatibilityQuestion}>
            {compatIndex === compatibilityQuestions.length - 1 ? "최종 궁합 확인" : "다음 상황으로"} <span>→</span>
          </button>
        </section>
      )}

      {screen === "compat-result" && (
        <section className="resultScreen quizFinal">
          <p className="eyebrow">ROUND 03 · COMPLETE</p>
          <h2>우리의 상황 궁합은<br /><em>{compatScore * 20}%</em></h2>
          <div className="finalScore" aria-live="polite"><b>{compatScore}</b><span>/ {compatibilityQuestions.length} 일치</span></div>
          <div className="answerHistory">
            {compatHistory.map((matched, index) => <span className={matched ? "correct" : "wrong"} key={index}>{index + 1}</span>)}
          </div>
          <p className="resultMessage">{compatScore >= 4 ? "중요한 순간에 같은 방향을 바라보는 커플이에요!" : compatScore >= 2 ? "닮은 점과 다른 점이 적당히 어우러진 커플이에요." : "서로 다른 만큼 새롭게 알아갈 이야기가 많아요!"}</p>
          <div className="resultActions">
            <button className="secondaryButton" onClick={startCompatibility}>다시 해보기</button>
            <button className="primaryButton" onClick={() => transitionTo("landing")}>처음으로 <span>→</span></button>
          </div>
          <p className="privacyNote">같은 답은 점수가 되지만, 다른 답도 서로를 이해하는 좋은 대화 주제입니다.</p>
        </section>
      )}
      </main>
    </>
  );
}
