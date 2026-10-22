// Project Aegis — Seed Dataset, Beverage Catalog, Blueprint Specs & Illicit Trade Telemetry

window.SENTINEL_DATA = {
  platformStats: {
    illicitAlcoholShare: "60%",
    illicitAlcoholSub: "of alcohol consumed in Kenya in 2024 was illicit or unrecorded (WHO / industry estimates)",
    revenueLost: "Sh120bn",
    revenueLostSub: "government revenue lost to the illicit beverage trade annually across excise & VAT",
    flaggedStamps: "9.6m",
    flaggedStampsSub: "excise stamps flagged as possibly cloned, reused, or out-of-channel in 2025",
    counterfeitRatio: "1 in 5",
    counterfeitRatioSub: "products on the Kenyan market is a counterfeit, parallel import, or refilled unit",
    totalScansToday: 148920,
    authenticityRate: 98.42,
    counterfeitsIntercepted: 1284,
    activeRetailers: 4620,
    avgScanLatencyMs: 142
  },

  beverageDatabase: [
    {
      serial: "SNT-FA24-57D2-13EE-EC26",
      stampCode: "KRA-EX-57D213EE-N",
      gtin: "06161100572139",
      name: "Aegis Reserve Whisky 750ml",
      brand: "Aegis Highland Distillers • Nakuru",
      category: "Single Malt Reserve Whisky • 750ml Glass",
      abv: "43.0% ABV",
      status: "SUSPICIOUS",
      verdictBadge: "ALREADY OPENED",
      riskScore: 74,
      confidence: 96.4,
      flags: ["already_opened", "post_retirement_scan"],
      batchNumber: "B26-NKR-57D2",
      productionDate: "2026-08-19",
      expiryDate: "N/A (Aged Spirit)",
      originFacility: "Nakuru Highland Bottling Line #2 • Nakuru",
      exciseTaxStatus: "WARNING • Post-Retirement Scan (Cap Seal Previously Retired)",
      intendedMarket: "Nakuru & Rift Valley Authorized Retail",
      lastScannedLocation: "Nakuru CBD Spirits Depot, Nakuru",
      scanCount: 4,
      spectralSignature: {
        uvFluorescence: "365nm Excise Taggant Present (88.4% Decay)",
        microText: "KEBS-ISM-2026 Intaglio Verified",
        capTorqueSeal: "BROKEN — Closure Tamper Loop Opened 6 Days Ago",
        methanolPpm: "38.0 ppm (Elevated Refill Risk — Hold Bottle)",
        hologramShift: "Crest Kinegram Intact, Cap Bridge Severed",
        ledgerHash: "0x57d2...13ee89a0ec26"
      },
      supplyChain: [
        {
          step: "Cryptographic Unit Identity & Excise Binding",
          actor: "Aegis Core Authority + KRA Excise",
          location: "Nakuru Bottling Plant",
          timestamp: "2026-08-19 08:14 EAT",
          verified: true,
          hash: "0x11f2...57d2"
        },
        {
          step: "Distributor Shipment Verification",
          actor: "Rift Valley Spirits Logistics",
          location: "Nakuru Depot",
          timestamp: "2026-09-02 14:20 EAT",
          verified: true,
          hash: "0x89c1...13ee"
        },
        {
          step: "Consumer Cap-Open Retirement Event",
          actor: "Verified Consumer Phone Check",
          location: "Nakuru West",
          timestamp: "2026-10-16 21:05 EAT",
          verified: true,
          hash: "0x44a0...ec26"
        },
        {
          step: "Post-Retirement Re-Scan Anomaly (RISK 74)",
          actor: "Unregistered Nightclub Terminal",
          location: "Nakuru",
          timestamp: "2026-10-22 06:40 EAT",
          verified: false,
          hash: "FLAG-POST-RETIREMENT-SCAN"
        }
      ]
    },
    {
      serial: "AEG-2026-8841-KEN",
      stampCode: "KRA-EX-9940128-A",
      gtin: "06161100492811",
      name: "Tusker Malt Premium Lager",
      brand: "East African Breweries (EABL)",
      category: "Premium Lager Beer • 330ml Crown Bottle",
      abv: "5.0% ABV",
      status: "AUTHENTIC",
      verdictBadge: "VERIFIED GENUINE",
      riskScore: 3,
      confidence: 99.8,
      flags: ["cryptographic_bind_valid", "excise_paid"],
      batchNumber: "B26-NRB-0419",
      productionDate: "2026-09-14",
      expiryDate: "2027-09-14",
      originFacility: "Ruaraka Bottling Plant #2, Nairobi, KE",
      exciseTaxStatus: "PAID & CLEARED • Digital Stamp Bound to Unit",
      intendedMarket: "Kenya Domestic Retail (Zone KE-01)",
      lastScannedLocation: "Westlands Square Supermarket, Nairobi",
      scanCount: 1,
      spectralSignature: {
        uvFluorescence: "365nm Dual-Peak Amber/Orange Taggant Match (99.9%)",
        microText: "KEBS-ISM-2026 Micro-engraving Verified",
        capTorqueSeal: "Intact Optical Tamper Bridge",
        methanolPpm: "< 4.0 ppm (Safe Acoustic Density Match)",
        hologramShift: "45° Diffractive Kinegram Pass",
        ledgerHash: "0x8f4e...91c2b7a40d3e"
      },
      supplyChain: [
        {
          step: "Excise Stamp Cryptographic Mint",
          actor: "KRA / Aegis Identity Engine",
          location: "Nairobi Security Hub",
          timestamp: "2026-09-14 06:12 EAT",
          verified: true,
          hash: "0x31a9...e210"
        },
        {
          step: "High-Speed Line Bottling & Optical Pairing",
          actor: "EABL Ruaraka Line #4",
          location: "Ruaraka, Nairobi",
          timestamp: "2026-09-14 11:48 EAT",
          verified: true,
          hash: "0x7c40...98b1"
        },
        {
          step: "Regional Distributor Custody Scan",
          actor: "Bia Tosha Logistics",
          location: "Industrial Area Depot",
          timestamp: "2026-09-18 09:05 EAT",
          verified: true,
          hash: "0x55d2...4f09"
        },
        {
          step: "Retailer POS Intake Verification",
          actor: "Westlands Square Retail #12",
          location: "Westlands, Nairobi",
          timestamp: "2026-10-02 15:22 EAT",
          verified: true,
          hash: "0x8f4e...91c2"
        }
      ]
    },
    {
      serial: "AEG-FAKE-0013-CLN",
      stampCode: "KRA-EX-0098122-F",
      gtin: "06161100999104",
      name: "Royal Crown Gin 750ml (Cloned Batch)",
      brand: "Unverified / Cloned Label",
      category: "Distilled Gin • 750ml Refilled Glass",
      abv: "Unknown (Toxic Adulteration Risk)",
      status: "COUNTERFEIT",
      verdictBadge: "CLONED STAMP FAKE",
      riskScore: 98,
      confidence: 99.9,
      flags: ["cloned_stamp_serial", "sku_class_mismatch", "impossible_travel_velocity"],
      batchNumber: "UNREGISTERED-LOT-99",
      productionDate: "FORGED STAMP",
      expiryDate: "DO NOT CONSUME",
      originFacility: "Illicit Bottling Ring (Unregistered Source)",
      exciseTaxStatus: "REVOKED / PHOTOCOPIED EXCISE STAMP • Serial Assigned to 250ml Water",
      intendedMarket: "ILLEGAL / ILLICIT TRADE",
      lastScannedLocation: "Kariobangi South Informal Outlet, Nairobi",
      scanCount: 87,
      spectralSignature: {
        uvFluorescence: "FAILED — Standard Commercial CMYK Toner (0% Taggant)",
        microText: "FAILED — Halftone Dots Present Instead of Intaglio",
        capTorqueSeal: "FAILED — Re-glued Cap & Refilled Original Bottle",
        methanolPpm: "CRITICAL ALERT — Adulterated Density Signature",
        hologramShift: "FAILED — Static Foil Sticker Without Diffractive Grating",
        ledgerHash: "REVOKED-HASH-0x0000DEAD"
      },
      supplyChain: [
        {
          step: "Original Stamp Issued for Mineral Water 500ml",
          actor: "Tax Authority Registry",
          location: "Thika Road Bottlers",
          timestamp: "2025-11-12 08:00 EAT",
          verified: true,
          hash: "0x11c4...700a"
        },
        {
          step: "Stamp Serial Cloned onto Spirit Bottles (87 Scans)",
          actor: "Illicit Syndicate Alert #INC-9402",
          location: "Eastlands / Kariobangi Cluster",
          timestamp: "2026-10-21 23:45 EAT",
          verified: false,
          hash: "CRITICAL-COUNTERFEIT-MATCH"
        }
      ]
    },
    {
      serial: "AEG-2026-4410-IMP",
      stampCode: "KRA-IM-7721904-B",
      gtin: "05000267014005",
      name: "Johnnie Walker Black Label 12YO",
      brand: "Diageo Scotland • Imported",
      category: "Blended Scotch Whisky • 750ml Glass",
      abv: "40.0% ABV",
      status: "AUTHENTIC",
      verdictBadge: "VERIFIED IMPORT",
      riskScore: 7,
      confidence: 99.5,
      flags: ["customs_bonded_verified", "nfc_closure_intact"],
      batchNumber: "L6244K-SCOT",
      productionDate: "2026-06-20",
      expiryDate: "N/A (Aged Spirit)",
      originFacility: "Kilmarnock / Leven Packaging, Scotland, UK",
      exciseTaxStatus: "IMPORT DUTY & EXCISE CLEARED • Mombasa Port",
      intendedMarket: "East Africa Authorized Duty-Paid",
      lastScannedLocation: "Kilimani Wine & Spirits Flagship, Nairobi",
      scanCount: 2,
      spectralSignature: {
        uvFluorescence: "365nm Import Security Ink Verified (99.4%)",
        microText: "Laser Lot Code Matches Glass Etching",
        capTorqueSeal: "NFC Guala Closure Unbroken",
        methanolPpm: "12.0 ppm (Within ISO Standard)",
        hologramShift: "Multi-Spectrum Gold Crest Pass",
        ledgerHash: "0x4d92...c83a11e094f1"
      },
      supplyChain: [
        {
          step: "Distillery Bottling & Laser Etching",
          actor: "Diageo Leven Plant",
          location: "Fife, Scotland, UK",
          timestamp: "2026-06-20 14:30 UTC",
          verified: true,
          hash: "0x19f0...a002"
        },
        {
          step: "Customs & Excise Stamp Affixing",
          actor: "KPA Bonded Warehouse #14",
          location: "Port of Mombasa, KE",
          timestamp: "2026-08-11 10:15 EAT",
          verified: true,
          hash: "0x62b7...31d8"
        },
        {
          step: "Retailer Shelf Authentication",
          actor: "Kilimani Fine Wines",
          location: "Kilimani, Nairobi",
          timestamp: "2026-10-19 18:10 EAT",
          verified: true,
          hash: "0x4d92...c83a"
        }
      ]
    }
  ],

  blueprintLayers: [
    {
      id: "layer-optical",
      code: "L1 • CRYPTOGRAPHIC UNIT IDENTITY",
      title: "Phone-Checkable Unit Identity Bound to Excise Stamp",
      latency: "24 ms",
      accuracy: "100%",
      description: "Aegis gives every bottle a unique ECDSA P-256 cryptographic identity on the bottling line, permanently binding the glass lot etching, closure seal, and KRA excise stamp into a single verifiable record.",
      specs: [
        "ECDSA P-256 asymmetric signature embedded in high-density DataMatrix",
        "One-way cryptographic salt tying physical paper fiber hash to digital serial",
        "Instant SKU cross-check (flags water/soda stamps pasted onto spirits)",
        "Post-retirement state tracking (flags refilled bottles after first cap-open)"
      ]
    },
    {
      id: "layer-crypto",
      code: "L2 • OPTICAL & SPECTRAL VISION",
      title: "Multi-Spectrum Computer Vision & 365nm UV Taggant Analysis",
      latency: "38 ms",
      accuracy: "99.91%",
      description: "Captures high-resolution macro frames of the excise stamp and bottle closure, decomposing moiré patterns, micro-intaglio typography, and 365nm UV phosphor decay curves using on-device neural inference.",
      specs: [
        "Sub-pixel halftone vs. intaglio classifier (detects 2400 DPI offset forgeries)",
        "Diffractive kinegram colour-shift verification across 3 tilt angles",
        "Tamper-evident cap bridge continuity check via edge-contour CNN",
        "SKU mismatch detector comparing bottle silhouette to stamp product class"
      ]
    },
    {
      id: "layer-acoustic",
      code: "L3 • NETWORK & RISK SCORING",
      title: "Geospatial Velocity Graph & Syndicate Network Discovery",
      latency: "45 ms",
      accuracy: "99.4%",
      description: "Scores every consumer scan, distributor shipment, and field test in real time. Connects isolated counterfeit detections into actionable syndicate graphs across counties and border corridors.",
      specs: [
        "Impossible-travel velocity detector (flags same serial in >1 county within 2h)",
        "Post-retirement scan detector (`already_opened` & `post_retirement_scan` flags)",
        "Automated KRA / KEBS / County Public Health enforcement webhook dispatch",
        "Immutable custody chain anchoring from bottling line to retail POS"
      ]
    }
  ],

  tradeHotspots: [
    {
      id: "HS-NRB-01",
      region: "Nairobi Eastlands / Kariobangi",
      county: "Nairobi County",
      coordinates: { x: 54, y: 62 },
      riskLevel: "CRITICAL",
      incidentCount: 42,
      clonedStampsDetected: 318,
      primaryThreat: "Counterfeit Spirits & Photocopy Excise Stamps",
      suspectBrand: "Royal Crown Gin / Various 250ml Spirits",
      enforcementStatus: "Multi-Agency Raid Dispatched",
      updatedAt: "12 mins ago"
    },
    {
      id: "HS-NKR-04",
      region: "Nakuru Pipeline / CBD Nightclubs",
      county: "Nakuru County",
      coordinates: { x: 43, y: 53 },
      riskLevel: "HIGH",
      incidentCount: 29,
      clonedStampsDetected: 112,
      primaryThreat: "Refilled Reserve Whisky Bottles (`already_opened` / `post_retirement_scan`)",
      suspectBrand: "Aegis Reserve Whisky 750ml • SNT-FA24",
      enforcementStatus: "Aegis Field Inspector Sampling",
      updatedAt: "8 mins ago"
    },
    {
      id: "HS-BSA-02",
      region: "Busia / Malaba Border Corridor",
      county: "Busia County",
      coordinates: { x: 22, y: 46 },
      riskLevel: "HIGH",
      incidentCount: 27,
      clonedStampsDetected: 164,
      primaryThreat: "Unstamped Cross-Border Contraband & Smuggled Ethanol",
      suspectBrand: "Rift Valley Cane Spirit / Unbranded Drums",
      enforcementStatus: "Border Customs Intercept Active",
      updatedAt: "28 mins ago"
    },
    {
      id: "HS-MSA-03",
      region: "Mombasa Changamwe / Port Approaches",
      county: "Mombasa County",
      coordinates: { x: 78, y: 84 },
      riskLevel: "HIGH",
      incidentCount: 19,
      clonedStampsDetected: 95,
      primaryThreat: "Diverted Transit Cargo & Tax Stamp Substitution",
      suspectBrand: "Imported Blended Whisky 750ml",
      enforcementStatus: "Bonded Warehouse Audit Underway",
      updatedAt: "45 mins ago"
    },
    {
      id: "HS-ELD-05",
      region: "Eldoret Langas Retail Cluster",
      county: "Uasin Gishu County",
      coordinates: { x: 33, y: 41 },
      riskLevel: "MEDIUM",
      incidentCount: 9,
      clonedStampsDetected: 24,
      primaryThreat: "Damaged Stamp Label & Parallel Batch Anomalies",
      suspectBrand: "Domestic Malt Lagers & Spirits",
      enforcementStatus: "Routine Retailer Compliance",
      updatedAt: "2 hrs ago"
    }
  ],

  seizureCases: [
    {
      caseId: "AEG-2026-9402",
      timestamp: "2026-10-22 06:15 EAT",
      location: "Nakuru CBD Entertainment Zone",
      product: "Aegis Reserve Whisky 750ml (SNT-FA24-57D2-13EE-EC26)",
      violation: "already_opened • post_retirement_scan (RISK 74)",
      riskSeverity: "HIGH",
      agency: "Aegis Field Unit + NACADA",
      status: "QUARANTINED FOR LAB",
      estimatedTaxProtected: "Sh 1.8M"
    },
    {
      caseId: "AEG-2026-9399",
      timestamp: "2026-10-22 01:15 EAT",
      location: "Kariobangi South, Nairobi",
      product: "Royal Crown Gin 750ml (340 Cartons)",
      violation: "Cloned Mineral Water Excise Stamp on 40% Spirit",
      riskSeverity: "CRITICAL",
      agency: "KRA Illicit Trade Unit + KEBS",
      status: "SEIZED & SEALED",
      estimatedTaxProtected: "Sh 4.2M"
    },
    {
      caseId: "AEG-2026-9381",
      timestamp: "2026-10-21 16:05 EAT",
      location: "Changamwe Industrial Depot, Mombasa",
      product: "Assorted Imported Scotch 750ml (85 Cases)",
      violation: "Transit Export Goods Diverted to Local Market",
      riskSeverity: "HIGH",
      agency: "Port Revenue Protection",
      status: "UNDER PROSECUTION",
      estimatedTaxProtected: "Sh 8.9M"
    },
    {
      caseId: "AEG-2026-9364",
      timestamp: "2026-10-21 11:20 EAT",
      location: "Westlands Entertainment Zone, Nairobi",
      product: "Refilled Premium Spirit Bottles (42 Units)",
      violation: "Broken Guala Tamper Bridge & Diluted ABV",
      riskSeverity: "MEDIUM",
      agency: "County Public Health & NACADA",
      status: "LICENSE SUSPENDED",
      estimatedTaxProtected: "Sh 950K"
    }
  ],

  aiAnalytics: {
    modelVersion: "AEGIS-CORTEX-4.6 (Excise & Syndicate Neural Graph)",
    lastTrained: "2026-10-22 06:00 EAT • 14.2M Telemetry Vectors",
    monthlyRevenueRecovered: [
      { month: "May", recoveredM: 42, illicitIndex: 64 },
      { month: "Jun", recoveredM: 58, illicitIndex: 59 },
      { month: "Jul", recoveredM: 74, illicitIndex: 53 },
      { month: "Aug", recoveredM: 96, illicitIndex: 47 },
      { month: "Sep", recoveredM: 128, illicitIndex: 41 },
      { month: "Oct", recoveredM: 164, illicitIndex: 34 }
    ],
    countyRiskRanking: [
      { county: "Nairobi County", riskScore: 88, illicitVolumeShare: "31%", topAnomaly: "Photocopied KRA Water Stamps on Spirits", trend: "+12% probe velocity" },
      { county: "Nakuru County", riskScore: 76, illicitVolumeShare: "22%", topAnomaly: "already_opened / post_retirement_scan Refills", trend: "+18% nightclub scans" },
      { county: "Busia County", riskScore: 71, illicitVolumeShare: "18%", topAnomaly: "Unstamped Cross-Border Ethanol Contraband", trend: "-6% after border raid" },
      { county: "Mombasa County", riskScore: 64, illicitVolumeShare: "15%", topAnomaly: "Transit Cargo Diverted to Local Market", trend: "Stable" },
      { county: "Uasin Gishu County", riskScore: 39, illicitVolumeShare: "8%", topAnomaly: "Minor Cap Abrasion & Parallel Distribution", trend: "-14% risk drop" }
    ],
    presetPrompts: [
      {
        id: "exec-brief",
        label: "Executive Excise Revenue Brief",
        prompt: "Generate an executive briefing on Kenya excise revenue leakage, Aegis recovery impact, and recommended KRA enforcement priorities for Q4 2026."
      },
      {
        id: "nakuru-cluster",
        label: "Nakuru Post-Retirement Refill Analysis",
        prompt: "Analyze the SNT-FA24-57D2-13EE-EC26 post-retirement scan cluster in Nakuru and identify how nightclubs are refilling genuine bottles."
      },
      {
        id: "syndicate-forecast",
        label: "30-Day Syndicate Risk Forecast",
        prompt: "Predict the top 3 illicit beverage trafficking corridors for the next 30 days and calculate projected tax recovery if mobile checkpoints are deployed."
      },
      {
        id: "dooh-campaign",
        label: "VANBRANSA DOOH Consumer Alert Strategy",
        prompt: "Design a VANBRANSA Digital Out-Of-Home (DOOH) billboard awareness strategy targeting high-risk counties to boost consumer bottle scanning."
      }
    ]
  }
};
