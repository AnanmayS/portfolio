import { CommandPalette, CommandPaletteTrigger } from "./command-palette";
import { ContactForm } from "./contact-form";
import { Currently } from "./currently";
import { DegreeProgress } from "./degree-progress";
import { EmailAction } from "./email-action";
import { Lede } from "./evidence";
import { loadGitHubSnapshot } from "./github-data";
import { SiteHeader } from "./site-header";
import { SkillsHeatmap } from "./skills-heatmap";
import { TerminalMode } from "./terminal-mode";
import { ThemeToggle } from "./theme-toggle";
import { more, person, projects, roles, type Project } from "./content";

import { DailyDelve } from "./demos/dailydelve";
import { ForgeGridSandbox } from "./demos/forgegrid-sandbox";
import { OptionPricing } from "./demos/option-pricing";
import { OrderBook } from "./demos/orderbook";
import { PolymarketSandbox } from "./demos/polymarket";
import { ShowdownReplay } from "./demos/showdown-replay";
import { TapeReplay } from "./demos/tape-replay";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const resumeHref = `${basePath}/resume.pdf`;

/* Which demo a project renders. Keyed so content.ts stays free of React. */
const demos: Record<NonNullable<Project["demo"]>, () => React.ReactElement> = {
  tape: TapeReplay,
  forgegrid: ForgeGridSandbox,
  showdown: ShowdownReplay,
  orderbook: OrderBook,
  options: OptionPricing,
  polymarket: PolymarketSandbox,
  dailydelve: DailyDelve,
};

export default async function Home() {
  const snapshot = await loadGitHubSnapshot();

  return (
    <>
      <SiteHeader resumeHref={resumeHref} />
      <CommandPalette resumeHref={resumeHref} />
      <TerminalMode resumeHref={resumeHref} />

      <main className="shell">
        <header className="hero">
          <h1>{person.name}</h1>
          <p className="hero-meta">
            {person.school} · {person.where.toLowerCase()}
          </p>
          <p className="hero-lead">
            Hey, I&apos;m {person.short}. I build backend and infrastructure
            things. Everything on this page runs, right here, and every number
            on it links to the run it came from.
          </p>
          <nav className="hero-actions" aria-label="Links">
            <a className="action-primary" href={resumeHref} target="_blank">
              résumé (pdf)
            </a>
            <EmailAction label="email" />
            <a href={person.github} rel="noreferrer" target="_blank">
              github
            </a>
            <a href={person.linkedin} rel="noreferrer" target="_blank">
              linkedin
            </a>
            <CommandPaletteTrigger />
            <ThemeToggle />
          </nav>
          <DegreeProgress buildNow={Date.now()} compact />
        </header>

        <Currently snapshot={snapshot} />

        <section className="block" id="work">
          <h2 className="block-title">Work you can run</h2>
          <div className="stack stack-work">
            {projects.map((item) => {
              const Demo = item.demo ? demos[item.demo] : null;

              return (
                <article
                  key={item.slug}
                  className="work"
                  id={`project-${item.slug}`}
                >
                  <div className="work-head">
                    <h3>
                      {item.name}
                      <span className="work-year"> {item.year}</span>
                    </h3>
                    <a
                      className="work-link"
                      href={item.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      repo ↗
                    </a>
                  </div>
                  <p className="work-question">{item.question}</p>
                  <p className="work-lede">
                    <Lede text={item.lede} evidence={item.evidence} />
                  </p>
                  {Demo ? (
                    <div className="work-figure work-demo">
                      <Demo />
                    </div>
                  ) : null}
                  <ul className="work-stack" aria-label="Stack">
                    {item.stack.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <h3 className="more-title">Smaller things</h3>
          <ul className="more">
            {more.map((item) => (
              <li key={item.name}>
                <a href={item.href} rel="noreferrer" target="_blank">
                  {item.name}
                </a>
                <span className="more-what">{item.what}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="block" id="experience">
          <h2 className="block-title">Where I&apos;ve done this for other people</h2>
          <div className="stack">
            {roles.map((role) => (
              <article key={role.company}>
                <div className="role-head">
                  <h3>{role.company}</h3>
                  <span className="role-when">{role.when}</span>
                </div>
                <p className="role-what">
                  {role.title} · {role.where}
                </p>
                <ul className="role-points">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="block" id="skills">
          <h2 className="block-title">What the repos are written in</h2>
          <SkillsHeatmap snapshot={snapshot} />
        </section>

        <section className="close" id="contact">
          <h2>Happy to talk about any of this.</h2>
          <div className="close-actions">
            <EmailAction label={person.email} />
            <ContactForm />
            <a href={person.github} rel="noreferrer" target="_blank">
              github
            </a>
            <a href={person.linkedin} rel="noreferrer" target="_blank">
              linkedin
            </a>
          </div>
          <p className="close-where">
            {person.where} · press <kbd>⌘K</kbd> or type <kbd>~~</kbd>
          </p>
        </section>
      </main>
    </>
  );
}
