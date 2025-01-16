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
  amount_raised_per_capita: number;
  total_amount_raised: number;
  num_funded_entities: number;
  pop: number;
  rurality: string;
}
