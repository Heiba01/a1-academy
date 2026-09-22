/* A1 Dental Academy — shared site behaviors */
(function () {
  const LS_KEY = "a1_lang";
  let lang = localStorage.getItem(LS_KEY) || "en";
  if (!I18N[lang]) lang = "en";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const numDir = "ltr";

  function setLang(next) {
    lang = I18N[next] ? next : "en";
    localStorage.setItem(LS_KEY, lang);
    const doc = document.documentElement;
    doc.lang = lang;
    doc.dir = lang === "ar" ? "rtl" : "ltr";
    $$(".lang-switch button").forEach((b, i) => {
      b.classList.toggle("on", b.dataset.lang === lang);
    });
    document.title = lang === "ar" ? "أكاديمية A1 دنتال — طريقك إلى التميّز" : "A1 Dental Academy — Your Road to Excellence";
    applyI18n();
    populateCourseSelect();
    updateNumDir();
    renderCourses();
    renderDoctors();
    renderCompareText();
  }

  function updateNumDir() {
    $$("[data-num]").forEach((el) => {
      el.dir = numDir;
    });
  }

  function applyI18n() {
    const dict = I18N[lang];
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key] != null) el.textContent = dict[key];
    });
    $$("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      if (dict[key] != null) el.setAttribute(attr, dict[key]);
    });
    $$("[data-i18n-ph]").forEach((el) => {
      const key = el.dataset.i18nPh;
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const toggle = $(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
    }
    $$(".nav-links a").forEach((a) => {
      const page = a.dataset.page;
      if (page && document.body.dataset.page === page) {
        a.setAttribute("aria-current", "page");
      }
      a.addEventListener("click", () => document.body.classList.remove("nav-open"));
    });
  }

  /* ---------- Course cards ---------- */
  function cardHtml(c) {
    const t = c[lang] || c.en;
    const badges = c.badges
      .map((b) => `<span class="badge badge--${b}">${I18N[lang]["courses.filter" + (b === "offline" ? "Offline" : "Online")]}</span>`)
      .join("");
    return `
      <article class="course-card" data-mode="${c.mode}">
        <div class="thumb">
          <img src="${c.img}" alt="${t.name}" loading="lazy">
          <div class="badges">${badges}<span class="badge badge--blue">#${String(c.no).padStart(2, "0")}</span></div>
        </div>
        <div class="body">
          <span class="num">${t.tag}</span>
          <h3>${t.name}</h3>
          <p class="tag">${t.desc}</p>
          <ul style="margin:8px 0 12px;padding:0;list-style:none;font-size:.85rem;color:#5b6486;display:grid;gap:5px;">${t.inc.map((i) => `<li>• ${i}</li>`).join("")}</ul>
          <div class="card-cta">
            <a class="btn btn--outline card-link" href="contact.html?course=${c.id}">${I18N[lang]["courses.enroll"]} →</a>
          </div>
        </div>
      </article>`;
  }

  let currentFilter = new URLSearchParams(location.search).get("mode") || "all";
  if (!["all", "offline", "online"].includes(currentFilter)) currentFilter = "all";
  function renderCourses() {
    const grid = $("#courses-grid");
    if (!grid) return;
    const list = COURSES.filter((c) => currentFilter === "all" || c.mode === currentFilter);
    grid.innerHTML = list.map(cardHtml).join("");
    if (!list.length) {
      grid.innerHTML = `<p class="note">${lang === "ar" ? "لا توجد دورات في هذا التصنيف حاليًا." : "No courses in this category right now."}</p>`;
    }
  }

  function initFilters() {
    const bar = $(".filter-bar");
    if (!bar) return;
    $$(".filter-btn", bar).forEach((btn) => {
      if (btn.dataset.filter === currentFilter) {
        $$(".filter-btn", bar).forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
      }
      btn.addEventListener("click", () => {
        $$(".filter-btn", bar).forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        currentFilter = btn.dataset.filter;
        renderCourses();
      });
    });
  }

  /* ---------- Doctors ---------- */
  function renderDoctors() {
    const grid = $("#doctors-grid");
    if (!grid) return;
    grid.innerHTML = DOCTORS.map((d) => {
      const t = d[lang] || d.en;
      return `
        <div class="doc-card">
          <div class="avatar"><img src="${d.img}" alt="${t.name}" loading="lazy"></div>
          <h3>${t.name}</h3>
          <p>${t.role}</p>
        </div>`;
    }).join("");
  }

  /* ---------- Compare table text ---------- */
  function renderCompareText() {
    const table = $("#compare-table");
    if (!table) return;
    const dict = I18N[lang];
    table.querySelector("thead").innerHTML = `
      <tr><th>${dict["courses.cFeat"]}</th><th>${dict["courses.cOffline"]}</th><th>${dict["courses.cOnline"]}</th></tr>`;
    let rows = "";
    for (const i of [1, 2, 3, 5, 6]) {
      rows += `<tr><td>${dict["courses.r" + i]}</td><td class="ok">${dict["courses.r" + i + "o"]}</td><td>${dict["courses.r" + i + "n"]}</td></tr>`;
    }
    table.querySelector("tbody").innerHTML = rows;
  }

  /* ---------- Gallery lightbox ---------- */
  function initGallery() {
    const lb = $("#lightbox");
    if (!lb) return;
    const imgs = $$(".gallery a img");
    const show = (i) => {
      const src = imgs[i].src;
      $("#lb-img").src = src;
      $("#lb-img").alt = imgs[i].alt;
      current = i;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    let current = 0;
    imgs.forEach((img, i) => (img.closest("a").onclick = (e) => {
      e.preventDefault();
      show(i);
    }));
    $("#lb-close").addEventListener("click", () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    });
    $("#lb-prev").addEventListener("click", () => show((current - 1 + imgs.length) % imgs.length));
    $("#lb-next").addEventListener("click", () => show((current + 1) % imgs.length));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) {
        lb.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowLeft") show((current - 1 + imgs.length) % imgs.length);
      if (e.key === "ArrowRight") show((current + 1) % imgs.length);
    });
  }

  /* ---------- Contact form ---------- */
  function populateCourseSelect() {
    const sel = $("#f-course");
    if (!sel) return;
    const dict = I18N[lang];
    sel.innerHTML =
      `<option value="" disabled selected>${dict["contact.course0"]}</option>` +
      COURSES.map((c) => {
        const t = c[lang] || c.en;
        return `<option value="${c.id}">${c.no}. ${t.name}</option>`;
      }).join("") +
      `<option value="other">${dict["contact.courseAny"]}</option>`;
    const prefill = new URLSearchParams(location.search).get("course");
    if (prefill) {
      sel.value = COURSES.some((c) => c.id === prefill) ? prefill : sel.value;
    }
  }

  function initForm() {
    const form = $("#contact-form");
    if (!form) return;

    populateCourseSelect();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#form-msg");
      const name = $("#f-name").value.trim();
      const email = $("#f-email").value.trim();
      const text = $("#f-message").value.trim();
      const dict = I18N[lang];

if (!name || !email || !text) {
        msg.className = "form-msg err";
        msg.textContent = dict["contact.required"];
        return;
      }

      const submit = $("#f-submit");
      const original = submit.textContent;
      submit.textContent = dict["contact.sending"];
      submit.disabled = true;

      const endpoint = form.dataset.endpoint;
      const payload = {
        name,
        email,
        phone: $("#f-phone").value.trim(),
        course: (function () {
          const sel = $("#f-course");
          return sel ? sel.options[sel.selectedIndex].text : "";
        })(),
        mode: $("#f-mode").options[$("#f-mode").selectedIndex].text,
        message: text,
      };

      try {
        const action = endpoint || form.getAttribute("action");
        if (!action || !/^https?:\/\/formspree\.io/.test(action) || action.includes("YOUR_FORM_ID")) {
          throw new Error("no-endpoint");
        }
        const res = await fetch(action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("http");
        msg.className = "form-msg ok";
        msg.textContent = dict["contact.ok"];
        form.reset();
      } catch (err) {
        msg.className = "form-msg err";
        msg.textContent = dict["contact.err"];
      } finally {
        submit.textContent = original;
        submit.disabled = false;
      }
    });
  }

  /* ---------- Boot ---------- */
  function init() {
    initNav();
    renderCourses();
    initFilters();
    renderDoctors();
    renderCompareText();
    initGallery();
    initForm();
    $$(".lang-switch button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    setLang(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();