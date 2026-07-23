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
  | "login" | "signup" | "profile" | "verify" | "lobby" | "create-room" | "waiting-room"
  | "landing" | "signal" | "match-result"
  | "quiz-intro" | "draw" | "guess" | "quiz-result"
  | "compat-intro" | "compat-first" | "compat-second" | "compat-reveal" | "compat-result"
  | "burger-intro" | "burger-play" | "burger-result"
  | "final-result" | "final-choice-first" | "final-choice-second" | "final-reveal" | "private-chat"
  | "friends";

type Ingredient = "bun" | "patty" | "cheese" | "lettuce" | "tomato";
type SideItem = "coffee" | "cola" | "cider" | "fries" | "applePie" | "nugget" | "squidRing";
type KitchenOrder = {
  id: number;
  burger: { name: string; recipe: Ingredient[] };
  sides: SideItem[];
};
type RoomConfig = {
  id: string;
  title: string;
  people: number;
  capacity: 4 | 6;
  tag: string;
  time: string;
  minAge: number;
  maxAge: number;
  region: string;
  isMine?: boolean;
};

const players: Player[] = [
  { id: "a1", name: "민준", age: 29, job: "서비스 기획자", intro: "좋은 카페와 느긋한 산책을 좋아해요.", interests: ["커피", "여행"], avatar: "민", color: "#7456f1", team: "A" },
  { id: "a2", name: "도윤", age: 31, job: "건축 디자이너", intro: "주말엔 요리하고 사진을 찍습니다.", interests: ["요리", "사진"], avatar: "도", color: "#3178e0", team: "A" },
  { id: "a3", name: "현우", age: 28, job: "마케터", intro: "같이 웃을 수 있는 사람이 좋아요.", interests: ["공연", "러닝"], avatar: "현", color: "#26a77b", team: "A" },
  { id: "b1", name: "서연", age: 28, job: "콘텐츠 에디터", intro: "새로운 장소와 다정한 대화를 좋아해요.", interests: ["전시", "맛집"], avatar: "서", color: "#ed5f89", team: "B" },
  { id: "b2", name: "지우", age: 30, job: "제품 디자이너", intro: "작은 일상도 재미있게 보내는 편이에요.", interests: ["영화", "반려동물"], avatar: "지", color: "#e67a45", team: "B" },
  { id: "b3", name: "하린", age: 27, job: "연구원", intro: "계획 없는 여행과 보드게임을 즐겨요.", interests: ["여행", "게임"], avatar: "하", color: "#bd57c7", team: "B" },
];
const demoFriendPlayers = players.filter((player) => player.team === "B");

const quizQuestions = [
  { prompt: "내가 가장 좋아하는 음식은?", suggestions: ["떡볶이", "초밥", "파스타", "삼겹살", "치킨", "마라탕"] },
  { prompt: "함께 가고 싶은 여행지는?", suggestions: ["제주도", "파리", "뉴욕", "삿포로", "다낭", "부산"] },
  { prompt: "쉬는 날 가장 하고 싶은 것은?", suggestions: ["늦잠", "등산", "쇼핑", "드라이브", "게임", "영화 보기"] },
  { prompt: "내가 좋아하는 계절은?", suggestions: ["봄", "여름", "가을", "겨울", "장마철", "첫눈 오는 날"] },
  { prompt: "첫 데이트로 가장 좋은 장소는?", suggestions: ["영화관", "놀이공원", "미술관", "한강", "아쿠아리움", "맛집"] },
  { prompt: "받고 싶은 깜짝 선물은?", suggestions: ["꽃다발", "손편지", "향수", "콘서트 티켓", "케이크", "커플 아이템"] },
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

const ingredientInfo: Record<Ingredient, { label: string; icon: string }> = {
  bun: { label: "빵", icon: "🍞" },
  patty: { label: "패티", icon: "🥩" },
  cheese: { label: "치즈", icon: "🧀" },
  lettuce: { label: "양상추", icon: "🥬" },
  tomato: { label: "토마토", icon: "🍅" },
};

const burgerOrders: { name: string; recipe: Ingredient[] }[] = [
  { name: "클래식 버거", recipe: ["bun", "patty", "cheese", "lettuce", "bun"] },
  { name: "프레시 버거", recipe: ["bun", "lettuce", "tomato", "patty", "bun"] },
  { name: "치즈 더블", recipe: ["bun", "cheese", "patty", "cheese", "bun"] },
  { name: "토마토 치즈", recipe: ["bun", "patty", "tomato", "cheese", "bun"] },
];

const sideInfo: Record<SideItem, { label: string; icon: string }> = {
  coffee: { label: "커피", icon: "☕" },
  cola: { label: "콜라", icon: "🥤" },
  cider: { label: "사이다", icon: "🫧" },
  fries: { label: "감자튀김", icon: "🍟" },
  applePie: { label: "애플파이", icon: "🥧" },
  nugget: { label: "너겟", icon: "🍗" },
  squidRing: { label: "오징어 링", icon: "⭕" },
};

const sideItems = Object.keys(sideInfo) as SideItem[];
const makeKitchenOrder = (id: number): KitchenOrder => {
  const sideCount = 3 + (id % 2);
  const sides = Array.from({ length: sideCount }, (_, index) => sideItems[(id * 2 + index) % sideItems.length]);
  return { id, burger: burgerOrders[id % burgerOrders.length], sides };
};

const initialVotes: Record<string, string> = {
  a1: "b2", a2: "b1", a3: "b3", b1: "a2", b2: "a3", b3: "a3",
};
const defaultRooms: RoomConfig[] = [
  { id: "room-01", title: "퇴근 후 설레는 한 판", people: 4, capacity: 6, tag: "☕ 편한 대화", time: "약 25분", minAge: 25, maxAge: 35, region: "모든 지역" },
  { id: "room-02", title: "취향부터 천천히", people: 2, capacity: 6, tag: "💗 진지한 만남", time: "약 30분", minAge: 27, maxAge: 39, region: "서울" },
  { id: "room-03", title: "주말의 인연", people: 3, capacity: 4, tag: "🎲 게임 집중", time: "약 20분", minAge: 24, maxAge: 32, region: "경기" },
  { id: "room-04", title: "부산 바다처럼 편하게", people: 4, capacity: 6, tag: "👋 친구부터", time: "약 25분", minAge: 20, maxAge: 29, region: "부산" },
  { id: "room-05", title: "서른의 진솔한 대화", people: 2, capacity: 4, tag: "💗 진지한 만남", time: "약 20분", minAge: 30, maxAge: 39, region: "서울" },
  { id: "room-06", title: "대구 맛집 친구부터", people: 3, capacity: 6, tag: "🎨 취미 공유", time: "약 30분", minAge: 23, maxAge: 33, region: "대구" },
  { id: "room-07", title: "인천 야경 산책", people: 2, capacity: 4, tag: "🌙 차분한 만남", time: "약 20분", minAge: 25, maxAge: 34, region: "인천" },
  { id: "room-08", title: "광주 문화생활 메이트", people: 4, capacity: 6, tag: "🎨 취미 공유", time: "약 25분", minAge: 21, maxAge: 31, region: "광주" },
  { id: "room-09", title: "대전 카페 탐방", people: 2, capacity: 6, tag: "☕ 편한 대화", time: "약 30분", minAge: 20, maxAge: 30, region: "대전" },
  { id: "room-10", title: "제주에서 천천히", people: 3, capacity: 4, tag: "🌙 차분한 만남", time: "약 20분", minAge: 28, maxAge: 40, region: "제주" },
  { id: "room-11", title: "경기 퇴근길 토크", people: 4, capacity: 6, tag: "☕ 편한 대화", time: "약 25분", minAge: 26, maxAge: 36, region: "경기" },
  { id: "room-12", title: "울산 취미 공유회", people: 2, capacity: 4, tag: "🎨 취미 공유", time: "약 20분", minAge: 22, maxAge: 32, region: "울산" },
];

const roomThemes = [
  { label: "편한 대화", icon: "☕", description: "부담 없이 가볍게" },
  { label: "진지한 만남", icon: "💗", description: "연애를 진지하게" },
  { label: "친구부터", icon: "👋", description: "천천히 친해지기" },
  { label: "취미 공유", icon: "🎨", description: "공통 관심사 찾기" },
  { label: "게임 집중", icon: "🎲", description: "즐거운 승부 중심" },
  { label: "차분한 만남", icon: "🌙", description: "조용하고 편안하게" },
];

const waitingReactions = [
  { emoji: "😊", label: "웃어요" }, { emoji: "😢", label: "슬퍼요" },
  { emoji: "😠", label: "화났어요" }, { emoji: "🥱", label: "지루해요" },
  { emoji: "👋", label: "반가워요" }, { emoji: "😍", label: "설레요" },
  { emoji: "😳", label: "부끄러워요" }, { emoji: "🤔", label: "궁금해요" },
  { emoji: "😮", label: "놀랐어요" }, { emoji: "👏", label: "응원해요" },
  { emoji: "👍", label: "좋아요" }, { emoji: "🙏", label: "고마워요" },
];

const stages = ["첫인상", "취향 퀴즈", "상황 궁합", "버거 팀워크", "최종 선택"];
const medalInfo = [
  { icon: "🥇", label: "금메달" },
  { icon: "🥈", label: "은메달" },
  { icon: "🥉", label: "동메달" },
];

type MusicTheme = { title: string; melody: number[]; chords: number[][]; tempo: number };

const musicThemes: Record<"roundOne" | "roundTwo" | "roundThree" | "roundFour" | "roundFive" | "roundSix", MusicTheme> = {
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
  roundFour: {
    title: "달콤한 주방",
    melody: [659.25, 783.99, 880, 1046.5, 880, 783.99, 698.46, 783.99, 587.33, 698.46, 783.99, 987.77, 880, 783.99, 698.46, 587.33],
    chords: [
      [261.63, 329.63, 392],
      [293.66, 369.99, 440],
      [220, 277.18, 329.63],
      [246.94, 311.13, 369.99],
    ],
    tempo: 280,
  },
  roundFive: {
    title: "우리가 주인공",
    melody: [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1174.66, 1318.51, 698.46, 880, 1046.5, 1396.91, 1318.51, 1174.66, 1046.5, 1046.5],
    chords: [
      [261.63, 329.63, 392],
      [349.23, 440, 523.25],
      [392, 493.88, 587.33],
      [261.63, 329.63, 392],
    ],
    tempo: 230,
  },
  roundSix: {
    title: "둘만의 고요한 밤",
    melody: [392, 440, 493.88, 523.25, 493.88, 440, 392, 329.63, 349.23, 392, 440, 493.88, 440, 392, 349.23, 329.63],
    chords: [
      [196, 246.94, 293.66],
      [174.61, 220, 261.63],
      [164.81, 196, 246.94],
      [146.83, 185, 220],
    ],
    tempo: 520,
  },
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [nickname, setNickname] = useState("하트");
  const [profileName, setProfileName] = useState("김하트");
  const [profileAge, setProfileAge] = useState("29");
  const [profileRegion, setProfileRegion] = useState("서울");
  const [profileGender, setProfileGender] = useState<"남성" | "여성">("남성");
  const [profileJob, setProfileJob] = useState("서비스 기획자");
  const [profileIntro, setProfileIntro] = useState("좋은 대화와 맛있는 음식을 좋아해요.");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileReturn, setProfileReturn] = useState<"verify" | "lobby">("verify");
  const [isReady, setIsReady] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomMinAge, setRoomMinAge] = useState("25");
  const [roomMaxAge, setRoomMaxAge] = useState("35");
  const [roomRegion, setRoomRegion] = useState("모든 지역");
  const [roomCapacity, setRoomCapacity] = useState<4 | 6>(6);
  const [roomTheme, setRoomTheme] = useState(roomThemes[0].label);
  const [createdRoom, setCreatedRoom] = useState<RoomConfig | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomConfig>(defaultRooms[0]);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [receivedLikes] = useState(2);
  const [lastReaction, setLastReaction] = useState<{ emoji: string; label: string } | null>(null);
  const [lobbySearchMinAge, setLobbySearchMinAge] = useState("");
  const [lobbySearchMaxAge, setLobbySearchMaxAge] = useState("");
  const [lobbySearchRegion, setLobbySearchRegion] = useState("모든 지역");
  const [lobbyPage, setLobbyPage] = useState(1);
  const [kickCandidateId, setKickCandidateId] = useState<string | null>(null);
  const [kickVoteCount, setKickVoteCount] = useState(0);
  const [kickedProfileIds, setKickedProfileIds] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
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
  const [burgerTime, setBurgerTime] = useState(45);
  const [burgerScore, setBurgerScore] = useState(0);
  const [menuOrders, setMenuOrders] = useState<KitchenOrder[]>([]);
  const [nextOrderNumber, setNextOrderNumber] = useState(4);
  const [burgerStack, setBurgerStack] = useState<Ingredient[]>([]);
  const [burgerReady, setBurgerReady] = useState(false);
  const [preparedSides, setPreparedSides] = useState<SideItem[]>([]);
  const [burgerRoleIndex, setBurgerRoleIndex] = useState(0);
  const [orderPassed, setOrderPassed] = useState(false);
  const [burgerMistakes, setBurgerMistakes] = useState(0);
  const [finalFirstChoice, setFinalFirstChoice] = useState<boolean | null>(null);
  const [finalSecondChoice, setFinalSecondChoice] = useState<boolean | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "system", text: "서로의 마음이 통했어요. 편안하게 대화를 시작해 보세요." },
  ]);
  const [chatSeconds, setChatSeconds] = useState(3600);
  const [chatEndedBy, setChatEndedBy] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("friends");
  const [mileageBalance, setMileageBalance] = useState(800);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [mileageNotice, setMileageNotice] = useState("");
  const [activeChatFriendId, setActiveChatFriendId] = useState("b1");
  const [pendingChatFriendId, setPendingChatFriendId] = useState<string | null>(null);
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
  const drawerPlayer = demoCouple[quizIndex % 2];
  const guesserPlayer = demoCouple[(quizIndex + 1) % 2];
  const compatQuestion = compatibilityQuestions[compatIndex];
  const currentOrder = menuOrders[0];
  const sidesReady = Boolean(currentOrder && preparedSides.length === currentOrder.sides.length);
  const burgerPlayer = demoCouple[burgerRoleIndex];
  const sidePlayer = demoCouple[(burgerRoleIndex + 1) % 2];
  const demoFinalScore = 55 + score * 5 + compatScore * 5 + Math.min(burgerScore, 5) * 4;
  const finalRanking = [
    { couple: demoCouple, score: demoFinalScore, isOurs: true },
    { couple: [players[0], players[4]] as const, score: 92, isOurs: false },
    { couple: [players[2], players[5]] as const, score: 78, isOurs: false },
  ].sort((left, right) => right.score - left.score);
  const chatTimeLabel = `${String(Math.floor(chatSeconds / 60)).padStart(2, "0")}:${String(chatSeconds % 60).padStart(2, "0")}`;
  const activeChatFriend = players.find((player) => player.id === activeChatFriendId) ?? demoCouple[1];
  const pendingChatFriend = players.find((player) => player.id === pendingChatFriendId);
  const musicRound: keyof typeof musicThemes = screen === "final-result"
    ? "roundFive"
    : screen.startsWith("final-") || screen === "private-chat" || screen === "friends"
      ? "roundSix"
    : screen.startsWith("burger-")
    ? "roundFour"
    : screen.startsWith("compat-") ? "roundThree"
    : screen === "landing" || screen === "signal" || screen === "match-result"
      ? "roundOne" : "roundTwo";
  const currentTrack = musicThemes[musicRound];
  const myWaitingProfile = {
    id: "me", name: profileName, age: Number(profileAge), region: profileRegion,
    job: profileJob, intro: profileIntro, avatar: profileName.slice(0, 1), color: "#8c6cff",
    gender: profileGender, isMe: true,
  };
  const demoWaitingProfiles = players.map((player, index) => ({
    id: player.id, name: player.name, age: player.age, region: index % 3 === 0 ? "서울" : index % 3 === 1 ? "경기" : "인천",
    job: player.job, intro: player.intro, avatar: player.avatar, color: player.color,
    gender: player.team === "A" ? "남성" as const : "여성" as const, isMe: false,
  }));
  const maleSeatCount = Math.ceil(activeRoom.people / 2);
  const femaleSeatCount = Math.floor(activeRoom.people / 2);
  const visibleWaitingProfiles = [myWaitingProfile, ...demoWaitingProfiles].filter((person) => !kickedProfileIds.includes(person.id));
  const waitingMen = visibleWaitingProfiles.filter((person) => person.gender === "남성").slice(0, maleSeatCount);
  const waitingWomen = visibleWaitingProfiles.filter((person) => person.gender === "여성").slice(0, femaleSeatCount);
  const lobbyRooms = [...(createdRoom ? [createdRoom] : []), ...defaultRooms];
  const filteredLobbyRooms = lobbyRooms.filter((room) => {
    const matchesMinAge = !lobbySearchMinAge || room.minAge >= Number(lobbySearchMinAge);
    const matchesMaxAge = !lobbySearchMaxAge || room.maxAge <= Number(lobbySearchMaxAge);
    const matchesRegion = lobbySearchRegion === "모든 지역" || room.region === lobbySearchRegion;
    return matchesMinAge && matchesMaxAge && matchesRegion;
  });
  const lobbyPageCount = Math.max(1, Math.ceil(filteredLobbyRooms.length / 9));
  const visibleLobbyRooms = filteredLobbyRooms.slice((lobbyPage - 1) * 9, lobbyPage * 9);
  const kickCandidate = demoWaitingProfiles.find((person) => person.id === kickCandidateId);
  const kickVoteThreshold = Math.floor(activeRoom.people / 2) + 1;

  const toggleProfileLike = (profileId: string) => {
    setLikedProfiles((previous) => previous.includes(profileId)
      ? previous.filter((id) => id !== profileId)
      : [...previous, profileId]);
  };

  const resetLobbySearch = () => {
    setLobbySearchMinAge("");
    setLobbySearchMaxAge("");
    setLobbySearchRegion("모든 지역");
    setLobbyPage(1);
  };

  const startKickVote = (profileId: string) => {
    setKickCandidateId(profileId);
    setKickVoteCount(2);
  };

  const addDemoKickVote = () => {
    const nextVotes = kickVoteCount + 1;
    setKickVoteCount(nextVotes);
    if (kickCandidateId && nextVotes >= kickVoteThreshold) {
      setKickedProfileIds((previous) => [...previous, kickCandidateId]);
      setKickCandidateId(null);
      setKickVoteCount(0);
    }
  };

  const enterLobby = (verified = isVerified) => {
    setIsVerified(verified);
    setAuthNotice(verified ? "휴대전화 본인·연령 확인이 완료됐어요." : "로비는 둘러볼 수 있지만 게임방 입장 전 인증이 필요해요.");
    transitionTo("lobby");
  };

  const joinLobbyRoom = (room: RoomConfig) => {
    if (!isVerified) {
      setAuthNotice("실제 참가자가 있는 게임방에 들어가려면 먼저 본인·연령 확인이 필요해요.");
      transitionTo("verify");
      return;
    }
    setActiveRoom(room);
    setIsReady(false);
    transitionTo("waiting-room");
  };

  const createRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const minAge = Number(roomMinAge);
    const maxAge = Number(roomMaxAge);
    if (!roomTitle.trim() || !roomMinAge || !roomMaxAge || minAge > maxAge) return;
    const room: RoomConfig = {
      id: "mine-room",
      title: roomTitle.trim(),
      people: 1,
      capacity: roomCapacity,
      tag: `${roomThemes.find((theme) => theme.label === roomTheme)?.icon ?? "☕"} ${roomTheme}`,
      time: roomCapacity === 4 ? "약 20분" : "약 25분",
      minAge,
      maxAge,
      region: roomRegion,
      isMine: true,
    };
    setCreatedRoom(room);
    setActiveRoom(room);
    setAuthNotice(`‘${room.title}’ 방이 만들어졌어요. 참가자를 기다려 보세요.`);
    transitionTo("lobby");
  };

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileName.trim() || !profileAge || !profileRegion || !profileJob.trim() || !profileIntro.trim()) return;
    setNickname(profileName.trim());
    transitionTo(profileReturn);
  };

  const previewProfilePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setAuthNotice("5MB 이하의 이미지 파일만 선택해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(typeof reader.result === "string" ? reader.result : "");
      setAuthNotice("");
    };
    reader.readAsDataURL(file);
  };

  const logout = () => {
    setIsVerified(false);
    setAuthNotice("");
    transitionTo("login");
  };

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

      if (musicRound === "roundSix") {
        // 대화를 방해하지 않는 낮은 음량의 피아노와 부드러운 패드입니다.
        playVoice(melodyNote, now, 0.9, 0.018, "sine");
        playVoice(melodyNote / 2, now, 1.05, 0.007, "triangle");
      } else if (musicRound === "roundFive") {
        // 시상식 팡파르처럼 선명한 브라스 선율과 힘 있는 저음을 겹칩니다.
        playVoice(melodyNote, now, 0.42, 0.085, "triangle");
        playVoice(melodyNote / 2, now, 0.38, 0.032, "sawtooth");
        playVoice(melodyNote * 2, now + 0.04, 0.2, 0.018, "square");
      } else {
        // 짧은 벨과 한 옥타브 위의 잔향을 겹쳐 반짝이는 하프 느낌을 냅니다.
        playVoice(melodyNote, now, 0.52, 0.045, "sine");
        playVoice(melodyNote * 2, now + 0.055, 0.28, 0.012, "triangle");
      }

      // 네 박마다 메이저 화음과 낮은 베이스를 더해 장면을 크게 받쳐 줍니다.
      const chordInterval = musicRound === "roundSix" ? 8 : 4;
      if (index % chordInterval === 0) {
        const chord = theme.chords[Math.floor(index / chordInterval) % theme.chords.length];
        chord.forEach((frequency, chordIndex) => {
          const duration = musicRound === "roundSix" ? 1.8 : musicRound === "roundFive" ? 0.85 : 1.3;
          const peak = musicRound === "roundSix" ? 0.005 : musicRound === "roundFive" ? 0.032 : 0.013;
          playVoice(frequency, now + chordIndex * 0.025, duration, peak, musicRound === "roundFive" ? "triangle" : "sine");
        });
        const bassPeak = musicRound === "roundSix" ? 0.004 : musicRound === "roundFive" ? 0.035 : 0.01;
        playVoice(chord[0] / 2, now, musicRound === "roundSix" ? 1.9 : 1.1, bassPeak, musicRound === "roundFive" ? "sawtooth" : "triangle");
      }
      index += 1;
    };

    playSparkle();
    const timer = window.setInterval(playSparkle, theme.tempo);
    return () => window.clearInterval(timer);
  }, [musicRound, musicStarted, isMuted, volume]);

  useEffect(() => () => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") {
      try {
        void context.close().catch(() => undefined);
      } catch {
        // 개발 모드의 이중 정리에서도 이미 닫힌 오디오 컨텍스트를 안전하게 무시합니다.
      }
    }
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

  useEffect(() => {
    if (screen !== "burger-play") return;
    const timer = window.setInterval(() => {
      setBurgerTime((time) => {
        if (time <= 1) {
          window.clearInterval(timer);
          transitionTo("burger-result");
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "private-chat" || chatSeconds <= 0 || chatEndedBy) return;
    const timer = window.setInterval(() => {
      setChatSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [chatEndedBy, chatSeconds, screen]);

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
    setBurgerTime(45);
    setBurgerScore(0);
    setMenuOrders([]);
    setNextOrderNumber(4);
    setBurgerStack([]);
    setBurgerReady(false);
    setPreparedSides([]);
    setBurgerRoleIndex(0);
    setOrderPassed(false);
    setBurgerMistakes(0);
    setFinalFirstChoice(null);
    setFinalSecondChoice(null);
    setChatInput("");
    setChatMessages([{ from: "system", text: "서로의 마음이 통했어요. 편안하게 대화를 시작해 보세요." }]);
    setChatSeconds(3600);
    setChatEndedBy(null);
    setRewardClaimed(false);
    setMileageNotice("");
    setPendingChatFriendId(null);
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

  const startBurgerRound = () => {
    setBurgerTime(45);
    setBurgerScore(0);
    setMenuOrders([makeKitchenOrder(1), makeKitchenOrder(2), makeKitchenOrder(3)]);
    setNextOrderNumber(4);
    setBurgerStack([]);
    setBurgerReady(false);
    setPreparedSides([]);
    setBurgerRoleIndex(Math.random() < 0.5 ? 0 : 1);
    setOrderPassed(false);
    setBurgerMistakes(0);
    transitionTo("burger-play");
  };

  const passKitchenOrder = () => {
    setOrderPassed(true);
    setBurgerScore((value) => value + 1);
    window.setTimeout(() => {
      setMenuOrders((orders) => [...orders.slice(1), makeKitchenOrder(nextOrderNumber)]);
      setNextOrderNumber((number) => number + 1);
      setBurgerStack([]);
      setBurgerReady(false);
      setPreparedSides([]);
      setOrderPassed(false);
    }, 850);
  };

  const addBurgerIngredient = (ingredient: Ingredient) => {
    if (!currentOrder || burgerReady || orderPassed) return;
    const expected = currentOrder.burger.recipe[burgerStack.length];
    if (ingredient !== expected) {
      setBurgerMistakes((count) => count + 1);
      setBurgerStack([]);
      return;
    }
    const nextStack = [...burgerStack, ingredient];
    if (nextStack.length === currentOrder.burger.recipe.length) {
      setBurgerStack(nextStack);
      setBurgerReady(true);
      if (sidesReady) passKitchenOrder();
      return;
    }
    setBurgerStack(nextStack);
  };

  const prepareSide = (side: SideItem) => {
    if (!currentOrder || orderPassed || sidesReady) return;
    if (!currentOrder.sides.includes(side) || preparedSides.includes(side)) {
      setBurgerMistakes((count) => count + 1);
      return;
    }
    const nextSides = [...preparedSides, side];
    setPreparedSides(nextSides);
    if (burgerReady && nextSides.length === currentOrder.sides.length) passKitchenOrder();
  };

  const sendChatMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatSeconds <= 0 || chatEndedBy) return;
    setChatMessages((messages) => [...messages, { from: "me", text: message }]);
    setChatInput("");
    window.setTimeout(() => {
      setChatMessages((messages) => [...messages, { from: "partner", text: "나도 오늘 정말 즐거웠어. 천천히 더 이야기해 보자 😊" }]);
    }, 700);
  };

  const openFinalResults = () => {
    if (!rewardClaimed) {
      const ourRank = finalRanking.findIndex((entry) => entry.isOurs);
      const reward = [300, 200, 100][ourRank] ?? 100;
      setMileageBalance((balance) => balance + reward);
      setMileageNotice(`이번 게임 보상 ${reward} 마일리지가 적립됐어요.`);
      setRewardClaimed(true);
    }
    transitionTo("final-result");
  };

  const openPrivateChat = (friendId = demoCouple[1].id) => {
    setActiveChatFriendId(friendId);
    setChatSeconds(3600);
    setChatEndedBy(null);
    setChatInput("");
    setChatMessages([{ from: "system", text: "1시간 동안 둘만의 대화가 열렸어요. 편안하게 인사를 건네보세요." }]);
    transitionTo("private-chat");
  };

  const endPrivateChat = () => {
    if (chatEndedBy) return;
    const endingName = demoCouple[0].name;
    setChatEndedBy(endingName);
    setChatMessages((messages) => [...messages, { from: "system", text: `${endingName}님이 대화를 종료했습니다.` }]);
  };

  const requestFriend = () => {
    if (friendStatus !== "none") return;
    setFriendStatus("pending");
    window.setTimeout(() => {
      setFriendStatus("friends");
      setChatMessages((messages) => [...messages, { from: "system", text: "서로 친구가 되었어요. 다음에는 친구창에서 다시 만날 수 있어요." }]);
    }, 700);
  };

  const reopenFriendChat = (friendId: string) => {
    if (mileageBalance < 500) {
      setMileageNotice("마일리지가 부족해요. 충전 기능은 정식 결제 정책 준비 후 제공될 예정입니다.");
      return;
    }
    setMileageBalance((balance) => balance - 500);
    setPendingChatFriendId(friendId);
    setMileageNotice("대화 신청 비용 500 마일리지를 보관 중이에요. 상대의 응답을 기다려 주세요.");
  };

  const acceptChatRequest = () => {
    if (!pendingChatFriendId) return;
    const friendId = pendingChatFriendId;
    setPendingChatFriendId(null);
    setMileageNotice("상대가 대화 신청을 수락했어요. 1시간 대화를 시작합니다.");
    openPrivateChat(friendId);
  };

  const rejectChatRequest = () => {
    if (!pendingChatFriendId) return;
    setPendingChatFriendId(null);
    setMileageBalance((balance) => balance + 250);
    setMileageNotice("상대가 대화를 거절해 신청 비용의 절반인 250 마일리지가 반환됐어요.");
  };

  return (
    <>
      <a className="skipLink" href="#main-content">게임 본문으로 건너뛰기</a>
      <main id="main-content" aria-busy={isTransitioning}>
      {!["login", "signup", "profile", "verify"].includes(screen) && <header className="topbar">
        <button className="brand" onClick={() => transitionTo("lobby")} aria-label="로비로">
          <span className="brandMark">♥</span><span>HEART ROUND</span>
        </button>
        <div className="topbarActions">
          <button className="accountPill" type="button" onClick={() => transitionTo("friends")} aria-label={`내 마일리지 ${mileageBalance}`}>
            <span>✦</span><b>{mileageBalance}</b><small>마일리지</small>
          </button>
          <button className="friendShortcut" type="button" onClick={() => transitionTo("friends")}>
            친구 <b>{demoFriendPlayers.length}</b>
          </button>
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
      </header>}

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

      {screen === "login" && (
        <section className="authShell" aria-labelledby="login-title">
          <div className="authStory">
            <button className="brand authBrand" type="button" onClick={() => transitionTo("login")}>
              <span className="brandMark">♥</span><span>HEART ROUND</span>
            </button>
            <p className="eyebrow">3:3 SOCIAL GAME</p>
            <h1 id="login-title">게임으로 만나고,<br /><em>대화로 이어져요</em></h1>
            <p>취향 퀴즈와 팀 게임을 함께하며 자연스럽게 서로를 알아가는 프라이빗 베타입니다.</p>
            <ul>
              <li><span>01</span>로비 둘러보기는 간편 가입만으로</li>
              <li><span>02</span>게임 참가 전 휴대전화 본인·연령 확인</li>
              <li><span>03</span>연락처는 서비스가 요구하거나 공개하지 않음</li>
            </ul>
          </div>
          <div className="authCard">
            <p className="eyebrow">WELCOME</p>
            <h2>간편하게 시작하기</h2>
            <p>SNS 계정 또는 이메일 중 편한 방법을 골라주세요.</p>
            <div className="socialLogin" aria-label="SNS 간편 가입">
              <button type="button" className="kakao" onClick={() => transitionTo("signup")}><span>K</span>카카오로 시작</button>
              <button type="button" className="naver" onClick={() => transitionTo("signup")}><span>N</span>네이버로 시작</button>
              <button type="button" className="google" onClick={() => transitionTo("signup")}><span>G</span>Google로 시작</button>
            </div>
            <div className="authDivider"><span>또는 이메일</span></div>
            <form onSubmit={(event) => { event.preventDefault(); if (authEmail.trim()) transitionTo("signup"); }}>
              <label htmlFor="login-email">이메일</label>
              <input id="login-email" type="email" required autoComplete="email" value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)} placeholder="hello@example.com" />
              <button className="primaryButton authSubmit" type="submit">이메일로 계속하기</button>
            </form>
            <small className="authFootnote">현재 데모에서는 실제 SNS 로그인이나 이메일 인증이 진행되지 않습니다.</small>
          </div>
        </section>
      )}

      {screen === "signup" && (
        <section className="authCenter" aria-labelledby="signup-title">
          <button className="brand authBrand" type="button" onClick={() => transitionTo("login")}>
            <span className="brandMark">♥</span><span>HEART ROUND</span>
          </button>
          <div className="authCard signupCard">
            <p className="eyebrow">STEP 1 OF 2</p>
            <h2 id="signup-title">기본 프로필 만들기</h2>
            <p>게임에 필요한 최소 정보만 받아요. 실명과 연락처는 프로필에 공개되지 않습니다.</p>
            <form onSubmit={(event) => { event.preventDefault(); if (nickname.trim() && agreedToTerms && confirmedAdult) { setProfileName(nickname.trim()); setProfileReturn("verify"); transitionTo("profile"); } }}>
              <label htmlFor="signup-nickname">닉네임</label>
              <input id="signup-nickname" required maxLength={12} autoComplete="nickname" value={nickname}
                onChange={(event) => setNickname(event.target.value)} />
              <label className="checkRow">
                <input type="checkbox" checked={confirmedAdult} onChange={(event) => setConfirmedAdult(event.target.checked)} />
                <span><b>만 19세 이상입니다</b><small>베타 운영 정책상 성인만 참여할 수 있어요.</small></span>
              </label>
              <label className="checkRow">
                <input type="checkbox" checked={agreedToTerms} onChange={(event) => setAgreedToTerms(event.target.checked)} />
                <span><b>이용약관 및 개인정보 처리방침에 동의합니다</b><small>필수 동의와 선택 마케팅 동의는 실제 서비스에서 분리합니다.</small></span>
              </label>
              <button className="primaryButton authSubmit" type="submit"
                disabled={!nickname.trim() || !agreedToTerms || !confirmedAdult}>가입하고 계속하기</button>
            </form>
            <button className="textButton" type="button" onClick={() => transitionTo("login")}>이전으로</button>
          </div>
        </section>
      )}

      {screen === "profile" && (
        <section className="authCenter profileCenter" aria-labelledby="profile-title">
          <button className="brand authBrand" type="button" onClick={() => transitionTo(profileReturn === "lobby" ? "lobby" : "signup")}>
            <span className="brandMark">♥</span><span>HEART ROUND</span>
          </button>
          <div className="authCard profileFormCard">
            <p className="eyebrow">{profileReturn === "verify" ? "PROFILE SETUP" : "EDIT PROFILE"}</p>
            <h2 id="profile-title">나를 소개해 주세요</h2>
            <p>이 정보는 게임 참가자들이 대기실과 첫인상 라운드에서 확인합니다.</p>
            <form onSubmit={saveProfile}>
              <div className="photoField">
                <div className="profilePhotoPreview">
                  {profilePhoto ? (
                    // 데모에서 사용자가 방금 선택한 로컬 data URL을 즉시 미리보기 합니다.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profilePhoto} alt="선택한 프로필 사진 미리보기" />
                  ) : <span aria-hidden="true">{profileName.slice(0, 1) || "♥"}</span>}
                </div>
                <div>
                  <label className="photoUpload" htmlFor="profile-photo">사진 선택</label>
                  <input id="profile-photo" className="srOnly" type="file" accept="image/png,image/jpeg,image/webp" onChange={previewProfilePhoto} />
                  <small>JPG, PNG, WEBP · 최대 5MB</small>
                  {profilePhoto && <button className="textButton" type="button" onClick={() => setProfilePhoto("")}>사진 삭제</button>}
                </div>
              </div>
              <div className="profileFields">
                <div><label htmlFor="profile-name">이름 또는 활동명</label><input id="profile-name" required maxLength={12} value={profileName} onChange={(event) => setProfileName(event.target.value)} /></div>
                <div><label htmlFor="profile-age">나이</label><input id="profile-age" required type="number" min={19} max={99} inputMode="numeric" value={profileAge} onChange={(event) => setProfileAge(event.target.value)} /></div>
                <div>
                  <label htmlFor="profile-region">거주지역</label>
                  <select id="profile-region" required value={profileRegion} onChange={(event) => setProfileRegion(event.target.value)}>
                    {["서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"].map((region) => <option key={region}>{region}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-gender">성별</label>
                  <select id="profile-gender" required value={profileGender} onChange={(event) => setProfileGender(event.target.value as "남성" | "여성")}>
                    <option>남성</option><option>여성</option>
                  </select>
                </div>
                <div><label htmlFor="profile-job">직업</label><input id="profile-job" required maxLength={30} value={profileJob} onChange={(event) => setProfileJob(event.target.value)} /></div>
              </div>
              <label htmlFor="profile-intro">간단한 소개</label>
              <textarea id="profile-intro" required maxLength={120} rows={3} value={profileIntro} onChange={(event) => setProfileIntro(event.target.value)} />
              <div className="characterCount" aria-live="polite">{profileIntro.length} / 120</div>
              {authNotice && <p className="authNotice" role="status">{authNotice}</p>}
              <button className="primaryButton authSubmit" type="submit">프로필 저장하기</button>
            </form>
            <p className="profilePrivacy">실제 서비스에서는 프로필 사진을 비공개 저장소에 보관하고, 신고·차단 시 운영 정책에 따라 검토합니다.</p>
          </div>
        </section>
      )}

      {screen === "verify" && (
        <section className="authCenter" aria-labelledby="verify-title">
          <button className="brand authBrand" type="button" onClick={() => transitionTo("login")}>
            <span className="brandMark">♥</span><span>HEART ROUND</span>
          </button>
          <div className="authCard verifyCard">
            <span className="verifyIcon" aria-hidden="true">✓</span>
            <p className="eyebrow">STEP 2 OF 2</p>
            <h2 id="verify-title">안전한 만남을 위한 확인</h2>
            <p>게임방 참가 전 한 번만 휴대전화로 본인과 성인 여부를 확인해요.</p>
            <div className="dataPolicy">
              <div><span>저장해요</span><b>인증 여부 · 연령대 · 중복가입 방지값</b></div>
              <div><span>저장하지 않아요</span><b>주민등록번호 · 인증 문자 · 연락처 공개값</b></div>
            </div>
            {authNotice && <p className="authNotice" role="status">{authNotice}</p>}
            <button className="primaryButton authSubmit" type="button" onClick={() => enterLobby(true)}>휴대전화 본인인증 데모</button>
            <button className="secondaryButton authSubmit" type="button" onClick={() => enterLobby(false)}>인증 없이 로비 둘러보기</button>
            <small className="authFootnote">실서비스에서는 전문 본인확인 기관의 인증창을 연결하고 원본 신원정보를 직접 보관하지 않습니다.</small>
          </div>
        </section>
      )}

      {screen === "lobby" && (
        <section className="lobbyScreen">
          <div className="lobbyHero">
            <div>
              <p className="eyebrow">HEART ROUND LOBBY</p>
              <h1><em>{nickname}</em>님,<br />오늘의 인연을 만나볼까요?</h1>
              <p>마음에 드는 방을 골라 3:3 게임을 시작해 보세요.</p>
            </div>
            <div className="lobbyProfile">
              <span className="lobbyAvatar">♥</span>
              <div><b>{nickname}</b><small>{isVerified ? "본인·성인 인증 완료" : "미인증 계정"}</small></div>
              <i className={isVerified ? "verified" : ""}>{isVerified ? "인증 ✓" : "인증 필요"}</i>
              <div className="lobbyProfileActions">
                <button className="textButton" type="button" onClick={() => { setProfileReturn("lobby"); transitionTo("profile"); }}>프로필 수정</button>
                <button className="textButton" type="button" onClick={logout}>로그아웃</button>
              </div>
            </div>
          </div>
          {authNotice && <p className="lobbyNotice" role="status">{authNotice}</p>}
          <div className="lobbyStats" aria-label="현재 로비 현황">
            <div><span>●</span><p>온라인<b>24명</b></p></div>
            <div><span>♡</span><p>진행 중<b>5개 방</b></p></div>
            <div><span>✦</span><p>내 마일리지<b>{mileageBalance}</b></p></div>
          </div>
          <div className="lobbyHeading">
            <div><p className="eyebrow">LIVE ROOMS</p><h2>참가 가능한 게임방</h2></div>
            <button className="secondaryButton" type="button" onClick={() => transitionTo("create-room")}>＋ 새 방 만들기</button>
          </div>
          <form className="roomSearchPanel" onSubmit={(event) => event.preventDefault()} aria-label="맞춤 방 검색">
            <div className="roomSearchHeading"><div><b>내 조건에 맞는 방 찾기</b><p>원하는 나이대와 지역을 선택해 보세요.</p></div><span>{filteredLobbyRooms.length}개 방</span></div>
            <div className="roomSearchFields">
              <label htmlFor="search-min-age">최소 나이
                <input id="search-min-age" type="number" min={19} max={60} inputMode="numeric" placeholder="예: 20"
                  value={lobbySearchMinAge} onChange={(event) => { setLobbySearchMinAge(event.target.value.replace(/^0+(?=\d)/, "")); setLobbyPage(1); }} />
              </label>
              <span aria-hidden="true">~</span>
              <label htmlFor="search-max-age">최대 나이
                <input id="search-max-age" type="number" min={19} max={60} inputMode="numeric" placeholder="예: 30"
                  value={lobbySearchMaxAge} onChange={(event) => { setLobbySearchMaxAge(event.target.value.replace(/^0+(?=\d)/, "")); setLobbyPage(1); }} />
              </label>
              <label htmlFor="search-region">지역
                <select id="search-region" value={lobbySearchRegion} onChange={(event) => { setLobbySearchRegion(event.target.value); setLobbyPage(1); }}>
                  {["모든 지역", "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "제주"].map((region) => <option key={region}>{region}</option>)}
                </select>
              </label>
              <button className="textButton" type="button" onClick={resetLobbySearch}>조건 초기화</button>
            </div>
          </form>
          <div className="roomGrid">
            {visibleLobbyRooms.map((room, index) => (
              <article className="roomCard" key={room.title}>
                <div className="roomTop"><span>ROOM {String((lobbyPage - 1) * 9 + index + 1).padStart(2, "0")}</span><i>{room.tag}</i></div>
                <h3>{room.title}</h3>
                <p>{room.minAge}–{room.maxAge}세 · {room.region} · 남녀 {room.capacity / 2}:{room.capacity / 2}</p>
                <div className="seatRow" aria-label={`${room.capacity}명 중 ${room.people}명 참가`}>
                  {Array.from({ length: room.capacity }, (_, seat) => <span className={seat < room.people ? "filled" : ""} key={seat}>{seat < room.people ? "♥" : "+"}</span>)}
                </div>
                <div className="roomMeta"><b>{room.people} / {room.capacity}명</b><span>{room.time}</span></div>
                <button className="primaryButton" type="button" onClick={() => joinLobbyRoom(room)}>
                  {isVerified ? "참가하기" : "인증 후 참가하기"}
                </button>
              </article>
            ))}
          </div>
          {!visibleLobbyRooms.length && <div className="emptyRoomSearch" role="status"><span>🔎</span><b>조건에 맞는 방이 아직 없어요.</b><p>검색 조건을 조금 넓혀보세요.</p><button className="textButton" type="button" onClick={resetLobbySearch}>전체 방 보기</button></div>}
          {lobbyPageCount > 1 && (
            <nav className="roomPagination" aria-label="게임방 목록 페이지">
              <button type="button" disabled={lobbyPage === 1} onClick={() => setLobbyPage((page) => page - 1)}>이전</button>
              {Array.from({ length: lobbyPageCount }, (_, index) => index + 1).map((page) => (
                <button type="button" key={page} className={lobbyPage === page ? "active" : ""} aria-current={lobbyPage === page ? "page" : undefined} onClick={() => setLobbyPage(page)}>{page}</button>
              ))}
              <button type="button" disabled={lobbyPage === lobbyPageCount} onClick={() => setLobbyPage((page) => page + 1)}>다음</button>
            </nav>
          )}
          <aside className="lobbySafety">
            <span aria-hidden="true">🛡</span>
            <div><b>모두가 편안한 Heart Round</b><p>불쾌한 언행은 신고·차단할 수 있고, 연락처 공개는 요구하지 않습니다.</p></div>
            <button className="textButton" type="button" onClick={() => setAuthNotice("신고·차단 및 운영자 검토 화면은 서버 기능과 함께 추가할 예정이에요.")}>안전 가이드</button>
          </aside>
        </section>
      )}

      {screen === "create-room" && (
        <section className="createRoomScreen" aria-labelledby="create-room-title">
          <div className="createRoomHeading">
            <div><p className="eyebrow">CREATE A ROOM</p><h1 id="create-room-title">어떤 사람들과<br /><em>만나고 싶나요?</em></h1><p>방은 누구나 만들 수 있어요. 참가 조건을 정하면 조건에 맞는 사용자만 입장할 수 있습니다.</p></div>
            <button className="secondaryButton" type="button" onClick={() => transitionTo("lobby")}>취소하고 로비로</button>
          </div>
          <form className="roomBuilder" onSubmit={createRoom}>
            <section className="roomFormPanel">
              <div className="formSection">
                <span className="formStep">01</span><div><label htmlFor="room-title">방 제목</label><p>분위기를 알 수 있는 제목을 입력해 주세요.</p></div>
                <input id="room-title" required maxLength={30} value={roomTitle} onChange={(event) => setRoomTitle(event.target.value)} placeholder="예: 천천히 알아가는 저녁" />
                <small>{roomTitle.length} / 30</small>
              </div>
              <div className="formSection">
                <span className="formStep">02</span><div><label>방 테마</label><p>참가자들이 방의 분위기를 미리 알 수 있어요.</p></div>
                <div className="themeChoices" role="radiogroup" aria-label="방 테마">
                  {roomThemes.map((theme) => (
                    <label className={roomTheme === theme.label ? "selected" : ""} key={theme.label}>
                      <input type="radio" name="room-theme" value={theme.label} checked={roomTheme === theme.label} onChange={() => setRoomTheme(theme.label)} />
                      <span aria-hidden="true">{theme.icon}</span><div><b>{theme.label}</b><small>{theme.description}</small></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="formSection">
                <span className="formStep">03</span><div><label>참여 인원</label><p>남녀 비율은 언제나 1:1로 유지됩니다.</p></div>
                <div className="capacityChoices" role="radiogroup" aria-label="참여 인원">
                  <label className={roomCapacity === 4 ? "selected" : ""}><input type="radio" name="capacity" value="4" checked={roomCapacity === 4} onChange={() => setRoomCapacity(4)} /><span><b>2:2</b><small>총 4명 · 빠른 만남</small></span></label>
                  <label className={roomCapacity === 6 ? "selected" : ""}><input type="radio" name="capacity" value="6" checked={roomCapacity === 6} onChange={() => setRoomCapacity(6)} /><span><b>3:3</b><small>총 6명 · 다양한 만남</small></span></label>
                </div>
              </div>
              <div className="formSection">
                <span className="formStep">04</span><div><label>참가 나이</label><p>설정한 나이 범위의 사용자만 입장할 수 있어요.</p></div>
                <div className="ageRange">
                  <label htmlFor="room-min-age">최소 나이<input id="room-min-age" type="number" min={19} max={60} value={roomMinAge} onChange={(event) => setRoomMinAge(event.target.value.replace(/^0+(?=\d)/, ""))} /></label>
                  <span>부터</span>
                  <label htmlFor="room-max-age">최대 나이<input id="room-max-age" type="number" min={19} max={60} value={roomMaxAge} onChange={(event) => setRoomMaxAge(event.target.value.replace(/^0+(?=\d)/, ""))} /></label>
                  <span>까지</span>
                </div>
                {roomMinAge && roomMaxAge && Number(roomMinAge) > Number(roomMaxAge) && <p className="fieldError" role="alert">최대 나이는 최소 나이보다 높아야 합니다.</p>}
              </div>
              <div className="formSection">
                <span className="formStep">05</span><div><label htmlFor="room-region">참가 지역</label><p>모든 지역을 허용하거나 하나의 지역을 선택하세요.</p></div>
                <select id="room-region" value={roomRegion} onChange={(event) => setRoomRegion(event.target.value)}>
                  {["모든 지역", "서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"].map((region) => <option key={region}>{region}</option>)}
                </select>
              </div>
            </section>
            <aside className="roomPreview">
              <p className="eyebrow">ROOM PREVIEW</p><h2>{roomTitle.trim() || "방 제목을 입력해 주세요"}</h2>
              <div className="roomThemePreview"><span>{roomThemes.find((theme) => theme.label === roomTheme)?.icon}</span><b>{roomTheme}</b></div>
              <div className="previewRule"><span>인원</span><b>남 {roomCapacity / 2}명 · 여 {roomCapacity / 2}명</b></div>
              <div className="previewRule"><span>나이</span><b>{roomMinAge}–{roomMaxAge}세</b></div>
              <div className="previewRule"><span>지역</span><b>{roomRegion}</b></div>
              <div className="previewSeats">{Array.from({ length: roomCapacity }, (_, index) => <span key={index}>{index === 0 ? "♥" : "+"}</span>)}</div>
              <p className="creatorRule">방 생성은 무료이며 본인인증 전에도 가능합니다. 실제 참가 시에는 인증이 필요해요.</p>
              <button className="primaryButton" type="submit" disabled={!roomTitle.trim() || !roomMinAge || !roomMaxAge || Number(roomMinAge) > Number(roomMaxAge)}>이 조건으로 방 만들기</button>
            </aside>
          </form>
        </section>
      )}

      {screen === "waiting-room" && (
        <section className="waitingRoom">
          <div className="waitingHeader">
            <div><p className="eyebrow">WAITING ROOM · {activeRoom.capacity === 4 ? "2:2" : "3:3"}</p><h1>{activeRoom.title}</h1><p>{activeRoom.minAge}–{activeRoom.maxAge}세 · {activeRoom.region} · 참가자들의 프로필을 확인해 보세요.</p></div>
            <button className="secondaryButton" type="button" onClick={() => transitionTo("lobby")}>로비로 나가기</button>
          </div>
          <div className="waitingStatus" role="status">
            <div><span className="pulseDot" />현재 <b>{activeRoom.people}명</b>이 기다리고 있어요</div>
            <p>{activeRoom.capacity === 4 ? "2:2" : "3:3"} 매칭까지 {activeRoom.capacity - activeRoom.people}자리 남았습니다</p>
          </div>
          <div className="genderWaitingLayout" aria-label="성별로 구분된 대기 중인 참가자 프로필">
            {[
              { key: "men", title: "남성 참가자", people: waitingMen, seats: activeRoom.capacity / 2, mark: "M" },
              { key: "women", title: "여성 참가자", people: waitingWomen, seats: activeRoom.capacity / 2, mark: "W" },
            ].map((group) => (
              <section className={`genderRow ${group.key}`} key={group.key} aria-labelledby={`${group.key}-title`}>
                <div className="genderRowTitle"><span>{group.mark}</span><div><h2 id={`${group.key}-title`}>{group.title}</h2><p>{group.people.length} / {group.seats}명 입장</p></div></div>
                <div className="waitingProfileGrid">
                  {group.people.map((person) => (
                    <article className={`waitingProfileCard ${person.isMe ? "mine" : ""} ${person.isMe && isReady ? "isReady" : ""}`} key={person.id}>
                      <div className="waitingPortrait" style={{ background: `linear-gradient(145deg, ${person.color}, #211b2c)` }}>
                        {person.isMe && profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profilePhoto} alt={`${person.name} 프로필`} />
                        ) : <span>{person.avatar}</span>}
                        <i>{person.isMe ? "나" : group.mark}</i>
                        {person.isMe && lastReaction && <span className="profileReactionBubble" role="status" aria-label={`내 감정: ${lastReaction.label}`}>{lastReaction.emoji}</span>}
                      </div>
                      <div className="waitingProfileBody">
                        <div className="profileIdentity"><h2>{person.name}</h2><b>{person.age}세</b></div>
                        <dl className="profileFacts"><div><dt>지역</dt><dd>{person.region}</dd></div><div><dt>직업</dt><dd>{person.job}</dd></div></dl>
                        <blockquote className="profileIntro">“{person.intro}”</blockquote>
                        <div className="profileCardFooter">
                          {person.isMe
                            ? <span className="receivedLikes" aria-label={`받은 좋아요 ${receivedLikes}개`}>♥ 받은 좋아요 <b>{receivedLikes}</b></span>
                            : <button className={`profileLikeButton ${likedProfiles.includes(person.id) ? "liked" : ""}`} type="button"
                                aria-pressed={likedProfiles.includes(person.id)} onClick={() => toggleProfileLike(person.id)}>
                                {likedProfiles.includes(person.id) ? "♥ 좋아요 완료" : "♡ 좋아요"}
                              </button>}
                          <em className="verifyBadge">인증 ✓</em>
                        </div>
                        <div className={`profileReadyState ${person.isMe && isReady ? "ready" : ""}`}>
                          {person.isMe ? (isReady ? "✓ 준비 완료" : "준비 전") : person.id === "a1" || person.id === "b1" ? "✓ 준비 완료" : "준비 전"}
                        </div>
                        {!person.isMe && <button className="kickVoteButton" type="button" onClick={() => startKickVote(person.id)}>강퇴 투표</button>}
                      </div>
                    </article>
                  ))}
                  {Array.from({ length: group.seats - group.people.length }, (_, seat) => (
                    <article className="waitingProfileCard emptySeat" key={seat}>
                      <span>＋</span><h2>참가자를 기다리는 중</h2><p>{group.title} 자리가 비어 있어요</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <section className="reactionPanel" aria-labelledby="reaction-title">
            <div><b id="reaction-title">표정으로 인사하기</b><p>대기실에서는 채팅 없이 간단한 이모티콘만 보낼 수 있어요.</p></div>
            <div className="reactionButtons">
              {waitingReactions.map((reaction) => (
                <button type="button" key={reaction.label} aria-label={`${reaction.label} 이모티콘 보내기`}
                  className={lastReaction?.label === reaction.label ? "selected" : ""}
                  aria-pressed={lastReaction?.label === reaction.label}
                  onClick={() => setLastReaction(reaction)}><span>{reaction.emoji}</span>{reaction.label}</button>
              ))}
            </div>
            {lastReaction && <p className="reactionNotice" role="status"><span>{lastReaction.emoji}</span> {profileName}님이 ‘{lastReaction.label}’ 표정을 보냈어요.</p>}
          </section>
          {kickCandidate && (
            <section className="kickVotePanel" aria-labelledby="kick-vote-title">
              <div><span aria-hidden="true">🗳️</span><div><b id="kick-vote-title">{kickCandidate.name}님 강퇴 투표</b><p>과반수 찬성 시 대기방에서 퇴장합니다. 악의적인 투표는 운영 정책에 따라 제한될 수 있어요.</p></div></div>
              <div className="kickVoteProgress" role="progressbar" aria-label="강퇴 찬성표" aria-valuemin={0} aria-valuemax={kickVoteThreshold} aria-valuenow={Math.min(kickVoteCount, kickVoteThreshold)}>
                <span style={{ width: `${Math.min(100, (kickVoteCount / kickVoteThreshold) * 100)}%` }} />
              </div>
              <p><b>{kickVoteCount}</b> / {kickVoteThreshold}표 · 과반수까지 {Math.max(0, kickVoteThreshold - kickVoteCount)}표 남음</p>
              <div><button className="secondaryButton" type="button" onClick={() => { setKickCandidateId(null); setKickVoteCount(0); }}>투표 취소</button><button className="primaryButton" type="button" onClick={addDemoKickVote}>데모 찬성표 받기</button></div>
            </section>
          )}
          <div className="waitingFooter">
            <div><b>게임 구성</b><p>사랑의 작대기 + 랜덤 미니게임 3개 + 최종 선택 · 약 25분</p></div>
            <button className={`primaryButton readyButton ${isReady ? "ready" : ""}`} type="button" aria-pressed={isReady} onClick={() => setIsReady((ready) => !ready)}>
              {isReady ? "준비 완료 ✓" : "게임 준비하기"}
            </button>
          </div>
          {isReady && <p className="readyNotice" role="status">준비가 완료됐어요. 모든 참가자가 모이면 자동으로 게임을 시작합니다.</p>}
        </section>
      )}

      {screen === "landing" && (
        <section className="landing">
          <div className="heroCopy">
            <p className="eyebrow">어색함은 게임에게 맡겨요</p>
            <h1>처음 만난 우리,<br /><em>얼마나 잘 맞을까?</em></h1>
            <p className="heroDescription">6명이 함께하는 소셜 게임. 첫인상부터 취향과 가치관까지 자연스럽게 알아가세요.</p>
            <div className="heroActions">
              <button className="primaryButton" onClick={resetAll}>데모 시작하기 <span>→</span></button>
              <span className="sessionInfo"><b>5개 단계</b><small>첫인상부터 최종 선택까지</small></span>
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
              <div className={`stageItem ${index < 5 ? "available" : ""}`} key={stage} aria-current={index === 0 ? "step" : undefined}>
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
            <div><span style={{ background: drawerPlayer.color }}>{drawerPlayer.avatar}</span><b>{drawerPlayer.name}</b><small>그리는 사람 · {Math.floor(quizIndex / 2) + 1}/3</small></div>
            <i>♥</i>
            <div><span style={{ background: guesserPlayer.color }}>{guesserPlayer.avatar}</span><b>{guesserPlayer.name}</b><small>맞히는 사람</small></div>
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
          <h2>우리의 취향 싱크는<br /><em>{Math.round((score / quizQuestions.length) * 100)}%</em></h2>
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
            <button className="primaryButton" onClick={() => transitionTo("burger-intro")}>햄버거 팀워크로 <span>→</span></button>
          </div>
          <p className="privacyNote">같은 답은 점수가 되지만, 다른 답도 서로를 이해하는 좋은 대화 주제입니다.</p>
        </section>
      )}

      {screen === "burger-intro" && (
        <section className="burgerScreen burgerIntro">
          <p className="eyebrow">ROUND 04 · TEAMWORK</p>
          <h2>쌓이는 주문을<br /><em>둘이 함께 완성해요</em></h2>
          <p className="burgerLead">한 사람은 햄버거, 한 사람은 사이드 메뉴를 맡습니다. 역할은 시작할 때 무작위로 정해져요.</p>
          <div className="roleCards">
            <article>
              <span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span>
              <div><small>RANDOM ROLE</small><h3>{demoCouple[0].name}</h3><p>햄버거 또는 사이드 담당</p></div>
            </article>
            <i>?</i>
            <article>
              <span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span>
              <div><small>RANDOM ROLE</small><h3>{demoCouple[1].name}</h3><p>햄버거 또는 사이드 담당</p></div>
            </article>
          </div>
          <p className="passDevice">한 주문의 햄버거와 사이드가 모두 준비되어야 메뉴판이 통과됩니다.</p>
          <button className="primaryButton centerButton" onClick={startBurgerRound}>가게 문 열기 <span>→</span></button>
        </section>
      )}

      {screen === "burger-play" && currentOrder && (
        <section className="burgerScreen">
          <div className="burgerHud">
            <div><small>남은 시간</small><b aria-live="polite">{burgerTime}초</b></div>
            <div><small>완성 주문</small><b>{burgerScore}개</b></div>
            <div><small>실수</small><b>{burgerMistakes}회</b></div>
          </div>
          <div className="menuBoard" aria-label="대기 중인 메뉴판">
            {menuOrders.map((order, index) => (
              <article className={`menuTicket ${index === 0 ? "active" : ""}`} key={order.id}>
                <small>ORDER {String(order.id).padStart(2, "0")}</small>
                <b>{order.burger.name}</b>
                <span>{order.sides.map((side) => sideInfo[side].icon).join(" ")}</span>
                {index === 0 && <em>NOW</em>}
              </article>
            ))}
          </div>
          {orderPassed && <div className="orderPassed" role="status"><span>✓</span><b>주문 통과!</b><small>다음 메뉴판을 준비하고 있어요</small></div>}
          <div className="burgerGame">
            <article className="orderPanel" aria-live="polite">
              <small>ORDER {String(currentOrder.id).padStart(2, "0")}</small>
              <h2>{currentOrder.burger.name}</h2>
              <div className="recipeStrip" aria-label={`${currentOrder.burger.name} 재료 순서`}>
                {currentOrder.burger.recipe.map((ingredient, index) => (
                  <span className={index < burgerStack.length ? "done" : index === burgerStack.length ? "current" : ""} key={`${ingredient}-${index}`}>
                    {ingredientInfo[ingredient].icon}<small>{ingredientInfo[ingredient].label}</small>
                  </span>
                ))}
              </div>
              <div className="burgerBuild" aria-label="현재 쌓은 햄버거">
                {burgerStack.length ? burgerStack.map((ingredient, index) => <span key={`${ingredient}-${index}`}>{ingredientInfo[ingredient].icon}</span>) : <p>첫 재료부터 쌓아 주세요</p>}
              </div>
              <div className={`readyBadge ${burgerReady ? "ready" : ""}`}>{burgerReady ? "햄버거 준비 완료 ✓" : "햄버거 조립 중"}</div>
            </article>

            <article className="kitchenPanel builderPanel">
              <div className="panelTitle"><span style={{ background: burgerPlayer.color }}>{burgerPlayer.avatar}</span><div><small>BURGER</small><h2>{burgerPlayer.name} · 버거 조립</h2></div></div>
              <p>주문서의 왼쪽부터 재료를 선택하세요. 순서가 틀리면 다시 시작합니다.</p>
              <div className="ingredientButtons">
                {(Object.keys(ingredientInfo) as Ingredient[]).map((ingredient) => (
                  <button key={ingredient} onClick={() => addBurgerIngredient(ingredient)}
                    disabled={burgerReady || orderPassed}>
                    <span>{ingredientInfo[ingredient].icon}</span>{ingredientInfo[ingredient].label}
                  </button>
                ))}
              </div>
            </article>

            <article className="kitchenPanel sidePanel">
              <div className="panelTitle"><span style={{ background: sidePlayer.color }}>{sidePlayer.avatar}</span><div><small>SIDE</small><h2>{sidePlayer.name} · 사이드 준비</h2></div></div>
              <p>메뉴판에 포함된 사이드 3~4개를 찾아 준비하세요.</p>
              <div className="sideOrderList">
                {currentOrder.sides.map((side) => <span className={preparedSides.includes(side) ? "done" : ""} key={side}>{sideInfo[side].icon} {sideInfo[side].label}</span>)}
              </div>
              <div className="ingredientButtons sideButtons">
                {sideItems.map((side) => (
                  <button key={side} onClick={() => prepareSide(side)} disabled={preparedSides.includes(side) || orderPassed}>
                    <span>{sideInfo[side].icon}</span>{sideInfo[side].label}
                  </button>
                ))}
              </div>
              <div className={`readyBadge ${sidesReady ? "ready" : ""}`}>{sidesReady ? "사이드 준비 완료 ✓" : `${preparedSides.length} / ${currentOrder.sides.length} 준비`}</div>
            </article>
          </div>
          <button className="secondaryButton centerButton" onClick={() => transitionTo("burger-result")}>라운드 마치기</button>
        </section>
      )}

      {screen === "burger-result" && (
        <section className="resultScreen quizFinal">
          <p className="eyebrow">ROUND 04 · COMPLETE</p>
          <h2>함께 통과시킨 주문은<br /><em>{burgerScore}개</em></h2>
          <div className="teamResult" aria-live="polite">
            <span>♥</span>
            <p>{burgerScore >= 5 ? "말하지 않아도 손발이 척척 맞는 환상의 주방 팀이에요!" : burgerScore >= 2 ? "역할을 나누니 점점 호흡이 좋아지고 있어요!" : "첫 영업은 연습이죠. 서로 신호를 맞춰 다시 도전해 보세요!"}</p>
          </div>
          <div className="resultActions">
            <button className="secondaryButton" onClick={startBurgerRound}>다시 도전하기</button>
            <button className="primaryButton" onClick={openFinalResults}>최종 결과 보기 <span>→</span></button>
          </div>
          <p className="privacyNote">정식 멀티플레이에서는 두 사람이 각자의 화면에서 동시에 역할을 수행합니다.</p>
        </section>
      )}

      {screen === "final-result" && (
        <section className="finalRankingScreen">
          <div className="finalTitle">
            <p className="eyebrow">FINAL · COUPLE RANKING</p>
            <h2>오늘 가장 빛난<br /><em>세 커플을 소개합니다</em></h2>
            <p>첫인상부터 팀워크까지, 함께 만든 모든 순간을 합산했어요.</p>
          </div>
          <div className="podium" aria-label="최종 커플 순위">
            {finalRanking.map((entry, index) => {
              const mileage = [300, 200, 100][index];
              return (
                <article className={`podiumCard rank${index + 1} ${entry.isOurs ? "ourCouple" : ""}`} key={`${entry.couple[0].id}-${entry.couple[1].id}`}>
                  <div className="rankBadge" aria-label={`${index + 1}등 ${medalInfo[index].label}`}><span>{medalInfo[index].icon}</span><small>{medalInfo[index].label}</small></div>
                  <div className="rankingCouple">
                    <div><span style={{ background: entry.couple[0].color }}>{entry.couple[0].avatar}</span><b>{entry.couple[0].name}</b></div>
                    <i>♥</i>
                    <div><span style={{ background: entry.couple[1].color }}>{entry.couple[1].avatar}</span><b>{entry.couple[1].name}</b></div>
                  </div>
                  <strong>{entry.score}<small>점</small></strong>
                  <div className="mileageReward"><span>✦</span><p>각자 <b>{mileage} 마일리지</b><small>꾸미기 아이템에 사용할 수 있어요</small></p></div>
                  {entry.isOurs && <em className="ourBadge">우리 커플</em>}
                </article>
              );
            })}
          </div>
          <div className="scoreBreakdown">
            <div><span>01</span><p>첫인상 매칭<b>기본 55점</b></p></div>
            <div><span>02</span><p>취향 퀴즈<b>{score} / {quizQuestions.length}</b></p></div>
            <div><span>03</span><p>상황 궁합<b>{compatScore} / {compatibilityQuestions.length}</b></p></div>
            <div><span>04</span><p>팀워크 주문<b>{burgerScore}개</b></p></div>
          </div>
          {mileageNotice && <p className="mileageNotice" role="status">{mileageNotice}</p>}
          <p className="nextRoundNotice">이제 서로의 최종 호감을 비공개로 선택합니다. 두 사람의 마음이 같을 때만 1:1 대화가 열려요.</p>
          <div className="resultActions">
            <button className="secondaryButton" onClick={() => transitionTo("burger-intro")}>팀워크 다시 하기</button>
            <button className="primaryButton" onClick={() => { setFinalFirstChoice(null); setFinalSecondChoice(null); transitionTo("final-choice-first"); }}>최종 호감 선택 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "final-choice-first" && (
        <section className="finalChoiceScreen">
          <p className="eyebrow">FINAL CHOICE · 1 / 2</p>
          <div className="choiceAvatar" style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</div>
          <h2><em>{demoCouple[0].name}</em>님의 마음은?</h2>
          <p>오늘 함께한 파트너와 게임 밖에서도 대화를 이어가고 싶나요?</p>
          <div className="finalChoiceButtons">
            <button onClick={() => { setFinalFirstChoice(true); transitionTo("final-choice-second"); }}><span>♥</span><b>대화를 이어가고 싶어요</b><small>상대도 같은 선택을 해야 공개됩니다</small></button>
            <button onClick={() => { setFinalFirstChoice(false); transitionTo("final-choice-second"); }}><span>☺</span><b>좋은 게임 친구로 남을래요</b><small>선택은 상대에게 직접 공개되지 않아요</small></button>
          </div>
          <p className="privacyNote">선택 후 화면을 다음 사람에게 건네주세요.</p>
        </section>
      )}

      {screen === "final-choice-second" && (
        <section className="finalChoiceScreen">
          <p className="eyebrow">FINAL CHOICE · 2 / 2</p>
          <div className="choiceAvatar" style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</div>
          <h2><em>{demoCouple[1].name}</em>님의 마음은?</h2>
          <p>첫 번째 사람의 선택은 안전하게 숨겨져 있어요. 나의 마음대로 골라주세요.</p>
          <div className="finalChoiceButtons">
            <button onClick={() => { setFinalSecondChoice(true); transitionTo("final-reveal"); }}><span>♥</span><b>대화를 이어가고 싶어요</b><small>서로 선택했다면 대화방이 열립니다</small></button>
            <button onClick={() => { setFinalSecondChoice(false); transitionTo("final-reveal"); }}><span>☺</span><b>좋은 게임 친구로 남을래요</b><small>부담 없이 게임을 마무리합니다</small></button>
          </div>
        </section>
      )}

      {screen === "final-reveal" && finalFirstChoice !== null && finalSecondChoice !== null && (
        <section className="finalRevealScreen">
          <p className="eyebrow">FINAL CHOICE · REVEAL</p>
          {finalFirstChoice && finalSecondChoice ? (
            <>
              <div className="matchedHeart" aria-hidden="true">♥</div>
              <h2>두 사람의 마음이<br /><em>서로 통했어요</em></h2>
              <div className="matchedCouple">
                <span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><b>{demoCouple[0].name}</b><i>♥</i><b>{demoCouple[1].name}</b><span style={{ background: demoCouple[1].color }}>{demoCouple[1].avatar}</span>
              </div>
              <p>둘만 볼 수 있는 조용한 대화 공간을 준비했어요.</p>
              <button className="primaryButton centerButton" onClick={() => openPrivateChat()}>1:1 대화 시작하기 <span>→</span></button>
            </>
          ) : (
            <>
              <div className="matchedHeart friend" aria-hidden="true">☺</div>
              <h2>오늘의 좋은 인연으로<br /><em>게임을 마쳤어요</em></h2>
              <p>누가 어떤 선택을 했는지는 공개하지 않아요. 함께한 즐거운 순간만 간직해 주세요.</p>
              <button className="primaryButton centerButton" onClick={() => transitionTo("landing")}>처음으로 <span>→</span></button>
            </>
          )}
        </section>
      )}

      {screen === "private-chat" && (
        <section className="chatScreen">
          <header className="chatHeader">
            <div className="chatCouple"><span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><i>♥</i><span style={{ background: activeChatFriend.color }}>{activeChatFriend.avatar}</span></div>
            <div><h2>{demoCouple[0].name} · {activeChatFriend.name}</h2><p>둘만의 1:1 대화 · <b aria-label={`남은 시간 ${chatTimeLabel}`}>{chatTimeLabel}</b></p></div>
            <button className="friendAddButton" type="button" disabled={friendStatus !== "none"} onClick={requestFriend}>
              {friendStatus === "none" ? "친구 추가" : friendStatus === "pending" ? "수락 대기 중" : "친구 ✓"}
            </button>
            {chatEndedBy
              ? <button className="secondaryButton compactButton" onClick={() => transitionTo("friends")}>채팅방 나가기</button>
              : <button className="secondaryButton compactButton" onClick={endPrivateChat}>대화 종료</button>}
          </header>
          <div className="chatMessages" aria-live="polite" aria-label="대화 내용">
            {chatMessages.map((message, index) => (
              message.from === "system"
                ? <p className="systemMessage" key={index}>{message.text}</p>
                : <div className={`chatBubble ${message.from === "me" ? "mine" : "partner"}`} key={index}>{message.text}</div>
            ))}
            {chatEndedBy && <div className="chatExpired" role="status"><b>대화가 종료됐어요</b><p>상대방 화면에도 종료 메시지가 표시됩니다.</p></div>}
            {chatSeconds === 0 && !chatEndedBy && <div className="chatExpired" role="status"><b>1시간 대화가 종료됐어요</b><p>친구가 되었다면 친구창에서 500 마일리지로 다시 대화할 수 있어요.</p></div>}
          </div>
          <form className="chatComposer" onSubmit={sendChatMessage}>
            <label className="srOnly" htmlFor="chat-message">메시지 입력</label>
            <input id="chat-message" value={chatInput} onChange={(event) => setChatInput(event.target.value)}
              maxLength={200} autoComplete="off" disabled={chatSeconds === 0 || chatEndedBy !== null}
              placeholder={chatEndedBy ? "종료된 대화입니다" : "편안하게 첫 인사를 건네보세요"} />
            <button className="primaryButton" disabled={!chatInput.trim() || chatSeconds === 0 || chatEndedBy !== null} type="submit">보내기</button>
          </form>
          <p className="chatSafety">데모 메시지는 서버로 전송되지 않으며 새로고침하면 사라집니다. 연락처나 민감한 개인정보 공유는 신중히 결정해 주세요.</p>
        </section>
      )}

      {screen === "friends" && (
        <section className="friendsScreen">
          <div className="friendsTitle">
            <p className="eyebrow">MY HEART ROUND</p>
            <h2>친구와 마일리지</h2>
            <div className="mileageCard"><span>✦</span><p>보유 마일리지<b>{mileageBalance}</b><small>게임 순위 보상으로 적립됩니다</small></p></div>
          </div>
          <div className="friendList" aria-label="내 친구 3명">
            {demoFriendPlayers.map((friend, index) => (
              <article className="friendCard" key={friend.id}>
                <span className="friendAvatar" style={{ background: friend.color }}>{friend.avatar}</span>
                <div><h3>{friend.name}</h3><p>{index === 0 ? "최종 선택으로 연결된 친구" : "Heart Round 게임 친구"}</p></div>
                <button className="primaryButton" disabled={mileageBalance < 500 || pendingChatFriendId !== null}
                  onClick={() => reopenFriendChat(friend.id)}>500 마일리지로 대화 신청</button>
              </article>
            ))}
          </div>
          {mileageNotice && <p className="mileageNotice" role="status">{mileageNotice}</p>}
          <div className="chargePreview">
            <div><h3>마일리지 충전</h3><p>마일리지가 부족할 때 사용할 수 있는 기능입니다.</p></div>
            <button className="secondaryButton" disabled>결제 정책 준비 중</button>
          </div>
          <p className="privacyNote">현재는 데모 데이터입니다. 실제 서비스에서는 로그인 계정에 마일리지·친구·대화 이용 내역이 안전하게 저장됩니다.</p>
          <button className="secondaryButton centerButton" onClick={() => transitionTo("landing")}>게임으로 돌아가기</button>
          {pendingChatFriend && (
            <div className="requestBackdrop">
              <section className="chatRequestDialog" role="dialog" aria-modal="true" aria-labelledby="chat-request-title">
                <span className="requestBell">💌</span>
                <p className="eyebrow">상대방 화면 · 대화 요청</p>
                <h2 id="chat-request-title">{demoCouple[0].name}님이<br />채팅하기를 원합니다</h2>
                <div className="requestPair">
                  <span style={{ background: demoCouple[0].color }}>{demoCouple[0].avatar}</span><i>→</i><span style={{ background: pendingChatFriend.color }}>{pendingChatFriend.avatar}</span>
                </div>
                <p><b>{pendingChatFriend.name}</b>님, 1시간 대화에 참여하시겠습니까?</p>
                <div className="requestActions">
                  <button className="secondaryButton" onClick={rejectChatRequest}>거절하기</button>
                  <button className="primaryButton" onClick={acceptChatRequest}>참여하기</button>
                </div>
                <small>거절하면 신청자에게 250 마일리지가 반환됩니다.</small>
              </section>
            </div>
          )}
        </section>
      )}
      </main>
    </>
  );
}
