const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

let drawing = false;
let mode = "draw"; // or "write"

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentColor = "#000000";
let currentSize = 2;

document.getElementById("colorPicker").addEventListener("input", (e) => {
  currentColor = e.target.value;
});

document.getElementById("strokeSize").addEventListener("input", (e) => {
  currentSize = e.target.value;
});

function setMode(newMode) {
  mode = newMode;
}

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.lineCap = "round";
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.closePath();
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "whiteboard.png";
  link.href = canvas.toDataURL();
  link.click();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
