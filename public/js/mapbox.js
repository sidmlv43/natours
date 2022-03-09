
export const displayMap = coordinates => {
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkbWx2NDMiLCJhIjoiY2wwMTRhMHo2MDE0ZzNqbWt0ajJxZGR5YyJ9.ByB3sBU_PQz1r_8vmh79HA';

  var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sidmlv43/cl03q5p05001k14qxac5cdwzi',
  scrollZoom: false
  // center: [-118.11349, 34.111745],
  // zoom: 4
  });
  
  const bounds = new mapboxgl.LngLatBounds();
  
  coordinates.forEach(loc => {
      // Add a marker
      const el = document.createElement('div');
      el.className = 'marker'
  
      new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
      }).setLngLat(loc.coordinates).addTo(map)
  
      new mapboxgl.Popup({
          offset: 30
      })
          .setLngLat(loc.coordinates)
          .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
          .addTo(map);
  
      bounds.extend(loc.coordinates);
  })
  
  map.fitBounds(bounds, {
      padding: {
              top: 200,
              bottom: 150,
              left: 100, 
              right: 100
          }
      
  });
  
}


