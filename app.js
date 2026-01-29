const screenImg = document.getElementById("screenImg");
const ticketHotspot = document.getElementById("ticketHotspot");
const topHotspot = document.getElementById("topHotspot");

const gateWrap = document.getElementById("gateWrap");
const gateFront = document.getElementById("gateFront");
const gateTint = document.getElementById("gateTint");
const arrowLayer = document.getElementById("arrowLayer");
const noticeLayer = document.getElementById("noticeLayer");

const usedToast = document.getElementById("usedToast");
const timeText = document.getElementById("timeText");
const labelText = document.getElementById("labelText");

/* ===== 이미지 경로 ===== */
const ASSETS = {
  idle: "./assets/screen_idle.png",
  selected: "./assets/screen_selected.png",
  used: "./assets/screen_used.png",
};

/* ===== 상태 ===== */
let state = "idle";     // idle | selected | used
let gateOpen = false;
let used = false;

/* ===== 시간 표시(4번) ===== */
function pad(n){ return String(n).padStart(2,"0"); }
function dayJP(d){ return ["日","月","火","水","木","金","土"][d.getDay()]; }

function tickTime(){
  const d = new Date();
  const ms2 = Math.floor(d.getMilliseconds()/10).toString().padStart(2,"0");
  timeText.textContent =
    `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} (${dayJP(d)}) ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms2}`;

  // labelText는 필요하면 켜서 쓰기(기본 숨김)
  // labelText.textContent = "텍스트";
}
tickTime();
setInterval(tickTime, 50);

/* ===== 티켓 탭: (1) idle <-> selected ===== */
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

/* ===== (2) 상단 흰색 터치 -> gate open ===== */
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
  gateFront.style.transform = "translateX(0px)";
  curX = 0;

  startArrowBlink();
  // noticeLayer는 gateWrap 안에 있으니 자동 표시됨
}

function closeGate(){
  gateOpen = false;
  gateWrap.classList.remove("open");
  gateWrap.setAttribute("aria-hidden","true");
  stopArrowBlink();
}

/* ===== 화살표 깜빡임(사진4) ===== */
let blinkTimer = null;
let blinkState = false;

function startArrowBlink(){
  stopArrowBlink();
  blinkState = false;
  blinkTimer = setInterval(() => {
    blinkState = !blinkState;
    arrowLayer.style.opacity = blinkState ? "1" : "0.35";
  }, 220);
}
function stopArrowBlink(){
  if (blinkTimer) clearInterval(blinkTimer);
  blinkTimer = null;
  arrowLayer.style.opacity = "1";
}

/* ===== (2) 드래그: gateFront 이동 + tint 색변화 ===== */
let dragging = false;
let startX = 0;
let curX = 0;

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function getMaxX(){
  const w = gateWrap.getBoundingClientRect().width;
  return w * 0.92;
}

/* 진행도에 따른 색(원래 하던 6구간 느낌) */
const fixedColors = [
  "#2B79B8", // 0~1/12
  "#3A9AA3", // 1/12~2/12
  "#3A9C88", // 2/12~3/12
  "#8DB66A", // 3/12~4/12
  "#F3EA63", // 4/12~5/12
  "#E65752", // 5/12~1
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

gateFront.addEventListener("pointerdown", (e) => {
  if (!gateOpen) return;
  if (state !== "selected") return;

  dragging = true;
  startX = e.clientX - curX;
  gateFront.setPointerCapture(e.pointerId);
});

gateFront.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const maxX = getMaxX();
  curX = clamp(e.clientX - startX, 0, maxX);
  gateFront.style.transform = `translateX(${curX}px)`;

  const prog = maxX === 0 ? 0 : (curX / maxX);
  gateTint.style.backgroundColor = colorFromProgress(prog);
});

gateFront.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;

  const maxX = getMaxX();
  const prog = maxX === 0 ? 0 : (curX / maxX);

  if (prog >= 0.85) {
    // (3) 완료
    finishUse();
  } else {
    // 원위치
    snapBack();
  }
});

gateFront.addEventListener("pointercancel", () => {
  dragging = false;
  snapBack();
});

function snapBack(){
  gateFront.style.transition = "transform 180ms ease";
  gateFront.style.transform = "translateX(0px)";
  curX = 0;
  gateTint.style.backgroundColor = "transparent";
  setTimeout(() => { gateFront.style.transition = ""; }, 190);
}

/* ===== (3) 사용 완료 처리 ===== */
function finishUse(){
  // 게이트/화살표/노란창/진행도 레이어 사라짐
  closeGate();
  gateTint.style.backgroundColor = "transparent";

  // 화면을 사용완료(회색 티켓)로 변경
  state = "used";
  screenImg.src = ASSETS.used;

  // 사용완료 토스트(사진7) 잠깐 표시 후 페이드아웃
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
