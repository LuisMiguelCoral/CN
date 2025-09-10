document.addEventListener('DOMContentLoaded', function() {
    const grauInput = document.getElementById('grau');
    const coeficientesContainer = document.getElementById('coeficientes-container');
    const calcularBtn = document.getElementById('calcular-btn');
    const polinomioDiv = document.getElementById('polinomio');
    const resultadosDiv = document.getElementById('resultados');

    grauInput.addEventListener('change', atualizarCoeficientes);
    atualizarCoeficientes();
    calcularBtn.addEventListener('click', calcularBisseccao);

    function atualizarCoeficientes() {
        const grau = parseInt(grauInput.value);
        coeficientesContainer.innerHTML = '';

        for (let i = grau; i >= 0; i--) {
            const div = document.createElement('div');
            div.className = 'mb-2';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = `Coeficiente de x^${i}:`;

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control';
            input.step = 'any';
            input.value = i === grau ? '1' : '0';
            input.id = `coef-${i}`;

            div.appendChild(label);
            div.appendChild(input);
            coeficientesContainer.appendChild(div);
        }
    }

    function formatarPolinomio(coeficientes) {
        let resultado = '';
        let primeiroTermo = true;

        for (let i = coeficientes.length - 1; i >= 0; i--) {
            if (coeficientes[i] !== 0) {
                if (!primeiroTermo) {
                    resultado += coeficientes[i] > 0 ? ' + ' : ' - ';
                } else if (coeficientes[i] < 0) {
                    resultado += '-';
                }

                const absCoef = Math.abs(coeficientes[i]);
                resultado += absCoef === 1 && i > 0 ? '' : absCoef;

                if (i > 0) {
                    resultado += 'x';
                    if (i > 1) {
                        resultado += '^' + i;
                    }
                }
                primeiroTermo = false;
            }
        }

        return resultado || '0';
    }

    function calcularBisseccao() {
        const grau = parseInt(grauInput.value);
        const erro = parseFloat(document.getElementById('erro').value);
        const inicio = -1000;
        const fim = 1000;

        const coeficientes = [];
        for (let i = 0; i <= grau; i++) {
            coeficientes[i] = parseFloat(document.getElementById(`coef-${i}`).value) || 0;
        }

        polinomioDiv.innerHTML = `<strong>Polinômio:</strong> P(x) = ${formatarPolinomio(coeficientes)}`;

        const funcao = x => {
            let resultado = 0;
            for (let i = 0; i <= grau; i++) {
                resultado += coeficientes[i] * Math.pow(x, i);
            }
            return resultado;
        };

        const DIVISOES = 50;
        const passo = (fim - inicio) / DIVISOES;
        let output = '<h3>Passo a Passo do Método da Bissecção</h3><pre>';
        let raizEncontrada = false;

        for (let a = inicio; a < fim; a += passo) {
            let b = Math.min(a + passo, fim);
            let fa = funcao(a);
            let fb = funcao(b);

            if (fa * fb <= 0) {
                raizEncontrada = true;
                output += `\n--- Raiz detectada no intervalo [${a.toFixed(6)}, ${b.toFixed(6)}] ---\n`;
                const resultadoBisseccao = bissecaoComPassos(funcao, a, b, erro);
                output += resultadoBisseccao.log;
                output += `\n✔ Raiz aproximada: ${resultadoBisseccao.raiz.toFixed(10)}\n`;
                output += `f(raiz) = ${funcao(resultadoBisseccao.raiz).toExponential(5)}\n`;
            }
        }

        if (!raizEncontrada) {
            output += "\nNenhuma raiz encontrada no intervalo especificado.\n";
            output += "Sugestões:\n";
            output += "- Amplie o intervalo de busca\n";
            output += "- Verifique se o polinômio possui raízes reais\n";
        }

        output += '</pre>';
        resultadosDiv.innerHTML = output;
    }

    function bissecaoComPassos(funcao, a, b, erro) {
        const MAX_ITERACOES = 1000;
        let log = '';
        let iteracoes = 0;
        let x = 0;
        let erroAtual = Number.POSITIVE_INFINITY;

        log += `Intervalo inicial: [${a.toFixed(6)}, ${b.toFixed(6)}]\n`;

        do {
            const fa = funcao(a);
            const fb = funcao(b);

            if (fa * fb > 0) {
                log += `Aviso: A função não tem sinais opostos nos extremos de [${a.toFixed(6)}, ${b.toFixed(6)}].\n`;
                return { raiz: NaN, log: log };
            }

            x = (a + b) / 2;
            const fx = funcao(x);
            erroAtual = Math.abs(b - a);
            iteracoes++;

            log += `\nIteração ${iteracoes}:\n`;
            log += `  a = ${a.toFixed(10)}, b = ${b.toFixed(10)}\n`;
            log += `  Ponto médio c = (a + b) / 2 = ${x.toFixed(10)}\n`;
            log += `  f(a) = ${fa.toExponential(5)}, f(c) = ${fx.toExponential(5)}\n`;
            
            if (fx === 0) {
                log += `  f(c) é zero, raiz exata encontrada.\n`;
                break;
            }

            if (fa * fx < 0) {
                b = x;
                log += `  f(a) e f(c) têm sinais opostos. Novo intervalo: [a, c] -> [${a.toFixed(10)}, ${b.toFixed(10)}]\n`;
            } else {
                a = x;
                log += `  f(c) e f(b) têm sinais opostos. Novo intervalo: [c, b] -> [${a.toFixed(10)}, ${b.toFixed(10)}]\n`;
            }

            log += `  Erro atual: |b - a| = ${erroAtual.toExponential(5)}\n`;

            if (iteracoes >= MAX_ITERACOES) {
                log += `\nAviso: Máximo de iterações atingido antes da precisão desejada.\n`;
                break;
            }
        } while (erroAtual > erro);

        return { raiz: x, log: log };
    }
});
