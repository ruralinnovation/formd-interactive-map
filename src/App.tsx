import React, { useState, useEffect } from "react";

import { FeatureCollection, Feature } from 'geojson';

import { CountyDetail, SelectedCounty } from "./types";

import "@cori-risi/cori.data.api/inst/dist/cori.data.api.css";

import CountyChoropleth from './components/CountyChoropleth';
import Sidebar from './components/Sidebar';

import countyGeoJSON from './data/formd_map.json';
const geojsonData = countyGeoJSON as FeatureCollection;

const BASE_URL = import.meta.env.VITE_BASE_S3_URL;

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
      fontFamily: 'Bitter',
  },
  palette: {
      primary: {
          main: '#00835D',
          light: '#A3E2B5',
          dark: '#26535C',
          contrastText: 'white',
      },
  },
});

export default function App() {

    const [ selectedCounty, setSelectedCounty] = useState<SelectedCounty | null>(null);
    const [ selectedData, setSelectedData ] = useState<CountyDetail[] | null>(null);

    const [ruralityFilter, setRuralityFilter] = useState({
      rural: true,
      nonrural: true,
    });

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
            <ThemeProvider theme={theme}>
              <div id="map">
                  <CountyChoropleth geojsonData={geojsonData} setCounty={setSelectedCounty} ruralityFilter={ruralityFilter} />
              </div>
              <Sidebar selected_county={selectedCounty} data={selectedData} setFilter={setRuralityFilter} />
            </ThemeProvider>
        </div>
    );
}
