import { useCricketStore } from '@/hooks/useCricketStore';
import { useSecondaryScorer } from '@/hooks/useSecondaryScorer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ScoreDiscrepancyAlert() {
  const { matchState: primaryMatchState } = useCricketStore();
  const { matchState: secondaryMatchState } = useSecondaryScorer();
  const [lastAlertTime, setLastAlertTime] = useState(0);

  const primaryMatch = primaryMatchState.currentMatch;
  const secondaryMatch = secondaryMatchState.currentMatch;

  const primaryInnings = primaryMatch?.currentInnings === 1 ? primaryMatch.innings1 : primaryMatch?.innings2;
  const secondaryInnings = secondaryMatch?.currentInnings === 1 ? secondaryMatch.innings1 : secondaryMatch?.innings2;

  // Calculate discrepancy
  const runsDiff = Math.abs((primaryInnings?.runs || 0) - (secondaryInnings?.runs || 0));
  const wicketsDiff = Math.abs((primaryInnings?.wickets || 0) - (secondaryInnings?.wickets || 0));
  const hasDiscrepancy = runsDiff > 0 || wicketsDiff > 0;

  // Show toast alert when discrepancy is detected
  useEffect(() => {
    if (hasDiscrepancy && Date.now() - lastAlertTime > 5000) {
      toast.error(`Score Mismatch! Runs differ by ${runsDiff}, Wickets differ by ${wicketsDiff}`, {
        duration: 5000,
      });
      setLastAlertTime(Date.now());
    }
  }, [hasDiscrepancy, runsDiff, wicketsDiff, lastAlertTime]);

  if (!primaryMatch || !secondaryMatch || !hasDiscrepancy) {
    return null;
  }

  return (
    <Alert variant="destructive" className="animate-pulse">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Score Discrepancy Detected!</AlertTitle>
      <AlertDescription>
        {runsDiff > 0 && <span>Runs differ by {runsDiff}. </span>}
        {wicketsDiff > 0 && <span>Wickets differ by {wicketsDiff}. </span>}
        Please verify with the other scorer.
      </AlertDescription>
    </Alert>
  );
}
