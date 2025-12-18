export interface Player {
  id: string;
  name: string;
  photo: string | null; // base64 string
}

export interface Team {
  id: string;
  name: string;
  group: 'A' | 'B';
  logo: string | null; // base64 string
  primaryColor: string; // HSL color
  players: Player[];
}

export interface Ball {
  id: string;
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  isExtra: boolean;
}

export interface Over {
  number: number;
  balls: Ball[];
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: Over[];
  currentOver: number;
  currentBall: number;
}

export interface Match {
  id: string;
  group: 'A' | 'B';
  team1Id: string;
  team2Id: string;
  innings1: Innings | null;
  innings2: Innings | null;
  currentInnings: 1 | 2;
  status: 'setup' | 'live' | 'completed';
  winner: string | null;
}

export interface MatchState {
  currentMatch: Match | null;
  lastAction: {
    type: string;
    previousState: Match | null;
  } | null;
}

export interface TeamStats {
  teamId: string;
  matchesPlayed: number;
  totalRuns: number;
}

const createDefaultPlayers = (teamId: string): Player[] => 
  Array.from({ length: 10 }, (_, i) => ({
    id: `${teamId}-p${i + 1}`,
    name: `Player ${i + 1}`,
    photo: null,
  }));

export const DEFAULT_TEAMS: Team[] = [
  // Group A
  { id: 'a1', name: 'Team Alpha', group: 'A', logo: null, primaryColor: '267 84% 51%', players: createDefaultPlayers('a1') },
  { id: 'a2', name: 'Team Bravo', group: 'A', logo: null, primaryColor: '43 96% 56%', players: createDefaultPlayers('a2') },
  { id: 'a3', name: 'Team Charlie', group: 'A', logo: null, primaryColor: '142 71% 45%', players: createDefaultPlayers('a3') },
  { id: 'a4', name: 'Team Delta', group: 'A', logo: null, primaryColor: '0 84% 60%', players: createDefaultPlayers('a4') },
  // Group B
  { id: 'b1', name: 'Team Echo', group: 'B', logo: null, primaryColor: '280 68% 51%', players: createDefaultPlayers('b1') },
  { id: 'b2', name: 'Team Foxtrot', group: 'B', logo: null, primaryColor: '199 89% 48%', players: createDefaultPlayers('b2') },
  { id: 'b3', name: 'Team Golf', group: 'B', logo: null, primaryColor: '25 95% 53%', players: createDefaultPlayers('b3') },
  { id: 'b4', name: 'Team Hotel', group: 'B', logo: null, primaryColor: '326 78% 60%', players: createDefaultPlayers('b4') },
];

export const PRESET_COLORS = [
  { name: 'Royal Blue', value: '267 84% 51%' },
  { name: 'Golden Yellow', value: '43 96% 56%' },
  { name: 'Cricket Green', value: '142 71% 45%' },
  { name: 'Fire Red', value: '0 84% 60%' },
  { name: 'Purple Pride', value: '280 68% 51%' },
  { name: 'Sky Blue', value: '199 89% 48%' },
  { name: 'Orange Blast', value: '25 95% 53%' },
  { name: 'Pink Power', value: '326 78% 60%' },
  { name: 'Teal Thunder', value: '174 72% 40%' },
  { name: 'Midnight Navy', value: '222 47% 31%' },
];
