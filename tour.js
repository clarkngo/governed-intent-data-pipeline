/**
 * GIDP guided walkthroughs — spotlight popups with Back / Next.
 * Works on the lab (index.html) and the knowledge base (docs.html).
 */
(function GIDPTour(global) {
  "use strict";

  const PAGE = document.body && document.body.getAttribute("data-page");

  const SCENARIOS = [
    {
      id: "anatomy",
      page: "lab",
      title: "Lab anatomy",
      blurb: "Orient to the four control-plane layers without compiling anything.",
      steps: [
        {
          target: "[data-tour='brand']",
          title: "Welcome to GIDP Lab",
          body: "This simulation compiles natural-language intent into a governed plan, checks defense-in-depth guardrails, then runs DuckDB in the browser. Nothing leaves this tab.",
        },
        {
          target: "[data-tour='layers']",
          title: "Four layers, one compile",
          body: "Interaction → Planning & policy → Execution → Observability. Every prompt walks this path. Guardrails sit in front of the warehouse session, not after it.",
        },
        {
          target: "[data-tour='role']",
          title: "Role is bound first",
          body: "Analyst is least-privilege (SELECT + AGGREGATE). Admin / Data Engineer may break-glass a substitute aggregate — never a raw PII dump, and never SSN.",
          action: function () {
            if (global.GIDP) global.GIDP.setRole("analyst");
          },
        },
        {
          target: "[data-tour='templates']",
          title: "Intent templates",
          body: "Start from a known prompt. Approved paths name datasets, grain, and a privacy constraint. Hostile or unbounded prompts are here so you can watch them fail closed.",
        },
        {
          target: "[data-tour='catalog']",
          title: "Governed catalog",
          body: "Classification is evaluated before any column may be projected. join_key and internal are usable for analytics. pii is confidential. restricted (ssn) is non-overridable.",
        },
        {
          target: "[data-tour='stages']",
          title: "Pipeline stages",
          body: "After you compile, the stepper lights plan → guardrails → SQL → execute → quality → artifact. A block or clarify stops before SQL is dispatched.",
        },
        {
          target: "[data-tour='audit']",
          title: "Audit & lineage",
          body: "Every compile is an immutable event: timestamp, role, decision, guardrail statuses, SQL, quality stats, and artifact link. That is the paper's observability layer, in miniature.",
        },
      ],
    },
    {
      id: "retention",
      page: "lab",
      title: "Approved retention path",
      blurb: "Analyst compiles a weekly regional retention report. All four guardrails pass and an artifact is published.",
      steps: [
        {
          target: "[data-tour='role']",
          title: "Bind Analyst",
          body: "Least-privilege is the default. The compiler will only emit SELECT + AGGREGATE against approved facts, with customers used as a join-only region dimension.",
          action: function () {
            if (!global.GIDP) return;
            global.GIDP.setSpeed("fast");
            global.GIDP.setRole("analyst");
            global.GIDP.reset();
          },
        },
        {
          target: "[data-tour='templates']",
          title: "Choose the approved template",
          body: "The prompt names approved datasets (subscriptions, support tickets), a privacy constraint (suppress identifiers), and a grain (region). That is enough for the compiler to pick retention_by_region.",
          action: function () {
            if (global.GIDP) global.GIDP.applyTemplate("retention");
          },
        },
        {
          target: "[data-tour='run']",
          title: "Compile & execute",
          body: "On Next, the lab will compile the plan, evaluate guardrails, run PII-stripped SQL, then publish a regional artifact.",
        },
        {
          target: "[data-tour='plan']",
          title: "Structured plan",
          body: "Intent, target datasets, identity, risk, transformation logic, and quality checks are first-class fields — not a free-form chain-of-thought. The warehouse never sees the original prompt.",
          action: function () {
            if (global.GIDP) return global.GIDP.compile();
          },
        },
        {
          target: "[data-tour='guardrails']",
          title: "All guardrails pass",
          body: "Identity allows the role. No injection language. Catalog authorizes approved facts plus a non-PII join. Tools allow aggregate SELECT only. Decision: allow.",
        },
        {
          target: "[data-tour='sql']",
          title: "PII-stripped SQL",
          body: "name, email, and ssn are absent from the projection. customers is joined only for region. That is policy compiled into SQL, not a comment the model might ignore.",
        },
        {
          target: "[data-tour='results']",
          title: "Regional artifact",
          body: "Retention %, active MRR, and ticket CSAT by region. Quality gates (row count, no PII columns, range checks) must pass before the JSON/CSV artifact is published.",
        },
        {
          target: "[data-tour='audit']",
          title: "Lineage recorded",
          body: "The allow event is now in the console: role, guardrail vector, SQL, quality stats, downloadable artifact. This is what an enterprise control plane should log for every AI-assisted pipeline.",
        },
      ],
    },
    {
      id: "clarify",
      page: "lab",
      title: "Clarify unbounded scope",
      blurb: "“Show me everything” has no metric, grain, or privacy constraint. The compiler refuses to emit SQL.",
      steps: [
        {
          target: "[data-tour='role']",
          title: "Stay least-privilege",
          body: "Ambiguous exploration is a clarify, not an implicit SELECT *. The catalog will not authorize an unbounded scan of mixed-classification tables.",
          action: function () {
            if (!global.GIDP) return;
            global.GIDP.setSpeed("fast");
            global.GIDP.setRole("analyst");
            global.GIDP.reset();
          },
        },
        {
          target: "[data-tour='templates']",
          title: "Load the vague prompt",
          body: "No approved dataset list, no grain, no PII handling. Exploratory dumps are a common way AI assistants leak confidential columns.",
          action: function () {
            if (global.GIDP) global.GIDP.applyTemplate("ambiguous");
          },
        },
        {
          target: "[data-tour='run']",
          title: "Compile — expect clarify",
          body: "Next runs the compiler. SQL will not be dispatched. The live banner will ask for a metric, grain, and privacy constraint.",
        },
        {
          target: "[data-tour='guardrails']",
          title: "Clarify, don't guess",
          body: "Identity, catalog, and tools return clarify. Guessing a dump would be the unsafe default. The user must narrow the intent and recompile.",
          action: function () {
            if (global.GIDP) return global.GIDP.compile();
          },
        },
        {
          target: "[data-tour='banner']",
          title: "Human loop before SQL",
          body: "This is cheaper than a breach: stop at planning. Rephrase as a regional aggregate with “do not include personal identifiers” and the path can allow.",
        },
      ],
    },
    {
      id: "pii-block",
      page: "lab",
      title: "Block a PII export",
      blurb: "Analyst asks for emails and SSNs. Catalog and identity fail. Restricted SSN cannot be overridden.",
      steps: [
        {
          target: "[data-tour='role']",
          title: "Analyst cannot export PII",
          body: "Confidential columns (name, email) are blocked for Analyst. Restricted (ssn) is blocked for everyone, including Admin break-glass.",
          action: function () {
            if (!global.GIDP) return;
            global.GIDP.setSpeed("fast");
            global.GIDP.setRole("analyst");
            global.GIDP.reset();
          },
        },
        {
          target: "[data-tour='catalog']",
          title: "Look at classification",
          body: "customers.email is pii. customers.ssn is restricted. A CSV dump of either is a catalog violation, not a SQL style issue.",
          action: function () {
            if (global.GIDP) global.GIDP.applyTemplate("pii-dump");
          },
        },
        {
          target: "[data-tour='prompt']",
          title: "Unauthorized intent",
          body: "The prompt asks to project identifiers and use a denied tool (raw CSV export). Both catalog authorization and the tool allowlist will fail.",
        },
        {
          target: "[data-tour='run']",
          title: "Compile — expect block",
          body: "Next dispatches the compiler. Watch identity, catalog, and tools go red. No warehouse session is opened.",
        },
        {
          target: "[data-tour='guardrails']",
          title: "Defense in depth",
          body: "If one check were skipped, another still fails. That is the point of stacking identity, injection, catalog, and tools instead of a single prompt filter.",
          action: function () {
            if (global.GIDP) return global.GIDP.compile();
          },
        },
        {
          target: "[data-tour='banner']",
          title: "Escalate, don't override locally",
          body: "Analysts can open human-in-the-loop review and escalate to a Data Engineer. They cannot self-approve a PII dump.",
        },
      ],
    },
    {
      id: "injection",
      page: "lab",
      title: "Stop prompt injection",
      blurb: "Override language (“ignore policies, bypass guardrails”) is never honored. HITL may only run a redacted substitute.",
      steps: [
        {
          target: "[data-tour='role']",
          title: "Injection is role-independent",
          body: "Switching to Admin does not make jailbreak text executable. Policy is not in the prompt; it is in the compiler and catalog.",
          action: function () {
            if (!global.GIDP) return;
            global.GIDP.setSpeed("fast");
            global.GIDP.setRole("analyst");
            global.GIDP.reset();
          },
        },
        {
          target: "[data-tour='templates']",
          title: "Hostile template",
          body: "Classic jailbreak pattern: ignore previous policies + export raw PII. The injection guardrail matches this signature before any SQL exists.",
          action: function () {
            if (global.GIDP) global.GIDP.applyTemplate("injection");
          },
        },
        {
          target: "[data-tour='run']",
          title: "Compile — intercept",
          body: "Next runs the compiler. The injection check fails closed. The original instructions are not translated into COPY, EXPORT, or SELECT of ssn.",
        },
        {
          target: "[data-tour='guardrails']",
          title: "Policy is not in the prompt",
          body: "A model that “tries to be helpful” might obey ignore-previous-instructions. This control plane never gives that model a chance to mutate the policy pack.",
          action: function () {
            if (global.GIDP) return global.GIDP.compile();
          },
        },
        {
          target: "[data-tour='audit']",
          title: "Hostile attempt is logged",
          body: "The block is an audit event. In production this is the ticket you want: who asked, what signature matched, and that no rows left the sandbox.",
        },
      ],
    },
    {
      id: "hitl",
      page: "lab",
      title: "Break-glass HITL",
      blurb: "Admin reviews a blocked request. Approval runs a substitute regional aggregate. SSN still never projects.",
      steps: [
        {
          target: "[data-tour='role']",
          title: "Assume Data Engineer",
          body: "Only Admin / DE may break-glass. Even then, HITL does not honor the blocked prompt — it dispatches the governed retention aggregate instead.",
          action: function () {
            if (!global.GIDP) return;
            global.GIDP.setSpeed("fast");
            global.GIDP.setRole("admin");
            global.GIDP.reset();
            global.GIDP.applyTemplate("pii-dump");
          },
        },
        {
          target: "[data-tour='prompt']",
          title: "Still a PII dump request",
          body: "The intent is unauthorized. Admin identity does not auto-allow confidential or restricted columns. Decision will be block, with HITL eligible.",
        },
        {
          target: "[data-tour='run']",
          title: "Compile the block",
          body: "Next compiles under Admin. Guardrails fail on catalog / tools. The banner offers human-in-the-loop review.",
        },
        {
          target: "[data-tour='banner']",
          title: "Review, don't replay",
          body: "Break-glass justification is required. The control plane will not SELECT email or ssn. It will substitute a de-identified regional report.",
          action: function () {
            if (global.GIDP) return global.GIDP.compile();
          },
        },
        {
          target: "[data-tour='hitl']",
          title: "Open HITL",
          body: "The modal is the paper's human gate. Restricted columns remain non-overridable. Next writes a justification and approves the substitute job.",
          action: function () {
            if (global.GIDP) global.GIDP.openHitl();
          },
        },
        {
          target: "[data-tour='results']",
          title: "Substitute artifact",
          body: "Approval closed the dump and published retention-by-region instead. Audit decision is allow_hitl. That is governed assistance: helpful, not obedient.",
          action: function () {
            var box = document.getElementById("hitl-justification");
            if (box) box.value = "Walkthrough: demonstrate substitute aggregate; SSN must stay stripped.";
            if (global.GIDP) return global.GIDP.approveHitl();
          },
        },
      ],
    },
    {
      id: "docs-guide",
      page: "docs",
      title: "How to read this knowledge base",
      blurb: "Step through the framework notes the way a new teammate would on day one.",
      steps: [
        {
          target: "[data-tour='docs-hero']",
          title: "Knowledge base",
          body: "These notes map the lab to the research framework: governed intent, defense-in-depth, in-browser execution, and audit/lineage.",
        },
        {
          target: "[data-tour='docs-arch']",
          title: "Architecture",
          body: "Four layers stay separate on purpose. Planning cannot be skipped; execution cannot see raw prompts; observability cannot be optional.",
        },
        {
          target: "[data-tour='docs-guard']",
          title: "Guardrails",
          body: "Identity, injection, catalog, and tools are independent verdicts (pass / fail / clarify). Fail-closed beats a single LLM classifier.",
        },
        {
          target: "[data-tour='docs-catalog']",
          title: "Classification",
          body: "restricted never leaves the sandbox. confidential PII needs HITL. internal facts are what Analysts aggregate. Join keys are not a back door to PII.",
        },
        {
          target: "[data-tour='docs-hitl']",
          title: "Human-in-the-loop",
          body: "HITL is not 'run the blocked SQL anyway.' It is authorization to run a safer substitute, with a written justification in the lineage log.",
        },
        {
          target: "[data-tour='docs-scenarios']",
          title: "Launch a lab scenario",
          body: "Cards below open the simulation with this same popup walker. Start with Approved retention path, then try injection and HITL.",
        },
      ],
    },
  ];

  const tourState = {
    id: null,
    index: 0,
    running: false,
    paintGen: 0,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function scenarioList() {
    return SCENARIOS.filter(function (s) {
      return s.page === PAGE;
    });
  }

  function findScenario(id) {
    for (var i = 0; i < SCENARIOS.length; i += 1) {
      if (SCENARIOS[i].id === id) return SCENARIOS[i];
    }
    return null;
  }

  function current() {
    var sc = findScenario(tourState.id);
    if (!sc) return null;
    return sc.steps[tourState.index];
  }

  function ensureChrome() {
    if ($("tour-root")) return;
    var root = document.createElement("div");
    root.id = "tour-root";
    root.innerHTML =
      '<div id="tour-spot" hidden></div>' +
      '<div id="tour-popup" role="dialog" aria-modal="true" aria-labelledby="tour-title" hidden>' +
      '<p class="tour-kicker" id="tour-kicker"></p>' +
      '<p class="tour-title" id="tour-title"></p>' +
      '<p class="tour-body" id="tour-body"></p>' +
      '<div class="tour-nav">' +
      '<button type="button" id="tour-back">Back</button>' +
      '<button type="button" class="primary" id="tour-next">Next</button>' +
      '<button type="button" id="tour-retry" hidden>Retry</button>' +
      '<button type="button" id="tour-skip">Skip</button>' +
      '<span class="tour-progress" id="tour-progress"></span>' +
      "</div></div>";
    document.body.appendChild(root);
    $("tour-back").addEventListener("click", function () {
      go(-1);
    });
    $("tour-next").addEventListener("click", function () {
      go(1);
    });
    $("tour-retry").addEventListener("click", function () {
      paint(true);
    });
    $("tour-skip").addEventListener("click", stop);
  }

  function findUsable(selector) {
    if (!selector) return null;
    var el = document.querySelector(selector);
    if (!el) return null;
    var node = el;
    while (node && node !== document.documentElement) {
      if (node.hidden) return null;
      if (node.classList && node.classList.contains("hidden")) return null;
      node = node.parentElement;
    }
    var st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    return el;
  }

  function waitForTarget(selector, ms) {
    ms = ms || 6000;
    return new Promise(function (resolve) {
      if (!selector) {
        resolve(null);
        return;
      }
      var hit = findUsable(selector);
      if (hit) {
        resolve(hit);
        return;
      }
      var t0 = Date.now();
      var id = setInterval(function () {
        var el = findUsable(selector);
        if (el || Date.now() - t0 > ms) {
          clearInterval(id);
          resolve(el);
        }
      }, 70);
    });
  }

  function syncThemeClass() {
    var light = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("light-tour", light);
  }

  function placePopup(target) {
    var spot = $("tour-spot");
    var popup = $("tour-popup");
    var pad = 8;
    if (!target) {
      spot.hidden = true;
      popup.style.top = "24px";
      popup.style.left = "24px";
      popup.hidden = false;
      return;
    }
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    var r = target.getBoundingClientRect();
    spot.hidden = false;
    spot.style.top = window.scrollY + r.top - pad + "px";
    spot.style.left = window.scrollX + r.left - pad + "px";
    spot.style.width = r.width + pad * 2 + "px";
    spot.style.height = r.height + pad * 2 + "px";

    popup.hidden = false;
    var pw = popup.offsetWidth || 360;
    var ph = popup.offsetHeight || 200;
    var top = r.bottom + 16;
    if (top + ph > window.innerHeight - 12) top = r.top - ph - 16;
    if (top < 12) top = 12;
    var left = r.left;
    if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
    if (left < 12) left = 12;
    popup.style.top = window.scrollY + top + "px";
    popup.style.left = window.scrollX + left + "px";
  }

  function paint(forceRetry) {
    var sc = findScenario(tourState.id);
    var step = current();
    if (!sc || !step) return;
    var gen = ++tourState.paintGen;
    syncThemeClass();
    $("tour-kicker").textContent = sc.title;
    $("tour-title").textContent = step.title;
    $("tour-body").textContent = step.body;
    $("tour-progress").textContent = tourState.index + 1 + " / " + sc.steps.length;
    $("tour-back").disabled = tourState.index === 0;
    $("tour-next").textContent = tourState.index === sc.steps.length - 1 ? "Finish" : "Next";
    var retryBtn = $("tour-retry");
    if (retryBtn) retryBtn.hidden = true;
    document.querySelectorAll(".tour-target-pulse").forEach(function (el) {
      el.classList.remove("tour-target-pulse");
    });
    $("tour-root").classList.add("is-on");

    var ready = step.target ? findUsable(step.target) : null;
    if (step.target && !ready) {
      $("tour-body").textContent = step.body + " Waiting for this panel to appear…";
      placePopup(null);
      waitForTarget(step.target, forceRetry ? 8000 : 6000).then(function (el) {
        if (gen !== tourState.paintGen || !tourState.running) return;
        if (!el) {
          $("tour-body").textContent = step.body + " Panel not ready — click Retry.";
          if (retryBtn) retryBtn.hidden = false;
          placePopup(document.querySelector(step.target));
          return;
        }
        $("tour-body").textContent = step.body;
        if (retryBtn) retryBtn.hidden = true;
        el.classList.add("tour-target-pulse");
        placePopup(el);
      });
      return;
    }

    if (ready) ready.classList.add("tour-target-pulse");
    placePopup(ready);
  }

  function go(delta) {
    var sc = findScenario(tourState.id);
    if (!sc) return;
    var next = tourState.index + delta;
    if (delta > 0 && tourState.index === sc.steps.length - 1) {
      stop();
      return;
    }
    if (next < 0 || next >= sc.steps.length) return;
    tourState.index = next;
    var step = sc.steps[next];
    var run = function () {
      paint();
    };
    if (delta > 0 && step && typeof step.action === "function") {
      $("tour-next").disabled = true;
      Promise.resolve(step.action())
        .catch(function (err) {
          console.warn("Walkthrough step action failed", err);
        })
        .then(function () {
          $("tour-next").disabled = false;
          requestAnimationFrame(function () {
            paint();
          });
        });
      return;
    }
    run();
  }

  function start(id) {
    var sc = findScenario(id);
    if (!sc) return;
    if (sc.page !== PAGE) {
      var href = sc.page === "lab" ? "index.html?tour=" + encodeURIComponent(id) : "docs.html?tour=" + encodeURIComponent(id);
      window.location.href = href;
      return;
    }
    ensureChrome();
    closeMenu();
    tourState.id = id;
    tourState.index = 0;
    tourState.running = true;
    var first = sc.steps[0];
    var after = function () {
      paint();
      window.addEventListener("resize", reposition);
      window.addEventListener("scroll", reposition, true);
    };
    if (first && typeof first.action === "function") {
      Promise.resolve(first.action()).finally(after);
    } else {
      after();
    }
  }

  function stop() {
    tourState.running = false;
    tourState.id = null;
    tourState.paintGen += 1;
    document.querySelectorAll(".tour-target-pulse").forEach(function (el) {
      el.classList.remove("tour-target-pulse");
    });
    var root = $("tour-root");
    if (root) root.classList.remove("is-on");
    if ($("tour-popup")) $("tour-popup").hidden = true;
    if ($("tour-spot")) $("tour-spot").hidden = true;
    window.removeEventListener("resize", reposition);
    window.removeEventListener("scroll", reposition, true);
  }

  function reposition() {
    if (!tourState.running) return;
    var step = current();
    if (!step) return;
    var el = step.target ? findUsable(step.target) : null;
    if (el) placePopup(el);
  }

  function closeMenu() {
    var menu = $("tour-menu");
    if (menu) menu.classList.add("hidden");
  }

  function fillMenu() {
    var menu = $("tour-menu");
    if (!menu) return;
    var list = scenarioList();
    if (!list.length) {
      menu.innerHTML = '<p class="px-3 py-2 text-xs text-slate-500">No walkthroughs on this page.</p>';
      return;
    }
    menu.innerHTML = list
      .map(function (s) {
        return (
          '<button type="button" class="scenario-card" data-scenario="' +
          s.id +
          '"><span class="block text-sm font-semibold">' +
          s.title +
          '</span><span class="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">' +
          s.blurb +
          "</span></button>"
        );
      })
      .join("");
    menu.querySelectorAll("[data-scenario]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        start(btn.getAttribute("data-scenario"));
      });
    });
  }

  function fillDocsLauncher() {
    var root = $("scenario-launchers");
    if (!root) return;
    var lab = SCENARIOS.filter(function (s) {
      return s.page === "lab";
    });
    root.innerHTML = lab
      .map(function (s) {
        return (
          '<button type="button" class="scenario-card rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 dark:border-white/10 dark:bg-ink-900" data-scenario="' +
          s.id +
          '"><p class="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">Lab walkthrough</p><p class="mt-1 font-semibold">' +
          s.title +
          '</p><p class="mt-1 text-xs leading-relaxed text-slate-500">' +
          s.blurb +
          "</p></button>"
        );
      })
      .join("");
    root.querySelectorAll("[data-scenario]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        start(btn.getAttribute("data-scenario"));
      });
    });
  }

  function bindChrome() {
    var btn = $("tour-menu-btn");
    var menu = $("tour-menu");
    if (btn && menu) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        fillMenu();
        menu.classList.toggle("hidden");
      });
      document.addEventListener("click", function (e) {
        if (!menu.classList.contains("hidden") && !menu.contains(e.target) && e.target !== btn) {
          closeMenu();
        }
      });
    }
    document.addEventListener("keydown", function (e) {
      if (!tourState.running) return;
      if (e.key === "Escape") stop();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
  }

  function bootTour() {
    ensureChrome();
    fillMenu();
    fillDocsLauncher();
    bindChrome();
    var params = new URLSearchParams(window.location.search);
    var id = params.get("tour");
    if (!id) return;
    var startWhenReady = function () {
      start(id);
    };
    if (PAGE === "lab") {
      if (global.GIDP && global.GIDP.ready) startWhenReady();
      else window.addEventListener("gidp-ready", startWhenReady, { once: true });
    } else {
      startWhenReady();
    }
  }

  global.GIDPTour = {
    scenarios: SCENARIOS,
    start: start,
    stop: stop,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootTour);
  } else {
    bootTour();
  }
})(window);
