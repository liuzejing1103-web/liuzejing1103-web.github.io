const personaData = {
  economics: {
    title: "经济学视角",
    body: "关注注意力、激励结构与平台环境如何改变人的选择。用设计项目做微观观察，用 AI 工具提高信息整合与推演效率。",
    tags: ["Attention", "Incentives", "Decision Context"],
  },
  ai: {
    title: "AI 研究协作",
    body: "把生成式 AI 当作研究助手、视觉推演器和内容生产系统。重点不是炫技，而是让复杂信息更快进入结构化表达。",
    tags: ["ChatGPT", "Gemini", "Lovart", "Workflow"],
  },
  behavior: {
    title: "行为设计实验室",
    body: "从人机工程、产品体验和组织协作中观察行动摩擦：人为什么犹豫、什么时候愿意尝试、怎样被反馈塑造。",
    tags: ["Human Factors", "Friction", "Feedback"],
  },
  content: {
    title: "内容影响力引擎",
    body: "把学术问题、视觉表达和叙事节奏压缩成能被传播的信号。内容不是包装，而是思想进入公共空间的界面。",
    tags: ["Narrative", "Signal", "Public Thought"],
  },
};

const root = document.documentElement;
const topbar = document.querySelector("[data-nav]");
const progressBar = document.querySelector(".progress-bar");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-links a");
const sectionTargets = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let targetY = window.scrollY;
let smoothY = targetY;
let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;

function updateScrollState() {
  targetY = window.scrollY;
  topbar.classList.toggle("is-scrolled", targetY > 20);

  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const progress = Math.min(1, targetY / maxScroll);
  progressBar.style.transform = `scaleX(${progress})`;
}

function animateScroll() {
  smoothY += (targetY - smoothY) * 0.085;
  root.style.setProperty("--smooth-y", smoothY.toFixed(2));
  if (!reducedMotion) requestAnimationFrame(animateScroll);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

revealItems.forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${entry.target.id}`,
        );
      });
    });
  },
  { rootMargin: "-38% 0px -56% 0px", threshold: 0 },
);

sectionTargets.forEach((section) => navObserver.observe(section));

document.querySelectorAll(".identity-button").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.persona;
    const data = personaData[key];
    if (!data) return;

    document
      .querySelectorAll(".identity-button")
      .forEach((item) => item.classList.toggle("is-active", item === button));

    const detail = document.querySelector(".persona-detail");
    detail.querySelector("h3").textContent = data.title;
    detail.querySelector("p:not(.detail-label)").textContent = data.body;

    const tagWrap = detail.querySelector(".detail-tags");
    tagWrap.replaceChildren(
      ...data.tags.map((tag) => {
        const node = document.createElement("span");
        node.textContent = tag;
        return node;
      }),
    );
  });
});

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--ry", `${x * 6}deg`);
    card.style.setProperty("--rx", `${y * -6}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
  });
});

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener(
  "pointermove",
  (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  },
  { passive: true },
);

updateScrollState();
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  requestAnimationFrame(animateScroll);
}

const canvas = document.getElementById("signalCanvas");
const ctx = canvas.getContext("2d");
let points = [];
let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = Math.max(5, Math.round(width / 180));
  const rows = Math.max(4, Math.round(height / 160));
  points = [];

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= cols; x += 1) {
      points.push({
        x: (x / cols) * width,
        y: (y / rows) * height,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
}

function drawSignals(time = 0) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  points.forEach((point, index) => {
    const driftX = Math.cos(time * 0.00045 + point.phase) * 9;
    const driftY = Math.sin(time * 0.00038 + point.phase) * 9;
    const x = point.x + driftX;
    const y = point.y + driftY;
    const dx = pointerX - x;
    const dy = pointerY - y;
    const dist = Math.hypot(dx, dy);
    const alpha = Math.max(0, 1 - dist / 320);

    ctx.fillStyle = `rgba(214, 255, 63, ${0.12 + alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + alpha * 2, 0, Math.PI * 2);
    ctx.fill();

    const next = points[index + 1];
    if (next && Math.abs(next.y - point.y) < height / 3) {
      const nx = next.x + Math.cos(time * 0.00045 + next.phase) * 9;
      const ny = next.y + Math.sin(time * 0.00038 + next.phase) * 9;
      const midDist = Math.hypot(pointerX - (x + nx) / 2, pointerY - (y + ny) / 2);
      const lineAlpha = Math.max(0.035, 0.18 - midDist / 2600);
      ctx.strokeStyle = `rgba(99, 231, 255, ${lineAlpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
  });

  if (!reducedMotion) requestAnimationFrame(drawSignals);
}

resizeCanvas();
if (!reducedMotion) requestAnimationFrame(drawSignals);
window.addEventListener("resize", resizeCanvas);
root.dataset.siteReady = "true";
