/* =========================================================
   DATA — 15 Realistic Seeded Reports
========================================================= */

const SEED_REPORTS = [
    { id: 1, text: "Building collapsed, 4 people trapped under rubble. Child injured on 2nd floor. Cannot move debris alone.", loc: "Andheri East, Mumbai", district: "Mumbai", lat: 33, lng: 50, severity: 5, category: "STRUCTURAL COLLAPSE", assigned: false, time: "14:23" },
    { id: 2, text: "Flash flood, waist deep water rising fast. 3 elderly residents on ground floor unable to evacuate.", loc: "Sion, Mumbai", district: "Mumbai", lat: 40, lng: 46, severity: 5, category: "FLOOD", assigned: false, time: "14:18" },
    { id: 3, text: "Fire in textile factory, workers trapped inside. Smoke spreading to adjacent buildings.", loc: "Dharavi, Mumbai", district: "Mumbai", lat: 38, lng: 44, severity: 5, category: "FIRE", assigned: false, time: "14:31" },
    { id: 4, text: "Landslide blocked road, 2 vehicles buried. 6 passengers unaccounted for. Police unable to access.", loc: "Malad West, Mumbai", district: "Mumbai", lat: 28, lng: 42, severity: 4, category: "LANDSLIDE", assigned: false, time: "14:15" },
    { id: 5, text: "Electrocution risk — fallen power line across flooded street. 50+ people stranded, no exit route.", loc: "Kurla, Mumbai", district: "Mumbai", lat: 42, lng: 54, severity: 4, category: "ELECTROCUTION HAZARD", assigned: true, time: "14:08" },
    { id: 6, text: "Hospital generator failure during surgery. Backup not activating. Critical patients on life support.", loc: "Dadar, Mumbai", district: "Mumbai", lat: 44, lng: 48, severity: 5, category: "CRITICAL INFRA", assigned: false, time: "14:35" },
    { id: 7, text: "Building partially collapsed after gas explosion. 12 families displaced. 2 confirmed injuries.", loc: "Bandra East, Mumbai", district: "Mumbai", lat: 37, lng: 39, severity: 4, category: "EXPLOSION", assigned: false, time: "14:29" },
    { id: 8, text: "Bridge flooding, vehicles swept. 3 cars partially submerged on NH-8. People visible inside.", loc: "Thane, Mumbai MMR", district: "Thane", lat: 30, lng: 62, severity: 5, category: "FLOOD", assigned: false, time: "14:11" },
    { id: 9, text: "Chemical spill at warehouse. Workers reporting eye burning and breathing difficulty. Evacuation needed.", loc: "Turbhe MIDC, Navi Mumbai", district: "Navi Mumbai", lat: 55, lng: 58, severity: 3, category: "HAZMAT", assigned: false, time: "14:19" },
    { id: 10, text: "Stampede at relief distribution center. 200+ people, 15 reported injured, some children.", loc: "Govandi, Mumbai", district: "Mumbai", lat: 45, lng: 57, severity: 4, category: "CROWD EVENT", assigned: false, time: "14:27" },
    { id: 11, text: "High rise water tank failure, flooding 8 floors. Elderly couple on 6th floor, lift not working.", loc: "Chembur, Mumbai", district: "Mumbai", lat: 47, lng: 52, severity: 3, category: "FLOOD", assigned: false, time: "14:33" },
    { id: 12, text: "Tree fallen on house roof during storm. Family of 5 trapped in 2 rooms. Minor injuries reported.", loc: "Vikhroli, Mumbai", district: "Mumbai", lat: 40, lng: 60, severity: 3, category: "STORM DAMAGE", assigned: false, time: "14:22" },
    { id: 13, text: "Missing elderly man with dementia, last seen near station. Family desperate. Heavy rain conditions.", loc: "Ghatkopar, Mumbai", district: "Mumbai", lat: 43, lng: 55, severity: 2, category: "MISSING PERSON", assigned: false, time: "14:14" },
    { id: 14, text: "Road cave-in near water main, 3 meters wide. Risk of further collapse. Traffic diverted.", loc: "Parel, Mumbai", district: "Mumbai", lat: 46, lng: 43, severity: 2, category: "INFRASTRUCTURE", assigned: false, time: "14:09" },
    { id: 15, text: "Flood water entering slum colony rapidly. 300+ residents, no prior warning. No boats available.", loc: "Kurla West, Mumbai", district: "Mumbai", lat: 41, lng: 52, severity: 5, category: "FLOOD", assigned: false, time: "14:38" }
];

/* =========================================================
   RPS LOGIC
========================================================= */

function calcRPS(report) {
    const nlpScore = (report.severity / 5) * 100;
    const visionScore = report.severity >= 4 ? 85 : report.severity === 3 ? 60 : 35;
    const densityScore = [1, 2, 3, 6, 8, 15].includes(report.id) ? 80 : 50;
    const vulnScore = [1, 2, 6, 8].includes(report.id) ? 90 : 60;

    return Math.round(nlpScore * 0.4 + visionScore * 0.3 + densityScore * 0.2 + vulnScore * 0.1);
}

function getSeverityTier(rps) {
    if (rps >= 80) return 'critical';
    if (rps >= 60) return 'high';
    if (rps >= 40) return 'medium';
    return 'low';
}

const reports = SEED_REPORTS.map(r => ({
    ...r,
    rps: calcRPS(r),
    tier: getSeverityTier(calcRPS(r))
})).sort((a, b) => b.rps - a.rps);

/* =========================================================
   PRIORITY ZONES
========================================================= */

const PRIORITY_ZONES = [
    { id: 'pz1', lat: 40, lng: 50, label: 'PRIORITY ZONE α — KURLA/SION CLUSTER', location: 'Kurla / Sion, Mumbai' }
];

/* =========================================================
   NAVIGATION
========================================================= */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');

    if (id === 'dashboard') initDashboard();
    if (id === 'landing') updateLandingStats();
}

/* =========================================================
   LANDING STATS
========================================================= */

function updateLandingStats() {
    animateCount('totalReports', 0, reports.length, 800);
    animateCount('criticalCount', 0, reports.filter(r => r.tier === 'critical').length, 800);
    animateCount('resolvedCount', 0, reports.filter(r => r.assigned).length, 800);
}

function animateCount(id, from, to, dur) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = performance.now();

    function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(from + (to - from) * p);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

/* =========================================================
   OFFLINE & STORAGE
========================================================= */

let isOfflineMode = false;
let offlineReports = localStorage.getItem('offlineReports') ? JSON.parse(localStorage.getItem('offlineReports')) : [];

function toggleOfflineMode() {
    isOfflineMode = !isOfflineMode;
    const btn = document.getElementById('offlineModeToggle');
    if (btn) {
        btn.textContent = isOfflineMode ? '📡 OFFLINE' : '📡 ONLINE';
        btn.style.color = isOfflineMode ? 'var(--red)' : 'var(--green)';
        btn.style.borderColor = isOfflineMode ? 'var(--red)' : 'var(--green)';
    }
}

function saveReportOffline(reportData) {
    offlineReports.push({...reportData, timestamp: new Date().toISOString(), synced: false });
    localStorage.setItem('offlineReports', JSON.stringify(offlineReports));
}

function syncOfflineReports() {
    if (offlineReports.length > 0 && !isOfflineMode) {
        offlineReports.forEach(r => {
            if (!r.synced) {
                const rps = calcRPS({ severity: r.severity });
                reports.unshift({
                    id: Date.now(),
                    text: r.text,
                    loc: r.loc,
                    district: r.loc.split(',')[1]?.trim() || 'Unknown',
                    lat: 30 + Math.random() * 30,
                    lng: 35 + Math.random() * 40,
                    severity: r.severity,
                    category: r.category,
                    disaster_type: r.disaster_type,
                    assigned: false,
                    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    rps,
                    tier: getSeverityTier(rps)
                });
                r.synced = true;
            }
        });
        localStorage.setItem('offlineReports', JSON.stringify(offlineReports));
        reports.sort((a, b) => b.rps - a.rps);
        if (document.getElementById('feedList')) renderFeed();
        if (document.getElementById('mapOverlay')) renderMap();
        if (document.getElementById('queueList')) renderQueue();
        updateMetrics();
    }
}

/* =========================================================
   FORM HANDLING
========================================================= */

const severityLabels = {
    1: ['LOW', 'Minor situation, no immediate danger', 'var(--green)'],
    2: ['MODERATE', 'Situation may worsen, assistance needed', 'var(--blue)'],
    3: ['HIGH', 'People may be injured or in danger', 'var(--amber)'],
    4: ['SEVERE', 'Multiple people at risk, urgent response needed', 'var(--red)'],
    5: ['CRITICAL', 'LIFE-THREATENING — IMMEDIATE RESPONSE REQUIRED', 'var(--red)']
};

function updateSeverity(val) {
    const el = document.getElementById('severityDisplay');
    if (!el) return;
    const [label, desc, color] = severityLabels[val];
    el.textContent = `${label} — ${desc}`;
    el.style.color = color;
}

function detectGPS() {
    const btn = document.getElementById('gpsBtn');
    if (!btn) return;
    btn.textContent = '⏳ DETECTING...';

    setTimeout(() => {
        document.getElementById('locationInput').value = 'Andheri East, Mumbai, Maharashtra';
        btn.textContent = '✓ GPS DETECTED';
        btn.classList.add('detected');
    }, 1200);
}

/* =========================================================
   DASHBOARD INIT & RENDERING
========================================================= */

let dashInited = false;
let pzShown = false;
let assignedTeams = {};

function initDashboard() {
    renderFeed();
    renderMap();
    renderQueue();
    updateMetrics();
    startClock();

    if (!pzShown) {
        setTimeout(() => {
            showPZAlert();
            pzShown = true;
        }, 800);
    }

    if (!dashInited) {
        dashInited = true;
        setInterval(simulateNewReport, 18000);
    }
}

function startClock() {
    const update = () => {
        const el = document.getElementById('dashTime');
        if (el) {
            el.textContent = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    };
    update();
    setInterval(update, 1000);
}

function updateMetrics() {
    const total = reports.length;
    const critical = reports.filter(r => r.tier === 'critical').length;
    const high = reports.filter(r => r.tier === 'high').length;
    const zones = PRIORITY_ZONES.length;

    const els = {
        'm-total': total,
        'm-critical': critical,
        'm-high': high,
        'm-zones': zones,
        'm-teams': Math.max(2, 6 - Object.keys(assignedTeams).length),
        'm-eta': '14min',
        'feedCount': `${total} REPORTS`
    };

    Object.entries(els).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });

    animateCount('totalReports', 0, total, 500);
    animateCount('criticalCount', 0, critical, 500);
    animateCount('resolvedCount', 0, reports.filter(r => r.assigned).length, 500);
}

/* ────────── FEED ────────────────────────────────────── */

function renderFeed() {
    const list = document.getElementById('feedList');
    if (!list) return;
    list.innerHTML = '';

    [...reports].reverse().forEach(r => {
        const card = document.createElement('div');
        card.className = `report-card ${r.tier}`;
        card.innerHTML = `
            <div class="card-top">
                <span class="card-badge badge-${r.tier}">${r.tier.toUpperCase()}</span>
                <span class="card-rps ${r.rps >= 75 ? 'high-rps' : ''}">${r.rps}</span>
            </div>
            <div class="card-text">${r.text}</div>
            <div class="card-meta">
                <span>📍 ${r.loc}</span>
                <span>${r.time}</span>
            </div>
        `;
        list.appendChild(card);
    });
}

/* ────────── MAP ────────────────────────────────────── */

function renderMap() {
    const overlay = document.getElementById('mapOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    const colors = {
        critical: '232,52,26',
        high: '245,158,11',
        medium: '59,130,246',
        low: '16,185,129'
    };

    // Heat blobs
    reports.forEach(r => {
        const blob = document.createElement('div');
        blob.className = 'heat-blob';
        const c = colors[r.tier];
        const size = r.rps * 1.8;
        blob.style.cssText = `left:${r.lng}%;top:${r.lat}%;width:${size}px;height:${size}px;background:radial-gradient(circle,rgba(${c},0.6) 0%,rgba(${c},0) 70%);`;
        overlay.appendChild(blob);
    });

    // Priority zones
    PRIORITY_ZONES.forEach(pz => {
        const el = document.createElement('div');
        el.className = 'priority-zone';
        el.style.cssText = `left:${pz.lng}%;top:${pz.lat}%;`;
        el.innerHTML = `
            <div class="pz-ring"></div>
            <div class="pz-ring"></div>
            <div class="pz-ring"></div>
            <div class="pz-label">🔴 ${pz.label}</div>
        `;
        overlay.appendChild(el);
    });

    // Report dots with tooltip
    const tooltip = document.getElementById('mapTooltip');
    reports.forEach(r => {
        const dot = document.createElement('div');
        dot.className = 'map-dot';
        dot.style.cssText = `left:${r.lng}%;top:${r.lat}%;`;

        const pulseColor = colors[r.tier];
        dot.innerHTML = `
            <div class="dot-inner ${r.tier}"></div>
            <div class="dot-pulse" style="--c:rgba(${pulseColor},0.4)"></div>
        `;

        dot.addEventListener('mouseenter', (e) => {
            if (tooltip) {
                tooltip.innerHTML = `
                    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.1em;color:var(--muted);margin-bottom:4px">${r.category} · RPS ${r.rps}</div>
                    <div style="font-size:0.75rem;color:var(--text);margin-bottom:6px;line-height:1.4">${r.text.substring(0, 80)}...</div>
                    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--muted2)">📍 ${r.loc}</div>
                `;
                tooltip.style.left = (r.lng + 2) + '%';
                tooltip.style.top = r.lat + '%';
                tooltip.classList.add('show');
            }
        });
        dot.addEventListener('mouseleave', () => {
            if (tooltip) tooltip.classList.remove('show');
        });
        overlay.appendChild(dot);
    });
}

/* ────────── QUEUE ──────────────────────────────────── */

function renderQueue() {
    const list = document.getElementById('queueList');
    if (!list) return;
    list.innerHTML = '';
    const sorted = [...reports].sort((a, b) => b.rps - a.rps);

    sorted.forEach((r, i) => {
        const card = document.createElement('div');
        card.className = 'queue-card';
        const rpsTier = r.rps >= 80 ? 'rps-critical' : r.rps >= 60 ? 'rps-high' : 'rps-medium';
        const isAssigned = r.assigned || assignedTeams[r.id];

        card.innerHTML = `
            <div class="qc-top">
                <div class="qc-rank">#${i + 1}</div>
                <div class="qc-rps-block">
                    <div class="qc-rps ${rpsTier}">${r.rps}</div>
                    <div class="qc-rps-label">RPS SCORE</div>
                </div>
            </div>
            <div class="qc-info">
                <div class="qc-location">📍 ${r.loc}</div>
                <div style="font-family:'DM Mono',monospace;font-size:0.55rem;color:var(--muted);margin-bottom:4px">🏷 ${r.category} · ${r.time}</div>
                <div class="qc-desc">${r.text}</div>
            </div>
            <button class="assign-btn ${isAssigned ? 'assigned' : ''}" id="assign-${r.id}" onclick="assignTeam(${r.id}, this)">
                ${isAssigned ? '✓ TEAM ASSIGNED' : '⚡ ASSIGN RESCUE TEAM'}
            </button>
        `;
        list.appendChild(card);
    });
}

function assignTeam(id, btn) {
    if (assignedTeams[id]) return;
    assignedTeams[id] = true;
    const r = reports.find(x => x.id === id);
    if (r) r.assigned = true;
    btn.textContent = '✓ TEAM ASSIGNED';
    btn.classList.add('assigned');
    updateMetrics();
}

/* ────────── PRIORITY ZONE ALERT ────────────────────── */

function showPZAlert() {
    const banner = document.getElementById('pzBanner');
    const modal = document.getElementById('pzModal');

    if (banner) banner.classList.add('show');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('pzLocation').textContent = PRIORITY_ZONES[0].location;
    }
}

function closePZModal() {
    const modal = document.getElementById('pzModal');
    if (modal) modal.classList.remove('show');
}

/* ────────── SIMULATE INCOMING REPORT ───────────────── */

function simulateNewReport() {
    const fakeReports = [
        { text: "New report: Cyclone shelter roof collapsed. 40+ people inside.", loc: "Worli, Mumbai", category: "SHELTER FAILURE", severity: 5 },
        { text: "Ambulance stuck in flood water en route to hospital. Patient critical.", loc: "Santacruz, Mumbai", category: "MEDICAL EMERGENCY", severity: 4 },
        { text: "Gas leak reported in residential complex. Residents evacuating.", loc: "Mulund, Mumbai", category: "GAS LEAK", severity: 3 },
    ];

    const fake = fakeReports[Math.floor(Math.random() * fakeReports.length)];
    const rps = calcRPS({ id: 99, severity: fake.severity });
    const newR = {
        id: Date.now(),
        text: fake.text,
        loc: fake.loc,
        district: 'Mumbai',
        lat: 25 + Math.random() * 35,
        lng: 35 + Math.random() * 35,
        severity: fake.severity,
        category: fake.category,
        assigned: false,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        rps,
        tier: getSeverityTier(rps)
    };

    reports.unshift(newR);
    reports.sort((a, b) => b.rps - a.rps);
    renderFeed();
    renderMap();
    renderQueue();
    updateMetrics();
}

/* =========================================================
   FORM HANDLING
========================================================= */

function handleUpload(input) {
    if (input.files[0]) {
        const uploadText = document.querySelector('.upload-text');
        if (uploadText) {
            uploadText.innerHTML = `<strong style="color:var(--green)">✓ ${input.files[0].name}</strong><br>Image will be analyzed for damage assessment`;
        }
    }
}

function submitSOSCall() {
    const text = document.getElementById('incidentText').value.trim();
    const loc = document.getElementById('locationInput').value.trim();

    if (!text || !loc) {
        alert('Please describe the situation and provide your location.');
        return;
    }

    const sv = parseInt(document.getElementById('severitySlider').value);
    const disasterType = document.getElementById('disasterType').value || 'OTHER';
    const sosReport = {
        text: `[HELPING SOS] ` + text,
        loc,
        severity: 5,
        category: 'HELPING SOS - ' + disasterType,
        disaster_type: disasterType,
        sos: true
    };

    const buttons = document.querySelectorAll('.submit-btn');
    if (buttons.length > 1) buttons[1].textContent = '⏳ SENDING SOS...';

    setTimeout(() => {
        if (isOfflineMode) {
            saveReportOffline(sosReport);
            alert('✓ SOS saved offline. Will sync when online.');
        } else {
            const sosRps = Math.min(100, Math.round(sv * 20 + 50));
            const newReport = {
                id: Date.now(),
                text: sosReport.text,
                loc,
                district: loc.split(',')[1]?.trim() || 'Unknown',
                lat: 30 + Math.random() * 30,
                lng: 35 + Math.random() * 40,
                severity: 5,
                category: sosReport.category,
                assigned: false,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                rps: sosRps,
                tier: 'critical',
                sos: true
            };
            reports.unshift(newReport);
            reports.sort((a, b) => b.rps - a.rps);
            renderFeed();
            renderMap();
            renderQueue();
            updateMetrics();
            alert('✓ SOS SENT! Emergency teams notified immediately.');
        }
        resetForm();
    }, 1500);
}

function submitReport() {
    const text = document.getElementById('incidentText').value.trim();
    const loc = document.getElementById('locationInput').value.trim();
    const disasterType = document.getElementById('disasterType').value || 'OTHER';

    if (!text || !loc) {
        alert('Please describe the situation and provide your location.');
        return;
    }

    if (isOfflineMode) {
        const sv = parseInt(document.getElementById('severitySlider').value);
        const reportData = {
            text,
            loc,
            severity: sv,
            category: 'CITIZEN REPORT',
            disaster_type: disasterType
        };
        saveReportOffline(reportData);
        alert('✓ Report saved offline. Will sync when online.');
        resetForm();
        return;
    }

    const sv = parseInt(document.getElementById('severitySlider').value);
    const rps = Math.min(98, Math.round(sv * 15 + Math.random() * 12 + 20));
    const tier = getSeverityTier(rps);
    const tierLabels = { critical: 'CRITICAL', high: 'HIGH PRIORITY', medium: 'MEDIUM PRIORITY', low: 'LOW PRIORITY' };
    const etas = { critical: '8–12 min', high: '15–20 min', medium: '25–35 min', low: '45–60 min' };

    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) submitBtn.textContent = '⏳ AI PROCESSING REPORT...';

    setTimeout(() => {
        const form = document.getElementById('reportForm');
        if (form) form.style.opacity = '0';

        setTimeout(() => {
            if (form) form.style.display = 'none';

            const rpsDisplay = document.getElementById('rpsDisplay');
            const rpsCategory = document.getElementById('rpsCategory');
            const etaDisplay = document.getElementById('etaDisplay');
            const successPanel = document.getElementById('successPanel');

            if (rpsDisplay) {
                rpsDisplay.textContent = rps;
                rpsDisplay.style.color = tier === 'critical' ? 'var(--red)' : tier === 'high' ? 'var(--amber)' : 'var(--green)';
            }
            if (rpsCategory) rpsCategory.textContent = tierLabels[tier];
            if (etaDisplay) etaDisplay.textContent = etas[tier];
            if (successPanel) successPanel.classList.add('show');

            // compute district from location safely (avoid formatting issues)
            const parts = loc.split(',');
            const districtVal = parts[1] ? parts[1].trim() : 'Unknown';

            const newReport = {
                id: reports.length + 1,
                text,
                loc,
                district: districtVal,
                lat: 30 + Math.random() * 30,
                lng: 35 + Math.random() * 40,
                severity: sv,
                category: 'CITIZEN REPORT',
                disaster_type: disasterType,
                assigned: false,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                rps,
                tier
            };
            reports.unshift(newReport);
            reports.sort((a, b) => b.rps - a.rps);
        }, 300);
    }, 2200);
}

function resetForm() {
    const form = document.getElementById('reportForm');
    const successPanel = document.getElementById('successPanel');
    const severitySlider = document.getElementById('severitySlider');
    const gpsBtn = document.getElementById('gpsBtn');
    const uploadText = document.querySelector('.upload-text');
    const incidentText = document.getElementById('incidentText');
    const locationInput = document.getElementById('locationInput');
    const disasterType = document.getElementById('disasterType');
    const submitBtn = document.querySelector('.submit-btn');

    if (form) {
        form.style.display = 'block';
        form.style.opacity = '1';
    }
    if (successPanel) successPanel.classList.remove('show');
    if (incidentText) incidentText.value = '';
    if (locationInput) locationInput.value = '';
    if (disasterType) disasterType.value = '';
    if (severitySlider) severitySlider.value = 3;
    if (submitBtn) submitBtn.textContent = '🚨 SUBMIT EMERGENCY REPORT';
    if (gpsBtn) {
        gpsBtn.textContent = '📍 AUTO-DETECT GPS';
        gpsBtn.classList.remove('detected');
    }
    if (uploadText) uploadText.innerHTML = 'Drag & drop or <strong>click to upload</strong><br>JPG, PNG, MP4 — max 20MB';

    updateSeverity(3);
}

/* =========================================================
   INIT & SYNC
========================================================= */

updateLandingStats();
syncOfflineReports();
window.addEventListener('online', syncOfflineReports);
window.addEventListener('offline', () => {
    isOfflineMode = true;
    toggleOfflineMode();
});

/* =========================================================
   DARK MODE TOGGLE
========================================================= */

let isDarkMode = localStorage.getItem('darkMode') === 'true';

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyDarkMode();
}

function applyDarkMode() {
    const body = document.body;
    if (isDarkMode) {
        body.style.filter = 'invert(1)';
        body.style.backgroundColor = '#000';
    } else {
        body.style.filter = 'none';
        body.style.backgroundColor = '';
    }
}

// Apply dark mode on load
if (isDarkMode) applyDarkMode();

/* =========================================================
   EMERGENCY NUMBERS
========================================================= */

function showEmergencyNumbers() {
    const modal = document.getElementById('emergencyModal');
    if (modal) modal.classList.add('show');
}

function closeEmergencyNumbers() {
    const modal = document.getElementById('emergencyModal');
    if (modal) modal.classList.remove('show');
}

/* =========================================================
   LANGUAGE TOGGLE
========================================================= */

let currentLanguage = localStorage.getItem('appLanguage') || 'en';

function toggleLanguageModal() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.classList.add('show');
}

function closeLanguageModal() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.classList.remove('show');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    closeLanguageModal();
    applyLanguage();
}

function applyLanguage() {
    const translations = {
        en: {
            'REPORT EMERGENCY': 'REPORT EMERGENCY',
            'CONTROL ROOM': 'CONTROL ROOM',
            'EMERGENCY SOS': 'EMERGENCY SOS'
        },
        hi: {
            'REPORT EMERGENCY': 'आपातकाल की रिपोर्ट करें',
            'CONTROL ROOM': 'नियंत्रण कक्ष',
            'EMERGENCY SOS': 'आपातकाल SOS'
        },
        mr: {
            'REPORT EMERGENCY': 'आपातकाल अहवाल द्या',
            'CONTROL ROOM': 'नियंत्रण कक्ष',
            'EMERGENCY SOS': 'आपातकाल SOS'
        },
        gu: {
            'REPORT EMERGENCY': 'આપતકાલ અહેવાલ',
            'CONTROL ROOM': 'નિયંત્રણ ક્ષેત્ર',
            'EMERGENCY SOS': 'આપતકાલ SOS'
        },
        ta: {
            'REPORT EMERGENCY': 'அவசரநிலை அறிக்கை',
            'CONTROL ROOM': 'নিয়ন্ত্রণ কক্ষ',
            'EMERGENCY SOS': 'அவசரநிலை SOS'
        }
    };
    
    if (translations[currentLanguage]) {
        console.log('Language switched to:', currentLanguage);
    }
}

/* =========================================================
   EMERGENCY SOS
========================================================= */

function triggerEmergencySOS() {
    const sosAlert = confirm('🆘 EMERGENCY SOS ALERT\n\nThis will immediately notify all emergency services (Police, Fire, Ambulance, NDRF).\n\nContinue?');
    
    if (sosAlert) {
        const sosReport = {
            id: Date.now(),
            text: '🆘 AUTOMATIC SOS EMERGENCY CALL - IMMEDIATE ASSISTANCE REQUIRED',
            loc: 'GPS Location Detecting...',
            district: 'UNKNOWN',
            lat: 0,
            lng: 0,
            severity: 5,
            category: 'SOS EMERGENCY',
            assigned: false,
            time: new Date().toLocaleTimeString('en-US', { hour12: false })
        };
        
        const sosRps = 100;
        const newReport = {
            ...sosReport,
            rps: sosRps,
            tier: 'critical'
        };
        
        reports.unshift(newReport);
        localStorage.setItem('offlineReports', JSON.stringify([newReport, ...offlineReports]));
        
        alert('✓ EMERGENCY SOS ACTIVATED\n\n🚨 Emergency services notified\n📍 Location transmission started\n⏱️ Nearest team ETA: 4-6 minutes');
        
        if (document.getElementById('dashboard') && document.getElementById('dashboard').classList.contains('active')) {
            updateDashboard();
        }
    }
}