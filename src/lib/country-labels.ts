// Major country centroids for globe labels
// ~50 countries covering all continents — enough for visual coverage without clutter
export const COUNTRY_CENTROIDS: { name: string; lat: number; lon: number }[] = [
  // North America
  { name: "United States", lat: 39.8, lon: -98.5 },
  { name: "Canada", lat: 56.1, lon: -106.3 },
  { name: "Mexico", lat: 23.6, lon: -102.5 },
  { name: "Cuba", lat: 21.5, lon: -79.9 },

  // South America
  { name: "Brazil", lat: -14.2, lon: -51.9 },
  { name: "Argentina", lat: -38.4, lon: -63.6 },
  { name: "Colombia", lat: 4.6, lon: -74.3 },
  { name: "Peru", lat: -9.2, lon: -75.0 },
  { name: "Chile", lat: -35.7, lon: -71.5 },
  { name: "Venezuela", lat: 6.4, lon: -66.6 },

  // Europe
  { name: "United Kingdom", lat: 55.4, lon: -3.4 },
  { name: "France", lat: 46.6, lon: 1.9 },
  { name: "Germany", lat: 51.2, lon: 10.4 },
  { name: "Italy", lat: 41.9, lon: 12.6 },
  { name: "Spain", lat: 40.5, lon: -3.7 },
  { name: "Poland", lat: 51.9, lon: 19.1 },
  { name: "Ukraine", lat: 48.4, lon: 31.2 },
  { name: "Romania", lat: 45.9, lon: 25.0 },
  { name: "Sweden", lat: 60.1, lon: 18.6 },
  { name: "Norway", lat: 60.5, lon: 8.5 },
  { name: "Finland", lat: 61.9, lon: 25.7 },
  { name: "Turkey", lat: 39.0, lon: 35.2 },
  { name: "Greece", lat: 39.1, lon: 21.8 },

  // Africa
  { name: "Nigeria", lat: 9.1, lon: 8.7 },
  { name: "Egypt", lat: 26.8, lon: 30.8 },
  { name: "South Africa", lat: -30.6, lon: 22.9 },
  { name: "Kenya", lat: -0.02, lon: 37.9 },
  { name: "Ethiopia", lat: 9.1, lon: 40.5 },
  { name: "Algeria", lat: 28.0, lon: 1.7 },
  { name: "Morocco", lat: 31.8, lon: -7.1 },
  { name: "DR Congo", lat: -4.0, lon: 21.8 },

  // Asia
  { name: "Russia", lat: 61.5, lon: 105.3 },
  { name: "China", lat: 35.9, lon: 104.2 },
  { name: "India", lat: 20.6, lon: 79.0 },
  { name: "Japan", lat: 36.2, lon: 138.3 },
  { name: "South Korea", lat: 35.9, lon: 127.8 },
  { name: "North Korea", lat: 40.3, lon: 127.5 },
  { name: "Indonesia", lat: -0.8, lon: 113.9 },
  { name: "Pakistan", lat: 30.4, lon: 69.3 },
  { name: "Iran", lat: 32.4, lon: 53.7 },
  { name: "Iraq", lat: 33.2, lon: 43.7 },
  { name: "Saudi Arabia", lat: 23.9, lon: 45.1 },
  { name: "Thailand", lat: 15.9, lon: 100.9 },
  { name: "Vietnam", lat: 14.1, lon: 108.3 },
  { name: "Philippines", lat: 12.9, lon: 121.8 },
  { name: "Taiwan", lat: 23.7, lon: 121.0 },
  { name: "Israel", lat: 31.0, lon: 34.9 },
  { name: "UAE", lat: 23.4, lon: 53.8 },

  // Oceania
  { name: "Australia", lat: -25.3, lon: 133.8 },
  { name: "New Zealand", lat: -40.9, lon: 174.9 },
];
