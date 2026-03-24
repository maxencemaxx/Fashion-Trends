const express = require('express');
const cors = require('cors'); // Importez cors
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard.",
});

app.use(limiter);
app.use(helmet()); // Active plusieurs sécurités HTTP par défaut

app.use(express.static("public", { dotfiles: "deny" })); // Interdit d’accéder aux fichiers cachés

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur interne s'est produite." });
});


// Configure CORS uniquement pour ton client
const corsOptions = {
  origin: ["http://localhost:3000"], // Mets l'URL de ton frontend en prod
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Exemple de données statiques pour les produits de mode
const fashionTrends = [
  {
    id: 1,
    name: "Chemise",
    type: "T-Shirts",
    price: 74.90,
    color: "Bleu, Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "SampleProject",
    fit: "Boxy",
    material: "100% Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/sampleproject1.webp",
    additionalImages: [
      "http://localhost:3000/images/sampleproject2.webp",
      "http://localhost:3000/images/sample3.webp"
    ],
    purchaseLink: "https://sampleprojects.fr/products/chemise-lhonneur"

  },
  {
    id: 2,
    name: "Jacket réversible",
    type: "Jackets",
    price: 239.90,
    color: "Marron, bleu, noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old Time Fever x Supram",
    fit: "Boxy",
    material: "Coton / Fausse Fourrure en Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/fourrure1.jpg",
    additionalImages: [
      "http://localhost:3000/images/fourrure3.jpg"
    ],
    purchaseLink: "https://www.hidden-faces.com/shop/p/chaines-et-chenes-jacket-supram-oldtimefever"

  },
  {
    id: 3,
    name: "Bomber",
    type: "Jackets",
    price: 4500,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Olt time fever",
    fit: "Boxy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/old7.jpg",
    purchaseLink: "https://www.oldtimefever.com/original/p/le-bomber-du-scriptorium-dipped-in-pearls"

  },
  {
    id: 4,
    name: "Sweater Vest",
    type: "Sweaters",
    price: 32.80,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aelfric Eden",
    fit: "Regular",
    material: "52 % acrylique, 28 % nylon, 20 % PBT",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/ael4.webp",
    purchaseLink: "https://www.aelfriceden.com/collections/sweater-vest/products/aelfric-eden-basic-vintage-sweater-vest?variant=45000533311650"

  },
  {
    id: 5,
    name: "Cardigan",
    type: "Cardigan",
    price: 90,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old Time Fever",
    fit: "Boxy",
    material: "9% Laine mohair, 33% Nylon, 58% Acrylique",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/old8.jpg",
    additionalImages: [
      "http://localhost:3000/images/old9.jpg",
    ],
    purchaseLink: "https://www.oldtimefever.com/original/p/cardigan-de-la-brume-l-equinoxe"

  },
  {
    id: 6,
    name: "Sweater Vest",
    type: "Sweaters",
    price: 41.34,
    color: "Blanc, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aelfric Eden",
    fit: "Large",
    material: "Acrylique",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/ael1.webp",
    additionalImages: [
      "http://localhost:3000/images/ael2.jpg",
      "http://localhost:3000/images/ael3.webp",
    ],
    purchaseLink: "https://www.aelfriceden.com/collections/sweater-vest/products/irregular-graphic-sweater-vest?variant=43081835085986"

  },
  {
    id: 7,
    name: "Veste en cuir",
    type: "Jackets",
    price: 139.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Ambivalence",
    fit: "Bomber",
    material: "Simili cuir ",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/ambi1.webp",
    purchaseLink: "https://ambvlce.com/products/black-mocha-jacket"

  },
  {
    id: 8,
    name: "Mohair",
    type: "Sweaters",
    price: 94.95,
    color: "Rouge, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Ambivalence",
    fit: "Boxy",
    material: "50% ACRYLIC/ 30% NYLON/ 10% LAINE/ 10% MOHAIR",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/ambi2.webp",
    additionalImages: [
      "http://localhost:3000/images/ambi3.webp",
    ],
    purchaseLink: "https://ambvlce.com/products/wavy-mohair-infrrared"

  },
  {
    id: 9,
    name: "Jean",
    type: "Pants",
    price: 39.99,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "PullandBear",
    fit: "Mega Baggy",
    material: "Coton",
    season : "Hiver,automne",
    imageUrl: "http://localhost:3000/images/baggy1.jpg",
    additionalImages: [
      "http://localhost:3000/images/baggy2.jpg",
      "http://localhost:3000/images/baggy3.jpg",
    ],
    purchaseLink: "https://www.pullandbear.com/fr/jean-mega-baggy-l07684512?cS=833&utm_source=google&utm_medium=cpc&utm_campaign=PB_PER_GADS_FR_PMAX_GENERIC_MIX_UNISEX_ALL&gad_source=1&gclid=Cj0KCQjw1Yy5BhD-ARIsAI0RbXaYA2VoZigJZlHnqSmqbHYL5Wkm2_QtO0m8cX8Iigl_p6N5Ty4U2zAaAhBfEALw_wcB&gclsrc=aw.ds"

  },
  {
    id: 10,
    name: "Jean",
    type: "Pants",
    price: 49.99,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Méga baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/baggy4.jpg",
    additionalImages: [
      "http://localhost:3000/images/baggy5.jpg",
      "http://localhost:3000/images/baggy6.jpg",
    ],
    purchaseLink: "https://www.bershka.com/fr/jean-m%C3%A9ga-baggy-c0p162281947.html?colorId=428&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZcsn-Xv6xzWI11p11FNmrD27ycexsi7XD3j3wPX2CtJ1slMST7kl7saAqniEALw_wcB"

  },
  {
    id: 11,
    name: "Jean",
    type: "Pants",
    price: 59.99,
    color: "Dark Blue",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Reclaimed Vintage (via ASOS)",
    fit: "Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/baggy7.avif",
    additionalImages: [
      "http://localhost:3000/images/baggy8.avif",
      "http://localhost:3000/images/baggy9.avif",
    ],
    purchaseLink: "https://www.asos.com/reclaimed-vintage/reclaimed-vintage-baggy-jean-in-dark-blue-wash/prd/205979442?affid=28814&_Cj0KCQjwvpy5BhDTARIsAHSilyk2E5EaDMNyGFVLBqn-wB1mOtFtaUxdXPiNdeCJmlf91HO338DOzu8aArfNEALw_wcB&channelref=product+search&ppcadref=21390761423%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21390761423=&utm_content=&utm_term=&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilyk2E5EaDMNyGFVLBqn-wB1mOtFtaUxdXPiNdeCJmlf91HO338DOzu8aArfNEALw_wcB&gclsrc=aw.ds"

  },
  {
    id: 12,
    name: "Veste en cuir",
    type: "Jackets",
    price: 235,
    color: "Vinyle Cerise",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "California Arts",
    fit: "Regular",
    material: "100% Patent vinyl ",
    season : "hiver, automne",
    imageUrl: "http://localhost:3000/images/california1.jpg",
    additionalImages: [
      "http://localhost:3000/images/california2.webp",
    ],
    purchaseLink: "https://california-arts.com/collections/shop-all/products/fairfaxblouson_cherry-vinyl?variant=47829458157848"

  },
  {
    id: 13,
    name: "Jean",
    type: "Pants",
    price: 54.99,
    color: "Noir délavé",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Asos Design",
    fit: "Super Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cargo1.avif",
    additionalImages: [
      "http://localhost:3000/images/cargo2.avif",
      "http://localhost:3000/images/cargo3.avif",
    ],
    purchaseLink: "https://www.asos.com/fr/asos-design/asos-design-jean-super-baggy-a-poches-cargo-noir-delave/prd/206538510?affid=28923&_Cj0KCQjwvpy5BhDTARIsAHSilylvdfFfabxgWY6w_fOUg--6Si26Ru4WQaL5I6f3cXvNkE1HH-fNv2IaAh7nEALw_wcB&channelref=product+search&ppcadref=21247041999%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21247041999=&utm_content=&utm_term=&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilylvdfFfabxgWY6w_fOUg--6Si26Ru4WQaL5I6f3cXvNkE1HH-fNv2IaAh7nEALw_wcB&gclsrc=aw.ds"

  },
  {
    id: 14,
    name: "Jean",
    type: "Pants",
    price: 37.99,
    color: "Sable",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Collusion (Via Asos)",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automnes",
    imageUrl: "http://localhost:3000/images/collu1.avif",
    additionalImages: [
      "http://localhost:3000/images/collu2.avif",
      "http://localhost:3000/images/collu3.avif",
    ],
    purchaseLink: "https://www.asos.com/collusion/collusion-skater-utility-jeans-in-sand/prd/205627020?affid=28814&_Cj0KCQjwvpy5BhDTARIsAHSilykO9E9QhvhIKBLgUocfxMc3rj2KKUBKQFJ44ptwPxnRnIqoAh8BWgAaAsCiEALw_wcB&channelref=product+search&ppcadref=21390761423%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21390761423=&utm_content=&utm_term=&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilykO9E9QhvhIKBLgUocfxMc3rj2KKUBKQFJ44ptwPxnRnIqoAh8BWgAaAsCiEALw_wcB&gclsrc=aw.ds"

  },
  {
    id: 15,
    name: "Veste en cuir",
    type: "Jackets",
    price: 59.99,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Regular",
    material: "Polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cuirbershka1.jpg",
    additionalImages: [
      "http://localhost:3000/images/cuirbershka2.jpg",
      "http://localhost:3000/images/cuirbershka3.jpg",
    ],
    purchaseLink: "https://www.bershka.com/fr/blouson-en-similicuir-d%C3%A9lav%C3%A9-c0p162282059.html?colorId=800&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZdUwKXL05A1grdhkFlsqqWf-U1bCzF_M8p_qV_gK-B8M2v2upW9qD0aAp9oEALw_wcB"

  },
  {
    id: 16,
    name: "Veste en cuir",
    type: "Jackets",
    price: 59.99,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Regular",
    material: "Polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cuirbershka4.jpg",
    additionalImages: [
      "http://localhost:3000/images/cuirbershka5.jpg",
    ],
    purchaseLink: "https://www.bershka.com/fr/blouson-en-similicuir-d%C3%A9lav%C3%A9-c0p164324768.html?colorId=737&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZfGAJBEHZi_74PhJPODnYsYYis2nlWJV4vAHWtgIUKxcm5ul6_Qwi0aAqCJEALw_wcB"

  },
  {
    id: 17,
    name: "Veste en cuir",
    type: "Jackets",
    price: 189.90,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Supram",
    fit: "Regular",
    material: "Simili cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cuirsupram1.png",
    additionalImages: [
      "http://localhost:3000/images/cuirsupram2.png",
      "http://localhost:3000/images/cuirsupram3.png",
    ],
    purchaseLink: "https://www.hidden-faces.com/shop/p/racing-jacket-hiddenfaces-supram"

  },
  {
    id: 18,
    name: "Veste en cuir",
    type: "Jackets",
    price: 650,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Walk in Paris",
    fit: "Standard",
    material: "Cuir de chèvre",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cuirwalk.webp",
    additionalImages: [
      "http://localhost:3000/images/cuirwalk2.webp",
    ],
    purchaseLink: "https://walkinparis.fr/products/walk-in-paris-x-schott-nyc-la-flight-jacket-marron"

  },
  {
    id: 19,
    name: "Veste en cuir",
    type: "Jackets",
    price: 650,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Walk in Paris",
    fit: "Standard",
    material: "Cuir de vachette",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cuirwalk3.webp",
    additionalImages: [
      "http://localhost:3000/images/cuirwalk4.webp",
    ],
    purchaseLink: "https://walkinparis.fr/products/walk-in-paris-x-schott-nyc-la-flight-jacket-rouge"

  },
  {
    id: 20,
    name: "Jean",
    type: "Pants",
    price: 145.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Deviant by Loho",
    fit: "Baggy",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/deviant1.webp",
    additionalImages: [
      "http://localhost:3000/images/deviant2.webp",
      "http://localhost:3000/images/deviant3.webp",
    ],
    purchaseLink: "https://byloho.store/products/jeanz-that-alleviate2"

  },
  {
    id: 21,
    name: "Knitted Football",
    type: "Sweaters",
    price: 145.95,
    color: "Bleu, blanc, rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "House of Errors",
    fit: "Large",
    material: "Acrylic, Nylon",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/houseoferrors1.webp",
    additionalImages: [
      "http://localhost:3000/images/houseoferrors2.webp",
    ],
    purchaseLink: "https://www.houseoferrors.org/products/knitted-footy-top-zidane"

  },
  {
    id: 22,
    name: "Knitted Moto Jacket",
    type: "Sweaters",
    price: 290,
    color: "Orange, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "House of Errors",
    fit: "Regular",
    material: "Acrylic, Nylon",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/houseoferrors3.webp",
    additionalImages: [
      "http://localhost:3000/images/houseoferrors4.webp",
    ],
    purchaseLink: "https://www.houseoferrors.org/products/knitted-moto-jacket"

  },
  {
    id: 23,
    name: "Mohair Jacket",
    type: "Jackets",
    price: 1000,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "House of Errors",
    fit: "Regular",
    material: "78% Mohair, 13% Wool, 9% Nylon",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/houseoferrors5.webp",
    additionalImages: [
      "http://localhost:3000/images/houseoferrors6.webp",
      "http://localhost:3000/images/houseoferrors7.webp",
    ],
    purchaseLink: "https://www.houseoferrors.org/products/mohair-chainquilt-jacket-in-lilac"

  },
  {
    id: 24,
    name: "Mohair Jeans",
    type: "Pants",
    price: 1000,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "House of Errors",
    fit: "Large",
    material: "78% Mohair, 13% Wool, 9% Nylon",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/houseoferrors8.webp",
    additionalImages: [
      "http://localhost:3000/images/houseoferrors9.webp",
      "http://localhost:3000/images/houseoferrors6.webp",

    ],
    purchaseLink: "https://www.houseoferrors.org/products/mohair-jeans-in-lilac"

  },
  {
    id: 25,
    name: "Jean",
    type: "Pants",
    price: 120,
    color: "Noir, doré",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Jaded London",
    fit: "Large",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/jadedpant1.webp",
    additionalImages: [
      "http://localhost:3000/images/jadedpant2.webp",
    ],
    purchaseLink: "https://jadedldn.com/en-fr/products/sacred-xl-colossus-jeans"

  },
  {
    id: 26,
    name: "Jacket Fourrure",
    type: "Jackets",
    price: 210,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Jaded London",
    fit: "Regular",
    material: "Fausse Fourrure",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/jadedtop1.webp",
    additionalImages: [
      "http://localhost:3000/images/jadedtop2.webp",
    ],
    purchaseLink: "https://jadedldn.com/en-fr/products/bear-faux-fur-hooded-jacket-mens"

  },
  {
    id: 27,
    name: "Jersey",
    type: "T-Shirts",
    price: 39.99,
    color: "Rouge, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Regular",
    material: "Polyester",
    season : "été",
    imageUrl: "http://localhost:3000/images/jersey1.webp",
    additionalImages: [
      "http://localhost:3000/images/jersey2.jpg",
      "http://localhost:3000/images/jersey3.webp",
    ],
    purchaseLink: "https://www.vicinityclo.de/products/wave-jersey-infrared"

  },
  {
    id: 28,
    name: "Jersey",
    type: "T-Shirts",
    price: 19.99,
    color: "blanc, Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Boxy",
    material: "Polyester",
    season : "été",
    imageUrl: "http://localhost:3000/images/jersey4.jpg",
    additionalImages: [
      "http://localhost:3000/images/jersey5.jpg",
    ],
    purchaseLink: "https://www.bershka.com/fr/t-shirt-manches-courtes-boxy-fit-sport-mesh-c0p164876123.html?colorId=250&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZejjMTIMpWOQDXmbWtelyKv_w4W_XTLV4Pgv5FtxG1JJSG2D5JvNdYaApKsEALw_wcB"

  },
  {
    id: 29,
    name: "Jersey",
    type: "T-Shirts",
    price: 22.99,
    color: "Blanc, Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Boxy",
    material: "Polyester",
    season : "été",
    imageUrl: "http://localhost:3000/images/jersey6.avif",
    additionalImages: [
      "http://localhost:3000/images/jersey7.avif",
    ],
    purchaseLink: "https://www.bershka.com/fr/t-shirt-boxy-manches-courtes-imprim%C3%A9-c0p164185811.html?colorId=250&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZdDcoeV03wIcKCfEFZfhf4rE9KmKvGimkrOPMmdAihZ4o9by11pbjsaAkuXEALw_wcB"

  },
  {
    id: 30,
    name: "T-Shirt",
    type: "T-Shirts",
    price: 29.99,
    color: "blanc, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka",
    fit: "Large",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/jersey8.jpg",
    additionalImages: [
      "http://localhost:3000/images/jersey9.jpg",
    ],
    purchaseLink: "https://www.bershka.com/fr/t-shirt-manches-courtes-mesh-imprim%C3%A9-c0p162286104.html?colorId=800&utm_source=google&utm_medium=cpc&utm_campaign=BSK_PER_AO_GADS_FR_SHOPPING_BRAND_MIX_MAN&gad_source=1&gclid=Cj0KCQiAoae5BhCNARIsADVLzZcKriTnjzTELK6HPEKh-UflnaBzxoStWkwKsT5PH709q7qtaySUpMQaAnfCEALw_wcB"

  },
  {
    id: 31,
    name: "Pantalon de Jogging",
    type: "Pants",
    price: 91,
    color: "Gris, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Jaded London",
    fit: "Large",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/joggo1.webp",
    additionalImages: [
      "http://localhost:3000/images/joggo2.webp",
    ],
    purchaseLink: "https://jadedldn.com/products/grey-blade-joggers"

  },
  {
    id: 32,
    name: "Jorts",
    type: "Shorts",
    price: 35.19,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aelfric Eden",
    fit: "Large",
    material: "Coton",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/jorts1.webp",
    additionalImages: [
      "http://localhost:3000/images/jorts2.jpg",
      "http://localhost:3000/images/jorts3.webp",

    ],
    purchaseLink: "https://www.aelfriceden.com/collections/jorts/products/aelfric-eden-vintage-washed-jorts?variant=44348739780770"

  },
  {
    id: 33,
    name: "Jean",
    type: "Pants",
    price: 49.99,
    color: "Noir délavé",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka via Asos",
    fit: "Mega Baggy",
    material: "74% Cotton, 25% Polyester, 1% Elastane.",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/megabaggy1.avif",
    additionalImages: [
      "http://localhost:3000/images/megabaggy2.avif",
      "http://localhost:3000/images/megabaggy3.avif",

    ],
    purchaseLink: "https://www.asos.com/bershka/bershka-mega-baggy-fit-jeans-in-washed-black/prd/207254147?affid=28814&_Cj0KCQjwvpy5BhDTARIsAHSilylXxxINEUa-UeGhc7VLn-j99BXq9Xaxg3TFuZFlSsSneDw8k4DMfiYaAoJtEALw_wcB&channelref=product+search&ppcadref=21390761423%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21390761423=&utm_content=&utm_term=&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilylXxxINEUa-UeGhc7VLn-j99BXq9Xaxg3TFuZFlSsSneDw8k4DMfiYaAoJtEALw_wcB&gclsrc=aw.ds"

  },
  {
    id: 34,
    name: "Veste en cuir",
    type: "Jackets",
    price: 141.95,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Regular",
    material: "45% PU, 55% Polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nightcitycuir1.webp",
    purchaseLink: "https://nightcityclothing.com/products/faded-faux-leather-zip-through-collared-bomber-jacket?_pos=63&_fid=4d1eea5bd&_ss=c&variant=44382256267498"

  },
  {
    id: 35,
    name: "Pantalon",
    type: "Pants",
    price: 82.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "NightCity Clothing",
    fit: "Large",
    material: "Polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nightcitypant1.webp",
    purchaseLink: "https://nightcityclothing.com/products/pleated-wide-leg-trousers-with-stitch-detail"

  },
  {
    id: 36,
    name: "Ensemble en Jean",
    type: "Jackets",
    price: 112.95,
    color: "Gris Pierre",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Large",
    material: "60% Cotton, 40% Polyester",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/nightcitysetjean.webp",
    purchaseLink: "https://nightcityclothing.com/products/oversized-wide-fit-marble-print-denim-jacket-and-jeans-set"

  },
  {
    id: 37,
    name: "Blazer",
    type: "Jackets",
    price: 108.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Loose",
    material: "92% Cotton. 6% Polyester 2% Spandex",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nightcityveste1.webp",
    additionalImages: [
      "http://localhost:3000/images/nightcityveste2.webp",
    ],
    purchaseLink: "https://nightcityclothing.com/products/oversized-buckled-blazer-with-silver-accents?_pos=1&_sid=70ee56f54&_ss=r"

  },
  {
    id: 38,
    name: "Pantalon",
    type: "Pants",
    price: 119.90,
    color: "Noir, Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old Time Fever x Supram",
    fit: "Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/pant1.jpg",
    additionalImages: [
      "http://localhost:3000/images/pant2.jpg",
      "http://localhost:3000/images/pant3.jpg",

    ],
    purchaseLink: "https://www.hidden-faces.com/shop/p/chaines-et-chenes-pants-supram-oldtimefever-crznc"

  },
  {
    id: 39,
    name: "Jean",
    type: "Pants",
    price: 79.99,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Baggy",
    material: "Mohair",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/pantvicy1.webp",
    additionalImages: [
      "http://localhost:3000/images/pantvicy2.webp",
      "http://localhost:3000/images/pantvicy3.webp",

    ],
    purchaseLink: "https://www.vicinityclo.de/products/outlined-mirage-denim-black-white"

  },
  {
    id: 40,
    name: "Jean",
    type: "Pants",
    price: 208.95,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Personsoul",
    fit: "Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/personsoul1.webp",
    additionalImages: [
      "http://localhost:3000/images/personsoul2.webp",
      "http://localhost:3000/images/personsoul3.webp",

    ],
    purchaseLink: "https://www.personsoul.com/products/personsoul-alien-dirty-denim-jeans"

  },
  {
    id: 41,
    name: "Jean",
    type: "Pants",
    price: 246.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Personsoul",
    fit: "Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/personsoul4.webp",
    additionalImages: [
      "http://localhost:3000/images/personsoul5.webp",
    ],
    purchaseLink: "https://www.personsoul.com/products/personsoul-dirty-ripped-denim-baggy-jeans"

  },
  {
    id: 42,
    name: "Zip",
    type: "Sweaters",
    price: 208.95,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Personsoul",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/personsoul6.webp",
    additionalImages: [
      "http://localhost:3000/images/personsoul7.webp",
      "http://localhost:3000/images/personsoul8.webp",
      "http://localhost:3000/images/personsoul9.webp",
    ],
    purchaseLink: "https://www.personsoul.com/products/personsoul-hand-brushed-dirty-cotton-coat"

  },
  {
    id: 43,
    name: "Jupe longue en jean délavée en trois étapes",
    type: "Dress",
    price: 208.95,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Personsoul",
    fit: "Standard",
    material: "Coton",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/personsoul10.webp",
    additionalImages: [
      "http://localhost:3000/images/personsoul11.webp",
      "http://localhost:3000/images/personsoul12.webp",
      "http://localhost:3000/images/personsoul13.webp",
    ],
    purchaseLink: "https://www.personsoul.com/products/personsoul-three-stage-faded-maxi-denim-skirt"

  },
  {
    id: 44,
    name: "Zip",
    type: "Sweaters",
    price: 95,
    color: "Gris, Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sage Vision",
    fit: "Regular",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/sage1.webp",
    purchaseLink: "https://sagevision.fr/products/grey-brume-zip-sweater"

  },
  {
    id: 45,
    name: "Jacket",
    type: "Jackets",
    price: 120,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sage Vision",
    fit: "Regular",
    material: "Coton, Polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/sage2.webp",
    additionalImages: [
      "http://localhost:3000/images/sage3.webp",
      "http://localhost:3000/images/sage4.webp",
    ],
    purchaseLink: "https://sagevision.fr/products/la-piece-triple-black"

  },
  {
    id: 46,
    name: "Veste en jean",
    type: "Jackets",
    price: 69.99,
    color: "Gris délavé",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Collusion (via ASOS)",
    fit: "Large",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/vestejean1.avif",
    additionalImages: [
      "http://localhost:3000/images/vestejean2.avif",
      "http://localhost:3000/images/vestejean3.avif",
    ],
    purchaseLink: "https://www.asos.com/fr/collusion/collusion-unisex-veste-oversize-zippee-en-jean-style-charpentier-gris-delave/prd/206016912?_gl=1*gyujlr*_up*MQ..&gclid=Cj0KCQjw1Yy5BhD-ARIsAI0RbXYdrpVouXTqyhet78Tb3_KkZy0bMYMjdvIOYNgChWN506Twe27jH5waApWEEALw_wcB&gclsrc=aw.ds#colourWayId-206016913"

  },
  {
    id: 47,
    name: "Pull en maille",
    type: "Sweaters",
    price: 89.90,
    color: "Vert, Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sample project",
    fit: "Large",
    material: "Coton",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/sample4.webp",
    additionalImages: [
      "http://localhost:3000/images/sample5.webp",
      "http://localhost:3000/images/sample6.webp",
    ],
    purchaseLink: "https://sampleprojects.fr/products/requiem-reginae-monk"

  },
  {
    id: 48,
    name: "Jorts",
    type: "Shorts",
    price: 49,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Weekday",
    fit: "Baggy",
    material: "Coton organique 80%, coton recyclé 20%",
    season : "été",
    imageUrl: "http://localhost:3000/images/short1.jpg",
    additionalImages: [
      "http://localhost:3000/images/short2.jpg",
    ],
    purchaseLink: "https://www.weekday.com/en-eu/p/men/shorts/jorts/astro-denim-loose-baggy-shorts-tuned-black-1161941007/"

  },
  {
    id: 49,
    name: "Jorts",
    type: "Shorts",
    price: 59.99,
    color: "Gris/Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Large",
    material: "Denim",
    season : "été",
    imageUrl: "http://localhost:3000/images/short3.webp",
    additionalImages: [
      "http://localhost:3000/images/short4.jpg",
      "http://localhost:3000/images/short5.jpg",
    ],
    purchaseLink: "https://www.vicinityclo.de/products/v-logo-raw-jorts?variant=45228454904074&utm_source=google&utm_medium=cpc&utm_campaign=Google+Shopping&currency=EUR&country=FR&tw_source=google&tw_adid=710111873220&tw_campaign=21587756631&gad_source=1&gclid=CjwKCAiAxKy5BhBbEiwAYiW---IEch2dvnptxlbg5ob2nRz0cjvm1tkc5SpBqJkWb_xhaiJ_i1bo5BoC66wQAvD_BwE"

  },
  {
    id: 50,
    name: "Bermuda short",
    type: "Shorts",
    price: 29.99,
    color: "Bleu ciel",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Bershka (via Zalando)",
    fit: "Baggy",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/short6.webp",
    additionalImages: [
      "http://localhost:3000/images/short7.webp",
    ],
    purchaseLink: "https://www.zalando.fr/bershka-baggy-bermuda-short-en-jean-light-blue-denim-bej21s0ae-k11.html"

  },
  {
    id: 51,
    name: "Hoodie",
    type: "Sweaters",
    price: 109.90,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Supram",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/supram1.jpg",
    additionalImages: [
      "http://localhost:3000/images/supram2.jpg",
    ],
    purchaseLink: "https://www.hidden-faces.com/shop/p/hidden-faces-organization-hoodie"

  },
  {
    id: 52,
    name: "Knit",
    type: "Sweaters",
    price: 84.90,
    color: "Vert, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Supram",
    fit: "Large",
    material: "/",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/supram3.jpg",
    purchaseLink: "https://www.hidden-faces.com/shop/p/knit-supram-green"

  },
  {
    id: 53,
    name: "Jacket",
    type: "Jackets",
    price: 170,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Supraw",
    fit: "Regular",
    material: "50% wool 50% polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/supraw1.webp",
    additionalImages: [
      "http://localhost:3000/images/supraw2.webp",
      "http://localhost:3000/images/supraw3.webp",
    ],
    purchaseLink: "https://supraw.com/collections/triple-sphere-mokovel/products/breath-jacket"

  },
  {
    id: 54,
    name: "Jacket",
    type: "Jackets",
    price: 170,
    color: "Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Supraw",
    fit: "Regular",
    material: "50% wool 50% polyester",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/supraw4.webp",
    additionalImages: [
      "http://localhost:3000/images/supraw5.webp",
      "http://localhost:3000/images/supraw6.webp",
    ],
    purchaseLink: "https://supraw.com/collections/triple-sphere-mokovel/products/le-bouquet-jacket"

  },
  {
    id: 55,
    name: "Veste en cuir",
    type: "Jackets",
    price: 219.95,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Davril Supply",
    fit: "Boxy",
    material: "Simili cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/vesteencuirdavril.jpg",
    additionalImages: [
      "http://localhost:3000/images/vesteencuirdavril2.jpg",
    ],
    purchaseLink: "https://davrilsupply.com/products/da-owjct-0000851001"

  },
  {
    id: 56,
    name: "Veste en jean",
    type: "Jackets",
    price: 580,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Walk in Paris x Regular Kid",
    fit: "Standard",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/vestewalk1.webp",
    additionalImages: [
      "http://localhost:3000/images/vestewalk2.webp",
    ],
    purchaseLink: "https://walkinparis.fr/products/walk-in-paris-x-regular-kid-veste-en-jean-reworked-beige"

  },
  {
    id: 57,
    name: "Cardigan",
    type: "Cardigan",
    price: 120,
    color: "Vert, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old Time Fever",
    fit: "Large",
    material: "Mohair",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/card1.jpg",
    additionalImages: [
      "http://localhost:3000/images/card2.jpg",
    ],
    purchaseLink: "https://www.oldtimefever.com/original/p/cardigan-de-la-brume-la-riviere"

  },

  {
    id: 58,
    name: "Track Jacket",
    type: "Jackets",
    price: 89.99,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Regular",
    material: "Nylon",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/vicy1.webp",
    additionalImages: [
      "http://localhost:3000/images/vicy2.webp",
      "http://localhost:3000/images/vicy3.webp",
    ],
    purchaseLink: "https://www.vicinityclo.de/products/track-jacket-v4-grey"

  },
  {
    id: 59,
    name: "Track pants",
    type: "Pants",
    price: 79.99,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Baggy",
    material: "Nylon",
    season : "été, automne, printemps",
    imageUrl: "http://localhost:3000/images/vicy4.webp",
    additionalImages: [
      "http://localhost:3000/images/vicy5.webp",
      "http://localhost:3000/images/vicy6.webp",
    ],
    purchaseLink: "https://www.vicinityclo.de/products/track-pants-v4-grey?pr_prod_strat=jac&pr_rec_id=0012c9632&pr_rec_pid=8490241491210&pr_ref_pid=8490243260682&pr_seq=uniform"

  },
  {
    id: 60,
    name: "Knitwear",
    type: "Sweaters",
    price: 79.99,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Vicinity",
    fit: "Boxy",
    material: "Coton",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/vicy7.jpg",
    additionalImages: [
      "http://localhost:3000/images/vicy8.webp",
      "http://localhost:3000/images/vicy9.jpg",
    ],
    purchaseLink: "https://www.vicinityclo.de/products/v-logo-knitwear-black"

  },
  {
    id: 61,
    name: "Jean",
    type: "Pants",
    price: 60,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Weekday",
    fit: "Baggy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/weekday1.jpg",
    additionalImages: [
      "http://localhost:3000/images/weekday2.jpg",
      "http://localhost:3000/images/weekday3.jpg",

    ],
    purchaseLink: "https://www.weekday.com/en-eu/p/men/jeans/loose-fit/astro-loose-baggy-jeans-blue-rinse-1114252018/"

  },
  {
    id: 62,
    name: "Knitwear",
    type: "Sweaters",
    price: 90,
    color: "Bleu, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Weyz",
    fit: "Regular",
    material: "Nylon",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/weyzknit1.webp",
    additionalImages: [
      "http://localhost:3000/images/weyzknit2.webp",
    ],
    purchaseLink: "https://weyzclothing.com/products/fluffy-knitwear-blue"

  },
  {
    id: 63,
    name: "Sherpa Jacket",
    type: "Jackets",
    price: 150,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Weyz",
    fit: "Regular",
    material: "Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/weyzsherpa1.jpg",
    additionalImages: [
      "http://localhost:3000/images/weyzsherpa2.jpg",
    ],
    purchaseLink: "https://weyzclothing.com/products/fluffy-sherpa-jacket-light-grey"

  },
  {
    id: 64,
    name: "Pull",
    type: "Sweaters",
    price: 39.95,
    color: "Gris, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Zara",
    fit: "Regular",
    material: "67% polyester, 17% acrylique, 9% laine, 7% polyamide",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/zara1.jpg",
    additionalImages: [
      "http://localhost:3000/images/zara2.jpg",
      "http://localhost:3000/images/zara3 .jpg",

    ],
    purchaseLink: "https://www.zara.com/fr/fr/pull-en-jacquard-texture-brosse-p03920370.html?v1=380924539&v2=2432266"

  },
  {
    id: 65,
    name: "Veste en cuir",
    type: "Jackets",
    price: 165,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aryes",
    fit: "Boxy",
    material: "Simili cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/aryes1.webp",
    additionalImages: [
      "http://localhost:3000/images/aryes2.webp",
      "http://localhost:3000/images/aryes3.webp",
    ],
    purchaseLink: "https://shoparyes.fr/products/la-veste-incarnee"

  },
  {
    id: 66,
    name: "Jersey",
    type: "T-Shirts",
    price: 55,
    color: "Orange, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aryes",
    fit: "Large",
    material: "Polyester",
    season : "été",
    imageUrl: "http://localhost:3000/images/aryes4.webp",
    additionalImages: [
      "http://localhost:3000/images/aryes5.webp",

    ],
    purchaseLink: "https://shoparyes.fr/products/le-maillot"

  },
  {
    id: 67,
    name: "Jersey",
    type: "T-Shirts",
    price: 65,
    color: "Rose, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Aryes",
    fit: "Large",
    material: "Polyester",
    season : "été",
    imageUrl: "http://localhost:3000/images/aryes6.webp",
    additionalImages: [
      "http://localhost:3000/images/aryes7.webp",
    ],
    purchaseLink: "https://shoparyes.fr/products/maillot-mesh?pr_prod_strat=e5_desc&pr_rec_id=4f95166a4&pr_rec_pid=9394692948232&pr_ref_pid=8354517942536&pr_seq=uniform"

  },
  {
    id: 68,
    name: "Zip",
    type: "Jackets",
    price: 93.95,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only Curse",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/curse1.webp",
    additionalImages: [
      "http://localhost:3000/images/curse2.webp",
    ],
    purchaseLink: "https://onlycurse.com/products/ravage-zip-up-red"

  },
  {
    id: 69,
    name: "Veste en cuir",
    type: "Jackets",
    price: 237.95,
    color: "Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only Curse",
    fit: "Regular",
    material: "Simili cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/curse3.webp",
    additionalImages: [
      "http://localhost:3000/images/curse4.webp",
    ],
    purchaseLink: "https://onlycurse.com/products/celestial-leather-jacket-white"

  },
  {
    id: 70,
    name: "Longsleeve",
    type: "Sweaters",
    price: 83.95,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only Curse",
    fit: "Regular",
    material: "Coton",
    season : "printemps, été",
    imageUrl: "http://localhost:3000/images/curse5.webp",
    additionalImages: [
      "http://localhost:3000/images/curse6.webp",
      "http://localhost:3000/images/curse7.webp",
    ],
    purchaseLink: "https://onlycurse.com/products/sigil-longsleeve-black"

  },
  {
    id: 71,
    name: "Jersey",
    type: "T-Shirts",
    price: 83.95,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only Curse",
    fit: "Regular",
    material: "/",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/curse8.webp",
    additionalImages: [
      "http://localhost:3000/images/curse9.webp",
    ],
    purchaseLink: "https://onlycurse.com/products/wraith-jersey-black"

  },
  {
    id: 72,
    name: "Doudoune sans manche",
    type: "Jackets",
    price: 142.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only Curse",
    fit: "Regular",
    material: "/",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/curse10.webp",
    additionalImages: [
      "http://localhost:3000/images/curse11.webp",
      "http://localhost:3000/images/curse12.webp",
    ],
    purchaseLink: "https://onlycurse.com/products/renaissance-vest?pr_prod_strat=e5_desc&pr_rec_id=105f8a8c5&pr_rec_pid=8344133730540&pr_ref_pid=8344228724972&pr_seq=uniform"

  },
  {
    id: 73,
    name: "Jean",
    type: "Pants",
    price: 220,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Cyvist",
    fit: "Baggy",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cyvist1.webp",
    additionalImages: [
      "http://localhost:3000/images/cyvist1.webp",
    ],
    purchaseLink: "https://cyvist.com/products/komodo-denim"

  },
  {
    id: 74,
    name: "Jacket",
    type: "Jackets",
    price: 260,
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Cyvist",
    fit: "Boxy",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/cyvist3.webp",
    additionalImages: [
      "http://localhost:3000/images/cyvist4.webp",
    ],
    purchaseLink: "https://cyvist.com/products/invertweb-jacket"

  },
  {
    id: 75,
    name: "Sweater",
    type: "Sweaters",
    price: 149,
    color: "Bleu, gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Five Four Five",
    fit: "Décontracté",
    material: "63% alpaca 37% polyamide",
    season : "automne",
    imageUrl: "http://localhost:3000/images/fivefour1.webp",
    additionalImages: [
      "http://localhost:3000/images/fivefour2.webp",
      "http://localhost:3000/images/fivefour3.webp",
    ],
    purchaseLink: "https://fivefourfive.it/products/545-alpaca-faded-sweater-glacier-blue"

  },
  {
    id: 76,
    name: "Sweater",
    type: "Sweaters",
    price: 149,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Five Four Five",
    fit: "Décontracté",
    material: "63% alpaca 37% polyamide",
    season : "automne",
    imageUrl: "http://localhost:3000/images/fivefour4.webp",
    additionalImages: [
      "http://localhost:3000/images/fivefour5.webp",
    ],
    purchaseLink: "https://fivefourfive.it/products/545-alpaca-faded-sweater-hortensia-pink"

  },
  {
    id: 77,
    name: "Jean",
    type: "Pants",
    price: 135,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Five Four Five",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/fivefour6.webp",
    additionalImages: [
      "http://localhost:3000/images/fivefour5.webp",
    ],
    purchaseLink: "https://fivefourfive.it/products/545-washed-denim-02-soft-pink"

  },
  {
    id: 78,
    name: "Jean",
    type: "Pants",
    price: 135,
    color: "Bleu délavé",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Five Four Five",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/fivefour7.webp",
    additionalImages: [
      "http://localhost:3000/images/fivefour8.webp",
    ],
    purchaseLink: "https://fivefourfive.it/products/545-inside-out-denim-02-washed-blue-1"

  },
  {
    id: 79,
    name: "Chemise",
    type: "T-Shirts",
    price: 105,
    color: "Bleu, rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Five Four",
    fit: "Boxy",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/fivefour9.webp",
    additionalImages: [
      "http://localhost:3000/images/fivefour10.webp",
    ],
    purchaseLink: "https://fivefourfive.it/products/545-chainstitch-striped-shirt-light-blue-red?pr_prod_strat=jac&pr_rec_id=d62244e11&pr_rec_pid=9176835424584&pr_ref_pid=9177834094920&pr_seq=uniform"

  },
  {
    id: 80,
    name: "Puller",
    type: "Sweaters",
    price: 129,
    color: "Bleu, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/hwa1.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa2.webp",
      "http://localhost:3000/images/hwa3.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/jackets/products/eclipse-polar-fleece-navy?variant=47747820486990"

  },
  {
    id: 81,
    name: "Polar",
    type: "Sweaters",
    price: 129,
    color: "Bleu, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/hwa1.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa2.webp",
      "http://localhost:3000/images/hwa3.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/jackets/products/eclipse-polar-fleece-navy?variant=47747820486990"

  },
  {
    id: 82,
    name: "Football Knit",
    type: "Sweaters",
    price: 119,
    color: "Bleu, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "été, automne, printemps",
    material: "54% viscose/31% polyester/15% nylon",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/hwa4.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa5.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/all/products/football-knit-bleu-ciel?variant=48384608436558"

  },
  {
    id: 83,
    name: "Football Knit",
    type: "Sweaters",
    price: 119,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "54% viscose/31% polyester/15% nylon",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/hwa6.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa7.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/products/football-knit-creme?pr_prod_strat=jac&pr_rec_id=bd97bbd02&pr_rec_pid=8972247859534&pr_ref_pid=8972263358798&pr_seq=uniform&variant=48384614498638"

  },
  {
    id: 84,
    name: "Football Knit",
    type: "Sweaters",
    price: 119,
    color: "Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "54% viscose/31% polyester/15% nylon",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/hwa8.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa9.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/all/products/football-knit-vert?variant=48384616366414"

  },
  {
    id: 85,
    name: "Cargo Short",
    type: "Pants",
    price: 109,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "Coton",
    season : "été, automne, printemps",
    imageUrl: "http://localhost:3000/images/hwa10.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa11.webp",
      "http://localhost:3000/images/hwa12.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/pants/products/convertible-cargo-peach-blush?variant=48053895627086"

  },
  {
    id: 86,
    name: "Cargo Short",
    type: "Pants",
    price: 109,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "HWA",
    fit: "Large",
    material: "Coton",
    season : "été, automne, printemps",
    imageUrl: "http://localhost:3000/images/hwa13.webp",
    additionalImages: [
      "http://localhost:3000/images/hwa14.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/products/convertible-cargo-slate-green?pr_prod_strat=e5_desc&pr_rec_id=3d8fe0054&pr_rec_pid=8919903699278&pr_ref_pid=8881788977486&pr_seq=uniform&variant=48197060657486"

  },
  {
    id: 87,
    name: "Jogging",
    type: "Pants",
    price: 110,
    color: "Rose, vert, marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named1.webp",
    additionalImages: [
      "http://localhost:3000/images/named2.webp",
      "http://localhost:3000/images/named3.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/forbidden-sweatpants-natural"

  },
  {
    id: 88,
    name: "Zip  Hoodie",
    type: "Jackets",
    price: 123,
    color: "Rose, Marron, Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named4.webp",
    additionalImages: [
      "http://localhost:3000/images/named5.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/forbidden-zip-hoodie-natural?pr_prod_strat=jac&pr_rec_id=6b1280031&pr_rec_pid=8768736723258&pr_ref_pid=8768764674362&pr_seq=uniform"

  },
  {
    id: 89,
    name: "Jogging",
    type: "Pants",
    price: 117,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Super Baggy",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named6.webp",
    additionalImages: [
      "http://localhost:3000/images/named7.webp",
      "http://localhost:3000/images/named8.webp",,
    ],
    purchaseLink: "https://humanwithattitude.com/collections/jackets/products/eclipse-polar-fleece-navy?variant=47747820486990"

  },
  {
    id: 90,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 141,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named9.webp",
    additionalImages: [
      "http://localhost:3000/images/named10.webp",
      "http://localhost:3000/images/named11.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/crash-rhinestone-zip-hoodie-black?pr_prod_strat=jac&pr_rec_id=5c62ff6c8&pr_rec_pid=14679250895229&pr_ref_pid=14679254335869&pr_seq=uniform"

  },
  {
    id: 91,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 135,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named12.webp",
    additionalImages: [
      "http://localhost:3000/images/named13.webp",
      "http://localhost:3000/images/named14.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/prey-faux-fur-zip-hoodie-pink-camo"

  },
  {
    id: 92,
    name: "Jogging",
    type: "Pants",
    price: 110,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "70% coton organique, 30% Polyester recyclé",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named15.webp",
    additionalImages: [
      "http://localhost:3000/images/named16.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/prey-oversized-sweatpants-pink-camo?pr_prod_strat=jac&pr_rec_id=9134aa587&pr_rec_pid=14664427471229&pr_ref_pid=14664355873149&pr_seq=uniform"

  },
  {
    id: 93,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 141,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named17.webp",
    additionalImages: [
      "http://localhost:3000/images/named18.webp",
      "http://localhost:3000/images/named19.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/thorn-zip-hoodie-red"

  },
  {
    id: 94,
    name: "Jogging",
    type: "Pants",
    price: 117,
    color: "Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Named Collective",
    fit: "Large",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/named20.webp",
    additionalImages: [
      "http://localhost:3000/images/named21.webp",
      "http://localhost:3000/images/named22.webp",
    ],
    purchaseLink: "https://namedcollective.com/products/thorn-sweatpants-red?pr_prod_strat=jac&pr_rec_id=ae4fe7dec&pr_rec_pid=8070549111098&pr_ref_pid=8070545539386&pr_seq=uniform"

  },
  {
    id: 95,
    name: "Jean",
    type: "Pants",
    price: 300,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "No Faith Studios",
    fit: "Baggy",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nofaith1.webp",
    additionalImages: [
      "http://localhost:3000/images/nofaith2.webp",
      "http://localhost:3000/images/nofaith3.webp",
    ],
    purchaseLink: "https://nofaithstudios.com/products/rusted-used-dune-denim"

  },
  {
    id: 96,
    name: "Jean",
    type: "Pants",
    price: 300,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "No Faith Studios",
    fit: "Baggy",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nofaith4.webp",
    additionalImages: [
      "http://localhost:3000/images/nofaith5.webp",
    ],
    purchaseLink: "https://nofaithstudios.com/products/black-artisenal-denim?pr_prod_strat=e5_desc&pr_rec_id=a4739fc48&pr_rec_pid=9132023578949&pr_ref_pid=9132013388101&pr_seq=uniform-"

  },
  {
    id: 97,
    name: "Bomber en cuir",
    type: "Jackets",
    price: 990,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "No Faith Studios",
    fit: "Large",
    material: "100% cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/nofaith6.webp",
    additionalImages: [
      "http://localhost:3000/images/nofaith7.webp",
      "http://localhost:3000/images/nofaith8.webp",
    ],
    purchaseLink: "https://nofaithstudios.com/products/black-dried-concrete-leather-bomer"

  },
  {
    id: 98,
    name: "Veste",
    type: "Jackets",
    price: 490,
    color: "Denim",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "No Faith Studios",
    fit: "Boxy",
    material: "Denim",
    season : "Hiver,automne",
    imageUrl: "http://localhost:3000/images/nofaith9.webp",
    additionalImages: [
      "http://localhost:3000/images/nofaith10.webp",
      "http://localhost:3000/images/nofaith11.webp",
    ],
    purchaseLink: "https://nofaithstudios.com/products/denim-nfs-camouflage-heavy-bomber"

  },
  {
    id: 99,
    name: "Jacket",
    type: "Jackets",
    price: 125,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nubes Studio",
    fit: "Regular",
    material: "Coton denim",
    season : "automne, printemps, été",
    imageUrl: "http://localhost:3000/images/nubes1.webp",
    additionalImages: [
      "http://localhost:3000/images/nubes2.webp",
      "http://localhost:3000/images/nubes3.webp",
    ],
    purchaseLink: "https://www.nubes-studio.com/products/spirit-jacket-faded-blue"

  },
  {
    id: 100,
    name: "Jacket",
    type: "Jackets",
    price: 125,
    color: "Bleu brut",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nubes Studio",
    fit: "Regular",
    material: "Coton denim",
    season : "été, automne, printemps",
    imageUrl: "http://localhost:3000/images/nubes4.webp",
    additionalImages: [
      "http://localhost:3000/images/nubes5.webp",
      "http://localhost:3000/images/nubes3.webp",

    ],
    purchaseLink: "https://www.nubes-studio.com/products/spirit-jacket-raw-blue"

  },
  {
    id: 101,
    name: "Short",
    type: "Shorts",
    price: 65,
    color: "Bleu brut",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nubes Studio",
    fit: "Regular",
    material: "Coton denim",
    season : "été",
    imageUrl: "http://localhost:3000/images/nubes6.webp",
    additionalImages: [
      "http://localhost:3000/images/nubes7.webp",
      "http://localhost:3000/images/nubes3.webp",
    ],
    purchaseLink: "https://www.nubes-studio.com/products/spirit-short-faded-blue"

  },
  {
    id: 102,
    name: "Short",
    type: "Shorts",
    price: 65,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nubes Studio",
    fit: "Regular",
    material: "Coton denim",
    season : "été",
    imageUrl: "http://localhost:3000/images/nubes8.webp",
    additionalImages: [
      "http://localhost:3000/images/nubes9.webp",
      "http://localhost:3000/images/nubes3.webp",
    ],
    purchaseLink: "https://www.nubes-studio.com/products/spirit-short-faded-blue-1"

  },
  {
    id: 103,
    name: "T-Shirt",
    type: "T-Shirts",
    price: 65,
    color: "Rouge, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Orem studio",
    fit: "Boxy",
    material: "coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/orem1.webp",
    additionalImages: [
      "http://localhost:3000/images/orem2.webp",
    ],
    purchaseLink: "https://oremstudio.com/products/cowboy-red-shirt"

  },
  {
    id: 104,
    name: "T-Shirt",
    type: "T-Shirts",
    price: 65,
    color: "Bleu, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Orem studio",
    fit: "Boxy",
    material: "coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/orem5.webp",
    additionalImages: [
      "http://localhost:3000/images/orem6.webp",
    ],
    purchaseLink: "https://oremstudio.com/products/cowboy-blue-shirt"

  },
  {
    id: 105,
    name: "Crewneck",
    type: "Sweaters",
    price: 75,
    color: "Vert, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Orem studio",
    fit: "Large",
    material: "80% coton, 20% polyester",
    season : "automne printemps",
    imageUrl: "http://localhost:3000/images/orem3.webp",
    additionalImages: [
      "http://localhost:3000/images/orem4.webp",
    ],
    purchaseLink: "https://oremstudio.com/products/crewneck-vandal-vert"

  },
  {
    id: 106,
    name: "Jacket",
    type: "Jackets",
    price: 189.90,
    color: "Violet, noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Purple Place",
    fit: "Regular",
    material: "Coton",
    season : "Hiver, automne, printemps",
    imageUrl: "http://localhost:3000/images/purple1.webp",
    additionalImages: [
      "http://localhost:3000/images/purple2.jpg",
      "http://localhost:3000/images/purple3.jpg",
    ],
    purchaseLink: "https://purpleplaceclothing.com/products/moon-jacket-purple"

  },
  {
    id: 107 ,
    name: "Chemise",
    type: "T-Shirts",
    price: 74.90,
    color: "Noir, bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Purple place",
    fit: "Large",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/purple4.webp",
    additionalImages: [
      "http://localhost:3000/images/purple5.webp",
    ],
    purchaseLink: "https://purpleplaceclothing.com/products/moon-jacket-purple"

  },
  {
    id: 108,
    name: "Knitwear",
    type: "Sweaters",
    price: 89.90,
    color: "Noir, Violet",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Purple Place",
    fit: "Large",
    material: "6% laine de mérinos, 20% acrylique, 20% nylon, 54% polyester",
    season : "Hiver, automne  ",
    imageUrl: "http://localhost:3000/images/purple6.webp",
    additionalImages: [
      "http://localhost:3000/images/purple7.webp",
      "http://localhost:3000/images/purple8.webp",
    ],
    purchaseLink: "https://purpleplaceclothing.com/products/knitwear-purple-place-black"

  },
  {
    id: 109,
    name: "Puffer",
    type: "Jackets",
    price: 222,
    color: "Noir, Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "sxvsu",
    fit: "Large, boxy",
    material: "Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/sxvsu1.webp",
    additionalImages: [
      "http://localhost:3000/images/sxvsu2.webp",
    ],
    purchaseLink: "https://sxvsu.com/collections/0019/products/ash-puffer-blood"

  },
  {
    id: 110,
    name: "Jean",
    type: "Pants",
    price: 266,
    color: "Noir, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "sxvsu",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/sxvsu3.jpg",
    additionalImages: [
      "http://localhost:3000/images/sxvsu4.webp",
    ],
    purchaseLink: "https://sxvsu.com/collections/0019/products/dimensio-denim-grey"

  },
  {
    id: 111,
    name: "Jean",
    type: "Pants",
    price: 271,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "sxvsu",
    fit: "Large",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/sxvsu5.jpg",
    additionalImages: [
      "http://localhost:3000/images/sxvsu4.webp",
    ],
    purchaseLink: "https://sxvsu.com/collections/0019/products/dimension-denim-black"

  },
  {
    id: 112,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 65,
    color: "Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Synical",
    fit: "Boxy",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/syni1.webp",
    purchaseLink: "https://synicalglobal.com/products/sun-fade-zip-up-moss"

  },
  {
    id: 113,
    name: "Jersey",
    type: "T-Shirts",
    price: 80.95,
    color: "Blanc, Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Synical",
    fit: "Large",
    material: "Micromesh material",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/syni2.webp",
    additionalImages: [
      "http://localhost:3000/images/syni3.webp",
      "http://localhost:3000/images/syni4.webp",
    ],
    purchaseLink: "https://synicalglobal.com/products/syn-liberty-jersey-white  "

  },
  {
    id: 114,
    name: "Jersey",
    type: "T-Shirts",
    price: 55.95,
    color: "Noir, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Synical",
    fit: "Boxy",
    material: "Micromesh material",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/syni5.webp",
    additionalImages: [
      "http://localhost:3000/images/syni6.webp",
      "http://localhost:3000/images/syni7.webp",
    ],
    purchaseLink: "https://synicalglobal.com/products/4-year-soccer-jersey-black"

  },
  {
    id: 115 ,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 65.95,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Synical",
    fit: "Boxy",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/syni8.webp",
    purchaseLink: "https://synicalglobal.com/products/sun-fade-zip-up-pink"

  },
  {
    id: 116,
    name: "Zip Hoodie",
    type: "Jackets",
    price: 65.95,
    color: "Bleu ciel",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Synical",
    fit: "Boxy",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/syni9.webp",
    purchaseLink: "https://synicalglobal.com/products/sun-fade-zip-up-sky-blue"

  },
  {
    id: 117,
    name: "Knitwear",
    type: "Sweaters",
    price: 89.90,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "/",
    season : "Automne, printemps",
    imageUrl: "http://localhost:3000/images/tern1.webp",
    purchaseLink: "https://in.tern.et/products/black-knit-wiki-tern"

  },
  {
    id: 118,
    name: "Knitwear",
    type: "Sweaters",
    price: 89.90,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "/",
    season : "Printemps, automne",
    imageUrl: "http://localhost:3000/images/tern2.webp",
    purchaseLink: "https://in.tern.et/products/knit-wiki-tern"

  },
  {
    id: 119,
    name: "Longsleeve",
    type: "Sweaters",
    price: 59.90,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "Coton",
    season : "été, automne, printemps",
    imageUrl: "http://localhost:3000/images/tern3.webp",
    purchaseLink: "https://in.tern.et/products/caramel-tech-tee-longsleeve-tern"

  },
  {
    id: 120,
    name: "T-shirt",
    type: "T-Shirts",
    price: 49.90,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Large",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/tern4.webp",
    purchaseLink: "https://in.tern.et/products/sakura-tech-tee-tern%C2%AE"

  },
  {
    id: 121,
    name: "Jersey",
    type: "T-Shirts",
    price: 64.90,
    color: "Jaune, bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "/",
    season : "été",
    imageUrl: "http://localhost:3000/images/tern5.webp",
    additionalImages: [
      "http://localhost:3000/images/tern6.webp",
    ],
    purchaseLink: "https://in.tern.et/products/bootleg-04-soccer-jersey-tern%C2%AE"

  },
  {
    id: 122,
    name: "Knitwear",
    type: "Sweaters",
    price: 109.90,
    color: "Violet",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "9% Merino Wool, 33% Nylon & 58% Acrylic",
    season : "automne",
    imageUrl: "http://localhost:3000/images/tern7.webp",
    purchaseLink: "https://in.tern.et/products/purple-light-leak-knit-tern%C2%AE"

  },
  {
    id: 123,
    name: "Jacket",
    type: "Jackets",
    price: 165,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "Nylon",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/tern8.webp",
    additionalImages: [
      "http://localhost:3000/images/tern9.webp",
      "http://localhost:3000/images/tern10.webp",
    ],
    purchaseLink: "https://in.tern.et/products/ocean-hardshell-jacket-1-0-tern%C2%AE"

  },
  {
    id: 124,
    name: "Knitwear",
    type: "Sweaters",
    price: 109.90,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "9% Merino Wool, 33% Nylon & 58% Acrylic",
    season : "automne",
    imageUrl: "http://localhost:3000/images/tern11.webp",
    purchaseLink: "https://in.tern.et/products/blue-light-leak-knit-tern%C2%AE"

  },
  {
    id: 125,
    name: "Veste en jean",
    type: "Jackets",
    price: 139.90,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Tern",
    fit: "Regular",
    material: "Coton",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/tern12.webp",
    purchaseLink: "https://in.tern.et/products/archive-denim-jacket-tern"

  },
  {
    id: 126,
    name: "Veste en cuir",
    type: "Jackets",
    price: 149.90,
    color: "Vert, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Xym",
    fit: "Large",
    material: "Simili cuir",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/xym1.webp",
    additionalImages: [
      "http://localhost:3000/images/xym2.webp",
      "http://localhost:3000/images/xym3.webp",
    ],
    purchaseLink: "https://xymshop.fr/products/leather-jacket-foret?variant=44587602280715"

  },
  {
    id: 127,
    name: "Veste en jean",
    type: "Jackets",
    price: 110,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "808 vision",
    fit: "Regular",
    material: "Denim",
    season : "automne, printemps",
    imageUrl: "http://localhost:3000/images/vision1.webp",
    additionalImages: [
      "http://localhost:3000/images/vision2.webp",
      "http://localhost:3000/images/vision3.webp",
    ],
    purchaseLink: "https://808.vision/products/jacket-jeans-808-bleu"

  },
  {
    id: 128,
    name: "Jean",
    type: "Pants",
    price: 110,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "808 vision",
    fit: "Large",
    material: "Denim",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/vision4.webp",
    additionalImages: [
      "http://localhost:3000/images/vision5.webp",
    ],
    purchaseLink: "https://808.vision/products/jeans-vision-bleu?pr_prod_strat=jac&pr_rec_id=55e74ad4f&pr_rec_pid=8441721979144&pr_ref_pid=8441726370056&pr_seq=uniform"

  },
  {
    id: 129,
    name: "Trench Coat",
    type: "Vest",
    price: 89.99,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Asos Design",
    fit: "Classique",
    material: "Polyester",
    season : "Automne",
    imageUrl: "http://localhost:3000/images/trench1.avif",
    additionalImages: [
      "http://localhost:3000/images/trench2.avif",
    ],
    purchaseLink: "hhttps://www.asos.com/fr/asos-design/asos-design-manteau-long-aspect-laine-bleu-marine/prd/206029737?affid=28924&_CjwKCAiAp4O8BhAkEiwAqv2UqGYYeCLKdQgiYhJdHLP43aiRZyKpTI80isFKlhYcLfhdqBsB4JzGSBoCrn8QAvD_BwE&channelref=product+search&ppcadref=21506107413%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21506107413&utm_content=&utm_term=&gad_source=1&gclid=CjwKCAiAp4O8BhAkEiwAqv2UqGYYeCLKdQgiYhJdHLP43aiRZyKpTI80isFKlhYcLfhdqBsB4JzGSBoCrn8QAvD_BwE&gclsrc=aw.ds"

  },
  {
    id: 130,
    name: "Trench Coat",
    type: "Vest",
    price: 64.99,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Only & Sons",
    fit: "Classique",
    material: "Polyester",
    season : "Automne",
    imageUrl: "http://localhost:3000/images/trench3.avif",
    additionalImages: [
      "http://localhost:3000/images/trench4.avif",
    ],
    purchaseLink: "https://www.asos.com/fr/only-sons/only-sons-trench-coat-a-epaules-tombantes-beige/prd/206300249?affid=28924&_CjwKCAiAp4O8BhAkEiwAqv2UqJbZ6Xv8doTQg8qI7WDOm-is1aMJLgBxgLBJdVLHfd2DaH--hFYBlBoCBx8QAvD_BwE&channelref=product+search&ppcadref=21506107413%7C%7C&utm_source=google&utm_medium=cpc&utm_campaign=21506107413&utm_content=&utm_term=&gad_source=1&gclid=CjwKCAiAp4O8BhAkEiwAqv2UqJbZ6Xv8doTQg8qI7WDOm-is1aMJLgBxgLBJdVLHfd2DaH--hFYBlBoCBx8QAvD_BwE&gclsrc=aw.ds"

  },
  {
    id: 131,
    name: "Trench Coat",
    type: "Vest",
    price: 350.95,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Loose",
    material: "Polyester",
    season : "Automne",
    imageUrl: "http://localhost:3000/images/nightcity7.webp",
    additionalImages: [
      "http://localhost:3000/images/nightcity8.webp",
    ],
    purchaseLink: "https://nightcityclothing.com/products/longline-buttonless-overcoat-with-notch-lapels"

  },
  {
    id: 132,
    name: "Jacket",
    type: "Jackets",
    price: 120.95,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Loose",
    material: "50.1% Acrylic, 23.5% Polyester, 26.4% Nylon",
    season : "Automne, printemps",
    imageUrl: "http://localhost:3000/images/nightcity.webp",
    purchaseLink: "https://nightcityclothing.com/products/wave-pattern-drop-shoulder-two-way-zip-hooded-jacket"

  },
  {
    id: 133,
    name: "Jacket",
    type: "Jackets",
    price: 203.95,
    color: "Noir, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Classique",
    material: "Polyester",
    season : "Hiver",
    imageUrl: "http://localhost:3000/images/nightcity2.webp",
    additionalImages: [
      "http://localhost:3000/images/nightcity2.webp",
    ],
    purchaseLink: "https://nightcityclothing.com/products/two-tone-metallic-puffer-jacket-with-rosette-detail"

  },
  {
    id: 134,
    name: "Blazer",
    type: "Vest",
    price: 153.95,
    color: "Champagne",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Loose",
    material: "Polyester",
    season : "Automne, printemps",
    imageUrl: "http://localhost:3000/images/nightcity4.webp",
    purchaseLink: "https://nightcityclothing.com/products/oversized-checker-single-breasted-blazer-with-flap-pockets?variant=54905338167678"

  },
  {
    id: 135,
    name: "Jacket",
    type: "Jackets",
    price: 174.95,
    color: "Noir, Rouge",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nightcity Clothing",
    fit: "Loose",
    material: "100% PU",
    season : "Automne",
    imageUrl: "http://localhost:3000/images/nightcity5.webp",
    additionalImages: [
      "http://localhost:3000/images/nightcity6.webp"
    ],
    purchaseLink: "https://nightcityclothing.com/products/gothic-paint-smudge-faux-leather-motorcycle-jacket"

  },
  {
    id: 136,
    name: "Jacket",
    type: "Jackets",
    price: 240,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Lafam",
    fit: "Classique",
    material: "10% COTTON, 45% POLYESTER AND 45% VISCOSE.",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/lafam1.webp",
    additionalImages: [
      "http://localhost:3000/images/lafam2.webp",
    ],
    purchaseLink: "https://www.lafamamsterdam.com/collections/jackets/products/brown-distressed-jacket-1"

  },
  {
    id: 137,
    name: "Jacket",
    type: "Jackets",
    price: 210,
    color: "Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Lafam",
    fit: "Classique",
    material: "100% vegan leather",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/lafam3.webp",
    additionalImages: [
      "http://localhost:3000/images/lafam4.webp",
    ],
    purchaseLink: "https://www.lafamamsterdam.com/collections/jackets/products/new-green-varsity-jacket"

  },
  {
    id: 138,
    name: "Jacket",
    type: "Jackets",
    price: 170,
    color: "Bleu",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Lafam",
    fit: "Classique",
    material: "/",
    season : "Automne, printemps",
    imageUrl: "http://localhost:3000/images/lafam5.webp",
    additionalImages: [
      "http://localhost:3000/images/lafam6.webp",
    ],
    purchaseLink: "https://www.lafamamsterdam.com/collections/jackets/products/denim-logo-jacket"

  },
  {
    id: 139,
    name: "Chaussure",
    type: "Shoes",
    price: 119.95,
    color: "Marron, Violet, jaune",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: " Imitation cuir / textile",
    season : "Printemps, été",
    imageUrl: "http://localhost:3000/images/shoes1.webp",
    additionalImages: [
      "http://localhost:3000/images/shoes2.webp",
    ],
    purchaseLink: "https://www.zalando.fr/adidas-originals-gazelle-indoor-unisex-baskets-basses-maroonalmost-yellowpreloved-brown-ad115o1rp-g11.html?ssku=AD115O1RP-G110125000&lang=fr&otid=default&wmc=SEM330_NB_GO._7455046171_205187277_11471707197.&opc=2211&mpp=google|v1||pla-18283950120||9111740||g|c||56861993277||pla|AD115O1RP-G110125000|18283950120|1|&gclsrc=aw.ds&gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUHVUQi5raEeMo8vB493p2J-hC79afWQZuXdph128s44gFEAeyNSazxoC45AQAvD_BwE"

  },
  {
    id: 140,
    name: "Chaussure",
    type: "Shoes",
    price: 110,
    color: "Marron, jaune",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: "/",
    season : "Automne, Hiver",
    imageUrl: "http://localhost:3000/images/shoes3.avif",
    additionalImages: [
      "http://localhost:3000/images/shoes4.avif",
    ],
    purchaseLink: "https://www.adidas.fr/chaussure-gazelle-adv/JP5857.html"

  },
  {
    id: 141,
    name: "Chaussure",
    type: "Shoes",
    price: 120,
    color: "Rouge, Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: "/",
    season : "été",
    imageUrl: "http://localhost:3000/images/shoes5.avif",
    additionalImages: [
      "http://localhost:3000/images/shoes6.avif",
    ],
    purchaseLink: "https://www.adidas.fr/chaussure-gazelle-indoor/JI2063.html"

  },
  {
    id: 142,
    name: "Chaussure",
    type: "Shoes",
    price: 110,
    color: "Vert, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: "/",
    season : "été",
    imageUrl: "http://localhost:3000/images/shoes7.avif",
    additionalImages: [
      "http://localhost:3000/images/shoes8.avif",
    ],
    purchaseLink: "https://www.adidas.fr/chaussure-gazelle-indoor/IE6605.html"

  },
  {
    id: 143,
    name: "Chaussure",
    type: "Shoes",
    price: 120,
    color: "Marron, rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: "/",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/shoes9.avif",
    additionalImages: [
      "http://localhost:3000/images/shoes10.avif",
    ],
    purchaseLink: "https://www.adidas.fr/chaussure-gazelle-indoor/JI2714.html"

  },
  {
    id: 144,
    name: "Chaussure",
    type: "Shoes",
    price: 129.99,
    color: "Violet, jaune, blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "/",
    season : "Printemps, été",
    imageUrl: "http://localhost:3000/images/shoes11.png",
    additionalImages: [
      "http://localhost:3000/images/shoes12.png",
    ],
    purchaseLink: "https://www.nike.com/fr/t/chaussure-dunk-low-pour-GlMrl2/FB7910-500?CP=EUNS_AFF_AWIN_FR_624709_TwengaSolutionsCSS_170339&utm_source=TwengaSolutionsCSS&utm_medium=affiliate&utm_campaign=624709&utm_content=170339&sv1=affiliate&sv_campaign_id=624709&awc=16328_1736679118_a46752a731c4f8fd036959174415cd8b"

  },
  {
    id: 145,
    name: "Chaussure",
    type: "Shoes",
    price: 119.99,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "/",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/shoes13.png",
    additionalImages: [
      "http://localhost:3000/images/shoes14.png",
    ],
    purchaseLink: "https://www.nike.com/fr/t/chaussure-dunk-low-pour-GlMrl2/HV2512-200?CP=EUNS_AFF_AWIN_FR_624709_TwengaSolutionsCSS_170339&utm_source=TwengaSolutionsCSS&utm_medium=affiliate&utm_campaign=624709&utm_content=170339&sv1=affiliate&sv_campaign_id=624709&awc=16328_1736679121_df7e8b485c55257306f8202964979cda"

  },
  {
    id: 146,
    name: "Chaussure",
    type: "Shoes",
    price: 119.99,
    color: "Blanc",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "/",
    season : "Hiver, automne, été, printemps",
    imageUrl: "http://localhost:3000/images/shoes15.png",
    additionalImages: [
      "http://localhost:3000/images/shoes16.png",
    ],
    purchaseLink: "https://www.nike.com/fr/t/chaussure-air-force-1-07-pour-SgHWBZ/CW2288-111?CP=EUNS_AFF_AWIN_FR_624709_TwengaSolutionsCSS_170339&utm_source=TwengaSolutionsCSS&utm_medium=affiliate&utm_campaign=624709&utm_content=170339&sv1=affiliate&sv_campaign_id=624709&awc=16328_1736679141_5a51e8db17784c725236d0ba3cd61f12"

  },
  {
    id: 147,
    name: "Chaussure",
    type: "Shoes",
    price: 169.95,
    color: "Blanc, rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "Textile",
    season : "été, printemps, hiver, automne",
    imageUrl: "http://localhost:3000/images/shoes17.webp",
    additionalImages: [
      "http://localhost:3000/images/shoes18.webp",
    ],
    purchaseLink: "https://www.zalando.fr/nike-sportswear-shox-tl-baskets-basses-metallic-platinumpinksiclepink-foamwhitesilver-ni111a1im-d11.html?ssku=NI111A1IM-D110120000&lang=en&otid=default&wmc=SEM330_NB_GO._7455046171_21281114766_165904110841.&opc=2211&mpp=google|v1||pla-293946777986||9111740||g|c||699344415759||pla|NI111A1IM-D110120000|293946777986|1|&gclsrc=aw.ds&gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUDULAby6TM0SLOPd0AVB_BkIAWi_S2GbttW0HjxXHBbeGzknnOi1nhoCNNAQAvD_BwE"

  },
  {
    id: 148,
    name: "Chaussure",
    type: "Shoes",
    price: 129,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Dr Martens",
    fit: "Normal",
    material: "/",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/shoes19.webp",
    purchaseLink: "https://www.drmartens.com/fr/fr/mocassins-adrian-bex-en-cuir-smooth-%C3%A0-pampilles-noir/p/26957001?gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUHrN8hbncPQaOcftmWPEBnHg2uEmUBFg6GN-jz8dkyX1LDkXBTf5nBoC0ZwQAvD_BwE"

  },
  {
    id: 149,
    name: "Chaussure",
    type: "Shoes",
    price: 110,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "/",
    season : "Hiver, automne, printemps, été",
    imageUrl: "http://localhost:3000/images/shoes20.avif",
    purchaseLink: "https://www.courir.com/fr/p/nike-killshot-2-prm-1520047.html?gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUJx8qgDmvD8522JVu4CdSv1BGKmEYsEgZNrLG214bQPyX6Ex559kyRoCa2sQAvD_BwE#_mkpid=1981&_mkpd=||c||||&_mkpc=G/SRC/FR/FR/PerformanceMax/Pmax/BestSeller"

  },
  {
    id: 150,
    name: "Chaussure",
    type: "Shoes",
    price: 180,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Nike",
    fit: "Normal",
    material: "/",
    season : "Automne, hiver",
    imageUrl: "http://localhost:3000/images/shoes21.avif",
    purchaseLink: "https://www.courir.com/fr/p/nike-shox-tl-1600862.html?gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUFHxEQ-IDEikT-To7qrN8LNt7WGqgeC1CZoSIgVia9V3Z4_8nEYeiBoCnR4QAvD_BwE#_mkpid=1981&_mkpd=||c||||&_mkpc=G/SRC/FR/FR/PerformanceMax/Pmax/ALL"

  },
  {
    id: 151,
    name: "Chaussure",
    type: "Shoes",
    price: "314",
    color: "Gris",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "New Balance",
    fit: "Normal",
    material: "/",
    season : "été, printemps, automne, hiver",
    imageUrl: "http://localhost:3000/images/shoes22.avif",
    purchaseLink: "https://stockx.com/fr-fr/new-balance-1906l-metallic-silver?country=FR&currencyCode=EUR&size=5&g_acctid=709-098-4271&g_adgroupid=&g_adid=&g_adtype=none&g_campaign=OD+-+PMax+-+Sneakers+-+International+%28FR%29+NEW+CUSTOMER&g_campaignid=21305978778&g_keyword=&g_keywordid=&g_network=x&gclsrc=aw.ds&&utm_source=google&utm_medium=cpc&utm_campaign=OD_PMax_Sneakers_International_FR_NEW_CUSTOMER&utm_campaignid=21305978778&content=&keyword=&gad_source=1&gclid=CjwKCAiA7Y28BhAnEiwAAdOJUOMMVYe2EXyCUFHBv63tfNaFqou8ZJJ6sGKty0KylBe_RrTqkFk0OxoCpXYQAvD_BwE"

  },
  {
    id: 152,
    name: "Chaussure",
    type: "Shoes",
    price: 120,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Adidas",
    fit: "Normal",
    material: "/",
    season : "été, printemps",
    imageUrl: "http://localhost:3000/images/shoes23.avif",
    additionalImages: [
      "http://localhost:3000/images/hwa2.webp",
      "http://localhost:3000/images/hwa3.webp",
    ],
    purchaseLink: "https://humanwithattitude.com/collections/jackets/products/eclipse-polar-fleece-navy?variant=47747820486990"

  },
  {
    id: 153,
    name: "Bomber",
    type: "Jackets",
    price: 230,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old time fever",
    fit: "Boxy",
    material: "Coton",
    season : "Hiver, automne",
    imageUrl: "http://localhost:3000/images/old1.jpg",
    additionalImages: [
      "http://localhost:3000/images/old2.jpg",
    ],
    purchaseLink: "https://www.oldtimefever.com/original/p/le-bomber-du-scriptorium"

  },
  {
    id: 154,
    name: "Shorts",
    type: "Shorts",
    price: 130,
    color: "Noir",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old time fever",
    fit: "Maxi Oversize",
    material: "Coton",
    season : "été",
    imageUrl: "http://localhost:3000/images/old4.jpg",
    additionalImages: [
      "http://localhost:3000/images/old5.jpg",
      "http://localhost:3000/images/old6.jpg",
    ],
    purchaseLink: "https://www.oldtimefever.com/original/p/jupe-short-du-scriptorium"

  },
  {
    id: 155,
    name: "Cardigan",
    type: "Jackets",
    price: 90,
    color: "Beige",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Old time fever",
    fit: "Boxy",
    material: "9% Laine mohair, 33% Nylon, 58% Acrylique",
    season : "Automne, printemps",
    imageUrl: "http://localhost:3000/images/old10.jpg",
    additionalImages: [
      "http://localhost:3000/images/old11.jpg",
    ],
    purchaseLink: "https://www.oldtimefever.com/original/p/cardigan-de-la-brume-l-equinoxe"

  },
  {
    id: 156,
    name: "Bague",
    type: "Accessories",
    price: 44.90,
    color: "Argent",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sample Projects",
    fit: "/",
    material: "Acier Inoxydable",
    season : "/",
    imageUrl: "http://localhost:3000/images/bague1.webp",
    additionalImages: [
      "http://localhost:3000/images/bague2.webp",
    ],
    purchaseLink: "https://sampleprojects.fr/products/bague-double-altar"

  },
  {
    id: 157,
    name: "Casquette",
    type: "Accessories",
    price: 44.90,
    color: "Marron",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sample Projects",
    fit: "/",
    material: "Coton",
    season : "/",
    imageUrl: "http://localhost:3000/images/casquette4.webp",
    additionalImages: [
      "http://localhost:3000/images/casquette5.webp",
    ],
    purchaseLink: "https://sampleprojects.fr/products/casquette-118-6"

  },
  {
    id: 158,
    name: "Casquette",
    type: "Accessories",
    price: 45,
    color: "Vert",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "La Fam",
    fit: "/",
    material: "/",
    season : "/",
    imageUrl: "http://localhost:3000/images/casquette3.webp",
    purchaseLink: "https://www.lafamamsterdam.com/collections/accessories/products/striped-f-cap-green"

  },
  {
    id: 159,
    name: "Casquette",
    type: "Accessories",
    price: 45,
    color: "Rose",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "La Fam",
    fit: "/",
    material: "/",
    season : "/",
    imageUrl: "http://localhost:3000/images/casquette1.webp",
    additionalImages: [
      "http://localhost:3000/images/casquette2.webp",
   ],
    purchaseLink: "https://www.lafamamsterdam.com/collections/accessories/products/striped-f-cap-pink"

  },
  {
    id: 160,
    name: "Collier",
    type: "Accessories",
    price: 109.90,
    color: "Argent",
    sizes: ["Vérifier disponibilité sur le site ! "],
    brand: "Sample Projects",
    fit: "/",
    material: "Argent 925",
    season : "/",
    imageUrl: "http://localhost:3000/images/collier1.webp",
    additionalImages: [
      "http://localhost:3000/images/collier2.webp",
      "http://localhost:3000/images/collier3.webp",
    ],
    purchaseLink: "https://sampleprojects.fr/products/collier-memoria"

  },
];

// Fonction pour extraire les matières uniques
function extractMaterials(materialString) {
  // Divise la chaîne sur des virgules ou des pourcentages
  const materials = materialString.split(/[,|%|\/]/).map((item) => {
      // Supprimer les espaces, chiffres et caractères spéciaux
      return item.trim().toLowerCase().replace(/[^a-z\s]/g, "");
  });

  // Filtrer uniquement les noms des matières (sans pourcentage ni vide)
  return materials.filter((material) => material && isNaN(material));
}


// Servir des fichiers statiques pour les images
app.use('/images', express.static('path/to/your/images/directory'));

// Routes API
app.get('/api/fashion-trends', (req, res) => {
  res.status(200).json(fashionTrends);
});

app.get('/api/fashion-trends/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = fashionTrends.find(p => p.id === productId);

  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: "Produit non trouvé" });
  }
});

// Endpoint pour filtrer les produits par prix et matière
app.get('/api/products', (req, res) => {
  const { minPrice, maxPrice, material } = req.query;

  let filteredProducts = fashionTrends; // Utilise ton tableau `fashionTrends`.

  // Filtrer par prix
  if (minPrice || maxPrice) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= (minPrice || 0) && product.price <= (maxPrice || Infinity)
    );
  }

  // Filtrer par matière
  // Filtrer par matière
  if (material) {
    filteredProducts = filteredProducts.filter(product =>
        extractMaterials(product.material).includes(material.toLowerCase())
    );
}

res.json(filteredProducts); // Retourne les produits filtrés
});

// Endpoint pour récupérer toutes les matières uniques
app.get('/api/materials', (req, res) => {
  // Extraire toutes les matières des produits
  const allMaterials = fashionTrends.flatMap(product =>
      extractMaterials(product.material)
  );

  // Supprimer les doublons dynamiquement (sans unification manuelle)
  const uniqueMaterials = [...new Set(allMaterials.map(material => material.trim().toLowerCase()))].sort();

  res.json(uniqueMaterials); // Retourne les matières uniques
});

app.get("/fashion-trends", (req, res) => {
  const { color } = req.query;
  let products = fashionTrendsData;

  if (color) {
    // Définition de quelques combinaisons de couleurs assorties
    const matchingColors = {
      red: ["black", "white", "blue"],
      blue: ["white", "gray", "red"],
      green: ["beige", "brown", "black"],
      black: ["white", "red", "gold"],
    };

    const validColors = matchingColors[color.toLowerCase()] || [];
    products = products.filter((item) => validColors.includes(item.color.toLowerCase()));
  }

  res.json(products);
});


// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
