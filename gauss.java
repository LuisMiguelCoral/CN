import java.util.Scanner;

public class EliminacaoGauss {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Digite o número de equações (n): ");
        int n = scanner.nextInt();
        double[][] matrizAumentada = new double[n][n + 1];

        System.out.println("Digite os elementos da matriz aumentada (linha por linha):");
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n + 1; j++) {
                matrizAumentada[i][j] = scanner.nextDouble();
            }
        }

        for (int k = 0; k < n; k++) {
            int iMax = k;
            for (int i = k + 1; i < n; i++) {
                if (Math.abs(matrizAumentada[i][k]) > Math.abs(matrizAumentada[iMax][k])) {
                    iMax = i;
                }
            }

            double[] temp = matrizAumentada[k];
            matrizAumentada[k] = matrizAumentada[iMax];
            matrizAumentada[iMax] = temp;

            for (int i = k + 1; i < n; i++) {
                double fator = matrizAumentada[i][k] / matrizAumentada[k][k];
                for (int j = k; j < n + 1; j++) {
                    matrizAumentada[i][j] -= fator * matrizAumentada[k][j];
                }
            }
        }

        System.out.println("\nSistema equivalente triangularizado:");
        for (int i = 0; i < n; i++) {
            StringBuilder linha = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if (Math.abs(matrizAumentada[i][j]) > 1e-10) {
                    linha.append(String.format("(%.3f)x%d ", matrizAumentada[i][j], j + 1));
                    if (j < n - 1) linha.append("+ ");
                }
            }
            linha.append("= ").append(String.format("%.3f", matrizAumentada[i][n]));
            System.out.println(linha);
        }

        scanner.close();
    }
}
