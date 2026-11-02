# SPEC KIT: Super Goal 3 Master Interactive Learning & Certification Platform
> **Project Continuation Specification & Architectural Blueprint**  
> **Course:** Super Goal 3 (Intermediate Third Grade – Term 1)  
> **Authority:** Saudi Ministry of Education Curriculum Standards (McGraw-Hill)  
> **Supervising Instructor:** Teacher Mahmoud Al-Saeed  
> **Version:** 1.0 (Phase 1 Completed: Unit 1 Fully Implemented)  
> **Last Updated:** November 2026 (Phase 1: Unit 1 Completed)

---

## 1. Executive Summary & Purpose

This document serves as the **Master Specification Kit (Spec Kit)** for the **Super Goal 3** interactive educational platform. Any AI assistant or developer opening a new chat session must read this document first to resume development seamlessly without breaking existing architecture, visual guidelines, or curriculum standards.

The core philosophy of this project is to transform traditional textbook documents into a **self-contained, deeply interactive, culturally enriched, zero-backend, 100% Target Language Immersion platform** for Saudi intermediate students.

---

## 2. Invariants & Non-Negotiable Rules

When extending or maintaining this project in any session, adhere strictly to the following 6 rules:

1. **Zero Arabic in Web Source Files:**  
   `index.html`, `styles.css`, `app.js`, and `data.js` must contain **0 Arabic characters**. All UI text, instructions, definitions, explanations, and certificate texts must be in high-standard, accessible English for students. (Communication with the user in chat remains in friendly, professional Arabic).
2. **Pacing Rule:**  
   Development proceeds unit-by-unit or in requested phases.  
   - **Phase 1 (Completed):** Unit 1 (*Lifestyles*)  
   - **Phase 2 (Next Step / الخطوة القادمة):** Unit 2 (*Life Stories*)  
   - **Phase 3:** Unit 3 (*When Are You Traveling?*)  
   - **Phase 4:** Unit 4 (*What Do I Need to Buy?*)  
   *Do not jump ahead to future units until requested by the user.*
3. **Visual Identity & Color Palette:**  
   - Theme is **Light, Vibrant, and Engaging** (crisp backgrounds: `#f8fafc`, `#ffffff`, `#fff7f4`).
   - Primary Brand Color derived from the Teacher's Official Logo (`assets/images/teacher_logo.jpg`): **Warm Terracotta Coral** (`#e7713f`, `#cf5927`).
   - Saudi Cultural Accent: **Saudi Emerald Green** (`#059669`, `#047857`, `#ecfdf5`).
   - Academic Honor Accent: **Radiant Gold** (`#d97706`, `#f59e0b`).
   - Secondary Tech Accents: **Slate Charcoal** (`#2d3748`) and **Sky Blue** (`#0284c7`).
   - The Teacher Logo must remain prominently visible in the header (with a verified badge), footer, and as an elegant transparent background watermark on the official certificate.
   - Official Instructor Communication Channels (WhatsApp direct inquiry without raw digit display, YouTube channel, and LinkedIn profile) are accessible in the header, footer, and certificate preview modal.
4. **Interactive Student Registration & Certification Gateway:**  
   - Top-level **Student Passport Bar** where students enter their English name and school.
   - Persistent `localStorage` tracking for student identity and gamified XP points.
   - Direct button `📜 Claim Certificate` allowing students to preview, generate, and print their official Certificate of Distinction.
5. **Authentic Saudi Cultural Context in Every Section:**  
   - Real photos from Saudi Arabia: Holy Kaaba, Grand Mosque Expansion, Al-Ula Hegra UNESCO monument, Vision 2030 future skyline, Islamic calligraphy, Quality of Life athletic clubs, and healthy Saudi culinary heritage.
   - High-resolution modal zoom when clicking any photo.
   - Visual clue badges on quiz and examination questions (`🏋️ Fitness`, `🥗 Nutrition`, `💻 Digital Habits`, `⚽ Sports`, `🇸🇦 Saudi Lifestyle & Vision 2030`).
   - Pedagogical explanations for every question explaining why the correct choice is right and analyzing distractors.
6. **Teacher Signature & Endorsement:**  
   Official certificates of achievement must feature:
   $$\begin{array}{c}
   \textbf{Teacher: Mahmoud Al-Saeed} \\
   \text{English Language Instructor \& Academic Supervisor}
   \end{array}$$

---

## 3. Current Project State (Phase 1: Unit 1 Completed)

### Key Metrics Summary
| Metric | Current Count | Status |
| :--- | :---: | :---: |
| **Units Implemented** | Unit 1 (*Lifestyles*) | ✅ 100% Complete |
| **Total Vocabulary Items** | 45 words & expressions | ✅ With IPA, definitions, examples, audio & Saudi context |
| **Grammar Modules** | 2 deep modules | ✅ With formulas, comparison matrices & 10 diagnostics |
| **Pronunciation Labs** | 1 unit lab + Listening Studio | ✅ Connected speech reduction /dʒə/ + Musa Football listening |
| **Reading Stories** | 1 master passage | ✅ "Do College Students Have a Healthy Lifestyle?" (5 Qs + 5 gallery photos) |
| **Saudi Cultural Showcase** | 6 high-resolution cards | ✅ Kaaba, Mosque expansion, Al-Ula, Vision 2030, Quality of Life, Calligraphy |
| **High-Resolution Images** | 30+ images in `assets/images` | ✅ Extracted from SG3 book and cultural archives |
| **Writing Master Tasks** | 1 analytical report task | ✅ Youth habits in Saudi Arabia + real-time word count & keyword evaluator |
| **Discussion Scenarios** | 3 real-life simulations | ✅ Gym workouts, smartphone screen time, nutrition & sleep |
| **Tiered Examinations** | 5 exams (20 Qs each) | ✅ 100 questions with visual clues & comprehensive explanations |
| **Arabic Characters in Web Code** | **0** | ✅ Verified 100% Target Language Immersion |

---

## 4. File Structure & Responsibilities

```text
c:\Users\elsae\Desktop\grade 3 super goal\
├── SPEC_KIT.md                     # THIS FILE: Master Specification Kit for new chats
├── index.html                      # Semantic HTML5 layout, Passport bar, 8 tab panes, image modal, certificate modal
├── styles.css                      # Light terracotta & emerald design system, responsive styles, print media
├── app.js                          # Interactive engine (Passport state, Web Audio synthesizer, speech, filters, timer, cert)
├── data.js                         # Centralized JSON database (window.APP_DATA) with Saudi cultural showcase
├── .gitignore                      # Excludes large PDF references and OS cache files
│
├── assets/
│   └── images/
│       ├── teacher_logo.jpg                # Teacher Mahmoud Al-Saeed's official circular logo
│       ├── super_goal_3_cover.jpg          # Original Super Goal 3 textbook cover
│       ├── holy_kaaba_aerial.jpeg          # Saudi Cultural Showcase: The Holy Kaaba, Makkah
│       ├── holy_mosque_makkah.jpeg         # Saudi Cultural Showcase: Grand Mosque Expansion
│       ├── saudi_alula_heritage.jpg        # Saudi Cultural Showcase: Al-Ula / Hegra Monument
│       ├── u1_reading_future_city.jpeg     # Saudi Cultural Showcase: Riyadh Vision 2030 Skyline
│       ├── saudi_calligraphy_art.jpg       # Saudi Cultural Showcase: Islamic Calligraphy & Art
│       ├── u1_fitness_rock_climbing.jpeg   # Unit 1 Opening: Arthur fitness and rock climbing
│       ├── u1_health_food_vegetarian.jpeg  # Unit 1 Opening: Refaa vegetarian food and herbal tea
│       ├── u1_puzzle_gamer_sudoku.jpeg     # Unit 1 Opening: John challenging puzzles and games
│       ├── u1_internet_cellphone_addict.jpeg # Unit 1 Opening: Josh computer and texting habits
│       ├── u1_young_artist_noura.jpeg      # Unit 1 Opening: Noura creative painting
│       ├── u1_devoted_employee_martin.jpeg # Unit 1 Opening: Martin devoted employee
│       ├── u1_tom_teen_bedroom.jpeg        # Unit 1 Language in Context: Tom's bedroom and computer
│       ├── u1_musa_football_star.jpeg      # Unit 1 Listening: Musa professional football player
│       ├── u1_gym_workout_conversation.jpeg # Unit 1 Conversation: Omar and Majid workout discussion
│       ├── u1_healthy_diet_produce.jpeg    # Unit 1 Reading: Fresh produce and balanced nutrition
│       ├── u1_college_students_studying.jpeg # Unit 1 Reading: College campus academic routines
│       ├── u1_sleep_test_scores_graph.png  # Unit 1 Reading: Research graph of sleep vs test scores
│       ├── u1_brain_superfoods.jpeg        # Unit 1 Reading: Brain-boosting superfoods
│       ├── u1_active_running_exercise.jpeg # Unit 1 Reading: Cardiovascular exercise routines
│       ├── u1_teenagers_computers_writing.jpeg # Unit 1 Writing: Teenagers and computer technology
│       └── u1_lifestyle_survey_chart.jpeg  # Unit 1 FMF: Lifestyle survey chart
```

---

## 5. Phase 1 Implementation Summary (Unit 1: *Lifestyles*)

### Student's Book Pages 2–11
- **Vocabulary:** 45 official vocabulary items covering lifestyle archetypes (`addict`, `fanatic`, `freak`, `devoted`), sports & fitness (`work out`, `gym`, `rock climbing`), leisure & mind games (`sudoku`, `puzzle`), diet & wellness (`vegetarian`, `herbal tea`, `produce`, `grains`), frequency adverbs (`always`, `usually`, `frequently`, `sometimes`, `seldom`, `rarely`, `never`), conversational idioms (`turn off`, `Anyway`, `You see`, `overdo`), and quantifiers (`both`, `neither`, `all`, `none`).
- **Grammar Modules:**
  - **Module 1:** Simple Present Tense for Habitual Activities & Frequency Adverbs/Expressions (word order with main verbs vs. 'be', percentage scale, 4 common error autopsies, 5 diagnostics).
  - **Module 2:** Inquiries of Frequency & Quantifiers (`How often`, `How much`, `How long` + `All`, `Both`, `Neither`, `None` with singular/plural agreement).
- **Pronunciation Lab 1:** Connected Speech Reduction of `do you` (/dʒə/) + Listening Comprehension Studio with professional football player Musa (interactive True/False with explanations).
- **Reading Story 1:** *"Do College Students Have a Healthy Lifestyle?"* (Investigative study on university students' eating habits, sleep duration, and physical exercise with 5 comprehension questions and gallery).
- **Writing Task 1:** Youth Pastimes & Lifestyle Analytical Report: Examining common habits and technology use among young people in Saudi Arabia, with pronoun cohesion evaluator and live word counter.
- **Discussion Scenarios 1 to 3:**
  - Scenario 1: Gym Workouts vs. Digital Pastimes (Omar & Majid).
  - Scenario 2: Smartphone Screen Time & Digital Habits.
  - Scenario 3: Balanced Nutrition, Sleep Schedules & Exam Preparation.
- **Exams 1 to 5:** 100 multiple-choice questions with visual clues and detailed pedagogical explanations.

---

## 6. Next Step Blueprint (Phase 2: Unit 2) — الخطوة القادمة

When the user asks to begin **Phase 2 (Unit 2)**, adhere to this curriculum specification:

### Unit 2: *Life Stories* (Student's Book Pages 12–21)
- **Functions:**
  - Talking about past actions and significant historical milestones.
  - Relating past events and personal biographies in chronological order.
  - Reporting what people said and recounting personal memories.
  - Talking about past dates and times.
- **Grammar Modules to Add (Modules 3 & 4):**
  - **Module 3:** Simple Past Tense (Regular `-ed` inflections and irregular verbs) + Expressions with the passive `be + born`.
  - **Module 4:** Habitual Past with `used to` vs. Simple Past + Time Clauses with `when`.
- **Pronunciation:** Pronunciation of `used to` (/ˈjuːs.tə/) in connected speech.
- **Reading Story 2:** *"The King of Saudi Arabia"* (Biographical recount of visionary leadership, historical achievements, and modernization).
- **Writing Task 2:** Writing a structured life story or biography of an influential person.
- **Cultural Images to Extract:** King of Saudi Arabia historical archives, national founding milestones, and humanitarian leadership.

---

## 7. Audio & Speech Architecture (Deepgram American Voice, 75% Speed & Zero-Lag Sync)

- Dedicated Deepgram Voice Studio modal (`#deepgramConfigModal`) in the header.
- Supports premier natural American English models (`aura-asteria-en`, `aura-luna-en`, `aura-orion-en`, `aura-zeus-en`).
- **Speech Speed Control (75% Slow Pace vs 100% Normal Pace):**
  - Prominent speed toggle button in player controls: `🐢 Speed: 75% (Slow)` vs `⚡ Speed: 100% (Normal)`.
  - Persisted in `localStorage ('preferred_speech_rate')`.
  - Applies across all spoken audio: reading stories, vocabulary entries, listening studio, and discussion scenarios.
- **Zero-Lag Synchronized Highlighting Engine:**
  - Sentence-chained playback architecture with sub-25ms start time.
  - Students can click directly on any individual sentence in the passage to hear and follow along.
