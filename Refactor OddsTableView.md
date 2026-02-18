# Refactor OddsTableView: Use Odds API Instead of H2H API

Replace the H2H-based win rate / streak / form analysis with odds-based analysis. For each scheduled match, fetch the last 5 completed matches of each team via the odds API (`GET /api/v1/odds?teamId=X&matchCount=5`), then compute win/loss trends **per market/bet** based on actual settlement results (WIN/LOSE status).

## User Review Required

IMPORTANT

**Home/Away streak logic**: Win streaks are counted across ALL matches regardless of venue. If Arsenal won 4 in a row (Home W, Away W, Home W, Away W), that's a **4-win streak**. The `homeAway` field from the odds API response tracks whether the team was home or away in each historical match.

IMPORTANT

**Home/Away filter**: A new filter (`All / Home / Away`) will be added to the OddsTableView filters panel. When set to "Home" or "Away", the win rate / streak / form calculations will only consider matches where the team played at that venue.

WARNING

The current odds API response transforms `WIN`/`LOSE` to `'closed'`, losing the settlement info. A backend change is required to preserve settlement status for completed matches.

## Proposed Changes

### Backend — Expose Settlement Status

#### [MODIFY] 

frontend-api.ts

Add `settlementStatus` to 

OddsSelection:

diff

export interface OddsSelection {

+  settlementStatus?: 'WIN' | 'LOSE' | 'VOID' | 'REFUND' | null;

 }

#### [MODIFY] 

transformers.ts

In 

transformMarketOdds(), preserve raw status as `settlementStatus` when it's `WIN`, `LOSE`, `VOID`, or `REFUND`.

---

### Frontend — Service & Types

#### [MODIFY] 

types.ts

1. Add `homeTeamId` and `awayTeamId` to 
    
    Match interface
2. Add `settlementStatus` to 
    
    ApiSelection interface
3. Add `homeAwayFilter` to 
    
    OddsTableFilters:

diff

export interface OddsTableFilters {

+    homeAwayFilter: 'all' | 'home' | 'away';

 }

4. Add new types for team odds history response (`TeamOddsMatchData`, `TeamOddsHistoryData`, 
    
    TeamOddsHistoryResponse)

#### [MODIFY] 

matchService.ts

1. Add `getTeamOddsHistory(teamId, matchCount)` method → `GET /api/v1/odds?teamId=X&matchCount=5`
2. Pass `homeTeamId` / `awayTeamId` through in 
    
    transformApiMatchToMatch()

---

### Frontend — Hook Rewrite

#### [MODIFY] 

useOddsAnalysis.ts

**Major rewrite** — replace H2H-based approach with odds-based:

1. **Data fetching**: Fetch team odds history per unique team ID (deduplicated). Each response includes `homeAway: 'H' | 'A'` per match.
    
2. **Win rate**: For each row (market × selection), look through the team's 5 historical matches and check the `settlementStatus` of the matching selection. When the `homeAwayFilter` is set:
    
    - `'all'`: use all 5 matches (default — streaks count across all venues)
    - `'home'`: only matches where `homeAway === 'H'`
    - `'away'`: only matches where `homeAway === 'A'`
3. **Streak/form**: Build W/L sequence from settlement status across filtered matches. Example: Arsenal's last 5 = [Home W, Away W, Home W, Away W, Away L] → streak = W4, form = [W,W,W,W,L].
    
4. **Confidence**: Same formula (win rate + streak + odds EV).
    

---

### Frontend — View

#### [MODIFY] 

OddsTableView.tsx

1. Add **Home/Away filter** dropdown to the filters panel:
    
    [All] [Home Only] [Away Only]
    
2. Rename `h2hLoading` → `historyLoading` (cosmetic)