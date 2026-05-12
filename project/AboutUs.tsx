import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * About Us - Landon Robinson Foundation
 *
 * Drop-in Framer code component. Self-contained: no external CSS,
 * no external assets. Paste into a new Code component in Framer,
 * then place on the About page between your existing header & footer.
 */

const NAVY = "#0B1F3A"
const NAVY_DEEP = "#061227"
const GOLD = "#C9A24B"
const GOLD_SOFT = "#E7C97A"
const PAPER = "#F7F4EE"
const INK = "#111418"
const MUTED = "#5B6470"
const LINE = "rgba(11,31,58,0.10)"

const FONT_DISPLAY =
    '"Bebas Neue", "Barlow Condensed", Impact, "Helvetica Neue", Arial, sans-serif'
const FONT_BODY =
    '"Inter", "Barlow", "Helvetica Neue", Arial, system-ui, sans-serif'

type Props = {
    accent?: string
    founderImage?: string
    heroCtaUrl?: string
    heroSecondaryUrl?: string
    announceCtaUrl?: string
    announceSecondaryUrl?: string
}

export default function AboutUs(props: Props) {
    const accent = props.accent || GOLD
    const heroCtaUrl = props.heroCtaUrl || "#donate"
    const heroSecondaryUrl = props.heroSecondaryUrl || "#mission"
    const announceCtaUrl = props.announceCtaUrl || "#donate"
    const announceSecondaryUrl = props.announceSecondaryUrl || "#mission"

    return (
        <div style={S.root}>
            <style>{CSS}</style>

            {/* ============== HERO / INTRO ============== */}
            <section style={S.hero}>
                <div style={S.heroBg} aria-hidden />
                <div style={S.container}>
                    <div style={S.heroInner}>
                        <span style={{ ...S.eyebrow, color: accent }}>
                            <span
                                style={{ ...S.eyebrowDot, background: accent }}
                            />
                            Now Live · Founded April 2026
                        </span>
                        <h1 style={S.heroTitle}>
                            Strong Minds.
                            <br />
                            Strong Bodies.
                            <br />
                            <span style={{ color: accent }}>
                                Stronger Futures.
                            </span>
                        </h1>
                        <p style={S.heroLead}>
                            The Landon Robinson Foundation is a mental health
                            advocacy organization built to confront one of the
                            most urgent challenges facing young people today:
                            youth suicide, and the silent struggles that too
                            often go unseen, unspoken, and unsupported.
                        </p>
                        <div style={S.heroCtas}>
                            <a
                                href={heroCtaUrl}
                                style={{
                                    ...S.btn,
                                    ...S.btnPrimary,
                                    background: accent,
                                    color: NAVY_DEEP,
                                }}
                            >
                                Support the mission →
                            </a>
                            <a
                                href={heroSecondaryUrl}
                                style={{ ...S.btn, ...S.btnGhost }}
                            >
                                Read our mission
                            </a>
                        </div>
                    </div>
                </div>
                <div style={S.heroFade} aria-hidden />
            </section>

            {/* ============== MISSION ============== */}
            <section id="mission" style={S.section}>
                <div style={S.container}>
                    <div data-lrf-grid="mission" style={S.missionGrid}>
                        <div>
                            <div
                                style={{
                                    ...S.eyebrow,
                                    color: NAVY,
                                }}
                            >
                                <span
                                    style={{
                                        ...S.eyebrowDot,
                                        background: NAVY,
                                    }}
                                />
                                Our Mission
                            </div>
                            <h2 style={S.h2}>
                                Awareness, education, and real support for
                                the young people who need it most.
                            </h2>
                        </div>
                        <div>
                            <p style={S.body}>
                                Founded in April 2026 by NFL defensive tackle
                                Landon Robinson, the foundation exists to
                                raise awareness, expand education, and provide
                                practical, research-informed support that
                                helps young people build resilience and move
                                toward healthier, stronger futures.
                            </p>
                            <p style={S.body}>
                                We believe mental health belongs in every
                                conversation, at home, in the locker room, in
                                the classroom, and on the field. Our work is
                                built to break the silence and replace it with
                                real tools, real training, and real support
                                systems.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============== THREE PILLARS ============== */}
            <section style={{ ...S.section, background: PAPER }}>
                <div style={S.container}>
                    <div style={S.sectionHead}>
                        <div
                            style={{
                                ...S.eyebrow,
                                color: NAVY,
                            }}
                        >
                            <span
                                style={{
                                    ...S.eyebrowDot,
                                    background: NAVY,
                                }}
                            />
                            Our Three Priorities
                        </div>
                        <h2 style={S.h2}>
                            How the foundation creates measurable impact.
                        </h2>
                    </div>

                    <div data-lrf-grid="pillars" style={S.pillarsGrid}>
                        <Pillar
                            num="01"
                            accent={accent}
                            title="Research & Awareness"
                            body="We promote evidence-based research to strengthen our understanding of youth suicide and support more effective prevention efforts, because what we measure, we can move."
                            icon={
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                </svg>
                            }
                        />
                        <Pillar
                            num="02"
                            accent={accent}
                            title="Youth Empowerment"
                            body="We equip young people, families, and communities with education and training that encourage honest conversations about mental health and help break the silence surrounding emotional distress."
                            icon={
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        />
                        <Pillar
                            num="03"
                            accent={accent}
                            title="Movement-Focused Programs"
                            body="We incorporate physical activity as a protective tool, reducing depression, strengthening well-being, and giving young people constructive outlets for stress, struggle, and recovery."
                            icon={
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M13 2L3 14h7v8l10-12h-7z" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </section>

            {/* ============== FOUNDER ============== */}
            <section style={{ ...S.section, background: NAVY, color: "#fff" }}>
                <div style={S.container}>
                    <div data-lrf-grid="founder" style={S.founderGrid}>
                        <div style={S.founderCard}>
                            <div
                                style={{
                                    ...S.founderPortrait,
                                    ...(props.founderImage
                                        ? {
                                              backgroundImage: `url(${props.founderImage})`,
                                              backgroundSize: "cover",
                                              backgroundPosition: "center top",
                                          }
                                        : {
                                              background:
                                                  "linear-gradient(160deg, #1b3358 0%, #061227 100%)",
                                          }),
                                }}
                            >
                                {!props.founderImage && (
                                    <div style={S.jersey}>
                                        <span style={S.jerseyLabel}>
                                            DEFENSIVE TACKLE
                                        </span>
                                        <span
                                            style={{
                                                ...S.jerseyNumber,
                                                color: accent,
                                            }}
                                        >
                                            LR
                                        </span>
                                        <span style={S.jerseyName}>
                                            ROBINSON
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={S.founderMeta}>
                                <div style={S.metaRow}>
                                    <span style={S.metaLabel}>College</span>
                                    <span style={S.metaValue}>
                                        U.S. Naval Academy
                                    </span>
                                </div>
                                <div style={S.metaRow}>
                                    <span style={S.metaLabel}>Honors</span>
                                    <span style={S.metaValue}>
                                        First-Team All-American
                                    </span>
                                </div>
                                <div style={S.metaRow}>
                                    <span style={S.metaLabel}>
                                        Conference
                                    </span>
                                    <span style={S.metaValue}>
                                        AAC Defensive Player of the Year
                                    </span>
                                </div>
                                <div
                                    style={{
                                        ...S.metaRow,
                                        borderBottom: "none",
                                    }}
                                >
                                    <span style={S.metaLabel}>Drafted</span>
                                    <span style={S.metaValue}>
                                        Cincinnati Bengals · 2026 · #226 (Pat
                                        Tillman pick)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    ...S.eyebrow,
                                    color: accent,
                                }}
                            >
                                <span
                                    style={{
                                        ...S.eyebrowDot,
                                        background: accent,
                                    }}
                                />
                                The Founder
                            </div>
                            <h2 style={{ ...S.h2, color: "#fff" }}>
                                A platform with{" "}
                                <span style={{ color: accent }}>purpose</span>.
                            </h2>
                            <p style={{ ...S.body, color: "rgba(255,255,255,0.82)" }}>
                                Before entering the NFL, Landon Robinson stood
                                out as a defensive tackle at the United States
                                Naval Academy, where he earned recognition as
                                a first-team All-American and American
                                Athletic Conference Defensive Player of the
                                Year.
                            </p>
                            <p style={{ ...S.body, color: "rgba(255,255,255,0.82)" }}>
                                He was selected by the Cincinnati Bengals with
                                the 226th overall pick in the 2026 NFL Draft,
                                announced in connection with the Pat Tillman
                                tradition that honors service, character, and
                                conviction.
                            </p>
                            <p style={{ ...S.body, color: "rgba(255,255,255,0.82)" }}>
                                As both an athlete and an advocate, Robinson
                                is using this new chapter of his career to
                                bring greater visibility to youth mental
                                health and help create support systems that
                                make a measurable difference.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============== ANNOUNCEMENT ============== */}
            <section style={{ ...S.section, paddingTop: 96, paddingBottom: 96 }}>
                <div style={S.container}>
                    <div
                        style={{
                            ...S.announce,
                            borderColor: LINE,
                        }}
                    >
                        <div
                            style={{
                                ...S.announceBadge,
                                background: accent,
                                color: NAVY_DEEP,
                            }}
                        >
                            Official Announcement
                        </div>
                        <h2 style={S.announceTitle}>
                            The Landon Robinson Foundation is now live.
                        </h2>
                        <p style={S.announceBody}>
                            Built on the message{" "}
                            <strong style={{ color: NAVY }}>
                                Strong Minds. Strong Bodies. Stronger Futures.
                            </strong>{" "}
                            the foundation is dedicated to increasing
                            awareness of youth suicide, expanding mental
                            health education, and advancing movement-based
                            programs that support resilience, well-being, and
                            hope for young people and the communities that
                            surround them.
                        </p>
                        <div style={S.announceCtas}>
                            <a
                                href={announceCtaUrl}
                                style={{
                                    ...S.btn,
                                    ...S.btnPrimary,
                                    background: NAVY,
                                    color: "#fff",
                                }}
                            >
                                Support the mission →
                            </a>
                            <a
                                href={announceSecondaryUrl}
                                style={{
                                    ...S.btn,
                                    ...S.btnGhost,
                                    color: NAVY,
                                    borderColor: NAVY,
                                }}
                            >
                                Get involved
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function Pillar(props: {
    num: string
    title: string
    body: string
    accent: string
    icon: React.ReactNode
}) {
    return (
        <article style={S.pillarCard}>
            <div style={{ ...S.pillarNum, color: props.accent }}>
                {props.num}
            </div>
            <div style={{ ...S.pillarIcon, color: NAVY }}>{props.icon}</div>
            <h3 style={S.pillarTitle}>{props.title}</h3>
            <p style={S.pillarBody}>{props.body}</p>
        </article>
    )
}

/* =================== STYLES =================== */

const S: Record<string, React.CSSProperties> = {
    root: {
        width: "100%",
        background: "#fff",
        color: INK,
        fontFamily: FONT_BODY,
        WebkitFontSmoothing: "antialiased",
        lineHeight: 1.55,
    },
    container: {
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 28px",
        boxSizing: "border-box",
    },

    /* Hero */
    hero: {
        position: "relative",
        background:
            "radial-gradient(1200px 600px at 80% -10%, rgba(201,162,75,0.18), transparent 60%), linear-gradient(180deg, #061227 0%, #0B1F3A 100%)",
        color: "#fff",
        overflow: "hidden",
        padding: "120px 0 110px",
    },
    heroBg: {
        position: "absolute",
        inset: 0,
        backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        opacity: 0.55,
        pointerEvents: "none",
    },
    heroFade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,1) 100%)",
        pointerEvents: "none",
    },
    heroInner: {
        position: "relative",
        zIndex: 1,
        maxWidth: 820,
    },
    heroTitle: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: "clamp(48px, 7.4vw, 104px)",
        lineHeight: 0.95,
        letterSpacing: "0.01em",
        margin: "18px 0 24px",
        textTransform: "uppercase",
    },
    heroLead: {
        fontSize: "clamp(17px, 1.4vw, 20px)",
        color: "rgba(255,255,255,0.82)",
        maxWidth: 680,
        margin: "0 0 32px",
    },
    heroCtas: {
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
    },

    /* Sections */
    section: {
        padding: "104px 0",
        background: "#fff",
    },
    sectionHead: {
        maxWidth: 760,
        marginBottom: 56,
    },
    h2: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: "clamp(34px, 4.2vw, 56px)",
        lineHeight: 1.02,
        letterSpacing: "0.005em",
        margin: "14px 0 0",
        textTransform: "uppercase",
        color: NAVY,
    },
    body: {
        fontSize: 17,
        lineHeight: 1.7,
        color: MUTED,
        margin: "0 0 18px",
    },

    eyebrow: {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
    },
    eyebrowDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        display: "inline-block",
    },

    /* Mission */
    missionGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        alignItems: "start",
    },

    /* Pillars */
    pillarsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
    },
    pillarCard: {
        position: "relative",
        background: "#fff",
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        padding: "36px 32px 32px",
        overflow: "hidden",
    },
    pillarNum: {
        fontFamily: FONT_DISPLAY,
        fontSize: 56,
        lineHeight: 1,
        letterSpacing: "0.02em",
        marginBottom: 12,
    },
    pillarIcon: {
        marginBottom: 14,
    },
    pillarTitle: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: 26,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        color: NAVY,
        margin: "0 0 10px",
    },
    pillarBody: {
        fontSize: 15.5,
        lineHeight: 1.65,
        color: MUTED,
        margin: 0,
    },

    /* Founder */
    founderGrid: {
        display: "grid",
        gridTemplateColumns: "0.85fr 1fr",
        gap: 64,
        alignItems: "center",
    },
    founderCard: {
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
    },
    founderPortrait: {
        aspectRatio: "4 / 5",
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    jersey: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
    },
    jerseyLabel: {
        fontFamily: FONT_BODY,
        fontSize: 11,
        letterSpacing: "0.32em",
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
    },
    jerseyNumber: {
        fontFamily: FONT_DISPLAY,
        fontSize: 180,
        lineHeight: 1,
        letterSpacing: "0.04em",
    },
    jerseyName: {
        fontFamily: FONT_DISPLAY,
        fontSize: 28,
        letterSpacing: "0.24em",
        color: "#fff",
        textTransform: "uppercase",
    },
    founderMeta: {
        padding: "20px 24px 22px",
    },
    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        fontSize: 14,
    },
    metaLabel: {
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontSize: 11,
        fontWeight: 700,
    },
    metaValue: {
        color: "#fff",
        textAlign: "right",
        fontWeight: 600,
    },

    /* Announcement */
    announce: {
        position: "relative",
        background: PAPER,
        border: `1px solid ${LINE}`,
        borderRadius: 22,
        padding: "48px 56px 52px",
        textAlign: "center",
        maxWidth: 900,
        margin: "0 auto",
    },
    announceBadge: {
        display: "inline-block",
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        padding: "8px 14px",
        borderRadius: 999,
        marginBottom: 20,
    },
    announceTitle: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: "clamp(28px, 3.4vw, 44px)",
        lineHeight: 1.05,
        margin: "0 0 18px",
        textTransform: "uppercase",
        color: NAVY,
    },
    announceBody: {
        fontSize: 17,
        lineHeight: 1.7,
        color: MUTED,
        margin: "0 auto 28px",
        maxWidth: 680,
    },
    announceCtas: {
        display: "flex",
        gap: 12,
        justifyContent: "center",
        flexWrap: "wrap",
    },

    /* Buttons */
    btn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 22px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textDecoration: "none",
        border: "1px solid transparent",
        transition: "transform 0.15s ease, opacity 0.15s ease",
        cursor: "pointer",
    },
    btnPrimary: {},
    btnGhost: {
        background: "transparent",
        color: "#fff",
        borderColor: "rgba(255,255,255,0.35)",
    },
}

const CSS = `
@media (max-width: 900px) {
  .lrf-hide-mobile { display: none !important; }
}
@media (max-width: 860px) {
  [data-lrf-grid="mission"],
  [data-lrf-grid="pillars"],
  [data-lrf-grid="founder"] {
    grid-template-columns: 1fr !important;
    gap: 28px !important;
  }
}
`

/* =================== FRAMER CONTROLS =================== */

addPropertyControls(AboutUs, {
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: GOLD,
    },
    founderImage: {
        type: ControlType.Image,
        title: "Founder Photo",
    },
    heroCtaUrl: {
        type: ControlType.Link,
        title: "Hero: Primary Button",
        defaultValue: "#donate",
    },
    heroSecondaryUrl: {
        type: ControlType.Link,
        title: "Hero: Secondary Button",
        defaultValue: "#mission",
    },
    announceCtaUrl: {
        type: ControlType.Link,
        title: "Announce: Primary Button",
        defaultValue: "#donate",
    },
    announceSecondaryUrl: {
        type: ControlType.Link,
        title: "Announce: Secondary Button",
        defaultValue: "#mission",
    },
})
</content>
</invoke>