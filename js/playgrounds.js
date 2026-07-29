/* Playgrounds interativos — Python (Skulpt), JS, HTML/CSS, SQL mini */
window.RENOW_PLAY = (function () {
  function normalize(s) {
    return String(s || "")
      .replace(/\r\n/g, "\n")
      .replace(/\s+$/gm, "")
      .trim();
  }

  function runPython(code, outEl) {
    return new Promise((resolve) => {
      if (typeof Sk === "undefined") {
        outEl.textContent = "Python ainda carregando… recarregue a página.";
        outEl.classList.add("err");
        resolve({ ok: false, output: "" });
        return;
      }
      let buffer = "";
      outEl.classList.remove("err");
      Sk.configure({
        output(text) { buffer += text; },
        read(x) {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
            throw "Arquivo não encontrado: '" + x + "'";
          }
          return Sk.builtinFiles["files"][x];
        }
      });
      Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))
        .then(() => {
          outEl.textContent = buffer || "(rodou, sem print)";
          resolve({ ok: true, output: buffer });
        })
        .catch((e) => {
          const msg = e.toString();
          outEl.textContent = msg;
          outEl.classList.add("err");
          resolve({ ok: false, output: msg });
        });
    });
  }

  function runJs(code, outEl) {
    const logs = [];
    const fakeConsole = {
      log: (...args) => logs.push(args.map(String).join(" ")),
      error: (...args) => logs.push("ERRO: " + args.map(String).join(" ")),
      warn: (...args) => logs.push("AVISO: " + args.map(String).join(" "))
    };
    outEl.classList.remove("err");
    try {
      const fn = new Function("console", code);
      const ret = fn(fakeConsole);
      if (ret !== undefined) logs.push(String(ret));
      const output = logs.join("\n");
      outEl.textContent = output || "(rodou, sem console.log)";
      return { ok: true, output };
    } catch (e) {
      outEl.textContent = e.message;
      outEl.classList.add("err");
      return { ok: false, output: e.message };
    }
  }

  function runHtmlCss(html, css, iframe, js) {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const jsBlock = js
      ? "<scr" + "ipt>" + String(js).replace(/<\/scr/gi, "<\\/scr") + "</scr" + "ipt>"
      : "";
    doc.open();
    doc.write(
      "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" +
        (css || "") +
        "</style></head><body>" +
        (html || "") +
        jsBlock +
        "</body></html>"
    );
    doc.close();
  }

  /* Mini SQL sobre tabela em memória — SELECT simples */
  function runSql(query, tables, outEl) {
    outEl.classList.remove("err");
    try {
      const q = query.trim().replace(/;+\s*$/, "");
      const m = q.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+))?$/i);
      if (!m) throw new Error("Use: SELECT colunas FROM tabela [WHERE col = valor]");
      const colsRaw = m[1].trim();
      const tableName = m[2].toLowerCase();
      const where = m[3];
      const table = tables[tableName];
      if (!table) throw new Error("Tabela desconhecida: " + tableName + ". Disponíveis: " + Object.keys(tables).join(", "));

      let rows = table.rows.slice();
      if (where) {
        const wm = where.match(/^(\w+)\s*=\s*(.+)$/i);
        if (!wm) throw new Error("WHERE simples: coluna = valor");
        const col = wm[1];
        let val = wm[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        } else if (!Number.isNaN(Number(val))) {
          val = Number(val);
        }
        rows = rows.filter((r) => String(r[col]) === String(val));
      }

      let cols;
      if (colsRaw === "*") cols = table.columns;
      else cols = colsRaw.split(",").map((c) => c.trim());

      const lines = [cols.join(" | ")];
      lines.push(cols.map(() => "---").join("-+-"));
      rows.forEach((r) => lines.push(cols.map((c) => (r[c] == null ? "NULL" : r[c])).join(" | ")));
      if (!rows.length) lines.push("(0 linhas)");
      const output = lines.join("\n");
      outEl.textContent = output;
      return { ok: true, output, rows, cols };
    } catch (e) {
      outEl.textContent = e.message;
      outEl.classList.add("err");
      return { ok: false, output: e.message };
    }
  }

  function matchesExpect(output, expect) {
    if (!expect) return true;
    const got = normalize(output);
    if (expect.equals != null) return got === normalize(expect.equals);
    if (expect.includes) {
      const needles = Array.isArray(expect.includes) ? expect.includes : [expect.includes];
      return needles.every((n) => got.toLowerCase().includes(String(n).toLowerCase()));
    }
    if (expect.regex) return new RegExp(expect.regex, "i").test(got);
    return true;
  }

  function codeLooksOk(code, rules) {
    if (!rules) return true;
    const c = code;
    if (rules.mustInclude) {
      const list = Array.isArray(rules.mustInclude) ? rules.mustInclude : [rules.mustInclude];
      if (!list.every((x) => c.includes(x))) return false;
    }
    if (rules.mustMatch) {
      const list = Array.isArray(rules.mustMatch) ? rules.mustMatch : [rules.mustMatch];
      if (!list.every((x) => new RegExp(x, "i").test(c))) return false;
    }
    return true;
  }

  return { runPython, runJs, runHtmlCss, runSql, matchesExpect, codeLooksOk, normalize };
})();
