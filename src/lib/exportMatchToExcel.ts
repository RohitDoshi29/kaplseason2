import * as XLSX from 'xlsx';
import { Match, Team, Innings } from '@/lib/cricketTypes';

export function exportMatchToExcel(match: Match, team1: Team, team2: Team) {
  const workbook = XLSX.utils.book_new();

  // Match Summary Sheet
  const summaryData = [
    ['Match Summary'],
    [''],
    ['Teams', `${team1.name} vs ${team2.name}`],
    ['Match Type', match.matchType.toUpperCase()],
    ['Winner', match.winner === team1.id ? team1.name : match.winner === team2.id ? team2.name : 'Tie'],
    [''],
    ['1st Innings', `${match.innings1?.runs || 0}/${match.innings1?.wickets || 0} (${match.innings1?.currentOver || 0}.${match.innings1?.currentBall || 0} ov)`],
    ['2nd Innings', `${match.innings2?.runs || 0}/${match.innings2?.wickets || 0} (${match.innings2?.currentOver || 0}.${match.innings2?.currentBall || 0} ov)`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // 1st Innings Sheet
  if (match.innings1) {
    createInningsSheet(workbook, match.innings1, team1, team2, '1st Innings');
  }

  // 2nd Innings Sheet
  if (match.innings2) {
    createInningsSheet(workbook, match.innings2, team2, team1, '2nd Innings');
  }

  // Over by Over Sheet
  createOverByOverSheet(workbook, match, team1, team2);

  // Download
  const fileName = `${team1.name}_vs_${team2.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

function createInningsSheet(
  workbook: XLSX.WorkBook,
  innings: Innings,
  battingTeam: Team,
  bowlingTeam: Team,
  sheetName: string
) {
  const data: (string | number)[][] = [];

  // Batting Section
  data.push(['BATTING - ' + battingTeam.name]);
  data.push(['Batsman', 'Runs', 'Balls', '4s', '6s', 'SR', 'Status']);

  innings.battingOrder.forEach((playerId) => {
    const player = battingTeam.players.find(p => p.id === playerId);
    const stats = innings.batterStats[playerId];
    if (player && stats) {
      const sr = stats.ballsFaced > 0 ? ((stats.runs / stats.ballsFaced) * 100).toFixed(1) : '0.0';
      data.push([
        player.name,
        stats.runs,
        stats.ballsFaced,
        stats.fours,
        stats.sixes,
        sr,
        stats.isOut ? 'OUT' : 'NOT OUT'
      ]);
    }
  });

  data.push(['']);
  data.push(['Total', innings.runs, '', 'Wickets', innings.wickets, 'Overs', `${innings.currentOver}.${innings.currentBall}`]);

  data.push(['']);
  data.push(['']);

  // Bowling Section
  data.push(['BOWLING - ' + bowlingTeam.name]);
  data.push(['Bowler', 'Overs', 'Runs', 'Wickets', 'Wides', 'No Balls', 'Economy']);

  Object.entries(innings.bowlerStats).forEach(([playerId, stats]) => {
    const player = bowlingTeam.players.find(p => p.id === playerId);
    if (player) {
      const totalOvers = stats.overs + (stats.balls / 6);
      const economy = totalOvers > 0 ? (stats.runs / totalOvers).toFixed(2) : '0.00';
      data.push([
        player.name,
        `${stats.overs}.${stats.balls}`,
        stats.runs,
        stats.wickets,
        stats.wides || 0,
        stats.noBalls || 0,
        economy
      ]);
    }
  });

  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
}

function createOverByOverSheet(workbook: XLSX.WorkBook, match: Match, team1: Team, team2: Team) {
  const data: (string | number)[][] = [];

  const processInnings = (innings: Innings | null, battingTeam: Team, bowlingTeam: Team, inningsNum: number) => {
    if (!innings) return;

    data.push([`${inningsNum === 1 ? '1st' : '2nd'} INNINGS - ${battingTeam.name}`]);
    data.push(['Over', 'Bowler', 'Ball 1', 'Ball 2', 'Ball 3', 'Ball 4', 'Ball 5', 'Ball 6', 'Runs', 'Wickets']);

    innings.overs.forEach((over) => {
      const bowler = over.bowlerId ? bowlingTeam.players.find(p => p.id === over.bowlerId) : null;
      const balls = over.balls.map(ball => {
        if (ball.isWicket) return 'W';
        if (ball.isWide) return 'Wd';
        if (ball.isNoBall) return 'Nb';
        return ball.runs.toString();
      });

      // Pad to 6 balls
      while (balls.length < 6) balls.push('');

      const overRuns = over.balls.reduce((sum, ball) => sum + ball.runs, 0);
      const wicketsInOver = over.balls.filter(b => b.isWicket).length;

      data.push([
        over.number + 1,
        bowler?.name || 'Unknown',
        ...balls,
        overRuns,
        wicketsInOver
      ]);
    });

    data.push(['']);
    data.push(['']);
  };

  processInnings(match.innings1, team1, team2, 1);
  processInnings(match.innings2, team2, team1, 2);

  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Over by Over');
}
