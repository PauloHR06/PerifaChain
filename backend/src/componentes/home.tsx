import React from "react";
import "./Home.css";

const Home: React.FC = () => (
  <div className="home-bg">
    <img src="background.png" className="background-img" alt="Fundo" />
    <div className="container">
      <img src="logo.png" className="logo-img" alt="Logo Perifa" />
      <button className="login-btn">Login →</button>
      <div className="footer-text">
        PRA VOCÊ QUE PRECISA <br />
        PENSAR <span className="dif">DIFERENTE</span>
      </div>
    </div>
  </div>
);

export default Home;
