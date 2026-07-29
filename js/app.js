/* RENOW Lab — engine ensina → lab → prova */
(function () {
  const SAVE_KEY = "renow-lab-v5";
  const XP_PER_LEVEL = 200;
  const tracks = window.RENOW_TRACKS;
  const Play = window.RENOW_PLAY;
  const trackOrder = window.RENOW_TRACK_ORDER || Object.keys(tracks || {});

  if (!tracks || !Play) {
    console.error("curriculum.js ou playgrounds.js não carregou");
    return;
  }

  const $ = (id) => document.getElementById(id);

  const state = {
    name: "",
    trackId: "fundamentos",
    tracks: {},
    missionId: null,
    stepIndex: 0,
    streak: 0,
    focus: false,
    draft: {}
  };

  function emptyProg() {
    return { xp: 0, completed: {}, stepDone: {}, badges: {}, checklists: {}, labs: {} };
  }

  function ensureTrack(id) {
    if (!state.tracks[id]) state.tracks[id] = emptyProg();
    return state.tracks[id];
  }

  function currentTrack() {
    return tracks[state.trackId];
  }

  function currentProgress() {
    return ensureTrack(state.trackId);
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      state.name = data.name || "";
      state.trackId = data.trackId && tracks[data.trackId] ? data.trackId : trackOrder[0] || "fundamentos";
      state.tracks = data.tracks || {};
      state.streak = data.streak || 0;
      state.focus = Boolean(data.focus);
      Object.keys(tracks).forEach((id) => ensureTrack(id));
      if (!tracks[state.trackId]) state.trackId = trackOrder[0] || Object.keys(tracks)[0];
      return Boolean(state.name);
    } catch {
      return false;
    }
  }

  function save() {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        name: state.name,
        trackId: state.trackId,
        tracks: state.tracks,
        streak: state.streak,
        focus: state.focus
      })
    );
  }

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 2800);
  }

  function confetti() {
    const el = $("confetti");
    el.classList.remove("hidden");
    clearTimeout(confetti._t);
    confetti._t = setTimeout(() => el.classList.add("hidden"), 900);
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
  }

  function levelFromXp(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }

  function missionIndex(track, missionId) {
    return track.missions.findIndex((m) => m.id === missionId);
  }

  function isMissionUnlocked(track, prog, idx) {
    if (idx === 0) return true;
    return Boolean(prog.completed[track.missions[idx - 1].id]);
  }

  function stepKey(missionId, stepIndex) {
    return missionId + "::" + stepIndex;
  }

  function markStepDone(missionId, stepIndex) {
    const prog = currentProgress();
    prog.stepDone[stepKey(missionId, stepIndex)] = true;
    save();
  }

  function isStepDone(missionId, stepIndex) {
    return Boolean(currentProgress().stepDone[stepKey(missionId, stepIndex)]);
  }

  function canLeaveStep(step, missionId, stepIndex) {
    if (!step) return true;
    if (step.type === "teach" || step.type === "video" || step.type === "reveal") return true;
    return isStepDone(missionId, stepIndex);
  }

  function applyFocus() {
    document.body.classList.toggle("focus-on", state.focus);
    const box = $("focus-mode");
    if (box) box.checked = state.focus;
  }

  function renderBoot() {
    const has = load();
    applyFocus();
    if (has) {
      $("player-name").value = state.name;
      $("btn-continue").classList.remove("hidden");
    }
  }

  function start(name, isContinue) {
    if (!isContinue) {
      const n = (name || "").trim();
      if (!n) {
        toast("Digite seu nome pra começar");
        return;
      }
      state.name = n;
      if (!load() || state.name !== n) {
        state.tracks = {};
        Object.keys(tracks).forEach((id) => ensureTrack(id));
      }
      state.name = n;
    }
    state.streak = (state.streak || 0) + (isContinue ? 0 : 1);
    save();
    renderMap();
    showScreen("screen-map");
  }

  function renderTrackTabs() {
    const nav = $("track-tabs");
    nav.innerHTML = "";
    const ids = trackOrder.filter((id) => tracks[id]).concat(Object.keys(tracks).filter((id) => !trackOrder.includes(id)));
    ids.forEach((id) => {
      const t = tracks[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "track-tab" + (t.id === state.trackId ? " active" : "");
      const done = Object.keys(ensureTrack(t.id).completed).length;
      btn.textContent = (t.short || t.name) + " (" + done + "/" + t.missions.length + ")";
      btn.title = t.name + " — " + t.missions.length + " aulas";
      btn.addEventListener("click", () => {
        state.trackId = t.id;
        save();
        renderMap();
      });
      nav.appendChild(btn);
    });
  }

  function renderMap() {
    const track = currentTrack();
    const prog = currentProgress();
    $("greet").textContent = state.name + ", bora estudar";
    $("stat-level").textContent = String(levelFromXp(prog.xp));
    $("stat-xp").textContent = String(prog.xp);
    $("stat-streak").textContent = String(state.streak || 0);
    const doneCount = track.missions.filter((m) => prog.completed[m.id]).length;
    $("stat-missions").textContent = doneCount + "/" + track.missions.length;
    $("xp-fill").style.width = (xpIntoLevel(prog.xp) / XP_PER_LEVEL) * 100 + "%";
    $("track-banner").innerHTML = track.banner;
    $("map-intro").textContent =
      "Trilha: " + track.name + " — ensina → você pratica → prova. Uma aula por vez.";

    renderTrackTabs();
    applyFocus();

    const grid = $("mission-grid");
    grid.innerHTML = "";
    track.missions.forEach((m, idx) => {
      const unlocked = isMissionUnlocked(track, prog, idx);
      const done = Boolean(prog.completed[m.id]);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mission-card " + (done ? "done" : unlocked ? "open" : "locked");
      btn.dataset.kind = m.kind || "teach";
      btn.disabled = !unlocked;
      btn.innerHTML =
        '<div class="num">Aula ' +
        (idx + 1) +
        "</div><h3>" +
        m.title +
        "</h3><p>" +
        m.blurb +
        '</p><span class="time-chip">~' +
        (m.minutes || 8) +
        " min</span><div class=\"status\">" +
        (done ? "Concluída" : unlocked ? "Disponível — entrar" : "Bloqueada") +
        "</div>";
      btn.addEventListener("click", () => openMission(m.id));
      grid.appendChild(btn);
    });
  }

  function xpIntoLevel(xp) {
    return xp % XP_PER_LEVEL;
  }

  function openMission(id) {
    state.missionId = id;
    state.stepIndex = 0;
    state.draft = {};
    renderMission();
    showScreen("screen-mission");
  }

  function currentMission() {
    return currentTrack().missions.find((m) => m.id === state.missionId);
  }

  function renderProgressDots(mission) {
    const wrap = $("lesson-progress");
    wrap.innerHTML = "";
    mission.steps.forEach((_, i) => {
      const d = document.createElement("i");
      if (i < state.stepIndex) d.className = "done";
      else if (i === state.stepIndex) d.className = "on";
      wrap.appendChild(d);
    });
  }

  function renderMission() {
    const mission = currentMission();
    if (!mission) return;
    const idx = missionIndex(currentTrack(), mission.id);
    $("mission-chapter").textContent = "Aula " + (idx + 1) + " · " + currentTrack().short;
    $("mission-title").textContent = mission.title;
    $("mission-xp").textContent = "+" + mission.xp;
    $("step-indicator").textContent = state.stepIndex + 1 + " / " + mission.steps.length;
    renderProgressDots(mission);
    renderStep(mission, mission.steps[state.stepIndex], state.stepIndex);

    $("btn-prev-step").disabled = state.stepIndex === 0;
    const step = mission.steps[state.stepIndex];
    const last = state.stepIndex >= mission.steps.length - 1;
    $("btn-next-step").textContent = last ? "Concluir aula" : "Continuar";
    $("btn-next-step").disabled = !canLeaveStep(step, mission.id, state.stepIndex);
  }

  function pillsFor(type) {
    if (type.startsWith("lab")) return '<span class="pill lab">Laboratório</span>';
    if (type === "quiz" || type === "order" || type === "fill") return '<span class="pill quiz">Prova</span>';
    if (type === "video") return '<span class="pill video">Vídeo</span>';
    return '<span class="pill teach">Explicação</span>';
  }

  function renderStep(mission, step, stepIndex) {
    const body = $("lesson-body");
    const key = stepKey(mission.id, stepIndex);
    body.innerHTML =
      '<div class="pill-row">' +
      pillsFor(step.type) +
      (isStepDone(mission.id, stepIndex) ? '<span class="pill" style="color:var(--ok);border-color:#2a6a3c">Feito ✓</span>' : "") +
      "</div><h3>" +
      step.title +
      "</h3>";

    if (step.type === "teach") {
      body.insertAdjacentHTML("beforeend", step.html);
      markStepDone(mission.id, stepIndex);
      $("btn-next-step").disabled = false;
      return;
    }

    if (step.type === "reveal") {
      const grid = document.createElement("div");
      grid.className = "reveal-grid";
      step.items.forEach((it) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "reveal-btn";
        b.innerHTML = "<strong>" + it.q + "</strong><div class=\"ans\">" + it.a + "</div>";
        b.addEventListener("click", () => b.classList.toggle("open"));
        grid.appendChild(b);
      });
      body.appendChild(grid);
      markStepDone(mission.id, stepIndex);
      $("btn-next-step").disabled = false;
      return;
    }

    if (step.type === "video") {
      body.insertAdjacentHTML(
        "beforeend",
        "<p class=\"muted\">" +
          (step.note || "") +
          "</p><div class=\"video-wrap\"><iframe src=\"https://www.youtube.com/embed/" +
          step.youtubeId +
          "?rel=0\" allowfullscreen allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\"></iframe></div><p class=\"muted\">" +
          (step.caption || "") +
          "</p><button type=\"button\" class=\"btn ghost\" id=\"skip-video\">Pular vídeo e continuar</button>"
      );
      body.querySelector("#skip-video").addEventListener("click", () => {
        markStepDone(mission.id, stepIndex);
        $("btn-next-step").disabled = false;
        toast("Pode seguir — vídeo é opcional");
      });
      markStepDone(mission.id, stepIndex);
      $("btn-next-step").disabled = false;
      return;
    }

    if (step.type === "checklist") {
      const ul = document.createElement("ul");
      ul.className = "checklist";
      const saved = currentProgress().checklists[key] || {};
      step.items.forEach((label, i) => {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = Boolean(saved[i]);
        const span = document.createElement("span");
        span.textContent = label;
        if (cb.checked) span.className = "done-text";
        const sync = () => {
          span.className = cb.checked ? "done-text" : "";
          const prog = currentProgress();
          prog.checklists[key] = prog.checklists[key] || {};
          prog.checklists[key][i] = cb.checked;
          const all = step.items.every((_, j) => prog.checklists[key][j]);
          if (all) {
            markStepDone(mission.id, stepIndex);
            $("btn-next-step").disabled = false;
            toast("Checklist completo!");
          }
          save();
        };
        cb.addEventListener("change", sync);
        li.addEventListener("click", (e) => {
          if (e.target !== cb) {
            cb.checked = !cb.checked;
            sync();
          }
        });
        li.appendChild(cb);
        li.appendChild(span);
        ul.appendChild(li);
      });
      body.appendChild(ul);
      body.insertAdjacentHTML(
        "beforeend",
        '<p class="muted">Marque o que você for fazendo de verdade. Pode concluir depois — mas a aula só libera com tudo marcado.</p>'
      );
      const all = step.items.every((_, j) => (currentProgress().checklists[key] || {})[j]);
      if (all) {
        markStepDone(mission.id, stepIndex);
        $("btn-next-step").disabled = false;
      } else $("btn-next-step").disabled = true;
      return;
    }

    if (step.type === "quiz") renderQuiz(body, mission, step, stepIndex);
    else if (step.type === "order") renderOrder(body, mission, step, stepIndex);
    else if (step.type === "lab-py") renderLabPy(body, mission, step, stepIndex);
    else if (step.type === "lab-js") renderLabJs(body, mission, step, stepIndex);
    else if (step.type === "lab-html") renderLabHtml(body, mission, step, stepIndex);
    else if (step.type === "lab-sql") renderLabSql(body, mission, step, stepIndex);
    else if (step.type === "lab-code") renderLabCode(body, mission, step, stepIndex);
    else {
      body.insertAdjacentHTML("beforeend", "<p>Tipo de passo desconhecido.</p>");
      markStepDone(mission.id, stepIndex);
    }
  }

  function renderLabCode(body, mission, step, stepIndex) {
    const wrap = labShell(body, step);
    wrap.insertAdjacentHTML(
      "beforeend",
      '<p class="muted">Escreva código <strong>' +
        (step.lang || "código") +
        "</strong> (validamos a sintaxe/peças-chave neste lab).</p>"
    );
    const ta = document.createElement("textarea");
    ta.className = "lab-editor";
    ta.value = step.starter || "";
    const bar = document.createElement("div");
    bar.className = "lab-toolbar";
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn run";
    run.textContent = "Validar código";
    run.addEventListener("click", () => {
      const codeOk = Play.codeLooksOk(ta.value, step.codeRules);
      if (codeOk) passLab(mission, stepIndex, wrap, "Sintaxe/peças ok! (rode no PC depois para executar de verdade)");
      else feedback(wrap, false, "Ainda faltam peças. Veja a dica e o exemplo da explicação.");
    });
    bar.appendChild(run);
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Lab já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function feedback(el, ok, msg) {
    let fb = el.querySelector(".feedback");
    if (!fb) {
      fb = document.createElement("div");
      fb.className = "feedback";
      el.appendChild(fb);
    }
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.textContent = msg;
  }

  function passLab(mission, stepIndex, wrap, msg) {
    markStepDone(mission.id, stepIndex);
    $("btn-next-step").disabled = false;
    feedback(wrap, true, msg || "Mandou bem! Pode continuar.");
    confetti();
    toast("+ progresso na aula");
  }

  function renderQuiz(body, mission, step, stepIndex) {
    const wrap = document.createElement("div");
    wrap.className = "quiz";
    wrap.innerHTML = '<div class="quiz-q">' + step.question + "</div>";
    const choices = document.createElement("div");
    choices.className = "choices";
    let locked = isStepDone(mission.id, stepIndex);
    step.choices.forEach((label, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = label;
      if (locked && i === step.answer) b.classList.add("correct");
      b.addEventListener("click", () => {
        if (isStepDone(mission.id, stepIndex)) return;
        if (i === step.answer) {
          b.classList.add("correct");
          passLab(mission, stepIndex, wrap, step.explain || "Acertou!");
        } else {
          b.classList.add("wrong");
          feedback(wrap, false, "Ainda não — releia a explicação acima e tente outra.");
        }
      });
      choices.appendChild(b);
    });
    wrap.appendChild(choices);
    body.appendChild(wrap);
    if (locked) {
      feedback(wrap, true, step.explain || "Já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function renderOrder(body, mission, step, stepIndex) {
    const wrap = document.createElement("div");
    wrap.innerHTML = "<p>" + step.prompt + "</p>";
    let order = (state.draft[stepKey(mission.id, stepIndex)] || step.items.map((_, i) => i)).slice();
    const list = document.createElement("ul");
    list.className = "order-list";

    function paint() {
      list.innerHTML = "";
      order.forEach((itemIdx, pos) => {
        const li = document.createElement("li");
        li.className = "order-item";
        const up = document.createElement("button");
        up.type = "button";
        up.textContent = "↑";
        up.disabled = pos === 0;
        up.addEventListener("click", () => {
          if (pos === 0) return;
          const t = order[pos - 1];
          order[pos - 1] = order[pos];
          order[pos] = t;
          state.draft[stepKey(mission.id, stepIndex)] = order.slice();
          paint();
        });
        const down = document.createElement("button");
        down.type = "button";
        down.textContent = "↓";
        down.disabled = pos === order.length - 1;
        down.addEventListener("click", () => {
          if (pos >= order.length - 1) return;
          const t = order[pos + 1];
          order[pos + 1] = order[pos];
          order[pos] = t;
          state.draft[stepKey(mission.id, stepIndex)] = order.slice();
          paint();
        });
        const span = document.createElement("span");
        span.textContent = pos + 1 + ". " + step.items[itemIdx];
        li.appendChild(up);
        li.appendChild(down);
        li.appendChild(span);
        list.appendChild(li);
      });
    }
    paint();
    wrap.appendChild(list);
    const check = document.createElement("button");
    check.type = "button";
    check.className = "btn run";
    check.textContent = "Conferir ordem";
    check.addEventListener("click", () => {
      const ok = order.every((v, i) => v === step.answer[i]);
      if (ok) passLab(mission, stepIndex, wrap, "Ordem correta!");
      else feedback(wrap, false, "Quase — reordene e confira de novo.");
    });
    wrap.appendChild(check);
    body.appendChild(wrap);
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function labShell(body, step) {
    const wrap = document.createElement("div");
    wrap.className = "lab";
    wrap.innerHTML =
      '<div class="goal-box"><span class="tag">Missão</span><div>' +
      step.goal +
      "</div></div>" +
      (step.hint ? '<div class="lab-hint">Dica: ' + step.hint + "</div>" : "");
    body.appendChild(wrap);
    return wrap;
  }

  function renderLabPy(body, mission, step, stepIndex) {
    const wrap = labShell(body, step);
    const ta = document.createElement("textarea");
    ta.className = "lab-editor";
    ta.value = step.starter || "";
    const out = document.createElement("div");
    out.className = "lab-out";
    out.textContent = "Aperte Rodar para ver o print aqui.";
    const bar = document.createElement("div");
    bar.className = "lab-toolbar";
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn run";
    run.textContent = "Rodar Python";
    run.addEventListener("click", async () => {
      out.textContent = "Rodando…";
      const res = await Play.runPython(ta.value, out);
      const codeOk = Play.codeLooksOk(ta.value, step.codeRules);
      const outOk = Play.matchesExpect(res.output, step.expect);
      if (res.ok && codeOk && outOk) passLab(mission, stepIndex, wrap, "Saída correta!");
      else if (!codeOk) feedback(wrap, false, "O código precisa usar o que a missão pediu. Veja a dica.");
      else feedback(wrap, false, "Rodou, mas a saída ainda não é a esperada. Ajuste e rode de novo.");
    });
    bar.appendChild(run);
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    wrap.appendChild(out);
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Lab já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function renderLabJs(body, mission, step, stepIndex) {
    const wrap = labShell(body, step);
    const ta = document.createElement("textarea");
    ta.className = "lab-editor";
    ta.value = step.starter || "";
    const out = document.createElement("div");
    out.className = "lab-out";
    out.textContent = "Aperte Rodar para ver o console aqui.";
    const bar = document.createElement("div");
    bar.className = "lab-toolbar";
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn run";
    run.textContent = "Rodar JavaScript";
    run.addEventListener("click", () => {
      const res = Play.runJs(ta.value, out);
      const codeOk = Play.codeLooksOk(ta.value, step.codeRules);
      const outOk = Play.matchesExpect(res.output, step.expect);
      if (res.ok && codeOk && outOk) passLab(mission, stepIndex, wrap, "Console ok!");
      else if (!codeOk) feedback(wrap, false, "Falta alguma peça no código (função, console.log…).");
      else feedback(wrap, false, "Saída diferente do pedido. Tente de novo.");
    });
    bar.appendChild(run);
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    wrap.appendChild(out);
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Lab já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function renderLabHtml(body, mission, step, stepIndex) {
    const wrap = labShell(body, step);
    const stage = document.createElement("div");
    stage.className = "lab-stage";

    const codeCol = document.createElement("div");
    codeCol.innerHTML = '<div class="lab-pane-label">Seu código</div>';
    const split = document.createElement("div");
    split.className = "lab-split";
    const html = document.createElement("textarea");
    html.className = "lab-editor";
    html.value = step.htmlStarter || "";
    html.setAttribute("aria-label", "HTML");
    html.placeholder = "HTML…";
    const css = document.createElement("textarea");
    css.className = "lab-editor";
    css.value = step.cssStarter || "";
    css.setAttribute("aria-label", "CSS");
    css.placeholder = "CSS…";
    split.appendChild(html);
    split.appendChild(css);
    codeCol.appendChild(split);

    const previewCol = document.createElement("div");
    previewCol.innerHTML = '<div class="lab-pane-label accent">Como fica o site</div>';
    const previewWrap = document.createElement("div");
    previewWrap.className = "lab-preview";
    const iframe = document.createElement("iframe");
    iframe.title = "Preview";
    previewWrap.appendChild(iframe);
    previewCol.appendChild(previewWrap);

    stage.appendChild(codeCol);
    stage.appendChild(previewCol);

    const bar = document.createElement("div");
    bar.className = "lab-toolbar";
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn run";
    run.textContent = "Atualizar preview";
    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "btn ok";
    checkBtn.textContent = "Validar missão";

    let t = null;
    function refresh() {
      Play.runHtmlCss(html.value, css.value, iframe);
    }
    function live() {
      clearTimeout(t);
      t = setTimeout(refresh, 280);
    }
    html.addEventListener("input", live);
    css.addEventListener("input", live);

    run.addEventListener("click", refresh);
    checkBtn.addEventListener("click", () => {
      refresh();
      const c = step.check || {};
      let ok = true;
      if (c.htmlMustInclude) {
        ok =
          ok &&
          (Array.isArray(c.htmlMustInclude) ? c.htmlMustInclude : [c.htmlMustInclude]).every((x) =>
            html.value.includes(x)
          );
      }
      if (c.cssMustMatch) {
        ok =
          ok &&
          (Array.isArray(c.cssMustMatch) ? c.cssMustMatch : [c.cssMustMatch]).every((x) =>
            new RegExp(x, "i").test(css.value)
          );
      }
      if (ok) passLab(mission, stepIndex, wrap, "Visual e código ok!");
      else feedback(wrap, false, "Ainda não bate com a missão. Olhe a dica e o preview.");
    });
    bar.appendChild(run);
    bar.appendChild(checkBtn);
    wrap.appendChild(bar);
    wrap.insertAdjacentHTML(
      "beforeend",
      '<p class="muted">Preview atualiza enquanto você digita. Logo: use &lt;img src="URL"&gt; e veja à direita.</p>'
    );
    wrap.appendChild(stage);
    refresh();
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Lab já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function renderLabSql(body, mission, step, stepIndex) {
    const wrap = labShell(body, step);
    const ta = document.createElement("textarea");
    ta.className = "lab-editor";
    ta.style.minHeight = "80px";
    ta.value = step.starter || "";
    const out = document.createElement("div");
    out.className = "lab-out";
    out.textContent = "Tabelas: " + Object.keys(step.tables || {}).join(", ");
    const bar = document.createElement("div");
    bar.className = "lab-toolbar";
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn run";
    run.textContent = "Rodar SQL";
    run.addEventListener("click", () => {
      const res = Play.runSql(ta.value, step.tables, out);
      if (!res.ok) {
        feedback(wrap, false, res.output);
        return;
      }
      let ok = true;
      if (step.expectRows != null) ok = ok && res.rows.length === step.expectRows;
      if (step.expectIncludes) ok = ok && res.output.includes(step.expectIncludes);
      if (ok) passLab(mission, stepIndex, wrap, "Consulta correta!");
      else feedback(wrap, false, "Resultado ainda não é o esperado. Ajuste o SELECT/WHERE.");
    });
    bar.appendChild(run);
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    wrap.appendChild(out);
    if (isStepDone(mission.id, stepIndex)) {
      feedback(wrap, true, "Lab já concluído.");
      $("btn-next-step").disabled = false;
    } else $("btn-next-step").disabled = true;
  }

  function completeMission() {
    const mission = currentMission();
    const prog = currentProgress();
    if (!prog.completed[mission.id]) {
      prog.completed[mission.id] = true;
      prog.xp += mission.xp;
      state.streak = (state.streak || 0) + 1;
      const unlockedNotes = unlockNotesForMission(mission.id);
      const track = currentTrack();
      const allDone = track.missions.every((m) => prog.completed[m.id]);
      if (allDone && track.badgeId) {
        prog.badges[track.badgeId] = true;
        toast("Trilha completa: " + track.badgeLabel);
      } else if (unlockedNotes.length) {
        toast("Aula ok! +" + mission.xp + " XP · caderno +" + unlockedNotes.length);
      } else {
        toast("Aula concluída! +" + mission.xp + " XP");
      }
      confetti();
      save();
    }
    renderMap();
    showScreen("screen-map");
  }

  function isMissionCompletedAnywhere(missionId) {
    return Object.values(state.tracks).some((p) => p && p.completed && p.completed[missionId]);
  }

  function unlockNotesForMission(missionId) {
    const notes = window.RENOW_NOTES || [];
    return notes.filter((n) => n.missionId === missionId);
  }

  function highlight(text, query) {
    if (!query) return text;
    try {
      const re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      return String(text).replace(re, "<mark>$1</mark>");
    } catch {
      return text;
    }
  }

  function renderNotebook(query) {
    const notes = window.RENOW_NOTES || [];
    const q = (query || "").trim().toLowerCase();
    const list = $("notes-list");
    const empty = $("notes-empty");
    list.innerHTML = "";

    const unlocked = notes.filter((n) => isMissionCompletedAnywhere(n.missionId));
    $("notes-count").textContent = String(unlocked.length);

    let shown = unlocked;
    if (q) {
      shown = unlocked.filter((n) => {
        const bag = [n.term, n.summary, n.how, n.example, n.tips, n.lang]
          .concat(n.aliases || [])
          .join(" ")
          .toLowerCase();
        return bag.includes(q);
      });
    }

    if (!unlocked.length) {
      empty.classList.remove("hidden");
      empty.textContent = "Nenhuma nota ainda. Conclua uma aula — o caderno anota sozinho.";
      return;
    }
    empty.classList.add("hidden");

    if (!shown.length) {
      empty.classList.remove("hidden");
      empty.textContent = 'Nada encontrado para "' + query + '". Tente: print, SELECT, CSS, Supabase…';
      return;
    }

    shown
      .slice()
      .sort((a, b) => a.term.localeCompare(b.term, "pt"))
      .forEach((n) => {
        const card = document.createElement("article");
        card.className = "note-card";
        card.innerHTML =
          "<header><h3>" +
          highlight(n.term, q) +
          '</h3><span class="note-meta">' +
          n.lang +
          "</span></header>" +
          '<p class="summary">' +
          highlight(n.summary, q) +
          "</p>" +
          '<div class="how-label">Como usar</div>' +
          '<div class="code">' +
          highlight(n.how, q) +
          "</div>" +
          '<div class="how-label">Exemplo</div>' +
          '<div class="code">' +
          highlight(n.example, q) +
          "</div>" +
          (n.tips ? '<p class="tips">' + highlight(n.tips, q) + "</p>" : "");
        list.appendChild(card);
      });
  }

  function openNotebook() {
    $("notes-query").value = "";
    renderNotebook("");
    showScreen("screen-notebook");
    setTimeout(() => $("notes-query").focus(), 50);
  }

  const LOGO_URL = "https://placehold.co/140x48/3dd6c6/062a28?text=RENOW";
  const SB_KEY = "renow-sandbox-v1";
  const SB_TEMPLATES = {
    blank: {
      html: "<!-- Página em branco: comece aqui -->\n<h1>Olá</h1>\n<p>Edite o HTML e veja o preview.</p>\n",
      css: "body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n  background: #f6f7f9;\n  color: #111;\n}\n",
      js: "// opcional\n"
    },
    hero: {
      html:
        "<header class=\"hero\">\n  <h1>Motores Renow</h1>\n  <p>Rebobinamento de motores elétricos</p>\n  <a class=\"cta\" href=\"#\">Pedir orçamento</a>\n</header>\n",
      css:
        "body { margin:0; font-family: system-ui, sans-serif; background:#0f1419; color:#eef3f8; }\n.hero { padding: 3rem 1.5rem; }\nh1 { font-size: 2.2rem; margin: 0 0 .5rem; }\n.cta { display:inline-block; margin-top:1rem; padding:.75rem 1.1rem; background:#3dd6c6; color:#062a28; text-decoration:none; border-radius:8px; font-weight:700; }\n",
      js: ""
    },
    logo: {
      html:
        "<header class=\"top\">\n  <img src=\"" +
        LOGO_URL +
        "\" alt=\"Logo Renow\" class=\"logo\" />\n  <nav>\n    <a href=\"#\">Home</a>\n    <a href=\"#\">Serviços</a>\n    <a href=\"#\">Contato</a>\n  </nav>\n</header>\n<main>\n  <h1>Onde fica o logo?</h1>\n  <p>Ele aparece no canto do header — mude o CSS e veja ao vivo.</p>\n</main>\n",
      css:
        "body { margin:0; font-family: system-ui, sans-serif; background:#faf7f0; color:#1c1a16; }\n.top { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.25rem; background:#fff; border-bottom:1px solid #ddd; }\n.logo { height:40px; width:auto; display:block; }\nnav { display:flex; gap:1rem; }\nnav a { color:#0b6e6a; text-decoration:none; font-weight:600; }\nmain { padding:1.5rem; }\n",
      js: ""
    }
  };

  function sandboxRefresh() {
    Play.runHtmlCss($("sb-html").value, $("sb-css").value, $("sb-iframe"), $("sb-js").value);
  }

  function sandboxSave() {
    try {
      localStorage.setItem(
        SB_KEY,
        JSON.stringify({
          html: $("sb-html").value,
          css: $("sb-css").value,
          js: $("sb-js").value
        })
      );
    } catch (_) {}
  }

  function loadSandboxTemplate(name) {
    const t = SB_TEMPLATES[name] || SB_TEMPLATES.blank;
    $("sb-html").value = t.html;
    $("sb-css").value = t.css;
    $("sb-js").value = t.js || "";
    sandboxSave();
    sandboxRefresh();
    toast("Modelo carregado");
  }

  function openSandbox() {
    let loaded = false;
    try {
      const raw = localStorage.getItem(SB_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.html != null) {
          $("sb-html").value = d.html;
          $("sb-css").value = d.css || "";
          $("sb-js").value = d.js || "";
          loaded = true;
        }
      }
    } catch (_) {}
    if (!loaded) loadSandboxTemplate("logo");
    else sandboxRefresh();
    showScreen("screen-sandbox");
  }

  function nextStep() {
    const mission = currentMission();
    const step = mission.steps[state.stepIndex];
    if (!canLeaveStep(step, mission.id, state.stepIndex)) {
      toast("Termine o laboratório ou a prova antes");
      return;
    }
    if (state.stepIndex >= mission.steps.length - 1) {
      completeMission();
      return;
    }
    state.stepIndex += 1;
    renderMission();
  }

  function prevStep() {
    if (state.stepIndex === 0) return;
    state.stepIndex -= 1;
    renderMission();
  }

  function renderBadges() {
    const list = $("badges-list");
    list.innerHTML = "";
    Object.values(tracks).forEach((t) => {
      if (!t.badgeId) return;
      const owned = Boolean(ensureTrack(t.id).badges[t.badgeId]);
      const row = document.createElement("div");
      row.className = "badge-row" + (owned ? "" : " locked");
      row.innerHTML =
        '<div class="badge-icon">' +
        (owned ? "OK" : "…") +
        "</div><div><strong>" +
        t.badgeLabel +
        "</strong><span>" +
        t.badgeDesc +
        " · " +
        t.name +
        "</span></div>";
      list.appendChild(row);
    });
  }

  // events
  $("btn-start").addEventListener("click", () => start($("player-name").value, false));
  $("btn-continue").addEventListener("click", () => start(state.name, true));
  $("player-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") start($("player-name").value, false);
  });
  $("btn-back-map").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("btn-next-step").addEventListener("click", nextStep);
  $("btn-prev-step").addEventListener("click", prevStep);
  $("btn-badges").addEventListener("click", () => {
    renderBadges();
    $("modal-badges").classList.remove("hidden");
  });
  $("btn-close-badges").addEventListener("click", () => $("modal-badges").classList.add("hidden"));
  $("btn-notebook").addEventListener("click", openNotebook);
  $("btn-sandbox").addEventListener("click", openSandbox);
  $("btn-back-from-sandbox").addEventListener("click", () => {
    sandboxSave();
    renderMap();
    showScreen("screen-map");
  });
  $("btn-sandbox-refresh").addEventListener("click", () => {
    sandboxRefresh();
    toast("Preview atualizado");
  });
  $("btn-copy-logo").addEventListener("click", async () => {
    const url = $("sb-logo-url").textContent;
    try {
      await navigator.clipboard.writeText(url);
      toast("URL do logo copiada");
    } catch (_) {
      toast(url);
    }
  });
  document.querySelectorAll(".sandbox-tpl").forEach((btn) => {
    btn.addEventListener("click", () => loadSandboxTemplate(btn.getAttribute("data-tpl")));
  });
  let sbTimer = null;
  ["sb-html", "sb-css", "sb-js"].forEach((id) => {
    $(id).addEventListener("input", () => {
      clearTimeout(sbTimer);
      sbTimer = setTimeout(() => {
        sandboxRefresh();
        sandboxSave();
      }, 280);
    });
  });
  $("btn-back-from-notes").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("notes-query").addEventListener("input", (e) => renderNotebook(e.target.value));
  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Zerar progresso só desta trilha?")) return;
    state.tracks[state.trackId] = emptyProg();
    save();
    renderMap();
    toast("Trilha zerada");
  });
  $("focus-mode").addEventListener("change", (e) => {
    state.focus = e.target.checked;
    applyFocus();
    save();
  });

  renderBoot();
})();
