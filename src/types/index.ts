export interface CountyDetail {
  geoid_co: string;
  entity_name: string;
  state_abbr: string;
  industry: string;
  filing_years: string;
  total_amount_raised: number;
}

export interface SelectedCounty {
  name: string;
  geoid: string;
}
