/** Resultado del arqueo de caja. */
export type CashResult = 'CUADRADO' | 'FALTANTE' | 'SOBRANTE';

export interface CashCount {
  expectedAmount: number;
  difference: number;
  result: CashResult;
}

/**
 * Arqueo de caja (HU-02): compara el total esperado con el efectivo declarado.
 * esperado = base inicial + efectivo recaudado en el turno
 * diferencia = declarado - esperado  (negativa = faltante, positiva = sobrante)
 */
export function countCash(openingAmount: number, cashCollected: number, declaredAmount: number): CashCount {
  const expectedAmount = openingAmount + cashCollected;
  const difference = declaredAmount - expectedAmount;
  const result: CashResult = difference === 0 ? 'CUADRADO' : difference < 0 ? 'FALTANTE' : 'SOBRANTE';
  return { expectedAmount, difference, result };
}
