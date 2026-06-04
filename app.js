/* ============================================================
   Badminton Fitness — app.js  (vanilla JS, no build, no deps)
   Single-page app. All state in localStorage under one key.
   ------------------------------------------------------------
   WHERE TO EDIT WORKOUTS:  the DATA object below holds every
   exercise, strength session, running level and footwork level.
   Edit those arrays/objects to change the program. See README.
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     0. Small helpers
     ---------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => "id" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };
  const fmtShort = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  // Build a YouTube SEARCH link (never a specific video — a search can't point to the wrong clip).
  // The user picks a demonstration from real results for the exact exercise name.
  function ytSearch(query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
  }
  function watchLink(name, context) {
    const q = name + " " + (context || "exercise how to technique");
    return `<a class="watch-link" href="${ytSearch(q)}" target="_blank" rel="noopener noreferrer">▶ Watch how (opens YouTube search)</a>`;
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ----------------------------------------------------------
     1. STATIC PROGRAM DATA  (edit here to change the program)
     ---------------------------------------------------------- */
  const DATA = {
    /* ---- Exercise library ----
       tags drive the filters. Allowed tags:
       equipment: none, backpack, band, rope, chair
       area: lower, upper, core, mobility, footwork
       level: beginner, intermediate, advanced            */
    library: [
      // LOWER-BODY STRENGTH
      { name: "Chair squat", cat: "Lower-Body Strength", tags: ["none", "chair", "lower", "beginner"],
        how: "Sit back to lightly touch a chair, then stand up tall.",
        beg: "Use a higher seat and hands for support.", std: "Tap the chair lightly without resting.", hard: "Lower seat or hold a backpack.",
        reps: "3 × 8–15", mistakes: "Knees caving in; dropping onto the seat.", why: "Builds the basic squat strength used to push off and lower for shots." },
      { name: "Bodyweight squat", cat: "Lower-Body Strength", tags: ["none", "lower", "beginner"],
        how: "Feet shoulder width, sit hips back and down, then stand.",
        beg: "Reduce depth.", std: "Thighs near parallel.", hard: "Pause 2s at the bottom.",
        reps: "3 × 10–20", mistakes: "Heels lifting; rounding the back.", why: "Foundational leg strength for lunging and recovery to centre." },
      { name: "Backpack squat", cat: "Lower-Body Strength", tags: ["backpack", "lower", "intermediate"],
        how: "Hold a loaded backpack to the chest and squat.",
        beg: "Lighter pack.", std: "Moderate load, full depth.", hard: "Heavier pack or slow lowering.",
        reps: "3 × 10–15", mistakes: "Letting the load pull you forward.", why: "Adds resistance for stronger drives and jumps." },
      { name: "Supported split squat", cat: "Lower-Body Strength", tags: ["none", "chair", "lower", "beginner"],
        how: "Stagger your stance, hold support, lower the back knee toward the floor.",
        beg: "Short range, more support.", std: "Light fingertip support.", hard: "Less support, deeper range.",
        reps: "3 × 8–12 / leg", mistakes: "Front knee collapsing inward.", why: "Single-leg strength for lunging to the shuttle." },
      { name: "Bulgarian split squat", cat: "Lower-Body Strength", tags: ["chair", "lower", "intermediate"],
        how: "Rear foot on a chair, lower straight down, drive up through the front heel.",
        beg: "Lower chair / short range.", std: "Full controlled range.", hard: "Hold a backpack.",
        reps: "3 × 8–12 / leg", mistakes: "Leaning too far forward; bouncing.", why: "Strong single-leg lunge power and control for the court." },
      { name: "Reverse lunge", cat: "Lower-Body Strength", tags: ["none", "lower", "beginner"],
        how: "Step backward and lower the back knee, then return.",
        beg: "Hold support.", std: "Controlled, upright.", hard: "Add a backpack.",
        reps: "3 × 8–12 / leg", mistakes: "Short choppy steps; knee slamming down.", why: "Joint-friendly single-leg strength and balance." },
      { name: "Forward lunge", cat: "Lower-Body Strength", tags: ["none", "lower", "intermediate"],
        how: "Step forward, lower under control, push back to standing.",
        beg: "Smaller step.", std: "Full controlled lunge.", hard: "Add load or slow tempo.",
        reps: "3 × 8–12 / leg", mistakes: "Knee diving past the toes hard.", why: "Trains the braking action of reaching for the net." },
      { name: "Lateral lunge", cat: "Lower-Body Strength", tags: ["none", "lower", "intermediate"],
        how: "Step wide to the side, sit into that hip, push back to centre.",
        beg: "Short step, shallow.", std: "Wider, deeper.", hard: "Hold a backpack.",
        reps: "3 × 8–12 / side", mistakes: "Letting the knee cave; rounding back.", why: "Directly mimics sideways court movement and recovery." },
      { name: "Step-up", cat: "Lower-Body Strength", tags: ["chair", "lower", "beginner"],
        how: "Step onto a stable step, stand tall, lower with control.",
        beg: "Low step.", std: "Knee-height step.", hard: "Add a backpack or slow descent.",
        reps: "3 × 8–12 / leg", mistakes: "Pushing off the bottom foot.", why: "Single-leg drive for lunging and jumping." },
      { name: "Glute bridge", cat: "Lower-Body Strength", tags: ["none", "lower", "beginner"],
        how: "Lie on your back, knees bent, drive hips up, squeeze, lower.",
        beg: "Smaller lift.", std: "Full hip extension, pause.", hard: "Add a backpack on hips.",
        reps: "3 × 12–20", mistakes: "Arching the lower back instead of squeezing glutes.", why: "Hip power for explosive movement and lunge recovery." },
      { name: "Single-leg glute bridge", cat: "Lower-Body Strength", tags: ["none", "lower", "intermediate"],
        how: "Bridge driving through one foot, other leg extended.",
        beg: "Other foot lightly touching.", std: "Full single-leg lift.", hard: "Pause at top.",
        reps: "3 × 8–12 / leg", mistakes: "Hips tilting/dropping to one side.", why: "Balances left/right hip strength for stable lunges." },
      { name: "Backpack Romanian deadlift", cat: "Lower-Body Strength", tags: ["backpack", "lower", "intermediate"],
        how: "Hold a backpack, hinge hips back with a flat back, feel the hamstrings, stand.",
        beg: "Lighter pack, smaller range.", std: "Hinge to mid-shin.", hard: "Heavier pack / slow lowering.",
        reps: "3 × 10–15", mistakes: "Rounding the back; squatting instead of hinging.", why: "Strong hamstrings and back for deceleration and lunges." },
      { name: "Supported single-leg Romanian deadlift", cat: "Lower-Body Strength", tags: ["chair", "lower", "advanced"],
        how: "Hold support, hinge on one leg as the other extends behind.",
        beg: "Toe of rear foot stays down.", std: "Light support.", hard: "Hold a light backpack.",
        reps: "3 × 6–10 / leg", mistakes: "Twisting the hips open.", why: "Single-leg balance and hamstring control for the court." },
      { name: "Single-leg sit-to-stand progression", cat: "Lower-Body Strength", tags: ["chair", "lower", "advanced"],
        how: "From a chair, stand using mostly one leg, lower with control.",
        beg: "High seat, light second-foot help.", std: "Standard seat, minimal help.", hard: "Lower seat, no help.",
        reps: "3 × 3–8 / leg", mistakes: "Falling back into the seat.", why: "Builds toward strong single-leg lunges and jumps." },

      // CALF, ANKLE, FOOT
      { name: "Straight-knee calf raise", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "beginner"],
        how: "Stand tall, rise onto the balls of your feet, lower slowly.",
        beg: "Hold support, both feet.", std: "Full range, light support.", hard: "Off a step for more range.",
        reps: "3 × 12–20", mistakes: "Rushing; partial range.", why: "Achilles and calf durability for jumping and quick steps." },
      { name: "Bent-knee calf raise", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "beginner"],
        how: "Soft-bend the knees and raise onto the balls of the feet.",
        beg: "Both feet, support.", std: "Full range.", hard: "Single leg.",
        reps: "3 × 12–20", mistakes: "Bouncing.", why: "Targets the lower calf (soleus) used in repeated court hops." },
      { name: "Single-leg calf raise", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "intermediate"],
        how: "Rise onto the ball of one foot, lower slowly.",
        beg: "Light support, partial range.", std: "Full range, light balance.", hard: "Off a step.",
        reps: "3 × 10–20 / leg", mistakes: "Letting the ankle roll out.", why: "Key durability marker before jumping work." },
      { name: "Loaded single-leg calf raise", cat: "Calf, Ankle & Foot Durability", tags: ["backpack", "lower", "advanced"],
        how: "Single-leg calf raise holding a backpack.",
        beg: "Light pack.", std: "Moderate pack, full range.", hard: "Off a step with load.",
        reps: "3 × 8–15 / leg", mistakes: "Cutting the range short.", why: "Stronger Achilles to absorb landings and push off hard." },
      { name: "Tibialis raise against a wall", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "beginner"],
        how: "Lean lightly on a wall, lift the toes/feet up toward the shins, lower slowly.",
        beg: "Feet closer to wall.", std: "Feet further out.", hard: "More reps / slow tempo.",
        reps: "2 × 15–25", mistakes: "Rushing the lowering.", why: "Front-of-shin strength helps braking and reduces shin overload." },
      { name: "Toe yoga", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "mobility", "beginner"],
        how: "Lift the big toe while keeping the others down, then reverse.",
        beg: "Seated.", std: "Standing.", hard: "Single-leg standing.",
        reps: "2 × 10 each way", mistakes: "Forcing it; cramping—go gently.", why: "Foot control for stable, agile footwork." },
      { name: "Short-foot exercise", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "beginner"],
        how: "Gently draw the ball of the foot toward the heel to raise the arch, without curling toes.",
        beg: "Seated.", std: "Standing two feet.", hard: "Single leg.",
        reps: "2 × 8–10 holds", mistakes: "Curling the toes.", why: "Builds the foot's arch support for landings." },
      { name: "Single-leg balance", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "footwork", "beginner"],
        how: "Stand on one leg, stay tall and steady.",
        beg: "Fingertip support.", std: "No support, 20–30s.", hard: "Eyes closed (near support).",
        reps: "3 × 20–40s / leg", mistakes: "Locking the knee; hopping.", why: "Stability for single-leg lunges and reaching shots." },
      { name: "Single-leg balance with gentle head turns", cat: "Calf, Ankle & Foot Durability", tags: ["none", "lower", "footwork", "intermediate"],
        how: "Balance on one leg and slowly turn the head side to side / up & down.",
        beg: "Near support, small turns.", std: "Slow full turns.", hard: "Eyes-tracking added.",
        reps: "2 × 20–30s / leg", mistakes: "Moving fast.", why: "Trains balance while the eyes track the shuttle." },
      { name: "Resistance-band ankle inversion", cat: "Calf, Ankle & Foot Durability", tags: ["band", "lower", "beginner"],
        how: "Band around the foot, turn the sole gently inward against resistance.",
        beg: "Light band.", std: "Moderate band, slow.", hard: "More reps / firmer band.",
        reps: "2 × 12–15 / side", mistakes: "Moving the whole leg.", why: "Ankle resilience to reduce rolling on quick changes of direction." },
      { name: "Resistance-band ankle eversion", cat: "Calf, Ankle & Foot Durability", tags: ["band", "lower", "beginner"],
        how: "Band around the foot, turn the sole gently outward against resistance.",
        beg: "Light band.", std: "Moderate band, slow.", hard: "More reps / firmer band.",
        reps: "2 × 12–15 / side", mistakes: "Using the leg, not the ankle.", why: "Supports the outside of the ankle for lateral court moves." },

      // CORE
      { name: "Dead bug", cat: "Core Control", tags: ["none", "core", "beginner"],
        how: "On your back, lower opposite arm and leg while keeping the back flat, alternate.",
        beg: "Smaller range.", std: "Full reach, slow.", hard: "Pause at full reach.",
        reps: "2 × 8–12 / side", mistakes: "Lower back arching off the floor.", why: "Core control that protects the back during overhead shots." },
      { name: "Bird dog", cat: "Core Control", tags: ["none", "core", "beginner"],
        how: "On hands and knees, extend opposite arm and leg, stay level, return.",
        beg: "Arm or leg only.", std: "Opposite arm + leg.", hard: "Pause and add a small reach.",
        reps: "2 × 8–12 / side", mistakes: "Twisting / sagging.", why: "Trunk stability for balanced lunging and reaching." },
      { name: "Front plank", cat: "Core Control", tags: ["none", "core", "beginner"],
        how: "Forearms and toes, body in a straight line, brace.",
        beg: "From knees.", std: "Full plank 20–45s.", hard: "Longer / slight reaches.",
        reps: "2–3 × 20–45s", mistakes: "Hips sagging or piking.", why: "Stiff trunk transfers force from legs to racket." },
      { name: "Side plank", cat: "Core Control", tags: ["none", "core", "intermediate"],
        how: "On one forearm, stack the body, lift the hips, hold.",
        beg: "From knees.", std: "Full, 20–45s.", hard: "Top leg lifts.",
        reps: "2 × 30–60s / side", mistakes: "Hips dropping.", why: "Sideways trunk strength for lunges and direction changes." },
      { name: "Slow mountain climber", cat: "Core Control", tags: ["none", "core", "intermediate"],
        how: "From a plank, draw one knee in slowly, alternate, stay stable.",
        beg: "Hands elevated.", std: "Slow, controlled.", hard: "Lower hands / faster but controlled.",
        reps: "2 × 8–12 / side", mistakes: "Hips bouncing.", why: "Core stability with a moving leg, like court movement." },
      { name: "Pallof press with a resistance band", cat: "Core Control", tags: ["band", "core", "intermediate"],
        how: "Band anchored to the side, press it straight out and resist the twist.",
        beg: "Light band, kneeling.", std: "Standing, moderate.", hard: "Split stance / firmer band.",
        reps: "2 × 8–12 / side", mistakes: "Letting the torso rotate.", why: "Anti-rotation strength to control fast twists and swings." },
      { name: "Suitcase carry with a backpack or loaded bag", cat: "Core Control", tags: ["backpack", "core", "intermediate"],
        how: "Hold a load in one hand and walk tall without leaning.",
        beg: "Lighter load, short walk.", std: "Moderate, 20–40s.", hard: "Heavier / longer.",
        reps: "2 × 20–40s / side", mistakes: "Leaning toward the load.", why: "Resists side-bending; steadies the trunk on the move." },

      // UPPER BODY / SHOULDER
      { name: "Standard push-up", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "intermediate"],
        how: "Hands under shoulders, lower with elbows ~45°, press up, body straight.",
        beg: "See incline push-up.", std: "Full range to floor.", hard: "Slow tempo or feet elevated.",
        reps: "3 × 8–15", mistakes: "Sagging hips; flaring elbows.", why: "Pressing strength and trunk stability for overhead shots." },
      { name: "Incline push-up", cat: "Upper Body & Shoulder Support", tags: ["none", "chair", "upper", "beginner"],
        how: "Hands on a sturdy raised surface, push-up at an angle.",
        beg: "Higher surface.", std: "Counter height.", hard: "Lower surface.",
        reps: "3 × 10–15", mistakes: "Dropping the hips.", why: "Joint-friendly entry to push-up strength." },
      { name: "Feet-elevated push-up", cat: "Upper Body & Shoulder Support", tags: ["chair", "upper", "advanced"],
        how: "Feet on a step, hands on the floor, push-up.",
        beg: "Low step.", std: "Knee-height step.", hard: "Slow tempo.",
        reps: "3 × 6–12", mistakes: "Letting the hips pike or sag.", why: "More shoulder demand for stronger overhead power." },
      { name: "Slow-tempo push-up", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "intermediate"],
        how: "Lower over 3–4 seconds, brief pause, press up.",
        beg: "Incline version.", std: "Full range, slow down.", hard: "Slower still / feet elevated.",
        reps: "3 × 5–10", mistakes: "Rushing the lowering.", why: "Builds control and strength without extra load." },
      { name: "Resistance-band row", cat: "Upper Body & Shoulder Support", tags: ["band", "upper", "beginner"],
        how: "Anchor the band, pull the elbows back, squeeze the shoulder blades.",
        beg: "Light band.", std: "Moderate, full squeeze.", hard: "Firmer band / pause.",
        reps: "3 × 10–15", mistakes: "Shrugging the shoulders up.", why: "Upper-back strength to balance the shoulder and steady the swing." },
      { name: "One-arm backpack row", cat: "Upper Body & Shoulder Support", tags: ["backpack", "chair", "upper", "intermediate"],
        how: "Brace a hand on a chair, hinge over, row a backpack to the hip.",
        beg: "Light pack.", std: "Moderate, controlled.", hard: "Heavier / slow.",
        reps: "3 × 10–15 / arm", mistakes: "Twisting the torso.", why: "Pulling strength and posture for repeated overhead play." },
      { name: "Band face pull", cat: "Upper Body & Shoulder Support", tags: ["band", "upper", "beginner"],
        how: "Pull the band toward the face, elbows high, squeeze the rear shoulders.",
        beg: "Light band.", std: "Moderate, slow.", hard: "Pause at the end.",
        reps: "3 × 12–20", mistakes: "Using the lower back.", why: "Rear-shoulder health for the smashing/clearing motion." },
      { name: "Band external rotation", cat: "Upper Body & Shoulder Support", tags: ["band", "upper", "beginner"],
        how: "Elbow at the side, rotate the forearm outward against the band.",
        beg: "Light band, small range.", std: "Moderate, full range.", hard: "More reps / firmer band.",
        reps: "2 × 12–15 / arm", mistakes: "Elbow drifting away from the side.", why: "Rotator-cuff strength to protect the shoulder in overhead shots." },
      { name: "Wall slide", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "mobility", "beginner"],
        how: "Back to a wall, slide the arms up and down keeping contact.",
        beg: "Smaller range.", std: "Full smooth range.", hard: "Slower / light band.",
        reps: "2 × 8–12", mistakes: "Arching the lower back.", why: "Shoulder mobility and control for clean overhead reach." },
      { name: "Prone Y raise", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "beginner"],
        how: "Face down, arms in a Y, lift slightly, squeeze, lower.",
        beg: "Small lift.", std: "Controlled lift, pause.", hard: "Hold light bottles.",
        reps: "2 × 10–15", mistakes: "Shrugging.", why: "Lower-trap strength for a stable shoulder overhead." },
      { name: "Prone T raise", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "beginner"],
        how: "Face down, arms out in a T, lift and squeeze the shoulder blades.",
        beg: "Small lift.", std: "Controlled, pause.", hard: "Light bottles.",
        reps: "2 × 10–15", mistakes: "Using momentum.", why: "Mid-back strength for posture and shoulder balance." },
      { name: "Prone W raise", cat: "Upper Body & Shoulder Support", tags: ["none", "upper", "beginner"],
        how: "Face down, bend elbows into a W, lift and rotate, squeeze.",
        beg: "Small range.", std: "Controlled.", hard: "Pause / light bottles.",
        reps: "2 × 10–15", mistakes: "Shrugging the neck.", why: "Rear shoulder and posture support for overhead work." },
      { name: "Wrist flexion with a light bottle", cat: "Upper Body & Shoulder Support", tags: ["upper", "beginner"],
        how: "Forearm supported, curl the wrist up with a light bottle, lower slowly.",
        beg: "Very light.", std: "Light, full range.", hard: "Slightly heavier / slow.",
        reps: "2 × 12–15", mistakes: "Moving the whole arm.", why: "Wrist and forearm strength for racket control." },
      { name: "Wrist extension with a light bottle", cat: "Upper Body & Shoulder Support", tags: ["upper", "beginner"],
        how: "Forearm supported, lift the back of the hand up, lower slowly.",
        beg: "Very light.", std: "Light, full range.", hard: "Slightly heavier / slow.",
        reps: "2 × 12–15", mistakes: "Rushing.", why: "Protects the wrist for repeated flicks and net play." },
      { name: "Forearm pronation & supination with a light load", cat: "Upper Body & Shoulder Support", tags: ["upper", "beginner"],
        how: "Hold a light bottle/hammer-shaped object, rotate the palm up and down slowly.",
        beg: "Short lever / very light.", std: "Light, full rotation.", hard: "Longer lever.",
        reps: "2 × 10–12 each way", mistakes: "Using the shoulder.", why: "Forearm rotation strength for powerful, controlled strokes." },

      // MOBILITY
      { name: "Ankle knee-to-wall movement", cat: "Mobility", tags: ["none", "mobility", "lower", "beginner"],
        how: "Drive the knee toward the wall over the toes, keeping the heel down.",
        beg: "Closer, smaller.", std: "Push to a gentle limit.", hard: "Slightly further out.",
        reps: "2 × 8–10 / side", mistakes: "Heel lifting.", why: "Ankle range for deep lunges and smooth landings." },
      { name: "Gentle calf stretch", cat: "Mobility", tags: ["none", "mobility", "lower", "beginner"],
        how: "Step one foot back, heel down, lean into a gentle stretch.",
        beg: "Lighter lean.", std: "Hold 20–30s.", hard: "Bent-knee variation too.",
        reps: "2 × 20–30s / side", mistakes: "Bouncing; over-stretching.", why: "Eases calf tightness between sessions." },
      { name: "Hip-flexor stretch", cat: "Mobility", tags: ["none", "mobility", "lower", "beginner"],
        how: "Half-kneel, tuck the hips, ease forward gently.",
        beg: "Smaller range.", std: "Hold 20–30s.", hard: "Add a slight reach overhead.",
        reps: "2 × 20–30s / side", mistakes: "Arching the back.", why: "Frees the hips for a longer lunge and upright posture." },
      { name: "Adductor rock-back", cat: "Mobility", tags: ["none", "mobility", "lower", "beginner"],
        how: "On hands and knees, take one leg out to the side, rock the hips back gently.",
        beg: "Small rock.", std: "Smooth rocking.", hard: "Wider leg position.",
        reps: "2 × 8–10 / side", mistakes: "Forcing the inner thigh.", why: "Inner-thigh mobility for wide lateral lunges." },
      { name: "Thoracic rotation", cat: "Mobility", tags: ["none", "mobility", "upper", "beginner"],
        how: "Side-lying or quadruped, rotate the upper back open and follow with the eyes.",
        beg: "Small turn.", std: "Full smooth turn.", hard: "Brief end-range pause.",
        reps: "2 × 6–8 / side", mistakes: "Forcing the lower back to twist.", why: "Upper-back rotation for the overhead and around-the-head shots." },
      { name: "Arm circles", cat: "Mobility", tags: ["none", "mobility", "upper", "beginner"],
        how: "Make smooth controlled circles, forward then backward.",
        beg: "Small circles.", std: "Full circles.", hard: "Larger / slower.",
        reps: "2 × 10 each way", mistakes: "Rushing / shrugging.", why: "Warms the shoulders before play." },
      { name: "Controlled shoulder rotations", cat: "Mobility", tags: ["none", "mobility", "upper", "beginner"],
        how: "Slowly rotate the shoulders through their range with control.",
        beg: "Small range.", std: "Full, smooth.", hard: "Add a light band.",
        reps: "2 × 8–10", mistakes: "Hard, jerky movement.", why: "Keeps the shoulder loose and healthy for overhead play." },

      // PLYOMETRICS
      { name: "Two-foot pogo hops", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "intermediate"],
        how: "Small quick hops on the balls of the feet, stiff ankles, quiet landings.",
        beg: "Very small, slow.", std: "Small, springy, quiet.", hard: "Slightly higher, still quiet.",
        reps: "2 × 10–20", mistakes: "Heavy, loud landings.", why: "Builds springy ankles for quick repeated court hops." },
      { name: "Side-to-side line steps", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "beginner"],
        how: "Step quickly side to side over an imaginary line, light feet.",
        beg: "Slow steps.", std: "Quicker, controlled.", hard: "Add small hops.",
        reps: "2 × 20–30s", mistakes: "Crossing the feet awkwardly.", why: "Lateral quickness for covering the sides." },
      { name: "Small side-to-side line hops", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "intermediate"],
        how: "Small two-foot hops left and right over a line, quiet landings.",
        beg: "Slow, small.", std: "Quicker, controlled.", hard: "Single-leg later.",
        reps: "2 × 20–30s", mistakes: "Stiff, loud landings.", why: "Elastic lateral push for fast direction changes." },
      { name: "Imaginary skipping", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "beginner"],
        how: "Mimic skipping footwork without a rope, light and rhythmic.",
        beg: "Slow.", std: "Steady rhythm.", hard: "Faster bursts.",
        reps: "3 × 20s", mistakes: "Landing flat-footed.", why: "Calf conditioning and rhythm with no equipment." },
      { name: "Skipping rope", cat: "Low-Level Plyometrics", tags: ["rope", "footwork", "lower", "intermediate"],
        how: "Skip with low, quiet bounces on the balls of the feet.",
        beg: "Short sets, slow.", std: "Steady 20–40s sets.", hard: "Longer sets / light variations.",
        reps: "3 × 20–40s", mistakes: "Jumping too high.", why: "Excellent calf and timing conditioning for badminton." },
      { name: "Small lateral bound with a controlled stick landing", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "advanced"],
        how: "Push gently to one side, land softly on one foot and 'stick' it still.",
        beg: "Tiny bound, both feet.", std: "Small bound, stick on one foot.", hard: "Slightly wider, fully controlled.",
        reps: "2 × 6–8 / side", mistakes: "Wobbling / loud landing.", why: "Trains the braking and balance of lunging sideways." },
      { name: "Squat jump with a quiet landing", cat: "Low-Level Plyometrics", tags: ["none", "footwork", "lower", "advanced"],
        how: "Small squat, jump, land soft and quiet into a squat, reset.",
        beg: "Very low jump.", std: "Moderate, quiet.", hard: "A touch higher, still soft.",
        reps: "2 × 6–10", mistakes: "Hard, noisy landings; knees caving.", why: "Builds toward jumping for smashes — control before height." },

      // BALANCE, AGILITY & COORDINATION (indoor, no court needed)
      { name: "Tandem (heel-to-toe) balance", cat: "Balance, Agility & Coordination", tags: ["none", "balance", "lower", "beginner"],
        how: "Stand with one foot directly in front of the other, heel touching toe, and hold steady and tall.",
        beg: "Fingertip on a wall.", std: "No support, 20–40s.", hard: "Eyes closed near a wall.",
        reps: "3 × 20–40s / lead foot", mistakes: "Looking down; stiff, locked knees.", why: "A steady, narrow base — the control you need to stop and change direction without wobbling." },
      { name: "Single-leg reach (3-direction)", cat: "Balance, Agility & Coordination", tags: ["none", "balance", "lower", "intermediate"],
        how: "Balance on one leg. With the other foot lightly reach forward, then out to the side, then behind — touching the floor lightly and returning tall each time.",
        beg: "Small reaches with light support.", std: "Bigger reaches, no support.", hard: "Slower, no floor touch.",
        reps: "2 × 5 reaches each way / leg", mistakes: "Knee caving inward; rushing.", why: "Almost exactly the controlled single-leg reach you make lunging to each corner of the court." },
      { name: "Single-leg balance with wall ball toss", cat: "Balance, Agility & Coordination", tags: ["none", "balance", "footwork", "intermediate"],
        how: "Stand on one leg and gently toss a soft ball (or rolled-up socks) against a wall and catch it, staying balanced.",
        beg: "Two feet, easy catches.", std: "One leg, steady.", hard: "Vary the toss height and side.",
        reps: "2 × 20–30s / leg", mistakes: "Hopping; losing tall posture.", why: "Trains balance, hand-eye and reaction together — like steadying yourself to play a shot." },
      { name: "Standing split-step reaction", cat: "Balance, Agility & Coordination", tags: ["none", "footwork", "balance", "beginner"],
        how: "From a relaxed ready stance, do a small split step (tiny soft hop), then immediately push one step toward a direction, and recover to centre.",
        beg: "Slow, choose the direction yourself.", std: "React to a random cue (a sound, or a hand you flash).", hard: "Quicker cue, smaller recovery.",
        reps: "2 × 8–10 reactions", mistakes: "Heavy, flat-footed landing.", why: "Grooves the split step and explosive first step that start every single movement in badminton." },
      { name: "Shadow swings (overhead & net)", cat: "Balance, Agility & Coordination", tags: ["none", "upper", "footwork", "balance", "beginner"],
        how: "With no shuttle (racket optional), rehearse the swing of an overhead clear/drop/smash, and a gentle net shot — smooth and controlled.",
        beg: "Slow, focus on the shape.", std: "Add a small lunge or step with each.", hard: "Link 4–6 different shots in a flow.",
        reps: "2–3 × 8–10 swings", mistakes: "Rushing; no follow-through.", why: "Grooves your stroke technique and timing indoors, so it feels natural when you're back on court." },
      { name: "Wall rebound catch (reaction)", cat: "Balance, Agility & Coordination", tags: ["none", "upper", "balance", "beginner"],
        how: "Throw a soft ball at a wall a short distance away and catch the rebound; vary the speed and angle.",
        beg: "Soft and predictable.", std: "Faster or off to the side.", hard: "One hand / smaller ball.",
        reps: "2 × 30–45s", mistakes: "Stiff hands; watching only one spot.", why: "Sharpens hand-eye coordination and reaction speed for fast exchanges and net play." },
      { name: "Quick feet on the spot", cat: "Balance, Agility & Coordination", tags: ["none", "footwork", "balance", "lower", "intermediate"],
        how: "Fast, light, small steps on the balls of your feet on the spot — stay low, quiet and relaxed.",
        beg: "Slow, short bursts.", std: "15–20s bursts.", hard: "Change direction on a cue.",
        reps: "4 × 15–20s", mistakes: "Standing tall; heavy, noisy feet.", why: "Builds foot speed and a low, ready position so you start moving quickly to the shuttle." },
      { name: "Reaction drop-catch", cat: "Balance, Agility & Coordination", tags: ["none", "balance", "beginner"],
        how: "Hold a ball or shuttle at shoulder height, let it drop, and catch it — first after one bounce, then before it bounces.",
        beg: "Catch after a bounce, two hands.", std: "Catch before the bounce, one hand.", hard: "Drop it off-centre so you must move.",
        reps: "2 × 10–15", mistakes: "Watching your hand instead of the object.", why: "Trains pure reaction time and tracking — directly useful for returning fast shots." },
    ],

    /* ---- Strength sessions (Today + Weekly) ---- */
    sessions: {
      A: {
        name: "Strength Session A",
        load: "Challenging",
        items: [
          { ref: "Bulgarian split squat", alt: "Supported split squat", cat: "Lower-Body Strength", sets: "3 × 8–12 / leg" },
          { ref: "Standard push-up", cat: "Upper Body & Shoulder Support", sets: "3 × 8–15" },
          { ref: "One-arm backpack row", alt: "Resistance-band row", cat: "Upper Body & Shoulder Support", sets: "3 × 10–15 / arm" },
          { ref: "Single-leg calf raise", cat: "Calf, Ankle & Foot Durability", sets: "3 × 10–20 / leg" },
          { ref: "Tibialis raise against a wall", cat: "Calf, Ankle & Foot Durability", sets: "2 × 15–25" },
          { ref: "Side plank", cat: "Core Control", sets: "2 × 30–60s / side" },
        ],
        optional: [
          { ref: "Band face pull", cat: "Upper Body & Shoulder Support", sets: "2 × 12–20" },
        ],
      },
      B: {
        name: "Strength Session B",
        load: "Challenging",
        items: [
          { ref: "Backpack squat", cat: "Lower-Body Strength", sets: "3 × 10–15" },
          { ref: "Backpack Romanian deadlift", cat: "Lower-Body Strength", sets: "3 × 10–15" },
          { ref: "Lateral lunge", cat: "Lower-Body Strength", sets: "3 × 8–12 / side" },
          { ref: "Standard push-up", alt: "Incline push-up", cat: "Upper Body & Shoulder Support", sets: "3 × 8–15" },
          { ref: "Resistance-band row", alt: "One-arm backpack row", cat: "Upper Body & Shoulder Support", sets: "3 × 10–15" },
          { ref: "Bent-knee calf raise", cat: "Calf, Ankle & Foot Durability", sets: "3 × 12–20 / side" },
          { ref: "Band face pull", alt: "Prone W raise", cat: "Upper Body & Shoulder Support", sets: "2 × 12–20" },
          { ref: "Dead bug", alt: "Bird dog", cat: "Core Control", sets: "2 × 8–12 / side" },
        ],
        optional: [],
      },
    },

    /* ---- Running progression levels ---- */
    runLevels: [
      { n: 1, title: "Level 1 — Jog 4 / Walk 2 × 5", steps: ["5-min brisk walk warm-up", "Jog gently 4 min", "Walk 2 min", "Repeat the jog–walk cycle 5 times", "5-min gentle walk cool-down"] },
      { n: 2, title: "Level 2 — Jog 5 / Walk 1.5 × 5", steps: ["5-min brisk walk warm-up", "Jog gently 5 min", "Walk 90 seconds", "Repeat 5 times", "5-min cool-down"] },
      { n: 3, title: "Level 3 — Jog 7 / Walk 1.5 × 4", steps: ["5-min brisk walk warm-up", "Jog gently 7 min", "Walk 90 seconds", "Repeat 4 times", "5-min cool-down"] },
      { n: 4, title: "Level 4 — Jog 10 / Walk 1.5 × 3", steps: ["5-min brisk walk warm-up", "Jog gently 10 min", "Walk 90 seconds", "Repeat 3 times", "5-min cool-down"] },
      { n: 5, title: "Level 5 — Continuous 30-min jog", steps: ["5-min brisk walk warm-up", "Continuous easy jog 30 min", "5-min cool-down"] },
      { n: 6, title: "Optional — Beginner intervals", steps: ["5-min warm-up walk", "6 rounds of: 30s faster jog + 90s walk", "5-min cool-down walk", "Progress later to 8 rounds, then a slightly shorter walk — never increase speed, rounds and reduced recovery at the same time."] },
    ],

    /* ---- Footwork levels ---- */
    footworkLevels: [
      { n: 1, title: "Level 1 — Technique", rounds: 6, work: 30, rest: 60, note: "60–70% effort. Prioritise balanced, quiet movement." },
      { n: 2, title: "Level 2 — Added volume", rounds: 8, work: 30, rest: 60, note: "Keep movement clean as volume rises." },
      { n: 3, title: "Level 3 — Added volume", rounds: 10, work: 30, rest: 60, note: "Stay relaxed and controlled." },
      { n: 4, title: "Level 4 — Longer work intervals", rounds: 8, work: 40, rest: 60, note: "Longer efforts; keep good form to the end." },
      { n: 5, title: "Level 5 — More demanding", rounds: 10, work: 40, rest: 50, note: "45–60s rest. Only progress when form stays clean." },
    ],

    /* ---- Default weekly plan ---- */
    weekDefault: [
      { day: "Monday", items: ["Strength Session A", "Optional easy walk"], type: "strengthA" },
      { day: "Tuesday", items: ["Easy run-walk progression session", "Optional short mobility routine"], type: "run" },
      { day: "Wednesday", items: ["Six-corner shadow badminton", "Easy walk"], type: "footwork" },
      { day: "Thursday", items: ["Strength Session B"], type: "strengthB" },
      { day: "Friday", items: ["Easy run-walk progression session"], type: "run" },
      { day: "Saturday", items: ["Easy walk, low-volume hopping readiness, relaxed badminton, or rest (depending on recovery)"], type: "flex" },
      { day: "Sunday", items: ["Third easy run-walk session or rest"], type: "rest" },
    ],

    milestones: [
      "Continue gradual weight loss without crash dieting",
      "Complete two balanced full-body strength sessions each week",
      "Reach 15–20 controlled single-leg calf raises per side",
      "Reach 10 controlled split squats per side",
      "Balance comfortably for 30 seconds per side",
      "Jog continuously for 30 minutes",
      "Complete 6 controlled rounds of shadow badminton",
      "Gradually reintroduce one relaxed badminton court session per week",
    ],
  };

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  /* ----------------------------------------------------------
     2. STATE  (localStorage)
     ---------------------------------------------------------- */
  const KEY = "badmintonFitness.v1";
  const APP_START = "2026-01-05"; // Monday — used to compute "current training week"

  function defaultState() {
    return {
      version: 1,
      theme: "light",
      profile: {
        sex: "Male", age: 24,
        heightCm: 170, heightImp: "5 ft 7 in",
        weight: 82, startWeight: 91,
        summary:
          "Returning badminton player, age 24, rebuilding fitness after a long sedentary period. Lost ~9 kg over 6 months, " +
          "walks 5 km regularly, has started adding light jogging, and has previous badminton experience. " +
          "Main goal: build a leaner, stronger, more agile, badminton-ready body through home training, outdoor running, footwork practice, and a gradual return to court sessions.",
        lifestyle: "Roughly 7 years mostly sedentary — but the last 6 months have been a real turnaround. Returning from inactivity, not starting from zero.",
        progress:
          "Lost ~9 kg in 6 months via a slight calorie deficit and becoming more active. " +
          "Has done 100 push-ups/day consistently for ~6 months (pushing endurance above beginner level). " +
          "Walking 5 km daily for ~1 month; calves were worked at first but have since adapted to a normal 5 km walk. " +
          "On a recent trip walked 23+ km on two days — calves ached the next morning and recovered normally. " +
          "Now adding jogging to the 5 km route and can jog a decent portion of it; calves feel temporarily worked/burning during jogging but it is NOT sharp pain, not one-sided, no swelling, no limp, and settles straight after. " +
          "Played badminton ~once a week at school (inter-school competitions) and at a community leisure-centre group alongside ex-county players — experienced but rusty after ~7 years away; recently rekindled the love for it on holiday.",
        goal: "Get into the best realistic shape for badminton: leaner, stronger, fitter, quicker, more agile and balanced, with resilient calves/ankles/feet/knees/hips/Achilles — ready for lunges, braking, split steps, side-to-side movement, repeated bursts and eventually jumping. Home/outdoor training only, no normal gym. Not aiming for a bodybuilder physique.",
        environment: "Home, outdoors, walking/running routes, and eventually a badminton court.",
        goalRange: "No single compulsory weight — track the trend down, waist, movement quality and performance",
        waist: "",
        weeklyChange: "Gradual, sustainable fat loss (~0.3–0.5 kg/week)",
      },
      equipment: { bodyweight: true, backpack: true, band: true, rope: true, chair: true, floor: true },
      trainingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      runLevel: 2,        // you already jog a good portion of 5 km — start above the absolute-easiest level and adjust
      footworkLevel: 1,   // start footwork at technique level (the right place to begin, even for an experienced player)
      jumpingUnlocked: false,
      reminderText: "Train on most weekdays. Leave a recovery day between hard sessions while building your base.",
      week: DATA.weekDefault.map((d) => ({ ...d, items: d.items.slice() })),
      // per-session customisation: { 'A': { variation: {ref->chosen}, sets:{}, notes:{} }, 'B': {...} }
      sessionCustom: { A: { variation: {}, sets: {}, notes: {} }, B: { variation: {}, sets: {}, notes: {} } },
      exerciseFeel: {},   // name -> { rating, note }
      completions: {},    // "YYYY-MM-DD" -> { sessionKey, results:{}, notes, done:true }
      weekStatus: {},     // "weekKey:Day" -> { done, rest, movedTo }
      dayOverride: {},    // "YYYY-MM-DD" -> session type chosen via the swap picker
      dayAdvance: {},     // "YYYY-MM-DD" -> how many sessions ahead pulled via "next session"
      extraActivities: [], // ad-hoc logged activities: { id, date, what, note }
      runLogs: [],
      footworkLogs: [],
      progress: {
        weight: [
          { date: "2026-01-01", value: 91 },
          { date: todayISO(), value: 82 },
        ],
        waist: [],
        calfRaise: [], splitSquat: [], balance: [], pushups: [],
        notes: "",
      },
      milestones: DATA.milestones.map((m) => ({ text: m, done: false })),
      lastSessionResults: {}, // exerciseName -> last actual result string
    };
  }

  let state = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // shallow merge so new fields appear after upgrades
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      console.warn("Could not load saved data, starting fresh.", e);
      return defaultState();
    }
  }
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { console.error("Save failed", e); toast("Could not save (storage full?)"); }
    }, 120);
  }

  /* ----------------------------------------------------------
     3. Derived helpers
     ---------------------------------------------------------- */
  function libByName(name) { return DATA.library.find((e) => e.name === name); }
  function libByCat(cat) { return DATA.library.filter((e) => e.cat === cat); }
  function currentWeekNumber() {
    const start = new Date(APP_START + "T00:00:00");
    const now = new Date(todayISO() + "T00:00:00");
    const diff = Math.floor((now - start) / (7 * 864e5));
    return Math.max(1, diff + 1);
  }
  function weekKey() { return "w" + currentWeekNumber(); }
  function todaysPlannedType() {
    const dayName = DAYS[new Date(todayISO() + "T00:00:00").getDay()];
    const wd = state.week.find((d) => d.day === dayName);
    return { dayName, plan: wd };
  }
  // recovery mode lives in sessionStorage so it resets each app open but persists across tabs in a session
  function recovery() { return sessionStorage.getItem("recovery") || "good"; }
  function setRecovery(v) { sessionStorage.setItem("recovery", v); }

  /* ----------------------------------------------------------
     4. Rendering — router
     ---------------------------------------------------------- */
  const renderers = {
    today: renderToday, weekly: renderWeekly, library: renderLibrary,
    running: renderRunning, footwork: renderFootwork, progress: renderProgress,
    guidance: renderGuidance, settings: renderSettings,
  };
  let currentTab = "today";

  function go(tab, { keepScroll } = {}) {
    if (!renderers[tab]) tab = "today";
    currentTab = tab;
    $$(".tab-panel").forEach((p) => { p.hidden = p.dataset.tab !== tab; });
    $$(".navbtn").forEach((b) => b.classList.toggle("is-active", b.dataset.go === tab));
    renderers[tab]($("#tab-" + tab));
    if (!keepScroll) window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    $("#main").focus({ preventScroll: true });
    location.hash = tab;
  }

  /* ----------------------------------------------------------
     5. TAB 1 — TODAY
     ---------------------------------------------------------- */
  // The seven things you can do on any given day. Used by the workout body AND the swap picker.
  const SESSION_TYPES = {
    strengthA: { label: "Strength A",       emoji: "💪", need: "Home · small space",        kind: "strength", sessionKey: "A" },
    strengthB: { label: "Strength B",       emoji: "🏋️", need: "Home · small space",        kind: "strength", sessionKey: "B" },
    mobility:  { label: "Mobility & stretch", emoji: "🧘", need: "Quiet · tiny space · ideal late", kind: "mobility" },
    skills:    { label: "Balance & skills", emoji: "🤹", need: "Indoor · tiny space · no court", kind: "skills" },
    run:       { label: "Easy run–walk",    emoji: "🏃", need: "Outdoors",                  kind: "run" },
    footwork:  { label: "Footwork",         emoji: "🏸", need: "Needs clear floor space",   kind: "footwork" },
    walk:      { label: "Easy walk",        emoji: "🚶", need: "Outdoors · low effort",     kind: "walk" },
    rest:      { label: "Rest",             emoji: "😴", need: "Recovery",                   kind: "rest" },
  };
  // Order shown in the swap picker
  const SWAP_ORDER = ["strengthA", "strengthB", "mobility", "skills", "run", "footwork", "walk", "rest"];

  function workoutForToday() {
    const { dayName, plan } = todaysPlannedType();
    const scheduled = plan ? plan.type : "rest";
    const override = state.dayOverride && state.dayOverride[todayISO()];
    const type = override || scheduled;          // what we actually do today
    const def = SESSION_TYPES[type] || { kind: type === "flex" ? "flex" : "rest" };
    return Object.assign({ dayName, scheduled, type, isOverridden: !!override }, def);
  }

  function renderToday(root) {
    const wk = currentWeekNumber();
    const rec = recovery();
    const w = workoutForToday();
    const comp = state.completions[todayISO()] || null;

    let html = `
      <div class="page-head">
        <h1>Today</h1>
        <p class="sub">${esc(fmtDate(todayISO()))} · Training week ${wk} · ${esc(w.dayName)}</p>
      </div>`;

    // Profile summary + guiding principle (collapsed so it informs without cluttering)
    html += `
      <details class="acc no-print">
        <summary>👤 Your training profile &amp; approach</summary>
        <div class="acc-body">
          <p>${esc(state.profile.summary || "")}</p>
          <div class="note" style="margin-bottom:0"><strong>Guiding principle:</strong> train at the highest level you can recover from consistently. Progress when an exercise is clearly manageable and recovery stays normal. Reduce the workload only when genuine warning signs appear.</div>
        </div>
      </details>`;

    // Recovery selector
    html += `
      <div class="card">
        <h2>How do you feel today?</h2>
        <div class="segmented" role="group" aria-label="Recovery status">
          <button class="seg" data-rec="good"   aria-pressed="${rec==="good"}">Feeling good</button>
          <button class="seg" data-rec="tired"  aria-pressed="${rec==="tired"}">Slightly fatigued</button>
          <button class="seg" data-rec="rest"   aria-pressed="${rec==="rest"}">Need a recovery day</button>
        </div>
        ${rec==="tired" ? `<div class="note note-warn" style="margin-bottom:0">Reduced mode: volume trimmed ~20–30% and optional exercises removed.</div>` : ""}
        ${rec==="rest" ? `<div class="note" style="margin-bottom:0">Recovery mode: an easy walk, gentle mobility, or full rest is recommended today.</div>` : ""}
      </div>`;

    // Swap picker — change today's session to anything you can actually do right now
    html += swapPickerHTML(w);

    // Quick calf check (a 10-second gate) shown only before movement-heavy sessions
    if (rec !== "rest" && (w.kind === "run" || w.kind === "footwork" || w.kind === "flex")) {
      html += calfCheckHTML();
    }

    // Main workout body — the most important thing, shown right up top
    if (rec === "rest") {
      html += `
        <div class="card">
          <h2>Recovery day</h2>
          <ul>
            <li>An easy 20–40 min walk at a relaxed pace, or</li>
            <li>Gentle mobility (ankle knee-to-wall, calf stretch, hip-flexor stretch, thoracic rotation), or</li>
            <li>Full rest if you are run down.</li>
          </ul>
          <p class="muted">Reducing load when recovery worsens is part of the plan, not a setback.</p>
        </div>`;
    } else if (w.kind === "strength") {
      html += renderTodayStrength(w.sessionKey, rec, comp);
    } else if (w.kind === "run") {
      html += renderTodayRun(rec, comp);
    } else if (w.kind === "footwork") {
      html += renderTodayFootwork(rec, comp);
    } else if (w.kind === "mobility") {
      html += renderTodayMobility(rec, comp);
    } else if (w.kind === "skills") {
      html += renderTodaySkills(rec, comp);
    } else if (w.kind === "walk") {
      html += renderTodayWalk(rec, comp);
    } else if (w.kind === "flex") {
      html += `
        <div class="card">
          <h2>Flexible session</h2>
          <p>Pick what matches your recovery today:</p>
          <ul>
            <li>Easy walk (default, low cost)</li>
            <li>Low-volume hopping readiness (only if jumping is unlocked & calves feel good)</li>
            <li>Relaxed badminton session</li>
            <li>Rest</li>
          </ul>
          <div class="btn-row no-print">
            <button class="btn" data-go="running">Open Running</button>
            <button class="btn" data-go="footwork">Open Footwork</button>
          </div>
        </div>`;
      html += completeBlock(comp, "flex");
    } else {
      html += `<div class="card"><h2>Rest day</h2><p>Nothing scheduled today. A short easy walk or gentle mobility is optional.</p></div>`;
      html += completeBlock(comp, "rest");
    }

    // Log anything extra you did that wasn't planned
    html += extraActivityHTML();

    // Compact safety reminder (one line, not a big banner)
    html += `<p class="muted center no-print" style="margin:.2rem 0 .8rem">⚠️ Never push through <strong>sharp</strong> pain — stop and switch to “Need a recovery day”.</p>`;

    // Personalised tips, tucked into a collapsible so they don't clutter the screen
    const sugg = buildSuggestions();
    if (sugg.length) {
      html += `<details class="acc no-print"><summary>💡 Tips for you (${sugg.length})</summary><div class="acc-body">${
        sugg.map((s) => `<div class="suggestion">${esc(s)}</div>`).join("")
      }<p class="muted" style="margin:0">Simple rule-based tips — apply them yourself when you agree.</p></div></details>`;
    }

    root.innerHTML = html;
  }

  function calfCheckHTML() {
    return `
      <details class="acc" id="calfCheck">
        <summary>🦵 10-second calf check (before running, footwork or jumping)</summary>
        <div class="acc-body">
          <p class="muted" style="margin-bottom:.4rem">A calf that feels <strong>worked, tired or mildly burning during effort and then settles</strong> is normal training exertion — not a reason to stop. This check is only for genuine <strong>warning signs</strong>. Tick anything true <em>right now</em>:</p>
          ${["Sharp or sudden pain in a calf or Achilles","Swelling","Limping","Clearly worse than yesterday, or one-sided throbbing pain"]
            .map((q,i) => `<label class="inline-check"><input type="checkbox" class="calfq" data-i="${i}"> ${esc(q)}</label>`).join("")}
          <div id="calfResult"></div>
        </div>
      </details>`;
  }

  // Log ad-hoc activities the plan didn't schedule (e.g. "also did a walk-jog")
  function extraActivityHTML() {
    const recent = (state.extraActivities || []).slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 8);
    const quick = ["Walk", "Walk-jog", "Run", "Badminton", "Footwork", "Cycle", "Other"];
    return `
      <details class="acc no-print">
        <summary>➕ Add something extra you did</summary>
        <div class="acc-body">
          <p class="muted" style="margin-bottom:.6rem">Did something the plan didn't list (a walk-jog, a game, etc.)? Log it here — you can set any date, including yesterday.</p>
          <form id="extraForm" class="stack">
            <div class="field-row cols-2">
              <div class="field" style="margin:0"><label>Date</label><input type="date" name="date" value="${todayISO()}" max="${todayISO()}"></div>
              <div class="field" style="margin:0"><label>What did you do?</label>
                <input list="extraOptions" name="what" placeholder="e.g. Walk-jog 5 km" required>
                <datalist id="extraOptions">${quick.map((q) => `<option value="${esc(q)}">`).join("")}</datalist>
              </div>
            </div>
            <div class="field" style="margin:0"><label>Note (optional)</label><input type="text" name="note" placeholder="How long, how it felt…"></div>
            <button class="btn btn-primary btn-block" type="submit">Add activity</button>
          </form>
          ${recent.length ? `
            <h3 style="margin:1rem 0 .4rem">Recently logged</h3>
            ${recent.map((a) => `
              <div class="log-card" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
                <span><strong>${esc(fmtShort(a.date))}</strong> · ${esc(a.what)}${a.note ? ` <span class="muted">— ${esc(a.note)}</span>` : ""}</span>
                <button class="btn btn-sm btn-ghost" data-delextra data-id="${esc(a.id)}" aria-label="Delete">✕</button>
              </div>`).join("")}` : ""}
        </div>
      </details>`;
  }

  function swapPickerHTML(w) {
    const cur = w.type;
    const sched = SESSION_TYPES[w.scheduled];
    const schedLabel = sched ? sched.label : "Flexible / rest";
    return `
      <div class="card swap-card no-print">
        <div class="card-head">
          <h2>Today's session</h2>
          ${w.isOverridden ? `<button class="btn btn-sm btn-ghost" data-clearoverride>↩ Back to planned</button>` : ""}
        </div>
        <p class="muted" style="margin-bottom:.75rem">Planned: <strong>${esc(schedLabel)}</strong>. Can't do that right now (no space, late, indoors)? Tap something you <em>can</em> do — this only changes today.</p>
        <div class="swap-grid">
          ${SWAP_ORDER.map((t) => { const s = SESSION_TYPES[t]; const sel = t === cur; return `
            <button class="swap-btn ${sel ? "is-sel" : ""}" data-swaptoday="${t}" aria-pressed="${sel}">
              <span class="swap-emoji" aria-hidden="true">${s.emoji}</span>
              <span class="swap-label">${esc(s.label)}</span>
              <span class="swap-need">${esc(s.need)}</span>
            </button>`; }).join("")}
        </div>
      </div>`;
  }

  // Quiet, small-space, indoor-friendly session — ideal late at night with no room to move
  const MOBILITY_TODAY = [
    ["Ankle knee-to-wall movement", "2 × 8–10 / side"],
    ["Gentle calf stretch", "2 × 20–30s / side"],
    ["Hip-flexor stretch", "2 × 20–30s / side"],
    ["Thoracic rotation", "2 × 6–8 / side"],
    ["Controlled shoulder rotations", "2 × 8–10"],
    ["Dead bug", "2 × 8–12 / side"],
    ["Single-leg balance", "3 × 20–40s / leg"],
  ];

  function renderTodayMobility(rec, comp) {
    const items = MOBILITY_TODAY;
    const doneCount = items.filter(([n]) => comp && comp.results && comp.results[n] && comp.results[n].done).length;
    const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
    let html = `
      <div class="card">
        <h2>Today: Mobility &amp; stretch 🧘</h2>
        <p>A calm, quiet session for a <strong>tiny indoor space</strong> — no jumping, no noise, perfect late at night. It keeps your ankles, hips, back and balance in good shape on a low-energy day.</p>
        <div class="progress" aria-hidden="true"><span id="todayBar" style="width:${pct}%"></span></div>
        <p class="muted" id="todayBarLabel">${doneCount} of ${items.length} done</p>`;
    html += items.map(([name, sets]) => {
      const ex = libByName(name) || { how: "" };
      const res = (comp && comp.results && comp.results[name]) || {};
      const done = !!res.done;
      return `
        <div class="ex-item ${done ? "is-done" : ""}" data-ex-item>
          <label class="inline-check" style="flex:1">
            <input type="checkbox" data-strength-check data-key="M" data-ref="${esc(name)}" data-name="${esc(name)}" ${done ? "checked" : ""}>
            <span><span class="ex-name">${esc(name)}</span><span class="ex-meta">${esc(sets)}${ex.how ? ` · ${esc(ex.how)}` : ""}</span></span>
          </label>
          <div style="margin-top:.4rem">${watchLink(name)}</div>
        </div>`;
    }).join("");
    html += `</div>` + completeBlock(comp, "M");
    return html;
  }

  // Indoor, court-free balance / coordination / reaction / technique session
  const SKILLS_TODAY = [
    ["Tandem (heel-to-toe) balance", "3 × 20–40s / lead foot"],
    ["Single-leg reach (3-direction)", "2 × 5 reaches each way / leg"],
    ["Standing split-step reaction", "2 × 8–10 reactions"],
    ["Quick feet on the spot", "4 × 15–20s"],
    ["Wall rebound catch (reaction)", "2 × 30–45s"],
    ["Shadow swings (overhead & net)", "2–3 × 8–10 swings"],
  ];

  function renderTodaySkills(rec, comp) {
    const items = SKILLS_TODAY;
    const doneCount = items.filter(([n]) => comp && comp.results && comp.results[n] && comp.results[n].done).length;
    const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
    let html = `
      <div class="card">
        <h2>Today: Balance &amp; skills 🤹</h2>
        <p>Badminton-specific practice you can do <strong>indoors in a small space, no court needed</strong> — balance, quick feet, reactions and shadow swings. Great for sharpening movement and racket feel on a day you can't get out or move much. You'll just need a <strong>soft ball or rolled-up socks</strong> (and a racket if you have one, for the shadow swings).</p>
        <div class="progress" aria-hidden="true"><span id="todayBar" style="width:${pct}%"></span></div>
        <p class="muted" id="todayBarLabel">${doneCount} of ${items.length} done</p>`;
    html += items.map(([name, sets]) => {
      const ex = libByName(name) || { how: "" };
      const res = (comp && comp.results && comp.results[name]) || {};
      const done = !!res.done;
      return `
        <div class="ex-item ${done ? "is-done" : ""}" data-ex-item>
          <label class="inline-check" style="flex:1">
            <input type="checkbox" data-strength-check data-key="S" data-ref="${esc(name)}" data-name="${esc(name)}" ${done ? "checked" : ""}>
            <span><span class="ex-name">${esc(name)}</span><span class="ex-meta">${esc(sets)}${ex.how ? ` · ${esc(ex.how)}` : ""}</span></span>
          </label>
          <div style="margin-top:.4rem">${watchLink(name, "badminton home drill")}</div>
        </div>`;
    }).join("");
    html += `</div>` + completeBlock(comp, "S");
    return html;
  }

  function renderTodayWalk(rec, comp) {
    return `
      <div class="card">
        <h2>Today: Easy walk 🚶</h2>
        <p>A relaxed walk at a <strong>conversational pace</strong> — great for active recovery or a busy day. Aim for about <strong>20–45 minutes</strong>; your usual 5 km route is ideal.</p>
        <ul>
          <li>Keep it easy — you should be able to hold a conversation.</li>
          <li>Tall posture, relaxed shoulders, easy breathing.</li>
          <li>Optional finisher: a few gentle calf raises or ankle circles.</li>
        </ul>
      </div>` + completeBlock(comp, "walk");
  }

  function renderTodayStrength(key, rec, comp) {
    const sess = DATA.sessions[key];
    const custom = state.sessionCustom[key] || { variation:{}, sets:{}, notes:{} };
    let items = sess.items.slice();
    let optional = sess.optional.slice();
    if (rec === "tired") {
      // ~20–30% volume cut: drop optional, and trim last item if many
      optional = [];
      if (items.length > 4) items = items.slice(0, items.length - 1);
    }
    const allItems = items.concat(optional.map((o) => ({ ...o, _opt: true })));
    const total = allItems.length;
    const doneCount = allItems.filter((it) => comp && comp.results && comp.results[chosenName(key, it)] && comp.results[chosenName(key, it)].done).length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;

    let html = `
      <div class="card">
        <div class="card-head"><h2>${esc(sess.name)}</h2><span class="pill pill-warn badge-load">${esc(sess.load)}</span></div>
        <p class="muted" style="margin:-.2rem 0 .6rem;font-size:.88rem">🏸 ${esc(badmintonBenefit(key==="A"?"strengthA":"strengthB"))}</p>
        ${rec==="tired" ? `<p class="muted">Reduced volume applied.</p>` : ""}
        <div class="progress" aria-hidden="true"><span id="todayBar" style="width:${pct}%"></span></div>
        <p class="muted" id="todayBarLabel">${doneCount} of ${total} done</p>`;

    html += allItems.map((it) => strengthItemHTML(key, it, comp)).join("");
    html += completeBlock(comp, key, sess.name);
    html += `</div>`;
    return html;
  }

  function chosenName(key, it) {
    const custom = state.sessionCustom[key] || { variation:{} };
    return (custom.variation && custom.variation[it.ref]) || it.ref;
  }

  function strengthItemHTML(key, it, comp) {
    const name = chosenName(key, it);
    const ex = libByName(name) || libByName(it.ref) || { why:"", how:"" };
    const custom = state.sessionCustom[key] || { sets:{}, notes:{} };
    const sets = (custom.sets && custom.sets[it.ref]) || it.sets;
    const noteVal = (custom.notes && custom.notes[it.ref]) || "";
    const res = (comp && comp.results && comp.results[name]) || {};
    const done = !!res.done;
    const last = state.lastSessionResults[name];
    const sameCat = libByCat(it.cat);

    return `
      <div class="ex-item ${done?"is-done":""}" data-ex-item>
        <div class="ex-top">
          <label class="inline-check" style="flex:1">
            <input type="checkbox" data-strength-check data-key="${esc(key)}" data-ref="${esc(it.ref)}" data-name="${esc(name)}" ${done?"checked":""}>
            <span>
              <span class="ex-name">${esc(name)}${it._opt?` <span class="pill">optional</span>`:""}</span>
              <span class="ex-meta">${esc(sets)} · rest 60–90s</span>
            </span>
          </label>
        </div>
        <details class="acc" style="margin:.5rem 0 0;border:none;background:transparent">
          <summary style="padding:.4rem 0;min-height:auto">Details, swap & record</summary>
          <div class="acc-body" style="padding:.5rem 0 0">
            ${ex.how?`<p class="muted" style="margin-bottom:.3rem">${esc(ex.how)}</p>`:""}
            <div style="margin-bottom:.5rem">${watchLink(name)}</div>
            <div class="field">
              <label>Swap (same category)</label>
              <select data-swap data-key="${esc(key)}" data-ref="${esc(it.ref)}">
                ${sameCat.map((c)=>`<option value="${esc(c.name)}" ${c.name===name?"selected":""}>${esc(c.name)}</option>`).join("")}
              </select>
            </div>
            <div class="field-row cols-2">
              <div class="field"><label>Sets / reps</label>
                <input type="text" value="${esc(sets)}" data-setsedit data-key="${esc(key)}" data-ref="${esc(it.ref)}"></div>
              <div class="field"><label>Actual result ${last?`(last: ${esc(last)})`:""}</label>
                <input type="text" placeholder="e.g. 3×10, felt strong" value="${esc(res.actual||"")}" data-actual data-key="${esc(key)}" data-name="${esc(name)}"></div>
            </div>
            <div class="field"><label>Note for this exercise</label>
              <input type="text" value="${esc(noteVal)}" data-exnote data-key="${esc(key)}" data-ref="${esc(it.ref)}"></div>
          </div>
        </details>
      </div>`;
  }

  function renderTodayRun(rec, comp) {
    const lvl = DATA.runLevels.find((l) => l.n === state.runLevel) || DATA.runLevels[0];
    let steps = lvl.steps.slice();
    if (rec === "tired") steps = steps.concat(["(Fatigued: shorten by one repeat or finish early if needed.)"]);
    return `
      <div class="card">
        <h2>Today: Easy run–walk 🏃</h2>
        <p><strong>What this is:</strong> you alternate gentle jogging with walking breaks. This builds running fitness while protecting your calves. Keep the jog <strong>slow enough that you could still talk</strong> — it's meant to feel easy.</p>
        <h3 style="margin:.2rem 0 .4rem">Your session (${esc(lvl.title.split("—")[0].trim())})</h3>
        <ol style="margin-top:0">${steps.map((s)=>`<li>${esc(s)}</li>`).join("")}</ol>
        <p class="muted" style="margin-bottom:1rem">Do this outdoors or anywhere you can walk and jog. Afterwards, open Running to log how it went.</p>
        <button class="btn btn-primary btn-block no-print" data-go="running">Open Running &amp; log it afterwards</button>
      </div>
      ${completeBlock(comp, "run")}`;
  }

  function renderTodayFootwork(rec, comp) {
    const lvl = DATA.footworkLevels.find((l) => l.n === state.footworkLevel) || DATA.footworkLevels[0];
    let rounds = lvl.rounds;
    if (rec === "tired") rounds = Math.max(4, Math.round(rounds * 0.75));
    return `
      <div class="card">
        <h2>Today: Footwork practice 🏸</h2>
        <p><strong>What this is:</strong> "Shadow badminton" means practising your court movement <strong>with no shuttle and no racket</strong>. You move from the middle out to a corner — as if reaching to hit a shot — then back to the middle. It trains the quick, balanced footwork badminton needs. <strong>Any clear space at home works</strong> — you don't need a real court.</p>

        <div class="note" style="margin-bottom:.8rem">
          <strong>Your session:</strong> ${rounds} rounds.<br>
          Each round = <strong>${lvl.work} seconds</strong> of continuous movement, then <strong>${lvl.rest} seconds</strong> rest.<br>
          Effort: easy and controlled. ${esc(lvl.note)}
        </div>

        <h3 style="margin:.2rem 0 .4rem">How to do one round</h3>
        <ol style="margin-top:0">
          <li>Stand in the <strong>middle</strong> of your space, knees softly bent, weight on the balls of your feet.</li>
          <li>Do a small <strong>split step</strong> — a tiny hop, landing softly on both feet — to get ready.</li>
          <li><strong>Move out to one corner:</strong> front-left, front-right, side-left, side-right, back-left, or back-right.</li>
          <li>Reach with a <strong>controlled lunge or step</strong>, as if you were playing the shot there.</li>
          <li><strong>Push back to the middle</strong> and reset your feet.</li>
          <li>Repeat to a <strong>different corner</strong>, keeping going for the full ${lvl.work} seconds — then rest.</li>
        </ol>
        <p class="muted" style="margin-bottom:.6rem">Don't rush. Quiet, balanced landings matter more than speed. Stop if anything feels sharp.</p>
        <p style="margin-bottom:.8rem"><strong>No court at home?</strong> You don't need one — use any clear floor, patio or garden and imagine a rough rectangle with the "net" in front of you.</p>
        <div style="margin-bottom:.8rem">${watchLink("badminton six corner shadow footwork", "drill for beginners")}</div>

        <button class="btn btn-primary btn-block no-print" data-go="footwork">▶ Open the timer &amp; court map</button>
        <p class="muted center" style="margin:.5rem 0 0">The timer counts each round and rest for you, and the court map shows the six corners.</p>
      </div>
      ${completeBlock(comp, "footwork")}`;
  }

  function completeBlock(comp, sessionKey, label) {
    const done = comp && comp.done;
    const notes = (comp && comp.notes) || "";
    return `
      <div class="card no-print">
        <div class="field"><label for="todayNotes">Session notes</label>
          <textarea id="todayNotes" placeholder="How did it go?">${esc(notes)}</textarea></div>
        ${done
          ? `<div class="note" style="margin-bottom:.6rem">✅ Completed. ${esc(encourage())}</div>
             <button class="btn btn-primary btn-block" data-nextsession style="margin-bottom:.5rem">➡️ Give me my next session</button>
             <button class="btn btn-ghost btn-block" data-uncomplete>Mark as not done</button>`
          : `<button class="btn btn-primary btn-block" data-complete data-key="${esc(sessionKey||"")}">Complete Workout</button>`}
      </div>`;
  }

  // Upcoming non-rest sessions in the weekly plan, starting from tomorrow
  function upcomingSessions(maxDays) {
    const list = [];
    const base = new Date(todayISO() + "T00:00:00");
    for (let i = 1; i <= (maxDays || 14); i++) {
      const d = new Date(base); d.setDate(d.getDate() + i);
      const dayName = DAYS[d.getDay()];
      const wd = state.week.find((x) => x.day === dayName);
      const type = wd ? wd.type : "rest";
      if (type && type !== "rest") list.push({ type, dayName, daysAhead: i });
    }
    return list;
  }

  function encourage() {
    const msgs = [
      "Nice work — consistency is what builds badminton fitness.",
      "Great job showing up today. Small sessions stack up.",
      "Done. Recovery is where the gains happen — rest well.",
      "Solid effort. You are building a durable base.",
      "That's another brick in the wall. Keep it steady.",
    ];
    // deterministic-ish by date so it doesn't flicker
    const i = (new Date(todayISO()+"T00:00:00").getDate()) % msgs.length;
    return msgs[i];
  }

  /* ----------------------------------------------------------
     6. TAB 2 — WEEKLY PLAN
     ---------------------------------------------------------- */
  // Every day feeds badminton — this spells out how, so nothing feels like "random fitness".
  function badmintonBenefit(type) {
    switch (type) {
      case "strengthA":
      case "strengthB": return "Leg, calf, core & shoulder strength for lunging, braking, jumping and overhead shots.";
      case "run":       return "Aerobic base so you recover faster between rallies and last longer on court.";
      case "footwork":  return "Direct badminton movement: split steps, lunges and covering all six corners.";
      case "flex":      return "Your choice: footwork, a relaxed badminton hit, hopping readiness, or recovery.";
      case "mobility":  return "Ankle, hip and shoulder mobility plus balance — the range and control footwork needs.";
      case "skills":    return "Balance, quick feet, reactions and shadow swings — court movement and racket feel, indoors.";
      case "walk":      return "Easy active recovery that helps your calves and legs adapt for harder court work.";
      default:          return "Recovery — when your calves and legs actually adapt and badminton fitness is built.";
    }
  }

  // Calendar date of a given weekday in the same Sun–Sat week as today
  function dateOfWeekday(dayName) {
    const today = new Date(todayISO() + "T00:00:00");
    const diff = DAYS.indexOf(dayName) - today.getDay();
    const d = new Date(today); d.setDate(today.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }
  function extrasOn(iso) { return (state.extraActivities || []).filter((a) => a.date === iso); }

  function weekLoad() {
    // crude load estimate from session types this week
    let score = 0;
    state.week.forEach((d) => {
      const st = state.weekStatus[weekKey()+":"+d.day] || {};
      if (st.rest) return;
      if (d.type === "strengthA" || d.type === "strengthB") score += 3;
      else if (d.type === "run") score += 2;
      else if (d.type === "footwork") score += 2;
      else if (d.type === "flex") score += 1;
    });
    if (score <= 7) return "Light";
    if (score <= 11) return "Moderate";
    return "Challenging";
  }

  // What to show on a day: rest, moved-away, or its own items plus any items moved IN from other days.
  function displayItemsForDay(d, wkk) {
    const st = state.weekStatus[wkk+":"+d.day] || {};
    if (st.rest) return ["Rest (chosen)"];
    if (st.movedTo) return ["↪ Moved to " + st.movedTo];
    const items = d.items.slice();
    state.week.forEach((o) => {
      if (o.day === d.day) return;
      const ost = state.weekStatus[wkk+":"+o.day] || {};
      if (ost.movedTo === d.day && !ost.rest) o.items.forEach((i)=>items.push(i + " (from " + o.day + ")"));
    });
    return items;
  }

  function renderWeekly(root) {
    const wkk = weekKey();
    const doneN = state.week.filter((d)=> (state.weekStatus[wkk+":"+d.day]||{}).done).length;
    const load = weekLoad();
    const loadClass = load==="Light"?"pill-ok":load==="Moderate"?"pill-primary":"pill-warn";

    let html = `
      <div class="page-head"><h1>Weekly Plan</h1>
        <p class="sub">Training week ${currentWeekNumber()} · <span class="pill ${loadClass} badge-load">Load: ${load}</span></p></div>

      <div class="note note-warn">Do not stack a hard run, intense footwork session, demanding badminton session, and jumping workout on consecutive days when you are still building your base.</div>

      <div class="card"><div class="row-between"><h2 style="margin:0">This week</h2>
        <span class="pill ${doneN? "pill-ok":""}">${doneN}/${state.week.length} complete</span></div></div>`;

    html += state.week.map((d, idx) => {
      const st = state.weekStatus[wkk+":"+d.day] || {};
      const items = displayItemsForDay(d, wkk);
      return `
      <div class="card">
        <div class="row-between">
          <h3 style="margin:0">${esc(d.day)}</h3>
          <label class="inline-check"><input type="checkbox" data-weekdone data-day="${esc(d.day)}" ${st.done?"checked":""}> Done</label>
        </div>
        <ul style="margin:.4rem 0 .4rem">${items.map((i)=>`<li>${esc(i)}</li>`).join("")}</ul>
        <p class="muted" style="margin:0 0 .5rem;font-size:.85rem">🏸 ${esc(badmintonBenefit(st.rest ? "rest" : d.type))}</p>
        ${(() => { const ex = extrasOn(dateOfWeekday(d.day)); return ex.length ? `<p class="muted" style="margin:0 0 .5rem;font-size:.85rem">➕ Also did: ${ex.map((a) => esc(a.what)).join(", ")}</p>` : ""; })()}
        <details class="acc" style="border:none;background:transparent;margin:0">
          <summary style="padding:.4rem 0;min-height:auto">Adjust this day</summary>
          <div class="acc-body" style="padding:.5rem 0 0">
            <div class="field-row cols-2">
              <div class="field"><label>Move workout to</label>
                <select data-moveto data-day="${esc(d.day)}">
                  <option value="">— keep here —</option>
                  ${state.week.map((x)=>`<option value="${esc(x.day)}" ${st.movedTo===x.day?"selected":""}>${esc(x.day)}</option>`).join("")}
                </select></div>
              <div class="field"><label class="inline-check" style="margin-top:1.7rem"><input type="checkbox" data-weekrest data-day="${esc(d.day)}" ${st.rest?"checked":""}> Choose rest instead</label></div>
            </div>
            <div class="field"><label>Add badminton court session / extra item</label>
              <div class="btn-row">
                <input type="text" placeholder="e.g. Doubles at the club" data-addtext data-day="${esc(d.day)}" style="flex:1">
                <button class="btn btn-sm" data-additem data-day="${esc(d.day)}">Add</button>
              </div>
            </div>
            <div class="field"><label>Notes</label>
              <textarea data-weeknote data-day="${esc(d.day)}" placeholder="Notes for ${esc(d.day)}">${esc(st.note||"")}</textarea></div>
          </div>
        </details>
      </div>`;
    }).join("");

    html += `<div class="btn-row no-print"><button class="btn btn-ghost" data-resetweek>Reset week to default plan</button></div>`;
    root.innerHTML = html;
  }

  /* ----------------------------------------------------------
     7. TAB 3 — EXERCISE LIBRARY
     ---------------------------------------------------------- */
  const FILTERS = [
    { id:"none", label:"No equipment", kind:"equip" },
    { id:"backpack", label:"Backpack", kind:"equip" },
    { id:"band", label:"Resistance band", kind:"equip" },
    { id:"rope", label:"Skipping rope", kind:"equip" },
    { id:"lower", label:"Lower body", kind:"area" },
    { id:"upper", label:"Upper body", kind:"area" },
    { id:"core", label:"Core", kind:"area" },
    { id:"mobility", label:"Mobility", kind:"area" },
    { id:"footwork", label:"Footwork", kind:"area" },
    { id:"balance", label:"Balance & coordination", kind:"area" },
    { id:"beginner", label:"Beginner", kind:"level" },
    { id:"intermediate", label:"Intermediate", kind:"level" },
    { id:"advanced", label:"Advanced", kind:"level" },
  ];
  let activeFilters = new Set();

  function renderLibrary(root) {
    const cats = [...new Set(DATA.library.map((e)=>e.cat))];
    let html = `
      <div class="page-head"><h1>Exercise Library</h1>
        <p class="sub">${DATA.library.length} exercises · tap a category to expand</p></div>
      <div class="card no-print">
        <label>Filter</label>
        <div class="filters">${FILTERS.map((f)=>`<button class="chip" data-filter="${f.id}" aria-pressed="${activeFilters.has(f.id)}">${esc(f.label)}</button>`).join("")}</div>
        ${activeFilters.size?`<button class="btn btn-sm btn-ghost" data-clearfilters>Clear filters</button>`:""}
      </div>`;

    let shown = 0;
    html += cats.map((cat) => {
      const list = libByCat(cat).filter(matchesFilters);
      shown += list.length;
      if (!list.length) return "";
      return `
        <details class="acc" ${activeFilters.size?"open":""}>
          <summary>${esc(cat)} <span class="pill">${list.length}</span></summary>
          <div class="acc-body">${list.map(exerciseCardHTML).join("")}</div>
        </details>`;
    }).join("");

    if (!shown) html += `<div class="empty"><span class="emoji">🔍</span>No exercises match those filters.<br><button class="btn btn-sm btn-ghost" data-clearfilters style="margin-top:.6rem">Clear filters</button></div>`;
    root.innerHTML = html;
  }

  function matchesFilters(ex) {
    if (!activeFilters.size) return true;
    // group filters by kind: within a kind it's OR, across kinds it's AND
    const byKind = {};
    FILTERS.forEach((f)=>{ if (activeFilters.has(f.id)) (byKind[f.kind]=byKind[f.kind]||[]).push(f.id); });
    return Object.values(byKind).every((ids)=> ids.some((id)=> ex.tags.includes(id)));
  }

  function exerciseCardHTML(ex) {
    const feel = state.exerciseFeel[ex.name] || {};
    const equipTags = ex.tags.filter((t)=>["backpack","band","rope","chair"].includes(t));
    return `
      <div class="ex-item" data-libitem>
        <div class="row-between">
          <span class="ex-name">${esc(ex.name)}</span>
          <span>${equipTags.map((t)=>`<span class="pill">${esc(t)}</span>`).join(" ")}</span>
        </div>
        <p class="muted" style="margin:.3rem 0 .4rem">${esc(ex.how)}</p>
        <div style="margin-bottom:.3rem">${watchLink(ex.name)}</div>
        <details class="acc" style="border:none;background:transparent;margin:0">
          <summary style="padding:.3rem 0;min-height:auto">More</summary>
          <div class="acc-body" style="padding:.4rem 0 0">
            <dl class="kv" style="margin-bottom:.5rem">
              <dt>Beginner</dt><dd>${esc(ex.beg)}</dd>
              <dt>Standard</dt><dd>${esc(ex.std)}</dd>
              <dt>Harder</dt><dd>${esc(ex.hard)}</dd>
              <dt>Reps/time</dt><dd>${esc(ex.reps)}</dd>
              <dt>Common mistakes</dt><dd>${esc(ex.mistakes)}</dd>
              <dt>Why for badminton</dt><dd>${esc(ex.why)}</dd>
            </dl>
            <label>This exercise currently feels</label>
            <div class="segmented" role="group" aria-label="How ${esc(ex.name)} feels">
              ${["Too easy","Appropriate","Too hard"].map((r)=>`<button class="seg" data-feel data-name="${esc(ex.name)}" data-rating="${r}" aria-pressed="${feel.rating===r}">${r}</button>`).join("")}
            </div>
            <div class="field" style="margin-top:.5rem"><label>Notes</label>
              <input type="text" value="${esc(feel.note||"")}" data-feelnote data-name="${esc(ex.name)}" placeholder="Your notes"></div>
          </div>
        </details>
      </div>`;
  }

  /* ----------------------------------------------------------
     8. TAB 4 — RUNNING
     ---------------------------------------------------------- */
  function renderRunning(root) {
    const lvl = DATA.runLevels.find((l)=>l.n===state.runLevel) || DATA.runLevels[0];
    const pb = runPBs();

    let html = `
      <div class="page-head"><h1>Running</h1><p class="sub">Run-walk progression · current level ${state.runLevel}</p></div>

      <div class="card">
        <label>Choose your level</label>
        <div class="segmented" role="group" aria-label="Running level">
          ${DATA.runLevels.map((l)=>`<button class="seg" data-runlevel="${l.n}" aria-pressed="${l.n===state.runLevel}">${l.n===6?"Int.":l.n}</button>`).join("")}
        </div>
        <p class="muted" style="margin:.5rem 0 0">Pick the level that genuinely matches you — you already jog a good portion of 5 km, so don't feel you must start at Level 1. If a level feels easy two runs in a row with no pain, move up. The goal is to find the level you can repeat comfortably, then progress.</p>
        <h3 style="margin:.8rem 0 .3rem">${esc(lvl.title)}</h3>
        <ol>${lvl.steps.map((s)=>`<li>${esc(s)}</li>`).join("")}</ol>
        <div class="btn-row no-print">
          <button class="btn btn-sm" data-runstep="-1" ${state.runLevel<=1?"disabled":""}>← Easier</button>
          <button class="btn btn-sm" data-runstep="1" ${state.runLevel>=6?"disabled":""}>Harder →</button>
        </div>
      </div>

      <div class="card">
        <h2>Personal bests</h2>
        <div class="grid grid-2">
          <div class="stat"><div class="num">${pb.longestJog??"—"}</div><div class="lbl">Longest continuous jog (min)</div></div>
          <div class="stat"><div class="num">${pb.totalJog??"—"}</div><div class="lbl">Longest total jog time (min)</div></div>
          <div class="stat"><div class="num">${pb.recent5k||"—"}</div><div class="lbl">Most recent 5 km time</div></div>
          <div class="stat"><div class="num">${state.runLogs.length}</div><div class="lbl">Total sessions</div></div>
          <div class="stat"><div class="num">${pb.streak}</div><div class="lbl">Consistency streak (wks)</div></div>
        </div>
      </div>

      <details class="acc"><summary>➕ Log a run</summary><div class="acc-body">${runFormHTML()}</div></details>

      <div class="card">
        <h2>Recent runs</h2>
        ${state.runLogs.length? state.runLogs.slice().reverse().slice(0,12).map(runLogCard).join("")
          : `<div class="empty"><span class="emoji">🏃</span>No runs logged yet.<br>Use “Log a run” above after your next session.</div>`}
      </div>

      <details class="acc"><summary>ℹ️ Running guidance</summary><div class="acc-body">
        <ul>
          <li>Keep most sessions at a conversational pace.</li>
          <li>Do not run hard every day.</li>
          <li>Leave a recovery day between running sessions initially.</li>
          <li>Temporary symmetrical calf exertion that settles can be normal.</li>
          <li>Sharp pain, swelling, limping or worsening morning-after symptoms are warning signs — see Guidance → Safety.</li>
        </ul>
      </div></details>`;
    root.innerHTML = html;
  }

  function runFormHTML() {
    return `
      <form id="runForm" class="stack">
        <div class="field-row cols-2">
          <div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}" required></div>
          <div class="field"><label>Level used</label>
            <select name="level">${DATA.runLevels.map((l)=>`<option value="${l.n}" ${l.n===state.runLevel?"selected":""}>Level ${l.n}</option>`).join("")}</select></div>
        </div>
        <div class="field-row cols-3">
          <div class="field"><label>Distance (km)</label><input type="number" step="0.1" min="0" name="dist" placeholder="5"></div>
          <div class="field"><label>Total (min)</label><input type="number" step="1" min="0" name="dur" placeholder="35"></div>
          <div class="field"><label>Jog (min)</label><input type="number" step="1" min="0" name="jog" placeholder="20"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field"><label>Walk (min)</label><input type="number" step="1" min="0" name="walk" placeholder="10"></div>
          <div class="field"><label>Difficulty (1–10)</label><input type="number" min="1" max="10" name="rpe" placeholder="5"></div>
        </div>
        <div class="field"><label>Calf sensation during</label>
          <select name="calf">${["None","Mild temporary exertion","Moderate exertion","Pain"].map((o)=>`<option>${o}</option>`).join("")}</select></div>
        <div class="field-row cols-2">
          <div class="field"><label>Symptoms afterwards</label>
            <select name="after">${["None","Mild tiredness","Pain"].map((o)=>`<option>${o}</option>`).join("")}</select></div>
          <div class="field"><label>Next-morning symptoms</label>
            <select name="morning">${["None","Mild stiffness","Pain"].map((o)=>`<option>${o}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label>Notes</label><textarea name="notes" placeholder="Route, how it felt…"></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Save run</button>
      </form>`;
  }

  function runLogCard(r) {
    return `
      <div class="log-card">
        <div class="log-head"><span>${esc(fmtShort(r.date))} · L${esc(r.level||"?")}</span><span class="pill ${r.calf==="Pain"||r.after==="Pain"||r.morning==="Pain"?"pill-warn":""}">${esc(r.calf||"—")}</span></div>
        <dl>
          ${r.dist?`<dt>Distance</dt><dd>${esc(r.dist)} km</dd>`:""}
          ${r.dur?`<dt>Total</dt><dd>${esc(r.dur)} min</dd>`:""}
          ${r.jog?`<dt>Jog</dt><dd>${esc(r.jog)} min</dd>`:""}
          ${r.rpe?`<dt>Difficulty</dt><dd>${esc(r.rpe)}/10</dd>`:""}
          <dt>After / morning</dt><dd>${esc(r.after||"—")} / ${esc(r.morning||"—")}</dd>
          ${r.notes?`<dt>Notes</dt><dd>${esc(r.notes)}</dd>`:""}
        </dl>
        <button class="btn btn-sm btn-ghost no-print" data-dellog="run" data-id="${esc(r.id)}" style="margin-top:.4rem">Delete</button>
      </div>`;
  }

  function runPBs() {
    let longestJog=null, totalJog=null, recent5k="", streak=0;
    state.runLogs.forEach((r)=>{
      const jog = Number(r.jog)||0;
      // approximate "continuous jog": for L5 the jog minutes are continuous; use jog as proxy
      if (jog && (longestJog===null || jog>longestJog) && Number(r.level)>=5) longestJog = jog;
      if (jog && (totalJog===null || jog>totalJog)) totalJog = jog;
    });
    // recent 5k: latest log with dist≈5 and a duration
    const five = state.runLogs.filter((r)=>Number(r.dist)>=4.7 && Number(r.dist)<=5.5 && r.dur).slice(-1)[0];
    if (five) recent5k = five.dur + " min";
    // streak: consecutive ISO-weeks ending this week with ≥1 run
    streak = weeklyStreak(state.runLogs.map((r)=>r.date));
    return { longestJog, totalJog, recent5k, streak };
  }
  function weeklyStreak(dates) {
    if (!dates.length) return 0;
    const weeks = new Set(dates.map(isoWeek));
    let s = 0, cur = isoWeek(todayISO());
    while (weeks.has(cur)) { s++; cur = isoWeek(shiftDays(cur+"", -7, true)); }
    return s;
  }
  function isoWeek(iso) {
    const d = new Date((iso.length>7?iso:iso+"T00:00:00"));
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = (t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-day+3);
    const first = new Date(Date.UTC(t.getUTCFullYear(),0,4));
    const wk = 1+Math.round(((t-first)/864e5 - 3 + ((first.getUTCDay()+6)%7))/7);
    return t.getUTCFullYear()+"-W"+String(wk).padStart(2,"0");
  }
  function shiftDays(iso, n) {
    // iso may be a week key; just step a real date back ~n days using today fallback
    const base = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso+"T00:00:00") : new Date(todayISO()+"T00:00:00");
    base.setDate(base.getDate()+n);
    return base.toISOString().slice(0,10);
  }

  /* ----------------------------------------------------------
     9. TAB 5 — FOOTWORK (+ interval timer)
     ---------------------------------------------------------- */
  function renderFootwork(root) {
    const lvl = DATA.footworkLevels.find((l)=>l.n===state.footworkLevel) || DATA.footworkLevels[0];
    // This represents ONE HALF of the court — your side. The net is in FRONT of you (top).
    // You stand in the middle of YOUR half (not on the net) and move out to the six corners.
    const zones = [
      ["Front left","front"],["Front right","front"],   // nearest the net
      ["Side left","side"],["Side right","side"],         // midcourt
      ["Rear left","rear"],["Rear right","rear"],         // back of your half
    ];
    let html = `
      <div class="page-head"><h1>Badminton Footwork</h1><p class="sub">Six-corner shadow movement · level ${state.footworkLevel}</p></div>

      <div class="card">
        <h2>What to do</h2>
        <p>This diagram is <strong>your half of the court</strong>. The net is <strong>in front of you</strong> (top). You stand in the <strong>middle of your own half</strong> — the orange dot — <em>not</em> on the net. When the timer starts, move out to one of the <strong>six corners</strong>, reach as if playing a shot, then return to the middle. Pick a different corner each time.</p>
        <p class="center muted" style="margin:.2rem 0 .3rem">⬆ Net is in front of you</p>
        <div class="court-wrap"><div class="court" aria-label="One half of a badminton court showing six movement corners and your base position in the middle">
          <div class="net" aria-hidden="true"></div>
          ${zones.map(([z],i)=>`<div class="zone"><span class="zone-num">${i+1}</span> ${esc(z)}</div>`).join("")}
          <div class="center" title="Stand here — middle of your half">●</div>
        </div></div>
        <p class="muted center" style="margin-top:.4rem">⬇ Back of your half &nbsp;·&nbsp; ● = stand here (middle of <em>your</em> side)</p>
        <div class="note" style="margin-top:.6rem">
          <strong>No court at home?</strong> You don't need one. On any clear floor, patio or garden, just imagine a rectangle about <strong>5 big steps wide and 6 steps deep</strong>, with the "net" edge in front of you. The exact size doesn't matter — it's the movement pattern that counts.
        </div>
        <div style="margin-top:.5rem">${watchLink("badminton six corner shadow footwork", "drill for beginners")}</div>
      </div>

      <div class="card">
        <h3 style="margin-top:0">Each move, step by step</h3>
        <ol style="margin:0">
          <li>Start relaxed in the <strong>middle of your half</strong>, knees softly bent.</li>
          <li>Small <strong>split step</strong> (tiny soft hop on both feet).</li>
          <li><strong>Move</strong> toward one corner (front, side or rear).</li>
          <li><strong>Reach</strong> with a controlled step or shallow lunge.</li>
          <li><strong>Return</strong> to the middle.</li>
          <li><strong>Reset</strong>, then go to a different corner.</li>
        </ol>
      </div>

      <div class="card">
        <label>Footwork level</label>
        <div class="segmented" role="group" aria-label="Footwork level">
          ${DATA.footworkLevels.map((l)=>`<button class="seg" data-fwlevel="${l.n}" aria-pressed="${l.n===state.footworkLevel}">${l.n}</button>`).join("")}
        </div>
        <h3 style="margin:.8rem 0 .2rem">${esc(lvl.title)}</h3>
        <p>${lvl.rounds} rounds · ${lvl.work}s work · ${lvl.rest}s rest</p>
        <p class="muted">${esc(lvl.note)}</p>
      </div>

      ${timerHTML(lvl)}

      <details class="acc"><summary>➕ Log a footwork session</summary><div class="acc-body">${footworkFormHTML(lvl)}</div></details>

      <div class="card">
        <h2>Recent footwork</h2>
        ${state.footworkLogs.length? state.footworkLogs.slice().reverse().slice(0,10).map(fwLogCard).join("")
          : `<div class="empty"><span class="emoji">🏸</span>No footwork sessions logged yet.</div>`}
      </div>`;
    root.innerHTML = html;
    bindTimer(lvl);
  }

  function timerHTML(lvl) {
    return `
      <div class="card no-print" id="timerCard">
        <h2>Interval timer</h2>
        <p class="muted" style="margin-top:-.2rem">Press <strong>Start</strong> and move during each "Work" countdown; stand and breathe during "Rest". It beeps at each change and tells you which round you're on.</p>
        <div class="timer-display" id="timerDisplay">
          <div class="timer-phase" id="timerPhase">Ready</div>
          <div class="timer-count" id="timerCount">${lvl.work}</div>
          <div class="timer-round" id="timerRound">Round 0 / ${lvl.rounds}</div>
          <div class="timer-ring"><span id="timerRing" style="width:100%"></span></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="timerStart" style="flex:1">Start</button>
          <button class="btn" id="timerPause" style="flex:1" disabled>Pause</button>
          <button class="btn btn-ghost" id="timerReset" style="flex:1">Reset</button>
        </div>
        <label class="inline-check" style="margin-top:.6rem"><input type="checkbox" id="timerSound" checked> Beep &amp; vibrate (if supported)</label>
      </div>`;
  }

  function footworkFormHTML(lvl) {
    return `
      <form id="fwForm" class="stack">
        <div class="field-row cols-2">
          <div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}" required></div>
          <div class="field"><label>Level</label>
            <select name="level">${DATA.footworkLevels.map((l)=>`<option value="${l.n}" ${l.n===state.footworkLevel?"selected":""}>Level ${l.n}</option>`).join("")}</select></div>
        </div>
        <div class="field-row cols-2">
          <div class="field"><label>Rounds completed</label><input type="number" min="0" name="rounds" value="${lvl.rounds}"></div>
          <div class="field"><label>Difficulty (1–10)</label><input type="number" min="1" max="10" name="rpe" placeholder="5"></div>
        </div>
        <div class="field"><label>Calf response</label>
          <select name="calf">${["None","Mild temporary exertion","Moderate exertion","Pain"].map((o)=>`<option>${o}</option>`).join("")}</select></div>
        <div class="field"><label>Notes</label><textarea name="notes" placeholder="Movement quality, balance…"></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Save footwork session</button>
      </form>`;
  }

  function fwLogCard(f) {
    return `
      <div class="log-card">
        <div class="log-head"><span>${esc(fmtShort(f.date))} · L${esc(f.level)}</span><span class="pill ${f.calf==="Pain"?"pill-warn":""}">${esc(f.calf||"—")}</span></div>
        <dl>
          <dt>Rounds</dt><dd>${esc(f.rounds||"—")}</dd>
          ${f.rpe?`<dt>Difficulty</dt><dd>${esc(f.rpe)}/10</dd>`:""}
          ${f.notes?`<dt>Notes</dt><dd>${esc(f.notes)}</dd>`:""}
        </dl>
        <button class="btn btn-sm btn-ghost no-print" data-dellog="fw" data-id="${esc(f.id)}" style="margin-top:.4rem">Delete</button>
      </div>`;
  }

  // ---- Timer engine ----
  const timer = { id:null, phase:"ready", remaining:0, round:0, running:false, lvl:null, total:0 };
  function bindTimer(lvl) {
    timer.lvl = lvl;
    if (timer.phase === "ready") { timer.remaining = lvl.work; timer.round = 0; timer.total = lvl.work; }
    updateTimerUI();
    $("#timerStart").onclick = () => { if (!timer.running) startTimer(); };
    $("#timerPause").onclick = () => pauseTimer();
    $("#timerReset").onclick = () => resetTimer();
  }
  function startTimer() {
    const lvl = timer.lvl; if (!lvl) return;
    if (timer.phase === "ready" || timer.phase === "done") {
      timer.phase = "work"; timer.round = 1; timer.remaining = lvl.work; timer.total = lvl.work;
    }
    timer.running = true;
    $("#timerStart").disabled = true; $("#timerPause").disabled = false;
    beep(880, 0.08);
    timer.id = setInterval(tick, 1000);
    updateTimerUI();
  }
  function pauseTimer() {
    timer.running = false; clearInterval(timer.id); timer.id = null;
    $("#timerStart").disabled = false; $("#timerPause").disabled = true;
    $("#timerStart").textContent = "Resume";
  }
  function resetTimer() {
    clearInterval(timer.id); timer.id=null; timer.running=false;
    timer.phase="ready"; timer.round=0; timer.remaining = timer.lvl?timer.lvl.work:30; timer.total = timer.remaining;
    $("#timerStart").disabled=false; $("#timerStart").textContent="Start"; $("#timerPause").disabled=true;
    updateTimerUI();
  }
  function tick() {
    timer.remaining--;
    if (timer.remaining <= 0) {
      const lvl = timer.lvl;
      if (timer.phase === "work") {
        if (timer.round >= lvl.rounds) { finishTimer(); return; }
        timer.phase = "rest"; timer.remaining = lvl.rest; timer.total = lvl.rest; cue("rest");
      } else { // rest -> next work
        timer.round++; timer.phase = "work"; timer.remaining = lvl.work; timer.total = lvl.work; cue("work");
      }
    } else if (timer.remaining <= 3) {
      beep(660, 0.06);
    }
    updateTimerUI();
  }
  function finishTimer() {
    clearInterval(timer.id); timer.id=null; timer.running=false;
    timer.phase="done"; timer.remaining=0;
    $("#timerStart").disabled=false; $("#timerStart").textContent="Start again"; $("#timerPause").disabled=true;
    cue("done"); updateTimerUI();
    toast("Footwork complete — log it below!");
  }
  function cue(kind) {
    if (kind==="rest") { beep(440,0.15); vibrate([120]); }
    else if (kind==="work") { beep(880,0.15); vibrate([80,40,80]); }
    else { beep(990,0.3); vibrate([200,80,200]); }
  }
  function updateTimerUI() {
    const d = $("#timerDisplay"); if (!d) return;
    const phaseEl = $("#timerPhase"), countEl = $("#timerCount"), roundEl = $("#timerRound"), ring = $("#timerRing");
    const labels = { ready:"Ready", work:"Work", rest:"Rest", done:"Done" };
    phaseEl.textContent = labels[timer.phase] || "Ready";
    d.classList.toggle("rest", timer.phase==="rest");
    countEl.textContent = Math.max(0, timer.remaining);
    const total = timer.lvl ? timer.lvl.rounds : 0;
    roundEl.textContent = timer.phase==="done" ? "Complete ✓" : `Round ${timer.round} / ${total}`;
    const pct = timer.total ? (timer.remaining/timer.total)*100 : 100;
    ring.style.width = clamp(pct,0,100) + "%";
  }
  // audio + vibration
  let audioCtx = null;
  function soundOn(){ const c=$("#timerSound"); return !c || c.checked; }
  function beep(freq, dur) {
    if (!soundOn()) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = freq; o.type="sine"; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime+0.01);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
      o.start(); o.stop(audioCtx.currentTime+dur+0.02);
    } catch(e){ /* audio not allowed */ }
  }
  function vibrate(pattern){ if (soundOn() && navigator.vibrate) { try{ navigator.vibrate(pattern); }catch(e){} } }

  /* ----------------------------------------------------------
     10. TAB 6 — PROGRESS
     ---------------------------------------------------------- */
  function renderProgress(root) {
    const p = state.progress;
    let html = `
      <div class="page-head"><h1>Progress</h1><p class="sub">Trends over time — consistency over intensity</p></div>
      <div class="note">You are building badminton fitness through consistency, not one extreme workout.</div>

      ${metricCard("Weight (kg)", "weight", p.weight, "kg")}
      ${metricCard("Waist (cm)", "waist", p.waist, "cm")}
      ${metricCard("Single-leg calf raises / side", "calfRaise", p.calfRaise, "reps")}
      ${metricCard("Split squats / side", "splitSquat", p.splitSquat, "reps")}
      ${metricCard("Single-leg balance / side (sec)", "balance", p.balance, "s")}
      ${metricCard("Push-ups (max set)", "pushups", p.pushups, "reps")}

      <div class="card">
        <h2>Weekly workout completion</h2>
        ${weeklyCompletionChart()}
      </div>

      <div class="card">
        <h2>Running &amp; footwork snapshot</h2>
        <dl class="kv">
          <dt>Total runs</dt><dd>${state.runLogs.length}</dd>
          <dt>Longest continuous jog</dt><dd>${runPBs().longestJog??"—"} min</dd>
          <dt>Current running level</dt><dd>${state.runLevel}</dd>
          <dt>Footwork sessions</dt><dd>${state.footworkLogs.length}</dd>
          <dt>Shadow badminton level</dt><dd>${state.footworkLevel}</dd>
          <dt>Badminton court sessions</dt><dd>${badmintonCourtCount()}</dd>
        </dl>
        ${runDurationChart()}
      </div>

      <div class="card">
        <h2>Milestones</h2>
        ${state.milestones.map((m,i)=>`
          <div class="ex-item ${m.done?"is-done":""}">
            <label class="inline-check"><input type="checkbox" data-milestone="${i}" ${m.done?"checked":""}>
            <input type="text" value="${esc(m.text)}" data-milestonetext="${i}" style="border:none;background:transparent;font-weight:600;flex:1"></label>
          </div>`).join("")}
        <button class="btn btn-sm btn-ghost no-print" data-addmilestone>＋ Add milestone</button>
      </div>

      <div class="card">
        <h2>General notes</h2>
        <textarea data-prognotes placeholder="Anything you want to remember…">${esc(p.notes||"")}</textarea>
      </div>`;
    root.innerHTML = html;
  }

  function metricCard(title, key, series, unit) {
    const latest = series && series.length ? series[series.length-1].value : null;
    const first = series && series.length ? series[0].value : null;
    const delta = (latest!=null && first!=null) ? (latest-first) : null;
    return `
      <div class="card">
        <div class="card-head"><h2>${esc(title)}</h2>
          ${latest!=null?`<span class="pill pill-primary">${esc(latest)} ${esc(unit)}</span>`:""}</div>
        ${series && series.length ? barChart(series, unit) : `<div class="empty" style="padding:1rem"><span class="emoji">📈</span>No entries yet.</div>`}
        ${delta!=null?`<p class="muted center" style="margin:.4rem 0 0">Change since first entry: ${delta>0?"+":""}${(Math.round(delta*10)/10)} ${esc(unit)}</p>`:""}
        <form class="field-row cols-3 no-print" data-metricform data-key="${esc(key)}" style="margin-top:.6rem;align-items:end">
          <div class="field" style="margin:0"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div>
          <div class="field" style="margin:0"><label>Value</label><input type="number" step="0.1" name="value" placeholder="${esc(unit)}" required></div>
          <button class="btn" type="submit">Add</button>
        </form>
        ${series && series.length ? `<details class="acc" style="border:none;background:transparent;margin:.4rem 0 0"><summary style="padding:.3rem 0;min-height:auto">Entries</summary><div class="acc-body" style="padding:.3rem 0 0">${
          series.slice().reverse().map((pt,ri)=>`<div class="row-between" style="padding:.2rem 0;border-bottom:1px solid var(--border)"><span>${esc(fmtShort(pt.date))}: <strong>${esc(pt.value)} ${esc(unit)}</strong></span><button class="btn btn-sm btn-ghost" data-delmetric data-key="${esc(key)}" data-idx="${series.length-1-ri}">✕</button></div>`).join("")
        }</div></details>` : ""}
      </div>`;
  }

  function barChart(series, unit) {
    const pts = series.slice(-12);
    const vals = pts.map((p)=>Number(p.value));
    const max = Math.max(...vals), min = Math.min(...vals);
    const range = (max-min) || 1;
    return `
      <div class="chart" role="img" aria-label="${esc(unit)} chart, ${pts.length} points, latest ${vals[vals.length-1]}">
        ${pts.map((p)=>{ const h = 12 + ((Number(p.value)-min)/range)*88; return `<div class="bar" style="height:${h}%"><span>${esc(p.value)}</span></div>`; }).join("")}
      </div>
      <div class="chart-x">${pts.map((p)=>`<span>${esc(fmtShort(p.date))}</span>`).join("")}</div>`;
  }

  function weeklyCompletionChart() {
    // count completions per ISO week over last 8 weeks
    const map = {};
    Object.entries(state.completions).forEach(([date,c])=>{ if (c && c.done){ const w=isoWeek(date); map[w]=(map[w]||0)+1; }});
    const weeks=[]; let cur=isoWeek(todayISO());
    for (let i=0;i<8;i++){ weeks.unshift(cur); cur=isoWeek(shiftDays(/\d{4}-\d{2}-\d{2}/.test(cur)?cur:todayISO(), -7)); }
    // weeks are W-keys; rebuild simply from real dates instead:
    const realWeeks=[]; let d=new Date(todayISO()+"T00:00:00");
    for (let i=0;i<8;i++){ realWeeks.unshift(isoWeek(d.toISOString().slice(0,10))); d.setDate(d.getDate()-7); }
    const counts = realWeeks.map((w)=>map[w]||0);
    const max = Math.max(1, ...counts);
    if (Object.keys(map).length===0) return `<div class="empty" style="padding:1rem"><span class="emoji">🗓️</span>Complete workouts on the Today tab to see your weekly trend.</div>`;
    return `
      <div class="chart" role="img" aria-label="Workouts completed per week">
        ${counts.map((c)=>`<div class="bar" style="height:${12+(c/max)*88}%"><span>${c}</span></div>`).join("")}
      </div>
      <div class="chart-x">${realWeeks.map((w)=>`<span>${esc(w.slice(6))}</span>`).join("")}</div>
      <p class="muted center" style="margin:.3rem 0 0">Workouts completed per week (last 8)</p>`;
  }

  function runDurationChart() {
    const pts = state.runLogs
      .filter((r) => Number(r.dur) > 0)
      .map((r) => ({ date: r.date, value: Number(r.dur) }))
      .slice(-12);
    if (!pts.length) return `<p class="muted center" style="margin:.6rem 0 0">Log runs with a total duration to see your running-duration trend here.</p>`;
    return `<h3 style="margin:.8rem 0 .2rem">Running duration (min)</h3>${barChart(pts, "min")}`;
  }

  function badmintonCourtCount() {
    // Count completed days whose note OR (current-week) items mention an actual court session.
    // "court" covers "badminton court"; bare "badminton" is excluded so the default shadow-badminton day isn't counted.
    const rx = /court|doubles|singles|club|match/i;
    const wkk = weekKey();
    let n = 0;
    Object.entries(state.weekStatus).forEach(([k, st]) => {
      if (!st || !st.done) return;
      let hit = rx.test(st.note || "");
      if (!hit && k.startsWith(wkk + ":")) {
        const day = k.slice((wkk + ":").length);
        const wd = state.week.find((d) => d.day === day);
        if (wd) hit = wd.items.some((i) => rx.test(i));
      }
      if (hit) n++;
    });
    return n;
  }

  /* ----------------------------------------------------------
     11. TAB 7 — GUIDANCE
     ---------------------------------------------------------- */
  function renderGuidance(root) {
    const jr = jumpingReadiness();
    let html = `
      <div class="page-head"><h1>Guidance</h1><p class="sub">Tap a card to expand</p></div>

      <div class="note"><strong>Your guiding principle:</strong> train at the highest level you can recover from consistently. Progress when an exercise is clearly manageable and recovery stays normal. Reduce the workload only when genuine warning signs appear.</div>

      <details class="acc" open><summary>0 · Where you're starting from</summary><div class="acc-body">
        <p>You're a <strong>returning player, not a blank-slate beginner</strong>. You've lost ~9 kg in 6 months, kept up 100 push-ups a day, walk 5 km regularly, and your calves have already adapted to walking and early jogging. You also have real badminton experience — just rusty.</p>
        <p>So this plan does two things at once:</p>
        <ul>
          <li><strong>Won't hold you back:</strong> if an exercise is clearly too easy, rate it "Too easy" and move up a variation, add backpack load, slow the lowering, add range, or add a set. Don't stay on chair squats or 4-minute jogs you've outgrown.</li>
          <li><strong>Won't let you rush the risky stuff:</strong> running, lunging, footwork and jumping volume go up gradually, gated by how you recover — because that's where comebacks get derailed.</li>
        </ul>
        <p class="muted" style="margin-bottom:0">A calf that feels worked or mildly burning during effort and then settles is <strong>normal exertion</strong>, not an injury. Warning signs are different — see the Safety card below.</p>
      </div></details>

      <div class="note note-warn"><strong>Progression rule:</strong> Change only one major variable at a time — distance, speed, running intervals, footwork volume, strength sets, resistance, or jump volume.</div>

      <details class="acc"><summary>1 · What badminton fitness requires</summary><div class="acc-body">
        <ul>${["aerobic recovery","repeated short bursts of effort","lower-body strength","calf, ankle and foot durability","single-leg balance","core control","upper-back and shoulder strength","agility","braking and deceleration","eventually, elastic power and jumping ability"].map((x)=>`<li>${esc(x)}</li>`).join("")}</ul>
      </div></details>

      <details class="acc"><summary>2 · Body-composition goal</summary><div class="acc-body">
        <ul>
          <li>Do not treat a single scale weight as compulsory.</li>
          <li>Focus on becoming gradually leaner while becoming stronger.</li>
          <li>The goal is not a bodybuilding physique.</li>
          <li>Avoid crash diets.</li>
          <li>Track weight trend, waist measurement, energy levels and training performance.</li>
        </ul>
        <div class="field-row cols-2">
          <div class="field"><label>Current weight (kg)</label><input type="number" step="0.1" value="${esc(state.profile.weight)}" data-prof="weight"></div>
          <div class="field"><label>Goal range</label><input type="text" value="${esc(state.profile.goalRange)}" data-prof="goalRange"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field"><label>Waist measurement</label><input type="text" value="${esc(state.profile.waist)}" data-prof="waist" placeholder="cm"></div>
          <div class="field"><label>Desired weekly change</label><input type="text" value="${esc(state.profile.weeklyChange)}" data-prof="weeklyChange"></div>
        </div>
      </div></details>

      <details class="acc"><summary>3 · How to progress a strength exercise</summary><div class="acc-body">
        <ul>
          <li>Select a variation allowing roughly 8–15 controlled repetitions.</li>
          <li>Finish most sets with about 1–3 good repetitions remaining.</li>
          <li>When it becomes too easy: use a harder version, add backpack weight, increase range of motion, slow the lowering phase, or add a set.</li>
          <li>Do not train through sharp pain.</li>
          <li>Training to complete failure is not required.</li>
        </ul>
      </div></details>

      <details class="acc" id="jumpReadiness"><summary>4 · Jumping readiness check ${jr.unlocked?`<span class="pill pill-ok">Unlocked</span>`:`<span class="pill pill-warn">Locked</span>`}</summary><div class="acc-body">
        <p>Confirm each item to unlock the low-level jumping routine:</p>
        ${jr.criteria.map((c,i)=>`<label class="inline-check"><input type="checkbox" data-jumpcrit="${i}" ${state.jumpCrit&&state.jumpCrit[i]?"checked":""}> ${esc(c)}</label>`).join("")}
        <div class="btn-row no-print" style="margin-top:.6rem">
          <button class="btn ${jr.allChecked&&!state.jumpingUnlocked?"btn-primary":""}" data-unlockjump ${jr.allChecked?"":"disabled"}>${state.jumpingUnlocked?"Unlocked ✓":"Unlock jumping routine"}</button>
          ${state.jumpingUnlocked?`<button class="btn btn-ghost" data-lockjump>Re-lock</button>`:""}
        </div>
        <hr class="hr">
        <div class="${state.jumpingUnlocked?"":"is-locked-body"}">
          <h3>Low-level jumping routine ${state.jumpingUnlocked?"":"🔒"}</h3>
          <ul>
            <li>2 sets of 10 small two-foot pogo hops</li>
            <li>2 sets of 10 side-to-side line steps</li>
            <li>3 rounds of 20 seconds of imaginary skipping or skipping-rope work</li>
          </ul>
          <p class="muted">Use low, quiet landings. Prioritise control rather than height. Add volume before intensity. Do not begin with maximal jump lunges or all-out shuttle runs.</p>
        </div>
        ${!state.jumpingUnlocked?`<p class="muted">The routine stays visible but locked. Reassess later when the criteria are met.</p>`:""}
      </div></details>

      <details class="acc"><summary>5 · Returning to a badminton court</summary><div class="acc-body">
        <ul>
          <li>Do not wait until you feel completely fit.</li>
          <li>Begin with a relaxed session.</li>
          <li>Doubles may be easier to reintroduce than demanding singles.</li>
          <li>Take longer breaks than you used to.</li>
          <li>Avoid trying to match your old intensity on the first session.</li>
          <li>A demanding court session should replace another hard session rather than being added on top.</li>
        </ul>
      </div></details>

      <details class="acc"><summary>6 · Recovery</summary><div class="acc-body">
        <ul>
          <li>Move around regularly during long periods of sitting.</li>
          <li>Sleep consistently.</li>
          <li>Maintain a moderate calorie deficit rather than an extreme one.</li>
          <li>Eat sufficient protein and a varied diet.</li>
          <li>Drink water regularly.</li>
          <li>Reduce training temporarily when recovery worsens.</li>
        </ul>
      </div></details>

      <details class="acc" open><summary>7 · Safety ⚠️</summary><div class="acc-body">
        <div class="note note-danger" style="margin-top:0">This app provides general training organisation and educational information. It is not a medical diagnosis or a substitute for advice from a qualified clinician.</div>
        <h3 style="color:var(--ok)">Usually acceptable</h3>
        <ul>
          <li>Both calves feel temporarily worked.</li>
          <li>A mild dull or burning muscular sensation.</li>
          <li>The feeling settles when slowing down.</li>
          <li>Normal walking afterwards.</li>
          <li>No swelling.</li>
          <li>Normal recovery later or the following morning.</li>
        </ul>
        <h3 style="color:var(--accent)">Reduce the workload and consider medical advice</h3>
        <ul>
          <li>Sudden sharp pain.</li>
          <li>A sensation like being kicked in the calf.</li>
          <li>Bruising.</li><li>Swelling.</li><li>Limping.</li>
          <li>Persistent Achilles pain or stiffness the following morning.</li>
          <li>Symptoms worsening from one session to the next.</li>
          <li>Recurring numbness, weakness, pins and needles, or difficulty moving the leg.</li>
        </ul>
        <h3 style="color:var(--danger)">Urgent medical advice</h3>
        <ul>
          <li>Throbbing pain mainly in one calf.</li>
          <li>One-sided swelling.</li>
          <li>Warmth or discolouration.</li>
          <li>Swollen veins.</li>
          <li>Chest pain or shortness of breath.</li>
        </ul>
        <div class="note note-danger">Contact an appropriate urgent medical service — especially for chest pain or shortness of breath. This app does not diagnose any condition.</div>
      </div></details>`;
    root.innerHTML = html;
  }

  function jumpingReadiness() {
    const criteria = [
      "15–20 controlled single-leg calf raises per side",
      "10 controlled split squats per side",
      "30 seconds of single-leg balance per side",
      "An easy jog without sharp pain",
      "No notable Achilles pain the following morning",
      "20 controlled bodyweight squats",
    ];
    const checked = state.jumpCrit || [];
    const allChecked = criteria.every((_,i)=>checked[i]);
    return { criteria, allChecked, unlocked: state.jumpingUnlocked };
  }

  /* ----------------------------------------------------------
     12. TAB 8 — SETTINGS
     ---------------------------------------------------------- */
  function renderSettings(root) {
    const pr = state.profile, eq = state.equipment;
    let html = `
      <div class="page-head"><h1>Settings</h1><p class="sub">Profile, equipment, data &amp; preferences</p></div>

      <details class="acc" open><summary>Profile</summary><div class="acc-body">
        <div class="field"><label>Dashboard summary (shown on Today)</label><textarea data-prof="summary" style="min-height:90px">${esc(pr.summary||"")}</textarea></div>
        <div class="field-row cols-2">
          <div class="field"><label>Sex</label><input type="text" value="${esc(pr.sex)}" data-prof="sex"></div>
          <div class="field"><label>Age</label><input type="number" value="${esc(pr.age)}" data-prof="age"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field"><label>Height (cm)</label><input type="number" value="${esc(pr.heightCm)}" data-prof="heightCm"></div>
          <div class="field"><label>Height (imperial)</label><input type="text" value="${esc(pr.heightImp)}" data-prof="heightImp"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field"><label>Current weight (kg)</label><input type="number" step="0.1" value="${esc(pr.weight)}" data-prof="weight"></div>
          <div class="field"><label>Weight at start of year (kg)</label><input type="number" step="0.1" value="${esc(pr.startWeight)}" data-prof="startWeight"></div>
        </div>
        <div class="field"><label>Main goal</label><textarea data-prof="goal">${esc(pr.goal)}</textarea></div>
        <div class="field"><label>Training environment</label><input type="text" value="${esc(pr.environment)}" data-prof="environment"></div>
        <div class="field"><label>Lifestyle history</label><textarea data-prof="lifestyle">${esc(pr.lifestyle)}</textarea></div>
        <div class="field"><label>Recent progress</label><textarea data-prof="progress" style="min-height:120px">${esc(pr.progress)}</textarea></div>
      </div></details>

      <details class="acc"><summary>Available equipment</summary><div class="acc-body">
        ${[["bodyweight","Bodyweight"],["backpack","Loaded backpack"],["band","Resistance band"],["rope","Skipping rope"],["chair","Chair / stable step"],["floor","Clear floor space"]]
          .map(([k,l])=>`<label class="inline-check"><input type="checkbox" data-equip="${k}" ${eq[k]?"checked":""}> ${esc(l)}</label>`).join("")}
      </div></details>

      <details class="acc"><summary>Preferred training days</summary><div class="acc-body">
        ${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
          .map((d)=>`<label class="inline-check"><input type="checkbox" data-trainday="${d}" ${state.trainingDays.includes(d)?"checked":""}> ${d}</label>`).join("")}
      </div></details>

      <details class="acc"><summary>Levels &amp; unlocks</summary><div class="acc-body">
        <div class="field"><label>Current running level</label>
          <select data-setrun>${DATA.runLevels.map((l)=>`<option value="${l.n}" ${l.n===state.runLevel?"selected":""}>Level ${l.n}</option>`).join("")}</select></div>
        <div class="field"><label>Current footwork level</label>
          <select data-setfw>${DATA.footworkLevels.map((l)=>`<option value="${l.n}" ${l.n===state.footworkLevel?"selected":""}>Level ${l.n}</option>`).join("")}</select></div>
        <label class="inline-check"><input type="checkbox" data-setjump ${state.jumpingUnlocked?"checked":""}> Low-level jumping unlocked</label>
      </div></details>

      <details class="acc"><summary>Appearance &amp; reminders</summary><div class="acc-body">
        <label class="inline-check"><input type="checkbox" data-setdark ${state.theme==="dark"?"checked":""}> Dark mode</label>
        <div class="field" style="margin-top:.6rem"><label>Reminder preference text</label>
          <textarea data-prof2="reminderText">${esc(state.reminderText)}</textarea></div>
      </div></details>

      <details class="acc" open><summary>Data</summary><div class="acc-body">
        <p class="muted">Everything is stored only in this browser. Back it up regularly.</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-export>⬇ Export JSON backup</button>
          <button class="btn" data-importbtn>⬆ Import JSON backup</button>
        </div>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
        <hr class="hr">
        <button class="btn btn-danger btn-block" data-reset>🗑 Reset all stored data</button>
      </div></details>

      <p class="muted center" style="margin-top:1rem">Badminton Fitness · personal use · works offline</p>`;
    root.innerHTML = html;
  }

  /* ----------------------------------------------------------
     13. Smart progression suggestions (rule-based)
     ---------------------------------------------------------- */
  function buildSuggestions() {
    const out = [];
    // Running progression
    const runs = state.runLogs.filter((r)=>Number(r.level)===state.runLevel);
    const last2 = runs.slice(-2);
    if (last2.length===2 && last2.every((r)=> Number(r.rpe)>0 && Number(r.rpe)<=6 && r.after!=="Pain" && r.morning!=="Pain" && r.calf!=="Pain")) {
      if (state.runLevel < 6) out.push(`Running: you completed Level ${state.runLevel} twice at ≤6/10 with no pain. Consider moving to Level ${state.runLevel+1}.`);
    }
    // worsening morning symptoms -> never progress, advise reduce
    const recentRun = state.runLogs.slice(-1)[0];
    if (recentRun && recentRun.morning==="Pain") out.push("Running: you recorded next-morning pain. Reduce the workload and review Guidance → Safety. Do not progress yet.");
    if (recentRun && (recentRun.calf==="Pain" || recentRun.after==="Pain")) out.push("You logged pain on a recent run. Reduce workload and review the safety guidance.");
    // Footwork progression
    const fws = state.footworkLogs.filter((f)=>Number(f.level)===state.footworkLevel);
    const fl2 = fws.slice(-2);
    if (fl2.length===2 && fl2.every((f)=> Number(f.rpe)>0 && Number(f.rpe)<=7 && f.calf!=="Pain")) {
      if (state.footworkLevel < 5) out.push(`Footwork: Level ${state.footworkLevel} felt manageable twice with no pain. Consider Level ${state.footworkLevel+1}.`);
    }
    const recentFw = state.footworkLogs.slice(-1)[0];
    if (recentFw && recentFw.calf==="Pain") out.push("Footwork: you recorded calf pain. Reduce workload and review the safety guidance.");
    // Strength: exercises marked "Too easy" — push progression, don't leave you stuck
    Object.entries(state.exerciseFeel).forEach(([name,f])=>{
      if (f && f.rating==="Too easy") out.push(`Strength: “${name}” is marked Too easy — progress it: harder variation, add backpack load, slow the lowering, add range of motion, or add a set. Aim to finish sets with ~1–3 reps left.`);
    });
    // Strength: exercises marked "Too hard" — ease off rather than grind
    Object.entries(state.exerciseFeel).forEach(([name,f])=>{
      if (f && f.rating==="Too hard") out.push(`Strength: “${name}” is marked Too hard — drop to an easier variation or fewer reps. No need to train to failure.`);
    });
    return out.slice(0,6);
  }

  /* ----------------------------------------------------------
     14. Export / import / reset
     ---------------------------------------------------------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "badminton-fitness-backup-" + todayISO() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    toast("Backup downloaded");
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data !== "object" || !data) throw new Error("bad");
        if (!confirm("Import this backup? It will replace your current data.")) return;
        state = Object.assign(defaultState(), data);
        save(); applyTheme(); go(currentTab); toast("Backup imported");
      } catch (e) { alert("That file could not be read as a valid backup."); }
    };
    reader.readAsText(file);
  }
  function resetData() {
    if (!confirm("Reset ALL data? This permanently deletes your profile, logs and progress in this browser.")) return;
    if (!confirm("Are you sure? This cannot be undone. (Tip: export a backup first.)")) return;
    localStorage.removeItem(KEY);
    state = defaultState();
    save(); applyTheme(); go("today"); toast("All data reset");
  }

  /* ----------------------------------------------------------
     15. Theme
     ---------------------------------------------------------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const icon = $(".theme-icon"); if (icon) icon.textContent = state.theme==="dark" ? "☀️" : "🌙";
  }
  function toggleTheme() { state.theme = state.theme==="dark" ? "light" : "dark"; applyTheme(); save(); }

  /* ----------------------------------------------------------
     16. Global event handling (delegation)
     ---------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-rec],[data-swaptoday],[data-clearoverride],[data-nextsession],[data-delextra],[data-strength-check],[data-complete],[data-uncomplete],[data-feel],[data-filter],[data-clearfilters],[data-runlevel],[data-runstep],[data-fwlevel],[data-weekdone],[data-weekrest],[data-additem],[data-resetweek],[data-milestone],[data-addmilestone],[data-delmetric],[data-dellog],[data-jumpcrit],[data-unlockjump],[data-lockjump],[data-export],[data-importbtn],[data-reset],[data-calf-switch],[data-setjump]");
    if (!t) return;

    if (t.dataset.go) { go(t.dataset.go); return; }

    if (t.dataset.rec) { setRecovery(t.dataset.rec); renderToday($("#tab-today")); return; }

    if (t.dataset.swaptoday) {
      const sched = workoutForToday().scheduled;
      state.dayOverride = state.dayOverride || {};
      state.dayAdvance = state.dayAdvance || {};
      delete state.dayAdvance[todayISO()];   // manual choice resets the "next session" counter
      if (t.dataset.swaptoday === sched) delete state.dayOverride[todayISO()]; // chose the planned one = no override
      else state.dayOverride[todayISO()] = t.dataset.swaptoday;
      save(); renderToday($("#tab-today"));
      toast("Today switched to " + (SESSION_TYPES[t.dataset.swaptoday] || {}).label);
      return;
    }
    if (t.hasAttribute("data-clearoverride")) {
      if (state.dayOverride) delete state.dayOverride[todayISO()];
      if (state.dayAdvance) delete state.dayAdvance[todayISO()];
      save(); renderToday($("#tab-today")); toast("Back to your planned session");
      return;
    }
    if (t.hasAttribute("data-nextsession")) {
      const upcoming = upcomingSessions(14);
      if (!upcoming.length) { toast("No upcoming sessions in your plan"); return; }
      state.dayAdvance = state.dayAdvance || {};
      const idx = Math.min(state.dayAdvance[todayISO()] || 0, upcoming.length - 1);
      const next = upcoming[idx];
      state.dayOverride = state.dayOverride || {};
      state.dayOverride[todayISO()] = next.type;
      state.dayAdvance[todayISO()] = idx + 1;   // next press goes one further
      delete state.completions[todayISO()];     // start the pulled session fresh (the weekly "done" tick stays)
      save(); renderToday($("#tab-today"));
      window.scrollTo({ top: 0 });
      toast("Loaded next: " + (SESSION_TYPES[next.type] || {}).label + " (normally " + next.dayName + ")");
      return;
    }
    if (t.dataset.delextra) {
      state.extraActivities = (state.extraActivities || []).filter((a) => a.id !== t.dataset.delextra);
      save(); renderToday($("#tab-today")); return;
    }

    if (t.hasAttribute("data-strength-check")) {
      toggleStrengthDone(t.dataset.key, t.dataset.name, t.checked); return;
    }
    if (t.hasAttribute("data-complete")) { completeToday(t.dataset.key); return; }
    if (t.hasAttribute("data-uncomplete")) { uncompleteToday(); return; }

    if (t.hasAttribute("data-feel")) {
      const f = state.exerciseFeel[t.dataset.name] || {};
      f.rating = f.rating===t.dataset.rating ? "" : t.dataset.rating;
      state.exerciseFeel[t.dataset.name] = f; save();
      $$(`[data-feel][data-name="${cssEsc(t.dataset.name)}"]`).forEach((b)=>b.setAttribute("aria-pressed", b.dataset.rating===f.rating));
      return;
    }

    if (t.dataset.filter) { activeFilters.has(t.dataset.filter)?activeFilters.delete(t.dataset.filter):activeFilters.add(t.dataset.filter); renderLibrary($("#tab-library")); return; }
    if (t.hasAttribute("data-clearfilters")) { activeFilters.clear(); renderLibrary($("#tab-library")); return; }

    if (t.dataset.runlevel) { state.runLevel = Number(t.dataset.runlevel); save(); renderRunning($("#tab-running")); return; }
    if (t.dataset.runstep) { state.runLevel = clamp(state.runLevel + Number(t.dataset.runstep),1,6); save(); renderRunning($("#tab-running")); return; }
    if (t.dataset.fwlevel) { state.footworkLevel = Number(t.dataset.fwlevel); resetTimer(); save(); renderFootwork($("#tab-footwork")); return; }

    if (t.hasAttribute("data-weekdone")) { setWeek(t.dataset.day, { done: t.checked }); renderWeekly($("#tab-weekly")); return; }
    if (t.hasAttribute("data-weekrest")) { setWeek(t.dataset.day, { rest: t.checked }); renderWeekly($("#tab-weekly")); return; }
    if (t.hasAttribute("data-additem")) { addWeekItem(t.dataset.day); return; }
    if (t.hasAttribute("data-resetweek")) { if (confirm("Reset this week's plan to the default schedule?")) { state.week = DATA.weekDefault.map((d)=>({...d,items:d.items.slice()})); Object.keys(state.weekStatus).forEach((k)=>{ if(k.startsWith(weekKey()+":")) delete state.weekStatus[k]; }); save(); renderWeekly($("#tab-weekly")); } return; }

    if (t.hasAttribute("data-milestone")) { state.milestones[+t.dataset.milestone].done = t.checked; save(); renderProgress($("#tab-progress")); return; }
    if (t.hasAttribute("data-addmilestone")) { state.milestones.push({text:"New milestone",done:false}); save(); renderProgress($("#tab-progress")); return; }
    if (t.hasAttribute("data-delmetric")) { state.progress[t.dataset.key].splice(+t.dataset.idx,1); save(); renderProgress($("#tab-progress")); return; }

    if (t.dataset.dellog) { deleteLog(t.dataset.dellog, t.dataset.id); return; }

    if (t.hasAttribute("data-jumpcrit")) {
      // update in place so the accordion the user is working in stays open
      state.jumpCrit = state.jumpCrit||[]; state.jumpCrit[+t.dataset.jumpcrit]=t.checked; save();
      const allChecked = jumpingReadiness().allChecked;
      const btn = $("[data-unlockjump]");
      if (btn && !state.jumpingUnlocked) { btn.disabled = !allChecked; btn.classList.toggle("btn-primary", allChecked); }
      return;
    }
    if (t.hasAttribute("data-unlockjump")) { state.jumpingUnlocked = true; save(); renderGuidance($("#tab-guidance")); const d=$("#jumpReadiness"); if(d) d.open=true; toast("Jumping routine unlocked"); return; }
    if (t.hasAttribute("data-lockjump")) { state.jumpingUnlocked = false; save(); renderGuidance($("#tab-guidance")); return; }

    if (t.hasAttribute("data-export")) { exportData(); return; }
    if (t.hasAttribute("data-importbtn")) { $("#importFile").click(); return; }
    if (t.hasAttribute("data-reset")) { resetData(); return; }
  });

  // change events (selects, checkboxes inside forms, text inputs that need persistence)
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains("calfq")) { evalCalf(); return; }
    if (t.hasAttribute("data-swap")) { setSessionCustom(t.dataset.key, "variation", t.dataset.ref, t.value); renderToday($("#tab-today")); return; }
    if (t.hasAttribute("data-moveto")) { setWeek(t.dataset.day, { movedTo: t.value||null }); renderWeekly($("#tab-weekly")); return; }
    if (t.dataset.metricform!==undefined) return; // handled by submit
    if (t.dataset.equip) { state.equipment[t.dataset.equip]=t.checked; save(); return; }
    if (t.dataset.trainday) { const d=t.dataset.trainday; const i=state.trainingDays.indexOf(d); if (t.checked && i<0) state.trainingDays.push(d); if (!t.checked && i>=0) state.trainingDays.splice(i,1); save(); return; }
    if (t.dataset.setrun!==undefined) { state.runLevel=Number(t.value); save(); return; }
    if (t.dataset.setfw!==undefined) { state.footworkLevel=Number(t.value); save(); return; }
    if (t.hasAttribute && t.hasAttribute("data-setjump")) { state.jumpingUnlocked=t.checked; save(); return; }
    if (t.hasAttribute && t.hasAttribute("data-setdark")) { state.theme=t.checked?"dark":"light"; applyTheme(); save(); return; }
    if (t.id === "importFile" && t.files && t.files[0]) { importData(t.files[0]); t.value=""; return; }
  });

  // live text inputs (save on input, no re-render to keep focus)
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.prof!==undefined) { const v = t.type==="number"?Number(t.value):t.value; state.profile[t.dataset.prof]=v; save(); return; }
    if (t.dataset.prof2!==undefined) { state[t.dataset.prof2]=t.value; save(); return; }
    if (t.dataset.setsedit!==undefined) { setSessionCustom(t.dataset.key,"sets",t.dataset.ref,t.value); return; }
    if (t.dataset.exnote!==undefined) { setSessionCustom(t.dataset.key,"notes",t.dataset.ref,t.value); return; }
    if (t.dataset.actual!==undefined) { recordActual(t.dataset.key,t.dataset.name,t.value); return; }
    if (t.id === "todayNotes") { setTodayNotes(t.value); return; }
    if (t.dataset.feelnote!==undefined) { const f=state.exerciseFeel[t.dataset.name]||{}; f.note=t.value; state.exerciseFeel[t.dataset.name]=f; save(); return; }
    if (t.dataset.addtext!==undefined) return;
    if (t.dataset.weeknote!==undefined) { setWeek(t.dataset.day,{note:t.value}); return; }
    if (t.dataset.milestonetext!==undefined) { state.milestones[+t.dataset.milestonetext].text=t.value; save(); return; }
    if (t.dataset.prognotes!==undefined) { state.progress.notes=t.value; save(); return; }
  });

  // form submits (run log, footwork log, metric add)
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.id === "runForm") { e.preventDefault(); saveRun(f); return; }
    if (f.id === "fwForm") { e.preventDefault(); saveFw(f); return; }
    if (f.id === "extraForm") { e.preventDefault(); saveExtra(f); return; }
    if (f.dataset.metricform!==undefined) { e.preventDefault(); addMetric(f.dataset.key, f); return; }
  });

  function saveExtra(form) {
    const fd = new FormData(form);
    const what = (fd.get("what") || "").toString().trim();
    if (!what) { toast("Type what you did"); return; }
    state.extraActivities = state.extraActivities || [];
    state.extraActivities.push({
      id: uid(),
      date: fd.get("date") || todayISO(),
      what: what,
      note: (fd.get("note") || "").toString().trim(),
    });
    save();
    renderToday($("#tab-today"));
    toast("Extra activity logged");
  }

  function cssEsc(s){ return String(s).replace(/"/g,'\\"'); }

  /* ---- mutation helpers ---- */
  function setSessionCustom(key, kind, ref, val) {
    state.sessionCustom[key] = state.sessionCustom[key] || { variation:{}, sets:{}, notes:{} };
    state.sessionCustom[key][kind][ref] = val; save();
  }
  function recordActual(key, name, val) {
    const c = ensureTodayComp(key);
    c.results[name] = c.results[name] || {};
    c.results[name].actual = val;
    state.lastSessionResults[name] = val;
    save();
  }
  function ensureTodayComp(key) {
    const d = todayISO();
    state.completions[d] = state.completions[d] || { sessionKey:key||"", results:{}, notes:"", done:false };
    if (key) state.completions[d].sessionKey = key;
    return state.completions[d];
  }
  function toggleStrengthDone(key, name, checked) {
    const c = ensureTodayComp(key);
    c.results[name] = c.results[name] || {};
    c.results[name].done = checked;
    save();
    // update progress bar + row without full re-render
    const item = document.querySelector(`[data-strength-check][data-name="${cssEsc(name)}"]`)?.closest("[data-ex-item]");
    if (item) item.classList.toggle("is-done", checked);
    updateTodayBar(key);
  }
  function updateTodayBar(key) {
    const checks = $$("[data-strength-check]");
    if (!checks.length) return;
    const done = checks.filter((c)=>c.checked).length;
    const pct = Math.round(done/checks.length*100);
    const bar = $("#todayBar"); if (bar) bar.style.width = pct+"%";
    const lbl = $("#todayBarLabel"); if (lbl) lbl.textContent = `${done} of ${checks.length} done`;
  }
  function setTodayNotes(v) { const c = ensureTodayComp(); c.notes = v; save(); }
  function completeToday(key) {
    const c = ensureTodayComp(key);
    c.done = true;
    // keep the Weekly Plan summary in sync by marking today's day complete too
    const dayName = DAYS[new Date(todayISO() + "T00:00:00").getDay()];
    setWeek(dayName, { done: true });
    save();
    renderToday($("#tab-today"));
    toast(encourage());
  }
  function uncompleteToday() { const c = state.completions[todayISO()]; if (c){ c.done=false; save(); } renderToday($("#tab-today")); }

  function setWeek(day, patch) {
    const k = weekKey()+":"+day;
    state.weekStatus[k] = Object.assign({}, state.weekStatus[k], patch);
    save();
  }
  function addWeekItem(day) {
    const input = document.querySelector(`[data-addtext][data-day="${cssEsc(day)}"]`);
    const txt = input && input.value.trim();
    if (!txt) { toast("Type something to add"); return; }
    const wd = state.week.find((d)=>d.day===day);
    if (wd) { wd.items.push(txt); save(); renderWeekly($("#tab-weekly")); }
  }

  function saveRun(form) {
    const fd = new FormData(form);
    const r = { id: uid(), date: fd.get("date")||todayISO(), level: fd.get("level"),
      dist: fd.get("dist"), dur: fd.get("dur"), jog: fd.get("jog"), walk: fd.get("walk"),
      rpe: fd.get("rpe"), calf: fd.get("calf"), after: fd.get("after"), morning: fd.get("morning"), notes: fd.get("notes") };
    state.runLogs.push(r); save();
    renderRunning($("#tab-running"));
    toast("Run saved");
    if (r.morning==="Pain"||r.calf==="Pain"||r.after==="Pain") toast("Pain logged — see Safety guidance");
  }
  function saveFw(form) {
    const fd = new FormData(form);
    const f = { id: uid(), date: fd.get("date")||todayISO(), level: fd.get("level"),
      rounds: fd.get("rounds"), rpe: fd.get("rpe"), calf: fd.get("calf"), notes: fd.get("notes") };
    state.footworkLogs.push(f); save();
    renderFootwork($("#tab-footwork"));
    toast("Footwork saved");
  }
  function deleteLog(kind, id) {
    if (kind==="run") state.runLogs = state.runLogs.filter((r)=>r.id!==id);
    else state.footworkLogs = state.footworkLogs.filter((r)=>r.id!==id);
    save();
    kind==="run" ? renderRunning($("#tab-running")) : renderFootwork($("#tab-footwork"));
  }
  function addMetric(key, form) {
    const fd = new FormData(form);
    const date = fd.get("date")||todayISO();
    const value = Number(fd.get("value"));
    if (isNaN(value)) { toast("Enter a number"); return; }
    state.progress[key] = state.progress[key] || [];
    state.progress[key].push({ date, value });
    state.progress[key].sort((a,b)=> a.date<b.date?-1:1);
    save(); renderProgress($("#tab-progress"));
    toast("Added");
  }

  function evalCalf() {
    const flags = $$(".calfq").filter((c)=>c.checked).length;
    const out = $("#calfResult"); if (!out) return;
    if (flags>0) {
      out.innerHTML = `<div class="note note-danger" style="margin-bottom:0">
        You ticked a warning sign. Switch to <strong>recovery mode</strong> today and avoid running, jumping or footwork.
        Sharp pain, swelling, limping or worsening symptoms are reasons to reduce load and consider medical advice (Guidance → Safety). This app does not diagnose.
        <div class="btn-row" style="margin-top:.5rem"><button class="btn btn-sm" data-go="guidance">Open Safety</button></div></div>`;
    } else {
      out.innerHTML = `<div class="note" style="margin-bottom:0">✅ No warning signs — good to train. A worked or mildly burning feeling during effort that settles when you slow down is normal and expected. Keep most work controlled and stop only if something turns sharp.</div>`;
    }
  }

  /* ----------------------------------------------------------
     17. Print (render all tabs first so everything prints)
     ---------------------------------------------------------- */
  function printFriendly() {
    const order = ["today","weekly","library","running","footwork","progress","guidance","settings"];
    order.forEach((tab)=>{ const el=$("#tab-"+tab); renderers[tab](el); });
    // temporarily reveal all panels for print (CSS @media print also forces this)
    window.print();
    // restore single-tab view after printing
    setTimeout(()=>go(currentTab,{keepScroll:true}), 300);
  }

  /* ----------------------------------------------------------
     18. Boot
     ---------------------------------------------------------- */
  function boot() {
    applyTheme();
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#printBtn").addEventListener("click", printFriendly);

    const start = (location.hash||"").replace("#","");
    go(renderers[start] ? start : "today");

    // service worker (only over http/https, not file://)
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch((e)=>console.info("SW not registered:", e.message));
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
