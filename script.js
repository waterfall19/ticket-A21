const gateWrap = document.getElementById("gateWrap");
const gateMover = document.getElementById("gateMover");
const gateTint = document.getElementById("gateTint");
const usedToast = document.getElementById("usedToast");
const liveTime = document.getElementById("liveTime");

let startX = 0;
let currentX = 0;
let dragging = false;
const MAX_SLIDE = 120;

/* 시간 업데이트 (분초밀리초만) */
function updateTime() {
  const now = new Date();
  const time =
    now.toLocaleTimeString("ja-JP", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) +
    "." +
    String(now.getMilliseconds()).padStart(2, "0");

  liveTime.textContent = time;
}
setInterval(updateTime, 50);
updateTime();

/* 터치 시작 */
gateWrap.addEventListener("touchstart", (e) => {
  dragging = true;
  startX = e.touches[0].clientX;
});

/* 터치 이동 */
gateWrap.addEventListener("touchmove", (e) => {
  if (!dragging) return;

  currentX = e.touches[0].clientX - startX;
  currentX = Math.max(0, Math.min(MAX_SLIDE, currentX));

  gateMover.style.transform = `translateX(${currentX}px)`;
  gateTint.style.opacity = currentX / MAX_SLIDE;
});

/* 터치 종료 */
gateWrap.addEventListener("touchend", () => {
  dragging = false;

  if (currentX >= MAX_SLIDE * 0.9) {
    gateMover.style.transform = `translateX(${MAX_SLIDE}px)`;
    gateTint.style.opacity = 1;

    usedToast.style.opacity = 1;
    setTimeout(() => {
      usedToast.style.opacity = 0;
    }, 1200);
  } else {
    gateMover.style.transform = `translateX(0)`;
    gateTint.style.opacity = 0;
  }

  currentX = 0;
});
