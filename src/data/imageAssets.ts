import heroHampiImg from '../assets/images/hero_hampi_chariot_1794747861538.jpg';
import destBelurImg from '../assets/images/dest_belur_hoysala_1794747863608.jpg';
import destMysoreImg from '../assets/images/dest_mysore_palace_1794747863190.jpg';
import destBadamiImg from '../assets/images/dest_badami_caves_1794747864012.jpg';
import cultureYakshaganaImg from '../assets/images/culture_yakshagana_art_1794747864409.jpg';
import cultureCraftsImg from '../assets/images/culture_karnataka_crafts_1794747865084.jpg';
import cultureMalnadImg from '../assets/images/culture_malnad_heritage_1794747865353.jpg';
import cultureDharwadPedaImg from '../assets/images/culture_dharwad_peda_1794748462685.jpg';
import cultureMysorePaintingImg from '../assets/images/culture_mysore_painting_1794748464000.jpg';
import cultureDolluKunithaImg from '../assets/images/culture_dollu_kunitha_1794748462915.jpg';
import golGumbazImg from '../assets/images/gol_gumbaz_1794750173854.jpg';
import murudeshwarTempleImg from '../assets/images/murudeshwar_temple_1794750173165.jpg';
import halebiduTempleImg from '../assets/images/halebidu_temple_1794750174725.jpg';
import shravanabelagolaImg from '../assets/images/shravanabelagola_monolith_1794750175039.jpg';
import pattadakalImg from '../assets/images/pattadakal_monuments_1794750174803.jpg';
import bidarFortImg from '../assets/images/bidar_fort_1794750173667.jpg';
import chitradurgaFortImg from '../assets/images/chitradurga_fort_1794750175307.jpg';
import ballariFortImg from '../assets/images/ballari_fort_1794750176683.jpg';
import belagaviFortImg from '../assets/images/belagavi_fort_1794750175466.jpg';
import tipuPalaceImg from '../assets/images/tipu_palace_1794750178033.jpg';
import devanahalliFortImg from '../assets/images/devanahalli_fort_1794750178221.jpg';
import madikeriFortImg from '../assets/images/madikeri_fort_1794750176739.jpg';
import srirangapatnaFortImg from '../assets/images/srirangapatna_fort_1794750177984.jpg';
import bhogaNandeeshwaraImg from '../assets/images/bhoga_nandeeshwara_1794750179223.jpg';
import amruteshwaraTempleImg from '../assets/images/amruteshwara_temple_1794750177487.jpg';
import kadriManjunathaImg from '../assets/images/kadri_manjunatha_1794750180043.jpg';
import udupiMathaImg from '../assets/images/udupi_matha_1794750180133.jpg';
import ikkeriTempleImg from '../assets/images/ikkeri_temple_1794750178840.jpg';
import raichurFortImg from '../assets/images/raichur_fort_1794750181624.jpg';
import santhebennurTankImg from '../assets/images/santhebennur_tank_1794750182755.jpg';
import madhugiriFortImg from '../assets/images/madhugiri_fort_1794750240389.jpg';
import lakkundiGadagImg from '../assets/images/lakkundi_gadag_1794750238801.jpg';
import itagiMahadevaImg from '../assets/images/itagi_mahadeva_1794750238159.jpg';
import gulbargaFortImg from '../assets/images/gulbarga_fort_1794750239227.jpg';
import galaganathaHaveriImg from '../assets/images/galaganatha_haveri_1794750241555.jpg';
import unkalDharwadImg from '../assets/images/unkal_dharwad_1794750240853.jpg';
import kolarammaTempleImg from '../assets/images/kolaramma_temple_1794750243773.jpg';
import brHillsTempleImg from '../assets/images/br_hills_temple_1794750242512.jpg';
import ramadevaraBettaImg from '../assets/images/ramadevara_betta_1794750241350.jpg';
import sannatiYadgirImg from '../assets/images/sannati_yadgir_1794750241272.jpg';

const IMAGE_REGISTRY: Record<string, string> = {
  'hero-hampi': heroHampiImg,
  'belur-hoysala': destBelurImg,
  'mysore-palace': destMysoreImg,
  'badami-caves': destBadamiImg,
  'yakshagana': cultureYakshaganaImg,
  'karnataka-crafts': cultureCraftsImg,
  'malnad-groves': cultureMalnadImg,
  'dharwad-peda': cultureDharwadPedaImg,
  'mysore-painting': cultureMysorePaintingImg,
  'dollu-kunitha': cultureDolluKunithaImg,
  'gol-gumbaz': golGumbazImg,
  'murudeshwar-temple': murudeshwarTempleImg,
  'halebidu-temple': halebiduTempleImg,
  'shravanabelagola': shravanabelagolaImg,
  'pattadakal': pattadakalImg,
  'bidar-fort': bidarFortImg,
  'chitradurga-fort': chitradurgaFortImg,
  'ballari-fort': ballariFortImg,
  'belagavi-fort': belagaviFortImg,
  'tipu-palace': tipuPalaceImg,
  'devanahalli-fort': devanahalliFortImg,
  'madikeri-fort': madikeriFortImg,
  'srirangapatna-fort': srirangapatnaFortImg,
  'bhoga-nandeeshwara': bhogaNandeeshwaraImg,
  'amruteshwara-temple': amruteshwaraTempleImg,
  'kadri-manjunatha': kadriManjunathaImg,
  'udupi-matha': udupiMathaImg,
  'ikkeri-temple': ikkeriTempleImg,
  'raichur-fort': raichurFortImg,
  'santhebennur-tank': santhebennurTankImg,
  'madhugiri-fort': madhugiriFortImg,
  'lakkundi-gadag': lakkundiGadagImg,
  'itagi-mahadeva': itagiMahadevaImg,
  'gulbarga-fort': gulbargaFortImg,
  'galaganatha-haveri': galaganathaHaveriImg,
  'unkal-dharwad': unkalDharwadImg,
  'kolaramma-temple': kolarammaTempleImg,
  'br-hills-temple': brHillsTempleImg,
  'ramadevara-betta': ramadevaraBettaImg,
  'sannati-yadgir': sannatiYadgirImg,
};

export function resolveHeritageImage(imageKey: string): string {
  if (!imageKey) return '';
  if (imageKey.startsWith('/') || imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }
  return IMAGE_REGISTRY[imageKey] ?? `/images/${imageKey}.jpg`;
}
