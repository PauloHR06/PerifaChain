import React, { useRef, useEffect, useState } from "react";

type Artist = {
  id: string;
  name?: string;
  bio?: string;
  bgColor?: string;
};

// Coloque o CSS aqui como uma string
const styles = `
:root {
  --bg: #ffffff;
  --ink: #0a0a0a;
  --muted: #6b6b6b;
  --brand: #AAFF00;
  --card-radius: 28px;
}
@font-face {
  font-family: "NeueMontreal";
  src: url("../../fonts/NeueMontreal-Medium.otf") format("opentype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "NetworkFree";
  src: url("../../fonts/NetworkFreeVersion.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: "NeueMontreal", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
body.preview {
  background: #e9e9e9;
  display: grid;
  place-items: center;
  padding: 20px;
}
.phone-viewport {
  width: 440px;
  height: 956px;
  background: var(--bg);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.15), 0 2px 10px rgba(0,0,0,.08);
  display: flex;
  flex-direction: column;
  position: relative;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}
.icon-button {
  all: unset;
  cursor: pointer;
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border-radius: 8px;
}
.menu-icon {
  width: 26px; height: 3px; background: var(--ink); position: relative; display: inline-block;
}
.menu-icon::before, .menu-icon::after {
  content: ""; position: absolute; left: 0; right: 0; height: 3px; background: var(--ink);
}
.menu-icon::before { top: -7px; }
.menu-icon::after { top: 7px; }
.toplink { 
  text-decoration-line: underline; 
  text-decoration-thickness: 2px; 
  text-underline-offset: 3px; 
  color: var(--ink); 
  font-size: 14px; 
  letter-spacing: .5px; 
  font-weight: 800; 
}
.content { padding: 0 16px 24px; max-width: 480px; margin: 0 auto; color: #0a0a0a;}
.preview .content { max-width: 440px; width: 100%; }
.phone-viewport { display: flex; flex-direction: column; }
.content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.title-block { margin: -112px 0 12px; text-align: center; }
.title { font-family: "NeueMontreal", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 500; font-size: 42px; line-height: .95; margin: 8px 0; }
.title .tag, .title .tag .hash { font-family: "NetworkFree", Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif; font-size: .9em; font-weight: 800; }
.title .tag { display: block; margin-top: 2px; }
.carousel-wrap { position: relative; margin: 8px auto; }
.carousel {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 86%;
  gap: 16px;
  overflow-x: auto;
  padding: 6px 8px 2px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center; 
  align-items: center;     
}
.carousel::-webkit-scrollbar { height: 8px; }
.carousel::-webkit-scrollbar-thumb { background: #e6e6e6; border-radius: 99px; }
.nav {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  z-index: 2;
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  color: var(--ink);
  background: #f2f2f2;
  cursor: pointer;
}
.nav.prev { left: -6px; }
.nav.next { right: -6px; }
.card {
  scroll-snap-align: start;
  background: var(--brand);
  border-radius: var(--card-radius);
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 560px;
  display: flex;
  margin: 18px;
}
.card-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: stretch; width: 100%; }
.card-copy { z-index: 1; display: flex; flex-direction: column; min-height: 100%; }
.card-photo { align-self: end; }
.card-photo img { width: 100%; height: auto; display: block; filter: grayscale(100%); mix-blend-mode: multiply; }
.card.no-photo .card-inner { grid-template-columns: 1fr; align-items: start; }
.card.no-photo { min-height: 480px; padding-top: 24px; padding-bottom: 24px; }
.card.no-photo .artist-bio { max-width: 30ch; }
.card--livia { background: var(--brand); }
.card--bruno { background: #111; color: #fff; }
.card--yasmin { background: #f6f6f6; }
.artist-name { font-weight: 800; letter-spacing: .5px; font-size: 36px; margin: 0 0 12px; line-height: .94; }
.card--bruno .artist-name { color: #fff; }
.artist-bio { margin: 0 0 18px; color: var(--ink); max-width: 22ch; }
.card--bruno .artist-bio { color: #eaeaea; }
.actions { display: grid; gap: 10px; margin-top: auto; }
.btn { 
  display: inline-block; text-decoration: none; text-align: center; cursor: pointer;
  border-radius: 22px; padding: 10px 16px; font-weight: 600; font-size: 14px;
}
.btn.primary { background: #0a0a0a; color: #fff; border: 2px solid #0a0a0a; }
.btn.ghost { background: transparent; color: #fff; border: 1.5px solid #ffffff55; font-size: 12px; padding: 10px 14px; }
.card--livia .btn.ghost { color: #0a0a0a; border-color: #0a0a0a44; }
.card--yasmin .btn.ghost { color: #0a0a0a; border-color: #0a0a0a44; }
.card--bruno .btn.primary { background: #AAFF00; border-color: #AAFF00; color: #0a0a0a; }
.phone-viewport .hint {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 799px;
  width: 272px;
  color: #0a0a0a;
  margin: 0;
  text-align: center;
  font-family: "NeueMontreal", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 500;
  font-size: 16.22px;
  line-height: 22px;
}
@media (min-width: 420px) {
  .carousel { grid-auto-columns: 75%; }
  .artist-name { font-size: 40px; }
  .card { min-height: 480px; }
}
`;

const ArtistsList: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Injeta o CSS apenas uma vez
  useEffect(() => {
    if (!document.getElementById("artists-inline-css")) {
      const style = document.createElement("style");
      style.id = "artists-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3000/artists", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data.artists) ? data.artists : [];
        setArtists(arr.map((artist: Artist, i: number) => ({
          ...artist,
          bgColor: i === 1 ? "#111" : i === 2 ? "#f6f6f6" : "#AAFF00"
        })));
      })
      .catch(() => setArtists([]));
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const getStep = () => Math.round(carousel.clientWidth * 0.8);
    const prev = document.querySelector(".nav.prev");
    const next = document.querySelector(".nav.next");
    if (!prev || !next) return;
    const handlePrev = () => carousel.scrollBy({ left: -getStep(), behavior: "smooth" });
    const handleNext = () => carousel.scrollBy({ left: getStep(), behavior: "smooth" });
    prev.addEventListener("click", handlePrev);
    next.addEventListener("click", handleNext);

    let isDown = false, startX = 0, scrollLeft = 0;
    const start = (x: number) => { isDown = true; startX = x; scrollLeft = carousel.scrollLeft; };
    const move = (x: number) => { if (!isDown) return; carousel.scrollLeft = scrollLeft - (x - startX); };
    const end = () => { isDown = false; };
    carousel.addEventListener("mousedown", (e) => start(e.pageX));
    carousel.addEventListener("mousemove", (e) => move(e.pageX));
    window.addEventListener("mouseup", end);
    carousel.addEventListener("touchstart", (e) => start(e.touches[0].pageX), { passive: true });
    carousel.addEventListener("touchmove", (e) => move(e.touches[0].pageX), { passive: true });
    carousel.addEventListener("touchend", end);

    return () => {
      prev.removeEventListener("click", handlePrev);
      next.removeEventListener("click", handleNext);
      carousel.removeEventListener("mousedown", (e) => start(e.pageX));
      carousel.removeEventListener("mousemove", (e) => move(e.pageX));
      window.removeEventListener("mouseup", end);
      carousel.removeEventListener("touchstart", (e) => start(e.touches[0].pageX));
      carousel.removeEventListener("touchmove", (e) => move(e.touches[0].pageX));
      carousel.removeEventListener("touchend", end);
    };
  }, [artists]);

  return (
    <div className="phone-viewport">
      <header className="topbar">
        <button className="icon-button" aria-label="Menu">
          <span className="menu-icon" />
        </button>
        <a className="toplink" href="#">
          SOBRE O PERIFACHAIN
        </a>
      </header>
      <main className="content">
        <section className="title-block">
          <h1 className="title">
            ARTISTAS{" "}
            <span className="tag">
              <span className="hash">#</span>PERIFA
            </span>
          </h1>
        </section>
        <section className="carousel-wrap">
          <button className="nav prev" aria-label="Anterior">‹</button>
          <div className="carousel" id="carousel" ref={carouselRef}>
            {artists.length === 0 ? (
              <>Carregando artistas...</>
            ) : (
              artists.map((artist) => (
                <article
                  key={artist.id}
                  className={`card ${
                    artist.bgColor === "#AAFF00"
                      ? "card--livia"
                      : artist.bgColor === "#111"
                      ? "card--bruno"
                      : "card--yasmin"
                  } no-photo`}
                  style={{ backgroundColor: artist.bgColor }}
                >
                  <div className="card-inner">
                    <div className="card-copy">
                      <h2 className="artist-name">
                        {artist.name ? (
                          <>
                            {artist.name.split(" ")[0]}
                            <br />
                            {artist.name.split(" ").slice(1).join(" ")}
                          </>
                        ) : (
                          "Artista sem nome"
                        )}
                      </h2>
                      <p className="artist-bio">
                        {artist.bio || "Sem descrição"}
                      </p>
                      <div className="actions">
                        <button className="btn primary">Investir</button>
                        <a className="btn ghost" href="#">
                          Conheça mais sobre{" "}
                          {artist.name ? artist.name.split(" ")[0] : "Artista"}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          <button className="nav next" aria-label="Próximo">›</button>
        </section>
        <p className="hint">
          Passe para o lado, conheça e invista em quem nasce na quebrada e gera impacto no mundo.
        </p>
      </main>
    </div>
  );
};

export default ArtistsList;
