import { environment } from '../../../../environments/environments';
import { TravelAudience } from './travel-content';

export interface TravelImage {
  name: string;
  url: string;
}

// Media-server directory inventory; includes JPEG, WebP and AVIF files.
const IMAGE_FILES: Record<TravelAudience, string[]> = {
  "sales": [
    "2025_05_image-46.jpg",
    "30592d6c3ba14b5b686f69cb53a5bef5.avif",
    "946.jpg.avif",
    "DSC09739.jpg.webp",
    "Feelgood-Erlebnisreisen-Nordeuropa-2237190221.jpg",
    "Reine-winter-time-Lofoten-Islands-Mumemories.webp",
    "VgW2cPJ.jpeg",
    "bingqi-huang-NxjtJghBaHM-unsplash.jpg",
    "caption.jpg",
    "daniel-diemer-rFOTawY13sg-unsplash.jpg",
    "david-becker-0esQRJi-vNQ-unsplash.jpg",
    "david-becker-4ixvG_t2Tl8-unsplash.jpg",
    "die-geschichte-der.webp",
    "e3f70cb113bc15cd067557888ab431d8a5188fe1-3497x2317.jpg.avif",
    "explorer-og-fjell-vinter.jpg",
    "federico-di-dio-photography-N5u0IofGUPs-unsplash.jpg",
    "guide-to-lofoten_about-us_ivar-and-radka_15.webp",
    "henningsv-r-lofoten-kde-se-ubytovat-v-hennings.jpg",
    "images.jpeg",
    "munir-rani-DNMvqJ_kdCQ-unsplash.jpg",
    "nordlicht-lofoten-s-1504345343-jpg--87688-.jpg",
    "skrei-fischen-lofoten-norwegen-1.jpg",
    "svolvaer-lofoten-unterkunft.jpg",
    "visitlofoten-10188-9129dc6c50f70450e2896c923041ca0f-5472x3648.jpeg",
    "xurmyogejzakf782eszz.avif"
  ],
  "management": [
    "021136bf7f8bb4035eb4f693c0c8b44e.avif",
    "1025969.jpg",
    "1783162339206-e18v6d.jpg",
    "19438-mauritius-2048x1536-tablet.jpg.webp",
    "33603-Shiv_statue_over_the_Grand_Bassin_lake_in_Mauritius_c_AdobeStock__Ash_Pixshots-Wirestock_Creators.jpeg.jpg",
    "34cd5f530e7c93b0fd704cc737600f55b056b5cd3d472d6306f38861a83262db.jpg.avif",
    "5c390ff60f9852e7ea5dab1534c4189398d65cca-1600x1066.jpg",
    "5f6653a4-90c8-45e2-90c8-f6738990f2b1.jpg",
    "HerveFabrePhotosTrouauxbiches072025HD005.jpg",
    "Hotel.jpeg",
    "IMG_3044 Mauravann - 300dpi.jpg",
    "Mauritius-Le-Morne-Brabant-scaled.jpg",
    "Mauritius-Sega-MTPA-Bamba-jpg.jpg",
    "Mauritius-wolkenweit-1-11-e1524923939623.jpg.webp",
    "chloe-christine-dx3cP5zdTi4-unsplash.jpg",
    "eureka-house-mauritius-maison-eureka-maurice (3).jpg",
    "farbige-erden-s-1031874952.jpg",
    "hongbin-D2TkKhuy6qQ-unsplash.jpg",
    "images.jpeg",
    "la-route-du-the-de-l26rsquo3Bile-maurice.jpg.webp",
    "oosman-exptal-STfud-gabvc-unsplash.jpg",
    "randonnee-aquatique-new-1-min.jpg",
    "raoul-du-plessis-ahSNgENEEFk-unsplash.jpg",
    "yannick-apollon-dpViyqTgzI4-unsplash.jpg"
  ],
  "warehouse": [
    "1574853537_Blick-auf-die-OConnell-Street-in-Dublin.jpg",
    "Cows-with-Baileys-Bottle.jpg",
    "DSC_8458.jpg.webp",
    "DSC_8503.jpg.webp",
    "DUO9aCc14yw9fJlSPHTlyG.jpg",
    "GettyImages-959714754-5b991a474cedfd00255a4564.jpg",
    "Human-Sheep-Herding-Main-Image-1.jpg",
    "ILCV6TCH3RCY7MHSNS6OW2EXEI.jpg",
    "NMMX6PWYORGIBDUUMUEOPV2SGY.jpg",
    "Puffins-in-Irland-Ernaehrung-scaled.jpg.webp",
    "Trinity-College.jpg",
    "WhatsApp-Image-2025-01-27-at-12.30.51-e1737995969477-768x703.jpeg",
    "Wicklow-Mountains-National-Park.jpg",
    "Wicklow-mountains-national-park-ireland-s9-plus-1-1440x1920.jpeg",
    "caption.jpg",
    "clay-target-shooting-istock.jpg",
    "dublin.jpg",
    "fec4078985e34526befaddd4ceac756c.jpg",
    "gaia-on-display-at-the.jpg",
    "gap-of-dunloe-irland-m-2-gg3jgx-jpg--82588-.jpg",
    "hurling-match_ver_1.jpg",
    "iStock-1474194255-HEADER_MOBILE.webp",
    "image.webp",
    "ireland-watching-puffins.jpg.webp",
    "irland-dublin-georgianisches-viertel-1.jpg",
    "irland-kueste-100~_v-HintergrundL.jpg",
    "molly-malone-2539750_1920.jpg.webp",
    "traditional-Irish-shepherds-pie-7.jpg"
  ]
};

export function selectTravelImages(audience: TravelAudience): TravelImage[] {
  const files = [...IMAGE_FILES[audience]];
  // Fisher–Yates: unique images in a fresh random order for each page load.
  for (let index = files.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [files[index], files[other]] = [files[other], files[index]];
  }
  return files.slice(0, 12).map((file, index) => ({
    name: `${audience === 'sales' ? 'Lofoten' : audience === 'management' ? 'Mauritius' : 'Irland'} – Reisebild ${index + 1}`,
    url: `${environment.apiUrl}/media/cnh/reise/images/${audience}/${encodeURIComponent(file)}`,
  }));
}
