/* whiteboard.js
   Full integrated script: drawing canvas (background) + draggable/resizable writing window (foreground)
   Paste entire file contents (replace current).
*/

window.addEventListener("load", () => {
  // ---------- DOM elements ----------
  const drawingCanvas = document.getElementById("drawingCanvas");
  const drawingCtx = drawingCanvas.getContext("2d");

  const writingWindow = document.getElementById("writingWindow");
  const writingCanvas = document.getElementById("writingCanvas");
  const writingCtx = writingCanvas.getContext("2d");

  // Optional header inside writingWindow to drag from. If not present, the whole window is draggable.
  const writingHeader =
    document.getElementById("writingHeader") || writingWindow;

  const drawToolsEl = document.getElementById("drawTools");
  const writeToolsEl = document.getElementById("writeTools");
  const saveBtn = document.getElementById("saveBtn");

  // ---------- State ----------
  let mode = "draw";
  let drawing = false;

  // Drawing settings
  let drawColor = "#000000";
  let drawSize = 10;

  // Writing settings (defaults)
  let textColor = "#000000";
  let textSize = 32;
  let textFont = "Arial";

  // Each element is { text, color, size, font }
  let writingLines = [
    {
      text: "",
      color: textColor,
      size: textSize,
      font: textFont,
    },
  ];

  const writingPadding = 8; // px inside writing canvas

  // ---------- Canvas sizing ----------
  function resizeDrawingCanvas() {
    // keep full-window size
    drawingCanvas.width = window.innerWidth;
    drawingCanvas.height = window.innerHeight;
  }
  resizeDrawingCanvas();
  window.addEventListener("resize", resizeDrawingCanvas);

  // Resize writing canvas to match container
  function resizeWritingCanvas() {
    if (!writingWindow) return;
    const styles = getComputedStyle(writingWindow);
    const width = Math.max(50, parseInt(styles.width, 10) || 400);
    const height = Math.max(20, parseInt(styles.height, 10) || 200);

    // set canvas backing size (resets content)
    writingCanvas.width = width;
    writingCanvas.height = height;

    // redraw contents
    redrawWritingCanvas();
  }

  // Use ResizeObserver to watch writingWindow size changes
  let resizeObserver = null;
  if (typeof ResizeObserver !== "undefined" && writingWindow) {
    resizeObserver = new ResizeObserver(resizeWritingCanvas);
    resizeObserver.observe(writingWindow);
  } else {
    // fallback: initial resize only
    resizeWritingCanvas();
  }

  // ---------- Helpers ----------
  function safeGet(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element #${id} not found`);
    return el;
  }

  // ---------- Drawing control listeners ----------
  const drawColorEl = safeGet("drawColorPicker");
  const drawSizeEl = safeGet("drawStrokeSize");

  if (drawColorEl) {
    drawColorEl.value = drawColor;
    drawColorEl.addEventListener("input", (e) => {
      drawColor = e.target.value;
      console.log("drawColor ->", drawColor);
    });
  }
  if (drawSizeEl) {
    drawSizeEl.value = drawSize;
    drawSizeEl.addEventListener("input", (e) => {
      drawSize = parseInt(e.target.value, 10) || drawSize;
      console.log("drawSize ->", drawSize);
    });
  }

  // ---------- Writing control listeners ----------
  const textColorEl = safeGet("textColorPicker");
  const fontSizeEl = safeGet("fontSizeInput");
  const fontPickerEl = safeGet("fontPicker");

  if (textColorEl) {
    textColorEl.value = textColor;
    textColorEl.addEventListener("input", (e) => {
      textColor = e.target.value;
      // If current line is empty, update its style so typing uses new color
      let cur = writingLines[writingLines.length - 1];
      if (cur && cur.text === "") cur.color = textColor;
      console.log("textColor ->", textColor);
      // redraw to show caret color if desired
      redrawWritingCanvas();
    });
  }
  if (fontSizeEl) {
    fontSizeEl.value = textSize;
    fontSizeEl.addEventListener("input", (e) => {
      textSize = parseInt(e.target.value, 10) || textSize;
      let cur = writingLines[writingLines.length - 1];
      if (cur && cur.text === "") cur.size = textSize;
      console.log("textSize ->", textSize);
      redrawWritingCanvas();
    });
  }
  if (fontPickerEl) {
    fontPickerEl.value = textFont;
    fontPickerEl.addEventListener("change", (e) => {
      textFont = e.target.value;
      let cur = writingLines[writingLines.length - 1];
      if (cur && cur.text === "") cur.font = textFont;
      console.log("textFont ->", textFont);
      redrawWritingCanvas();
    });
  }

  // ---------- Mode handling ----------
  function setMode(newMode) {
    mode = newMode;
    console.log("Mode set to:", mode);

    if (drawToolsEl) drawToolsEl.style.display = "none";
    if (writeToolsEl) writeToolsEl.style.display = "none";
    if (writingWindow) writingWindow.style.display = "none";

    // stop any caret intervals if you had them (not included here)
    // show only the relevant UI
    if (mode === "draw") {
      if (drawToolsEl) drawToolsEl.style.display = "block";
      if (drawingCanvas) drawingCanvas.style.cursor = "crosshair";
    } else if (mode === "write") {
      if (writeToolsEl) writeToolsEl.style.display = "block";
      if (writingWindow) writingWindow.style.display = "block";
      if (drawingCanvas) drawingCanvas.style.cursor = "default";
      resizeWritingCanvas(); // ensure writing canvas fits container
    }
  }

  // expose globally so your HTML buttons can call setMode(...)
  window.setMode = setMode;

  // ---------- Drawing handlers ----------
  let isDrawing = false;

  drawingCanvas.addEventListener("mousedown", (e) => {
    if (mode !== "draw") return;
    isDrawing = true;
    const rect = drawingCanvas.getBoundingClientRect();
    drawingCtx.beginPath();
    drawingCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });

  drawingCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || mode !== "draw") return;
    const rect = drawingCanvas.getBoundingClientRect();
    drawingCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    drawingCtx.strokeStyle = drawColor;
    drawingCtx.lineWidth = drawSize;
    drawingCtx.lineCap = "round";
    drawingCtx.stroke();
  });

  window.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      drawingCtx.closePath();
    }
  });

  // ---------- Clear (drawing only) ----------
  window.clearCanvas = function clearCanvas() {
    const confirmClear = confirm(
      "Are you sure you want to clear the drawing board?"
    );
    if (!confirmClear) return;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  };

  // ---------- Save merged image (drawing + writing) ----------
  window.saveCanvas = function saveCanvas() {
    // create temporary merge canvas
    const tmp = document.createElement("canvas");
    tmp.width = drawingCanvas.width;
    tmp.height = drawingCanvas.height;
    const tctx = tmp.getContext("2d");

    // draw background (drawing)
    tctx.drawImage(drawingCanvas, 0, 0);

    // compute writingWindow position relative to drawing canvas
    if (writingWindow && writingCanvas) {
      const wRect = writingWindow.getBoundingClientRect();
      const dRect = drawingCanvas.getBoundingClientRect();
      const sx = wRect.left - dRect.left;
      const sy = wRect.top - dRect.top;

      // scale factor if drawingCanvas CSS size differs from backing size
      tctx.drawImage(
        writingCanvas,
        sx,
        sy,
        writingCanvas.width,
        writingCanvas.height
      );
    }

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = tmp.toDataURL();
    link.click();
  };

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveCanvas();
    });
  }

  // ---------- Writing handlers ----------
  // current caret blink handling (optional)
  let caretVisible = true;
  let caretTimer = null;
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

  // Key handling: type into writingLines (objects)
  window.addEventListener("keydown", (e) => {
    if (mode !== "write") return;

    // prevent accidental scrolling on space/arrow keys? optional
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(e.key)) return;

    const cur = writingLines[writingLines.length - 1];

    if (e.key === "Backspace") {
      if (cur.text.length > 0) {
        cur.text = cur.text.slice(0, -1);
      } else if (writingLines.length > 1) {
        writingLines.pop();
      }
      redrawWritingCanvas();
    } else if (e.key === "Enter") {
      // push new empty line with current style
      writingLines.push({
        text: "",
        color: textColor,
        size: textSize,
        font: textFont,
      });
      redrawWritingCanvas();
    } else if (e.key.length === 1) {
      // printable char
      writingLines[writingLines.length - 1].text += e.key;
      redrawWritingCanvas();
    }
  });

  function redrawWritingCanvas() {
    // clear only writing canvas
    writingCtx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

    // start drawing lines from top padding
    let y = writingPadding;
    for (let line of writingLines) {
      writingCtx.font = `${line.size}px ${line.font}`;
      writingCtx.fillStyle = line.color;
      // baseline manual: we draw text at y + line.size so it looks like top padding
      writingCtx.fillText(line.text, writingPadding, y + line.size);
      y += Math.round(line.size * 1.2);
    }

    // caret
    if (mode === "write" && caretVisible) {
      const last = writingLines[writingLines.length - 1];
      writingCtx.font = `${last.size}px ${last.font}`;
      const caretX = writingPadding + writingCtx.measureText(last.text).width;
      const caretTop =
        y - Math.round(last.size * 1.2) + (last.size - last.size);
      const caretBottom = caretTop + last.size;
      writingCtx.beginPath();
      writingCtx.moveTo(caretX, caretTop);
      writingCtx.lineTo(caretX, caretBottom);
      writingCtx.strokeStyle = last.color;
      writingCtx.lineWidth = 2;
      writingCtx.stroke();
    }
  }

  // Start caret when entering write mode, stop when leaving
  const originalSetMode = window.setMode;
  // we already exposed setMode; wrap it to manage caret
  window.setMode = function (newMode) {
    originalSetMode(newMode); // call earlier function
    if (newMode === "write") startCaret();
    else stopCaret();
  };

  // ---------- Dragging (header only) ----------
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  writingHeader.addEventListener("mousedown", (e) => {
    // only start drag on left mouse button
    if (e.button !== 0) return;
    isDragging = true;
    dragOffsetX = e.clientX - writingWindow.offsetLeft;
    dragOffsetY = e.clientY - writingWindow.offsetTop;
    e.preventDefault();
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    writingWindow.style.left = e.clientX - dragOffsetX + "px";
    writingWindow.style.top = e.clientY - dragOffsetY + "px";
  });

  // ---------- Ensure initial UI state ----------
  // show draw tools by default
  setMode("draw");

  // initial resize of writing canvas
  resizeWritingCanvas();

  // debug helper: print element presence
  console.log({
    drawingCanvas: !!drawingCanvas,
    writingWindow: !!writingWindow,
    writingCanvas: !!writingCanvas,
    drawColorEl: !!drawColorEl,
    drawSizeEl: !!drawSizeEl,
    textColorEl: !!textColorEl,
    fontSizeEl: !!fontSizeEl,
    fontPickerEl: !!fontPickerEl,
  });
}); // end load listener
