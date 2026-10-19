import {
  CalculationInput,
  GroundworkPreset,
  SewerTerrainType,
  MunicipalityType,
  FiberPreset,
  InvasiveSpeciesType,
  PaintingMode,
  KitchenTier,
  BathroomTier,
  OtherOptionsTier,
  DeckSizeTier,
} from '@/types/calculation';

export interface PresetOption<T> {
  value: T;
  label: string;
  description: string;
  cost?: number;
  ratePerUnit?: number;
  unitLabel?: string;
  recommended?: boolean;
}

export const PRESETS = {
  // Grundläggande standardvärden
  defaults: {
    tomtPris: 1500000,
    husBostadsyta: 150,
    extrabyggnaderYta: 35, // T.ex. garage eller carport/förråd
  },

  // Lagfart
  lagfart: {
    rate: 0.015, // 1.5% stämpelskatt på tomtpris
    expeditionsavgift: 825, // Lantmäteriets administrativa avgift
    description: 'Lagfartskostnaden utgörs av 1,5 % stämpelskatt på köpeskillingen för tomten samt Lantmäteriets administrativa expeditionsavgift (825 kr).',
  },

  // Grundarbete
  grundarbete: [
    {
      value: 'flat_near_sewer',
      label: 'Helt plan tomt med max 10 m till avlopp',
      description: 'Ingen extra markkostnad utöver grundstandard i entreprenaden.',
      cost: 0,
    },
    {
      value: 'trenching_sewer',
      label: 'Schaktning och grävning för avlopp',
      description: 'Standardmark med normal schaktning och rörläggning fram till anslutningspunkt.',
      cost: 200000,
    },
    {
      value: 'blasting_slope',
      label: 'Sprängning av berg och kuperad tomt',
      description: 'Berg i dagen, bortforsling av sprängmassor samt markutjämning.',
      cost: 500000,
    },
    {
      value: 'inaccessible_blasting_road',
      label: 'Mycket otillgänglig tomt med längre uppfartsväg',
      description: 'Omfattande bergsprängning, markstabilisering, anläggning av tillfartsväg och förstärkningslager.',
      cost: 1000000,
    },
    {
      value: 'custom',
      label: 'Enligt separat entreprenadoffert (exkl. betongplatta)',
      description: 'Mata in exakt pris baserat på geoteknisk undersökning eller entreprenörens anbud.',
    },
  ] as PresetOption<GroundworkPreset>[],

  // Extra avloppsgrävning
  extraAvlopp: [
    {
      value: 'easy',
      label: 'Lättgrävd mark (matjord/sand)',
      description: 'Normal grävning utan hinder i marken.',
      ratePerUnit: 1500,
      unitLabel: 'kr/löpande meter',
    },
    {
      value: 'difficult',
      label: 'Otillgänglig mark (stubbar, trädrötter, grundvatten)',
      description: 'Kräver större maskiner, trädfällning eller dräneringsåtgärder.',
      ratePerUnit: 3000,
      unitLabel: 'kr/löpande meter',
    },
    {
      value: 'blasting',
      label: 'Berggrund som fordrar sprängning/spräckning',
      description: 'Kräver bergsprängare, besiktning av grannfastigheter och borrning.',
      ratePerUnit: 6000,
      unitLabel: 'kr/löpande meter',
    },
  ] as PresetOption<SewerTerrainType>[],

  // Byggentreprenad / montering
  byggkostnad: {
    schablonPerKvm: 10000,
    description: 'Schablonkostnad för montering och entreprenadarbete av stomme och insida (ca 10 000 kr/m²).',
  },

  // Komplementbyggnad (garage, förråd, carport mm)
  komplementbyggnad: {
    schablonPerKvm: 8000,
    intervallMin: 6000,
    intervallMax: 12000,
    description: 'Schablonkostnad för uppförande av garage, carport eller komplementbyggnad (normalt 6 000–10 000 kr/m² beroende på isoleringsgrad och markplatta).',
  },

  // Kontrollansvarig (KA)
  kvalitetsansvarig: {
    schablon: 30000,
    description: 'Certifierad kontrollansvarig enligt Plan- och bygglagen (PBL) för tekniskt samråd, kontrollplan, arbetsplatsbesök och slutsamråd.',
  },

  // Husmaterialsats
  husmaterialsats: {
    minPerKvm: 10000,
    recommendedPerKvm: 12000,
    maxPerKvm: 14000,
    description: 'Prisintervall för prefabricerad husbyggsats eller modulleverans (vanligtvis 10 000–14 000 kr/m²). Alternativt kan fast offertbelopp anges.',
  },

  // Logistik och etablering
  omlastning: {
    schablon: 35000,
    description: 'Omlastning vid terminal eller vändplan om tillfartsvägen inte klarar 24-meters lastbilar med släp.',
  },

  byggelskap: {
    schablon: 10000,
    description: 'Hyra och anslutning av tillfälligt byggel- och distributionsskåp under entreprenadtiden.',
  },

  // Kommunala avgifter
  vaAvgift: [
    {
      value: 'growth',
      label: 'Tillväxtkommun (t.ex. Värmdö kommun)',
      description: 'Hög anläggningstaxa i expansiva skärgårds- eller tillväxtkommuner.',
      cost: 360000,
    },
    {
      value: 'standard',
      label: 'Standardkommun',
      description: 'Normal anläggningstaxa för anslutning till kommunalt vatten- och spillvattennät.',
      cost: 180000,
    },
    {
      value: 'custom',
      label: 'Eget belopp enligt kommunal VA-taxa',
      description: 'Ange exakt anläggningsavgift enligt lokal kommunal taxa och fastighetens tomtyta.',
    },
  ] as PresetOption<MunicipalityType>[],

  bygglov: {
    grundavgift: 25000,
    planavgiftMinPerKvm: 150,
    planavgiftMaxPerKvm: 350,
    planavgiftDefaultPerKvm: 250,
    legalNotice: 'Observera: Planavgift och bygglovstaxor varierar mellan kommuner och baseras på gällande detaljplan och bruttoarea (BTA). Den faktiska avgiften måste alltid kontrolleras direkt med byggnadsnämnden i aktuell kommun.',
  },

  nybyggnadskarta: {
    schablon: 15000,
    intervallMin: 15000,
    intervallMax: 20000,
    description: 'Officiell nybyggnadskarta upprättad av kommunens mätningsavdelning eller auktoriserad mätkonsult för bygglovsansökan.',
  },

  // Fiber
  fiber: [
    {
      value: 'campaign',
      label: 'Kampanjanslutning (befintligt utbyggnadsområde)',
      description: 'Gäller vid pågående fiberutbyggnad i området med subventionerad anslutning.',
      cost: 25000,
    },
    {
      value: 'no_campaign',
      label: 'Efteranslutning utan kampanj',
      description: 'Enskild framdragning och grävning från befintlig nodpunkt utan grupprabatt.',
      cost: 150000,
    },
    {
      value: 'none',
      label: 'Ingen anslutning (5G / befintlig fiber)',
      description: 'Fastigheten nyttjar mobilt bredband eller har redan aktiv kanalisation.',
      cost: 0,
    },
    {
      value: 'custom',
      label: 'Eget offertpris från nätägare',
      description: 'Mata in exakt prisuppgift från Open Infra, Telia, GlobalConnect eller lokal stadsnätsoperatör.',
    },
  ] as PresetOption<FiberPreset>[],

  // Rivning
  rivning: {
    standardPerKvm: 4000,
    asbestPerKvm: 6000,
    description: 'Schablon för maskinell rivning, sortering och deponiavgifter. Standard: 4 000 kr/m². Vid asbestförekomst (eternitplattor, rörisolering mm) tillkommer saneringskostnader till ca 6 000 kr/m². Notera: Mindre sommarstugor uppförda under 1950-talet saknar ofta asbest.',
  },

  // Invasiva växter
  invasivaVaxter: [
    {
      value: 'none',
      label: 'Ingen känd förekomst av invasiva arter',
      description: 'Tomten är fri från parkslide och andra reglerade arter.',
      cost: 0,
    },
    {
      value: 'small_knotweed',
      label: 'Mindre bestånd av parkslide (kemisk/termisk bekämpning)',
      description: 'Lokaliserad insats och dispensansökan hos tillsynsmyndighet utan schaktning.',
      cost: 45000,
    },
    {
      value: 'full_excavation',
      label: 'Fullständig sanering med schaktning (4 meter säkerhetszon)',
      description: 'Nödvändigt vid grundläggning på beståndet. Schaktning 4 m runt om och 2–3 m djupt, täckning med certifierad geomembran samt deponi.',
      cost: 350000, // Schablon mellan 300 000 - 400 000 kr
    },
    {
      value: 'custom',
      label: 'Separat saneringsoffert från marksanerare',
      description: 'Ange kostnad baserad på biologisk fältbesiktning och saneringsplan.',
    },
  ] as PresetOption<InvasiveSpeciesType>[],

  // Finansiering & Pantbrev
  finansiering: {
    rantesatsSchablon: 4.25, // Intervall 3.5 - 5.0%
    standardByggtidManader: 12,
    genomsnittligtUtnyttjandeGrad: 0.55, // Byggnadskreditiv nyttjas successivt (snitt ca 50-60%)
    pantbrevSkattesats: 0.02, // 2.0% statlig stämpelskatt
    pantbrevFastAvgift: 375, // Administrativ avgift per pantbrev
    description: 'Byggnadskreditiv debiteras ränta endast på utnyttjat belopp under produktionsfasen. Pantbrev beläggs med 2 % statlig stämpelskatt på nytecknat belopp.',
  },

  // Målning av byggnader
  malning: [
    {
      value: 'small_house',
      label: 'Målning mindre villa (< 130 m²)',
      description: 'Grundning och två strykningar av fasad, foder, knutar och vindskivor.',
      cost: 100000,
    },
    {
      value: 'large_house',
      label: 'Målning större villa (130–220+ m²)',
      description: 'Fullständig exteriör strykning inklusive ställningshyra och takkupor.',
      cost: 200000,
    },
    {
      value: 'self_paint',
      label: 'Egenmålning / endast färginköp',
      description: 'Materialkostnad för kvalitetsfärg och redskap (inget entreprenadarvode).',
      cost: 25000,
    },
    {
      value: 'custom',
      label: 'Målerioffert enligt anbud',
      description: 'Ange offertbelopp från anlitad målerifirma.',
    },
  ] as PresetOption<PaintingMode>[],

  // Kökstillval
  kok: [
    {
      value: 'standard',
      label: 'Husleverantörens basstandard',
      description: 'Ingår i grundleveransavtalet med laminatbänkskiva och standardvitvaror.',
      cost: 0,
    },
    {
      value: 'medium',
      label: 'Mellannivå med komposit-/stenskiva',
      description: 'Uppgraderade luckor, integrerad belysning och bänkskiva i sten eller komposit.',
      cost: 150000,
    },
    {
      value: 'luxury',
      label: 'Lyxkök med premiummaskiner',
      description: 'Snickeribyggd känsla, induktionshäll med integrerad fläkt, vinkyl och maskiner i övre prissegmentet.',
      cost: 300000,
    },
    {
      value: 'ultra_luxury',
      label: 'Ultralyx (Carraramarmor, Ilve/Gaggenau, platsbyggt)',
      description: 'Exklusiv natursten, specialbeställda moduler och professionella vitvaror.',
      cost: 800000,
    },
    {
      value: 'custom',
      label: 'Offertpris från köksspecialist',
      description: 'Ange nettokostnad utöver husleverantörens grundkredit.',
    },
  ] as PresetOption<KitchenTier>[],

  // Badrum och klinker
  badrum: {
    basKakelSchablonPerKvm: 350,
    standardYtaPerBadrum: 10, // Kvm per våtrum
    tiers: [
      {
        value: 'standard',
        label: 'Basstandard klinker/kakel',
        description: 'Standardplattor ingår i husleverantörens rumsbeskrivning.',
        ratePerUnit: 0,
      },
      {
        value: 'medium',
        label: 'Tillval Mellan (+300 kr/m²)',
        description: 'Större plattformat, granitkeramik eller mönsterläggning.',
        ratePerUnit: 300,
      },
      {
        value: 'exclusive',
        label: 'Tillval Exklusiv (+700 kr/m²)',
        description: 'Stora format (60x60, 60x120), marmorlook eller specialblandare.',
        ratePerUnit: 700,
      },
      {
        value: 'custom',
        label: 'Eget tillägg per kvm eller fast offert',
        description: 'Ange eget merpris per kvadratmeter för våtrumsytor.',
      },
    ] as PresetOption<BathroomTier>[],
  },

  // Golvtillval
  golv: {
    merprisPerKvm: 1000,
    brandExample: 't.ex. 1-stavs ekparkett från Kährs eller Bjelin',
    notice: 'Observera: Kontrollera alltid med husleverantören vilket golvunderlag och standardgolv som ingår i grundkalkylen samt eventuell kreditering.',
  },

  // Övriga tillval
  ovrigaTillval: [
    {
      value: 'none',
      label: 'Inga övriga tillval',
      description: 'Standardutförande på trappor, fasadbelysning och lister.',
      cost: 0,
    },
    {
      value: 'small',
      label: 'Mindre tillvalspaket',
      description: 'Fasadbelysning, extra eluttag och mindre snickeridetaljer.',
      cost: 50000,
    },
    {
      value: 'medium',
      label: 'Medelstort tillvalspaket',
      description: 'Bredare trappa med infälld belysning, ribbväggar, extra skjutdörrar och plejd-styrning.',
      cost: 150000,
    },
    {
      value: 'large',
      label: 'Omfattande exklusivt tillvalspaket',
      description: 'Arkitektoniska träribbor, helglasade partier, ljudsystem och exklusiva snickerier.',
      cost: 300000,
    },
    {
      value: 'custom',
      label: 'Egen offert för specifika tillval',
      description: 'Mata in sammanlagd kostnad för era specifika tillvalsbeställningar.',
    },
  ] as PresetOption<OtherOptionsTier>[],

  // Finplanering tomt
  finplaneringTomt: {
    minPerKvm: 100,
    recommendedPerKvm: 200,
    maxPerKvm: 300,
    description: 'Anläggning av gräsmatta, matjord, stödmurar, grusade gångar och planteringsytor (100–300 kr/m² tomtmark som iordningställs).',
  },

  // Altan
  altan: {
    schablonPerKvm: 3000,
    sizes: [
      {
        value: 'none',
        label: 'Ingen altan i detta skede',
        description: 'Altan byggs senare i egen regi eller ingår ej.',
        cost: 0,
      },
      {
        value: 'small',
        label: 'Liten altan (20 m²)',
        description: 'Kompakt uteplats för mindre matgrupp vid entré eller trädgård.',
        ratePerUnit: 20,
        cost: 20 * 3000, // 60 000 kr
      },
      {
        value: 'medium',
        label: 'Mellanstor altan (40 m²)',
        description: 'Plats för loungemöbler och middagsbord under sommaren.',
        ratePerUnit: 40,
        cost: 40 * 3000, // 120 000 kr
      },
      {
        value: 'large',
        label: 'Stor altan (75 m²)',
        description: 'Omfattande trädäck i vinkel runt huset med plats för solbäddar och grillkök.',
        ratePerUnit: 75,
        cost: 75 * 3000, // 225 000 kr
      },
      {
        value: 'custom',
        label: 'Anpassad altanyta',
        description: 'Ange exakt kvadratmeteryta med schablon 3 000 kr/m² eller offertpris.',
      },
    ] as PresetOption<DeckSizeTier>[],
  },
};

/**
 * Standardvärden för formulärets initiering
 */
export const DEFAULT_CALCULATION_INPUT: CalculationInput = {
  // Dimensioner
  tomtPris: PRESETS.defaults.tomtPris,
  husBostadsyta: PRESETS.defaults.husBostadsyta,
  extrabyggnaderYta: PRESETS.defaults.extrabyggnaderYta,

  // Lagfart
  lagfartProcent: 1.5,

  // Grundarbete
  grundarbetePreset: 'trenching_sewer',
  customGrundarbeteCost: 200000,

  // Extra avloppsgrävning
  extraAvloppEnabled: false,
  extraAvloppMeter: 20,
  extraAvloppTerrain: 'easy',
  customExtraAvloppCostPerMeter: 1500,

  // Byggkostnad / entreprenad
  byggkostnadMode: 'sqm',
  byggkostnadPerKvm: PRESETS.byggkostnad.schablonPerKvm,
  customByggkostnad: 1500000,

  // Komplementbyggnad
  inkluderaKomplementIByggkostnad: true,
  komplementByggkostnadMode: 'sqm',
  komplementByggkostnadPerKvm: 8000,
  customKomplementByggkostnad: 280000,

  // Kvalitetsansvarig (KA)
  kaMode: 'preset',
  customKaCost: PRESETS.kvalitetsansvarig.schablon,

  // Husmaterialsats
  husmaterialsatsMode: 'sqm',
  husmaterialsatsPerKvm: PRESETS.husmaterialsats.recommendedPerKvm,
  customHusmaterialsatsFastPris: 1800000,

  // Logistik
  omlastningBehov: false,
  omlastningMode: 'preset',
  customOmlastningCost: PRESETS.omlastning.schablon,

  byggelskapMode: 'preset',
  customByggelskapCost: PRESETS.byggelskap.schablon,

  // Kommunala avgifter
  kommunTyp: 'growth',
  customVaCost: 360000,

  bygglovGrundavgift: PRESETS.bygglov.grundavgift,
  arInomPlanlagtOmrade: true,
  planavgiftPerKvm: PRESETS.bygglov.planavgiftDefaultPerKvm,
  customPlanavgift: 37500,

  nybyggnadskartaMode: 'preset',
  customNybyggnadskartaCost: PRESETS.nybyggnadskarta.schablon,

  // Fiber
  fiberPreset: 'campaign',
  customFiberCost: 25000,

  // Rivning
  harRivningsbehov: false,
  rivningsYta: 50,
  harAsbestrisk: false,
  customRivningskostnad: 200000,

  // Invasiva växter
  invasivaVaxterTyp: 'none',
  customInvasivaVaxterCost: 0,

  // Finansiering
  beraknaKreditiv: true,
  belaningsgradProcent: 85,
  egetLanebelopp: 0,
  kreditivRantesatsProcent: PRESETS.finansiering.rantesatsSchablon,
  kreditivByggtidManader: PRESETS.finansiering.standardByggtidManader,

  behoverPantbrev: true,
  befintligtPantbrev: 0,

  // Målning
  malningMode: 'large_house',
  customMalningCost: 200000,

  // Tillval
  kokTillval: 'medium',
  customKokCost: 150000,

  antalBadrumTvatt: 2,
  kvmPerVatutrymme: PRESETS.badrum.standardYtaPerBadrum,
  badrumKakelTillval: 'medium',
  customBadrumExtraPerKvm: 300,
  customBadrumTotalCost: 6000,

  uppgraderaGolv: true,
  golvKostnadPerKvm: PRESETS.golv.merprisPerKvm,
  customGolvCost: 150000,

  ovrigaTillval: 'small',
  customOvrigaTillvalCost: 50000,

  // Utemiljö
  finplaneringTomt: true,
  finplaneringYtaKvm: 400,
  finplaneringKostnadPerKvm: PRESETS.finplaneringTomt.recommendedPerKvm,
  customFinplaneringCost: 80000,

  altanVal: 'medium',
  altanKvm: 40,
  altanKostnadPerKvm: PRESETS.altan.schablonPerKvm,
  customAltanCost: 120000,
};
