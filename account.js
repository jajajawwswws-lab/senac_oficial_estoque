// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard iniciado");
  carregarDashboard();
});

// ================= API =================

async function carregarDashboard() {
  try {
    const res = await fetch("/api/dashboard");

    if (!res.ok) throw new Error("Falha HTTP");

    const json = await res.json();

    if (json?.success) {
      const itens = json.data?.itens || [];
      localStorage.setItem("itens", JSON.stringify(itens));

      renderTabela(itens);
      renderGrafico(itens);
    } else {
      usarLocalStorage();
    }
  } catch (err) {
    console.warn("Usando cache local:", err);
    usarLocalStorage();
  }
}

function usarLocalStorage() {
  const itens = JSON.parse(localStorage.getItem("itens") || "[]");
  renderTabela(itens);
  renderGrafico(itens);
}

// ================= TABELA =================

function renderTabela(itens) {
  const tbody = document.getElementById("tabelaItens");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!itens.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-6 text-gray-400">
          Nenhum item encontrado
        </td>
      </tr>
    `;
    return;
  }

  itens.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-gray-900">
        ${item.id || "-"}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.nome || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.categoria || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.localizacao || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${item.responsavel || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= GRÁFICO =================

function renderGrafico(itens) {
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("statusChart");
  if (!canvas) return;

  const emUso = itens.filter(i => i.status === "em_uso").length;
  const defeito = itens.filter(i => i.status === "defeito").length;
  const manut = itens.filter(i => i.status === "manutencao").length;

  if (window.graficoStatus) {
    window.graficoStatus.destroy();
  }

  window.graficoStatus = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Em Uso", "Defeito", "Manutenção"],
      datasets: [{
        data: [emUso, defeito, manut],
        backgroundColor: ["#10B981", "#EF4444", "#F97316"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      cutout: "70%"
    }
  });
}