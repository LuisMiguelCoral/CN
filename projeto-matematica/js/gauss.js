document.addEventListener('DOMContentLoaded', function() {
    const nInput = document.getElementById('n');
    const equacoesContainer = document.getElementById('equacoes-container');
    const calcularBtn = document.getElementById('calcular-btn');
    const matrizOriginalDiv = document.getElementById('matriz-original');
    const etapasDiv = document.getElementById('etapas');
    const resultadosDiv = document.getElementById('resultados');

    nInput.addEventListener('change', atualizarEquacoes);

    atualizarEquacoes();

    calcularBtn.addEventListener('click', calcularGaussLU);

    function atualizarEquacoes() {
        const n = parseInt(nInput.value);
        equacoesContainer.innerHTML = '';

        for (let i = 0; i < n; i++) {
            const div = document.createElement('div');
            div.className = 'mb-3';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = `Equação ${i + 1}:`;

            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';

            for (let j = 0; j < n; j++) {
                const coefInput = document.createElement('input');
                coefInput.type = 'text';
                coefInput.className = 'form-control coeficiente';
                coefInput.placeholder = `Coef. x${j + 1}`;
                coefInput.dataset.linha = i;
                coefInput.dataset.variavel = j;
                coefInput.value = i === j ? '1' : '0';

                const span = document.createElement('span');
                span.className = 'input-group-text';
                span.textContent = `x${j + 1} ${j < n - 1 ? '+' : ''}`;

                inputGroup.appendChild(coefInput);
                inputGroup.appendChild(span);
            }

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
        if (valor === '' || valor === '+') return 1;
        if (valor === '-') return -1;
        valor = valor.replace(/\s/g, '');
        const fracMatch = valor.match(/^(-?\d+)\/(-?\d+)$/);
        if (fracMatch) {
            return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
        }
        return parseFloat(valor) || 0;
    }

    function obterMatriz() {
        const n = parseInt(nInput.value);
        const matriz = [];
        const b = [];

        for (let i = 0; i < n; i++) {
            matriz[i] = [];
            for (let j = 0; j < n; j++) {
                const input = document.querySelector(`.coeficiente[data-linha="${i}"][data-variavel="${j}"]`);
                matriz[i][j] = parseCoeficiente(input.value);
            }
            const resultadoInput = document.querySelector(`.resultado[data-linha="${i}"]`);
            b[i] = parseCoeficiente(resultadoInput.value);
        }

        return { matriz, b };
    }

    function formatarEquacao(linha, n, variaveis) {
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
                    equacao += Number.isInteger(absValor) ? absValor : absValor.toFixed(3);
                }
                equacao += `${variaveis[j]}`;
            }
        }
        if (equacao === '') {
            equacao = '0';
        }
        return equacao;
    }
    
    function formatarMatrizParaExibicao(matriz) {
        let html = '<table class="table table-bordered table-sm matriz-tabela">';
        if (!matriz || matriz.length === 0) return '';
        const n = matriz.length;
        const m = matriz[0].length;

        for (let i = 0; i < n; i++) {
            html += '<tr>';
            for (let j = 0; j < m; j++) {
                const valor = matriz[i][j];
                html += `<td>${valor.toFixed(3)}</td>`;
            }
            html += '</tr>';
        }

        html += '</table>';
        return html;
    }

    function formatarVetorParaExibicao(vetor, nomeVariavel) {
        let html = '<div class="matriz-vetor">';
        html += '<table class="table table-bordered table-sm matriz-tabela">';
        for (let i = 0; i < vetor.length; i++) {
            html += `<tr><td>${nomeVariavel}${i+1}</td><td>${vetor[i].toFixed(6)}</td></tr>`;
        }
        html += '</table>';
        html += '</div>';
        return html;
    }

    function calcularGaussLU() {
        const n = parseInt(nInput.value);
        const { matriz: A_original, b: b_original } = obterMatriz();

        matrizOriginalDiv.innerHTML = '';
        etapasDiv.innerHTML = '';
        resultadosDiv.innerHTML = '';
        
        let A_modificada = A_original.map(row => row.slice()); 

        let matrizHTML = '<h3>Matriz Original</h3>';
        matrizHTML += '<div class="row"><div class="col-6"><strong>Matriz A</strong>';
        matrizHTML += formatarMatrizParaExibicao(A_original);
        matrizHTML += '</div><div class="col-6"><strong>Vetor B</strong>';
        matrizHTML += formatarVetorParaExibicao(b_original, 'b');
        matrizHTML += '</div></div>';
        matrizOriginalDiv.innerHTML = matrizHTML;

        const { L, U, p, det } = decomposicaoLU(A_modificada, n);
        
        if (det === 0) {
            resultadosDiv.innerHTML = '<div class="alert alert-danger mt-3">Determinante é zero. O sistema não tem solução única.</div>';
            return;
        }

        const b_reordenado = p.map(idx => b_original[idx]);

        const y = new Array(n).fill(0);
        etapasDiv.innerHTML += '<h3 class="mt-3">Passo 1: Resolvendo Ly = b\' (Substituição Progressiva)</h3>';
        for (let i = 0; i < n; i++) {
            let soma = 0;
            for (let j = 0; j < i; j++) {
                soma += L[i][j] * y[j];
            }
            y[i] = (b_reordenado[i] - soma) / L[i][i];
            etapasDiv.innerHTML += `<div>y${i + 1} = (${b_reordenado[i].toFixed(3)} - ${soma.toFixed(3)}) / ${L[i][i].toFixed(3)} = ${y[i].toFixed(6)}</div>`;
        }

        const x = new Array(n).fill(0);
        etapasDiv.innerHTML += '<h3 class="mt-3">Passo 2: Resolvendo Ux = y (Substituição Regressiva)</h3>';
        for (let i = n - 1; i >= 0; i--) {
            let soma = 0;
            for (let j = i + 1; j < n; j++) {
                soma += U[i][j] * x[j];
            }
            x[i] = (y[i] - soma) / U[i][i];
            etapasDiv.innerHTML += `<div>x${i + 1} = (${y[i].toFixed(3)} - ${soma.toFixed(3)}) / ${U[i][i].toFixed(3)} = ${x[i].toFixed(6)}</div>`;
        }

        resultadosDiv.innerHTML += '<hr class="my-4">';
        resultadosDiv.innerHTML += '<h3>Resultados Finais</h3>';
        resultadosDiv.innerHTML += '<div class="row">';
        resultadosDiv.innerHTML += '<div class="col-md-6"><strong>Matriz L</strong>' + formatarMatrizParaExibicao(L) + '</div>';
        resultadosDiv.innerHTML += '<div class="col-md-6"><strong>Matriz U</strong>' + formatarMatrizParaExibicao(U) + '</div>';
        resultadosDiv.innerHTML += '</div>';

        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Determinante (det(A))</strong>: ' + det.toFixed(6) + '</div>';
        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Vetor de Soluções X</strong>' + formatarVetorParaExibicao(x, 'x') + '</div>';
        
        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Sistema Triangularizado:</strong></div>';
        let triangularizadoHTML = '<div class="equacoes">';
        for (let i = 0; i < n; i++) {
            const linhaU = U[i];
            const linhaB = y[i];
            const equacao = formatarEquacao(linhaU, n, Array.from({ length: n }, (_, j) => `x${j + 1}`)) + ` = ${linhaB.toFixed(3)}`;
            triangularizadoHTML += `<div>Eq${i + 1}: ${equacao}</div>`;
        }
        triangularizadoHTML += '</div>';
        resultadosDiv.innerHTML += triangularizadoHTML;
        
        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Matriz Triangularizada:</strong>' + formatarMatrizParaExibicao(U) + '</div>';
        
        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Solução por Substituição Regressiva:</strong></div>';
        for (let i = n - 1; i >= 0; i--) {
            resultadosDiv.innerHTML += `<div>x${i + 1} = (${y[i].toFixed(3)} - Soma) / ${U[i][i].toFixed(3)} = ${x[i].toFixed(6)}</div>`;
        }

        resultadosDiv.innerHTML += '<div class="mt-4"><strong>Solução do Sistema:</strong>' + formatarVetorParaExibicao(x, 'x') + '</div>';
    }

    function decomposicaoLU(matrizA, n) {
        const A = matrizA.map(row => row.slice()); 
        const L = [];
        const U = A;
        const p = new Array(n).fill(0).map((_, i) => i);
        let det = 1;

        for (let i = 0; i < n; i++) {
            L[i] = new Array(n).fill(0);
            L[i][i] = 1;
        }

        for (let k = 0; k < n; k++) {
            let iMax = k;
            for (let i = k + 1; i < n; i++) {
                if (Math.abs(A[p[i]][k]) > Math.abs(A[p[iMax]][k])) {
                    iMax = i;
                }
            }

            if (A[p[iMax]][k] === 0) {
                det = 0;
                return { L, U, p, det };
            }

            if (iMax !== k) {
                [p[k], p[iMax]] = [p[iMax], p[k]];
                det *= -1;
            }

            for (let i = k + 1; i < n; i++) {
                L[p[i]][k] = A[p[i]][k] / A[p[k]][k];
                for (let j = k; j < n; j++) {
                    A[p[i]][j] -= L[p[i]][k] * A[p[k]][j];
                }
            }
        }

        const finalU = [];
        const finalL = [];
        for (let i = 0; i < n; i++) {
            finalU[i] = A[p[i]];
            finalL[i] = L[p[i]];
        }

        const L_reordenada = new Array(n).fill(0).map(() => new Array(n).fill(0));
        const U_reordenada = new Array(n).fill(0).map(() => new Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                U_reordenada[i][j] = A[p[i]][j];
                if (i > j) {
                    L_reordenada[i][j] = A[p[i]][j] / U_reordenada[j][j];
                } else if (i === j) {
                    L_reordenada[i][j] = 1;
                }
            }
        }

        let detCalculado = det;
        for (let i = 0; i < n; i++) {
            detCalculado *= U_reordenada[i][i];
        }

        return { L: L_reordenada, U: U_reordenada, p, det: detCalculado };
    }
});
