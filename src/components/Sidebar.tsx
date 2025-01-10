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
      {selected_county ? (
        <h2>{selected_county.name}</h2>
      ) : (
        <p>Click a county to view more detailed information</p>
      )}

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
      ) : (
        <p>No data available for the selected county.</p>
      )}
    </div>
  );
};

export default Sidebar;
