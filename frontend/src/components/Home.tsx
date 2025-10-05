import React from "react";

const styles = `
:root {
  --neon: #AAFF00;
}
* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; background: #000; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
/* Vector font */
@font-face {
  font-family: 'Vector';
  src: url('../../fonts/NetworkFreeVersion.ttf');
  font-weight: 400 900;
  font-style: normal;
  font-display: swap;
}
/* Neue Montreal Medium */
@font-face {
  font-family: 'Neue Montreal';
  src: url('../../fonts/NeueMontreal-Medium.otf') format('opentype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
.canvas {
  position: relative;
  width: 440px;
  height: 956px;
  border-radius: 24px;
  overflow: hidden;
  background: #111;
  color: #fff;
}
.bg {
  position: absolute;
  inset: 0;
  background-image: url('/assets/background.png');
  background-size: cover;
  background-position: center;
}
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
.logo-block { position: absolute; left: 0; right: 0; top: 30%; display: grid; place-items: center; padding: 0; }
.logo { width: 150%; max-width: none; height: auto; display: block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
.cta-wrapper { position: absolute; left: 0; right: 0; top: 65%; display: grid; place-items: center; }
.cta-button { background: var(--neon); color: #0A0A0A; border: 0; padding: 12px 28px; border-radius: 24px; font-weight: 700; font-size: 18px; cursor: pointer; }
.cta-button:hover { filter: brightness(1.05); }
.caption-wrapper { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px; }
.caption { margin: 0; text-transform: uppercase; color: #EDEDED; font-weight: 500; font-size: 26.49px; line-height: 1; letter-spacing: 0; text-align: center; font-family: 'Neue Montreal', Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
.caption-highlight { color: #fff; text-decoration: underline; }
`;

const Home: React.FC = () => {
  // Adiciona o CSS dinamicamente uma vez!
  React.useEffect(() => {
    if (!document.getElementById("home-inline-css")) {
      const style = document.createElement("style");
      style.id = "home-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="page">
      <div className="canvas">
        <div className="bg" role="img" aria-label="Imagem de fundo"></div>
        <div className="overlay"></div>
        <div className="logo-block">
          <img
            className="logo"
            src="/assets/logoperifa.png"
            alt="Logo Perifa"
          />
        </div>
        <div className="cta-wrapper">
          <button className="cta-button" type="button" onClick={handleLogin}>
            Login →
          </button>
        </div>
        <div className="caption-wrapper">
          <p className="caption">
            PRA VOCÊ QUE PRECISA
            <br />
            PENSAR <span className="caption-highlight">DIFERENTE</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
