import { useEffect, useRef } from "react"

// ─── CSS ───────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@keyframes scrapbook-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.3334%); }
}
@keyframes scrapbook-scroll-rev {
  from { transform: translateX(-33.3334%); }
  to   { transform: translateX(0); }
}
@keyframes sb-ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.sb-strip     { animation: scrapbook-scroll 28s linear infinite; }
.sb-strip-rev { animation: scrapbook-scroll-rev 34s linear infinite; }
.sb-strip:hover, .sb-strip-rev:hover { animation-play-state: paused; }
.sb-ticker    { animation: sb-ticker 28s linear infinite; }
`

// ─── Data ──────────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: "./photos/cruise_selfie.jpg",     caption: "Island vibes — cruise excursion stop",   idx: "01" },
  { src: "./photos/espresso_martinis.jpg", caption: "Espresso martinis on the ship",           idx: "02" },
  { src: "./photos/beach_bar.jpg",         caption: "Beach bar afternoon",                     idx: "03" },
  { src: "./photos/resort_pose.jpg",       caption: "Golden hour at the resort",               idx: "04" },
  { src: "./photos/toy_shopping.jpg",      caption: "Little shopper",                          idx: "05" },
  { src: "./photos/playground.jpg",        caption: "She owns every room she walks into",      idx: "06" },
]

const TICKER_TEXT =
  "ISLAND VIBES · CRUISE LIFE · BEACH BAR · GOLDEN HOUR · LITTLE SHOPPER · OUR GIRL · "

const P = {
  cream:      "#F5EFE6",
  sand:       "#D9C5A0",
  terracotta: "#C1673A",
  espresso:   "#2C1A0E",
  dark:       "#1A0F07",
  mid:        "#3D2314",
}

const PH_GRADIENTS = [
  `135deg, #C1673A 0%, #D9C5A0 100%`,
  `135deg, #7A3219 0%, #C1673A 100%`,
  `135deg, #D9C5A0 0%, #C1673A 80%`,
  `135deg, #C1673A 20%, #2C1A0E 100%`,
  `135deg, #3D2314 0%, #C1673A 65%`,
  `135deg, #C1673A 0%, #F5EFE6 100%`,
]

const SECTION_BG = [P.espresso, P.mid, "#231208", P.espresso, P.mid, "#231208"]

// ─── Utility ───────────────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement("script")
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
}

// ─── BannerCard ────────────────────────────────────────────────────────────────
function BannerCard({ photo }) {
  return (
    <div style={{
      flexShrink: 0,
      width: "clamp(160px, 18vw, 240px)",
      height: "clamp(200px, 22vw, 290px)",
      borderRadius: "6px",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(217,197,160,0.07)",
    }}>
      <img src={photo.src} alt={photo.caption}
        onError={(e) => {
          e.currentTarget.style.display = "none"
          const ph = e.currentTarget.parentElement?.querySelector("[data-phb]")
          if (ph) ph.style.display = "flex"
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div data-phb="true" style={{
        display: "none", position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${P.terracotta} 0%, ${P.espresso} 100%)`,
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'DM Mono', monospace", color: "rgba(245,239,230,0.25)", fontSize: "0.6rem", letterSpacing: "0.3em" }}>
          {photo.idx}
        </span>
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(26,15,7,0.8) 0%, transparent 55%)",
        display: "flex", alignItems: "flex-end", padding: "0.75rem", pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Cormorant Galatia', serif", fontSize: "0.75rem",
          fontStyle: "italic", color: P.sand, margin: 0, lineHeight: 1.3, opacity: 0.85,
        }}>{photo.caption}</p>
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ScrapbookPage() {
  const progressBarRef       = useRef(null)
  const bannerRef            = useRef(null)
  const bannerHeadRef        = useRef(null)
  const videoSectionRef      = useRef(null)
  const videoRef             = useRef(null)
  const videoProgressLineRef = useRef(null)
  const counterNumRef        = useRef(null)

  // Per-card refs
  const cardRefs       = useRef([])
  const imgRefs        = useRef([])
  const revealRefs     = useRef([])   // overlay that wipes away to reveal photo
  const captionRefs    = useRef([])
  const sweepLineRefs  = useRef([])   // terracotta rule that grows

  useEffect(() => {
    if (!document.getElementById("sb-global-css")) {
      const style = document.createElement("style")
      style.id = "sb-global-css"
      style.textContent = GLOBAL_CSS
      document.head.appendChild(style)
    }

    const fontLink = document.createElement("link")
    fontLink.rel = "stylesheet"
    fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Galatia:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap"
    if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink)

    let killAll = () => {}

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"))
      .then(() => {
        const gsap = window.gsap
        const ScrollTrigger = window.ScrollTrigger
        if (!gsap || !ScrollTrigger) return
        gsap.registerPlugin(ScrollTrigger)

        // ── 0. Video scrub ──────────────────────────────────────────────────
        const vid = videoRef.current
        if (vid && videoSectionRef.current) {
          vid.pause()
          vid.currentTime = 0
          vid.preload = "auto"

          let pendingTime = null
          let rafId = null
          const seekTo = (t) => {
            pendingTime = t
            if (!rafId) {
              rafId = requestAnimationFrame(() => {
                rafId = null
                if (pendingTime !== null && Math.abs(vid.currentTime - pendingTime) > 0.01) {
                  vid.currentTime = pendingTime
                }
                pendingTime = null
              })
            }
          }

          const setupScrub = () => {
            ScrollTrigger.create({
              trigger: videoSectionRef.current,
              start: "top top",
              end: "+=300%",
              pin: true,
              pinSpacing: true,
              scrub: 0.5,
              onUpdate: (self) => {
                if (vid.duration) seekTo(self.progress * vid.duration)
              },
            })

            if (videoProgressLineRef.current) {
              gsap.fromTo(videoProgressLineRef.current,
                { scaleX: 0 },
                { scaleX: 1, ease: "none", scrollTrigger: { trigger: videoSectionRef.current, start: "top top", end: "+=300%", scrub: true } }
              )
            }
          }

          if (vid.readyState >= 1) setupScrub()
          else vid.addEventListener("loadedmetadata", setupScrub, { once: true })
        }

        // ── 1. Page progress bar ─────────────────────────────────────────────
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            scaleX: 1, ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 },
          })
        }

        // ── 2. Banner heading sweep ──────────────────────────────────────────
        if (bannerHeadRef.current) {
          gsap.fromTo(bannerHeadRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: "power3.out",
              scrollTrigger: { trigger: bannerHeadRef.current, start: "top 90%", end: "top 50%", scrub: 1 } }
          )
        }

        // ── 3. 3D banner entrance ────────────────────────────────────────────
        if (bannerRef.current) {
          gsap.fromTo(bannerRef.current,
            { rotateX: 30, opacity: 0, y: 60 },
            { rotateX: 0, opacity: 1, y: 0, ease: "power3.out",
              scrollTrigger: { trigger: bannerRef.current, start: "top 85%", end: "top 30%", scrub: 1.2 } }
          )
        }

        // ── 4. Photo cards ───────────────────────────────────────────────────
        cardRefs.current.forEach((card, i) => {
          if (!card) return
          const isLeft = i % 2 === 0

          // Card slide-in
          gsap.fromTo(card,
            { x: isLeft ? -80 : 80, opacity: 0 },
            { x: 0, opacity: 1, ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 90%", end: "top 40%", scrub: 1 } }
          )

          // Image wipe reveal — overlay slides away to the right
          const reveal = revealRefs.current[i]
          if (reveal) {
            gsap.fromTo(reveal,
              { scaleX: 1 },
              { scaleX: 0, ease: "power2.inOut",
                scrollTrigger: { trigger: card, start: "top 80%", end: "top 25%", scrub: 1 } }
            )
          }

          // Parallax on inner image
          const img = imgRefs.current[i]
          if (img) {
            gsap.fromTo(img,
              { yPercent: -12 },
              { yPercent: 12, ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } }
            )
          }

          // Caption stagger
          const caption = captionRefs.current[i]
          if (caption) {
            gsap.fromTo(caption,
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, ease: "power2.out",
                scrollTrigger: { trigger: card, start: "top 70%", end: "top 30%", scrub: 1 } }
            )
          }

          // Terracotta sweep line grows from left
          const sweep = sweepLineRefs.current[i]
          if (sweep) {
            gsap.fromTo(sweep,
              { scaleX: 0 },
              { scaleX: 1, ease: "power2.inOut",
                scrollTrigger: { trigger: card, start: "top 60%", end: "top 20%", scrub: 1 } }
            )
          }

          // Photo counter update
          if (counterNumRef.current) {
            ScrollTrigger.create({
              trigger: card,
              start: "top 60%",
              onEnter: () => {
                if (counterNumRef.current) {
                  gsap.to(counterNumRef.current, { opacity: 0, duration: 0.15, onComplete: () => {
                    if (counterNumRef.current) counterNumRef.current.textContent = PHOTOS[i].idx
                    gsap.to(counterNumRef.current, { opacity: 1, duration: 0.15 })
                  }})
                }
              },
              onEnterBack: () => {
                if (counterNumRef.current) {
                  gsap.to(counterNumRef.current, { opacity: 0, duration: 0.15, onComplete: () => {
                    if (counterNumRef.current) counterNumRef.current.textContent = PHOTOS[i].idx
                    gsap.to(counterNumRef.current, { opacity: 1, duration: 0.15 })
                  }})
                }
              },
            })
          }
        })

        killAll = () => ScrollTrigger.getAll().forEach((t) => t.kill())
      })
      .catch((err) => console.error("[Scrapbook] GSAP load failed:", err))

    return () => killAll()
  }, [])

  const handleImgError = (e) => {
    e.currentTarget.style.display = "none"
    const ph = e.currentTarget.parentElement?.querySelector("[data-placeholder]")
    if (ph) ph.style.display = "flex"
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: P.espresso, overflowX: "hidden", color: P.cream }}>

      {/* ── Global progress bar ── */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: "2px", background: "rgba(0,0,0,0.25)", zIndex: 9999 }}>
        <div ref={progressBarRef} style={{
          height: "100%",
          background: `linear-gradient(90deg, ${P.terracotta} 0%, ${P.sand} 100%)`,
          transformOrigin: "left center", transform: "scaleX(0)", willChange: "transform",
        }} />
      </div>

      {/* ── Fixed photo counter ── */}
      <div aria-hidden="true" style={{
        position: "fixed", bottom: "2rem", right: "2.25rem", zIndex: 200,
        display: "flex", alignItems: "center", gap: "0.5rem",
        fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em",
        color: P.sand, opacity: 0.5, pointerEvents: "none",
      }}>
        <span ref={counterNumRef} style={{ color: P.terracotta, fontWeight: 400 }}>01</span>
        <span style={{ opacity: 0.4 }}>───</span>
        <span>{String(PHOTOS.length).padStart(2, "0")}</span>
      </div>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  VIDEO SCRUB                                         ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section ref={videoSectionRef} style={{ height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
        <video ref={videoRef} src="./video/scene_keyframed.mp4" muted playsInline preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Film grain */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px", mixBlendMode: "overlay", pointerEvents: "none", opacity: 0.6,
        }} />

        {/* Bottom fade */}
        <div aria-hidden="true" style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to bottom, transparent, #000)", pointerEvents: "none",
        }} />

        {/* Top-right metadata */}
        <div style={{
          position: "absolute", top: "2.25rem", right: "2.5rem",
          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
          color: "rgba(245,239,230,0.3)", letterSpacing: "0.15em",
          pointerEvents: "none", textAlign: "right", lineHeight: 1.8,
        }}>
          <div>2024</div>
          <div style={{ color: "rgba(245,239,230,0.15)" }}>REC ●</div>
        </div>

        {/* Title — bottom left, always visible */}
        <div style={{
          position: "absolute",
          bottom: "clamp(3rem, 8vh, 6rem)",
          left: "clamp(2rem, 6vw, 5rem)",
          pointerEvents: "none",
        }}>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            color: "rgba(245,239,230,0.45)",
            fontSize: "0.58rem", letterSpacing: "0.4em",
            textTransform: "uppercase", margin: "0 0 1rem",
          }}>
            A · family · story
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Galatia', serif",
            fontSize: "clamp(4rem, 12vw, 11rem)",
            fontWeight: 300, color: "#fff",
            textTransform: "uppercase", letterSpacing: "0.06em",
            margin: 0, lineHeight: 0.9,
            textShadow: "0 4px 80px rgba(0,0,0,0.7)",
          }}>
            Our Story
          </h1>
          <div style={{
            marginTop: "1.25rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{ width: "32px", height: "1px", background: P.terracotta, opacity: 0.7 }} />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: "0.58rem",
              color: "rgba(245,239,230,0.35)", letterSpacing: "0.3em",
            }}>SCROLL TO EXPLORE</span>
          </div>
        </div>

        {/* Black progress bar — top edge */}
        <div ref={videoProgressLineRef} style={{
          position: "absolute", top: 0, left: 0,
          height: "3px", width: "100%", background: "#000",
          transformOrigin: "left center", transform: "scaleX(0)",
          willChange: "transform", pointerEvents: "none",
        }} />
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  MARQUEE TICKER                                      ║
          ╚══════════════════════════════════════════════════════╝ */}
      <div style={{
        background: P.terracotta, overflow: "hidden",
        height: "2.6rem", display: "flex", alignItems: "center",
        borderTop: `1px solid rgba(245,239,230,0.08)`,
        borderBottom: `1px solid rgba(245,239,230,0.08)`,
      }}>
        <div className="sb-ticker" style={{ display: "flex", whiteSpace: "nowrap", width: "200%" }}>
          {[TICKER_TEXT, TICKER_TEXT].map((t, i) => (
            <span key={i} style={{
              fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
              letterSpacing: "0.35em", color: "rgba(245,239,230,0.85)",
              textTransform: "uppercase", paddingRight: "0",
              flex: "0 0 50%",
            }}>{t}{t}</span>
          ))}
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  3D PHOTO BANNER                                     ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section style={{ padding: "6rem 0 7rem", background: P.dark, overflow: "hidden", position: "relative" }}>

        {/* Editorial header */}
        <div ref={bannerHeadRef} style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          padding: "0 clamp(2rem, 7vw, 6rem)", marginBottom: "4rem",
          opacity: 0, willChange: "transform, opacity",
        }}>
          <div>
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: "0.58rem",
              color: P.terracotta, letterSpacing: "0.35em",
              textTransform: "uppercase", margin: "0 0 0.6rem", opacity: 0.9,
            }}>The moments</p>
            <h2 style={{
              fontFamily: "'Cormorant Galatia', serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300,
              color: P.cream, margin: 0, lineHeight: 0.9, letterSpacing: "-0.02em",
            }}>Every Frame</h2>
          </div>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
            color: P.sand, opacity: 0.25, letterSpacing: "0.2em",
            paddingBottom: "0.2rem",
          }}>06 photos</span>
        </div>

        <div ref={bannerRef} style={{ perspective: "900px", perspectiveOrigin: "50% 50%", willChange: "transform, opacity" }}>
          <div style={{ overflow: "hidden", marginBottom: "14px" }}>
            <div className="sb-strip" style={{ display: "flex", gap: "14px", width: "300%", transform: "rotateX(8deg)", transformOrigin: "50% 0%" }}>
              {[...PHOTOS, ...PHOTOS, ...PHOTOS].map((photo, i) => <BannerCard key={`a-${i}`} photo={photo} />)}
            </div>
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="sb-strip-rev" style={{ display: "flex", gap: "14px", width: "300%", transform: "rotateX(-6deg)", transformOrigin: "50% 100%" }}>
              {[...[...PHOTOS].reverse(), ...[...PHOTOS].reverse(), ...[...PHOTOS].reverse()].map((photo, i) => (
                <BannerCard key={`b-${i}`} photo={photo} />
              ))}
            </div>
          </div>
        </div>

        {/* Edge fade */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to right, ${P.dark} 0%, transparent 8%, transparent 92%, ${P.dark} 100%)`,
          pointerEvents: "none", zIndex: 2,
        }} />
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  PHOTO SECTIONS                                      ║
          ╚══════════════════════════════════════════════════════╝ */}
      {PHOTOS.map((photo, i) => {
        const isLeft = i % 2 === 0
        return (
          <section key={photo.src} style={{
            minHeight: "92vh", display: "flex",
            alignItems: "center", justifyContent: isLeft ? "flex-start" : "flex-end",
            padding: `6rem clamp(1.5rem, 9vw, 9rem)`,
            position: "relative", background: SECTION_BG[i],
          }}>
            {/* Giant watermark number */}
            <div aria-hidden="true" style={{
              position: "absolute",
              [isLeft ? "right" : "left"]: "clamp(0.5rem, 4vw, 3.5rem)",
              top: "50%", transform: "translateY(-50%)",
              fontFamily: "'Cormorant Galatia', serif",
              fontSize: "clamp(9rem, 24vw, 24rem)", fontWeight: 300,
              color: "rgba(217,197,160,0.035)", lineHeight: 1,
              userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
            }}>{photo.idx}</div>

            {/* Thin horizontal rule at top of section */}
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: "clamp(1.5rem, 9vw, 9rem)", right: "clamp(1.5rem, 9vw, 9rem)",
              height: "1px", background: "rgba(217,197,160,0.07)",
            }} />

            {/* Card */}
            <div ref={(el) => (cardRefs.current[i] = el)} style={{
              width: "clamp(280px, 46vw, 560px)",
              borderRadius: "10px", overflow: "hidden",
              boxShadow: `
                0 2px 4px rgba(0,0,0,0.4),
                0 12px 32px rgba(0,0,0,0.45),
                0 60px 100px rgba(0,0,0,0.3),
                0 0 0 1px rgba(217,197,160,0.06)
              `,
              position: "relative", background: P.dark, willChange: "transform, opacity",
            }}>

              {/* Image viewport */}
              <div style={{ position: "relative", height: "clamp(250px, 50vh, 460px)", overflow: "hidden", background: P.dark }}>
                <img ref={(el) => (imgRefs.current[i] = el)}
                  src={photo.src} alt={photo.caption} onError={handleImgError}
                  style={{ width: "100%", height: "128%", objectFit: "cover", display: "block", willChange: "transform" }}
                />

                {/* Wipe reveal overlay — slides away to the right on scroll */}
                <div ref={(el) => (revealRefs.current[i] = el)} style={{
                  position: "absolute", inset: 0,
                  background: SECTION_BG[i],
                  transformOrigin: "right center",
                  willChange: "transform",
                  zIndex: 2,
                }} />

                <div data-placeholder="true" style={{
                  display: "none", position: "absolute", inset: 0,
                  background: `linear-gradient(${PH_GRADIENTS[i]})`,
                  alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.85rem",
                }}>
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    border: "1.5px solid rgba(245,239,230,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(245,239,230,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", color: "rgba(245,239,230,0.3)",
                    fontSize: "0.62rem", letterSpacing: "0.3em",
                  }}>{photo.idx}</span>
                </div>

                <div aria-hidden="true" style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 50%, rgba(26,15,7,0.6) 100%)",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Caption */}
              <div ref={(el) => (captionRefs.current[i] = el)} style={{ padding: "1.6rem 2rem 2rem", willChange: "transform, opacity" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                      color: P.terracotta, letterSpacing: "0.15em",
                      marginTop: "0.28rem", flexShrink: 0,
                    }}>{photo.idx}</span>
                    <p style={{
                      fontFamily: "'Cormorant Galatia', serif",
                      fontSize: "clamp(1rem, 1.9vw, 1.15rem)", fontWeight: 400,
                      fontStyle: "italic", color: P.sand, margin: 0, lineHeight: 1.55,
                    }}>{photo.caption}</p>
                  </div>
                </div>

                {/* Sweep line — grows from left on scroll */}
                <div ref={(el) => (sweepLineRefs.current[i] = el)} style={{
                  marginTop: "1.4rem", height: "1px",
                  width: "72px", background: P.terracotta, opacity: 0.6,
                  transformOrigin: "left center", transform: "scaleX(0)",
                  willChange: "transform",
                }} />
              </div>
            </div>
          </section>
        )
      })}

      {/* ╔══════════════════════════════════════════════════════╗
          ║  FOOTER                                              ║
          ╚══════════════════════════════════════════════════════╝ */}
      <footer style={{
        minHeight: "38vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.25rem",
        background: P.dark, borderTop: `1px solid rgba(217,197,160,0.06)`,
      }}>
        <div style={{ width: "1px", height: "40px", background: `linear-gradient(to bottom, ${P.terracotta}, transparent)`, opacity: 0.4 }} />
        <p style={{
          fontFamily: "'DM Mono', monospace", color: P.sand, fontSize: "0.62rem",
          letterSpacing: "0.4em", textTransform: "uppercase", opacity: 0.2, margin: 0,
        }}>made with love · 2024</p>
      </footer>
    </div>
  )
}
