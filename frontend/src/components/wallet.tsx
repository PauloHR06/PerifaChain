import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const styles = `
@font-face{font-family:"NeueMontreal";src:url("../../fonts/NeueMontreal-Medium.otf") format("opentype");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"NetworkFree";src:url("../../fonts/NetworkFreeVersion.ttf") format("truetype");font-weight:700;font-style:normal;font-display:swap}
:root{--bg:#ffffff;--ink:#0a0a0a;--muted:#6b6b6b;--green:#AAFF00}
*{box-sizing:border-box}html,body{height:100%}
body.preview{background:#e9e9e9;display:grid;place-items:center;padding:20px}
.phone-viewport{width:440px;height:956px;background:var(--bg);color:var(--ink);border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15),0 2px 10px rgba(0,0,0,.08);position:relative;display:flex;flex-direction:column}

/* Top bar */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 28px}
.icon-button{all:unset;cursor:pointer;width:36px;height:36px;display:grid;place-items:center;border-radius:8px}
.menu-icon{width:26px;height:3px;background:var(--ink);position:relative;display:inline-block}
.menu-icon::before,.menu-icon::after{content:"";position:absolute;left:0;right:0;height:3px;background:var(--ink)}
.menu-icon::before{top:-7px}.menu-icon::after{top:7px}
.toplink{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;font-weight:800;color:var(--ink)}

.content{padding:16px 28px 104px;display:flex;flex-direction:column;gap:22px}

/* Header account */
.account{display:flex;align-items:center;justify-content:space-between}
.account .who .name{font-family:"NeueMontreal";font-weight:700;font-size:18px;letter-spacing:.2px}
.account .who .line{width:92px;height:2px;background:#000;opacity:.25;margin-top:8px;border-radius:2px}
.avatar{width:56px;height:56px;border-radius:50%;object-fit:cover}

/* Balance */
.balance .label{color:#7c7c7c;margin-top:8px;font-size:14px}
.balance .row{display:flex;align-items:center;justify-content:space-between}
.amount{font-size:40px;font-weight:800;letter-spacing:.2px}
.arrow{all:unset;cursor:pointer;font-size:26px}

/* Chips */
.chips{display:flex;gap:12px}
.chip{border:none;border-radius:999px;padding:12px 16px;background:#efefef;color:#0a0a0a;font-weight:800;cursor:pointer;font-size:14px}
.chip--primary{background:var(--green);box-shadow:0 6px 18px rgba(170,255,0,.35)}

.all-options{display:inline-block;margin:6px 0 8px;color:#000;text-decoration:underline;font-weight:800;letter-spacing:.3px;font-size:14px}

/* Promo card */
.promo-card{position:relative;background:var(--green);border-radius:32px;padding:36px;overflow:hidden;min-height:300px}
.shape{position:absolute;background:#0a0a0a}
.shape-a{top:-26px;left:70%;width:176px;height:88px;border-bottom-left-radius:22px}
.shape-b{right:-36px;top:30%;width:124px;height:180px;border-top-left-radius:28px}
.promo-copy h3{margin:0 0 16px 0;font-family:"NeueMontreal";font-size:28px;line-height:1.04;font-weight:700}
.promo-copy p{margin:0;color:#132;max-width:32ch;font-size:14px}

/* Help button */
.help{display:flex;justify-content:center}
.help-btn{border:none;background:#f4f4f4;border-radius:24px;padding:18px 20px;width:90%;font-weight:800;display:flex;align-items:center;justify-content:center;gap:10px;font-size:16px}
.help-btn .arr{font-weight:900}

/* Tab bar */
.tabbar{position:absolute;left:0;right:0;bottom:0;height:72px;background:#fff;display:flex;align-items:center;justify-content:space-around;border-top:1px solid #eee}
.tab{width:36px;height:36px;border-radius:10px;background:#eee;border:none}
.tab.active{background:var(--green)}
`;

type UserWallet = {
  name: string;
  avatar: string;
  wallet_address: string;
};

const BACKEND_URL = "http://localhost:3000/users/";
const RPC_URL = "https://rpc.ankr.com/eth";

const Wallet: React.FC = () => {
  const [user, setUser] = useState<UserWallet | null>(null);
  const [saldo, setSaldo] = useState<string>("Carregando...");

  useEffect(() => {
    if (!document.getElementById("wallet-inline-css")) {
      const style = document.createElement("style");
      style.id = "wallet-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(BACKEND_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  useEffect(() => {
    if (user?.wallet_address) {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      provider.getBalance(user.wallet_address).then((balance) => {
        setSaldo(
          "R$ " +
            Number(ethers.formatEther(balance)).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
        );
      });
    }
  }, [user]);

  return (
    <div className="phone-viewport">
      <header className="topbar">
        <button className="icon-button" aria-label="Menu">
          <span className="menu-icon"></span>
        </button>
        <a className="toplink" href="/artists.html">
          SOBRE O PERIFACHAIN
        </a>
      </header>
      <main className="content">
        <section className="account">
          <div className="who">
            <div className="name">
              {user?.name?.toUpperCase()?.replace(" ", "\n") ?? "Carregando..."}
            </div>
            <div className="line"></div>
          </div>
          <img
            className="avatar"
            src={user?.avatar ?? "../assets/liviamc.png"}
            alt={"Avatar da " + (user?.name ?? "Artista")}
          />
        </section>
        <section className="balance">
          <div className="label">Saldo</div>
          <div className="row">
            <div className="amount">{saldo}</div>
            <button className="arrow" aria-label="Detalhes">→</button>
          </div>
        </section>
        <section className="chips">
          <button className="chip chip--primary">PIX</button>
          <button className="chip">Pagar</button>
          <button className="chip" onClick={() => window.location.href = "/transactions"}>Extrato</button>
        </section>
        <a className="all-options" href="#">
          TODAS AS OPÇÕES DA SUA CONTA
        </a>
        <section className="promo">
          <div className="promo-card">
            <div className="shape shape-a"></div>
            <div className="promo-copy">
              <h3>
                FINANÇAS<br />
                PARA ARTISTAS<br />
                DA QUEBRADA
              </h3>
              <p>
                Descubra como organizar sua grana, investir no seu talento e
                transformar sua arte, sem perder sua essência.
              </p>
            </div>
          </div>
        </section>
        <section className="help">
          <button className="help-btn">
            Central de ajuda <span className="arr">→</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Wallet;
