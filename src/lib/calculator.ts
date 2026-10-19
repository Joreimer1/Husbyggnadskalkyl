import {
  CalculationInput,
  CalculationResult,
  CalculationLineItem,
  CalculationCategory,
  CategorySummary,
  SewerTerrainType,
} from '@/types/calculation';
import { PRESETS } from '@/config/presets';

/**
 * Delade hjälpfunktioner. Både kalkylatorn och förhandsvisningarna i stegen ska använda
 * dessa, så att summan som visas i ett steg alltid är densamma som räknas in i totalen.
 */

/** Kr per löpande meter för extra avloppsgrävning i vald terräng. */
export function getExtraAvloppRate(terrain: SewerTerrainType): number {
  const rateFor = (value: SewerTerrainType) =>
    PRESETS.extraAvlopp.find((t) => t.value === value)?.ratePerUnit;
  return rateFor(terrain) ?? rateFor('easy') ?? 0;
}

/** Kr per m² rivningsyta. Asbest ger högre schablon. */
export function getRivningRate(harAsbestrisk: boolean): number {
  return harAsbestrisk ? PRESETS.rivning.asbestPerKvm : PRESETS.rivning.standardPerKvm;
}

export function calculateExtraAvloppCost(
  input: Pick<CalculationInput, 'extraAvloppEnabled' | 'extraAvloppMeter' | 'extraAvloppTerrain'>
): number {
  if (!input.extraAvloppEnabled || !(input.extraAvloppMeter > 0)) return 0;
  return Math.round(input.extraAvloppMeter * getExtraAvloppRate(input.extraAvloppTerrain));
}

export function calculateRivningCost(
  input: Pick<CalculationInput, 'harRivningsbehov' | 'rivningsYta' | 'harAsbestrisk'>
): number {
  if (!input.harRivningsbehov || !(input.rivningsYta > 0)) return 0;
  return Math.round(input.rivningsYta * getRivningRate(input.harAsbestrisk));
}

export function calculateGeoteknikCost(
  input: Pick<CalculationInput, 'geoteknikMode' | 'customGeoteknikCost'>
): number {
  if (input.geoteknikMode === 'none') return 0;
  if (input.geoteknikMode === 'custom') return Math.max(0, input.customGeoteknikCost ?? 0);
  const found = PRESETS.geoteknik.find((g) => g.value === input.geoteknikMode);
  return found?.cost ?? 25000;
}

export function calculateArkitektCost(
  input: Pick<CalculationInput, 'arkitektMode' | 'customArkitektCost'>
): number {
  if (input.arkitektMode === 'none') return 0;
  if (input.arkitektMode === 'custom') return Math.max(0, input.customArkitektCost ?? 0);
  const found = PRESETS.arkitekt.find((a) => a.value === input.arkitektMode);
  return found?.cost ?? 35000;
}

export function calculateUtstakningCost(
  input: Pick<CalculationInput, 'utstakningMode' | 'customUtstakningCost'>
): number {
  if (input.utstakningMode === 'none') return 0;
  if (input.utstakningMode === 'custom') return Math.max(0, input.customUtstakningCost ?? 0);
  return PRESETS.utstakning.schablon;
}

export function calculateByggfelsforsakringCost(
  input: Pick<CalculationInput, 'byggfelsforsakringMode' | 'customByggfelsforsakringCost'>
): number {
  if (input.byggfelsforsakringMode === 'none') return 0;
  if (input.byggfelsforsakringMode === 'custom') return Math.max(0, input.customByggfelsforsakringCost ?? 0);
  const found = PRESETS.byggfelsforsakring.find((b) => b.value === input.byggfelsforsakringMode);
  return found?.cost ?? 35000;
}

export function calculateDubbelboendeCost(
  input: Pick<
    CalculationInput,
    | 'dubbelboendeEnabled'
    | 'dubbelboendeMode'
    | 'dubbelboendeManader'
    | 'dubbelboendeKostnadPerManad'
    | 'customDubbelboendeCost'
  >
): number {
  if (!input.dubbelboendeEnabled) return 0;
  if (input.dubbelboendeMode === 'custom') return Math.max(0, input.customDubbelboendeCost ?? 0);
  const m = Math.max(0, input.dubbelboendeManader ?? PRESETS.dubbelboende.standardManader);
  const rate = Math.max(0, input.dubbelboendeKostnadPerManad ?? PRESETS.dubbelboende.standardKostnadPerManad);
  return Math.round(m * rate);
}

/**
 * Ren beräkningsfunktion för husbyggnadskalkyl.
 * Returnerar totalkostnad, kategorisummeringar samt en komplett lista över linjeposter.
 */
export function calculateHouseProject(input: CalculationInput): CalculationResult {
  const items: CalculationLineItem[] = [];

  // ==========================================
  // 1. TOMT & FÖRVÄRV
  // ==========================================
  const tomtPris = Math.max(0, input.tomtPris || 0);
  items.push({
    id: 'tomt_pris',
    category: 'tomt_forvarv',
    name: 'Tomtpris / Fastighetsförvärv',
    amount: tomtPris,
    description: tomtPris > 0 ? 'Köpeskilling för tomtmark.' : 'Tomt ägs redan eller ingår ej.',
    formulaNote: `${tomtPris.toLocaleString('sv-SE')} kr`,
  });

  const lagfartBelopp =
    tomtPris > 0
      ? Math.round(tomtPris * (input.lagfartProcent / 100) + PRESETS.lagfart.expeditionsavgift)
      : 0;

  items.push({
    id: 'lagfart',
    category: 'tomt_forvarv',
    name: 'Lagfart (Stämpelskatt & avgift)',
    amount: lagfartBelopp,
    description: PRESETS.lagfart.description,
    formulaNote:
      tomtPris > 0
        ? `${input.lagfartProcent}% av ${tomtPris.toLocaleString('sv-SE')} kr + ${PRESETS.lagfart.expeditionsavgift} kr exp.avgift`
        : '0 kr (ingen tomtköpeskilling)',
  });

  // ==========================================
  // 2. MARKARBETE & FÖRBEREDELSER
  // ==========================================
  let grundarbeteKostnad = 0;
  let grundarbeteDesc = '';

  if (input.grundarbetePreset === 'custom') {
    grundarbeteKostnad = Math.max(0, input.customGrundarbeteCost || 0);
    grundarbeteDesc = 'Offertpris enligt separat markanbud (exkl. platta).';
  } else {
    const foundPreset = PRESETS.grundarbete.find((p) => p.value === input.grundarbetePreset);
    grundarbeteKostnad = foundPreset?.cost ?? 200000;
    grundarbeteDesc = foundPreset?.description || '';
  }

  const selectedGrundarbeteOption = PRESETS.grundarbete.find((p) => p.value === input.grundarbetePreset);
  items.push({
    id: 'grundarbete',
    category: 'mark_forberedelse',
    name: `Grundarbete: ${selectedGrundarbeteOption?.label || 'Markarbete'}`,
    amount: grundarbeteKostnad,
    description: grundarbeteDesc,
    formulaNote: input.grundarbetePreset === 'custom' ? 'Offertpris' : 'Schablonkostnad',
    isCustom: input.grundarbetePreset === 'custom',
  });

  // Geoteknisk markundersökning
  const geoteknikKostnad = calculateGeoteknikCost(input);
  const matchGeoteknik = PRESETS.geoteknik.find((g) => g.value === input.geoteknikMode);
  if (geoteknikKostnad > 0 || input.geoteknikMode !== 'none') {
    items.push({
      id: 'geoteknisk_undersokning',
      category: 'mark_forberedelse',
      name: `Geoteknisk undersökning (${matchGeoteknik?.label || 'Markundersökning'})`,
      amount: geoteknikKostnad,
      description: matchGeoteknik?.description || PRESETS.geoteknik[0].description,
      formulaNote: input.geoteknikMode === 'custom' ? 'Offertpris' : `${geoteknikKostnad.toLocaleString('sv-SE')} kr`,
      isCustom: input.geoteknikMode === 'custom',
    });
  }

  // Extra avloppsgrävning
  if (input.extraAvloppEnabled && input.extraAvloppMeter > 0) {
    const rate = getExtraAvloppRate(input.extraAvloppTerrain);
    const extraAvloppKostnad = calculateExtraAvloppCost(input);
    const terrainLabel =
      PRESETS.extraAvlopp.find((t) => t.value === input.extraAvloppTerrain)?.label || '';

    items.push({
      id: 'extra_avlopp',
      category: 'mark_forberedelse',
      name: 'Extra rörgrav & VA-grävning',
      amount: extraAvloppKostnad,
      description: `${input.extraAvloppMeter} m schaktning i terräng: ${terrainLabel}.`,
      formulaNote: `${input.extraAvloppMeter} m x ${rate.toLocaleString('sv-SE')} kr/m`,
    });
  }

  // Invasiva växter (Parkslide mm)
  let invasivaKostnad = 0;
  if (input.invasivaVaxterTyp !== 'none') {
    if (input.invasivaVaxterTyp === 'custom') {
      invasivaKostnad = Math.max(0, input.customInvasivaVaxterCost || 0);
    } else {
      const match = PRESETS.invasivaVaxter.find((v) => v.value === input.invasivaVaxterTyp);
      invasivaKostnad = match?.cost ?? 0;
    }
    const match = PRESETS.invasivaVaxter.find((v) => v.value === input.invasivaVaxterTyp);
    items.push({
      id: 'invasiva_vaxter',
      category: 'mark_forberedelse',
      name: `Sanering invasiva arter (${match?.label || 'Parkslide'})`,
      amount: invasivaKostnad,
      description: match?.description || 'Åtgärd för invasiva växter.',
      formulaNote: input.invasivaVaxterTyp === 'custom' ? 'Offertpris' : 'Schablonkostnad',
      isCustom: input.invasivaVaxterTyp === 'custom',
    });
  }

  // Rivning
  if (input.harRivningsbehov && input.rivningsYta > 0) {
    const rivningsRate = getRivningRate(input.harAsbestrisk);
    const rivningsKostnad = calculateRivningCost(input);

    items.push({
      id: 'rivning',
      category: 'mark_forberedelse',
      name: `Rivning av befintlig byggnad (${input.rivningsYta} m²)${input.harAsbestrisk ? ' inkl. asbestsanering' : ''}`,
      amount: rivningsKostnad,
      description: PRESETS.rivning.description,
      formulaNote: `${input.rivningsYta} m² x ${rivningsRate.toLocaleString('sv-SE')} kr/m²`,
    });
  }

  // ==========================================
  // 3. BYGGNATION & MATERIAL
  // ==========================================
  // Husmaterialsats
  const husRate = Math.max(0, input.husmaterialsatsPerKvm ?? PRESETS.husmaterialsats.recommendedPerKvm);
  let husmaterialsatsKostnad = 0;
  if (input.husmaterialsatsMode === 'fixed') {
    husmaterialsatsKostnad = Math.max(0, input.customHusmaterialsatsFastPris || 0);
  } else {
    husmaterialsatsKostnad = Math.round(input.husBostadsyta * husRate);
  }

  items.push({
    id: 'husmaterialsats',
    category: 'bygg_material',
    name: 'Husmaterialsats / Byggsats',
    amount: husmaterialsatsKostnad,
    description: PRESETS.husmaterialsats.description,
    formulaNote:
      input.husmaterialsatsMode === 'fixed'
        ? 'Fast avtalspris'
        : `${input.husBostadsyta} m² x ${husRate.toLocaleString('sv-SE')} kr/m²`,
    isCustom: input.husmaterialsatsMode === 'fixed',
  });

  // Byggentreprenad / montering
  const byggRate = Math.max(0, input.byggkostnadPerKvm ?? PRESETS.byggkostnad.schablonPerKvm);
  let byggkostnadTotal = 0;
  if (input.byggkostnadMode === 'custom') {
    byggkostnadTotal = Math.max(0, input.customByggkostnad || 0);
  } else {
    byggkostnadTotal = Math.round(input.husBostadsyta * byggRate);
  }

  items.push({
    id: 'byggentreprenad',
    category: 'bygg_material',
    name: `Byggentreprenad / Montage huvudbyggnad (${input.husBostadsyta} m²)`,
    amount: byggkostnadTotal,
    description: PRESETS.byggkostnad.description,
    formulaNote:
      input.byggkostnadMode === 'custom'
        ? 'Entreprenadoffert'
        : `${input.husBostadsyta} m² x ${byggRate.toLocaleString('sv-SE')} kr/m²`,
    isCustom: input.byggkostnadMode === 'custom',
  });

  // Byggkostnad komplementbyggnad (om extrabyggnaderYta > 0 och aktiverad)
  if (input.extrabyggnaderYta > 0 && input.inkluderaKomplementIByggkostnad) {
    const komplementRate = Math.max(
      0,
      input.komplementByggkostnadPerKvm ?? PRESETS.komplementbyggnad.schablonPerKvm
    );
    let komplementTotal = 0;
    if (input.komplementByggkostnadMode === 'custom') {
      komplementTotal = Math.max(0, input.customKomplementByggkostnad || 0);
    } else {
      komplementTotal = Math.round(input.extrabyggnaderYta * komplementRate);
    }

    items.push({
      id: 'byggkostnad_komplement',
      category: 'bygg_material',
      name: `Byggkostnad komplementbyggnad (Garage/förråd, ${input.extrabyggnaderYta} m²)`,
      amount: komplementTotal,
      description: PRESETS.komplementbyggnad.description,
      formulaNote:
        input.komplementByggkostnadMode === 'custom'
          ? 'Offertpris'
          : `${input.extrabyggnaderYta} m² x ${komplementRate.toLocaleString('sv-SE')} kr/m²`,
      isCustom: input.komplementByggkostnadMode === 'custom',
    });
  }

  // Arkitekt och konstruktör (Kataloghusanpassning & K-ritningar)
  const arkitektKostnad = calculateArkitektCost(input);
  const matchArkitekt = PRESETS.arkitekt.find((a) => a.value === input.arkitektMode);
  if (arkitektKostnad > 0 || input.arkitektMode !== 'none') {
    items.push({
      id: 'arkitekt_konstruktor',
      category: 'bygg_material',
      name: `Arkitekt & Konstruktör (${matchArkitekt?.label || 'Projektering'})`,
      amount: arkitektKostnad,
      description: matchArkitekt?.description || 'Arvode för situationsplan, K-ritningar och kataloghusanpassning.',
      formulaNote: input.arkitektMode === 'custom' ? 'Offertpris' : `${arkitektKostnad.toLocaleString('sv-SE')} kr`,
      isCustom: input.arkitektMode === 'custom',
    });
  }

  // Målning
  let malningKostnad = 0;
  if (input.malningMode === 'custom') {
    malningKostnad = Math.max(0, input.customMalningCost || 0);
  } else {
    const match = PRESETS.malning.find((m) => m.value === input.malningMode);
    malningKostnad = match?.cost ?? 200000;
  }
  const matchMalning = PRESETS.malning.find((m) => m.value === input.malningMode);

  items.push({
    id: 'malning',
    category: 'bygg_material',
    name: `Målning: ${matchMalning?.label || 'Exteriör & Interiör'}`,
    amount: malningKostnad,
    description:
      'Målning ingår normalt inte från husleverantör utan måste utföras av separat målarfirma eller i egen regi.',
    formulaNote: input.malningMode === 'custom' ? 'Offertpris' : 'Schablonkostnad',
    isCustom: input.malningMode === 'custom',
  });

  // ==========================================
  // 4. KOMMUNALT & MYNDIGHETER
  // ==========================================
  // VA-avgift
  let vaKostnad = 0;
  if (input.kommunTyp === 'custom') {
    vaKostnad = Math.max(0, input.customVaCost || 0);
  } else {
    const match = PRESETS.vaAvgift.find((v) => v.value === input.kommunTyp);
    vaKostnad = match?.cost ?? 360000;
  }
  const matchKommun = PRESETS.vaAvgift.find((v) => v.value === input.kommunTyp);

  items.push({
    id: 'va_avgift',
    category: 'kommun_myndighet',
    name: `Kommunal VA-anslutningsavgift (${matchKommun?.label || 'VA'})`,
    amount: vaKostnad,
    description: matchKommun?.description || 'Kommunal anläggningsavgift för vatten och spillvatten.',
    formulaNote: input.kommunTyp === 'custom' ? 'Offert / Egen taxa' : 'Kommunal schablontaxa',
    isCustom: input.kommunTyp === 'custom',
  });

  // Bygglov grundavgift
  const bygglovAvgift = Math.max(0, input.bygglovGrundavgift ?? PRESETS.bygglov.grundavgift);
  items.push({
    id: 'bygglov_grund',
    category: 'kommun_myndighet',
    name: 'Bygglov (Handläggnings- & prövningsavgift)',
    amount: bygglovAvgift,
    description: 'Avgift enligt kommunal plan- och bygglovstaxa för prövning och startbesked.',
    formulaNote: `${bygglovAvgift.toLocaleString('sv-SE')} kr`,
  });

  // Planavgift
  let planavgift = 0;
  if (input.arInomPlanlagtOmrade) {
    const totalArea = (input.husBostadsyta || 0) + (input.extrabyggnaderYta || 0);
    const planRate = input.planavgiftPerKvm ?? PRESETS.bygglov.planavgiftDefaultPerKvm;
    planavgift = Math.round(totalArea * planRate);

    items.push({
      id: 'planavgift',
      category: 'kommun_myndighet',
      name: 'Planavgift (Detaljplanerat område)',
      amount: planavgift,
      description: PRESETS.bygglov.legalNotice,
      formulaNote: `${totalArea} m² BTA x ${planRate} kr/m²`,
    });
  }

  // Nybyggnadskarta
  let nybyggnadskartaKostnad = 0;
  if (input.nybyggnadskartaMode === 'custom') {
    nybyggnadskartaKostnad = Math.max(0, input.customNybyggnadskartaCost || 0);
  } else {
    nybyggnadskartaKostnad = PRESETS.nybyggnadskarta.schablon;
  }

  items.push({
    id: 'nybyggnadskarta',
    category: 'kommun_myndighet',
    name: 'Nybyggnadskarta',
    amount: nybyggnadskartaKostnad,
    description: PRESETS.nybyggnadskarta.description,
    formulaNote: input.nybyggnadskartaMode === 'custom' ? 'Eget pris' : 'Schablon 15 000 kr',
    isCustom: input.nybyggnadskartaMode === 'custom',
  });

  // Utstakning och lägeskontroll
  const utstakningKostnad = calculateUtstakningCost(input);
  if (utstakningKostnad > 0 || input.utstakningMode !== 'none') {
    items.push({
      id: 'utstakning',
      category: 'kommun_myndighet',
      name: 'Utstakning & Lägeskontroll (Grov-, finutstakning & kontroll)',
      amount: utstakningKostnad,
      description: PRESETS.utstakning.description,
      formulaNote: input.utstakningMode === 'custom' ? 'Offert/Taxa' : 'Schablon 12 000 kr',
      isCustom: input.utstakningMode === 'custom',
    });
  }

  // Byggfelsförsäkring och färdigställandeskydd
  const byggfelsforsakringKostnad = calculateByggfelsforsakringCost(input);
  const matchByggfels = PRESETS.byggfelsforsakring.find((b) => b.value === input.byggfelsforsakringMode);
  if (byggfelsforsakringKostnad > 0 || input.byggfelsforsakringMode !== 'none') {
    items.push({
      id: 'byggfelsforsakring',
      category: 'kommun_myndighet',
      name: `Byggfelsförsäkring & Färdigställandeskydd (${matchByggfels?.label || 'Försäkring'})`,
      amount: byggfelsforsakringKostnad,
      description: matchByggfels?.description || PRESETS.byggfelsforsakring[0].description,
      formulaNote: input.byggfelsforsakringMode === 'custom' ? 'Offertpris' : `${byggfelsforsakringKostnad.toLocaleString('sv-SE')} kr`,
      isCustom: input.byggfelsforsakringMode === 'custom',
    });
  }

  // Kontrollansvarig (KA)
  let kaKostnad = 0;
  if (input.kaMode === 'custom') {
    kaKostnad = Math.max(0, input.customKaCost || 0);
  } else {
    kaKostnad = PRESETS.kvalitetsansvarig.schablon;
  }

  items.push({
    id: 'kvalitetsansvarig',
    category: 'kommun_myndighet',
    name: 'Kontrollansvarig (KA enligt PBL)',
    amount: kaKostnad,
    description: PRESETS.kvalitetsansvarig.description,
    formulaNote: input.kaMode === 'custom' ? 'Offertpris' : 'Schablon 30 000 kr',
    isCustom: input.kaMode === 'custom',
  });

  // ==========================================
  // 5. LOGISTIK & INFRASTRUKTUR
  // ==========================================
  // Fiber
  let fiberKostnad = 0;
  if (input.fiberPreset === 'custom') {
    fiberKostnad = Math.max(0, input.customFiberCost || 0);
  } else {
    const match = PRESETS.fiber.find((f) => f.value === input.fiberPreset);
    fiberKostnad = match?.cost ?? 25000;
  }
  const matchFiber = PRESETS.fiber.find((f) => f.value === input.fiberPreset);

  items.push({
    id: 'fiber',
    category: 'logistik_infrastruktur',
    name: `Fiberanslutning (${matchFiber?.label || 'Bredband'})`,
    amount: fiberKostnad,
    description: matchFiber?.description || 'Fast anslutning till fibernät.',
    formulaNote: input.fiberPreset === 'custom' ? 'Offert' : `${fiberKostnad.toLocaleString('sv-SE')} kr`,
    isCustom: input.fiberPreset === 'custom',
  });

  // Omlastningskostnad
  if (input.omlastningBehov) {
    const omlastningKostnad =
      input.omlastningMode === 'custom'
        ? Math.max(0, input.customOmlastningCost || 0)
        : PRESETS.omlastning.schablon;

    items.push({
      id: 'omlastning',
      category: 'logistik_infrastruktur',
      name: 'Omlastning (Begränsad bärighet/vägbredd)',
      amount: omlastningKostnad,
      description: PRESETS.omlastning.description,
      formulaNote: input.omlastningMode === 'custom' ? 'Offertpris' : 'Schablon 35 000 kr',
      isCustom: input.omlastningMode === 'custom',
    });
  }

  // Byggelskåp
  const byggelskapKostnad =
    input.byggelskapMode === 'custom'
      ? Math.max(0, input.customByggelskapCost || 0)
      : PRESETS.byggelskap.schablon;

  items.push({
    id: 'byggelskap',
    category: 'logistik_infrastruktur',
    name: 'Hyra av byggelskåp & etablering',
    amount: byggelskapKostnad,
    description: PRESETS.byggelskap.description,
    formulaNote: input.byggelskapMode === 'custom' ? 'Offertpris' : 'Schablon 10 000 kr',
    isCustom: input.byggelskapMode === 'custom',
  });

  // ==========================================
  // 6. INTERIÖR & TILLVAL
  // ==========================================
  // Kök
  let kokKostnad = 0;
  if (input.kokTillval === 'custom') {
    kokKostnad = Math.max(0, input.customKokCost || 0);
  } else {
    const match = PRESETS.kok.find((k) => k.value === input.kokTillval);
    kokKostnad = match?.cost ?? 150000;
  }
  const matchKok = PRESETS.kok.find((k) => k.value === input.kokTillval);

  items.push({
    id: 'kok_tillval',
    category: 'interior_tillval',
    name: `Kökstillval: ${matchKok?.label || 'Tillval kök'}`,
    amount: kokKostnad,
    description: matchKok?.description || 'Tillägg för kökssnickerier och vitvaror.',
    formulaNote: input.kokTillval === 'custom' ? 'Offert' : `${kokKostnad.toLocaleString('sv-SE')} kr`,
    isCustom: input.kokTillval === 'custom',
  });

  // Badrum / Kakel
  let badrumKostnad = 0;
  const totalVatrumsyta = (input.antalBadrumTvatt || 0) * (input.kvmPerVatutrymme ?? 10);

  if (input.badrumKakelTillval === 'custom') {
    badrumKostnad = Math.max(0, input.customBadrumTotalCost || 0);
  } else {
    const match = PRESETS.badrum.tiers.find((b) => b.value === input.badrumKakelTillval);
    const extraRate = match?.ratePerUnit ?? 0;
    badrumKostnad = Math.round(totalVatrumsyta * extraRate);
  }
  const matchBadrum = PRESETS.badrum.tiers.find((b) => b.value === input.badrumKakelTillval);

  items.push({
    id: 'badrum_kakel',
    category: 'interior_tillval',
    name: `Tillval klinker/kakel, våtrum (${input.antalBadrumTvatt} st, tot ${totalVatrumsyta} m²)`,
    amount: badrumKostnad,
    description: `${matchBadrum?.label || 'Tillval'}: ${matchBadrum?.description || ''}`,
    formulaNote:
      input.badrumKakelTillval === 'custom'
        ? 'Eget val'
        : `${totalVatrumsyta} m² x ${matchBadrum?.ratePerUnit ?? 0} kr/m²`,
    isCustom: input.badrumKakelTillval === 'custom',
  });

  // Golv
  let golvKostnad = 0;
  if (input.uppgraderaGolv) {
    const golvRate = input.golvKostnadPerKvm ?? PRESETS.golv.merprisPerKvm;
    golvKostnad = Math.round((input.husBostadsyta || 0) * golvRate);

    items.push({
      id: 'golv_uppgradering',
      category: 'interior_tillval',
      name: `Golvuppgradering (${input.husBostadsyta} m² parkett)`,
      amount: golvKostnad,
      description: `${PRESETS.golv.brandExample}. ${PRESETS.golv.notice}`,
      formulaNote: `${input.husBostadsyta} m² x ${golvRate.toLocaleString('sv-SE')} kr/m²`,
    });
  }

  // Övriga tillval
  let ovrigaKostnad = 0;
  if (input.ovrigaTillval === 'custom') {
    ovrigaKostnad = Math.max(0, input.customOvrigaTillvalCost || 0);
  } else {
    const match = PRESETS.ovrigaTillval.find((o) => o.value === input.ovrigaTillval);
    ovrigaKostnad = match?.cost ?? 50000;
  }
  const matchOvriga = PRESETS.ovrigaTillval.find((o) => o.value === input.ovrigaTillval);

  if (ovrigaKostnad > 0 || input.ovrigaTillval !== 'none') {
    items.push({
      id: 'ovriga_tillval',
      category: 'interior_tillval',
      name: `Övriga tillval: ${matchOvriga?.label || 'Tillval'}`,
      amount: ovrigaKostnad,
      description: matchOvriga?.description || 'Bredare trappa, fasadbelysning mm.',
      formulaNote: input.ovrigaTillval === 'custom' ? 'Offert' : `${ovrigaKostnad.toLocaleString('sv-SE')} kr`,
      isCustom: input.ovrigaTillval === 'custom',
    });
  }

  // ==========================================
  // 7. TRÄDGÅRD & UTEMILJÖ
  // ==========================================
  // Finplanering tomt
  let finplaneringKostnad = 0;
  if (input.finplaneringTomt && input.finplaneringYtaKvm > 0) {
    const finplaneringRate =
      input.finplaneringKostnadPerKvm ?? PRESETS.finplaneringTomt.recommendedPerKvm;
    finplaneringKostnad = Math.round(input.finplaneringYtaKvm * finplaneringRate);

    items.push({
      id: 'finplanering_tomt',
      category: 'tradgard_utemiljo',
      name: `Finplanering tomt (${input.finplaneringYtaKvm} m²)`,
      amount: finplaneringKostnad,
      description: PRESETS.finplaneringTomt.description,
      formulaNote: `${input.finplaneringYtaKvm} m² x ${finplaneringRate} kr/m²`,
    });
  }

  // Altan
  let altanKostnad = 0;
  if (input.altanVal !== 'none') {
    let sqm = 40;
    if (input.altanVal === 'small') sqm = 20;
    if (input.altanVal === 'medium') sqm = 40;
    if (input.altanVal === 'large') sqm = 75;
    if (input.altanVal === 'custom') sqm = input.altanKvm || 0;

    const rate = input.altanKostnadPerKvm ?? PRESETS.altan.schablonPerKvm;
    altanKostnad = Math.round(sqm * rate);

    items.push({
      id: 'altan',
      category: 'tradgard_utemiljo',
      name: `Altan / Trädäck (${sqm} m²)`,
      amount: altanKostnad,
      description: `Trädäck uppfört i tryckimpregnerat virke inklusive plintar, bärlinor och trall.`,
      formulaNote: `${sqm} m² x ${rate.toLocaleString('sv-SE')} kr/m²`,
    });
  }

  // ==========================================
  // 8. FINANSIERING, BUFFERT & AVGIFTER
  // ==========================================
  // Post för oförutsett (schablon 5 % på produktionskostnad exklusive tomt)
  const productionBase = items
    .filter((it) => it.category !== 'tomt_forvarv')
    .reduce((sum, it) => sum + it.amount, 0);

  let oforutsettKostnad = 0;
  if (input.oforutsettMode === 'custom') {
    oforutsettKostnad = Math.max(0, input.customOforutsettCost ?? 0);
  } else if (input.oforutsettMode === 'percent') {
    const pct = Math.max(0, input.oforutsettProcent ?? PRESETS.oforutsett.standardProcent);
    oforutsettKostnad = Math.round(productionBase * (pct / 100));
  }
  if (oforutsettKostnad > 0 || input.oforutsettMode !== 'none') {
    items.push({
      id: 'oforutsett',
      category: 'finansiering_avgifter',
      name: `Post för oförutsett (${input.oforutsettMode === 'percent' ? `${input.oforutsettProcent} %` : 'Fast belopp'})`,
      amount: oforutsettKostnad,
      description: PRESETS.oforutsett.description,
      formulaNote:
        input.oforutsettMode === 'percent'
          ? `${input.oforutsettProcent} % av ${productionBase.toLocaleString('sv-SE')} kr`
          : 'Fast belopp',
      isCustom: input.oforutsettMode === 'custom',
    });
  }

  // Dubbelboende under byggtid
  const dubbelboendeKostnad = calculateDubbelboendeCost(input);
  if (input.dubbelboendeEnabled && (dubbelboendeKostnad > 0 || input.dubbelboendeMode === 'custom')) {
    const dubbelM = input.dubbelboendeManader ?? PRESETS.dubbelboende.standardManader;
    const dubbelRate = input.dubbelboendeKostnadPerManad ?? PRESETS.dubbelboende.standardKostnadPerManad;
    items.push({
      id: 'dubbelboende',
      category: 'finansiering_avgifter',
      name: `Dubbelboende under byggtid (${dubbelM} månader)`,
      amount: dubbelboendeKostnad,
      description: PRESETS.dubbelboende.description,
      formulaNote:
        input.dubbelboendeMode === 'custom'
          ? 'Eget belopp'
          : `${dubbelM} mån x ${dubbelRate.toLocaleString('sv-SE')} kr/mån`,
      isCustom: input.dubbelboendeMode === 'custom',
    });
  }

  // Delsumma före finansieringskostnader (kreditiv & pantbrev)
  const subtotalBeforeFinance = items.reduce((sum, item) => sum + item.amount, 0);

  // Beräkna uppskattat lånebelopp
  const belaningsgrad = Math.min(100, Math.max(0, input.belaningsgradProcent ?? 85)) / 100;
  const beraknatLanebelopp =
    input.egetLanebelopp > 0
      ? input.egetLanebelopp
      : Math.round(subtotalBeforeFinance * belaningsgrad);

  // Byggnadskreditiv
  let kreditivkostnad = 0;
  if (input.beraknaKreditiv && beraknatLanebelopp > 0) {
    const rantePct = input.kreditivRantesatsProcent ?? PRESETS.finansiering.rantesatsSchablon;
    const byggtidManader =
      input.kreditivByggtidManader ?? PRESETS.finansiering.standardByggtidManader;
    const rantesats = rantePct / 100;
    const ar = byggtidManader / 12;
    // Byggnadskreditiv dras successivt under byggtiden, schablon 55 % snittutnyttjande
    kreditivkostnad = Math.round(
      beraknatLanebelopp * rantesats * ar * PRESETS.finansiering.genomsnittligtUtnyttjandeGrad
    );

    items.push({
      id: 'byggnadskreditiv',
      category: 'finansiering_avgifter',
      name: 'Ränta byggnadskreditiv under byggtiden',
      amount: kreditivkostnad,
      description: `Räntekostnad för byggnadskreditiv beräknat på ${beraknatLanebelopp.toLocaleString('sv-SE')} kr i lån med ${rantePct} % ränta under ${byggtidManader} månader (genomsnittlig utnyttjandegrad 55 %).`,
      formulaNote: `${rantePct} % ränta, ${byggtidManader} mån`,
    });
  }

  // Pantbrev
  let pantbrevsavgift = 0;
  let nyttPantbrevsbelopp = 0;
  if (input.behoverPantbrev && beraknatLanebelopp > 0) {
    const befintligt = Math.max(0, input.befintligtPantbrev || 0);
    nyttPantbrevsbelopp = Math.max(0, beraknatLanebelopp - befintligt);

    if (nyttPantbrevsbelopp > 0) {
      pantbrevsavgift = Math.round(
        nyttPantbrevsbelopp * PRESETS.finansiering.pantbrevSkattesats +
          PRESETS.finansiering.pantbrevFastAvgift
      );

      items.push({
        id: 'pantbrev',
        category: 'finansiering_avgifter',
        name: 'Pantbrevsavgift (Stämpelskatt 2 %)',
        amount: pantbrevsavgift,
        description: `Stämpelskatt på nytecknade pantbrev för ${nyttPantbrevsbelopp.toLocaleString('sv-SE')} kr (efter avdrag för ${befintligt.toLocaleString('sv-SE')} kr i befintliga pantbrev).`,
        formulaNote: `2 % av ${nyttPantbrevsbelopp.toLocaleString('sv-SE')} kr + 375 kr avgift`,
      });
    }
  }

  // ==========================================
  // SUMMERING & RESULTAT
  // ==========================================
  const totalProjectCost = items.reduce((sum, item) => sum + item.amount, 0);

  const husArea = Math.max(1, input.husBostadsyta || 1);
  const costPerSqmTotal = Math.round(totalProjectCost / husArea);

  // Kategorikartläggning
  const categoryMeta: Record<
    CalculationCategory,
    { title: string; description: string }
  > = {
    tomt_forvarv: {
      title: 'Tomt & Fastighetsförvärv',
      description: 'Köpeskilling för tomtmark och lagfartskostnader.',
    },
    mark_forberedelse: {
      title: 'Markarbete & Tomtförberedelser',
      description: 'Schaktning, bergsprängning, VA-rörgrav, invasiva arter och rivning.',
    },
    bygg_material: {
      title: 'Byggnation & Entreprenad',
      description: 'Husbyggsats, montering, stomresning och målning.',
    },
    kommun_myndighet: {
      title: 'Kommunala avgifter & Tillstånd',
      description: 'Kommunal VA-anslutning, bygglov, planavgift, nybyggnadskarta och KA.',
    },
    logistik_infrastruktur: {
      title: 'Infrastruktur & Etablering',
      description: 'Fiberbredband, omlastning för trång väg och hyra av byggelskåp.',
    },
    interior_tillval: {
      title: 'Inredning & Tillval',
      description: 'Kökstillval, badrumskakel, golvuppgradering och snickeritillval.',
    },
    tradgard_utemiljo: {
      title: 'Utemiljö & Trädgård',
      description: 'Finplanering av tomtmark och uppförande av altan.',
    },
    finansiering_avgifter: {
      title: 'Finansiering, buffert & avgifter',
      description: 'Buffert för oförutsett (5 %), dubbelboende, byggnadskreditiv och pantbrev.',
    },
  };

  const categories: Record<CalculationCategory, CategorySummary> = {
    tomt_forvarv: { id: 'tomt_forvarv', ...categoryMeta.tomt_forvarv, total: 0, items: [] },
    mark_forberedelse: { id: 'mark_forberedelse', ...categoryMeta.mark_forberedelse, total: 0, items: [] },
    bygg_material: { id: 'bygg_material', ...categoryMeta.bygg_material, total: 0, items: [] },
    kommun_myndighet: { id: 'kommun_myndighet', ...categoryMeta.kommun_myndighet, total: 0, items: [] },
    logistik_infrastruktur: { id: 'logistik_infrastruktur', ...categoryMeta.logistik_infrastruktur, total: 0, items: [] },
    interior_tillval: { id: 'interior_tillval', ...categoryMeta.interior_tillval, total: 0, items: [] },
    tradgard_utemiljo: { id: 'tradgard_utemiljo', ...categoryMeta.tradgard_utemiljo, total: 0, items: [] },
    finansiering_avgifter: { id: 'finansiering_avgifter', ...categoryMeta.finansiering_avgifter, total: 0, items: [] },
  };

  for (const item of items) {
    if (categories[item.category]) {
      categories[item.category].items.push(item);
      categories[item.category].total += item.amount;
    }
  }

  const categoryList = Object.values(categories);

  const costPerSqmBuildingOnly = Math.round(categories.bygg_material.total / husArea);

  return {
    totalProjectCost,
    costPerSqmTotal,
    costPerSqmBuildingOnly,
    categories,
    categoryList,
    items,

    tomtSubtotal: categories.tomt_forvarv.total,
    markSubtotal: categories.mark_forberedelse.total,
    husSubtotal: categories.bygg_material.total,
    kommunSubtotal: categories.kommun_myndighet.total,
    infrastrukturSubtotal: categories.logistik_infrastruktur.total,
    tillvalSubtotal: categories.interior_tillval.total,
    tradgardSubtotal: categories.tradgard_utemiljo.total,
    finansieringSubtotal: categories.finansiering_avgifter.total,

    uppskattatLanebelopp: beraknatLanebelopp,
    pantbrevsbeloppNytt: nyttPantbrevsbelopp,
    pantbrevsavgift,
    kreditivkostnad,

    arkitektKostnad,
    geoteknikKostnad,
    utstakningKostnad,
    byggfelsforsakringKostnad,
    oforutsettKostnad,
    dubbelboendeKostnad,
  };
}
