import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Brain,
  GraduationCap,
  Mail,
  HeartHandshake,
  Lock,
  ChevronRight,
  Home,
  Palette,
} from "lucide-react";
import { GROWVA_BRAND, GROWVA_BRAND_URL } from "@/utils/siteLinks";

export const metadata: Metadata = {
  title: "About Growva Junior | Executive Mission & Cognitive Architecture",
  description:
    "Growva Junior is an educational research and digital product ecosystem engineered for children aged 1 to 9, backed by Growva Business. Commercial-free, sensory-friendly, and neurodiverse.",
};

const STRATEGIC_PILLARS = [
  {
    icon: Lock,
    title: "100% Commercial-Free Integrity",
    subtitle: "Absolute Data Privacy & COPPA Compliance",
    description:
      "We operate under an uncompromising privacy doctrine: zero third-party behavioral trackers, zero behavioral profiling, and strict adherence to COPPA and global child-safety frameworks. Children are our students, never our product.",
    highlights: [
      "Zero third-party advertising or commercial pop-ups",
      "No programmatic data sales or user tracking",
      "Child-first encrypted and sandboxed session design",
    ],
  },
  {
    icon: Brain,
    title: "Sensory-Friendly & Neurodiverse Design",
    subtitle: "Inclusive Accessibility for ASD & Speech Delays",
    description:
      "Engineered from the ground up for both neurotypical learners and children with autism spectrum conditions (ASD), sensory sensitivities, and speech delays. Every audio cue, visual contrast, and animation rate respects pediatric sensory thresholds.",
    highlights: [
      "PECS communication cards and non-verbal routines",
      "Calm, measured audio cadences with zero screeching alarms",
      "Reduced-motion compliance and gentle celebration feedback",
    ],
  },
  {
    icon: Palette,
    title: "The Creative Wing — Growva Junior Studio",
    subtitle: "High-Production Character Storytelling",
    description:
      "Growva Junior Studio develops cinematic 3D and 2D moral narratives, speech-therapy phonics animations, and physical paper-craft curricula. We bridge digital engagement with tangible, real-world parent-child bonding.",
    highlights: [
      "Rich moral bedtime cinema with sleep-optimized pacing",
      "3D alphabet phonics mapped to phonetic speech therapy",
      "Printable offline STEM, logic, and ink-saver worksheets",
    ],
  },
];

const ROADMAP_PHASES = [
  {
    phase: "Phase 1: Foundation (Current)",
    period: "2026 Q1–Q2",
    status: "Active Deployment",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    milestones: [
      "50+ interactive phonics engines with phonetic speech mapping",
      "100+ printable science, logic, and early math worksheets",
      "Growva Junior Studio YouTube series and bedtime video shelf",
      "3D sensory mart game and tactile coin learning simulator",
    ],
  },
  {
    phase: "Phase 2: Global Accessibility",
    period: "2026 Q3–Q4",
    status: "In Development",
    statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    milestones: [
      "Multi-language localization (Spanish, Arabic, Urdu, French)",
      "Adaptive early-reading phonetic assessment engine",
      "Clinical speech-pathology reporting tools for therapists",
      "Offline native mobile application suites for iOS and Android",
    ],
  },
  {
    phase: "Phase 3: Institutional Scale",
    period: "2027",
    status: "Strategic Vision",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    milestones: [
      "Accredited preschool & kindergarten classroom kits",
      "Public school district and neurodivergent clinic partnerships",
      "Open-access digital literacy endowments for underserved communities",
      "Peer-reviewed longitudinal research on screen-calm early learning",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 py-4 text-slate-800 sm:space-y-20 sm:py-8">
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Home className="h-3.5 w-3.5" aria-hidden />
          <span>Home</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Corporate &amp; Academic Overview
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO: EXECUTIVE MISSION                                                */}
      {/* ========================================================================= */}
      <header className="relative space-y-6 text-center sm:space-y-8 sm:py-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-800 shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
          <span>THE GROWVA JUNIOR INITIATIVE</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
          Architecting the Future of{" "}
          <span className="bg-gradient-to-r from-indigo-700 via-purple-700 to-amber-600 bg-clip-text text-transparent">
            Early Cognitive Learning
          </span>
          .
        </h1>

        <p className="mx-auto max-w-3xl text-lg font-normal leading-relaxed text-slate-600 sm:text-xl">
          Growva Junior is an educational research and digital product ecosystem
          engineered for children aged 1 to 9. We replace addictive digital junk
          food with calm, sensory-friendly logic, speech phonics, and
          character-driven storytelling.
        </p>

        {/* High-Trust Executive Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            Designed for Ages 1 to 9
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Lock className="h-4 w-4 text-emerald-600" />
            100% Commercial-Free (Zero Ads)
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Brain className="h-4 w-4 text-purple-600" />
            ASD &amp; Speech-Therapy Calibrated
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Building2 className="h-4 w-4 text-amber-600" />
            Backed by Growva Business
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THE PROBLEM WE SOLVE: THE SCREEN-TIME CRISIS                           */}
      {/* ========================================================================= */}
      <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-amber-700">
            Systemic Pedagogical Challenge
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            The Screen-Time Crisis &amp; The Growva Standard
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Modern mobile app storefronts have turned early childhood screen time
            into a dopamine extraction mechanism. Rapid flashing visuals,
            in-app monetization traps, and loud advertisements dysregulate young
            nervous systems. We engineered the exact opposite.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Industry Standard Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/40 to-white p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <XCircle className="h-5 w-5" />
                <span className="text-sm uppercase tracking-wider">
                  The Industry Standard (Digital Junk Food)
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-rose-900/80 sm:text-sm">
                Optimized for session-length metrics, ad impressions, and compulsive repetition.
              </p>
              <ul className="space-y-3 pt-2 text-xs font-medium text-slate-700 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>
                    <strong>Hyper-Stimulating Loops:</strong> Flashing colors and chaotic audio designed to artificially sustain toddler attention.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>
                    <strong>Third-Party Commercials:</strong> Unregulated marketing and predatory micro-transactions interrupting learning.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>
                    <strong>Sensory Overload:</strong> Agitating children with sensory sensitivities, non-verbal learners, and kids with ASD.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>
                    <strong>Passive Consumption:</strong> Brain-drain scrolling without clinical articulation or speech-practice outcomes.
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 rounded-xl border border-rose-200/60 bg-white/80 p-3 text-xs font-semibold text-rose-700">
              Outcome: Emotional dysregulation, sensory agitation, and cognitive fatigue.
            </div>
          </div>

          {/* The Growva Standard Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm uppercase tracking-wider">
                  The Growva Standard (Calm Architecture)
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-emerald-950/80 sm:text-sm">
                Engineered for natural cognitive wind-down, neurodiverse inclusion, and measurable mastery.
              </p>
              <ul className="space-y-3 pt-2 text-xs font-medium text-slate-700 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>
                    <strong>Measured Pediatric Pacing:</strong> Slow 0.75x bedtime speech rates, quiet transitions, and soft celebratory sounds.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>
                    <strong>100% Commercial-Free Sanctuary:</strong> No banner ads, no programmatic video interruptions, and strict COPPA privacy.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>
                    <strong>Neurodiverse Inclusivity:</strong> PECS visual cards, tactile 3D simulations, and gentle audio tailored for speech delays.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>
                    <strong>Phonetic Articulation Practice:</strong> Interactive voice engines encouraging kids to speak aloud with zero harsh failure states.
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 rounded-xl border border-emerald-200/80 bg-white/80 p-3 text-xs font-semibold text-emerald-800">
              Outcome: Calm emotional state, speech confidence, and structured cognitive milestones.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LEADERSHIP & FOUNDER'S VISION (BACKED BY GROWVA BUSINESS)              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl sm:p-12">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/60 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/60 text-indigo-300 ring-1 ring-white/10">
                <Building2 className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  Institutional Governance
                </p>
                <h2 className="text-xl font-black text-white sm:text-2xl">
                  A Message from the Leadership at Growva Business
                </h2>
              </div>
            </div>

            <a
              href={GROWVA_BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>{GROWVA_BRAND}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>

          <blockquote className="space-y-4 text-base font-normal leading-relaxed text-indigo-100 sm:text-lg sm:leading-loose">
            <p className="italic">
              &ldquo;At Growva Business, we believe technology should empower human
              potential, not exploit attention spans. Growva Junior was created from
              a simple yet non-negotiable belief: children deserve digital tools
              designed with emotional intelligence, clinical safety, and long-term
              cognitive respect. We are not building a game studio; we are building an
              enduring early-learning infrastructure that parents trust and children
              cherish.&rdquo;
            </p>
            <footer className="pt-2">
              <p className="text-sm font-bold text-white">
                — Leadership Team, Growva Business
              </p>
              <p className="text-xs text-indigo-300">
                Parent Entity &amp; Strategic Oversight for Growva Junior
              </p>
            </footer>
          </blockquote>
        </div>

        {/* Subtle decorative background watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"
        />
      </section>

      {/* ========================================================================= */}
      {/* 4. STRATEGIC PILLARS (FOR PARENTS, EDUCATORS & DONORS)                    */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
            Core Architectural Principles
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Strategic Pillars for Educators, Parents &amp; Partners
          </h2>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Every feature shipped across Growva Junior maps directly to one of our
            three non-negotiable operational pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STRATEGIC_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={`pillar-${idx}`}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600">
                      {pillar.subtitle}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    {pillar.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FUTURE ROADMAP & GROWTH VISION (2026–2027)                             */}
      {/* ========================================================================= */}
      <section className="space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-6 shadow-sm sm:p-10">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-purple-700">
            Multi-Year Roadmap
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            2026–2027 Strategic Milestones &amp; Expansion Vision
          </h2>
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            Growva Junior is scaling from our core interactive PWA into a global,
            evidence-backed cognitive learning network for homes and classrooms.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ROADMAP_PHASES.map((phase, idx) => (
            <div
              key={`phase-${idx}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
                    {phase.period}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${phase.statusColor}`}
                  >
                    {phase.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 sm:text-lg">
                  {phase.phase}
                </h3>
                <ul className="space-y-2.5 pt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {phase.milestones.map((milestone, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2">
                      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BRAND PARTNERSHIPS, SPONSORSHIPS & CSR INQUIRIES                      */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-amber-50/50 p-8 shadow-md sm:p-12">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <HeartHandshake className="h-7 w-7" aria-hidden />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
              Institutional Collaborations
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Brand Partnerships, Sponsorships &amp; CSR Inquiries
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              We collaborate with mission-aligned organizations, educational
              foundations, corporate CSR initiatives, and academic researchers
              who share our commitment to ethical, commercial-free early learning.
            </p>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <a
              href="mailto:partnerships@growvajunior.com"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:translate-y-0.5 sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              <span>partnerships@growvajunior.com</span>
            </a>

            <a
              href="mailto:corporate@growvabusiness.com"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:translate-y-0.5 sm:w-auto"
            >
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>corporate@growvabusiness.com</span>
            </a>
          </div>

          <p className="text-xs text-slate-600">
            For grant proposals, school district licensing, and academic research access, please include institutional credentials.
          </p>
        </div>
      </section>
    </div>
  );
}
