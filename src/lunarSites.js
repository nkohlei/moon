export const lunarSites = [
  {
    mission: "Apollo 11",
    type: "Crewed",
    year: 1969,
    operator: "NASA",
    coordinates: { lat: 0.67408, lng: 23.47297 },
    image: "https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~orig.jpg", // Buzz Aldrin on surface
    source: "https://www.nasa.gov/mission/apollo-11/",
    description: "The first crewed mission to land on the Moon. 'That's one small step for man, one giant leap for mankind.'",
    details: "Crew: Neil Armstrong, Buzz Aldrin, Michael Collins. Site: Sea of Tranquility (Mare Tranquillitatis)."
  },
  {
    mission: "Apollo 12",
    type: "Crewed",
    year: 1969,
    operator: "NASA",
    coordinates: { lat: -3.01239, lng: -23.42157 },
    image: "https://images-assets.nasa.gov/image/as12-48-7133/as12-48-7133~orig.jpg", // Pete Conrad on surface
    source: "https://www.nasa.gov/mission/apollo-12/",
    description: "Second crewed landing. Precision landing near the Surveyor 3 robotic probe.",
    details: "Crew: Pete Conrad, Alan Bean, Richard Gordon. Site: Ocean of Storms (Oceanus Procellarum)."
  },
  {
    mission: "Apollo 14",
    type: "Crewed",
    year: 1971,
    operator: "NASA",
    coordinates: { lat: -3.6453, lng: -17.47136 },
    image: "https://images-assets.nasa.gov/image/as14-66-9306/as14-66-9306~orig.jpg", // Ed Mitchell with map
    source: "https://www.nasa.gov/mission/apollo-14/",
    description: "Third crewed landing. Site of the first lunar color television broadcast.",
    details: "Crew: Alan Shepard, Edgar Mitchell, Stuart Roosa. Shepard hit a golf ball on the Moon here."
  },
  {
    mission: "Apollo 15",
    type: "Crewed",
    year: 1971,
    operator: "NASA",
    coordinates: { lat: 26.1322, lng: 3.6339 },
    image: "https://images-assets.nasa.gov/image/as15-88-11863/as15-88-11863~orig.jpg", // Lunar Roving Vehicle
    source: "https://www.nasa.gov/mission/apollo-15/",
    description: "Fourth crewed landing. First mission to use the Lunar Roving Vehicle (LRV).",
    details: "Crew: David Scott, James Irwin, Alfred Worden. Site: Hadley-Apennine region."
  },
  {
    mission: "Apollo 16",
    type: "Crewed",
    year: 1972,
    operator: "NASA",
    coordinates: { lat: -8.973, lng: 15.5 },
    image: "https://images-assets.nasa.gov/image/as16-113-18339/as16-113-18339~orig.jpg", // John Young jumping
    source: "https://www.nasa.gov/mission/apollo-16/",
    description: "Fifth crewed landing. Focus on exploring the lunar highlands.",
    details: "Crew: John Young, Charles Duke, Ken Mattingly. Site: Descartes Highlands."
  },
  {
    mission: "Apollo 17",
    type: "Crewed",
    year: 1972,
    operator: "NASA",
    coordinates: { lat: 20.1908, lng: 30.7717 },
    image: "https://images-assets.nasa.gov/image/as17-147-22527/as17-147-22527~orig.jpg", // Gene Cernan with rover
    source: "https://www.nasa.gov/mission/apollo-17/",
    description: "The final mission of the Apollo program. Featured the first scientist-astronaut.",
    details: "Crew: Gene Cernan, Harrison Schmitt (geologist), Ronald Evans. Site: Taurus-Littrow."
  },
  {
    mission: "Luna 2",
    type: "Uncrewed",
    year: 1959,
    operator: "Soviet Union",
    coordinates: { lat: 29.1, lng: 0.0 },
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Luna-2.jpg", // Stable Wikipedia link
    source: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1959-014A",
    description: "The first man-made object to reach the surface of the Moon (Impact).",
    details: "Paved the way for future exploration. Proven absence of a lunar magnetic field."
  },
  {
    mission: "Luna 9",
    type: "Uncrewed",
    year: 1966,
    operator: "Soviet Union",
    coordinates: { lat: 7.08, lng: -64.37 },
    image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Luna-9_probe.jpg", // Stable Wikipedia-hosted
    source: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-006A",
    description: "First survivable 'soft landing' on the lunar surface.",
    details: "Sent back the first panoramic images from the Moon's surface."
  },
  {
    mission: "Luna 17 (Lunokhod 1)",
    type: "Uncrewed",
    year: 1970,
    operator: "Soviet Union",
    coordinates: { lat: 38.28, lng: -35.0 },
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/USSR_stamp_Luna-17_1970_4k.jpg", 
    source: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A",
    description: "First robotic lunar rover (Lunokhod 1). Guided by earth controllers.",
    details: "Traveled over 10km across Mare Imbrium during 11 lunar days."
  },
  {
    mission: "Chang'e 4",
    type: "Uncrewed",
    year: 2019,
    operator: "CNSA",
    coordinates: { lat: -45.457, lng: 177.589 },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Chang%27e_4_Lander_Landing_Site.png/800px-Chang%27e_4_Lander_Landing_Site.png", 
    source: "https://www.planetary.org/space-missions/change-4",
    description: "First spacecraft to land on the far side of the Moon.",
    details: "Landed in the Von Kármán crater within the South Pole-Aitken basin."
  },
  {
    mission: "Chandrayaan-3",
    type: "Uncrewed",
    year: 2023,
    operator: "ISRO",
    coordinates: { lat: -69.373, lng: 32.319 },
    image: "https://www.isro.gov.in/media_isro/image/index/CH3_Lander_Surface.jpg", 
    source: "https://www.isro.gov.in/Chandrayaan3_Details.html",
    description: "First mission to land near the lunar south pole.",
    details: "Successfully deployed the Pragyan rover on the high-latitude lunar plains."
  },
  {
    mission: "SLIM",
    type: "Uncrewed",
    year: 2024,
    operator: "JAXA",
    coordinates: { lat: -13.31, lng: 25.25 },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/SLIM_lander_on_Moon.jpg/800px-SLIM_lander_on_Moon.jpg", 
    source: "https://global.jaxa.jp/projects/sas/slim/",
    description: "Precision landing mission within 100 meters of target (Moon Sniper).",
    details: "Landed in the Shioli crater using vision-based navigation."
  },
  {
    mission: "Odysseus",
    type: "Uncrewed",
    year: 2024,
    operator: "Intuitive Machines",
    coordinates: { lat: -80.13, lng: 1.44 },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/IM-1_Odysseus_on_Moon.jpg/800px-IM-1_Odysseus_on_Moon.jpg",
    source: "https://www.intuitivemachines.com/im-1",
    description: "First private spacecraft to soft-land on the Moon (IM-1).",
    details: "Landed near Malapert A crater at the lunar south pole."
  }
];
