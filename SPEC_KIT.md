# SPEC KIT: Super Goal 3 Master Interactive Learning & Certification Platform
> **Project Continuation Specification & Architectural Blueprint**  
> **Course:** Super Goal 3 (Intermediate Third Grade – Term 1)  
> **Authority:** Saudi Ministry of Education Curriculum Standards (McGraw-Hill)  
> **Supervising Instructor:** Teacher Mahmoud Al-Saeed  
> **Version:** 2.0 (Phase 1 & Phase 2 Completed: Units 1 & 2 Fully Implemented)  
> **Last Updated:** November 2026 (Phase 2: Unit 2 Completed)

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
   - **Phase 2 (Completed):** Unit 2 (*Life Stories*)  
   - **Phase 3 (Next Step / الخطوة القادمة):** Unit 3 (*When Are You Traveling?*)  
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
   - Real photos from Saudi Arabia: Holy Kaaba, Grand Mosque Expansion, Al-Ula Hegra UNESCO monument, Vision 2030 future skyline, Islamic calligraphy, Quality of Life athletic clubs, King Salman humanitarian relief (KSrelief), and HRH Prince Sultan bin Salman historic spaceflight.
   - High-resolution modal zoom when clicking any photo.
   - Visual clue badges on quiz and examination questions (`🏋️ Fitness`, `🩸 Blood Donation`, `👑 Royal Heritage`, `🏖️ Environment`, `🚀 Space Heritage`, `⚽ Sports`, `🇸🇦 Saudi Lifestyle & Vision 2030`).
   - Pedagogical explanations for every question explaining why the correct choice is right and analyzing distractors.
6. **Teacher Signature & Endorsement:**  
   Official certificates of achievement must feature:
   $$\begin{array}{c}
   \textbf{Teacher: Mahmoud Al-Saeed} \\
   \text{English Language Instructor \& Academic Supervisor}
   \end{array}$$

---

## 3. Current Project State (Phases 1 & 2 Completed)

### Key Metrics Summary
| Metric | Current Count | Status |
| :--- | :---: | :---: |
| **Units Implemented** | Units 1 & 2 (*Lifestyles* & *Life Stories*) | ✅ 100% Complete |
| **Total Vocabulary Items** | 90 words & expressions (45 U1 + 45 U2) | ✅ With IPA, definitions, examples, audio & Saudi context |
| **Grammar Modules** | 4 deep modules (Modules 1, 2, 3, 4) | ✅ With formulas, comparison matrices & 20 diagnostics |
| **Pronunciation Labs** | 2 unit labs + 2 Listening Studios | ✅ /dʒə/ + /ˈjuːs.tə/ + Musa Football + Prince Sultan spaceflight |
| **Reading Stories** | 2 master passages | ✅ College Students Healthy Lifestyle + King Salman bin Abdulaziz (10 Qs + 8 gallery photos) |
| **Saudi Cultural Showcase** | 9 high-resolution cards | ✅ Kaaba, Grand Mosque, Al-Ula, Vision 2030, Quality of Life, Calligraphy, KSrelief, Diriyah, Space Pioneer |
| **High-Resolution Images** | 40+ authentic textbook images in `assets/images` | ✅ Extracted from SG3 book and cultural archives |
| **Writing Master Tasks** | 2 comprehensive studio tasks | ✅ Youth habits report + Chronological biography with live word counter & keyword evaluators |
| **Discussion Scenarios** | 6 communicative role-plays | ✅ Gym workouts, smartphone time, nutrition, childhood used to, community blood drive, Falcons big break |
| **Tiered Examinations** | 10 exams (20 Qs each = 200 questions) | ✅ 200 questions with visual clues & comprehensive explanations |
| **Arabic Characters in Web Code** | **0** | ✅ Verified 100% Target Language Immersion |

---

## 4. File Structure & Responsibilities

```text
c:\Users\elsae\Desktop\grade 3 super goal\
├── SPEC_KIT.md                     # THIS FILE: Master Specification Kit for new chats
├── index.html                      # Semantic HTML5 layout, Passport bar, 8 tab panes, image modal, certificate modal
├── styles.css                      # Light terracotta & emerald design system, responsive styles, print media
├── app.js                          # Interactive engine (Passport state, Web Audio synthesizer, speech, filters, timer, cert)
├── data.js                         # Centralized JSON database (window.APP_DATA) with Saudi cultural showcase (Units 1 & 2)
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
│       ├── u1_lifestyle_survey_chart.jpeg  # Unit 1 FMF: Lifestyle survey chart
│       ├── u2_king_salman_portrait.jpeg    # Unit 2 Reading: Custodian of the Two Holy Mosques King Salman
│       ├── u2_blood_donor_trent.jpeg       # Unit 2 Opening: Trent Olsen 100th blood donation
│       ├── u2_athlete_ahmed_jamal.jpeg     # Unit 2 Opening: Ahmed Jamal Athlete of the Year
│       ├── u2_sunset_beach_cleanup.jpeg    # Unit 2 Opening: Sunset Beach environmental cleanup
│       ├── u2_newborn_twins.jpeg           # Unit 2 Opening: Newborn twin sisters Linda and Jenny
│       ├── u2_history_old_transport.jpeg   # Unit 2 Context: Old historical transport in Riyadh
│       ├── u2_prince_sultan_space.jpeg     # Unit 2 Listening: HRH Prince Sultan bin Salman astronaut
│       ├── u2_falcons_basketball_team.jpeg # Unit 2 Conversation: Khalid & The Falcons basketball squad
│       ├── u2_riyadh_metropolis_growth.jpeg # Unit 2 Reading: Riyadh transformation into world metropolis
│       ├── u2_humanitarian_relief.jpeg     # Unit 2 Reading: King Salman Humanitarian Aid (KSrelief)
│       ├── u2_king_salman_awards.jpeg      # Unit 2 Reading: King Salman academic doctorates & medals
│       └── u2_historical_timeline.jpeg     # Unit 2 Writing: Prince Sultan bin Salman biographical timeline
```

---

## 5. Phase 2 Implementation Summary (Unit 2: *Life Stories*)

### Student's Book Pages 12–21
- **Vocabulary (45 items):**
  - **Nouns (18):** `appointment`, `attitude`, `blood`, `colleague`, `community`, `donation`, `effort`, `employee`, `facility`, `infant`, `leadership`, `league`, `litter`, `newborn`, `operation`, `owner`, `principal`, `twin`.
  - **Verbs (8):** `award`, `compete`, `donate`, `encourage`, `gather`, `join`, `practice`, `receive`.
  - **Phrases with verbs (5):** `comb the beach`, `get in touch with`, `grow up`, `take responsibility`, `used to`.
  - **Adjectives (5):** `environmental`, `crippling`, `hopeful`, `original`, `outstanding`.
  - **Expressions (2):** `congratulations`, `wish (someone) all the best`.
  - **Real Talk (4):** `big break`, `to be into something`, `to turn up`, `What about ...?`.
  - **Academic Key Terms (3):** `biography`, `charity`, `milestone`.
- **Grammar Modules:**
  - **Module 3:** Simple Past Tense (Regular `-ed` inflections and irregular verbs) & Passive Expressions with `be + born` (`was/were born`, `was educated`, `was raised`).
  - **Module 4:** Habitual Past with `used to` vs. Simple Past & Time Clauses with `when` (`didn't use to`, `Did you use to...?`, past time markers `ago`, `last`, `in`, `yesterday`).
- **Pronunciation Lab 2:** Connected Speech Reduction of `used to` (/ˈjuːs.tə/) with voiceless assimilation and schwa reduction + Listening Comprehension Studio with HRH Prince Sultan bin Salman Al Saud (historical timeline from 1956 to present).
- **Reading Story 2:** *"The King of Saudi Arabia"* (Biographical recount of visionary leadership, urban transformation of Riyadh, and global humanitarian relief under the Custodian of the Two Holy Mosques King Salman bin Abdulaziz with 5 comprehension questions and 4 high-resolution gallery photographs).
- **Writing Task 2:** Chronological Biography & Life Story of an Influential Figure (with prepositions of time/place, time connectives, model text, word count evaluator, and 12-keyword analyzer).
- **Discussion Scenarios 4 to 6:**
  - Scenario 4: Childhood Memories & How Life Used to Be (Fahd & Rakan).
  - Scenario 5: Community Service & The Gift of Life (Ahmed Jamal & Trent Olsen).
  - Scenario 6: The Falcons' Big Break (Reporter & Team Captain Khalid).
- **Exams 6 to 10:** 100 multiple-choice questions with visual clues and detailed pedagogical explanations.

---

## 6. Next Step Blueprint (Phase 3: Unit 3) — الخطوة القادمة

When the user asks to begin **Phase 3 (Unit 3)**, adhere to this curriculum specification:

### Unit 3: *When Are You Traveling?* (Student's Book Pages 22–31)
- **Functions:**
  - Talking about travel plans, airline schedules, and airport departures.
  - Making travel arrangements and hotel inquiries.
  - Expressing future intentions and promises.
  - Explaining reasons and intentions using infinitives of purpose.
- **Grammar Modules to Add (Modules 5 & 6):**
  - **Module 5:** Future with Present Progressive vs. `be going to` vs. `will`.
  - **Module 6:** Infinitives of Purpose (`in order to` / `to + verb`) + Time Clauses with Future Meaning (`before`, `after`, `when`, `as soon as`).
- **Pronunciation:** Reduced pronunciation of `going to` (/ˈɡənə/ or /ˈɡoʊɪŋ tə/) in connected conversational speech.
- **Reading Story 3:** Travel & Cultural Exchange in Saudi Arabia (International students learning Arabic in the Kingdom / Saudi tourism destinations).
- **Writing Task 3:** Composing a formal travel itinerary or letter to a friend describing an upcoming educational trip to a foreign destination.
- **Cultural Images to Extract:** Saudi international airports, King Khalid International Airport (Riyadh), King Abdulaziz Airport (Jeddah), high-speed Haramain Railway, and foreign student Arabic learning academies in Saudi Arabia.

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
