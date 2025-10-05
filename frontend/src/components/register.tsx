import React, { useState, useEffect } from "react";

const styles = `
@font-face{font-family:"NeueMontreal";src:url("../../fonts/NeueMontreal-Medium.otf") format("opentype");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"NetworkFree";src:url("../../fonts/NetworkFreeVersion.ttf") format("truetype");font-weight:700;font-style:normal;font-display:swap}
:root{--ink:#0a0a0a;--green:#AAFF00;--bg:#111}
*{box-sizing:border-box}html,body{height:100%}
body.preview{background:#e9e9e9;display:grid;place-items:center;padding:20px}
.phone-viewport{width:440px;height:956px;background:var(--green);color:var(--ink);border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15),0 2px 10px rgba(0,0,0,.08);position:relative;display:flex;flex-direction:column}

.content{padding:28px 24px 28px;display:flex;flex-direction:column;gap:16px}

/* Hero */
/* Hero positioned as in mock */
.title{margin:0; text-align:center; position:absolute; left:42px; top:59px; width:354px; height:223px}
.title .line{display:block}
.title .block{font-family:"NeueMontreal"; font-weight:800; font-size:36px; line-height:1; margin:4px 0; letter-spacing:-0.04em}
.title .script{font-family:"NetworkFree"; font-size:72px; line-height:.86; margin:0 0 -2px 0}
.title .underline{ text-decoration-line: underline; text-decoration-thickness: 4px; text-underline-offset: 4px }

/* Form positioned under hero (centered with same width) */
.form{position:absolute !important; left:42px; top:450px !important; width:354px; display:flex; flex-direction:column; gap:14px}
.field{position:relative}
.icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);font-weight:800}
.icon img{width:16px;height:16px;display:block}
.icon.lock{font-size:14px}
.field input{width:100%;border:2px solid #0a0a0a;border-radius:999px;background:#fff;padding:14px 18px 14px 44px;font-family:"NeueMontreal";font-size:16px}
.field input::placeholder{color:#9aa19d}

/* CTA aligned to mock */
.cta{position:relative; left:50%; transform:translateX(-50%); bottom:84px; display:inline-block;border:none;background:#0a0a0a;color:#fff;font-weight:800;font-size:18px;padding:14px 28px;border-radius:999px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25); margin-top: 90px;}

/* Foot below CTA */
.foot{position:absolute; left:50%; transform:translateX(-50%); bottom:40px; color:#0a0a0a; text-align:center}
.login-link{color:#0a0a0a;font-weight:800;text-decoration:underline}
`;

type RegisterData = {
  nome: string;
  email: string;
  role: string;
  senha: string;
  confirmar: string;
};

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterData>({
    nome: "",
    email: "",
    role: "",
    senha: "",
    confirmar: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!document.getElementById("register-inline-css")) {
      const style = document.createElement("style");
      style.id = "register-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome,
          email: form.email,
          role: form.role,
          password: form.senha,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erro ao cadastrar.");
        setLoading(false);
        return;
      } else {
        setSuccess("Cadastro realizado com sucesso!");
        if (form.role.toLowerCase() === "investor") {
          window.location.href = "/investor-dashboard";
        } else if (form.role.toLowerCase() === "artist") {
          window.location.href = "/artist-dashboard";
        } else {
          window.location.href = "/";
        }
      }
      setForm({
        nome: "",
        email: "",
        role: "",
        senha: "",
        confirmar: "",
      });
    } catch {
      setError("Erro de conexão com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div className="phone-viewport">
      <main className="content">
        <header className="hero">
          <h1 className="title">
            <img 
              src="/assets/logojornada.png" 
              alt="A sua jornada de impacto começa aqui" 
              style={{ width: '100%', maxWidth: '350px', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </h1>
        </header>
        <form className="form" id="register-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="icon star" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
                stroke="#0a0a0a" strokeWidth={2} strokeLinecap="round">
                <path d="M12 3v18M3 12h18M5.2 5.2l13.6 13.6M18.8 5.2L5.2 18.8" />
              </svg>
            </span>
            <input
              type="text"
              name="nome"
              placeholder="Caroline Moraes Paz"
              required
              value={form.nome}
              onChange={handleChange}
            />
          </label>
          <label className="field">
            <span className="icon star" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
                stroke="#0a0a0a" strokeWidth={2} strokeLinecap="round">
                <path d="M12 3v18M3 12h18M5.2 5.2l13.6 13.6M18.8 5.2L5.2 18.8" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="email@exemplo.com"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label className="field">
            <span className="icon star" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
                stroke="#0a0a0a" strokeWidth={2} strokeLinecap="round">
                <path d="M12 3v18M3 12h18M5.2 5.2l13.6 13.6M18.8 5.2L5.2 18.8" />
              </svg>
            </span>
            <input
              type="text"
              name="role"
              placeholder="investor ou artist"
              required
              value={form.role}
              onChange={handleChange}
            />
          </label>
          <label className="field">
            <span className="icon lock">
              <img src="/assets/cadeado.png" alt="cadeado" />
            </span>
            <input
              type="password"
              name="senha"
              placeholder="*************"
              required
              value={form.senha}
              onChange={handleChange}
            />
          </label>
          <label className="field">
            <span className="icon lock">
              <img src="/assets/cadeado.png" alt="cadeado" />
            </span>
            <input
              type="password"
              name="confirmar"
              placeholder="*************"
              required
              value={form.confirmar}
              onChange={handleChange}
            />
          </label>
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
          <button className="cta" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
        <p className="foot">
          Já tem conta? <a href="/login" className="login-link">Faça Login</a>
        </p>
      </main>
    </div>
  );
};

export default Register;
