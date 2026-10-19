# Husbyggnadskalkylator

En professionell webbapplikation för produktionskostnadskalkyler vid nybyggnation av småhus, uppförd i Next.js (App Router), TypeScript och Tailwind CSS.

Applikationen tillhandahåller ett interaktivt steg-för-steg-system där byggherrar och fastighetsägare kan laborera med tomtpriser, markförhållanden, kommunala anslutningstaxor, husbyggsatser, entreprenadformer, tillval och finansieringskostnader med momentan realtidsuppdatering av totalkostnad och nyckeltal per kvadratmeter.

---

## Arkitektur och katalogstruktur

Projektet är uppbyggt med strikt separation mellan typdefinitioner, konfigurationsschabloner, ren beräkningslogik och presentationskomponenter:

```text
Husbyggnadskalkyl/
├── src/
│   ├── types/
│   │   └── calculation.ts          # TypeScript-gränssnitt för indata, linjeposter och beräkningsresultat
│   ├── config/
│   │   └── presets.ts              # Schabloner, prissättningsintervall och standardvärden
│   ├── lib/
│   │   ├── calculator.ts           # Ren beräkningsfunktion: calculateHouseProject(input)
│   │   └── formatters.ts           # Formateringsfunktioner för svenska valutor (SEK), areor och procent
│   ├── components/
│   │   ├── Header.tsx              # Applikationens sidhuvud och dokumentåtgärder
│   │   ├── StepProgressBar.tsx    # Stegindikator och navigering mellan kalkylsteg
│   │   ├── SummaryCard.tsx         # Fastsatt sammanfattningspanel med realtidsnyckeltal
│   │   ├── BreakdownModal.tsx      # Detaljerad post-för-post specifikationsmodal
│   │   └── steps/
│   │       ├── Step1PlotDimensions.tsx        # Tomtpris, boyta och komplementbyggnader
│   │       ├── Step2GroundDemolition.tsx      # Schakt, berg, extra VA-rörgrav och rivning
│   │       ├── Step3BuildingKit.tsx           # Husbyggsats, montering och fasadmålning
│   │       ├── Step4MunicipalityPermits.tsx   # VA-taxa, bygglov, planavgift och KA
│   │       ├── Step5InfrastructureLogistics.tsx # Fiberanslutning, omlastning och byggel
│   │       ├── Step6InteriorOptions.tsx       # Kök, badrumsklinker, parkett och tillval
│   │       └── Step7LandscapeFinance.tsx      # Trädgård, altan, kreditiv och pantbrev
│   └── app/
│       ├── layout.tsx              # Rotlayout och metadata
│       ├── page.tsx                # Huvudsida och tillståndshantering
│       └── globals.css             # Tailwind CSS och utskriftsanpassade stilar
├── public/                         # Statiska tillgångar
├── package.json                    # Beroenden och skript
├── tsconfig.json                   # TypeScript-konfiguration
└── README.md                       # Projektdokumentation
```

---

## Ekonomiska kalkyleringsmodeller och schabloner

Kalkylatorn samlar branschpraxis och kommunala regelverk i följande delposter:

### 1. Tomt och lagfart
- **Tomtpris**: Inmatning av förvärvssumma (0 kr om fastigheten redan ägs).
- **Lagfart**: 1,5 % statlig stämpelskatt på tomtens köpeskilling samt Lantmäteriets fasta expeditionsavgift på 825 kr.

### 2. Markarbete, schakt och rivning
- **Grundarbete**:
  - Helt plan tomt med max 10 m till anslutningspunkt: 0 kr extra.
  - Schaktning och rörgrav för avlopp: Schablon 200 000 kr.
  - Sprängning berg, kuperad större tomt: Schablon 500 000 kr.
  - Mycket otillgänglig tomt med bergsprängning och längre tillfartsväg: Schablon 1 000 000 kr.
  - Separat offertpris enligt anbud.
- **Extra avloppsgrävning**:
  - Lättgrävd mark (matjord/sand): 1 500 kr/löpande meter.
  - Otillgänglig mark (stubbar, trädrötter, grundvatten): 3 000 kr/löpande meter.
  - Berggrund som kräver sprängning eller spräckning: 6 000 kr/löpande meter.
- **Rivning av befintlig byggnad**:
  - Standardrivning: 4 000 kr/m² rivningsyta.
  - Asbestsanering (eternit, isolering): 6 000 kr/m² rivningsyta.
- **Invasiva arter (Parkslide)**:
  - Mindre bestånd: 45 000 kr (kemisk/termisk insats inklusive dispensansökan).
  - Fullständig sanering med schaktning 4 m runt om och geomembran: 350 000 kr (intervall 300 000–400 000 kr).

### 3. Byggnation, material och montering
- **Husmaterialsats**:
  - Kvadratmeterkalkyl: 10 000–14 000 kr/m² bostadsyta (rekommenderat standardvärde 12 000 kr/m²).
  - Fast avtalspris direkt enligt avtal.
- **Byggentreprenad huvudbyggnad**:
  - Schablon ca 10 000 kr/m² boyta för stomresning och invändigt färdigställande, alternativt offertpris.
- **Byggkostnad komplementbyggnad (Garage, förråd mm)**:
  - Beräknas automatiskt på komplementytan som angavs i steg 1 med schablon 8 000 kr/m² (intervall 6 000–10 000 kr/m²) eller separat offertpris.
- **Målning av byggnader**:
  - Ingår normalt ej från husleverantör.
  - Mindre villa (< 130 m²): 100 000 kr.
  - Större villa (130–220+ m²): 200 000 kr.
  - Egenmålning/material: 25 000 kr.

### 4. Kommunala avgifter och tillstånd
- **Kommunalt vatten och avlopp (VA)**:
  - Tillväxtkommun (t.ex. Värmdö kommun): 360 000 kr anläggningsavgift.
  - Standardkommun: 180 000 kr.
  - Eget belopp enligt lokal kommunal VA-taxa.
- **Bygglov och planavgift**:
  - Bygglov grundavgift: 25 000 kr.
  - Planavgift: 150 till 350 kr/m² bruttoarea (BTA) vid detaljplanerat område. Kalkylatorn beräknar automatiskt på huvudbyggnad plus komplementbyggnader och påtalar att avgift måste kontrolleras med byggnadsnämnden.
- **Nybyggnadskarta**: Schablon 15 000 kr (intervall 15 000–20 000 kr) eller offertpris.
- **Kontrollansvarig (KA enligt PBL)**: Schablon 30 000 kr eller anbudssumma.

### 5. Infrastruktur och logistik
- **Fiberanslutning**:
  - Kampanjanslutning: 25 000 kr.
  - Efteranslutning utan kampanj: 150 000 kr.
  - Ingen anslutning: 0 kr.
- **Omlastningskostnad**: Schablon 35 000 kr om tillfartsvägen inte klarar 24-meters lastbilar med släp.
- **Hyra av byggelskåp**: Schablon 10 000 kr under entreprenadtiden.

### 6. Inredning och tillval
- **Kökstillval**:
  - Standard (ingår): 0 kr.
  - Mellannivå med sten-/kompositbänkskiva: 150 000 kr.
  - Lyxkök med integrerad fläkt och finare maskiner: 300 000 kr.
  - Ultralyx (Carraramarmor, Ilve/Gaggenau): 800 000 kr.
- **Badrumstillval (klinker/kakel)**:
  - Baserat på antal våtrum med 10 m² schablonyta per rum.
  - Mellanval: +300 kr/m² utöver standard.
  - Exklusivt: +700 kr/m² utöver standard.
- **Golvuppgradering**:
  - Kalkyleras direkt på husets boyta med schablon 1 000 kr/m² extra (t.ex. 1-stavs ekparkett från Kährs eller Bjelin).
- **Övriga tillval**: Schablonpaket 50 000 kr, 150 000 kr, 300 000 kr eller specificerat anbud.

### 7. Utemiljö och finansiering
- **Finplanering tomt**: Schablon 100–300 kr/m² (standard 200 kr/m²) för matjord, gräs och grovplanering.
- **Altan / Trädäck**: Schablon 3 000 kr/m² (liten 20 m², mellan 40 m², stor 75 m² eller anpassad yta).
- **Byggnadskreditiv**:
  - Räntekostnad under byggtiden (3,5–5,0 % ränta, standard 4,25 %).
  - Beräknas med 55 % genomsnittlig utnyttjandegrad under produktionsperioden (12 månader).
- **Pantbrev**:
  - 2,0 % statlig stämpelskatt på nytecknat lånebelopp utöver befintliga pantbrev på fastigheten samt 375 kr fast expeditionsavgift.

---

## Installation och körning

### Förutsättningar
- Node.js version 18.18 eller senare
- npm version 9 eller senare

### Steg för att köra lokalt

1. Klona eller öppna projektkatalogen:
   ```bash
   cd Husbyggnadskalkyl
   ```

2. Kontrollera beroenden (redan installerade):
   ```bash
   npm install
   ```

3. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

4. Öppna webbläsaren på adressen:
   ```text
   http://localhost:3000
   ```

### Bygg för produktion

För att validera och bygga en optimerad produktionsversion:

```bash
npm run build
npm run start
```

---

## Design- och användarupplevelse (UX)

- **Färgsättning**: Nordisk arkitektonisk färgpalett baserad på skiffer (slate), natursten och subtila accenter utan visuellt brus.
- **Realtidsberäkning**: Varje justering av indata propageras omedelbart genom kalkylmodellen via `calculateHouseProject`.
- **Dubbla vyer**: Flexibilitet mellan steg-för-steg-formulär med förklarande beräkningshjälp och samlad översiktsvy för erfarna kalkylatorer.
- **Utskrift och PDF**: Anpassade stilar via `@media print` som döljer navigationskontroller och genererar ett formellt, bankfärdigt kalkyldokument.
- **Typfalls- och scenariostöd**: Förkonfigurerade snabbknappar för Standardtomt, Värmdö/Tillväxtkommun och Svårtillgänglig tomt.
