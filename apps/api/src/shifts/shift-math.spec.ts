import { countCash } from './shift-math';

describe('countCash (arqueo de caja HU-02)', () => {
  it('cuadra cuando lo declarado es igual a lo esperado', () => {
    expect(countCash(50_000, 120_000, 170_000)).toEqual({ expectedAmount: 170_000, difference: 0, result: 'CUADRADO' });
  });

  it('reporta faltante cuando se declara menos de lo esperado', () => {
    expect(countCash(50_000, 0, 48_000)).toEqual({ expectedAmount: 50_000, difference: -2_000, result: 'FALTANTE' });
  });

  it('reporta sobrante cuando se declara más de lo esperado', () => {
    expect(countCash(50_000, 10_000, 61_000)).toEqual({ expectedAmount: 60_000, difference: 1_000, result: 'SOBRANTE' });
  });

  it('funciona con base cero', () => {
    expect(countCash(0, 0, 0).result).toBe('CUADRADO');
  });
});
