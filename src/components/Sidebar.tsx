import React, { useMemo } from 'react';
import style from './styles/Sidebar.module.css';
import { CountyDetail, SelectedCounty } from '../types';
import { sort } from 'd3';

interface SidebarProps {
  selected_county: SelectedCounty | null;
  data: CountyDetail[] | null;
}

const Sidebar: React.FC<SidebarProps> = ({ selected_county, data }) => {

  const sortedData = useMemo(() => {
    if (data) {
      return [...data].sort((a, b) => b.total_amount_raised - a.total_amount_raised);
    }
    return null;
  }, [data]);

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
