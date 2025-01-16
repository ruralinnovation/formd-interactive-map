import React, { useMemo } from 'react';
import style from './styles/CategoricalMapLegend.module.css';

import { format } from 'd3-format';

interface CategoricalMapLegendProps {
  breaks: number[];
  colors: string[];
}

const CategoricalMapLegend: React.FC<CategoricalMapLegendProps> = ({ breaks, colors }) => {

  const formatValue = format('$,.0f');

  return (
    <div className={style['legend-container']}>
      <h4>Amount Raised per Capita</h4>
      <div className={style['legend-items']}>
        {breaks.map((breakValue, index) => (
          <div key={index} className={style['legend-item']}>
            <div
              className={style['legend-color']}
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span className={style['legend-label']}>
              {index === 0
                ? `${formatValue(breakValue)}`
                : `${formatValue(breaks[index - 1] + 1)} - ${formatValue(breakValue)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

};

export default CategoricalMapLegend;