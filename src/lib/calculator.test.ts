import { describe, expect, it } from 'vitest';
import {
  calculateExtraAvloppCost,
  calculateHouseProject,
  calculateRivningCost,
  getExtraAvloppRate,
  getRivningRate,
  calculateGeoteknikCost,
  calculateArkitektCost,
  calculateUtstakningCost,
  calculateByggfelsforsakringCost,
  calculateDubbelboendeCost,
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
    expect(result.totalProjectCost).toBe(7_266_013);
    expect(amountOf(result, 'lagfart')).toBe(23_325);
    expect(amountOf(result, 'geoteknisk_undersokning')).toBe(25_000);
    expect(amountOf(result, 'arkitekt_konstruktor')).toBe(35_000);
    expect(amountOf(result, 'utstakning')).toBe(12_000);
    expect(amountOf(result, 'byggfelsforsakring')).toBe(35_000);
    expect(amountOf(result, 'oforutsett')).toBe(257_713);
    expect(amountOf(result, 'dubbelboende')).toBe(72_000);
    expect(result.uppskattatLanebelopp).toBe(5_956_195);
    expect(result.kreditivkostnad).toBe(139_226);
    expect(result.pantbrevsavgift).toBe(119_499);
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

describe('geoteknisk markundersökning', () => {
  it('standard ger 25 000 kr', () => {
    expect(amountOf(calc({ geoteknikMode: 'standard' }), 'geoteknisk_undersokning')).toBe(25_000);
  });

  it('advanced ger 45 000 kr', () => {
    expect(amountOf(calc({ geoteknikMode: 'advanced' }), 'geoteknisk_undersokning')).toBe(45_000);
  });

  it('none ger ingen post och 0 kr i beräkning', () => {
    expect(amountOf(calc({ geoteknikMode: 'none' }), 'geoteknisk_undersokning')).toBeUndefined();
    expect(calculateGeoteknikCost({ geoteknikMode: 'none', customGeoteknikCost: 0 })).toBe(0);
  });

  it('custom ger eget belopp', () => {
    expect(amountOf(calc({ geoteknikMode: 'custom', customGeoteknikCost: 32_000 }), 'geoteknisk_undersokning')).toBe(32_000);
  });

  it('förhandsvisning i steg matchar kalkylposten', () => {
    const input = { ...DEFAULT_CALCULATION_INPUT, geoteknikMode: 'advanced' as const };
    expect(calculateGeoteknikCost(input)).toBe(amountOf(calculateHouseProject(input), 'geoteknisk_undersokning'));
  });
});

describe('arkitekt och konstruktör', () => {
  it('standard kataloghusanpassning ger 35 000 kr', () => {
    expect(amountOf(calc({ arkitektMode: 'standard' }), 'arkitekt_konstruktor')).toBe(35_000);
  });

  it('extensive ger 80 000 kr', () => {
    expect(amountOf(calc({ arkitektMode: 'extensive' }), 'arkitekt_konstruktor')).toBe(80_000);
  });

  it('none ger ingen post (ingår) och 0 kr i beräkning', () => {
    expect(amountOf(calc({ arkitektMode: 'none' }), 'arkitekt_konstruktor')).toBeUndefined();
    expect(calculateArkitektCost({ arkitektMode: 'none', customArkitektCost: 0 })).toBe(0);
  });

  it('custom ger eget belopp', () => {
    expect(amountOf(calc({ arkitektMode: 'custom', customArkitektCost: 50_000 }), 'arkitekt_konstruktor')).toBe(50_000);
  });

  it('förhandsvisning i steg matchar kalkylposten', () => {
    const input = { ...DEFAULT_CALCULATION_INPUT, arkitektMode: 'custom' as const, customArkitektCost: 42_000 };
    expect(calculateArkitektCost(input)).toBe(amountOf(calculateHouseProject(input), 'arkitekt_konstruktor'));
  });
});

describe('utstakning och lägeskontroll', () => {
  it('preset ger 12 000 kr', () => {
    expect(amountOf(calc({ utstakningMode: 'preset' }), 'utstakning')).toBe(12_000);
  });

  it('none ger ingen post och 0 kr i beräkning', () => {
    expect(amountOf(calc({ utstakningMode: 'none' }), 'utstakning')).toBeUndefined();
    expect(calculateUtstakningCost({ utstakningMode: 'none', customUtstakningCost: 0 })).toBe(0);
  });

  it('custom ger eget belopp', () => {
    expect(amountOf(calc({ utstakningMode: 'custom', customUtstakningCost: 16_500 }), 'utstakning')).toBe(16_500);
  });

  it('förhandsvisning matchar kalkylposten', () => {
    const input = { ...DEFAULT_CALCULATION_INPUT, utstakningMode: 'preset' as const };
    expect(calculateUtstakningCost(input)).toBe(amountOf(calculateHouseProject(input), 'utstakning'));
  });
});

describe('byggfelsförsäkring och färdigställandeskydd', () => {
  it('standard ger 35 000 kr', () => {
    expect(amountOf(calc({ byggfelsforsakringMode: 'standard' }), 'byggfelsforsakring')).toBe(35_000);
  });

  it('comprehensive ger 55 000 kr', () => {
    expect(amountOf(calc({ byggfelsforsakringMode: 'comprehensive' }), 'byggfelsforsakring')).toBe(55_000);
  });

  it('none ger ingen post och 0 kr i beräkning', () => {
    expect(amountOf(calc({ byggfelsforsakringMode: 'none' }), 'byggfelsforsakring')).toBeUndefined();
    expect(calculateByggfelsforsakringCost({ byggfelsforsakringMode: 'none', customByggfelsforsakringCost: 0 })).toBe(0);
  });

  it('custom ger eget belopp', () => {
    expect(amountOf(calc({ byggfelsforsakringMode: 'custom', customByggfelsforsakringCost: 40_000 }), 'byggfelsforsakring')).toBe(40_000);
  });

  it('förhandsvisning matchar kalkylposten', () => {
    const input = { ...DEFAULT_CALCULATION_INPUT, byggfelsforsakringMode: 'comprehensive' as const };
    expect(calculateByggfelsforsakringCost(input)).toBe(amountOf(calculateHouseProject(input), 'byggfelsforsakring'));
  });
});

describe('post för oförutsett', () => {
  it('schablon 5 % beräknas korrekt på produktionskostnaden exklusive tomt', () => {
    const result = calc({ oforutsettMode: 'percent', oforutsettProcent: 5 });
    const oforutsett = amountOf(result, 'oforutsett');
    expect(oforutsett).toBeGreaterThan(0);
    // Skall vara ca 5 % av produktionskostnaden
    const prodItems = result.items.filter((it) => it.category !== 'tomt_forvarv' && it.id !== 'oforutsett' && it.id !== 'byggnadskreditiv' && it.id !== 'pantbrev' && it.id !== 'dubbelboende');
    const prodSum = prodItems.reduce((s, it) => s + it.amount, 0);
    expect(oforutsett).toBe(Math.round(prodSum * 0.05));
  });

  it('none ger ingen post', () => {
    expect(amountOf(calc({ oforutsettMode: 'none' }), 'oforutsett')).toBeUndefined();
  });

  it('custom ger exakt angivet buffertbelopp', () => {
    expect(amountOf(calc({ oforutsettMode: 'custom', customOforutsettCost: 150_000 }), 'oforutsett')).toBe(150_000);
  });
});

describe('dubbelboende under byggtid', () => {
  it('beräknar månader gånger månadskostnad när aktivt', () => {
    const result = calc({ dubbelboendeEnabled: true, dubbelboendeManader: 8, dubbelboendeKostnadPerManad: 15_000 });
    expect(amountOf(result, 'dubbelboende')).toBe(120_000);
  });

  it('ger ingen post när avaktiverat', () => {
    expect(amountOf(calc({ dubbelboendeEnabled: false }), 'dubbelboende')).toBeUndefined();
  });

  it('custom läge ger eget belopp', () => {
    const result = calc({ dubbelboendeEnabled: true, dubbelboendeMode: 'custom', customDubbelboendeCost: 95_000 });
    expect(amountOf(result, 'dubbelboende')).toBe(95_000);
  });

  it('förhandsvisning matchar kalkylposten', () => {
    const input = {
      ...DEFAULT_CALCULATION_INPUT,
      dubbelboendeEnabled: true,
      dubbelboendeMode: 'calc' as const,
      dubbelboendeManader: 10,
      dubbelboendeKostnadPerManad: 12_000,
    };
    expect(calculateDubbelboendeCost(input)).toBe(amountOf(calculateHouseProject(input), 'dubbelboende'));
  });
});

