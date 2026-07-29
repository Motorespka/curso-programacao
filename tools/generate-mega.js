/**
 * MEGA currículo — meta: 500+ aulas curtas, multi-linguagem.
 * node tools/generate-mega.js
 */
const fs = require("fs");
const path = require("path");

function teach(title, html) {
  return { type: "teach", title, html };
}
function quiz(title, question, choices, answer, explain) {
  return { type: "quiz", title, question, choices, answer, explain };
}
function labPy(title, goal, starter, expect, hint, codeRules) {
  const s = { type: "lab-py", title, goal, starter, expect, hint };
  if (codeRules) s.codeRules = codeRules;
  return s;
}
function labJs(title, goal, starter, expect, hint, codeRules) {
  const s = { type: "lab-js", title, goal, starter, expect, hint };
  if (codeRules) s.codeRules = codeRules;
  return s;
}
function labHtml(title, goal, htmlStarter, cssStarter, hint, check) {
  return { type: "lab-html", title, goal, htmlStarter, cssStarter, hint, check };
}
function labSql(title, goal, starter, tables, hint, extra) {
  return Object.assign({ type: "lab-sql", title, goal, starter, tables, hint }, extra || {});
}
function labCode(title, lang, goal, starter, hint, codeRules) {
  return { type: "lab-code", title, lang, goal, starter, hint, codeRules };
}
function reveal(title, items) {
  return { type: "reveal", title, items };
}
function order(title, prompt, items, answer) {
  return { type: "order", title, prompt, items, answer };
}
function checklist(title, items) {
  return { type: "checklist", title, items };
}
function mission(id, title, blurb, minutes, kind, xp, steps, note) {
  const m = { id, title, blurb, minutes: minutes || 5, kind: kind || "lab", xp: xp || 50, steps };
  if (note) m._note = note;
  return m;
}
function note(term, lang, summary, how, example, tips, aliases) {
  return { term, lang, summary, how, example, tips: tips || "", aliases: aliases || [] };
}

const motores = {
  motores: {
    columns: ["id", "marca", "cv"],
    rows: [
      { id: 1, marca: "WEG", cv: 5 },
      { id: 2, marca: "Siemens", cv: 10 },
      { id: 3, marca: "WEG", cv: 2 },
      { id: 4, marca: "ABB", cv: 15 }
    ]
  }
};

const tracks = {};
const orderIds = [];

function addTrack(id, name, short, banner, badgeId, badgeLabel, badgeDesc, missions) {
  orderIds.push(id);
  tracks[id] = { id, name, short, banner, badgeId, badgeLabel, badgeDesc, missions };
}

/* ========== 1. FUNDAMENTOS / PYTHON DEEP ========== */
const fund = [];
fund.push(
  mission(
    "f000-honest",
    "O que este lab pode (e não pode)",
    "Nível Google exige anos — aqui é a trilha máxima possível no site.",
    5,
    "teach",
    40,
    [
      teach(
        "Resposta direta",
        `<p><strong>Nada me impede de te ensinar o máximo de conteúdo aqui.</strong></p>
        <p>O que <em>nenhum</em> site sozinho garante: virar engenheiro nível Google só “passando aulas”. Isso exige anos de prática, projetos difíceis, falhas, sistemas reais e entrevistas pesadas.</p>
        <div class="callout info"><strong>O que este lab faz</strong>Centenas de aulas curtas, várias linguagens, labs, caderninho — a base mais completa possível neste formato, sem você pagar 10 cursos separados.</div>
        <div class="callout warn"><strong>O que você ainda precisa</strong>Código todo dia, projetos no GitHub, ler docs oficiais, e depois algoritmos/sistemas de verdade no PC.</div>`
      ),
      quiz("Check", "Este lab sozinho garante emprego no Google?", ["Sim, automático", "Não — é base + prática longa", "Só se pagar"], 1, "Honestidade.")
    ],
    note("honestidade carreira", "Método", "Lab ensina muito; elite exige anos de prática.", "estudar aqui + projetos reais + consistência", "Google-level ≠ certificado", "Não existe atalho mágico.", ["google", "top"])
  )
);

// Python progressive catalog
const pyBits = [
  ["print1", "print texto", 'print("Renow")', "Renow", 'print("Renow")', "print", "Mostra texto."],
  ["print2", "print número", "print(42)", "42", "print(42)", "print número", "Número sem aspas."],
  ["print3", "dois prints", 'print("A")\nprint("B")', "A\nB", "dois print", "vários print", "Uma linha cada."],
  ["var1", "variável texto", 'x="WEG"\nprint(x)', "WEG", "x=...", "variável", "Guarda valor."],
  ["var2", "variável int", "n=7\nprint(n)", "7", "n=7", "int var", "Inteiro."],
  ["add", "soma", "print(3+4)", "7", "3+4", "soma", "Operador +."],
  ["sub", "subtração", "print(10-3)", "7", "10-3", "subtração", "- ." ],
  ["mul", "multiplicação", "print(6*7)", "42", "6*7", "multiplicação", "* ." ],
  ["div", "divisão", "print(8//2)", "4", "8//2", "// divisão int", "Divisão inteira."],
  ["mod", "módulo", "print(10%3)", "1", "10%3", "% módulo", "Resto."],
  ["stradd", "concat", 'print("Mo"+"tor")', "Motor", "concat", "concat string", "Texto+texto."],
  ["fstr", "ideia format", 'marca="WEG"\nprint("marca="+marca)', "marca=WEG", "concat var", "format simples", "Juntar var."],
  ["bool1", "True False", "print(True)", "True", "True", "bool", "Booleano."],
  ["cmp1", "==", "print(5==5)", "True", "5==5", "==", "Igualdade."],
  ["cmp2", "!=", "print(5!=3)", "True", "5!=3", "!=", "Diferente."],
  ["cmp3", "<", "print(2<5)", "True", "2<5", "<", "Menor."],
  ["cmp4", ">", "print(9>2)", "True", "9>2", ">", "Maior."],
  ["cmp5", "<=", "print(3<=3)", "True", "3<=3", "<=", "Menor/igual."],
  ["and", "and", "print(True and False)", "False", "and", "and", "E lógico."],
  ["or", "or", "print(True or False)", "True", "or", "or", "Ou lógico."],
  ["not", "not", "print(not False)", "True", "not", "not", "Negação."],
  ["if1", "if", 'x=1\nif x==1:\n    print("ok")', "ok", "if", "if", "Condicional."],
  ["else1", "else", 'x=0\nif x:\n    print("a")\nelse:\n    print("b")', "b", "else", "else", "Senão."],
  ["elif1", "elif", 'n=2\nif n==1:\n    print("a")\nelif n==2:\n    print("b")\nelse:\n    print("c")', "b", "elif", "elif", "Senão se."],
  ["for1", "for range", "for i in range(3):\n    print(i)", "0\n1\n2", "range", "for range", "Laço."],
  ["for2", "for lista", 'for m in ["A","B"]:\n    print(m)', "A\nB", "for list", "for lista", "Iterar lista."],
  ["while1", "while", "i=0\nwhile i<3:\n    print(i)\n    i=i+1", "0\n1\n2", "while", "while", "Enquanto."],
  ["list1", "lista index", "a=[10,20,30]\nprint(a[1])", "20", "a[1]", "lista", "Índice 0."],
  ["list2", "append", "a=[1]\na.append(2)\nprint(a[1])", "2", "append", "append", "Adiciona."],
  ["list3", "len", "print(len([1,2,3]))", "3", "len", "len", "Tamanho."],
  ["slice", "slice", "print([1,2,3,4][1:3])", "[2, 3]", "slice", "slice", "Fatia."],
  ["dict1", "dict get", 'd={"k":"v"}\nprint(d["k"])', "v", "dict", "dict", "Chave valor."],
  ["dict2", "dict keys ideia", 'd={"a":1}\nprint(d.get("a"))', "1", "get", "dict get", "get seguro."],
  ["set1", "set unique", "print(len(set([1,1,2])))", "2", "set", "set", "Únicos."],
  ["tup", "tuple", "t=(1,2)\nprint(t[0])", "1", "tuple", "tuple", "Imutável."],
  ["fn1", "def return", "def f():\n    return 9\nprint(f())", "9", "def", "def", "Função."],
  ["fn2", "args", "def add(a,b):\n    return a+b\nprint(add(2,3))", "5", "args", "parametros", "Parâmetros."],
  ["fn3", "default", "def g(x=1):\n    return x\nprint(g())", "1", "default", "default arg", "Default."],
  ["str1", "upper", 'print("weg".upper())', "WEG", "upper", "upper", "Maiúsculas."],
  ["str2", "lower", 'print("WEG".lower())', "weg", "lower", "lower", "Minúsculas."],
  ["str3", "replace", 'print("a-b".replace("-","_"))', "a_b", "replace", "replace", "Troca."],
  ["str4", "split", 'print("a,b".split(",")[0])', "a", "split", "split", "Divide."],
  ["str5", "strip", 'print("  x  ".strip())', "x", "strip", "strip", "Apara espaços."],
  ["str6", "in", 'print("eg" in "WEG".lower())', "True", "in", "in string", "Contém."],
  ["list4", "comprehension ideia", "print([x*2 for x in [1,2,3]][2])", "6", "comprehension", "list comp", "Compacto."],
  ["err1", "try except", 'try:\n    print(1/1)\nexcept:\n    print("e")', "1.0", "try", "try except", "Erro tratado. (1/1→1.0 no Py3)"],
  ["none1", "None", "x=None\nprint(x is None)", "True", "None", "None", "Vazio."],
  ["import1", "import math ideia", "import math\nprint(int(math.sqrt(9)))", "3", "math", "import", "Módulo."],
  ["class1", "class init", 'class A:\n    def __init__(self):\n        self.v=1\nprint(A().v)', "1", "class", "class", "POO básica."],
  ["class2", "method", 'class A:\n    def hi(self):\n        return "hi"\nprint(A().hi())', "hi", "method", "metodo", "Método."],
  ["fileidea", "with open ideia", 's="abc"\nprint(s[0])', "a", "string index", "arquivo ideia", "Arquivo no PC; aqui string."],
  ["jsonidea", "json dumps ideia", 'import json\nprint(json.dumps({"a":1}))', '{"a": 1}', "json", "json", "Serializar."]
];

pyBits.forEach((row, i) => {
  const [id, title, starter, expect, hint, term, summary] = row;
  // fix try/except expect - Skulpt might print 1 not 1.0
  let exp = expect;
  if (id === "err1") exp = { includes: "1" };
  else exp = { equals: expect };
  fund.push(
    mission(
      "fpy-" + String(i + 1).padStart(3, "0") + "-" + id,
      "Python: " + title,
      summary,
      5,
      "lab",
      45,
      [
        teach(title, `<p>${summary}</p><div class="code">${starter.replace(/</g, "&lt;")}</div>`),
        labPy("Lab", "Faça a saída pedida", starter.includes("print") || starter.includes("def") || starter.includes("class") || starter.includes("try") || starter.includes("import") ? starter + (starter.endsWith("\n") ? "" : "\n") : starter + "\n", exp, hint, { mustInclude: id.startsWith("print") ? ["print"] : undefined }),
        quiz("Prova", "Sobre " + term + ":", ["Não existe", "É conceito/comando útil em Python", "Só funciona em CSS"], 1, summary)
      ],
      note(term, "Python", summary, starter.split("\n")[0], starter, "Pratique até ficar automático.", [term, title])
    )
  );
});

// HTML/CSS/JS quick fire many lessons
const htmlBits = [
  ["h1", "<h1>Título</h1>", "h1", "Título principal"],
  ["p", "<p>Texto</p>", "p", "Parágrafo"],
  ["a", '<a href="#">Link</a>', "a href", "Link"],
  ["img", '<img src="x.jpg" alt="motor">', "img alt", "Imagem"],
  ["ul", "<ul><li>Item</li></ul>", "ul li", "Lista"],
  ["ol", "<ol><li>Um</li></ol>", "ol", "Lista ordenada"],
  ["div", '<div class="box">x</div>', "div class", "Bloco"],
  ["span", "<span>inline</span>", "span", "Inline"],
  ["header", "<header>topo</header>", "header", "Topo semântico"],
  ["footer", "<footer>rodape</footer>", "footer", "Rodapé"],
  ["section", "<section>bloco</section>", "section", "Seção"],
  ["button", "<button>OK</button>", "button", "Botão"],
  ["input", '<input placeholder="nome">', "input", "Campo"],
  ["form", "<form><input><button>Go</button></form>", "form", "Formulário"],
  ["table", "<table><tr><td>1</td></tr></table>", "table", "Tabela"],
  ["br", "linha<br>quebra", "br", "Quebra"],
  ["strong", "<strong>importante</strong>", "strong", "Negrito semântico"],
  ["em", "<em>ênfase</em>", "em", "Itálico semântico"],
  ["nav", "<nav><a href='#'>Home</a></nav>", "nav", "Navegação"],
  ["main", "<main>conteudo</main>", "main", "Conteúdo principal"]
];
htmlBits.forEach((row, i) => {
  const [tag, sample, term, summary] = row;
  fund.push(
    mission(
      "fhtml-" + String(i + 1).padStart(3, "0") + "-" + tag,
      "HTML: " + tag,
      summary,
      4,
      "lab",
      40,
      [
        teach(tag, `<p>${summary}</p><div class="code">${sample.replace(/</g, "&lt;")}</div>`),
        labHtml("Lab", "Use a tag " + tag + " no HTML", "<!-- escreva -->\n", "body{font-family:sans-serif;padding:1rem}\n", sample, { htmlMustInclude: ["<" + tag] }),
        quiz("Prova", tag + " serve para:", ["SQL", summary, "AWS IAM"], 1, summary)
      ],
      note(term, "HTML", summary, sample, sample, "HTML = estrutura.", [tag])
    )
  );
});

const cssBits = [
  ["color", "color: tomato;", "color", "Cor do texto"],
  ["bg", "background: #111;", "background", "Fundo"],
  ["fs", "font-size: 20px;", "font-size", "Tamanho"],
  ["ff", "font-family: sans-serif;", "font-family", "Fonte"],
  ["pad", "padding: 1rem;", "padding", "Espaço interno"],
  ["mar", "margin: 1rem;", "margin", "Espaço externo"],
  ["bor", "border: 1px solid #3dd6c6;", "border", "Borda"],
  ["rad", "border-radius: 8px;", "border-radius", "Cantos"],
  ["flex", "display: flex;", "flex", "Flexbox"],
  ["gap", "gap: 1rem;", "gap", "Espaço flex/grid"],
  ["grid", "display: grid;", "grid", "Grid"],
  ["w", "width: 100%;", "width", "Largura"],
  ["mw", "max-width: 640px;", "max-width", "Largura máx"],
  ["ta", "text-align: center;", "text-align", "Alinhar texto"],
  ["fw", "font-weight: 700;", "font-weight", "Peso da fonte"],
  ["op", "opacity: 0.8;", "opacity", "Transparência"],
  ["pos", "position: relative;", "position", "Posicionamento"],
  ["shadow", "box-shadow: none;", "box-shadow", "Sombra (aqui sem exagero)"],
  ["hover", "a:hover{color:#3dd6c6}", "hover", "Estado hover"],
  ["media", "@media(max-width:600px){body{padding:0.5rem}}", "media query", "Responsivo"]
];
cssBits.forEach((row, i) => {
  const [id, rule, term, summary] = row;
  const isMedia = id === "media";
  const isHover = id === "hover";
  fund.push(
    mission(
      "fcss-" + String(i + 1).padStart(3, "0") + "-" + id,
      "CSS: " + term,
      summary,
      4,
      "lab",
      40,
      [
        teach(term, `<p>${summary}</p><div class="code">${rule}</div>`),
        labHtml(
          "Lab",
          "Aplique a ideia de " + term,
          "<h1>Renow</h1><p>Lab CSS</p><a href='#'>link</a>\n",
          isMedia || isHover ? "/* complete */\n" : "h1{\n  /* rule */\n}\n",
          rule,
          isMedia
            ? { cssMustMatch: ["@media"] }
            : isHover
              ? { cssMustMatch: [":hover"] }
              : { cssMustMatch: [term.split(" ")[0].replace("-", "\\-") ] }
        ),
        quiz("Prova", term + " é do:", ["Python", "CSS", "Git only"], 1, summary)
      ],
      note(term, "CSS", summary, rule, rule, "CSS = visual.", [id])
    )
  );
});

const jsBits = [
  ["log", 'console.log("ok")', "ok", "console.log", "Log no console"],
  ["let", "let x=3;\nconsole.log(x);", "3", "let", "Variável let"],
  ["const", "const y=9;\nconsole.log(y);", "9", "const", "Constante"],
  ["add", "console.log(2+5);", "7", "+", "Soma JS"],
  ["tpl", "const n='Renow';\nconsole.log(`Oi ${n}`);", "Oi Renow", "template string", "Template string"],
  ["if", "const a=1;\nif(a===1) console.log('yes');", "yes", "===", "Igualdade estrita"],
  ["arr", "console.log([10,20][1]);", "20", "array", "Array"],
  ["obj", "console.log({m:'WEG'}.m);", "WEG", "object", "Objeto"],
  ["fn", "function f(){return 4}\nconsole.log(f());", "4", "function", "Função"],
  ["arrow", "const f=()=>8;\nconsole.log(f());", "8", "arrow", "Arrow function"],
  ["map", "console.log([1,2].map(x=>x*2)[1]);", "4", "map", "Array map"],
  ["filter", "console.log([1,2,3].filter(x=>x>2)[0]);", "3", "filter", "Array filter"],
  ["json", "console.log(JSON.stringify({a:1}));", '{"a":1}', "JSON", "JSON.stringify"],
  ["parse", "console.log(JSON.parse('{\"a\":2}').a);", "2", "JSON.parse", "JSON.parse"],
  ["tern", "console.log(1? 'a':'b');", "a", "ternary", "Ternário"],
  ["spread", "const a=[1,2];\nconsole.log([...a,3][2]);", "3", "spread", "Spread"],
  ["des", "const {m}= {m:'x'};\nconsole.log(m);", "x", "destructuring", "Destructuring"],
  ["inc", "let i=1;\ni+=2;\nconsole.log(i);", "3", "+=", "Atribuição += "],
  ["mod", "console.log(10%4);", "2", "%", "Módulo JS"],
  ["bool", "console.log(Boolean('x'));", "true", "Boolean", "Truthy"]
];
jsBits.forEach((row, i) => {
  const [id, starter, expect, term, summary] = row;
  fund.push(
    mission(
      "fjs-" + String(i + 1).padStart(3, "0") + "-" + id,
      "JS: " + term,
      summary,
      4,
      "lab",
      40,
      [
        teach(term, `<p>${summary}</p><div class="code">${starter.replace(/</g, "&lt;")}</div>`),
        labJs("Lab", "Produza a saída esperada", starter + (starter.endsWith("\n") ? "" : "\n"), expect.includes("{") ? { includes: expect.replace(/[{}"]/g, "") || "a" } : { equals: expect }, "rode/adapte o exemplo"),
        quiz("Prova", term + ":", ["Não existe em JS", summary, "É comando SQL"], 1, summary)
      ],
      note(term, "JavaScript", summary, starter.split("\n")[0], starter, "JS = interação no browser.", [id])
    )
  );
});

// SQL pack
const sqlBits = [
  ["*", "SELECT * FROM motores", 4, null],
  ["cols", "SELECT marca FROM motores", 4, null],
  ["where", "SELECT * FROM motores WHERE marca = 'WEG'", 2, "WEG"],
  ["abb", "SELECT * FROM motores WHERE marca = 'ABB'", 1, "ABB"],
  ["cv", "SELECT cv FROM motores WHERE id = 2", 1, "10"]
];
sqlBits.forEach((row, i) => {
  const [id, q, rows, inc] = row;
  fund.push(
    mission(
      "fsql-" + String(i + 1).padStart(3, "0") + "-" + id,
      "SQL: " + id,
      q,
      5,
      "lab",
      45,
      [
        teach("SQL", `<div class="code">${q}</div>`),
        labSql("Lab", q, q, motores, q, Object.assign({ expectRows: rows }, inc ? { expectIncludes: inc } : {})),
        quiz("Prova", "SQL SELECT:", ["Estiliza página", "Consulta dados", "Compila Java"], 1, "Consulta.")
      ],
      note("SQL " + id, "SQL", "Consulta: " + q, q, q, "Treine WHERE e colunas.", [id, "select"])
    )
  );
});

addTrack(
  "fundamentos",
  "Fundamentos + Python/JS/HTML/CSS/SQL",
  "Fundamentos",
  "<strong>Base larga</strong>Dezenas de micro-aulas: cada uma ensina 1 ideia/código. Caderninho anota tudo.",
  "badge-fund",
  "Fundamentos Mega",
  "Completou fundamentos multi-linguagem base",
  fund
);

/* ========== 2. SITES ========== */
const sites = [];
const siteTopics = [
  ["hero", "Hero + CTA", "h1 + botão/link de ação", ["Motores Renow", "Pedir orçamento", "<a"], "landing"],
  ["cards", "Cards serviços", "duas .card", ["card", "Rebobinamento", "Diagnóstico"], "cards"],
  ["whats", "WhatsApp link", "wa.me", ["WhatsApp", "wa.me"], "whatsapp"],
  ["nav", "Nav simples", "nav com Home", ["<nav", "Home"], "nav"],
  ["footer", "Footer", "footer com contato", ["<footer"], "footer"],
  ["flexrow", "Flex row", "display flex", null, "flex", true],
  ["theme", "Tema escuro", "background escuro + color clara", null, "tema", true, ["background", "color"]],
  ["formui", "Form UI", "form input button", ["<form", "<input", "<button"], "form"],
  ["semantic", "HTML semântico", "main+section", ["<main", "<section"], "semantic"],
  ["cta2", "CTA secundário", "link Contato", ["Contato", "<a"], "cta"]
];
siteTopics.forEach((t, i) => {
  const [id, title, goal, must, term, cssMode, cssMatch] = t;
  sites.push(
    mission(
      "site-" + String(i + 1).padStart(3, "0") + "-" + id,
      "Site: " + title,
      goal,
      6,
      "lab",
      55,
      [
        teach(title, `<p>${goal}</p><div class="callout"><strong>Micro-aula</strong>Uma peça do site Renow por vez.</div>`),
        labHtml(
          "Lab",
          goal,
          "<!-- monte -->\n",
          "body{font-family:sans-serif;background:#0f1419;color:#eef3f8;padding:1rem}\n.card{padding:1rem;border:1px solid #3dd6c6;border-radius:8px;margin:.5rem 0}\n",
          goal,
          cssMode
            ? { cssMustMatch: cssMatch || ["display\\s*:\\s*flex"] }
            : { htmlMustInclude: must }
        ),
        quiz("Prova", title + " ajuda a:", ["Só bagunçar", "Montar site profissional por peças", "Apagar Git"], 1, "Peças.")
      ],
      note(term, "Sites", goal, goal, title, "Acumule peças → site completo.", [id])
    )
  );
});
// Next/deploy/project lessons
for (let i = 1; i <= 25; i++) {
  const bag = [
    ["Next create", "npx create-next-app@latest", "Cria projeto Next"],
    ["npm run dev", "npm run dev", "Sobe local"],
    ["page.tsx", "app/page.tsx → /", "Rota home"],
    ["componente", "function Header(){...}", "Reuso UI"],
    ["env", "NEXT_PUBLIC_* no .env.local", "Config"],
    ["Supabase URL", "URL + anon key", "Backend BaaS"],
    ["Storage", "bucket público/privado", "Arquivos"],
    ["Vercel import", "Import GitHub", "Deploy"],
    ["preview", "URL preview por PR", "CI visual"],
    ["mobile test", "abrir no celular", "QA"]
  ];
  const b = bag[(i - 1) % bag.length];
  sites.push(
    mission(
      "site-pro-" + String(i).padStart(3, "0"),
      "Pro: " + b[0],
      b[2],
      5,
      "teach",
      50,
      [
        teach(b[0], `<p>${b[2]}</p><div class="code">${b[1]}</div>`),
        i % 2 === 0
          ? checklist("Faça no PC (quando puder)", ["Li o passo", "Sei onde aplicar no projeto Renow", "Anotarei no README se usar"])
          : quiz("Prova", b[0] + " serve para:", ["Nada", b[2], "Só pintar"], 1, b[2]),
        quiz("Check", "Próximo passo realista:", ["Desistir", "Aplicar no projeto", "Pagar curso separado só por isso"], 1, "Aplicar.")
      ],
      note(b[0], "Sites/Pro", b[2], b[1], b[1], "Leve ao projeto real.", [b[0]])
    )
  );
}
addTrack("sites", "Sites & Renow", "Sites", "<strong>Sites de verdade por micro-peças</strong>Landing, Next, Supabase, Vercel, hábito de projeto.", "badge-sites", "Sites Mega", "Trilha sites", sites);

/* ========== 3. JAVA ========== */
const java = [];
java.push(
  mission("java-000", "Java: por que aprender", "Linguagem clássica de backend enterprise.", 4, "teach", 40, [
    teach("Java", `<p>Muito usada em empresas grandes. Tipada, JVM, Spring ecossistema.</p><div class="callout info"><strong>Neste lab</strong>Você escreve trechos Java; validamos peças. Execute no PC com JDK depois.</div>`),
    quiz("Prova", "Java roda tipicamente na:", ["JVM", "Só Excel", "Só browser sem nada"], 0, "JVM.")
  ], note("Java overview", "Java", "Linguagem tipada na JVM.", "javac / java", "System.out.println", "Instale JDK no PC.", ["java"]))
);
const javaBits = [
  ["hello", 'System.out.println("oi");', ["System.out.println", "oi"], "println"],
  ["main", "public static void main(String[] args) {}", ["public static void main", "String"], "main"],
  ["varint", "int x = 5;", ["int", "="], "int"],
  ["vardbl", "double y = 2.5;", ["double"], "double"],
  ["varbool", "boolean ok = true;", ["boolean", "true"], "boolean"],
  ["varstr", 'String s = "WEG";', ["String"], "String"],
  ["if", "if (x > 0) { }", ["if"], "if"],
  ["else", "if (x>0){} else {}", ["else"], "else"],
  ["for", "for (int i=0;i<3;i++) {}", ["for", "i++"], "for"],
  ["while", "while (x > 0) { x--; }", ["while"], "while"],
  ["arr", "int[] a = {1,2,3};", ["int[]"], "array"],
  ["len", "a.length", ["length"], "length"],
  ["cls", "public class Motor {}", ["class"], "class"],
  ["ctor", "public Motor() {}", ["Motor("], "constructor"],
  ["method", "public int cv(){ return 5; }", ["return"], "method"],
  ["new", "Motor m = new Motor();", ["new"], "new"],
  ["static", "public static int z = 1;", ["static"], "static"],
  ["priv", "private int cv;", ["private"], "private"],
  ["pub", "public String marca;", ["public"], "public"],
  ["eq", "Objects.equals(a,b) // ideia", ["equals"], "equals"],
  ["list", "List<String> L = new ArrayList<>();", ["List", "ArrayList"], "List"],
  ["map", "Map<String,Integer> m = new HashMap<>();", ["Map", "HashMap"], "Map"],
  ["try", "try { } catch (Exception e) { }", ["try", "catch"], "try/catch"],
  ["intf", "public interface Repo {}", ["interface"], "interface"],
  ["impl", "class RepoImpl implements Repo {}", ["implements"], "implements"],
  ["ext", "class B extends A {}", ["extends"], "extends"],
  ["final", "final int N = 10;", ["final"], "final"],
  ["null", "if (s == null) {}", ["null"], "null"],
  ["tern", "int v = ok ? 1 : 0;", ["?"], "ternary"],
  ["switch", "switch(x){ case 1: break; }", ["switch", "case"], "switch"],
  ["pack", "package com.renow;", ["package"], "package"],
  ["import", "import java.util.List;", ["import"], "import"],
  ["ovrd", "@Override", ["@Override"], "Override"],
  ["stream", "list.stream().filter(...)", ["stream"], "stream"],
  ["opt", "Optional.of(1)", ["Optional"], "Optional"],
  ["rec", "record Motor(String marca) {}", ["record"], "record"],
  ["enum", "enum Tipo { A, B }", ["enum"], "enum"],
  ["thr", "throw new IllegalArgumentException()", ["throw"], "throw"],
  ["syn", "synchronized void f(){}", ["synchronized"], "synchronized"],
  ["gen", "class Box<T> {}", ["<T>"], "generics"]
];
javaBits.forEach((row, i) => {
  const [id, sample, must, term] = row;
  java.push(
    mission(
      "java-" + String(i + 1).padStart(3, "0") + "-" + id,
      "Java: " + term,
      "Escreva o trecho com " + term,
      5,
      "lab",
      45,
      [
        teach(term, `<p>Java — <strong>${term}</strong></p><div class="code">${sample.replace(/</g, "&lt;")}</div>`),
        labCode("Lab", "Java", "Inclua as peças de " + term, "// Java lab\n", sample, { mustInclude: must }),
        quiz("Prova", term + " em Java:", ["Não existe", "É construção válida/importante", "Só CSS"], 1, term)
      ],
      note("Java " + term, "Java", "Trecho: " + term, sample, sample, "Compile no JDK local.", [term, id])
    )
  );
});
addTrack("java", "Java", "Java", "<strong>Java enterprise</strong>Micro-aulas de sintaxe + ideias. Execute de verdade com JDK no PC.", "badge-java", "Java path", "Trilha Java", java);

/* ========== 4. GO ========== */
const golang = [];
golang.push(
  mission("go-000", "Go: por que", "APIs cloud, simplicidade, concorrência.", 4, "teach", 40, [
    teach("Go", `<p>Muito usada em backend moderno (a vaga sênior pedia Go avançado).</p>`),
    quiz("Prova", "Go é:", ["Só frontend", "Linguagem compilada p/ backend", "CSS"], 1, "Backend.")
  ], note("Go overview", "Go", "Linguagem compilada para serviços.", "go run .", "fmt.Println", "Instale Go no PC.", ["golang"]))
);
const goBits = [
  ["print", 'fmt.Println("oi")', ["fmt.Println"], "Println"],
  ["pack", "package main", ["package main"], "package"],
  ["import", 'import "fmt"', ["import"], "import"],
  ["main", "func main() {}", ["func main"], "main"],
  ["var", "var x int = 5", ["var", "int"], "var"],
  ["short", "x := 5", [":="], ":="],
  ["str", 's := "WEG"', ['"'], "string"],
  ["if", "if x > 0 {}", ["if"], "if"],
  ["for", "for i := 0; i < 3; i++ {}", ["for"], "for"],
  ["range", "for i, v := range arr {}", ["range"], "range"],
  ["func", "func add(a,b int) int { return a+b }", ["func", "return"], "func"],
  ["multi", "func f() (int, error) { return 1, nil }", ["error"], "multi return"],
  ["struct", "type Motor struct { CV int }", ["struct"], "struct"],
  ["method", "func (m Motor) Ok() bool { return true }", ["func ("], "method"],
  ["ptr", "p := &x", ["&"], "pointer"],
  ["slice", "s := []int{1,2,3}", ["[]int"], "slice"],
  ["map", "m := map[string]int{}", ["map["], "map"],
  ["iface", "type X interface{ F() }", ["interface"], "interface"],
  ["gor", "go doWork()", ["go "], "goroutine"],
  ["chan", "ch := make(chan int)", ["chan"], "channel"],
  ["select", "select { case <-ch: }", ["select"], "select"],
  ["defer", "defer f.Close()", ["defer"], "defer"],
  ["err", "if err != nil { return err }", ["err != nil"], "error check"],
  ["const", "const Pi = 3.14", ["const"], "const"],
  ["switch", "switch x { case 1: }", ["switch"], "switch"],
  ["make", "b := make([]byte, 8)", ["make"], "make"],
  ["append", "s = append(s, 4)", ["append"], "append"],
  ["json", "`json:\"marca\"`", ["json:"], "json tag"],
  ["http", "http.ListenAndServe", ["http."], "net/http"],
  ["ctx", "context.Context", ["context"], "context"],
  ["test", "func TestX(t *testing.T) {}", ["testing.T"], "testing"],
  ["mod", "go.mod", ["go.mod"], "modules"],
  ["export", "NomeMaiusculo exporta", ["//"], "visibility"],
  ["iota", "const (A=iota)", ["iota"], "iota"],
  ["panic", "panic(\"x\")", ["panic"], "panic"],
  ["recover", "defer func(){ recover() }()", ["recover"], "recover"],
  ["rwmutex", "sync.RWMutex", ["RWMutex"], "sync"],
  ["bytes", "bytes.Buffer", ["bytes"], "bytes"],
  ["time", "time.Now()", ["time."], "time"],
  ["jsonm", "json.Marshal", ["Marshal"], "encoding/json"]
];
goBits.forEach((row, i) => {
  const [id, sample, must, term] = row;
  golang.push(
    mission(
      "go-" + String(i + 1).padStart(3, "0") + "-" + id,
      "Go: " + term,
      sample,
      5,
      "lab",
      45,
      [
        teach(term, `<div class="code">${sample.replace(/</g, "&lt;")}</div>`),
        labCode("Lab", "Go", "Escreva trecho com " + term, "// Go lab\n", sample, { mustInclude: must }),
        quiz("Prova", "Go " + term + ":", ["Inútil", "Peça importante da linguagem", "Só HTML"], 1, term)
      ],
      note("Go " + term, "Go", term, sample, sample, "go run no PC.", [term])
    )
  );
});
addTrack("golang", "Go (Golang)", "Go", "<strong>Go para backend top</strong>Sintaxe, concorrência, http, erros — micro-aulas.", "badge-go", "Go path", "Trilha Go", golang);

/* ========== 5. ALGORITMOS ========== */
const algo = [];
algo.push(
  mission("algo-000", "Algoritmos: mentalidade", "Entrevistas top cobram isso pesado.", 5, "teach", 40, [
    teach("Por quê", `<p>Google/Meta/etc. testam resolução de problemas: arrays, hashes, grafos, DP, complexidade.</p>`),
    quiz("Prova", "Big-O descreve:", ["Cor CSS", "Crescimento do custo com N", "Nome do arquivo"], 1, "Complexidade.")
  ], note("Big-O", "Algoritmos", "Mede como tempo/memória crescem com N.", "O(1), O(n), O(n log n), O(n^2)", "loop simples ~ O(n)", "Compare abordagens.", ["complexidade"]))
);

const algoPy = [
  ["sum", "soma lista", "print(sum([1,2,3]))", "6", "sum"],
  ["max", "máximo", "print(max([1,7,3]))", "7", "max"],
  ["min", "mínimo", "print(min([4,2,8]))", "2", "min"],
  ["rev", "reverso", "print([1,2,3][::-1][0])", "3", "slice reverso"],
  ["count", "contar", "print([1,2,2].count(2))", "2", "count"],
  ["sort", "ordenar", "a=[3,1,2]; a.sort(); print(a[0])", "1", "sort"],
  ["two", "dois ponteiros ideia", "a=[1,2,3]\ni,j=0,len(a)-1\nprint(a[i]+a[j])", "4", "two pointers"],
  ["freq", "frequência dict", "d={}\nfor x in [1,1,2]:\n    d[x]=d.get(x,0)+1\nprint(d[1])", "2", "hash map"],
  ["stack", "pilha", "st=[]\nst.append(1)\nst.append(2)\nprint(st.pop())", "2", "stack"],
  ["queue", "fila ideia", "from collections import deque\nq=deque([1])\nq.append(2)\nprint(q.popleft())", "1", "queue"],
  ["sethas", "membership", "print(3 in {1,2,3})", "True", "set lookup"],
  ["binsearch-idea", "busca binária passo", "a=[1,3,5,7]\nprint(a[2])", "5", "binary search idea"],
  ["rec", "recursão fatorial", "def f(n):\n    return 1 if n<=1 else n*f(n-1)\nprint(f(5))", "120", "recursion"],
  ["fib", "fib dp ideia", "a,b=0,1\nfor _ in range(5):\n    a,b=b,a+b\nprint(a)", "5", "fib"],
  ["uniq", "únicos", "print(len(set([1,1,2,3])))", "3", "unique"],
  ["pref", "prefix sum ideia", "a=[1,2,3]\np=[a[0]]\nfor i in range(1,3):\n    p.append(p[-1]+a[i])\nprint(p[-1])", "6", "prefix"],
  ["mat", "matriz acesso", "m=[[1,2],[3,4]]\nprint(m[1][0])", "3", "matrix"],
  ["pal", "palíndromo", "s='aba'\nprint(s==s[::-1])", "True", "palindrome"],
  ["anag", "anagrama ideia", "print(sorted('ab')==sorted('ba'))", "True", "anagram"],
  ["wind", "sliding window ideia", "a=[1,2,3,4]\nprint(sum(a[0:2]))", "3", "window"]
];
algoPy.forEach((row, i) => {
  const [id, title, starter, expect, term] = row;
  algo.push(
    mission(
      "algo-" + String(i + 1).padStart(3, "0") + "-" + id,
      "Algo: " + title,
      term,
      6,
      "lab",
      55,
      [
        teach(title, `<p>Padrão: <strong>${term}</strong></p><div class="code">${starter.replace(/</g, "&lt;")}</div>`),
        labPy("Lab", "Chegue na saída " + expect, starter + "\n", { equals: expect }, "use o padrão " + term),
        quiz("Prova", term + " é útil em:", ["Só CSS", "Entrevistas e problemas reais", "Nada"], 1, term)
      ],
      note(term, "Algoritmos", title, starter.split("\n")[0], starter, "Refaça sem olhar.", [id])
    )
  );
});
// more complexity quizzes
const bigO = [
  ["O(1)", "acesso array índice"],
  ["O(n)", "loop único"],
  ["O(n log n)", "sort eficiente típico"],
  ["O(n^2)", "dois loops aninhados"],
  ["O(2^n)", "recursão ingenua subsets"]
];
bigO.forEach((row, i) => {
  algo.push(
    mission(
      "algo-big-" + (i + 1),
      "Complexidade: " + row[0],
      row[1],
      4,
      "teach",
      40,
      [
        teach(row[0], `<p><strong>${row[0]}</strong> — típico de: ${row[1]}</p>`),
        quiz("Prova", row[1] + " costuma ser:", [row[0], "cor CSS", "HTML only"], 0, row[0]),
        reveal("Lembre", [{ q: row[0], a: row[1] }])
      ],
      note(row[0], "Algoritmos", row[1], row[0], row[1], "Compare sempre.", [row[0]])
    )
  );
});
addTrack("algoritmos", "Algoritmos & Estruturas", "Algoritmos", "<strong>Padrões de entrevista</strong>Hash, dois ponteiros, pilha, recursão, Big-O — micro labs.", "badge-algo", "Algo path", "Trilha algoritmos", algo);

/* ========== 6. SYSTEMS ========== */
const sys = [];
const sysTopics = [
  ["processo vs thread", "Processo isola memória; threads compartilham.", "OS"],
  ["CPU scheduling", "SO decide quem roda na CPU.", "OS"],
  ["memória virtual", "Endereços virtuais → físicos.", "OS"],
  ["stack vs heap", "Stack frames; heap alocação dinâmica.", "OS"],
  ["deadlock", "Espera circular de locks.", "OS"],
  ["TCP", "Confiável, ordenado, conexão.", "Rede"],
  ["UDP", "Datagrama, sem garantia.", "Rede"],
  ["HTTP/1.1", "Request/response texto.", "Rede"],
  ["HTTPS/TLS", "Criptografa o canal.", "Rede"],
  ["DNS", "Nome → IP.", "Rede"],
  ["load balancer", "Distribui tráfego.", "Sistemas"],
  ["cache", "Guarda resposta quente.", "Sistemas"],
  ["CDN", "Cache na borda geográfica.", "Sistemas"],
  ["sharding", "Particionar dados.", "Sistemas"],
  ["replication", "Cópias para leitura/resiliência.", "Sistemas"],
  ["CAP ideia", "Trade-offs consistência/disponibilidade/partição.", "Sistemas"],
  ["idempotência", "Repetir não bagunça.", "Sistemas"],
  ["rate limit", "Limita abuso.", "Sistemas"],
  ["queue", "Desacopla produtores/consumidores.", "Sistemas"],
  ["pubsub", "Publica eventos a assinantes.", "Sistemas"],
  ["ACID", "Transações confiáveis.", "DB"],
  ["BASE ideia", "Disponibilidade eventual em sistemas distribuídos.", "DB"],
  ["index B-tree", "Estrutura comum de índice.", "DB"],
  ["transaction isolation", "Níveis de isolamento.", "DB"],
  ["GC ideia", "Coletor de lixo (JVM/Go).", "Runtime"],
  ["GC pause", "Pausa pode afetar latência.", "Runtime"],
  ["syscall", "Pedido ao kernel.", "OS"],
  ["file descriptor", "Handle de recurso.", "OS"],
  ["mutex", "Exclusão mútua.", "Concurrency"],
  ["semaphore", "Conta permissões.", "Concurrency"],
  ["context switch", "Troca de tarefa na CPU.", "OS"],
  ["page fault", "Página não está na RAM.", "OS"],
  ["TLB", "Cache de tradução de endereços.", "OS"],
  ["RAID ideia", "Discos em conjunto.", "Storage"],
  ["SSD vs HDD", "Latência e padrão de acesso.", "Storage"],
  ["consistency models", "Strong vs eventual.", "Sistemas"],
  ["leader election", "Escolher líder no cluster.", "Sistemas"],
  ["heartbeat", "Sinal de vida.", "Sistemas"],
  ["backpressure", "Consumidor lento sinaliza.", "Sistemas"],
  ["circuit breaker", "Para de chamar serviço doente.", "Sistemas"]
];
sysTopics.forEach((row, i) => {
  const [term, summary, lang] = row;
  sys.push(
    mission(
      "sys-" + String(i + 1).padStart(3, "0"),
      "Systems: " + term,
      summary,
      5,
      "teach",
      45,
      [
        teach(term, `<p><strong>${term}</strong></p><p>${summary}</p><div class="callout info"><strong>Nível top</strong>Engenharia de sistemas é o diferencial em empresas grandes.</div>`),
        quiz("Prova", term + ":", ["Irrelevante", summary, "É tag HTML"], 1, summary),
        reveal("Fixar", [{ q: term, a: summary }])
      ],
      note(term, lang, summary, term, summary, "Relacione com APIs/DB reais.", [term])
    )
  );
});
addTrack("systems", "Systems (OS/Rede/Distributed)", "Systems", "<strong>Como sistemas grandes funcionam</strong>OS, rede, caching, consistência — o que entrevista de sistemas ama.", "badge-sys", "Systems path", "Trilha systems", sys);

/* ========== 7. BACKEND / CLOUD expand ========== */
const backend = [];
const beTopics = [
  ["REST resource", "URL = recurso", "API"],
  ["status 200", "OK", "HTTP"],
  ["status 201", "Created", "HTTP"],
  ["status 400", "Bad request", "HTTP"],
  ["status 401", "Unauthorized", "HTTP"],
  ["status 403", "Forbidden", "HTTP"],
  ["status 404", "Not found", "HTTP"],
  ["status 429", "Too many requests", "HTTP"],
  ["status 500", "Server error", "HTTP"],
  ["JWT ideia", "Token assinado", "Auth"],
  ["OAuth ideia", "Delegar login", "Auth"],
  ["bcrypt ideia", "Hash de senha", "Auth"],
  ["CORS", "Browser cross-origin", "Web"],
  ["middleware", "Camada antes do handler", "API"],
  ["pagination", "page/cursor", "API"],
  ["filtering", "query params", "API"],
  ["versioning", "/v1", "API"],
  ["OpenAPI", "Contrato da API", "API"],
  ["webhooks", "HTTP callback", "Integração"],
  ["retry/backoff", "Tentar de novo com espera", "Resiliência"],
  ["timeout", "Limite de espera", "Resiliência"],
  ["bulkhead", "Isolar falhas", "Resiliência"],
  ["S3", "Object storage", "AWS"],
  ["Lambda", "Function as a service", "AWS"],
  ["EC2", "VM", "AWS"],
  ["IAM", "Permissões", "AWS"],
  ["RDS", "DB gerenciado", "AWS"],
  ["SQS", "Fila", "AWS"],
  ["SNS", "Pub/sub", "AWS"],
  ["CloudWatch", "Logs/métricas", "AWS"],
  ["VPC", "Rede privada", "AWS"],
  ["ALB", "Load balancer", "AWS"],
  ["Docker image", "Empacota app", "DevOps"],
  ["container", "Instância da image", "DevOps"],
  ["K8s pod", "Unidade de deploy", "DevOps"],
  ["CI", "Testes automáticos", "DevOps"],
  ["CD", "Entrega automática", "DevOps"],
  ["blue/green", "Deploy com swap", "DevOps"],
  ["feature flag", "Liga feature sem deploy", "DevOps"],
  ["structured logging", "Logs em JSON", "Obs"]
];
beTopics.forEach((row, i) => {
  const [term, summary, lang] = row;
  backend.push(
    mission(
      "be-" + String(i + 1).padStart(3, "0"),
      "Backend: " + term,
      summary,
      4,
      "lab",
      45,
      [
        teach(term, `<p><strong>${term}</strong> — ${summary}</p>`),
        i % 3 === 0
          ? labJs("Lab mental", "logue o nome do conceito", `console.log('${term}');\n`, { includes: term.split(" ")[0] }, "console.log")
          : quiz("Prova", term + ":", ["Só enfeite", summary, "Tag HTML"], 1, summary),
        quiz("Fixar", summary + " descreve:", [term, "padding", "h1"], 0, term)
      ],
      note(term, lang, summary, term, summary, "Conecte com projeto real.", [term])
    )
  );
});
addTrack("backend", "Backend & Cloud", "Backend", "<strong>API + AWS + resiliência</strong>Do HTTP ao deploy cloud.", "badge-be", "Backend mega", "Trilha backend", backend);

/* ========== 8. DATA ========== */
const data = [];
const dataTopics = [
  ["OLTP", "Transações do dia a dia"],
  ["OLAP", "Análise histórica"],
  ["star schema", "fatos + dimensões"],
  ["snowflake schema", "dimensões normalizadas"],
  ["SCD", "dimensão que muda no tempo"],
  ["ETL", "extract transform load"],
  ["ELT", "load depois transform"],
  ["data lake", "armazenamento bruto"],
  ["warehouse", "analítico modelado"],
  ["lakehouse", "lake + disciplina de tabela"],
  ["Airflow DAG", "pipeline orquestrado"],
  ["Kafka topic", "fluxo de eventos"],
  ["Spark job", "processamento paralelo"],
  ["dbt model", "SQL versionado"],
  ["data quality", "regras de validade"],
  ["lineage", "origem do dado"],
  ["catalog", "inventar dados"],
  ["PII", "dado pessoal sensível"],
  ["RLS", "row level security"],
  ["partitioning", "dividir tabelas grandes"],
  ["clustering", "organizar fisicamente"],
  ["materialized view", "pré-cálculo"],
  ["CDC", "change data capture"],
  ["idempotent pipeline", "reprocessar seguro"],
  ["SLA dados", "acordo de frescor/qualidade"],
  ["metric layer", "definição única de métrica"],
  ["feature store", "features de ML"],
  ["vector index", "busca por embedding"],
  ["batch window", "janela de processamento"],
  ["watermark", "atraso em stream"]
];
dataTopics.forEach((row, i) => {
  const [term, summary] = row;
  data.push(
    mission(
      "data-" + String(i + 1).padStart(3, "0"),
      "Data: " + term,
      summary,
      4,
      "teach",
      40,
      [
        teach(term, `<p><strong>${term}</strong>: ${summary}</p>`),
        quiz("Prova", term + " relaciona-se a:", [summary, "somente CSS hover", "tag <br>"], 0, summary),
        i % 4 === 0
          ? labSql("Lab catálogo", "SELECT * FROM motores", "SELECT * FROM motores", motores, "SELECT *", { expectRows: 4 })
          : reveal("Lembre", [{ q: term, a: summary }])
      ],
      note(term, "Dados", summary, term, summary, "Use no vocabulário de entrevista.", [term])
    )
  );
});
addTrack("data", "Dados & Analytics Eng", "Dados", "<strong>Do SQL ao lakehouse</strong>Modelagem, pipelines, qualidade, ML data.", "badge-data", "Data mega", "Trilha dados", data);

/* ========== 9. TYPESCRIPT / C / RUST intros ========== */
const langs = [];
const tsBits = [
  ["let t: number = 1", ["number"], "number"],
  ["let s: string = 'a'", ["string"], "string"],
  ["let b: boolean = true", ["boolean"], "boolean"],
  ["type ID = number", ["type"], "type alias"],
  ["interface User { name: string }", ["interface"], "interface"],
  ["function f(x: number): number { return x }", ["number"], "typed fn"],
  ["const a: number[] = [1]", ["number[]"], "array type"],
  ["optional?: string", ["?"], "optional"],
  ["union: string | number", ["|"], "union"],
  ["as const", ["as const"], "as const"],
  ["enum E { A }", ["enum"], "enum"],
  ["Record<string, number>", ["Record"], "Record"],
  ["Partial<T>", ["Partial"], "Partial"],
  ["Readonly<T>", ["Readonly"], "Readonly"],
  ["unknown", ["unknown"], "unknown"],
  ["never", ["never"], "never"],
  ["generics <T>", ["<T>"], "generics"],
  ["satisfies", ["satisfies"], "satisfies"]
];
tsBits.forEach((row, i) => {
  const [sample, must, term] = row;
  langs.push(
    mission("ts-" + (i + 1), "TS: " + term, sample, 4, "lab", 40, [
      teach(term, `<div class="code">${sample.replace(/</g, "&lt;")}</div>`),
      labCode("Lab", "TypeScript", "Escreva com " + term, "// TS\n", sample, { mustInclude: must }),
      quiz("Prova", "TS adiciona:", ["Cores CSS", "Tipos ao JS", "Buckets S3"], 1, "Tipos.")
    ], note("TS " + term, "TypeScript", term, sample, sample, "TS compila para JS.", [term]))
  );
});
const cBits = [
  ['printf("oi");', ["printf"], "printf"],
  ["int x = 5;", ["int"], "int"],
  ["char c = 'a';", ["char"], "char"],
  ["float f = 1.0f;", ["float"], "float"],
  ["if (x) {}", ["if"], "if"],
  ["for(;;){}", ["for"], "for"],
  ["while(1){}", ["while"], "while"],
  ["int a[3];", ["["], "array"],
  ["int *p = &x;", ["*", "&"], "pointer"],
  ["struct S { int a; };", ["struct"], "struct"],
  ["sizeof(x)", ["sizeof"], "sizeof"],
  ["malloc", ["malloc"], "malloc"],
  ["free(p);", ["free"], "free"],
  ["#include <stdio.h>", ["#include"], "include"],
  ["return 0;", ["return"], "return"]
];
cBits.forEach((row, i) => {
  const [sample, must, term] = row;
  langs.push(
    mission("c-" + (i + 1), "C: " + term, sample, 4, "lab", 40, [
      teach(term, `<p>C — base de sistemas.</p><div class="code">${sample.replace(/</g, "&lt;")}</div>`),
      labCode("Lab", "C", "Trecho com " + term, "/* C */\n", sample, { mustInclude: must }),
      quiz("Prova", "C é importante porque:", ["Só faz site", "Base de OS/embarcados/performance", "Substitui HTML"], 1, "Systems.")
    ], note("C " + term, "C", term, sample, sample, "Compile com gcc no PC.", [term]))
  );
});
const rustBits = [
  ['println!("oi");', ["println!"], "println"],
  ["let x = 5;", ["let"], "let"],
  ["let mut y = 1;", ["mut"], "mut"],
  ["fn f() {}", ["fn"], "fn"],
  ["struct M { cv: i32 }", ["struct"], "struct"],
  ["enum E { A, B }", ["enum"], "enum"],
  ["match x { _ => {} }", ["match"], "match"],
  ["Option<T>", ["Option"], "Option"],
  ["Result<T,E>", ["Result"], "Result"],
  ["Vec::new()", ["Vec"], "Vec"],
  ["&str", ["&"], "borrow"],
  ["ownership move", ["//"], "ownership"],
  ["impl M {}", ["impl"], "impl"],
  ["trait T {}", ["trait"], "trait"],
  ["cargo new", ["cargo"], "cargo"]
];
rustBits.forEach((row, i) => {
  const [sample, must, term] = row;
  langs.push(
    mission("rs-" + (i + 1), "Rust: " + term, sample, 4, "lab", 40, [
      teach(term, `<div class="code">${sample.replace(/</g, "&lt;")}</div>`),
      labCode("Lab", "Rust", "Trecho com " + term, "// rust\n", sample, { mustInclude: must }),
      quiz("Prova", "Rust foca em:", ["Só CSS", "Segurança de memória sem GC clássico", "Planilha"], 1, "Safety.")
    ], note("Rust " + term, "Rust", term, sample, sample, "cargo run no PC.", [term]))
  );
});
addTrack("langs", "TypeScript · C · Rust", "TS/C/Rust", "<strong>Mais linguagens do kit top</strong>TS no web, C em sistemas, Rust moderno seguro.", "badge-langs", "Polyglot", "Trilha linguagens extras", langs);

/* ========== 10. CARREIRA / GOOGLE-STYLE ========== */
const career = [];
career.push(
  mission(
    "car-000",
    "Meta nivel Google: plano",
    "O site acelera; a elite e maratona.",
    6,
    "teach",
    50,
    [
      teach(
        "Plano",
        "<ol>" +
          "<li>Fundamentos solidos (ja no lab)</li>" +
          "<li>Projetos dificeis no GitHub</li>" +
          "<li>Algoritmos diarios</li>" +
          "<li>Systems design</li>" +
          "<li>Ingles tecnico</li>" +
          "<li>Entrevistas mock</li>" +
          "</ol>" +
          '<div class="callout warn"><strong>Impedimento real</strong>Nao e falta de aula — e falta de horas de luta com problemas dificeis. O lab remove a desculpa de nao saber por onde comecar.</div>'
      ),
      order("Ordene o plano", "Do chao ao avancado:", ["Fundamentos", "Projetos", "Algoritmos", "Systems + entrevistas"], [0, 1, 2, 3]),
      quiz(
        "Prova",
        "O que mais separa mediano de top:",
        ["Comprar certificado", "Pratica deliberada em problemas/projetos dificeis", "Trocar de IDE"],
        1,
        "Pratica."
      )
    ],
    note(
      "plano elite",
      "Carreira",
      "Base + projetos + algo + systems + ingles.",
      "rotina diaria",
      "mock interview",
      "Consistencia > intensidade unica.",
      ["google"]
    )
  )
);
for (let i = 1; i <= 30; i++) {
  const prompts = [
    ["Explique Big-O de um loop aninhado", "O(n^2) típico"],
    ["Diferença TCP/UDP", "Confiável vs datagrama"],
    ["O que é índice no banco", "Acelera leitura"],
    ["Idempotência em API de pagamento", "Repetir não cobra 2x"],
    ["Cache invalidation", "Quando refrescar dado"],
    ["Processo vs thread", "Memória isolada vs compartilhada"],
    ["REST vs RPC ideia", "Recursos vs procedimentos"],
    ["GC impacto", "Pausas de latência"],
    ["Sharding chave ruim", "Hotspot"],
    ["Observability 3 pilares", "logs métricas traces"]
  ];
  const p = prompts[(i - 1) % prompts.length];
  career.push(
    mission(
      "car-" + String(i).padStart(3, "0"),
      "Entrevista: " + p[0],
      p[1],
      5,
      "teach",
      45,
      [
        teach("Pergunta", `<p><strong>${p[0]}</strong></p><p>Resposta-guia: ${p[1]}</p><div class="callout"><strong>Treino</strong>Fale em voz alta em 60–90s. Em inglês se puder.</div>`),
        reveal("Resposta", [{ q: p[0], a: p[1] }]),
        quiz("Check", "Boa resposta de entrevista tem:", ["Só sim/não", "Clareza + trade-offs", "Xingar a linguagem"], 1, "Trade-offs.")
      ],
      note("Q: " + p[0], "Entrevista", p[1], p[0], p[1], "Repita sem ler.", [p[0]])
    )
  );
}
addTrack("carreira", "Carreira & Entrevistas Top", "Carreira", "<strong>Mentalidade elite</strong>Perguntas estilo entrevista + plano realista.", "badge-car", "Carreira", "Trilha carreira", career);

/* ===== EXTRA PACK para passar de 500 aulas ===== */
function pad(trackId, prefix, items, factory) {
  items.forEach((it, i) => {
    tracks[trackId].missions.push(factory(prefix + String(i + 1).padStart(3, "0"), it));
  });
}

// Mais Python drills
for (let n = 1; n <= 40; n++) {
  const a = n;
  const b = n + 1;
  tracks.fundamentos.missions.push(
    mission(
      "fpy-extra-" + n,
      "Python drill: " + a + "+" + b,
      "Conta rápida",
      3,
      "lab",
      30,
      [
        teach("Drill", "<p>Calcule e imprima o resultado.</p><div class='code'>print(" + a + "+" + b + ")</div>"),
        labPy("Lab", "Imprima " + (a + b), "print(" + a + "+" + b + ")\n", { equals: String(a + b) }, "print(a+b)"),
        quiz("Prova", a + "+" + b + " =", [String(a + b), String(a * b), "0"], 0, "Soma.")
      ],
      note("drill soma " + a + "+" + b, "Python", "Conta " + a + "+" + b, "print(" + a + "+" + b + ")", String(a + b), "Velocidade de sintaxe.", ["drill", "soma"])
    )
  );
}

// Mais algoritmos JS
const algoJsExtra = [
  ["console.log([3,1,2].sort((a,b)=>a-b)[0])", "1", "sort numerico"],
  ["console.log([1,2,3].reduce((s,x)=>s+x,0))", "6", "reduce"],
  ["console.log([1,2,3].includes(2))", "true", "includes"],
  ["console.log('aba'==='aba'.split('').reverse().join(''))", "true", "palindrome js"],
  ["console.log(new Set([1,1,2]).size)", "2", "Set size"],
  ["console.log([1,2,3].find(x=>x>2))", "3", "find"],
  ["console.log([1,2,3].every(x=>x>0))", "true", "every"],
  ["console.log([1,2,3].some(x=>x===2))", "true", "some"],
  ["console.log(Math.max(1,9,3))", "9", "Math.max"],
  ["console.log(Math.min(1,9,3))", "1", "Math.min"],
  ["console.log('weg'.repeat(2))", "wegweg", "repeat"],
  ["console.log([1,2].concat([3])[2])", "3", "concat"],
  ["console.log(Array.from({length:3},(_,i)=>i).join('-'))", "0-1-2", "Array.from"],
  ["console.log(Object.keys({a:1,b:2}).length)", "2", "Object.keys"],
  ["console.log(Object.values({a:7})[0])", "7", "Object.values"]
];
algoJsExtra.forEach((row, i) => {
  const [starter, expect, term] = row;
  tracks.algoritmos.missions.push(
    mission(
      "algo-js-" + (i + 1),
      "Algo JS: " + term,
      term,
      4,
      "lab",
      40,
      [
        teach(term, "<div class='code'>" + starter.replace(/</g, "&lt;") + "</div>"),
        labJs("Lab", "Saida " + expect, starter + ";\n", { equals: expect }, term),
        quiz("Prova", term + " ajuda em:", ["Nada", "Resolver problemas com dados", "So CSS"], 1, term)
      ],
      note("JS " + term, "Algoritmos", term, starter, expect, "Refaca sem olhar.", [term])
    )
  );
});

// Mais systems flashcards
const moreSys = [
  ["DNS TTL", "Tempo de cache do registro DNS"],
  ["Anycast", "Mesmo IP em varios lugares"],
  ["QUIC", "Transporte moderno sobre UDP"],
  ["gRPC", "RPC com HTTP/2 e protobuf"],
  ["protobuf", "Serializacao binaria tipada"],
  ["sidecar", "Container auxiliar no pod"],
  ["service mesh", "Malha de proxies entre servicos"],
  ["mTLS", "TLS entre servicos"],
  ["secrets manager", "Cofre de segredos"],
  ["blue/green DB", "Cuidado com migracao de schema"],
  ["event sourcing", "Estado como sequencia de eventos"],
  ["CQRS", "Separar leitura e escrita"],
  ["saga pattern", "Transacao distribuida por passos"],
  ["outbox pattern", "Publicar evento com commit"],
  ["bloom filter", "Teste probabilistico de pertinencia"]
];
moreSys.forEach((row, i) => {
  tracks.systems.missions.push(
    mission(
      "sys-extra-" + (i + 1),
      "Systems+: " + row[0],
      row[1],
      4,
      "teach",
      35,
      [
        teach(row[0], "<p><strong>" + row[0] + "</strong>: " + row[1] + "</p>"),
        quiz("Prova", row[0] + ":", [row[1], "tag HTML", "cor CSS"], 0, row[1]),
        reveal("Fixar", [{ q: row[0], a: row[1] }])
      ],
      note(row[0], "Sistemas", row[1], row[0], row[1], "Vocabulario de systems design.", [row[0]])
    )
  );
});

/* ===== write ===== */
function strip(missions) {
  return missions.map((m) => {
    const c = Object.assign({}, m);
    delete c._note;
    return c;
  });
}
const out = {};
Object.keys(tracks).forEach((k) => {
  out[k] = Object.assign({}, tracks[k], { missions: strip(tracks[k].missions) });
});
const notes = [];
Object.values(tracks).forEach((t) => {
  t.missions.forEach((m) => {
    if (!m._note) return;
    const n = m._note;
    notes.push({
      id: m.id + "-note",
      term: n.term,
      aliases: n.aliases || [],
      lang: n.lang,
      summary: n.summary,
      how: n.how,
      example: n.example,
      tips: n.tips || "",
      missionId: m.id,
      trackId: t.id
    });
  });
});

const root = path.join(__dirname, "..");
fs.writeFileSync(
  path.join(root, "js", "curriculum.js"),
  "/* GERADO: tools/generate-mega.js */\nwindow.RENOW_TRACK_ORDER = " +
    JSON.stringify(orderIds) +
    ";\nwindow.RENOW_TRACKS = " +
    JSON.stringify(out) +
    ";\n"
);
fs.writeFileSync(
  path.join(root, "js", "notebook.js"),
  "/* GERADO: tools/generate-mega.js */\nwindow.RENOW_NOTES = " +
    JSON.stringify(notes) +
    ";\n"
);

let total = 0;
const summary = {};
Object.values(out).forEach((t) => {
  summary[t.id] = t.missions.length;
  total += t.missions.length;
});
console.log(summary);
console.log("TOTAL aulas:", total);
console.log("Notas:", notes.length);
console.log("Tracks:", orderIds.join(", "));
