import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import type { FillLayer } from 'react-map-gl';
import { fitBounds } from '@math.gl/web-mercator';
import { format } from 'd3-format';
import { Feature } from 'geojson';
import { mean, median } from 'd3-array';

// Constants
const USA_BOUNDS: [[number, number], [number, number]] = [
  [-125, 24], // Southwest coordinates: [Longitude, Latitude]
  [-66, 49],  // Northeast coordinates: [Longitude, Latitude]
];

const percentFormat = format('.1%');
const dollarFormat = format('$,.0f');
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Props type
interface CountyChoroplethProps {
  geojsonData: GeoJSON.FeatureCollection;
}

// HoverInfo type
interface HoverInfo {
  feature: Feature;
  x: number;
  y: number;
}

// Component
const CountyChoropleth: React.FC<CountyChoroplethProps> = ({ geojsonData }) => {
  const mapRef = useRef<MapRef>(null);

  const { longitude, latitude, zoom } = fitBounds({
    width: window.innerWidth > 1000 ? 1000 : window.innerWidth,
    height: 500,
    bounds: USA_BOUNDS,
    padding: 20, // Optional padding around the bounds
  });

  const maxAmountRaised = Math.max(
    ...geojsonData.features.map((feature) => feature.properties?.amount_raised_per_capita)
  );

  const medianAmoountRaised = median(
    geojsonData.features.map((feature) => feature.properties?.amount_raised_per_capita)
  );

  const dataLayer: FillLayer = {
    id: 'data',
    type: 'fill',
    paint: {
      'fill-color': {
        property: 'amount_raised_per_capita',
        stops: [
          [0, '#FAF7E8'], // Light cream for the lowest value
          [medianAmoountRaised, "#7DBAA3"],
          [maxAmountRaised, '#16343E'], // Dark green for the highest value
        ],
      },
      'fill-opacity': 0.8,
    },
  };

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  console.log("hoverinfo is ", hoverInfo);

  const onHover = useCallback((event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const {
      features,
      point: { x, y },
    } = event;
    const hoveredFeature = features && features[0];

    // Update hover info if there's a valid feature
    setHoverInfo(hoveredFeature ? { feature: hoveredFeature, x, y } : null);
  }, []);

  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        map.fitBounds(USA_BOUNDS, { padding: 20 });
      }
    };

    window.addEventListener('resize', resizeMap);
    resizeMap(); // Call resizeMap on component mount to fit bounds on load

    return () => {
      window.removeEventListener('resize', resizeMap);
    };
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude,
        longitude,
        zoom,
      }}
      mapStyle="mapbox://styles/mapbox/light-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={['data']}
      onMouseMove={onHover}
    >
      <Source type="geojson" data={geojsonData}>
        <Layer {...dataLayer} />
      </Source>
      {hoverInfo && (
        <div className="tooltip" style={{ left: hoverInfo.x, top: hoverInfo.y }}>
          <div>
            <p>
              <b>{hoverInfo.feature.properties?.name_co}</b><br></br>
              Amount raised per capita: {dollarFormat(hoverInfo.feature.properties?.amount_raised_per_capita)}
            </p>
          </div>
        </div>
      )}
    </Map>
  );
};

export default CountyChoropleth;
