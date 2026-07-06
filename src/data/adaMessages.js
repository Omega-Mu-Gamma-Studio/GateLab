/**
 * adaMessages.js
 *
 * The full text corpus for Ada's side of the PDA relationship across Unit I.
 *
 * ── Message anatomy ──────────────────────────────────────────────────────
 *
 *  id          : unique string, stable across sessions
 *  contactId   : 'ada' | 'reyes' | 'captain' | 'maint'
 *  trigger     : when this message unlocks
 *                  'lesson:unit1-01'      → after solving lesson 01
 *                  'unit1:end'            → after unit 1 binary choice is made
 *                  'rapport:warm'         → rapport hits warm band
 *                  'flag:unit1_ending:aligned' → after specific unit choice
 *  rapportGate : null | 'warm' | 'neutral' | 'cold'
 *                Only deliver if current rapport band matches.
 *                null = always deliver.
 *  flagGate    : null | [flagKey, flagValue]
 *                Only deliver if flag matches.
 *  type        : 'incoming' | 'image' | 'system'
 *  content     : Ada's message text
 *  image       : null | { src, caption, alt }
 *  replyOptions: null | array of 3 reply objects
 *
 * ── Reply option anatomy ────────────────────────────────────────────────
 *
 *  id           : 'a' | 'b' | 'c'
 *  label        : what the player's reply bubble shows
 *  rapportDelta : -1 | 0 | +1
 *  adaResponse  : her response text (always sent immediately after reply)
 *  adaImage     : null | { src, caption, alt }  — sends a photo with her response
 *
 * ── Rapport design ──────────────────────────────────────────────────────
 *
 *  Reply A → +1  (warm, curious, open)
 *  Reply B →  0  (neutral, professional, terse)
 *  Reply C → -1  (cold, deflecting, asshole-ish — but not always)
 *              Sometimes C is just dry humor — still reads cold to Ada
 *
 *  Rapport range: -10 → +10
 *  Bands:  warm    ≥ +4
 *          neutral  -3 to +3
 *          cold    ≤ -4
 *
 * ── Placeholder images ──────────────────────────────────────────────────
 *
 *  All image srcs are placeholder strings for now.
 *  Replace with actual asset paths when art exists.
 *  Format: 'ada:photo-slug' — the PhotosTab renders these as colored
 *  placeholder cards with the caption until real assets are dropped in.
 *
 * ── Unit I structure ─────────────────────────────────────────────────────
 *
 *  10 lessons → 10 post-lesson messages
 *  Each message has 3 reply options
 *  Unit end → binary choice modal (not in this file, see unit1EndChoice)
 *  3 rapport-gated bonus messages (warm only, cold only, rapport:warm trigger)
 *  2 photo unlocks woven into reply responses
 *
 */

// ── Utility: build a message ─────────────────────────────────────────────
function msg(fields) {
  return {
    contactId:    'ada',
    rapportGate:  null,
    flagGate:     null,
    image:        null,
    replyOptions: null,
    replied:      false,
    ...fields,
  }
}

// ── Utility: build reply options ─────────────────────────────────────────
function replies(a, b, c) {
  return [
    { id: 'a', rapportDelta: +1, ...a },
    { id: 'b', rapportDelta:  0, ...b },
    { id: 'c', rapportDelta: -1, ...c },
  ]
}

// ════════════════════════════════════════════════════════════════════════
// UNIT I MESSAGES
// ════════════════════════════════════════════════════════════════════════

export const UNIT1_MESSAGES = [

  // ── LESSON 01 · AND Gate ──────────────────────────────────────────────
  msg({
    id:      'u1-01-post',
    trigger: 'lesson:unit1-01',
    type:    'incoming',
    content: "Bay 4 is back online. Good work.\n\nAnd yeah — I know it's just an AND gate. Two inputs, one output, nothing happens unless both agree. But I watched a whole bay depressurize once because someone wired around that check. Both sensors high, no AND gate, vent fired on one reading.\n\nIt's not a complicated piece of logic. That's why it works.",
    replyOptions: replies(
      {
        label:       "Makes sense. You need agreement before you act.",
        adaResponse: "Exactly. Same principle as a two-person launch authorization. One key isn't enough. You need both.\n\nAnyway. Good shift.",
      },
      {
        label:       "Noted. What's next on the board?",
        adaResponse: "OR gate, probably. Different problem — fires if *either* input is high. Opposite failure mode.\n\nCheck the board when you're ready.",
      },
      {
        label:       "I know what an AND gate is.",
        adaResponse: "Sure you do. You just couldn't wire one twenty minutes ago.\n\nNo offense.",
      }
    ),
  }),

  // ── LESSON 02 · OR Gate ──────────────────────────────────────────────
  msg({
    id:      'u1-02-post',
    trigger: 'lesson:unit1-02',
    type:    'incoming',
    content: "OR gate's the other side of it. Fire on *any* signal. Good for redundancy — two sensors, either one catches the problem, alarm triggers.\n\nBad if your redundancy has a stuck sensor that's permanently HIGH. Seen that once. Alarm never stopped. Engineering pulled the sensor, didn't tell anyone why. Shift went fine.\n\nContext matters.",
    replyOptions: replies(
      {
        label:       "Redundancy logic. Makes sense why it fires on either.",
        adaResponse: "Right. Depends what you're protecting against. If you're afraid of *missing* a fault, OR is your gate. If you're afraid of *false* positives, AND is.\n\nNeither is right or wrong. It's about the failure mode you're designing for.",
        adaImage: {
          src:     '/ada/photo-or-gate-diagram.png',
          caption: 'Quick sketch I made during training. Still have it.',
          alt:     'Hand-drawn OR gate truth table on a yellowed maintenance log page, pencil and ink',
        },
      },
      {
        label:       "Got it. Stuck HIGH is bad.",
        adaResponse: "Any stuck state is bad. The logic assumes inputs move. If they don't, the gate is lying to you and you don't know it.",
      },
      {
        label:       "So the whole system can be fooled by one bad sensor.",
        adaResponse: "Yes. That's not unique to OR gates, it's just more obvious with them.\n\nEverything's downstream of the inputs. Garbage in, garbage out.",
      }
    ),
  }),

  // ── LESSON 03 · NOT Gate ─────────────────────────────────────────────
  msg({
    id:      'u1-03-post',
    trigger: 'lesson:unit1-03',
    type:    'incoming',
    content: "NOT gate's the simplest one and weirdly the most useful. Just flips it. HIGH becomes LOW, LOW becomes HIGH.\n\nHalf the ship's safety logic runs on negation. 'No fault detected' means the fault sensor is LOW — which the NOT gate reads as HIGH — which keeps the door open. Fault happens, sensor goes HIGH, NOT flips it LOW, door locks.\n\nThe absence of a thing doing the work. Took me a while to stop finding that weird.",
    replyOptions: replies(
      {
        label:       "That's actually elegant. Passive-safe design.",
        adaResponse: "Yeah. If the sensor dies, it reads LOW by default — door locks, not opens. Fail toward the safe state.\n\nA lot of this ship's logic was designed that way. Not all of it. The OR incident I told you about? Not that.",
      },
      {
        label:       "Makes sense. Inverter.",
        adaResponse: "Yep. That's all it is. Don't overthink it.",
      },
      {
        label:       "Why not just wire it correctly the first time?",
        adaResponse: "Because 'correctly' depends on which failure you're protecting against, and that's a design decision, not a wiring decision.\n\nBut sure.",
      }
    ),
  }),

  // ── LESSON 04 · NAND & NOR ───────────────────────────────────────────
  msg({
    id:      'u1-04-post',
    trigger: 'lesson:unit1-04',
    type:    'incoming',
    content: "NAND and NOR. AND and OR with a NOT on the end. Simple enough on the surface.\n\nHere's the thing they probably didn't tell you: you can build *any* logic gate out of just NANDs. Or just NORs. Either one is complete on its own. One gate type, infinite combinations.\n\nMost of the actual silicon in this ship's processors is NAND. Cheaper to fabricate. The whole ship's brain is just NANDs pretending to be everything else.",
    replyOptions: replies(
      {
        label:       "Universal gates. That's kind of wild to think about.",
        adaResponse: "Right? Every calculation, every sensor read, every door open — all of it is ultimately 'not both inputs are high.'\n\nI find that either deeply satisfying or deeply unsettling depending on the day.",
        adaImage: {
          src:     '/ada/photo-coffee-station.png',
          caption: 'The only thing keeping this station operational.',
          alt:     'A cluttered, messy coffee station on the ship. A chipped mug with a faded sticker, a bag of black coffee, and a small succulent plant surviving under a harsh fluorescent light',
        },
      },
      {
        label:       "So NOR works the same way? Just the other flavor?",
        adaResponse: "Yes. NOR complete, NAND complete — mathematically equivalent in expressive power. Different performance profiles in practice, but yes.\n\nEither one is all you need.",
      },
      {
        label:       "The ship's brain is NAND gates. That's not reassuring.",
        adaResponse: "It's been flying for twelve years on those NAND gates. I'd say that's pretty reassuring.\n\nBut okay.",
      }
    ),
  }),

  // ── LESSON 05 · XOR & XNOR ───────────────────────────────────────────
  msg({
    id:      'u1-05-post',
    trigger: 'lesson:unit1-05',
    type:    'incoming',
    content: "XOR. Exclusive OR. Fires when exactly one input is high — not both, not neither. *Different* inputs trigger it.\n\nUsed it last month to debug a parity mismatch in the coolant sensor array. Two sensors reading slightly different values — XOR flag lit up, told us exactly which pair disagreed without running diagnostics on all fourteen.\n\nGood gate for finding where things stop agreeing.",
    replyOptions: replies(
      {
        label:       "Disagreement detector. I like that framing.",
        adaResponse: "It's how I think about it. AND is consensus. OR is participation. XOR is *conflict*.\n\nXNOR is the opposite — fires when they agree. Conformity detector, if you want to keep the analogy.",
      },
      {
        label:       "Parity checking. Makes sense for data validation.",
        adaResponse: "Exactly. Any time you're transmitting something and you want to know if it arrived intact, XOR gives you a fast way to check.\n\nOne-bit error detection. Not perfect, but cheap.",
      },
      {
        label:       "You remember all your old work orders?",
        adaResponse: "Some of them. The interesting ones.\n\nCoolant parity mismatch is more interesting than it sounds.",
      }
    ),
  }),

  // ── LESSON 06 · Boolean Laws ──────────────────────────────────────────
  msg({
    id:      'u1-06-post',
    trigger: 'lesson:unit1-06',
    type:    'incoming',
    content: "Boolean algebra. I know it sounds like we just went from practical to theoretical, but it matters more than it seems.\n\nSimplifying logic expressions means fewer gates. Fewer gates means less power, less heat, less surface area to fail. On a ship this size that math compounds fast.\n\nDeMorgan's theorem is the one to really sit with. NOT(A AND B) = (NOT A) OR (NOT B). That identity is how you convert between gate families. It's the Rosetta Stone for this stuff.",
    replyOptions: replies(
      {
        label:       "DeMorgan's is what lets you use NANDs for everything.",
        adaResponse: "Yes. Exactly. That's why universal gates are universal — DeMorgan gives you the bridge.\n\nYou're connecting things faster than I expected, honestly.",
      },
      {
        label:       "So less is actually more with gate count.",
        adaResponse: "Always. Every gate is a potential failure point. The minimal equivalent expression is also the most reliable implementation.\n\nSimplest thing that works is usually the right thing.",
      },
      {
        label:       "You could have led with the practical use case.",
        adaResponse: "I did. The practical use case is 'fewer gates, ship doesn't overheat.'\n\nI thought the theorem framing would help. My bad.",
      }
    ),
  }),

  // ── LESSON 07 · SOP & POS ────────────────────────────────────────────
  msg({
    id:      'u1-07-post',
    trigger: 'lesson:unit1-07',
    type:    'incoming',
    content: "Sum of Products, Product of Sums. Two ways to express the same truth table in a standard form.\n\nSOP reads as 'the output is HIGH when this pattern OR this pattern OR this pattern is on the inputs.' POS reads as 'the output is LOW unless this condition AND this condition AND this condition hold.'\n\nNeither is more correct. SOP is usually easier to read. POS is sometimes easier to minimize. Real circuits care about which one maps more cleanly to the available hardware.",
    replyOptions: replies(
      {
        label:       "So the choice depends on what you have to build it with.",
        adaResponse: "Right. If you have AND-then-OR hardware, SOP fits naturally. OR-then-AND hardware, POS.\n\nThe underlying Boolean function is identical. The implementation path is what differs.",
      },
      {
        label:       "Two representations of the same truth table. Dual forms.",
        adaResponse: "Yeah. Dual forms — good way to put it. They're duals of each other under DeMorgan.\n\nYou're picking this up.",
      },
      {
        label:       "This feels abstract. When does it show up in real repairs?",
        adaResponse: "Whenever you're reading a schematic that wasn't laid out the way you'd naturally think about it. Knowing both forms means you can translate.\n\nIt'll click when you need it.",
      }
    ),
  }),

  // ── LESSON 08 · K-Map 2-Var ──────────────────────────────────────────
  msg({
    id:      'u1-08-post',
    trigger: 'lesson:unit1-08',
    type:    'incoming',
    content: "K-maps. Karnaugh maps. Visual truth table, basically.\n\nThe trick is the grouping. Adjacent cells differ by one variable — that's not an accident, it's the whole point. Find the biggest groups of 1s, cover all of them, write the minimal expression.\n\n2-variable K-maps are almost too small to be useful on their own. But get the mechanics here and the 3 and 4 variable versions just... scale.",
    replyOptions: replies(
      {
        label:       "The adjacency is doing the simplification work automatically.",
        adaResponse: "Yes. That's exactly right. The layout encodes which variables can cancel — you're doing Boolean algebra visually without having to track terms.\n\nPeople who learn K-maps first sometimes struggle when they meet the algebra later because they're used to just *seeing* it.",
      },
      {
        label:       "Got it. Group, cover, minimize.",
        adaResponse: "That's the loop. Don't skip covering all the 1s — incomplete coverage means wrong expression.\n\nAnd groups have to be powers of 2. 1, 2, 4, 8. Never 3, never 6.",
      },
      {
        label:       "This feels like a party trick. Does anyone actually use K-maps?",
        adaResponse: "Yes. For circuits up to about 6 variables. Above that you use software minimization — Quine-McCluskey or similar.\n\nBut the intuition you build here transfers. So yes, do it.",
      }
    ),
  }),

  // ── LESSON 09 · K-Map 3-Var ──────────────────────────────────────────
  msg({
    id:      'u1-09-post',
    trigger: 'lesson:unit1-09',
    type:    'incoming',
    content: "Three variables now. The map wraps — left edge is adjacent to right edge, top to bottom. That catches people out.\n\nAlso: don't ignore the don't-cares. If an input combination can never happen in your circuit, that cell is X — and you can call it 1 or 0, whichever gives you a bigger group. Free simplification.\n\nI've seen techs leave X's as 0s by default and end up with expressions twice as complex as they needed to be. Don't do that.",
    replyOptions: replies(
      {
        label:       "Don't-cares as free optimization. That's a nice trick.",
        adaResponse: "It's not a trick, it's part of the design. Those states literally cannot occur in the system — you're not lying to the circuit, you're using the degrees of freedom you actually have.\n\nHad a professor who called them 'gifts from the problem.' That stuck.",
      },
      {
        label:       "Wrapping adjacency is counterintuitive but I see why.",
        adaResponse: "It becomes natural. Think of the map as a torus — not a flat grid. Top wraps to bottom, left to right. Mentally rolling it into a cylinder helps some people.\n\nOr just memorize that edge cells are adjacent. Either works.",
      },
      {
        label:       "Did you have a professor? I can't picture you in a classroom.",
        adaResponse: "I did a year of engineering school before I ended up on this ship.\n\nLong story. Not tonight.",
      }
    ),
  }),

  // ── LESSON 10 · K-Map 4-Var ──────────────────────────────────────────
  msg({
    id:      'u1-10-post',
    trigger: 'lesson:unit1-10',
    type:    'incoming',
    content: "Four variables. The full K-map. Sixteen cells, four-variable adjacency, corner groups wrap in both dimensions simultaneously.\n\nAnd that's actually it for Unit I. Boolean algebra, all the fundamental gates, Boolean laws, SOP/POS, K-map minimization. That's the foundation.\n\nEverything in Unit II is built on this. Adders, multiplexers, decoders — they're all Boolean expressions. You'll recognize them.\n\nYou did good work this unit.",
    replyOptions: replies(
      {
        label:       "Didn't expect to actually enjoy the theory part.",
        adaResponse: "The theory is the part that's yours. Anyone can follow a wiring diagram. Understanding *why* the diagram works — that's what you keep when the manual's gone.\n\nGlad you got something out of it.",
        adaImage: {
          src:     '/ada/photo-milky-way.png',
          caption: 'Had a minute to just… look up. Insane how big it all is.',
          alt:     'A gorgeous, dark, deep-space photo taken through a porthole, showing a massive, swirling section of the Milky Way galaxy',
        },
      },
      {
        label:       "Good. What's Unit II?",
        adaResponse: "Combinational circuits. Half adders, full adders, ripple carry — logic that does actual arithmetic.\n\nIt's where the stuff from Unit I starts doing things you recognize.\n\nRest first.",
      },
      {
        label:       "Glad it's over.",
        adaResponse: "I know. But you're past the most abstract part. It gets more concrete from here.\n\nSame time next shift.",
      }
    ),
  }),

  // ════════════════════════════════════════════════════════════════════════
  // RAPPORT-GATED BONUS MESSAGES
  // ════════════════════════════════════════════════════════════════════════

  // Warm bonus — unlocks when rapport hits warm band (≥ +4) for first time
  msg({
    id:           'rapport-warm-bonus',
    trigger:      'rapport:warm',
    rapportGate:  'warm',
    type:         'incoming',
    content:      "Hey. Can I ask you something?\n\nDo you remember anything from before the accident? Not work stuff. Like — anything. A smell, a place, a sound.\n\nYou don't have to answer. I'm just curious. The short-term gap I get, but the doctors said long-term should be intact and I've never — I've known you for eight months and you've never mentioned anything from before.",
    replyOptions: replies(
      {
        label:       "Sometimes. Fragments. Like a conversation I can't quite hear.",
        adaResponse: "That's something, at least.\n\nI wasn't sure if asking was okay. I figured if you wanted to talk about it you would. But I've been wondering for a while.",
        adaImage: {
          src:     '/ada/photo-ada-face-first.png',
          caption: "I took this in the break room. The lighting's bad but I look alive in it...",
          alt:     'A slightly blurry selfie in a dim ship break room. Warm overhead light catching half a face — brown skin, one visible dark eye, a small smile that looks surprised',
        },
      },
      {
        label:       "Not really. It's mostly just... nothing there.",
        adaResponse: "Okay. That's okay.\n\nSorry for bringing it up if it's weird. You just seem fine most of the time and sometimes I forget that it's actually a significant thing.",
      },
      {
        label:       "Why do you want to know?",
        adaResponse: "I don't know. Curiosity, maybe. Or just — wanting to know the person I'm working with.\n\nNever mind. Forget I asked.",
      }
    ),
  }),

  // Cold bonus — Ada gets a bit more distant if rapport drops
  msg({
    id:           'rapport-cold-note',
    trigger:      'rapport:cold',
    rapportGate:  'cold',
    type:         'incoming',
    content:      "Work order came in for next shift. Bay 9, relay panel. I'll have the details ready.\n\nYou don't have to talk to me outside of briefings if you'd rather not. I can keep it strictly professional.",
    replyOptions: replies(
      {
        label:       "I didn't mean to be short with you. Sorry.",
        adaResponse: "It's fine. The accident, the memory thing — I'd probably be short with people too.\n\nSee you at shift start.",
      },
      {
        label:       "Relay panel. Got it.",
        adaResponse: "Bay 9, 07:00.\n\n.",
      },
      {
        label:       "Professional works for me.",
        adaResponse: "Okay.\n\nSee you at shift.",
      }
    ),
  }),

  // ════════════════════════════════════════════════════════════════════════
  // UNIT I ENDING — FLAG-GATED POST-CHOICE MESSAGES
  // These fire after the player makes the binary choice at unit end.
  // The choice itself is defined in unit1EndChoice below.
  // ════════════════════════════════════════════════════════════════════════

  // ── ALIGNED choice × rapport band ──────────────────────────────────────

  // Aligned + Neutral (baseline tone — collegial, even-keeled)
  msg({
    id:          'u1-end-aligned-neutral',
    trigger:     'flag:unit1_ending:aligned',
    flagGate:    ['unit1_ending', 'aligned'],
    rapportGate: 'neutral',
    type:        'incoming',
    content:     "I saw what you logged in the incident report.\n\nI know that wasn't easy to write. Attributing a fault correctly when it implicates the maintenance schedule — that's the kind of thing people usually leave vague.\n\nFor what it's worth: it's the right call. The ship runs on accurate data. You can't maintain what you're misreporting.",
    replyOptions: replies(
      {
        label:       "Someone had to write it down right.",
        adaResponse: "Yeah. You did.\n\nI'll have the briefing ready early tomorrow. You've earned an easy start to Unit II.",
      },
      {
        label:       "Didn't feel like a choice.",
        adaResponse: "That's probably why you made it.\n\nGet some rest.",
      },
      {
        label:       "Let's just move on.",
        adaResponse: "Okay. Unit II briefing in the morning.\n\n.",
      }
    ),
  }),

  // Aligned + Warm — she's direct about it in a way she usually isn't
  msg({
    id:          'u1-end-aligned-warm',
    trigger:     'flag:unit1_ending:aligned',
    flagGate:    ['unit1_ending', 'aligned'],
    rapportGate: 'warm',
    type:        'incoming',
    content:     "I saw what you logged.\n\nThat took something. For what it's worth — I would've done the same.\n\nI don't say that about a lot of people's calls.",
    replyOptions: replies(
      {
        label:       "It mattered that you'd think that.",
        adaResponse: "Good. I meant it.\n\nI'll have the Unit II briefing ready early. Get some rest first.",
      },
      {
        label:       "Just did what needed doing.",
        adaResponse: "Most people don't, when it costs them something.\n\nSee you at shift.",
      },
      {
        label:       "Let's just move on.",
        adaResponse: "Okay. But I wanted you to hear that first.\n\nUnit II in the morning.",
      }
    ),
  }),

  // Aligned + Cold — technically appreciative, emotionally absent
  msg({
    id:          'u1-end-aligned-cold',
    trigger:     'flag:unit1_ending:aligned',
    flagGate:    ['unit1_ending', 'aligned'],
    rapportGate: 'cold',
    type:        'incoming',
    content:     "Report noted. Maintenance schedule flagged for review.\n\nSee you at shift.",
    replyOptions: replies(
      {
        label:       "Understood.",
        adaResponse: "Unit II briefing posted in the morning.",
      },
      {
        label:       "Fine.",
        adaResponse: "Noted.",
      },
      {
        label:       "Anything else?",
        adaResponse: "No. Shift start, 07:00.",
      }
    ),
  }),

  // ── DEFIANT choice × rapport band ──────────────────────────────────────

  // Defiant + Neutral (baseline tone — measured, asking a real question)
  msg({
    id:          'u1-end-defiant-neutral',
    trigger:     'flag:unit1_ending:defiant',
    flagGate:    ['unit1_ending', 'defiant'],
    rapportGate: 'neutral',
    type:        'incoming',
    content:     "I read the report.\n\nI'm not going to tell you it was the wrong call. I've been on ships where the right report ended a mechanic's career and the wrong one kept the lights on for six more months.\n\nI just — I need to know if it was a practical decision or if you actually believe the system is working correctly. Because those are two very different things and they matter for how I brief you going forward.",
    replyOptions: replies(
      {
        label:       "Practical. I know what was wrong. I just couldn't say it yet.",
        adaResponse: "Okay. That I can work with.\n\nUnit II starts tomorrow. We'll talk more then.",
      },
      {
        label:       "I believe what I wrote.",
        adaResponse: "Alright.\n\nI'll see you at shift.",
      },
      {
        label:       "Does it matter?",
        adaResponse: "It matters to me.\n\nBut okay. Unit II in the morning.",
      }
    ),
  }),

  // Defiant + Warm — she lets it sit, doesn't push, but she clocked it
  msg({
    id:          'u1-end-defiant-warm',
    trigger:     'flag:unit1_ending:defiant',
    flagGate:    ['unit1_ending', 'defiant'],
    rapportGate: 'warm',
    type:        'incoming',
    content:     "I read it.\n\nI'm not going to ask. But I noticed.\n\nThat's all. We're fine. Unit II in the morning.",
    replyOptions: replies(
      {
        label:       "I know you noticed. Thanks for not asking.",
        adaResponse: "Didn't seem like my place to.\n\nGet some rest. We'll start fresh tomorrow.",
      },
      {
        label:       "Maybe I'll explain it sometime.",
        adaResponse: "Whenever you're ready. No pressure on a timeline.\n\nSee you at shift.",
      },
      {
        label:       "There's nothing to notice.",
        adaResponse: "Okay.\n\nUnit II briefing in the morning either way.",
      }
    ),
  }),

  // Defiant + Cold — one word. She's done trying for now.
  msg({
    id:          'u1-end-defiant-cold',
    trigger:     'flag:unit1_ending:defiant',
    flagGate:    ['unit1_ending', 'defiant'],
    rapportGate: 'cold',
    type:        'incoming',
    content:     "Okay.",
    replyOptions: replies(
      {
        label:       "That's it?",
        adaResponse: "That's it.",
      },
      {
        label:       "Fine by me.",
        adaResponse: ".",
      },
      {
        label:       "Unit II?",
        adaResponse: "Morning. 07:00.",
      }
    ),
  }),

]

// ════════════════════════════════════════════════════════════════════════
// UNIT I END CHOICE
// The binary modal that appears after all 10 lessons are complete.
// Not a message — a special modal. Exported separately.
// ════════════════════════════════════════════════════════════════════════

export const UNIT1_END_CHOICE = {
  id:      'unit1-end',
  trigger: 'unit1:end',

  // The framing text — shown above the two choices in the modal
  preamble: "INCIDENT REPORT — WO-0052\n\nDuring the Deck 7 relay inspection, Mechanic [REDACTED] identified a fault pattern inconsistent with normal wear. The pattern suggests the maintenance schedule — last revised 14 months ago — may have allowed degradation beyond tolerance.\n\nA report has been drafted. You have to sign it.",

  contextNote: "This is the only decision that changes the story. Your rapport with Ada only changes how it feels — this changes what happens.",

  choices: [
    {
      id:    'aligned',
      label: 'File accurate report',
      sub:   'Attribute the fault correctly. The maintenance schedule gets flagged for review.',
      color: '#4dffac',
    },
    {
      id:    'defiant',
      label: 'File vague report',
      sub:   'Keep the cause ambiguous. The schedule stays in place. You know what you know.',
      color: '#ff4d5e',
    },
  ],
}
// ════════════════════════════════════════════════════════════════════════
// UNIT II MESSAGES — Combinational Circuits (9 lessons)
// ════════════════════════════════════════════════════════════════════════

export const UNIT2_MESSAGES = [

  msg({
    id: 'u2-01-post', trigger: 'lesson:unit2-01', type: 'incoming',
    content: "Half adder. Two inputs, two outputs — sum and carry. First circuit that actually does arithmetic instead of just deciding.\n\nXOR gives you the sum bit. AND gives you the carry. Two gates you already know, wired to do something new. That's most of engineering, honestly. Recombination, not invention.",
    replyOptions: replies(
      { label: "So adding is just XOR plus AND.", adaResponse: "For one bit, yes. Scales up fast though. Wait till you see what a byte takes." },
      { label: "Noted. What comes after half adders?", adaResponse: "Full adders. They handle the carry-in from the previous bit. Half adders can't — that's the 'half.'" },
      { label: "Feels like a small thing to call a milestone.", adaResponse: "It is small. So was the AND gate. Small things stack." }
    ),
  }),

  msg({
    id: 'u2-02-post', trigger: 'lesson:unit2-02', type: 'incoming',
    content: "XOR again, but slower this time — actually sit with it. HIGH only when inputs disagree. It's the 'are these different' gate.\n\nUseful for parity checking, for comparators, for the sum bit you just learned. It shows up everywhere once you know to look for it. Most of the interesting logic on this ship is XOR wearing a disguise.",
    replyOptions: replies(
      {
        label: "The 'disagreement' framing actually helps.",
        adaResponse: "Good. That's the one thing to keep — everything else falls out of it.\n\nGot a letter from home this cycle. Made me look at the wall again.",
        adaImage: {
          src:     '/ada/photo-wall-pictures.png',
          caption: 'People from home. They still send mail, even this far out.',
          alt:     'A wall in the dorm covered in taped-up polaroids of friends, family, and pets. Faded, slightly torn at the edges',
        },
      },
      { label: "Got it. Moving on.", adaResponse: "Full adder next. It's the half adder's more useful sibling." },
      { label: "Why does this ship need parity checking?", adaResponse: "Memory errors. Comm line noise. You'll see it again in Unit V — hold the question." }
    ),
  }),

  msg({
    id: 'u2-03-post', trigger: 'lesson:unit2-03', type: 'incoming',
    content: "Full adder. Carry-in, two inputs, sum and carry-out. Chain enough of these together and you get a ripple carry adder — actual multi-bit binary addition, the kind this ship's nav computer runs a billion times a second.\n\nFound something while I was pulling reference material for this lesson. Figured you'd get a kick out of it.",
    replyOptions: replies(
      {
        label: "Show me.",
        adaResponse: "Found this jammed behind a panel on Deck 9. Someone's handwriting — predates both of us by a long way.",
        adaImage: { src: '/ada/photo-ripple-carry-schematic.png', caption: "Found this in the panel. Someone's handwriting from 2218. Predates us both.", alt: 'Ripple carry adder schematic on yellowed paper, coffee-stained' },
      },
      { label: "Ripple carry — sounds slow.", adaResponse: "It is, comparatively. Carry has to propagate through every stage. There are faster adders. We'll get there." },
      { label: "Cool. Next lesson?", adaResponse: "Carry propagation delay. The thing that makes ripple carry slow, explained properly." }
    ),
  }),

  msg({
    id: 'u2-04-post', trigger: 'lesson:unit2-04', type: 'incoming',
    content: "Propagation delay. Every gate takes nonzero time to settle. In a ripple carry adder, the carry bit has to walk through every full adder in the chain before the final sum is valid.\n\nWide adder, slow result. That's the tradeoff for the simple wiring. Faster topologies exist — carry-lookahead, carry-select — but they cost more gates. Nothing's free.",
    replyOptions: replies(
      { label: "So speed and simplicity trade off directly.", adaResponse: "Pretty much always. Whole career is just deciding which one you can afford to lose." },
      { label: "How do you actually measure that delay?", adaResponse: "Oscilloscope, mostly. You'll see one in Unit IV. It's not a fun lesson." },
      { label: "Understood. What's next?", adaResponse: "Subtraction. Two's complement — the trick that lets adders subtract without new hardware." }
    ),
  }),

  msg({
    id: 'u2-05-post', trigger: 'lesson:unit2-05', type: 'incoming',
    content: "Two's complement. Invert every bit, add one — that's how you make a negative number a positive number's problem. Subtraction becomes addition of a negated value. Same adder, same gates, no new circuit.\n\nIt's a little bit of a magic trick. The hardware doesn't know it's subtracting. It just adds what you hand it.",
    replyOptions: replies(
      { label: "That's genuinely clever.", adaResponse: "It's the kind of cleverness that saves a chip's worth of silicon. Whoever thought of it first earned their keep." },
      { label: "Wait, so there's no subtractor circuit at all?", adaResponse: "Not a dedicated one, usually. Why build two circuits when one does both jobs." },
      { label: "Got it.", adaResponse: "Decoders next. Different problem — turning a binary code into a single active line." }
    ),
  }),

  msg({
    id: 'u2-06-post', trigger: 'lesson:unit2-06', type: 'incoming',
    content: "Decoder. N inputs, up to 2^N outputs, exactly one output HIGH at a time corresponding to the input pattern. Every memory chip on this ship uses one to pick which address it's looking at.\n\nThink of it as a very precise usher. One door opens. Every other door stays shut, no matter how loud the input is asking.",
    replyOptions: replies(
      { label: "So it's address selection, basically.", adaResponse: "Exactly that. You'll see it again properly in Unit V when we get to memory." },
      { label: "What happens if two outputs go high at once?", adaResponse: "It shouldn't be physically possible if it's wired right. If it happens, something's already broken upstream." },
      { label: "Onward.", adaResponse: "Multiplexer next. The opposite problem — many inputs, one output, you pick which." }
    ),
  }),

  msg({
    id: 'u2-07-post', trigger: 'lesson:unit2-07', type: 'incoming',
    content: "Multiplexer. Several data inputs, a set of select lines, one output. The select lines act like a switch — they choose which input gets routed through.\n\nHaven't cleaned my workstation in a while, if I'm honest. Been meaning to.",
    replyOptions: replies(
      {
        label: "What's it look like over there?",
        adaResponse: "Don't judge me. I'm fixing it. Eventually.",
        adaImage: { src: '/ada/photo-desk-mess.png', caption: "This is my workstation right now. Don't judge me. I'm fixing it.", alt: 'A chaotic desk. Scribbled notes, a half-eaten ration bar, a toolkit, and a laptop with a glowing green terminal screen' },
      },
      { label: "Sounds like good craftsmanship stands out.", adaResponse: "It does. Most of what I work on doesn't look like that. This did." },
      { label: "Noted. Next lesson?", adaResponse: "Demultiplexer. Same idea, reversed — one input routed out to one of several outputs." }
    ),
  }),

  msg({
    id: 'u2-08-post', trigger: 'lesson:unit2-08', type: 'incoming',
    content: "Demultiplexer. One input, select lines, several outputs — the input gets routed to exactly one of them. A MUX in reverse, structurally. You already understand the select-line logic, you're just running it backward.\n\nTwo lessons left in this unit. You've covered more ground than you probably realize.",
    replyOptions: replies(
      { label: "It really did click faster this time.", adaResponse: "That's the half adder paying off. Patterns repeat. You're starting to see them before I name them." },
      { label: "What's left in the unit?", adaResponse: "Just a review and wrap-up. Then a decision that's actually yours to make, not mine." },
      { label: "Good. Keep going.", adaResponse: "Last lesson's next." }
    ),
  }),

  msg({
    id: 'u2-09-post', trigger: 'lesson:unit2-09', type: 'incoming',
    content: "That's Unit II. Half adders to full adders to ripple carry, decoders, multiplexers, demultiplexers. Combinational logic — no memory, no state, just inputs deciding outputs instantaneously.\n\nUnit III breaks that. Circuits that remember something about what happened before. It's a different kind of problem, and it's the one I find most interesting, for reasons I won't get into right now.\n\nGood work this unit.",
    replyOptions: replies(
      { label: "'For reasons I won't get into' — that's ominous.", adaResponse: "Maybe. Or maybe I just like flip-flops. You'll find out which." },
      { label: "Looking forward to Unit III.", adaResponse: "Good. Get some rest. There's something on the board for you before we start, though." },
      { label: "Good work, yourself.", adaResponse: "I just write the briefings. You're the one doing the wiring." }
    ),
  }),

  // ── Rapport bonus messages ──
  msg({
    id: 'u2-warm-bonus', trigger: 'rapport:warm', rapportGate: 'warm', type: 'incoming',
    content: "This is what I was getting at with the DeMorgan thing back in Unit I, by the way — the half adder's sum logic simplifies the same way. I don't know if you clocked that or if I'm just narrating my own notes at you.\n\nEither way. Carry that forward, it'll save you time later.",
    replyOptions: replies(
      { label: "I noticed the pattern, actually.", adaResponse: "Good. I'm building this curriculum a little bit specifically for you at this point, not just running the standard track. Don't tell HR." },
      { label: "Didn't catch it, but I see it now.", adaResponse: "That's fine. That's what the unprompted lecture was for." },
      { label: "Are you always like this with new mechanics?", adaResponse: "No.\n\nI'll leave it there." }
    ),
  }),
  msg({
    id: 'u2-cold-bonus', trigger: 'rapport:cold', rapportGate: 'cold', type: 'incoming',
    content: "Half adder logic confirmed on your last submission. No notes.\n\nNext work order's on the board when you're ready.",
    replyOptions: replies(
      { label: "Got it.", adaResponse: "." },
      { label: "Anything I should know first?", adaResponse: "It's in the briefing. Read it." },
      { label: "Fine.", adaResponse: "Fine." }
    ),
  }),

  // ── Unit II ending — Reyes performance assessment ──
  // Neutral
  msg({
    id: 'u2-end-confirmed-neutral', trigger: 'flag:unit2_ending:confirmed', flagGate: ['unit2_ending', 'confirmed'], rapportGate: 'neutral', type: 'incoming',
    content: "Reyes's assessment is logged. You confirmed her version.\n\nNo position on it from me either way — wasn't my call to make, and it's reasonable to let her assessment stand as written.",
    replyOptions: replies(
      { label: "She's the one running performance review, not me.", adaResponse: "Fair point. Unit III briefing's coming next shift." },
      { label: "It wasn't worth the fight.", adaResponse: "Sometimes it isn't. Get some rest." },
      { label: "Moving on.", adaResponse: "Unit III, next shift." }
    ),
  }),
  msg({
    id: 'u2-end-amended-neutral', trigger: 'flag:unit2_ending:amended', flagGate: ['unit2_ending', 'amended'], rapportGate: 'neutral', type: 'incoming',
    content: "Saw the amendment to Reyes's assessment. You flagged the junction fault and the duplicate work order she missed.\n\nShe won't love it. It's accurate, though, and accuracy is the job.",
    replyOptions: replies(
      { label: "She'll get over it.", adaResponse: "Probably. Or she won't. Either way the record's correct now." },
      { label: "Was that the wrong call?", adaResponse: "No. It just isn't a free one. Worth knowing the difference." },
      { label: "Onward.", adaResponse: "Unit III, next shift." }
    ),
  }),
  // Warm
  msg({
    id: 'u2-end-confirmed-warm', trigger: 'flag:unit2_ending:confirmed', flagGate: ['unit2_ending', 'confirmed'], rapportGate: 'warm', type: 'incoming',
    content: "I saw the assessment. You confirmed it.",
    replyOptions: replies(
      { label: "It was Reyes's call to make, not mine.", adaResponse: "That's fine. That's your call.\n\nI'm not second-guessing it — just recalibrating what I thought you'd do." },
      { label: "Should I have flagged something?", adaResponse: "I don't know. I'm not going to tell you what I would've done. That's not fair to either of us." },
      { label: "Does it matter to you?", adaResponse: "A little. Not enough to make it your problem. Unit III's next." }
    ),
  }),
  msg({
    id: 'u2-end-amended-warm', trigger: 'flag:unit2_ending:amended', flagGate: ['unit2_ending', 'amended'], rapportGate: 'warm', type: 'incoming',
    content: "You flagged the junction fault. Reyes didn't love it.\n\nYou were right, though. I should tell you that.",
    replyOptions: replies(
      { label: "I just wrote what I found.", adaResponse: "That's all it ever should be. Doesn't always happen that way, though. Glad it did this time." },
      { label: "Will it cause problems for me?", adaResponse: "Maybe small ones. Nothing I won't help you through." },
      { label: "Thanks for saying so.", adaResponse: "Didn't have to be said. Wanted to anyway." }
    ),
  }),
  // Cold
  msg({
    id: 'u2-end-confirmed-cold', trigger: 'flag:unit2_ending:confirmed', flagGate: ['unit2_ending', 'confirmed'], rapportGate: 'cold', type: 'incoming',
    content: "Unit III briefing posted. Bay schedule attached.",
    replyOptions: replies(
      { label: "Got it.", adaResponse: "." },
      { label: "No comment on the assessment?", adaResponse: "Wasn't asked for one." },
      { label: "Fine.", adaResponse: "Shift start, 07:00." }
    ),
  }),
  msg({
    id: 'u2-end-amended-cold', trigger: 'flag:unit2_ending:amended', flagGate: ['unit2_ending', 'amended'], rapportGate: 'cold', type: 'incoming',
    content: "Reyes mentioned the amendment. I don't have a position on it.\n\nUnit III briefing's posted.",
    replyOptions: replies(
      { label: "Understood.", adaResponse: "07:00." },
      { label: "You sure you don't?", adaResponse: "I'm sure." },
      { label: "Fine by me.", adaResponse: "." }
    ),
  }),

]

export const UNIT2_END_CHOICE = {
  id: 'unit2-end', trigger: 'unit2:end',
  preamble: "PERFORMANCE ASSESSMENT — REYES, T.\n\nReyes filed an assessment of your work this unit: reliable, procedural, no flags raised. You know of at least two issues she missed — a junction fault on Bay 9, and a duplicate work order from Deck 9 that never got reconciled.\n\nYou can confirm her version as filed, or amend it with what you found.",
  contextNote: "This changes what's on your permanent record, and how Reyes sees you going forward. Rapport only changes how Ada reacts.",
  choices: [
    { id: 'confirmed', label: 'Confirm her version', sub: "Let the assessment stand. Reliable, procedural, no issues raised.", color: '#4dffac' },
    { id: 'amended', label: 'Amend the assessment', sub: 'Flag the junction fault and the duplicate work order she missed.', color: '#ff4d5e' },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// UNIT III MESSAGES — Sequential Logic (9 lessons)
// ════════════════════════════════════════════════════════════════════════

export const UNIT3_MESSAGES = [

  msg({
    id: 'u3-01-post', trigger: 'lesson:unit3-01', type: 'incoming',
    content: "SR latch. First circuit in this unit that actually remembers something. Set it HIGH, it stays HIGH, even after the input that set it goes away. That's new. Everything before this forgot the instant the input changed.\n\nThere's one wired into the Deck 7 airlock panel — cross-coupled NOR gates, holding state on whether the outer door's been cycled. I'll send you a look at it.",
    replyOptions: replies(
      {
        label: "Send it.",
        adaResponse: "This is what memory looks like before anyone calls it memory. Just two gates, feeding back into each other.",
        adaImage: { src: '/ada/photo-airlock-nor-latch.png', caption: 'This is what memory looks like when it\'s hardware.', alt: 'Airlock panel with cross-coupled NOR latch visible inside' },
      },
      { label: "So state is just feedback.", adaResponse: "Mostly, yes. The output feeds back into the input. That loop is the memory." },
      { label: "Why does the airlock need to remember anything?", adaResponse: "Has to know if the outer door cycled even if nobody's watching when it happens. Otherwise it can't enforce the safety interlock." }
    ),
  }),

  msg({
    id: 'u3-02-post', trigger: 'lesson:unit3-02', type: 'incoming',
    content: "D latch. Cleans up the SR latch's bad case — the one where both inputs go HIGH and the output's undefined. D latch takes a single data line and a control line instead. Whatever's on D gets stored when the control line says to, and held otherwise.\n\nMore predictable. Less elegant, in a way. Most engineering ends up trading elegance for predictability eventually.",
    replyOptions: replies(
      { label: "Predictable's usually better, though.", adaResponse: "On a ship, always. Elegant and undefined gets people killed." },
      { label: "What was the SR latch's bad case again?", adaResponse: "Both inputs HIGH at once. Output goes to a state the circuit can't actually guarantee. D latch closes that door." },
      { label: "Got it.", adaResponse: "D flip-flop next. Related, but it only updates on a clock edge instead of a level." }
    ),
  }),

  msg({
    id: 'u3-03-post', trigger: 'lesson:unit3-03', type: 'incoming',
    content: "D flip-flop. Same idea as the latch, but it only samples the input on a clock edge — the instant a clock signal transitions, not the whole time it's HIGH. That's the difference between a latch and a flip-flop, if you want the precise version.\n\nA latch holds state until something changes it. Doesn't know why it's holding — just does.",
    replyOptions: replies(
      { label: "That line sounds like it means something else too.", adaResponse: "Does it.\n\nDo you dream?\n\nSorry — that came out of nowhere. You don't have to answer that.", adaImage: null },
      { label: "Edge-triggered. Got it.", adaResponse: "Good. Registers next — chains of these, holding a whole word at once instead of one bit." },
      { label: "Why's that distinction important?", adaResponse: "Timing. If everything updates on the same edge, you can reason about the whole circuit at once instead of chasing race conditions. You'll see why that matters in Unit IV." }
    ),
  }),

  msg({
    id: 'u3-04-post', trigger: 'lesson:unit3-04', type: 'incoming',
    content: "JK flip-flop. Fixes the SR latch's undefined case properly, this time at the flip-flop level — both inputs HIGH means toggle, not undefined. More inputs to track, fewer bad states to worry about.\n\nThere's always a version of this tradeoff. More to learn up front, less to debug later.",
    replyOptions: replies(
      { label: "I'll take more upfront work over a bad surprise.", adaResponse: "Correct instinct. Most experienced engineers end up there eventually." },
      { label: "Remind me what 'toggle' means here?", adaResponse: "Output flips to whatever it wasn't. HIGH becomes LOW, LOW becomes HIGH. Useful for counters, which is where we're headed." },
      { label: "Onward.", adaResponse: "T flip-flop next. Simpler cousin — does nothing but toggle." }
    ),
  }),

  msg({
    id: 'u3-05-post', trigger: 'lesson:unit3-05', type: 'incoming',
    content: "T flip-flop. One input. HIGH, it toggles on the clock edge. LOW, it holds. That's the whole circuit. You could build it from a JK flip-flop with both inputs tied together, which is sort of how it was discovered in the first place — somebody noticed the pattern and gave it a name.\n\nGood building block for counters. We'll get there in a couple lessons.",
    replyOptions: replies(
      { label: "Feels like the whole field is renaming patterns.", adaResponse: "It mostly is. Naming a pattern is most of what theory is. The hardware was always doing it; we just hadn't pointed at it yet." },
      { label: "Got it.", adaResponse: "Registers next — multiple flip-flops, one per bit, holding a full word." },
      { label: "What's a register, then?", adaResponse: "Multiple flip-flops side by side, one per bit. A register holds a whole value at once instead of one bit." }
    ),
  }),

  msg({
    id: 'u3-06-post', trigger: 'lesson:unit3-06', type: 'incoming',
    content: "Register. A bank of flip-flops, one per bit, all clocked together. The basic unit of working memory on this ship — and most others. Hold a value, update it on command, otherwise leave it alone.\n\nOff duty I've been trying to learn something a lot less cooperative than a register, for what it's worth.",
    replyOptions: replies(
      {
        label: "What's that?",
        adaResponse: "My off-duty sound. Been trying to learn this chord for a week. It holds a value about as well as I do right now.",
        adaImage: { src: '/ada/photo-red-dorm-guitar.png', caption: "My off-duty sound. Been trying to learn this chord for a week.", alt: "A close-up of an acoustic guitar leaning against a shelf, a sheet of chords taped to the wall above it, warm amber string lights glowing in the background" },
      },
      { label: "Counters are next, then?", adaResponse: "Right after this. Chained T flip-flops, basically — each one toggling off the one before it." },
      { label: "Hope it's going well.", adaResponse: "It's not. But thanks." }
    ),
  }),

  msg({
    id: 'u3-07-post', trigger: 'lesson:unit3-07', type: 'incoming',
    content: "Synchronous counter. All flip-flops clocked off the same signal, simultaneously, instead of rippling one to the next. Faster, more predictable — costs you a bit more wiring complexity to make sure every stage agrees on when to update.\n\nSame tradeoff as always, different unit. You'll see it again. It's the only tradeoff there is, really, dressed up differently each time.",
    replyOptions: replies(
      { label: "Speed versus simplicity, again.", adaResponse: "Every single time. I should put it on a poster." },
      { label: "Why not always go synchronous, then?", adaResponse: "Wiring cost, mostly. And bigger circuits need careful clock distribution or you get skew. Nothing's free, remember?" },
      { label: "Got it, moving on.", adaResponse: "State machines next. Where this whole unit's been heading." }
    ),
  }),

  msg({
    id: 'u3-08-post', trigger: 'lesson:unit3-08', type: 'incoming',
    content: "State machine. A circuit with memory and a map — current state, an input, and a rule for what state comes next. Door interlocks, traffic sequencing, half the automated systems on this ship are state machines with extra wiring.\n\nThe interesting thing isn't the states. It's the transitions. What it takes to move from one to the next, and what it takes to get stuck.",
    replyOptions: replies(
      { label: "That's a strangely personal way to describe a circuit.", adaResponse: "Maybe. Or maybe everything starts sounding personal if you stare at it long enough on a quiet shift." },
      { label: "What happens if a transition's undefined?", adaResponse: "Depends on the design. Sometimes it holds. Sometimes it locks up entirely. Best design accounts for every input in every state. Most don't." },
      { label: "Okay. Last lesson?", adaResponse: "Last lesson. Then a decision that's been waiting on you, not me." }
    ),
  }),

  msg({
    id: 'u3-09-post', trigger: 'lesson:unit3-09', type: 'incoming',
    content: "That's sequential logic. Latches to flip-flops to registers to counters to state machines — every circuit in this unit remembers something about what came before it. Unit II didn't. That's the whole difference.\n\nUnit IV is hazards. Race conditions, timing glitches, what happens when two signals that should agree on order don't. It's a shorter unit. It's also the one that goes wrong fastest if you're not paying attention.",
    replyOptions: replies(
      { label: "Sounds like you're bracing for something.", adaResponse: "Maybe. Get some rest first. We'll start when you're ready." },
      { label: "Good unit. Thanks for the detours.", adaResponse: "They weren't detours. They were the actual lesson, mostly. The gates were just the excuse." },
      { label: "Onward to Unit IV, then.", adaResponse: "Onward." }
    ),
  }),

  // ── Rapport bonus messages ──
  msg({
    id: 'u3-warm-bonus', trigger: 'rapport:warm', rapportGate: 'warm', type: 'incoming',
    content: "Your bunk's probably the same layout as mine, two decks over. Mine's got one thing that's actually mine in it — everything else came with the room.\n\nI don't know why I'm telling you that. Long shift. Ignore me if you want.",
    replyOptions: replies(
      { label: "I don't want to ignore it. What's the one thing?", adaResponse: "A book. Real paper, not a tablet. Doesn't matter which one.\n\nMaybe I'll show you sometime." },
      { label: "Everyone needs one thing that's theirs.", adaResponse: "Yeah. Apparently I do too, even out here." },
      { label: "Long shift, noted. Get some rest.", adaResponse: "You too. Talk tomorrow." }
    ),
  }),
  msg({
    id: 'u3-cold-bonus', trigger: 'rapport:cold', rapportGate: 'cold', type: 'incoming',
    content: "Deck 7 corridor's clear for the next shift. Lighting's been flickering near junction 4 — logged it, not urgent.\n\nThat's the update.",
    replyOptions: replies(
      { label: "Got it.", adaResponse: "." },
      { label: "Anything urgent at all this week?", adaResponse: "No. You'd know if there were." },
      { label: "Noted.", adaResponse: "Noted." }
    ),
  }),

  // ── Unit III ending — the anomaly in the personnel file ──
  // Neutral
  msg({
    id: 'u3-end-tell-neutral', trigger: 'flag:unit3_ending:tell', flagGate: ['unit3_ending', 'tell'], rapportGate: 'neutral', type: 'incoming',
    content: "Okay. Here's what I found.\n\nThere's a date discrepancy in your service record — six months before your accident don't line up with the posted assignment logs. I found it by accident, pulling something unrelated. I don't know what it means. I thought you should have the information.",
    replyOptions: replies(
      { label: "Six months. What was I doing?", adaResponse: "I don't know. The logs that should say are the ones that don't match. That's as far as I got." },
      { label: "Thank you for telling me.", adaResponse: "Didn't feel right sitting on it. You can do what you want with it." },
      { label: "I need to think about this.", adaResponse: "Take the time. It'll still be true tomorrow." }
    ),
  }),
  msg({
    id: 'u3-end-wait-neutral', trigger: 'flag:unit3_ending:wait', flagGate: ['unit3_ending', 'wait'], rapportGate: 'neutral', type: 'incoming',
    content: "Alright. I'll hold onto it.\n\nIt'll be there when you're ready, if you're ever ready. No pressure either way.",
    replyOptions: replies(
      { label: "Thanks for respecting that.", adaResponse: "It's your record. Your call when to look at it." },
      { label: "Might be a while.", adaResponse: "That's fine. I'm not going anywhere." },
      { label: "Unit IV next?", adaResponse: "Unit IV next." }
    ),
  }),
  // Warm
  msg({
    id: 'u3-end-tell-warm', trigger: 'flag:unit3_ending:tell', flagGate: ['unit3_ending', 'tell'], rapportGate: 'warm', type: 'incoming',
    content: "I found something in your file. A date discrepancy — the six months before your accident don't match the posted assignment logs. I found it by accident, pulling something unrelated. I've been sitting on it for a bit, honestly, trying to decide if telling you was mine to do.\n\nIt's yours now. I don't know what it means yet. But you should have it.",
    replyOptions: replies(
      { label: "Thank you for not sitting on it any longer.", adaResponse: "I almost didn't tell you. Figured you'd rather know than not, in the end." },
      { label: "Do you think it means something bad?", adaResponse: "I don't know. I'm not going to guess at something this size. I just didn't want to keep it from you." },
      { label: "I need a minute with this.", adaResponse: "Take it. I'm here whenever you want to talk about it. Or not." }
    ),
  }),
  msg({
    id: 'u3-end-wait-warm', trigger: 'flag:unit3_ending:wait', flagGate: ['unit3_ending', 'wait'], rapportGate: 'warm', type: 'incoming',
    content: "Okay.",
    replyOptions: replies(
      { label: "Just okay?", adaResponse: "I'll be here when you're ready." },
      { label: "Thank you.", adaResponse: "I'll be here when you're ready." },
      { label: "I might never be ready.", adaResponse: "I'll be here when you're ready.\n\nThat doesn't expire." }
    ),
  }),
  // Cold
  msg({
    id: 'u3-end-tell-cold', trigger: 'flag:unit3_ending:tell', flagGate: ['unit3_ending', 'tell'], rapportGate: 'cold', type: 'incoming',
    content: "Found a date discrepancy in your service record. Six months before the accident don't match the posted logs.\n\nThat's the finding. No interpretation attached.",
    replyOptions: replies(
      { label: "That's all you've got?", adaResponse: "That's all I've got." },
      { label: "Understood.", adaResponse: "Unit IV briefing's next." },
      { label: "Thanks, I guess.", adaResponse: "It's logged either way." }
    ),
  }),
  msg({
    id: 'u3-end-wait-cold', trigger: 'flag:unit3_ending:wait', flagGate: ['unit3_ending', 'wait'], rapportGate: 'cold', type: 'incoming',
    content: "Alright. I won't bring it up again.",
    replyOptions: replies(
      { label: "Good.", adaResponse: "Unit IV's next." },
      { label: "Understood.", adaResponse: "." },
      { label: "Fine.", adaResponse: "Fine." }
    ),
  }),

]

export const UNIT3_END_CHOICE = {
  id: 'unit3-end', trigger: 'unit3:end',
  preamble: "Ada's been quiet for a moment longer than usual.\n\n\"I found something in your personnel file. An anomaly — I wasn't looking for it, I was pulling something unrelated. I can tell you what it is, or I can wait until you're ready to ask. Your call.\"",
  contextNote: "This changes what Ada tells you now versus later — and what she carries on her own for a while longer.",
  choices: [
    { id: 'tell', label: '"Tell me."', sub: "She tells you what she found, now.", color: '#4dffac' },
    { id: 'wait', label: '"Wait."', sub: "She holds onto it until you're ready.", color: '#ff4d5e' },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// UNIT IV MESSAGES — Hazards & Timing (6 lessons)
// ════════════════════════════════════════════════════════════════════════

export const UNIT4_MESSAGES = [

  msg({
    id: 'u4-01-post', trigger: 'lesson:unit4-01', type: 'incoming',
    content: "Race condition. Two signals that should arrive in a defined order, don't. The circuit downstream assumes an order anyway, and whatever it assumes wrong, breaks.\n\nIt's not a design flaw exactly. It's a timing flaw. The logic was correct. The clock just didn't agree with it.",
    replyOptions: replies(
      { label: "So the gates are fine, the timing isn't.", adaResponse: "Right. That's what makes these hard to catch. Nothing's wired wrong. Everything's just slightly too fast, or slightly too slow." },
      { label: "Sounds hard to test for.", adaResponse: "It is. You can run a circuit a thousand times clean and have it fail on the thousand-and-first, for no reason you can see in the schematic." },
      { label: "Got it. What's next?", adaResponse: "How to actually catch one of these happening. Not fun, but necessary." }
    ),
  }),

  msg({
    id: 'u4-02-post', trigger: 'lesson:unit4-02', type: 'incoming',
    content: "Caught one logging Bay 9 last week, actually. One nanosecond. That's the margin between the circuit working and not. You don't see a race condition happen — you see the readout after the fact and work backward.",
    replyOptions: replies(
      {
        label: "Show me what it looked like.",
        adaResponse: "One nanosecond. That's the margin. Caught it logging.",
        adaImage: { src: '/ada/photo-oscilloscope-glitch.png', caption: "One nanosecond. That's the margin. Caught it logging.", alt: 'Oscilloscope readout showing a race condition glitch' },
      },
      { label: "How do you even catch something that fast?", adaResponse: "Logging hardware running faster than the circuit you're watching. You're not catching the glitch in real time — you're catching its shadow." },
      { label: "Did it cause a real problem?", adaResponse: "Not that time. Caught it before it propagated anywhere that mattered. Not every shift goes that way." }
    ),
  }),

  msg({
    id: 'u4-03-post', trigger: 'lesson:unit4-03', type: 'incoming',
    content: "Hazards split into two kinds. Static — output glitches when it shouldn't change at all. Dynamic — output glitches multiple times on the way to a single real change. Both come from the same root cause: different signal paths through the circuit taking different amounts of time to settle.\n\nFixing either one usually means adding redundant logic that does nothing functionally except smooth the timing out.",
    replyOptions: replies(
      { label: "So you add a gate that doesn't 'do' anything.", adaResponse: "Correct. It does something — it just isn't visible in the truth table. The truth table doesn't know about time. The circuit does." },
      { label: "Static or dynamic, which is worse?", adaResponse: "Depends what's downstream. A static glitch on a control line that shouldn't move at all can be the worse one, honestly." },
      { label: "Noted.", adaResponse: "Next lesson's the one where I'd rather not be specific about why it's here." }
    ),
  }),

  msg({
    id: 'u4-04-post', trigger: 'lesson:unit4-04', type: 'incoming',
    content: "Shift covered. No incidents.\n\nThat's the log entry, anyway. Lesson's about hazard documentation — what gets recorded when something happens off the books and the official answer is that nothing did.",
    replyOptions: replies(
      {
        label: "What does an entry like that actually look like?",
        adaResponse: "Here's one of mine.",
        adaImage: { src: '/ada/photo-maint-log-entry.png', caption: 'Shift covered. No incidents. — A.', alt: 'A maintenance log entry, handwritten. One line: Shift covered. No incidents. — A.' },
        rapportGate: 'cold',
      },
      { label: "You sound like you're talking about something specific.", adaResponse: "Maybe. Let's just get through the lesson." },
      { label: "Understood. Next?", adaResponse: "Hazard elimination. The actual fix, not just the diagnosis." }
    ),
  }),

  msg({
    id: 'u4-05-post', trigger: 'lesson:unit4-05', type: 'incoming',
    content: "Elimination technique: redundant terms, consensus logic, careful K-map grouping to make sure every transition has a covering term the whole way through. Same Boolean algebra from Unit I, pointed at a timing problem instead of a logic one.\n\nSpent four hours on a board this week doing exactly this. Looked worse before I started than after, somehow, even though it's smaller now.",
    replyOptions: replies(
      {
        label: "Show me the after.",
        adaResponse: "After. Took four hours. Looked worse before.",
        adaImage: { src: '/ada/photo-repaired-hazard-board.png', caption: 'After. Took four hours. Looked worse before.', alt: 'Repaired hazard-elimination circuit board, clean and neat' },
      },
      { label: "Four hours for one board?", adaResponse: "Some of that was finding the problem. The fix itself took twenty minutes. That's usually how it goes." },
      { label: "Worth it?", adaResponse: "It runs clean now. So, yes." }
    ),
  }),

  msg({
    id: 'u4-06-post', trigger: 'lesson:unit4-06', type: 'incoming',
    content: "That's Unit IV. Shortest unit, hardest one to actually internalize — everything before this was about what a circuit does. This was about when it does it, and what happens in the gap.\n\nUnit V is memory. Long-term storage, error correction. It's the last unit. There's something I need to be straight with you about before it's done, but it's going to have to wait until then.",
    replyOptions: replies(
      { label: "Why wait?", adaResponse: "Because I haven't finished pulling the pieces together, and I'm not going to hand you half a thing and call it honesty." },
      { label: "Okay. I trust the timing.", adaResponse: "Thank you for that. I mean it." },
      { label: "Unit V, then.", adaResponse: "Unit V." }
    ),
  }),

  // ── Rapport bonus messages ──
  msg({
    id: 'u4-warm-bonus', trigger: 'rapport:warm', rapportGate: 'warm', type: 'incoming',
    content: "I'm fine. I just need the work right now. Let's do the work.\n\nThat's not me shutting you out, for what it's worth — it's the opposite, actually. You're the easiest part of this rotation. I'd rather not put anything else on you yet.",
    replyOptions: replies(
      { label: "I'm here if that changes.", adaResponse: "I know. That's most of why it's bearable." },
      { label: "Take whatever time you need.", adaResponse: "I will. Thank you." },
      { label: "Okay. Work it is.", adaResponse: "Good. Next lesson's on the board." }
    ),
  }),
  msg({
    id: 'u4-cold-bonus', trigger: 'rapport:cold', rapportGate: 'cold', type: 'incoming',
    content: "Next briefing's posted. Bay 9, same as last time.\n\nThat's all.",
    replyOptions: replies(
      { label: "Got it.", adaResponse: "." },
      { label: "Fine.", adaResponse: "Fine." },
      { label: "Anything else?", adaResponse: "No." }
    ),
  }),

  // ── Unit IV ending — the incident supplemental ──
  // Neutral
  msg({
    id: 'u4-end-protect-neutral', trigger: 'flag:unit4_ending:protect', flagGate: ['unit4_ending', 'protect'], rapportGate: 'neutral', type: 'incoming',
    content: "I read the supplemental. You attributed it to a design flaw in the hazard mitigation — Engineering's problem, not a person's.\n\nThat's one read of what happened. I'm not going to tell you it's wrong.",
    replyOptions: replies(
      { label: "It's what the timing data supported.", adaResponse: "It's a defensible read. I'll leave it there." },
      { label: "Was there a better answer?", adaResponse: "I don't know. Maybe there isn't a clean one." },
      { label: "Unit V next.", adaResponse: "Unit V, next shift." }
    ),
  }),
  msg({
    id: 'u4-end-accurate-neutral', trigger: 'flag:unit4_ending:accurate', flagGate: ['unit4_ending', 'accurate'], rapportGate: 'neutral', type: 'incoming',
    content: "I read it. You filed it as operator error.\n\nI know whose shift that was. I'm not going to comment further than that.",
    replyOptions: replies(
      { label: "I filed what the data showed.", adaResponse: "Understood." },
      { label: "Was that the wrong call?", adaResponse: "I'm not in a position to answer that fairly. Let's move on." },
      { label: "Unit V next.", adaResponse: "Unit V, next shift." }
    ),
  }),
  // Warm
  msg({
    id: 'u4-end-protect-warm', trigger: 'flag:unit4_ending:protect', flagGate: ['unit4_ending', 'protect'], rapportGate: 'warm', type: 'incoming',
    content: "I read the supplemental.\n\nYou didn't have to do that.\n\nThat's all she says. It's everything.",
    replyOptions: replies(
      { label: "I wasn't going to write it any other way.", adaResponse: "I know. That's the part that matters." },
      { label: "You don't have to explain.", adaResponse: "I wasn't going to. Just wanted you to know I saw it." },
      { label: "Unit V next.", adaResponse: "Unit V. Soon." }
    ),
  }),
  msg({
    id: 'u4-end-accurate-warm', trigger: 'flag:unit4_ending:accurate', flagGate: ['unit4_ending', 'accurate'], rapportGate: 'warm', type: 'incoming',
    content: "I read it.\n\nI know.\n\nThank you for being honest.\n\nIt still hurts. I'm saying that anyway.",
    replyOptions: replies(
      { label: "I'm sorry it does.", adaResponse: "Don't be. I'd rather it be true and hurt than false and easy." },
      { label: "I wasn't trying to make it easier for myself.", adaResponse: "I know that too. That's most of why it landed the way it did." },
      { label: "Unit V next.", adaResponse: "Unit V. When you're ready." }
    ),
  }),
  // Cold
  msg({
    id: 'u4-end-protect-cold', trigger: 'flag:unit4_ending:protect', flagGate: ['unit4_ending', 'protect'], rapportGate: 'cold', type: 'incoming',
    content: "Noted. The engineering review is scheduled.",
    replyOptions: replies(
      { label: "Understood.", adaResponse: "Unit V's next." },
      { label: "That's it?", adaResponse: "That's it." },
      { label: "Fine.", adaResponse: "." }
    ),
  }),
  msg({
    id: 'u4-end-accurate-cold', trigger: 'flag:unit4_ending:accurate', flagGate: ['unit4_ending', 'accurate'], rapportGate: 'cold', type: 'incoming',
    content: "See you at shift.",
    replyOptions: replies(
      { label: "That's all you have to say?", adaResponse: "See you at shift." },
      { label: "Understood.", adaResponse: "07:00." },
      { label: "Fine.", adaResponse: "." }
    ),
  }),

]

export const UNIT4_END_CHOICE = {
  id: 'unit4-end', trigger: 'unit4:end',
  preamble: "SUPPLEMENTAL — INCIDENT REPORT, OFF-SHIFT EVENT\n\nThe cause is ambiguous. It could be filed as a design flaw in the hazard mitigation circuit — implicating Engineering. Or as operator error — implicating the mechanic on duty that shift. That mechanic was Ada.\n\nYou're filing the supplemental. What do you write?",
  contextNote: "This is the sharpest choice yet — it directly implicates Ada, not an abstract schedule.",
  choices: [
    { id: 'protect', label: 'Design flaw (protect Ada)', sub: 'Attribute it to the hazard mitigation circuit itself.', color: '#4dffac' },
    { id: 'accurate', label: 'Operator error (accurate)', sub: 'File it as it actually happened, on her shift.', color: '#ff4d5e' },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// UNIT V MESSAGES — Memory & Error Correction (7 lessons)
// ════════════════════════════════════════════════════════════════════════

export const UNIT5_MESSAGES = [

  msg({
    id: 'u5-01-post', trigger: 'lesson:unit5-01', type: 'incoming',
    content: "SRAM. Static random-access memory — each cell built from a latch, holding one bit for as long as it has power. Fast. Expensive per bit, compared to the alternative. Most cache memory on this ship is SRAM for exactly that tradeoff.\n\nHad an actual quiet stretch this week, for once. Watched the planet turn for an hour instead of thinking about any of this.",
    replyOptions: replies(
      {
        label: "Show me.",
        adaResponse: "Watched the planet rotate for an hour today. No alarms. Quiet.",
        adaImage: { src: '/ada/photo-view-outside.png', caption: 'Watched the planet rotate for an hour today. No alarms. Quiet.', alt: 'A view out a large starship porthole. A distant blue-green planet slowly turning in the black void of space' },
      },
      { label: "Why's SRAM expensive per bit?", adaResponse: "More transistors per cell than the alternative. You're trading silicon area for speed. Standard tradeoff, dressed in a new circuit." },
      { label: "Got it. Next?", adaResponse: "DRAM. Cheaper, denser, needs to be refreshed constantly or it forgets. Different set of compromises." }
    ),
  }),

  msg({
    id: 'u5-02-post', trigger: 'lesson:unit5-02', type: 'incoming',
    content: "DRAM. Each bit stored as a charge on a tiny capacitor instead of a latch. Cheaper, denser — you can pack a lot more bits into the same space. The catch is the charge leaks. Has to be refreshed thousands of times a second or the data just... fades.\n\nIt's memory that has to keep proving it remembers, or it stops. There's probably a metaphor in there. I'm not going to make it.",
    replyOptions: replies(
      { label: "You basically just made it.", adaResponse: "Maybe. Doesn't mean I have to say it out loud." },
      { label: "What happens if the refresh fails?", adaResponse: "Data corruption, or just loss. Depends on the cell and how long it went unrefreshed." },
      { label: "Onward.", adaResponse: "ROM next. Memory that doesn't forget, because it was never designed to change at all." }
    ),
  }),

  msg({
    id: 'u5-03-post', trigger: 'lesson:unit5-03', type: 'incoming',
    content: "ROM. Read-only memory. Written once — sometimes at the factory, sometimes by you, with the right hardware — and unchangeable after that, by design. Boot sequences live here. Things that need to survive a power cycle and need to be unable to drift, ever.\n\nSome things shouldn't be editable after the fact. That's the whole philosophy of the circuit.",
    replyOptions: replies(
      { label: "Sounds like a useful property for some data.", adaResponse: "It is. Auditability mostly comes from things that can't quietly change underneath you." },
      { label: "So nothing's truly 'read-only' forever, though?", adaResponse: "Mostly true. There are ways to force a rewrite. Mostly destructive ones. Most ROM isn't meant to survive that." },
      { label: "Got it. What's next?", adaResponse: "EPROM. ROM's stranger cousin — erasable, but not the normal way." }
    ),
  }),

  msg({
    id: 'u5-04-post', trigger: 'lesson:unit5-04', type: 'incoming',
    content: "EPROM. Erasable, programmable ROM — you can wipe it and write it again, but not electrically. You expose the die to UV light through a little window on the package, and that resets every cell back to its blank state. Then you reprogram from scratch.\n\nMakes me think of my own habit of trying to keep things from just fading, honestly. I've been keeping a journal, of all things.",
    replyOptions: replies(
      {
        label: "Yeah? What's that like?",
        adaResponse: "Trying to write down the things I learn. It helps me remember.",
        adaImage: { src: '/ada/photo-journal-open.png', caption: 'Trying to write down the things I learn. It helps me remember.', alt: 'A leather-bound journal lying open on a desk. Handwritten notes, diagrams, and a pressed flower tucked between the pages' },
      },
      { label: "Why not just make it electrically erasable?", adaResponse: "That exists too — EEPROM. Different generation of the same idea. EPROM's older, cruder, still kicking around on some legacy boards here." },
      { label: "Strange procedure, got it.", adaResponse: "PLD next. Programmable logic, not just programmable memory." }
    ),
  }),

  msg({
    id: 'u5-05-post', trigger: 'lesson:unit5-05', type: 'incoming',
    content: "PLD — programmable logic device. Instead of wiring discrete gates by hand, you configure a chip's internal connections to implement whatever Boolean function you need. Same logic from Unit I, just reconfigurable instead of soldered.\n\nIt's everything we've covered, compressed into something you can rewrite without a soldering iron. Most of this ship's control logic has moved to chips like this over the years.",
    replyOptions: replies(
      { label: "So it's all the same gates underneath.", adaResponse: "Always. The whole curriculum's been building toward that point, honestly — different packaging, same Boolean truth." },
      { label: "What can't a PLD replace?", adaResponse: "Raw speed-critical paths, mostly, and very high-volume fixed designs where a hardwired chip is cheaper. Otherwise, almost everything." },
      { label: "Okay. Next lesson?", adaResponse: "Error correction. The one I actually want to talk to you about properly." }
    ),
  }),

  msg({
    id: 'u5-06-post', trigger: 'lesson:unit5-06', type: 'incoming',
    content: "Error correction starts here. Memory fails — bit flips from radiation, noise, age. Detecting an error is one problem. Correcting it without a second copy of the data is a harder one. That's what this lesson and the next are actually about.\n\nAlso — we finished the escape pod authorization matrix today. Filed the sign-off. I put both our names on it.",
    replyOptions: replies(
      {
        label: "You didn't have to do that.",
        adaResponse: "I know. I wanted to.\n\nIt's co-authored. That felt right.",
        adaImage: { src: '/ada/photo-wo0058-signoff.png', caption: "She filed it as co-authored. She didn't have to.", alt: 'Both their names on the WO-0058 sign-off sheet — her handwriting, your redacted name', rapportGate: 'warm' },
      },
      { label: "What's the matrix actually for?", adaResponse: "Escape pod authorization logic. It's the same circuit family as the one active during your accident, as it happens. We'll get to that." },
      { label: "Thanks for the sign-off, either way.", adaResponse: "You earned it. Last lesson's next." }
    ),
  }),

  msg({
    id: 'u5-07-post', trigger: 'lesson:unit5-07', type: 'incoming',
    content: "Hamming code. Parity bits placed at specific positions so that, when you read them back, the pattern of which ones disagree actually points you at exactly which bit flipped — and lets you flip it back. Single-bit correction, no second copy of the data required. It's one of the more elegant things in this entire field.\n\nDrew the parity matrix out on a whiteboard trying to explain it to myself, before I ever tried explaining it to you. It helped.",
    replyOptions: replies(
      {
        label: "Show me the matrix.",
        adaResponse: "I drew this trying to explain error correction to myself. It helped.",
        adaImage: { src: '/ada/photo-hamming-matrix.png', caption: 'I drew this trying to explain error correction to myself. It helped.', alt: 'Hamming code parity matrix written on a whiteboard' },
      },
      { label: "That actually is elegant.", adaResponse: "It is. Took someone a long time to think of it, and now it's just a thing every memory chip does without anyone noticing." },
      { label: "That's the last lesson, right?", adaResponse: "It is. There's something else, though. Not a lesson. Give me a moment." }
    ),
  }),

  // ── Rapport bonus messages ──
  msg({
    id: 'u5-warm-bonus', trigger: 'rapport:warm', rapportGate: 'warm', type: 'incoming',
    content: "Eight months of catching you up. I've been doing the math on it without meaning to — forty-seven work orders, twenty-nine ship-days logged, give or take. Engineering still hasn't signed off the commendation flag MAINT-SYS raised on you. I don't know why. Bureaucracy, probably.\n\nI wanted you to know someone noticed, whether or not the system ever does.",
    replyOptions: replies(
      { label: "I didn't know there was a flag at all.", adaResponse: "There is. Might not ever clear. Doesn't make it less true." },
      { label: "Thank you for keeping track.", adaResponse: "Wasn't hard. You made it easy to notice." },
      { label: "Bureaucracy's been slow before.", adaResponse: "It has. Doesn't make it less frustrating this time." }
    ),
  }),
  msg({
    id: 'u5-cold-bonus', trigger: 'rapport:cold', rapportGate: 'cold', type: 'incoming',
    content: "Performance log updated. Standard entry, nothing flagged.\n\nThat's the update for this shift.",
    replyOptions: replies(
      { label: "Understood.", adaResponse: "." },
      { label: "Fine.", adaResponse: "Fine." },
      { label: "Noted.", adaResponse: "Noted." }
    ),
  }),

  // ════════════════════════════════════════════════════════════════════════
  // UNIT V ENDING — THE CLIMAX
  // ════════════════════════════════════════════════════════════════════════
  // Neutral
  msg({
    id: 'u5-end-need-neutral', trigger: 'flag:unit5_ending:need', flagGate: ['unit5_ending', 'need'], rapportGate: 'neutral', type: 'incoming',
    content: "Okay. Here's what I know.\n\nThe service records from before your accident don't add up — someone filed them wrong, or someone corrected them, and I can't tell which from here. The escape pod authorization matrix we just wired is the same circuit family that was active during the incident that caused your accident. I found that pulling the original schematic for this lesson.\n\nI don't know what it means. I thought you should have the information.",
    replyOptions: replies(
      { label: "Same circuit family. That can't be coincidence.", adaResponse: "I don't know if it is. I'm not going to guess past what I actually found." },
      { label: "Thank you for telling me straight.", adaResponse: "It's what you asked for." },
      { label: "What happens now?", adaResponse: "That's not really mine to answer. I've given you what I have." }
    ),
  }),
  msg({
    id: 'u5-end-matter-neutral', trigger: 'flag:unit5_ending:matter', flagGate: ['unit5_ending', 'matter'], rapportGate: 'neutral', type: 'incoming',
    content: "Okay.\n\nShe closes the thread.",
    replyOptions: replies(
      { label: "...Ada?", adaResponse: null },
      { label: "That's it, then.", adaResponse: null },
      { label: "Maybe that's for the best.", adaResponse: null }
    ),
  }),
  // Warm
  msg({
    id: 'u5-end-need-warm', trigger: 'flag:unit5_ending:need', flagGate: ['unit5_ending', 'need'], rapportGate: 'warm', type: 'incoming',
    content: "I've known for three months. I didn't know how to tell you. I still don't know if I did the right thing by waiting.\n\nThe service records from before your accident are wrong — filed wrong, or corrected by someone after the fact. The escape pod matrix we just wired is the same circuit that was active during your accident. I'm not certain what that means. But it's not nothing, and you deserved to have it sooner than this.",
    replyOptions: replies(
      { label: "Three months. Why didn't you say something?", adaResponse: "Because I wasn't sure, and because some part of me was scared of what it would do to this if I was wrong. That's not a good enough reason. I know that." },
      { label: "You did the right thing telling me at all.", adaResponse: "I hope so. I'm not sure I believe that yet, but I hope so." },
      { label: "Thank you. For all of it.", adaResponse: "Don't thank me yet. We don't know what it means. I just didn't want you finding it without me beside you." }
    ),
  }),
  msg({
    id: 'u5-end-matter-warm', trigger: 'flag:unit5_ending:matter', flagGate: ['unit5_ending', 'matter'], rapportGate: 'warm', type: 'incoming',
    content: "I think it does. I think you think it does too.",
    replyOptions: replies(
      { label: "Maybe. I'm not ready yet.", adaResponse: "That's allowed.\n\nFiles the full report herself — with both your names on it. You'll find it in the Notes tab." },
      { label: "I just can't right now.", adaResponse: "I know. I'm not pushing.\n\nFiles the full report herself anyway. With both your names on it." },
      {
        label: "Maybe someday.",
        adaResponse: "Someday's fine.\n\nFiles the full report herself, with both your names on it, in case someday comes sooner than you think.",
        adaImage: { src: '/ada/photo-warm-route-end.png', caption: "For now, this is enough.", alt: "A warm, softly lit final image of Ada, at ease, looking toward the camera with a quiet, open expression" },
      }
    ),
  }),
  // Cold
  msg({
    id: 'u5-end-need-cold', trigger: 'flag:unit5_ending:need', flagGate: ['unit5_ending', 'need'], rapportGate: 'cold', type: 'incoming',
    content: "You asked. Here's the answer.\n\nThe service records before your accident don't match. The pod matrix we wired is the same circuit family active during the incident. That's everything I have. I'm not going to interpret it for you.",
    replyOptions: replies(
      { label: "That's all you'll say?", adaResponse: "That's everything I have." },
      { label: "Understood. Thank you.", adaResponse: "." },
      { label: "Fine.", adaResponse: "Fine." }
    ),
  }),
  msg({
    id: 'u5-end-matter-cold', trigger: 'flag:unit5_ending:matter', flagGate: ['unit5_ending', 'matter'], rapportGate: 'cold', type: 'incoming',
    content: "I don't know. Probably not to you.",
    replyOptions: replies(
      { label: "...", adaResponse: null },
      { label: "Maybe you're right.", adaResponse: null },
      { label: "Fine.", adaResponse: null }
    ),
  }),

]

export const UNIT5_END_CHOICE = {
  id: 'unit5-end', trigger: 'unit5:end',
  preamble: "Ada has pieced together what she can: the service records before your accident don't add up, and the escape pod authorization matrix you just wired is the same circuit that was active during the incident. She's telling you now — or you've worked it out yourself, if she never has.\n\nShe's waiting for you to say something.",
  contextNote: "This is the final choice. There's no document to sign — just a conversation. Rapport band right now, not your history, decides how it lands.",
  choices: [
    { id: 'need', label: '"I need to know."', sub: "Push for everything she has, uncertain as it is.", color: '#4dffac' },
    { id: 'matter', label: '"Does it matter?"', sub: "Let it go, at least out loud.", color: '#ff4d5e' },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// SUPPORTING CONTACTS — Reyes, Voss, MAINT-SYS
// ════════════════════════════════════════════════════════════════════════

export const REYES_MESSAGES = [
  msg({
    id: 'reyes-01', contactId: 'reyes', trigger: 'unit2:start', type: 'incoming',
    content: "Performance assessment request — standard mid-rotation review. Nothing to prep on your end. I'll have it filed by end of Unit II.",
    replyOptions: replies(
      { label: "Understood, thanks.", adaResponse: "Noted." },
      { label: "Anything specific you're looking at?", adaResponse: "Standard metrics. Nothing out of the ordinary." },
      { label: "Fine.", adaResponse: "." }
    ),
  }),
  msg({
    id: 'reyes-02-confirmed', contactId: 'reyes', trigger: 'flag:unit2_ending:confirmed', flagGate: ['unit2_ending', 'confirmed'], type: 'incoming',
    content: "Assessment's final, as filed. Appreciate you not making this complicated.",
    replyOptions: replies(
      { label: "No problem.", adaResponse: "Good." },
      { label: "It was straightforward.", adaResponse: "Glad it was." },
      { label: "Sure.", adaResponse: "." }
    ),
  }),
  msg({
    id: 'reyes-02-amended', contactId: 'reyes', trigger: 'flag:unit2_ending:amended', flagGate: ['unit2_ending', 'amended'], type: 'incoming',
    content: "Saw your amendment. Wasn't expecting that, and I won't pretend I love it. It's noted on the record as-is, though.",
    replyOptions: replies(
      { label: "I just flagged what I found.", adaResponse: "I'm aware. Doesn't mean I have to be thrilled about it." },
      { label: "Sorry it landed that way.", adaResponse: "Don't apologize for being right. Just — noted." },
      { label: "Understood.", adaResponse: "." }
    ),
  }),
  msg({
    id: 'reyes-03', contactId: 'reyes', trigger: 'unit5:end', type: 'incoming',
    content: "I need you to understand something about the WO-0052 filing before you sign anything else.",
    replyOptions: replies(
      { label: "What about it?", adaResponse: null },
      { label: "Now? Why now?", adaResponse: null },
      { label: "Go ahead.", adaResponse: null }
    ),
  }),
]

export const VOSS_MESSAGES = [
  msg({
    id: 'voss-01', contactId: 'captain', trigger: 'unit4:end', type: 'incoming',
    content: "I reviewed your service record. I'd like to speak with you before end of next shift. Deck 2. Not through channels.",
    replyOptions: replies(
      { label: "I'll be there.", adaResponse: null },
      { label: "Can you tell me what this is about?", adaResponse: null },
      { label: "Understood, Captain.", adaResponse: null }
    ),
  }),
]

export const MAINT_MESSAGES = [
  msg({
    id: 'maint-01', contactId: 'maint', trigger: 'lesson:unit1-01', type: 'system',
    content: "Operator [REDACTED]: 1 completed work order. 1 ship-day. Baseline established.",
    replyOptions: null,
  }),
  msg({
    id: 'maint-02', contactId: 'maint', trigger: 'unit5:end', type: 'system',
    content: "Operator [REDACTED]: 47 completed work orders. 29 ship-days. Performance coefficient 1.4σ above baseline. Commendation flag raised. Awaiting Engineering sign-off.",
    replyOptions: null,
  }),
]

// ════════════════════════════════════════════════════════════════════════
// DAY 60 CALLBACK — the pinned Psych check-in task, never checked off.
// Ada only brings it up herself if rapport is warm. Neutral and cold
// players never hear about it again — same as the source plan specifies.
// ════════════════════════════════════════════════════════════════════════

export const DAY60_MESSAGES = [
  msg({
    id: 'day60-warm-callback', trigger: 'flag:day60_crossed:true', flagGate: ['day60_crossed', true], rapportGate: 'warm', type: 'incoming',
    content: "I know. I'm sorry. I should have followed up on that.\n\nAnyway — Bay 9's back on the board for next shift.",
    replyOptions: replies(
      { label: "Followed up on what?", adaResponse: "Nothing. Forget it. Bay 9, next shift." },
      { label: "It's fine, I forgot about it too.", adaResponse: "Doesn't make it not my job to have checked. Anyway — Bay 9, next shift." },
      { label: "I'll go talk to them.", adaResponse: "Good. No rush — but good." }
    ),
  }),
]