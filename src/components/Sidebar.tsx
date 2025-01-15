import React, { useMemo, useState } from 'react';
import style from './styles/Sidebar.module.css';
import { CountyDetail, SelectedCounty } from '../types';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { sort } from 'd3';

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
        <h1>Rural Startup Funding Map</h1>
        <p>
          Companies that raise capital through a Regulation D investment 
          must submit a Form D filing after the first securities are sold. 
          Regulation D governs capital-raising events that involve 
          the sale of securities to a relatively small number 
          of (often accredited) investors. Use the map to explore Form D 
          filings since 2010 to better understand geographic trends in 
          startup funding.
        </p>
        <div className={style['controls']}>
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
          <p>
            Businesses raising private capital: {sortedData?.length.toLocaleString('en-US')}
          </p>
        </>
      ) : (
        <p>Click a county to view more detailed information</p>
      )}

      <div className={style['county-detail-wrapper']}>
        {sortedData && sortedData.length > 0 ? (
          sortedData.map((county, index) => (
            <div key={index} className={style['county-detail']}>
              <h3>{county.entity_name}</h3>
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
