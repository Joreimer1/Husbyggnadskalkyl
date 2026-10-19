/**
 * TypeScript-typer och gränssnitt för Husbyggnadskalkylator.
 * Modellen hanterar indata, valda schabloner och fullständigt beräkningsresultat.
 */

export type MunicipalityType = 'growth' | 'standard' | 'custom';

export type GroundworkPreset =
  | 'flat_near_sewer'
  | 'trenching_sewer'
  | 'blasting_slope'
  | 'inaccessible_blasting_road'
  | 'custom';

export type SewerTerrainType = 'easy' | 'difficult' | 'blasting';

export type ByggkostnadMode = 'sqm' | 'custom';

export type HouseKitMode = 'sqm' | 'fixed';

export type LogisticsMode = 'preset' | 'custom';

export type FiberPreset = 'campaign' | 'no_campaign' | 'none' | 'custom';

export type InvasiveSpeciesType = 'none' | 'small_knotweed' | 'full_excavation' | 'custom';

export type PaintingMode = 'small_house' | 'large_house' | 'self_paint' | 'custom';

export type KitchenTier = 'standard' | 'medium' | 'luxury' | 'ultra_luxury' | 'custom';

export type BathroomTier = 'standard' | 'medium' | 'exclusive' | 'custom';

export type OtherOptionsTier = 'none' | 'small' | 'medium' | 'large' | 'custom';

export type DeckSizeTier = 'none' | 'small' | 'medium' | 'large' | 'custom';

export interface CalculationInput {
  // Grundläggande dimensioner
  tomtPris: number;
  husBostadsyta: number; // Kvm bostadsyta
  extrabyggnaderYta: number; // Kvm garage/förråd/komplementbyggnad

  // Lagfart
  lagfartProcent: number; // Schablon 1.5%

  // Grundarbete
  grundarbetePreset: GroundworkPreset;
  customGrundarbeteCost: number;

  // Extra avloppsgrävning
  extraAvloppEnabled: boolean;
  extraAvloppMeter: number;
  extraAvloppTerrain: SewerTerrainType;
  customExtraAvloppCostPerMeter: number;

  // Byggentreprenad / montering
  byggkostnadMode: ByggkostnadMode;
  byggkostnadPerKvm: number;
  customByggkostnad: number;

  // Komplementbyggnad (garage, förråd, carport mm)
  inkluderaKomplementIByggkostnad: boolean;
  komplementByggkostnadMode: 'sqm' | 'custom';
  komplementByggkostnadPerKvm: number;
  customKomplementByggkostnad: number;

  // Kvalitetsansvarig (KA)
  kaMode: 'preset' | 'custom';
  customKaCost: number;

  // Husmaterialsats
  husmaterialsatsMode: HouseKitMode;
  husmaterialsatsPerKvm: number;
  customHusmaterialsatsFastPris: number;

  // Logistik och etablering
  omlastningBehov: boolean;
  omlastningMode: LogisticsMode;
  customOmlastningCost: number;

  byggelskapMode: LogisticsMode;
  customByggelskapCost: number;

  // Kommunala avgifter (VA, Bygglov, Karta)
  kommunTyp: MunicipalityType;
  customVaCost: number;

  bygglovGrundavgift: number;
  arInomPlanlagtOmrade: boolean;
  planavgiftPerKvm: number;
  customPlanavgift: number;

  nybyggnadskartaMode: 'preset' | 'custom';
  customNybyggnadskartaCost: number;

  // Fiber
  fiberPreset: FiberPreset;
  customFiberCost: number;

  // Rivning
  harRivningsbehov: boolean;
  rivningsYta: number;
  harAsbestrisk: boolean;
  customRivningskostnad: number;

  // Invasiva växter
  invasivaVaxterTyp: InvasiveSpeciesType;
  customInvasivaVaxterCost: number;

  // Finansiering & Pantbrev
  beraknaKreditiv: boolean;
  belaningsgradProcent: number; // t.ex. 85%
  egetLanebelopp: number; // Om användaren vill ange specifikt lånebelopp (0 för automatisk)
  kreditivRantesatsProcent: number; // t.ex. 4.25%
  kreditivByggtidManader: number; // t.ex. 12 månader

  behoverPantbrev: boolean;
  befintligtPantbrev: number; // Redan uttagna pantbrev på fastigheten

  // Målning
  malningMode: PaintingMode;
  customMalningCost: number;

  // Tillval
  kokTillval: KitchenTier;
  customKokCost: number;

  antalBadrumTvatt: number;
  kvmPerVatutrymme: number;
  badrumKakelTillval: BathroomTier;
  customBadrumExtraPerKvm: number;
  customBadrumTotalCost: number;

  uppgraderaGolv: boolean;
  golvKostnadPerKvm: number;
  customGolvCost: number;

  ovrigaTillval: OtherOptionsTier;
  customOvrigaTillvalCost: number;

  // Tomt & Trädgård
  finplaneringTomt: boolean;
  finplaneringYtaKvm: number;
  finplaneringKostnadPerKvm: number;
  customFinplaneringCost: number;

  altanVal: DeckSizeTier;
  altanKvm: number;
  altanKostnadPerKvm: number;
  customAltanCost: number;
}

export interface CalculationLineItem {
  id: string;
  category: CalculationCategory;
  name: string;
  amount: number;
  description: string;
  formulaNote?: string;
  isCustom?: boolean;
}

export type CalculationCategory =
  | 'tomt_forvarv'
  | 'mark_forberedelse'
  | 'bygg_material'
  | 'kommun_myndighet'
  | 'logistik_infrastruktur'
  | 'interior_tillval'
  | 'tradgard_utemiljo'
  | 'finansiering_avgifter';

export interface CategorySummary {
  id: CalculationCategory;
  title: string;
  description: string;
  total: number;
  items: CalculationLineItem[];
}

export interface CalculationResult {
  // Totaler
  totalProjectCost: number;
  costPerSqmTotal: number;
  costPerSqmBuildingOnly: number;

  // Summering per huvudkategori
  categories: Record<CalculationCategory, CategorySummary>;
  categoryList: CategorySummary[];

  // Linjeposter
  items: CalculationLineItem[];

  // Specifika nyckeltal för analys
  tomtSubtotal: number;
  markSubtotal: number;
  husSubtotal: number;
  kommunSubtotal: number;
  infrastrukturSubtotal: number;
  tillvalSubtotal: number;
  tradgardSubtotal: number;
  finansieringSubtotal: number;

  // Finansieringsanalys
  uppskattatLanebelopp: number;
  pantbrevsbeloppNytt: number;
  pantbrevsavgift: number;
  kreditivkostnad: number;
}
