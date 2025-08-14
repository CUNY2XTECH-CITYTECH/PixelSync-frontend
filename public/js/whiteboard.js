// public/js/whiteboard.js
window.addEventListener("load", () => {
  // ---------- URL / Board ----------
  const urlParams = new URLSearchParams(window.location.search);
  const boardName = (urlParams.get("name") || "whiteboard").replace(
    /[^a-zA-Z0-9-_ ]/g,
    "_"
  );

  // ---------- DOM ----------
  const drawingCanvas = document.getElementById("drawingCanvas");
  const drawingCtx = drawingCanvas.getContext("2d");

  const writingWindow = document.getElementById("writingWindow");
  const writingCanvas = document.getElementById("writingCanvas");
  const writingCtx = writingCanvas.getContext("2d");

  const drawToolsEl = document.getElementById("drawTools");
  const writeToolsEl = document.getElementById("writeTools");
  const saveBtn = document.getElementById("saveBtn");

  const drawColorEl = document.getElementById("drawColorPicker");
  const drawSizeEl = document.getElementById("drawStrokeSize");

  const textColorEl = document.getElementById("textColorPicker");
  const fontSizeEl = document.getElementById("fontSizeInput");
  const fontPickerEl = document.getElementById("fontPicker");

  const writingHeader =
    document.getElementById("writingHeader") || writingWindow;

  // ---------- State ----------
  let mode = "draw";
  let isDrawing = false;

  // Drawing
  let drawColor = "#000000";
  let drawSize = 10;
  let drawingStrokes = []; // array of {x,y,color,size}

  // Writing
  let textColor = "#000000";
  let textSize = 32;
  let textFont = "Arial";
  const writingPadding = 8;
  let writingLines = [
    { text: "", color: textColor, size: textSize, font: textFont },
  ];
  let caretVisible = true,
    caretTimer = null;

  // ---------- Sizing ----------
  function resizeDrawingCanvas() {
    drawingCanvas.width = window.innerWidth;
    drawingCanvas.height = window.innerHeight;
    redrawAll();
  }
  function resizeWritingCanvas() {
    const styles = getComputedStyle(writingWindow);
    const width = Math.max(50, parseInt(styles.width, 10) || 400);
    const height = Math.max(20, parseInt(styles.height, 10) || 200);
    writingCanvas.width = width;
    writingCanvas.height = height;
    redrawWritingCanvas();
  }
  resizeDrawingCanvas();
  window.addEventListener("resize", resizeDrawingCanvas);

  if (typeof ResizeObserver !== "undefined" && writingWindow) {
    new ResizeObserver(resizeWritingCanvas).observe(writingWindow);
  } else {
    resizeWritingCanvas();
  }

  // ---------- Helpers ----------
  function localXY(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function setMode(newMode) {
    mode = newMode;
    if (drawToolsEl)
      drawToolsEl.style.display = mode === "draw" ? "block" : "none";
    if (writeToolsEl)
      writeToolsEl.style.display = mode === "write" ? "block" : "none";
    if (writingWindow)
      writingWindow.style.display = mode === "write" ? "block" : "none";
    drawingCanvas.style.cursor = mode === "draw" ? "crosshair" : "default";

    if (mode === "write") startCaret();
    else stopCaret();
    if (mode === "write") resizeWritingCanvas();
  }
  window.setMode = setMode;

  function redrawAll() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    // replay drawing
    if (drawingStrokes.length) {
      drawingCtx.lineCap = "round";
      for (let i = 0; i < drawingStrokes.length; i++) {
        const p = drawingStrokes[i];
        if (i === 0) {
          drawingCtx.beginPath();
          drawingCtx.moveTo(p.x, p.y);
        } else {
          const prev = drawingStrokes[i - 1];
          drawingCtx.strokeStyle = p.color;
          drawingCtx.lineWidth = p.size;
          drawingCtx.lineTo(p.x, p.y);
          drawingCtx.stroke();
          // start a new path if the style changes abruptly or jump occurs
          if (Math.abs(prev.x - p.x) + Math.abs(prev.y - p.y) > 200) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(p.x, p.y);
          }
        }
      }
      drawingCtx.closePath();
    }
    redrawWritingCanvas();
  }

  // ---------- Draw controls ----------
  if (drawColorEl)
    drawColorEl.addEventListener("input", (e) => (drawColor = e.target.value));
  if (drawSizeEl)
    drawSizeEl.addEventListener(
      "input",
      (e) => (drawSize = parseInt(e.target.value, 10) || drawSize)
    );

  // ---------- Writing controls ----------
  if (textColorEl)
    textColorEl.addEventListener("input", (e) => {
      textColor = e.target.value;
      const cur = writingLines[writingLines.length - 1];
      if (cur && cur.text === "") cur.color = textColor;
      redrawWritingCanvas();
    });
  if (fontSizeEl)
    fontSizeEl.addEventListener("input", (e) => {
      const n = parseInt(e.target.value, 10);
      if (!isNaN(n) && n >= 10 && n <= 100) {
        textSize = n;
        const cur = writingLines[writingLines.length - 1];
        if (cur && cur.text === "") cur.size = textSize;
        redrawWritingCanvas();
      }
    });
  if (fontPickerEl)
    fontPickerEl.addEventListener("change", (e) => {
      textFont = e.target.value;
      const cur = writingLines[writingLines.length - 1];
      if (cur && cur.text === "") cur.font = textFont;
      redrawWritingCanvas();
    });

  // ---------- Drawing handlers ----------
  drawingCanvas.addEventListener("mousedown", (e) => {
    if (mode !== "draw") return;
    isDrawing = true;
    const { x, y } = localXY(e, drawingCanvas);
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
    drawingCtx.strokeStyle = drawColor;
    drawingCtx.lineWidth = drawSize;
    drawingCtx.lineCap = "round";
    drawingStrokes.push({ x, y, color: drawColor, size: drawSize });
  });

  drawingCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || mode !== "draw") return;
    const { x, y } = localXY(e, drawingCanvas);
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
    drawingStrokes.push({ x, y, color: drawColor, size: drawSize });
  });

  window.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      drawingCtx.closePath();
    }
  });

  // ---------- Writing: typing ----------
  window.addEventListener("keydown", (e) => {
    if (mode !== "write") return;
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA"))
      return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      window.allTextSelected = true;
      redrawWritingCanvas();
      return;
    }
    if (
      window.allTextSelected &&
      (e.key === "Backspace" || e.key === "Delete")
    ) {
      e.preventDefault();
      writingLines = [
        { text: "", color: textColor, size: textSize, font: textFont },
      ];
      window.allTextSelected = false;
      redrawWritingCanvas();
      return;
    }
    if (window.allTextSelected) window.allTextSelected = false;

    const cur = writingLines[writingLines.length - 1];
    if (e.key === "Backspace") {
      if (cur.text.length > 0) cur.text = cur.text.slice(0, -1);
      else if (writingLines.length > 1) writingLines.pop();
      redrawWritingCanvas();
    } else if (e.key === "Enter") {
      writingLines.push({
        text: "",
        color: textColor,
        size: textSize,
        font: textFont,
      });
      redrawWritingCanvas();
    } else if (e.key.length === 1) {
      writingLines[writingLines.length - 1].text += e.key;
      redrawWritingCanvas();
    }
  });

  function redrawWritingCanvas() {
    writingCtx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
    let y = writingPadding;
    for (let line of writingLines) {
      writingCtx.font = `${line.size}px ${line.font}`;
      if (window.allTextSelected) {
        const w = writingCtx.measureText(line.text).width;
        writingCtx.fillStyle = "rgba(0, 120, 215, 0.3)";
        writingCtx.fillRect(writingPadding - 2, y + 2, w + 4, line.size + 4);
      }
      writingCtx.fillStyle = line.color;
      writingCtx.fillText(line.text, writingPadding, y + line.size);
      y += Math.round(line.size * 1.2);
    }
    if (mode === "write" && caretVisible && !window.allTextSelected) {
      const last = writingLines[writingLines.length - 1];
      writingCtx.font = `${last.size}px ${last.font}`;
      const caretX = writingPadding + writingCtx.measureText(last.text).width;
      const caretTop = y - Math.round(last.size * 1.2);
      const caretBottom = caretTop + last.size;
      writingCtx.beginPath();
      writingCtx.moveTo(caretX, caretTop);
      writingCtx.lineTo(caretX, caretBottom);
      writingCtx.strokeStyle = last.color;
      writingCtx.lineWidth = 2;
      writingCtx.stroke();
    }
  }

  // caret
  function startCaret() {
    if (caretTimer) clearInterval(caretTimer);
    caretVisible = true;
    caretTimer = setInterval(() => {
      caretVisible = !caretVisible;
      redrawWritingCanvas();
    }, 500);
  }
  function stopCaret() {
    if (caretTimer) clearInterval(caretTimer);
    caretTimer = null;
    caretVisible = false;
    redrawWritingCanvas();
  }

  // ---------- Drag writing window ----------
  let isDragging = false,
    dragOffsetX = 0,
    dragOffsetY = 0;
  writingHeader.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragOffsetX = e.clientX - writingWindow.offsetLeft;
    dragOffsetY = e.clientY - writingWindow.offsetTop;
    e.preventDefault();
  });
  window.addEventListener("mouseup", () => (isDragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    writingWindow.style.left = e.clientX - dragOffsetX + "px";
    writingWindow.style.top = e.clientY - dragOffsetY + "px";
  });

  // ---------- Save ----------
  async function saveBoardData() {
    // make a thumbnail for dashboard (optional)
    const tmp = document.createElement("canvas");
    tmp.width = drawingCanvas.width;
    tmp.height = drawingCanvas.height;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(drawingCanvas, 0, 0);
    // drop the writing canvas at its on-screen position
    const wRect = writingWindow.getBoundingClientRect();
    const dRect = drawingCanvas.getBoundingClientRect();
    const sx = wRect.left - dRect.left;
    const sy = wRect.top - dRect.top;
    tctx.drawImage(writingCanvas, sx, sy);
    const imageData = tmp.toDataURL("image/png");

    const writingWindowData = {
      left: writingWindow.offsetLeft,
      top: writingWindow.offsetTop,
      width: writingCanvas.width,
      height: writingCanvas.height,
    };

    await fetch("/dashboard/save-board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: boardName,
        image: imageData, // thumbnail for dashboard
        drawing: drawingStrokes, // editable data
        writing: writingLines, // editable data
        writingWindow: writingWindowData,
      }),
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        await saveBoardData();
        // go back to dashboard (so you can see it listed)
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Save failed", err);
        alert("Save failed. See console.");
      }
    });
  }

  // ---------- Load existing data ----------
  async function loadBoardData() {
    try {
      const res = await fetch(
        `/dashboard/get-board-data?name=${encodeURIComponent(boardName)}`
      );
      const data = await res.json();

      // Drawing
      if (Array.isArray(data.drawing)) drawingStrokes = data.drawing;

      // Writing: ensure writingLines always exists
      if (Array.isArray(data.writing) && data.writing.length > 0) {
        writingLines = data.writing;
      } else {
        writingLines = [
          { text: "", color: textColor, size: textSize, font: textFont },
        ];
      }

      // Writing window: ensure default position if missing
      if (data.writingWindow) {
        if (typeof data.writingWindow.left === "number")
          writingWindow.style.left = data.writingWindow.left + "px";
        if (typeof data.writingWindow.top === "number")
          writingWindow.style.top = data.writingWindow.top + "px";
      } else {
        writingWindow.style.left = "50px";
        writingWindow.style.top = "50px";
      }

      redrawAll();
    } catch (err) {
      console.error("Load failed", err);
    }
  }

  // ---------- Initialize ----------
  setMode("draw"); // default mode
  resizeWritingCanvas(); // size the writing canvas
  loadBoardData(); // pull any saved data
});
