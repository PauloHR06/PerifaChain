import React, { useState } from "react";
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        alert("Falha no login. Verifique seus dados e tente novamente.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      // Redireciona para fluxo geral
      window.location.href = "/fluxo-geral";
    } catch (err) {
      alert("Erro na conexão. Tente novamente mais tarde.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="canvas">
        <div className="content">
          <header className="hero">
            <div className="line">A SUA</div>
            <div className="line mix">
              <span className="neue">DE</span>
              <span className="network">JORNADA</span>
            </div>
            <div className="line">DE IMPACTO</div>
            <div className="line underline">
              COMEÇA <span className="underline-mark">AQUI</span>
            </div>
          </header>

          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <label className="input input-user">
              <span className="icon" aria-hidden="true">
                ✶
              </span>
              <input
                type="text"
                placeholder="Costa.silveira"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>
            <label className="input input-pass">
              <span className="icon" aria-hidden="true">
                <img src='/assets/cadeado.png' alt="cadeado" />
              </span>
              <input
                type="password"
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </label>
            <button
              className="btn"
              type="submit"
              disabled={loading}
              style={{ marginTop: 24 }}
            >
              {loading ? "Entrando..." : "Continuar"}
            </button>
          </form>

          <footer className="foot">
            <p className="muted">
              Ainda não tem conta? <a href="#" className="link">Crie agora</a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
