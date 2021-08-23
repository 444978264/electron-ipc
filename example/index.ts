const { IPCClient } = require('../dist');
const client = new IPCClient();
document.documentElement.style.backgroundColor = '#1d1d1d';

const canvas = (document.getElementById('canvas') as HTMLCanvasElement)!;
const ctx = canvas.getContext('2d')!;
canvas.style.backgroundColor = '#fff';
canvas.width = 400;
canvas.height = 400;

ctx.font = '48pt serif';
ctx.fillStyle = '#000';

const SPACING = 40;
const CLOCK_RADIUS = canvas.width / 2 - SPACING;
const CENTER_POINT = [canvas.width / 2, canvas.height / 2];
const tickSize = 12;

function drawCircle() {
  ctx.beginPath();
  ctx.arc(0, 0, CLOCK_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCenter() {
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}

function tick() {
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const x = Math.cos(((Math.PI * 2) / 60) * (i - 2)) * CLOCK_RADIUS;
    const y = Math.sin(((Math.PI * 2) / 60) * (i - 2)) * CLOCK_RADIUS;
    ctx.moveTo(x * 0.95, y * 0.95);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function tickNumber() {
  ctx.save();
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= tickSize; i++) {
    const x = Math.cos(((Math.PI * 2) / tickSize) * (i - 3)) * CLOCK_RADIUS;
    const y = Math.sin(((Math.PI * 2) / tickSize) * (i - 3)) * CLOCK_RADIUS;
    ctx.fillText(i.toString(), 0.85 * x, 0.85 * y);
  }
  ctx.restore();
}

function hand(type: 'h', value: number, min: number): void;
function hand(type: 'm', value: number): void;
function hand(type: 's', value: number): void;
function hand(type: 'h' | 'm' | 's', value: number, min?: number) {
  let x = 0,
    y = 0,
    scale = 0.4;
  ctx.beginPath();
  switch (type) {
    case 'h':
      ctx.lineWidth = 4;
      const rate = ((min! / 60) * Math.PI) / 6;
      const angle = rate + ((value - 3) / 12) * 2 * Math.PI;
      ctx.moveTo(0, 0);
      x = Math.cos(angle) * CLOCK_RADIUS;
      y = Math.sin(angle) * CLOCK_RADIUS;
      ctx.lineTo(x * scale, y * scale);
      ctx.stroke();
      return;
    case 'm':
      ctx.lineWidth = 3;
      scale = 0.45;
      break;
    case 's':
      ctx.lineWidth = 2;
      scale = 0.6;
      break;
  }
  ctx.moveTo(0, 0);
  x = Math.cos(((value - 15) / 60) * 2 * Math.PI) * CLOCK_RADIUS;
  y = Math.sin(((value - 15) / 60) * 2 * Math.PI) * CLOCK_RADIUS;
  ctx.lineTo(x * scale, y * scale);
  ctx.stroke();
}

function render() {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const second = now.getSeconds();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(CENTER_POINT[0], CENTER_POINT[1]);
  drawCircle();
  drawCenter();
  tick();
  tickNumber();
  hand('h', hour, min);
  hand('m', min);
  hand('s', second);
  ctx.restore();
}

render();
setInterval(render, 1000);
