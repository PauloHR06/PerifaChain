import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
@font-face { font-family: 'NeueMontreal'; src: url('../fonts/NeueMontreal-Medium.otf') format('opentype'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'NetworkFree'; src: url('../fonts/NetworkFreeVersion.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }

:root { --neon: #AAFF00; }
* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; background: #000; font-family: 'NeueMontreal', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }

.page { min-height: 100vh; display: grid; place-items: center; }
.canvas { position: relative; width: 440px; height: 956px; border-radius: 24px; overflow: hidden; background: var(--neon); color: #000; }
.content { position: absolute; inset: 0; padding: 32px 24px; display: grid; grid-template-rows: auto auto 1fr; }

.hero { margin-top: 34px; text-align: center; color: #000; }
.hero .line { font-family: 'NeueMontreal', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 500; font-size: 51.55px; line-height: 55.07px; letter-spacing: -0.04em; text-transform: uppercase; }
.hero .line.mix { display: flex; justify-content: center; gap: 10px; align-items: baseline; }
.hero .neue { font-family: 'NeueMontreal'; font-weight: 500; font-size: 51.55px; line-height: 55.07px; letter-spacing: -0.04em; text-transform: uppercase; }
.hero .network { font-family: 'NetworkFree', Impact, sans-serif; font-size: 56px; line-height: 0.9; text-transform: uppercase; }
.hero .underline { font-weight: 500; }
.hero .underline .underline-mark { border-bottom: 3px solid #000; }

.form { position: absolute; top: 431.72px; left: 70px; width: 300px; display: grid; gap: 14px; }
.input { display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 10px; background: #fff; border-radius: 118px; height: 61.95px; padding: 0 16px; border: 1.97px solid #000; box-shadow: none; overflow: hidden; }
.input .icon { width: 20px; height: 20px; display: grid; place-items: center; justify-self: center; font-size: 17px; line-height: 1; text-align: center; }
.input-user .icon { color: #000; }
.input-pass .icon { color: #000; }
.input-pass .icon svg { width: 17px; height: 17px; display: block; }
.input input { border: 0; outline: 0; font-size: 16px; font-family: 'NeueMontreal'; color: #111; height: 100%; background: transparent; border-radius: inherit; -webkit-appearance: none; appearance: none; }
.input input::placeholder { color: #9AA0A6; }

.btn {
  width: 171.1px;
  height: 54.08px;
  display: grid;
  place-items: center;
  border: 0;
  background: #000;
  color: #fff;
  padding: 0 16px;
  border-radius: 59px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  margin: 24px auto 0;
}
.foot { position: absolute; top: 810.62px; left: 50%; transform: translateX(-50%); width: 256px; height: 20px; text-align: center; }
.foot .muted { margin: 0; color: #0A0A0A; font-size: 16px; font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 600; }
.foot .link { color: #0A0A0A; font-weight: 700; text-decoration: underline; }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document.getElementById("login-inline-css")) {
      const style = document.createElement("style");
      style.id = "login-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

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

      // Redireciona para a lista de artistas após login bem-sucedido
      navigate("/artists");
    } catch (err) {
      alert("Erro na conexão. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="canvas">
        <div className="content">
          <header className="hero">
            <img 
              src="/assets/logojornada.png" 
              alt="A sua jornada de impacto começa aqui" 
              style={{ width: '100%', maxWidth: '350px', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </header>

          <form className="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <label className="input input-user">
              <span className="icon" aria-hidden="true">✶</span>
              <input
                type="text"
                placeholder="Costa.silveira"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </label>
            <label className="input input-pass">
              <span className="icon" aria-hidden="true">
                <img src="/assets/cadeado.png" alt="cadeado" />
              </span>
              <input
                type="password"
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </label>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Continuar"}
            </button>
          </form>
          <p className="foot">
            Ainda não tem conta? <a href="/register" className="link">Crie agora</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
