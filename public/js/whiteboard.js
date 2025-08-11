const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

let drawing = false;
let mode = "draw"; // "draw" or "write"

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Drawing settings
let drawColor = "#000000";
let drawSize = 10;

// Writing settings
let textColor = "#000000";
let textSize = 16;
let textFont = "Arial";

// Drawing controls
document.getElementById("drawColorPicker").addEventListener("input", (e) => {
  drawColor = e.target.value;
});
document.getElementById("drawStrokeSize").addEventListener("input", (e) => {
  drawSize = e.target.value;
});

// Writing controls
document.getElementById("textColorPicker").addEventListener("input", (e) => {
  textColor = e.target.value;
});
document.getElementById("fontSizeInput").addEventListener("input", (e) => {
  textSize = parseInt(e.target.value, 10);
});
document.getElementById("fontPicker").addEventListener("change", (e) => {
  textFont = e.target.value;
});

let writingPosition = { x: 50, y: 50 }; // Start to the right of sidebar
let lineHeight = 50;
let writtenLines = []; // Array to hold lines of text

function setMode(newMode) {
  mode = newMode;
  console.log("Mode set to:", mode);
  canvas.focus();

  // Hide all tool sections first
  document.getElementById("drawTools").style.display = "none";
  document.getElementById("writeTools").style.display = "none";

  // Show only the tools for the current mode
  if (mode === "draw") {
    document.getElementById("drawTools").style.display = "inline-block";
    canvas.style.cursor = "crosshair";
  } else if (mode === "write") {
    document.getElementById("writeTools").style.display = "inline-block";
    canvas.style.cursor = "text";
  }
}

canvas.addEventListener("mousedown", (e) => {
  if (mode === "draw") {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (drawing && mode === "draw") {
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.lineCap = "round";
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  if (mode === "draw") {
    drawing = false;
    ctx.closePath();
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "whiteboard.png";
  link.href = canvas.toDataURL();
  link.click();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  writtenLines = [];
  writingPosition = { x: 50, y: 50 };
}

document.addEventListener("keydown", (e) => {
  if (mode !== "write") return;

  ctx.font = `${textSize}px ${textFont}`;
  ctx.fillStyle = textColor;

  if (e.key === "Enter") {
    writingPosition.y += lineHeight;
    writingPosition.x = 50; // Reset x to left margin after line break
  } else if (e.key === "Backspace") {
    // Basic backspace: remove last character and redraw
    if (writtenLines.length > 0) {
      let lastLine = writtenLines[writtenLines.length - 1];
      lastLine = lastLine.slice(0, -1);
      writtenLines[writtenLines.length - 1] = lastLine;

      if (lastLine.length === 0) {
        writtenLines.pop();
        writingPosition.y -= lineHeight;
      }

      redrawText();
    }
  } else if (e.key.length === 1) {
    // Only draw printable characters
    if (writtenLines[writtenLines.length - 1] === undefined) {
      writtenLines.push(e.key);
    } else {
      writtenLines[writtenLines.length - 1] += e.key;
    }

    ctx.fillText(e.key, writingPosition.x, writingPosition.y);
    writingPosition.x += ctx.measureText(e.key).width;
  }
});

function redrawText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 250;
  let y = 50;

  for (let line of writtenLines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }

  writingPosition.x =
    x + ctx.measureText(writtenLines[writtenLines.length - 1] || "").width;
  writingPosition.y = y - lineHeight;
}

