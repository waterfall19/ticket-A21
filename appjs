:root{
  /* ===== screen_* 이미지 비율 고정 (941x2048) ===== */
  --screen-w: 941;
  --screen-h: 2048;

  /* ===== (핫스팟) 티켓 영역: screen_selected에서 핑크 티켓 bbox 기반 ===== */
  --ticket-left: 2.1%;
  --ticket-top: 34.0%;
  --ticket-w: 95.8%;
  --ticket-h: 16.0%;

  /* ===== (핫스팟) 위 흰색 영역: 티켓 위 전체 ===== */
  --top-left: 0%;
  --top-top: 0%;
  --top-w: 100%;
  --top-h: 34.0%;

  /* ===== (텍스트) 동그라미 위치 ===== */
  /* 1) 청록바 오른쪽(밀리초 시간) */
  --time-right: 6%;
  --time-top: 12.1%;
  --time-size: clamp(16px, 2.2vw, 22px);

  /* 2) 핑크 티켓: 블록 */
  --block-left: 36%;
  --block-top: 44.9%;
  --block-size: clamp(18px, 2.4vw, 26px);

  /* 3) 핑크 티켓: 번호 */
  --num-left: 48%;
  --num-top: 44.6%;
  --num-size: clamp(22px, 3vw, 34px);

  /* ===== gateTint 투명도(요구사항: 수정 가능) ===== */
  --gate-tint-opacity: 0.35;
}

*{ box-sizing:border-box; }

html, body{
  margin:0;
  height:100%;
  background:#f2f2f2;
  font-family: -apple-system, system-ui, "Hiragino Sans", "Noto Sans JP", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app{
  width: min(430px, 100vw);
  margin: 0 auto;
  min-height: 100vh;
  background:#f2f2f2;
}

/* ✅ 화면 컨테이너: 이미지 비율 고정 */
.screenWrap{
  position: relative;
  width: 100%;
  aspect-ratio: 941 / 2048;
  background:#000;
  overflow:hidden;
}

.screenImg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
  pointer-events:none;
  user-select:none;
}

/* ===== 텍스트 오버레이(동그라미) ===== */
.overlay{
  position:absolute;
  z-index: 30;
  pointer-events:none;
  color:#fff;
  font-weight: 900;
  text-shadow: 0 2px 0 rgba(0,0,0,.22);
}

/* 1) 청록바 오른쪽 시간 */
.timeText{
  top: var(--time-top);
  right: var(--time-right);
  font-size: var(--time-size);
  letter-spacing: .3px;
}

/* 2) 블록 */
.blockText{
  left: var(--block-left);
  top: var(--block-top);
  font-size: var(--block-size);
  letter-spacing: .2px;
}

/* 3) 번호 */
.numText{
  left: var(--num-left);
  top: var(--num-top);
  font-size: var(--num-size);
  letter-spacing: .6px;
}

/* ===== 핫스팟 ===== */
.hotspot{
  position:absolute;
  background: transparent;
  border:0;
  padding:0;
}

/* ✅ 티켓이 우선 터치되도록 더 위 */
.ticketHotspot{ z-index: 50; }
.topHotspot{ z-index: 40; }

.ticketHotspot{
  left: var(--ticket-left);
  top: var(--ticket-top);
  width: var(--ticket-w);
  height: var(--ticket-h);
}

.topHotspot{
  left: var(--top-left);
  top: var(--top-top);
  width: var(--top-w);
  height: var(--top-h);
}

/* ===== 게이트 오버레이 ===== */
.gateWrap{
  position:absolute;
  inset:0;
  display:none;
  z-index: 70;
  overflow:hidden;
}
.gateWrap.open{ display:block; }

/* ✅ gateTint: gate와 동일 크기(전체 inset=0, 이미지랑 동일 비율/cover) */
.gateTint{
  position:absolute;
  inset:0;
  opacity: var(--gate-tint-opacity);
  background: transparent;
  pointer-events:none;
  z-index: 71;
  transition: background-color 60ms linear;
}

/* ✅ gateMover: 이 그룹이 같이 밀림(게이트 + 화살표) */
.gateMover{
  position:absolute;
  inset:0;
  z-index: 72;
  will-change: transform;
  touch-action:none;
}

.gateCardImg,
.arrowImg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
  pointer-events:none;
  user-select:none;
}

/* 노란 안내(고정, 위에 떠있게) */
.noticeLayer{
  position:absolute;
  inset:0;
  z-index: 73;
  pointer-events:none;
}
.noticeImg{
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
}

/* ===== 사용완료 토스트 ===== */
.usedToast{
  position:absolute;
  inset:0;
  z-index: 90;
  display:none;
  pointer-events:none;
  opacity: 0;
}
.usedToastImg{
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
}
.usedToast.show{
  display:block;
  opacity:1;
  transition: opacity 120ms ease;
}
.usedToast.fade{
  opacity:0;
  transition: opacity 240ms ease;
}
