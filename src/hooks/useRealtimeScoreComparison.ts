import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/lib/cricketTypes';
import { toast } from 'sonner';

interface ScoreData {
  runs: number;
  wickets: number;
  balls: number;
}

export function useRealtimeScoreComparison() {
  const [primaryScore, setPrimaryScore] = useState<ScoreData | null>(null);
  const [secondaryScore, setSecondaryScore] = useState<ScoreData | null>(null);
  const [primaryMatch, setPrimaryMatch] = useState<Match | null>(null);
  const [secondaryMatch, setSecondaryMatch] = useState<Match | null>(null);

  const extractScore = (match: Match | null): ScoreData | null => {
    if (!match) return null;
    const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
    if (!innings) return null;
    
    const totalBalls = innings.overs.reduce((acc, over) => {
      return acc + over.balls.filter(b => !b.isWide && !b.isNoBall).length;
    }, 0);
    
    return {
      runs: innings.runs,
      wickets: innings.wickets,
      balls: totalBalls,
    };
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [primaryRes, secondaryRes] = await Promise.all([
        supabase.from('match_state').select('*').eq('id', 'current').single(),
        supabase.from('secondary_match_state').select('*').eq('id', 'current').single(),
      ]);

      if (primaryRes.data) {
        const match = primaryRes.data.current_match as unknown as Match | null;
        setPrimaryMatch(match);
        setPrimaryScore(extractScore(match));
      }

      if (secondaryRes.data) {
        const match = secondaryRes.data.current_match as unknown as Match | null;
        setSecondaryMatch(match);
        setSecondaryScore(extractScore(match));
      }
    };

    loadData();
  }, []);

  // Subscribe to both tables in real-time
  useEffect(() => {
    const channel = supabase
      .channel('score-comparison-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_state' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const match = (payload.new as any).current_match as unknown as Match | null;
            setPrimaryMatch(match);
            setPrimaryScore(extractScore(match));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'secondary_match_state' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const match = (payload.new as any).current_match as unknown as Match | null;
            setSecondaryMatch(match);
            setSecondaryScore(extractScore(match));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate discrepancy
  const runsDiff = Math.abs((primaryScore?.runs || 0) - (secondaryScore?.runs || 0));
  const wicketsDiff = Math.abs((primaryScore?.wickets || 0) - (secondaryScore?.wickets || 0));
  const ballsDiff = Math.abs((primaryScore?.balls || 0) - (secondaryScore?.balls || 0));
  
  const hasDiscrepancy = primaryMatch && secondaryMatch && 
    primaryMatch.id === secondaryMatch.id &&
    (runsDiff > 0 || wicketsDiff > 0);

  return {
    primaryMatch,
    secondaryMatch,
    primaryScore,
    secondaryScore,
    runsDiff,
    wicketsDiff,
    ballsDiff,
    hasDiscrepancy,
  };
}
