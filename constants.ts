import { Player } from './types';

export const FIELD_DIMENSIONS = {
  width: 40, // yards
  length: 110, // yards (including endzones)
  endzoneDepth: 20, // yards
};

export const MOCK_HOME_TEAM: Player[] = [
  { id: 'h1', name: 'Alex K.', number: '12', gender: 'M' },
  { id: 'h2', name: 'Sarah J.', number: '04', gender: 'F' },
  { id: 'h3', name: 'Mike R.', number: '88', gender: 'M' },
  { id: 'h4', name: 'Emily C.', number: '23', gender: 'F' },
  { id: 'h5', name: 'David L.', number: '07', gender: 'M' },
  { id: 'h6', name: 'Jess M.', number: '99', gender: 'F' },
  { id: 'h7', name: 'Chris P.', number: '10', gender: 'M' },
];

export const MOCK_AWAY_TEAM: Player[] = [
  { id: 'a1', name: 'Jordan', number: '01', gender: 'M' },
  { id: 'a2', name: 'Casey', number: '02', gender: 'F' },
  { id: 'a3', name: 'Riley', number: '03', gender: 'Matching' },
  { id: 'a4', name: 'Quinn', number: '04', gender: 'M' },
  { id: 'a5', name: 'Avery', number: '05', gender: 'F' },
  { id: 'a6', name: 'Rowan', number: '06', gender: 'M' },
  { id: 'a7', name: 'Sage', number: '07', gender: 'F' },
];