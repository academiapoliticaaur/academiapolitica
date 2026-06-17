#!/usr/bin/env node
/**
 * generate-notebooklm-tasks.mjs
 * Genereaza fisiere .md cu prompturi NotebookLM pentru toate lectiile cursului.
 *
 * Usage: node scripts/generate-notebooklm-tasks.mjs
 *    or: npm run notebooklm
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const COURSE = {
  id: "prieteni-de-incredere-academia-aur",
  title: "Prieteni de Incredere cu Ami si Moti",
  age_group: "clasele 0-4",
  modules: [
    {
      id: "m01",
      title: "Modulul 1 - Radacinile",
      lessons: [
        { id: "m01_l01", title: "Termostatul Interior", description: "Copiii invata sa observe semnalele corpului si sa inteleaga cum apar emotiile." },
        { id: "m01_l02", title: "Oglinda Increderii", description: "Copiii isi descopera reusitele, calitatile si vocea interioara prietenoasa." },
        { id: "m01_l03", title: "Cand Simt Prea Mult", description: "Copiii invata sa gestioneze emotiile intense prin pauza, respiratie si cerere de sprijin." },
      ],
    },
    {
      id: "m02",
      title: "Modulul 2 - Solul",
      lessons: [
        { id: "m02_l01", title: "Spargatorul de Gheata", description: "Copiii exerseaza salutul, intrebarile simple si conversatia din pauza." },
        { id: "m02_l02", title: "Reteta Prieteniei", description: "Copiii invata semnele prieteniilor sanatoase si cum se repara o greseala." },
        { id: "m02_l03", title: "Capcanele Asteptarilor", description: "Copiii invata sa recunoasca relatiile dezechilibrate, controlul si vinovatia." },
      ],
    },
    {
      id: "m03",
      title: "Modulul 3 - Gradina",
      lessons: [
        { id: "m03_l01", title: "Harta Grupurilor din Curte", description: "Copiii observa cum se formeaza grupurile si cum pot intra intr-un joc fara anxietate." },
        { id: "m03_l02", title: "Fantoma Excluderii", description: "Copiii invata sa gestioneze ignorarea, refuzul si reconectarea sanatoasa." },
        { id: "m03_l03", title: "Capcana Popularitatii", description: "Copiii diferentiaza popularitatea de respect si invata curajul de a fi autentici." },
      ],
    },
    {
      id: "m04",
      title: "Modulul 4 - Furtunile",
      lessons: [
        { id: "m04_l01", title: "Cuvinte care Dor", description: "Copiii invata diferenta dintre gluma si rautate si exerseaza raspunsuri calme." },
        { id: "m04_l02", title: "Manipularea Emotionala", description: "Copiii recunosc vinovatirea, santajul emotional si protejarea granitelor." },
        { id: "m04_l03", title: "Puterea lui NU", description: "Copiii invata moduri ferme si respectuoase de a spune NU si de a cere ajutor." },
      ],
    },
    {
      id: "m05",
      title: "Modulul 5 - Instrumente Practice si Activitati",
      lessons: [
        { id: "m05_l01", title: "Semaforul Emotiilor", description: "Copiii invata oprirea inainte de reactie: Rosu - ma opresc, Galben - respir si gandesc, Verde - aleg ce fac." },
        { id: "m05_l02", title: "Cutia cu Superputeri", description: "Copiii identifica puncte forte, reusite mici si vocea lor curajoasa." },
        { id: "m05_l03", title: "Harta Oamenilor de Incredere", description: "Copiii identifica adultii si prietenii siguri si invata cum cer ajutor." },
        { id: "m05_l04", title: "Provocarile Curajoase", description: "Copiii transforma curajul in pasi mici: salut, zambet, conversatie si incercare noua." },
        { id: "m05_l05", title: "Trusa Anti-Furtuna", description: "Copiii exerseaza respiratia, pauza de siguranta si frazele calme." },
      ],
    },
    {
      id: "m06",
      title: "Modulul 6 - Provocari Scolare",
      lessons: [
        { id: "m06_l01", title: "Colegii dificili", description: "Copiii invata sa gestioneze provocarea, agresivitatea verbala si situatiile care cer ajutor." },
        { id: "m06_l02", title: "Excluderea sociala", description: "Copiii invata ca respingerea nu le defineste valoarea si exerseaza reconectarea." },
        { id: "m06_l03", title: "Prietenii complicate", description: "Copiii recunosc vinovatirea, relatiile dezechilibrate si limitele sanatoase." },
        { id: "m06_l04", title: "Emotiile mari", description: "Copiii gestioneaza anxietatea, furia si tristetea prin calmare si loc de siguranta." },
      ],
    },
  ],
};

const ASSET_TYPES = ["video", "presentation", "quiz", "activity", "materials"];

const ASSET_LABELS = {
  video: "Video",
  presentation: "Prezentare",
  quiz: "Quiz",
  activity: "Activitate",
  materials: "Materiale suplimentare",
};

function generatePrompt(lesson, assetType) {
  const t = lesson.title;
  const d = lesson.description;
  switch (assetType) {
    case "video":
      return `Creeaza video pentru copii clasele 0-4 pe tema ${t} - ${d} Foloseste Ami si Moti, limbaj simplu, activitate scurta si feedback pozitiv. Nu cere confesiuni personale.`;
    case "presentation":
      return `Creeaza prezentare pentru copii clasele 0-4 pe tema ${t} - ${d} Foloseste Ami si Moti, imagini prietenoase si mesaj pozitiv.`;
    case "quiz":
      return `Creeaza quiz pentru copii clasele 0-4 pe tema ${t}, cu 5 intrebari simple si raspunsuri potrivite varstei.`;
    case "activity":
      return `Creeaza activitate practica pentru copii clasele 0-4 pe tema ${t}, cu joc de rol si concluzie pozitiva.`;
    case "materials":
      return `Creeaza fisa copil si recapitulare pentru tema ${t}.`;
    default:
      return "";
  }
}

function generateTasks() {
  const tasks = [];
  for (const mod of COURSE.modules) {
    for (const lesson of mod.lessons) {
      for (const assetType of ASSET_TYPES) {
        const prompt = generatePrompt(lesson, assetType);
        tasks.push({
          task_id: `${lesson.id}_${assetType}`,
          module_id: mod.id,
          module_title: mod.title,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          asset_type: assetType,
          asset_label: ASSET_LABELS[assetType],
          prompt,
          status: "pending",
          notebooklm_output: null,
        });
      }
    }
  }
  return tasks;
}

function markdownContent(task) {
  return `# ${task.asset_label} — ${task.lesson_title}

**Modul:** ${task.module_title}
**Lectie:** \`${task.lesson_id.toUpperCase()}\` — ${task.lesson_title}
**Asset:** ${task.asset_label}
**Task ID:** \`${task.task_id}\`

---

## Prompt NotebookLM

Copiaza textul de mai jos direct in NotebookLM:

\`\`\`
${task.prompt}
\`\`\`

---

## Output NotebookLM

> Dupa generare, salveaza link-ul / fisierul generat mai jos si actualizeaza status-ul.

**Output URL / Link:**
_[ adauga dupa generare ]_

**Note:**
_[ note ]_

**Status:** \`pending\` → \`generated\` → \`reviewed\` → \`uploaded\`

---

*Generat automat de generate-notebooklm-tasks.mjs*
`;
}

function generateManifest(tasks) {
  const now = new Date().toISOString().slice(0, 10);
  const byType = Object.fromEntries(
    ASSET_TYPES.map((t) => [t, tasks.filter((tk) => tk.asset_type === t).length])
  );

  let md = `# NotebookLM Tasks — Dashboard

**Curs:** ${COURSE.title}
**Generat:** ${now}
**Total module:** ${COURSE.modules.length}
**Total lectii:** ${[...new Set(tasks.map((t) => t.lesson_id))].length}
**Total taskuri:** ${tasks.length}

---

## Sumar

| Tip | Total |
|-----|-------|
| Video | ${byType.video} |
| Prezentare | ${byType.presentation} |
| Quiz | ${byType.quiz} |
| Activitate | ${byType.activity} |
| Materiale suplimentare | ${byType.materials} |
| **TOTAL** | **${tasks.length}** |

---

## Status per lectie

`;

  for (const mod of COURSE.modules) {
    md += `### ${mod.title}\n\n`;
    md += `| Lectie | Video | Prezentare | Quiz | Activitate | Materiale |\n`;
    md += `|--------|:-----:|:----------:|:----:|:---------:|:---------:|\n`;
    for (const lesson of mod.lessons) {
      const lid = lesson.id.toUpperCase();
      md += `| **${lid}** — ${lesson.title} | pending | pending | pending | pending | pending |\n`;
    }
    md += "\n";
  }

  return md;
}

function main() {
  const tasks = generateTasks();
  const exportDir = join(ROOT, "exports", "notebooklm");
  const promptsDir = join(exportDir, "prompts");

  mkdirSync(exportDir, { recursive: true });
  mkdirSync(promptsDir, { recursive: true });
  mkdirSync(join(exportDir, "outputs"), { recursive: true });
  mkdirSync(join(exportDir, "reviewed"), { recursive: true });
  mkdirSync(join(exportDir, "uploaded"), { recursive: true });

  for (const mod of COURSE.modules) {
    mkdirSync(join(promptsDir, mod.id.toUpperCase()), { recursive: true });
  }

  writeFileSync(
    join(exportDir, "notebooklm_tasks.json"),
    JSON.stringify({ course_id: COURSE.id, generated_at: new Date().toISOString(), total_tasks: tasks.length, tasks }, null, 2),
    "utf-8"
  );

  for (const task of tasks) {
    const filename = `${task.lesson_id.toUpperCase()}_${task.asset_type}.md`;
    writeFileSync(join(promptsDir, task.module_id.toUpperCase(), filename), markdownContent(task), "utf-8");
  }

  writeFileSync(join(exportDir, "notebooklm_manifest.md"), generateManifest(tasks), "utf-8");

  console.log(`\nExport complet!`);
  console.log(`  Module: ${COURSE.modules.length}`);
  console.log(`  Lectii: ${[...new Set(tasks.map((t) => t.lesson_id))].length}`);
  console.log(`  Taskuri: ${tasks.length} fisiere .md`);
  console.log(`  Output: exports/notebooklm/`);
}

main();
