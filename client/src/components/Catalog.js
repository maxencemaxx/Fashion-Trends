import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import "./Catalog.css";
import { useNavigate } from "react-router-dom"; // Importer useNavigate


const Catalog = ({ isSideMenuOpen }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Déclare la fonction de navigation
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [spotifyPlaylist, setSpotifyPlaylist] = useState("");
  const [spotifyKey, setSpotifyKey] = useState(0);



  const seasonPlaylists = {
    hiver: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2MyUCsl25eb", // Ex: Chill lofi
    printemps: "https://open.spotify.com/embed/playlist/37i9dQZF1DXbvABJXBIyiY", // Ex: Happy Pop
    ete: "https://open.spotify.com/embed/playlist/37i9dQZF1DX3oM43CtKnRV", // Ex: Summer hits
    automne: "https://open.spotify.com/embed/playlist/5SvZgI84tZZfhCLdHyWD7E?si=987a0ee1ff7c4f59" // Playlist automne
  };
  

  const normalizeSeason = (season) => {
    if (!season) return "";
    return season
      .normalize("NFD") // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .toLowerCase();
  };
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    color: "",
    type: "",
    brand: "",
    fit: "",
    minPrice: 0,
    maxPrice: 1000,
  });

  // États pour les options dynamiques des filtres
  const [dynamicFilters, setDynamicFilters] = useState({
    colors: [],
    types: [],
    brands: [],
    fits: [],
  });

  // États pour gérer l'ouverture des menus déroulants
  const [dropdownStates, setDropdownStates] = useState({
    type: false,
    color: false,
    brand: false,
    fit: false,
  });

  useEffect(() => {
    let seasonParam = searchParams.get("season");

    console.log("🌍 URL actuelle :", window.location.href);
    console.log("🔍 Valeur brute de season dans l'URL :", seasonParam);

    if (seasonParam) {
        const normalizedSeason = normalizeSeason(seasonParam);
        console.log("📌 Saison après normalisation :", normalizedSeason);

        // Vérifie si la saison est valide
        if (!["hiver", "printemps", "ete", "automne"].includes(normalizedSeason)) {
            console.warn("🚨 Saison invalide détectée :", normalizedSeason);
            return;
        }

        // Correction de l'URL si nécessaire
        if (seasonParam !== normalizedSeason) {
          console.warn(`🔄 Correction de l'URL: ${seasonParam} -> ${normalizedSeason}`);
          navigate(`/catalog?season=${normalizedSeason}`, { replace: true });
          // NE PAS faire "return" ici
          // Laisse le reste s’exécuter avec la bonne saison
          seasonParam = normalizedSeason; // continue avec la saison corrigée
        }
        

        setSelectedSeason(normalizedSeason);
    } else {
        console.warn("⚠️ Aucun paramètre de saison détecté dans l'URL !");
    }
}, [searchParams, navigate]);



  
useEffect(() => {
  const normalizedSeason = normalizeSeason(selectedSeason);
  console.log("Selected Season après normalisation :", selectedSeason);
  console.log("Valeur après suppression des accents et mise en minuscule :", normalizedSeason);
  console.log("Clé existante dans seasonPlaylists :", Object.keys(seasonPlaylists));
  console.log("Vérification si la clé existe :", Object.keys(seasonPlaylists).includes(normalizedSeason));

  if (normalizedSeason && Object.keys(seasonPlaylists).includes(normalizedSeason.trim())) {
      setSpotifyPlaylist(seasonPlaylists[normalizedSeason]);
      setSpotifyKey(prevKey => prevKey + 1); // Change la clé pour forcer le rechargement
      console.log("✅ Playlist Spotify sélectionnée :", seasonPlaylists[normalizedSeason]);
  } else {
      setSpotifyPlaylist("");
      console.log("❌ Aucune playlist trouvée pour :", normalizedSeason);
  }
}, [selectedSeason]);


  
  
  
  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/fashion-trends`
        );
        const data = response.data;
  
        console.log("📦 Produits récupérés depuis l'API :", data);
  
        // Normaliser les saisons
        // Normaliser les saisons (suppression des accents)
const normalizedProducts = data.map((product) => ({
  ...product,
  seasons: product.season
    ? product.season
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
    : ["inconnu"],
}));

  
        console.log("🌞 Produits normalisés avec saisons :", normalizedProducts);
  
        setProducts(normalizedProducts);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des produits :", error);
      }
    };
  
    fetchProducts();
  }, []);
  

  // Mettre à jour les produits filtrés et les options dynamiques en fonction des filtres appliqués
  const searchParamsString = searchParams.toString();
useEffect(() => {
  const seasonParamRaw = searchParams.get("season") || "";
  const seasonParam = normalizeSeason(seasonParamRaw);

  console.log("🔍 Saison brute de l'URL :", seasonParamRaw);
  console.log("📌 Saison après normalisation :", seasonParam);

  const filtered = products.filter((product) => {
    console.log(`🔎 Produit "${product.name}" saisons disponibles:`, product.seasons);

    const matchesSeason =
      seasonParam === "all" || !seasonParam
        ? true
        : product.seasons.some(s => normalizeSeason(s) === seasonParam);

    console.log(
      `✅ Produit "${product.name}" correspond à "${seasonParam}" ?`,
      matchesSeason
    );

    const matchesSearchTerm = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesColor = filters.color
      ? product.color?.toLowerCase().includes(filters.color.toLowerCase())
      : true;

    const matchesType = filters.type
      ? product.type?.toLowerCase() === filters.type.toLowerCase()
      : true;

    const matchesFit = filters.fit
      ? product.fit?.toLowerCase() === filters.fit.toLowerCase()
      : true;

    const matchesBrand = filters.brand
      ? product.brand?.toLowerCase() === filters.brand.toLowerCase()
      : true;

    const matchesMinPrice = filters.minPrice
      ? product.price >= filters.minPrice
      : true;

    const matchesMaxPrice = filters.maxPrice
      ? product.price <= filters.maxPrice
      : true;

    return (
      matchesSeason &&
      matchesSearchTerm &&
      matchesColor &&
      matchesType &&
      matchesFit &&
      matchesBrand &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  console.log("🎯 Produits filtrés pour la saison :", filtered);
  setFilteredProducts(filtered);
}, [products, filters, searchTerm, searchParams]);


  
    // Mettre à jour les options dynamiques des filtres (restreindre par saison et filtres appliqués)
    useEffect(() => {
      const seasonParam = searchParams.get("season")?.toLowerCase() || "";
    
      // Fonction utilitaire pour vérifier les correspondances.
      const filterProducts = (product) => {
        return (
          (seasonParam === "all" || !seasonParam || product.seasons.includes(seasonParam)) &&
          (!filters.color || product.color?.toLowerCase().includes(filters.color.toLowerCase())) &&
          (!filters.type || product.type?.toLowerCase() === filters.type.toLowerCase()) &&
          (!filters.brand || product.brand?.toLowerCase() === filters.brand.toLowerCase()) &&
          (!filters.fit || product.fit?.toLowerCase() === filters.fit.toLowerCase())
        );
      };
    
      
      // Mise à jour des couleurs disponibles
      const availableColors = [
        ...new Set(
          products
            .filter(filterProducts)
            .flatMap((product) => product.color?.toLowerCase().split(",").map((c) => c.trim()) || [])
        ),
      ];
    
      // Mise à jour des types disponibles
      const availableTypes = [
        ...new Set(
          products
            .filter(filterProducts)
            .map((product) => product.type?.toLowerCase())
            .filter(Boolean)
        ),
      ];
    
      // Mise à jour des marques disponibles
      const availableBrands = [
        ...new Set(
          products
            .filter(filterProducts)
            .map((product) => product.brand?.toLowerCase())
            .filter(Boolean)
        ),
      ];
    
      // Mise à jour des coupes disponibles
      const availableFits = [
        ...new Set(
          products
            .filter(filterProducts)
            .map((product) => product.fit?.toLowerCase())
            .filter(Boolean)
        ),
      ];
    
      // Mise à jour de l'état des filtres dynamiques
      setDynamicFilters({
        colors: availableColors,
        types: availableTypes,
        brands: availableBrands,
        fits: availableFits,
      });
    }, [products, filters, searchParams]);
    

  // Gérer les changements dans les filtres
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Gérer l'état des menus déroulants
  const toggleDropdown = (dropdownName) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  return (
    <div>
      {/* Message pour la saison OU le catalogue global */}
      {selectedSeason ? (
        <div className="season-message">
          Vous explorez actuellement la saison <strong>{selectedSeason}</strong> !
        </div>
      ) : (
        <div className="global-message">
          Vous explorez actuellement <strong>Le catalogue complet </strong> ! 🎉
        </div>
      )}

      
{spotifyPlaylist && (
  <div className="spotify-container">
    <div className="spotify-player">
      <iframe
        key={spotifyPlaylist}
        src={`${spotifyPlaylist}?theme=0&autoplay=1`}
        width="300"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        title="Spotify Playlist"
      ></iframe>
    </div>
    <a
      href={spotifyPlaylist.replace("embed/", "")}
      target="_blank"
      rel="noopener noreferrer"
      className="spotify-link"
    >
      🎧 Écouter sur <strong>Spotify</strong>
    </a>
  </div>
)}

{/* Barre de recherche */}
<div className="search-bar-wrapper">
      <input
        type="text"
        className="search-bar"
        placeholder="Rechercher un produit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>


      {/* Filtres */}
      <div className="filters-dropdown-wrapper">
        {/* Filtre par type */}
        {/* Filtre par type */}
<div className="filter-dropdown">
  <div
    className="filter-dropdown-header"
    onClick={() => toggleDropdown("type")}
  >
    <span>
      {filters.type
        ? filters.type.charAt(0).toUpperCase() + filters.type.slice(1)
        : "Type"}
    </span>
    <img
      src="/images/arrow-down.svg"
      alt="Flèche"
      className={`dropdown-arrow ${dropdownStates.type ? "open" : ""}`}
    />
  </div>
  {dropdownStates.type && (
    <div className="filter-dropdown-menu">
      {/* Option "Tous les types" */}
      <div
        className="filter-dropdown-item"
        onClick={() => handleFilterChange("type", "")}
      >
        <img
          src="/images/tous.png"
          alt="Tous"
          className="type-image"
        />
        <span>Tous</span>
      </div>

      {/* Liste dynamique des types */}
      {dynamicFilters.types.map((type, index) => (
  <div
    key={index}
    className="filter-dropdown-item"
    onClick={() => handleFilterChange("type", type)}
  >
    <img
      src={`/images/${type.toLowerCase().replace(/ /g, "-")}.png`}
      alt={type}
      className="type-image"
      onError={(e) => {
        e.target.onerror = null; // Évite une boucle infinie si l'image n'existe pas
        e.target.src = "/images/default.png"; // Image par défaut en cas d'erreur
      }}
    />
    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
  </div>
))}


    </div>
  )}
</div>


        {/* Filtre par couleur */}
        <div className="filter-dropdown">
          <div
            className="filter-dropdown-header"
            onClick={() => toggleDropdown("color")}
          >
            <span>
              {filters.color
                ? filters.color.charAt(0).toUpperCase() + filters.color.slice(1)
                : "Couleurs"}
            </span>
            <img
              src="/images/arrow-down.svg"
              alt="Flèche"
              className={`dropdown-arrow ${dropdownStates.color ? "open" : ""}`}
            />
          </div>
          {dropdownStates.color && (
            <div className="filter-dropdown-menu color-grid">
              <div
                className={`color-circle-wrapper ${
                  filters.color === "" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("color", "")}
              >
                <div
                  className="color-circle"
                  style={{ backgroundColor: "gray" }}
                ></div>
                <span>Toutes</span>
              </div>
              {dynamicFilters.colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-circle-wrapper ${
                    filters.color === color ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("color", color)}
                >
                  <div
                    className={`color-circle ${color
                      .replace(/ /g, "-")
                      .toLowerCase()}`}
                  ></div>
                  <span>{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtre par marque */}
        <div className="filter-dropdown">
          <div
            className="filter-dropdown-header"
            onClick={() => toggleDropdown("brand")}
          >
            <span>
              {filters.brand
                ? filters.brand.charAt(0).toUpperCase() + filters.brand.slice(1)
                : "Marques"}
            </span>
            <img
              src="/images/arrow-down.svg"
              alt="Flèche"
              className={`dropdown-arrow ${dropdownStates.brand ? "open" : ""}`}
            />
          </div>
          {dropdownStates.brand && (
            <div className="filter-dropdown-menu brand-grid">
              <div
                className={`filter-dropdown-item ${
                  filters.brand === "" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("brand", "")}
              >
                <span>Toutes</span>
              </div>
              {dynamicFilters.brands.map((brand, index) => (
                <div
                  key={index}
                  className={`filter-dropdown-item ${
                    filters.brand === brand ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("brand", brand)}
                >
                  <span>{brand.charAt(0).toUpperCase() + brand.slice(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtre par coupe */}
        <div className="filter-dropdown">
          <div
            className="filter-dropdown-header"
            onClick={() => toggleDropdown("fit")}
          >
            <span>
              {filters.fit
                ? filters.fit.charAt(0).toUpperCase() + filters.fit.slice(1)
                : "Coupe"}
            </span>
            <img
              src="/images/arrow-down.svg"
              alt="Flèche"
              className={`dropdown-arrow ${dropdownStates.fit ? "open" : ""}`}
            />
          </div>
          {dropdownStates.fit && (
            <div className="filter-dropdown-menu fit-grid">
              <div
                className={`filter-dropdown-item ${
                  filters.fit === "" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("fit", "")}
              >
                <span>Toutes</span>
              </div>
              {dynamicFilters.fits.map((fit, index) => (
                <div
                  key={index}
                  className={`filter-dropdown-item ${
                    filters.fit === fit ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("fit", fit)}
                >
                  <span>{fit.charAt(0).toUpperCase() + fit.slice(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtre par prix */}
        <div className="price-filter">
          <label htmlFor="minPrice">Prix :</label>
          <div className="price-range-wrapper">
            <input
              type="range"
              name="minPrice"
              id="minPrice"
              min="0"
              max="4500"
              value={filters.minPrice}
              onChange={(e) =>
                handleFilterChange("minPrice", parseInt(e.target.value, 10))
              }
            />
            <span>{filters.minPrice} €</span>
            <input
              type="range"
              name="maxPrice"
              id="maxPrice"
              min="0"
              max="5000"
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange("maxPrice", parseInt(e.target.value, 10))
              }
            />
            <span>{filters.maxPrice} €</span>
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};


export default Catalog;