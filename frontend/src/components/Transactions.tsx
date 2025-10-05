import React, { useState, useEffect } from "react";

const styles = `
@font-face{font-family:"NeueMontreal";src:url("../../fonts/NeueMontreal-Medium.otf") format("opentype");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"NetworkFree";src:url("../../fonts/NetworkFreeVersion.ttf") format("truetype");font-weight:700;font-style:normal;font-display:swap}
:root{--bg:#ffffff;--ink:#0a0a0a;--muted:#6b6b6b;--green:#AAFF00}
*{box-sizing:border-box}html,body{height:100%}
body.preview{background:#e9e9e9;display:grid;place-items:center;padding:20px}
.phone-viewport{width:440px;height:956px;background:var(--bg);color:var(--ink);border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15),0 2px 10px rgba(0,0,0,.08);position:relative;display:flex;flex-direction:column}

/* Top bar */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid #eee}
.back-button{all:unset;cursor:pointer;font-size:24px;font-weight:700;color:var(--ink)}
.page-title{font-family:"NeueMontreal";font-weight:700;font-size:18px;letter-spacing:.2px;margin:0}

.content{padding:24px 28px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;flex:1}

/* Transaction item */
.transaction{display:flex;align-items:center;justify-content:space-between;padding:16px;background:#f9f9f9;border-radius:16px;gap:12px}
.transaction-info{flex:1}
.transaction-title{font-family:"NeueMontreal";font-weight:700;font-size:16px;margin:0 0 4px 0}
.transaction-date{color:var(--muted);font-size:13px;margin:0}
.transaction-amount{font-weight:800;font-size:18px;letter-spacing:.2px}
.transaction-amount.positive{color:#00AA00}
.transaction-amount.negative{color:#CC0000}

.empty-state{text-align:center;padding:60px 20px;color:var(--muted)}
.empty-state h3{font-family:"NeueMontreal";font-weight:700;font-size:20px;margin:0 0 12px 0;color:var(--ink)}
`;

type Transaction = {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById("transactions-inline-css")) {
      const style = document.createElement("style");
      style.id = "transactions-inline-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    // Simula carregamento de transações
    // Você pode substituir isso por uma chamada real à API
    setTimeout(() => {
      setTransactions([
        {
          id: "1",
          title: "Investimento em Artista",
          date: "05/10/2025",
          amount: -500.00,
          type: "debit"
        },
        {
          id: "2",
          title: "Retorno de Investimento",
          date: "03/10/2025",
          amount: 150.00,
          type: "credit"
        },
        {
          id: "3",
          title: "Transferência Recebida",
          date: "01/10/2025",
          amount: 1000.00,
          type: "credit"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatAmount = (amount: number, type: "credit" | "debit") => {
    const formatted = amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return type === "credit" ? `+ R$ ${formatted}` : `- R$ ${formatted}`;
  };

  return (
    <div className="phone-viewport">
      <header className="topbar">
        <button className="back-button" onClick={() => window.location.href = "/wallet"} aria-label="Voltar">
          ←
        </button>
        <h1 className="page-title">Extrato</h1>
        <div style={{ width: "24px" }}></div>
      </header>
      <main className="content">
        {loading ? (
          <div className="empty-state">
            <h3>Carregando...</h3>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma transação</h3>
            <p>Você ainda não possui transações registradas.</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction">
              <div className="transaction-info">
                <h3 className="transaction-title">{transaction.title}</h3>
                <p className="transaction-date">{transaction.date}</p>
              </div>
              <div className={`transaction-amount ${transaction.type === "credit" ? "positive" : "negative"}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Transactions;
