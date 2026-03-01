document.addEventListener("DOMContentLoaded", () => {

        // Toggle sidebar
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('collapsed');
        }

        // Status Chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Em Uso', 'Com Defeito', 'Em Manutenção'],
                datasets: [{
                    data: [856, 142, 250],
                    backgroundColor: [
                        '#10B981',
                        '#EF4444',
                        '#F97316'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                },
                cutout: '70%'
            }
        });

        // Add animation to cards on hover
        document.querySelectorAll('.card-hover').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('transform');
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('transform');
            });
        });


    function additem()
    {
        alert("botao clicado para teste js");
    }
    
   const btnadd = document.getElementById("btnAdicionarItem");
   btnadd.addEventListener("click", additem);

const defeitobtn = document.querySelectorAll(".btndefeito");

defeitobtn.forEach(bttn => {
    bttn.addEventListener("click", (event) => {
        // 1. Encontra o container pai (div com class="flex")
        const container = event.currentTarget.closest('.flex');
        
        // 2. Dentro do container, procura a descrição
        const descricaoElement = container.querySelector('.description_dft');
        
        // 3. Pega o texto atual
        const defeitoAtual = descricaoElement.textContent;
        
        // 4. Mostra prompt para editar
        const descricao_defeito = prompt("Qual o defeito do item?", defeitoAtual);
        
        if (descricao_defeito && descricao_defeito.trim() !== "") {
            // 5. ATUALIZA O TEXTO NA TELA!
            descricaoElement.textContent = descricao_defeito;
            
            // 6. Salva (se necessário)
            const produto = bttn.dataset.produto;
            salvar_defeito(produto, descricao_defeito);
            
            alert(`Defeito atualizado para: ${descricao_defeito}`);
        }
    });
});

    function salvar_defeito(produto, descricao)
    {
        const descricoes = JSON.parse(localStorage.getItem('descricoes')) || [];
        descricoes.push(
            {
                id: Date.now(),
                produto: produto,
                descricao: descricao,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR')
            });
        localStorage.setItem('descricoes', JSON.stringify(descricoes));
    }
    function atualizar_pag()
    {
        const lista = document.getElementById('item_dft');
        const defeito = JSON.parse(localStorage.getItem('description_dft')) || [];
        lista.innerHTML = '';
        defeito.forEach(item=>
            {
                const li = document.createElement('li');
                li.innerHTML = `
                
            <strong>${item.produto}</strong>: ${item.defeito}
            <br><small>${item.data} às ${item.hora}</small>
            <button onclick="removerDefeito(${item.id})">×</button>
                
                
                `;
                
                lista.appendChild(li);
            });
    }
        const manutencaobtnPositive = document.querySelectorAll(".positive");
        manutencaobtnPositive.forEach(pst=>
            {
                pst.addEventListener("click", () =>
                    {
                        alert("Item foi recuperado com sucesso.");
                    });
            });
        const manutencaoNegative = document.querySelectorAll(".negative");
        manutencaoNegative.forEach(ngt=>
            {
                ngt.addEventListener("click", ()=>
                    {
                        alert("Item ainda com defeito deseja descartar ou tentar recupera-lo.");
                    });
            });



        const ocultar = document.querySelectorAll(".visual");
        ocultar.forEach(vz=>
            {
                vz.addEventListener("click", ()=>
                    {
                        const motivo = prompt("porque voce deseja ocultar?");
                        if(motivo)
                            {
                                vz.style.display = ".visual";
                                console.log(`Ocultado porque: ${motivo}`);
                            }
                    });
            });
        
        const coment = document.querySelectorAll(".comentario");
        coment.forEach(cm=>
            {
                cm.addEventListener("click",()=>
                    {
                        const feedback = prompt("qual comentario voce deseja colocar no item selecionado? ");
                        if(feedback){
                            vz.style.display = ".comentario";
                               console.log(`Comentado porque: ${feedback}`);
                        }
                    });
            });
        const lixo = document.querySelectorAll(".lixeira");
        lixo.forEach(lixo=>
            {
                lixo.addEventListener("click", ()=>
                    {
                        alert("item removido.");
                    });
            });
            


//description_dft
//item_dft

});
