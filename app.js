const screenImg = document.getElementById("screenImg");
const ticketHotspot = document.getElementById("ticketHotspot");
const topHotspot = document.getElementById("topHotspot");

const gateWrap = document.getElementById("gateWrap");
const gateMover = document.getElementById("gateMover");
const gateTint = document.getElementById("gateTint");
const arrowImg = document.getElementById("arrowImg");

const usedToast = document.getElementById("usedToast");

const timeText = document.getElementById("timeText");
const blockText = document.getElementById("blockText");
const numText = document.getElementById("numText");

/* ===== 이미지 경로 ===== */
const ASSETS = {
  idle: "./assets/screen_idle.png",
  selected: "./assets/screen_selected.png",
  used: "./assets/screen_used.png",
};

/* ===== 텍스트 값(네가 원하는 값으로 바꿔도 됨) ===== */
blockText.textContent = "F";   // 작은 동그라미(블록)
numText.textContent = "60";    // 긴 동그라미(번호)

/* ===== 상태 ===== */
let state = "idle";      // idle | selected | used
let gateOpen = false;

/* ===== (상단 시간: 밀리초 포함) ===== */
function pad(n){ return String(n).padStart(2,"0"); }
function dayJP(d){ return ["日","月","火","水","木","金","土"][d.getDay()]; }

function tickTime(){
  const d = new Date();
  const ms2 = Math.floor(d.getMilliseconds()/10).toString().padStart(2,"0");
  timeText.textContent =
    `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} (${dayJP(d)}) ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms2}`;
}
tickTime();
setInterval(tickTime, 50);

/* ===== (1) 티켓 터치: 흰색 ↔ 핑크 ===== */
ticketHotspot.addEventListener("click", () => {
  if (state === "used") return;

  if (state === "idle") {
    state = "selected";
    screenImg.src = ASSETS.selected;
  } else {
    state = "idle";
    screenImg.src = ASSETS.idle;
  }
});

/* ===== (2) 위 흰색 영역 터치: gate open (선택 상태만) ===== */
topHotspot.addEventListener("click", () => {
  if (state !== "selected") return;
  if (gateOpen) return;
  openGate();
});

/* ===== gate open/close ===== */
function openGate(){
  gateOpen = true;
  gateWrap.classList.add("open");
  gateWrap.setAttribute("aria-hidden","false");

  gateMover.style.transform = "translateX(0px)";
  gateMover.style.transition = "";
  gateTint.style.backgroundColor = "transparent";

  curX = 0;
  startArrowBlink();
}

function closeGate(){
  gateOpen = false;
  gateWrap.classList.remove("open");
  gateWrap.setAttribute("aria-hidden","true");
  stopArrowBlink();
}

/* ===== 화살표 opacity 깜빡 ===== */
let blinkTimer = null;
let blinkState = false;

function startArrowBlink(){
  stopArrowBlink();
  blinkState = false;
  blinkTimer = setInterval(() => {
    blinkState = !blinkState;
    arrowImg.style.opacity = blinkState ? "1" : "0.35";
  }, 220);
}

function stopArrowBlink(){
  if (blinkTimer) clearInterval(blinkTimer);
  blinkTimer = null;
  arrowImg.style.opacity = "1";
}

/* ===== gateTint 진행도 색 ===== */
const fixedColors = [
  "#2B79B8",
  "#3A9AA3",
  "#3A9C88",
  "#8DB66A",
  "#F3EA63",
  "#E65752",
];
function colorFromProgress(p){
  const t = Math.max(0, Math.min(1, p));
  if (t < 1/12) return fixedColors[0];
  if (t < 2/12) return fixedColors[1];
  if (t < 3/12) return fixedColors[2];
  if (t < 4/12) return fixedColors[3];
  if (t < 5/12) return fixedColors[4];
  return fixedColors[5];
}

/* ===== (드래그) gateMover 이동 + tint 변화 ===== */
let dragging = false;
let startX = 0;
let curX = 0;

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function getMaxX(){
  const w = gateWrap.getBoundingClientRect().width;
  return w * 0.92;
}

gateMover.addEventListener("pointerdown", (e) => {
  if (!gateOpen) return;
  if (state !== "selected") return;

  dragging = true;
  startX = e.clientX - curX;
  gateMover.setPointerCapture(e.pointerId);
});

gateMover.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const maxX = getMaxX();
  curX = clamp(e.clientX - startX, 0, maxX);
  gateMover.style.transform = `translateX(${curX}px)`;

  const prog = maxX === 0 ? 0 : (curX / maxX);
  gateTint.style.backgroundColor = colorFromProgress(prog);
});

gateMover.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;

  const maxX = getMaxX();
  const prog = maxX === 0 ? 0 : (curX / maxX);

  if (prog >= 0.85) {
    finishUse();
  } else {
    snapBack();
  }
});

gateMover.addEventListener("pointercancel", () => {
  dragging = false;
  snapBack();
});

function snapBack(){
  gateMover.style.transition = "transform 180ms ease";
  gateMover.style.transform = "translateX(0px)";
  curX = 0;
  gateTint.style.backgroundColor = "transparent";
  setTimeout(() => { gateMover.style.transition = ""; }, 190);
}

/* ===== (3) 사용 완료: screen_used로 + 토스트 ===== */
function finishUse(){
  closeGate();
  gateTint.style.backgroundColor = "transparent";

  state = "used";
  screenImg.src = ASSETS.used;

  showUsedToast();
}

function showUsedToast(){
  usedToast.classList.remove("fade");
  usedToast.classList.add("show");
  usedToast.setAttribute("aria-hidden","false");

  setTimeout(() => {
    usedToast.classList.add("fade");
    setTimeout(() => {
      usedToast.classList.remove("show");
      usedToast.classList.remove("fade");
      usedToast.setAttribute("aria-hidden","true");
    }, 260);
  }, 600);
}
