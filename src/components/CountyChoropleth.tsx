import React, { useState, useMemo, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import { WebMercatorViewport, PickingInfo } from '@deck.gl/core';
import { Feature } from 'geojson';
import { FeatureCollection } from 'geojson';

import statesGeoJSON from '../data/states_outline.json';
import { CountyDetail, SelectedCounty } from '../types';
import CategoricalMapLegend from './CategoricalMapLegend';
const statesOutline = statesGeoJSON as FeatureCollection;
import { bigDollarFormat, bigNumberFormat, dollarFormat, numberFormat } from './utils';

// Constants
const USA_BOUNDS: [[number, number], [number, number]] = [
  [-125, 24], // Southwest coordinates
  [-66, 49],  // Northeast coordinates
];

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

const map_colors = [
  "#ECF5EF", '#a3e2b5', '#77bf96', '#519c7a', '#337962', '#1f564e', '#16343e'
]

const map_breaks = [
  0,
  1000,
  5000,
  10000,
  15000,
  25000
]

const convertHexToRGBA = (color: string): [number, number, number, number] => {

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return [r, g, b, 230];

}

const getMapColor = (value: number, return_hex: boolean = false): string => {

  if (value === 0) {
    return map_colors[0];
  }
  else if (value < 1000) {
    return map_colors[1];
  }
  else if (value < 5000) {
    return map_colors[2];
  }
  else if (value < 10000) {
    return map_colors[3];
  }
  else if (value < 15000) {
    return map_colors[4];
  }
  else if (value < 25000) {
    return map_colors[5];
  }
  else {
    return map_colors[6];
  }


}

// Props type
interface CountyChoroplethProps {
  geojsonData: GeoJSON.FeatureCollection;
  setCounty: React.Dispatch<React.SetStateAction<SelectedCounty | null>>;
  ruralityFilter: {
    rural: boolean;
    nonrural: boolean;
  }
}

// Component
const CountyChoropleth: React.FC<CountyChoroplethProps> = ({ geojsonData, setCounty, ruralityFilter }) => {

  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  const [selectedCountyGeoid, setSelectedCountyGeoid] = useState<string | null>(null);

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

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterRurality = (feature: Feature) => {

    if (ruralityFilter.rural === true && ruralityFilter.nonrural === true) {
      return true;
    }
    else if (ruralityFilter.rural === true) {
      return feature.properties && feature.properties.rurality === 'Nonmetro';
    }
    else if (ruralityFilter.nonrural === true) {
      return feature.properties && feature.properties.rurality === 'Metro';
    }
    else {
      return false
    }
  }

  const layers = useMemo(() => {

    const filteredGeoJSON = {
      ...geojsonData,
      features: geojsonData.features.filter(filterRurality),
    };

    return [
      new GeoJsonLayer({
        id: 'counties',
        data: filteredGeoJSON,
        pickable: true,
        stroked: true,
        filled: true,
        getFillColor: (d: any) => {

          if (d.properties.geoid_co === selectedCountyGeoid) {
            return [255, 228, 115, 255]; // Red color
          }

          const hex_color: string = getMapColor(d.properties.amount_raised_per_capita);
          const color: [number, number, number, number] = convertHexToRGBA(hex_color);

          return color;

        },
        autoHighlight: true,
        highlightColor: [250, 128, 74, 255],
        getLineColor: [0, 0, 0, 50],
        lineWidthMinPixels: .25,
        updateTriggers: {
          getFillColor: [selectedCountyGeoid]
        },
        onClick: (d: any) => {

          setCounty({
            geoid: d.object.properties.geoid_co,
            name: d.object.properties.name_co,
            amount_raised_per_capita: d.object.properties.amount_raised_per_capita,
            total_amount_raised:  d.object.properties.total_amount_raised,
            num_funded_entities:  d.object.properties.num_funded_entities,
            pop:  d.object.properties.pop,
            rurality: d.object.properties.rurality
          });

          setSelectedCountyGeoid(d.object.properties.geoid_co);

        }
      }),
      new GeoJsonLayer({
        id: 'states',
        data: statesOutline,
        pickable: false,
        stroked: true,
        filled: false,
        getLineColor: [255, 255, 255, 255],
        lineWidthMinPixels: 1
      }),
    ]
  }, [geojsonData, selectedCountyGeoid, ruralityFilter]);

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
        getTooltip={({ object }) => 
          object && {
            html: `
              <div class='tooltip'>
                <h4 style="text-decoration: underline; text-decoration-thickness: 5px; text-decoration-color: ${
                  getMapColor(object.properties?.amount_raised_per_capita, true)
                };">
                  ${object.properties?.name_co}
                </h4>
                <p>
                  Amount raised per capita: ${dollarFormat(object.properties?.amount_raised_per_capita)}<br/>
                  Total amount raised: ${bigDollarFormat(object.properties?.total_amount_raised)}<br/>
                  Funded businesses: ${numberFormat(object.properties?.num_funded_entities)}<br/>
                  Population: ${bigNumberFormat(object.properties?.pop)}<br/>
                </p>
              </div>
            `,
            style: {
              fontSize: '15px',
              backgroundColor: 'white',
              border: '1px solid black',
              borderRadius: '5px',
              color: 'black',
              fontFamily: '"Bitter", monospace',
              marginTop: "7.5px",
              marginLeft: "7.5px"
            }
          }
        }
      >
        <Map
          mapStyle="mapbox://styles/mapbox/light-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          reuseMaps
        />
      </DeckGL>
      <CategoricalMapLegend breaks={map_breaks} colors={map_colors} />
    </div>
  );
};

export default CountyChoropleth;
