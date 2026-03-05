import { useEffect, useRef } from "react"

// ─── Inject CSS keyframes once ─────────────────────────────────────────────────
const BANNER_CSS = `
@keyframes scrapbook-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-33.3334%); }
}
@keyframes scrapbook-scroll-rev {
  0%   { transform: translateX(-33.3334%); }
  100% { transform: translateX(0); }
}
.sb-strip { animation: scrapbook-scroll 28s linear infinite; }
.sb-strip-rev { animation: scrapbook-scroll-rev 34s linear infinite; }
.sb-strip:hover, .sb-strip-rev:hover { animation-play-state: paused; }
`

// ─── Photo data ────────────────────────────────────────────────────────────────
const PHOTOS = [
  {
    src: "./photos/cruise_selfie.jpg",
    caption: "Island vibes — cruise excursion stop",
    idx: "01",
  },
  {
    src: "./photos/espresso_martinis.jpg",
    caption: "Espresso martinis on the ship",
    idx: "02",
  },
  {
    src: "./photos/beach_bar.jpg",
    caption: "Beach bar afternoon",
    idx: "03",
  },
  {
    src: "./photos/resort_pose.jpg",
    caption: "Golden hour at the resort",
    idx: "04",
  },
  {
    src: "./photos/toy_shopping.jpg",
    caption: "Little shopper",
    idx: "05",
  },
  {
    src: "./photos/playground.jpg",
    caption: "She owns every room she walks into",
    idx: "06",
  },
]

// ─── Palette ───────────────────────────────────────────────────────────────────
const P = {
  cream: "#F5EFE6",
  sand: "#D9C5A0",
  terracotta: "#C1673A",
  espresso: "#2C1A0E",
  dark: "#1A0F07",
  mid: "#3D2314",
}

// Per-card warm placeholder gradients
const PH_GRADIENTS = [
  `135deg, #C1673A 0%, #D9C5A0 100%`,
  `135deg, #7A3219 0%, #C1673A 100%`,
  `135deg, #D9C5A0 0%, #C1673A 80%`,
  `135deg, #C1673A 20%, #2C1A0E 100%`,
  `135deg, #3D2314 0%, #C1673A 65%`,
  `135deg, #C1673A 0%, #F5EFE6 100%`,
]

// Section background cycle
const SECTION_BG = [P.espresso, P.mid, "#231208", P.espresso, P.mid, "#231208"]

// ─── Utility ───────────────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement("script")
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// ─── BannerCard — small tile used in the 3D scrolling strip ───────────────────
function BannerCard({ photo }) {
  const handleErr = (e) => {
    e.currentTarget.style.display = "none"
    const ph = e.currentTarget.parentElement?.querySelector("[data-phb]")
    if (ph) ph.style.display = "flex"
  }
  return (
    <div
      style={{
        flexShrink: 0,
        width: "clamp(160px, 18vw, 240px)",
        height: "clamp(200px, 22vw, 290px)",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,197,160,0.08)",
      }}
    >
      <img
        src={photo.src}
        alt={photo.caption}
        onError={handleErr}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Placeholder */}
      <div
        data-phb="true"
        style={{
          display: "none",
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${P.terracotta} 0%, ${P.espresso} 100%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Galatia', serif",
            color: "rgba(245,239,230,0.3)",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
          }}
        >
          {photo.idx}
        </span>
      </div>
      {/* Caption overlay on hover — pure CSS via inline style won't work, so a permanent subtle overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(26,15,7,0.75) 0%, transparent 50%)",
          display: "flex",
          alignItems: "flex-end",
          padding: "0.75rem",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Galatia', serif",
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: P.sand,
            margin: 0,
            lineHeight: 1.3,
            opacity: 0.85,
          }}
        >
          {photo.caption}
        </p>
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ScrapbookPage() {
  const progressBarRef = useRef(null)
  const bannerRef = useRef(null)
  const heroRef = useRef(null)
  const heroBgRef = useRef(null)
  const heroTitleRef = useRef(null)
  const heroSubRef = useRef(null)

  // Video scrub refs
  const videoSectionRef = useRef(null)
  const videoRef = useRef(null)
  const videoTextRef = useRef(null)
  const videoProgressLineRef = useRef(null)

  // Per-card refs (arrays)
  const cardRefs = useRef([])
  const imgRefs = useRef([])
  const captionRefs = useRef([])

  // ─── GSAP setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Inject banner keyframe CSS once
    if (!document.getElementById("sb-banner-css")) {
      const style = document.createElement("style")
      style.id = "sb-banner-css"
      style.textContent = BANNER_CSS
      document.head.appendChild(style)
    }

    // Google Fonts — Cormorant Galatia + DM Sans
    const fontLink = document.createElement("link")
    fontLink.rel = "stylesheet"
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Galatia:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
      document.head.appendChild(fontLink)
    }

    let killAll = () => {}

    // Load GSAP → then ScrollTrigger (must be sequential)
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
    )
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
        )
      )
      .then(() => {
        const gsap = window.gsap
        const ScrollTrigger = window.ScrollTrigger

        if (!gsap || !ScrollTrigger) return

        gsap.registerPlugin(ScrollTrigger)

        // ── 0. Video scrub — pin full-screen, drive currentTime via scroll ──
        const vid = videoRef.current
        if (vid && videoSectionRef.current) {
          vid.pause()
          vid.currentTime = 0

          ScrollTrigger.create({
            trigger: videoSectionRef.current,
            start: "top top",
            end: "+=300%",
            pin: true,
            pinSpacing: true,
            scrub: true,
            onUpdate: (self) => {
              if (vid.duration) vid.currentTime = self.progress * vid.duration
            },
          })

          // Title: fades in clean, holds, fades out near end
          if (videoTextRef.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: videoSectionRef.current,
                start: "top top",
                end: "+=300%",
                scrub: 1,
              },
            })
              .fromTo(videoTextRef.current,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, ease: "power2.out", duration: 0.25 }
              )
              .to(videoTextRef.current,
                { opacity: 0, y: -18, ease: "power2.in", duration: 0.2 },
                0.7
              )
          }

          // Progress line tracks scroll through video
          if (videoProgressLineRef.current) {
            gsap.fromTo(videoProgressLineRef.current,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: videoSectionRef.current,
                  start: "top top",
                  end: "+=300%",
                  scrub: true,
                },
              }
            )
          }
        }

        // ── 1. Scroll progress bar ──────────────────────────────────────────
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          })
        }

        // ── 2. Hero: pin for 2× viewport heights ───────────────────────────
        if (heroRef.current) {
          ScrollTrigger.create({
            trigger: heroRef.current,
            start: "top top",
            end: "+=200%",
            pin: true,
            pinSpacing: true,
          })
        }

        // ── 3. Hero background gradient color shift ────────────────────────
        if (heroBgRef.current) {
          gsap.to(heroBgRef.current, {
            backgroundPosition: "100% 100%",
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=200%",
              scrub: true,
            },
          })
        }

        // ── 4. Hero title: scale(1.4)+blur(12px) → scale(1)+blur(0) ────────
        if (heroTitleRef.current) {
          gsap.fromTo(
            heroTitleRef.current,
            { scale: 1.4, filter: "blur(12px)", opacity: 0.4 },
            {
              scale: 1,
              filter: "blur(0px)",
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "+=90%",
                scrub: true,
              },
            }
          )
        }

        // Subtle sub-text fade in after title resolves
        if (heroSubRef.current) {
          gsap.fromTo(
            heroSubRef.current,
            { opacity: 0, y: 14 },
            {
              opacity: 0.6,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top+=60% top",
                end: "+=60%",
                scrub: true,
              },
            }
          )
        }

        // ── 5. 3D banner entrance ──────────────────────────────────────────
        if (bannerRef.current) {
          gsap.fromTo(
            bannerRef.current,
            { rotateX: 35, opacity: 0, y: 80 },
            {
              rotateX: 0,
              opacity: 1,
              y: 0,
              ease: "power3.out",
              scrollTrigger: {
                trigger: bannerRef.current,
                start: "top 85%",
                end: "top 35%",
                scrub: 1.2,
              },
            }
          )
        }

        // ── 6. Photo cards ─────────────────────────────────────────────────
        cardRefs.current.forEach((card, i) => {
          if (!card) return

          const isLeft = i % 2 === 0

          // 5a. Slide in from alternating sides
          gsap.fromTo(
            card,
            { x: isLeft ? -120 : 120, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "top 32%",
                scrub: 1,
              },
            }
          )

          // 5b. Parallax on inner image (moves at ~0.3× scroll speed)
          const img = imgRefs.current[i]
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: -14 },
              {
                yPercent: 14,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            )
          }

          // 5c. Caption fades up as card enters
          const caption = captionRefs.current[i]
          if (caption) {
            gsap.fromTo(
              caption,
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 68%",
                  end: "top 28%",
                  scrub: 1,
                },
              }
            )
          }
        })

        killAll = () => ScrollTrigger.getAll().forEach((t) => t.kill())
      })
      .catch((err) => console.error("[Scrapbook] GSAP load failed:", err))

    return () => killAll()
  }, [])

  // ─── Image error → show warm placeholder ─────────────────────────────────────
  const handleImgError = (e) => {
    e.currentTarget.style.display = "none"
    const ph = e.currentTarget.parentElement?.querySelector(
      "[data-placeholder]"
    )
    if (ph) ph.style.display = "flex"
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: P.espresso,
        overflowX: "hidden",
        color: P.cream,
      }}
    >
      {/* ╔══════════════════════════════════════════════════════╗
          ║  PROGRESS BAR                                        ║
          ╚══════════════════════════════════════════════════════╝ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "rgba(44,26,14,0.6)",
          zIndex: 9999,
          backdropFilter: "none",
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${P.terracotta} 0%, ${P.sand} 100%)`,
            transformOrigin: "left center",
            transform: "scaleX(0)",
            willChange: "transform",
          }}
        />
      </div>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  VIDEO SCRUB — pin, scroll drives currentTime        ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section
        ref={videoSectionRef}
        style={{
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          src="./video/scene.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* OUR STORY — centered, clean */}
        <div
          ref={videoTextRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Galatia', serif",
              fontSize: "clamp(5rem, 15vw, 14rem)",
              fontWeight: 300,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: 0,
              lineHeight: 1,
              textShadow: "0 2px 40px rgba(0,0,0,0.5)",
            }}
          >
            Our Story
          </h1>
        </div>

        {/* Progress line — top of video, black */}
        <div
          ref={videoProgressLineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "3px",
            width: "100%",
            background: "#000",
            transformOrigin: "left center",
            transform: "scaleX(0)",
            willChange: "transform",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  HERO — pinned, gradient shift, title blur-reveal    ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section
        ref={heroRef}
        style={{
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated background — backgroundPosition drives the color shift */}
        <div
          ref={heroBgRef}
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              135deg,
              ${P.espresso}  0%,
              #4A1E0A       18%,
              ${P.terracotta} 42%,
              #B85D35       58%,
              ${P.sand}      78%,
              ${P.cream}    100%
            )`,
            backgroundSize: "400% 400%",
            backgroundPosition: "0% 0%",
          }}
        />

        {/* Film-grain texture overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            mixBlendMode: "overlay",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />

        {/* Radial vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(26,15,7,0.55) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Title block */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 2rem",
          }}
        >
          {/* Eyebrow */}
          <p
            ref={heroTitleRef}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: P.sand,
              fontSize: "0.7rem",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              margin: 0,
              opacity: 0.6,
              willChange: "transform, filter, opacity",
            }}
          >
            A family story
          </p>

          {/* Sub-line revealed after scroll begins */}
          <div
            ref={heroSubRef}
            style={{
              marginTop: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "1px",
                background: P.sand,
                opacity: 0.5,
              }}
            />
            <span
              style={{
                color: P.sand,
                fontSize: "0.68rem",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              Scroll to explore
            </span>
            <div
              style={{
                width: "44px",
                height: "1px",
                background: P.sand,
                opacity: 0.5,
              }}
            />
          </div>
        </div>

        {/* Scroll worm */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "2.25rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "56px",
              background: `linear-gradient(to bottom, transparent, ${P.sand})`,
              opacity: 0.35,
            }}
          />
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  3D PHOTO BANNER                                     ║
          ╚══════════════════════════════════════════════════════╝ */}
      <section
        style={{
          padding: "7rem 0",
          background: P.dark,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: P.sand,
            fontSize: "0.68rem",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "3.5rem",
            opacity: 0.4,
          }}
        >
          The moments
        </p>

        {/* 3D perspective wrapper — GSAP rotateX entrance target */}
        <div
          ref={bannerRef}
          style={{
            perspective: "900px",
            perspectiveOrigin: "50% 50%",
            willChange: "transform, opacity",
          }}
        >
          {/* Row 1 — scrolls left */}
          <div style={{ overflow: "hidden", marginBottom: "16px" }}>
            <div
              className="sb-strip"
              style={{
                display: "flex",
                gap: "16px",
                /* 3× the items so one full set = 33.3% → seamless loop */
                width: "300%",
                transform: "rotateX(8deg)",
                transformOrigin: "50% 0%",
              }}
            >
              {[...PHOTOS, ...PHOTOS, ...PHOTOS].map((photo, i) => (
                <BannerCard key={`a-${i}`} photo={photo} />
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right (reversed), slight counter-tilt */}
          <div style={{ overflow: "hidden" }}>
            <div
              className="sb-strip-rev"
              style={{
                display: "flex",
                gap: "16px",
                width: "300%",
                transform: "rotateX(-6deg)",
                transformOrigin: "50% 100%",
              }}
            >
              {[...[...PHOTOS].reverse(), ...[...PHOTOS].reverse(), ...[...PHOTOS].reverse()].map(
                (photo, i) => (
                  <BannerCard key={`b-${i}`} photo={photo} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Edge fade masks */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              to right,
              ${P.dark} 0%,
              transparent 10%,
              transparent 90%,
              ${P.dark} 100%
            )`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      </section>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  PHOTO SECTIONS — alternating left / right           ║
          ╚══════════════════════════════════════════════════════╝ */}
      {PHOTOS.map((photo, i) => {
        const isLeft = i % 2 === 0
        return (
          <section
            key={photo.src}
            style={{
              minHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: isLeft ? "flex-start" : "flex-end",
              padding: `6rem clamp(1.5rem, 9vw, 9rem)`,
              position: "relative",
              background: SECTION_BG[i],
            }}
          >
            {/* Ambient section number watermark */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                [isLeft ? "right" : "left"]: "clamp(0.5rem, 4vw, 3.5rem)",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'Cormorant Galatia', serif",
                fontSize: "clamp(9rem, 24vw, 24rem)",
                fontWeight: 300,
                color: "rgba(217,197,160,0.04)",
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
                letterSpacing: "-0.05em",
              }}
            >
              {photo.idx}
            </div>

            {/* ── Card ─────────────────────────────────────────────── */}
            <div
              ref={(el) => (cardRefs.current[i] = el)}
              style={{
                width: "clamp(280px, 46vw, 560px)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: `
                  0 2px 4px  rgba(0,0,0,0.35),
                  0 10px 30px rgba(0,0,0,0.40),
                  0 50px 90px rgba(0,0,0,0.28),
                  0 0 0 1px  rgba(217,197,160,0.07)
                `,
                position: "relative",
                background: P.dark,
                willChange: "transform, opacity",
              }}
            >
              {/* Image viewport — overflow:hidden so parallax stays clipped */}
              <div
                style={{
                  position: "relative",
                  height: "clamp(250px, 50vh, 460px)",
                  overflow: "hidden",
                  background: P.dark,
                }}
              >
                {/* Photo */}
                <img
                  ref={(el) => (imgRefs.current[i] = el)}
                  src={photo.src}
                  alt={photo.caption}
                  onError={handleImgError}
                  style={{
                    /* 128% tall so parallax yPercent never shows empty space */
                    width: "100%",
                    height: "128%",
                    objectFit: "cover",
                    display: "block",
                    willChange: "transform",
                  }}
                />

                {/* Warm placeholder — rendered but hidden; shown via onError */}
                <div
                  data-placeholder="true"
                  style={{
                    display: "none",
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(${PH_GRADIENTS[i]})`,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      border: "1.5px solid rgba(245,239,230,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Simple SVG image icon */}
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(245,239,230,0.45)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Cormorant Galatia', serif",
                      color: "rgba(245,239,230,0.35)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                    }}
                  >
                    {photo.idx}
                  </span>
                </div>

                {/* Bottom vignette blends photo into caption area */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 50%, rgba(26,15,7,0.65) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Caption block */}
              <div
                ref={(el) => (captionRefs.current[i] = el)}
                style={{
                  padding: "1.75rem 2rem 2.1rem",
                  willChange: "transform, opacity",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.9rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.62rem",
                      color: P.terracotta,
                      letterSpacing: "0.3em",
                      marginTop: "0.32rem",
                      flexShrink: 0,
                      opacity: 0.85,
                    }}
                  >
                    {photo.idx}
                  </span>
                  <p
                    style={{
                      fontFamily: "'Cormorant Galatia', serif",
                      fontSize: "clamp(1rem, 1.9vw, 1.15rem)",
                      fontWeight: 400,
                      fontStyle: "italic",
                      color: P.sand,
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {photo.caption}
                  </p>
                </div>

                {/* Terracotta rule */}
                <div
                  style={{
                    marginTop: "1.3rem",
                    width: "26px",
                    height: "1px",
                    background: P.terracotta,
                    opacity: 0.55,
                  }}
                />
              </div>
            </div>
          </section>
        )
      })}

      {/* ╔══════════════════════════════════════════════════════╗
          ║  FOOTER                                              ║
          ╚══════════════════════════════════════════════════════╝ */}
      <footer
        style={{
          minHeight: "40vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: P.dark,
          borderTop: "1px solid rgba(217,197,160,0.06)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Galatia', serif",
            fontSize: "2rem",
            color: P.sand,
            opacity: 0.25,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: P.sand,
            fontSize: "0.68rem",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            opacity: 0.25,
            margin: 0,
          }}
        >
          Made with love
        </p>
      </footer>
    </div>
  )
}
