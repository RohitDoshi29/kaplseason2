import { Over, Ball } from '@/lib/cricketTypes';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface OverTableProps {
  overs: Over[];
  className?: string;
}

export function OverTable({ overs, className }: OverTableProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getBallDisplay = (ball: Ball) => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return `${ball.runs}Wd`;
    if (ball.isNoBall) return `${ball.runs}Nb`;
    return ball.runs.toString();
  };

  const getBallClass = (ball: Ball) => {
    if (ball.isWicket) return 'text-destructive font-bold';
    if (ball.runs === 4) return 'text-cricket-four font-bold';
    if (ball.runs === 6) return 'text-cricket-six font-bold';
    if (ball.runs < 0) return 'text-destructive';
    return '';
  };

  const getOverTotal = (over: Over) => {
    return over.balls.reduce((sum, ball) => sum + ball.runs, 0);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-card hover:bg-accent rounded-t-lg transition-colors">
        <ChevronDown className={cn('w-5 h-5 transition-transform', isOpen && 'rotate-180')} />
        <span className="font-semibold">Over-by-Over Breakdown</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20">Over</TableHead>
                <TableHead>Ball by Ball</TableHead>
                <TableHead className="w-20 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overs.map((over, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{over.number}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {over.balls.map((ball, ballIndex) => (
                        <span
                          key={ball.id}
                          className={cn(
                            'inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm',
                            getBallClass(ball)
                          )}
                        >
                          {getBallDisplay(ball)}
                        </span>
                      ))}
                      {over.balls.length === 0 && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {getOverTotal(over)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
