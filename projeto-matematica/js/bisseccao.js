document.addEventListener('DOMContentLoaded', function() {
    const grauInput = document.getElementById('grau');
    const coeficientesContainer = document.getElementById('coeficientes-container');
    const calcularBtn = document.getElementById('calcular-btn');
    const polinomioDiv = document.getElementById('polinomio');
    const resultadosDiv = document.getElementById('resultados');
    
    // Atualizar campos de coeficientes quando o grau mudar
    grauInput.addEventListener('change', atualizarCoeficientes);
    
    // Inicializar campos de coeficientes
    atualizarCoeficientes();
    
    // Configurar evento de cálculo
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
                
                resultado += Math.abs(coeficientes[i]);
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
        // Obter valores dos inputs
        const grau = parseInt(grauInput.value);
        const erro = parseFloat(document.getElementById('erro').value);
        const inicio = parseFloat(document.getElementById('inicio').value);
        const fim = parseFloat(document.getElementById('fim').value);
        
        // Validar intervalo
        if (inicio >= fim) {
            alert('Erro: O limite inferior deve ser menor que o superior!');
            return;
        }
        
        // Obter coeficientes
        const coeficientes = [];
        for (let i = 0; i <= grau; i++) {
            coeficientes[i] = parseFloat(document.getElementById(`coef-${i}`).value) || 0;
        }
        
        // Exibir polinômio
        polinomioDiv.innerHTML = `<strong>Polinômio:</strong> P(x) = ${formatarPolinomio(coeficientes)}`;
        
        // Implementar o método da bissecção
        const funcao = x => {
            let resultado = 0;
            for (let i = 0; i <= grau; i++) {
                resultado += coeficientes[i] * Math.pow(x, i);
            }
            return resultado;
        };
        
        // Encontrar raízes
        const DIVISOES = 50;
        const passo = (fim - inicio) / DIVISOES;
        let raizEncontrada = false;
        let output = '';
        
        output += `Procurando raízes em [${inicio.toFixed(4)}, ${fim.toFixed(4)}]...\n\n`;
        
        for (let a = inicio; a < fim; a += passo) {
            let b = Math.min(a + passo, fim);
            let fa = funcao(a);
            let fb = funcao(b);
            
            if (isNaN(fa) || isNaN(fb)) {
                output += `Aviso: Função indefinida em [${a.toFixed(4)}, ${b.toFixed(4)}]\n`;
                continue;
            }
            
            if (fa * fb <= 0) {
                output += `● Raiz detectada em [${a.toFixed(6)}, ${b.toFixed(6)}]\n`;
                raizEncontrada = true;
                
                let raiz = bissecao(funcao, a, b, erro);
                let valorNaRaiz = funcao(raiz);
                
                output += `\n✔ Raiz aproximada: ${raiz.toFixed(10)}\n`;
                output += `  f(raiz) = ${valorNaRaiz.toExponential(5)} (precisão: ${Math.abs(valorNaRaiz).toExponential(5)})\n`;
                output += "----------------------------------------\n";
            }
        }
        
        if (!raizEncontrada) {
            output += "\nNenhuma raiz encontrada no intervalo especificado.\n";
            output += "Sugestões:\n";
            output += "- Amplie o intervalo de busca\n";
            output += "- Verifique se o polinômio possui raízes reais\n";
        }
        
        resultadosDiv.textContent = output;
    }
    
    function bissecao(funcao, a, b, erro) {
        const MAX_ITERACOES = 1000;
        let fa = funcao(a);
        let fb = funcao(b);
        
        if (fa * fb > 0) {
            throw new Error("A função deve ter sinais opostos nos extremos do intervalo");
        }
        
        let iteracoes = 0;
        let x = 0;
        let erroAtual = Number.POSITIVE_INFINITY;
        
        do {
            let xAnterior = x;
            x = (a + b) / 2;
            let fx = funcao(x);
            
            erroAtual = Math.abs(b - a);
            
            if (fx === 0) {
                return x;
            } else if (fa * fx < 0) {
                b = x;
                fb = fx;
            } else {
                a = x;
                fa = fx;
            }
            
            iteracoes++;
            
            if (iteracoes >= MAX_ITERACOES) {
                console.log("Aviso: Máximo de iterações atingido!");
                break;
            }
            
        } while (erroAtual > erro);
        
        return x;
    }
});