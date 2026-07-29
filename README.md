# RENOW Lab — Curso de Programação

Curso interativo estático no navegador: **520+ micro-aulas**, caderninho, e **Área de teste** com preview ao vivo (HTML/CSS/JS).

## Abrir no celular / outro PC (produção)

Depois do deploy, use a URL da Vercel (ex.: `https://curso-programacao.vercel.app` ou a URL que o deploy devolver).

Progresso fica no `localStorage` **daquele navegador** — em outro PC o save começa limpo (normal).

## Abrir no PC (local)

```powershell
cd "c:\Users\micke\Desktop\O rebobinador\curso-motores-renow"
python -m http.server 8765
```

Abra http://localhost:8765

## O que tem

| Recurso | Descrição |
|---------|-----------|
| 10 trilhas | Fundamentos, Sites, Java, Go, Algoritmos, Systems, Backend, Dados, TS/C/Rust, Carreira |
| 520+ aulas | Ensina → lab → prova |
| Caderninho | Busca `print`, `SELECT`, etc. |
| Área de teste | Código à esquerda, site ao vivo à direita (logo, hero…) |

## Honestidade

- O lab ensina **muito** sem pagar 10 cursos.
- Nível “Google” ainda exige **anos** de prática, projetos difíceis e entrevistas.
- Labs Java/Go/C/Rust validam sintaxe no browser; rode de verdade no PC (JDK/Go/gcc/cargo).

## Regenerar aulas

```powershell
node tools/generate-mega.js
```
