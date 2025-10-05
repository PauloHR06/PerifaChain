import React from "react";
import "../styles/Home.css"; // ajuste o caminho se necessário

const Home: React.FC = () => {
  const handleLogin = () => {
    // Redireciona para a rota de login (exemplo)
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
