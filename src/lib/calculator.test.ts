import { describe, expect, it } from 'vitest';
import {
  calculateExtraAvloppCost,
  calculateHouseProject,
  calculateRivningCost,
  getExtraAvloppRate,
  getRivningRate,
} from '@/lib/calculator';
import { DEFAULT_CALCULATION_INPUT } from '@/config/presets';
import type { CalculationInput } from '@/types/calculation';

function calc(overrides: Partial<CalculationInput> = {}) {
  return calculateHouseProject({ ...DEFAULT_CALCULATION_INPUT, ...overrides });
}

function amountOf(result: ReturnType<typeof calc>, id: string): number | undefined {
  return result.items.find((item) => item.id === id)?.amount;
}

describe('standardkalkyl (referensvärden)', () => {
  it('ger samma totalsumma som den publicerade standardkalkylen', () => {
    const result = calc();
    expect(result.totalProjectCost).toBe(6_813_199);
    expect(amountOf(result, 'lagfart')).toBe(23_325);
    expect(result.uppskattatLanebelopp).toBe(5_584_989);
    expect(result.kreditivkostnad).toBe(130_549);
    expect(result.pantbrevsavgift).toBe(112_075);
  });

  it('summerar linjeposter och kategorier till samma total', () => {
    const result = calc();
    const sumOfItems = result.items.reduce((sum, item) => sum + item.amount, 0);
    const sumOfCategories = result.categoryList.reduce((sum, cat) => sum + cat.total, 0);
    expect(sumOfItems).toBe(result.totalProjectCost);
    expect(sumOfCategories).toBe(result.totalProjectCost);
  });
});

describe('extra avloppsgrävning', () => {
  const base = { extraAvloppEnabled: true, extraAvloppMeter: 20 } as const;

  it.each([
    ['easy', 1_500, 30_000],
    ['difficult', 3_000, 60_000],
    ['blasting', 6_000, 120_000],
  ] as const)('terräng %s: %i kr/m ger %i kr för 20 m', (terrain, rate, expected) => {
    const result = calc({ ...base, extraAvloppTerrain: terrain });
    expect(getExtraAvloppRate(terrain)).toBe(rate);
    expect(amountOf(result, 'extra_avlopp')).toBe(expected);
  });

  it('förhandsvisningen i steget matchar alltid linjeposten i kalkylen', () => {
    for (const terrain of ['easy', 'difficult', 'blasting'] as const) {
      const input = { ...DEFAULT_CALCULATION_INPUT, ...base, extraAvloppTerrain: terrain };
      expect(calculateExtraAvloppCost(input)).toBe(
        amountOf(calculateHouseProject(input), 'extra_avlopp')
      );
    }
  });

  it('ger ingen post när funktionen är avstängd eller längden är 0', () => {
    expect(amountOf(calc({ extraAvloppEnabled: false }), 'extra_avlopp')).toBeUndefined();
    expect(amountOf(calc({ ...base, extraAvloppMeter: 0 }), 'extra_avlopp')).toBeUndefined();
    expect(calculateExtraAvloppCost({ ...base, extraAvloppMeter: 0, extraAvloppTerrain: 'blasting' })).toBe(0);
  });
});

describe('rivning', () => {
  it('ger ingen post utan rivningsbehov', () => {
    expect(amountOf(calc({ harRivningsbehov: false }), 'rivning')).toBeUndefined();
  });

  it.each([
    [50, false, 200_000],
    [100, false, 400_000],
    [150, false, 600_000],
    [100, true, 600_000],
  ])('%i m² (asbest: %s) kostar %i kr', (yta, asbest, expected) => {
    const result = calc({ harRivningsbehov: true, rivningsYta: yta, harAsbestrisk: asbest });
    expect(amountOf(result, 'rivning')).toBe(expected);
  });

  it('skalar med ytan, inte med en fast schablon', () => {
    const small = amountOf(calc({ harRivningsbehov: true, rivningsYta: 50 }), 'rivning');
    const large = amountOf(calc({ harRivningsbehov: true, rivningsYta: 100 }), 'rivning');
    expect(large).toBe((small ?? 0) * 2);
  });

  it('förhandsvisningen i steget matchar linjeposten', () => {
    const input = { ...DEFAULT_CALCULATION_INPUT, harRivningsbehov: true, rivningsYta: 80 };
    expect(calculateRivningCost(input)).toBe(amountOf(calculateHouseProject(input), 'rivning'));
    expect(getRivningRate(false)).toBe(4_000);
    expect(getRivningRate(true)).toBe(6_000);
  });
});

describe('noll är ett giltigt värde (?? i stället för ||)', () => {
  it('golv: 0 kr/m² ger 0 kr, inte schablonen', () => {
    expect(amountOf(calc({ golvKostnadPerKvm: 0 }), 'golv_uppgradering')).toBe(0);
  });

  it('finplanering: 0 kr/m² ger 0 kr', () => {
    expect(amountOf(calc({ finplaneringKostnadPerKvm: 0 }), 'finplanering_tomt')).toBe(0);
  });

  it('planavgift: 0 kr/m² ger 0 kr', () => {
    expect(amountOf(calc({ planavgiftPerKvm: 0 }), 'planavgift')).toBe(0);
  });

  it('bygglov: grundavgift 0 kr ger 0 kr', () => {
    expect(amountOf(calc({ bygglovGrundavgift: 0 }), 'bygglov_grund')).toBe(0);
  });

  it('husbyggsats och montering: 0 kr/m² ger 0 kr', () => {
    const result = calc({ husmaterialsatsPerKvm: 0, byggkostnadPerKvm: 0 });
    expect(amountOf(result, 'husmaterialsats')).toBe(0);
    expect(amountOf(result, 'byggentreprenad')).toBe(0);
  });

  it('kreditivränta 0 % ger 0 kr i räntekostnad', () => {
    expect(calc({ kreditivRantesatsProcent: 0 }).kreditivkostnad).toBe(0);
  });

  it('badrum: eget belopp 0 kr ger 0 kr', () => {
    const result = calc({ badrumKakelTillval: 'custom', customBadrumTotalCost: 0 });
    expect(amountOf(result, 'badrum_kakel')).toBe(0);
  });
});

describe('schabloner med värden', () => {
  it('golv: schablon per m² används på boytan', () => {
    expect(amountOf(calc({ husBostadsyta: 100, golvKostnadPerKvm: 1_500 }), 'golv_uppgradering')).toBe(150_000);
  });

  it('planavgift räknas på boyta plus komplementyta', () => {
    expect(amountOf(calc({ husBostadsyta: 150, extrabyggnaderYta: 35, planavgiftPerKvm: 250 }), 'planavgift')).toBe(46_250);
  });

  it('badrum: tillvalsnivå räknas per m² våtrum', () => {
    const result = calc({ badrumKakelTillval: 'exclusive', antalBadrumTvatt: 2, kvmPerVatutrymme: 10 });
    expect(amountOf(result, 'badrum_kakel')).toBe(14_000);
  });
});
