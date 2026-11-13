/**
 * RETAIL BANKING CUSTOMER RETENTION & CHURN ANALYTICS PLATFORM
 * Front-end Architecture • Three.js Ambient Particle Stream • GSAP Animations • Interactive Chart.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeJsBackground();
  initTabNavigation();
  initDataAndCharts();
  initPredictorEngine();
  initCustomerDirectory();
});

// Global state
let dashboardStats = null;
let activeCharts = {};
let currentThreshold = 0.50;

/* ==========================================================================
   1. THREE.JS AMBIENT WINDY PARTICLES BACKGROUND WITH MOUSE INTERACTION
   ========================================================================== */
function initThreeJsBackground() {
  const container = document.getElementById('three-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Generate particle texture for soft circular banking tokens/particles
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Outer subtle glow
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.85)'); // Soft royal blue
    grad.addColorStop(0.35, 'rgba(147, 197, 253, 0.45)');
    grad.addColorStop(0.7, 'rgba(219, 234, 254, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  const particleCount = 120;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const basePositions = new Float32Array(particleCount * 3);
  const phases = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Spread across viewport
    positions[i3] = (Math.random() - 0.5) * 850;      // X
    positions[i3 + 1] = (Math.random() - 0.5) * 650;  // Y
    positions[i3 + 2] = (Math.random() - 0.5) * 200;  // Z

    basePositions[i3] = positions[i3];
    basePositions[i3 + 1] = positions[i3 + 1];
    basePositions[i3 + 2] = positions[i3 + 2];

    // Gentle downward & windy drifting speed (intehai slowly slowly)
    velocities[i3] = 0.15 + Math.random() * 0.25;       // Downward wind X drift
    velocities[i3 + 1] = -(0.25 + Math.random() * 0.45); // Downward velocity Y
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 24,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Mouse Interaction coordinates
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    // Normalized to screen center
    targetMouseX = (e.clientX - window.innerWidth / 2);
    targetMouseY = -(e.clientY - window.innerHeight / 2);
  }, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    const pos = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Gentle windy downward flow
      pos[i3 + 1] += velocities[i3 + 1]; // Fall down slowly
      pos[i3] += Math.sin(elapsedTime * 0.5 + phases[i]) * 0.25 + velocities[i3] * 0.2; // Windy drift

      // Mouse Hover Interaction: gently push nearby particles away
      const dx = pos[i3] - mouseX;
      const dy = pos[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 140 && dist > 0) {
        const force = (140 - dist) / 140 * 1.5;
        pos[i3] += (dx / dist) * force;
        pos[i3 + 1] += (dy / dist) * force;
      }

      // Recycle particles when they fall off screen bottom
      if (pos[i3 + 1] < -350) {
        pos[i3 + 1] = 350;
        pos[i3] = (Math.random() - 0.5) * 850;
      }
      if (pos[i3] > 450) {
        pos[i3] = -450;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================================
   2. TAB NAVIGATION & GSAP SMOOTH TRANSITIONS
   ========================================================================== */
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add('active');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(pane, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
          }
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   3. DATA FETCHING & INTERACTIVE CHART.JS CHARTS
   ========================================================================== */
async function initDataAndCharts() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API offline');
    dashboardStats = await res.json();
  } catch (err) {
    console.warn('Using static fallback analytics data...');
    dashboardStats = getFallbackStats();
  }

  populateKpiCards(dashboardStats.summary);
  renderAllCharts(dashboardStats);
  renderRecommendations(dashboardStats.recommendations);

  // Trigger GSAP entrance animation for KPI cards
  if (typeof gsap !== 'undefined') {
    gsap.from('.kpi-card', {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out'
    });
  }
}

function populateKpiCards(summary) {
  if (!summary) return;
  document.getElementById('kpi-total-customers').innerText = Number(summary.total_customers).toLocaleString();
  document.getElementById('kpi-churn-rate').innerText = summary.churn_rate + '%';
  document.getElementById('kpi-retention-rate').innerText = summary.retention_rate + '%';
  document.getElementById('kpi-churned-balance').innerText = '€' + (summary.churned_balance / 1000000).toFixed(1) + 'M';
}

function renderAllCharts(data) {
  if (typeof Chart === 'undefined') return;

  // Register ChartDataLabels plugin if available
  if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
  }

  // Chart defaults for clean light theme and Poppins typography
  Chart.defaults.font.family = "'Poppins', sans-serif";
  Chart.defaults.color = '#334155';
  Chart.defaults.borderColor = '#F1F5F9';
  Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { family: "'Poppins', sans-serif", size: 12, weight: 'bold' };
  Chart.defaults.plugins.tooltip.bodyFont = { family: "'Poppins', sans-serif", size: 12 };
  if (Chart.defaults.plugins.legend && Chart.defaults.plugins.legend.labels) {
    Chart.defaults.plugins.legend.labels.font = { family: "'Poppins', sans-serif", size: 12, weight: '500' };
  }

  // Global default for datalabels font
  if (Chart.defaults.plugins && Chart.defaults.plugins.datalabels) {
    Chart.defaults.plugins.datalabels.font = { family: "'Poppins', sans-serif", weight: '600', size: 11 };
  }

  // 1. Retention Distribution Donut Chart
  createChart('chart-retention-distribution', {
    type: 'doughnut',
    data: {
      labels: ['Retained Accounts', 'Exited / Churned'],
      datasets: [{
        data: [data.summary.retained_customers, data.summary.churned_customers],
        backgroundColor: ['#2563EB', '#DC2626'],
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 16, font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        datalabels: {
          color: '#FFFFFF',
          font: { family: "'Poppins', sans-serif", weight: '600', size: 11 },
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return `${pct}%\n(${Number(value).toLocaleString()})`;
          },
          textAlign: 'center',
          lineHeight: 1.2
        }
      },
      cutout: '55%'
    }
  });

  // 2. Regional Churn Bar Chart
  const geoLabels = data.geography.map(g => g.Geography);
  const geoRetained = data.geography.map(g => g.retained);
  const geoChurned = data.geography.map(g => g.churned);

  createChart('chart-regional-churn', {
    type: 'bar',
    data: {
      labels: geoLabels,
      datasets: [
        {
          label: 'Retained Accounts',
          data: geoRetained,
          backgroundColor: '#3B82F6',
          borderRadius: 6
        },
        {
          label: 'Churned Accounts',
          data: geoChurned,
          backgroundColor: '#DC2626',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 2,
          color: '#1E293B',
          font: { family: "'Poppins', sans-serif", weight: '600', size: 11 },
          formatter: (val) => Number(val).toLocaleString()
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 4800,
          grid: { color: '#F1F5F9' },
          ticks: { font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 3. Products Sweetspot Line Chart
  const prodLabels = data.products.map(p => `${p.NumOfProducts} Product${p.NumOfProducts > 1 ? 's' : ''}`);
  const prodRates = data.products.map(p => p.churn_rate);

  createChart('chart-products-sweetspot', {
    type: 'line',
    data: {
      labels: prodLabels,
      datasets: [{
        label: 'Attrition Rate (%)',
        data: prodRates,
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#DC2626',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 24, left: 10, right: 10 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'top',
          align: (ctx) => ctx.dataIndex === 3 ? 'bottom' : 'top',
          offset: 8,
          backgroundColor: '#FFFFFF',
          borderColor: '#DC2626',
          borderWidth: 1.5,
          borderRadius: 4,
          padding: { top: 2, bottom: 2, left: 6, right: 6 },
          color: '#DC2626',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 11 },
          formatter: (val) => val.toFixed(1) + '%'
        }
      },
      scales: {
        x: { ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } } },
        y: {
          beginAtZero: true,
          suggestedMax: 115,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 4. Active Member Impact
  createChart('chart-active-impact', {
    type: 'bar',
    data: {
      labels: ['Active Members (Engaged)', 'Inactive Accounts (Dormant)'],
      datasets: [{
        label: 'Churn Rate (%)',
        data: [14.27, 26.85],
        backgroundColor: ['#16A34A', '#DC2626'],
        borderRadius: 8,
        barThickness: 45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          color: (ctx) => ctx.dataIndex === 0 ? '#15803D' : '#B91C1C',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 12 },
          formatter: (val) => val.toFixed(2) + '%'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 32,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 5. Regional Churn Rates Horizontal
  const geoRates = data.geography.map(g => g.churn_rate);
  createChart('chart-geo-rates', {
    type: 'bar',
    data: {
      labels: geoLabels,
      datasets: [{
        label: 'Regional Churn Rate (%)',
        data: geoRates,
        backgroundColor: ['#3B82F6', '#DC2626', '#F59E0B'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 38 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'right',
          offset: 6,
          color: '#0F172A',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 12 },
          formatter: (val) => val.toFixed(2) + '%'
        }
      },
      scales: {
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        x: {
          beginAtZero: true,
          suggestedMax: 40,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 6. Age Distribution
  const ageLabels = data.age_groups.map(a => a.AgeGroup);
  const ageRates = data.age_groups.map(a => a.churn_rate);

  createChart('chart-age-distribution', {
    type: 'bar',
    data: {
      labels: ageLabels,
      datasets: [{
        label: 'Churn Rate by Age (%)',
        data: ageRates,
        backgroundColor: '#6366F1',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          color: '#4338CA',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 11 },
          formatter: (val) => val.toFixed(1) + '%'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 65,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 7. Gender Breakdown
  const femaleRate = data.gender && data.gender[0] ? data.gender[0].churn_rate : 25.07;
  const maleRate = data.gender && data.gender[1] ? data.gender[1].churn_rate : 16.46;

  createChart('chart-gender-breakdown', {
    type: 'doughnut',
    data: {
      labels: ['Female Accounts', 'Male Accounts'],
      datasets: [{
        data: [femaleRate, maleRate],
        backgroundColor: ['#EC4899', '#3B82F6'],
        borderWidth: 3,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 16, font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        datalabels: {
          color: '#FFFFFF',
          font: { family: "'Poppins', sans-serif", weight: '600', size: 11 },
          formatter: (val, ctx) => {
            return `${val.toFixed(1)}%\nAttrition`;
          },
          textAlign: 'center',
          lineHeight: 1.2
        }
      },
      cutout: '55%'
    }
  });

  // 8. Tenure Curve
  const tenureLabels = data.tenure.map(t => `${t.Tenure} Yrs`);
  const tenureRates = data.tenure.map(t => t.churn_rate);

  createChart('chart-tenure-curve', {
    type: 'line',
    data: {
      labels: tenureLabels,
      datasets: [{
        label: 'Churn Rate across Tenure',
        data: tenureRates,
        borderColor: '#2563EB',
        tension: 0.3,
        pointBackgroundColor: '#2563EB',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'top',
          align: 'top',
          offset: 5,
          color: '#1D4ED8',
          font: { family: "'Poppins', sans-serif", weight: '600', size: 10 },
          formatter: (val) => val.toFixed(1) + '%'
        }
      },
      scales: {
        x: { ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 11 } } },
        y: {
          min: 14,
          suggestedMax: 27,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 9. Balance Tiers
  const balLabels = data.balance_tiers.map(b => b.BalanceTier);
  const balRates = data.balance_tiers.map(b => b.churn_rate);

  createChart('chart-balance-tiers', {
    type: 'bar',
    data: {
      labels: balLabels,
      datasets: [{
        label: 'Churn Rate (%)',
        data: balRates,
        backgroundColor: '#0EA5E9',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          color: '#0369A1',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 11 },
          formatter: (val) => val.toFixed(1) + '%'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 11 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 35,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 10. Product Breakdown
  const prodCounts = data.products.map(p => p.total);
  createChart('chart-product-breakdown', {
    type: 'bar',
    data: {
      labels: prodLabels,
      datasets: [{
        label: 'Client Portfolio Count',
        data: prodCounts,
        backgroundColor: '#8B5CF6',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          color: '#6D28D9',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 11 },
          formatter: (val) => Number(val).toLocaleString() + ' accts'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 5900,
          grid: { color: '#F1F5F9' },
          ticks: { font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 11. Credit Card Impact
  createChart('chart-card-impact', {
    type: 'bar',
    data: {
      labels: ['Cardholders (Has Card)', 'Non-Cardholders'],
      datasets: [{
        label: 'Churn Rate (%)',
        data: [20.81, 19.97],
        backgroundColor: ['#3B82F6', '#64748B'],
        borderRadius: 6,
        barThickness: 45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          color: '#1E293B',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 12 },
          formatter: (val) => val.toFixed(2) + '%'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 12 } }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 26,
          ticks: { callback: v => v + '%', font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });

  // 12. Correlation Heatmap
  const corrLabels = data.correlations.map(c => c.feature);
  const corrValues = data.correlations.map(c => c.correlation);

  createChart('chart-correlations', {
    type: 'bar',
    data: {
      labels: corrLabels,
      datasets: [{
        label: 'Pearson Correlation with Attrition',
        data: corrValues,
        backgroundColor: corrValues.map(v => v >= 0 ? '#DC2626' : '#16A34A'),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 38, left: 38 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 0 ? 'end' : 'start',
          align: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 0 ? 'right' : 'left',
          offset: 4,
          color: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 0 ? '#B91C1C' : '#15803D',
          font: { family: "'Poppins', sans-serif", weight: '700', size: 11 },
          formatter: (val) => (val > 0 ? '+' : '') + val.toFixed(3)
        }
      },
      scales: {
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Poppins', sans-serif", weight: '500', size: 11 } }
        },
        x: {
          suggestedMin: -0.22,
          suggestedMax: 0.35,
          grid: { color: '#F1F5F9' },
          ticks: { font: { family: "'Poppins', sans-serif", size: 11 } }
        }
      }
    }
  });
}

function createChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (activeCharts[canvasId]) {
    activeCharts[canvasId].destroy();
  }
  activeCharts[canvasId] = new Chart(canvas, config);
}

/* ==========================================================================
   4. STRATEGIC RETENTION ADVISORY CARDS
   ========================================================================== */
function renderRecommendations(recs) {
  const container = document.getElementById('strategies-container');
  if (!container || !recs) return;

  container.innerHTML = recs.map(r => {
    let badgeClass = 'strat-badge-high';
    if (r.priority === 'Critical') badgeClass = 'strat-badge-critical';
    else if (r.priority === 'Medium') badgeClass = 'strat-badge-medium';

    return `
      <div class="strategy-card">
        <div>
          <div class="strat-header">
            <span class="${badgeClass}">${r.priority} Priority</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${r.id}</span>
          </div>
          <h3 class="strat-title">${r.title}</h3>
          <div class="strat-finding">
            <b>Empirical Finding:</b> ${r.finding}
          </div>
          <p class="strat-decision">
            <b>Actionable Strategy:</b> ${r.strategy}
          </p>
        </div>
        <div class="strat-footer">
          <span><b>Target:</b> ${r.target_audience}</span>
          <span style="color: var(--success); font-weight: 600;">${r.potential_impact}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   5. REAL-TIME CHURN RISK EVALUATION ENGINE (PREDICTOR)
   ========================================================================== */
function initPredictorEngine() {
  const form = document.getElementById('churn-prediction-form');
  const thresholdSlider = document.getElementById('input-threshold');
  const thresholdDisplay = document.getElementById('threshold-val-display');

  // Slider change
  if (thresholdSlider) {
    thresholdSlider.addEventListener('input', (e) => {
      currentThreshold = parseFloat(e.target.value);
      if (thresholdDisplay) thresholdDisplay.innerText = currentThreshold.toFixed(2);
      document.getElementById('res-active-threshold').innerText = currentThreshold.toFixed(2);
      recalculateThresholdEvaluation();
    });
  }

  // Presets
  setupPreset('preset-loyal', {
    Geography: 'France', Gender: 'Female', Age: 32, CreditScore: 720,
    Balance: 75000, EstimatedSalary: 90000, Tenure: 7, NumOfProducts: 2,
    IsActiveMember: 1, HasCrCard: 1
  });

  setupPreset('preset-risk-german', {
    Geography: 'Germany', Gender: 'Female', Age: 56, CreditScore: 510,
    Balance: 140000, EstimatedSalary: 115000, Tenure: 1, NumOfProducts: 1,
    IsActiveMember: 0, HasCrCard: 0
  });

  setupPreset('preset-inactive', {
    Geography: 'France', Gender: 'Male', Age: 48, CreditScore: 630,
    Balance: 110000, EstimatedSalary: 85000, Tenure: 3, NumOfProducts: 1,
    IsActiveMember: 0, HasCrCard: 1
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await executePrediction();
    });
  }
}

function setupPreset(chipId, payload) {
  const chip = document.getElementById(chipId);
  if (!chip) return;

  chip.addEventListener('click', () => {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    document.getElementById('input-geography').value = payload.Geography;
    document.getElementById('input-gender').value = payload.Gender;
    document.getElementById('input-age').value = payload.Age;
    document.getElementById('input-credit-score').value = payload.CreditScore;
    document.getElementById('input-balance').value = payload.Balance;
    document.getElementById('input-salary').value = payload.EstimatedSalary;
    document.getElementById('input-tenure').value = payload.Tenure;
    document.getElementById('input-products').value = payload.NumOfProducts;
    document.getElementById('input-active').value = payload.IsActiveMember;
    document.getElementById('input-card').value = payload.HasCrCard;

    executePrediction();
  });
}

let lastCalculatedProb = 0.0277;

async function executePrediction() {
  const payload = {
    Geography: document.getElementById('input-geography').value,
    Gender: document.getElementById('input-gender').value,
    Age: parseFloat(document.getElementById('input-age').value) || 40,
    CreditScore: parseFloat(document.getElementById('input-credit-score').value) || 650,
    Balance: parseFloat(document.getElementById('input-balance').value) || 60000,
    EstimatedSalary: parseFloat(document.getElementById('input-salary').value) || 80000,
    Tenure: parseFloat(document.getElementById('input-tenure').value) || 5,
    NumOfProducts: parseInt(document.getElementById('input-products').value) || 1,
    IsActiveMember: parseInt(document.getElementById('input-active').value) || 1,
    HasCrCard: parseInt(document.getElementById('input-card').value) || 1
  };

  let result = null;
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      result = await res.json();
    }
  } catch (e) {
    console.warn('API error, executing client-side calibrated inference...');
  }

  if (!result) {
    result = computeClientCalibratedInference(payload);
  }

  lastCalculatedProb = result.probability;
  renderPredictionResult(result);
}

function recalculateThresholdEvaluation() {
  const prob = lastCalculatedProb;
  const isChurn = prob >= currentThreshold;

  let risk_level = "Low Risk Profile";
  let badge_color = "#2563EB";
  let badge_bg = "#EFF6FF";
  let badge_border = "#BFDBFE";

  if (prob >= 0.70) {
    risk_level = "Critical High Risk";
    badge_color = "#B91C1C";
    badge_bg = "#FEE2E2";
    badge_border = "#FCA5A5";
  } else if (prob >= 0.40) {
    risk_level = "Elevated Moderate Risk";
    badge_color = "#C2410C";
    badge_bg = "#FFEDD5";
    badge_border = "#FDBA74";
  } else if (prob < 0.20) {
    risk_level = "Exceptional Loyalty (Retained)";
    badge_color = "#15803D";
    badge_bg = "#DCFCE7";
    badge_border = "#86EFAC";
  }

  const badge = document.getElementById('res-badge');
  badge.innerText = risk_level;
  badge.style.color = badge_color;
  badge.style.backgroundColor = badge_bg;
  badge.style.borderColor = badge_border;

  const decisionSpan = document.getElementById('res-decision-status');
  decisionSpan.innerText = isChurn ? 'Likely to Churn' : 'Likely to Retain';
  decisionSpan.style.color = isChurn ? '#B91C1C' : '#15803D';
}

function renderPredictionResult(res) {
  const probPct = (res.probability * 100).toFixed(2) + '%';
  document.getElementById('res-prob-pct').innerText = probPct;

  const bar = document.getElementById('res-prob-bar');
  bar.style.width = probPct;

  if (res.probability >= 0.50) {
    bar.style.backgroundColor = '#DC2626';
  } else if (res.probability >= 0.35) {
    bar.style.backgroundColor = '#EA580C';
  } else {
    bar.style.backgroundColor = '#16A34A';
  }

  recalculateThresholdEvaluation();

  // Recommendations
  const recsContainer = document.getElementById('res-recs-container');
  if (recsContainer && res.recommendations) {
    recsContainer.innerHTML = `
      <h4><i class="fa-solid fa-list-check" style="color: var(--primary);"></i> Recommended Retention Interventions:</h4>
      ${res.recommendations.map(r => `
        <div class="rec-item">
          <i class="fa-solid fa-circle-check" style="color: var(--success); margin-top: 3px;"></i>
          <span>${r}</span>
        </div>
      `).join('')}
    `;
  }

  // GSAP pulse
  if (typeof gsap !== 'undefined') {
    gsap.from('#prediction-result-box', {
      scale: 0.98,
      duration: 0.3,
      ease: 'back.out(1.5)'
    });
  }
}

function computeClientCalibratedInference(p) {
  let z = -2.15;
  z += ((p.Age - 38.9) / 10.5) * 0.78;
  if (p.Geography === 'Germany') z += 0.82;
  else if (p.Geography === 'Spain') z += 0.05;
  if (p.Gender === 'Female') z += 0.42;
  if (p.IsActiveMember === 1) z -= 0.85; else z += 0.45;
  if (p.NumOfProducts === 2) z -= 0.95;
  else if (p.NumOfProducts === 1) z += 0.15;
  else if (p.NumOfProducts >= 3) z += 1.85;
  z += ((p.Balance - 76485) / 62397) * 0.28;
  z -= ((p.CreditScore - 650) / 96) * 0.12;

  const prob = Math.min(0.99, Math.max(0.01, 1.0 / (1.0 + Math.exp(-z))));
  const is_churn = prob >= currentThreshold;

  const recs = [];
  if (is_churn) {
    if (p.Geography === 'Germany') recs.push("Apply German regional loyalty incentive and audit localized fee transparency.");
    if (p.NumOfProducts === 1) recs.push("Incentivize multi-product bundling: offer a zero-fee high-yield savings account.");
    if (p.IsActiveMember === 0) recs.push("Re-engage account with automated check-in and dedicated phone relationship advisory.");
    if (p.Balance > 100000) recs.push("Route to Private Wealth Management team to offer preferential deposit yields.");
    if (recs.length === 0) recs.push("Initiate proactive outreach campaign with personalized service review.");
  } else {
    recs.push("Customer engagement is healthy; continue regular excellence in service delivery.");
    if (p.NumOfProducts < 2) recs.push("Excellent candidate for cross-selling premium financial instruments.");
    recs.push("Schedule standard annual portfolio review.");
  }

  return {
    probability: Math.round(prob * 10000) / 10000,
    is_churn,
    recommendations: recs
  };
}

/* ==========================================================================
   6. CUSTOMER ACCOUNT DIRECTORY (TABLE, SEARCH, FILTERS, PAGINATION)
   ========================================================================== */
let custPage = 1;
const custLimit = 15;
let custTotalPages = 1;

function initCustomerDirectory() {
  const searchInput = document.getElementById('cust-search-input');
  const filterGeo = document.getElementById('filter-geography');
  const filterProd = document.getElementById('filter-products');
  const filterActive = document.getElementById('filter-active');
  const filterChurn = document.getElementById('filter-churn');

  let debounceTimer = null;
  const triggerFetch = () => {
    custPage = 1;
    fetchCustomerDirectory();
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(triggerFetch, 250);
    });
  }

  [filterGeo, filterProd, filterActive, filterChurn].forEach(f => {
    if (f) f.addEventListener('change', triggerFetch);
  });

  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (custPage > 1) {
        custPage--;
        fetchCustomerDirectory();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (custPage < custTotalPages) {
        custPage++;
        fetchCustomerDirectory();
      }
    });
  }

  fetchCustomerDirectory();
}

async function fetchCustomerDirectory() {
  const search = document.getElementById('cust-search-input')?.value || '';
  const geo = document.getElementById('filter-geography')?.value || 'All';
  const prod = document.getElementById('filter-products')?.value || 'All';
  const active = document.getElementById('filter-active')?.value || 'All';
  const churn = document.getElementById('filter-churn')?.value || 'All';

  const url = `/api/customers?page=${custPage}&limit=${custLimit}&search=${encodeURIComponent(search)}&geography=${geo}&products=${prod}&active=${active}&churn=${churn}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Customer API error');
    const result = await res.json();
    renderCustomerTable(result);
  } catch (err) {
    renderFallbackCustomerTable();
  }
}

function renderCustomerTable(result) {
  const tbody = document.getElementById('customers-table-body');
  if (!tbody) return;

  const records = result.data || [];
  custTotalPages = result.totalPages || 1;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 24px; color: var(--text-muted);">No customer records matched your query criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(c => {
    const isExited = c.Exited == '1' || c.Exited == 1;
    const tag = isExited
      ? `<span class="tag-badge tag-churn">Churned (1)</span>`
      : `<span class="tag-badge tag-stay">Retained (0)</span>`;

    const balanceNum = parseFloat(c.Balance) || 0;

    return `
      <tr>
        <td><b>${c.CustomerId || '-'}</b></td>
        <td>${c.Surname || '-'}</td>
        <td>${c.CreditScore || '-'}</td>
        <td>${c.Geography || '-'}</td>
        <td>${c.Gender || '-'}</td>
        <td>${c.Age || '-'}</td>
        <td>${c.Tenure} yrs</td>
        <td>€${balanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${c.NumOfProducts}</td>
        <td>${c.HasCrCard == '1' ? 'Yes' : 'No'}</td>
        <td>${c.IsActiveMember == '1' ? '<span style="color: var(--success); font-weight:600;">Active</span>' : '<span style="color: var(--text-light);">Inactive</span>'}</td>
        <td>${tag}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('pagination-info').innerText = `Page ${result.page} of ${result.totalPages} (Total ${result.total.toLocaleString()} accounts)`;
  document.getElementById('btn-prev-page').disabled = result.page <= 1;
  document.getElementById('btn-next-page').disabled = result.page >= result.totalPages;
}

function renderFallbackCustomerTable() {
  const tbody = document.getElementById('customers-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr><td><b>15634602</b></td><td>Hargrave</td><td>619</td><td>France</td><td>Female</td><td>42</td><td>2 yrs</td><td>€0.00</td><td>1</td><td>Yes</td><td><span style="color: var(--success); font-weight:600;">Active</span></td><td><span class="tag-badge tag-churn">Churned (1)</span></td></tr>
    <tr><td><b>15647311</b></td><td>Hill</td><td>608</td><td>Spain</td><td>Female</td><td>41</td><td>1 yrs</td><td>€83,807.86</td><td>1</td><td>No</td><td><span style="color: var(--success); font-weight:600;">Active</span></td><td><span class="tag-badge tag-stay">Retained (0)</span></td></tr>
    <tr><td><b>15619304</b></td><td>Onio</td><td>502</td><td>France</td><td>Female</td><td>42</td><td>8 yrs</td><td>€159,660.80</td><td>3</td><td>Yes</td><td><span style="color: var(--text-light);">Inactive</span></td><td><span class="tag-badge tag-churn">Churned (1)</span></td></tr>
    <tr><td><b>15701354</b></td><td>Boni</td><td>699</td><td>France</td><td>Female</td><td>39</td><td>1 yrs</td><td>€0.00</td><td>2</td><td>No</td><td><span style="color: var(--text-light);">Inactive</span></td><td><span class="tag-badge tag-stay">Retained (0)</span></td></tr>
    <tr><td><b>15737888</b></td><td>Mitchell</td><td>850</td><td>Spain</td><td>Female</td><td>43</td><td>2 yrs</td><td>€125,510.82</td><td>1</td><td>Yes</td><td><span style="color: var(--success); font-weight:600;">Active</span></td><td><span class="tag-badge tag-stay">Retained (0)</span></td></tr>
  `;
}

/* ==========================================================================
   7. STATIC FALLBACK DATA
   ========================================================================== */
function getFallbackStats() {
  return {
    summary: {
      total_customers: 10000,
      churned_customers: 2037,
      retained_customers: 7963,
      churn_rate: 20.37,
      retention_rate: 79.63,
      total_balance: 764858892.88,
      churned_balance: 185588094.82,
      avg_balance: 76485.89,
      avg_credit_score: 650.5,
      avg_tenure: 5.0,
      avg_age: 38.9,
      active_member_pct: 51.51
    },
    geography: [
      { Geography: 'France', total: 5014, churned: 810, retained: 4204, churn_rate: 16.15 },
      { Geography: 'Germany', total: 2509, churned: 814, retained: 1695, churn_rate: 32.44 },
      { Geography: 'Spain', total: 2477, churned: 413, retained: 2064, churn_rate: 16.67 }
    ],
    gender: [
      { Gender: 'Female', total: 4543, churned: 1139, churn_rate: 25.07 },
      { Gender: 'Male', total: 5457, churned: 898, churn_rate: 16.46 }
    ],
    age_groups: [
      { AgeGroup: '18-30 Years', total: 1968, churned: 148, churn_rate: 7.52 },
      { AgeGroup: '31-40 Years', total: 4451, churned: 538, churn_rate: 12.09 },
      { AgeGroup: '41-50 Years', total: 2320, churned: 787, churn_rate: 33.92 },
      { AgeGroup: '51-60 Years', total: 797, churned: 448, churn_rate: 56.21 },
      { AgeGroup: '60+ Years', total: 464, churned: 116, churn_rate: 25.00 }
    ],
    products: [
      { NumOfProducts: 1, total: 5084, churned: 1409, churn_rate: 27.71 },
      { NumOfProducts: 2, total: 4590, churned: 348, churn_rate: 7.58 },
      { NumOfProducts: 3, total: 266, churned: 220, churn_rate: 82.71 },
      { NumOfProducts: 4, total: 60, churned: 60, churn_rate: 100.0 }
    ],
    tenure: [
      { Tenure: 0, churn_rate: 23.0 }, { Tenure: 1, churn_rate: 22.4 }, { Tenure: 2, churn_rate: 19.2 },
      { Tenure: 3, churn_rate: 21.1 }, { Tenure: 4, churn_rate: 20.5 }, { Tenure: 5, churn_rate: 20.7 },
      { Tenure: 6, churn_rate: 20.1 }, { Tenure: 7, churn_rate: 17.3 }, { Tenure: 8, churn_rate: 19.2 },
      { Tenure: 9, churn_rate: 21.7 }, { Tenure: 10, churn_rate: 20.6 }
    ],
    balance_tiers: [
      { BalanceTier: 'Zero Balance (€0)', churn_rate: 13.82 },
      { BalanceTier: 'Low (<€50k)', churn_rate: 21.5 },
      { BalanceTier: 'Moderate (€50k-€100k)', churn_rate: 19.8 },
      { BalanceTier: 'High (€100k-€150k)', churn_rate: 25.83 },
      { BalanceTier: 'Ultra High (>€150k)', churn_rate: 26.54 }
    ],
    correlations: [
      { feature: 'Age', correlation: 0.2854 },
      { feature: 'IsActiveMember', correlation: -0.1561 },
      { feature: 'Balance', correlation: 0.1185 },
      { feature: 'NumOfProducts', correlation: -0.0478 },
      { feature: 'CreditScore', correlation: -0.0271 },
      { feature: 'Tenure', correlation: -0.0140 },
      { feature: 'EstimatedSalary', correlation: 0.0121 },
      { feature: 'HasCrCard', correlation: -0.0071 }
    ],
    recommendations: [
      {
        id: 'REC-01',
        title: 'German Regional Retention Taskforce',
        category: 'Geographic Risk',
        priority: 'Critical',
        finding: 'German customers churn at 32.44% (double France and Spain), losing €81.2M in portfolio deposits.',
        strategy: 'Establish localized German banking advisory, audit fee transparency, and offer fixed-deposit yield boosts for maintained account balances.',
        target_audience: 'Account holders in Germany with balance > €50,000',
        potential_impact: 'Up to 28% reduction in German regional churn'
      },
      {
        id: 'REC-02',
        title: 'Two-Product Account Consolidation Package',
        category: 'Product Depth',
        priority: 'High',
        finding: 'Customers holding 2 products exhibit lowest churn rate (7.58%) vs 27.71% for single-product holders and >82% for 3+ products.',
        strategy: 'Incentivize single-product customers with zero-fee secondary accounts (e.g., automated savings pot), while avoiding complex over-selling.',
        target_audience: '5,084 single-product customers',
        potential_impact: 'Estimated €14.5M annual deposit retention'
      },
      {
        id: 'REC-03',
        title: 'Proactive Engagement for Middle-Aged & Inactive Clients',
        category: 'Demographic & Activity',
        priority: 'High',
        finding: 'Inactive accounts churn at 26.85% (nearly 2x active members), with customers aged 40-60 representing 54% of all churners.',
        strategy: 'Deploy automated transaction inactivity monitors. At 45 days of dormancy, trigger relationship check-ins with tailored wealth advisory.',
        target_audience: 'Clients aged 40-60 exhibiting 0 transactions over 45 days',
        potential_impact: '35% improvement in middle-aged client retention'
      },
      {
        id: 'REC-04',
        title: 'VIP Relationship Banking for High-Balance Accounts',
        category: 'Wealth Preservation',
        priority: 'Medium',
        finding: 'Churned customers carry a higher median balance (€109k) than loyal accounts, indicating aggressive competitor poaching.',
        strategy: 'Assign dedicated personal relationship managers and bespoke wealth management products to accounts exceeding €100k balance.',
        target_audience: 'Accounts with balance > €100,000 and predicted risk > 35%',
        potential_impact: 'Safeguards €65M in high-tier retail liquidity'
      }
    ]
  };
}
