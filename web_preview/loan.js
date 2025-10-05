(function(){
  const form = document.getElementById('loan-form');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Simple front validation
    const missing = Object.entries(data).filter(([k,v]) => !String(v || '').trim());
    if (missing.length) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    console.log('Pedido de empréstimo:', data);
    alert('Obrigado! Recebemos seu pedido.');
  });
})();
