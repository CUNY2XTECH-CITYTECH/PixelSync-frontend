const canvas = document.getElementById('auth-background-canvas');
const ctx = canvas.getContext('2d');

let currentSize = 8; // Increased from 3 to 8 for bigger lines

// Array to store drawing paths with timestamps for fading
let drawingPaths = [];
let isDrawing = false;

// Function to get color based on X position
function getColorByPosition(x) {
  // Simple solid color - just return #0033A1
  return '#0033A1';
}

// Set canvas to full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Note: Canvas context gets reset after resize, so gradients need to be recreated
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing event listeners - now draws on hover with fade effect!
let currentPath = null;

canvas.addEventListener('mouseenter', (e) => {
  console.log('Mouse entered canvas - starting to draw!');
  isDrawing = true;
  currentPath = {
    points: [{ x: e.clientX, y: e.clientY }],
    timestamp: Date.now(),
    color: getColorByPosition(e.clientX), // Get color based on position
    size: currentSize
  };
  // Add the path immediately so it starts fading right away
  drawingPaths.push(currentPath);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  
  console.log('Drawing at:', e.clientX, e.clientY);
  currentPath.points.push({ x: e.clientX, y: e.clientY });
  // Update timestamp each time we draw to reset the fade timer
  currentPath.timestamp = Date.now();
});

canvas.addEventListener('mouseleave', () => {
  console.log('Mouse left canvas - ending draw path');
  isDrawing = false;
  currentPath = null;
});

// Function to draw all paths with time-based fade effect
function drawPaths() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const now = Date.now();
  const fadeTime = 2000; // 2 seconds to fade out
  
  // Remove old paths and draw current ones
  drawingPaths = drawingPaths.filter(path => {
    const age = now - path.timestamp;
    if (age > fadeTime) return false; // Remove old paths
    
    // Calculate fade opacity (1 to 0 over fadeTime)
    const opacity = Math.max(0, 1 - (age / fadeTime));
    
    // Draw the path with fading opacity
    if (path.points.length > 1) {
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1; // Reset alpha
    }
    
    return true; // Keep this path
  });
}

// Animation loop to continuously update the fade effect
let animationCount = 0;
function animate() {
  drawPaths();
  animationCount++;
  
  // Debug: Log every 60 frames (roughly once per second)
  if (animationCount % 60 === 0) {
    console.log('Animation running, paths count:', drawingPaths.length);
  }
  
  requestAnimationFrame(animate);
}

// Start the animation loop
animate();

// Touch events for mobile support - now with time-based fade effect!
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  console.log('Touch started - beginning draw path');
  
  isDrawing = true;
  currentPath = {
    points: [{ x: touch.clientX - rect.left, y: touch.clientY - rect.top }],
    timestamp: Date.now(),
    color: getColorByPosition(touch.clientX - rect.left), // Get color based on touch position
    size: currentSize
  };
  // Add the path immediately so it starts fading right away
  drawingPaths.push(currentPath);
});

canvas.addEventListener('touchmove', (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  
  console.log('Touch drawing at:', touch.clientX, touch.clientY);
  currentPath.points.push({ 
    x: touch.clientX - rect.left, 
    y: touch.clientY - rect.top 
  });
  // Update timestamp each time we draw to reset the fade timer
  currentPath.timestamp = Date.now();
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  console.log('Touch ended - closing draw path');
  
  isDrawing = false;
  currentPath = null;
});

// Prevent scrolling when drawing on mobile
document.body.addEventListener('touchstart', (e) => {
  if (e.target === canvas) {
    e.preventDefault();
  }
}, { passive: false });

document.body.addEventListener('touchend', (e) => {
  if (e.target === canvas) {
    e.preventDefault();
  }
}, { passive: false });

document.body.addEventListener('touchmove', (e) => {
  if (e.target === canvas) {
    e.preventDefault();
  }
}, { passive: false });

console.log('Auth canvas drawing initialized!');
