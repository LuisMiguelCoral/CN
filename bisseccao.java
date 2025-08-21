import java.util.Scanner;
import java.util.function.DoubleUnaryOperator;

public class MetodoBissecaoPolinomio {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("================================================");
        System.out.println("MÉTODO DA BISSECÇÃO - ZEROS DE FUNÇÕES POLINOMIAIS");
        System.out.println("================================================\n");

        System.out.println("Digite o grau do polinômio (0 a 10):");
        int grau = scanner.nextInt();
        
        if (grau < 0 || grau > 10) {
            System.out.println("Erro: Grau deve ser entre 0 e 10.");
            scanner.close();
            return;
        }
        
        double[] coeficientes = new double[grau + 1];
        
        System.out.println("\nDigite os coeficientes do termo de maior para menor grau:");
        for (int i = grau; i >= 0; i--) {
            System.out.printf("Coeficiente de x^%d: ", i);
            coeficientes[i] = scanner.nextDouble();
        }

        System.out.println("\nPolinômio inserido:");
        System.out.println(formatarPolinomio(coeficientes));

        double erro;
        do {
            System.out.println("\nDigite a precisão desejada (ex: 0.0001):");
            erro = scanner.nextDouble();
            
            if (erro <= 0) {
                System.out.println("Erro: A precisão deve ser maior que zero!");
            }
        } while (erro <= 0);

        double inicio, fim;
        do {
            System.out.println("\nDigite o limite inferior do intervalo:");
            inicio = scanner.nextDouble();
            System.out.println("Digite o limite superior do intervalo:");
            fim = scanner.nextDouble();
            
            if (inicio >= fim) {
                System.out.println("Erro: O limite inferior deve ser menor que o superior!");
            }
        } while (inicio >= fim);

        DoubleUnaryOperator funcao = x -> {
            double resultado = 0;
            for (int i = 0; i <= grau; i++) {
                resultado += coeficientes[i] * Math.pow(x, i);
            }
            return resultado;
        };

        System.out.println("\n================================================");
        System.out.printf("RESULTADOS (precisão < %.2e)\n", erro);
        System.out.println("================================================");

        encontrarRaizes(funcao, inicio, fim, erro);
        
        scanner.close();
    }

    private static String formatarPolinomio(double[] coeficientes) {
        StringBuilder sb = new StringBuilder();
        boolean primeiroTermo = true;
        
        for (int i = coeficientes.length - 1; i >= 0; i--) {
            if (coeficientes[i] != 0) {
                if (!primeiroTermo) {
                    sb.append(coeficientes[i] > 0 ? " + " : " - ");
                } else if (coeficientes[i] < 0) {
                    sb.append("-");
                }
                
                sb.append(Math.abs(coeficientes[i]));
                if (i > 0) {
                    sb.append("x");
                    if (i > 1) {
                        sb.append("^").append(i);
                    }
                }
                primeiroTermo = false;
            }
        }
        return sb.toString();
    }

    public static void encontrarRaizes(DoubleUnaryOperator funcao, double inicio, double fim, double erro) {
        final int DIVISOES = 50; 
        double passo = (fim - inicio) / DIVISOES;
        boolean raizEncontrada = false;
        
        System.out.printf("\nProcurando raízes em [%.4f, %.4f]...\n", inicio, fim);

        for (double a = inicio; a < fim; a += passo) {
            double b = Math.min(a + passo, fim);
            double fa = funcao.applyAsDouble(a);
            double fb = funcao.applyAsDouble(b);
            
            if (Double.isNaN(fa) || Double.isNaN(fb)) {
                System.out.printf("Aviso: Função indefinida em [%.4f, %.4f]\n", a, b);
                continue;
            }

            if (fa * fb <= 0) {
                System.out.printf("\n● Raiz detectada em [%.6f, %.6f]\n", a, b);
                raizEncontrada = true;
                
                double raiz = bissecao(funcao, a, b, erro);
                double valorNaRaiz = funcao.applyAsDouble(raiz);
                
                System.out.printf("\n✔ Raiz aproximada: %.10f\n", raiz);
                System.out.printf("  f(raiz) = %.5e (precisão: %.5e)\n", 
                                valorNaRaiz, Math.abs(valorNaRaiz));
                System.out.println("----------------------------------------");
            }
        }
        
        if (!raizEncontrada) {
            System.out.println("\nNenhuma raiz encontrada no intervalo especificado.");
            System.out.println("Sugestões:");
            System.out.println("- Amplie o intervalo de busca");
            System.out.println("- Verifique se o polinômio possui raízes reais");
        }
    }

    public static double bissecao(DoubleUnaryOperator funcao, double a, double b, double erro) {
        final int MAX_ITERACOES = 1000;
        double fa = funcao.applyAsDouble(a);
        double fb = funcao.applyAsDouble(b);
        
        if (fa * fb > 0) {
            throw new IllegalArgumentException("A função deve ter sinais opostos nos extremos do intervalo");
        }
        
        int iteracoes = 0;
        double x = 0;
        double erroAtual = Double.POSITIVE_INFINITY;
        
        System.out.println("\nIteração |   a         |   b         |   x         |   f(x)         | Erro Atual");
        System.out.println("-----------------------------------------------------------------------------");
        
        do {
            double xAnterior = x;
            x = (a + b) / 2;
            double fx = funcao.applyAsDouble(x);
            
            erroAtual = Math.abs(b - a);
            
            System.out.printf("%5d    | %10.8f | %10.8f | %10.8f | %14.8e | %10.8e\n", 
                            iteracoes, a, b, x, fx, erroAtual);
            
            if (fx == 0) {
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
                System.out.println("\nAviso: Máximo de iterações atingido!");
                break;
            }
            
        } while (erroAtual > erro);
        
        return x;
    }
}