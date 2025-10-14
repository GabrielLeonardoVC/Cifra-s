function carregar(pagina) {
  const conteudo = document.getElementById("conteudo");

  // Limpa o conteúdo anterior
  conteudo.innerHTML = "";

  if (pagina === "inicio") {
    conteudo.innerHTML = `
      <h2 class="bemvindo">Bem-vindo ao Cifra's</h2>
      <p class="descricao">
        Aqui você encontra todos os cantos da celebração organizados por ordem litúrgica.<br>
        Clique no menu ao lado para acessar cada momento da missa.
      </p>
    `;
  }

  if (pagina === "entrada") {
    conteudo.innerHTML = `
      <h2 class="bemvindo">Canto de Entrada</h2>
      <div class="musica-card">
        <h3>À Senhora Aparecida</h3>
        <p><strong>Compositor:</strong> Padre Zezinho</p>
        <p><strong>Tom:</strong> G</p>
      </div>
      <div class="navegacao">
        <button onclick="carregar('inicio')">← Voltar</button>
        <button onclick="carregar('penitencial')">Próximo →</button>
      </div>
    `;
  }

  if (pagina === "penitencial") {
    conteudo.innerHTML = `
      <h2 class="bemvindo">Ato Penitencial</h2>
      <div class="musica-card">
        <h3>Senhor, Tende Piedade</h3>
        <p><strong>Tom:</strong> A</p>
      </div>
      <div class="navegacao">
        <button onclick="carregar('entrada')">← Voltar</button>
        <button onclick="carregar('gloria')">Próximo →</button>
      </div>
    `;
  }

  // Atualiza o botão ativo no menu
  document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("ativo"));
  const btnAtivo = Array.from(document.querySelectorAll("nav button"))
    .find(b => b.textContent.includes(pagina.charAt(0).toUpperCase() + pagina.slice(1)));
  if (btnAtivo) btnAtivo.classList.add("ativo");

  // Rola para o topo automaticamente
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function alternarModo() {
  document.body.classList.toggle("dark-mode");
}

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
}
