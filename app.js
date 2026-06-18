/**
 * Tektit Maturity Check - Main Application Logic
 * Handles wizard flow, dimension rendering, scoring, and PDF generation
 */

// Master Matrix: 53 high-signal items across 12 dimensions and 4 pillars
const DIMS_TEMPLATE = [
  /* Pillar 1: Strategy & Leadership */
  {id:"leadership", name:{digital:"Leadership", services:"Leadership & Talent", mittelstand:"Leadership & Governance", logistics:"Leadership & Control"}, icon:"🧭", cluster:"Strategy & Leadership", strategicWeight: 1.5, elements:[
    {t:"Everyone in our company knows our direction and who we're building for.", w: 2.0, desc:"Making sure everyone works toward the same big-picture goals, not separate agendas."},
    {t:"We actively invest in our culture — through rituals, leadership behavior, and how we handle failure.", w: 1.0, desc:"Liking your culture on paper isn't enough; it needs to guide daily decisions."},
    {t:"We use a structured goal system (e.g. OKRs, MBO) so every team knows what they're working toward.", w: 1.5, desc:"Breaking your high-level vision down into quarterly objectives or monthly milestones."},
    {t:"Our people can make decisions in their area without needing constant sign-off from above.", w: 1.0, desc:"Trusting your team to run their own domains so founders don't become bottlenecks."},
    {t:"We have regular processes for internal feedback and resolving disagreements constructively.", w: 1.0, desc:"Having safe, established spaces to speak up, give honest feedback, and fix problems."},
  ]},
  {id:"innovation", name:"Innovation", icon:"💡", cluster:"Strategy & Leadership", strategicWeight: 1.2, elements:[
    {t:"We have a clear strategy for how we stay distinctly different from our competitors.", w: 1.5, desc:"Knowing exactly why a customer picks you over a cheaper or bigger competitor."},
    {t:"We protect time and budget for testing new ideas — separate from day-to-day delivery.", w: 1.0, desc:"Giving people actual room to build things or experiment without dropping current work."},
    {t:"We systematically collect customer feedback and use it to improve our products or services.", w: 1.5, desc:"Taking what customers complain about or praise and using it to fix your roadmap."},
  ]},
  {id:"finance", name:"Finance & Business Model", icon:"💰", cluster:"Strategy & Leadership", strategicWeight: 1.3, elements:[
    {t:"We have clear, predictable metrics for how money flows in and out of the business.", w: 1.5, desc:"Understanding your unit economics, CAC, LTV, or margins well enough to make real tradeoffs."},
    {t:"We regularly model 'what-if' scenarios (pricing, market sizing, spend) to guide strategy.", w: 1.0, desc:"Running financial forecasts when you consider major investments or pivots."},
    {t:"We track actual results against our budget and adjust spending or goals without drama.", w: 1.0, desc:"Monthly or quarterly reviews where you honestly assess what worked and what didn't."},
  ]},

  /* Pillar 2: Go-To-Market */
  {id:"sales", name:{digital:"Sales & Account Management", services:"Client Delivery & Retention", mittelstand:"Sales & Accounts", logistics:"Sales & Partnerships"}, icon:"📈", cluster:"Go-To-Market", strategicWeight: 1.4, elements:[
    {t:"We have a repeatable playbook for how we win new customers (or land new projects).", w: 1.5, desc:"A sales process that works consistently — not dependent on one person's relationships or luck."},
    {t:"Our sales and product teams collaborate regularly on what customers need.", w: 1.0, desc:"Sales isn't throwing problems over the fence to product; they're planning together."},
    {t:"We have a clear customer segmentation and know which types of customers are most profitable.", w: 1.5, desc:"Not all customers are equal; knowing which ones you should focus on saves time and money."},
  ]},
  {id:"marketing", name:"Marketing & Brand", icon:"📢", cluster:"Go-To-Market", strategicWeight: 1.1, elements:[
    {t:"We have a documented marketing strategy (target audience, channels, messaging).", w: 1.0, desc:"Not just 'be everywhere'; a real plan for who you're talking to and how."},
    {t:"We measure marketing performance (CAC, conversion rates, channel ROI) and adjust accordingly.", w: 1.5, desc:"Knowing which campaigns actually drive customers and which are expensive theater."},
    {t:"Our brand and messaging are consistent across all touchpoints (website, ads, sales calls).", w: 1.0, desc:"Customers see the same story whether they land on your homepage or talk to your sales team."},
  ]},
  {id:"customer-success", name:"Customer Success & Support", icon:"🤝", cluster:"Go-To-Market", strategicWeight: 1.2, elements:[
    {t:"We track customer health metrics and proactively reach out to at-risk accounts.", w: 1.5, desc:"Not waiting for customers to leave; spotting trouble early and fixing it."},
    {t:"Our support processes are documented and don't depend on one person knowing the answers.", w: 1.0, desc:"New team members can handle common issues without escalating everything."},
    {t:"We collect and act on customer feedback to reduce churn and improve retention.", w: 1.5, desc:"Regular check-ins with customers to understand why they stay or why they're tempted to leave."},
  ]},

  /* Pillar 3: Operations */
  {id:"process", name:{digital:"Process & Workflows", services:"Process & Quality", mittelstand:"Process & Compliance", logistics:"Process & Efficiency"}, icon:"⚙️", cluster:"Operations", strategicWeight: 1.1, elements:[
    {t:"Our key workflows are documented so new people can learn them without constant hand-holding.", w: 1.0, desc:"Playbooks for common tasks — hiring, onboarding, closing a deal, handling refunds."},
    {t:"We regularly review and improve our processes instead of just doing things the way we always have.", w: 1.0, desc:"Scheduled retrospectives or process audits where you ask: 'Can we do this faster or better?'"},
    {t:"When problems happen, we investigate the root cause and fix the process, not just the symptom.", w: 1.5, desc:"Mistakes are a signal to improve the system, not just scold the person."},
  ]},
  {id:"people", name:"People & Talent", icon:"👥", cluster:"Operations", strategicWeight: 1.3, elements:[
    {t:"We have a clear hiring process and know what skills and values we're looking for.", w: 1.5, desc:"Not just 'hire smart people'; clear criteria for who fits your team and culture."},
    {t:"We invest in developing our team through training, mentoring, and career growth conversations.", w: 1.0, desc:"Your best people leave if you don't help them get better at what they do."},
    {t:"We have a transparent way of handling performance — feedback and development or parting ways.", w: 1.0, desc:"People know where they stand and what they need to improve, or they know they're being managed out."},
  ]},
  {id:"project-mgmt", name:"Project & Program Management", icon:"📋", cluster:"Operations", strategicWeight: 1.0, elements:[
    {t:"We track project status and know early when we're at risk of missing a deadline or budget.", w: 1.5, desc:"Real visibility into what's in progress, what's blocked, and what's coming next."},
    {t:"We prioritize work deliberately — not just doing everything that comes in the door.", w: 1.0, desc:"A clear framework for deciding which projects matter most and why."},
    {t:"We do post-project reviews to capture lessons and apply them to the next initiative.", w: 1.0, desc:"Taking time to reflect on what went well and what didn't, so you improve over time."},
  ]},

  /* Pillar 4: Tech & Data */
  {id:"architecture", name:{digital:"Tech Architecture & Scalability", services:"Systems & Integration", mittelstand:"Systems & Infrastructure", logistics:"Systems & Networks"}, icon:"🏗️", cluster:"Tech & Data", strategicWeight: 1.2, elements:[
    {t:"Our technical architecture is documented and understood by our team.", w: 1.0, desc:"People can explain how systems talk to each other without discovering it for the first time during a crisis."},
    {t:"We have a plan for scaling our systems as customer demand grows.", w: 1.5, desc:"Not panicking when you go from 10K to 100K users — you've thought about bottlenecks."},
    {t:"We regularly maintain and update our dependencies, frameworks, and underlying infrastructure.", w: 1.0, desc:"Not living on ancient versions of libraries; staying current to avoid security and compatibility debt."},
  ]},
  {id:"data-analytics", name:"Data & Analytics", icon:"📊", cluster:"Tech & Data", strategicWeight: 1.4, elements:[
    {t:"We have a central data warehouse or analytics platform where business data lives.", w: 1.5, desc:"Not piecing together reports from 5 different systems; one source of truth."},
    {t:"We have dashboards and reports that tell us how the business is actually performing.", w: 1.5, desc:"Real KPIs tracked daily/weekly so you spot trends or problems fast."},
    {t:"Our data governance is clear — we know what data we have, who can access it, and how it's protected.", w: 1.0, desc:"GDPR, HIPAA, or just basic privacy: you know what you're responsible for and comply."},
  ]},
  {id:"security", name:"Security & Compliance", icon:"🔒", cluster:"Tech & Data", strategicWeight: 1.3, elements:[
    {t:"We have documented security policies and everyone knows the basics (strong passwords, VPN, MFA).", w: 1.5, desc:"People don't reuse passwords, you have multi-factor auth, and bad actors can't casually walk in."},
    {t:"We regularly test and update our security (penetration testing, vulnerability scans, access reviews).", w: 1.0, desc:"Not just hoping you're secure; actually verifying and fixing gaps."},
    {t:"We have a plan for responding to security incidents and we've practiced it.", w: 1.5, desc:"If someone breaches you or finds a vulnerability, you know the playbook and move fast."},
  ]},
];

// Global state
let currentStep = 0;
let selectedArchetype = "digital";
let checkedItems = {};
let results = null;

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  initializeApp();
});

function initializeApp() {
  renderDimensions();
  attachEventListeners();
  updateProgress();
}

function renderDimensions() {
  const container = document.getElementById("dimsContainer");
  container.innerHTML = "";

  // Group dimensions by pillar
  const pillars = ["Strategy & Leadership", "Go-To-Market", "Operations", "Tech & Data"];
  
  pillars.forEach((pillar, pillarIdx) => {
    const dimsInPillar = DIMS_TEMPLATE.filter(d => d.cluster === pillar);
    
    const pane = document.createElement("div");
    pane.className = "step-pane" + (pillarIdx === currentStep ? " active" : "");
    pane.id = `pane-${pillarIdx}`;
    
    const title = document.createElement("div");
    title.className = "pane-title";
    title.textContent = pillar;
    pane.appendChild(title);
    
    dimsInPillar.forEach(dim => {
      const card = createDimensionCard(dim, pillarIdx);
      pane.appendChild(card);
    });
    
    container.appendChild(pane);
  });
}

function createDimensionCard(dim, pillarIdx) {
  const card = document.createElement("div");
  card.className = "dim-card";
  
  const head = document.createElement("div");
  head.className = "dim-head";
  
  const titleDiv = document.createElement("div");
  titleDiv.className = "dim-title";
  
  const icon = document.createElement("div");
  icon.className = "dim-icon";
  icon.textContent = dim.icon;
  titleDiv.appendChild(icon);
  
  const name = document.createElement("div");
  name.className = "dim-name";
  const archName = typeof dim.name === "object" ? dim.name[selectedArchetype] : dim.name;
  name.textContent = archName;
  titleDiv.appendChild(name);
  
  head.appendChild(titleDiv);
  
  const badge = document.createElement("div");
  badge.className = "dim-badge";
  badge.id = `badge-${dim.id}`;
  badge.textContent = "0%";
  head.appendChild(badge);
  
  card.appendChild(head);
  
  const elements = document.createElement("div");
  elements.className = "elements";
  
  dim.elements.forEach((el, idx) => {
    const label = document.createElement("label");
    label.className = "el-label";
    
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "dim-cb";
    input.id = `${dim.id}-${idx}`;
    input.dataset.dim = dim.id;
    input.dataset.index = idx;
    input.dataset.weight = el.w;
    input.dataset.pillar = pillarIdx;
    
    if (checkedItems[input.id]) {
      input.checked = true;
    }
    
    input.addEventListener("change", function() {
      if (this.checked) {
        checkedItems[this.id] = true;
        label.classList.add("is-checked");
      } else {
        delete checkedItems[this.id];
        label.classList.remove("is-checked");
      }
      updateProgress();
      updateDimensionBadges();
    });
    
    if (checkedItems[input.id]) {
      label.classList.add("is-checked");
    }
    
    label.appendChild(input);
    
    const box = document.createElement("div");
    box.className = "el-box";
    label.appendChild(box);
    
    const text = document.createElement("div");
    text.className = "el-text";
    text.textContent = el.t;
    label.appendChild(text);
    
    // Add tooltip
    const tt = document.createElement("div");
    tt.className = "tt-wrap";
    tt.innerHTML = `<div class="tt-icon">?</div><div class="tt-text">${el.desc}</div>`;
    label.appendChild(tt);
    
    elements.appendChild(label);
  });
  
  card.appendChild(elements);
  return card;
}

function updateDimensionBadges() {
  DIMS_TEMPLATE.forEach(dim => {
    let completed = 0;
    dim.elements.forEach((el, idx) => {
      if (checkedItems[`${dim.id}-${idx}`]) {
        completed++;
      }
    });
    const pct = Math.round((completed / dim.elements.length) * 100);
    const badge = document.getElementById(`badge-${dim.id}`);
    if (badge) {
      badge.textContent = pct + "%";
      if (pct === 100) {
        badge.classList.add("completed");
      } else if (pct > 0) {
        badge.classList.add("active");
      }
    }
  });
}

function updateProgress() {
  const totalDims = DIMS_TEMPLATE.length;
  const completedDims = DIMS_TEMPLATE.filter(dim => {
    const allChecked = dim.elements.every((el, idx) => checkedItems[`${dim.id}-${idx}`]);
    return allChecked;
  }).length;
  
  const totalItems = DIMS_TEMPLATE.reduce((sum, d) => sum + d.elements.length, 0);
  const checkedCount = Object.keys(checkedItems).length;
  
  document.getElementById("progText").textContent = completedDims + " of " + totalDims + " dimensions assessed";
  document.getElementById("headerCount").textContent = checkedCount;
  
  const fillPct = (completedDims / totalDims) * 100;
  document.getElementById("progFill").style.width = fillPct + "%";
  
  // Enable "Generate analysis" button if at least one dimension is complete
  const showLeadBtn = document.getElementById("showLeadBtn");
  if (completedDims > 0) {
    showLeadBtn.style.display = "inline-flex";
    showLeadBtn.disabled = false;
  }
}

function attachEventListeners() {
  // Archetype selector
  document.querySelectorAll(".arch-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".arch-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      selectedArchetype = this.dataset.arch;
      renderDimensions();
      attachEventListeners();
      updateProgress();
      updateDimensionBadges();
    });
  });
  
  // Navigation
  document.getElementById("prevStepBtn").addEventListener("click", prevStep);
  document.getElementById("nextStepBtn").addEventListener("click", nextStep);
  document.getElementById("resetBtn").addEventListener("click", resetAll);
  document.getElementById("showLeadBtn").addEventListener("click", showLeadGate);
  document.getElementById("unlockResultsBtn").addEventListener("click", unlockResults);
  document.getElementById("skipLeadBtn").addEventListener("click", skipLeadGate);
  document.getElementById("downloadPdfBtn").addEventListener("click", downloadPDF);
  document.getElementById("backBtn").addEventListener("click", backToQuestionnaire);
}

function nextStep() {
  if (currentStep < 3) {
    currentStep++;
    updateStepVisibility();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateStepVisibility();
  }
}

function updateStepVisibility() {
  document.querySelectorAll(".step-pane").forEach((pane, idx) => {
    pane.classList.toggle("active", idx === currentStep);
  });
  
  // Update step indicators
  document.querySelectorAll(".wiz-step").forEach((step, idx) => {
    step.classList.remove("active", "completed");
    if (idx === currentStep) {
      step.classList.add("active");
    } else if (idx < currentStep) {
      step.classList.add("completed");
    }
  });
  
  // Update button visibility
  document.getElementById("prevStepBtn").style.display = currentStep > 0 ? "inline-flex" : "none";
  document.getElementById("nextStepBtn").style.display = currentStep < 3 ? "inline-flex" : "none";
}

function resetAll() {
  if (confirm("Reset all selections?")) {
    checkedItems = {};
    currentStep = 0;
    renderDimensions();
    attachEventListeners();
    updateProgress();
    updateStepVisibility();
  }
}

function showLeadGate() {
  document.getElementById("leadGate").style.display = "block";
  document.getElementById("leadGate").scrollIntoView({ behavior: "smooth" });
}

function unlockResults() {
  const name = document.getElementById("leadName").value;
  const email = document.getElementById("leadEmail").value;
  
  if (email) {
    console.log("Lead captured:", {name, email});
  }
  
  skipLeadGate();
}

function skipLeadGate() {
  document.getElementById("leadGate").style.display = "none";
  generateResults();
  document.getElementById("results").style.display = "block";
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

function generateResults() {
  // Calculate scores per dimension
  const scores = {};
  const maxPossibleScores = {};
  
  DIMS_TEMPLATE.forEach(dim => {
    let score = 0;
    let maxScore = 0;
    
    dim.elements.forEach((el, idx) => {
      const itemId = `${dim.id}-${idx}`;
      const weight = parseFloat(el.w) || 1;
      maxScore += weight;
      
      if (checkedItems[itemId]) {
        score += weight;
      }
    });
    
    scores[dim.id] = score;
    maxPossibleScores[dim.id] = maxScore;
  });
  
  // Calculate normalized scores (0-5 scale)
  const normalizedScores = {};
  DIMS_TEMPLATE.forEach(dim => {
    const normalizedScore = (scores[dim.id] / maxPossibleScores[dim.id]) * 5;
    normalizedScores[dim.id] = Math.round(normalizedScore * 10) / 10;
  });
  
  // Calculate total score
  const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0) / DIMS_TEMPLATE.length;
  const totalScoreRounded = Math.round(totalScore * 10) / 10;
  
  // Update hero section
  document.getElementById("totalScoreEl").textContent = totalScoreRounded.toFixed(1);
  document.getElementById("scoreSubtitle").textContent = getScoreInterpretation(totalScoreRounded);
  
  // Render result cards
  const resCards = document.getElementById("resCards");
  resCards.innerHTML = "";
  
  DIMS_TEMPLATE.forEach(dim => {
    const score = normalizedScores[dim.id];
    const card = document.createElement("div");
    card.className = "res-card";
    
    const head = document.createElement("div");
    head.className = "rc-head";
    
    const name = document.createElement("div");
    name.className = "rc-name";
    const archName = typeof dim.name === "object" ? dim.name[selectedArchetype] : dim.name;
    name.textContent = archName;
    head.appendChild(name);
    
    const badge = document.createElement("div");
    badge.className = "rc-badge";
    badge.textContent = score.toFixed(1);
    head.appendChild(badge);
    
    card.appendChild(head);
    
    const barWrap = document.createElement("div");
    barWrap.className = "rc-bar-wrap";
    
    const bar = document.createElement("div");
    bar.className = "rc-bar";
    bar.style.width = (score / 5) * 100 + "%";
    barWrap.appendChild(bar);
    
    card.appendChild(barWrap);
    
    const detail = document.createElement("div");
    detail.className = "rc-detail";
    detail.textContent = Math.round((score / 5) * 100) + "% mature";
    card.appendChild(detail);
    
    resCards.appendChild(card);
  });
  
  // Generate radar chart
  generateRadarChart(normalizedScores);
  
  // Calculate and display priority focus areas
  generatePriorityList(normalizedScores);
  
  results = {totalScore: totalScoreRounded, scores: normalizedScores};
}

function generateRadarChart(scores) {
  const svg = document.getElementById("radarSvg");
  svg.innerHTML = "";
  
  const dims = Object.keys(scores);
  const n = dims.length;
  const radius = 180;
  const center = {x: 290, y: 260};
  const maxValue = 5;
  
  // Draw background circles
  for (let i = 1; i <= 5; i++) {
    const r = (i / maxValue) * radius;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center.x);
    circle.setAttribute("cy", center.y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "#e2e8f0");
    circle.setAttribute("stroke-width", "1");
    svg.appendChild(circle);
  }
  
  // Draw axes and data polygon
  const points = [];
  dims.forEach((dim, idx) => {
    const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
    const value = scores[dim] || 0;
    const x = center.x + Math.cos(angle) * (value / maxValue) * radius;
    const y = center.y + Math.sin(angle) * (value / maxValue) * radius;
    points.push([x, y]);
    
    // Draw axis line
    const axisEnd = {
      x: center.x + Math.cos(angle) * radius * 1.1,
      y: center.y + Math.sin(angle) * radius * 1.1
    };
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center.x);
    line.setAttribute("y1", center.y);
    line.setAttribute("x2", axisEnd.x);
    line.setAttribute("y2", axisEnd.y);
    line.setAttribute("stroke", "#cbd5e0");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
    
    // Add labels
    const labelDist = radius * 1.25;
    const labelX = center.x + Math.cos(angle) * labelDist;
    const labelY = center.y + Math.sin(angle) * labelDist;
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", labelX);
    text.setAttribute("y", labelY);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "11");
    text.setAttribute("fill", "#4a5568");
    const archName = typeof DIMS_TEMPLATE[idx].name === "object" ? 
      DIMS_TEMPLATE[idx].name[selectedArchetype] : 
      DIMS_TEMPLATE[idx].name;
    text.textContent = archName;
    svg.appendChild(text);
  });
  
  // Draw data polygon
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", points.map(p => p[0] + "," + p[1]).join(" "));
  polygon.setAttribute("fill", "rgba(69, 162, 181, 0.2)");
  polygon.setAttribute("stroke", "#45a2b5");
  polygon.setAttribute("stroke-width", "2");
  svg.appendChild(polygon);
  
  // Draw data points
  points.forEach(p => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p[0]);
    circle.setAttribute("cy", p[1]);
    circle.setAttribute("r", "4");
    circle.setAttribute("fill", "#45a2b5");
    svg.appendChild(circle);
  });
}

function generatePriorityList(scores) {
  const priorities = DIMS_TEMPLATE
    .filter(d => scores[d.id] < 5)
    .map(d => ({
      dim: d,
      score: scores[d.id],
      gap: 5 - scores[d.id],
      leverage: (5 - scores[d.id]) * (d.strategicWeight || 1),
      missing: d.elements.filter((el, idx) => !checkedItems[`${d.id}-${idx}`])
    }))
    .sort((a, b) => b.leverage - a.leverage)
    .slice(0, 3);
  
  const prioList = document.getElementById("prioList");
  prioList.innerHTML = "";
  
  priorities.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "prio-row";
    
    const rank = document.createElement("div");
    rank.className = "prio-rank";
    rank.textContent = idx + 1;
    row.appendChild(rank);
    
    const content = document.createElement("div");
    content.className = "prio-content";
    
    const name = document.createElement("div");
    name.className = "prio-name";
    const archName = typeof p.dim.name === "object" ? p.dim.name[selectedArchetype] : p.dim.name;
    name.textContent = archName + " — " + p.score.toFixed(1) + " / 5.0";
    content.appendChild(name);
    
    const desc = document.createElement("p");
    desc.style.fontSize = "0.8rem";
    desc.style.color = "#718096";
    desc.style.margin = "6px 0 0 0";
    desc.textContent = "Gap: " + p.gap.toFixed(1) + " points | Leverage score: " + p.leverage.toFixed(1);
    content.appendChild(desc);
    
    if (p.missing.length > 0) {
      const missing = document.createElement("div");
      missing.className = "prio-missing";
      
      p.missing.forEach(el => {
        const tag = document.createElement("div");
        tag.className = "miss-tag";
        tag.textContent = el.t.substring(0, 40) + (el.t.length > 40 ? "..." : "");
        missing.appendChild(tag);
      });
      
      content.appendChild(missing);
    }
    
    row.appendChild(content);
    prioList.appendChild(row);
  });
}

function getScoreInterpretation(score) {
  if (score < 1.5) return "You're in formation mode. Build the foundations first.";
  if (score < 2.5) return "You have basics in place. Time to systematize and scale.";
  if (score < 3.5) return "You're operationally solid. Focus on leverage and differentiation.";
  if (score < 4.5) return "You're highly mature. Refine execution and explore new frontiers.";
  return "You're elite. Think about scaling your competitive advantage.";
}

function downloadPDF() {
  const element = document.getElementById("pdfContent");
  const opt = {
    margin: 10,
    filename: "tektit-maturity-report.pdf",
    image: {type: "jpeg", quality: 0.98},
    html2canvas: {scale: 2},
    jsPDF: {orientation: "portrait", unit: "mm", format: "a4"}
  };
  html2pdf().set(opt).from(element).save();
}

function backToQuestionnaire() {
  document.getElementById("results").style.display = "none";
  document.getElementById("leadGate").style.display = "none";
  window.scrollTo(0, 0);
}
