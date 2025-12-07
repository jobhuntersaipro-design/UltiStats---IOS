import { Player } from './types';

// WFDF Standard Dimensions (Meters)
export const FIELD_DIMENSIONS = {
  width: 37, // meters
  length: 100, // meters (including endzones)
  endzoneDepth: 18, // meters
};

export const MOCK_HOME_TEAM: Player[] = [
  { id: 'h1', name: 'Alex K.', number: '12', gender: 'M' },
  { id: 'h2', name: 'Sarah J.', number: '04', gender: 'F' },
  { id: 'h3', name: 'Mike R.', number: '88', gender: 'M' },
  { id: 'h4', name: 'Emily C.', number: '23', gender: 'F' },
  { id: 'h5', name: 'David L.', number: '07', gender: 'M' },
  { id: 'h6', name: 'Jess M.', number: '99', gender: 'F' },
  { id: 'h7', name: 'Chris P.', number: '10', gender: 'M' },
  { id: 'h8', name: 'Tom B.', number: '11', gender: 'M' },
  { id: 'h9', name: 'Anna W.', number: '13', gender: 'F' },
  { id: 'h10', name: 'James H.', number: '14', gender: 'M' },
  { id: 'h11', name: 'Lisa K.', number: '15', gender: 'F' },
  { id: 'h12', name: 'Rob M.', number: '16', gender: 'M' },
  { id: 'h13', name: 'Nina P.', number: '17', gender: 'F' },
  { id: 'h14', name: 'Kevin D.', number: '18', gender: 'M' },
  { id: 'h15', name: 'Sam T.', number: '19', gender: 'Matching' },
  { id: 'h16', name: 'Rachel G.', number: '20', gender: 'F' },
  { id: 'h17', name: 'Steve O.', number: '21', gender: 'M' },
  { id: 'h18', name: 'Maria F.', number: '22', gender: 'F' },
  { id: 'h19', name: 'Dan Y.', number: '24', gender: 'M' },
  { id: 'h20', name: 'Kelly S.', number: '25', gender: 'F' },
  { id: 'h21', name: 'Brian L.', number: '26', gender: 'M' },
];

export const MOCK_AWAY_TEAM: Player[] = [
  { id: 'a1', name: 'Jordan', number: '01', gender: 'M' },
  { id: 'a2', name: 'Casey', number: '02', gender: 'F' },
  { id: 'a3', name: 'Riley', number: '03', gender: 'Matching' },
  { id: 'a4', name: 'Quinn', number: '04', gender: 'M' },
  { id: 'a5', name: 'Avery', number: '05', gender: 'F' },
  { id: 'a6', name: 'Rowan', number: '06', gender: 'M' },
  { id: 'a7', name: 'Sage', number: '07', gender: 'F' },
  { id: 'a8', name: 'Peyton', number: '08', gender: 'M' },
  { id: 'a9', name: 'Hayden', number: '09', gender: 'F' },
  { id: 'a10', name: 'Taylor', number: '30', gender: 'Matching' },
  { id: 'a11', name: 'Morgan', number: '31', gender: 'M' },
  { id: 'a12', name: 'Jamie', number: '32', gender: 'F' },
  { id: 'a13', name: 'Cameron', number: '33', gender: 'M' },
  { id: 'a14', name: 'Reese', number: '34', gender: 'F' },
  { id: 'a15', name: 'Drew', number: '35', gender: 'M' },
  { id: 'a16', name: 'Kendall', number: '36', gender: 'F' },
  { id: 'a17', name: 'Skyler', number: '37', gender: 'Matching' },
  { id: 'a18', name: 'Dakota', number: '38', gender: 'M' },
  { id: 'a19', name: 'Charlie', number: '39', gender: 'F' },
  { id: 'a20', name: 'Parker', number: '40', gender: 'M' },
  { id: 'a21', name: 'Finley', number: '41', gender: 'F' },
];