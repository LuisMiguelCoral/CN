document.addEventListener('DOMContentLoaded', function() {
    const nInput = document.getElementById('n');
    const equacoesContainer = document.getElementById('equacoes-container');
    const calcularBtn = document.getElementById('calcular-btn');
    const matrizOriginalDiv = document.getElementById('matriz-original');
    const etapasDiv = document.getElementById('etapas');
    const resultadosDiv = document.getElementById('resultados');
    
    // Atualizar equações quando n mudar
    nInput.addEventListener('change', atualizarEquacoes);
    
    // Inicializar equações
    atualizarEquacoes();
    
    // Configurar evento de cálculo
    calcularBtn.addEventListener('click', calcularGauss);
    
    function atualizarEquacoes() {
        const n = parseInt(nInput.value);
        equacoesContainer.innerHTML = '';
        
        for (let i = 0; i < n; i++) {
            const div = document.createElement('div');
            div.className = 'mb-3';
            
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = `Equação ${i+1}:`;
            
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            
            // Criar inputs para cada coeficiente
            for (let j = 0; j < n; j++) {
                const coefInput = document.createElement('input');
                coefInput.type = 'text';
                coefInput.className = 'form-control coeficiente';
                coefInput.placeholder = `Coef. x${j+1}`;
                coefInput.dataset.linha = i;
                coefInput.dataset.variavel = j;
                coefInput.value = i === j ? '1' : '0';
                
                const span = document.createElement('span');
                span.className = 'input-group-text';
                span.textContent = `x${j+1} ${j < n-1 ? '+' : ''}`;
                
                inputGroup.appendChild(coefInput);
                inputGroup.appendChild(span);
            }
            
            // Input para o resultado
            const resultadoInput = document.createElement('input');
            resultadoInput.type = 'text';
            resultadoInput.className = 'form-control resultado';
            resultadoInput.placeholder = 'Resultado';
            resultadoInput.dataset.linha = i;
            resultadoInput.value = '0';
            
            const igualSpan = document.createElement('span');
            igualSpan.className = 'input-group-text';
            igualSpan.textContent = '=';
            
            inputGroup.appendChild(igualSpan);
            inputGroup.appendChild(resultadoInput);
            
            div.appendChild(label);
            div.appendChild(inputGroup);
            equacoesContainer.appendChild(div);
        }
    }
    
    function parseCoeficiente(valor) {
        // Converter string para número, tratando casos especiais
        if (valor === '' || valor === '+') return 1;
        if (valor === '-') return -1;
        
        // Remover espaços e verificar se é fração
        valor = valor.replace(/\s/g, '');
        
        // Verificar se é fração (formato a/b)
        const fracMatch = valor.match(/^(-?\d+)\/(-?\d+)$/);
        if (fracMatch) {
            return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
        }
        
        // Verificar se é decimal
        return parseFloat(valor) || 0;
    }
    
    function obterMatriz() {
        const n = parseInt(nInput.value);
        const matriz = [];
        
        for (let i = 0; i < n; i++) {
            matriz[i] = [];
            
            // Obter coeficientes
            for (let j = 0; j < n; j++) {
                const input = document.querySelector(`.coeficiente[data-linha="${i}"][data-variavel="${j}"]`);
                matriz[i][j] = parseCoeficiente(input.value);
            }
            
            // Obter resultado
            const resultadoInput = document.querySelector(`.resultado[data-linha="${i}"]`);
            matriz[i][n] = parseCoeficiente(resultadoInput.value);
        }
        
        return matriz;
    }
    
    function formatarEquacao(linha, n) {
        let equacao = '';
        for (let j = 0; j < n; j++) {
            const valor = linha[j];
            
            if (valor !== 0) {
                if (equacao !== '') {
                    equacao += valor >= 0 ? ' + ' : ' - ';
                } else if (valor < 0) {
                    equacao += '-';
                }
                
                const absValor = Math.abs(valor);
                if (absValor !== 1) {
                    // Verificar se é inteiro ou decimal
                    equacao += Number.isInteger(absValor) ? absValor : absValor.toFixed(3);
                }
                
                equacao += `x${j+1}`;
            }
        }
        
        // Se todos os coeficientes são zero
        if (equacao === '') {
            equacao = '0';
        }
        
        equacao += ` = ${linha[n]}`;
        return equacao;
    }
    
    function formatarMatrizParaExibicao(matriz, n) {
        let html = '<table class="table table-bordered table-sm matriz-tabela">';
        
        for (let i = 0; i < n; i++) {
            html += '<tr>';
            for (let j = 0; j < n + 1; j++) {
                const valor = matriz[i][j];
                const classe = j === n ? 'resultado-cell' : '';
                html += `<td class="${classe}">${valor.toFixed(3)}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        return html;
    }
    
    function calcularGauss() {
        const n = parseInt(nInput.value);
        const matriz = obterMatriz();
        
        // Limpar resultados anteriores
        matrizOriginalDiv.innerHTML = '';
        etapasDiv.innerHTML = '';
        resultadosDiv.innerHTML = '';
        
        // Exibir matriz original
        let matrizHTML = '<strong>Sistema Original:</strong><br>';
        matrizHTML += '<div class="equacoes">';
        for (let i = 0; i < n; i++) {
            matrizHTML += `<div>Eq${i+1}: ${formatarEquacao(matriz[i], n)}</div>`;
        }
        matrizHTML += '</div>';
        
        matrizHTML += '<strong>Matriz Ampliada:</strong><br>';
        matrizHTML += formatarMatrizParaExibicao(matriz, n);
        
        matrizOriginalDiv.innerHTML = matrizHTML;
        
        // Aplicar eliminação de Gauss
        let resultado = eliminacaoGauss(matriz, n);
        
        // Exibir resultados
        resultadosDiv.innerHTML = resultado;
    }
    
    function eliminacaoGauss(matriz, n) {
        let output = '<strong>Sistema Triangularizado:</strong><br>';
        let etapasOutput = '<strong>Etapas do Processo:</strong><br>';
        
        // Fase de eliminação
        for (let k = 0; k < n; k++) {
            // Exibir etapa atual
            etapasOutput += `<div class="etapa mt-3"><strong>Etapa ${k+1} (Eliminar x${k+1} das equações abaixo):</strong><br>`;
            
            // Pivoteamento parcial
            let iMax = k;
            for (let i = k + 1; i < n; i++) {
                if (Math.abs(matriz[i][k]) > Math.abs(matriz[iMax][k])) {
                    iMax = i;
                }
            }
            
            // Trocar linhas se necessário
            if (iMax !== k) {
                etapasOutput += `<div class="text-primary">Trocando linha ${k+1} com linha ${iMax+1}</div>`;
                
                let temp = matriz[k];
                matriz[k] = matriz[iMax];
                matriz[iMax] = temp;
                
                // Exibir matriz após troca
                etapasOutput += '<div class="mt-2">Após troca:</div>';
                etapasOutput += formatarMatrizParaExibicao(matriz, n);
            }
            
            // Eliminação
            for (let i = k + 1; i < n; i++) {
                if (matriz[k][k] === 0) {
                    etapasOutput += `<div class="text-danger">Divisão por zero detectada. O sistema pode não ter solução única.</div>`;
                    continue;
                }
                
                let fator = matriz[i][k] / matriz[k][k];
                etapasOutput += `<div class="mt-2">Eliminando x${k+1} da equação ${i+1}:</div>`;
                etapasOutput += `<div>Fator = ${matriz[i][k].toFixed(3)} / ${matriz[k][k].toFixed(3)} = ${fator.toFixed(3)}</div>`;
                etapasOutput += `<div>Nova Eq${i+1} = Eq${i+1} - (${fator.toFixed(3)}) * Eq${k+1}</div>`;
                
                for (let j = k; j < n + 1; j++) {
                    matriz[i][j] -= fator * matriz[k][j];
                }
                
                // Exibir matriz após esta operação
                etapasOutput += '<div class="mt-2">Resultado:</div>';
                etapasOutput += formatarMatrizParaExibicao(matriz, n);
            }
            
            etapasOutput += '</div>';
        }
        
        // Exibir sistema triangularizado
        output += '<div class="equacoes">';
        for (let i = 0; i < n; i++) {
            output += `<div>Eq${i+1}: ${formatarEquacao(matriz[i], n)}</div>`;
        }
        output += '</div>';
        
        output += '<strong>Matriz Triangularizada:</strong><br>';
        output += formatarMatrizParaExibicao(matriz, n);
        
        // Resolução por substituição regressiva
        output += '<div class="mt-3"><strong>Solução por Substituição Regressiva:</strong><br>';
        
        const solucao = new Array(n);
        for (let i = n - 1; i >= 0; i--) {
            let soma = 0;
            for (let j = i + 1; j < n; j++) {
                soma += matriz[i][j] * solucao[j];
            }
            solucao[i] = (matriz[i][n] - soma) / matriz[i][i];
            
            output += `<div>x${i+1} = (${matriz[i][n].toFixed(3)} - ${soma.toFixed(3)}) / ${matriz[i][i].toFixed(3)} = ${solucao[i].toFixed(6)}</div>`;
        }
        
        output += '</div><div class="mt-3"><strong>Solução do Sistema:</strong><br>';
        for (let i = 0; i < n; i++) {
            output += `<div class="solucao">x${i+1} = ${solucao[i].toFixed(6)}</div>`;
        }
        output += '</div>';
        
        // Exibir as etapas
        etapasDiv.innerHTML = etapasOutput;
        
        return output;
    }
});