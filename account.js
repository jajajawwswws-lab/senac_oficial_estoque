// account.js — VERSÃO CORRIGIDA E ROBUSTA

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Página carregada");

  carregarDadosDoBackend();

  // ==================== BACKEND ====================

  async function carregarDadosDoBackend() {
    try {
      mostrarLoading(true);

      const response = await fetch("/api/dashboard");

      if (!response.ok) throw new Error("Falha HTTP");

      const result = await response.json();

      if (result?.success && result.data) {
        console.log("✅ Dados carregados do backend:", result.data);

        // cache local
        localStorage.setItem("itens", JSON.stringify(result.data.itens || []));
        localStorage.setItem(
          "defeitos",
          JSON.stringify(result.data.defeitos || [])
        );
        localStorage.setItem(
          "manutencoes",
          JSON.stringify(result.data.manutencoes || [])
        );
        localStorage.setItem(
          "comentarios",
          JSON.stringify(result.data.comentarios || [])
        );
        localStorage.setItem(
          "historico",
          JSON.stringify(result.data.historico || [])
        );

        renderizarTudo(result.data);
      } else {
        console.error("Erro ao carregar dados:", result?.error);
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
    carregarItensDefeito();
    carregarItensManutencao();
    carregarGrafico();
    carregarAtividadesRecentes(data.historico);
    carregarEstatisticas(data.estatisticas);
  }

  function carregarDadosLocalStorage() {
    console.log("⚠️ Usando dados do localStorage (fallback)");
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
            data: [
              emUso || 0,
              comDefeito || 0,
              manutencao || 0
            ],
            backgroundColor: ["#10B981", "#EF4444", "#F97316"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        cutout: "70%"
      }
    });
  }

  // ==================== ESTATÍSTICAS ====================

  function carregarEstatisticas(estatisticas = null) {
    const itens = JSON.parse(localStorage.getItem("itens") || "[]");

    const total = estatisticas?.total ?? itens.length;
    const emUso =
      estatisticas?.emUso ??
      itens.filter((i) => i?.status === "em_uso").length;
    const comDefeito =
      estatisticas?.comDefeito ??
      itens.filter((i) => i?.status === "defeito").length;
    const emManutencao =
      estatisticas?.emManutencao ??
      itens.filter((i) => i?.status === "manutencao").length;

    const statsContainer = document.querySelector(
      ".grid-cols-1.md\\:grid-cols-4"
    );

    if (!statsContainer) return;

    statsContainer.innerHTML = `
      ${cardStat("Total de Itens", total, "fa-boxes", "blue")}
      ${cardStat("Em Uso", emUso, "fa-check-circle", "green")}
      ${cardStat("Com Defeito", comDefeito, "fa-exclamation-triangle", "red")}
      ${cardStat("Em Manutenção", emManutencao, "fa-tools", "orange")}
    `;
  }

  function cardStat(label, value, icon, color) {
    return `
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center">
          <div class="p-3 bg-${color}-100 rounded-full mr-4">
            <i class="fas ${icon} text-${color}-600 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">${label}</p>
            <p class="text-2xl font-bold">${value}</p>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== TABELA ====================

  function carregarTabelaItens() {
    const tbody = document.querySelector("tbody");
    if (!tbody) return;

    const itens = JSON.parse(localStorage.getItem("itens") || "[]");

    tbody.innerHTML = "";

    itens
      .slice()
      .sort((a, b) => (a?.id || 0) - (b?.id || 0))
      .forEach((item) => {
        const tr = document.createElement("tr");

        const statusClasse =
          item.status === "em_uso"
            ? "bg-green-100 text-green-800"
            : item.status === "defeito"
            ? "bg-red-100 text-red-800"
            : "bg-orange-100 text-orange-800";

        const statusTexto =
          item.status === "em_uso"
            ? "Em Uso"
            : item.status === "defeito"
            ? "Com Defeito"
            : "Em Manutenção";

        tr.innerHTML = `
          <td class="px-6 py-4 text-sm font-medium text-gray-900">
            ${item.patrimonio || `#ITM-${String(item.id || 0).padStart(3, "0")}`}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">${item.nome || "-"}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${item.categoria || "-"}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${item.localizacao || "-"}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${item.responsavel || "-"}</td>
          <td class="px-6 py-4 text-sm">
            <span class="px-2 py-1 text-xs rounded-full ${statusClasse}">
              ${statusTexto}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <button class="visual text-blue-600 mr-2" data-id="${item.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="defeito text-red-600 mr-2" data-id="${item.id}">
              <i class="fas fa-exclamation-triangle"></i>
            </button>
            <button class="manutencao text-purple-600 mr-2" data-id="${item.id}">
              <i class="fas fa-tools"></i>
            </button>
            <button class="lixeira text-gray-600" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;

        tbody.appendChild(tr);
      });

    configurarBotoesTabela();
  }

  // ==================== BOTÕES ====================

  function configurarBotoesTabela() {
    // remover
    document.querySelectorAll(".lixeira").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!id) return;

        if (!confirm("🗑️ Remover item?")) return;

        try {
          mostrarLoading(true);

          const response = await fetch(`/api/itens/${id}`, {
            method: "DELETE"
          });

          const result = await response.json();

          if (result?.success) {
            alert("✅ Item removido!");
            carregarDadosDoBackend();
          } else {
            alert("❌ Erro ao remover");
          }
        } catch (e) {
          console.error(e);
          alert("❌ Falha de conexão");
        } finally {
          mostrarLoading(false);
        }
      };
    });
  }

  // ==================== SIDEBAR ====================

  window.toggleSidebar = function () {
    document.querySelector(".sidebar")?.classList.toggle("collapsed");
  };
});