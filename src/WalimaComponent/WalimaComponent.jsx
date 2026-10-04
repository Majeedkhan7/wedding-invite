import React, { useEffect, useMemo, useRef, useState } from "react";
import "./walima.css"
import walimaData from "./data.json";

function RevealOnScroll({ children, className = "", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal-on-scroll ${isVisible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ModernRevealCard({ icon, title, mainText, subText }) {
  return (
    <article className="event-card-premium">
      <div className="event-card-orbit" />
      <div className="event-card-icon">{icon}</div>
      <p className="event-card-kicker">{title}</p>
      <h3>{mainText}</h3>
      <p>{subText}</p>
      <span className="event-card-line" />
    </article>
  );
}

function SecretEventReveal() {
  const details = [
    { key: "date", icon: "✿", label: "THE DATE", title: walimaData.event.date, text: walimaData.event.day },
    { key: "time", icon: "☽", label: "THE TIME", title: walimaData.event.time, text: `Arrival by ${walimaData.event.arrivalTime}` },
    { key: "venue", icon: "✧", label: "THE VENUE", title: walimaData.event.venue, text: walimaData.event.address },
  ];

  return (
    <section id="details" className="section secret-scratch-section">
      <RevealOnScroll className="secret-scratch-shell">
        <div className="secret-lock-heading">
          <span className="secret-lock-eyebrow">THE DETAILS</span>
          <h2 className="serif-heading">When &amp; Where</h2>
          <p>Scratch each little secret to discover the details, one by one.</p>
        </div>

        <div className="secret-scratch-grid">
          {details.map((item, index) => (
            <ScratchRevealCard key={item.key} item={item} index={index} />
          ))}
        </div>

        <div className="scratch-footer-note">
          <span></span>
          <p>Scratch gently across each card</p>
          <span></span>
        </div>
      </RevealOnScroll>
    </section>
  );
}

function ScratchRevealCard({ item, index }) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [clearing, setClearing] = useState(false);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const scratchedRef = useRef(0);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card || revealed) return;

    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#6d3c50");
    gradient.addColorStop(0.5, "#a85d7a");
    gradient.addColorStop(1, "#704257");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "rgba(255,255,255,.08)";
    for (let x = -rect.height; x < rect.width + rect.height; x += 26) {
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(-0.55);
      ctx.fillRect(0, -rect.height, 8, rect.height * 2.4);
      ctx.restore();
    }

    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    scratchedRef.current = 0;
  };

  useEffect(() => {
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [revealed]);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const scratch = (event) => {
    if (!drawingRef.current || revealed) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = pointFromEvent(event);
    const previous = lastPointRef.current || point;
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.restore();
    lastPointRef.current = point;
    scratchedRef.current += Math.max(distance, 3);

    if (scratchedRef.current > canvas.width * 0.72) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      for (let i = 3; i < data.length; i += 32) {
        if (data[i] < 35) transparent++;
      }
      const sampled = data.length / 128;
      if (transparent / sampled > 0.38 && !clearing) {
        setClearing(true);
        window.setTimeout(() => setRevealed(true), 720);
      }
    }
  };

  const startScratch = (event) => {
    if (revealed) return;
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
    scratch(event);
  };

  const stopScratch = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <article ref={cardRef} className={`scratch-detail-card ${revealed ? "is-revealed" : ""} ${clearing ? "is-clearing" : ""}`}>
      <div className="scratch-card-content">
        <span className="scratch-detail-icon">{item.icon}</span>
        <p className="event-card-kicker">{item.label}</p>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>

      {!revealed && (
        <canvas
          ref={canvasRef}
          className={`scratch-cover-canvas ${clearing ? "is-clearing" : ""}`}
          onMouseDown={startScratch}
          onMouseMove={scratch}
          onMouseUp={stopScratch}
          onMouseLeave={stopScratch}
          onTouchStart={startScratch}
          onTouchMove={scratch}
          onTouchEnd={stopScratch}
          aria-label={`Scratch to reveal ${item.label.toLowerCase()}`}
        />
      )}

      {!revealed && (
        <div className={`scratch-cover-label ${clearing ? "is-clearing" : ""}`} aria-hidden="true">
          <div className="scratch-lock-ring">{index + 1}</div>
          <strong>SCRATCH TO REVEAL</strong>
          <small>{item.label}</small>
        </div>
      )}
    </article>
  );
}

function SurpriseMoment() {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="section surprise-section">
      <RevealOnScroll className="surprise-card">
        <span className="surprise-sparkle">✦</span>
        <p className="sans-sub">A Little Surprise</p>
        <h2 className="serif-heading">Something Special For You</h2>
        <p className="surprise-intro">Before you continue, there is a small message waiting just for our cherished guests.</p>
        <button className={`surprise-button ${revealed ? "revealed" : ""}`} onClick={() => setRevealed(true)} disabled={revealed}>
          {revealed ? "With Love & Gratitude" : "Open Your Surprise"}
        </button>
        <div className={`surprise-message ${revealed ? "show" : ""}`} aria-live="polite">
          <span>❦</span>
          <p>Your presence, prayers, and warm wishes are the most beautiful gift we could receive.</p>
          <strong>{walimaData.bride.firstName} &amp; {walimaData.groom.firstName}</strong>
        </div>
      </RevealOnScroll>
    </section>
  );
}



function Countdown() {
  const target = useMemo(() => new Date(walimaData.event.isoDate), []);
  const [left, setLeft] = useState(Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => setLeft(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const parts = [
    ["Days", Math.floor(left / 86400000)],
    ["Hours", Math.floor((left / 3600000) % 24)],
    ["Minutes", Math.floor((left / 60000) % 60)],
    ["Seconds", Math.floor((left / 1000) % 60)],
  ];

  return (
    <div className="countdown-premium-wrap">
      <div className="countdown-glow" />
      <div className="countdown-wrapper countdown-premium">
        {parts.map(([label, num]) => (
          <div className="count-box count-box-premium" key={label}>
            <span className="count-num" key={`${label}-${num}`}>{String(num).padStart(2, "0")}</span>
            <span className="sans-sub">{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-caption">Until we gather together in joy</p>
    </div>
  );
}

function ElegantLockIntro({ onOpen, onUnlockStart }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    setIsUnlocked(true);
    if (onUnlockStart) onUnlockStart();
    window.setTimeout(onOpen, 1400); 
  };

  return (
    <div className={`elegant-lock ${isUnlocked ? "is-unlocked" : ""}`}>
      <div className="lock-door door-left"></div>
      <div className="lock-door door-right"></div>
      
      <div className="lock-center">
        <div className="lock-names">
          <span>{walimaData.bride.firstName}</span>
          <i>&amp;</i>
          <span>{walimaData.groom.firstName}</span>
        </div>
        
        <button className="lock-seal" onClick={handleUnlock} aria-label="Unlock Invitation">
          {walimaData.bride.firstName[0]}{walimaData.groom.firstName[0]}
        </button>
        <p className="lock-hint">Tap Seal To Open</p>
      </div>
    </div>
  );
}

export default function ElegantWalima() {
  const [isOpened, setIsOpened] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("locked", !isOpened);
    return () => document.body.classList.remove("locked");
  }, [isOpened]);

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpSent(true);
  };

  const startAudioSync = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.log("Audio playback restricted by browser:", e));
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="walima-page">

      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop preload="auto">
        <source src={walimaData.audioUrl1} type="audio/mpeg" />
      </audio>

      {/* Floating Audio Toggle Button */}
      <button 
        className={`audio-toggle-btn ${isOpened ? 'is-visible' : ''}`} 
        onClick={toggleAudio}
        aria-label={isPlaying ? "Mute Background Music" : "Play Background Music"}
      >
        <span className="audio-icon">{isPlaying ? "🔊" : "🔈"}</span>
      </button>

      <ElegantLockIntro 
        onOpen={() => setIsOpened(true)} 
        onUnlockStart={startAudioSync} 
      />

      <div className={`main-content ${isOpened ? "visible" : ""}`}>
        
        <nav className={`navbar-glass-pill navbar-premium ${menuOpen ? "menu-open" : ""}`} aria-label="Wedding navigation">
          <a href="#top" className="nav-brand" onClick={(e) => {
            e.preventDefault(); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" });
          }}>
            <span className="nav-monogram">{walimaData.bride.firstName[0]}</span>
            <span className="nav-amp">&amp;</span>
            <span className="nav-monogram">{walimaData.groom.firstName[0]}</span>
          </a>
          <button className="nav-menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
          <div className="nav-links">
            {[['details','When & Where'],['countdown','Countdown'],['gallery','Gallery'],['story','Story'],['rsvp','RSVP']].map(([id,label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </div>
        </nav>

        {/* Immersive Full-Bleed Hero Section */}
        {/* FIX: Dynamically inject the first image from the gallery array */}
        <section id="top" className="hero-full-bg" style={{ backgroundImage: `url(${walimaData.gallery[0]})` }}>
          <RevealOnScroll className="hero-pure-content" delay={300}>
            <p className="hero-eyebrow-pure">Bismillah Hir Rahman Nir Raheem</p>
            
            <div className="hero-title-pure">
              <h1>{walimaData.bride.firstName}</h1>
              <span className="ampersand">&amp;</span>
              <h1>{walimaData.groom.firstName}</h1>
            </div>
            
            <p className="hero-subtitle-pure">
              Together with their families
              <strong>Joyfully invite you to their Walima</strong>
            </p>
          </RevealOnScroll>

          <div className="scroll-indicator">
            <div className="scroll-line"></div>
            <span className="sans-sub" style={{ fontSize: '0.6rem', color: 'var(--ivory)' }}>Scroll</span>
          </div>
        </section>

        <SecretEventReveal />

        <section id="countdown" className="section">
          <RevealOnScroll className="section-header">
            <p className="sans-sub">Anticipation</p>
            <h2 className="serif-heading">Counting the Days</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={150}>
            <Countdown />
          </RevealOnScroll>
        </section>

        <SurpriseMoment />


        {/* Asymmetric Gallery Section */}
     <section id="gallery" className="section">
  <RevealOnScroll className="section-header">
    <p className="sans-sub">Moments</p>
    <h2 className="serif-heading">The Couples Gallery</h2>
  </RevealOnScroll>

  <RevealOnScroll>
    <div className="single-gallery">
      <img
        src={walimaData.gallery[0]}
        className="single-gallery-img"
        alt="Groom"
        loading="lazy"
      />
    </div>
  </RevealOnScroll>
</section>
        {/* Our Story */}
        <section id="story" className="section section-narrow">
          <RevealOnScroll className="section-header" style={{marginTop: '3rem'}}>
            <p className="sans-sub">Our Promise</p>
            <h2 className="serif-heading">Two Souls United</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={150}>
            <p>
              "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy." (Quran 30:21)
              <br/><br/>
              By the grace of the Almighty, our hearts have found their home. We are profoundly joyful to invite our cherished family and friends to share in the blessing of our Walima, as we step forward into our new life together.
            </p>
            <div className="script-subtitle" style={{marginTop: '3rem', fontFamily: 'var(--font-script)', fontSize: '2.5rem', color: 'var(--dusk-dark)'}}>{walimaData.bride.firstName} & {walimaData.groom.firstName}</div>
          </RevealOnScroll>
        </section>

        {/* Timeline */}
        <section className="section section-narrow">
          <RevealOnScroll className="section-header">
            <p className="sans-sub">The Evening</p>
            <h2 className="serif-heading">Order of Events</h2>
          </RevealOnScroll>
          
          {/* FIX: New Elegant Timeline Structure */}
          <div className="timeline">
            {walimaData.timeline.map((item, index) => (
              <RevealOnScroll className="timeline-item" key={item.time} delay={index * 100}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-time">{item.time}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* Extra Info & Map */}
        <section className="section">
           <RevealOnScroll className="section-header">
            <p className="sans-sub">Additional Details</p>
            <h2 className="serif-heading">For Your Comfort</h2>
          </RevealOnScroll>
          
          <div className="info-flex-container">
            <RevealOnScroll className="info-flex-item" delay={150}>
               <p className="sans-sub" style={{marginBottom: '1rem', color: 'var(--dusk-dark)'}}>With Love</p>
               <p>{walimaData.event.giftPreference}</p>
            </RevealOnScroll>
          </div>

          <RevealOnScroll>
             <div className="map-container">
                <iframe src={walimaData.event.mapEmbedUrl} title="Venue Location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
             </div>
          </RevealOnScroll>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="section">
          <RevealOnScroll className="rsvp-section">
            <div className="section-header" style={{marginBottom: '2rem'}}>
              <p className="sans-sub">Kindly Reply</p>
              <h2 className="serif-heading">RSVP</h2>
            </div>
            
            {rsvpSent ? (
              <div style={{textAlign: 'center', padding: '2rem 0'}}>
                <h2 className="serif-heading" style={{fontSize: '2rem', marginBottom: '1rem'}}>Jazakallah Khair</h2>
                <p>We have received your beautiful response.</p>
              </div>
            ) : (
              <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
                <div className="input-group">
                  <input className="rsvp-input" required placeholder="GUEST NAME(S)" />
                </div>
                {/* <div className="input-group">
                  <input className="rsvp-input" type="email" required placeholder="EMAIL ADDRESS" />
                </div> */}
                <div className="input-group">
                  <select className="rsvp-input" required defaultValue="">
                    <option value="" disabled>WILL YOU ATTEND?</option>
                    <option value="accepts">Joyfully Accepts</option>
                    <option value="declines">Regretfully Declines</option>
                  </select>
                </div>
                <div className="input-group">
                  <input className="rsvp-input" type="text" placeholder="DIETARY REQUIREMENTS (OPTIONAL)" />
                </div>
                <button type="submit" className="btn-elegant">Send Reply</button>
              </form>
            )}
          </RevealOnScroll>
        </section>

        {/* Footer */}
        <footer className="footer">
          <RevealOnScroll>
            <div className="divider"><span className="divider-icon">❦</span></div>
            <div className="script-subtitle" style={{marginBottom: '0.5rem', fontFamily: 'var(--font-script)', fontSize: '2rem', color: 'var(--dusk-dark)'}}>{walimaData.bride.firstName} & {walimaData.groom.firstName}</div>
            <p className="sans-sub">{walimaData.event.date}</p>
          </RevealOnScroll>
        </footer>

      </div>
    </div>
  );
}