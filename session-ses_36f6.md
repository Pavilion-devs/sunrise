# Deep research plan: CLAUDE.md, plan.md, and Sunrise migration tooling strategy

**Session ID:** ses_36f6f57ebffeGBGcWEoz2kvPEn
**Created:** 2/24/2026, 5:52:05 PM
**Updated:** 2/24/2026, 6:45:09 PM

---

## User

I want you to look at the @CLAUDE.md @plan.md , understand what we're building properly right. So we don't have an idea yet but her'es the key:  https://wormholelabs.notion.site/Blog-Graveyard-Hackathon-Guide-30d3029e88cb8015a9a1fcc44e6f7de8
go through that file and then this: https://www.sunrisedefi.com/apply seems like they want us to talk to them before we start bulding anything so we need to do deep research on them and what kind of migration tooling, bridges or onboarding guide we're going to build. i need you to very smart right now. Like channel in your GOD mode and cook, analyze everything and let me know your thoughts. 

---

## Assistant (Build · gpt-5.2-codex · 12.8s)

_Thinking:_

**Planning to read CLAUDE and use webfetch**

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/favourolaboye/Documents/sunrise/cluster4-migrations/CLAUDE.md"
}
```

**Output:**
```
<path>/Users/favourolaboye/Documents/sunrise/cluster4-migrations/CLAUDE.md</path>
<type>file</type>
<content>1: # Cluster 4 — Migrations ⚠️ TACKLE LAST
2: 
3: ## Mission
4: Help projects migrate to Solana from other ecosystems (EVM, etc.) using
5: Sunrise. Build bridges, migration tooling, or onboarding guides.
6: 
7: ## Bounties This Cluster Targets
8: 
9: | Bounty | Sponsor | Track |
10: |--------|---------|-------|
11: | Migrations | Sunrise | Bridges, migration tooling, onboarding guides |
12: 
13: ## Core Concept
14: - Sunrise as the bridge/migration layer
15: - Target: projects wanting to move from EVM chains to Solana
16: - Could be tooling (scripts, CLIs), a guide platform, or a bridge UI
17: 
18: ## Key Links
19: - Sunrise: https://www.sunrisedefi.com/
20: documentation: https://wormholelabs.notion.site/Blog-Graveyard-Hackathon-Guide-30d3029e88cb8015a9a1fcc44e6f7de8
21: 
22: ## Notes
23: - This cluster is intentionally last. It's infra/tooling focused which
24:   is a different mode from the other app-focused clusters.
25: - If time is short by the time you get here, assess honestly whether
26:   there's enough runway to do this justice. A weak submission helps nobody.
27: 
28: ## Submission Checklist
29: - [ ] Working demo or prototype
30: - [ ] Video walkthrough (max 3 min)
31: - [ ] Public GitHub repo
32: - [ ] Built on Solana
33: 
34: ## Master Plan
35: See `/Users/favourolaboye/Downloads/graveyard/plan.md` for overall strategy.

(End of file - total 35 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/favourolaboye/Downloads/graveyard/plan.md"
}
```

**Output:**
```
<path>/Users/favourolaboye/Downloads/graveyard/plan.md</path>
<type>file</type>
<content>1: # Graveyard Hackathon — Master Plan
2: 
3: **Deadline:** Feb 27, 2026 | **Winners:** Mar 5, 2026
4: **Today:** Feb 22, 2026 — **5 days left**
5: **Total bounty potential across clusters: ~$28,200**
6: 
7: ---
8: 
9: ## Strategy
10: 
11: Build in clusters — one codebase per cluster, submitted to multiple bounties.
12: Each cluster has its own folder, git repo, Claude Code session, and plan.md.
13: Don't mix sessions. Use this file as the master dashboard.
14: 
15: ---
16: 
17: ## Folder Structure
18: 
19: ```
20: graveyard/
21: ├── plan.md                    ← you are here
22: ├── cluster1-dao-blinks/       ← Realms + OrbitFlare + BIO
23: ├── cluster2-music-social/     ← Audius + Tapestry + Torque
24: ├── cluster3-ticketing/        ← KYD Labs
25: └── cluster4-migrations/       ← Sunrise (tackle last)
26: ```
27: 
28: Each cluster contains:
29: - `plan.md` — cluster-specific architecture and build plan
30: - `CLAUDE.md` — context file auto-loaded by Claude Code sessions
31: - `.git/` — independent git history
32: 
33: ---
34: 
35: ## Clusters
36: 
37: ### Cluster 1 — DAO Blinks `cluster1-dao-blinks/`
38: **Status:** [ ] Not started
39: 
40: | Bounty | Sponsor | Prize Potential |
41: |--------|---------|----------------|
42: | DAOs | Realms | up to $2,500 |
43: | Blinks | OrbitFlare | up to $750 |
44: | DeSci | BIO | up to $750 |
45: | **Total** | | **up to $4,000** |
46: 
47: **Concept:** Solana Actions & Blinks for DAO governance — one-click voting,
48: delegating, and funding research proposals on Realms. Frame the DAO as
49: DeSci-flavored to qualify for BIO. OrbitFlare infra powers the Blinks.
50: 
51: **Why this first:** Blinks are just HTTP APIs + Solana transactions. Fastest
52: cluster to get a working prototype. Realms has solid docs. BIO bolts on
53: with minimal extra work.
54: 
55: ---
56: 
57: ### Cluster 2 — Music Social Loyalty `cluster2-music-social/`
58: **Status:** [ ] Not started
59: 
60: | Bounty | Sponsor | Prize Potential |
61: |--------|---------|----------------|
62: | Music | Audius | up to $2,000 |
63: | Onchain Social | Tapestry | up to $2,500 |
64: | Loyalty | Torque | up to $750 |
65: | **Total** | | **up to $5,250** |
66: 
67: **Concept:** A social music platform where fans follow/engage with artists
68: on Audius, their social graph lives onchain via Tapestry, and loyal listeners
69: earn rewards via Torque. One app, three submissions.
70: 
71: **Why this second:** Higher prize ceiling. Audius has a public API. Tapestry
72: and Torque have clear integration points. Can build incrementally.
73: 
74: ---
75: 
76: ### Cluster 3 — Ticketing `cluster3-ticketing/`
77: **Status:** [ ] Not started
78: 
79: | Bounty | Sponsor | Prize Potential |
80: |--------|---------|----------------|
81: | Ticketing | KYD Labs | up to $2,500 |
82: | **Total** | | **up to $2,500** |
83: 
84: **Concept:** Next-gen event ticketing on the KYD protocol. Could include
85: Blinks for one-click ticket claiming (reuse code from Cluster 1).
86: 
87: **Why this third:** More standalone. Can potentially reuse Blinks code
88: from Cluster 1 to speed up build time.
89: 
90: ---
91: 
92: ### Cluster 4 — Migrations `cluster4-migrations/` ⚠️ TACKLE LAST
93: **Status:** [ ] Not started
94: 
95: | Bounty | Sponsor | Prize Potential |
96: |--------|---------|----------------|
97: | Migrations | Sunrise | up to $3,000 |
98: | **Total** | | **up to $3,000** |
99: 
100: **Concept:** Tooling or guides to help projects migrate from other ecosystems
101: (EVM, etc.) to Solana using Sunrise. Bridge tooling or migration scripts.
102: 
103: **Why last:** Most different in nature from the other clusters. Infra/tooling
104: focused rather than app focused. Highest effort, least synergy. If time runs
105: out, this is the one to drop.
106: 
107: ---
108: 
109: ## Timeline
110: 
111: | Day | Date | Goal |
112: |-----|------|------|
113: | Day 1 | Feb 22 | Set up all cluster folders + init git repos. Start Cluster 1 plan. |
114: | Day 2 | Feb 23 | Build Cluster 1 core (Blinks + Realms integration). |
115: | Day 3 | Feb 24 | Finish Cluster 1. Start Cluster 2. |
116: | Day 4 | Feb 25 | Build Cluster 2 core (Audius + Tapestry + Torque). |
117: | Day 5 | Feb 26 | Finish Cluster 2. Build Cluster 3. Touch Cluster 4 if time allows. |
118: | Deadline | Feb 27 | All submissions in. Videos recorded. GitHub repos public. |
119: 
120: ---
121: 
122: ## Submission Checklist (per cluster)
123: 
124: - [ ] Working demo or prototype
125: - [ ] Short video walkthrough (max 3 min)
126: - [ ] GitHub repo with source code (must be public)
127: - [ ] Project built on Solana
128: - [ ] Team size 1–5 members
129: 
130: ---
131: 
132: ## Shared Resources
133: 
134: | Resource | Link |
135: |----------|------|
136: | Solana Docs | https://solana.com/docs |
137: | Code Templates | https://solana.com/developers/templates |
138: | AI Dev Skill | https://solana.com/SKILL.md |
139: | Hackathon Page | https://solana.com/graveyard-hack |
140: | Submit Here | https://solanafoundation.typeform.com/graveyard-hack |
141: 
142: ---
143: 
144: ## Notes
145: 
146: - Each Claude Code session should be opened FROM inside the cluster folder
147:   so CLAUDE.md is picked up automatically.
148: - Commit often. Each cluster has its own git so histories stay clean.
149: - Record demo videos as you go — don't leave all recordings to Feb 27.
150: - Tapestry bounty is marked "maybe" — reassess after Cluster 1 is done.

(End of file - total 150 lines)
</content>
```

**Tool: webfetch**

**Input:**
```json
{
  "url": "https://wormholelabs.notion.site/Blog-Graveyard-Hackathon-Guide-30d3029e88cb8015a9a1fcc44e6f7de8",
  "format": "markdown"
}
```

**Output:**
```
Notion

![Notion](/images/notion-logo-block-main.svg)

JavaScript must be enabled in order to use Notion.  
Please enable JavaScript to continue.
```

**Tool: webfetch**

**Input:**
```json
{
  "url": "https://www.sunrisedefi.com/apply",
  "format": "markdown"
}
```

**Output:**
```
Sunrise

[](/)

-   [Home](/)
-   [Swap](/swap)
-   [Deposit](/deposit)
-   [Withdraw](/withdraw)
-   [Apply](/apply)

[Privacy Policy](/privacy-policy)[Terms of Service](/terms-of-service)[Press](/press)

[](https://x.com/Sunrise_DeFi "Join our community on X!")[](https://t.me/sunrise_defi "Chat with us on Telegram!")[](https://discord.gg/sunrise-defi "Chat with us on Discord!")

Powered by[](https://wormhole.com)
```

---

## Assistant (Build · gpt-5.2-codex · 13.9s)

_Thinking:_

**Exploring JS-free Notion fetching**

I'm testing alternative Notion page fetching methods without JavaScript by trying URL query formats like ?format=markdown or ?format=page and routing requests through r.jina.ai to bypass JS dependencies.

**Tool: webfetch**

**Input:**
```json
{
  "url": "https://r.jina.ai/https://wormholelabs.notion.site/Blog-Graveyard-Hackathon-Guide-30d3029e88cb8015a9a1fcc44e6f7de8",
  "format": "markdown"
}
```

**Output:**
```
Title: Blog: Graveyard Hackathon Guide

URL Source: https://wormholelabs.notion.site/Blog-Graveyard-Hackathon-Guide-30d3029e88cb8015a9a1fcc44e6f7de8

Markdown Content:
![Image 1](https://wormholelabs.notion.site/image/attachment%3A3c0239b6-45dd-46c8-bca4-7d988ca11d2a%3Aimage.png?table=block&id=30d3029e-88cb-801c-b2ed-c41c9cfa3cbe&spaceId=e830c94f-4d1d-42b1-8777-4c63847b8fa6&width=1420&userId=&cache=v2)

Sunrise is sponsoring the Migrations track at the [Solana Graveyard Hackathon](https://solana.com/graveyard-hack#resources). If you're building in this track, here's what you need to know about us and how to work with us.

Summary: Bring an asset to Solana through Sunrise, or build tooling that makes this easier. For either path, please reach out to us first.

Sunrise is the [asset gateway for Solana](https://www.sunrisedefi.com/press/2025-11-23-sunrise-launch). We help projects from other ecosystems list on Solana with real markets, real liquidity, and real distribution—on day one.

The problem we solve is straightforward: demand for tokens exists across ecosystems, but liquidity and distribution usually don't arrive at the same time. Assets show up late, after attention has moved on. Pools are empty or fragile. Users have to bridge manually, switch chains, and wait for markets to appear. The result is that launches leave meaningful demand and volume untapped.

Sunrise coordinates what launches usually leave fragmented. We handle three things:

Asset arrival. Your asset arrives on Solana as the canonical, Solana-native version, not a random wrapped token that confuses users and fragments liquidity.

Liquidity and market formation. We coordinate onchain market making so markets open with depth, not empty pools. Tradable markets from minute one.

Go-to-market and distribution. We activate Solana's trading venues and protocols so users can trade immediately. Your asset becomes discoverable across Solana's ecosystem at launch.

We're framework agnostic: NTT, OFT, Chainlink CCIP, or your preferred architecture. And we work with assets at any stage: new TGE launches, existing tokens outside Solana, or tokens already on Solana that need better market formation.

The Migrations track is about bringing projects to Solana from other ecosystems. That's literally what Sunrise does. We've done it with MON (Monad), HYPE (Hyperliquid), LIT (Lighter), and INX (Infinex), with many more to come.

The track offers $7,000 in prizes: $3,000 for first place, $2,500 for second, $1,500 for third.

There are two ways to participate:

Bring an asset to Solana. Identify a token or protocol from another ecosystem that belongs on Solana, reach out to us, and work with Sunrise to actually make the listing happen—bridging, liquidity, go-to-market, the whole thing.

Build tooling that makes this easier. Create migration tools, onboarding flows, guides, or infrastructure that helps bring assets to Solana—things that make the next listing faster or more accessible.

For either path, the first step is to [talk to us](https://sunrisedefi.com/apply). We need to understand what you're building so we can scope it together and make sure it actually serves asset onboarding on Solana. Reach out early: don't wait until your submission is done.

We've seen this question come up. The honest answer: there are no docs, and that's by design.

Sunrise is not a self-serve SDK you integrate against. It's a coordinated effort: technology, liquidity, and go-to-market working together. Every listing is different. The asset, the community, the liquidity profile, the ecosystem dynamics—all of these shape how we approach a launch.

So instead of docs, we work directly with teams. You tell us what you're building or what you want to bring to Solana, and we figure out together how to make it happen.

If you're building in the Migrations track and want to use Sunrise, reach out:

Tell us what project or asset you're thinking about migrating. We'll work with you on how to bring it to Solana through Sunrise, whether you’re focusing on the bridging, the liquidity strategy, the go-to-market.

Don't overthink it. The best submissions will identify real demand (assets that Solana users actually want) and put together a credible plan to bring them over. We're here to help you do that.

```

**Tool: webfetch**

**Input:**
```json
{
  "url": "https://r.jina.ai/https://www.sunrisedefi.com/apply",
  "format": "markdown"
}
```

**Output:**
```
Title: Sunrise Bridge

URL Source: https://www.sunrisedefi.com/apply

Markdown Content:
Apply
-----

Bring your asset to Solana with real markets from day one

![Image 1: Sunrise Apply](https://www.sunrisedefi.com/press/apply-banner.png)
Sunrise is for new launches, established assets, and native SPL tokens.

What to expect
--------------

We review launches based on asset size, timing, and market readiness. Not every application is accepted. Approved teams work directly with us on launch and liquidity planning.

[Apply now](https://tally.so/r/9qXpEX)
Serious teams only. We review every application.

Who is Sunrise for
------------------

Sunrise makes Solana your launch success.

New assets

Your second home to launch, trade, and grow

Established assets

A direct path into Solana's trading ecosystem

Native SPL assets

Where your launch becomes a real market

How Sunrise works
-----------------

Sunrise coordinates the technology, liquidity, and go-to-market so you don't have to.

1

**Apply** and show us what you're launching

2

**Coordinate** with us on liquidity and marketing

3

**Trading activates** across Solana DeFi

MON on Solana
-------------

See what coordinated market formation looks like in practice.

$69M traded in 24H

Most traded token on Solana outside of SOL on day one.

~60% of Uniswap volumes

Almost double MON's spot volume on Hyperliquid.

Top 5 global venue

If Solana were a CEX, it would have ranked #5 for MON spot.

[Download the case study](https://www.sunrisedefi.com/files/MON_Case_Study.pdf)

```

---

## Assistant (Build · gpt-5.2-codex · 16.4s)

_Thinking:_

**Providing analysis and recommendations**

I'm proposing a clear path grounded in direct coordination without docs: start by selecting a specific asset to onboard or migrate, then use tailored tooling like a Migration Launch Playbook and Liquidity Distribution Plan to streamline the process. Next steps include drafting outreach to confirm asset choice and their preferred track before building. A key question to guide priorities: which asset or integration track should we focus on first?

Here’s what I pulled together from the files + Sunrise guide, and how I’d play this smart.

**What Sunrise is actually asking for**
- They are not a self‑serve SDK; they want a coordinated launch (bridge + liquidity + GTM). The guide explicitly says: talk to them first and co‑scope.
- Two valid submission paths: (1) bring a real asset to Solana via Sunrise, (2) build tooling/guides that make future asset onboarding easier.
- They care about “real demand” and a credible plan, not just a demo. The best submissions are tied to a real asset/community.

**What this means for us**
- We shouldn’t build a generic bridge UI. That doesn’t match Sunrise’s “coordination” model.
- The highest‑signal submission is one that proves we understand the real onboarding workflow: asset choice, bridge architecture, liquidity plan, market formation, GTM.
- The right “tooling” is anything that turns this from an ad‑hoc consult into a repeatable process.

**High‑leverage project directions (ranked)**
1) **Migration Launch OS (Recommended)**  
   A small web app that turns an external asset into a “Solana launch plan” with:
   - Asset intake (chain, tokenomics, community, venues, liquidity sources)
   - Bridge path selection (NTT/OFT/CCIP/other)
   - Market formation checklist (venues, LP sources, target depth)
   - GTM checklist (announcements, ecosystem partnerships)
   - Output: a Sunrise‑ready launch brief + timelines  
   This directly mirrors Sunrise’s coordinated model and is easy to demo.

2) **Liquidity & Market Formation Planner**  
   A tool that estimates required liquidity depth, lists venues (Solana DEXes), and produces a launch plan.  
   Include a “Day‑1 readiness” score.

3) **Migration Readiness Scorecard + Guide**  
   A public checklist with a scoring rubric + templates for teams to fill.  
   This can be an onboarding guide + lightweight CLI that generates a report.

**Where I think the prize is**
- They want to see you understand *coordination*, not just bridging.  
- A clean “launch plan generator” tool aligns perfectly and is buildable quickly.

**What to do before writing code**
- Pick a real asset (even a hypothetical target with real data).
- Draft a one‑page launch plan (so Sunrise can see you’re serious).
- Use their Apply form to start the conversation.

**Recommended default path**
Build the “Migration Launch OS” as a focused MVP, then use a single asset as the live case study in the demo. It’s tangible, aligns with Sunrise’s model, and doesn’t require access to their internal pipeline.

**One question to unblock the next step**
Which direction should I aim for as the default:  
1) Launch plan generator with a real asset case study (recommended), or  
2) Pure onboarding guide/scorecard without a specific asset?  

If you want, I can also shortlist 3–5 candidate assets with strong Solana demand signals and prepare a Sunrise‑ready application draft.

---

## User

Aim for the best step. I like the migration launch OS.  N.B Whatever we're building or pitching to them must be very unique and something that will really help sunrise and most importantly, help us standards, so our idea/features must be unique, solid and 

---

## Assistant (Build · gpt-5.2-codex · 11.1s)

_Thinking:_

**Proposing unique feature ideas**

I'll suggest distinctive features that can add clear value and provide a simple plan to implement them, plus a targeted question about asset choices to clarify the best approach.

Great — I’ll anchor on the Migration Launch OS and push it into “unique + Sunrise‑native.” Here’s a sharper concept that feels like a real product Sunrise would use internally and also a killer hackathon demo.

**Migration Launch OS — unique, Sunrise‑native version**
- **Launch Blueprint Builder**: structured intake that turns an external asset into a Sunrise‑ready launch brief (bridge architecture, liquidity plan, venue sequencing, GTM).
- **Liquidity Orchestration Simulator**: predicts Day‑1 depth and volume targets based on comparable assets and venue mix; outputs “minimum viable market” thresholds.
- **Chain‑to‑Solana Canonicalization Map**: a decision engine for canonical token strategy (NTT/OFT/CCIP/custom) + risk notes on liquidity fragmentation.
- **Launch Readiness Score**: objective scoring across tech readiness, liquidity confidence, and distribution readiness; flags the weakest link with fix steps.
- **One‑click Sunrise Intake**: exports a standard Sunrise application pack (PDF/JSON) that mirrors what Sunrise needs to coordinate a launch. This is the “unique” value: we turn onboarding into a repeatable pipeline.

**What makes this uniquely valuable to Sunrise**
- It systematizes their bespoke coordination process into a repeatable intake.
- It reduces time spent on scoping launches and filters low‑quality applicants.
- It creates a pipeline of Sunrise‑ready launches with clear liquidity and GTM plans.

**Demo idea**
- Pick one real asset (EVM or alt chain), run it through the OS, and show the final Sunrise‑ready brief + readiness score + liquidity plan.
- The demo is concrete without requiring actual bridging.

If you want “best step” next, I need one choice to anchor the case study:

Which asset should we use for the demo launch plan?
1) A real EVM token with known liquidity (recommended)
2) A smaller emerging asset for a bold “early‑stage” case
3) A hypothetical token (faster but less convincing)

Once you pick, I’ll draft the full launch blueprint and the unique feature spec.

---

## User

First of all before we move on, go through all of these and tell me what you think about this whole approach. Honestly, evaluate it well and let me know your thoughts!!!

---

## Assistant (Build · gpt-5.2-pro · 50.5s)

_Thinking:_

**Evaluating the approach**

I need to provide a thorough evaluation of our project's strengths, weaknesses, uniqueness, risks, and feasibility within five days. It's essential to keep in mind the hackathon checklist while avoiding unnecessary overbuilding. I'll mention reaching out to Sunrise and referencing case studies to demonstrate credibility. I need to present a credible plan based on the Sunrise guide, emphasizing that we should work closely with them. I’ll also suggest concrete next steps to keep things direct and actionable.

_Thinking:_

**Evaluating the canonicalization map**

I see that creating a "canonicalization map" requires extensive knowledge of bridging architectures, which could be a bit speculative. Maybe it’s better to develop a policy-based wizard instead. For feasibility, I could build a small web app along with a CLI and a PDF generator, using static data to avoid complex machine learning predictions. I'll focus on rules-based readiness scoring and templates and name it "Sunrise Launch Brief v1." The MVP should include an intake form, scoring, export, and a case study. We need to address the Solana requirement and explore options for storing briefs effectively.

_Thinking:_

**Structuring the response**

I should mention that I'll contact Sunrise early and use an application form with a preview of the blueprint. To provide a clear and organized response, I’ll structure it into bullet points that cover the strengths and weaknesses, how to make our project unique, what to cut, what needs to be proved, success criteria, and the next steps. This should give a comprehensive view of the project while keeping everything focused and actionable.

Your approach is directionally right for Sunrise, and it’s one of the few “tooling” ideas that actually matches how they operate. The key is to keep it from turning into a generic checklist app.

What’s strong about the Migration Launch OS
- It aligns with Sunrise’s core claim: launches fail when arrival, liquidity, and distribution aren’t coordinated. Your tool productizes that coordination.
- It fits their “no docs by design” posture: instead of an SDK, you’re building an intake + scoping system that makes bespoke launches repeatable.
- It’s demoable without privileged access: you can produce a credible launch brief + readiness gaps + plan for a real asset.

Where it can fail (and how judges/Sunrise will poke holes)
- If it’s “a form that outputs a PDF,” it’s not unique; it’s a Notion template with UI.
- “Liquidity simulator” can get hand-wavy fast. If you can’t defend the numbers, it will read like vibes.
- “Canonicalization map” can become speculative unless it’s framed as a decision log with assumptions, tradeoffs, and references (not as authoritative truth).
- If it doesn’t clearly tie back to Sunrise’s workflow (what they review, what they need to coordinate), it won’t feel like it helps them.

How to make it genuinely unique (Sunrise-grade)
- Build it as a Sunrise intake standard: a structured “Launch Blueprint” schema (JSON) + export pack that Sunrise can actually use to triage and coordinate.
- Make the “Readiness Score” actionable: every failing category must generate a concrete remediation checklist + owner + timeline.
- Replace “simulation” with “minimum viable market formation” planning: depth targets, venue sequencing, LP sources, constraints, and a clear assumptions section. Conservative, defensible > fancy.
- Add a Solana-native proof element so it’s clearly “built on Solana”: publish a hash/attestation of the blueprint on Solana (simple program, or even a transaction memo + signed artifact). That gives you an onchain audit trail and a clean demo hook.

What I would cut or downscope (to stay high-signal)
- No ML predictions, no complex market modeling.
- No multi-bridge integrations.
- No attempt to automate “the whole launch.” Focus on the scoping artifact + coordination plan.

What would make this a winning submission
- One real asset case study run end-to-end through the OS.
- A Sunrise-ready application pack produced by the tool (brief + plan + readiness + assumptions).
- A clear story: “Sunrise is consultative; this makes consults faster and filters serious teams.”

Net assessment
- This is a good bet because it matches Sunrise’s worldview and creates something they could reuse.
- The risk is polish without substance; the fix is to make the output an operational document with defensible assumptions and an onchain attestation.

Next step I’d take: draft the exact “Launch Blueprint” schema (the fields Sunrise would care about) and the scoring rubric so we can show Sunrise something concrete in the first message/application.

---

## User

okay first of all before we start building plans, I love all what you said and your steps. Construct a message, let me send it to their main guy: Simon on telegram and yeah once we get approval we can start building. let it be based on everything you analysed and said I should do to turn this into a winning submission

---

## Assistant (Build · gpt-5.2-pro · 23.5s)

Hey Simon — we’re building for the Graveyard “Migrations” track and want to scope with Sunrise before writing code (per your guide).

We’re proposing a “Migration Launch OS”: a Sunrise-native intake + scoping tool that turns an external asset into a Sunrise-ready Launch Blueprint (canonical token/bridge approach options like NTT/OFT/CCIP, liquidity & market-formation plan with conservative assumptions, venue sequencing, GTM checklist), plus a readiness score that outputs concrete remediation steps. The goal is to make Sunrise’s coordinated process faster/repeatable and filter for serious teams—more like a standardized launch brief than a generic bridge UI.

If this fits what you’d actually want to use, a few quick questions so we build the right thing:
1) What are the top 8–12 fields you need to evaluate/coordinate a launch (tech + liquidity + GTM)?
2) What are the most common reasons applications get rejected or delayed (so we can design the readiness checks)?
3) Do you prefer the demo to be centered on a real target asset (we can pick one with clear demand signals), and any assets you’d like to see on Solana?

If you’re open, we can send a 1-page draft of the Launch Blueprint schema for your feedback within 24h, then build the MVP around it.

---

## User

I'll give you feedback once they reply. for now, we just chill right? 

---

## Assistant (Build · gpt-5.2-pro · 16.4s)

Yep — for now we wait on Simon so we don’t build the wrong thing.

While we’re waiting (no code), two low-risk things you can prep that won’t conflict with their guidance:
- Collect 2–3 candidate assets you could use as the demo case study (name, chain, why Solana users want it, current liquidity/venues).
- Draft a 1-page “Launch Blueprint” outline in notes so we can send it immediately if Simon asks “what do you mean?”

Ping me with Simon’s reply and I’ll adapt the spec to exactly what Sunrise wants.

---

## User

or what do you think about this idea as idea2: 1) “Canonical Asset Onboarding Kit” (tooling + onchain primitives) — best fit for Sunrise’s core pain
- Problem it solves: when assets “arrive” on Solana, users get confused by multiple wrapped mints + fragmented liquidity + messy migrations for existing holders.
- Deliverable (built on Solana, but doesn’t require Sunrise internal APIs):
  - A small Solana program that acts as a “canonical asset registry”:
    - maps (origin_chain_id, origin_token_address) → canonical_solana_mint
    - stores verification metadata (attestation fields, issuer signatures, links to bridging framework used: NTT/OFT/CCIP/etc.)
  - A “migration claim” program (Merkle distributor) to migrate existing holders/community:
    - ingest an EVM snapshot offchain → publish Merkle root onchain → users claim to their Solana wallet
  - A web UI + CLI:
    - CLI: given token contract + snapshot block, generate the Merkle tree + JSON manifest
    - UI: “Is this the canonical mint?” lookup, plus claim flow link for users who prefer bridging vs claiming
- Why Sunrise would like it: it reinforces their “canonical route” narrative, makes listings cleaner, and reduces the long tail of user-support + confusion. 

---

## Assistant (Build · gpt-5.2-pro · 52.9s)

_Thinking:_

**Evaluating ideas and risks**

I need to weigh idea two against idea one by discussing factors like feasibility, uniqueness, and risks, including security and scope. I want to connect this to the Sunrise consultative approach, ensuring we're not stepping on existing registries like Solana's token list or Wormhole. We need to consider risks like impersonation and verification. It might be enough to create a public registry managed by an admin or multisig without needing a complex program. Additionally, I must think about the legal and operational aspects of snapshot claims. I need to keep my answer concise yet detailed.

Idea2 is strong and arguably “more real” than the Launch OS because it ships concrete primitives that directly address Sunrise’s biggest user pain: canonical mint ambiguity + fragmented liquidity + messy holder migrations. But it has sharper edges (security/trust, scope, and potential overlap with existing standards). Here’s my honest take.

What’s excellent about Idea2
- Directly reinforces Sunrise’s differentiator: “canonical, Solana-native asset” vs random wrapped mints.
- Gives a tangible artifact Sunrise could adopt across launches: a canonical mapping + verification metadata + a clean holder migration path.
- The Merkle-claim path is credible for migrations where bridging isn’t the best UX (or where you want to bootstrap distribution on Solana fast).

Where it can go wrong
- Canonical registry is a trust problem, not a code problem. If anyone can register mappings, it’s a phishing vector. If only Sunrise can, it becomes “Sunrise registry,” which is fine—but you must design governance/verification cleanly.
- There are already identity-ish registries (Solana token lists, explorers, bridging provider attestations). If you don’t position your registry as “launch-specific, Sunrise-verifiable canonicalization,” it will look redundant.
- Snapshot → Merkle claims have footguns: sybil/airdrop farming, snapshot selection disputes, exclusions (CEX wallets), and lots of edge-case UX/support. Still doable, but don’t pretend it solves everything.

How to make it uniquely Sunrise (and winning)
- Make the registry “Launch Attestation Registry,” not a generic global registry:
  - Each entry is a “Sunrise Launch Blueprint Attestation” that includes canonical mint + bridge framework + genesis time + official links + venue plan pointers.
  - Verification model: Sunrise signer (or Sunrise + partner signer) publishes the attestation. That maps perfectly to “coordination” and avoids open-registration risks.
- Include “confusable mint protection” UX:
  - UI that flags lookalike mints and shows a single canonical badge backed by the onchain attestation signature.
- Scope the Merkle claim as an optional module:
  - Provide a hardened reference flow + tooling, but keep the demo tight: one real snapshot, one Merkle root, one claim flow.

How it compares to the Migration Launch OS
- Launch OS is process/productivity; Idea2 is protocol/UX safety.
- If Sunrise wants something immediately reusable for launches, Idea2 may excite them more.
- If Sunrise wants you to demonstrate understanding of their full coordination (liquidity + GTM), Launch OS does that better.

My recommendation
- Keep Launch OS as the “front door” (intake + plan), and position Idea2 as the “onchain proof + canonical badge” module that the Launch OS outputs/publishes.
- If you must pick only one: Idea2 is higher risk but higher uniqueness; Launch OS is safer and still aligned.

If Simon replies positively, the single most important question to ask him for Idea2 is: what’s the acceptable trust model for “canonical” (Sunrise-only signer, multisig with partners, or standards-based attestations), because that decision determines the whole architecture.

---

## User

I've not told him about idea 2 yet, should I text him again and just brief him on it? 

---

## Assistant (Build · gpt-5.2-pro · 22.0s)

_Thinking:_

**Providing follow-up advice**

I need to give some concise advice without asking for permission. I should draft two options: one where I suggest a follow-up message but frame it as an optional extension, and another where I recommend waiting for a reply. Since they've already sent a message, I want to avoid being annoying with multiple pings. I think recommending a wait of 12-24 hours is wise, and if there's no reply, I’ll suggest a single follow-up message.

I wouldn’t send a second “new idea” ping immediately. Two back-to-back pitches reads unfocused, and Sunrise is explicitly consultative — you want them to react to one coherent direction.

Best move:
- Wait for his reply. If he engages, you can say “we also have an onchain canonicalization module idea.”
- If there’s no reply after ~12–24h, send one follow-up that positions Idea2 as an extension/module of the Launch OS (not a separate pivot).

Follow-up text you can use (if needed):
“Quick add-on thought (in case it’s useful): we can include an onchain ‘Canonical Asset Attestation’ module—Sunrise-signed registry mapping (origin chain, origin token) → canonical Solana mint, with verification metadata (bridge framework used, official links). Optionally a Merkle-claim toolkit for holder migrations (snapshot → Merkle root onchain → claim). This would reduce user confusion from multiple wrapped mints and help keep liquidity canonical. If that’s interesting, what trust model would you prefer for ‘canonical’—Sunrise-only signer vs multisig w/ partners?”

If he replies to the first message, paste that as a follow-on inside the same thread.

---

