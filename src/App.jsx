import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./index.css";

/* =========================================================
   IMPORT DATA FROM JSON
========================================================= */
import weddingData from "./data.json";

/* =========================================================
   SCROLL REVEAL COMPONENT 
========================================================= */
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
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   SCRATCH CARD
========================================================= */
function ScratchCard({ text, width = 240, height = 60, isHeading = false }) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#b18e59");
    gradient.addColorStop(0.2, "#dfc99f");
    gradient.addColorStop(0.45, "#b99865");
    gradient.addColorStop(0.7, "#ead8b3");
    gradient.addColorStop(1, "#b18e59");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.12)" : "rgba(90,70,40,.06)";
      ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2, Math.random() * 2);
    }

    ctx.font = '500 9px "DM Sans"';
    ctx.fillStyle = "#5e513d";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  SCRATCH TO REVEAL  ✦", width / 2, height / 2);

    let isDrawing = false;
    const getPosition = (event) => {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0];
      const clientX = touch ? touch.clientX : event.clientX;
      const clientY = touch ? touch.clientY : event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const scratch = (event) => {
      if (!isDrawing) return;
      event.preventDefault();
      const { x, y } = getPosition(event);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkReveal = () => {
      const imageData = ctx.getImageData(0, 0, width, height).data;
      let transparentPixels = 0;
      for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] === 0) transparentPixels++;
      }
      if (transparentPixels / (width * height) > 0.38) setRevealed(true);
    };

    const start = (event) => { isDrawing = true; scratch(event); };
    const stop = () => { if (!isDrawing) return; isDrawing = false; checkReveal(); };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", scratch);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", scratch);
      canvas.removeEventListener("touchend", stop);
    };
  }, [width, height]);

  return (
    <div className={`scratch-card-wrapper ${revealed ? "revealed" : ""}`} style={{ width, minHeight: height }}>
      <div className={`scratch-content ${isHeading ? "heading-style" : ""}`}>{text}</div>
      <canvas ref={canvasRef} className={`scratch-canvas ${revealed ? "fade-out" : ""}`} />
    </div>
  );
}

/* =========================================================
   COUNTDOWN
========================================================= */
function Countdown() {
  const target = useMemo(() => new Date(weddingData.event.isoDate), []);
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
    <div className="countdown">
      {parts.map(([label, number]) => (
        <div className="count-item" key={label}>
          <strong>{String(number).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ENVELOPE INTRO
========================================================= */
function EnvelopeIntro({ onOpen }) {
  const [opening, setOpening] = useState(false);
  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => { onOpen(); }, 1500);
  };

  return (
    <div className={`envelope-screen ${opening ? "is-opening-screen" : ""}`}>
      <div className="envelope-glow" />
      <div className={`intro-copy ${opening ? "fade-out" : ""}`}>
        <p>YOU ARE INVITED</p>
        <h1>{weddingData.bride.firstName} <span>&</span> {weddingData.groom.firstName}</h1>
        <small>{weddingData.event.date.split(" ").join(" · ")}</small>
      </div>

      <button className={`envelope ${opening ? "opening" : ""}`} onClick={handleOpen} disabled={opening}>
        <div className="envelope-paper">
          <div className="paper-content">
            <span>THE WEDDING OF</span>
            <h2>{weddingData.bride.firstName}</h2><i>&</i><h2>{weddingData.groom.firstName}</h2>
            <b>SCRATCH & DISCOVER</b>
          </div>
        </div>
        <div className="envelope-back" />
        <div className="envelope-flap" />
        <div className="envelope-front" />
        <div className="wax-seal">{weddingData.bride.firstName[0]} <span>&</span> {weddingData.groom.firstName[0]}</div>
      </button>

      <button className={`tap-open ${opening ? "fade-out" : ""}`} onClick={handleOpen} disabled={opening}>
        <span className="tap-icon">✦</span>Tap to open invitation
      </button>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */
export default function App() {
  const [opened, setOpened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("locked", !opened);
    return () => document.body.classList.remove("locked");
  }, [opened]);

  const startWeddingMusic = async () => {
    try {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.3;
      await audioRef.current.play();
      setMusicPlaying(true);
    } catch (error) { console.log("Music blocked:", error); }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setMusicPlaying(true);
      } catch (error) {}
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  const openInvitation = () => {
    setOpened(true);
    setTimeout(() => startWeddingMusic(), 700);
    setTimeout(() => {
      document.getElementById("invitation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1600);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const addToCalendar = () => {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${weddingData.bride.firstName} &${weddingData.groom.firstName} — Wedding`)}&dates=20261215T103000Z/20261215T130000Z&location=${encodeURIComponent(`${weddingData.event.venue},${weddingData.event.address}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareInvitation = async () => {
    const data = { 
      title: `${weddingData.bride.firstName} & ${weddingData.groom.firstName} — Wedding`, 
      text: `You are warmly invited to celebrate with ${weddingData.bride.firstName} & ${weddingData.groom.firstName}.`, 
      url: window.location.href 
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (error) { console.log(error); }
    } else {
      try {
        await navigator.clipboard?.writeText(window.location.href);
        alert("Invitation link copied!");
      } catch { alert("Copy the invitation URL from your browser."); }
    }
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpSent(true);
  };

  return (
    <>
      <audio ref={audioRef} src="/music/wedding-music.mp3" loop preload="auto" />

      {!opened && <EnvelopeIntro onOpen={openInvitation} />}

      <div className={`invitation-page ${opened ? "invitation-visible" : ""}`} id="invitation">
        
        {/* NAVBAR */}
        <nav className="navbar">
          <button className="brand" onClick={() => scrollTo("home")}>
            {weddingData.bride.firstName[0]} <span>&</span> {weddingData.groom.firstName[0]}
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {[["Home", "home"], ["Details", "details"], ["Schedule", "schedule"], ["Gallery", "gallery"], ["RSVP", "rsvp"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>
        </nav>

        {/* MUSIC TOGGLE */}
        <button className={`music-toggle ${musicPlaying ? "playing" : ""}`} onClick={toggleMusic}>
          <span className="music-icon">{musicPlaying ? "♫" : "♪"}</span>
          <span>{musicPlaying ? "Music On" : "Music Off"}</span>
        </button>

        {/* COVER SECTION */}
        <section className="invitation-cover" id="home">
          <div className="cover-decoration top" />
          <div className="cover-inner">
            <p className="eyebrow">Together with their families</p>
            <p className="script cover-intro">Request the pleasure of your company</p>
            <h1>{weddingData.bride.firstName}<span>&</span>{weddingData.groom.firstName}</h1>
            <div className="cover-divider"><span />❦<span /></div>
            <p className="cover-date">{weddingData.event.date}</p>
            <p className="cover-venue">{weddingData.event.venue}</p>
            <button className="scroll-button" onClick={() => scrollTo("details")}>View invitation<span>↓</span></button>
          </div>
          <div className="cover-decoration bottom" />
        </section>

        {/* DETAILS SECTION */}
        <section className="details-section section" id="details">
          <RevealOnScroll className="section-heading">
            <p className="eyebrow">The Celebration</p>
            <h2 className="script">Wedding Details</h2>
            <p className="section-subtitle">Scratch each card to discover the details of our special day.</p>
          </RevealOnScroll>

          <RevealOnScroll className="wedding-details-box" delay={200}>
            <div className="wedding-detail">
              <div className="detail-symbol">♡</div>
              <span>DATE</span>
              <ScratchCard text={weddingData.event.date} width={240} height={60} isHeading />
              <p>{weddingData.event.day}</p>
            </div>
            <div className="detail-divider" />
            <div className="wedding-detail">
              <div className="detail-symbol">◷</div>
              <span>TIME</span>
              <ScratchCard text={weddingData.event.time} width={180} height={60} isHeading />
              <p>Please arrive by {weddingData.event.arrivalTime}</p>
            </div>
            <div className="detail-divider" />
            <div className="wedding-detail location-detail">
              <div className="detail-symbol">⌖</div>
              <span>LOCATION</span>
              <ScratchCard text={weddingData.event.venue} width={280} height={60} isHeading />
              <p>{weddingData.event.address}</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <button className="outline-button" onClick={addToCalendar}>+ Add to Calendar</button>
          </RevealOnScroll>
        </section>

        {/* COUNTDOWN SECTION */}
        <section className="countdown-section">
          <RevealOnScroll>
            <p className="eyebrow">Counting the moments</p>
            <h2 className="script">Until we say “I do”</h2>
            <Countdown />
          </RevealOnScroll>
        </section>

        {/* STORY SECTION */}
        <section className="story-section section" id="story">
          <RevealOnScroll className="story-image">
            <img src={weddingData.gallery[0]} alt="Wedding celebration" />
          </RevealOnScroll>
          <RevealOnScroll className="story-copy" delay={200}>
            <p className="eyebrow">Our Story</p>
            <h2 className="script">Two hearts, one beautiful journey </h2>
            <p>From the first hello to this unforgettable day, our journey has been filled with moments we will treasure forever.</p>
            <p>Now, surrounded by the people we love, we are ready to begin the next chapter of our story.</p>
            <div className="signature">{weddingData.bride.firstName} & {weddingData.groom.firstName}</div>
          </RevealOnScroll>
        </section>

        {/* MAP SECTION */}
        <section className="map-section">
          <RevealOnScroll className="map-card">
            <p className="eyebrow">The Venue</p>
            <h2 className="script">{weddingData.event.venue}</h2>
            <p>{weddingData.event.address}</p>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <iframe src={weddingData.event.mapEmbedUrl} title="Wedding venue map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <a className="outline-button map-button" href={weddingData.event.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
          </RevealOnScroll>
        </section>

        {/* SCHEDULE SECTION */}
        <section className="schedule-section section" id="schedule">
          <RevealOnScroll className="section-heading">
            <p className="eyebrow">The Day</p>
            <h2 className="script">Order of Events</h2>
          </RevealOnScroll>

          <div className="timeline">
            {weddingData.timeline.map((item, index) => (
              <RevealOnScroll className="timeline-item" key={item.time} delay={index * 150}>
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* SPLIT SECTION (DRESS/GIFT) */}
        <section className="split-section">
          <RevealOnScroll className="split-card dress">
            <p className="eyebrow">What to Wear</p>
            <h2 className="script">Dress Code</h2>
            <div className="dress-swatches"><span /><span /><span /><span /></div>
            <p>{weddingData.event.dressCode}</p>
          </RevealOnScroll>
          <RevealOnScroll className="split-card gift" delay={150}>
            <p className="eyebrow">With Love</p>
            <h2 className="script">Gift Preference</h2>
            <div className="gift-icon">♡</div>
            <p>{weddingData.event.giftPreference}</p>
          </RevealOnScroll>
        </section>

        {/* GALLERY SECTION */}
        <section className="gallery-section section" id="gallery">
          <RevealOnScroll className="section-heading">
            <p className="eyebrow">Memories</p>
            <h2 className="script">A Glimpse of Love</h2>
          </RevealOnScroll>
          <div className="gallery-grid">
            {weddingData.gallery.map((image, index) => (
              <RevealOnScroll key={index} delay={index * 100}>
                <img src={image} alt={`Wedding memory ${index + 1}`} loading="lazy" />
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* RSVP SECTION */}
        <section className="rsvp-section section" id="rsvp">
          <RevealOnScroll className="rsvp-card">
            <p className="eyebrow">Kindly Reply</p>
            <h2 className="script">Will you join us?</h2>
            <p className="section-subtitle">Please let us know if you will be celebrating with us.</p>

            {rsvpSent ? (
              <div className="success-message">
                <div className="floating-hearts-container">
                  <div className="floating-heart" style={{left: "10%", animationDelay: "0s"}}>♡</div>
                  <div className="floating-heart" style={{left: "50%", animationDelay: "0.2s"}}>♡</div>
                  <div className="floating-heart" style={{left: "85%", animationDelay: "0.4s"}}>♡</div>
                </div>
                <div className="success-icon">✓</div>
                <h3>Thank you!</h3>
                <p>Your RSVP has been received.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit}>
                <input required placeholder="Your name" />
                <input required type="email" placeholder="Email address" />
                <select required defaultValue="">
                  <option value="" disabled>Will you attend?</option>
                  <option>Joyfully accepts</option>
                  <option>Regretfully declines</option>
                </select>
                <input type="number" min="1" max="10" placeholder="Number of guests" />
                <textarea rows="4" placeholder="A message for the couple" />
                <button className="gold-button" type="submit">Send RSVP</button>
              </form>
            )}
          </RevealOnScroll>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <RevealOnScroll>
            <div className="ornament">❦</div>
            <h2 className="script">{weddingData.bride.firstName} & {weddingData.groom.firstName}</h2>
            <p>{weddingData.event.date}</p>
            <button className="share-button" onClick={shareInvitation}>Share Invitation</button>
            <p className="footer-note">Made with love for our special day</p>
          </RevealOnScroll>
        </footer>

        <button className="floating-share" onClick={shareInvitation} aria-label="Share">↗</button>
      </div>
    </>
  );
}