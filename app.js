const screenImg = document.getElementById("screenImg");
const ticketHotspot = document.getElementById("ticketHotspot");
const topHotspot = document.getElementById("topHotspot");

const gateWrap = document.getElementById("gateWrap");
const gateFront = document.getElementById("gateFront");
const gateTint = document.getElementById("gateTint");

const arrowLayer = document.getElementById("arrowLayer");
const usedToast = document.getElementById("usedToast");

/* 이미지 경로 */
const ASSETS = {
  idle: "./assets/screen_idle.png",
  selected: "./assets/screen_selected.png",
  used: "./assets/screen_used.png",
};

/* 상태 */
let state = "idle";     // idle | selected | used
let gateOpen = false;

/* (1) 티켓 탭: idle <-> selected */
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

/* (2) 상단 흰색 터치 -> gate open (선택 상태일 때만) */
topHotspot.addEventListener("click", () => {
  if (state !== "selected") return;
  if (gateOpen) return;
  openGate();
});

/* gate open/close */
function openGate(){
  gateOpen = true;
  gateWrap.classList.add("open");
  gateWrap.setAttribute("aria-hidden","false");

  gateFront.style.transform = "translateX(0px)";
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

/* 화살표 깜빡임 */
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

/* 드래그: gateFront 이동 + tint 색변화 */
let dragging = false;
let startX = 0;
let curX = 0;

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function getMaxX(){
  const w = gateWrap.getBoundingClientRect().width;
  return w * 0.92;
}

/* 진행도에 따른 색 */
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
    finishUse();
  } else {
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

/* 사용 완료 */
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
