/*
  Everything the "Ask about me" model is allowed to know. It answers from
  this and nothing else, so an answer is only ever as good as what is here:
  keep it in step with the résumé (public/resume.pdf) and app/content.ts.
  No phone number, address or anything not already public on the site.
*/
export const PROFILE = `
Name: Ananmay Som Singh. He goes by Ananmay.
Education: Bachelor of Science in Computer Engineering at the University of Maryland, College Park. Expected to graduate in May 2028. Relevant coursework: algorithms, data structures, computer systems, compilers, probability and statistics.
Contact: the "Email me" button on this page, GitHub @AnanmayS (github.com/AnanmayS), LinkedIn (linkedin.com/in/ananmaysingh). His résumé is linked at the top of the page.
Languages he mostly works in: Go, Python and TypeScript. Also: Java, C++, C, JavaScript, SQL, Verilog.
Backend and data: FastAPI, Node.js, PostgreSQL, Redis, Drizzle, SQLAlchemy, Supabase, Zod, WebSockets, concurrency.
Infrastructure and tooling: AWS (S3, ECS, CloudWatch), Terraform, Docker, Linux, GitHub Actions (CI/CD), Vercel, pytest, Vitest.
Frameworks and ML: React, Next.js, PyTorch, LLM extraction and evaluation.
How he describes himself: he likes building software; backend, frontend and the tooling in between; shipping things that work end to end, and measuring that they do.

EXPERIENCE

GSAlpha Labs (real-estate transaction automation), Software Engineering Intern, part-time during the academic year, May 2026 to present, San Francisco, CA.
- Built HomeFlow AI, a Next.js/TypeScript platform in production that files closing packets, drafts offers and tracks deadlines for California real-estate agents.
- Cut purchase-agreement data extraction from 35 minutes of manual entry to under 30 seconds with an LLM pipeline that reached 96% field accuracy on 15 real transactions; a human reviews before filing.
- Shipped an offer workflow that drafts a purchase agreement from a 175-page disclosure packet in under 5 minutes, flagging only conflicting fields.
- Improved document classification from 14 of 27 to 27 of 27 correct on a real closing packet by matching each form's unique footer text.
- Automated contingency deadlines across California business days and holidays, showing the rule behind each date so agents trust it.

theconviction.ai (financial research automation), Software Engineering Intern, May 2025 to August 2025, remote.
- Replaced 12 hours a week of manual data collection with a FastAPI/PostgreSQL pipeline that pulls filings, transcripts and news for 50+ companies.
- Added timeouts, retries and deduplication to handle unreliable sources and overlapping feeds, keeping one clean record per company.
- Shipped a Next.js research tool used daily by 4 analysts that links every finding on a company timeline to its source filing.

SEDS at UMD (SatFab CubeSat GPS team), Software Engineer, September 2024 to February 2026, College Park, MD.
- Built the Python test framework for 26 Verilog modules in a CubeSat GPS receiver; it became the team standard after he trained 6 engineers.
- Cut hardware regression time from 4 hours to 95 minutes by running testbenches in parallel, so it runs before every merge instead of overnight.
- Automated waveform checking and pass/fail reporting so integration bugs were caught in simulation instead of on the hardware.

PROJECTS (all on his GitHub)

Wildebeest (2026; TypeScript, Node.js, Python, PostgreSQL, Redis, Docker; github.com/AnanmayS/wildebeest)
- A distributed pipeline that sorts wildlife camera-trap photos with 2 AI models (one throws out empty photos, the other names the animal) across many machines; 1,000 real photos ran with 0 failures.
- He wrote the scheduler from scratch on Postgres and Redis, with no job-queue library. It lost or double-counted 0 results across 30 injected crashes by reassigning dead workers' tasks, using leases and fencing tokens so a stale worker can't overwrite a newer result.
- Cut worker crash recovery from 5.6 s to 0.16 s by detecting dead workers instantly through Docker events instead of missed check-ins.

Tape (2026; Go, AWS S3, ECS, CloudWatch, Terraform, Docker; github.com/AnanmayS/tape)
- A Go service that records live exchange market-data feeds to S3 and replays them byte for byte, at 2,790 times real time; it sustained 49.8k messages per second in load tests.
- Detected all 3 feed gaps (3,240 lost messages) in fault-injection tests and flagged the affected windows before any backtest runs on them.
- Reduced feed-storage size by a factor of 5.2 using delta-encoded columnar storage.

ShowdownRL (2026; Python, PyTorch, PPO, Optuna, Playwright, Gymnasium; github.com/AnanmayS/ShowdownRL)
- A reinforcement-learning (MaskablePPO) agent for Pokémon Showdown that won 79% of 1,000 simulated battles against a type-aware scripted bot, masking illegal moves.
- A tuning pipeline with Optuna promotes a new model only if it beats the baseline on every metric across multiple test seeds.
- Drives real matches through the browser with Playwright and saves every battle log, so any reported win rate traces back to the games behind it.
`.trim();
