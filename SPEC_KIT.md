# SPEC KIT: Super Goal 3 Master Interactive Learning & Certification Platform
> **Project Continuation Specification & Architectural Blueprint**  
> **Course:** Super Goal 3 (Intermediate Third Grade – Term 1)  
> **Authority:** Saudi Ministry of Education Curriculum Standards (McGraw-Hill)  
> **Supervising Instructor:** Teacher Mahmoud Al-Saeed  
> **Version:** 4.3 (Tri-Unit Milestone Benchmark Championship & Comprehensive Unit 3 Pedagogical Preparation)  
> **Last Updated:** November 2026 (Phase 4.3: Tri-Unit Milestone Exam 21 covering Units 1, 2 & 3 with 20 Diagnostic Questions + Lesson Preparation Architecture)

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
   - **Phase 3 (Completed):** Unit 3 (*When Are You Traveling?*)  
   - **Phase 4 (Completed):** Unit 4 (*What Do I Need to Buy?*)  
   - **Phase 5 (Next Step / الخطوة القادمة):** Expansion 1–4 (*Review & Term 1 Grand Consolidation*)  
   *Do not jump ahead to future units until requested by the user.*
3. **Visual Identity & Color Palette:**  
   - Theme is **Light, Vibrant, and Engaging** (crisp backgrounds: `#f8fafc`, `#ffffff`, `#fff7f4`).
   - Primary Brand Color derived from the Teacher's Official Logo (`assets/images/teacher_logo.jpg`): **Warm Terracotta Coral** (`#e7713f`, `#cf5927`).
   - Saudi Cultural Accent: **Saudi Emerald Green** (`#059669`, `#047857`, `#ecfdf5`).
   - Academic Honor Accent: **Radiant Gold** (`#d97706`, `#f59e0b`).
   - Secondary Tech Accents: **Slate Charcoal** (`#2d3748`) and **Sky Blue** (`#0284c7`).
   - The Teacher Logo must remain prominently visible in the header (with a verified badge), footer, and as an elegant transparent background watermark on the official certificate.
   - Official Instructor Communication Channels (WhatsApp direct inquiry without raw digit display, YouTube channel, and LinkedIn profile) are accessible in the header, footer, and certificate preview modal.
4. **Interactive Student Registration, Gamification & Star Student Ticker:**  
   - **0-XP Baseline Start:** All students begin strictly at 0 XP (`sg3_student_xp`). Obsolete legacy session storage is automatically purged.
   - **Real-time Name Registration Bonus:** Typing student name into the passport and registering grants an instant welcome bonus (+25 XP) and synchronizes with official certificates.
   - **Comprehensive Exercise Progression:** XP points are systematically accumulated across all activities (Flashcards, Word Meaning Discovery, Grammar Diagnostics, Pronunciation Labs, Reading Stories & Questions, Writing Studio Evaluations, Discussion Arena, and 20 Final Exams).
   - **Top Moving Star Student Honor Bar:** Prominently featured at the top of the app header, displaying the Star Student's name, current XP, and curriculum scope. Automatically traverses/passes across the screen once every 5 minutes (with an immediate introductory pass on launch, live countdown clock, and instant preview trigger).
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

## 3. Current Project State (Term 1 Complete: Units 1–4 Fully Built)

### Key Metrics Summary
| Metric | Current Count | Status |
| :--- | :---: | :---: |
| **Units Implemented** | Units 1, 2, 3 & 4 (*Lifestyles*, *Life Stories*, *When Are You Traveling?* & *What Do I Need to Buy?*) | ✅ 100% Term 1 Complete |
| **Total Vocabulary Items** | 180 words & expressions (45 per unit × 4 units) | ✅ With IPA, definitions, examples, audio & Saudi context |
| **Grammar Modules** | 8 deep modules (Modules 1 to 8) | ✅ With formulas, comparison matrices & 40 diagnostics |
| **Pronunciation Labs** | 4 unit labs + 4 Listening Studios | ✅ /dʒə/ + /ˈjuːs.tə/ + /ˈɡənə/ + Listing Pitch + 4 Audio Studios |
| **Reading Stories** | 4 master passages | ✅ College Students + King Salman + Arabic in KSA + Culinary Traditions (20 Qs + 16 gallery photos) |
| **Saudi Cultural Showcase** | 9 high-resolution cards | ✅ Kaaba, Grand Mosque, Al-Ula, Vision 2030, Quality of Life, Calligraphy, KSrelief, Diriyah, Space Pioneer |
| **High-Resolution Images** | 40+ authentic textbook images in `assets/images` | ✅ Extracted from SG3 book and cultural archives |
| **Writing Master Tasks** | 4 comprehensive studio tasks | ✅ Youth habits + Biography + Travel Itinerary + Culinary Recipe with live word counters & keyword evaluators |
| **Discussion Scenarios** | 12 communicative role-plays | ✅ Gym, smartphone, diet, used to, blood drive, Falcons, airport, study tour, concierge, grocery store, Kabsa home cooking, healthy dining |
| **Tiered Examinations** | 21 exams (20 single-unit + 1 Tri-Unit Milestone Benchmark Exam = 420 questions) | ✅ 420 questions with visual clues & comprehensive explanations |
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

## 6. Phase 3 Implementation Summary (Unit 3: *When Are You Traveling?*)

### Student's Book Pages 22–31
- **Vocabulary (45 items):**
  - **Airport & Flight Operations (10):** `aisle`, `baggage`, `boarding pass`, `carry-on`, `customs`, `departure`, `flight attendant`, `gate`, `layover`, `luggage`, `runway`, `terminal`.
  - **Travel Arrangements & Documents (8):** `destination`, `itinerary`, `passenger`, `passport`, `reservation`, `schedule`, `ticket`, `visa`.
  - **Travel Actions & Verbs (10):** `board`, `confirm`, `depart`, `embark`, `fasten`, `land`, `pack`, `postpone`, `reserve`, `take off`.
  - **Descriptive Travel Adjectives (7):** `delayed`, `direct`, `domestic`, `international`, `punctual`, `spacious`, `valid`.
  - **Phrasal Verbs & Real Talk (6):** `check in`, `drop off`, `look forward to`, `see off`, `in a rush`, `ahead of time`.
  - **Academic & Cultural Terms (2):** `hospitality`, `scholarship`.
- **Grammar Modules:**
  - **Module 5:** Future Expressions — Present Progressive (fixed arrangements) vs. `be going to` (intentions & predictions with observable evidence) vs. `will` (spontaneous on-the-spot decisions, formal predictions, promises, and offers) with 10 diagnostic questions and error analyses.
  - **Module 6:** Infinitives of Purpose (`to + base verb` / `in order to + base verb`) + Future Time Clauses (`when`, `before`, `after`, `as soon as`, `until` with Simple Present) + Prepositions of Movement (`into`, `out of`, `through`, `towards`, `onto`, `off`, `down`) with 10 diagnostic questions.
- **Pronunciation Lab 3:** Connected Speech Reduction of `going to` (/ˈɡənə/ & /ˈɡoʊɪŋ tə/) before base verbs vs. strict prohibition before physical noun destinations + Airport Concourse & Flight Departure Audio Studio at King Khalid International Airport (Terminal 5 flight announcements for Saudia SV 1024 to Jeddah).
- **Reading Story 3:** *"Studying Arabic in Saudi Arabia"* (Inspiring narrative of international exchange students studying Modern Standard Arabic at premier Kingdom universities, traveling on the high-speed Haramain Railway, exploring Al-Ula UNESCO heritage, and experiencing authentic Saudi hospitality with 5 comprehension questions and 4 gallery photos).
- **Writing Task 3:** Travel Itinerary & Personal Letter: An Educational Journey in Saudi Arabia (150–200 words covering flight times, airport procedures, hotel bookings, and cultural excursions with model text, live word counter, and 18 travel-specific keyword evaluators).
- **Discussion Scenarios 7 to 9:**
  - Scenario 7: Airport Check-In & Boarding Gate Inquiries (Tariq & Saudia Ground Agent Mr. Hani).
  - Scenario 8: Planning an Educational Tour across the Kingdom (Nawaf & International Student Lucas).
  - Scenario 9: Hotel Concierge & Travel Inquiries (Dr. Robert & Concierge Mr. Zaid).
- **Exams 11 to 15:** 100 multiple-choice questions with visual clues and detailed pedagogical explanations.
- **Tri-Unit Milestone Benchmark Exam (Exam 21):** Comprehensive 20-question milestone championship synthesizing Units 1, 2, and 3 (Lifestyles, Life Stories, and When Are You Traveling?) with diagnostic syntax, frequency habits, past inflections, habitual 'used to', future forms ('will' vs 'be going to' vs Present Progressive), infinitives of purpose, airport navigation, and authentic Saudi contexts. Accessible via the dedicated `Units 1–3 Milestone (Exam 21)` filter.

---

## 7. Phase 4 Implementation Summary (Unit 4: *What Do I Need to Buy?*)

### Student's Book Pages 32–41
- **Vocabulary (45 items):**
  - **Produce, Meats & Pantry Staples (13):** `appetite`, `cabbage`, `carrot`, `clove`, `cuisine`, `flour`, `garlic`, `ingredient`, `lamb`, `onion`, `pepper`, `rice`, `salt`, `spice`, `tomato`.
  - **Containers & Measurement Partitives (8):** `carton`, `loaf`, `package`, `pinch`, `slice`, `tablespoon`, `teaspoon`.
  - **Cooking Actions & Verbs (11):** `bake`, `boil`, `chop`, `fry`, `grate`, `marinate`, `mix`, `pour`, `roast`, `season`, `stir`.
  - **Descriptive Food Adjectives (6):** `delicious`, `fresh`, `nutritious`, `ripe`, `savory`, `spicy`.
  - **Shopping Real Talk (2):** `out of stock`, `on sale`.
  - **Cultural & Nutritional Terms (2):** `staple`, `hospitality`.
- **Grammar Modules:**
  - **Module 7:** Count vs. Non-Count Nouns, Quantifiers (`some/any`, `much/many`, `a few/a little`, `a lot of`) & Measurement Partitives (`a bottle of`, `a bag of`, `a carton of`, `a can of`, `a loaf of`, `a slice of`, `a clove of`, `a tablespoon of`) with 10 diagnostic questions and error autopsies.
  - **Module 8:** Reflexive Pronouns (`myself`, `yourself`, `himself`, `herself`, `itself`, `ourselves`, `yourselves`, `themselves`) + Connectors of Cause & Result (`because` vs. `so`) with 10 diagnostic questions.
- **Pronunciation Lab 4:** Listing Intonation (rising pitch on non-final series items, terminal falling pitch on the final item) + Master Chef Recipe Listening Studio (Chicken Kabsa preparation steps, sautéing, simmering, and garnishing).
- **Reading Story 4:** *"Culinary Traditions & National Cuisine of Saudi Arabia"* (Comprehensive narrative of authentic culinary heritage, Kabsa, Jareesh, regional seafood, Qassim dates, and generous hospitality Karam with 5 comprehension questions and 4 gallery photos).
- **Writing Task 4:** Culinary Recipe & Step-by-Step Cooking Guide: Authentic Saudi Kabsa (150–200 words covering ingredient listing with partitives, sequential transition words, cause/result connectors, live word counter, and 19 culinary keyword evaluators).
- **Discussion Scenarios 10 to 12:**
  - Scenario 10: Supermarket Grocery Shopping & Checklist (Fahd & Rayan).
  - Scenario 11: Preparing Traditional Saudi Kabsa at Home (Omar & Tariq).
  - Scenario 12: Restaurant Dining & Nutritional Awareness (Nawaf, Faisal & Waiter Anas).
- **Exams 16 to 20:** 100 multiple-choice questions with visual clues and detailed pedagogical explanations.

---

## 8. Next Step Blueprint (Phase 5: Expansion 1–4) — الخطوة القادمة

When the user asks to begin **Phase 5 (Expansion 1–4)**, adhere to this curriculum specification:

### Expansion Units 1–4: *Consolidation & Term 1 Review* (Student's Book Pages 42–49)
- **Functions:**
  - Consolidating language from Units 1 through 4 (Lifestyles, Life Stories, Travel, Food).
  - Reading authentic cultural biographies and global traditions.
  - Chant along, lexical games, and cross-thematic communicative syntheses.
- **Grammar Modules to Add (Review Modules 9 & 10):**
  - **Module 9:** Term 1 Syntactic Review: Present vs. Past vs. Future vs. Quantifiers.
  - **Module 10:** Comprehensive Connectors & Pronoun Matrix: Reflexives, Time Clauses, Infinitives of Purpose, Cause & Result.
- **Grand Term 1 Final Examinations (Exams 21–25):** 100 comprehensive questions simulating official Ministry term examinations.

---

## 9. Audio & Speech Architecture (Deepgram American Voice, 75% Speed & Zero-Lag Sync)

- Dedicated Deepgram Voice Studio modal (`#deepgramConfigModal`) in the header.
- Supports premier natural American English models (`aura-asteria-en`, `aura-luna-en`, `aura-orion-en`, `aura-zeus-en`).
- **Speech Speed Control (75% Slow Pace vs 100% Normal Pace):**
  - Prominent speed toggle button in player controls: `🐢 Speed: 75% (Slow)` vs `⚡ Speed: 100% (Normal)`.
  - Persisted in `localStorage ('preferred_speech_rate')`.
  - Applies across all spoken audio: reading stories, vocabulary entries, listening studio, and discussion scenarios.
- **Precision Dual-Engine Synchronized Highlighting Engine:**
  - Sentence-chained playback architecture with sub-25ms start time.
  - Active utterance GC protection: prevents Chromium/WebKit from garbage-collecting speech instances mid-passage.
  - Acoustic duration weighting (phoneme lengths + punctuation pause offsets for commas and periods).
  - Continuous cadence time-stepper (`requestAnimationFrame`) paired with native `onboundary` event reconciliation.
  - Automatic sentence sequencing with watchdog safety timer.
  - Students can click directly on any individual sentence in the passage to hear and follow along with synchronized gold-amber karaoke highlights.
- **Interactive Click-to-Define Vocabulary Discovery Engine:**
  - 588 curated reading glossary terms in `DATA.readingGlossary`.
  - 100% coverage of all 546 unique words in the 4 textbook reading passages.
  - Bidirectional morphological stemmer (de-inflects `-s`, `-es`, `-ies`, `-ed`, `-ing`, `-ly`, `-er`, `-est` and reverse inflects singular/base forms).
  - Floating Definition Modal (`#wordMeaningModal`):
    - Word in large Outfit font + IPA phonetic transcription.
    - Part of speech badge + Super Goal 3 Core Curriculum badge if applicable.
    - Pedagogical definition + contextual example sentence.
    - Saudi Cultural Heritage & Vision 2030 notes.
    - Action buttons: `🔊 Listen to Word` and `▶ Play Full Sentence`.
    - Instant keyboard (Escape) and backdrop dismissibility.
