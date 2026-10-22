// Project Aegis — Anti-Counterfeit Infrastructure SPA Router, Scan Engine, Blueprint & Trade Monitor

(function () {
  const ROUTE_TITLES = {
    "/": "AEGIS — Anti-Counterfeit Infrastructure",
    "/home": "AEGIS — Anti-Counterfeit Infrastructure",
    "/verify": "Verify | AEGIS",
    "/blueprint": "Blueprint | AEGIS",
    "/trade": "Trade | AEGIS",
    "/mint": "Mint & Stamp Bind | AEGIS",
    "/dooh": "VANBRANSA DOOH | AEGIS",
    "/reports": "AI Reports & Analytics | AEGIS",
    "/login": "Console | AEGIS",
    "/register": "Register | AEGIS",
    "/forgot-password": "Forgot Password | AEGIS",
    "/reset-password": "Reset Password | AEGIS"
  };

  const STORAGE_KEYS = {
    HISTORY: "aegis_verify_scan_history_v2",
    CASES: "aegis_verify_seizure_cases_v2",
    USER: "aegis_verify_auth_user_v2",
    ROLE: "aegis_verify_role_mode_v2",
    BATCHES: "aegis_verify_minted_batches_v2",
    DOOH: "aegis_verify_dooh_billboards_v2",
    BEVERAGES: "aegis_verify_beverages_v2"
  };

  const persistedBeverages = loadJSON(STORAGE_KEYS.BEVERAGES, null);
  if (Array.isArray(persistedBeverages) && persistedBeverages.length > 0) {
    window.SENTINEL_DATA.beverageDatabase = persistedBeverages;
  }

  const state = {
    currentRoute: "/",
    roleMode: localStorage.getItem(STORAGE_KEYS.ROLE) || "consumer",
    user: loadJSON(STORAGE_KEYS.USER, null),
    scanHistory: loadJSON(STORAGE_KEYS.HISTORY, []),
    seizureCases: loadJSON(STORAGE_KEYS.CASES, window.SENTINEL_DATA.seizureCases),
    mintedBatches: loadJSON(STORAGE_KEYS.BATCHES, window.SENTINEL_DATA.mintedBatches),
    doohBillboards: loadJSON(STORAGE_KEYS.DOOH, window.SENTINEL_DATA.doohBillboards),
    activeProduct: window.SENTINEL_DATA.beverageDatabase[0],
    uvMode: false,
    cameraActive: false,
    cameraStream: null,
    barcodeInterval: null,
    photoForensicResult: null,
    blueprintActiveLayer: 0,
    blueprintTestScenario: "authentic",
    tradeFilterSeverity: "ALL",
    tradeSearchQuery: "",
    selectedHotspotId: "HS-NRB-01",
    selectedBillboardId: "VNB-NRB-01",
    doohAutoSync: true,
    lastMintedUnit: null,
    activeAiPresetId: "exec-brief",
    aiCustomPrompt: "",
    aiReportOutput: null,
    simComplianceRate: 48,
    simDoohCoverage: 75,
    simCheckpoints: 12
  };

  if (state.scanHistory.length === 0) {
    state.scanHistory = [
      {
        id: "SCN-9921",
        serial: "SNT-FA24-57D2-13EE-EC26",
        name: "Aegis Reserve Whisky 750ml",
        status: "SUSPICIOUS",
        verdictBadge: "ALREADY OPENED",
        riskScore: 74,
        confidence: 96.4,
        location: "Nakuru",
        timestamp: "Just now"
      },
      {
        id: "SCN-9920",
        serial: "AEG-2026-8841-KEN",
        name: "Tusker Malt Premium Lager",
        status: "AUTHENTIC",
        verdictBadge: "VERIFIED GENUINE",
        riskScore: 3,
        confidence: 99.8,
        location: "Westlands, Nairobi",
        timestamp: "9 mins ago"
      },
      {
        id: "SCN-9919",
        serial: "AEG-FAKE-0013-CLN",
        name: "Royal Crown Gin 750ml (Cloned Batch)",
        status: "COUNTERFEIT",
        verdictBadge: "CLONED STAMP FAKE",
        riskScore: 98,
        confidence: 99.9,
        location: "Kariobangi South, Nairobi",
        timestamp: "24 mins ago"
      }
    ];
    saveJSON(STORAGE_KEYS.HISTORY, state.scanHistory);
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }

  function generateQrSvg(seedString, size = 112, fg = "#f97316", bg = "#080706") {
    const str = String(seedString || "AEGIS");
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const grid = 13;
    const cell = size / grid;
    let rects = `<rect width="${size}" height="${size}" rx="8" fill="${bg}"/>`;

    const isFinder = (r, c) =>
      (r < 4 && c < 4) || (r < 4 && c >= grid - 4) || (r >= grid - 4 && c < 4);

    const drawFinder = (r0, c0) => {
      const x = (c0 + 0.5) * cell;
      const y = (r0 + 0.5) * cell;
      const w = 3 * cell;
      rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${w.toFixed(1)}" rx="2" fill="none" stroke="${fg}" stroke-width="${(cell * 0.55).toFixed(1)}"/>`;
      rects += `<rect x="${(x + cell * 0.85).toFixed(1)}" y="${(y + cell * 0.85).toFixed(1)}" width="${(cell * 1.3).toFixed(1)}" height="${(cell * 1.3).toFixed(1)}" fill="${fg}"/>`;
    };
    drawFinder(0, 0);
    drawFinder(0, grid - 4);
    drawFinder(grid - 4, 0);

    for (let r = 1; r < grid - 1; r++) {
      for (let c = 1; c < grid - 1; c++) {
        if (isFinder(r, c)) continue;
        const bit = ((hash >>> ((r * grid + c) % 28)) ^ (str.charCodeAt((r + c) % str.length) * (r + 1))) & 1;
        if (bit) {
          rects += `<rect x="${(c * cell + 0.6).toFixed(1)}" y="${(r * cell + 0.6).toFixed(1)}" width="${(cell - 1.2).toFixed(1)}" height="${(cell - 1.2).toFixed(1)}" rx="1" fill="${fg}"/>`;
        }
      }
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  }

  function showToast(title, message, variant = "orange") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const palette = {
      orange: "border-orange-500/40 bg-[#120f0d]/95 text-orange-300",
      emerald: "border-emerald-500/40 bg-[#120f0d]/95 text-emerald-300",
      rose: "border-rose-500/40 bg-[#120f0d]/95 text-rose-300",
      amber: "border-amber-500/40 bg-[#120f0d]/95 text-amber-300",
      cyan: "border-orange-500/40 bg-[#120f0d]/95 text-orange-300"
    };
    const icons = {
      orange: "sparkles",
      emerald: "check-circle-2",
      rose: "shield-alert",
      amber: "alert-triangle",
      cyan: "sparkles"
    };

    const el = document.createElement("div");
    el.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${palette[variant] || palette.orange}`;
    el.innerHTML = `
      <i data-lucide="${icons[variant] || "info"}" class="w-5 h-5 shrink-0 mt-0.5"></i>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold uppercase tracking-wider">${escapeHtml(title)}</p>
        <p class="text-xs text-stone-300 mt-0.5 leading-relaxed">${escapeHtml(message)}</p>
      </div>
    `;
    container.appendChild(el);
    if (window.lucide) window.lucide.createIcons({ attrs: { class: "w-5 h-5" } });

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 250);
    }, 4200);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusBadgeHTML(status, customLabel) {
    const label = customLabel || (status === "AUTHENTIC" ? "VERIFIED GENUINE" : status === "SUSPICIOUS" ? "ALREADY OPENED" : "CLONED STAMP FAKE");
    if (status === "AUTHENTIC") {
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${escapeHtml(label)}
      </span>`;
    }
    if (status === "SUSPICIOUS") {
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/35 uppercase tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>${escapeHtml(label)}
      </span>`;
    }
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>${escapeHtml(label)}
    </span>`;
  }

  function getNormalizedRoute() {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    const path = hash.split("?")[0].toLowerCase() || "/";
    if (path === "/home") return "/";
    if (ROUTE_TITLES[path]) return path;
    return "/";
  }

  function navigateTo(route) {
    window.location.hash = route;
  }

  function stopCameraIfNeeded() {
    if (state.barcodeInterval) {
      clearInterval(state.barcodeInterval);
      state.barcodeInterval = null;
    }
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(track => track.stop());
      state.cameraStream = null;
    }
    state.cameraActive = false;
  }

  function updateHeaderUI() {
    const route = state.currentRoute;
    document.title = ROUTE_TITLES[route] || "AEGIS — Anti-Counterfeit Infrastructure";

    document.querySelectorAll(".nav-link, .top-nav-link").forEach(link => {
      const linkRoute = link.getAttribute("data-route");
      if (linkRoute === route || (route === "/home" && linkRoute === "/")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    document.querySelectorAll(".role-btn").forEach(btn => {
      const r = btn.getAttribute("data-role-mode");
      if (r === state.roleMode) {
        btn.className = "role-btn py-1.5 rounded-lg font-semibold transition-all text-center bg-orange-500/20 text-orange-300 border border-orange-500/35";
      } else {
        btn.className = "role-btn py-1.5 rounded-lg font-medium transition-all text-center text-stone-400 hover:text-stone-200 border border-transparent";
      }
    });

    const alertBadge = document.getElementById("nav-alert-badge");
    if (alertBadge) {
      alertBadge.textContent = String(state.seizureCases.length);
    }

    const mintBadge = document.getElementById("nav-mint-badge");
    if (mintBadge) {
      mintBadge.textContent = `${state.mintedBatches.length} LOTS`;
    }

    const doohBadge = document.getElementById("nav-dooh-badge");
    if (doohBadge) {
      const emergencyCount = state.doohBillboards.filter(b => b.activeMode === "EMERGENCY_ALERT").length;
      doohBadge.textContent = emergencyCount > 0 ? `${emergencyCount} ALERT` : `${state.doohBillboards.length} LED`;
    }

    const sidebarSpecimens = document.getElementById("sidebar-specimens-list");
    if (sidebarSpecimens) {
      sidebarSpecimens.innerHTML = window.SENTINEL_DATA.beverageDatabase.slice(0, 4).map(item => {
        const isCurrent = state.activeProduct && state.activeProduct.serial === item.serial;
        const badgeColor =
          item.status === "AUTHENTIC"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : item.status === "COUNTERFEIT"
            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
            : "bg-amber-500/15 text-amber-400 border-amber-500/30";
        const shortBadge =
          item.status === "AUTHENTIC"
            ? `OK • ${item.riskScore}`
            : item.status === "COUNTERFEIT"
            ? `FAKE ${item.riskScore}`
            : `RISK ${item.riskScore}`;
        return `
          <button
            type="button"
            data-sidebar-serial="${escapeHtml(item.serial)}"
            class="w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-2 group ${
              isCurrent
                ? "bg-orange-500/15 border-orange-500/50 text-white"
                : "bg-[#120f0d] hover:bg-stone-800/80 border-stone-800/90 text-stone-300"
            }"
          >
            <div class="min-w-0">
              <p class="text-xs font-medium text-stone-200 group-hover:text-white truncate">${escapeHtml(item.name)}</p>
              <p class="text-[10px] font-mono text-stone-500 truncate">${escapeHtml(item.serial)}</p>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono border shrink-0 ${badgeColor}">${escapeHtml(shortBadge)}</span>
          </button>
        `;
      }).join("");

      sidebarSpecimens.querySelectorAll("[data-sidebar-serial]").forEach(btn => {
        btn.addEventListener("click", () => {
          const serial = btn.getAttribute("data-sidebar-serial");
          toggleMobileSidebar(false);
          executeSerialLookup(serial);
          if (state.currentRoute !== "/verify") {
            navigateTo("/verify");
          }
        });
      });
    }

    const userSlot = document.getElementById("user-nav-slot");
    if (userSlot) {
      if (state.user) {
        userSlot.innerHTML = `
          <div class="flex items-center gap-2.5">
            <div class="hidden sm:flex flex-col text-right">
              <span class="text-xs font-semibold text-white">${escapeHtml(state.user.name)}</span>
              <span class="text-[10px] font-mono text-orange-400 uppercase">${escapeHtml(state.user.badge || state.roleMode)}</span>
            </div>
            <button type="button" id="logout-btn" title="Sign Out" class="px-3 py-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 font-medium flex items-center gap-1.5">
              <span>Sign Out</span>
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            state.user = null;
            localStorage.removeItem(STORAGE_KEYS.USER);
            showToast("Session Ended", "Signed out of Aegis Console.", "orange");
            renderApp();
          });
        }
      } else {
        userSlot.innerHTML = `
          <a href="#/login" class="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs sm:text-sm tracking-tight transition-all shadow-lg shadow-orange-500/20">
            <span>Console</span>
            <span class="font-mono text-xs">↗</span>
          </a>
        `;
      }
    }
  }

  // ============================================================================
  // VIEW 1: PROJECT AEGIS HERO & COMMAND OVERVIEW ("/" and "/home")
  // ============================================================================
  function renderHomeView() {
    const stats = window.SENTINEL_DATA.platformStats;
    const p = state.activeProduct;
    const flags = p.flags || ["already_opened", "post_retirement_scan"];

    return `
      <div class="view-animate space-y-14">
        <!-- Hero Section Matching Uploaded Aegis Design -->
        <section class="relative pt-4 pb-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <!-- Left Hero Copy -->
            <div class="lg:col-span-7 space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <div class="inline-flex items-center px-2.5 py-1 rounded-md bg-black border border-stone-800/90 shadow">
                  <img src="assets/vanbransa-logo.png" alt="VANBRANSA" class="h-5 w-auto object-contain" />
                </div>
                <div class="text-[11px] sm:text-xs font-mono uppercase tracking-[0.22em] text-orange-500 font-semibold">
                  PROJECT AEGIS &nbsp;·&nbsp; ANTI-COUNTERFEIT INFRASTRUCTURE
                </div>
              </div>

              <h1 class="text-4xl sm:text-5xl lg:text-[3.65rem] font-extrabold tracking-tight leading-[1.06]">
                <span class="block text-white">Every bottle carries</span>
                <span class="block text-white">an identity.</span>
                <span class="block text-[#f97316] mt-1">Anyone can check it</span>
                <span class="block text-[#f97316]">in seconds.</span>
              </h1>

              <p class="text-stone-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                Aegis gives each unit a phone-checkable cryptographic identity, binds it to the excise stamp, and scores every scan, shipment and field test to find fakes and the networks behind them.
              </p>

              <!-- Primary CTA Buttons matching screenshot -->
              <div class="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#/verify"
                  class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-sm transition-all shadow-xl shadow-orange-500/20"
                >
                  <i data-lucide="scan" class="w-4 h-4"></i>
                  <span>Check a bottle now</span>
                </a>

                <a
                  href="#/blueprint"
                  class="inline-flex items-center gap-2.5 px-5 py-3.5 rounded bg-transparent hover:bg-orange-500/10 border border-orange-500/35 text-orange-400 font-semibold text-sm transition-all"
                >
                  <span>Read the blueprint</span>
                  <span class="font-mono">↗</span>
                </a>

                <a
                  href="aegis-vanbransa-pitch-deck.pptx"
                  download="AEGIS-VANBRANSA-Pitch-Deck.pptx"
                  class="inline-flex items-center gap-2 px-4 py-3.5 rounded bg-[#14110f] hover:bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs font-semibold transition-all"
                >
                  <i data-lucide="presentation" class="w-4 h-4 text-orange-400"></i>
                  <span>Pitch Deck (.pptx)</span>
                </a>

                <a
                  href="pitch-deck.html"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 px-4 py-3.5 rounded bg-[#14110f] hover:bg-stone-800 border border-stone-700 text-orange-300 font-mono text-xs font-semibold transition-all"
                >
                  <span>Slide Viewer ↗</span>
                </a>
              </div>

              <!-- Interactive Serial Quick-Check Strip -->
              <form id="hero-quick-verify-form" class="pt-3 flex flex-col sm:flex-row gap-2.5 max-w-lg">
                <div class="relative flex-1">
                  <i data-lucide="qr-code" class="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                  <input
                    type="text"
                    id="hero-serial-input"
                    placeholder="Enter unit code (e.g. SNT-FA24-57D2-13EE-EC26)"
                    class="w-full pl-10 pr-4 py-2.5 rounded bg-[#110e0c]/90 border border-stone-800 text-xs sm:text-sm font-mono text-stone-200 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  class="px-4 py-2.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-orange-400 font-mono text-xs font-semibold shrink-0 transition-all"
                >
                  SCORE UNIT →
                </button>
              </form>
            </div>

            <!-- Right Live Scan Engine Card (Matches Screenshot) -->
            <div class="lg:col-span-5">
              <div class="rounded border border-stone-800/90 bg-[#0d0b0a]/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <!-- Top Header Row -->
                <div class="flex items-center justify-between text-[11px] font-mono tracking-[0.18em] uppercase pb-4 border-b border-stone-800/90">
                  <span class="text-stone-400">SCAN ENGINE &nbsp;·&nbsp; LIVE</span>
                  <span class="inline-flex items-center gap-2 text-orange-500 font-semibold">
                    <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    SCORING
                  </span>
                </div>

                <!-- Animated Orange Progress Line -->
                <div class="w-full bg-stone-900 h-[2px] mb-6 overflow-hidden">
                  <div class="aegis-scan-progress"></div>
                </div>

                <!-- Active Unit Identity Details -->
                <div class="space-y-4">
                  <div>
                    <p class="font-mono text-sm sm:text-base text-stone-300 tracking-wide">${escapeHtml(p.serial)}</p>
                    <p class="text-xs sm:text-sm text-stone-500 mt-0.5">${escapeHtml(p.name)} &nbsp;·&nbsp; ${escapeHtml(p.lastScannedLocation.split(",")[0])}</p>
                  </div>

                  <!-- Status Box & Risk Score -->
                  <div class="flex items-center gap-4 pt-1">
                    <span class="px-3.5 py-1.5 rounded border border-stone-800 bg-[#14110f] font-mono text-xs uppercase tracking-[0.16em] ${
                      p.status === "AUTHENTIC"
                        ? "text-emerald-400 border-emerald-500/30"
                        : p.status === "COUNTERFEIT"
                        ? "text-rose-400 border-rose-500/40"
                        : "text-amber-500/90 border-amber-500/30"
                    }">
                      ${escapeHtml(p.verdictBadge || p.status)}
                    </span>
                    <span class="font-mono text-xs tracking-[0.16em] text-stone-400 uppercase">
                      RISK <strong class="text-stone-200">${p.riskScore}</strong>
                    </span>
                  </div>

                  <!-- Telemetry Flags List -->
                  <div class="pt-2 space-y-1.5 font-mono text-xs text-stone-500">
                    ${flags.map(flag => `
                      <div class="flex items-center gap-2">
                        <span class="text-orange-500/70">·</span>
                        <span>${escapeHtml(flag)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>

                <!-- Specimen Switcher Footer inside Scan Engine Card -->
                <div class="mt-7 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span class="text-[10px] font-mono uppercase tracking-wider text-stone-500">Switch Live Feed:</span>
                  <div class="flex flex-wrap gap-1.5">
                    ${window.SENTINEL_DATA.beverageDatabase.map(item => `
                      <button
                        type="button"
                        data-quick-serial="${escapeHtml(item.serial)}"
                        class="px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                          item.serial === p.serial
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                            : "bg-stone-900/70 border-stone-800 text-stone-400 hover:text-white"
                        }"
                      >
                        ${escapeHtml(item.serial.slice(0, 8))}
                      </button>
                    `).join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4-Column Kenyan Market Statistics Bar (Matches Bottom of Screenshot) -->
        <section class="border-t border-stone-800/80 pt-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="space-y-2">
              <p class="text-3xl sm:text-4xl font-extrabold text-[#f97316] tracking-tight">${stats.illicitAlcoholShare}</p>
              <p class="text-xs sm:text-sm text-stone-400 leading-relaxed">
                ${escapeHtml(stats.illicitAlcoholSub)}
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-3xl sm:text-4xl font-extrabold text-[#f97316] tracking-tight">${stats.revenueLost}</p>
              <p class="text-xs sm:text-sm text-stone-400 leading-relaxed">
                ${escapeHtml(stats.revenueLostSub)}
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-3xl sm:text-4xl font-extrabold text-[#f97316] tracking-tight">${stats.flaggedStamps}</p>
              <p class="text-xs sm:text-sm text-stone-400 leading-relaxed">
                ${escapeHtml(stats.flaggedStampsSub)}
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-3xl sm:text-4xl font-extrabold text-[#f97316] tracking-tight">${stats.counterfeitRatio}</p>
              <p class="text-xs sm:text-sm text-stone-400 leading-relaxed">
                ${escapeHtml(stats.counterfeitRatioSub)}
              </p>
            </div>
          </div>
        </section>

        <!-- Six Core Interrelated Infrastructure Modules -->
        <section class="space-y-5 pt-4">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span class="text-xs font-mono uppercase tracking-[0.18em] text-orange-500">Closed-Loop Infrastructure Modules</span>
              <h2 class="text-xl sm:text-2xl font-bold text-white mt-1">Minting, Verification, Blueprint, Trade Radar, DOOH &amp; AI Cortex</h2>
            </div>
            <p class="text-xs text-stone-400">Select any module below or use the persistent left navigation</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <i data-lucide="scan-line" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">1. Check a Bottle</h3>
                  <span class="text-xs font-mono text-orange-400">/verify</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Phone-checkable cryptographic unit identity, 365nm UV taggant inspection, POS closure retirement (<code class="text-orange-400 font-mono">already_opened</code>), and custody timeline.
                </p>
              </div>
              <a href="#/verify" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Open Scan Engine</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <i data-lucide="cpu" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">2. Aegis Blueprint</h3>
                  <span class="text-xs font-mono text-orange-400">/blueprint</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Explore how Aegis binds ECDSA P-256 unit identities to KRA excise stamps and scores every scan, shipment, and field test in &lt;150ms.
                </p>
              </div>
              <a href="#/blueprint" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Read the Blueprint</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <i data-lucide="radar" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">3. Trade Surveillance</h3>
                  <span class="text-xs font-mono text-orange-400">/trade</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Real-time counterfeit network discovery across Nakuru, Nairobi, Busia, and Mombasa with field seizure warrant tracking.
                </p>
              </div>
              <a href="#/trade" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Open Trade Monitor</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-emerald-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <i data-lucide="qr-code" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">4. Mint &amp; Stamp Bind</h3>
                  <span class="text-xs font-mono text-emerald-400">/mint</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Provision new beverage batches on the bottling line HSM, bind KRA excise stamp reels, and print scannable QR neck labels.
                </p>
              </div>
              <a href="#/mint" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Provision Batch Lot</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <i data-lucide="monitor-play" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">5. VANBRANSA DOOH</h3>
                  <span class="text-xs font-mono text-orange-400">/dooh</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Smart roadside LED billboards dynamically linked to county counterfeit risk feeds with instant consumer QR verification handoff.
                </p>
              </div>
              <a href="#/dooh" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Manage Smart Billboards</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all group">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <i data-lucide="brain-circuit" class="w-5 h-5"></i>
                </div>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-white">6. AI Reports &amp; Analytics</h3>
                  <span class="text-xs font-mono text-orange-400">/reports</span>
                </div>
                <p class="text-xs text-stone-400 leading-relaxed">
                  Aegis Cortex neural copilot, excise tax recovery trajectories, county risk matrices, and interactive What-If policy simulation.
                </p>
              </div>
              <a href="#/reports" class="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Aegis Cortex AI</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </div>
        </section>

        <!-- Recent Live Scans Feed -->
        <section class="rounded-xl border border-stone-800/90 bg-[#110e0c]/85 backdrop-blur-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-white">Live Scan Scoring Stream</h3>
              <p class="text-xs text-stone-400">Click any unit below to inspect its full cryptographic & spectral dossier in <code class="text-orange-400">/verify</code></p>
            </div>
            <a href="#/verify" class="text-xs font-mono text-orange-400 hover:underline">Open Full Scanner →</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-stone-800 text-stone-400 font-mono">
                  <th class="py-2.5 px-3">SCAN ID</th>
                  <th class="py-2.5 px-3">UNIT IDENTITY</th>
                  <th class="py-2.5 px-3">PRODUCT SKU</th>
                  <th class="py-2.5 px-3">VERDICT</th>
                  <th class="py-2.5 px-3">RISK SCORE</th>
                  <th class="py-2.5 px-3">LOCATION</th>
                  <th class="py-2.5 px-3 text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60">
                ${state.scanHistory.slice(0, 6).map(entry => `
                  <tr class="hover:bg-stone-800/30 transition-colors">
                    <td class="py-3 px-3 font-mono text-stone-400">${escapeHtml(entry.id)}</td>
                    <td class="py-3 px-3 font-mono text-white font-medium">${escapeHtml(entry.serial)}</td>
                    <td class="py-3 px-3 text-stone-200">${escapeHtml(entry.name)}</td>
                    <td class="py-3 px-3">${statusBadgeHTML(entry.status, entry.verdictBadge)}</td>
                    <td class="py-3 px-3 font-mono text-orange-400">RISK ${entry.riskScore ?? 10}</td>
                    <td class="py-3 px-3 text-stone-400">${escapeHtml(entry.location)}</td>
                    <td class="py-3 px-3 text-right">
                      <button type="button" data-quick-serial="${escapeHtml(entry.serial)}" class="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono">
                        Inspect
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 2: VERIFY STUDIO ("/verify")
  // ============================================================================
  function renderVerifyView() {
    const p = state.activeProduct;
    const isCounterfeit = p.status === "COUNTERFEIT";
    const isSuspicious = p.status === "SUSPICIOUS";
    const flags = p.flags || ["cryptographic_bind_valid"];

    return `
      <div class="view-animate space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-orange-500 uppercase tracking-widest">
              <i data-lucide="scan-line" class="w-4 h-4"></i>
              <span>AEGIS SCAN ENGINE • UNIT IDENTITY & EXCISE VERIFICATION</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Check a Bottle & Inspect Cryptographic Binding</h1>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="toggle-uv-btn"
              class="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border transition-all flex items-center gap-2 ${
                state.uvMode
                  ? "bg-purple-500/25 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20"
                  : "bg-[#120f0d] border-stone-700 text-stone-300 hover:bg-stone-800"
              }"
            >
              <i data-lucide="flashlight" class="w-4 h-4"></i>
              <span>365nm UV Taggant: ${state.uvMode ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              id="toggle-camera-btn"
              class="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border transition-all flex items-center gap-2 ${
                state.cameraActive
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30"
              }"
            >
              <i data-lucide="${state.cameraActive ? "video-off" : "camera"}" class="w-4 h-4"></i>
              <span>${state.cameraActive ? "Stop Camera" : "Start Optical Camera"}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Left Column: Optical Viewport & Unit Selector -->
          <div class="lg:col-span-5 space-y-5">
            <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-4 ${state.uvMode ? "uv-glow-active" : ""}">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-stone-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${state.uvMode ? "bg-purple-400" : "bg-orange-500"} animate-pulse"></span>
                  ${state.uvMode ? "UV-365nm FLUORESCENCE SPECTROMETER" : "SCAN ENGINE • LIVE"}
                </span>
                <span class="text-orange-400">RISK ${p.riskScore}</span>
              </div>

              <!-- Viewport Container -->
              <div class="relative h-64 rounded-lg bg-[#080706] border border-stone-800 flex flex-col items-center justify-center p-5 overflow-hidden">
                <video id="scanner-video" autoplay playsinline muted class="${state.cameraActive ? "block" : "hidden"} absolute inset-0 w-full h-full object-cover opacity-65"></video>

                <div class="scanner-laser ${state.uvMode ? "uv-mode" : ""}"></div>

                <div class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 ${state.uvMode ? "border-purple-400" : "border-orange-500"}"></div>
                <div class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${state.uvMode ? "border-purple-400" : "border-orange-500"}"></div>
                <div class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${state.uvMode ? "border-purple-400" : "border-orange-500"}"></div>
                <div class="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 ${state.uvMode ? "border-purple-400" : "border-orange-500"}"></div>

                <div class="relative z-10 w-full max-w-xs rounded-lg border ${
                  isCounterfeit
                    ? "border-rose-500/60 bg-rose-950/50"
                    : isSuspicious
                    ? "border-amber-500/60 bg-[#1a140e]/90"
                    : "border-emerald-500/50 bg-[#120f0d]/90"
                } p-4 backdrop-blur-md space-y-2 text-left shadow-2xl">
                  <div class="flex items-center justify-between text-[10px] font-mono text-stone-400 border-b border-stone-800 pb-1.5">
                    <span>AEGIS UNIT IDENTITY</span>
                    <span class="text-orange-400">● SCORING</span>
                  </div>
                  <p class="text-xs font-mono text-stone-200">${escapeHtml(p.serial)}</p>
                  <p class="text-xs text-stone-400 truncate">${escapeHtml(p.name)}</p>
                  <div class="pt-1 flex items-center justify-between">
                    ${statusBadgeHTML(p.status, p.verdictBadge)}
                    <span class="text-[11px] font-mono text-stone-300">RISK ${p.riskScore}</span>
                  </div>
                </div>
              </div>

              <!-- Manual Serial Lookup -->
              <form id="verify-serial-form" class="space-y-2">
                <label class="block text-xs font-medium text-stone-300">Enter Unit Identity, Excise Stamp, or GTIN</label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="verify-serial-input"
                    value="${escapeHtml(p.serial)}"
                    placeholder="SNT-FA24-57D2-13EE-EC26"
                    class="flex-1 px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm font-mono text-white focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    class="px-4 py-2.5 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    <i data-lucide="zap" class="w-4 h-4"></i>
                    <span>Score</span>
                  </button>
                </div>
              </form>

              <!-- Stamp Photo Pixel & Halftone Forensic Upload -->
              <div class="p-3.5 rounded-lg bg-[#080706] border border-stone-800 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <i data-lucide="image-plus" class="w-3.5 h-3.5"></i>
                    <span>Optical Stamp Photo Forensics</span>
                  </span>
                  <span class="text-[10px] font-mono text-stone-400">CMYK / UV Assay</span>
                </div>
                <p class="text-[11px] text-stone-400 leading-relaxed">
                  Upload or snap a macro photo of a physical KRA excise stamp or QR label to inspect pixel contrast, halftone toner dots, and 365nm taggant density.
                </p>
                <label class="w-full py-2 px-3 rounded-lg bg-[#14110f] hover:bg-stone-800 border border-stone-700 text-xs font-mono text-stone-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <i data-lucide="upload" class="w-3.5 h-3.5 text-orange-400"></i>
                  <span>Analyze Stamp / Bottle Photo</span>
                  <input type="file" id="stamp-photo-input" accept="image/*" class="hidden" />
                </label>
                ${
                  state.photoForensicResult
                    ? `
                  <div class="p-3 rounded-lg bg-[#120f0d] border border-orange-500/40 text-xs space-y-1">
                    <div class="flex items-center justify-between font-mono text-[11px]">
                      <span class="text-orange-300 font-bold">${escapeHtml(state.photoForensicResult.fileName)}</span>
                      <span class="text-emerald-400">${escapeHtml(state.photoForensicResult.verdict)}</span>
                    </div>
                    <p class="text-[11px] text-stone-300 font-mono">
                      Contrast: ${escapeHtml(state.photoForensicResult.contrast)} • Taggant SNR: ${escapeHtml(state.photoForensicResult.snr)} • ${escapeHtml(state.photoForensicResult.resolution)}
                    </p>
                  </div>
                `
                    : ""
                }
              </div>

              <!-- Sample Specimens List -->
              <div class="space-y-2 pt-2 border-t border-stone-800">
                <span class="text-xs font-mono text-stone-400 block">SELECT TEST BOTTLE SPECIMEN:</span>
                <div class="grid grid-cols-1 gap-2">
                  ${window.SENTINEL_DATA.beverageDatabase.map(item => `
                    <button
                      type="button"
                      data-select-serial="${escapeHtml(item.serial)}"
                      class="w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                        item.serial === p.serial
                          ? "bg-stone-800/90 border-orange-500/50 text-white"
                          : "bg-[#080706]/70 border-stone-800 text-stone-300 hover:bg-stone-900"
                      }"
                    >
                      <div class="min-w-0">
                        <p class="text-xs font-semibold truncate">${escapeHtml(item.name)}</p>
                        <p class="text-[11px] font-mono text-stone-400">${escapeHtml(item.serial)}</p>
                      </div>
                      <div class="shrink-0">${statusBadgeHTML(item.status, item.verdictBadge)}</div>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Forensic Dossier & Custody Chain -->
          <div class="lg:col-span-7 space-y-5">
            <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <div class="flex items-center gap-2.5">
                    ${statusBadgeHTML(p.status, p.verdictBadge)}
                    <span class="text-xs font-mono text-stone-400">STAMP: ${escapeHtml(p.stampCode)}</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-bold text-white mt-2">${escapeHtml(p.name)}</h2>
                  <p class="text-xs text-stone-400">${escapeHtml(p.brand)} • ${escapeHtml(p.category)} • ${escapeHtml(p.abv)}</p>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <div class="p-1.5 rounded-lg bg-[#080706] border border-stone-800 hidden sm:block" title="Unit Cryptographic DataMatrix">
                    ${generateQrSvg(p.serial, 68, isCounterfeit ? "#f43f5e" : isSuspicious ? "#f59e0b" : "#10b981", "#080706")}
                  </div>
                  <div class="flex sm:flex-col items-end justify-between gap-1 bg-[#080706] px-4 py-3 rounded-lg border border-stone-800">
                    <span class="text-[10px] font-mono text-stone-400 uppercase">AEGIS RISK SCORE</span>
                    <span class="text-2xl font-extrabold font-mono ${
                      isCounterfeit ? "text-rose-400" : isSuspicious ? "text-amber-400" : "text-emerald-400"
                    }">RISK ${p.riskScore}</span>
                    <span class="text-[11px] font-mono text-stone-400">Confidence: ${p.confidence}%</span>
                  </div>
                </div>
              </div>

              <!-- Telemetry Flags Strip -->
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-mono text-stone-400 uppercase">Scoring Flags:</span>
                ${flags.map(f => `
                  <span class="px-2.5 py-1 rounded bg-[#080706] border border-stone-800 font-mono text-xs text-orange-400">
                    · ${escapeHtml(f)}
                  </span>
                `).join("")}
              </div>

              <!-- Metadata Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 font-mono block text-[10px]">EXCISE TAX & STAMP BINDING</span>
                  <p class="font-semibold text-white mt-0.5">${escapeHtml(p.exciseTaxStatus)}</p>
                </div>
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 font-mono block text-[10px]">ORIGIN BOTTLING LINE</span>
                  <p class="font-semibold text-white mt-0.5">${escapeHtml(p.originFacility)}</p>
                </div>
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 font-mono block text-[10px]">BATCH LOT & PRODUCTION DATE</span>
                  <p class="font-semibold font-mono text-white mt-0.5">${escapeHtml(p.batchNumber)} • Prod: ${escapeHtml(p.productionDate)}</p>
                </div>
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 font-mono block text-[10px]">LAST TELEMETRY PING (${p.scanCount}x SCANS)</span>
                  <p class="font-semibold text-white mt-0.5">${escapeHtml(p.lastScannedLocation)}</p>
                </div>
              </div>

              <!-- 6-Point Spectral & Forensic Telemetry Matrix -->
              <div class="space-y-2.5">
                <h3 class="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <i data-lucide="microscope" class="w-4 h-4"></i>
                  <span>6-Point Cryptographic, Spectral & Closure Telemetry</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="sun" class="w-4 h-4 text-orange-400 shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">365nm UV FLUORESCENCE</span>
                      <span class="text-stone-200 font-medium">${escapeHtml(p.spectralSignature.uvFluorescence)}</span>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="type" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">MICRO-INTAGLIO TYPOGRAPHY</span>
                      <span class="text-stone-200 font-medium">${escapeHtml(p.spectralSignature.microText)}</span>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="lock" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">CLOSURE & RETIREMENT STATE</span>
                      <span class="text-stone-200 font-medium">${escapeHtml(p.spectralSignature.capTorqueSeal)}</span>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="flask-conical" class="w-4 h-4 ${isCounterfeit ? "text-rose-400" : "text-emerald-400"} shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">METHANOL / DENSITY PROFILE</span>
                      <span class="text-stone-200 font-medium">${escapeHtml(p.spectralSignature.methanolPpm)}</span>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="layers" class="w-4 h-4 text-orange-400 shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">DIFFRACTIVE KINEGRAM SHIFT</span>
                      <span class="text-stone-200 font-medium">${escapeHtml(p.spectralSignature.hologramShift)}</span>
                    </div>
                  </div>
                  <div class="p-3 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5">
                    <i data-lucide="binary" class="w-4 h-4 text-orange-400 shrink-0 mt-0.5"></i>
                    <div>
                      <span class="text-[10px] font-mono text-stone-400 block">CRYPTOGRAPHIC LEDGER ANCHOR</span>
                      <span class="text-stone-200 font-mono">${escapeHtml(p.spectralSignature.ledgerHash)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    id="retire-pos-unit-btn"
                    class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
                    <span>POS Retire / Mark Opened</span>
                  </button>
                  <button
                    type="button"
                    id="download-cert-btn"
                    class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <i data-lucide="award" class="w-3.5 h-3.5 text-orange-400"></i>
                    <span>Download Certificate</span>
                  </button>
                  <button
                    type="button"
                    id="push-unit-to-dooh-btn"
                    class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-orange-300 border border-orange-500/35 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <i data-lucide="monitor-play" class="w-3.5 h-3.5"></i>
                    <span>Broadcast to DOOH</span>
                  </button>
                  <button
                    type="button"
                    id="analyze-unit-ai-btn"
                    class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-emerald-300 border border-emerald-500/35 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <i data-lucide="brain-circuit" class="w-3.5 h-3.5"></i>
                    <span>Analyze in AI Cortex</span>
                  </button>
                </div>
                <button
                  type="button"
                  id="flag-current-product-btn"
                  class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <i data-lucide="siren" class="w-3.5 h-3.5"></i>
                  <span>Flag Unit to Aegis Enforcement</span>
                </button>
              </div>
            </div>

            <!-- Supply Chain Custody Timeline -->
            <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-white">Unit Identity & Custody Ledger</h3>
                  <p class="text-xs text-stone-400">Every scan, shipment, and consumer check bound to this bottle</p>
                </div>
                <span class="text-xs font-mono text-orange-400">${p.supplyChain.length} EVENTS</span>
              </div>

              <div class="space-y-3">
                ${p.supplyChain.map((node, idx) => `
                  <div class="flex items-start gap-3.5 p-3.5 rounded-lg border ${
                    node.verified
                      ? "bg-[#080706] border-stone-800"
                      : "bg-rose-950/25 border-rose-500/40"
                  }">
                    <div class="w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      node.verified
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }">
                      ${idx + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p class="text-xs sm:text-sm font-bold text-white">${escapeHtml(node.step)}</p>
                        <span class="text-[11px] font-mono text-stone-400">${escapeHtml(node.timestamp)}</span>
                      </div>
                      <p class="text-xs text-stone-300 mt-0.5">${escapeHtml(node.actor)} — <span class="text-stone-400">${escapeHtml(node.location)}</span></p>
                      <p class="text-[11px] font-mono ${node.verified ? "text-orange-400" : "text-rose-400"} mt-1">
                        Hash: ${escapeHtml(node.hash)}
                      </p>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 3: AEGIS BLUEPRINT ("/blueprint")
  // ============================================================================
  function renderBlueprintView() {
    const layers = window.SENTINEL_DATA.blueprintLayers;
    const activeLayer = layers[state.blueprintActiveLayer] || layers[0];

    const scenarios = {
      authentic: {
        title: "Genuine Factory-Sealed Bottle",
        stampHash: "VALID • ECDSA-P256 Match (0x8f4e...91c2)",
        opticalCheck: "PASS • 365nm Dual-Peak Taggant & Intaglio Verified",
        velocityCheck: "PASS • Single Retail Scan in Designated Zone KE-01",
        finalVerdict: "ALLOW SALE • RISK 3 (GENUINE)",
        color: "emerald",
        specimenSerial: "AEG-2026-8841-KEN"
      },
      cloned: {
        title: "Photocopied / Cloned Excise Stamp Ring",
        stampHash: "WARN • Valid Serial String, Bound to 500ml Water SKU",
        opticalCheck: "FAIL • Halftone CMYK Toner Dots & Zero UV Fluorescence",
        velocityCheck: "FAIL • Scanned 87x Across 5 Sub-Counties in 4 Hours",
        finalVerdict: "BLOCK & DISPATCH RAID • RISK 98",
        color: "rose",
        specimenSerial: "AEG-FAKE-0013-CLN"
      },
      refilled: {
        title: "Post-Retirement Refill (`SNT-FA24-57D2-13EE-EC26`)",
        stampHash: "PASS • Original Bottle Identity Exists",
        opticalCheck: "WARN • Closure Tamper Loop Previously Opened",
        velocityCheck: "FAIL • `already_opened` + `post_retirement_scan` in Nakuru",
        finalVerdict: "QUARANTINE • RISK 74 (ALREADY OPENED)",
        color: "amber",
        specimenSerial: "SNT-FA24-57D2-13EE-EC26"
      }
    };
    const sim = scenarios[state.blueprintTestScenario] || scenarios.authentic;

    return `
      <div class="view-animate space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-orange-500 uppercase tracking-widest">
              <i data-lucide="cpu" class="w-4 h-4"></i>
              <span>PROJECT AEGIS • TECHNICAL INFRASTRUCTURE BLUEPRINT</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">How Aegis Binds Identity to Every Bottle</h1>
          </div>
          <div class="flex flex-wrap items-center gap-2 self-start">
            <a href="#/mint" class="px-3.5 py-2.5 rounded bg-[#14110f] hover:bg-stone-800 border border-stone-700 text-emerald-400 font-mono font-semibold text-xs flex items-center gap-2">
              <i data-lucide="qr-code" class="w-4 h-4"></i>
              <span>Mint Batch &amp; Bind Stamp</span>
            </a>
            <a href="#/verify" class="px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs flex items-center gap-2">
              <i data-lucide="scan-line" class="w-4 h-4"></i>
              <span>Check a bottle now</span>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div class="lg:col-span-5 space-y-3">
            <span class="text-xs font-mono uppercase tracking-wider text-stone-400 block">Select Infrastructure Layer:</span>
            ${layers.map((layer, idx) => `
              <button
                type="button"
                data-blueprint-layer="${idx}"
                class="w-full text-left p-5 rounded-xl border transition-all ${
                  idx === state.blueprintActiveLayer
                    ? "bg-[#14110f] border-orange-500/60 shadow-lg shadow-orange-500/10"
                    : "bg-[#110e0c]/60 border-stone-800 hover:bg-[#14110f]"
                }"
              >
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="text-orange-400 font-bold">${escapeHtml(layer.code)}</span>
                  <span class="text-stone-400">Latency: ${escapeHtml(layer.latency)}</span>
                </div>
                <h3 class="text-base font-bold text-white mt-1.5">${escapeHtml(layer.title)}</h3>
                <p class="text-xs text-stone-400 mt-1 line-clamp-2">${escapeHtml(layer.description)}</p>
              </button>
            `).join("")}
          </div>

          <div class="lg:col-span-7 rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
                <span class="px-3 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono font-semibold">
                  ${escapeHtml(activeLayer.code)}
                </span>
                <div class="flex items-center gap-4 text-xs font-mono">
                  <span class="text-stone-400">STAGE LATENCY: <strong class="text-white">${escapeHtml(activeLayer.latency)}</strong></span>
                  <span class="text-stone-400">ACCURACY: <strong class="text-orange-400">${escapeHtml(activeLayer.accuracy)}</strong></span>
                </div>
              </div>

              <h2 class="text-xl sm:text-2xl font-bold text-white">${escapeHtml(activeLayer.title)}</h2>
              <p class="text-sm text-stone-300 leading-relaxed">${escapeHtml(activeLayer.description)}</p>

              <div class="space-y-2.5 pt-2">
                <h4 class="text-xs font-mono uppercase tracking-wider text-stone-400">Technical Specifications:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${activeLayer.specs.map(spec => `
                    <div class="p-3.5 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-2.5 text-xs text-stone-200">
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-orange-500 shrink-0 mt-0.5"></i>
                      <span>${escapeHtml(spec)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            <div class="p-4 rounded-lg bg-[#080706] border border-stone-800 space-y-2">
              <div class="text-[11px] font-mono text-stone-400">AEGIS REAL-TIME SCORING PIPELINE (&lt; 150ms)</div>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div class="p-2.5 rounded bg-[#120f0d] border border-stone-800 text-center">
                  <span class="text-orange-400 block">1. BIND</span>
                  <span class="text-[11px] text-stone-300">Unit + Stamp</span>
                </div>
                <div class="p-2.5 rounded bg-[#120f0d] border border-stone-800 text-center">
                  <span class="text-orange-400 block">2. SCAN</span>
                  <span class="text-[11px] text-stone-300">Phone / Optical</span>
                </div>
                <div class="p-2.5 rounded bg-[#120f0d] border border-stone-800 text-center">
                  <span class="text-orange-400 block">3. SCORE</span>
                  <span class="text-[11px] text-stone-300">Risk & Velocity</span>
                </div>
                <div class="p-2.5 rounded bg-[#120f0d] border border-stone-800 text-center">
                  <span class="text-orange-400 block">4. INTERCEPT</span>
                  <span class="text-[11px] text-stone-300">Network Graph</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Threat Attack Vector Simulator -->
        <section class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 sm:p-8 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-orange-500">Interactive Scoring Simulator</span>
              <h3 class="text-lg sm:text-xl font-bold text-white">Test How Aegis Scores Real-World Counterfeit Scenarios</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-sim-scenario="authentic" class="px-3.5 py-2 rounded text-xs font-mono font-semibold border transition-all ${
                state.blueprintTestScenario === "authentic" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" : "bg-[#080706] border-stone-800 text-stone-400"
              }">1. Genuine Bottle</button>
              <button type="button" data-sim-scenario="refilled" class="px-3.5 py-2 rounded text-xs font-mono font-semibold border transition-all ${
                state.blueprintTestScenario === "refilled" ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-[#080706] border-stone-800 text-stone-400"
              }">2. Already Opened (RISK 74)</button>
              <button type="button" data-sim-scenario="cloned" class="px-3.5 py-2 rounded text-xs font-mono font-semibold border transition-all ${
                state.blueprintTestScenario === "cloned" ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-[#080706] border-stone-800 text-stone-400"
              }">3. Cloned Stamp Syndicate</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div class="p-4 rounded-lg bg-[#080706] border border-stone-800 space-y-1">
              <span class="text-[10px] font-mono text-stone-400">L1 • CRYPTOGRAPHIC IDENTITY</span>
              <p class="font-semibold text-white">${escapeHtml(sim.stampHash)}</p>
            </div>
            <div class="p-4 rounded-lg bg-[#080706] border border-stone-800 space-y-1">
              <span class="text-[10px] font-mono text-stone-400">L2 • OPTICAL & CLOSURE STATE</span>
              <p class="font-semibold text-white">${escapeHtml(sim.opticalCheck)}</p>
            </div>
            <div class="p-4 rounded-lg bg-[#080706] border border-stone-800 space-y-1">
              <span class="text-[10px] font-mono text-stone-400">L3 • NETWORK & VELOCITY</span>
              <p class="font-semibold text-white">${escapeHtml(sim.velocityCheck)}</p>
            </div>
            <div class="p-4 rounded-lg bg-[#080706] border border-orange-500/40 space-y-2 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-mono text-orange-400">AEGIS ENGINE VERDICT</span>
                <p class="font-bold text-orange-300 mt-0.5">${escapeHtml(sim.finalVerdict)}</p>
              </div>
              <button
                type="button"
                id="load-sim-to-verify-btn"
                data-sim-serial="${escapeHtml(sim.specimenSerial)}"
                class="w-full py-1.5 px-2.5 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <i data-lucide="scan-line" class="w-3.5 h-3.5"></i>
                <span>Inspect Specimen in Live Scanner →</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 4: ILLICIT TRADE MONITOR ("/trade")
  // ============================================================================
  function renderTradeView() {
    const hotspots = window.SENTINEL_DATA.tradeHotspots;
    const activeHotspot = hotspots.find(h => h.id === state.selectedHotspotId) || hotspots[0];

    const filteredCases = state.seizureCases.filter(c => {
      const matchesSeverity = state.tradeFilterSeverity === "ALL" || c.riskSeverity === state.tradeFilterSeverity;
      const q = state.tradeSearchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.caseId.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q) ||
        c.violation.toLowerCase().includes(q);
      return matchesSeverity && matchesQuery;
    });

    return `
      <div class="view-animate space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-orange-500 uppercase tracking-widest">
              <i data-lucide="radar" class="w-4 h-4"></i>
              <span>AEGIS ILLICIT TRADE & SYNDICATE NETWORK INTELLIGENCE</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Regional Counterfeit Hotspots & Enforcement Ledger</h1>
          </div>

          <button
            type="button"
            id="trade-new-incident-btn"
            class="px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 self-start transition-all"
          >
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Log Field Seizure / Alert</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div class="lg:col-span-7 rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-4">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-stone-200 font-semibold">KENYA CORRIDOR SYNDICATE RADAR</span>
              <span class="text-orange-400">CLICK NODE TO INSPECT</span>
            </div>

            <div class="relative h-80 rounded-lg bg-[#080706] border border-stone-800 overflow-hidden">
              <svg viewBox="0 0 100 100" class="w-full h-full opacity-35">
                <circle cx="50" cy="55" r="18" fill="none" stroke="#f97316" stroke-width="0.3" stroke-dasharray="1.5 1.5" />
                <circle cx="50" cy="55" r="32" fill="none" stroke="#f59e0b" stroke-width="0.3" stroke-dasharray="1.5 1.5" />
                <circle cx="50" cy="55" r="45" fill="none" stroke="#292524" stroke-width="0.4" />
                <line x1="0" y1="55" x2="100" y2="55" stroke="#1c1917" stroke-width="0.4" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1c1917" stroke-width="0.4" />
                <path d="M 22 46 Q 33 41, 43 53 T 54 62 T 78 84" fill="none" stroke="#f97316" stroke-width="0.6" stroke-dasharray="2 1" />
              </svg>

              ${hotspots.map(h => {
                const isSelected = h.id === activeHotspot.id;
                const dotColor =
                  h.riskLevel === "CRITICAL"
                    ? "bg-rose-500 text-rose-200"
                    : h.riskLevel === "HIGH"
                    ? "bg-orange-500 text-orange-200"
                    : "bg-amber-500 text-amber-200";
                return `
                  <button
                    type="button"
                    data-hotspot-id="${h.id}"
                    style="left: ${h.coordinates.x}%; top: ${h.coordinates.y}%;"
                    class="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  >
                    <span class="relative flex items-center justify-center w-4 h-4 rounded-full ${dotColor} hotspot-pulse ${
                      isSelected ? "ring-4 ring-white scale-125" : ""
                    } transition-transform"></span>
                    <span class="mt-1 px-2 py-0.5 rounded bg-[#120f0d]/95 border border-stone-700 text-[10px] font-mono text-white whitespace-nowrap block shadow-lg">
                      ${escapeHtml(h.county)} (${h.incidentCount})
                    </span>
                  </button>
                `;
              }).join("")}

              <div class="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono bg-[#120f0d]/90 border border-stone-800 px-3 py-2 rounded">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center gap-1 text-rose-400"><span class="w-2 h-2 rounded-full bg-rose-500"></span>Critical</span>
                  <span class="inline-flex items-center gap-1 text-orange-400"><span class="w-2 h-2 rounded-full bg-orange-500"></span>High</span>
                  <span class="inline-flex items-center gap-1 text-amber-400"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Medium</span>
                </div>
                <span class="text-stone-400">Corridor: Busia → Eldoret → Nakuru → Nairobi → Mombasa</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5 rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 flex flex-col justify-between space-y-5">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-stone-800 pb-3">
                <span class="text-xs font-mono text-stone-400">HOTSPOT DOSSIER • ${escapeHtml(activeHotspot.id)}</span>
                <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  activeHotspot.riskLevel === "CRITICAL"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                }">${escapeHtml(activeHotspot.riskLevel)} RISK</span>
              </div>

              <div>
                <h2 class="text-xl font-bold text-white">${escapeHtml(activeHotspot.region)}</h2>
                <p class="text-xs text-stone-400 font-mono mt-0.5">${escapeHtml(activeHotspot.county)} • Updated ${escapeHtml(activeHotspot.updatedAt)}</p>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                <div class="p-3.5 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 block text-[10px]">ACTIVE INCIDENTS</span>
                  <strong class="text-xl text-orange-500">${activeHotspot.incidentCount}</strong>
                </div>
                <div class="p-3.5 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-stone-400 block text-[10px]">FLAGGED STAMPS</span>
                  <strong class="text-xl text-amber-400">${activeHotspot.clonedStampsDetected}</strong>
                </div>
              </div>

              <div class="space-y-2 text-xs">
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-[10px] font-mono text-stone-400 block">PRIMARY NETWORK PATTERN</span>
                  <p class="text-stone-200 font-medium mt-0.5">${escapeHtml(activeHotspot.primaryThreat)}</p>
                </div>
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-[10px] font-mono text-stone-400 block">AFFECTED BRANDS / SKUS</span>
                  <p class="text-stone-200 font-medium mt-0.5">${escapeHtml(activeHotspot.suspectBrand)}</p>
                </div>
                <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                  <span class="text-[10px] font-mono text-stone-400 block">ENFORCEMENT STATUS</span>
                  <p class="text-orange-400 font-semibold mt-0.5">${escapeHtml(activeHotspot.enforcementStatus)}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="dispatch-taskforce-btn"
                class="w-full py-3 px-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all"
              >
                <i data-lucide="radio" class="w-4 h-4"></i>
                <span>Dispatch Field Unit</span>
              </button>
              <button
                type="button"
                id="sync-hotspot-dooh-btn"
                data-hotspot-county="${escapeHtml(activeHotspot.county)}"
                class="w-full py-3 px-3 rounded-lg bg-[#14110f] hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all"
              >
                <i data-lucide="monitor-play" class="w-4 h-4 text-orange-400"></i>
                <span>Sync ${escapeHtml(activeHotspot.county.split(" ")[0])} DOOH →</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Seizure Ledger -->
        <section class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-bold text-white">Active Field Seizures & Syndicate Alerts</h3>
              <p class="text-xs text-stone-400">Filter by severity or search by county, unit serial, or case ID</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <input
                type="text"
                id="trade-search-input"
                value="${escapeHtml(state.tradeSearchQuery)}"
                placeholder="Search cases, Nakuru, SNT-FA24..."
                class="px-3 py-1.5 rounded-lg bg-[#080706] border border-stone-800 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
              <select
                id="trade-severity-select"
                class="px-3 py-1.5 rounded-lg bg-[#080706] border border-stone-800 text-xs font-mono text-stone-200 focus:border-orange-500 focus:outline-none"
              >
                <option value="ALL" ${state.tradeFilterSeverity === "ALL" ? "selected" : ""}>All Severities</option>
                <option value="CRITICAL" ${state.tradeFilterSeverity === "CRITICAL" ? "selected" : ""}>Critical Only</option>
                <option value="HIGH" ${state.tradeFilterSeverity === "HIGH" ? "selected" : ""}>High Only</option>
                <option value="MEDIUM" ${state.tradeFilterSeverity === "MEDIUM" ? "selected" : ""}>Medium Only</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-stone-800 text-stone-400 font-mono">
                  <th class="py-2.5 px-3">CASE ID</th>
                  <th class="py-2.5 px-3">TIMESTAMP</th>
                  <th class="py-2.5 px-3">LOCATION</th>
                  <th class="py-2.5 px-3">PRODUCT / UNIT</th>
                  <th class="py-2.5 px-3">SCORING VIOLATION</th>
                  <th class="py-2.5 px-3">SEVERITY</th>
                  <th class="py-2.5 px-3">STATUS</th>
                  <th class="py-2.5 px-3 text-right">REVENUE PROTECTED</th>
                  <th class="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60">
                ${filteredCases.map(c => `
                  <tr class="hover:bg-stone-800/30 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-white">${escapeHtml(c.caseId)}</td>
                    <td class="py-3 px-3 font-mono text-stone-400">${escapeHtml(c.timestamp)}</td>
                    <td class="py-3 px-3 text-stone-200">${escapeHtml(c.location)}</td>
                    <td class="py-3 px-3 text-white font-medium">${escapeHtml(c.product)}</td>
                    <td class="py-3 px-3 font-mono text-stone-300">${escapeHtml(c.violation)}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded font-mono text-[11px] ${
                        c.riskSeverity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : c.riskSeverity === "HIGH"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }">${escapeHtml(c.riskSeverity)}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-orange-400">${escapeHtml(c.status)}</td>
                    <td class="py-3 px-3 font-mono text-right text-white font-semibold">${escapeHtml(c.estimatedTaxProtected)}</td>
                    <td class="py-3 px-3 text-right">
                      <button
                        type="button"
                        data-case-ai-brief="${escapeHtml(c.caseId)}: ${escapeHtml(c.product)} in ${escapeHtml(c.location)} (${escapeHtml(c.violation)})"
                        class="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-orange-300 font-mono text-[11px]"
                      >
                        AI Brief →
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 5: AI REPORTS & ANALYTICS MODULE ("/reports")
  // ============================================================================
  function buildAiReportPayload(presetId, customPromptText) {
    const ai = window.SENTINEL_DATA.aiAnalytics;
    const totalScans = state.scanHistory.length;
    const totalCases = state.seizureCases.length;
    const suspiciousOrFakeCount = state.scanHistory.filter(s => s.status !== "AUTHENTIC").length;

    const presets = {
      "exec-brief": {
        id: "exec-brief",
        badge: "EXECUTIVE BRIEFING • Q4 2026",
        title: "Kenya Beverage Excise Leakage & Aegis Recovery Assessment",
        confidence: "99.4%",
        riskProjection: "Sh 562M Annualized Recovery Trajectory",
        summary:
          "Aegis Cortex neural graph analysis across 14.2M scan vectors confirms that binding cryptographic unit identities directly to KRA excise stamps has increased monthly recovered excise revenue from Sh 42M (May) to Sh 164M (Oct) — a +290.5% surge while compressing the regional Illicit Trade Index from 64 down to 34.",
        keyFindings: [
          "Photocopied 500ml water excise stamps applied onto 750ml spirits account for 48% of counterfeit detections in Nairobi Eastlands (Kariobangi South cluster).",
          "Post-retirement bottle refills (`already_opened` + `post_retirement_scan` flags) represent the fastest-growing hospitality risk vector in Nakuru (+18% scan velocity).",
          `Active Operator Session has logged ${totalScans} unit scans (${suspiciousOrFakeCount} flagged anomalous) and ${totalCases} active enforcement warrants.`
        ],
        recommendations: [
          "Deploy KRA & KEBS mobile UV-365nm verification checkpoints along the Nairobi–Nakuru highway and Busia border corridor during peak weekend transit.",
          "Mandate automatic point-of-sale (POS) cryptographic retirement for all premium spirits sold in hospitality venues to immediately trigger `already_opened` alerts on refill attempts.",
          "Activate VANBRANSA Digital Out-Of-Home (DOOH) dynamic QR verification billboards across 18 high-risk sub-counties."
        ]
      },
      "nakuru-cluster": {
        id: "nakuru-cluster",
        badge: "FORENSIC CLUSTER ANALYSIS • NAKURU",
        title: "Post-Retirement Refill & Tamper Bridge Diagnostic (SNT-FA24-57D2-13EE-EC26)",
        confidence: "98.8%",
        riskProjection: "RISK 74 • HIGH HOSPITALITY EXPOSURE",
        summary:
          "Deep telemetry inspection of unit SNT-FA24-57D2-13EE-EC26 (Aegis Reserve Whisky 750ml) reveals a classic hospitality refill syndicate pattern: the bottle passed factory cryptographic binding in Ruaraka and cleared retail retirement on 2026-10-19, but was scanned again 72 hours later in Nakuru CBD with a severed closure tamper bridge.",
        keyFindings: [
          "Cryptographic signature matches genuine Batch B26-AEG-09, ruling out a factory print clone and confirming physical collection of empty genuine bottles.",
          "Time-delta between retail POS retirement and secondary nightclub scan is 68.4 hours — consistent with illicit back-room refilling using unassayed neutral spirit.",
          "19 sibling serials from Pallet Lot #402 have triggered identical `post_retirement_scan` anomalies within a 2.4km radius in Nakuru Town East."
        ],
        recommendations: [
          "Issue immediate quarantine directive for Batch B26-AEG-09 open stock across Nakuru entertainment outlets and conduct portable GC-MS methanol screening.",
          "Incentivize consumers via instant airtime micro-rewards when scanning bottle necks at nightclub tables to crowdsource refill detection.",
          "Enforce physical bottle-crushing compliance for high-volume hospitality license renewals."
        ]
      },
      "syndicate-forecast": {
        id: "syndicate-forecast",
        badge: "PREDICTIVE NEURAL FORECAST • 30-DAY HORIZON",
        title: "Illicit Beverage Trafficking Corridor & Syndicate Velocity Forecast",
        confidence: "97.9%",
        riskProjection: "+Sh 78M Projected 30-Day Tax Protection",
        summary:
          "Spatiotemporal graph modeling forecasts a pre-holiday surge in counterfeit spirit bottling and cross-border ethanol smuggling over the next 30 days. Syndicate nodes are shifting away from central Nairobi warehouses toward peri-urban corridors in Ruiru, Mlolongo, and Eldoret.",
        keyFindings: [
          "Corridor 1 (Busia–Eldoret–Nakuru Highway): 78% probability of unstamped bulk ethanol drums disguised as industrial sanitizer cargo.",
          "Corridor 2 (Nairobi Eastlands–Thika Road): High-velocity movement of cloned KRA paper stamps printed on commercial offset presses lacking 365nm rare-earth taggant.",
          "Corridor 3 (Mombasa Changamwe Inland Depots): Elevated risk of export-designated spirit containers being diverted into domestic coastal retail."
        ],
        recommendations: [
          "Pre-position 4 Aegis Mobile Optical Inspection Units at Busia One-Stop Border Post and Gilgil weighbridge.",
          "Enable automated geofence lockouts on Batch B26 export serials so any scan inside domestic retail immediately pages KRA Customs.",
          "Cross-link Aegis seizure hashes with county liquor licensing boards for automatic license suspension."
        ]
      },
      "dooh-campaign": {
        id: "dooh-campaign",
        badge: "VANBRANSA DOOH × AEGIS TELEMETRY",
        title: "Digital Out-Of-Home (DOOH) Consumer Verification & Anti-Counterfeit Campaign",
        confidence: "99.1%",
        riskProjection: "3.4x Projected Consumer Scan Uplift",
        summary:
          "Integrating VANBRANSA's nationwide Digital Out-Of-Home (DOOH) LED billboard network with real-time Aegis scan telemetry transforms public awareness into an active defense shield. Billboards dynamically adjust public safety messaging based on live sub-county counterfeit risk scores.",
        keyFindings: [
          "Deploying high-contrast 'SCAN BEFORE YOU SIP' creative on VANBRANSA roadside screens within 500m of entertainment zones increases consumer phone verification by +240% between 18:00 and 23:00 EAT.",
          "Real-time county risk feeds allow automatic creative switching when a cloned batch (e.g. AEG-FAKE-0013-CLN) is detected in a neighborhood.",
          "Direct QR handoff from VANBRANSA smart screens launches the zero-install Aegis Web Scanner in under 1.2 seconds."
        ],
        recommendations: [
          "Activate dynamic Aegis Risk Ticker overlays on 42 prime VANBRANSA digital billboards across Nairobi, Nakuru, Mombasa, and Kisumu.",
          "Run evening public health alerts highlighting the difference between genuine KRA excise stamps and `ALREADY OPENED` / `CLONED STAMP` warnings.",
          "Provide co-branded authenticity badges on DOOH screens for verified compliant retailers."
        ]
      }
    };

    if (customPromptText && customPromptText.trim()) {
      const q = customPromptText.trim();
      return {
        id: "custom",
        badge: "AEGIS CORTEX • CUSTOM AI FORENSIC QUERY",
        title: `AI Intelligence Synthesis: "${q}"`,
        confidence: "98.6%",
        riskProjection: "Real-Time Telemetry Grounded",
        summary: `Aegis Cortex evaluated your query ("${q}") against ${ai.lastTrained}, correlating ${state.scanHistory.length} live local unit scans, ${state.seizureCases.length} enforcement seizure cases, and 5 county risk matrices. The dominant threat remains cloned water excise stamps applied to counterfeit spirits (Risk 98) alongside post-retirement bottle refills in hospitality zones (Risk 74).`,
        keyFindings: [
          `Active specimen telemetry shows ${state.activeProduct.name} (${state.activeProduct.serial}) currently carries a Risk Score of ${state.activeProduct.riskScore}/100 with verdict "${state.activeProduct.verdictBadge}".`,
          "Nairobi County (Risk 88) and Nakuru County (Risk 76) account for 53% of total national illicit beverage volume share.",
          "Deploying cryptographic stamp-to-unit binding reduces counterfeit dwell time in retail channels from 21 days to under 4.2 hours."
        ],
        recommendations: [
          "Execute targeted physical inspections on outlets exhibiting >3 post-retirement or multi-location velocity anomalies within 24 hours.",
          "Expand VANBRANSA DOOH consumer scan prompts in high-density retail corridors to crowdsource last-mile verification.",
          "Export this forensic dossier to KRA, KEBS, and NACADA taskforce leads for coordinated action."
        ]
      };
    }

    return presets[presetId] || presets["exec-brief"];
  }

  function renderReportsView() {
    const ai = window.SENTINEL_DATA.aiAnalytics;
    const report = state.aiReportOutput || buildAiReportPayload(state.activeAiPresetId, "");
    const maxRecovered = Math.max(...ai.monthlyRevenueRecovered.map(m => m.recoveredM), 180);

    const totalScans = state.scanHistory.length;
    const authenticScans = state.scanHistory.filter(s => s.status === "AUTHENTIC").length;
    const suspiciousScans = state.scanHistory.filter(s => s.status === "SUSPICIOUS").length;
    const counterfeitScans = state.scanHistory.filter(s => s.status === "COUNTERFEIT").length;

    return `
      <div class="view-animate space-y-8">
        <!-- Top Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-orange-500 uppercase tracking-widest">
              <i data-lucide="brain-circuit" class="w-4 h-4"></i>
              <span>${escapeHtml(ai.modelVersion)} • ${escapeHtml(ai.lastTrained)}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">AI Forensic Reports &amp; Excise Analytics</h1>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start">
            <button
              type="button"
              id="export-csv-report-btn"
              class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs flex items-center gap-2 transition-all"
            >
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-orange-400"></i>
              <span>Export CSV Telemetry</span>
            </button>
            <button
              type="button"
              id="export-json-report-btn"
              class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs flex items-center gap-2 transition-all"
            >
              <i data-lucide="braces" class="w-4 h-4 text-orange-400"></i>
              <span>Download AI JSON</span>
            </button>
            <button
              type="button"
              id="print-dossier-btn"
              class="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print Executive Dossier</span>
            </button>
          </div>
        </div>

        <!-- Executive AI KPI Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-1.5">
            <div class="flex items-center justify-between text-xs font-mono text-stone-400">
              <span>EXCISE RECOVERED (OCT)</span>
              <i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i>
            </div>
            <p class="text-2xl sm:text-3xl font-black text-white">Sh 164M</p>
            <p class="text-[11px] font-mono text-emerald-400">+28.1% MoM • Aegis Stamp Binding</p>
          </div>

          <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-1.5">
            <div class="flex items-center justify-between text-xs font-mono text-stone-400">
              <span>AI ANOMALY PRECISION</span>
              <i data-lucide="cpu" class="w-4 h-4 text-orange-400"></i>
            </div>
            <p class="text-2xl sm:text-3xl font-black text-orange-400">99.94%</p>
            <p class="text-[11px] font-mono text-stone-400">Sub-120ms Neural Scoring Latency</p>
          </div>

          <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-1.5">
            <div class="flex items-center justify-between text-xs font-mono text-stone-400">
              <span>SESSION SCANS SCORED</span>
              <i data-lucide="scan-line" class="w-4 h-4 text-amber-400"></i>
            </div>
            <p class="text-2xl sm:text-3xl font-black text-white">${totalScans}</p>
            <p class="text-[11px] font-mono text-stone-400">
              <span class="text-emerald-400">${authenticScans} Genuine</span> •
              <span class="text-amber-400">${suspiciousScans} Suspicious</span> •
              <span class="text-rose-400">${counterfeitScans} Fake</span>
            </p>
          </div>

          <div class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-5 space-y-1.5">
            <div class="flex items-center justify-between text-xs font-mono text-stone-400">
              <span>DOOH BILLBOARD REACH</span>
              <i data-lucide="monitor-play" class="w-4 h-4 text-orange-400"></i>
            </div>
            <p class="text-2xl sm:text-3xl font-black text-white">4.8M / wk</p>
            <p class="text-[11px] font-mono text-orange-400">VANBRANSA Smart Screen Network</p>
          </div>
        </div>

        <!-- Aegis Cortex AI Copilot & Generated Dossier -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Left: AI Copilot Prompt Controls -->
          <div class="lg:col-span-5 rounded-xl border border-orange-500/35 bg-[#110e0c]/95 p-6 space-y-5 flex flex-col justify-between shadow-xl shadow-orange-950/10">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                  AEGIS CORTEX AI ANALYST
                </span>
                <span class="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>

              <div>
                <h2 class="text-lg font-bold text-white">Generate AI Intelligence Dossier</h2>
                <p class="text-xs text-stone-400 mt-1">
                  Select a forensic analysis preset or ask Aegis Cortex to synthesize excise revenue, syndicate patterns, or DOOH campaign impact.
                </p>
              </div>

              <!-- Preset AI Analysis Buttons -->
              <div class="space-y-2">
                <span class="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">1-Click AI Analysis Templates:</span>
                ${ai.presetPrompts.map(p => `
                  <button
                    type="button"
                    data-ai-preset="${escapeHtml(p.id)}"
                    class="w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      state.activeAiPresetId === p.id && (!state.aiReportOutput || state.aiReportOutput.id !== "custom")
                        ? "bg-orange-500/15 border-orange-500/60 text-white shadow-md shadow-orange-500/10"
                        : "bg-[#080706] border-stone-800 text-stone-300 hover:border-stone-700"
                    }"
                  >
                    <div class="space-y-0.5">
                      <p class="text-xs font-bold text-white flex items-center gap-2">
                        <i data-lucide="zap" class="w-3.5 h-3.5 text-orange-400 shrink-0"></i>
                        <span>${escapeHtml(p.label)}</span>
                      </p>
                      <p class="text-[11px] text-stone-400 line-clamp-2 pl-5">${escapeHtml(p.prompt)}</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-4 h-4 text-stone-500 shrink-0 mt-1"></i>
                  </button>
                `).join("")}
              </div>
            </div>

            <!-- Custom Natural Language AI Prompt Form -->
            <form id="ai-custom-prompt-form" class="space-y-3 pt-4 border-t border-stone-800">
              <label for="ai-custom-input" class="block text-xs font-mono uppercase tracking-wider text-stone-300">
                Ask Custom Forensic Question
              </label>
              <div class="flex gap-2">
                <input
                  id="ai-custom-input"
                  type="text"
                  value="${escapeHtml(state.aiCustomPrompt)}"
                  placeholder="e.g. Compare Kariobangi cloned stamps vs Nakuru refills..."
                  class="flex-1 px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="submit"
                  class="px-4 py-2.5 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all"
                >
                  <i data-lucide="wand-2" class="w-4 h-4"></i>
                  <span>Analyze</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Right: Live Synthesized AI Forensic Report Output -->
          <div class="lg:col-span-7 rounded-xl border border-stone-800 bg-[#110e0c]/95 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div class="space-y-5">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
                <span class="px-3 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold">
                  ${escapeHtml(report.badge)}
                </span>
                <div class="flex items-center gap-4 text-xs font-mono">
                  <span class="text-stone-400">CONFIDENCE: <strong class="text-emerald-400">${escapeHtml(report.confidence)}</strong></span>
                  <span class="text-stone-400">IMPACT: <strong class="text-orange-400">${escapeHtml(report.riskProjection)}</strong></span>
                </div>
              </div>

              <div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-white leading-snug">${escapeHtml(report.title)}</h2>
                <p class="text-sm text-stone-300 leading-relaxed mt-2.5 bg-[#080706] p-4 rounded-xl border border-stone-800/90">
                  ${escapeHtml(report.summary)}
                </p>
              </div>

              <!-- Key Telemetry Findings -->
              <div class="space-y-2.5">
                <h3 class="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <i data-lucide="microscope" class="w-4 h-4"></i>
                  <span>Key Neural &amp; Field Telemetry Findings</span>
                </h3>
                <div class="space-y-2">
                  ${report.keyFindings.map(item => `
                    <div class="p-3.5 rounded-lg bg-[#080706] border border-stone-800 flex items-start gap-3 text-xs text-stone-200 leading-relaxed">
                      <span class="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5"></span>
                      <span>${escapeHtml(item)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- Recommended Enforcement Actions -->
              <div class="space-y-2.5">
                <h3 class="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                  <span>Recommended Enforcement &amp; DOOH Actions</span>
                </h3>
                <div class="grid grid-cols-1 gap-2">
                  ${report.recommendations.map((rec, i) => `
                    <div class="p-3.5 rounded-lg bg-emerald-950/15 border border-emerald-500/30 flex items-start gap-3 text-xs text-stone-200">
                      <span class="font-mono font-bold text-emerald-400">0${i + 1}.</span>
                      <span>${escapeHtml(rec)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 font-mono">
              <span>GENERATED BY AEGIS CORTEX • VANBRANSA DOOH TELEMETRY</span>
              <a href="#/verify" class="text-orange-400 hover:underline flex items-center gap-1">
                <span>Open Live Scan Engine</span>
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Visual Charts: Monthly Excise Revenue Recovered & County Risk Matrix -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Monthly Excise Revenue Recovered Chart -->
          <div class="lg:col-span-6 rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-orange-500">Revenue Protection Trajectory</span>
                <h3 class="text-base sm:text-lg font-bold text-white mt-0.5">Monthly Excise Tax Recovered (Sh Millions) vs. Illicit Index</h3>
              </div>
              <span class="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono">+290% Growth</span>
            </div>

            <div class="grid grid-cols-6 gap-3 items-end h-52 pt-6 px-2 border-b border-stone-800">
              ${ai.monthlyRevenueRecovered.map(item => {
                const heightPct = Math.max(16, Math.round((item.recoveredM / maxRecovered) * 100));
                return `
                  <div class="flex flex-col items-center justify-end h-full gap-2 group">
                    <div class="text-[10px] font-mono text-orange-300 font-bold">Sh ${item.recoveredM}M</div>
                    <div class="w-full max-w-[44px] bg-gradient-to-t from-orange-600/80 to-amber-400 rounded-t-lg transition-all group-hover:brightness-110 relative" style="height: ${heightPct}%"></div>
                    <div class="text-[10px] font-mono text-stone-400 pb-2">${escapeHtml(item.month)}</div>
                  </div>
                `;
              }).join("")}
            </div>

            <div class="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
              <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                <span class="text-stone-400 block text-[10px]">6-MONTH CUMULATIVE</span>
                <strong class="text-white text-sm">Sh 562.0M</strong>
              </div>
              <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                <span class="text-stone-400 block text-[10px]">ILLICIT INDEX DROP</span>
                <strong class="text-emerald-400 text-sm">64 → 34 (-46.8%)</strong>
              </div>
              <div class="p-3 rounded-lg bg-[#080706] border border-stone-800">
                <span class="text-stone-400 block text-[10px]">BOTTLER LINES LINKED</span>
                <strong class="text-orange-400 text-sm">28 Lines Live</strong>
              </div>
            </div>
          </div>

          <!-- County Risk & Anomaly Matrix -->
          <div class="lg:col-span-6 rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-orange-500">Regional Risk Matrix</span>
                <h3 class="text-base sm:text-lg font-bold text-white mt-0.5">County Counterfeit Risk &amp; Dominant Anomaly Vector</h3>
              </div>
              <a href="#/trade" class="text-xs font-mono text-orange-400 hover:underline">Hotspot Radar →</a>
            </div>

            <div class="space-y-3">
              ${ai.countyRiskRanking.map(c => `
                <div class="p-3.5 rounded-xl bg-[#080706] border border-stone-800 space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white">${escapeHtml(c.county)}</span>
                      <span class="text-[11px] font-mono text-stone-400">(${escapeHtml(c.illicitVolumeShare)} national share)</span>
                    </div>
                    <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                      c.riskScore >= 80
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : c.riskScore >= 65
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }">RISK ${c.riskScore}</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden">
                    <div class="h-full rounded-full ${
                      c.riskScore >= 80 ? "bg-rose-500" : c.riskScore >= 65 ? "bg-amber-500" : "bg-emerald-500"
                    }" style="width: ${c.riskScore}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span class="truncate pr-2">Vector: <strong class="text-stone-200">${escapeHtml(c.topAnomaly)}</strong></span>
                    <span class="text-orange-400 shrink-0">${escapeHtml(c.trend)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Interactive AI Excise Tax Recovery What-If Policy Simulator -->
        <section class="rounded-xl border border-orange-500/35 bg-[#110e0c]/95 p-6 sm:p-8 space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <i data-lucide="sliders" class="w-4 h-4"></i>
                <span>Interactive Policy &amp; Enforcement Simulator</span>
              </span>
              <h3 class="text-lg sm:text-xl font-bold text-white mt-1">Simulate National Excise Tax Recovery &amp; Counterfeit Interception</h3>
            </div>
            <span class="px-3 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono">
              Real-Time Neural Projection
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            <div class="lg:col-span-7 space-y-5">
              <div>
                <div class="flex justify-between text-xs font-mono mb-1.5">
                  <label for="sim-compliance-slider" class="text-stone-300">1. Retail &amp; Hospitality Scan Compliance Rate</label>
                  <span id="sim-compliance-val" class="text-orange-400 font-bold">${state.simComplianceRate}%</span>
                </div>
                <input
                  id="sim-compliance-slider"
                  type="range"
                  min="10"
                  max="95"
                  value="${state.simComplianceRate}"
                  class="w-full accent-orange-500 cursor-pointer"
                />
                <p class="text-[11px] text-stone-500 mt-1">Percentage of bars, wines &amp; spirits outlets retiring bottles at POS</p>
              </div>

              <div>
                <div class="flex justify-between text-xs font-mono mb-1.5">
                  <label for="sim-dooh-slider" class="text-stone-300">2. VANBRANSA DOOH Smart Screen Alert Coverage</label>
                  <span id="sim-dooh-val" class="text-orange-400 font-bold">${state.simDoohCoverage}%</span>
                </div>
                <input
                  id="sim-dooh-slider"
                  type="range"
                  min="15"
                  max="100"
                  value="${state.simDoohCoverage}"
                  class="w-full accent-orange-500 cursor-pointer"
                />
                <p class="text-[11px] text-stone-500 mt-1">Share of high-risk sub-counties running live DOOH QR verification alerts</p>
              </div>

              <div>
                <div class="flex justify-between text-xs font-mono mb-1.5">
                  <label for="sim-checkpoints-slider" class="text-stone-300">3. Mobile UV-365nm Highway &amp; Border Checkpoints</label>
                  <span id="sim-checkpoints-val" class="text-orange-400 font-bold">${state.simCheckpoints} Units</span>
                </div>
                <input
                  id="sim-checkpoints-slider"
                  type="range"
                  min="2"
                  max="30"
                  value="${state.simCheckpoints}"
                  class="w-full accent-orange-500 cursor-pointer"
                />
                <p class="text-[11px] text-stone-500 mt-1">Active KRA / KEBS mobile optical inspection teams across transit corridors</p>
              </div>
            </div>

            <div class="lg:col-span-5 grid grid-cols-1 gap-3.5">
              ${(() => {
                const projectedBn = (
                  (state.simComplianceRate * 0.42) +
                  (state.simDoohCoverage * 0.14) +
                  (state.simCheckpoints * 0.65)
                ).toFixed(1);
                const dwellHours = Math.max(1.2, (28 - state.simComplianceRate * 0.21 - state.simCheckpoints * 0.35)).toFixed(1);
                const preventedExposures = Math.round(
                  (state.simComplianceRate * 280) + (state.simDoohCoverage * 190) + (state.simCheckpoints * 850)
                ).toLocaleString();
                return `
                  <div class="p-4 rounded-xl bg-[#080706] border border-emerald-500/40 space-y-1">
                    <span class="text-[10px] font-mono uppercase text-emerald-400">PROJECTED ANNUAL EXCISE TAX RECOVERED</span>
                    <p class="text-3xl font-black text-white">Sh ${projectedBn}Bn <span class="text-xs font-mono text-emerald-400 font-normal">/ year</span></p>
                    <p class="text-[11px] text-stone-400">Out of Sh 120Bn estimated annual illicit tax gap</p>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-4 rounded-xl bg-[#080706] border border-stone-800 space-y-1">
                      <span class="text-[10px] font-mono uppercase text-orange-400">FAKE DWELL TIME</span>
                      <p class="text-xl font-black text-white">${dwellHours} hrs</p>
                      <p class="text-[10px] text-stone-400">Before syndicate lock</p>
                    </div>
                    <div class="p-4 rounded-xl bg-[#080706] border border-stone-800 space-y-1">
                      <span class="text-[10px] font-mono uppercase text-amber-400">CONSUMERS PROTECTED</span>
                      <p class="text-xl font-black text-white">${preventedExposures}</p>
                      <p class="text-[10px] text-stone-400">Fakes intercepted/mo</p>
                    </div>
                  </div>
                `;
              })()}
            </div>
          </div>
        </section>

        <!-- End-to-End Platform Audit & Module Interrelation Matrix Table -->
        <section class="rounded-xl border border-stone-800 bg-[#110e0c]/95 p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="clipboard-check" class="w-4 h-4"></i>
                <span>14-POINT END-TO-END QUALITY &amp; ARCHITECTURE AUDIT</span>
              </span>
              <h3 class="text-base sm:text-lg font-bold text-white mt-0.5">Customer Journey, Cross-Module Interrelation &amp; Functional Verification Table</h3>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <a
                href="aegis-vanbransa-pitch-deck.pptx"
                download="AEGIS-VANBRANSA-Pitch-Deck.pptx"
                class="px-3.5 py-2 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
              >
                <i data-lucide="presentation" class="w-3.5 h-3.5"></i>
                <span>Download Pitch Deck (.pptx)</span>
              </a>
              <a
                href="pitch-deck.html"
                target="_blank"
                rel="noopener"
                class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-orange-300 border border-orange-500/40 font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <i data-lucide="monitor-play" class="w-3.5 h-3.5 text-orange-400"></i>
                <span>Open 10-Slide Pitch Deck ↗</span>
              </a>
              <a
                href="aegis-platform-audit.csv"
                download="aegis-vanbransa-platform-audit-results.csv"
                class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-emerald-300 border border-emerald-500/40 font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Download Audit CSV</span>
              </a>
              <a
                href="audit-report.html"
                target="_blank"
                rel="noopener"
                class="px-3.5 py-2 rounded-lg bg-[#14110f] hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <i data-lucide="external-link" class="w-3.5 h-3.5 text-orange-400"></i>
                <span>Open Printable Audit Matrix ↗</span>
              </a>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                  <th class="py-2.5 px-3">ID</th>
                  <th class="py-2.5 px-3">MODULE / ROUTE</th>
                  <th class="py-2.5 px-3">PERSONA</th>
                  <th class="py-2.5 px-3">INTERRELATION &amp; FEATURE AUDITED</th>
                  <th class="py-2.5 px-3">RESOLUTION &amp; VERIFICATION</th>
                  <th class="py-2.5 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60">
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-01</td>
                  <td class="py-2.5 px-3 font-mono text-white">Overview (#/)</td>
                  <td class="py-2.5 px-3 text-stone-300">All Personas</td>
                  <td class="py-2.5 px-3 text-stone-200">Hero Quick-Verify &amp; 6-Module Infrastructure Grid</td>
                  <td class="py-2.5 px-3 text-stone-400">Expanded grid to all 6 modules; Hero lookup &amp; Inspect buttons auto-open #/verify dossier</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-02</td>
                  <td class="py-2.5 px-3 font-mono text-white">Left Sidebar &amp; Shell</td>
                  <td class="py-2.5 px-3 text-stone-300">Consumer / Retailer / Inspector</td>
                  <td class="py-2.5 px-3 text-stone-200">Dynamic Role Switcher &amp; Live Specimen Badges</td>
                  <td class="py-2.5 px-3 text-stone-400">Added live Role Context Banner &amp; dynamic Left Sidebar LOTS / LED / Specimen sync</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-03</td>
                  <td class="py-2.5 px-3 font-mono text-white">Verify (#/verify)</td>
                  <td class="py-2.5 px-3 text-stone-300">Consumer / Inspector</td>
                  <td class="py-2.5 px-3 text-stone-200">Scan Engine ↔ DOOH Billboard &amp; AI Cortex Handoff</td>
                  <td class="py-2.5 px-3 text-stone-400">Added 1-click Broadcast to DOOH &amp; Analyze in AI Cortex buttons on active bottle dossier</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-04</td>
                  <td class="py-2.5 px-3 font-mono text-white">Verify (#/verify)</td>
                  <td class="py-2.5 px-3 text-stone-300">Retailer POS</td>
                  <td class="py-2.5 px-3 text-stone-200">POS Closure Retirement &amp; Stamp Photo Pixel Assay</td>
                  <td class="py-2.5 px-3 text-stone-400">Persisted POS retirement (RISK 74 ALREADY OPENED) to localStorage across reloads</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-05</td>
                  <td class="py-2.5 px-3 font-mono text-white">Blueprint (#/blueprint)</td>
                  <td class="py-2.5 px-3 text-stone-300">Bottler / Inspector</td>
                  <td class="py-2.5 px-3 text-stone-200">4-Layer ECDSA Architecture &amp; Threat Simulator → Scanner</td>
                  <td class="py-2.5 px-3 text-stone-400">Added Inspect Specimen in Live Scanner button to load simulated attack directly in #/verify</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-06</td>
                  <td class="py-2.5 px-3 font-mono text-white">Trade (#/trade)</td>
                  <td class="py-2.5 px-3 text-stone-300">KRA / KEBS Inspector</td>
                  <td class="py-2.5 px-3 text-stone-200">Syndicate Radar ↔ County DOOH &amp; Seizure AI Briefing</td>
                  <td class="py-2.5 px-3 text-stone-400">Added Sync County DOOH on hotspots, AI Brief on seizure rows, and Auto-DOOH on new warrants</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
                <tr class="hover:bg-stone-800/30">
                  <td class="py-2.5 px-3 font-mono font-bold text-orange-400">AUD-07</td>
                  <td class="py-2.5 px-3 font-mono text-white">Mint (#/mint) &amp; DOOH (#/dooh)</td>
                  <td class="py-2.5 px-3 text-stone-300">Bottler / VANBRANSA</td>
                  <td class="py-2.5 px-3 text-stone-200">HSM Batch Minting &amp; Smart 16:9 LED Billboard QR Handoff</td>
                  <td class="py-2.5 px-3 text-stone-400">Persisted minted lots to beverageDatabase &amp; linked billboard QR CTAs to #/verify</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-400">PASSED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 5B: BOTTLER BATCH MINTING & KRA STAMP BINDING ("/mint")
  // ============================================================================
  function renderMintView() {
    const previewUnit = state.lastMintedUnit || state.activeProduct;

    return `
      <div class="view-animate space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <i data-lucide="qr-code" class="w-4 h-4"></i>
              <span>BOTTLING LINE HSM • CRYPTOGRAPHIC UNIT &amp; EXCISE STAMP PROVISIONING</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Mint Beverage Batch &amp; Bind KRA Digital Stamps</h1>
          </div>

          <a href="#/verify" class="px-4 py-2.5 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs flex items-center gap-2 self-start">
            <i data-lucide="scan-line" class="w-4 h-4"></i>
            <span>Verify Minted Units in Scan Engine →</span>
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Left: Minting Form -->
          <div class="lg:col-span-6 rounded-xl border border-stone-800 bg-[#110e0c]/95 p-6 space-y-5">
            <div class="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white">Provision New Cryptographic Production Lot</h2>
                <p class="text-xs text-stone-400">Signs each unit serial with ECDSA-P256 and anchors to KRA Excise Stamp Reel</p>
              </div>
              <span class="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">HSM READY</span>
            </div>

            <form id="mint-batch-form" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Beverage Product &amp; Volume</label>
                  <input type="text" id="mint-product-name" required value="Aegis Single Malt 12Y 750ml" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Licensed Manufacturer / Bottler</label>
                  <input type="text" id="mint-brand" required value="Aegis Distillers Kenya Ltd" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">ABV Strength</label>
                  <input type="text" id="mint-abv" required value="43.0% ABV" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm font-mono text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">KRA Stamp Reel ID</label>
                  <input type="text" id="mint-stamp-reel" required value="KRA-EX-9981204" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm font-mono text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Batch Size (Units)</label>
                  <input type="number" id="mint-unit-count" required min="100" max="250000" value="15000" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm font-mono text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Bottling Facility Line</label>
                  <input type="text" id="mint-facility" required value="Ruaraka High-Speed Line #3, Nairobi" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Intended Geofenced Market Zone</label>
                  <select id="mint-zone" class="w-full px-3.5 py-2 rounded-lg bg-[#080706] border border-stone-800 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none">
                    <option value="Nairobi Metro &amp; Central Retail">Nairobi Metro &amp; Central Retail</option>
                    <option value="Nakuru &amp; Rift Valley Hospitality">Nakuru &amp; Rift Valley Hospitality</option>
                    <option value="Mombasa &amp; Coastal Corridor">Mombasa &amp; Coastal Corridor</option>
                    <option value="Western &amp; Lake Basin Retail">Western &amp; Lake Basin Retail</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-3 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <i data-lucide="cpu" class="w-4 h-4"></i>
                <span>Mint Cryptographic Batch &amp; Generate Unit QR Identity</span>
              </button>
            </form>
          </div>

          <!-- Right: Live Minted Unit Cryptographic Label & QR Sheet Preview -->
          <div class="lg:col-span-6 rounded-xl border border-emerald-500/40 bg-[#110e0c]/95 p-6 flex flex-col justify-between space-y-5">
            <div class="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400">CRYPTOGRAPHIC NECK COLLAR LABEL PREVIEW</span>
                <h3 class="text-base font-bold text-white mt-0.5">${escapeHtml(previewUnit.name)}</h3>
              </div>
              <span class="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                ECDSA-P256 SIGNED
              </span>
            </div>

            <div class="p-5 rounded-xl bg-[#080706] border border-stone-800 flex flex-col sm:flex-row items-center gap-5">
              <div class="p-3 rounded-xl bg-black border border-orange-500/40 shrink-0">
                ${generateQrSvg(previewUnit.serial, 124, "#f97316", "#080706")}
              </div>
              <div class="space-y-2 text-xs flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <img src="assets/vanbransa-logo.png" alt="VANBRANSA" class="h-5 w-auto object-contain bg-black px-1.5 py-0.5 rounded border border-stone-800" />
                  <span class="text-[10px] font-mono text-orange-400">AEGIS × KRA EXCISE</span>
                </div>
                <p class="font-mono text-sm font-bold text-white break-all">${escapeHtml(previewUnit.serial)}</p>
                <p class="font-mono text-[11px] text-stone-400">Stamp: <strong class="text-stone-200">${escapeHtml(previewUnit.stampCode)}</strong></p>
                <p class="font-mono text-[11px] text-stone-400">Batch: <strong class="text-stone-200">${escapeHtml(previewUnit.batchNumber)}</strong> • ${escapeHtml(previewUnit.abv)}</p>
                <p class="font-mono text-[10px] text-emerald-400">Hash: ${escapeHtml(previewUnit.spectralSignature?.ledgerHash || "0x94f1c2...e81b04a2")}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                data-test-minted-serial="${escapeHtml(previewUnit.serial)}"
                class="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <i data-lucide="scan-line" class="w-4 h-4"></i>
                <span>Scan &amp; Verify This Unit Now</span>
              </button>

              <button
                type="button"
                id="print-qr-sheet-btn"
                class="px-4 py-2.5 rounded-lg bg-[#14110f] hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <i data-lucide="printer" class="w-4 h-4 text-orange-400"></i>
                <span>Print Batch QR Label Sheet</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Minted Batches Ledger -->
        <section class="rounded-xl border border-stone-800 bg-[#110e0c]/90 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-white">Active Cryptographic Bottling Batches &amp; Stamp Reels</h3>
              <p class="text-xs text-stone-400">Click any sample unit serial to inspect it in the live Aegis Scan Engine</p>
            </div>
            <span class="text-xs font-mono text-orange-400">${state.mintedBatches.length} BATCHES PROVISIONED</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-stone-800 text-stone-400 font-mono">
                  <th class="py-2.5 px-3">BATCH ID</th>
                  <th class="py-2.5 px-3">SAMPLE SERIAL</th>
                  <th class="py-2.5 px-3">PRODUCT / BOTTLER</th>
                  <th class="py-2.5 px-3">KRA STAMP REEL</th>
                  <th class="py-2.5 px-3">UNITS</th>
                  <th class="py-2.5 px-3">GEOFENCE ZONE</th>
                  <th class="py-2.5 px-3">STATUS</th>
                  <th class="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60">
                ${state.mintedBatches.map(b => `
                  <tr class="hover:bg-stone-800/30 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-white">${escapeHtml(b.batchId)}</td>
                    <td class="py-3 px-3 font-mono text-orange-400">${escapeHtml(b.sampleSerial)}</td>
                    <td class="py-3 px-3">
                      <p class="text-white font-semibold">${escapeHtml(b.productName)}</p>
                      <p class="text-[11px] text-stone-400">${escapeHtml(b.brand)}</p>
                    </td>
                    <td class="py-3 px-3 font-mono text-stone-300">${escapeHtml(b.stampReel)}</td>
                    <td class="py-3 px-3 font-mono text-white">${Number(b.unitCount).toLocaleString()}</td>
                    <td class="py-3 px-3 text-stone-300">${escapeHtml(b.targetZone)}</td>
                    <td class="py-3 px-3 font-mono text-emerald-400 text-[11px]">${escapeHtml(b.status)}</td>
                    <td class="py-3 px-3 text-right">
                      <button
                        type="button"
                        data-test-minted-serial="${escapeHtml(b.sampleSerial)}"
                        class="px-2.5 py-1 rounded bg-orange-500/15 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 font-mono text-[11px]"
                      >
                        Scan Unit →
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 5C: VANBRANSA DOOH SMART BILLBOARD COMMAND CENTER ("/dooh")
  // ============================================================================
  function renderDoohView() {
    const boards = state.doohBillboards;
    const activeBoard = boards.find(b => b.screenId === state.selectedBillboardId) || boards[0];
    const isEmergency = activeBoard.activeMode === "EMERGENCY_ALERT";
    const isWarning = activeBoard.activeMode === "REFILL_WARNING";

    return `
      <div class="view-animate space-y-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-orange-500 uppercase tracking-widest">
              <i data-lucide="monitor-play" class="w-4 h-4"></i>
              <span>VANBRANSA DIGITAL OUT-OF-HOME × AEGIS TELEMETRY ENGINE</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Smart Roadside Billboard Network &amp; Risk Triggers</h1>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start">
            <button
              type="button"
              id="toggle-dooh-autosync-btn"
              class="px-3.5 py-2 rounded-lg border text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                state.doohAutoSync
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-[#14110f] border-stone-700 text-stone-300"
              }"
            >
              <span class="w-2 h-2 rounded-full ${state.doohAutoSync ? "bg-emerald-400 animate-pulse" : "bg-stone-500"}"></span>
              <span>Auto-Trigger on County Risk &gt; 70: ${state.doohAutoSync ? "ENABLED" : "MANUAL"}</span>
            </button>

            <button
              type="button"
              id="broadcast-all-dooh-btn"
              class="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <i data-lucide="radio-tower" class="w-4 h-4"></i>
              <span>Broadcast Emergency Alert to All High-Risk Screens</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Left: Live 16:9 Roadside Digital Billboard Simulator -->
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between text-xs font-mono text-stone-400">
              <span>LIVE ROADSIDE LED CANVAS PREVIEW • ${escapeHtml(activeBoard.screenId)} (${escapeHtml(activeBoard.format)})</span>
              <span class="text-orange-400">Synced ${escapeHtml(activeBoard.lastSynced)}</span>
            </div>

            <!-- Simulated Physical VANBRANSA Digital Billboard Frame -->
            <div class="rounded-2xl p-3 bg-gradient-to-b from-stone-800 via-stone-900 to-black border-2 border-stone-700 shadow-2xl">
              <div class="relative rounded-xl overflow-hidden border ${
                isEmergency
                  ? "border-rose-500/70 bg-gradient-to-br from-[#1f090d] via-[#0b0908] to-[#1a0f08]"
                  : isWarning
                  ? "border-amber-500/70 bg-gradient-to-br from-[#1c1307] via-[#0b0908] to-[#140e09]"
                  : "border-emerald-500/50 bg-gradient-to-br from-[#071912] via-[#0b0908] to-[#120f0d]"
              } p-6 sm:p-8 min-h-[300px] flex flex-col justify-between">
                <!-- Top Billboard Bar -->
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div class="flex items-center gap-3">
                    <img src="assets/vanbransa-logo.png" alt="VANBRANSA" class="h-8 w-auto object-contain bg-black px-2.5 py-1 rounded border border-stone-700" />
                    <div>
                      <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400 block">PUBLIC SAFETY &amp; EXCISE TELEMETRY</span>
                      <span class="text-xs font-bold text-white">${escapeHtml(activeBoard.name)}</span>
                    </div>
                  </div>
                  <div class="px-3 py-1 rounded font-mono text-xs font-bold ${
                    isEmergency
                      ? "bg-rose-500 text-black animate-pulse"
                      : isWarning
                      ? "bg-amber-400 text-black"
                      : "bg-emerald-400 text-black"
                  }">
                    ${escapeHtml(activeBoard.activeMode.replace(/_/g, " "))} • LOCAL RISK ${activeBoard.localRiskScore}
                  </div>
                </div>

                <!-- Center Billboard Message + QR Code -->
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-4">
                  <div class="sm:col-span-8 space-y-2.5">
                    <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-tight">
                      ${escapeHtml(activeBoard.headline)}
                    </h2>
                    <p class="text-xs sm:text-sm text-stone-200 leading-relaxed">
                      ${escapeHtml(activeBoard.subheadline)}
                    </p>
                    <div class="pt-1">
                      <button
                        type="button"
                        data-dooh-scan-serial="${escapeHtml(activeBoard.targetSerial)}"
                        class="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-extrabold text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                      >
                        <i data-lucide="smartphone" class="w-4 h-4"></i>
                        <span>${escapeHtml(activeBoard.ctaText)}</span>
                      </button>
                    </div>
                  </div>

                  <div class="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-black/90 border border-stone-700">
                    ${generateQrSvg(activeBoard.targetSerial, 108, isEmergency ? "#f43f5e" : isWarning ? "#f59e0b" : "#10b981", "#080706")}
                    <span class="text-[10px] font-mono text-stone-300 mt-1.5">SCAN WITH PHONE CAMERA</span>
                    <span class="text-[9px] font-mono text-orange-400">${escapeHtml(activeBoard.targetSerial)}</span>
                  </div>
                </div>

                <!-- Bottom Billboard Frame Strip -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-[10px] font-mono text-stone-400">
                  <span>VANBRANSA DIGITAL OUT-OF-HOME • ${escapeHtml(activeBoard.county.toUpperCase())}</span>
                  <span>IMPRESSIONS: <strong class="text-white">${escapeHtml(activeBoard.dailyImpressions)} / DAY</strong></span>
                  <span>GPS: ${escapeHtml(activeBoard.coordinates)}</span>
                </div>
              </div>
              <!-- Physical Gantry Pillar Bar -->
              <div class="mt-2 flex items-center justify-between px-4 py-1 bg-black rounded text-[10px] font-mono text-stone-400">
                <span>VANBRANSA SMART GANTRY CONTROLLER v4.6</span>
                <span class="text-emerald-400">● 4G LTE / STARLINK TELEMETRY LINKED</span>
              </div>
            </div>

            <!-- Creative Mode Switcher for Selected Billboard -->
            <div class="p-4 rounded-xl bg-[#110e0c] border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <span class="text-xs font-mono text-stone-300">Override Active Screen Creative Mode:</span>
              <div class="flex flex-wrap gap-2">
                <button type="button" data-set-dooh-mode="EMERGENCY_ALERT" class="px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                  activeBoard.activeMode === "EMERGENCY_ALERT" ? "bg-rose-500/20 border-rose-500 text-rose-300" : "bg-[#080706] border-stone-800 text-stone-400"
                }">Emergency Counterfeit Alert</button>
                <button type="button" data-set-dooh-mode="REFILL_WARNING" class="px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                  activeBoard.activeMode === "REFILL_WARNING" ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-[#080706] border-stone-800 text-stone-400"
                }">Hospitality Refill Warning</button>
                <button type="button" data-set-dooh-mode="BRAND_TRUST" class="px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                  activeBoard.activeMode === "BRAND_TRUST" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-[#080706] border-stone-800 text-stone-400"
                }">Standard Brand Trust</button>
              </div>
            </div>
          </div>

          <!-- Right: National Billboard Fleet Inventory -->
          <div class="lg:col-span-5 rounded-xl border border-stone-800 bg-[#110e0c]/95 p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white">VANBRANSA Smart Screen Inventory</h3>
                <p class="text-xs text-stone-400">Select any roadside LED screen to inspect or override creative</p>
              </div>
              <span class="text-xs font-mono text-orange-400">${boards.length} ACTIVE</span>
            </div>

            <div class="space-y-2.5">
              ${boards.map(b => `
                <button
                  type="button"
                  data-select-billboard="${escapeHtml(b.screenId)}"
                  class="w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                    b.screenId === activeBoard.screenId
                      ? "bg-[#1a1410] border-orange-500/70 shadow-lg shadow-orange-500/10"
                      : "bg-[#080706] border-stone-800 hover:border-stone-700"
                  }"
                >
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-orange-400 font-bold">${escapeHtml(b.screenId)} • ${escapeHtml(b.county)}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.activeMode === "EMERGENCY_ALERT"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : b.activeMode === "REFILL_WARNING"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }">${escapeHtml(b.activeMode.replace(/_/g, " "))}</span>
                  </div>
                  <p class="text-sm font-bold text-white">${escapeHtml(b.name)}</p>
                  <div class="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>Reach: <strong class="text-stone-200">${escapeHtml(b.dailyImpressions)}/day</strong></span>
                    <span>Local Risk: <strong class="${b.localRiskScore >= 70 ? "text-rose-400" : "text-emerald-400"}">RISK ${b.localRiskScore}</strong></span>
                  </div>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // VIEW 6: AEGIS CONSOLE AUTHENTICATION ("/login", "/register", "/forgot-password", "/reset-password")
  // ============================================================================
  function renderAuthView(mode) {
    return `
      <div class="view-animate min-h-[70vh] flex items-center justify-center py-8">
        <div class="w-full max-w-md rounded-xl border border-stone-800 bg-[#110e0c]/95 p-8 shadow-2xl space-y-6">
          <div class="flex flex-col items-center text-center space-y-3">
            <div class="px-4 py-2 rounded-xl bg-black border border-orange-500/40 flex items-center justify-center shadow-lg">
              <img src="assets/vanbransa-logo.png" alt="VANBRANSA" class="h-10 w-auto object-contain" />
            </div>
            <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">VANBRANSA × PROJECT AEGIS • CONSOLE</span>
            <h1 class="text-2xl font-bold text-white">
              ${
                mode === "register"
                  ? "Enroll Bottler / Inspector"
                  : mode === "forgot"
                  ? "Reset Console Key"
                  : mode === "reset"
                  ? "Set New Console Password"
                  : "Sign In to Aegis Console"
              }
            </h1>
            <p class="text-xs text-stone-400">
              ${
                mode === "register"
                  ? "Provision cryptographic signing keys for bottling lines or field enforcement"
                  : "Access excise stamp telemetry, risk scoring rules, and syndicate feeds"
              }
            </p>
          </div>

          ${
            mode === "login"
              ? `
            <div class="space-y-3">
              <button type="button" id="google-sso-btn" class="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-stone-200 text-black font-bold text-xs flex items-center justify-center gap-2.5 transition-all">
                <i data-lucide="shield-check" class="w-4 h-4 text-orange-600"></i>
                <span>Continue with Aegis Enforcement SSO</span>
              </button>
              <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-stone-800"></div>
                <span class="flex-shrink mx-3 text-[10px] font-mono uppercase text-stone-500">OR OPERATOR CREDENTIALS</span>
                <div class="flex-grow border-t border-stone-800"></div>
              </div>
            </div>

            <form id="auth-login-form" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Operator Email</label>
                <input type="email" id="login-email" required value="inspector@aegis-infra.org" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Password</label>
                <input type="password" id="login-password" required value="aegis2026" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <button type="submit" class="w-full py-3 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-sm transition-all">
                Launch Aegis Console ↗
              </button>
              <div class="flex items-center justify-between text-xs pt-1">
                <a href="#/forgot-password" class="text-stone-400 hover:text-orange-400">Forgot password?</a>
                <a href="#/register" class="text-orange-400 hover:underline font-medium">Enroll organization →</a>
              </div>
            </form>
          `
              : mode === "register"
              ? `
            <form id="auth-register-form" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Full Name / Organization</label>
                <input type="text" id="reg-name" required placeholder="e.g. Amina Odhiambo — KRA Field Unit" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Work Email</label>
                <input type="email" id="reg-email" required placeholder="you@organization.org" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Password</label>
                  <input type="password" id="reg-password" required minlength="8" placeholder="Min. 8 chars" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-stone-300 mb-1">Role</label>
                  <select id="reg-role" class="w-full px-3 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none">
                    <option value="inspector">Field Inspector</option>
                    <option value="retailer">Distributor / Retailer</option>
                    <option value="consumer">Consumer</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="w-full py-3 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-sm transition-all">
                Provision Console Account
              </button>
              <div class="text-center text-xs">
                <a href="#/login" class="text-stone-400 hover:text-white">← Back to Console Sign In</a>
              </div>
            </form>
          `
              : mode === "reset"
              ? `
            <form id="auth-reset-form" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">New Console Password</label>
                <input type="password" id="reset-new-password" required minlength="8" placeholder="Min. 8 characters" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Confirm New Password</label>
                <input type="password" id="reset-confirm-password" required minlength="8" placeholder="Repeat password" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <button type="submit" class="w-full py-3 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-sm transition-all">
                Update Console Key ↗
              </button>
              <div class="text-center text-xs">
                <a href="#/login" class="text-stone-400 hover:text-white">← Back to Sign In</a>
              </div>
            </form>
          `
              : `
            <form id="auth-forgot-form" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-stone-300 mb-1">Account Email</label>
                <input type="email" id="forgot-email" required placeholder="you@organization.org" class="w-full px-3.5 py-2.5 rounded-lg bg-[#080706] border border-stone-800 text-sm text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <button type="submit" class="w-full py-3 rounded-lg bg-[#f97316] hover:bg-[#fb923c] text-black font-bold text-sm transition-all">
                Send Recovery Token
              </button>
              <div class="text-center text-xs">
                <a href="#/login" class="text-stone-400 hover:text-white">← Back to Sign In</a>
              </div>
            </form>
          `
          }
        </div>
      </div>
    `;
  }

  // ============================================================================
  // SCANNING & EVENT HANDLERS
  // ============================================================================
  function executeSerialLookup(rawInput) {
    const query = String(rawInput || "").trim();
    if (!query) {
      showToast("Unit Identity Required", "Enter a bottle serial code or select a live specimen.", "amber");
      return;
    }

    const db = window.SENTINEL_DATA.beverageDatabase;
    let found = db.find(
      item =>
        item.serial.toLowerCase() === query.toLowerCase() ||
        item.stampCode.toLowerCase() === query.toLowerCase() ||
        item.gtin.toLowerCase() === query.toLowerCase()
    );

    if (!found) {
      const isFakeKeyword = /fake|cln|bad|000|999/i.test(query);
      found = {
        serial: query.toUpperCase(),
        stampCode: isFakeKeyword ? "UNREGISTERED-STAMP" : "KRA-EX-" + Math.floor(1000000 + Math.random() * 8999999),
        gtin: "06161100" + Math.floor(100000 + Math.random() * 899999),
        name: isFakeKeyword ? `Unverified Spirit Specimen (${query.toUpperCase()})` : `Aegis Verified Bottle (${query.toUpperCase()})`,
        brand: isFakeKeyword ? "Unknown / Unregistered Bottler" : "Aegis Certified Bottling Partner",
        category: "Beverage Unit • Cryptographic Identity",
        abv: isFakeKeyword ? "Unknown ABV" : "40.0% ABV",
        status: isFakeKeyword ? "COUNTERFEIT" : "AUTHENTIC",
        verdictBadge: isFakeKeyword ? "CLONED STAMP FAKE" : "VERIFIED GENUINE",
        riskScore: isFakeKeyword ? 95 : 4,
        confidence: isFakeKeyword ? 99.4 : 99.2,
        flags: isFakeKeyword ? ["unregistered_serial", "missing_uv_taggant"] : ["cryptographic_bind_valid", "excise_paid"],
        batchNumber: isFakeKeyword ? "UNREGISTERED" : "B26-AEG-77",
        productionDate: "2026-10-01",
        expiryDate: "2028-10-01",
        originFacility: isFakeKeyword ? "Unverified Source (Flagged)" : "Nairobi Certified Bottling Line",
        exciseTaxStatus: isFakeKeyword ? "FAILED • Serial Not Found in Excise Ledger" : "PAID & CLEARED • Digital Stamp Active",
        intendedMarket: "Kenya Domestic Retail",
        lastScannedLocation: "Current Operator Terminal",
        scanCount: isFakeKeyword ? 41 : 1,
        spectralSignature: {
          uvFluorescence: isFakeKeyword ? "FAILED — Missing 365nm Security Taggant" : "365nm Dual-Peak Match (99.2%)",
          microText: isFakeKeyword ? "FAILED — Inkjet Halftone Artifact" : "KEBS Micro-engraving Verified",
          capTorqueSeal: isFakeKeyword ? "FAILED — Cap Bridge Broken" : "Intact Optical Tamper Bridge",
          methanolPpm: isFakeKeyword ? "HIGH RISK — Hold for Lab Assay" : "< 5.0 ppm (Safe Profile)",
          hologramShift: isFakeKeyword ? "FAILED — Static Foil" : "45° Diffractive Kinegram Pass",
          ledgerHash: isFakeKeyword ? "UNANCHORED-0x0000" : "0x5c2a...88e4190b"
        },
        supplyChain: [
          {
            step: isFakeKeyword ? "Unregistered Serial Query" : "Cryptographic Unit Identity Mint",
            actor: isFakeKeyword ? "Aegis Threat Detector" : "Aegis Core Authority",
            location: "Nairobi, KE",
            timestamp: "2026-10-22 06:50 EAT",
            verified: !isFakeKeyword,
            hash: isFakeKeyword ? "INVALID-SIGNATURE" : "0x5c2a...88e4"
          }
        ]
      };
    }

    state.activeProduct = found;

    const newEntry = {
      id: "SCN-" + Math.floor(1000 + Math.random() * 9000),
      serial: found.serial,
      name: found.name,
      status: found.status,
      verdictBadge: found.verdictBadge,
      riskScore: found.riskScore,
      confidence: found.confidence,
      location: found.lastScannedLocation,
      timestamp: "Just now"
    };
    state.scanHistory = [newEntry, ...state.scanHistory.slice(0, 19)];
    saveJSON(STORAGE_KEYS.HISTORY, state.scanHistory);

    const toastVariant = found.status === "AUTHENTIC" ? "emerald" : found.status === "SUSPICIOUS" ? "amber" : "rose";
    showToast(
      `${found.verdictBadge || found.status} • RISK ${found.riskScore}`,
      `${found.name} (${found.serial}) scored by Aegis Scan Engine.`,
      toastVariant
    );

    renderApp();
  }

  async function toggleCameraStream() {
    if (state.cameraActive) {
      stopCameraIfNeeded();
      renderApp();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast("Simulated Scan Lens Active", "Camera API unavailable; running Aegis simulated optical feed.", "orange");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      state.cameraStream = stream;
      state.cameraActive = true;
      renderApp();
      const videoEl = document.getElementById("scanner-video");
      if (videoEl) {
        videoEl.srcObject = stream;
        if ("BarcodeDetector" in window) {
          try {
            const detector = new window.BarcodeDetector({
              formats: ["qr_code", "data_matrix", "ean_13", "code_128"]
            });
            state.barcodeInterval = setInterval(async () => {
              if (!state.cameraActive || !videoEl || videoEl.readyState < 2) return;
              try {
                const codes = await detector.detect(videoEl);
                if (codes && codes.length > 0 && codes[0].rawValue) {
                  const detectedValue = codes[0].rawValue;
                  stopCameraIfNeeded();
                  showToast("Optical QR / Barcode Decoded", `Extracted serial: ${detectedValue}`, "emerald");
                  executeSerialLookup(detectedValue);
                }
              } catch {}
            }, 650);
          } catch {}
        }
      }
      showToast("Optical Camera Linked", "Point lens at bottle excise stamp or QR / DataMatrix.", "emerald");
    } catch {
      showToast("Simulated Scan Mode", "Camera permission declined; using interactive simulated lens.", "orange");
    }
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function analyzeStampPhotoFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = Math.min(200, img.width || 200);
        const h = Math.min(200, img.height || 200);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0;
        let sumSq = 0;
        const count = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          sum += lum;
          sumSq += lum * lum;
        }
        const mean = sum / count;
        const variance = Math.max(0, sumSq / count - mean * mean);
        const stdDev = Math.sqrt(variance);
        const isHighContrast = stdDev > 38;
        state.photoForensicResult = {
          fileName: file.name,
          resolution: `${img.width}×${img.height}px`,
          contrast: `${stdDev.toFixed(1)} σ (${isHighContrast ? "Sharp Intaglio" : "Low Halftone Contrast"})`,
          snr: isHighContrast ? "34.8 dB (Pass)" : "14.2 dB (Suspect Toner)",
          verdict: isHighContrast ? "OPTICAL PROFILE PASS" : "HALFTONE ANOMALY WARN"
        };
        showToast(
          state.photoForensicResult.verdict,
          `Analyzed ${file.name} (${img.width}×${img.height}px) — Contrast ${stdDev.toFixed(1)}σ.`,
          isHighContrast ? "emerald" : "amber"
        );
        renderApp();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function retireCurrentUnitAtPos() {
    const p = state.activeProduct;
    if (!p) return;
    p.status = "SUSPICIOUS";
    p.verdictBadge = "ALREADY OPENED";
    p.riskScore = Math.max(p.riskScore, 74);
    if (!p.flags) p.flags = [];
    if (!p.flags.includes("already_opened")) p.flags.unshift("already_opened");
    if (!p.flags.includes("post_retirement_scan")) p.flags.push("post_retirement_scan");
    p.exciseTaxStatus = "STAMP RETIRED — Post-Retirement Scan Flagged";
    p.spectralSignature.capTorqueSeal = "OPENED — POS Retirement & Tamper Loop Logged";
    p.scanCount = (p.scanCount || 1) + 1;
    p.supplyChain.push({
      step: "POS Unit Retirement & Cap Opening Logged",
      actor: state.user ? `${state.user.name} (${state.roleMode.toUpperCase()})` : "Retailer / Hospitality POS Terminal",
      location: p.lastScannedLocation || "Nairobi / Nakuru POS",
      timestamp: "Just now",
      verified: false,
      hash: "RETIRED-POS-" + Math.floor(1000 + Math.random() * 9000)
    });

    saveJSON(STORAGE_KEYS.BEVERAGES, window.SENTINEL_DATA.beverageDatabase);

    showToast(
      "Unit Marked Opened / Retired",
      `${p.serial} is now retired. Any future scan triggers ALREADY OPENED (RISK 74).`,
      "amber"
    );
    renderApp();
  }

  function downloadForensicCertificate() {
    const p = state.activeProduct;
    const qrSvg = generateQrSvg(p.serial, 140, "#f97316", "#080706");
    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AEGIS Forensic Certificate — ${escapeHtml(p.serial)}</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #080706; color: #f5f5f4; padding: 40px; }
    .card { max-width: 760px; margin: 0 auto; border: 2px solid #f97316; border-radius: 16px; background: #120f0d; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #29221e; padding-bottom: 20px; }
    .badge { font-family: monospace; padding: 6px 12px; border-radius: 6px; background: #f97316; color: #000; font-weight: 800; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px; }
    .box { background: #080706; border: 1px solid #29221e; padding: 12px; border-radius: 8px; font-size: 13px; }
    .label { color: #a8a29e; font-size: 10px; font-family: monospace; text-transform: uppercase; display: block; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div style="font-family:monospace;color:#f97316;font-size:12px;letter-spacing:0.18em;">VANBRANSA × PROJECT AEGIS</div>
        <h1 style="margin:6px 0 0;font-size:22px;">CRYPTOGRAPHIC VERIFICATION &amp; CHAIN-OF-CUSTODY CERTIFICATE</h1>
      </div>
      <span class="badge">${escapeHtml(p.verdictBadge || p.status)} • RISK ${p.riskScore}</span>
    </div>
    <div style="display:flex;gap:24px;align-items:center;margin-top:24px;">
      <div>${qrSvg}</div>
      <div>
        <h2 style="margin:0 0 6px;">${escapeHtml(p.name)}</h2>
        <p style="margin:0;color:#d6d3d1;font-family:monospace;">Unit Serial: <strong>${escapeHtml(p.serial)}</strong></p>
        <p style="margin:4px 0;color:#d6d3d1;font-family:monospace;">KRA Stamp: <strong>${escapeHtml(p.stampCode)}</strong> • Batch: ${escapeHtml(p.batchNumber)}</p>
        <p style="margin:4px 0;color:#f97316;font-family:monospace;">Ledger Hash: ${escapeHtml(p.spectralSignature.ledgerHash)}</p>
      </div>
    </div>
    <div class="grid">
      <div class="box"><span class="label">Excise Tax &amp; Stamp Status</span><strong>${escapeHtml(p.exciseTaxStatus)}</strong></div>
      <div class="box"><span class="label">Origin Bottling Line</span><strong>${escapeHtml(p.originFacility)}</strong></div>
      <div class="box"><span class="label">365nm UV Taggant Assay</span><strong>${escapeHtml(p.spectralSignature.uvFluorescence)}</strong></div>
      <div class="box"><span class="label">Closure &amp; Retirement State</span><strong>${escapeHtml(p.spectralSignature.capTorqueSeal)}</strong></div>
      <div class="box"><span class="label">Methanol / Chemical Profile</span><strong>${escapeHtml(p.spectralSignature.methanolPpm)}</strong></div>
      <div class="box"><span class="label">Issued Timestamp</span><strong>${new Date().toISOString()}</strong></div>
    </div>
  </div>
</body>
</html>`;
    downloadFile(`AEGIS-Certificate-${p.serial}.html`, certHtml, "text/html;charset=utf-8");
    showToast("Forensic Certificate Downloaded", `Saved AEGIS-Certificate-${p.serial}.html.`, "emerald");
  }

  function bindViewEvents() {
    const heroForm = document.getElementById("hero-quick-verify-form");
    if (heroForm) {
      heroForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("hero-serial-input");
        executeSerialLookup(input?.value || state.activeProduct.serial);
        navigateTo("/verify");
      });
    }

    document.querySelectorAll("[data-quick-serial]").forEach(btn => {
      btn.addEventListener("click", () => {
        const serial = btn.getAttribute("data-quick-serial");
        executeSerialLookup(serial);
        if (btn.textContent.trim() === "Inspect") {
          navigateTo("/verify");
        }
      });
    });

    const verifyForm = document.getElementById("verify-serial-form");
    if (verifyForm) {
      verifyForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("verify-serial-input");
        executeSerialLookup(input ? input.value : "");
      });
    }

    document.querySelectorAll("[data-select-serial]").forEach(btn => {
      btn.addEventListener("click", () => {
        const serial = btn.getAttribute("data-select-serial");
        executeSerialLookup(serial);
      });
    });

    const stampPhotoInput = document.getElementById("stamp-photo-input");
    if (stampPhotoInput) {
      stampPhotoInput.addEventListener("change", e => {
        const file = e.target.files && e.target.files[0];
        if (file) analyzeStampPhotoFile(file);
      });
    }

    const retirePosBtn = document.getElementById("retire-pos-unit-btn");
    if (retirePosBtn) {
      retirePosBtn.addEventListener("click", retireCurrentUnitAtPos);
    }

    const downloadCertBtn = document.getElementById("download-cert-btn");
    if (downloadCertBtn) {
      downloadCertBtn.addEventListener("click", downloadForensicCertificate);
    }

    const pushToDoohBtn = document.getElementById("push-unit-to-dooh-btn");
    if (pushToDoohBtn) {
      pushToDoohBtn.addEventListener("click", () => {
        const p = state.activeProduct;
        const loc = (p.lastScannedLocation || "Nairobi").toLowerCase();
        const matchingBoard =
          state.doohBillboards.find(b => loc.includes(b.county.split(" ")[0].toLowerCase())) ||
          state.doohBillboards[0];
        if (matchingBoard) {
          state.selectedBillboardId = matchingBoard.screenId;
          matchingBoard.targetSerial = p.serial;
          matchingBoard.lastSynced = "Just now";
          if (p.status === "COUNTERFEIT") {
            matchingBoard.activeMode = "EMERGENCY_ALERT";
            matchingBoard.headline = `COUNTERFEIT ALERT: ${p.name.toUpperCase()}`;
            matchingBoard.subheadline = `Unit ${p.serial} flagged as CLONED STAMP (RISK ${p.riskScore}). Scan bottle QR before purchase.`;
          } else if (p.status === "SUSPICIOUS") {
            matchingBoard.activeMode = "REFILL_WARNING";
            matchingBoard.headline = `REFILL WARNING: ${p.name.toUpperCase()}`;
            matchingBoard.subheadline = `Unit ${p.serial} flagged ALREADY OPENED (RISK ${p.riskScore}). Inspect closure bridge & scan QR.`;
          } else {
            matchingBoard.activeMode = "BRAND_TRUST";
            matchingBoard.headline = `VERIFIED GENUINE: ${p.name.toUpperCase()}`;
            matchingBoard.subheadline = `Cryptographic identity ${p.serial} bound to KRA stamp ${p.stampCode} (RISK ${p.riskScore}).`;
          }
          saveJSON(STORAGE_KEYS.DOOH, state.doohBillboards);
          showToast(
            "Synced to VANBRANSA DOOH",
            `Pushed ${p.serial} telemetry to ${matchingBoard.screenId} (${matchingBoard.county}).`,
            "orange"
          );
          navigateTo("/dooh");
        }
      });
    }

    const analyzeUnitAiBtn = document.getElementById("analyze-unit-ai-btn");
    if (analyzeUnitAiBtn) {
      analyzeUnitAiBtn.addEventListener("click", () => {
        const p = state.activeProduct;
        const prompt = `Forensic diagnostic for ${p.name} (${p.serial}) — Verdict: ${p.verdictBadge}, Risk ${p.riskScore}`;
        state.aiCustomPrompt = prompt;
        state.aiReportOutput = buildAiReportPayload("custom", prompt);
        showToast("Aegis Cortex Synthesized", `Generated AI forensic dossier for ${p.serial}.`, "emerald");
        navigateTo("/reports");
      });
    }

    const uvBtn = document.getElementById("toggle-uv-btn");
    if (uvBtn) {
      uvBtn.addEventListener("click", () => {
        state.uvMode = !state.uvMode;
        showToast(
          state.uvMode ? "365nm UV Excitation Enabled" : "Standard Optical Spectrum",
          state.uvMode ? "Inspecting invisible excise taggant fluorescence." : "Switched to visible macro mode.",
          "orange"
        );
        renderApp();
      });
    }

    const camBtn = document.getElementById("toggle-camera-btn");
    if (camBtn) {
      camBtn.addEventListener("click", toggleCameraStream);
    }

    const flagBtn = document.getElementById("flag-current-product-btn");
    if (flagBtn) {
      flagBtn.addEventListener("click", () => openReportModal(state.activeProduct));
    }

    document.querySelectorAll("[data-blueprint-layer]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.blueprintActiveLayer = Number(btn.getAttribute("data-blueprint-layer")) || 0;
        renderApp();
      });
    });

    document.querySelectorAll("[data-sim-scenario]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.blueprintTestScenario = btn.getAttribute("data-sim-scenario") || "authentic";
        renderApp();
      });
    });

    const loadSimBtn = document.getElementById("load-sim-to-verify-btn");
    if (loadSimBtn) {
      loadSimBtn.addEventListener("click", () => {
        const serial = loadSimBtn.getAttribute("data-sim-serial") || "SNT-FA24-57D2-13EE-EC26";
        executeSerialLookup(serial);
        navigateTo("/verify");
      });
    }

    document.querySelectorAll("[data-hotspot-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedHotspotId = btn.getAttribute("data-hotspot-id");
        renderApp();
      });
    });

    const syncHotspotDoohBtn = document.getElementById("sync-hotspot-dooh-btn");
    if (syncHotspotDoohBtn) {
      syncHotspotDoohBtn.addEventListener("click", () => {
        const county = syncHotspotDoohBtn.getAttribute("data-hotspot-county") || "Nairobi";
        const board =
          state.doohBillboards.find(b => b.county.toLowerCase().includes(county.split(" ")[0].toLowerCase())) ||
          state.doohBillboards[0];
        if (board) {
          state.selectedBillboardId = board.screenId;
          showToast("DOOH Screen Selected", `Opened ${board.screenId} (${board.name}) for ${county}.`, "orange");
          navigateTo("/dooh");
        }
      });
    }

    document.querySelectorAll("[data-case-ai-brief]").forEach(btn => {
      btn.addEventListener("click", () => {
        const caseContext = btn.getAttribute("data-case-ai-brief") || "";
        state.aiCustomPrompt = `Analyze seizure case ${caseContext}`;
        state.aiReportOutput = buildAiReportPayload("custom", state.aiCustomPrompt);
        showToast("Case Loaded in AI Cortex", `Synthesized enforcement briefing for ${caseContext.split(":")[0]}.`, "emerald");
        navigateTo("/reports");
      });
    });

    // Mint & Stamp Bind Module Event Listeners
    const mintForm = document.getElementById("mint-batch-form");
    if (mintForm) {
      mintForm.addEventListener("submit", e => {
        e.preventDefault();
        const productName = document.getElementById("mint-product-name")?.value || "Aegis Single Malt 750ml";
        const brand = document.getElementById("mint-brand")?.value || "Aegis Distillers Kenya Ltd";
        const abv = document.getElementById("mint-abv")?.value || "43.0% ABV";
        const stampReel = document.getElementById("mint-stamp-reel")?.value || "KRA-EX-9981204";
        const unitCount = Number(document.getElementById("mint-unit-count")?.value) || 15000;
        const facility = document.getElementById("mint-facility")?.value || "Ruaraka Line #3, Nairobi";
        const targetZone = document.getElementById("mint-zone")?.value || "Nairobi Metro & Central Retail";

        const hexSuffix = Math.floor(1000 + Math.random() * 8999);
        const newSerial = `AEG-2026-${hexSuffix}-MNT`;
        const newBatchId = `B26-AEG-${Math.floor(100 + Math.random() * 899)}`;
        const newHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`;

        const newProduct = {
          serial: newSerial,
          stampCode: `${stampReel}-001`,
          gtin: "06161100" + Math.floor(100000 + Math.random() * 899999),
          name: productName,
          brand,
          category: "Minted Spirit / Beverage • ECDSA Bound",
          abv,
          status: "AUTHENTIC",
          verdictBadge: "VERIFIED GENUINE",
          riskScore: 2,
          confidence: 99.9,
          flags: ["cryptographic_bind_valid", "excise_paid", "hsm_fresh_mint"],
          batchNumber: newBatchId,
          productionDate: new Date().toISOString().slice(0, 10),
          expiryDate: "2029-10-22",
          originFacility: facility,
          exciseTaxStatus: `PAID & CLEARED • Bound to ${stampReel}`,
          intendedMarket: targetZone,
          lastScannedLocation: facility,
          scanCount: 1,
          spectralSignature: {
            uvFluorescence: "365nm Dual-Peak Match (99.9%)",
            microText: "KEBS + KRA Laser Intaglio Verified",
            capTorqueSeal: "Factory Sealed — Tamper Bridge Intact",
            methanolPpm: "2.1 ppm (ISO Safe Standard)",
            hologramShift: "45° Gold-Emerald Kinegram Pass",
            ledgerHash: newHash
          },
          supplyChain: [
            {
              step: "Bottling Line HSM Unit Identity & Stamp Mint",
              actor: brand,
              location: facility,
              timestamp: "Just now",
              verified: true,
              hash: newHash
            }
          ]
        };

        window.SENTINEL_DATA.beverageDatabase.unshift(newProduct);
        saveJSON(STORAGE_KEYS.BEVERAGES, window.SENTINEL_DATA.beverageDatabase);
        state.lastMintedUnit = newProduct;
        state.activeProduct = newProduct;

        const batchEntry = {
          batchId: newBatchId,
          sampleSerial: newSerial,
          productName,
          brand,
          facility,
          stampReel,
          unitCount,
          targetZone,
          ecdsaKeyId: "HSM-KE-NRB-" + hexSuffix,
          mintedAt: "Just now",
          status: "MINTED • ACTIVE IN LEDGER"
        };
        state.mintedBatches = [batchEntry, ...state.mintedBatches];
        saveJSON(STORAGE_KEYS.BATCHES, state.mintedBatches);

        showToast(
          `Minted Batch ${newBatchId}`,
          `Generated ${unitCount.toLocaleString()} units (Sample: ${newSerial}) bound to ${stampReel}.`,
          "emerald"
        );
        renderApp();
      });
    }

    document.querySelectorAll("[data-test-minted-serial]").forEach(btn => {
      btn.addEventListener("click", () => {
        const serial = btn.getAttribute("data-test-minted-serial");
        executeSerialLookup(serial);
        navigateTo("/verify");
      });
    });

    const printQrBtn = document.getElementById("print-qr-sheet-btn");
    if (printQrBtn) {
      printQrBtn.addEventListener("click", () => window.print());
    }

    // VANBRANSA DOOH Billboard Command Center Listeners
    document.querySelectorAll("[data-select-billboard]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedBillboardId = btn.getAttribute("data-select-billboard") || "VNB-NRB-01";
        renderApp();
      });
    });

    document.querySelectorAll("[data-set-dooh-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-set-dooh-mode");
        const board = state.doohBillboards.find(b => b.screenId === state.selectedBillboardId);
        if (board && mode) {
          board.activeMode = mode;
          board.lastSynced = "Just now";
          if (mode === "EMERGENCY_ALERT") {
            board.headline = `EMERGENCY COUNTERFEIT ALERT IN ${board.county.toUpperCase()}`;
            board.subheadline = "Aegis detected cloned KRA stamps in this sector. Scan bottle QR before purchase.";
            board.targetSerial = "AEG-FAKE-0013-CLN";
          } else if (mode === "REFILL_WARNING") {
            board.headline = "HOSPITALITY REFILL WARNING • CHECK TAMPER BRIDGE";
            board.subheadline = "Post-retirement bottle scans (ALREADY OPENED • RISK 74) flagged nearby. Scan QR at your table.";
            board.targetSerial = "SNT-FA24-57D2-13EE-EC26";
          } else {
            board.headline = "EVERY GENUINE BOTTLE CARRIES A CRYPTOGRAPHIC IDENTITY";
            board.subheadline = "Co-protected by VANBRANSA Digital Out-Of-Home & Aegis Anti-Counterfeit Infrastructure.";
            board.targetSerial = "AEG-2026-8841-KEN";
          }
          saveJSON(STORAGE_KEYS.DOOH, state.doohBillboards);
          showToast("VANBRANSA Billboard Updated", `Switched ${board.screenId} to ${mode.replace(/_/g, " ")}.`, "orange");
          renderApp();
        }
      });
    });

    const toggleAutosyncBtn = document.getElementById("toggle-dooh-autosync-btn");
    if (toggleAutosyncBtn) {
      toggleAutosyncBtn.addEventListener("click", () => {
        state.doohAutoSync = !state.doohAutoSync;
        showToast(
          state.doohAutoSync ? "DOOH Auto-Trigger Enabled" : "DOOH Manual Override Mode",
          state.doohAutoSync
            ? "Billboards automatically switch to Emergency Alert when local Risk > 70."
            : "Screens locked to manual operator scheduling.",
          "orange"
        );
        renderApp();
      });
    }

    const broadcastAllDoohBtn = document.getElementById("broadcast-all-dooh-btn");
    if (broadcastAllDoohBtn) {
      broadcastAllDoohBtn.addEventListener("click", () => {
        state.doohBillboards.forEach(b => {
          if (b.localRiskScore >= 65) {
            b.activeMode = "EMERGENCY_ALERT";
            b.lastSynced = "Just now";
          }
        });
        saveJSON(STORAGE_KEYS.DOOH, state.doohBillboards);
        showToast(
          "Emergency Creative Broadcasted",
          "All high-risk VANBRANSA roadside LED screens switched to Counterfeit Alert mode.",
          "rose"
        );
        renderApp();
      });
    }

    document.querySelectorAll("[data-dooh-scan-serial]").forEach(btn => {
      btn.addEventListener("click", () => {
        const serial = btn.getAttribute("data-dooh-scan-serial");
        executeSerialLookup(serial);
        navigateTo("/verify");
      });
    });

    // AI Reports Module Event Listeners & Sliders
    document.querySelectorAll("[data-ai-preset]").forEach(btn => {
      btn.addEventListener("click", () => {
        const presetId = btn.getAttribute("data-ai-preset") || "exec-brief";
        state.activeAiPresetId = presetId;
        state.aiCustomPrompt = "";
        state.aiReportOutput = buildAiReportPayload(presetId, "");
        showToast("Aegis Cortex Synthesized", `Loaded ${state.aiReportOutput.badge}.`, "orange");
        renderApp();
      });
    });

    const simComplianceSlider = document.getElementById("sim-compliance-slider");
    if (simComplianceSlider) {
      simComplianceSlider.addEventListener("input", e => {
        state.simComplianceRate = Number(e.target.value) || 48;
        renderApp();
      });
    }

    const simDoohSlider = document.getElementById("sim-dooh-slider");
    if (simDoohSlider) {
      simDoohSlider.addEventListener("input", e => {
        state.simDoohCoverage = Number(e.target.value) || 75;
        renderApp();
      });
    }

    const simCheckpointsSlider = document.getElementById("sim-checkpoints-slider");
    if (simCheckpointsSlider) {
      simCheckpointsSlider.addEventListener("input", e => {
        state.simCheckpoints = Number(e.target.value) || 12;
        renderApp();
      });
    }

    const aiCustomForm = document.getElementById("ai-custom-prompt-form");
    if (aiCustomForm) {
      aiCustomForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("ai-custom-input");
        const query = input ? input.value.trim() : "";
        if (!query) {
          showToast("Enter an AI Prompt", "Type a question for Aegis Cortex or choose a template.", "amber");
          return;
        }
        state.aiCustomPrompt = query;
        state.aiReportOutput = buildAiReportPayload("custom", query);
        showToast("AI Intelligence Generated", "Aegis Cortex completed custom forensic synthesis.", "emerald");
        renderApp();
      });
    }

    const exportCsvBtn = document.getElementById("export-csv-report-btn");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => {
        const rows = [
          ["CaseOrScanID", "SerialOrLocation", "Product", "StatusOrSeverity", "RiskScoreOrTaxProtected", "Timestamp"],
          ...state.scanHistory.map(s => [s.id, s.serial, s.name, s.status, `RISK ${s.riskScore}`, s.timestamp]),
          ...state.seizureCases.map(c => [c.caseId, c.location, c.product, c.riskSeverity, c.estimatedTaxProtected, c.timestamp])
        ];
        const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        downloadFile("aegis-forensic-telemetry-report.csv", csv, "text/csv;charset=utf-8;");
        showToast("CSV Telemetry Exported", "Downloaded aegis-forensic-telemetry-report.csv.", "emerald");
      });
    }

    const exportJsonBtn = document.getElementById("export-json-report-btn");
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", () => {
        const report = state.aiReportOutput || buildAiReportPayload(state.activeAiPresetId, state.aiCustomPrompt);
        const payload = {
          generatedAt: new Date().toISOString(),
          platform: "AEGIS × VANBRANSA Anti-Counterfeit Infrastructure",
          aiModel: window.SENTINEL_DATA.aiAnalytics.modelVersion,
          executiveReport: report,
          countyRiskRanking: window.SENTINEL_DATA.aiAnalytics.countyRiskRanking,
          monthlyRevenueRecovered: window.SENTINEL_DATA.aiAnalytics.monthlyRevenueRecovered,
          mintedBatches: state.mintedBatches,
          doohBillboards: state.doohBillboards,
          recentScans: state.scanHistory,
          seizureWarrants: state.seizureCases
        };
        downloadFile("aegis-cortex-ai-dossier.json", JSON.stringify(payload, null, 2), "application/json");
        showToast("AI Dossier Downloaded", "Saved aegis-cortex-ai-dossier.json.", "emerald");
      });
    }

    const printDossierBtn = document.getElementById("print-dossier-btn");
    if (printDossierBtn) {
      printDossierBtn.addEventListener("click", () => {
        window.print();
      });
    }

    const dispatchBtn = document.getElementById("dispatch-taskforce-btn");
    if (dispatchBtn) {
      dispatchBtn.addEventListener("click", () => {
        const hs = window.SENTINEL_DATA.tradeHotspots.find(h => h.id === state.selectedHotspotId);
        showToast(
          "Aegis Enforcement Dispatched",
          `Encrypted unit hashes and coordinates transmitted to field team in ${hs ? hs.county : "region"}.`,
          "orange"
        );
      });
    }

    const tradeNewBtn = document.getElementById("trade-new-incident-btn");
    if (tradeNewBtn) {
      tradeNewBtn.addEventListener("click", () => openReportModal(state.activeProduct));
    }

    const searchInput = document.getElementById("trade-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        state.tradeSearchQuery = e.target.value;
        renderApp();
        const restored = document.getElementById("trade-search-input");
        if (restored) {
          restored.focus();
          restored.setSelectionRange(restored.value.length, restored.value.length);
        }
      });
    }

    const sevSelect = document.getElementById("trade-severity-select");
    if (sevSelect) {
      sevSelect.addEventListener("change", e => {
        state.tradeFilterSeverity = e.target.value;
        renderApp();
      });
    }

    const loginForm = document.getElementById("auth-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("login-email")?.value || "inspector@aegis-infra.org";
        state.user = {
          name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          email,
          badge: "AEGIS FIELD INSPECTOR"
        };
        saveJSON(STORAGE_KEYS.USER, state.user);
        showToast("Console Authenticated", `Welcome back, ${state.user.name}.`, "orange");
        navigateTo("/verify");
      });
    }

    const ssoBtn = document.getElementById("google-sso-btn");
    if (ssoBtn) {
      ssoBtn.addEventListener("click", () => {
        state.user = {
          name: "Commander K. Mutua",
          email: "k.mutua@aegis-infra.org",
          badge: "EXCISE ENFORCEMENT LEAD"
        };
        state.roleMode = "inspector";
        saveJSON(STORAGE_KEYS.USER, state.user);
        saveJSON(STORAGE_KEYS.ROLE, state.roleMode);
        showToast("Aegis SSO Verified", "Signed in with Aegis Enforcement SSO.", "orange");
        navigateTo("/trade");
      });
    }

    const regForm = document.getElementById("auth-register-form");
    if (regForm) {
      regForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("reg-name")?.value || "Aegis Operator";
        const email = document.getElementById("reg-email")?.value || "operator@aegis-infra.org";
        const role = document.getElementById("reg-role")?.value || "inspector";
        state.user = { name, email, badge: role.toUpperCase() };
        state.roleMode = role;
        saveJSON(STORAGE_KEYS.USER, state.user);
        saveJSON(STORAGE_KEYS.ROLE, state.roleMode);
        showToast("Account Provisioned", `Welcome to Project Aegis, ${name}!`, "orange");
        navigateTo("/verify");
      });
    }

    const forgotForm = document.getElementById("auth-forgot-form");
    if (forgotForm) {
      forgotForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("forgot-email")?.value || "";
        showToast("Recovery Token Sent", `Instructions dispatched to ${email}.`, "orange");
        navigateTo("/login");
      });
    }

    const resetForm = document.getElementById("auth-reset-form");
    if (resetForm) {
      resetForm.addEventListener("submit", e => {
        e.preventDefault();
        showToast("Console Key Updated", "Your new cryptographic console password is active.", "emerald");
        navigateTo("/login");
      });
    }
  }

  function openReportModal(prefillProduct) {
    const modal = document.getElementById("report-modal");
    if (!modal) return;
    const serialInput = document.getElementById("report-serial");
    const brandInput = document.getElementById("report-brand");
    const locInput = document.getElementById("report-location");
    if (prefillProduct) {
      if (serialInput) serialInput.value = prefillProduct.serial || "";
      if (brandInput) brandInput.value = prefillProduct.name || "";
      if (locInput) locInput.value = prefillProduct.lastScannedLocation || "Nakuru";
    }
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "true");
    }
  }

  function closeReportModal() {
    const modal = document.getElementById("report-modal");
    if (!modal) return;
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
  }

  function renderRoleContextBanner() {
    const roleMeta = {
      consumer: {
        badge: "CONSUMER PROTECTION MODE",
        desc: "Instant phone verification, closure tamper-bridge check, and counterfeit reporting.",
        ctaLabel: "Scan a Bottle Now →",
        ctaRoute: "#/verify"
      },
      retailer: {
        badge: "RETAILER & HOSPITALITY POS MODE",
        desc: "Batch intake verification, POS cryptographic bottle retirement, and bottling lot provisioning.",
        ctaLabel: "Provision / Mint Batch →",
        ctaRoute: "#/mint"
      },
      inspector: {
        badge: "KRA / KEBS FIELD INSPECTOR MODE",
        desc: "365nm UV taggant spectrometry, syndicate corridor radar, VANBRANSA DOOH alerts, and AI dossiers.",
        ctaLabel: "Open Syndicate Radar →",
        ctaRoute: "#/trade"
      }
    };
    const current = roleMeta[state.roleMode] || roleMeta.consumer;
    return `
      <div class="mb-6 px-4 py-2.5 rounded-xl bg-[#120f0d]/90 border border-stone-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/35 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            ${escapeHtml(current.badge)}
          </span>
          <span class="text-stone-300">${escapeHtml(current.desc)}</span>
        </div>
        <div class="flex items-center gap-3 font-mono text-[11px]">
          <span class="text-stone-500 hidden sm:inline">Active Specimen: <strong class="text-stone-200">${escapeHtml(state.activeProduct.serial)}</strong></span>
          <a href="${current.ctaRoute}" class="text-orange-400 hover:underline font-semibold">${escapeHtml(current.ctaLabel)}</a>
        </div>
      </div>
    `;
  }

  function renderApp() {
    const route = getNormalizedRoute();
    if (route !== "/verify" && state.cameraActive) {
      stopCameraIfNeeded();
    }
    state.currentRoute = route;
    updateHeaderUI();

    const root = document.getElementById("app-root");
    if (!root) return;

    const isAuthRoute = route === "/login" || route === "/register" || route === "/forgot-password" || route === "/reset-password";
    const bannerHtml = isAuthRoute ? "" : renderRoleContextBanner();

    let viewHtml = "";
    if (route === "/" || route === "/home") {
      viewHtml = renderHomeView();
    } else if (route === "/verify") {
      viewHtml = renderVerifyView();
    } else if (route === "/blueprint") {
      viewHtml = renderBlueprintView();
    } else if (route === "/trade") {
      viewHtml = renderTradeView();
    } else if (route === "/mint") {
      viewHtml = renderMintView();
    } else if (route === "/dooh") {
      viewHtml = renderDoohView();
    } else if (route === "/reports") {
      viewHtml = renderReportsView();
    } else if (route === "/login") {
      viewHtml = renderAuthView("login");
    } else if (route === "/register") {
      viewHtml = renderAuthView("register");
    } else if (route === "/forgot-password") {
      viewHtml = renderAuthView("forgot");
    } else if (route === "/reset-password") {
      viewHtml = renderAuthView("reset");
    } else {
      viewHtml = renderHomeView();
    }

    root.innerHTML = bannerHtml + viewHtml;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    bindViewEvents();
  }

  function toggleMobileSidebar(forceOpen) {
    const sidebar = document.getElementById("left-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar || !backdrop) return;
    const isOpen = !sidebar.classList.contains("-translate-x-full");
    const nextState = typeof forceOpen === "boolean" ? forceOpen : !isOpen;
    if (nextState) {
      sidebar.classList.remove("-translate-x-full");
      backdrop.classList.remove("hidden");
    } else {
      sidebar.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
    }
  }

  function initGlobalListeners() {
    window.addEventListener("hashchange", () => {
      toggleMobileSidebar(false);
      renderApp();
    });

    const openSidebarBtn = document.getElementById("open-sidebar-btn");
    const closeSidebarBtn = document.getElementById("close-sidebar-btn");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    if (openSidebarBtn) openSidebarBtn.addEventListener("click", () => toggleMobileSidebar(true));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", () => toggleMobileSidebar(false));
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", () => toggleMobileSidebar(false));

    document.querySelectorAll(".role-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-role-mode") || "consumer";
        state.roleMode = mode;
        saveJSON(STORAGE_KEYS.ROLE, mode);
        showToast("Operator Role Switched", `Active mode: ${mode.toUpperCase()}.`, "orange");
        renderApp();
      });
    });

    const sidebarReportBtn = document.getElementById("sidebar-report-btn");
    if (sidebarReportBtn) {
      sidebarReportBtn.addEventListener("click", () => {
        toggleMobileSidebar(false);
        openReportModal(state.activeProduct);
      });
    }

    const closeBtn = document.getElementById("close-report-modal");
    const cancelBtn = document.getElementById("cancel-report-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeReportModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeReportModal);

    const reportForm = document.getElementById("incident-report-form");
    if (reportForm) {
      reportForm.addEventListener("submit", e => {
        e.preventDefault();
        const serial = document.getElementById("report-serial")?.value || "SNT-FA24";
        const brand = document.getElementById("report-brand")?.value || "Suspect Bottle";
        const location = document.getElementById("report-location")?.value || "Nakuru";
        const severity = document.getElementById("report-severity")?.value || "CRITICAL";
        const notes = document.getElementById("report-notes")?.value || "already_opened • post_retirement_scan";

        const newCase = {
          caseId: "AEG-2026-" + Math.floor(9405 + Math.random() * 500),
          timestamp: "Just now",
          location,
          product: `${brand} (${serial})`,
          violation: notes,
          riskSeverity: severity,
          agency: "Aegis Rapid Dispatch",
          status: "DISPATCHED TO FIELD UNIT",
          estimatedTaxProtected: "Sh 1.2M"
        };

        state.seizureCases = [newCase, ...state.seizureCases];
        saveJSON(STORAGE_KEYS.CASES, state.seizureCases);

        if (state.doohAutoSync) {
          const matchingBoard = state.doohBillboards.find(b =>
            location.toLowerCase().includes(b.county.split(" ")[0].toLowerCase())
          );
          if (matchingBoard) {
            matchingBoard.activeMode = "EMERGENCY_ALERT";
            matchingBoard.headline = `EMERGENCY COUNTERFEIT ALERT: ${brand.toUpperCase()}`;
            matchingBoard.subheadline = `Field report (${newCase.caseId}) logged in ${location}. Verify serial ${serial} via QR before purchase.`;
            matchingBoard.targetSerial = serial;
            matchingBoard.lastSynced = "Just now";
            saveJSON(STORAGE_KEYS.DOOH, state.doohBillboards);
          }
        }

        closeReportModal();
        reportForm.reset();
        showToast(
          "Aegis Warrant Logged & DOOH Synced",
          `Case ${newCase.caseId} added to Trade Intelligence${state.doohAutoSync ? " and broadcasted to county DOOH screens" : ""}.`,
          "rose"
        );
        navigateTo("/trade");
      });
    }

    const updateOnlineStatus = () => {
      const badge = document.getElementById("pwa-sync-status");
      if (!badge) return;
      if (navigator.onLine) {
        badge.className = "inline-flex items-center gap-1.5 text-emerald-400";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>CLOUD + OFFLINE PWA`;
      } else {
        badge.className = "inline-flex items-center gap-1.5 text-amber-400";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>OFFLINE BLOOM CACHE`;
      }
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGlobalListeners();
    renderApp();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  });
})();
