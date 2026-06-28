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
          src:     'ada:photo-or-gate-diagram',
          caption: 'Quick sketch I made during training. Still have it.',
          alt:     'Hand-drawn OR gate truth table on a maintenance log page',
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
          src:     'ada:photo-processor-board',
          caption: 'Pulled this from a failed nav unit last cycle. All NAND arrays.',
          alt:     'Close-up of a circuit board showing dense NAND gate arrays, green PCB with silver traces',
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
          src:     'ada:photo-milky-way',
          caption: 'Taken from the observation port last cycle. First clear view in weeks.',
          alt:     'Long-exposure photo through a thick porthole window, stars streaked into arcs, the Milky Way band visible across the frame',
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
          src:     'ada:photo-ada-face-first',
          caption: "I took this in the break room. The lighting's bad but I look alive in it, which is more than I can say for most of my photos.",
          alt:     'A slightly blurry selfie in a dim ship break room, warm overhead light catching half a face — brown skin, one visible dark eye, a small smile that looks surprised',
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

  // After 'aligned' choice
  msg({
    id:       'u1-end-aligned-response',
    trigger:  'flag:unit1_ending:aligned',
    flagGate: ['unit1_ending', 'aligned'],
    type:     'incoming',
    content:  "I saw what you logged in the incident report.\n\nI know that wasn't easy to write. Attributing a fault correctly when it implicates the maintenance schedule — that's the kind of thing people usually leave vague.\n\nFor what it's worth: it's the right call. The ship runs on accurate data. You can't maintain what you're misreporting.",
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

  // After 'defiant' choice
  msg({
    id:       'u1-end-defiant-response',
    trigger:  'flag:unit1_ending:defiant',
    flagGate: ['unit1_ending', 'defiant'],
    type:     'incoming',
    content:  "I read the report.\n\nI'm not going to tell you it was the wrong call. I've been on ships where the right report ended a mechanic's career and the wrong one kept the lights on for six more months.\n\nI just — I need to know if it was a practical decision or if you actually believe the system is working correctly. Because those are two very different things and they matter for how I brief you going forward.",
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