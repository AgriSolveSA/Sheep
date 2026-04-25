import { useState, useEffect, useMemo, useCallback, memo, Component } from "react";
import { buildReportData, generateProReport, generateSandboxReport } from "./reportEngine.js";
import { ZAR, PCT, SGN, MONTHS } from "./utils.js";
import { runInefficiencyAudit } from "./inefficiencyEngine.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";

// Fix Leaflet default icon URLs broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// GADM 4.1 province name → PROVINCE_DATA key
const PROV_NAME_MAP = {
  "Eastern Cape":  "eastern_cape",
  "Free State":    "free_state",
  "Gauteng":       "gauteng",
  "KwaZulu-Natal": "kwazulu_natal",
  "Limpopo":       "limpopo",
  "Mpumalanga":    "mpumalanga",
  "North West":    "north_west",
  "Northern Cape": "northern_cape",
  "Western Cape":  "western_cape",
};

const PROVINCE_DATA = {
  limpopo: {
    name:"Limpopo", short:"Limpopo",
    fill:"#d4510e", stroke:"#8a3408", hoverFill:"#e86522",
    climate:"Bushveld · Semi-arid · 400–600mm summer rain · Hot",
    rainfall:"400–600mm", season:"Summer", frost:"None", humidity:"Low",
    parasites:"Medium", drought:"Frequent", sheepDensity:"Medium",
    primary:["Meatmaster","Dorper"],
    secondary:["Damara","Van Rooy"],
    avoid:["Merino","Dohne Merino"],
    why:"Bushveld heat and summer rainfall suit hardy hair breeds perfectly. Meatmaster was specifically bred for these Limpopo conditions. Merino suffers heat stress and parasite load in the lowveld. Damara thrives in the drier western areas.",
    tip:"Vaalwater area: 21ha bushveld carries ~20–30 ewes. Need irrigated pasture or external grazing to scale beyond 50.",
    breed:"Meatmaster",  type:"Meat", market:"Polokwane abattoirs · Bela-Bela auction · RCL Polokwane",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:85, liveKg:38, dressing:48, wool:0, feed:500, health:180, ewePrice:2800, be:41,
  },
  north_west: {
    name:"North West", short:"N. West",
    fill:"#c8900a", stroke:"#8a6006", hoverFill:"#daa812",
    climate:"Semi-arid Bushveld · 300–500mm · Hot and dry",
    rainfall:"300–500mm", season:"Summer", frost:"Light", humidity:"Low",
    parasites:"Low", drought:"Very frequent", sheepDensity:"Medium",
    primary:["Dorper","Meatmaster","Van Rooy"],
    secondary:["Damara"],
    avoid:["Merino","Dormer"],
    why:"Dry, hot conditions with sparse, unreliable grazing. Low-input hair breeds dominate commercial operations. Dorper is the commercial king with its year-round breeding advantage. Wool breeds struggle without irrigation.",
    tip:"Commercial Dorper operations in North West typically run 200–800 ewes. Smaller flocks become viable with irrigated lucerne supplementation.",
    breed:"Dorper", type:"Meat", market:"Vryburg abattoir · Lichtenburg auction · local feedlots",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:83, liveKg:36, dressing:50, wool:0, feed:500, health:180, ewePrice:3200, be:51,
  },
  gauteng: {
    name:"Gauteng", short:"Gauteng",
    fill:"#1a70b0", stroke:"#104678", hoverFill:"#2288cc",
    climate:"Highveld · 700mm summer rain · Moderate temps",
    rainfall:"700mm", season:"Summer", frost:"Moderate", humidity:"Medium",
    parasites:"Medium", drought:"Occasional", sheepDensity:"Low",
    primary:["Dorper","Dormer","SAMM"],
    secondary:["Dohne Merino"],
    avoid:[],
    why:"Small province but excellent market access — proximity to Johannesburg abattoirs increases margins significantly. Moderate highveld climate suits most commercial breeds. Dorper for meat, dual-purpose where pasture available.",
    tip:"Gauteng's biggest advantage is logistics — you're 1–2 hours from the largest lamb markets in SA. Factor this into your price assumptions.",
    breed:"Dorper", type:"Meat", market:"Karan Beef Balfour · Irene abattoir · Joburg fresh market",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:80, feed:550, health:190, ewePrice:2800, be:71,
  },
  mpumalanga: {
    name:"Mpumalanga", short:"Mpuma-\nlanga",
    fill:"#1a7a3c", stroke:"#0e4a24", hoverFill:"#229850",
    climate:"Highveld + Lowveld · 600–800mm · Moderate–hot",
    rainfall:"600–800mm", season:"Summer", frost:"Moderate highland", humidity:"High lowveld",
    parasites:"Medium–high", drought:"Rare", sheepDensity:"Medium",
    primary:["Dorper","Meatmaster","SAMM"],
    secondary:["Dohne Merino"],
    avoid:[],
    why:"Ermelo (highveld) is one of SA's largest wool-producing districts. The highveld suits dual-purpose breeds well. Lowveld areas face higher parasite pressure and follow Limpopo breed patterns.",
    tip:"Highveld Mpumalanga is ideal for SAMM dual-purpose. Wool adds R200–400/ewe supplementary income on top of meat.",
    breed:"SAMM", type:"Dual", market:"Ermelo wool auctions · Dawn Meats · local abattoirs",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:8,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:120, feed:550, health:190, ewePrice:2700, be:61,
  },
  free_state: {
    name:"Free State", short:"Free State",
    fill:"#c44a14", stroke:"#883008", hoverFill:"#d85e22",
    climate:"Grassland · 400–600mm · Cold winters · Hard frost",
    rainfall:"400–600mm", season:"Summer", frost:"Heavy", humidity:"Low–medium",
    parasites:"Low", drought:"Moderate", sheepDensity:"High",
    primary:["Merino","SAMM","Dohne Merino"],
    secondary:["Dorper","Dormer"],
    avoid:["Damara","Namaqua Afrikaner"],
    why:"South Africa's wool heartland. The Karoo transition zone suits fine-wool Merino perfectly. Hard winters actually benefit Merino fleece weight and staple strength. Cold kills the hardiness advantage of arid breeds — Damara's fat reserves aren't adapted to prolonged frost.",
    tip:"Free State Merino farms typically run 300–1,500 ewes to be viable. Wool income (R400–700/ewe) is what makes the economics work at scale.",
    breed:"Merino", type:"Wool", market:"Cape Wool Board · Bloemfontein auction · local cooperatives",
    rep:15, oh:650, labour:1500, hired:5594, woolMonth:8,
    lambing:110, survival:80, liveKg:32, dressing:47, wool:550, feed:650, health:220, ewePrice:2400, be:87,
  },
  kwazulu_natal: {
    name:"KwaZulu-Natal", short:"KZN",
    fill:"#0a7c64", stroke:"#065040", hoverFill:"#0e9878",
    climate:"Subtropical coast + Drakensberg · High rainfall · Humid",
    rainfall:"600–1200mm", season:"Summer", frost:"Highlands only", humidity:"High",
    parasites:"High", drought:"Rare coastal", sheepDensity:"Low–medium",
    primary:["Dorper","Blackhead Persian"],
    secondary:["Meatmaster"],
    avoid:["Merino"],
    why:"High humidity and intense internal parasite pressure. Haemonchus contortus (wire worm) is particularly severe. Only breeds with genuine parasite resistance survive here. Merino wool felts in the humidity. Dorper's FAMACHA resistance traits give it a decisive advantage.",
    tip:"KZN farmers save significantly on veterinary costs with resistant breeds. Dorper dosing intervals can be 3–4x longer than wool breeds in this climate.",
    breed:"Dorper", type:"Meat", market:"Tongaat abattoir · Newcastle auction · coastal fresh markets",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:83, liveKg:36, dressing:50, wool:0, feed:500, health:180, ewePrice:3200, be:51,
  },
  eastern_cape: {
    name:"Eastern Cape", short:"E. Cape",
    fill:"#a06410", stroke:"#6a4208", hoverFill:"#b87820",
    climate:"Karoo interior + Coastal · 200–700mm · Highly variable",
    rainfall:"200–700mm", season:"Mixed", frost:"Karoo interior", humidity:"Variable",
    parasites:"Low–medium", drought:"Karoo frequent", sheepDensity:"Very high",
    primary:["Merino","Dorper","Dohne Merino"],
    secondary:["SAMM"],
    avoid:[],
    why:"The most diverse sheep province in SA — nearly 40% of the country's commercial flock is here. The Great Karoo is the Merino heartland. Coastal midlands suit dual-purpose breeds. Dorper dominates in the arid Karoo. Eastern Cape has the most sophisticated sheep farming infrastructure of any province.",
    tip:"Eastern Cape auction prices are often 8–12% lower than Gauteng — transport costs real money. Calculate your abattoir distance carefully.",
    breed:"Merino", type:"Wool", market:"Cape Wool Board · Graaff-Reinet auction · Eastern Cape cooperatives",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:8,
    lambing:120, survival:82, liveKg:34, dressing:47, wool:260, feed:600, health:200, ewePrice:2600, be:109,
  },
  western_cape: {
    name:"Western Cape", short:"W. Cape",
    fill:"#6a2a94", stroke:"#481a64", hoverFill:"#8038b0",
    climate:"Mediterranean · Winter rainfall · 200–800mm · Cool winters",
    rainfall:"200–800mm", season:"Winter (Cape)", frost:"Light–moderate", humidity:"Moderate",
    parasites:"Low–medium", drought:"Summer droughts common", sheepDensity:"High",
    primary:["Dormer","Merino","SAMM"],
    secondary:["Ile de France","Dorper"],
    avoid:["Damara","Namaqua Afrikaner"],
    why:"The only winter-rainfall region in SA — a fundamentally different farming system. Dormer was bred in the 1920s specifically for this climate. Merino thrives on Renosterveld and fynbos. Cool winters produce excellent wool quality. Summer drought is the main risk.",
    tip:"Western Cape's biggest risk is summer feed gap. Successful operations plan winter grazing cycles precisely. Dormer ewes bred on cereal stubble after winter crop is the classic system.",
    breed:"Dormer", type:"Meat", market:"Abattoir Bragança · Boland Agri auction · Cape fresh markets",
    rep:15, oh:650, labour:1500, hired:5594, woolMonth:6,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:220, feed:600, health:190, ewePrice:2600, be:54,
  },
  northern_cape: {
    name:"Northern Cape", short:"N. Cape",
    fill:"#a81818", stroke:"#700e0e", hoverFill:"#c02020",
    climate:"Karoo · Hyper-arid · 50–250mm · Extreme heat + cold",
    rainfall:"50–250mm", season:"Erratic", frost:"Heavy nights", humidity:"Very low",
    parasites:"Very low", drought:"Severe, frequent", sheepDensity:"Very low",
    primary:["Dorper","Damara","Namaqua Afrikaner"],
    secondary:["Van Rooy","Blackhead Persian"],
    avoid:["Merino","Dormer","Ile de France","Dohne Merino"],
    why:"SA's most extreme farming environment. 4–10 ha per sheep on natural Karoo grazing. Only breeds with genuine desert adaptation survive without heavy supplementation. Namaqua Afrikaner and Damara are indigenous to exactly these conditions — fat reserves, drought metabolism, and parasite resistance are unmatched.",
    tip:"Northern Cape farms measure land in hectares per sheep, not sheep per hectare. Capital cost is very low (no infrastructure needed) but scale requirement is very high (300+ ewes to cover fixed costs).",
    breed:"Dorper", type:"Meat", market:"Upington · De Aar · Prieska local abattoirs · long-haul to Gauteng",
    rep:15, oh:550, labour:1500, hired:5594, woolMonth:0,
    lambing:110, survival:88, liveKg:30, dressing:45, wool:0, feed:350, health:120, ewePrice:2200, be:148,
  },
};

// Ewes per hectare by province × system (SA agricultural benchmarks)
const CARRYING_CAPACITY = {
  extensive:     { limpopo:4, north_west:3, gauteng:6, mpumalanga:5, free_state:4, kwazulu_natal:5, eastern_cape:3, western_cape:5, northern_cape:0.6 },
  semiIntensive: { limpopo:7, north_west:5, gauteng:10, mpumalanga:9, free_state:7, kwazulu_natal:9, eastern_cape:6, western_cape:8, northern_cape:1.5 },
  intensive:     { limpopo:15, north_west:12, gauteng:22, mpumalanga:18, free_state:16, kwazulu_natal:18, eastern_cape:14, western_cape:16, northern_cape:5 },
};

// Smart defaults per province (based on climate + farming system norms)
const PROVINCE_DEFAULTS = {
  limpopo:       { system:"extensive",     market:"auction",   feed:"purchased" },
  north_west:    { system:"extensive",     market:"auction",   feed:"purchased" },
  gauteng:       { system:"semiIntensive", market:"abattoir",  feed:"mixed" },
  mpumalanga:    { system:"semiIntensive", market:"abattoir",  feed:"mixed" },
  free_state:    { system:"semiIntensive", market:"auction",   feed:"mixed" },
  kwazulu_natal: { system:"extensive",     market:"auction",   feed:"purchased" },
  eastern_cape:  { system:"extensive",     market:"auction",   feed:"purchased" },
  western_cape:  { system:"semiIntensive", market:"direct",    feed:"mixed" },
  northern_cape: { system:"extensive",     market:"auction",   feed:"purchased" },
};

// ─── BEEF CATTLE MODULE ────────────────────────────────────────────────────────
// Field names mirror sheep (lambing=calving%, survival=weaning%, ewePrice=cowPrice)
// so calcFull and buildReportData work unchanged for both species.

const CATTLE_PROVINCE_DATA = {
  limpopo: {
    name:"Limpopo", short:"Limpopo",
    fill:"#2a7a1a", stroke:"#1a5010", hoverFill:"#369424",
    climate:"Bushveld · Semi-arid · 400–600mm summer rain · Hot",
    rainfall:"400–600mm", season:"Summer", frost:"None", humidity:"Low",
    parasites:"High", drought:"Frequent", cattleDensity:"High",
    primary:["Bonsmara","Brahman","Beefmaster"],
    secondary:["Nguni","Simbra"],
    avoid:["Angus","Hereford"],
    why:"Limpopo is SA's Bonsmara heartland. The breed was designed for exactly these conditions — bushveld heat, tick pressure, and summer rainfall. Brahman crosses dominate large commercial operations. European breeds suffer heat stress and require expensive supplementation in summer.",
    tip:"Mokopane to Lephalale: prime Bonsmara country. Budget 4–6 ha per LSU on good bushveld. Water infrastructure unlocks carrying capacity — a good solar borehole system pays back in 2–3 seasons.",
    breed:"Bonsmara", type:"Beef", market:"Polokwane sale yard · Mokopane abattoir · Beefcor",
    rep:15, oh:1200, labour:2800, hired:8500,
    lambing:78, survival:82, liveKg:480, dressing:54, wool:0, woolMonth:0,
    feed:1800, health:480, ewePrice:18000, be:18,
  },
  north_west: {
    name:"North West", short:"N. West",
    fill:"#b87a10", stroke:"#7a5008", hoverFill:"#d09020",
    climate:"Semi-arid Bushveld · 300–500mm · Hot and dry",
    rainfall:"300–500mm", season:"Summer", frost:"Light", humidity:"Low",
    parasites:"Medium", drought:"Very frequent", cattleDensity:"Medium",
    primary:["Bonsmara","Beefmaster","Simmentaler"],
    secondary:["Brahman","Drakensberger"],
    avoid:["Angus","Charolais"],
    why:"North West is one of SA's top commercial beef provinces. Bonsmara and Beefmaster dominate feedlot supply. The Marico region has excellent natural pasture quality. Drought management is critical — destocking strategies separate successful from marginal operations.",
    tip:"Vryburg to Zeerust: the commercial beef corridor. Most successful operations supply feedlots directly. Weaner calf contracts at R22–28/kg live weight offer predictable cash flow.",
    breed:"Bonsmara", type:"Beef", market:"Vryburg sale yard · Lichtenburg · Vleissentraal feedlots",
    rep:15, oh:1200, labour:2800, hired:8500,
    lambing:75, survival:80, liveKg:460, dressing:53, wool:0, woolMonth:0,
    feed:1800, health:440, ewePrice:16000, be:22,
  },
  gauteng: {
    name:"Gauteng", short:"Gauteng",
    fill:"#1a70b0", stroke:"#104678", hoverFill:"#2288cc",
    climate:"Highveld · 700mm summer rain · Moderate",
    rainfall:"700mm", season:"Summer", frost:"Moderate", humidity:"Medium",
    parasites:"Medium", drought:"Occasional", cattleDensity:"Very low",
    primary:["Bonsmara","Angus","Simmentaler"],
    secondary:["Charolais"],
    avoid:[],
    why:"Gauteng is SA's primary consumption market, not a production province. Proximity to the Johannesburg fresh beef market adds R3–5/kg premium on dressed carcass. Small to medium intensive operations with strong market access are viable.",
    tip:"Direct supply to Joburg fresh markets, restaurants, or butcheries. Farm-gate price advantage offsets high land values. Angus for premium branded beef or Bonsmara for feedlot supply.",
    breed:"Angus", type:"Beef", market:"Karan Beef · Joburg fresh market · premium butcheries",
    rep:15, oh:1400, labour:3000, hired:9000,
    lambing:80, survival:84, liveKg:490, dressing:54, wool:0, woolMonth:0,
    feed:2200, health:520, ewePrice:20000, be:24,
  },
  mpumalanga: {
    name:"Mpumalanga", short:"Mpuma-\nlanga",
    fill:"#228844", stroke:"#145228", hoverFill:"#2aa050",
    climate:"Highveld + Lowveld · 600–800mm · Moderate–hot",
    rainfall:"600–800mm", season:"Summer", frost:"Moderate highland", humidity:"High lowveld",
    parasites:"Medium–high", drought:"Rare", cattleDensity:"High",
    primary:["Simmentaler","Bonsmara","Nguni"],
    secondary:["Charolais","Angus"],
    avoid:[],
    why:"Mpumalanga is a major beef production province. Highveld grasslands (Ermelo region) are ideal for Simmentaler and Bonsmara crosses. Good rainfall provides reliable pasture — most successful operations sell 7-month weaners at 200–240 kg live weight.",
    tip:"Ermelo to Carolina: reliable weaner production. Average calving rates of 75–80% on well-managed highveld. Most operations market to feedlots via Ermelo or Standerton sale yards.",
    breed:"Simmentaler", type:"Beef", market:"Ermelo sale yard · Carolina · Dawn Meats Standerton",
    rep:15, oh:1200, labour:2800, hired:8500,
    lambing:79, survival:83, liveKg:490, dressing:54, wool:0, woolMonth:0,
    feed:1900, health:480, ewePrice:18000, be:19,
  },
  free_state: {
    name:"Free State", short:"Free State",
    fill:"#9aaa1a", stroke:"#607010", hoverFill:"#b2c422",
    climate:"Grassland · 400–600mm · Cold winters · Hard frost",
    rainfall:"400–600mm", season:"Summer", frost:"Heavy", humidity:"Low–medium",
    parasites:"Low", drought:"Moderate", cattleDensity:"Very high",
    primary:["Bonsmara","Simmentaler","Drakensberger"],
    secondary:["Angus","Hereford","Charolais"],
    avoid:["Brahman"],
    why:"The Free State is SA's largest beef province by volume. Bonsmara dominates — the Bethlehem area has the highest concentration of stud beef operations in Africa. Cold winters exclude Brahman. Production costs here set the national benchmark for feedlot supply.",
    tip:"Harrismith to Bethlehem: the stud beef heartland. Most feedlots in SA prefer Free State Bonsmara weaners. Target 75–80% calving rate and 200–230 kg weaning weight for top auction prices.",
    breed:"Bonsmara", type:"Beef", market:"Harrismith · Bethlehem sale yards · Beefcor · RCL Foods",
    rep:15, oh:1300, labour:2800, hired:8500,
    lambing:77, survival:81, liveKg:470, dressing:53, wool:0, woolMonth:0,
    feed:2000, health:480, ewePrice:17000, be:21,
  },
  kwazulu_natal: {
    name:"KwaZulu-Natal", short:"KZN",
    fill:"#127a54", stroke:"#0a5038", hoverFill:"#169868",
    climate:"Subtropical coast + Drakensberg · High rainfall · Humid",
    rainfall:"600–1200mm", season:"Summer", frost:"Highlands only", humidity:"High",
    parasites:"Very high", drought:"Rare coastal", cattleDensity:"Medium",
    primary:["Nguni","Brahman","Bonsmara"],
    secondary:["Drakensberger","Simbra"],
    avoid:["Hereford","Charolais"],
    why:"KZN's high rainfall and humidity create severe tick and parasite pressure. Nguni cattle are indigenous to this environment — their tick resistance and heat tolerance are unmatched. Bonsmara × Nguni F1 crosses are popular commercially. European breeds have high mortality without intensive dipping.",
    tip:"Nguni are the lowest-input option in KZN. They thrive on poor veld where other breeds fail. For commercial weaner production, a Bonsmara or Brahman terminal sire on a Nguni cow base gives excellent results.",
    breed:"Nguni", type:"Beef", market:"Kokstad sale yard · Newcastle · Tongaat abattoir",
    rep:15, oh:1100, labour:2800, hired:8500,
    lambing:74, survival:78, liveKg:400, dressing:52, wool:0, woolMonth:0,
    feed:1600, health:560, ewePrice:14000, be:26,
  },
  eastern_cape: {
    name:"Eastern Cape", short:"E. Cape",
    fill:"#8a6a10", stroke:"#5a4408", hoverFill:"#a07e18",
    climate:"Karoo interior + Coastal · 200–700mm · Highly variable",
    rainfall:"200–700mm", season:"Mixed", frost:"Karoo interior", humidity:"Variable",
    parasites:"Low–medium", drought:"Karoo frequent", cattleDensity:"High",
    primary:["Nguni","Drakensberger","Angus"],
    secondary:["Bonsmara","Hereford"],
    avoid:[],
    why:"Eastern Cape is the Nguni heartland — this indigenous breed evolved here and in the Transkei communal farming system. The Drakensberger adapts well to the variable interior. Midlands suits Angus. Many farms use Nguni as a cow base with Angus or Simmentaler terminal sires for improved weaner prices.",
    tip:"East London to Queenstown: traditional Nguni country. Nguni × Angus cross weaners command a premium at Queenstown and East London sale yards. Karoo areas: Drakensberger or Bonsmara for drought resilience.",
    breed:"Nguni", type:"Beef", market:"Queenstown sale yard · East London abattoir · Rennie's",
    rep:15, oh:1100, labour:2800, hired:8500,
    lambing:72, survival:78, liveKg:420, dressing:52, wool:0, woolMonth:0,
    feed:1700, health:440, ewePrice:15000, be:23,
  },
  western_cape: {
    name:"Western Cape", short:"W. Cape",
    fill:"#6a2a94", stroke:"#481a64", hoverFill:"#8038b0",
    climate:"Mediterranean · Winter rainfall · 200–800mm · Cool winters",
    rainfall:"200–800mm", season:"Winter (Cape)", frost:"Light–moderate", humidity:"Moderate",
    parasites:"Low–medium", drought:"Summer droughts common", cattleDensity:"Low",
    primary:["Angus","Hereford","Simmentaler"],
    secondary:["Bonsmara","Drakensberger"],
    avoid:["Brahman","Nguni"],
    why:"Western Cape's winter rainfall system requires breeds adapted to seasonal pasture. Angus and Hereford excel on cereal stubble and improved pastures. The Swartland wheat-cattle rotation is a proven model. Angus weaners for the Cape Town premium market add R4–6/kg over national benchmarks.",
    tip:"Swartland and Overberg: wheat/cattle rotation is highly profitable when managed precisely. Time your calving to coincide with wheat stubble availability. Angus dressed carcasses command a consistent premium from Cape Town retailers.",
    breed:"Angus", type:"Beef", market:"Boland Agri · Paarl sale yard · Cape Town abattoirs · premium butcheries",
    rep:15, oh:1400, labour:3000, hired:9000,
    lambing:80, survival:84, liveKg:480, dressing:54, wool:0, woolMonth:0,
    feed:2100, health:460, ewePrice:21000, be:20,
  },
  northern_cape: {
    name:"Northern Cape", short:"N. Cape",
    fill:"#9a1818", stroke:"#680e0e", hoverFill:"#b82020",
    climate:"Karoo · Hyper-arid · 50–250mm · Extreme heat + cold",
    rainfall:"50–250mm", season:"Erratic", frost:"Heavy nights", humidity:"Very low",
    parasites:"Very low", drought:"Severe, frequent", cattleDensity:"Very low",
    primary:["Drakensberger","Bonsmara","Beefmaster"],
    secondary:["Nguni"],
    avoid:["Angus","Hereford","Simmentaler","Charolais"],
    why:"Northern Cape is the most challenging beef environment in SA. Budget 6–20 ha per LSU on natural Karoo. Drakensberger was bred in this province — its drought metabolism and fat reserves are unmatched. Scale requirements are high: 100+ cows to cover fixed costs.",
    tip:"Upington to Britstown: ultra-extensive Drakensberger country. Capital costs are low but land requirements are extreme. Solar-powered borehole systems are the single biggest enabling investment for sustainable stocking.",
    breed:"Drakensberger", type:"Beef", market:"Upington · De Aar sale yards · long-haul to Gauteng feedlots",
    rep:15, oh:1000, labour:2800, hired:8500,
    lambing:68, survival:74, liveKg:420, dressing:51, wool:0, woolMonth:0,
    feed:1400, health:360, ewePrice:13000, be:32,
  },
};

const CATTLE_CARRYING_CAPACITY = {
  extensive:     { limpopo:0.5, north_west:0.35, gauteng:0.7, mpumalanga:0.7, free_state:0.65, kwazulu_natal:0.6, eastern_cape:0.45, western_cape:0.7, northern_cape:0.12 },
  semiIntensive: { limpopo:1.2, north_west:0.9,  gauteng:1.8, mpumalanga:1.8, free_state:1.6,  kwazulu_natal:1.5, eastern_cape:1.2,  western_cape:1.8,  northern_cape:0.35 },
  intensive:     { limpopo:3.0, north_west:2.5,  gauteng:4.0, mpumalanga:4.0, free_state:3.5,  kwazulu_natal:3.5, eastern_cape:3.0,  western_cape:4.0,  northern_cape:1.0  },
};

const CATTLE_PROVINCE_DEFAULTS = {
  limpopo:       { system:"extensive",     market:"auction",   feed:"purchased" },
  north_west:    { system:"extensive",     market:"auction",   feed:"purchased" },
  gauteng:       { system:"intensive",     market:"direct",    feed:"purchased" },
  mpumalanga:    { system:"semiIntensive", market:"auction",   feed:"mixed" },
  free_state:    { system:"semiIntensive", market:"auction",   feed:"mixed" },
  kwazulu_natal: { system:"extensive",     market:"auction",   feed:"purchased" },
  eastern_cape:  { system:"extensive",     market:"auction",   feed:"purchased" },
  western_cape:  { system:"semiIntensive", market:"direct",    feed:"mixed" },
  northern_cape: { system:"extensive",     market:"auction",   feed:"purchased" },
};

// ─── APIARY / BEES MODULE ──────────────────────────────────────────────────────
// lambing:118, survival:100, dressing:100 → lambsPerEwe ≈ 1.0
// liveKg = honey yield per hive/yr (kg), carcass = honey price R/kg
// wool = secondary income (beeswax + pollen) per hive/yr in R
const BEE_PROVINCE_DATA = {
  limpopo: {
    name:"Limpopo", short:"Limpopo",
    fill:"#d4a500", stroke:"#9a7800", hoverFill:"#e8b800",
    climate:"Bushveld · 400–600mm · Hot summers · Diverse flora",
    rainfall:"400–600mm", season:"Summer", frost:"None", humidity:"Low",
    parasites:"Medium (Varroa)", drought:"Moderate", hiveDensity:"Medium",
    primary:["Bushveld honey","Mopane honey"],
    secondary:["Beeswax","Pollen"],
    avoid:["Sites near intensive pesticide use","High-density urban placement"],
    why:"Limpopo's diverse bushveld flora — mopane, acacia, mixed veld — produces excellent aromatic honey. Spring (Aug–Oct) and autumn (Mar–May) are peak forage periods. Mobile apiaries moving between veld sites is the commercial standard. Citrus orchards near Tzaneen offer premium pollination income of R600–900/hive/visit.",
    tip:"Vaalwater and Mokopane areas: excellent mixed bushveld forage. Negotiate citrus pollination contracts in Tzaneen for Oct–Nov — this income can match 3 months of honey production.",
    breed:"Bushveld honey", type:"Honey", market:"Joburg honey packers · Pretoria bulk buyers · local markets",
    rep:20, oh:500, labour:1500, hired:5594, woolMonth:4,
    lambing:118, survival:100, liveKg:25, dressing:100, wool:80, feed:120, health:150, ewePrice:2800, be:32,
  },
  north_west: {
    name:"North West", short:"N. West",
    fill:"#c89000", stroke:"#8a6000", hoverFill:"#dca400",
    climate:"Semi-arid Bushveld · 300–500mm · Hot and dry",
    rainfall:"300–500mm", season:"Summer", frost:"Light", humidity:"Low",
    parasites:"Low–medium", drought:"High", hiveDensity:"Low",
    primary:["Acacia honey","Bushveld honey"],
    secondary:["Beeswax"],
    avoid:["Sites near intensive crop spraying","Extended drought areas without water"],
    why:"North West has good acacia and mixed bushveld forage but drought risk is significant — hive losses in dry years can reach 40–60% without supplemental feeding. Marico and Zeerust have better water access. Sunflower farms near Lichtenburg offer excellent Aug–Sep forage.",
    tip:"Position hives near reliable water — bees won't forage effectively more than 3km from water. Negotiate sunflower access near Lichtenburg for the August–September flush.",
    breed:"Acacia honey", type:"Honey", market:"Vryburg bulk buyers · Gauteng packers",
    rep:25, oh:500, labour:1500, hired:5594, woolMonth:3,
    lambing:118, survival:100, liveKg:20, dressing:100, wool:60, feed:150, health:150, ewePrice:2600, be:40,
  },
  gauteng: {
    name:"Gauteng", short:"Gauteng",
    fill:"#e8b400", stroke:"#a07800", hoverFill:"#f0c600",
    climate:"Highveld · 700mm · Year-round urban forage · Moderate",
    rainfall:"700mm", season:"Summer", frost:"Moderate", humidity:"Medium",
    parasites:"Medium", drought:"Low", hiveDensity:"Medium–high",
    primary:["Mixed urban honey","Highveld honey"],
    secondary:["Beeswax","Pollination services"],
    avoid:["Industrial areas","Dense residential without council permission","Heavy pesticide zones"],
    why:"Gauteng's year-round garden and agricultural fringe flora provides reliable forage. Urban honey is increasingly premium-priced. The biggest opportunity is pollination services to highveld fruit and vegetable farmers — R700–1,000/hive/visit.",
    tip:"Farm the agricultural fringe — Walkerville, Muldersdrift, Roslyn. Direct retail at farmers markets (R120–160/kg) pays back significantly faster than bulk supply to packers.",
    breed:"Mixed highveld honey", type:"Honey + Pollination", market:"Joburg farmers markets · direct retail · highveld farms",
    rep:20, oh:600, labour:1500, hired:5594, woolMonth:3,
    lambing:118, survival:100, liveKg:22, dressing:100, wool:100, feed:150, health:160, ewePrice:3200, be:38,
  },
  mpumalanga: {
    name:"Mpumalanga", short:"Mpuma-\nlanga",
    fill:"#d46800", stroke:"#8a4200", hoverFill:"#e87c00",
    climate:"Highveld + Lowveld · 600–800mm · Excellent forage diversity",
    rainfall:"600–800mm", season:"Summer", frost:"Moderate highland", humidity:"High lowveld",
    parasites:"Medium", drought:"Low", hiveDensity:"High",
    primary:["Citrus honey","Lowveld bush honey"],
    secondary:["Beeswax","Pollination services"],
    avoid:["Citrus blocks during heavy spray periods","Macadamia orchards mid-season"],
    why:"Mpumalanga is one of SA's best beekeeping provinces. The lowveld citrus belt (Nelspruit to Tzaneen) is SA's premier pollination market — one placement contract pays R700–1,000/hive. Eucalyptus plantations produce reliable base honey. The highveld adds diverse summer flora.",
    tip:"Hazyview to Nelspruit: citrus pollination goldmine. Negotiate multi-season contracts with citrus farmers before October. One week on citrus earns more than 3 months on natural veld.",
    breed:"Citrus honey", type:"Honey + Pollination", market:"Nelspruit honey buyers · Joburg packers · direct retail",
    rep:20, oh:550, labour:1500, hired:5594, woolMonth:4,
    lambing:118, survival:100, liveKg:30, dressing:100, wool:120, feed:130, health:160, ewePrice:2800, be:28,
  },
  free_state: {
    name:"Free State", short:"Free State",
    fill:"#c88000", stroke:"#885200", hoverFill:"#dc9400",
    climate:"Grassland · 400–600mm · Cold winters · Hard frost",
    rainfall:"400–600mm", season:"Summer", frost:"Heavy", humidity:"Low–medium",
    parasites:"Low", drought:"Moderate", hiveDensity:"Low",
    primary:["Canola honey","Sunflower honey"],
    secondary:["Beeswax","Mixed grassland honey"],
    avoid:["Winter placement without feeding (colonies starve)","Weed-sprayed monocultures"],
    why:"Cold winters force long breaks — colonies need supplemental feeding June–August. The upside: canola fields (Aug–Sep) and sunflower (Jan–Feb) produce excellent single-source honey at industrial scale. Large sunflower producers actively seek hive placements at R400–600/hive.",
    tip:"Source canola contracts before August — fields are allocated early. One good canola flush can produce 30+ kg per hive in 4 weeks. Overwinter hives in insulated boxes with sugar syrup feeding.",
    breed:"Canola honey", type:"Honey", market:"Bloemfontein buyers · bulk export via Joburg · co-ops",
    rep:25, oh:500, labour:1500, hired:5594, woolMonth:9,
    lambing:118, survival:100, liveKg:22, dressing:100, wool:60, feed:200, health:150, ewePrice:2400, be:38,
  },
  kwazulu_natal: {
    name:"KwaZulu-Natal", short:"KZN",
    fill:"#da9c00", stroke:"#946800", hoverFill:"#eeb000",
    climate:"Subtropical · High rainfall · Near year-round forage",
    rainfall:"600–1200mm", season:"Summer", frost:"Highlands only", humidity:"High",
    parasites:"Medium", drought:"Low", hiveDensity:"Medium",
    primary:["Subtropical honey","Litchi honey"],
    secondary:["Beeswax","Pollination services"],
    avoid:["Timber plantations (limited forage)","Sugarcane monoculture zones","High-humidity sites prone to chalkbrood"],
    why:"KZN's subtropical climate enables near year-round forage with minimal winter gap. Coastal bush and midlands produce aromatic multi-floral honey at a local premium. Litchi and avocado pollination services are well-developed — R800–1,100/hive/visit for established orchards.",
    tip:"Durban North Shore to Eshowe: excellent coastal bush apiary sites. Litchi pollination (Oct–Nov) is the premium income event. Check with local beekeeping associations for site access on communal land.",
    breed:"Subtropical honey", type:"Honey + Pollination", market:"Durban honey market · Joburg buyers · coastal farm stalls",
    rep:20, oh:500, labour:1500, hired:5594, woolMonth:5,
    lambing:118, survival:100, liveKg:28, dressing:100, wool:100, feed:100, health:170, ewePrice:2800, be:30,
  },
  eastern_cape: {
    name:"Eastern Cape", short:"E. Cape",
    fill:"#c07800", stroke:"#7e4e00", hoverFill:"#d48c00",
    climate:"Karoo + Coastal · 200–700mm · Variable rainfall",
    rainfall:"200–700mm", season:"Mixed", frost:"Karoo interior", humidity:"Variable",
    parasites:"Low–medium", drought:"Karoo high", hiveDensity:"Low–medium",
    primary:["Karoo honey","Fynbos transition honey"],
    secondary:["Beeswax","Coastal mixed honey"],
    avoid:["Deep Karoo during drought years","Sites more than 2km from reliable water"],
    why:"Eastern Cape's diversity produces distinct honey types by zone. Karoo interior honey is intensely flavoured with very low moisture — premium buyers pay R80–100/kg for verified Karoo origin. Coastal midlands produce lighter floral honey. Drought management is the primary challenge.",
    tip:"Graaff-Reinet and Murraysburg area: Karoo honey commands a geographic premium. Build relationships with local farmers — migratory beekeepers follow Karoo flowering after rain events.",
    breed:"Karoo honey", type:"Honey", market:"Cape Town premium buyers · PE market · Karoo direct retail",
    rep:20, oh:500, labour:1500, hired:5594, woolMonth:3,
    lambing:118, survival:100, liveKg:22, dressing:100, wool:70, feed:150, health:150, ewePrice:2600, be:38,
  },
  western_cape: {
    name:"Western Cape", short:"W. Cape",
    fill:"#d4a018", stroke:"#926c00", hoverFill:"#e8b42a",
    climate:"Mediterranean · Winter rainfall · Fynbos · SA's premier honey province",
    rainfall:"200–800mm", season:"Winter (Cape)", frost:"Light–moderate", humidity:"Moderate",
    parasites:"Low–medium", drought:"Summer", hiveDensity:"High",
    primary:["Fynbos honey","Protea honey"],
    secondary:["Beeswax","Citrus honey","Pollination services"],
    avoid:["Fynbos fire-cleared sites in summer","Orchard blocks during fungicide programs"],
    why:"The Western Cape produces SA's most prestigious honey. Fynbos honey — particularly Renosterbos and Protea varieties — commands R120–200/kg in premium channels. Winter rainfall means fynbos flowers when other provinces are dormant. Deciduous fruit pollination (Sep–Nov) around Grabouw, Ceres, and Elgin pays R900–1,200/hive.",
    tip:"Overberg and Swartland: SA's premier honey region. Cape Fynbos Honey Association certification unlocks international premiums. Deciduous fruit pollination contracts fill in the cash-flow gap between fynbos harvests.",
    breed:"Fynbos honey", type:"Honey + Pollination", market:"Cape Town premium retail · export via Cape Honey · international buyers",
    rep:20, oh:600, labour:1500, hired:5594, woolMonth:10,
    lambing:118, survival:100, liveKg:35, dressing:100, wool:140, feed:150, health:180, ewePrice:3500, be:26,
  },
  northern_cape: {
    name:"Northern Cape", short:"N. Cape",
    fill:"#b87000", stroke:"#7a4600", hoverFill:"#cc8400",
    climate:"Karoo · Hyper-arid · 50–250mm · Extreme heat + cold",
    rainfall:"50–250mm", season:"Erratic", frost:"Heavy nights", humidity:"Very low",
    parasites:"Very low", drought:"Very high", hiveDensity:"Very low",
    primary:["Keimoes citrus honey","Namaqualand flower honey"],
    secondary:["Beeswax"],
    avoid:["Permanent apiaries without irrigation-backed forage","Sites far from the Orange River"],
    why:"The Northern Cape is SA's most challenging beekeeping environment. Two viable windows exist: the Orange River irrigation belt (Keimoes, Upington, Kakamas) for citrus honey in Aug–Sep, and the Namaqualand flower season (Aug–Oct) after good rains. Migratory beekeeping during these windows is profitable but requires careful planning.",
    tip:"Move hives to Keimoes citrus belt in mid-July; harvest in late September. Namaqualand flower season follows rain — contact local farmers for land access. Don't maintain permanent apiaries outside irrigation zones.",
    breed:"Citrus honey", type:"Honey", market:"Upington local buyers · Cape Town buyers · Gauteng bulk packers",
    rep:30, oh:450, labour:1500, hired:5594, woolMonth:9,
    lambing:118, survival:100, liveKg:15, dressing:100, wool:50, feed:200, health:130, ewePrice:2200, be:55,
  },
};

const BEE_CARRYING_CAPACITY = {
  extensive:     { limpopo:0.5, north_west:0.3, gauteng:0.8, mpumalanga:1.0, free_state:0.4, kwazulu_natal:0.8, eastern_cape:0.4, western_cape:1.0, northern_cape:0.15 },
  semiIntensive: { limpopo:1.5, north_west:1.0, gauteng:2.5, mpumalanga:3.0, free_state:1.2, kwazulu_natal:2.5, eastern_cape:1.2, western_cape:3.0, northern_cape:0.5  },
  intensive:     { limpopo:4.0, north_west:3.0, gauteng:6.0, mpumalanga:8.0, free_state:3.5, kwazulu_natal:6.0, eastern_cape:3.5, western_cape:8.0, northern_cape:1.5  },
};

const BEE_PROVINCE_DEFAULTS = {
  limpopo:       { system:"extensive",     market:"auction",  feed:"purchased" },
  north_west:    { system:"extensive",     market:"auction",  feed:"purchased" },
  gauteng:       { system:"semiIntensive", market:"direct",   feed:"mixed"     },
  mpumalanga:    { system:"semiIntensive", market:"direct",   feed:"mixed"     },
  free_state:    { system:"semiIntensive", market:"auction",  feed:"purchased" },
  kwazulu_natal: { system:"extensive",     market:"direct",   feed:"purchased" },
  eastern_cape:  { system:"extensive",     market:"direct",   feed:"purchased" },
  western_cape:  { system:"semiIntensive", market:"direct",   feed:"mixed"     },
  northern_cape: { system:"extensive",     market:"auction",  feed:"purchased" },
};

// ─── LIVESTOCK MODULE REGISTRY ─────────────────────────────────────────────────
// Each module is a self-contained slice. Add new species here.
const LIVESTOCK_MODULES = {
  sheep: {
    id:"sheep", emoji:"🐑", label:"Sheep", labelPlural:"SA Sheep",
    terms:{ unit:"ewe", units:"ewes", group:"flock", young:"lamb", youngs:"lambs",
            rateLabel:"Lambing", priceLabel:"Ewe price", saleMonthLabel:"Lamb sale months" },
    provinceData: PROVINCE_DATA,
    carryingCapacity: CARRYING_CAPACITY,
    provinceDefaults: PROVINCE_DEFAULTS,
    calcFn: (reg, carcass, size, labour, overhead, extra) =>
      calcFull(reg, carcass, size, labour, overhead, extra, [20, 50, 100, 200, 500, 1000, 2000]),
    carcassDefault: 52,
    carcassLabel: "Carcass R/kg",
  },
  cattle: {
    id:"cattle", emoji:"🐄", label:"Beef Cattle", labelPlural:"SA Beef Cattle",
    terms:{ unit:"cow", units:"cows", group:"herd", young:"calf", youngs:"calves",
            rateLabel:"Calving", priceLabel:"Cow price", saleMonthLabel:"Calf sale months" },
    provinceData: CATTLE_PROVINCE_DATA,
    carryingCapacity: CATTLE_CARRYING_CAPACITY,
    provinceDefaults: CATTLE_PROVINCE_DEFAULTS,
    calcFn: (reg, carcass, size, labour, overhead, extra) =>
      calcFull(reg, carcass, size, labour, overhead, extra, [5, 10, 20, 50, 100, 200, 500]),
    carcassDefault: 52,
    carcassLabel: "Carcass R/kg",
  },
  bees: {
    id:"bees", emoji:"🐝", label:"Apiary / Bees", labelPlural:"SA Beekeeping",
    terms:{ unit:"hive", units:"hives", group:"apiary", young:"colony", youngs:"colonies",
            rateLabel:"Honey yield", priceLabel:"Hive cost", saleMonthLabel:"Harvest months" },
    provinceData: BEE_PROVINCE_DATA,
    carryingCapacity: BEE_CARRYING_CAPACITY,
    provinceDefaults: BEE_PROVINCE_DEFAULTS,
    calcFn: (reg, carcass, size, labour, overhead, extra) =>
      calcFull(reg, carcass, size, labour, overhead, extra, [10, 25, 50, 100, 200, 500]),
    carcassDefault: 60,
    carcassLabel: "Honey R/kg",
  },
};

function calcFull(reg, carcass, flockSize, labour, overhead = reg.oh ?? 600, extraCosts = {}, scalePoints = [20, 50, 100, 200, 500, 1000, 2000]) {
  // ── Extra farmer-entered costs ────────────────────────────────────────────
  const {
    bond        = 0,    // monthly bond / finance repayment
    feedOverride  = null, // per ewe/year override (null = use province default)
    healthOverride = null,
    fencing     = 0,    // monthly fencing / infrastructure maintenance
    misc        = 0,    // monthly miscellaneous
  } = extraCosts;

  const feedCost    = feedOverride   !== null ? feedOverride   : reg.feed;
  const healthCost  = healthOverride !== null ? healthOverride : reg.health;
  const extraFixed  = bond + fencing + misc; // extra monthly fixed outgoings

  // ── Per-ewe steady-state economics ───────────────────────────────────────
  const lambsPerEwe    = (reg.lambing / 100) * (reg.survival / 100) * 0.85;
  const carcassKg      = reg.liveKg * (reg.dressing / 100);
  const lambRevPerEwe  = lambsPerEwe * carcassKg * carcass;
  const woolRevPerEwe  = reg.wool;
  const totalRevPerEwe = lambRevPerEwe + woolRevPerEwe;

  const labourShare    = (labour * 12) / flockSize;
  const overheadShare  = ((overhead + extraFixed) * 12) / flockSize;
  const replaceCost    = reg.ewePrice * (reg.rep / 100);
  const totalCostPerEwe = feedCost + healthCost + labourShare + overheadShare + replaceCost;

  const profitPerEwe   = totalRevPerEwe - totalCostPerEwe;
  const roi            = profitPerEwe / reg.ewePrice;
  const payback        = profitPerEwe > 0 ? reg.ewePrice / profitPerEwe : null;

  // ── Breakeven (minimum viable flock size) ────────────────────────────────
  const varMargin   = lambRevPerEwe + woolRevPerEwe - feedCost - healthCost - replaceCost;
  const fixedAnnual = (labour + overhead + extraFixed) * 12;
  const breakeven   = varMargin > 0 ? Math.ceil(fixedAnnual / varMargin) : null;

  // ── Capital structure: ewe purchase + 12-month working capital buffer ────
  const ewePurchase    = flockSize * reg.ewePrice;
  const monthlyOpex    = (feedCost / 12 + healthCost / 12) * flockSize
                         + labour + overhead + extraFixed
                         + reg.ewePrice * (reg.rep / 100) * flockSize / 12;
  const workingCapital = Math.round(monthlyOpex * 12);
  const capital        = ewePurchase + workingCapital;

  // ── Cost breakdown for display ────────────────────────────────────────────
  const costBreakdown = {
    feed:     { label: "Feed",             annual: feedCost * flockSize,         perEwe: feedCost },
    health:   { label: "Meds / vet",       annual: healthCost * flockSize,       perEwe: healthCost },
    labour:   { label: "Labour",           annual: labour * 12,                  perEwe: labourShare },
    overhead: { label: "Overhead",         annual: overhead * 12,                perEwe: (overhead * 12) / flockSize },
    replace:  { label: "Replacements",     annual: replaceCost * flockSize,      perEwe: replaceCost },
    bond:     { label: "Bond repayment",   annual: bond * 12,                    perEwe: (bond * 12) / flockSize },
    fencing:  { label: "Fencing / infra",  annual: fencing * 12,                 perEwe: (fencing * 12) / flockSize },
    misc:     { label: "Miscellaneous",    annual: misc * 12,                    perEwe: (misc * 12) / flockSize },
  };

  // ── Scale rows ───────────────────────────────────────────────────────────
  const scaleRows = scalePoints.map(n => {
    const ls   = (labour * 12) / n;
    const os   = ((overhead + extraFixed) * 12) / n;
    const cost = feedCost + healthCost + ls + os + replaceCost;
    const p    = totalRevPerEwe - cost;
    return { n, rev: totalRevPerEwe * n, profit: p * n, roi: p / reg.ewePrice };
  });

  // ── 36-month cashflow with breeding cycles ────────────────────────────────
  const lambCropRev = lambRevPerEwe * flockSize;

  const cf36 = Array.from({ length: 36 }, (_, i) => {
    const m = i + 1;
    let lambRev = 0, woolRev = 0;
    if (m === 13 || m === 25) lambRev = lambCropRev;
    if (reg.wool > 0 && reg.woolMonth > 0) {
      for (let yr = 0; yr <= 2; yr++) {
        if (m === reg.woolMonth + yr * 12) woolRev = woolRevPerEwe * flockSize;
      }
    }
    const rev = lambRev + woolRev;
    return { m, rev, lambRev, woolRev, cost: monthlyOpex, profit: rev - monthlyOpex };
  });

  let cum = -ewePurchase;
  cf36.forEach(r => { cum += r.profit; r.cum = Math.round(cum); });

  const firstProfitMonth = cf36.find(r => r.profit > 0)?.m ?? null;
  const paybackMonth     = cf36.find(r => r.cum >= 0)?.m ?? null;

  // ── Year 1 slice (backward-compat with reportEngine) ─────────────────────
  const yr1 = cf36.slice(0, 12);

  // ── MVO capital ───────────────────────────────────────────────────────────
  let mvoCapital = null;
  if (breakeven) {
    const mvoOpex = (feedCost / 12 + healthCost / 12) * breakeven + labour + overhead + extraFixed
                    + reg.ewePrice * (reg.rep / 100) * breakeven / 12;
    mvoCapital = breakeven * reg.ewePrice + Math.round(mvoOpex * 12);
  }

  // ── 5-year NPV (10% discount rate) ───────────────────────────────────────
  const annualFlockProfit = profitPerEwe * flockSize;
  const npv5 = [-ewePurchase, ...Array(5).fill(annualFlockProfit)]
    .reduce((acc, v, i) => acc + v / Math.pow(1.10, i), 0);

  return {
    lambsPerEwe, carcassKg, lambRevPerEwe, woolRevPerEwe, totalRevPerEwe,
    labourShare, overheadShare, replaceCost, totalCostPerEwe,
    profitPerEwe, roi, payback, breakeven,
    ewePurchase, workingCapital, capital, mvoCapital,
    flockRev: totalRevPerEwe * flockSize,
    flockProfit: profitPerEwe * flockSize,
    varMargin, fixedAnnual,
    costBreakdown, feedCost, healthCost, extraFixed,
    scaleRows, yr1, cf36, npv5,
    firstProfitMonth, paybackMonth,
  };
}

const PF = {
  merchantId:  import.meta.env?.VITE_PF_MERCHANT_ID  || "REPLACE_MERCHANT_ID",
  merchantKey: import.meta.env?.VITE_PF_MERCHANT_KEY || "REPLACE_MERCHANT_KEY",
  passphrase:  import.meta.env?.VITE_PF_PASSPHRASE   || "REPLACE_PASSPHRASE",
  returnUrl:   "https://agrisolvesa.netlify.app/success",
  cancelUrl:   "https://agrisolvesa.netlify.app/",
  notifyUrl:   "https://agrisolvesa.netlify.app/api/payfast-notify",
  sandbox:     false,
  price:       147.95,
};

function buildPFUrl(name, email, region) {
  const base = PF.sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
  const p = new URLSearchParams({
    merchant_id: PF.merchantId, merchant_key: PF.merchantKey,
    return_url: PF.returnUrl, cancel_url: PF.cancelUrl, notify_url: PF.notifyUrl,
    name_first: name.split(" ")[0] || name,
    name_last: name.split(" ").slice(1).join(" ") || ".",
    email_address: email || "customer@agrimodel.co.za",
    m_payment_id: `AGRI-${region}-${Date.now()}`,
    amount: PF.price.toFixed(2),
    item_name: `Agrimodel Pro — Full Platform Access`,
    item_description: "Lifetime access: all livestock modules, inefficiency engine + AI feasibility report",
  });
  return `${base}?${p.toString()}`;
}

const PALETTE = {
  bg:"#0a0c0a",       surface:"#131713",   card:"#1a201a",   border:"#2c3c2c",
  borderHover:"#4a6a34", accent:"#7acc3a", gold:"#d4b55a",   goldDim:"#9a7830",
  text:"#f0ece0",     muted:"#b8b4a8",     dim:"#9a9590",    faint:"#263626",
  danger:"#e06848",   dangerBg:"rgba(224,104,72,.10)",
  ocean:"#0a1520",    land:"rgba(18,36,14,.6)",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Mono:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;background:${PALETTE.bg};}
  body{font-family:'DM Mono','Courier New',monospace;color:${PALETTE.text};}
  svg{display:block;}
  .slide-up{animation:su .4s cubic-bezier(.22,.68,0,1.12) both;}
  @keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fi .3s ease both;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
  .map-loading{animation:pulse 1.8s ease-in-out infinite;}
  .loading-bar{animation:slide 1.8s linear infinite;}
  .glow-btn{transition:all .2s;}
  .leaflet-container{font-family:'DM Mono','Courier New',monospace;}
  .prov-tip{background:rgba(10,12,10,.96)!important;border:1px solid #2c3c2c!important;color:#f0ece0!important;font-family:'DM Mono','Courier New',monospace!important;font-size:11px!important;padding:3px 8px!important;border-radius:3px!important;box-shadow:none!important;}
  .prov-tip::before{display:none!important;}
  .leaflet-control-zoom{border:1px solid #2c3c2c!important;}
  .leaflet-control-zoom a{background:#1a201a!important;color:#7acc3a!important;border-bottom:1px solid #2c3c2c!important;}
  .leaflet-control-zoom a:hover{background:#2c3c2c!important;}
  .glow-btn:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 24px rgba(200,168,75,.45)!important;}
  .tab-btn:hover{background:${PALETTE.card}!important;}
  .pill-btn:hover{border-color:${PALETTE.accent}!important;color:${PALETTE.accent}!important;}
  input:focus,select:focus{outline:none;}
  button{touch-action:manipulation;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${PALETTE.bg};}
  ::-webkit-scrollbar-thumb{background:${PALETTE.faint};border-radius:2px;}
  ::-webkit-scrollbar-thumb:hover{background:${PALETTE.dim};}
  .risk-low{color:#82d448;} .risk-med{color:#c8a84b;} .risk-high{color:#e05c3a;}
  @media(max-width:480px){
    .leaflet-container{height:44vh!important;}
    .report-kpi-grid{grid-template-columns:repeat(3,1fr)!important;}
  }
  @media print{
    .no-print{display:none!important;}
    body{background:#fff!important;color:#000!important;}
    [style*="background"]{background:transparent!important;}
    [style*="color"]{color:#000!important;}
    [style*="border"]{border-color:#ccc!important;}
    button{display:none!important;}
    .leaflet-container{display:none!important;}
  }
`;


// Module-level constants — avoids recreation on every render
const TABS = ["Overview", "Breeds", "Model", "Savings"];

const LIVESTOCK_TYPES = [
  { id:"sheep",   emoji:"🐑", label:"Sheep",         sub:"Wool, meat & dual-purpose breeds",  status:"active" },
  { id:"cattle",  emoji:"🐄", label:"Beef Cattle",   sub:"Commercial & stud beef operations", status:"active" },
  { id:"bees",    emoji:"🐝", label:"Apiary / Bees", sub:"Honey production & pollination",    status:"active" },
  { id:"goats",   emoji:"🐐", label:"Goats",         sub:"Boer goat & dairy operations",      status:"soon"   },
  { id:"pigs",    emoji:"🐖", label:"Pigs",          sub:"Commercial piggery models",          status:"soon"   },
  { id:"poultry", emoji:"🐓", label:"Poultry",       sub:"Broiler & layer operations",         status:"soon"   },
  { id:"dairy",   emoji:"🐮", label:"Dairy Cattle",  sub:"Milk production feasibility",        status:"soon"   },
];
const riskLabel = v => v === "Low" || v === "Very low" || v === "None" ? "risk-low" : v === "High" || v === "Very high" || v === "Severe, frequent" ? "risk-high" : "risk-med";
const PAY_METHODS = [
  {id:"card",    icon:"💳", label:"Credit / Debit Card",  sub:"Visa · Mastercard · All SA banks"},
  {id:"eft",     icon:"🏦", label:"Instant EFT",          sub:"FNB · Capitec · ABSA · Nedbank · Std Bank"},
  {id:"snap",    icon:"📱", label:"SnapScan / Zapper",    sub:"Scan QR with your banking app"},
  {id:"payshap", icon:"⚡", label:"PayShap",              sub:"Real-time · All major SA banks"},
];

// Calls Leaflet invalidateSize after map wrapper expands so tiles redraw correctly
function MapSizeTracker({ collapsed }) {
  const map = useMap();
  useEffect(() => {
    if (!collapsed) {
      const t = setTimeout(() => map.invalidateSize(), 400);
      return () => clearTimeout(t);
    }
  }, [collapsed, map]);
  return null;
}

// ── ERROR BOUNDARY ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App error:", error, info); }
  render() {
    if (this.state.error) return (
      <div style={{ background: "#080f06", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Mono',monospace" }}>
        <div style={{ background: "#0e120e", border: "1px solid #1a3a0e", borderRadius: 16, padding: "32px 24px", maxWidth: "min(400px, calc(100vw - 32px))", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: "#f0ece0", marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 15, color: "#aca89c", marginBottom: 20, lineHeight: 1.7 }}>{String(this.state.error.message)}</div>
          <button onClick={() => window.location.reload()}
            style={{ padding: "11px 24px", background: "#c8a84b", color: "#080f06", border: "none", borderRadius: 10, fontSize: 17, fontFamily: "'Playfair Display',serif", fontWeight: 700, cursor: "pointer" }}>
            Reload App
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── RESTORE MODAL ────────────────────────────────────────────────────────────
function RestoreModal({ onClose, onRestore }) {
  const [code, setCode] = useState("");
  const [err,  setErr]  = useState(false);
  const W = {background:"#0e120e",border:`1px solid ${PALETTE.faint}`,borderRadius:16,maxWidth:"min(360px, calc(100vw - 32px))",width:"100%",padding:"24px"};
  const try_ = () => {
    const c = code.trim().toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(c)) { onRestore(c); onClose(); }
    else setErr(true);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="fade-in" style={W}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#f0ece0",marginBottom:6}}>Restore Access</div>
        <div style={{fontSize:15,color:PALETTE.muted,marginBottom:16,lineHeight:1.7}}>
          Enter the 6-character access code shown to you after payment.
          <br/>No code? Email <span style={{color:PALETTE.accent}}>support@agrimodel.co.za</span>
        </div>
        <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase().slice(0,6));setErr(false);}}
          placeholder="e.g. AB3X7K" maxLength={6}
          style={{width:"100%",padding:"11px 14px",background:PALETTE.surface,border:`1px solid ${err?PALETTE.danger:PALETTE.faint}`,borderRadius:8,color:PALETTE.text,fontSize:20,fontFamily:"'DM Mono',monospace",letterSpacing:4,textAlign:"center",marginBottom:4}}/>
        {err && <div style={{fontSize:14,color:PALETTE.danger,marginBottom:8}}>Invalid code — must be 6 letters/numbers</div>}
        <button onClick={try_} className="glow-btn"
          style={{width:"100%",padding:"12px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:9,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,cursor:"pointer",marginTop:8,boxShadow:`0 4px 16px rgba(200,168,75,.3)`}}>
          Restore →
        </button>
        <button onClick={onClose} style={{width:"100%",marginTop:8,padding:"8px",background:"none",color:PALETTE.muted,border:"none",fontSize:15,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

// ── PAY MODAL ─────────────────────────────────────────────────────────────────
function PayModal({ region, onClose, onSuccess }) {
  const [step, setStep]       = useState("pitch");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [method, setMethod]   = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [genCode]             = useState(() => Math.random().toString(36).slice(2,8).toUpperCase());
  const prov = PROVINCE_DATA[region] || {};
  const validEmail = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canPay = name.trim().length >= 2 && (email === "" || validEmail(email));
  const W = {background:"#0e120e",border:`1px solid ${PALETTE.faint}`,borderRadius:16,maxWidth:"min(400px, calc(100vw - 32px))",width:"100%",overflow:"hidden"};
  const wrap = ch => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div className="fade-in" style={{...W,padding:step==="pitch"?0:"24px"}}>{ch}</div>
    </div>
  );

  if (step==="done") return wrap(
    <div style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:52,marginBottom:14}}>✅</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#f0ece0",marginBottom:8}}>Access Unlocked!</div>
      <div style={{fontSize:15,color:PALETTE.muted,marginBottom:16,lineHeight:1.7}}>
        {PF.sandbox
          ? <><span>Sandbox mode — no real charge.</span><br/><span style={{color:PALETTE.dim}}>Set sandbox:false + add PayFast credentials to go live.</span></>
          : `Welcome, ${name}. Your bankable feasibility report is ready to generate.`}
      </div>
      <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.borderHover}`,borderRadius:10,padding:"14px",marginBottom:16}}>
        <div style={{fontSize:13,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Your Access Code — save this</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:700,color:PALETTE.accent,letterSpacing:6}}>{genCode}</div>
        <div style={{fontSize:13,color:PALETTE.dim,marginTop:6,lineHeight:1.6}}>Use this code to restore access if you clear your browser data or switch devices.</div>
      </div>
      <button className="glow-btn" onClick={() => { onSuccess && onSuccess(name, email, genCode); onClose(); }}
        style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,cursor:"pointer"}}>
        Generate My Report →
      </button>
    </div>
  );

  if (step==="details") return wrap(
    <>
      {PF.sandbox && (
        <div style={{background:"rgba(200,168,75,.10)",border:`1px solid rgba(200,168,75,.25)`,borderRadius:8,padding:"7px 10px",marginBottom:12,fontSize:14,color:PALETTE.gold}}>
          🔧 Sandbox mode active — no real charge will be made
        </div>
      )}
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0ece0",marginBottom:14}}>Almost done</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Your Name *</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Adriaan van der Merwe"
          style={{width:"100%",padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${name.trim().length>0&&name.trim().length<2?PALETTE.danger:PALETTE.faint}`,borderRadius:8,color:PALETTE.text,fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
        {name.trim().length>0&&name.trim().length<2 && <div style={{fontSize:13,color:PALETTE.danger,marginTop:3}}>Name must be at least 2 characters</div>}
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Email (for receipt)</div>
        <input value={email} onChange={e=>{setEmail(e.target.value);setEmailErr(false);}}
          onBlur={()=>setEmailErr(email.length>0&&!validEmail(email))}
          placeholder="you@email.com" type="email"
          style={{width:"100%",padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${emailErr?PALETTE.danger:PALETTE.faint}`,borderRadius:8,color:PALETTE.text,fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
        {emailErr && <div style={{fontSize:13,color:PALETTE.danger,marginTop:3}}>Enter a valid email address</div>}
      </div>
      <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px 12px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:20}}>{PAY_METHODS.find(m=>m.id===method)?.icon}</span>
        <div>
          <div style={{fontSize:16,color:PALETTE.text,fontWeight:500}}>{PAY_METHODS.find(m=>m.id===method)?.label}</div>
          <div style={{fontSize:14,color:PALETTE.muted}}>Secured by PayFast · 80,000+ SA merchants · 3D Secure</div>
        </div>
      </div>
      <button disabled={!canPay}
        onClick={() => {
          if (PF.sandbox) {
            setStep("done");
          } else {
            window.location.href = buildPFUrl(name, email, region);
          }
        }}
        className={canPay?"glow-btn":""}
        style={{width:"100%",padding:"13px",background:canPay?PALETTE.gold:PALETTE.faint,color:canPay?PALETTE.bg:PALETTE.muted,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,cursor:canPay?"pointer":"default",transition:"all .2s"}}>
        Pay R 147.95 →
      </button>
      <button onClick={()=>setStep("methods")} style={{width:"100%",marginTop:8,padding:"8px",background:"none",color:PALETTE.muted,border:"none",fontSize:15,cursor:"pointer"}}>← Back</button>
    </>
  );

  if (step==="methods") return wrap(
    <>
      <div style={{background:PALETTE.surface,padding:"20px 20px 16px",borderBottom:`1px solid ${PALETTE.faint}`,margin:"-24px -24px 16px"}}>
        <div style={{fontSize:14,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>Agrimodel Pro</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#f0ece0"}}>Choose how to pay</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:PALETTE.gold,marginTop:8}}>
          R 147.95 <span style={{fontSize:16,fontFamily:"monospace",color:PALETTE.muted,fontWeight:400}}>once-off · bankable AI report</span>
        </div>
      </div>
      {PAY_METHODS.map(m=>(
        <button key={m.id} onClick={()=>{setMethod(m.id);setStep("details");}}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px",background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:10,marginBottom:8,cursor:"pointer",textAlign:"left",transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=PALETTE.borderHover}
          onMouseLeave={e=>e.currentTarget.style.borderColor=PALETTE.faint}>
          <span style={{fontSize:22}}>{m.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:16,color:PALETTE.text,fontWeight:500}}>{m.label}</div>
            <div style={{fontSize:14,color:PALETTE.muted}}>{m.sub}</div>
          </div>
          <span style={{color:PALETTE.muted,fontSize:20}}>›</span>
        </button>
      ))}
      <button onClick={onClose} style={{width:"100%",marginTop:4,padding:"9px",background:"none",color:PALETTE.muted,border:"none",fontSize:15,cursor:"pointer"}}>Keep exploring for free</button>
      <div style={{fontSize:13,color:PALETTE.dim,textAlign:"center",marginTop:10,lineHeight:1.6}}>
        🔒 Powered by PayFast · Card · EFT · SnapScan · Zapper · PayShap
      </div>
    </>
  );

  // PITCH
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div className="fade-in" style={W}>
        <div style={{background:"linear-gradient(135deg,#111811,#1a2414)",padding:"24px 24px 20px",borderBottom:`1px solid ${PALETTE.faint}`}}>
          <div style={{fontSize:14,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>
            Agrimodel Pro · {prov.name || "SA"} Feasibility Report
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,color:"#f0ece0",lineHeight:1.3}}>
            Get your bankable<br/>AI feasibility report
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:PALETTE.gold,marginTop:12}}>
            R 147.95 <span style={{fontSize:16,fontFamily:"monospace",color:PALETTE.muted,fontWeight:400}}>once-off · full platform access</span>
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          {[
            "✓ 9-section bankable AI feasibility report (ready in 30s)",
            "✓ Cashflow · capital structure · sensitivity analysis",
            "✓ Risk assessment · market outlook · breed ranking",
            "✓ All 9 SA provinces · every commercial breed",
          ].map((txt,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <span style={{fontSize:15,color:PALETTE.text,lineHeight:1.5}}>{txt}</span>
            </div>
          ))}
          <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px 12px",margin:"12px 0",fontSize:15,color:PALETTE.muted,lineHeight:1.7}}>
            💡 The map shows 3 teaser numbers. This report is what a senior agricultural consultant would charge R3,000–R5,000 to write. You get it for R 147.95 — and it's ready in 30 seconds.
          </div>
          <button className="glow-btn" onClick={()=>setStep("methods")}
            style={{width:"100%",padding:"14px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px rgba(200,168,75,.3)`,transition:"all .2s"}}>
            Get My Report — R 147.95 →
          </button>
          <button onClick={onClose} style={{width:"100%",marginTop:8,padding:"9px",background:"none",color:PALETTE.muted,border:"none",fontSize:15,cursor:"pointer"}}>Keep exploring the map</button>
        </div>
      </div>
    </div>
  );
}

// ── FREE SUMMARY PDF ──────────────────────────────────────────────────────────
function printSummaryPDF({ prov, result, T, mod, flockSize, carcass, productionSystem, auditResult }) {
  if (!prov || !result) return;
  const fmt  = n => `R ${Math.abs(n).toLocaleString("en-ZA", {minimumFractionDigits:0,maximumFractionDigits:0})}`;
  const pct  = n => `${(n * 100).toFixed(1)}%`;
  const sgn  = n => n >= 0 ? "+" : "−";
  const pc   = result.profitPerEwe >= 0 ? "#1a7a20" : "#c0392b";
  const today = new Date().toLocaleDateString("en-ZA", {year:"numeric",month:"long",day:"numeric"});
  const topSaving = auditResult?.findings?.find(f => (f.annualSaving ?? 0) > 0);
  const unitLabel = T.unit === "hive" ? "kg honey" : "kg carcass";

  const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>Agrimodel Pro — Free Summary · ${prov.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Mono',monospace;background:#fff;color:#1a1a1a;padding:0;}
  .page{padding:28px 32px;max-width:700px;margin:0 auto;}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;border-bottom:2px solid #1a1a1a;padding-bottom:12px;}
  .brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#1a1a1a;}
  .brand-sub{font-size:11px;color:#666;margin-top:3px;letter-spacing:2px;text-transform:uppercase;}
  .hdr-right{text-align:right;font-size:12px;color:#555;line-height:1.6;}
  .sec{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;margin-top:16px;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
  .kpi{border:1.5px solid #ddd;border-radius:7px;padding:11px 6px;text-align:center;}
  .kpi-val{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;}
  .kpi-lbl{font-size:9px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-top:3px;}
  .info{font-size:12px;color:#444;padding:9px 11px;background:#f6f6f6;border-radius:6px;margin-bottom:14px;line-height:1.7;}
  .sav{border:1.5px solid #d4901a;border-radius:8px;padding:12px 14px;margin-bottom:14px;background:#fffbf0;}
  .sav-badge{font-size:10px;color:#a06010;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:5px;}
  .sav-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:3px;}
  .sav-amt{font-size:14px;color:#1a6a20;font-weight:600;margin-bottom:7px;}
  .sav-act{font-size:12px;color:#444;line-height:1.65;}
  .cta{background:#0a0c0a;color:#f0ece0;border-radius:10px;padding:18px 20px;text-align:center;margin-top:6px;}
  .cta-eyebrow{font-size:10px;color:#d4b55a;text-transform:uppercase;letter-spacing:3px;margin-bottom:7px;}
  .cta-title{font-family:'Playfair Display',serif;font-size:19px;font-weight:900;margin-bottom:5px;line-height:1.3;}
  .cta-price{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#d4b55a;margin-bottom:8px;}
  .cta-once{font-size:13px;color:#b8b4a8;font-weight:400;}
  .cta-feats{font-size:11px;color:#b8b4a8;line-height:2;margin-bottom:11px;}
  .cta-url{font-size:15px;color:#7acc3a;font-weight:600;letter-spacing:1px;}
  .footer{margin-top:18px;font-size:10px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:10px;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div>
      <div class="brand">Agrimodel Pro</div>
      <div class="brand-sub">Free Farm Summary</div>
    </div>
    <div class="hdr-right">
      ${mod.emoji} ${T.group.charAt(0).toUpperCase()+T.group.slice(1)} Feasibility<br/>
      ${prov.name} · ${today}
    </div>
  </div>

  <div class="sec">Your operation at a glance</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-val" style="color:${pc}">${sgn(result.profitPerEwe)}${fmt(Math.abs(result.profitPerEwe))}</div>
      <div class="kpi-lbl">Profit / ${T.unit}</div>
    </div>
    <div class="kpi">
      <div class="kpi-val" style="color:${pc}">${pct(result.roi)}</div>
      <div class="kpi-lbl">Annual ROI</div>
    </div>
    <div class="kpi">
      <div class="kpi-val" style="color:#a07820">${result.payback ? (result.payback > 20 ? ">20 yr" : result.payback.toFixed(1)+" yr") : "∞"}</div>
      <div class="kpi-lbl">Payback</div>
    </div>
    <div class="kpi">
      <div class="kpi-val" style="color:#a07820">${fmt(result.capital)}</div>
      <div class="kpi-lbl">Capital req.</div>
    </div>
  </div>

  <div class="info">
    <strong>${flockSize} ${T.units}</strong> &nbsp;·&nbsp; ${prov.name} &nbsp;·&nbsp; ${productionSystem} system
    &nbsp;·&nbsp; Primary: <strong>${prov.breed}</strong>
    &nbsp;·&nbsp; R${carcass} / ${unitLabel}
    ${result.breakeven ? `&nbsp;·&nbsp; Breakeven: <strong>${result.breakeven} ${T.units}</strong>` : ""}
  </div>

  ${topSaving ? `
  <div class="sav">
    <div class="sav-badge">⚡ Top savings opportunity identified</div>
    <div class="sav-title">${topSaving.component}</div>
    <div class="sav-amt">+${fmt(topSaving.annualSaving)} / yr recoverable</div>
    <div class="sav-act">${topSaving.action}</div>
  </div>` : ""}

  <div class="cta">
    <div class="cta-eyebrow">Agrimodel Pro · Full Report</div>
    <div class="cta-title">9-Section Bankable AI<br/>Feasibility Report</div>
    <div class="cta-price">R&nbsp;147.95 <span class="cta-once">once-off · ready in 30s</span></div>
    <div class="cta-feats">
      ✓ Complete 36-month cashflow projection<br/>
      ✓ Capital structure + bank-grade sensitivity analysis<br/>
      ✓ Risk assessment · market outlook · ${T.unit==="hive"?"honey type analysis":"breed ranking"}<br/>
      ✓ Printable — Land Bank &amp; investor ready
    </div>
    <div class="cta-url">agrimodel.co.za</div>
  </div>

  <div class="footer">
    Generated by Agrimodel Pro · agrimodel.co.za · Free summary — indicative only. Full model detail in the paid report.
  </div>
</div>
</body></html>`;

  const w = window.open("", "_blank", "width=794,height=1123");
  if (!w) { alert("Allow pop-ups to export the summary PDF."); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 700);
}

// ── FIELD INPUT ───────────────────────────────────────────────────────────────
const Field = memo(function Field({ label, value, onChange, pre, suf, hint, min=0, max=999999 }) {
  const [raw, setRaw]     = useState(String(value));
  const [focused, setFoc] = useState(false);
  useEffect(()=>{ if(!focused) setRaw(String(value)); }, [value, focused]);
  const commit = useCallback(v => {
    const n = parseFloat(String(v).replace(/[^0-9.]/g,""));
    if (!isNaN(n)) { const c=Math.min(max,Math.max(min,n)); onChange(c); setRaw(String(c)); }
    else setRaw(String(value));
  }, [value, onChange, min, max]);
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7}}>{label}</span>
        {hint && <span style={{fontSize:13,color:PALETTE.dim,fontStyle:"italic"}}>{hint}</span>}
      </div>
      <div style={{display:"flex",border:`1.5px solid ${focused?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,overflow:"hidden",background:PALETTE.bg,transition:"border-color .15s"}}>
        {pre&&<span style={{padding:"7px 9px",background:PALETTE.surface,fontSize:16,color:PALETTE.goldDim,borderRight:`1px solid ${PALETTE.faint}`}}>{pre}</span>}
        <input type="text" inputMode="numeric"
          value={focused?raw:String(value)}
          onChange={e=>{setRaw(e.target.value);const n=parseFloat(e.target.value);if(!isNaN(n))onChange(Math.min(max,Math.max(min,n)));}}
          onFocus={e=>{setFoc(true);e.target.select();}}
          onBlur={e=>{setFoc(false);commit(e.target.value);}}
          style={{flex:1,padding:"7px 9px",background:"transparent",border:"none",color:PALETTE.accent,fontSize:17,fontWeight:600,fontFamily:"'DM Mono',monospace",width:"100%"}}/>
        {suf&&<span style={{padding:"7px 9px",background:PALETTE.surface,fontSize:16,color:PALETTE.goldDim,borderLeft:`1px solid ${PALETTE.faint}`}}>{suf}</span>}
      </div>
    </div>
  );
});

// ── MINI BAR CHART ────────────────────────────────────────────────────────────
function MiniBarChart({ data, height=44 }) {
  const vals = data.map(d=>d.profit);
  const max  = Math.max(...vals.map(Math.abs), 1);
  const hasPositive = vals.some(v=>v>=0);
  const hasNegative = vals.some(v=>v<0);
  const barsH = height - 8; // leave room for month label
  return (
    <div style={{position:"relative"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:barsH,marginTop:4}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
            <div style={{width:"100%",height:Math.max(Math.abs(d.profit/max)*(barsH-4),2),background:d.profit>=0?PALETTE.accent:PALETTE.danger,borderRadius:"2px 2px 0 0",opacity:.85}}/>
          </div>
        ))}
      </div>
      {/* Zero line + month labels */}
      <div style={{display:"flex",alignItems:"center",gap:2,marginTop:1}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <span style={{fontSize:11,color:PALETTE.muted}}>{MONTHS[i][0]}</span>
          </div>
        ))}
      </div>
      {!hasPositive && (
        <div style={{fontSize:13,color:PALETTE.danger,textAlign:"center",marginTop:3}}>
          All months negative — working capital period
        </div>
      )}
    </div>
  );
}

// ── 36-MONTH CASHFLOW CHART ───────────────────────────────────────────────────
function MiniCashflow36({ cf36, ewePurchase }) {
  if (!cf36?.length) return null;
  const W = 360, H = 110;
  const PAD = { l: 2, r: 2, t: 6, b: 16 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const bW = iW / 36;

  const maxAbsP = Math.max(...cf36.map(d => Math.abs(d.profit)), 1);
  const barArea = iH * 0.38;
  const barZeroY = PAD.t + iH * 0.60;

  const cums  = cf36.map(d => d.cum);
  const minC  = Math.min(...cums, -ewePurchase);
  const maxC  = Math.max(...cums, 0);
  const range = maxC - minC || 1;
  const toY   = c => PAD.t + iH * (1 - (c - minC) / range);
  const cumZeroY = toY(0);

  const pts = cf36.map((d, i) => {
    const x = PAD.l + i * bW + bW / 2;
    return `${x.toFixed(1)},${toY(d.cum).toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}}>
      {[13, 25].map(m => {
        const x = PAD.l + (m - 1) * bW + bW / 2;
        return <line key={m} x1={x} y1={PAD.t} x2={x} y2={H - PAD.b}
                     stroke={PALETTE.gold} strokeWidth={0.8} strokeDasharray="2,2" opacity={0.45}/>;
      })}
      {cf36.map((d, i) => {
        const x  = PAD.l + i * bW + 0.5;
        const bH = Math.max((Math.abs(d.profit) / maxAbsP) * barArea, 1.5);
        const y  = d.profit >= 0 ? barZeroY - bH : barZeroY;
        return <rect key={i} x={x} y={y} width={Math.max(bW - 1, 1)} height={bH}
                     fill={d.profit >= 0 ? PALETTE.accent : PALETTE.danger} opacity={0.72} rx={0.7}/>;
      })}
      <line x1={PAD.l} y1={cumZeroY} x2={W - PAD.r} y2={cumZeroY}
            stroke="rgba(255,255,255,0.13)" strokeWidth={0.8} strokeDasharray="3,4}"/>
      <polyline points={pts} fill="none" stroke={PALETTE.gold} strokeWidth={1.5} strokeLinejoin="round"/>
      {cf36.map((d, i) => {
        if (i > 0 && d.cum >= 0 && cf36[i - 1].cum < 0) {
          const x = PAD.l + i * bW + bW / 2;
          return <circle key="pb" cx={x} cy={toY(0)} r={3.5} fill={PALETTE.accent}/>;
        }
        return null;
      })}
      {[1, 13, 24, 25, 36].map(m => {
        const x     = PAD.l + (m - 1) * bW + bW / 2;
        const isKey = m === 13 || m === 25;
        return <text key={m} x={x} y={H - 3} textAnchor="middle" fontSize={isKey ? 7 : 6}
                     fill={isKey ? PALETTE.gold : PALETTE.dim}>{m}</text>;
      })}
    </svg>
  );
}

// ── PDF PRINT ──────────────────────────────────────────────────────────────────
function printReport(report) {
  const { sections, reportData, buyerName, generatedAt, isSandbox } = report;
  const { r, flock, lm, carcass, pp, capital, npv5, be, scaleRows, cfRows, sensRows, firstPositive, revPE, varPE, vm, fa } = reportData;
  const PT = report.terms ?? LIVESTOCK_MODULES.sheep.terms;

  const fmt  = n => `R ${Math.abs(n).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const pct  = n => `${(n * 100).toFixed(1)}%`;
  const sgn  = n => n >= 0 ? "+" : "−";
  const date = new Date(generatedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  const kpis = [
    { l: `${PT.group.charAt(0).toUpperCase()+PT.group.slice(1)} Size`, v: `${flock} ${PT.units}`, c: "#1a5c08" },
    { l: `Profit / ${PT.unit}`, v: `${sgn(pp)}${fmt(pp)}`,             c: pp >= 0 ? "#1a5c08" : "#c0392b" },
    { l: "Breakeven",    v: be ? `${be} ${PT.units}` : "N/A",           c: "#7a5c00" },
    { l: "Capital Req.", v: fmt(capital),                                c: "#7a5c00" },
    { l: "5-Year NPV",   v: `${sgn(npv5)}${fmt(Math.abs(npv5))}`,       c: npv5 >= 0 ? "#1a5c08" : "#c0392b" },
  ];

  const cfTableRows = cfRows.map((row, i) => {
    const prev    = cfRows[i - 1];
    const isFirst = row.cum >= 0 && (prev?.cum ?? -1) < 0;
    const hasRev  = row.rev > 0;
    const rowCls  = hasRev ? "hl-rev" : "";
    return `<tr class="${rowCls}">
      <td style="text-align:right;color:#666;">${row.m}</td>
      <td style="text-align:right;font-weight:${hasRev?700:400};color:${hasRev?"#1a5c08":"#333"};">${row.mo}</td>
      <td style="text-align:right;color:#666;">${row.yr}</td>
      <td style="color:#2d6a4f;">${row.events || "—"}</td>
      <td style="text-align:right;color:${row.rev>0?"#1a5c08":"#aaa"};font-weight:${hasRev?700:400};">${row.rev>0?fmt(row.rev):"—"}</td>
      <td style="text-align:right;color:#c0392b;">${fmt(row.cost)}</td>
      <td style="text-align:right;font-weight:600;color:${row.profit>=0?"#1a5c08":"#c0392b"};">${sgn(row.profit)}${fmt(Math.abs(row.profit))}</td>
      <td style="text-align:right;font-weight:${isFirst?700:400};color:${row.cum>=0?"#1a5c08":"#c0392b"};">${isFirst?"★ ":""}${sgn(row.cum)}${fmt(Math.abs(row.cum))}</td>
    </tr>`;
  }).join("");

  const scaleTableRows = scaleRows.map((row, i) => {
    const isBE    = be && Math.abs(row.n - be) <= 3;
    const isYours = Math.abs(row.n - flock) <= 5;
    const rowCls  = isYours ? "hl-yours" : isBE ? "hl-be" : "";
    return `<tr class="${rowCls}">
      <td style="text-align:right;font-weight:700;">${row.n}${isBE?'<span style="font-size:7pt;color:#1a5c08;"> BE</span>':""}${isYours?'<span style="font-size:7pt;color:#7a5c00;"> ◄ yours</span>':""}</td>
      <td style="text-align:right;color:#1a5c08;font-weight:700;">${fmt(row.rev)}</td>
      <td style="text-align:right;color:${row.pp>=0?"#1a5c08":"#c0392b"};">${sgn(row.pp)}${fmt(Math.abs(row.pp))}</td>
      <td style="text-align:right;font-weight:700;color:${row.fp>=0?"#1a5c08":"#c0392b"};">${sgn(row.fp)}${fmt(Math.abs(row.fp))}</td>
      <td style="text-align:right;font-weight:600;color:${row.roi>0.15?"#1a5c08":row.roi>0?"#7a5c00":"#c0392b"};">${pct(row.roi)}</td>
      <td style="text-align:right;color:#555;">${fmt(row.cap)}</td>
      <td style="text-align:right;"><span style="font-size:7pt;padding:1.5pt 5pt;border-radius:6pt;border:0.75pt solid ${row.ok?"#1a5c08":"#c0392b"};color:${row.ok?"#1a5c08":"#c0392b"};">${row.ok?(row.roi>0.15?"Strong":"Viable"):"Below BE"}</span></td>
    </tr>`;
  }).join("");

  const sensTableRows = sensRows.map((s, i) => `<tr class="${s.pct===0?"hl-base":""}">
    <td style="text-align:right;font-weight:600;color:${s.pct===0?"#7a5c00":s.pct>0?"#1a5c08":"#c0392b"};">${s.pct>0?"+":""}${s.pct}%${s.pct===0?" ★":""}</td>
    <td style="text-align:right;">R${s.adj.toFixed(0)}/kg</td>
    <td style="text-align:right;color:${s.pp>=0?"#1a5c08":"#c0392b"};">${sgn(s.pp)}${fmt(Math.abs(s.pp))}</td>
    <td style="text-align:right;font-weight:700;color:${s.fp>=0?"#1a5c08":"#c0392b"};">${sgn(s.fp)}${fmt(Math.abs(s.fp))}</td>
    <td style="text-align:right;font-weight:600;color:${s.roi>0?"#1a5c08":"#c0392b"};">${pct(s.roi)}</td>
    <td style="text-align:right;color:#7a5c00;">${s.be?s.be+" "+PT.units:"∞"}</td>
  </tr>`).join("");

  const secHtml = sections.map((s, i) => {
    const body = s.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let extra = "";
    if (i === 4) {
      extra = `<div class="tbl-wrap">
        <p class="tbl-title">36-Month Cashflow — ${flock} ${PT.units} · ${lm === "owner" ? "Owner-operated" : "Hired worker"} · R${carcass}/kg</p>
        <table class="cf-table">
          <colgroup>
            <col class="cf-col-mo"><col class="cf-col-month"><col class="cf-col-yr">
            <col class="cf-col-ev"><col class="cf-col-rev"><col class="cf-col-cost">
            <col class="cf-col-pl"><col class="cf-col-cum">
          </colgroup>
          <thead><tr>
            <th>Mo</th><th>Month</th><th>Yr</th>
            <th class="left">Events</th>
            <th>Revenue</th><th>Op. Cost</th><th>P&amp;L</th><th>Cumulative</th>
          </tr></thead>
          <tbody>${cfTableRows}</tbody>
        </table>
        <p class="tbl-note">★ = Cashflow positive · All costs include labour, overhead, feed, health &amp; replacement reserve</p>
      </div>`;
    }
    if (i === 5) {
      const GN = PT.group.charAt(0).toUpperCase()+PT.group.slice(1);
      const UN = PT.unit.charAt(0).toUpperCase()+PT.unit.slice(1);
      extra = `<div class="tbl-wrap">
        <p class="tbl-title">Scale Projection — Fixed costs diluted across ${PT.group} sizes</p>
        <table>
          <thead><tr>
            <th>${GN}</th><th>Annual Rev</th><th>Profit/${UN}</th>
            <th>${GN} Profit</th><th>ROI</th><th>Capital</th><th>Status</th>
          </tr></thead>
          <tbody>${scaleTableRows}</tbody>
        </table>
        <p class="tbl-note">BE = breakeven · ◄ = your ${PT.group} · vs Prime 11.5% (SARB 2025)</p>
      </div>`;
    }
    if (i === 6) {
      const GN2 = PT.group.charAt(0).toUpperCase()+PT.group.slice(1);
      const UN2 = PT.unit.charAt(0).toUpperCase()+PT.unit.slice(1);
      extra = `<div class="tbl-wrap">
        <p class="tbl-title">Sensitivity Analysis — 9 Carcass Price Scenarios at ${flock} ${PT.units}</p>
        <table>
          <thead><tr>
            <th>Scenario</th><th>R/kg</th><th>Profit/${UN2}</th>
            <th>${GN2} Profit</th><th>ROI</th><th>Breakeven</th>
          </tr></thead>
          <tbody>${sensTableRows}</tbody>
        </table>
        <p class="tbl-note">★ = base case (R${carcass}/kg) · All scenarios at ${flock} ${PT.units}</p>
      </div>`;
    }
    return `<div class="section${i === 0 ? " first" : ""}">
      <h2>${i + 1}. ${s.title}</h2>
      <div class="section-body">${body}</div>
      ${extra}
    </div>`;
  }).join("");

  const kpiHtml = kpis.map(k => `
    <div class="kpi-card" style="border-top-color:${k.c};">
      <div class="kpi-val" style="color:${k.c};">${k.v}</div>
      <div class="kpi-lbl">${k.l}</div>
    </div>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="UTF-8"/>
  <title>Agrimodel Pro — Feasibility Report · ${r.name} · ${buyerName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 portrait;
      margin: 20mm 14mm 26mm 14mm;
    }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 10.5pt;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.65;
      orphans: 3;
      widows: 3;
    }

    /* Cover header */
    .report-header { border-bottom: 2.5pt solid #1a5c08; padding-bottom: 11pt; margin-bottom: 0; }
    .hdr-eyebrow { font-size: 7.5pt; color: #1a5c08; letter-spacing: 1.5pt; text-transform: uppercase; margin-bottom: 5pt; font-family: 'Courier New', monospace; }
    .hdr-title   { font-size: 19pt; font-weight: 700; color: #111; line-height: 1.2; }
    .hdr-sub     { font-size: 8.5pt; color: #555; margin-top: 4pt; font-family: 'Courier New', monospace; }

    /* KPI strip */
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5pt; margin-top: 10pt; }
    .kpi-card { border: 0.75pt solid #ddd; border-top-width: 2.5pt; border-radius: 2pt; padding: 6pt 3pt; text-align: center; page-break-inside: avoid; }
    .kpi-val  { font-size: 10pt; font-weight: 700; line-height: 1.2; font-family: Georgia, serif; }
    .kpi-lbl  { font-size: 6pt; text-transform: uppercase; letter-spacing: 0.3pt; color: #666; margin-top: 2pt; font-family: 'Courier New', monospace; }

    /* Sections */
    .section { page-break-before: always; padding-top: 2pt; }
    .section.first { page-break-before: auto; }
    .section h2 {
      font-size: 12.5pt; font-weight: 700; color: #111;
      border-bottom: 2pt solid #1a5c08; padding-bottom: 4pt; margin-bottom: 10pt;
      page-break-after: avoid; font-family: Georgia, 'Times New Roman', serif;
    }
    .section-body {
      font-family: 'Courier New', 'Lucida Console', monospace;
      font-size: 9pt; line-height: 1.8; white-space: pre-wrap;
      word-break: break-word; overflow-wrap: break-word; color: #222;
      max-width: 100%; overflow: hidden;
    }

    /* Tables */
    .tbl-wrap  { margin-top: 11pt; page-break-inside: avoid; }
    .tbl-title { font-size: 8.5pt; font-weight: 700; color: #7a5c00; margin-bottom: 5pt; font-family: Georgia, serif; }
    .tbl-note  { font-size: 7pt; color: #777; margin-top: 3pt; font-family: 'Courier New', monospace; }

    table { border-collapse: collapse; width: 100%; }
    thead { display: table-header-group; }
    tr    { page-break-inside: avoid; }

    th {
      background-color: #1a5c08; color: #fff;
      padding: 4pt 5pt; font-size: 7.5pt; font-weight: 600;
      text-align: right; white-space: nowrap;
      font-family: 'Courier New', monospace;
    }
    th.left { text-align: left; }
    td {
      border: 0.5pt solid #ddd; padding: 2.5pt 4.5pt;
      font-size: 8pt; vertical-align: middle;
      font-family: 'Courier New', monospace;
    }
    tr:nth-child(even) td { background: #f9f9f9; }
    tr.hl-yours td { background: #fffbe6 !important; }
    tr.hl-be    td { background: #f0faf0 !important; }
    tr.hl-base  td { background: #fffbe6 !important; }
    tr.hl-rev   td { background: #f0faf0 !important; }

    /* Cashflow table — fixed-layout to guarantee fit on A4 */
    .cf-table { table-layout: fixed; }
    .cf-table th, .cf-table td { font-size: 7pt; padding: 2pt 3pt; }
    .cf-col-mo    { width: 5%; }
    .cf-col-month { width: 9%; }
    .cf-col-yr    { width: 4%; }
    .cf-col-ev    { width: 22%; text-align: left !important; }
    .cf-col-rev   { width: 14%; }
    .cf-col-cost  { width: 14%; }
    .cf-col-pl    { width: 14%; }
    .cf-col-cum   { width: 15%; }

    /* Sandbox watermark */
    ${isSandbox ? `.sb-mark {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%,-50%) rotate(-35deg);
      font-size: 56pt; font-weight: 900;
      color: rgba(192,57,43,0.06);
      white-space: nowrap; pointer-events: none;
      font-family: Georgia, serif; z-index: 9999;
    }` : ""}

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${isSandbox ? '<div class="sb-mark">SANDBOX DEMO</div>' : ""}

  <div class="report-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10pt;">
      <div style="flex:1;">
        <div class="hdr-eyebrow">Agrimodel Pro · Professional Feasibility Report${isSandbox ? " · SANDBOX — NOT FOR SUBMISSION" : ""}</div>
        <div class="hdr-title">${r.name} — ${r.breed}</div>
        <div class="hdr-sub">Prepared for: <strong>${buyerName}</strong> &nbsp;·&nbsp; ${date}${isSandbox ? ' &nbsp;·&nbsp; <span style="color:#c0392b;font-weight:700;">SANDBOX DEMO</span>' : ""}</div>
      </div>
      <div style="text-align:right;font-family:'Courier New',monospace;font-size:7.5pt;color:#999;flex-shrink:1;min-width:0;white-space:nowrap;">
        <div style="font-size:14pt;line-height:1;margin-bottom:2pt;">🌿</div>
        <div>agrisolvesa.netlify.app</div>
      </div>
    </div>
    <div class="kpi-grid">${kpiHtml}</div>
  </div>

  ${secHtml}

  <div style="margin-top:18pt;padding-top:7pt;border-top:0.5pt solid #ccc;font-size:7pt;color:#aaa;text-align:center;font-family:'Courier New',monospace;">
    Generated by Agrimodel Pro · agrisolvesa.netlify.app · ${date} · Financial benchmarks based on AgriOrbit Apr 2025 carcass prices · For informational purposes only — not financial advice
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Allow pop-ups for this site to save the PDF."); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}

// ── REPORT VIEWER ─────────────────────────────────────────────────────────────
function ReportViewer({ report, onClose }) {
  const [sec, setSec] = useState(0);
  const { sections, reportData, buyerName, generatedAt, isSandbox } = report;
  const { r, flock, lm, carcass, pp, capital, npv5, be, scaleRows, cfRows, sensRows, firstPositive } = reportData;
  const RT = report.terms ?? LIVESTOCK_MODULES.sheep.terms;

  const TITLES = sections.map(s => s.title);

  return (
    <div style={{position:"fixed",inset:0,background:PALETTE.bg,zIndex:9999,overflow:"auto",WebkitOverflowScrolling:"touch",fontFamily:"'DM Mono',monospace"}}>
      {/* Report header */}
      <div style={{background:`linear-gradient(135deg,${PALETTE.surface},#162814)`,borderBottom:`2px solid ${PALETTE.dim}`,padding:"16px 16px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:13,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>
              Agrimodel Pro · Professional Feasibility Report
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#f0ece0"}}>
              {r.name} — {r.breed}
            </div>
            <div style={{fontSize:14,color:PALETTE.muted,marginTop:3}}>
              Prepared for: {buyerName} · {new Date(generatedAt).toLocaleDateString("en-ZA",{year:"numeric",month:"long",day:"numeric"})}
            </div>
            {isSandbox && (
              <div style={{marginTop:5,padding:"3px 10px",background:"rgba(200,168,75,.12)",border:`1px solid rgba(200,168,75,.3)`,borderRadius:6,display:"inline-block",fontSize:13,color:PALETTE.gold,letterSpacing:.5}}>
                🔧 SANDBOX DEMO — Financial data is live · Narrative sections are template-based · Purchase report for full AI analysis
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>printReport(report)} title="Save as PDF — opens print dialog"
              style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:8,padding:"6px 10px",fontSize:15,cursor:"pointer"}}>
              📄 Save PDF
            </button>
            <button onClick={onClose} style={{background:PALETTE.card,border:`1px solid ${PALETTE.dim}`,color:PALETTE.muted,borderRadius:8,padding:"6px 12px",fontSize:15,cursor:"pointer"}}>
              ✕ Close
            </button>
          </div>
        </div>
        {/* KPI band */}
        <div className="report-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:0}}>
          {[
            {l:RT.group.charAt(0).toUpperCase()+RT.group.slice(1), v:`${flock} ${RT.units}`, c:"#f0ece0"},
            {l:`Profit/${RT.unit}`, v:`${SGN(pp)}${ZAR(pp)}`,           c:pp>=0?PALETTE.accent:PALETTE.danger},
            {l:"Breakeven",  v:`${be} ${RT.units}`,                      c:PALETTE.gold},
            {l:"Capital",    v:ZAR(capital),                             c:PALETTE.gold},
            {l:"5-yr NPV",   v:`${SGN(npv5)}${ZAR(Math.abs(npv5))}`,   c:npv5>=0?PALETTE.accent:PALETTE.danger},
          ].map((s,i) => (
            <div key={i} style={{background:"rgba(0,0,0,.35)",borderRadius:"7px 7px 0 0",padding:"8px 6px",textAlign:"center",borderTop:`2px solid ${s.c}44`}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:13,color:PALETTE.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Section tabs */}
        <div style={{display:"flex",gap:2,overflowX:"auto",marginTop:8,paddingBottom:1}}>
          {TITLES.map((t, i) => (
            <button key={i} onClick={() => setSec(i)}
              style={{flexShrink:0,padding:"6px 10px",background:"none",border:"none",borderBottom:sec===i?`2px solid ${PALETTE.accent}`:"2px solid transparent",color:sec===i?PALETTE.accent:PALETTE.muted,fontSize:13,cursor:"pointer",textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",transition:"all .15s"}}>
              {i+1}. {t.split("—")[0].split(":")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Section content */}
      <div style={{padding:"20px 16px",maxWidth:820,margin:"0 auto"}}>
        {sections[sec] && (
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#f0ece0",marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${PALETTE.faint}`}}>
              {sec+1}. {sections[sec].title}
            </div>
            <div style={{fontSize:16,color:PALETTE.text,lineHeight:2.1,whiteSpace:"pre-wrap",marginBottom:24}}>
              {sections[sec].body}
            </div>
          </div>
        )}

        {/* Embedded data tables */}
        {sec === 4 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:16,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              36-Month Cashflow — {flock} {RT.units} · {lm === "owner" ? "Owner-operated" : "Hired worker"} · R{carcass}/kg
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead>
                  <tr style={{background:PALETTE.bg}}>
                    {["Mo","Month","Yr","Events","Revenue","Op. Cost","P&L","Cumulative"].map(h => (
                      <th key={h} style={{padding:"5px 8px",color:PALETTE.muted,textAlign:"right",fontSize:13,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cfRows.map((row, i) => (
                    <tr key={i} style={{background:row.rev>0?"rgba(130,212,72,.05)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                      <td style={{padding:"4px 8px",color:PALETTE.muted,textAlign:"right"}}>{row.m}</td>
                      <td style={{padding:"4px 8px",color:row.rev>0?"#f0ece0":PALETTE.muted,textAlign:"right",fontWeight:row.rev>0?600:400}}>{row.mo}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.muted,textAlign:"right"}}>{row.yr}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.borderHover,fontSize:13,maxWidth:160}}>{row.events || "—"}</td>
                      <td style={{padding:"4px 8px",color:row.rev>0?PALETTE.accent:PALETTE.muted,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:row.rev>0?700:400}}>{row.rev>0?ZAR(row.rev):"—"}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.danger,textAlign:"right"}}>{ZAR(row.cost)}</td>
                      <td style={{padding:"4px 8px",color:row.profit>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{SGN(row.profit)}{ZAR(Math.abs(row.profit))}</td>
                      <td style={{padding:"4px 8px",color:row.cum>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:row.cum>0&&(cfRows[i-1]?.cum??0)<=0?700:400}}>
                        {row.cum>=0&&(cfRows[i-1]?.cum??0)<0 && <span style={{fontSize:13,color:PALETTE.accent,marginRight:3}}>★</span>}
                        {SGN(row.cum)}{ZAR(Math.abs(row.cum))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:13,color:PALETTE.dim,marginTop:6,lineHeight:1.6}}>
              ★ = First revenue month — first lamb sales (Month {firstPositive?.m}, {firstPositive?.mo} Year {firstPositive?.yr})
              · Costs include labour, overhead, feed, health, replacement reserve amortised monthly
            </div>
          </div>
        )}

        {sec === 5 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:16,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              Scale Projection Table — Fixed costs diluted across {RT.group}
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:15}}>
              <thead>
                <tr style={{background:PALETTE.bg}}>
                  {[RT.group.charAt(0).toUpperCase()+RT.group.slice(1),"Annual Rev",`Profit/${RT.unit}`,`${RT.group.charAt(0).toUpperCase()+RT.group.slice(1)} Profit`,"ROI","vs Prime 11.5%","Capital","Status"].map(h => (
                    <th key={h} style={{padding:"6px 8px",color:PALETTE.muted,textAlign:"right",fontSize:13,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scaleRows.map((row, i) => {
                  const isBE    = be && Math.abs(row.n - be) <= 3;
                  const isYours = Math.abs(row.n - flock) <= 5;
                  return (
                    <tr key={i} style={{background:isYours?"rgba(200,168,75,.07)":isBE?"rgba(130,212,72,.05)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:row.ok?"#f0ece0":PALETTE.muted}}>{row.n}</span>
                        {isBE    && <span style={{fontSize:13,color:PALETTE.accent,marginLeft:4}}>BE</span>}
                        {isYours && <span style={{fontSize:13,color:PALETTE.gold,marginLeft:4}}>◄ yours</span>}
                      </td>
                      <td style={{padding:"6px 8px",color:PALETTE.accent,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(row.rev)}</td>
                      <td style={{padding:"6px 8px",color:row.pp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif"}}>{SGN(row.pp)}{ZAR(Math.abs(row.pp))}</td>
                      <td style={{padding:"6px 8px",color:row.fp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{SGN(row.fp)}{ZAR(Math.abs(row.fp))}</td>
                      <td style={{padding:"6px 8px",color:row.roi>0.15?PALETTE.accent:row.roi>0?PALETTE.gold:PALETTE.danger,textAlign:"right",fontWeight:600}}>{PCT(row.roi)}</td>
                      <td style={{padding:"6px 8px",color:row.vsB>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontSize:14}}>{row.vsB>0?"+":""}{PCT(row.vsB)}</td>
                      <td style={{padding:"6px 8px",color:PALETTE.muted,textAlign:"right",fontSize:14}}>{ZAR(row.cap)}</td>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <span style={{fontSize:13,padding:"2px 7px",borderRadius:10,background:PALETTE.surface,border:`1px solid ${row.ok?PALETTE.accent:PALETTE.danger}66`,color:row.ok?PALETTE.accent:PALETTE.danger}}>
                          {row.ok ? (row.roi > 0.15 ? "Strong" : "Viable") : "Below BE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{fontSize:13,color:PALETTE.dim,marginTop:7,lineHeight:1.6}}>
              BE = breakeven flock · ◄ = your current flock · vs Prime = ROI vs SARB prime 11.5% (2025)
              · Capital includes stock purchase + 12 months operating costs
            </div>
          </div>
        )}

        {sec === 6 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:16,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              Sensitivity Analysis — 9 Carcass Price Scenarios at {flock} {RT.units}
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:15}}>
              <thead>
                <tr style={{background:PALETTE.bg}}>
                  {["Scenario",(LIVESTOCK_MODULES[report.livestockType]?.carcassLabel)||"Carcass R/kg",`Profit/${RT.unit}`,"Flock Profit","ROI","Breakeven"].map(h => (
                    <th key={h} style={{padding:"5px 8px",color:PALETTE.muted,textAlign:"right",fontSize:13,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensRows.map((s, i) => (
                  <tr key={i} style={{background:s.pct===0?"rgba(200,168,75,.07)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                    <td style={{padding:"5px 8px",color:s.pct===0?PALETTE.gold:s.pct>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{s.pct>0?"+":""}{s.pct}%{s.pct===0?" ★":""}</td>
                    <td style={{padding:"5px 8px",color:PALETTE.text,textAlign:"right"}}>R{s.adj.toFixed(0)}/kg</td>
                    <td style={{padding:"5px 8px",color:s.pp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif"}}>{SGN(s.pp)}{ZAR(Math.abs(s.pp))}</td>
                    <td style={{padding:"5px 8px",color:s.fp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{SGN(s.fp)}{ZAR(Math.abs(s.fp))}</td>
                    <td style={{padding:"5px 8px",color:s.roi>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{PCT(s.roi)}</td>
                    <td style={{padding:"5px 8px",color:PALETTE.gold,textAlign:"right"}}>{s.be || "∞"} {RT.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize:13,color:PALETTE.dim,marginTop:6}}>
              ★ = base scenario (R{carcass}/kg AgriOrbit A2 Apr 2025) · All scenarios at {flock} {RT.units} {lm === "owner" ? "owner-operated" : "hired worker"}
            </div>
          </div>
        )}

        {/* Section navigation */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:16,borderTop:`1px solid ${PALETTE.faint}`}}>
          <button onClick={() => setSec(Math.max(0, sec-1))} disabled={sec===0}
            style={{padding:"9px 16px",background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:8,color:sec===0?PALETTE.faint:PALETTE.muted,fontSize:15,cursor:sec===0?"default":"pointer"}}>
            ← Previous
          </button>
          <span style={{fontSize:14,color:PALETTE.dim,alignSelf:"center"}}>Section {sec+1} of {sections.length}</span>
          {sec < sections.length - 1
            ? <button onClick={() => setSec(sec+1)} style={{padding:"9px 16px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer"}}>Next →</button>
            : <button onClick={onClose} style={{padding:"9px 16px",background:PALETTE.faint,color:PALETTE.muted,border:"none",borderRadius:8,fontSize:15,cursor:"pointer"}}>Close Report</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── REPORT LOADING SCREEN ─────────────────────────────────────────────────────
function ReportLoading({ provName, emoji = "🐑" }) {
  const steps = [
    `Analysing ${provName} regional data...`,
    "Calculating 36-month cashflow model...",
    "Writing executive summary...",
    "Building scale & breakeven analysis...",
    "Drafting risk analysis...",
    "Structuring capital & financing section...",
    "Writing implementation roadmap...",
    "Formatting for Land Bank submission...",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"#080f06",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Mono',monospace"}}>
      <div className="map-loading" style={{fontSize:52,marginBottom:20}}>{emoji}</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0ece0",marginBottom:8,textAlign:"center"}}>
        Generating Your Report
      </div>
      <div style={{fontSize:14,color:PALETTE.muted,marginBottom:8,textAlign:"center",lineHeight:1.8,minHeight:40}}>
        {steps[step]}
      </div>
      <div style={{width:"min(240px,80vw)",height:3,background:PALETTE.faint,borderRadius:2,overflow:"hidden",marginBottom:8}}>
        <div className="loading-bar" style={{height:"100%",background:PALETTE.accent,borderRadius:2,width:"35%"}}/>
      </div>
      <div style={{fontSize:13,color:PALETTE.dim,textAlign:"center"}}>
        Senior agricultural consultant AI · 9 sections · typically 25–40 seconds
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  const bg  = type === "error" ? PALETTE.dangerBg  : type === "warn" ? "rgba(212,181,90,.12)" : "rgba(122,204,58,.10)";
  const bdr = type === "error" ? PALETTE.danger     : type === "warn" ? PALETTE.gold           : PALETTE.accent;
  const ico = type === "error" ? "⚠" : type === "warn" ? "💡" : "✓";
  return (
    <div className="fade-in" style={{position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",background:bg,border:`1px solid ${bdr}`,borderRadius:10,padding:"10px 18px",zIndex:10001,fontSize:15,color:PALETTE.text,boxShadow:"0 4px 24px rgba(0,0,0,.55)",maxWidth:"calc(100vw - 32px)",pointerEvents:"none",display:"flex",alignItems:"center",gap:8}}>
      <span style={{color:bdr,fontWeight:700}}>{ico}</span>{msg}
    </div>
  );
}

// ── ADVISOR WIZARD ───────────────────────────────────────────────────────────
function AdvisorWizard({
  prov, result, carryingCapacity, dataCompleteness,
  flockSize, setFlockSize, landHa, setLandHa,
  feedOverride, setFeedOverride, healthOverride, setHealthOverride,
  bondMonthly, setBondMonthly, setBondTouched,
  productionSystem, setProductionSystem,
  marketChannel, setMarketChannel, feedSource, setFeedSource,
  terms, onClose,
}) {
  const T = terms ?? LIVESTOCK_MODULES.sheep.terms;
  const [stepIdx,    setStepIdx]    = useState(0);
  const [completed,  setCompleted]  = useState(false);

  const STEPS = [
    {
      id:"flock",
      icon: T.unit==="hive" ? "🐝" : T.unit==="cow" ? "🐄" : "🐑",
      title: T.group.charAt(0).toUpperCase()+T.group.slice(1)+" size",
      question:`How many ${T.units} are you planning to run on your ${prov?.name || ""} farm?`,
      why: result?.breakeven
        ? `Your breakeven is ${result.breakeven} ${T.units}. Every ${T.unit} above that earns pure margin — every ${T.unit} below subsidises fixed costs from your own pocket.`
        : `${T.group.charAt(0).toUpperCase()+T.group.slice(1)} size is the single biggest lever in your model. Fixed costs dilute across every ${T.unit} — scale is the primary route to profitability.`,
      insight: result
        ? (flockSize < result.breakeven
          ? `⚠  ${flockSize} ${T.units} is below breakeven (${result.breakeven}). You need ${result.breakeven - flockSize} more ${T.units} to cover fixed costs.`
          : `✓  ${flockSize} ${T.units} — ${flockSize - result.breakeven} above breakeven, earning ${ZAR(Math.round(result.profitPerEwe * flockSize))}/yr`)
        : null,
      insightColor: result ? (flockSize < result.breakeven ? PALETTE.danger : PALETTE.accent) : PALETTE.muted,
      renderInput: () => (
        <Field label={`${T.group.charAt(0).toUpperCase()+T.group.slice(1)} Size`} value={flockSize} onChange={setFlockSize}
          suf={T.units} hint={result?.breakeven ? `MVO = ${result.breakeven}` : T.units} min={1} max={10000}/>
      ),
    },
    {
      id:"land", icon:"🗺", title:"Farm size",
      question:"How many hectares do you farm?",
      why: T.unit === "hive"
        ? "Without land area I can't check if your apiary is overstocked — too many hives on limited forage cuts per-hive yields sharply. I'll calculate the hive density and flag any overload."
        : "Without land area I can't check if your flock is overstocking the veld — the #1 cause of long-term farm degradation in SA. I'll calculate carrying capacity and flag any overload.",
      insight: landHa && carryingCapacity !== null
        ? (flockSize > carryingCapacity
          ? `⚠  ${landHa} ha at ${productionSystem} carries ${carryingCapacity} ${T.units} max — you're ${flockSize - carryingCapacity} ${T.units} over capacity`
          : `✓  ${landHa} ha carries up to ${carryingCapacity} ${T.units} — your ${T.group} is at ${Math.round((flockSize / carryingCapacity) * 100)}% capacity`)
        : "Enter your farm size to unlock the carrying capacity check",
      insightColor: landHa && carryingCapacity !== null ? (flockSize > carryingCapacity ? PALETTE.danger : PALETTE.accent) : PALETTE.muted,
      renderInput: () => (
        <Field label="Farm Size" value={landHa ?? ""} onChange={v => setLandHa(v > 0 ? v : null)}
          suf="ha" hint={carryingCapacity !== null ? `cap. ${carryingCapacity} ${T.units}` : "enter to check"} min={0} max={100000}/>
      ),
    },
    {
      id:"system", icon:"🏡", title:"Production system",
      question: T.unit === "hive"
        ? "How are your hives managed — migratory, fixed apiaries, or commercial scale?"
        : "How do you run your operation — extensive veld, supplemented, or intensive?",
      why: T.unit === "hive"
        ? "This sets the hive density benchmark. Commercial Western Cape apiaries run 8+ hives/ha; migratory beekeepers follow bloom cycles and can manage far more at lower fixed cost."
        : "This recalibrates carrying capacity, feed cost benchmarks, and every inefficiency finding. Getting it right changes the entire model calibration for your province.",
      insight: (T.unit === "hive" ? {
        extensive:     "Migratory: low fixed cost, follow the bloom. Standard for most SA commercial beekeepers — Limpopo bushveld to Cape fynbos.",
        semiIntensive: "Fixed apiaries + supplemental feeding: balanced approach. Most common for full-time beekeepers with reliable year-round forage.",
        intensive:     "Commercial scale: high-density managed apiaries, pollination contracts. Highest income potential — requires active colony management.",
      } : {
        extensive:     "Extensive: natural veld only — lowest input cost, lowest stocking density. Standard for most SA farms.",
        semiIntensive: "Semi-intensive: supplemented grazing — balanced input/output, the most common commercial system in SA.",
        intensive:     "Intensive: feedlot or irrigated pasture — highest input cost but maximum stocking. Suits peri-urban or high-value markets.",
      })[productionSystem] || "",
      insightColor: PALETTE.gold,
      renderInput: () => (
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {[
            {id:"extensive",     l:"Extensive",      sub: T.unit==="hive" ? "Migratory / seasonal placement" : "Natural veld only"},
            {id:"semiIntensive", l:"Semi-intensive",  sub: T.unit==="hive" ? "Fixed apiaries + managed forage" : "Supplemented grazing"},
            {id:"intensive",     l:"Intensive",       sub: T.unit==="hive" ? "Commercial honey farm" : "Feedlot / irrigated pasture"},
          ].map(m => (
            <button key={m.id} onClick={() => setProductionSystem(m.id)}
              style={{padding:"11px 14px",background:productionSystem===m.id?PALETTE.borderHover:PALETTE.bg,border:`1.5px solid ${productionSystem===m.id?PALETTE.accent:PALETTE.faint}`,borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              <div style={{fontSize:15,color:productionSystem===m.id?PALETTE.accent:PALETTE.text,fontWeight:productionSystem===m.id?700:400}}>{m.l}</div>
              <div style={{fontSize:13,color:PALETTE.dim,marginTop:1}}>{m.sub}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id:"market", icon:"🏪", title:"Market channel",
      question: T.unit === "hive"
        ? "How do you currently sell your honey and hive products?"
        : "Where do you currently sell your animals?",
      why: T.unit === "hive"
        ? "Retail honey at R90–150/kg vs R40–60/kg wholesale. Direct sales and farm stalls are the single fastest margin multiplier in beekeeping — no extra input cost required."
        : "Direct sales earn 15–25% more than auction. That's often the single fastest margin improvement available — no capital needed, no extra labour required.",
      insight: (T.unit === "hive" ? {
        auction:  `Wholesale/bulk: easiest but lowest margin. Premium honey buyers pay R70–100/kg. A beekeepers co-op negotiates significantly better rates than selling independently.`,
        abattoir: `Health stores and retailers: solid middle ground. Farm stalls and online channels add 30–50% margin above bulk wholesale prices.`,
        direct:   `Direct + pollination: the best margin model. Retail honey at R90–150/kg plus pollination at R700–1,200/hive/visit. ${result ? `At current yields ~${ZAR(Math.round(result.totalRevPerEwe * 0.30))}/hive above wholesale.` : ""}`,
      } : {
        auction:  `Auction is convenient but the lowest-margin option. Direct relationships typically add R${result ? Math.round(result.totalRevPerEwe * 0.15) : 200}–${result ? Math.round(result.totalRevPerEwe * 0.25) : 350}/${T.unit} over auction prices.`,
        abattoir: "Abattoir: solid commercial baseline. Consider joining a buying group or co-op — they negotiate as a block and consistently earn better rates.",
        direct:   `Direct: excellent. Building a buyer network takes effort but locks in the best long-term margins. ${result ? `That's ~${ZAR(Math.round(result.totalRevPerEwe * 0.20))}/${T.unit} above auction.` : ""}`,
      })[marketChannel] || "",
      insightColor: marketChannel === "direct" ? PALETTE.accent : marketChannel === "abattoir" ? PALETTE.gold : PALETTE.muted,
      renderInput: () => (
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {(T.unit === "hive" ? [
            {id:"auction",  l:"Wholesale",             sub:"Co-op / bulk buyer — lowest margin"},
            {id:"abattoir", l:"Retail",                sub:"Health stores / farm stalls"},
            {id:"direct",   l:"Direct + Pollination",   sub:"+40–60% over wholesale"},
          ] : [
            {id:"auction",  l:"Auction",      sub:"Standard — lowest margin"},
            {id:"abattoir", l:"Abattoir",      sub:"Commercial standard"},
            {id:"direct",   l:"Direct sale",   sub:"+15–25% over auction prices"},
          ]).map(m => (
            <button key={m.id} onClick={() => setMarketChannel(m.id)}
              style={{padding:"11px 14px",background:marketChannel===m.id?PALETTE.borderHover:PALETTE.bg,border:`1.5px solid ${marketChannel===m.id?PALETTE.accent:PALETTE.faint}`,borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              <div style={{fontSize:15,color:marketChannel===m.id?PALETTE.accent:PALETTE.text,fontWeight:marketChannel===m.id?700:400}}>{m.l}</div>
              <div style={{fontSize:13,color:PALETTE.dim,marginTop:1}}>{m.sub}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id:"feedSource", icon:"🌾", title: T.unit === "hive" ? "Feeding strategy" : "Feed source",
      question: T.unit === "hive"
        ? "How do you manage off-season colony feeding?"
        : "Where does most of your feed come from?",
      why: T.unit === "hive"
        ? `Sugar syrup costs R8–13/kg. For ${flockSize} hives in dearth periods that's R${Math.round(flockSize * (prov?.feed || 150) * 0.5).toLocaleString()}/yr minimum — positioning near reliable forage eliminates this entirely.`
        : `Home-grown feed cuts costs 30–45%. For ${flockSize} ${T.units} that's potentially ${ZAR(Math.round(flockSize * (prov?.feed || 500) * 0.35))}/yr saved — often the largest single saving on any SA farm.`,
      insight: (T.unit === "hive" ? {
        purchased: `Purchased syrup at ~${ZAR(prov?.feed || 150)}/hive/yr is the most expensive option. Site selection near diverse forage halves or eliminates this cost.`,
        mixed:     `Mixed: sensible balance. Every hive you can run without supplemental feeding saves ~${ZAR(prov?.feed || 150)}/yr in syrup cost.`,
        homeGrown: `Natural forage only: the lowest-input model. Ensure apiaries are near year-round forage or plan migratory moves to follow the bloom.`,
      } : {
        purchased: `Purchased feed at ~${ZAR(prov?.feed || 500)}/${T.unit}/yr is the highest-cost option. Even shifting 30% to home-grown saves ~${ZAR(Math.round(flockSize * (prov?.feed || 500) * 0.30))}/yr.`,
        mixed:     `Mixed: a sensible balance. Every additional 10% shift home-grown saves ~${ZAR(Math.round(flockSize * (prov?.feed || 500) * 0.10))}/yr.`,
        homeGrown: `Home-grown: the #1 cost-reduction lever in SA ${T.group} farming. Monitor nutritional quality — deficiencies cost more in vet bills than the feed saving is worth.`,
      })[feedSource] || "",
      insightColor: feedSource === "homeGrown" ? PALETTE.accent : feedSource === "mixed" ? PALETTE.gold : PALETTE.muted,
      renderInput: () => (
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {(T.unit === "hive" ? [
            {id:"purchased", l:"Purchased",     sub:"Sugar syrup / pollen supplement"},
            {id:"mixed",     l:"Mixed",          sub:"Forage + supplemental feeding"},
            {id:"homeGrown", l:"Natural forage", sub:"No supplemental feeding — lowest cost"},
          ] : [
            {id:"purchased", l:"Purchased",   sub:"Retail / feed agent — full input cost"},
            {id:"mixed",     l:"Mixed",        sub:"Some home-grown forage"},
            {id:"homeGrown", l:"Home-grown",   sub:"Own forage / crop residue — best margin"},
          ]).map(m => (
            <button key={m.id} onClick={() => setFeedSource(m.id)}
              style={{padding:"11px 14px",background:feedSource===m.id?PALETTE.borderHover:PALETTE.bg,border:`1.5px solid ${feedSource===m.id?PALETTE.accent:PALETTE.faint}`,borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              <div style={{fontSize:15,color:feedSource===m.id?PALETTE.accent:PALETTE.text,fontWeight:feedSource===m.id?700:400}}>{m.l}</div>
              <div style={{fontSize:13,color:PALETTE.dim,marginTop:1}}>{m.sub}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id:"feedCost", icon:"💰", title: T.unit === "hive" ? "Actual feeding cost" : "Actual feed cost",
      question: T.unit === "hive"
        ? `What do you actually spend on sugar syrup and supplements — per hive, per year?`
        : `What do you actually pay for feed — per ${T.unit}, per year?`,
      why: T.unit === "hive"
        ? `Province default is ${ZAR(prov?.feed || 150)}/hive/yr for supplemental feeding. Your actual spend calibrates every cost-saving calculation to your operation.`
        : `Province default is ${ZAR(prov?.feed || 500)}/${T.unit}/yr. Real costs vary 20–40% depending on drought supplementation, pasture quality, and buying method. Your actual figure makes every savings calculation specific to your farm.`,
      insight: feedOverride !== null
        ? (feedOverride < (prov?.feed || 500)
          ? `✓  ${ZAR(feedOverride)}/${T.unit} — ${ZAR((prov?.feed || 500) - feedOverride)} below benchmark. Saving ${ZAR(Math.round(((prov?.feed || 500) - feedOverride) * flockSize))}/yr vs province average.`
          : feedOverride > (prov?.feed || 500)
          ? `⚠  ${ZAR(feedOverride)}/${T.unit} — ${ZAR(feedOverride - (prov?.feed || 500))} above benchmark. ${T.unit === "hive" ? "Consider strategic hive placement near forage-rich sites to reduce supplemental feeding." : "Investigate bulk-buying or growing your own to close this gap."}`
          : T.unit === "hive" ? "Feeding cost matches the province benchmark." : "Feed cost matches the province benchmark exactly.")
        : `Province default: ${ZAR(prov?.feed || 500)}/${T.unit}/yr. Enter your actual spend to calibrate the model.`,
      insightColor: feedOverride !== null
        ? (feedOverride < (prov?.feed || 500) ? PALETTE.accent : feedOverride > (prov?.feed || 500) ? PALETTE.danger : PALETTE.muted)
        : PALETTE.muted,
      renderInput: () => (
        <Field label={T.unit === "hive" ? `Supplement cost / hive / year` : `Feed cost / ${T.unit} / year`} value={feedOverride !== null ? feedOverride : (prov?.feed || 500)}
          onChange={v => setFeedOverride(v)} pre="R" hint={`Benchmark: ${ZAR(prov?.feed || 500)}`} min={0} max={10000}/>
      ),
    },
    {
      id:"healthCost", icon: T.unit === "hive" ? "🐝" : "💊", title: T.unit === "hive" ? "Hive health costs" : "Vet & medicine costs",
      question: T.unit === "hive"
        ? `What do you spend on Varroa treatments, medications, and hive maintenance per hive per year?`
        : `What do you spend on vet fees and medicines per ${T.unit} per year?`,
      why: T.unit === "hive"
        ? `${prov?.name || "SA"} benchmark is ${ZAR(prov?.health || 150)}/hive/yr for Varroa treatment and hive health. Your actual spend shows whether your protocol is cost-efficient or whether there's a saving available.`
        : `${prov?.name || "SA"} benchmark is ${ZAR(prov?.health || 180)}/${T.unit}/yr. Costs range from ${ZAR(100)} (Northern Cape) to ${ZAR(300)}+ (KZN). Your actual spend reveals whether your protocol is cost-efficient or whether there's a real savings opportunity.`,
      insight: healthOverride !== null
        ? (healthOverride < (prov?.health || 180)
          ? `✓  ${ZAR(healthOverride)}/${T.unit} — well managed. ${ZAR(Math.round(((prov?.health || 180) - healthOverride) * flockSize))}/yr below the total benchmark.`
          : healthOverride > (prov?.health || 180)
          ? `⚠  ${ZAR(healthOverride)}/${T.unit} — ${ZAR(healthOverride - (prov?.health || 180))} above benchmark. ${T.unit === "hive" ? "Review Varroa treatment frequency, consider oxalic acid vaporisation, and check queen replacement rates." : "Review vaccination scheduling, bulk drug purchasing, and whether a production-vet visit reduces reactive treatments."}`
          : T.unit === "hive" ? "Hive health costs match the province benchmark." : "Vet costs match the province benchmark.")
        : `Province default: ${ZAR(prov?.health || 180)}/${T.unit}/yr. Enter your actual spend.`,
      insightColor: healthOverride !== null
        ? (healthOverride < (prov?.health || 180) ? PALETTE.accent : healthOverride > (prov?.health || 180) ? PALETTE.danger : PALETTE.muted)
        : PALETTE.muted,
      renderInput: () => (
        <Field label={T.unit === "hive" ? `Hive health / hive / year` : `Meds + vet / ${T.unit} / year`} value={healthOverride !== null ? healthOverride : (prov?.health || 180)}
          onChange={v => setHealthOverride(v)} pre="R" hint={`Benchmark: ${ZAR(prov?.health || 180)}`} min={0} max={5000}/>
      ),
    },
    {
      id:"bond", icon:"🏦", title:"Finance & bond",
      question:"Do you have any monthly bond repayments or farm finance instalments?",
      why:"Finance costs are the most commonly omitted line in farm models. Leaving out a bond overstates your profit by exactly that amount every month — and produces incorrect Land Bank feasibility figures.",
      insight: bondMonthly > 0
        ? `Bond of ${ZAR(bondMonthly)}/mo = ${ZAR(bondMonthly * 12)}/yr — that's ${ZAR(Math.round(bondMonthly * 12 / flockSize))}/${T.unit}/yr impact on margin.`
        : "No bond entered. If you carry finance, add it now — or enter 0 to confirm the operation is unencumbered.",
      insightColor: bondMonthly > 0 ? PALETTE.gold : PALETTE.dim,
      renderInput: () => (
        <Field label="Bond / finance repayment" value={bondMonthly || ""} onChange={v => setBondMonthly(v || 0)}
          pre="R" suf="/mo" hint="Monthly instalment" min={0} max={500000}/>
      ),
    },
  ];

  const step   = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const next   = () => { if (isLast) { setBondTouched(true); setCompleted(true); } else setStepIdx(s => s + 1); };

  if (completed) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="slide-up" style={{background:PALETTE.surface,border:`1px solid ${PALETTE.borderHover}`,borderRadius:16,padding:"28px 20px",maxWidth:"min(400px, calc(100vw - 32px))",width:"100%",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:10}}>🎉</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,color:"#f0ece0",marginBottom:6}}>Model Complete!</div>
        <div style={{fontSize:15,color:PALETTE.muted,lineHeight:1.8,marginBottom:14}}>
          Your confidence is now <strong style={{color:PALETTE.accent}}>{dataCompleteness}%</strong>. Every number is calibrated to your specific farm — this is your real feasibility picture.
        </div>
        {result && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[
              {l:`Profit / ${T.unit}`, v:`${SGN(result.profitPerEwe)}${ZAR(result.profitPerEwe)}`,         c:result.profitPerEwe>=0?PALETTE.accent:PALETTE.danger},
              {l:"Annual ROI",        v:PCT(result.roi),                                                   c:result.roi>=0?PALETTE.accent:PALETTE.danger},
              {l:`${T.group.charAt(0).toUpperCase()+T.group.slice(1)} Profit/yr`, v:`${SGN(result.flockProfit)}${ZAR(Math.abs(result.flockProfit))}`, c:result.flockProfit>=0?PALETTE.accent:PALETTE.danger},
              {l:"Capital Needed",  v:ZAR(result.capital),                                                c:PALETTE.gold},
            ].map((s,i)=>(
              <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"9px 8px",textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.4,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
        <button className="glow-btn" onClick={onClose}
          style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px rgba(200,168,75,.3)`}}>
          View Full Analysis →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:9000,display:"flex",alignItems:"flex-end"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="slide-up" style={{width:"100%",background:PALETTE.surface,borderRadius:"18px 18px 0 0",border:`1px solid ${PALETTE.faint}`,borderBottom:"none",maxHeight:"90vh",overflow:"auto",WebkitOverflowScrolling:"touch"}}>

        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}>
          <div style={{width:40,height:4,background:PALETTE.border,borderRadius:2}}/>
        </div>

        {/* Header */}
        <div style={{padding:"6px 18px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>{step.icon}</span>
            <div>
              <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8}}>Step {stepIdx+1} of {STEPS.length} · Farm Advisor</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#f0ece0"}}>{step.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:7,padding:"5px 10px",fontSize:14,cursor:"pointer"}}>✕</button>
        </div>

        {/* Confidence + step dots */}
        <div style={{padding:"0 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontSize:13,color:PALETTE.muted}}>Farm Model Confidence</span>
            <span style={{fontSize:14,fontWeight:700,color:dataCompleteness>=70?PALETTE.accent:PALETTE.gold}}>{dataCompleteness}%</span>
          </div>
          <div style={{height:7,background:PALETTE.faint,borderRadius:4,overflow:"hidden",marginBottom:7}}>
            <div style={{height:"100%",width:`${dataCompleteness}%`,background:dataCompleteness>=70?PALETTE.accent:dataCompleteness>=50?PALETTE.gold:PALETTE.danger,borderRadius:4,transition:"width .6s ease"}}/>
          </div>
          <div style={{display:"flex",gap:3}}>
            {STEPS.map((_,i) => (
              <button key={i} onClick={() => setStepIdx(i)} title={STEPS[i].title}
                style={{flex:1,height:3,borderRadius:2,border:"none",cursor:"pointer",background:i<stepIdx?PALETTE.accent:i===stepIdx?PALETTE.gold:PALETTE.faint,transition:"background .2s"}}/>
            ))}
          </div>
        </div>

        <div style={{padding:"0 18px 28px"}}>
          {/* Advisor speech bubble */}
          <div style={{background:"rgba(122,204,58,.06)",border:`1px solid rgba(122,204,58,.2)`,borderLeft:`3px solid ${PALETTE.accent}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:13,color:PALETTE.accent,textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>🌿 Agrimodel Advisor</div>
            <div style={{fontSize:15,color:"#c8d8b0",lineHeight:1.8,fontStyle:"italic"}}>{step.question}</div>
          </div>

          {/* Why this matters */}
          <div style={{background:"rgba(200,168,75,.05)",border:`1px solid rgba(200,168,75,.15)`,borderRadius:8,padding:"9px 12px",marginBottom:14}}>
            <span style={{fontSize:13,color:PALETTE.gold,fontWeight:600}}>💡 Why this matters: </span>
            <span style={{fontSize:13,color:"#a89060",lineHeight:1.7}}>{step.why}</span>
          </div>

          {/* Input for this step */}
          {step.renderInput()}

          {/* Live insight */}
          {step.insight && (
            <div style={{marginTop:10,padding:"9px 12px",background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderLeft:`2px solid ${step.insightColor}`,borderRadius:7,fontSize:14,color:step.insightColor,lineHeight:1.7}}>
              {step.insight}
            </div>
          )}

          {/* Navigation */}
          <div style={{display:"flex",gap:8,marginTop:18}}>
            {stepIdx > 0 && (
              <button onClick={() => setStepIdx(s => s - 1)}
                style={{padding:"11px 18px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:9,color:PALETTE.muted,fontSize:15,cursor:"pointer",flexShrink:0}}>
                ← Back
              </button>
            )}
            <button className="glow-btn" onClick={next}
              style={{flex:1,padding:"12px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:9,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px rgba(200,168,75,.3)`}}>
              {isLast ? "Complete Model →" : `Next: ${STEPS[stepIdx + 1]?.title} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

function AgrimodelPro() {
  const [selected,  setSelected]  = useState(null);
  const [hovered,   setHovered]   = useState(null);
  const [showPay,   setShowPay]   = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0=Overview 1=Breeds 2=Model
  const [carcass,   setCarcass]   = useState(87);
  const [flockSize, setFlockSize] = useState(50);
  const [labour,    setLabour]    = useState(1500);
  const [labourMode,setLabourMode]= useState("owner"); // "owner" | "hired"
  // Extra input costs
  const [bondMonthly,     setBondMonthly]     = useState(0);
  const [bondTouched,     setBondTouched]     = useState(false);
  const [feedOverride,    setFeedOverride]    = useState(null); // null = province default
  const [healthOverride,  setHealthOverride]  = useState(null);
  const [fencingMonthly,  setFencingMonthly]  = useState(0);
  const [miscMonthly,     setMiscMonthly]     = useState(0);
  const [showCosts,       setShowCosts]       = useState(false);
  // Inefficiency engine inputs
  const [productionSystem, setProductionSystem] = useState("extensive");
  const [marketChannel,    setMarketChannel]    = useState("auction");
  const [feedSource,       setFeedSource]       = useState("mixed");
  // Land + carrying capacity
  const [landHa, setLandHa] = useState(null);
  // Access
  const [isPaid,       setIsPaid]       = useState(false);
  const [showRestore,  setShowRestore]  = useState(false);
  const [accessCode,   setAccessCode]   = useState("");
  const [toast,        setToast]        = useState(null); // {msg,type}
  const [showAdvisor,  setShowAdvisor]  = useState(false);
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, []);
  // Report state
  const [reportStatus, setReportStatus] = useState(null); // null | "loading" | "ready" | "error"
  const [report,       setReport]       = useState(null);
  const [provGeo,      setProvGeo]      = useState(null);
  const [geoError,     setGeoError]     = useState(false);
  const [mapCollapsed,       setMapCollapsed]       = useState(false);
  const [showLivestockMenu,  setShowLivestockMenu]  = useState(false);
  const [livestockType,      setLivestockType]      = useState("sheep");
  const mod  = LIVESTOCK_MODULES[livestockType] ?? LIVESTOCK_MODULES.sheep;
  const T    = mod.terms;
  const prov = selected ? mod.provinceData[selected] : null;

  // Load accurate province boundaries from GADM 4.1 (authoritative SA demarcation data)
  useEffect(() => {
    const GADM_URL = "/sa-provinces.json";
    fetch(GADM_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setProvGeo)
      .catch(err => {
        console.warn("Province boundaries unavailable:", err);
        setGeoError(true);
      });
  }, []);

  const styleProvince = useCallback((feature) => {
    const id = PROV_NAME_MAP[feature.properties.NAME_1] || "";
    const pd = mod.provinceData[id];
    if (!pd) return { fillOpacity: 0, opacity: 0, weight: 0 };
    return {
      fillColor:   pd.fill,
      fillOpacity: selected === id ? 0.80 : 0.38,
      color:       selected === id ? "#ffffff" : "rgba(255,255,255,0.5)",
      weight:      selected === id ? 2.2 : 0.8,
      opacity:     selected === id ? 0.9 : 0.55,
    };
  }, [selected, mod]);

  const onEachProvince = useCallback((feature, layer) => {
    const id = PROV_NAME_MAP[feature.properties.NAME_1] || "";
    const pd = mod.provinceData[id];
    if (!pd) return;
    layer.on({
      click: () => setSelected(prev => prev === id ? null : id),
      mouseover: (e) => {
        setHovered(id);
        if (id !== selected) e.target.setStyle({ fillOpacity: 0.62, weight: 1.4 });
      },
      mouseout: (e) => {
        setHovered(null);
        if (id !== selected) e.target.setStyle({ fillOpacity: 0.38, weight: 0.8 });
      },
    });
    layer.bindTooltip(pd.name, { className: "prov-tip", sticky: true, direction: "center" });
  }, [selected, mod]);

  const handlePaySuccess = useCallback((buyerName, buyerEmail, code) => {
    const finalCode = code || Math.random().toString(36).slice(2,8).toUpperCase();
    setIsPaid(true);
    setAccessCode(finalCode);
    try {
      const existing = JSON.parse(localStorage.getItem("agri_session") || "{}");
      localStorage.setItem("agri_session", JSON.stringify({
        ...existing, paid:true, name:buyerName, email:buyerEmail, paidAt:Date.now(), accessCode:finalCode
      }));
    } catch {}
    setShowPay(false);
    showToast("Access unlocked — building your report…", "success");
    setReportStatus("loading");
    try {
      const rd = buildReportData(mod.provinceData[selected || "limpopo"], flockSize, labourMode, carcass);
      const r  = generateProReport(rd, buyerName || "Valued Client", T);
      setReport({ ...r, buyerEmail, terms: T, livestockType });
      setReportStatus("ready");
    } catch (err) {
      console.error("Report generation failed:", err);
      setReportStatus("error");
    }
  }, [selected, flockSize, carcass, labourMode, mod]);

  // Reset carcass price and flock size when livestock type changes
  useEffect(() => {
    setCarcass(mod.carcassDefault);
    setFlockSize(mod.id === "cattle" ? 20 : 50);
  }, [livestockType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset inputs when province changes — use smart defaults per province
  useEffect(() => {
    if (prov && selected) {
      const def = mod.provinceDefaults[selected] ?? { system:"extensive", market:"auction", feed:"purchased" };
      setFlockSize(Math.max(20, (prov.be ?? 50) + 10));
      setLabour(1500);
      setLabourMode("owner");
      setBondMonthly(0);
      setBondTouched(false);
      setFeedOverride(null);
      setHealthOverride(null);
      setFencingMonthly(0);
      setMiscMonthly(0);
      setShowCosts(false);
      setLandHa(null);
      setProductionSystem(def.system);
      setMarketChannel(def.market);
      setFeedSource(def.feed);
      setActiveTab(0);
    }
  }, [selected]);

  // Restore last province + core inputs from localStorage on first load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("agri_session");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.province && PROVINCE_DATA[s.province]) {
          setSelected(s.province);
          // Delay input restore until after province reset runs
          setTimeout(() => {
            if (s.flockSize) setFlockSize(s.flockSize);
            if (s.carcass)   setCarcass(s.carcass);
            if (s.landHa)    setLandHa(s.landHa);
          }, 50);
        }
        if (s.paid) { setIsPaid(true); setAccessCode(s.accessCode || ""); }
      }
    } catch {}
  }, []);

  // Detect PayFast return redirect — grant access when user lands on /success
  useEffect(() => {
    if (window.location.pathname !== "/success") return;
    try {
      const s = JSON.parse(localStorage.getItem("agri_session") || "{}");
      if (!s.paid) {
        handlePaySuccess(s.name || "Valued Client", s.email || "", s.accessCode || "");
      }
    } catch {}
    window.history.replaceState({}, "", "/");
  }, [handlePaySuccess]);

  // Save province + core inputs to localStorage whenever they change
  useEffect(() => {
    if (!selected) return;
    try {
      const existing = JSON.parse(localStorage.getItem("agri_session") || "{}");
      localStorage.setItem("agri_session", JSON.stringify({
        ...existing, province: selected, flockSize, carcass, landHa
      }));
    } catch {}
  }, [selected, flockSize, carcass, landHa]);

  // Escape — close topmost modal first, then clear province
  useEffect(() => {
    const h = e => {
      if (e.key !== "Escape") return;
      if (reportStatus === "ready" || reportStatus === "error") { setReportStatus(null); return; }
      if (showPay)      { setShowPay(false);      return; }
      if (showRestore)  { setShowRestore(false);   return; }
      if (showAdvisor)  { setShowAdvisor(false);   return; }
      setSelected(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [reportStatus, showPay, showRestore]);

  // Body scroll lock — prevent background page scroll when any overlay is open
  useEffect(() => {
    const anyOpen = showPay || showRestore || showAdvisor || reportStatus === "loading" || reportStatus === "ready" || reportStatus === "error";
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPay, showRestore, reportStatus]);

  const result = useMemo(() => {
    if (!prov) return null;
    const effectiveLabour = labourMode === "owner" ? labour : (prov.hired ?? 5594);
    return mod.calcFn(prov, carcass, flockSize, effectiveLabour, prov.oh ?? 600, {
      bond:           bondMonthly,
      feedOverride:   feedOverride,
      healthOverride: healthOverride,
      fencing:        fencingMonthly,
      misc:           miscMonthly,
    });
  }, [prov, carcass, flockSize, labour, labourMode, bondMonthly, feedOverride, healthOverride, fencingMonthly, miscMonthly, mod]);

  const auditResult = useMemo(() => {
    if (!result || !prov) return null;
    return runInefficiencyAudit(
      { productionSystem, marketChannel, feedSource, flockSize, unit: T.unit },
      { healthCost: result.healthCost, feedCost: result.feedCost, flockRev: result.flockRev }
    );
  }, [result, prov, productionSystem, marketChannel, feedSource, flockSize]);

  const carryingCapacity = useMemo(() => {
    if (!landHa || !selected) return null;
    const unitsPerHa = mod.carryingCapacity[productionSystem]?.[selected] ?? 3;
    return Math.floor(landHa * unitsPerHa);
  }, [landHa, selected, productionSystem, mod]);

  const isOverstocked = carryingCapacity !== null && flockSize > carryingCapacity;
  const overstockPct  = isOverstocked ? Math.round(((flockSize - carryingCapacity) / carryingCapacity) * 100) : 0;

  const dataCompleteness = useMemo(() => {
    const fields = [
      { w:10, v: flockSize > 0 },
      { w:10, v: !!landHa },
      { w:5,  v: true }, // productionSystem always has a value
      { w:5,  v: true }, // marketChannel always has a value
      { w:5,  v: true }, // feedSource always has a value
      { w:8,  v: feedOverride !== null },
      { w:8,  v: healthOverride !== null },
      { w:5,  v: bondTouched || bondMonthly > 0 }, // touched = user confirmed (even 0)
    ];
    const total  = fields.reduce((s, f) => s + f.w, 0);
    const filled = fields.filter(f => f.v).reduce((s, f) => s + f.w, 0);
    return Math.round((filled / total) * 100);
  }, [flockSize, landHa, feedOverride, healthOverride, bondMonthly, bondTouched]);

  const pc = result ? (result.profitPerEwe >= 0 ? PALETTE.accent : PALETTE.danger) : PALETTE.muted;

  // Paid users can regenerate without re-paying
  const regenerateReport = useCallback(() => {
    if (!selected) return;
    let storedName = "Valued Client", storedEmail = "";
    try { const s = JSON.parse(localStorage.getItem("agri_session") || "{}"); storedName = s.name || storedName; storedEmail = s.email || ""; } catch {}
    setReportStatus("loading");
    try {
      const rd = buildReportData(mod.provinceData[selected], flockSize, labourMode, carcass);
      const r  = generateProReport(rd, storedName, T);
      setReport({ ...r, buyerEmail: storedEmail, terms: T, livestockType });
      setReportStatus("ready");
    } catch { setReportStatus("error"); }
  }, [selected, flockSize, labourMode, carcass, mod]);

  return (
    <>
      <style>{CSS}</style>
      {showRestore && <RestoreModal onClose={()=>setShowRestore(false)} onRestore={(code)=>{
        setIsPaid(true);
        setAccessCode(code);
        try {
          const s = JSON.parse(localStorage.getItem("agri_session") || "{}");
          localStorage.setItem("agri_session", JSON.stringify({...s, paid:true, accessCode:code}));
        } catch {}
        showToast("Access restored — welcome back!");
      }}/>}
      {showPay && <PayModal region={selected} onClose={()=>setShowPay(false)} onSuccess={handlePaySuccess}/>}
      {showAdvisor && (
        <AdvisorWizard
          prov={prov} result={result} carryingCapacity={carryingCapacity} dataCompleteness={dataCompleteness}
          flockSize={flockSize} setFlockSize={setFlockSize}
          landHa={landHa} setLandHa={setLandHa}
          feedOverride={feedOverride} setFeedOverride={setFeedOverride}
          healthOverride={healthOverride} setHealthOverride={setHealthOverride}
          bondMonthly={bondMonthly} setBondMonthly={setBondMonthly} setBondTouched={setBondTouched}
          productionSystem={productionSystem} setProductionSystem={setProductionSystem}
          marketChannel={marketChannel} setMarketChannel={setMarketChannel}
          feedSource={feedSource} setFeedSource={setFeedSource}
          terms={T}
          onClose={() => setShowAdvisor(false)}
        />
      )}
      {reportStatus==="loading" && <ReportLoading provName={prov?.name || "SA"} emoji={mod.emoji} />}
      {reportStatus==="ready" && report && <ReportViewer report={report} onClose={()=>setReportStatus(null)} />}
      {reportStatus==="error" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:16,padding:"32px 24px",textAlign:"center",maxWidth:360,width:"100%"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0ece0",marginBottom:8}}>Report Generation Failed</div>
            <div style={{fontSize:15,color:PALETTE.muted,marginBottom:8,lineHeight:1.7}}>The AI could not generate your report. This is usually a temporary API issue.</div>
            <div style={{fontSize:14,color:PALETTE.dim,marginBottom:20,lineHeight:1.6}}>{PF.sandbox ? "Sandbox mode — no charge was made." : "Your payment has been recorded."} Please try again — the report typically generates in 25–40 seconds.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setReportStatus(null)} style={{flex:1,padding:"11px",background:PALETTE.faint,color:PALETTE.muted,border:"none",borderRadius:9,fontSize:16,cursor:"pointer"}}>Dismiss</button>
              <button className="glow-btn" onClick={()=>{setReportStatus(null);setTimeout(()=>setShowPay(true),100);}}
                style={{flex:2,padding:"11px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:9,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,cursor:"pointer"}}>
                Try Again →
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:PALETTE.bg,height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"'DM Mono',monospace",overflow:"hidden"}}>

        {/* ── HEADER ── */}
        <div style={{background:PALETTE.surface,borderBottom:`1px solid ${PALETTE.faint}`,padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,gap:8}}>
          <div style={{position:"relative",flex:1,minWidth:0}}>
            {/* Livestock selector button */}
            <button
              onClick={() => setShowLivestockMenu(m => !m)}
              style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0,maxWidth:"100%",overflow:"hidden"}}
            >
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#f0ece0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {mod.emoji} Agrimodel Pro
              </span>
              <span style={{fontSize:13,color:PALETTE.dim,marginTop:2,flexShrink:0}}>▾</span>
            </button>
            <span className="hdr-sub" style={{fontSize:13,color:PALETTE.dim,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mod.labelPlural} · Breed &amp; Feasibility</span>

            {/* Livestock dropdown */}
            {showLivestockMenu && (
              <div
                style={{position:"absolute",top:"100%",left:0,zIndex:5000,marginTop:6,background:PALETTE.card,border:`1px solid ${PALETTE.border}`,borderRadius:12,overflow:"hidden",minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,.55)"}}
                onMouseLeave={() => setShowLivestockMenu(false)}
              >
                <div style={{padding:"8px 12px 6px",fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.5,borderBottom:`1px solid ${PALETTE.faint}`}}>Select livestock module</div>
                {LIVESTOCK_TYPES.map(lt => {
                  const isCurrent = lt.id === livestockType;
                  return (
                  <button key={lt.id}
                    onClick={() => {
                      setShowLivestockMenu(false);
                      if (lt.status === "active") {
                        if (lt.id !== livestockType) {
                          setLivestockType(lt.id);
                          setCarcass(LIVESTOCK_MODULES[lt.id]?.carcassDefault ?? 52);
                          setSelected(null);
                        }
                      } else {
                        showToast(`${lt.label} module coming soon`, "warn");
                      }
                    }}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:isCurrent?"rgba(122,204,58,.08)":"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:`1px solid ${PALETTE.faint}22`,transition:"background .12s"}}
                    onMouseEnter={e => e.currentTarget.style.background = isCurrent ? "rgba(122,204,58,.12)" : PALETTE.surface}
                    onMouseLeave={e => e.currentTarget.style.background = isCurrent ? "rgba(122,204,58,.08)" : "none"}
                  >
                    <span style={{fontSize:20,flexShrink:0}}>{lt.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,color:lt.status==="active"?PALETTE.accent:PALETTE.text,fontWeight:lt.status==="active"?700:400}}>{lt.label}</div>
                      <div style={{fontSize:13,color:PALETTE.dim}}>{lt.sub}</div>
                    </div>
                    {isCurrent
                      ? <span style={{fontSize:13,padding:"2px 7px",borderRadius:8,background:"rgba(122,204,58,.20)",color:PALETTE.accent,border:`1px solid ${PALETTE.accent}66`,fontWeight:700}}>✓ Active</span>
                      : lt.status === "active"
                        ? <span style={{fontSize:13,padding:"2px 7px",borderRadius:8,background:"rgba(122,204,58,.06)",color:PALETTE.accent,border:`1px solid ${PALETTE.accent}33`}}>Switch</span>
                        : <span style={{fontSize:13,padding:"2px 7px",borderRadius:8,background:PALETTE.surface,color:PALETTE.dim,border:`1px solid ${PALETTE.faint}`}}>Soon</span>
                    }
                  </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {!isPaid && (
              <button onClick={()=>setShowRestore(true)}
                style={{padding:"7px 12px",background:"none",border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:18,fontSize:14,cursor:"pointer"}}>
                <span className="hdr-btn-full">Restore Access</span>
                <span className="hdr-btn-short">Restore</span>
              </button>
            )}
            {isPaid ? (
              <button className="glow-btn"
                onClick={selected ? regenerateReport : undefined}
                title={selected ? "" : "Select a province on the map first"}
                style={{padding:"7px 14px",background:selected?PALETTE.borderHover:PALETTE.faint,color:selected?"#f0ece0":PALETTE.muted,border:`1px solid ${selected?PALETTE.borderHover:PALETTE.faint}`,borderRadius:18,fontSize:15,fontWeight:700,cursor:selected?"pointer":"default",transition:"all .2s"}}>
                {selected ? (
                  <><span className="hdr-btn-full">Get {prov?.name} Report →</span><span className="hdr-btn-short">Report →</span></>
                ) : (
                  <><span className="hdr-btn-full">Select Province →</span><span className="hdr-btn-short">Select →</span></>
                )}
              </button>
            ) : (
              <button className="glow-btn" onClick={()=>setShowPay(true)}
                style={{padding:"7px 14px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:18,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px rgba(200,168,75,.28)`}}>
                <span className="hdr-btn-full">🔓 Unlock R 147.95 →</span>
                <span className="hdr-btn-short">🔓 R 147.95</span>
              </button>
            )}
          </div>
        </div>

        {/* ── HOVER BAR ── */}
        <div style={{height:26,background:PALETTE.surface,borderBottom:`1px solid ${PALETTE.faint}`,display:"flex",alignItems:"center",padding:"0 16px",flexShrink:0,overflow:"hidden"}}>
          {hovered ? (
            <span style={{fontSize:15,color:PALETTE.accent,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              <strong style={{fontFamily:"'Playfair Display',serif"}}>{mod.provinceData[hovered]?.name}</strong>
              <span style={{color:PALETTE.muted,marginLeft:8}}>{mod.provinceData[hovered]?.climate}</span>
              <span style={{color:PALETTE.dim,marginLeft:8}}>· Click to select</span>
            </span>
          ) : selected ? (
            <span style={{fontSize:14,color:PALETTE.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              <strong style={{color:PALETTE.accent,fontFamily:"'Playfair Display',serif",marginRight:6}}>{prov?.name}</strong>
              <span style={{color:PALETTE.dim}}>BE {prov?.be} {T.units} · {prov?.rainfall} rain · Primary: {prov?.primary?.[0]}</span>
              <span style={{color:PALETTE.dim,marginLeft:8}}>· ESC to clear</span>
            </span>
          ) : (
            <span style={{fontSize:14,color:PALETTE.dim,letterSpacing:.3}}>
              Hover over a province on the map · Click to select
            </span>
          )}
        </div>

        {/* ── MAP ── */}
        {/* Wrapper controls height — MapContainer ignores style changes after mount */}
        <div style={{
          position:"relative", flexShrink:0, overflow:"hidden",
          height: mapCollapsed ? 0 : (selected ? "28vh" : "50vh"),
          transition:"height .35s cubic-bezier(.4,0,.2,1)",
        }}>
          {!provGeo && !geoError && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}}>
              <span className="map-loading" style={{fontSize:14,color:PALETTE.muted,letterSpacing:1.5,textTransform:"uppercase",background:"rgba(8,15,6,.82)",padding:"5px 14px",borderRadius:20,border:`1px solid ${PALETTE.faint}`}}>
                ⟳ Loading province boundaries…
              </span>
            </div>
          )}
          {geoError && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}}>
              <span style={{fontSize:14,color:PALETTE.danger,letterSpacing:1,background:"rgba(8,15,6,.82)",padding:"5px 12px",borderRadius:20,border:`1px solid rgba(224,92,58,.3)`}}>
                ⚠ Province boundaries unavailable — use list below
              </span>
            </div>
          )}
          {/* Collapse button — sits at bottom of map */}
          <button
            onClick={() => setMapCollapsed(true)}
            style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"rgba(8,15,6,.82)",border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:16,padding:"4px 14px",fontSize:13,cursor:"pointer",letterSpacing:.5}}>
            ▲ Hide map
          </button>
          <MapContainer
            bounds={[[-35.5, 16.2], [-21.5, 33.5]]}
            boundsOptions={{padding:[0,0]}}
            style={{width:"100%", height:"100%", background:"#0a1520"}}
            attributionControl={false}
            zoomControl={true}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            aria-label="South Africa province selection map"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri World Imagery"
            />
            {provGeo && (
              <GeoJSON
                key={selected ?? "none"}
                data={provGeo}
                style={styleProvince}
                onEachFeature={onEachProvince}
              />
            )}
            <MapSizeTracker collapsed={mapCollapsed} />
          </MapContainer>
        </div>

        {/* ── MAP COLLAPSED STRIP ── */}
        {mapCollapsed && (
          <button
            onClick={() => setMapCollapsed(false)}
            style={{width:"100%",flexShrink:0,background:PALETTE.surface,border:"none",borderBottom:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,padding:"7px 16px",fontSize:13,cursor:"pointer",textAlign:"center",letterSpacing:.5}}>
            ▼ Show map {selected ? `· ${prov?.name} selected` : "· tap to select province"}
          </button>
        )}

        {/* ── REGION PANEL ── */}
        {selected && prov && (
          <div className="slide-up" style={{flex:1,overflow:"auto",minHeight:0,background:PALETTE.surface,borderTop:`2px solid ${PALETTE.borderHover}`,overscrollBehavior:"contain"}}>
            <div style={{padding:`14px 16px ${isPaid ? "24px" : "100px"}`}}>

              {/* Region header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0ece0"}}>{prov.name}</div>
                  <div style={{fontSize:14,color:PALETTE.muted,marginTop:2}}>{prov.climate}</div>
                </div>
                <button onClick={()=>setSelected(null)}
                  style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:6,padding:"4px 10px",fontSize:15,cursor:"pointer"}}>
                  ✕ ESC
                </button>
              </div>

              {/* Climate badges */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {[
                  {l:`🌧 ${prov.rainfall}`, title:"rainfall"},
                  {l:`❄ Frost: ${prov.frost}`, title:"frost", cls:prov.frost==="None"?"risk-low":prov.frost.includes("Heavy")?"risk-high":"risk-med"},
                  {l:`🦟 Parasites: ${prov.parasites}`, title:"parasites", cls:riskLabel(prov.parasites)},
                  {l:`☀ Drought: ${prov.drought}`, title:"drought", cls:riskLabel(prov.drought)},
                ].map((b,i)=>(
                  <span key={i} title={b.title}
                    className={b.cls||""}
                    style={{fontSize:14,padding:"3px 8px",background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:12}}>
                    {b.l}
                  </span>
                ))}
              </div>

              {/* Tab nav */}
              <div style={{display:"flex",borderBottom:`1px solid ${PALETTE.faint}`,marginBottom:14}}>
                {TABS.map((t,i)=>(
                  <button key={i} className="tab-btn" onClick={()=>setActiveTab(i)}
                    style={{flex:1,padding:"8px 4px",background:"none",border:"none",borderBottom:activeTab===i?`2px solid ${PALETTE.accent}`:"2px solid transparent",color:activeTab===i?PALETTE.accent:PALETTE.muted,fontSize:14,textTransform:"uppercase",letterSpacing:.5,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap"}}>
                    {t}
                  </button>
                ))}
              </div>

              {/* ── TAB 0: OVERVIEW ── */}
              {activeTab === 0 && (
                <div className="fade-in">
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderLeft:`2px solid ${PALETTE.borderHover}`,borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:15,color:"#8aaa70",lineHeight:1.8}}>
                    {prov.why}
                  </div>

                  {prov.tip && (
                    <div style={{background:"rgba(200,168,75,.06)",border:`1px solid rgba(200,168,75,.2)`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                      <span style={{fontSize:14,color:PALETTE.gold}}>💡 Pro tip: </span>
                      <span style={{fontSize:14,color:"#b8986a",lineHeight:1.7}}>{prov.tip}</span>
                    </div>
                  )}

                  {/* Avoid */}
                  {prov.avoid.length > 0 && (
                    <div style={{background:PALETTE.dangerBg,border:"1px solid rgba(224,92,58,.25)",borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                      {T.unit === "hive"
                        ? <div style={{fontSize:15,color:PALETTE.danger}}>⚠ Placement to avoid in {prov.name}:<ul style={{margin:"6px 0 0 0",paddingLeft:18}}>{prov.avoid.map((a,i)=><li key={i} style={{fontSize:14,color:"#c07060",lineHeight:1.5}}>{a}</li>)}</ul></div>
                        : <span style={{fontSize:15,color:PALETTE.danger}}>⚠ Avoid in {prov.name}: <strong>{prov.avoid.join(", ")}</strong></span>
                      }
                    </div>
                  )}

                  {/* Key stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
                    {(T.unit === "hive" ? [
                      {l:"Honey yield",      v:`${prov.liveKg} kg/hive/yr`},
                      {l:"Beeswax income",   v:`${ZAR(prov.wool)}/hive/yr`},
                      {l:T.priceLabel,       v:ZAR(prov.ewePrice)},
                    ] : [
                      {l:T.rateLabel,        v:`${prov.lambing}%`},
                      {l:"Slaughter",        v:`${prov.liveKg}kg / ${prov.dressing}%`},
                      {l:T.priceLabel,       v:ZAR(prov.ewePrice)},
                    ]).map((s,i)=>(
                      <div key={i} style={{background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"7px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:PALETTE.accent}}>{s.v}</div>
                        <div style={{fontSize:13,color:PALETTE.dim,marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Market access */}
                  <div style={{background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"8px 12px",marginBottom:12}}>
                    <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Markets</div>
                    <div style={{fontSize:14,color:PALETTE.muted,lineHeight:1.7}}>{prov.market}</div>
                  </div>

                  {/* Quick breed pills */}
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>★ {T.unit === "hive" ? "Honey types" : "Recommended breeds"}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                      {prov.primary.map(b=>(
                        <span key={b} style={{padding:"5px 11px",background:"#1a3a0e",border:`1px solid ${PALETTE.borderHover}`,borderRadius:20,color:PALETTE.accent,fontSize:15}}>★ {b}</span>
                      ))}
                    </div>
                    {prov.secondary.length > 0 && (
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {prov.secondary.map(b=>(
                          <span key={b} className="pill-btn" style={{padding:"4px 10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:20,color:PALETTE.muted,fontSize:15,cursor:"default",transition:"all .15s"}}>◆ {b}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="glow-btn" onClick={()=>setActiveTab(2)}
                    style={{width:"100%",padding:"11px",background:PALETTE.borderHover,color:"#f0ece0",border:"none",borderRadius:9,fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:8}}>
                    Model the economics →
                  </button>
                  {isPaid && result && (
                    <a href={`https://wa.me/?text=${encodeURIComponent(
                      `${prov.name} ${mod.label.toLowerCase()} farm analysis (Agrimodel Pro)\n` +
                      `Breed: ${prov.primary[0]} · ${prov.type}\n` +
                      `Profit/${T.unit}: R${result.profitPerEwe.toFixed(0)} · ROI: ${(result.roi*100).toFixed(1)}%\n` +
                      `Breakeven: ${result.breakeven} ${T.units} · Capital: R${Math.round(result.capital).toLocaleString()}\n` +
                      `Run your own model at agrimodel.co.za`
                    )}`} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,width:"100%",padding:"10px",background:"transparent",border:`1px solid rgba(37,211,102,.3)`,borderRadius:9,color:"rgba(37,211,102,.85)",fontSize:15,fontWeight:600,textDecoration:"none",boxSizing:"border-box"}}>
                      <span style={{fontSize:18}}>💬</span> Share on WhatsApp
                    </a>
                  )}
                </div>
              )}

              {/* ── TAB 1: BREEDS ── */}
              {activeTab === 1 && (
                <div className="fade-in">
                  <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>
                    {T.unit === "hive"
                      ? `Honey types & by-products · ${prov.name} · R${carcass}/kg honey`
                      : `Breed performance at R${carcass}/kg carcass · default ${T.group} size`}
                  </div>
                  {[...prov.primary.map(n=>({n,primary:true})), ...prov.secondary.map(n=>({n,primary:false}))].map(({n,primary})=>{
                    const isWool      = livestockType === "sheep" && ["Merino","SAMM","Dohne Merino","Ile de France"].includes(n);
                    const isProvBreed = n === prov.breed && result;
                    // Scale estimated performance numbers per livestock type
                    const estRoiPri  = T.unit==="hive" ? 0.18 : T.unit==="cow" ? 0.09 : (isWool ? 0.07 : 0.12);
                    const estRoiSec  = T.unit==="hive" ? 0.10 : T.unit==="cow" ? 0.05 : 0.04;
                    const estProfPri = T.unit==="hive" ? 420  : T.unit==="cow" ? 2800 : (isWool ? 120 : 250);
                    const estProfSec = T.unit==="hive" ? 200  : T.unit==="cow" ? 1000 : 60;
                    const roi        = isProvBreed ? result.roi        : (primary ? estRoiPri : estRoiSec);
                    const profitEwe  = isProvBreed ? result.profitPerEwe : (primary ? estProfPri : estProfSec);
                    const woolEwe    = isProvBreed ? result.woolRevPerEwe : (isWool ? 220 : 0);
                    const isReal     = !!isProvBreed;
                    // 3rd stat: wool income (sheep), breed category (cattle), honey style (bees)
                    const stat3 = T.unit === "hive"
                      ? { l:"Honey style",  v:primary ? "Premium" : "Specialty", c:PALETTE.gold }
                      : T.unit === "cow"
                      ? { l:"Category",     v:prov.type,                          c:PALETTE.gold }
                      : { l:"Wool/yr",      v:ZAR(woolEwe), c:woolEwe>0?PALETTE.gold:PALETTE.dim };
                    return (
                      <div key={n} style={{background:PALETTE.card,border:`1px solid ${primary?PALETTE.faint:"#1a2a1a"}`,borderRadius:10,padding:"12px",marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            {primary && <span style={{fontSize:14,color:PALETTE.accent}}>{T.unit==="hive" ? "★ MAIN CROP" : "★ PRIMARY"}</span>}
                            {!primary && <span style={{fontSize:14,color:PALETTE.muted}}>{T.unit==="hive" ? "◆ BY-PRODUCT" : "◆ VIABLE"}</span>}
                            <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#f0ece0"}}>{n}</span>
                          </div>
                          <span style={{fontSize:14,color:PALETTE.muted}}>{prov.type}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                          {[
                            {l:isReal?"ROI":"Est. ROI",                 v:PCT(roi),                                        c:roi>=0?PALETTE.accent:PALETTE.danger},
                            {l:isReal?`Profit/${T.unit}`:"Est. Profit", v:`${SGN(profitEwe)}${ZAR(Math.abs(profitEwe))}`,  c:profitEwe>=0?PALETTE.accent:PALETTE.danger},
                            stat3,
                          ].map((s,i)=>(
                            <div key={i} style={{background:PALETTE.bg,borderRadius:6,padding:"7px 6px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                              <div style={{fontSize:13,color:PALETTE.dim,marginTop:2,textTransform:"uppercase"}}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:8,fontSize:14,color:PALETTE.dim}}>
                          {isReal
                            ? `✓ Live model — based on your ${flockSize} ${T.units} at R${carcass}/kg`
                            : primary
                              ? (T.unit==="hive" ? `✓ Recommended honey crop for ${prov.name}'s conditions` : `✓ Recommended for ${prov.name}'s conditions`)
                              : (T.unit==="hive" ? `◆ Additional revenue stream for this region` : `◆ Works with good management and infrastructure`)}
                        </div>
                      </div>
                    );
                  })}
                  {prov.avoid.length > 0 && (
                    <div style={{background:PALETTE.dangerBg,border:"1px solid rgba(224,92,58,.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                      <div style={{fontSize:14,color:PALETTE.danger,marginBottom:6}}>
                        {T.unit==="hive" ? "⚠ PLACEMENT TO AVOID" : "⚠ NOT RECOMMENDED"}
                      </div>
                      {prov.avoid.map(n=>(
                        <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"5px 0",borderBottom:`1px solid rgba(224,92,58,.1)`,gap:8}}>
                          <span style={{fontSize:T.unit==="hive"?13:16,color:"#c05a4a",lineHeight:1.5}}>{T.unit==="hive" ? `✗ ${n}` : n}</span>
                          {T.unit!=="hive" && <span style={{fontSize:14,color:"#804040",flexShrink:0}}>Poorly adapted</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:14,color:PALETTE.dim,textAlign:"center",marginTop:8,lineHeight:1.6}}>
                    {T.unit==="hive"
                      ? "Full honey variety analysis and market pricing in the PDF report →"
                      : "Full breed comparison table is in the PDF report →"}
                  </div>
                </div>
              )}

              {/* ── TAB 2: MODEL ── */}
              {activeTab === 2 && result && (
                <div className="fade-in">
                  <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
                    {prov.primary[0]} · adjust inputs to model your scenario
                  </div>
                  {/* Inputs */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:10,padding:"12px",marginBottom:12}}>
                    <div style={{marginBottom:9}}>
                      <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>Labour Mode</div>
                      <div style={{display:"flex",gap:4}}>
                        {[
                          {id:"owner", l:"Owner-operated", sub:"Notional cost"},
                          {id:"hired", l:"Hired Worker",   sub:`BCEA ${ZAR(prov.hired??5594)}/mo`},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setLabourMode(m.id)}
                            style={{flex:1,padding:"6px 8px",background:labourMode===m.id?PALETTE.dim:"transparent",border:`1px solid ${labourMode===m.id?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                            <div style={{fontSize:14,color:labourMode===m.id?PALETTE.accent:PALETTE.muted,fontWeight:labourMode===m.id?600:400}}>{m.l}</div>
                            <div style={{fontSize:13,color:PALETTE.dim}}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Production system selector */}
                    <div style={{marginBottom:9}}>
                      <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>Production System</div>
                      <div style={{display:"flex",gap:4}}>
                        {[
                          {id:"extensive",     l:"Extensive",      sub: T.unit==="hive" ? "Migratory / seasonal" : "Natural veld"},
                          {id:"semiIntensive", l:"Semi-intensive",  sub: T.unit==="hive" ? "Fixed apiaries" : "Supplemented"},
                          {id:"intensive",     l:"Intensive",       sub: T.unit==="hive" ? "Commercial farm" : "Feedlot / irrigated"},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setProductionSystem(m.id)}
                            style={{flex:1,padding:"5px 6px",background:productionSystem===m.id?PALETTE.dim:"transparent",border:`1px solid ${productionSystem===m.id?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                            <div style={{fontSize:13,color:productionSystem===m.id?PALETTE.accent:PALETTE.muted,fontWeight:productionSystem===m.id?600:400}}>{m.l}</div>
                            <div style={{fontSize:13,color:PALETTE.dim}}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Market channel selector */}
                    <div style={{marginBottom:9}}>
                      <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>{T.unit === "hive" ? "Sales Channel" : "Market Channel"}</div>
                      <div style={{display:"flex",gap:4}}>
                        {(T.unit === "hive" ? [
                          {id:"auction",  l:"Wholesale",            sub:"Co-op / bulk buyer"},
                          {id:"abattoir", l:"Retail",               sub:"Health stores / stalls"},
                          {id:"direct",   l:"Direct + Pollination",  sub:"+40–60% margin"},
                        ] : [
                          {id:"auction",  l:"Auction",    sub:"Lowest margin"},
                          {id:"abattoir", l:"Abattoir",   sub:"Standard"},
                          {id:"direct",   l:"Direct sale", sub:"+15–25% margin"},
                        ]).map(m=>(
                          <button key={m.id} onClick={()=>setMarketChannel(m.id)}
                            style={{flex:1,padding:"5px 6px",background:marketChannel===m.id?PALETTE.dim:"transparent",border:`1px solid ${marketChannel===m.id?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                            <div style={{fontSize:13,color:marketChannel===m.id?PALETTE.accent:PALETTE.muted,fontWeight:marketChannel===m.id?600:400}}>{m.l}</div>
                            <div style={{fontSize:13,color:PALETTE.dim}}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feed source selector */}
                    <div style={{marginBottom:9}}>
                      <div style={{fontSize:14,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>{T.unit === "hive" ? "Feeding Strategy" : "Feed Source"}</div>
                      <div style={{display:"flex",gap:4}}>
                        {(T.unit === "hive" ? [
                          {id:"purchased",  l:"Purchased",     sub:"Sugar syrup / supplement"},
                          {id:"mixed",      l:"Mixed",          sub:"Forage + supplemental"},
                          {id:"homeGrown",  l:"Natural forage", sub:"Forage-only"},
                        ] : [
                          {id:"purchased",  l:"Purchased",   sub:"Retail / agent"},
                          {id:"mixed",      l:"Mixed",        sub:"Some home-grown"},
                          {id:"homeGrown",  l:"Home-grown",   sub:"Own forage / residue"},
                        ]).map(m=>(
                          <button key={m.id} onClick={()=>setFeedSource(m.id)}
                            style={{flex:1,padding:"5px 6px",background:feedSource===m.id?PALETTE.dim:"transparent",border:`1px solid ${feedSource===m.id?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                            <div style={{fontSize:13,color:feedSource===m.id?PALETTE.accent:PALETTE.muted,fontWeight:feedSource===m.id?600:400}}>{m.l}</div>
                            <div style={{fontSize:13,color:PALETTE.dim}}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advisor shortcut */}
                    <button onClick={() => setShowAdvisor(true)}
                      style={{width:"100%",marginBottom:8,padding:"7px 12px",background:"rgba(122,204,58,.05)",border:`1px solid rgba(122,204,58,.18)`,borderRadius:7,color:PALETTE.accent,fontSize:13,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(122,204,58,.10)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(122,204,58,.05)"}>
                      <span>🌿 Need guidance? Let the Farm Advisor walk you through →</span>
                      <span style={{color:dataCompleteness>=70?PALETTE.accent:PALETTE.gold,fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>{dataCompleteness}%</span>
                    </button>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <Field label={mod.carcassLabel} value={carcass} onChange={setCarcass} pre="R" hint="AgriOrbit benchmark" min={40} max={250}/>
                      <Field label={`${T.group.charAt(0).toUpperCase()+T.group.slice(1)} Size`} value={flockSize} onChange={setFlockSize} suf={T.units} hint={result.breakeven?`MVO=${result.breakeven}`:`MVO=?`} min={1} max={10000}/>
                      <Field label="Farm Size" value={landHa ?? ""} onChange={v=>setLandHa(v>0?v:null)} suf="ha"
                        hint={carryingCapacity?`cap. ${carryingCapacity} ${T.units}`:"enter to check"} min={0} max={100000}/>
                      {labourMode==="owner" && (
                        <Field label="Labour/mo" value={labour} onChange={setLabour} pre="R" hint="Owner R1,500+" min={0} max={50000}/>
                      )}
                    </div>

                    {/* Additional costs toggle */}
                    <button onClick={()=>setShowCosts(v=>!v)}
                      style={{width:"100%",marginTop:8,padding:"6px 10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:6,color:PALETTE.muted,fontSize:14,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>{T.unit === "hive" ? "Additional costs (bond · syrup · hive health · misc)" : "Additional costs (bond · feed · meds · fencing · misc)"}</span>
                      <span style={{color:PALETTE.accent,fontWeight:700}}>{showCosts?"▲":"▼"}</span>
                    </button>

                    {showCosts && (
                      <div style={{marginTop:8,borderTop:`1px solid ${PALETTE.faint}`,paddingTop:10}}>
                        <div style={{fontSize:13,color:PALETTE.dim,marginBottom:8,lineHeight:1.5}}>
                          Override province defaults to model your actual costs. Leave blank to use province estimate.
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <Field label="Bond repayment/mo" value={bondMonthly||""} onChange={v=>setBondMonthly(v||0)} pre="R" hint="Finance instalment" min={0} max={500000}/>
                          {T.unit !== "hive" && <Field label="Fencing/infra/mo" value={fencingMonthly||""} onChange={v=>setFencingMonthly(v||0)} pre="R" hint="Maint + repairs" min={0} max={100000}/>}
                          <Field label={T.unit==="hive" ? `Syrup/${T.unit}/yr` : `Feed/${T.unit}/yr`} value={feedOverride!==null?feedOverride:prov.feed} onChange={v=>setFeedOverride(v)} pre="R"
                            hint={`Default: ${ZAR(prov.feed)}`} min={0} max={10000}/>
                          <Field label={T.unit==="hive" ? `Hive health/${T.unit}/yr` : `Meds+vet/${T.unit}/yr`} value={healthOverride!==null?healthOverride:prov.health} onChange={v=>setHealthOverride(v)} pre="R"
                            hint={`Default: ${ZAR(prov.health)}`} min={0} max={5000}/>
                          <Field label="Misc/mo"            value={miscMonthly||""} onChange={v=>setMiscMonthly(v||0)} pre="R" hint="Other fixed costs" min={0} max={100000}/>
                        </div>
                        {/* Cost breakdown summary */}
                        <div style={{marginTop:10,background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"8px"}}>
                          <div style={{fontSize:13,color:PALETTE.dim,marginBottom:6,textTransform:"uppercase",letterSpacing:.7}}>Annual cost breakdown — {flockSize} {T.units}</div>
                          {Object.values(result.costBreakdown).filter(c=>c.annual>0).map((c,i)=>(
                            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${PALETTE.faint}22`,fontSize:14}}>
                              <span style={{color:PALETTE.muted}}>{c.label}</span>
                              <span style={{color:PALETTE.text,fontFamily:"'Playfair Display',serif",fontWeight:600}}>{ZAR(Math.round(c.annual))}</span>
                            </div>
                          ))}
                          <div style={{display:"flex",justifyContent:"space-between",paddingTop:5,marginTop:3,borderTop:`1px solid ${PALETTE.faint}`,fontSize:15}}>
                            <span style={{color:PALETTE.text,fontWeight:600}}>Total annual costs</span>
                            <span style={{color:PALETTE.danger,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(Math.round(result.totalCostPerEwe*flockSize))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overstocking warning */}
                  {isOverstocked && (
                    <div style={{background:"rgba(224,104,72,.10)",border:`1px solid rgba(224,104,72,.35)`,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                      <div style={{fontSize:15,color:PALETTE.danger,fontWeight:700,marginBottom:3}}>
                        ⚠ OVERSTOCKED — {overstockPct}% above carrying capacity
                      </div>
                      <div style={{fontSize:14,color:"#c07060",lineHeight:1.6}}>
                        {landHa} ha ({productionSystem}) supports ~{carryingCapacity} {T.units}. You have {flockSize} {T.units} — excess {flockSize - carryingCapacity} {T.units} will degrade veld and reduce long-term viability. Reduce {T.group} or add land.
                      </div>
                    </div>
                  )}
                  {carryingCapacity !== null && !isOverstocked && (
                    <div style={{background:PALETTE.card,border:`1px solid rgba(130,212,72,.40)`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                      <div style={{fontSize:14,color:PALETTE.text}}>
                        ✓ Stocking rate OK — {landHa} ha carries up to {carryingCapacity} {T.units} ({productionSystem}) · you are at {Math.round((flockSize/carryingCapacity)*100)}% capacity
                      </div>
                    </div>
                  )}

                  {/* 3 KPI cards */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[
                      {l:`Profit/${T.unit}`, v:`${SGN(result.profitPerEwe)}${ZAR(result.profitPerEwe)}`, c:pc, big:true},
                      {l:"Annual ROI", v:PCT(result.roi), c:pc, big:true},
                      {l:"Payback",    v:result.payback?(result.payback>20?">20 yr":`${result.payback.toFixed(1)} yr`):"∞", c:PALETTE.gold, big:true},
                    ].map((s,i)=>(
                      <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"12px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:13,color:PALETTE.dim,marginTop:3,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Free summary PDF export */}
                  <button onClick={() => printSummaryPDF({prov, result, T, mod, flockSize, carcass, productionSystem, auditResult})}
                    style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${PALETTE.borderHover}`,borderRadius:9,color:PALETTE.accent,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:7,letterSpacing:.3}}>
                    📄 Export Free 1-Page Summary PDF
                  </button>

                  {/* Profitability status banner */}
                  {(() => {
                    const margin = result.flockRev > 0 ? (result.flockProfit / result.flockRev) * 100 : 0;
                    const isProfit = result.profitPerEwe >= 0;
                    const statusLabel = !isProfit ? "LOSS-MAKING" : margin >= 25 ? "STRONG" : margin >= 15 ? "PROFITABLE" : "MARGINAL";
                    const statusColor = !isProfit ? PALETTE.danger : margin >= 25 ? PALETTE.accent : margin >= 15 ? "#82c040" : PALETTE.gold;
                    const statusBg    = !isProfit ? "rgba(224,104,72,.10)" : PALETTE.card;
                    const benchmark   = 15;
                    const vsB         = margin - benchmark;
                    return (
                      <div style={{background:statusBg,border:`1px solid ${statusColor}33`,borderRadius:8,padding:"9px 12px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <span style={{fontSize:14,padding:"2px 8px",background:PALETTE.surface,border:`1px solid ${statusColor}`,borderRadius:10,color:statusColor,fontWeight:700,letterSpacing:.5}}>{statusLabel}</span>
                          <span style={{fontSize:14,color:PALETTE.muted,marginLeft:8}}>Profit margin: <span style={{color:statusColor,fontWeight:600}}>{margin.toFixed(1)}%</span></span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,color:PALETTE.dim}}>vs benchmark 15%</div>
                          <div style={{fontSize:15,fontWeight:700,color:vsB>=0?PALETTE.accent:PALETTE.danger,fontFamily:"'Playfair Display',serif"}}>{vsB>=0?"+":""}{vsB.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Revenue + cost summary */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:6}}>
                    {[
                      {l:`Revenue (${flockSize} ${T.units})`,    v:ZAR(result.flockRev),                   c:PALETTE.accent},
                      {l:"Total cost",                      v:`−${ZAR(result.totalCostPerEwe*flockSize)}`, c:PALETTE.danger},
                      {l:`${T.group.charAt(0).toUpperCase()+T.group.slice(1)} profit/yr`, v:`${SGN(result.flockProfit)}${ZAR(Math.abs(result.flockProfit))}`, c:pc},
                    ].map((row,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<2?`1px solid ${PALETTE.faint}22`:"none"}}>
                        <span style={{fontSize:14,color:PALETTE.muted}}>{row.l}</span>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:row.c}}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                  {/* Capital + NPV mini row */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                    {[
                      {l:"Capital needed",  v:ZAR(result.capital),                                               c:PALETTE.gold},
                      {l:"5-yr NPV (10%)", v:`${SGN(result.npv5)}${ZAR(Math.abs(result.npv5))}`, c:result.npv5>=0?PALETTE.accent:PALETTE.danger},
                    ].map((s,i)=>(
                      <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"7px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:13,color:PALETTE.dim,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* MVO + Capital structure */}
                  {result.breakeven && (
                    <div style={{background:"rgba(200,168,75,.06)",border:`1px solid rgba(200,168,75,.20)`,borderRadius:8,padding:"10px",marginBottom:10}}>
                      <div style={{fontSize:13,color:PALETTE.gold,textTransform:"uppercase",letterSpacing:.8,marginBottom:7}}>Minimum Viable Operation</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:7}}>
                        {[
                          {l:"Start with",     v:`${result.breakeven} ${T.units}`, c:PALETTE.text},
                          {l:"Capital needed", v:ZAR(result.mvoCapital),        c:PALETTE.gold},
                          {l:"First revenue",  v:T.unit==="hive"?`Month ${prov.woolMonth}`:"Month 13", c:PALETTE.accent},
                        ].map((s,i)=>(
                          <div key={i} style={{background:PALETTE.bg,borderRadius:5,padding:"5px 4px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                            <div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"'Playfair Display',serif"}}>{s.v}</div>
                            <div style={{fontSize:13,color:PALETTE.dim,marginTop:1,textTransform:"uppercase"}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {flockSize < result.breakeven
                        ? <div style={{fontSize:14,color:PALETTE.danger,lineHeight:1.5}}>⚠ {flockSize} {T.units} is below MVO — increase {T.group} or reduce costs to break even</div>
                        : <div style={{fontSize:14,color:PALETTE.muted,lineHeight:1.5}}>Strategy: Start at MVO ({result.breakeven} {T.units}), reinvest year-2 profit to reach {Math.round(result.breakeven * 1.5)} {T.units} by year 3</div>
                      }
                    </div>
                  )}

                  {/* Capital structure */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:10}}>
                    <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Capital structure — {flockSize} {T.units}</div>
                    {[
                      {l:`${T.unit.charAt(0).toUpperCase()+T.unit.slice(1)} purchase (${flockSize} × ${ZAR(prov.ewePrice)})`, v:ZAR(result.ewePurchase), pct:result.ewePurchase/result.capital},
                      {l:"12-month working capital buffer",                      v:ZAR(result.workingCapital), pct:result.workingCapital/result.capital},
                    ].map((row,i)=>(
                      <div key={i} style={{marginBottom:7}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:14,color:PALETTE.muted}}>{row.l}</span>
                          <span style={{fontSize:15,color:PALETTE.gold,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{row.v}</span>
                        </div>
                        <div style={{height:5,background:PALETTE.bg,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(row.pct*100).toFixed(1)}%`,background:PALETTE.gold,borderRadius:3,transition:"width .4s"}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:`1px solid ${PALETTE.faint}`}}>
                      <span style={{fontSize:15,color:PALETTE.text,fontWeight:600}}>Total capital required</span>
                      <span style={{fontSize:18,color:PALETTE.gold,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(result.capital)}</span>
                    </div>
                  </div>

                  {/* 36-month cashflow chart */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                      <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8}}>36-month cashflow</div>
                      <div style={{fontSize:13,color:PALETTE.gold}}>— cumulative balance</div>
                    </div>
                    <MiniCashflow36 cf36={result.cf36} ewePurchase={result.ewePurchase}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
                      {[
                        {l:"First revenue",  v:`Mo ${result.firstProfitMonth ?? "—"}`,  c:PALETTE.accent},
                        {l:"Payback",        v:result.paybackMonth?`Mo ${result.paybackMonth}`:">36mo", c:result.paybackMonth?PALETTE.accent:PALETTE.danger},
                        {l:"Yr 2 balance",   v:`${SGN(result.cf36[23]?.cum??0)}${ZAR(Math.abs(result.cf36[23]?.cum??0))}`, c:(result.cf36[23]?.cum??-1)>=0?PALETTE.accent:PALETTE.danger},
                      ].map((s,i)=>(
                        <div key={i} style={{background:PALETTE.bg,borderRadius:5,padding:"5px 4px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                          <div style={{fontSize:15,fontWeight:700,color:s.c,fontFamily:"'Playfair Display',serif"}}>{s.v}</div>
                          <div style={{fontSize:13,color:PALETTE.dim,marginTop:1,textTransform:"uppercase"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:13,color:PALETTE.dim,marginTop:6,lineHeight:1.5}}>
                      Bars = monthly profit/loss · Gold line = cumulative balance from Day 0 · Dashed = {T.saleMonthLabel} ({T.unit==="hive"?`${prov.woolMonth}, ${prov.woolMonth+12}`:"13, 25"}) · Green dot = payback
                    </div>
                  </div>

                  {/* Scale preview */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:14}}>
                    <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Scale — annual profit by {T.group} size</div>
                    {result.scaleRows.map((row,i)=>{
                      const w = Math.min(Math.max(row.roi*400,0),100);
                      const c = row.profit>=0 ? (row.roi>0.2?PALETTE.accent:PALETTE.gold) : PALETTE.danger;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <span style={{fontSize:14,color:PALETTE.muted,width:48,textAlign:"right",flexShrink:0}}>{row.n} {T.units}</span>
                          <div style={{flex:1,height:8,background:PALETTE.bg,borderRadius:4,overflow:"hidden"}}>
                            <div style={{width:`${w}%`,height:"100%",background:c,borderRadius:4,transition:"width .4s"}}/>
                          </div>
                          <span style={{fontSize:14,fontFamily:"'Playfair Display',serif",color:c,width:70,textAlign:"right",flexShrink:0}}>
                            {SGN(row.profit)}{ZAR(Math.abs(row.profit))}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bankable Report CTA */}
                  {!isPaid && (
                    <div style={{background:"linear-gradient(135deg,#111811,#1a2414)",border:`1px solid ${PALETTE.borderHover}`,borderRadius:12,padding:"20px",marginTop:6,textAlign:"center"}}>
                      <div style={{fontSize:13,color:PALETTE.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Land Bank Quality</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0ece0",marginBottom:8}}>Bankable AI Feasibility Report</div>
                      <div style={{fontSize:14,color:PALETTE.muted,marginBottom:14,lineHeight:1.7}}>
                        9 sections — what a consultant charges R3,000–R5,000 to write.<br/>
                        <span style={{color:PALETTE.dim}}>Cashflow · Capital · Risk · Sensitivity · Scale · Breed Analysis</span>
                      </div>
                      <button className="glow-btn" onClick={()=>setShowPay(true)}
                        style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px rgba(200,168,75,.3)`}}>
                        📄 Get Bankable Report — R 147.95 →
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ── TAB 3: SAVINGS (Inefficiency Engine) ── */}
              {activeTab === 3 && auditResult && (
                <div className="fade-in">
                  {/* Total savings banner */}
                  {auditResult.totalAnnualSaving > 0 && (
                    <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.borderHover}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                      <div style={{fontSize:13,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                        Estimated annual savings identified
                      </div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:PALETTE.accent}}>
                        {ZAR(auditResult.totalAnnualSaving)}<span style={{fontSize:16,color:PALETTE.muted,fontWeight:400}}>/yr</span>
                      </div>
                      <div style={{fontSize:14,color:PALETTE.muted,marginTop:4,lineHeight:1.6}}>
                        Based on {flockSize} {T.units} · {productionSystem} system · {marketChannel} market · {feedSource} feed
                      </div>
                    </div>
                  )}

                  <div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1}}>
                          {auditResult.findings.length} inefficiencies identified · sorted by impact
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.5}}>Model confidence</div>
                          <div style={{width:60,height:5,background:PALETTE.faint,borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${dataCompleteness}%`,background:dataCompleteness>=70?PALETTE.accent:dataCompleteness>=50?PALETTE.gold:PALETTE.danger,borderRadius:2,transition:"width .4s"}}/>
                          </div>
                          <div style={{fontSize:14,fontWeight:700,color:dataCompleteness>=70?PALETTE.accent:dataCompleteness>=50?PALETTE.gold:PALETTE.danger}}>{dataCompleteness}%</div>
                          <button onClick={() => setShowAdvisor(true)}
                            style={{padding:"2px 9px",background:"transparent",border:`1px solid ${PALETTE.accent}`,borderRadius:10,color:PALETTE.accent,fontSize:13,cursor:"pointer",fontWeight:600,letterSpacing:.3,flexShrink:0}}>
                            Improve →
                          </button>
                        </div>
                      </div>

                      {auditResult.findings.map((f, i) => {
                        const sevColor = f.severity === "CRITICAL" ? PALETTE.danger : f.severity === "HIGH" ? "#e0943a" : PALETTE.gold;
                        const sevBg    = f.severity === "CRITICAL" ? "rgba(224,104,72,.08)" : f.severity === "HIGH" ? "rgba(224,148,58,.08)" : "rgba(212,181,90,.08)";
                        return (
                          <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderLeft:`3px solid ${sevColor}`,borderRadius:10,padding:"12px",marginBottom:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <span style={{fontSize:13,padding:"2px 7px",borderRadius:10,background:sevBg,color:sevColor,border:`1px solid ${sevColor}44`,letterSpacing:.5,fontWeight:600,marginRight:7}}>
                                  {f.severity}
                                </span>
                                {f.si && (
                                  <span style={{fontSize:13,color:PALETTE.muted}}>SI {f.si.toFixed(1)}</span>
                                )}
                              </div>
                              {f.annualSaving > 0 && (
                                <span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:PALETTE.accent}}>
                                  +{ZAR(f.annualSaving)}/yr
                                </span>
                              )}
                            </div>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#f0ece0",marginBottom:8}}>
                              {f.component}
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                              <div style={{background:PALETTE.bg,border:`1px solid rgba(224,92,58,.2)`,borderRadius:6,padding:"6px 8px"}}>
                                <div style={{fontSize:13,color:PALETTE.danger,textTransform:"uppercase",letterSpacing:.6,marginBottom:2}}>Current cost</div>
                                <div style={{fontSize:14,color:"#c07060",lineHeight:1.4}}>{f.currentLabel}</div>
                              </div>
                              <div style={{background:PALETTE.bg,border:`1px solid rgba(130,212,72,.2)`,borderRadius:6,padding:"6px 8px"}}>
                                <div style={{fontSize:13,color:PALETTE.accent,textTransform:"uppercase",letterSpacing:.6,marginBottom:2}}>Optimised</div>
                                <div style={{fontSize:14,color:"#80b060",lineHeight:1.4}}>{f.optimizedLabel}</div>
                              </div>
                            </div>
                            <div style={{background:"rgba(200,168,75,.05)",border:`1px solid rgba(200,168,75,.15)`,borderRadius:7,padding:"8px 10px"}}>
                              <div style={{fontSize:13,color:PALETTE.gold,marginBottom:3,letterSpacing:.4}}>🔑 Action</div>
                              <div style={{fontSize:14,color:PALETTE.muted,lineHeight:1.7}}>{f.action}</div>
                            </div>
                            {f.capitalSaving > 0 && !f.annualSaving && (
                              <div style={{marginTop:7,fontSize:13,color:PALETTE.muted,lineHeight:1.5}}>
                                💰 Capital saving: <span style={{color:PALETTE.gold,fontWeight:600}}>
                                  {f.component === "Fencing"
                                    ? `R${f.capitalSaving}/m of perimeter fencing (multiply by your perimeter length)`
                                    : `~${ZAR(f.capitalSaving)} infrastructure cost reduction`}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Data completeness nudge */}
                      <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:9,padding:"12px",marginTop:4,marginBottom:14}}>
                        <div style={{fontSize:14,color:PALETTE.gold,marginBottom:6,fontWeight:600}}>
                          💡 Improve model confidence ({dataCompleteness}% complete)
                        </div>
                        <div style={{fontSize:14,color:PALETTE.muted,lineHeight:1.7,marginBottom:8}}>
                          {!landHa && <span>→ Enter your <strong style={{color:PALETTE.accent}}>farm size (ha)</strong> to enable carrying capacity check<br/></span>}
                          {feedOverride===null && <span>→ Override <strong style={{color:PALETTE.accent}}>Feed cost/{T.unit}</strong> with your actual figure for better accuracy<br/></span>}
                          {healthOverride===null && <span>→ Override <strong style={{color:PALETTE.accent}}>Meds + vet cost</strong> to sharpen the veterinary savings calc<br/></span>}
                          <span>→ Try <strong style={{color:PALETTE.accent}}>Direct</strong> market or <strong style={{color:PALETTE.accent}}>Home-grown</strong> feed to see impact on findings</span>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button className="glow-btn" onClick={() => setShowAdvisor(true)}
                            style={{flex:2,padding:"10px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:8,fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 3px 12px rgba(200,168,75,.3)`}}>
                            🌿 Open Farm Advisor →
                          </button>
                          <button onClick={() => setActiveTab(2)}
                            style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:8,color:PALETTE.muted,fontSize:14,cursor:"pointer"}}>
                            ← Model
                          </button>
                        </div>
                      </div>

                      {/* Free summary export */}
                      <button onClick={() => printSummaryPDF({prov, result, T, mod, flockSize, carcass, productionSystem, auditResult})}
                        style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${PALETTE.borderHover}`,borderRadius:8,color:PALETTE.accent,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                        📄 Export Free 1-Page Summary PDF
                      </button>

                      <div style={{display:"flex",gap:8,marginBottom:10}}>
                        <button onClick={()=>window.print()}
                          style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:8,color:PALETTE.muted,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          🖨 Print Action Sheet
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(
                          `My ${prov.name} farm has ${auditResult.totalAnnualSaving>0?`R${auditResult.totalAnnualSaving.toLocaleString()} in annual savings identified`:"potential inefficiencies identified"} by Agrimodel Pro.\nGet your free analysis at agrimodel.co.za`
                        )}`} target="_blank" rel="noopener noreferrer"
                          style={{flex:1,padding:"10px",background:"transparent",border:`1px solid rgba(37,211,102,.3)`,borderRadius:8,color:"rgba(37,211,102,.85)",fontSize:15,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          💬 Share savings
                        </a>
                      </div>

                      <button className="glow-btn" onClick={()=>setShowPay(true)}
                        style={{width:"100%",padding:"12px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px rgba(200,168,75,.3)`}}>
                        Get Full AI Feasibility Report — R 147.95 →
                      </button>
                    </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ── NO SELECTION ── */}
        {!selected && (
          <div style={{flex:1,overflow:"auto",minHeight:0,padding:"12px 16px 20px",overscrollBehavior:"contain"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.5}}>
                9 {mod.labelPlural} Provinces — tap any to explore
              </div>
              <div style={{fontSize:13,color:PALETTE.faint}}>↑ or click map</div>
            </div>
            {Object.keys(mod.provinceData).map(key=>{
              const pd = mod.provinceData[key];
              const typeColor = pd.type==="Wool"?PALETTE.gold:pd.type==="Dual"?"#5a9adc":PALETTE.accent;
              return (
                <div key={key} role="button" tabIndex={0} aria-label={`Select ${pd.name} province`}
                  onClick={()=>setSelected(key)}
                  onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(key);}}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderLeft:`3px solid ${pd.fill}`,borderRadius:8,marginBottom:6,cursor:"pointer",transition:"all .12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=pd.fill;e.currentTarget.style.background=PALETTE.card;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderLeftColor=pd.fill;e.currentTarget.style.borderTopColor=PALETTE.faint;e.currentTarget.style.borderRightColor=PALETTE.faint;e.currentTarget.style.borderBottomColor=PALETTE.faint;e.currentTarget.style.background=PALETTE.surface;}}>
                  <div style={{width:11,height:11,borderRadius:"50%",background:pd.fill,flexShrink:0,boxShadow:`0 0 7px ${pd.fill}90`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:16,color:"#f0ece0",fontWeight:600}}>{pd.name}</span>
                      <span style={{fontSize:13,padding:"1px 5px",borderRadius:8,background:`${typeColor}18`,color:typeColor,border:`1px solid ${typeColor}33`}}>{pd.type}</span>
                    </div>
                    <div style={{fontSize:14,color:PALETTE.dim,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pd.primary.join(" · ")}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:14,color:PALETTE.muted,fontFamily:"'Playfair Display',serif",fontWeight:600}}>BE {pd.be}</div>
                    <div style={{fontSize:13,color:PALETTE.dim,marginTop:1}}>{pd.rainfall}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STICKY CTA — only shown to guests ── */}
        {selected && !isPaid && (
          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 16px 14px",background:`linear-gradient(to top,${PALETTE.bg} 70%,transparent)`,zIndex:100}}>
            <button className="glow-btn" onClick={()=>setShowPay(true)}
              style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 24px rgba(200,168,75,.4)`}}>
              📄 Get Bankable Report — R 147.95 →
            </button>
          </div>
        )}

      </div>

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
}

export default function App() {
  return <ErrorBoundary><AgrimodelPro /></ErrorBoundary>;
}
