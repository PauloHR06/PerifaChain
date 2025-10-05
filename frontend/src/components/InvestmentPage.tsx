import React, { useState, useEffect } from "react";

const styles = `
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
:root{
  --bg:#000;
  --ink:#fff;
  --accent:#AAFF00;
  --radius:16px;
}
*{box-sizing:border-box}
html,body{height:100%}
body.preview{background:#e9e9e9; display:grid; place-items:center; padding:20px;}
.phone-viewport{width:440px; height:956px; background:var(--bg); color:var(--ink); border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.15), 0 2px 10px rgba(0,0,0,.08); position:relative; display:flex; flex-direction:column}
.topbar{display:flex; align-items:center; justify-content:space-between; padding:16px 24px}
.icon-button{all:unset; cursor:pointer; width:36px; height:36px; display:grid; place-items:center; border-radius:8px}
.menu-icon{width:26px; height:3px; background:#fff; position:relative; display:inline-block}
.menu-icon::before,.menu-icon::after{content:""; position:absolute; left:0; right:0; height:3px; background:#fff}
.menu-icon::before{top:-7px}
.menu-icon::after{top:7px}
.toplink{color:#fff; font-weight:800; font-size:14px; text-decoration-line:underline; text-decoration-thickness:2px; text-underline-offset:3px}
.content{padding:6px 24px 140px; display:flex; flex-direction:column; gap:18px}
.headline{margin-top:22px;}
.h-title{margin:0; text-align:center; font-family:"NeueMontreal",system-ui; font-weight:500; color:#fff; line-height:1.02}
.h-title .line{display:block}
.h-title .line-1{font-size:36px; letter-spacing:.2px}
.h-title .line-2{font-size:44px; color:var(--accent); font-weight:800; margin-top:2px}
.h-title .line-3{font-size:36px; letter-spacing:.2px; margin-top:2px}
.h-title .arrow{font-weight:900}
.form{display:flex; flex-direction:column; gap:16px; margin-top:18px}
.field{display:block}
.field input,.field textarea{width:100%; background:transparent; color:#fff; border:2px solid var(--accent); border-radius:10px; padding:14px 16px; font-family:"NeueMontreal",system-ui; font-size:15px; outline:none }
.field input::placeholder,.field textarea::placeholder{color:#c9ffc0; opacity:.65}
.field.text textarea{resize:vertical; min-height:120px}
.cta{position:absolute; left:50%; transform:translateX(-50%); bottom:96px; margin:0; display:inline-block; border:none; background:#fff; color:#0a0a0a; font-weight:800; font-size:16px; padding:12px 28px; border-radius:999px; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.25)}
.cta:active{transform:translateY(1px)}
`;

type LoanFormData = {
  nome: string;
  idade: number;
  cep: string;
  projeto: string;
  descricao: string;
};

const LoanForm: React.FC = () => {
  const [form, setForm] = useState<LoanFormData>({
    nome: "",
    idade: 0,
    cep: "",
    projeto: "",
    descricao: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document.getElementById("loan-form-inline-css")) {
      const style = document.createElement("style");
      style.id = "loan-form-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "idade" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.nome ||
      form.idade < 10 ||
      form.idade > 120 ||
      !form.cep ||
      !form.projeto ||
      !form.descricao
    ) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        alert("Erro ao enviar pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      alert("Pedido enviado com sucesso!");
      setForm({
        nome: "",
        idade: 0,
        cep: "",
        projeto: "",
        descricao: "",
      });
    } catch (error) {
      alert("Erro na conexão. Tente novamente mais tarde.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="phone-viewport">
      <header className="topbar">
        <button className="icon-button" aria-label="Menu">
          <span className="menu-icon"></span>
        </button>
        <a className="toplink" href="/artists">
          SOBRE O PERIFACHAIN
        </a>
      </header>
      <main className="content">
        <section className="headline">
          <h1 className="h-title">
            <span className="line line-1">AQUI,</span>
            <span className="line line-2 accent">SONHAR</span>
            <span className="line line-3">
              É SÓ O COMEÇO <span className="arrow">→</span>
            </span>
          </h1>
        </section>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <input
              type="text"
              name="nome"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label className="field">
            <input
              type="number"
              name="idade"
              placeholder="Idade"
              min={10}
              max={120}
              value={form.idade || ""}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label className="field">
            <input
              type="text"
              name="cep"
              placeholder="CEP / Local / Comunidade"
              value={form.cep}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label className="field">
            <input
              type="text"
              name="projeto"
              placeholder="O nome do seu Projeto"
              value={form.projeto}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label className="field text">
            <textarea
              name="descricao"
              placeholder={`Conte mais sobre o seu projeto.
Qual a visão que move sua ideia?
De onde vem a força do seu projeto?
Seja livre para expressar sua ideia.`}
              rows={6}
              value={form.descricao}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>

          <button type="submit" className="cta" disabled={loading}>
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default LoanForm;
