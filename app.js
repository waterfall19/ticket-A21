// app.js
const selText = document.getElementById("selText");
const timebar = document.getElementById("timebar");
const sbLeft = document.getElementById("sbLeft");

const island = document.getElementById("island");
const islandDot = document.getElementById("islandDot");
const islandText = document.getElementById("islandText");

const ticket = document.getElementById("ticket");
const ticketHeader = document.getElementById("ticketHeader");
const ticketBtn = document.getElementById("ticketBtn");
const ticketIcon = document.getElementById("ticketIcon");
const usedAt = document.getElementById("usedAt");

const gateWrap = document.getElementById("gateWrap");
const gateBehind = document.getElementById("gateBehind");
const gateFront = document.getElementById("gateFront");
const triLeft = document.getElementById("triLeft");
const triRight = document.getElementById("triRight");
const gateNotice = document.getElementById("gateNotice");

function pad(n){ return String(n).padStart(2, "0"); }
function dayJP(d){ return ["日","月","火","水","木","金","土"][d.getDay()]; }

// ✅ 상단 ms 2자리 + 일본 요일
function tickTime(){
  const d = new Date();
  const ms2 = Math.floor(d.getMilliseconds()/10).toString().padStart(2,"0");
  timebar.textContent =
    `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} (${dayJP(d)}) ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms2}`;

  sbLeft.textContent = `${d.getHours()}:${pad(d.getMinutes())}`;
}
tickTime();
setInterval(tickTime, 50);

// ✅ GATE 뒤 배경색(6구간)
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

// ✅ 화살표 반짝
let blinkTimer = null;
let blinkState = false;
function startArrowBlink(){
  stopArrowBlink();
  blinkState = false;
  blinkTimer = setInterval(() => {
    blinkState = !blinkState;
    const a = blinkState ? 1 : 0.35;
    triLeft.style.opacity = String(a);
    triRight.style.opacity = String(a);
  }, 220);
}
function stopArrowBlink(){
  if (blinkTimer) clearInterval(blinkTimer);
  blinkTimer = null;
  triLeft.style.opacity = "1";
  triRight.style.opacity = "1";
}

// ✅ Dynamic Island 상태
let islandResetTimer = null;
function setIslandMode(mode, text){
  if (!island || !islandDot || !islandText) return; // ✅ 안전 가드

  island.classList.remove("mode-gate","mode-done");
  if (mode) island.classList.add(mode);
  islandText.textContent = text ?? "REC";
  islandDot.style.opacity = (mode === "mode-done") ? "0.0" : "0.95";

  clearTimeout(islandResetTimer);
  if (mode === "mode-done") {
    islandResetTimer = setTimeout(() => {
      island.classList.remove("mode-done");
      islandText.textContent = "REC";
      islandDot.style.opacity = "0.95";
    }, 900);
  }
}

// 상태
let selected = false;
let used = false;

// ✅ 티켓 클릭: 선택(핑크) -> GATE 오픈
ticketBtn.addEventListener("click", () => {
  if (used) return;

  selected = !selected;
  selText.textContent = selected ? "1/1" : "0/1";

  ticketBtn.classList.toggle("selected", selected);

  // 헤더 색 직접 조작(원본 느낌)
  ticketHeader.style.background = selected ? "var(--pink)" : "#fff";
  ticketHeader.style.color = selected ? "#fff" : "#111";
  ticketHeader.style.borderBottom = selected ? "none" : "2px dashed rgba(0,0,0,.22)";

  if (selected) openGate();
  else closeGate(true);
});

// ✅ GATE 열기/닫기
function openGate(){
  gateWrap.classList.add("open");
  gateWrap.setAttribute("aria-hidden","false");

  gateFront.style.transform = "translateX(0px)";
  gateBehind.style.background = fixedColors[0];

  // ✅ 노란 안내바 표시(화면 상단 fixed)
  gateNotice.style.display = "block";
  gateNotice.setAttribute("aria-hidden","false");

  startArrowBlink();
  setIslandMode("mode-gate","GATE…");
}

function closeGate(keepIsland=false){
  gateWrap.classList.remove("open");
  gateWrap.setAttribute("aria-hidden","true");
  stopArrowBlink();

  gateNotice.style.display = "none";
  gateNotice.setAttribute("aria-hidden","true");

  if (!keepIsland) setIslandMode(null, "REC");
}

// ✅ GATE 드래그 -> 끝까지면 사용 확정
let dragging = false;
let startX = 0;
let curX = 0;

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function getMaxX(){
  const w = gateWrap.getBoundingClientRect().width;
  return w * 0.92;
}

gateFront.addEventListener("pointerdown", (e) => {
  if (!gateWrap.classList.contains("open")) return;
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
  gateBehind.style.background = colorFromProgress(prog);
});

function snapBack(){
  gateFront.style.transition = "transform 180ms ease";
  gateFront.style.transform = "translateX(0px)";
  curX = 0;
  gateBehind.style.background = fixedColors[0];
  setTimeout(() => (gateFront.style.transition = ""), 190);
}

function markUsed(){
  used = true;
  selected = false;
  selText.textContent = "0/1";

  // ✅ ticket 전체에 used 상태 부여
  ticket.classList.add("used");

  // ✅ 버튼 상태 정리
  ticketBtn.classList.remove("selected", "idle");
  ticketBtn.classList.add("used");
  ticketBtn.disabled = true;

  // ✅ 헤더는 핑크 유지
  ticketHeader.style.background = "var(--pink)";
  ticketHeader.style.color = "#fff";
  ticketHeader.style.borderBottom = "none";

  // ✅ 아이콘 변경
  ticketIcon.classList.remove("ok");
  ticketIcon.classList.add("used");
  ticketIcon.textContent = "🎟";

  // ✅ 사용일시
  const d = new Date();
  usedAt.textContent =
    `使用日時: ${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}(${dayJP(d)}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  usedAt.style.display = "block";

  setIslandMode("mode-done","DONE");
}

gateFront.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;

  const maxX = getMaxX();
  const prog = maxX === 0 ? 0 : (curX / maxX);

  if (prog >= 0.85) {
    closeGate();
    markUsed();
  } else {
    snapBack();
  }
});

gateFront.addEventListener("pointercancel", () => {
  dragging = false;
  snapBack();
});
