import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team, Match, MatchState, TeamStats, DEFAULT_TEAMS, Ball, Over, Player, Innings, MatchType } from '@/lib/cricketTypes';
import type { Json } from '@/integrations/supabase/types';

// Helper to convert DB team to app Team
const dbToTeam = (dbTeam: any): Team => ({
  id: dbTeam.id,
  name: dbTeam.name,
  group: dbTeam.group as 'A' | 'B',
  logo: dbTeam.logo,
  primaryColor: dbTeam.primary_color,
  players: dbTeam.players as Player[],
  playerCount: dbTeam.player_count || 10,
});

// Helper to convert app Team to DB format
const teamToDb = (team: Team) => ({
  id: team.id,
  name: team.name,
  group: team.group,
  logo: team.logo,
  primary_color: team.primaryColor,
  players: JSON.parse(JSON.stringify(team.players)) as Json,
  player_count: team.playerCount || 10,
});

// Helper to create a new innings
const createInnings = (battingTeamId: string, bowlingTeamId: string): Innings => ({
  battingTeamId,
  bowlingTeamId,
  runs: 0,
  wickets: 0,
  overs: [{ number: 1, balls: [] }],
  currentOver: 0,
  currentBall: 0,
  currentBatsmanId: undefined,
  currentBowlerId: undefined,
  nonStrikerBatsmanId: undefined,
  batterStats: {},
  bowlerStats: {},
  battingOrder: [],
});

export function useCricketStore() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchState, setMatchState] = useState<MatchState>({ currentMatch: null, lastAction: null });
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('id');
        
        if (teamsError) throw teamsError;
        if (teamsData) {
          setTeams(teamsData.map(dbToTeam));
        }

        // Load match state
        const { data: stateData, error: stateError } = await supabase
          .from('match_state')
          .select('*')
          .eq('id', 'current')
          .single();
        
        if (stateError && stateError.code !== 'PGRST116') throw stateError;
        if (stateData) {
          setMatchState({
            currentMatch: stateData.current_match as unknown as Match | null,
            lastAction: stateData.last_action as unknown as MatchState['lastAction'],
          });
        }

        // Load match history
        const { data: historyData, error: historyError } = await supabase
          .from('match_history')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (historyError) throw historyError;
        if (historyData) {
          setMatchHistory(historyData.map((h: any) => ({
            id: h.id,
            group: h.group as 'A' | 'B',
            team1Id: h.team1_id,
            team2Id: h.team2_id,
            innings1: h.innings1,
            innings2: h.innings2,
            currentInnings: h.current_innings as 1 | 2,
            status: h.status as 'setup' | 'live' | 'completed',
            winner: h.winner,
            matchType: (h.match_type || 'group') as MatchType,
          })));
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('cricket-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedTeam = dbToTeam(payload.new);
            setTeams(prev => {
              const exists = prev.find(t => t.id === updatedTeam.id);
              if (exists) {
                return prev.map(t => t.id === updatedTeam.id ? updatedTeam : t);
              }
              return [...prev, updatedTeam];
            });
          } else if (payload.eventType === 'DELETE') {
            setTeams(prev => prev.filter(t => t.id !== (payload.old as any).id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_state' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newState = payload.new as any;
            setMatchState({
              currentMatch: newState.current_match as unknown as Match | null,
              lastAction: newState.last_action as unknown as MatchState['lastAction'],
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_history' },
        async () => {
          // Reload match history on any change
          const { data } = await supabase
            .from('match_history')
            .select('*')
            .order('created_at', { ascending: true });
          
          if (data) {
            setMatchHistory(data.map((h: any) => ({
              id: h.id,
              group: h.group as 'A' | 'B',
              team1Id: h.team1_id,
              team2Id: h.team2_id,
              innings1: h.innings1,
              innings2: h.innings2,
              currentInnings: h.current_innings as 1 | 2,
              status: h.status as 'setup' | 'live' | 'completed',
              winner: h.winner,
              matchType: (h.match_type || 'group') as MatchType,
            })));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedTeam = { ...team, ...updates };
    if (!updatedTeam.players) {
      updatedTeam.players = Array.from({ length: 10 }, (_, i) => ({
        id: `${teamId}-p${i + 1}`,
        name: `Player ${i + 1}`,
        photo: null,
      }));
    }

    // Optimistic update
    setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));

    // Save to database
    const { error } = await supabase
      .from('teams')
      .update(teamToDb(updatedTeam))
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      // Revert on error
      setTeams(prev => prev.map(t => t.id === teamId ? team : t));
    }
  }, [teams]);

  const getTeam = useCallback((teamId: string) => {
    return teams.find(t => t.id === teamId);
  }, [teams]);

  const getTeamsByGroup = useCallback((group: 'A' | 'B') => {
    return teams.filter(t => t.group === group);
  }, [teams]);

  const saveMatchState = useCallback(async (newState: MatchState) => {
    const { error } = await supabase
      .from('match_state')
      .update({
        current_match: JSON.parse(JSON.stringify(newState.currentMatch)) as Json,
        last_action: JSON.parse(JSON.stringify(newState.lastAction)) as Json,
      })
      .eq('id', 'current');

    if (error) {
      console.error('Error saving match state:', error);
    }
  }, []);

  const startMatch = useCallback(async (group: 'A' | 'B', team1Id: string, team2Id: string, matchType: MatchType = 'group') => {
    const newMatch: Match = {
      id: Date.now().toString(),
      group,
      team1Id,
      team2Id,
      innings1: createInnings(team1Id, team2Id),
      innings2: null,
      currentInnings: 1,
      status: 'live',
      winner: null,
      matchType,
    };
    
    const newState = { currentMatch: newMatch, lastAction: null };
    setMatchState(newState);
    await saveMatchState(newState);
  }, [saveMatchState]);

  const getCurrentInnings = useCallback(() => {
    const match = matchState.currentMatch;
    if (!match) return null;
    return match.currentInnings === 1 ? match.innings1 : match.innings2;
  }, [matchState.currentMatch]);

  const addBall = useCallback(async (runs: number, isWicket = false, isWide = false, isNoBall = false) => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch };
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
      batsmanId: innings.currentBatsmanId,
      bowlerId: innings.currentBowlerId,
    };

    currentOver.balls.push(ball);
    innings.runs += runs;
    if (isWicket) innings.wickets += 1;

    // Update batter stats
    if (innings.currentBatsmanId && !isWide) {
      const batterStats = { ...innings.batterStats };
      if (!batterStats[innings.currentBatsmanId]) {
        batterStats[innings.currentBatsmanId] = {
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        };
      }
      const stats = { ...batterStats[innings.currentBatsmanId] };
      stats.runs += isNoBall ? 0 : runs; // No ball runs don't count for batter
      stats.ballsFaced += 1;
      if (runs === 4 && !isWide && !isNoBall) stats.fours += 1;
      if (runs === 6 && !isWide && !isNoBall) stats.sixes += 1;
      if (isWicket) {
        stats.isOut = true;
        stats.dismissalType = 'out';
      }
      batterStats[innings.currentBatsmanId] = stats;
      innings.batterStats = batterStats;
    }

    // Update bowler stats
    if (innings.currentBowlerId) {
      const bowlerStats = { ...innings.bowlerStats };
      if (!bowlerStats[innings.currentBowlerId]) {
        bowlerStats[innings.currentBowlerId] = {
          overs: 0,
          balls: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
        };
      }
      const stats = { ...bowlerStats[innings.currentBowlerId] };
      stats.runs += runs;
      if (isWicket) stats.wickets += 1;
      if (isWide) stats.wides += 1;
      if (isNoBall) stats.noBalls += 1;
      
      if (!isWide && !isNoBall) {
        stats.balls += 1;
        if (stats.balls >= 6) {
          stats.overs += 1;
          stats.balls = 0;
        }
      }
      bowlerStats[innings.currentBowlerId] = stats;
      innings.bowlerStats = bowlerStats;
    }

    // Rotate strike on odd runs (1, 3, 5)
    if (runs % 2 === 1 && innings.currentBatsmanId && innings.nonStrikerBatsmanId) {
      const temp = innings.currentBatsmanId;
      innings.currentBatsmanId = innings.nonStrikerBatsmanId;
      innings.nonStrikerBatsmanId = temp;
    }

    if (!isWide && !isNoBall) {
      innings.currentBall += 1;
      if (innings.currentBall >= 6) {
        innings.currentBall = 0;
        innings.currentOver += 1;
        overs.push({ number: innings.currentOver + 1, balls: [], bowlerId: undefined });
        
        // Rotate strike at end of over
        if (innings.currentBatsmanId && innings.nonStrikerBatsmanId) {
          const temp = innings.currentBatsmanId;
          innings.currentBatsmanId = innings.nonStrikerBatsmanId;
          innings.nonStrikerBatsmanId = temp;
        }
        
        // Clear current bowler for new over
        innings.currentBowlerId = undefined;
      }
    }

    overs[currentOverIndex] = currentOver;
    innings.overs = overs;

    if (match.currentInnings === 1) {
      match.innings1 = innings;
    } else {
      match.innings2 = innings;
    }

    const newState = {
      currentMatch: match,
      lastAction: { type: 'addBall', previousState: matchState.currentMatch },
    };
    
    setMatchState(newState);
    await saveMatchState(newState);
  }, [matchState, saveMatchState]);

  const selectBatsman = useCallback(async (playerId: string, isStriker: boolean) => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch };
    const innings = match.currentInnings === 1 ? { ...match.innings1! } : { ...match.innings2! };
    
    if (isStriker) {
      innings.currentBatsmanId = playerId;
    } else {
      innings.nonStrikerBatsmanId = playerId;
    }
    
    // Initialize batter stats if not exists
    if (!innings.batterStats[playerId]) {
      innings.batterStats = {
        ...innings.batterStats,
        [playerId]: {
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        },
      };
    }
    
    // Add to batting order if not already there
    if (!innings.battingOrder.includes(playerId)) {
      innings.battingOrder = [...innings.battingOrder, playerId];
    }
    
    if (match.currentInnings === 1) {
      match.innings1 = innings;
    } else {
      match.innings2 = innings;
    }
    
    const newState = { currentMatch: match, lastAction: null };
    setMatchState(newState);
    await saveMatchState(newState);
  }, [matchState, saveMatchState]);

  const selectBowler = useCallback(async (playerId: string) => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch };
    const innings = match.currentInnings === 1 ? { ...match.innings1! } : { ...match.innings2! };
    
    innings.currentBowlerId = playerId;
    
    // Set bowler for current over
    const overs = [...innings.overs];
    if (overs.length > 0) {
      overs[overs.length - 1] = { ...overs[overs.length - 1], bowlerId: playerId };
      innings.overs = overs;
    }
    
    // Initialize bowler stats if not exists
    if (!innings.bowlerStats[playerId]) {
      innings.bowlerStats = {
        ...innings.bowlerStats,
        [playerId]: {
          overs: 0,
          balls: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
        },
      };
    }
    
    if (match.currentInnings === 1) {
      match.innings1 = innings;
    } else {
      match.innings2 = innings;
    }
    
    const newState = { currentMatch: match, lastAction: null };
    setMatchState(newState);
    await saveMatchState(newState);
  }, [matchState, saveMatchState]);

  const undoLastBall = useCallback(async () => {
    if (!matchState.lastAction?.previousState) return;
    
    const newState = {
      currentMatch: matchState.lastAction.previousState,
      lastAction: null,
    };
    
    setMatchState(newState);
    await saveMatchState(newState);
  }, [matchState, saveMatchState]);

  const switchBattingTeam = useCallback(async () => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch };
    
    if (match.currentInnings === 1 && match.innings1) {
      match.innings2 = createInnings(match.team2Id, match.team1Id);
      match.currentInnings = 2;
    }
    
    const newState = {
      currentMatch: match,
      lastAction: { type: 'switchInnings', previousState: matchState.currentMatch },
    };
    
    setMatchState(newState);
    await saveMatchState(newState);
  }, [matchState, saveMatchState]);

  const swapStrike = useCallback(async () => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch };
    const innings = match.currentInnings === 1 ? { ...match.innings1! } : { ...match.innings2! };
    
    if (innings.currentBatsmanId && innings.nonStrikerBatsmanId) {
      const temp = innings.currentBatsmanId;
      innings.currentBatsmanId = innings.nonStrikerBatsmanId;
      innings.nonStrikerBatsmanId = temp;
      
      if (match.currentInnings === 1) {
        match.innings1 = innings;
      } else {
        match.innings2 = innings;
      }
      
      const newState = { currentMatch: match, lastAction: null };
      setMatchState(newState);
      await saveMatchState(newState);
    }
  }, [matchState, saveMatchState]);

  const endMatch = useCallback(async () => {
    if (!matchState.currentMatch) return;
    
    const match = { ...matchState.currentMatch, status: 'completed' as const };
    
    const team1Runs = match.innings1?.runs || 0;
    const team2Runs = match.innings2?.runs || 0;
    match.winner = team1Runs > team2Runs ? match.team1Id : team2Runs > team1Runs ? match.team2Id : null;
    
    // Save to match history
    const { error } = await supabase
      .from('match_history')
      .insert({
        id: match.id,
        group: match.group,
        team1_id: match.team1Id,
        team2_id: match.team2Id,
        innings1: JSON.parse(JSON.stringify(match.innings1)) as Json,
        innings2: JSON.parse(JSON.stringify(match.innings2)) as Json,
        current_innings: match.currentInnings,
        status: match.status,
        winner: match.winner,
        match_type: match.matchType,
      });

    if (error) {
      console.error('Error saving match to history:', error);
      return;
    }

    // Clear current match
    const newState = { currentMatch: null, lastAction: null };
    setMatchState(newState);
    await saveMatchState(newState);
    
    // Update local history
    setMatchHistory(prev => [...prev, match]);
  }, [matchState, saveMatchState]);

  const getTeamStats = useCallback((): TeamStats[] => {
    const stats: Map<string, TeamStats> = new Map();
    
    teams.forEach(team => {
      stats.set(team.id, { teamId: team.id, matchesPlayed: 0, wins: 0, losses: 0, totalRuns: 0 });
    });

    matchHistory.forEach(match => {
      if (match.status === 'completed') {
        const team1Stats = stats.get(match.team1Id);
        const team2Stats = stats.get(match.team2Id);
        
        if (team1Stats) {
          team1Stats.matchesPlayed += 1;
          team1Stats.totalRuns += match.innings1?.runs || 0;
          if (match.winner === match.team1Id) {
            team1Stats.wins += 1;
          } else if (match.winner) {
            team1Stats.losses += 1;
          }
        }
        if (team2Stats) {
          team2Stats.matchesPlayed += 1;
          team2Stats.totalRuns += match.innings2?.runs || 0;
          if (match.winner === match.team2Id) {
            team2Stats.wins += 1;
          } else if (match.winner) {
            team2Stats.losses += 1;
          }
        }
      }
    });

    return Array.from(stats.values());
  }, [teams, matchHistory]);

  const formatOvers = useCallback((over: number, ball: number) => {
    return `${over}.${ball}`;
  }, []);

  const resetSeason = useCallback(async () => {
    // Delete all match history
    const { error: historyError } = await supabase
      .from('match_history')
      .delete()
      .neq('id', '');

    if (historyError) {
      console.error('Error resetting match history:', historyError);
      return;
    }

    // Clear match state
    const newState = { currentMatch: null, lastAction: null };
    setMatchState(newState);
    await saveMatchState(newState);
    setMatchHistory([]);
  }, [saveMatchState]);

  const resetEverything = useCallback(async () => {
    // Reset season first
    await resetSeason();

    // Reset teams to defaults
    for (const defaultTeam of DEFAULT_TEAMS) {
      const { error } = await supabase
        .from('teams')
        .update(teamToDb(defaultTeam))
        .eq('id', defaultTeam.id);

      if (error) {
        console.error('Error resetting team:', error);
      }
    }

    setTeams(DEFAULT_TEAMS);
  }, [resetSeason]);

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
    selectBatsman,
    selectBowler,
    undoLastBall,
    switchBattingTeam,
    swapStrike,
    endMatch,
    getTeamStats,
    formatOvers,
    resetSeason,
    resetEverything,
  };
}
