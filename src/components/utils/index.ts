import { format } from 'd3-format';

export const dollarFormat = (value: number) => {
  if (value < 1000) {
    return format('$,.0f')(value);
  }
  else {
    return format('$.2s')(value);
  }
}

export const bigDollarFormat = (value: number) => {
  if (value === 0) return "$0";
  const formatter = format('$.3s');
  return formatter(value).replace("G", "B");
};

export const bigNumberFormat = (value: number) => {
  if (value === 0) return "0";
  if (value < 100000) return format('.2s')(value);
  return format('.3s')(value);
}

export const numberFormat = format(',');
