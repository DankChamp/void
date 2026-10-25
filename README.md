<p align="center">
  <img src="https://raw.githubusercontent.com/DankChamp/void/main/public/assets/hero.svg" alt="VOID — student, systems builder, co-founder of PX" width="100%" />
</p>

<p align="center">
  <a href="https://dankchamp.github.io/void"><img alt="site" src="https://img.shields.io/badge/void-dankchamp.github.io%2Fvoid-0A0D0E?style=flat-square&labelColor=0A0D0E&logo=astro&logoColor=8AF5C0" /></a>
  <img alt="role" src="https://img.shields.io/badge/PX-co--founder-0A0D0E?style=flat-square&labelColor=0A0D0E" />
  <img alt="org" src="https://img.shields.io/badge/VOIDX-head-0A0D0E?style=flat-square&labelColor=0A0D0E" />
  <img alt="status" src="https://img.shields.io/badge/status-building-0A0D0E?style=flat-square&labelColor=0A0D0E&logo=gnometerminal&logoColor=8AF5C0" />
</p>

<p align="center">
  <sub><samp>THE VOID IS NOT ABSENCE. IT IS THE ROOM LEFT FOR WHAT DOES NOT EXIST YET.</samp></sub>
</p>

---

### <samp>01 · whoami</samp>

I'm **VOID** — a student, systems builder, and co-founder of **PX**. I learn by building:
working code first, theory second. I prefer lightweight, inspectable, open systems over
heavy defaults, and I would rather understand a mechanism than accept it.

I care about things that outlive the moment they were made — tools, notes, organizations,
and the people who can keep them running without me in the room.

```
$ cat ~/.void
  role      student · systems builder · co-founder
  org       PX  →  VOIDX (the half I lead)
  os        Void Linux · runit · XBPS
  machine   ThinkPad T490 · i7-8th · 16 GB
  focus     local-first AI · Linux internals · Rust · low-cost hardware
  principle if a tool limits me for no reason, I want to know what is underneath it
```

---

### <samp>02 · doctrine</samp>

> **I.** Question what exists. Age, popularity, and authority are not arguments.

> **II.** Understand before expanding. Small working parts before enormous architectures.

> **III.** Build alternatives when the existing tool refuses to be understood.

> **IV.** Make privacy structural, not a promise.

> **V.** Separate identity from contribution; the work should be able to speak.

> **VI.** Design for continuity. A system that dies with its creator was a demo.

> **VII.** Build even without guaranteed cosmic meaning. The absence of a universal purpose does not prevent deliberate creation.

<details>
<summary><samp>&nbsp;▸ read the rest of the manifesto</samp></summary>

<br/>

1. **Question what exists.** A system's age, popularity, or authority does not make it immune to examination.
2. **Understand before expanding.** Build small working components before committing to enormous architectures.
3. **Create alternatives.** When existing tools impose unnecessary limits, investigate whether a better tool can be built.
4. **Protect identity where possible.** Personal identity and contribution do not have to be inseparable.
5. **Make privacy structural.** Reduce unnecessary exposure instead of relying entirely on promises.
6. **Develop people.** An organization grows through capable members, not merely through membership count.
7. **Separate resource generation from resource investment.** FUND and BUILD serve different purposes and should reinforce each other.
8. **Preserve knowledge.** Ideas, research, and decisions should survive beyond the moment in which they were created.
9. **Prefer evidence to certainty without evidence.** Hypotheses should be tested, and conclusions should remain revisable.
10. **Design for continuity.** Systems should not depend permanently on one person remembering everything or making every decision.
11. **Respect constraints.** Hardware, time, money, and human capacity are real design parameters.
12. **Build even without guaranteed cosmic meaning.** A lack of established universal purpose does not prevent deliberate creation.
13. **Keep identity from eclipsing the work.** The founder can matter without becoming the only thing that matters.
14. **Aim for independence without isolation.** Autonomy and collaboration can strengthen one another.
15. **Leave systems more capable than they began.** Progress is not only what exists now, but what becomes possible afterward.

</details>

---

### <samp>03 · lineage</samp>

<p align="center">
  <img src="https://raw.githubusercontent.com/DankChamp/void/main/public/assets/lineage.svg" alt="PX lineage: PS Foundation → PX → two branches → planned PX III" width="100%" />
</p>

**PX is two halves. VOIDX is mine.**

PX began as **PS Foundation**, then became **PX Organization** — built by two founders who
had been working together for years. When one of them left for college, the split was not an
ending. It was a **2.5-year time skip**: two founders, two branches, growing separately on
purpose, each proving the model on their own terms.

I lead **VOIDX** — half of PX, not a side project and not a sub-brand. The other half runs
under **Hawk**. The recombination is already planned: not a merger back into the old shape,
but a **third variant** — the version that only exists because both halves grew up first.

| | branch | lead | state |
|---|---|---|---|
| `I` | PX — first branch | **Hawk** | growing independently |
| `II` | **VOIDX** — second branch | **VOID** | growing independently · 50% of PX |
| `III` | PX · III | both | planned recombination |

---

### <samp>04 · systems</samp>

| system | what it is | stack | link |
|---|---|---|---|
| **Emma** | personal AI OS — orchestration, memory, voice, scheduling | `Python` `FastAPI` `Ollama` `Vosk` | [repo](https://github.com/DankChamp/emma) |
| **Luna** | coding agent — tool calling, sessions, local-first | `Python` `SQLAlchemy` `LLM APIs` | [repo](https://github.com/DankChamp/luna) |
| **Aqua** | research → automation engine | `Python` `ChromaDB` `ONNX` | [repo](https://github.com/DankChamp/aqua) |
| **Nebula** | GTK4 / libadwaita frontend for XBPS | `Rust` `GTK 4` `libadwaita` | [repo](https://github.com/DankChamp/nebula-gtk) |
| **ntxt** | two-person realtime comms — voice, video, presence | `JS` `Firebase` `WebRTC` | private |
| **DevPair** | collaborative task board + AI pair programming | `HTML` `JS` `PHP` `Groq` | [repo](https://github.com/DankChamp/dev-pair) |
| **VOIDX OS** | the operating layer of the organization | `React` `FastAPI` `Postgres` | private |

<sub>Two agents are not three chat windows. Each has its own process, configuration, memory,
and job. A separate second brain is planned to connect them without collapsing them.</sub>

---

### <samp>05 · stack</samp>

```txt
languages   Python · Rust · Bash · TypeScript · HTML/CSS
systems     Void Linux · runit · XBPS · musl · GTK 4 · Docker
ai          Ollama · local LLMs · tool calling · agents · RAG · ChromaDB
backend     FastAPI · SQLAlchemy · Postgres · SQLite · WebSockets · Firebase
frontend    Astro · Tailwind · React · HTMX
hardware    ThinkPad T490 · ESP32 · Arduino · Raspberry Pi · LoRa
```

<p align="left">
  <img src="https://img.shields.io/badge/Python-0A0D0E?style=flat-square&logo=python&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/Rust-0A0D0E?style=flat-square&logo=rust&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/Bash-0A0D0E?style=flat-square&logo=gnubash&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/TypeScript-0A0D0E?style=flat-square&logo=typescript&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/Void_Linux-0A0D0E?style=flat-square&logo=linux&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/GTK_4-0A0D0E?style=flat-square&logo=gtk&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/FastAPI-0A0D0E?style=flat-square&logo=fastapi&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/PostgreSQL-0A0D0E?style=flat-square&logo=postgresql&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/Ollama-0A0D0E?style=flat-square&logo=ollama&logoColor=8AF5C0" />
  <img src="https://img.shields.io/badge/Astro-0A0D0E?style=flat-square&logo=astro&logoColor=8AF5C0" />
</p>

---

### <samp>06 · signal</samp>

<p align="center">
  <img height="150" src="https://github-readme-stats.vercel.app/api?username=DankChamp&show_icons=true&hide_title=true&hide_border=true&count_private=true&include_all_commits=true&bg_color=0A0D0E&title_color=8AF5C0&icon_color=8AF5C0&text_color=8A9591&ring_color=8AF5C0" alt="stats" />
  <img height="150" src="https://github-readme-stats.vercel.app/api/top-langs/?username=DankChamp&layout=compact&hide_border=true&bg_color=0A0D0E&title_color=8AF5C0&text_color=8A9591&langs_count=8" alt="top languages" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/DankChamp/void/output/github-snake-dark.svg" alt="contribution graph" width="100%" />
</p>

<p align="center">
  <a href="https://dankchamp.github.io/void"><img alt="portfolio" src="https://img.shields.io/badge/read-the%20long%20version-8AF5C0?style=for-the-badge&labelColor=0A0D0E" /></a>
  <a href="https://github.com/DankChamp?tab=repositories"><img alt="repos" src="https://img.shields.io/badge/browse-repositories-0A0D0E?style=for-the-badge&labelColor=0A0D0E" /></a>
  <a href="mailto:void@px.org"><img alt="mail" src="https://img.shields.io/badge/void%40px.org-0A0D0E?style=for-the-badge&logo=maildotru&logoColor=8AF5C0&labelColor=0A0D0E" /></a>
</p>

<br/>

<p align="center">
  <sub><samp>~ $ git commit -m "build things, understand how they work"</samp></sub><br/>
  <sub><samp>VOID · ThinkPad T490 · Void Linux · runit · local-first</samp></sub>
</p>
