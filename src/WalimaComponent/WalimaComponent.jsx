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
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className={`mrc-card ${isActive ? "is-active" : ""}`}
      onClick={() => setIsActive(!isActive)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className="mrc-glow"></div>
      
      <div className="mrc-content-front">
        <div className="mrc-icon">{icon}</div>
        <h3 className="mrc-title">{title}</h3>
        <p className="mrc-hint">Hover or Tap to Reveal</p>
      </div>
      
      <div className="mrc-content-back">
        <div className="mrc-main-text">{mainText}</div>
        <div className="mrc-sub-text">{subText}</div>
      </div>
    </div>
  );
}

function Countdown() {
  const target = useMemo(() => new Date(walimaData.event.isoDate), []);
  const [left, setLeft] = useState(Math.max(0, target.getTime() - new Date().getTime()));

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft(Math.max(0, target.getTime() - new Date().getTime()));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const parts = [
    ["Days", Math.floor(left / 86400000)],
    ["Hours", Math.floor((left / 3600000) % 24)],
    ["Minutes", Math.floor((left / 60000) % 60)],
    ["Seconds", Math.floor((left / 1000) % 60)],
  ];

  return (
    <div className="countdown-wrapper">
      {parts.map(([label, num]) => (
        <div className="count-box" key={label}>
          <span className="count-num">{String(num).padStart(2, "0")}</span>
          <span className="sans-sub" style={{letterSpacing: '0.1em'}}>{label}</span>
        </div>
      ))}
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
        <source src={walimaData.audioUrl} type="audio/mpeg" />
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
        
        <nav className="navbar-glass-pill">
          <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }}>
            {walimaData.bride.firstName[0]} <span>&amp;</span> {walimaData.groom.firstName[0]}
          </a>
        </nav>

        {/* Immersive Full-Bleed Hero Section */}
        {/* FIX: Dynamically inject the first image from the gallery array */}
        <section className="hero-full-bg" style={{ backgroundImage: `url(${walimaData.gallery[0]})` }}>
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

        {/* Modern Glassmorphism Interactive Grid */}
        <section className="section">
          <RevealOnScroll className="section-header">
            <p className="sans-sub">The Details</p>
            <h2 className="serif-heading">When & Where</h2>
          </RevealOnScroll>
          
          <RevealOnScroll delay={100}>
            <div className="modern-reveal-grid">
              <ModernRevealCard 
                icon="✿" 
                title="The Date" 
                mainText={walimaData.event.date} 
                subText={walimaData.event.day} 
              />
              <ModernRevealCard 
                icon="☽" 
                title="The Time" 
                mainText={walimaData.event.time} 
                subText={`Arrival by ${walimaData.event.arrivalTime}`} 
              />
              <ModernRevealCard 
                icon="✧" 
                title="The Venue" 
                mainText={walimaData.event.venue} 
                subText={walimaData.event.address} 
              />
            </div>
          </RevealOnScroll>
        </section>

        <section className="section">
          <RevealOnScroll className="section-header">
            <p className="sans-sub">Anticipation</p>
            <h2 className="serif-heading">Counting the Days</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={150}>
            <Countdown />
          </RevealOnScroll>
        </section>

        {/* Asymmetric Gallery Section */}
        <section className="section">
          <RevealOnScroll className="section-header">
            <p className="sans-sub">Moments</p>
            <h2 className="serif-heading">Our Beautiful Journey</h2>
          </RevealOnScroll>
          
          <RevealOnScroll>
            <div className="gallery-grid">
              <div className="gal-item gal-1"><img src={walimaData.gallery[2]} className="gal-img" alt="Couple" loading="lazy" /></div>
              <div className="gal-item gal-2"><img src={walimaData.gallery[4]} className="gal-img" alt="Decor" loading="lazy" /></div>
              <div className="gal-item gal-3"><img src={walimaData.gallery[5]} className="gal-img" alt="Details" loading="lazy" /></div>
              <div className="gal-item gal-4"><img src={walimaData.gallery[1]} className="gal-img" alt="Rings" loading="lazy" /></div>
            </div>
          </RevealOnScroll>
        </section>

        {/* Our Story */}
        <section className="section section-narrow">
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
        <section className="section">
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
                <div className="input-group">
                  <input className="rsvp-input" type="email" required placeholder="EMAIL ADDRESS" />
                </div>
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