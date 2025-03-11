import React, { useMemo, useState } from 'react';
import style from './styles/Sidebar.module.css';
import { CountyDetail, SelectedCounty } from '../types';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { bigDollarFormat, bigNumberFormat, dollarFormat, numberFormat, downloadJSONAsCSV } from './utils';

interface SidebarProps {
  selected_county: SelectedCounty | null;
  data: CountyDetail[] | null;
  setFilter:  React.Dispatch<React.SetStateAction<{
      rural: boolean;
      nonrural: boolean;
  }>>
}

const Sidebar: React.FC<SidebarProps> = ({ selected_county, data, setFilter }) => {

  const sortedData = useMemo(() => {
    if (data) {
      return [...data].sort((a, b) => b.total_amount_raised - a.total_amount_raised);
    }
    return null;
  }, [data]);

  const [ruralityFilter, setRuralityFilter] = useState({
    rural: true,
    nonrural: true,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuralityFilter({
      ...ruralityFilter,
      [event.target.name]: event.target.checked,
    });
    setFilter({
      ...ruralityFilter,
      [event.target.name]: event.target.checked,
    });
  };  

  console.log("rurality filter is ", ruralityFilter);

  return (
    <div className={style['sidebar']}>
      <div className={style['intro']}>
        <h1>Rural Private Investment Map</h1>
        <p>
          Companies that raise capital through a Regulation D investment 
          must submit a <a href="https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/form-d" target="_blank">Form D filing</a> after the first securities are sold. 
          Regulation D governs capital-raising events that involve 
          the sale of securities to a relatively small number 
          of (often accredited) investors. Use the map to explore Form D 
          filings since 2010 to better understand geographic trends in 
          private investment.
        </p>
        <div className={style['controls']}>
          <span><b>Filter counties by rurality</b></span>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={ruralityFilter.rural}
                  onChange={handleChange}
                  name="rural"
                />
              }
              label="Rural"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ruralityFilter.nonrural}
                  onChange={handleChange}
                  name="nonrural"
                />
              }
              label="Nonrural"
            />
          </FormGroup>
        </div>
        <hr />
      </div>
      {selected_county ? (
        <>
          <h2>{selected_county.name}</h2>
          <table className={style['county-overview-table']}>
            <tbody>
              <tr>
                <td>Amount raised per capita</td>
                <td><b>{dollarFormat(selected_county.amount_raised_per_capita)}</b></td>
              </tr>
              <tr>
                <td>Total amount raised</td>
                <td><b>{bigDollarFormat(selected_county.total_amount_raised)}</b></td>
              </tr>
              <tr>
                <td>Funded businesses</td>
                <td><b>{numberFormat(selected_county.num_funded_entities)}</b></td>
              </tr>
              <tr>
                <td>Population</td>
                <td><b>{bigNumberFormat(selected_county.pop)}</b></td>
              </tr>
              <tr>
                <td>Rurality</td>
                <td><b>{selected_county.rurality}</b></td>
              </tr>
            </tbody>
          </table>
          {
            selected_county.num_funded_entities > 0? 
            <>
              <h3>County filings</h3>
              <button className={style['download-csv-button']} onClick={
                () => downloadJSONAsCSV(
                  sortedData!!,
                  "formd_business_2010_2014_" + selected_county.geoid + ".csv"
                  )}>
                Click here to download county Form D data
              </button>
            </>
            : 
            <></>
          }
        </>
      ) : (
        <span><em>Click a county to view more detailed information</em></span>
      )}

      <div className={style['county-detail-wrapper']}>
        {sortedData && sortedData.length > 0 ? (
          sortedData.map((county, index) => (
            <div key={index} className={style['county-detail']}>
              <h4>{county.entity_name}</h4>
              <table className={style['county-table']}>
                <tbody>
                  <tr>
                    <td>Total Amount Raised</td>
                    <td>{county.total_amount_raised.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                  <tr>
                    <td>Filing year(s)</td>
                    <td>{county.filing_years}</td>
                  </tr>
                  <tr>
                    <td>Industry</td>
                    <td>{county.industry}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
