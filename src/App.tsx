import * as React from 'react';

import { FeatureCollection } from 'geojson';

import { ApiContextProvider } from "@cori-risi/cori.data.api";
import "@cori-risi/cori.data.api/inst/dist/cori.data.api.css";

import CountyChoropleth from './components/CountyChoropleth';

import countyGeoJSON from './data/formd_map.json';
const geojsonData = countyGeoJSON as FeatureCollection;

console.log("County GeoJSON is ", countyGeoJSON);

const DATA_API_URL = "https://cori-risi-apps.s3.amazonaws.com";

export default function App() {

    return (
        <ApiContextProvider baseURL={DATA_API_URL}>
            <div id="map">
                <CountyChoropleth geojsonData={geojsonData} />
            </div>
        </ApiContextProvider>
    );
}
