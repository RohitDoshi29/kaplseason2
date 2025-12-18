import { useState, useEffect, useCallback } from 'react';
import { Team, Match, MatchState, TeamStats, DEFAULT_TEAMS, Ball, Over, Player } from '@/lib/cricketTypes';

const STORAGE_KEYS = {
  TEAMS: 'kapl_teams',
  MATCH_STATE: 'kapl_match_state',
  MATCH_HISTORY: 'kapl_match_history',
};

// Helper to ensure team has players array (migration for old data)
const migrateTeam = (team: Team): Team => {
  if (!team.players || team.players.length === 0) {
    return {
      ...team,
      players: Array.from({ length: 10 }, (_, i) => ({
        id: `${team.id}-p${i + 1}`,
        name: `Player ${i + 1}`,
        photo: null,
      })),
    };
  }
  return team;
};

export function useCricketStore() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchState, setMatchState] = useState<MatchState>({ currentMatch: null, lastAction: null });
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage with migration
  useEffect(() => {
    const savedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const savedMatchState = localStorage.getItem(STORAGE_KEYS.MATCH_STATE);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);

    // Migrate teams to ensure they have players array
    const loadedTeams = savedTeams ? JSON.parse(savedTeams) : DEFAULT_TEAMS;
    const migratedTeams = loadedTeams.map(migrateTeam);
    
    setTeams(migratedTeams);
    setMatchState(savedMatchState ? JSON.parse(savedMatchState) : { currentMatch: null, lastAction: null });
    setMatchHistory(savedHistory ? JSON.parse(savedHistory) : []);
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }
  }, [teams, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.MATCH_STATE, JSON.stringify(matchState));
    }
  }, [matchState, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(matchHistory));
    }
  }, [matchHistory, isLoaded]);

const updateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      // Ensure players array exists when updating
      const updatedTeam = { ...t, ...updates };
      if (!updatedTeam.players) {
        updatedTeam.players = Array.from({ length: 10 }, (_, i) => ({
          id: `${teamId}-p${i + 1}`,
          name: `Player ${i + 1}`,
          photo: null,
        }));
      }
      return updatedTeam;
    }));
  }, []);

  const getTeam = useCallback((teamId: string) => {
    return teams.find(t => t.id === teamId);
  }, [teams]);

  const getTeamsByGroup = useCallback((group: 'A' | 'B') => {
    return teams.filter(t => t.group === group);
  }, [teams]);

  const startMatch = useCallback((group: 'A' | 'B', team1Id: string, team2Id: string) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      group,
      team1Id,
      team2Id,
      innings1: {
        battingTeamId: team1Id,
        bowlingTeamId: team2Id,
        runs: 0,
        wickets: 0,
        overs: [{ number: 1, balls: [] }],
        currentOver: 0,
        currentBall: 0,
      },
      innings2: null,
      currentInnings: 1,
      status: 'live',
      winner: null,
    };
    setMatchState({ currentMatch: newMatch, lastAction: null });
  }, []);

  const getCurrentInnings = useCallback(() => {
    const match = matchState.currentMatch;
    if (!match) return null;
    return match.currentInnings === 1 ? match.innings1 : match.innings2;
  }, [matchState.currentMatch]);

  const addBall = useCallback((runs: number, isWicket = false, isWide = false, isNoBall = false) => {
    setMatchState(prev => {
      if (!prev.currentMatch) return prev;
      
      const match = { ...prev.currentMatch };
      const innings = match.currentInnings === 1 ? { ...match.innings1! } : { ...match.innings2! };
      const overs = [...innings.overs];
      const currentOverIndex = overs.length - 1;
      const currentOver = { ...overs[currentOverIndex], balls: [...overs[currentOverIndex].balls] };

      const ball: Ball = {
        id: Date.now().toString(),
        runs,
        isWicket,
        isWide,
        isNoBall,
        isExtra: isWide || isNoBall,
      };

      currentOver.balls.push(ball);
      innings.runs += runs;
      if (isWicket) innings.wickets += 1;

      // Handle legal ball (not wide or no-ball)
      if (!isWide && !isNoBall) {
        innings.currentBall += 1;
        if (innings.currentBall >= 6) {
          innings.currentBall = 0;
          innings.currentOver += 1;
          overs.push({ number: innings.currentOver + 1, balls: [] });
        }
      }

      overs[currentOverIndex] = currentOver;
      innings.overs = overs;

      if (match.currentInnings === 1) {
        match.innings1 = innings;
      } else {
        match.innings2 = innings;
      }

      return {
        currentMatch: match,
        lastAction: { type: 'addBall', previousState: prev.currentMatch },
      };
    });
  }, []);

  const undoLastBall = useCallback(() => {
    setMatchState(prev => {
      if (!prev.lastAction?.previousState) return prev;
      return {
        currentMatch: prev.lastAction.previousState,
        lastAction: null,
      };
    });
  }, []);

  const switchBattingTeam = useCallback(() => {
    setMatchState(prev => {
      if (!prev.currentMatch) return prev;
      const match = { ...prev.currentMatch };
      
      if (match.currentInnings === 1 && match.innings1) {
        // Switch to innings 2
        match.innings2 = {
          battingTeamId: match.team2Id,
          bowlingTeamId: match.team1Id,
          runs: 0,
          wickets: 0,
          overs: [{ number: 1, balls: [] }],
          currentOver: 0,
          currentBall: 0,
        };
        match.currentInnings = 2;
      }
      
      return { currentMatch: match, lastAction: { type: 'switchInnings', previousState: prev.currentMatch } };
    });
  }, []);

  const endMatch = useCallback(() => {
    setMatchState(prev => {
      if (!prev.currentMatch) return prev;
      const match = { ...prev.currentMatch, status: 'completed' as const };
      
      // Determine winner by runs
      const team1Runs = match.innings1?.runs || 0;
      const team2Runs = match.innings2?.runs || 0;
      match.winner = team1Runs > team2Runs ? match.team1Id : team2Runs > team1Runs ? match.team2Id : null;
      
      setMatchHistory(h => [...h, match]);
      return { currentMatch: null, lastAction: null };
    });
  }, []);

  const getTeamStats = useCallback((): TeamStats[] => {
    const stats: Map<string, TeamStats> = new Map();
    
    teams.forEach(team => {
      stats.set(team.id, { teamId: team.id, matchesPlayed: 0, totalRuns: 0 });
    });

    matchHistory.forEach(match => {
      if (match.status === 'completed') {
        const team1Stats = stats.get(match.team1Id)!;
        const team2Stats = stats.get(match.team2Id)!;
        
        team1Stats.matchesPlayed += 1;
        team2Stats.matchesPlayed += 1;
        
        team1Stats.totalRuns += match.innings1?.runs || 0;
        team2Stats.totalRuns += match.innings2?.runs || 0;
      }
    });

    return Array.from(stats.values());
  }, [teams, matchHistory]);

const formatOvers = useCallback((over: number, ball: number) => {
    return `${over}.${ball}`;
  }, []);

  // Reset season - clears match history but keeps teams
  const resetSeason = useCallback(() => {
    setMatchHistory([]);
    setMatchState({ currentMatch: null, lastAction: null });
  }, []);

  // Reset everything - clears all data including teams
  const resetEverything = useCallback(() => {
    setTeams(DEFAULT_TEAMS);
    setMatchHistory([]);
    setMatchState({ currentMatch: null, lastAction: null });
  }, []);

  return {
    teams,
    matchState,
    matchHistory,
    isLoaded,
    updateTeam,
    getTeam,
    getTeamsByGroup,
    startMatch,
    getCurrentInnings,
    addBall,
    undoLastBall,
    switchBattingTeam,
    endMatch,
    getTeamStats,
    formatOvers,
    resetSeason,
    resetEverything,
  };
}
