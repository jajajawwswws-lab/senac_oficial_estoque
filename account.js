
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Página carregada");

  if (!localStorage.getItem("itens")) localStorage.setItem("itens", JSON.stringify([]));

  carregarTabelaItens();
  carregarGrafico();

  // Botão adicionar item
  document.getElementById("btnAdicionarItem")?.addEventListener("click", () => {
    adicionarItem();
  });
});

function adicionarItem() {
  const nome = prompt("Nome do item:");
  if (!nome) return;

  const categoria = prompt("Categoria:");
  if (!categoria) return;

  const localizacao = prompt("Localização:");
  if (!localizacao) return;

  const responsavel = prompt("Responsável:");
  if (!responsavel) return;

  const patrimonio = prompt("Número de Patrimônio (opcional):");

  const novoItem = {
    id: Date.now(),
    nome,
    categoria,
    localizacao,
    responsavel,
    patrimonio: patrimonio || `PAT-${String(Date.now()).slice(-3)}`,
    status: "em_uso",
  };

  const itens = JSON.parse(localStorage.getItem("itens"));
  itens.push(novoItem);
  localStorage.setItem("itens", JSON.stringify(itens));

  carregarTabelaItens();
  carregarGrafico();
}

function carregarTabelaItens() {
  const tbody = document.getElementById("tabelaItens");
  if (!tbody) return;

  const itens = JSON.parse(localStorage.getItem("itens") || "[]");
  tbody.innerHTML = "";

  itens.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-gray-900">${item.patrimonio}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.nome}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.categoria}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.localizacao}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.responsavel}</td>
      <td class="px-6 py-4 text-sm text-gray-500">
        <button class="status-em-uso px-2 py-1 rounded mr-1">Em Uso</button>
        <button class="status-defeito px-2 py-1 rounded mr-1">Defeito</button>
        <button class="status-manutencao px-2 py-1 rounded">Manutenção</button>
        <button class="remover px-2 py-1 rounded ml-2">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);

    atualizarBotoesStatus(tr, item.status);

    // Adicionar eventos
    tr.querySelector(".status-em-uso").addEventListener("click", () => atualizarStatus(item.id, "em_uso"));
    tr.querySelector(".status-defeito").addEventListener("click", () => atualizarStatus(item.id, "defeito"));
    tr.querySelector(".status-manutencao").addEventListener("click", () => atualizarStatus(item.id, "manutencao"));
    tr.querySelector(".remover").addEventListener("click", () => removerItem(item.id));
  });
}

function atualizarBotoesStatus(tr, status) {
  const btnEmUso = tr.querySelector(".status-em-uso");
  const btnDefeito = tr.querySelector(".status-defeito");
  const btnManutencao = tr.querySelector(".status-manutencao");

  btnEmUso.className = `status-em-uso px-2 py-1 rounded mr-1 ${status === "em_uso" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`;
  btnDefeito.className = `status-defeito px-2 py-1 rounded mr-1 ${status === "defeito" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-500"}`;
  btnManutencao.className = `status-manutencao px-2 py-1 rounded ${status === "manutencao" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-500"}`;
}

// ===== ATUALIZAR STATUS =====
function atualizarStatus(id, status) {
  const itens = JSON.parse(localStorage.getItem("itens") || "[]");
  const index = itens.findIndex((i) => i.id === id);
  if (index !== -1) {
    itens[index].status = status;
    localStorage.setItem("itens", JSON.stringify(itens));
    carregarTabelaItens();
    carregarGrafico();
  }
}

function removerItem(id) {
  if (!confirm("Deseja realmente remover este item?")) return;

  let itens = JSON.parse(localStorage.getItem("itens") || "[]");
  itens = itens.filter((i) => i.id !== id);
  localStorage.setItem("itens", JSON.stringify(itens));

  carregarTabelaItens();
  carregarGrafico();
}

function carregarGrafico() {
  const ctx = document.getElementById("statusChart")?.getContext("2d");
  if (!ctx) return;

  const itens = JSON.parse(localStorage.getItem("itens") || "[]");
  const emUso = itens.filter((i) => i.status === "em_uso").length;
  const defeito = itens.filter((i) => i.status === "defeito").length;
  const manutencao = itens.filter((i) => i.status === "manutencao").length;

  if (window.meuGrafico) window.meuGrafico.destroy();

  window.meuGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Em Uso", "Com Defeito", "Em Manutenção"],
      datasets: [
        {
          data: [emUso, defeito, manutencao],
          backgroundColor: ["#10B981", "#EF4444", "#F97316"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      cutout: "70%",
    },
  });
}
