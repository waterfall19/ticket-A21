const selText = document.getElementById("selText");
const timebar = document.getElementById("timebar");
const sbLeft = document.getElementById("sbLeft");
const closeBtn = document.getElementById("closeBtn");

const eventCard = document.getElementById("eventCard");

const ticket = document.getElementById("ticket");
const ticketHeader = document.getElementById("ticketHeader");
const ticketBtn = document.getElementById("ticketBtn");
const usedAt = document.getElementById("usedAt");

const gateWrap = document.getElementById("gateWrap");
const gateBehind = document.getElementById("gateBehind");
const gateFront = document.getElementById("gateFront");
const triLeft = document.getElementById("triLeft");
const triRight = document.getElementById("triRight");
const gateNotice = document.getElementById("gateNotice");

function pad(n){ return String(n).padStart(2, "0"); }
function dayJP(d){ return ["日","月","火","水","木","金","土"][d.getDay()]; }

/* 상단 ms 2자리 + 일본 요일 */
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

/* GATE 뒤 배경색(6구간) */
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

/* 화살표 반짝 */
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

/* 상태 */
let selected = false;
let used = false;

/* ✅ 티켓 클릭: 선택만(게이트 절대 안 뜸) */
ticketBtn.addEventListener("click", () => {
  if (used) return;

  selected = !selected;
  selText.textContent = selected ? "1/1" : "0/1";

  ticketBtn.classList.toggle("selected", selected);

  ticketHeader.style.background = selected ? "var(--pink)" : "#fff";
  ticketHeader.style.color = selected ? "#fff" : "#111";
  ticketHeader.style.borderBottom = selected ? "none" : "2px dashed rgba(0,0,0,.22)";
});

/* ✅ 이벤트 카드(게이트 영역) 터치: 선택된 상태일 때만 gate open */
eventCard.addEventListener("click", (e) => {
  if (used) return;
  if (!selected) return;

  // 티켓 영역 클릭은 무시
  if (e.target.closest(".ticket")) return;

  // 이미 열려있으면 무시
  if (gateWrap.classList.contains("open")) return;

  openGate();
});

/* 닫기 버튼 */
closeBtn.addEventListener("click", () => {
  if (gateWrap.classList.contains("open")) closeGate();
  resetSelection();
});

function resetSelection(){
  selected = false;
  selText.textContent = "0/1";
  ticketBtn.classList.remove("selected");
  ticketHeader.style.background = "#fff";
  ticketHeader.style.color = "#111";
  ticketHeader.style.borderBottom = "2px dashed rgba(0,0,0,.22)";
}

/* gate open/close */
function openGate(){
  gateWrap.classList.add("open");
  gateWrap.setAttribute("aria-hidden","false");
  gateFront.style.transform = "translateX(0px)";
  gateBehind.style.background = fixedColors[0];

  gateNotice.style.display = "block";
  startArrowBlink();
}

function closeGate(){
  gateWrap.classList.remove("open");
  gateWrap.setAttribute("aria-hidden","true");
  stopArrowBlink();
  gateNotice.style.display = "none";
}

/* 드래그 -> 사용 확정 */
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

  ticket.classList.add("used");
  ticketBtn.classList.remove("selected", "idle");
  ticketBtn.disabled = true;

  ticketHeader.style.background = "var(--pink)";
  ticketHeader.style.color = "#fff";
  ticketHeader.style.borderBottom = "none";

  const d = new Date();
  usedAt.textContent =
    `使用日時: ${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}(${dayJP(d)}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  usedAt.style.display = "block";
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
