import React, { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import { WebMercatorViewport } from '@deck.gl/core';
import { Feature } from 'geojson';
import { format } from 'd3-format';
import { jenks } from 'simple-statistics';

// Constants
const USA_BOUNDS: [[number, number], [number, number]] = [
  [-125, 24], // Southwest coordinates
  [-66, 49],  // Northeast coordinates
];

const dollarFormat = format('$,.0f');
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Calculate initial view state based on container size
const getInitialViewState = (width: number, height: number) => {
  const viewport = new WebMercatorViewport({ 
    width, 
    height,
    // Start with a conservative zoom level
    zoom: 1
  }).fitBounds(USA_BOUNDS, {
    padding: 0,
    offset: [0, 0]
  });

  return {
    longitude: viewport.longitude,
    latitude: viewport.latitude,
    zoom: viewport.zoom - 0.2, // Slightly zoom out to ensure full visibility
    pitch: 0,
    bearing: 0
  };

};

// Props type
interface CountyChoroplethProps {
  geojsonData: GeoJSON.FeatureCollection;
}

// Component
const CountyChoropleth: React.FC<CountyChoroplethProps> = ({ geojsonData }) => {

  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Calculate initial view state
  const initialViewState = useMemo(() => 
    getInitialViewState(dimensions.width, dimensions.height),
    [dimensions]
  );

  const [hoverInfo, setHoverInfo] = useState<{
    object: Feature;
    x: number;
    y: number;
  } | null>(null);

  // Memoize color calculations
  const { breaks, getColorForValue } = useMemo(() => {
    const scale_dta = geojsonData.features.map(
      (feature) => feature.properties?.amount_raised_per_capita
    );
    const numClasses = 5;
    const breaks = jenks(scale_dta, numClasses);
    const colors = ['#FAF7E8', '#A3D9C5', '#7DBAA3', '#46827E', '#245A61', '#16343E'];

    const getColorForValue = (value: number) => {
      for (let i = 0; i < breaks.length; i++) {
        if (value <= breaks[i]) {
          return colors[i];
        }
      }
      return colors[colors.length - 1];
    };

    return { breaks, getColorForValue };
  }, [geojsonData]);

  // Update dimensions on resize
  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  const layers = useMemo(() => [
    new GeoJsonLayer({
      id: 'counties',
      data: geojsonData,
      pickable: true,
      stroked: true,
      filled: true,
      getFillColor: (d: any) => {
        const color = getColorForValue(d.properties.amount_raised_per_capita);
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b, 200];
      },
      autoHighlight: true,
      highlightColor: [255, 165, 0, 255],
      getLineColor: [0, 0, 0, 50],
      lineWidthMinPixels: .5,
      updateTriggers: {
        getFillColor: [breaks]
      }
    })
  ], [geojsonData, breaks, getColorForValue]);

  const onHover = (info: any) => {
    setHoverInfo(info.object ? {
      object: info.object,
      x: info.x,
      y: info.y,
    } : null);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
        onHover={onHover}
        getTooltip={({object}) => object && {
          html: `
            <div class='tooltip'>
              <b>${object.properties?.name_co}</b><br/>
              Amount raised per capita: ${dollarFormat(object.properties?.amount_raised_per_capita)}
            </div>
          `,
          style: {
            fontSize: '15px',
            backgroundColor: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            color: 'black',
            fontFamily: '"Bitter", monospace'
          }
        }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/light-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          reuseMaps
        />
      </DeckGL>
    </div>
  );
};

export default CountyChoropleth;
