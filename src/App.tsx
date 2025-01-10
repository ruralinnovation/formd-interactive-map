import React, { useState } from "react";

import { FeatureCollection } from 'geojson';

import { ApiContextProvider } from "@cori-risi/cori.data.api";
import "@cori-risi/cori.data.api/inst/dist/cori.data.api.css";

import CountyChoropleth from './components/CountyChoropleth';
import Sidebar from './components/Sidebar';

import countyGeoJSON from './data/formd_map.json';
const geojsonData = countyGeoJSON as FeatureCollection;

console.log("County GeoJSON is ", countyGeoJSON);

const DATA_API_URL = "https://cori-risi-apps.s3.amazonaws.com";

export default function App() {

    const [ selectedGEOID, setSelectedGEOID] = useState<string | null>(null);

    return (
        <ApiContextProvider baseURL={DATA_API_URL}>
            <Sidebar selected_geoid={selectedGEOID} />
            <div id="map">
                <CountyChoropleth geojsonData={geojsonData} setGEOID={setSelectedGEOID} />
            </div>
        </ApiContextProvider>
    );
}
