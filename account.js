// account.js — VERSÃO ESTÁVEL

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Página carregada");

  carregarDadosDoBackend();
});

// ==================== BACKEND ====================

async function carregarDadosDoBackend() {
  try {
    mostrarLoading(true);

    const response = await fetch("/api/dashboard");

    if (!response.ok) throw new Error("Falha HTTP");

    const result = await response.json();

    if (result?.success && result.data) {
      localStorage.setItem("itens", JSON.stringify(result.data.itens || []));
      renderizarTudo(result.data);
    } else {
      carregarDadosLocalStorage();
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
    carregarDadosLocalStorage();
  } finally {
    mostrarLoading(false);
  }
}

function renderizarTudo(data = {}) {
  carregarTabelaItens();
  carregarGrafico();
  carregarEstatisticas(data.estatisticas);
}

function carregarDadosLocalStorage() {
  console.log("⚠️ Usando localStorage");
  renderizarTudo();
}

// ==================== LOADING ====================

function mostrarLoading(mostrar) {
  let loading = document.getElementById("loading");

  if (mostrar) {
    if (!loading) {
      loading = document.createElement("div");
      loading.id = "loading";
      loading.className =
        "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50";
      loading.innerHTML = `
        <div class="bg-white p-4 rounded-lg text-center">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
          <p class="mt-2">Carregando...</p>
        </div>
      `;
      document.body.appendChild(loading);
    }
  } else {
    loading?.remove();
  }
}

// ==================== GRÁFICO ====================

function carregarGrafico() {
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("statusChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const itens = JSON.parse(localStorage.getItem("itens") || "[]");

  const emUso = itens.filter((i) => i?.status === "em_uso").length;
  const comDefeito = itens.filter((i) => i?.status === "defeito").length;
  const manutencao = itens.filter((i) => i?.status === "manutencao").length;

  if (window.meuGrafico) window.meuGrafico.destroy();

  window.meuGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Em Uso", "Com Defeito", "Em Manutenção"],
      datasets: [
        {
          data: [emUso || 0, comDefeito || 0, manutencao || 0],
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

// ==================== ESTATÍSTICAS ====================

function carregarEstatisticas(estatisticas = null) {
  const itens = JSON.parse(localStorage.getItem("itens") || "[]");

  const total = estatisticas?.total ?? itens.length;

  const statsContainer = document.querySelector(
    ".grid-cols-1.md\\:grid-cols-4"
  );

  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-4">
      <p class="text-sm text-gray-500">Total de Itens</p>
      <p class="text-2xl font-bold">${total}</p>
    </div>
  `;
}

// ==================== TABELA ====================

function carregarTabelaItens() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  const itens = JSON.parse(localStorage.getItem("itens") || "[]");

  tbody.innerHTML = "";

  itens.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-gray-900">
        ${item.patrimonio || "-"}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.nome || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.categoria || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.localizacao || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.responsavel || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}