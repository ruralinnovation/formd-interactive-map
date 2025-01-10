import React, { useState, useEffect } from "react";

import { FeatureCollection } from 'geojson';

import { CountyDetail, SelectedCounty } from "./types";

import "@cori-risi/cori.data.api/inst/dist/cori.data.api.css";

import CountyChoropleth from './components/CountyChoropleth';
import Sidebar from './components/Sidebar';

import countyGeoJSON from './data/formd_map.json';
const geojsonData = countyGeoJSON as FeatureCollection;

console.log("County GeoJSON is ", countyGeoJSON);

const BASE_URL = import.meta.env.VITE_BASE_S3_URL;

console.log("Base URL is ", BASE_URL);

export default function App() {

    const [ selectedCounty, setSelectedCounty] = useState<SelectedCounty | null>(null);
    const [ selectedData, setSelectedData ] = useState<CountyDetail[] | null>(null);

    useEffect(() => {

        const fetchData = async () => {
    
          if (selectedCounty !== null) {
            // ADD IF HOVERINFO IS NOT NULL AND FUNDING IS GREATER THAN ZERO
    
            try {
              // Grab county data file
              const data_response = await fetch(`${BASE_URL}/s3/${selectedCounty.geoid}.json`);
              if (!data_response.ok) {
                throw new Error(`HTTP error! status: ${data_response.status}`);
              }
              const data_json = await data_response.json();
              console.log("data loaded:", data_json);
            
              // Handle data here
              setSelectedData(data_json);
    
            } catch (error) {
              console.error("Error fetching data:", error);
              setSelectedData([]);

            }
    
          }
        };
    
        fetchData();
    
      }, [selectedCounty]);    

    return (
        <div>
            <Sidebar selected_county={selectedCounty} data={selectedData} />
            <div id="map">
                <CountyChoropleth geojsonData={geojsonData} setCounty={setSelectedCounty} />
            </div>
        </div>
    );
}
