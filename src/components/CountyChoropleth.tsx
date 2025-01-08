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

const percentFormat = format('.1%');
const dollarFormat = format('$,.0f');
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: -95.5,
  latitude: 37,
  zoom: 3.8,
  pitch: 0,
  bearing: 0
};

// Props type
interface CountyChoroplethProps {
  geojsonData: GeoJSON.FeatureCollection;
}

// Component
const CountyChoropleth: React.FC<CountyChoroplethProps> = ({ geojsonData }) => {
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
      getLineColor: [0, 0, 0, 255],
      lineWidthMinPixels: .25,
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
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onHover={onHover}
        getTooltip={({object}) => object && {
          html: `
            <div style="padding: 8px">
              <b>${object.properties?.name_co}</b><br/>
              Amount raised per capita: ${dollarFormat(object.properties?.amount_raised_per_capita)}
            </div>
          `,
          style: {
            backgroundColor: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            color: 'black',
            border: '1px solid black'
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
