// ── League Rules Type ──────────────────────────────────────────
// Stored as JSON in Team.leagueRules

export type HrOverLimitResult = "OUT" | "SINGLE" | "DOUBLE" | "TRIPLE";

export interface LeagueRules {
  // Co-ed settings
  isCoed: boolean;
  coed: {
    minFemalesOnField: number;        // Min females on field each inning (e.g. 4)
    maxConsecutiveMaleBatters: number; // Max males in a row in batting order (e.g. 3)
    requireFemaleInfield: boolean;    // Must have at least 1 female in infield
    requireFemaleOutfield: boolean;   // Must have at least 1 female in outfield
  };

  // Home run rules
  hrRules: {
    maxHrsPerGame: number | null;     // null = unlimited
    hrOverLimitResult: HrOverLimitResult;
    separateLimitMale: boolean;       // Different limit for male/female batters
    maxHrsMale: number | null;
    maxHrsFemale: number | null;
  };

  // General rules
  general: {
    inningsPerGame: number;           // Default 7
    mercyRunLimit: number | null;     // Runs ahead to end game early
    mercyInning: number | null;       // Which inning mercy kicks in
    extraInnings: boolean;            // Allow extra innings if tied
    timeLimit: number | null;         // Game time limit in minutes
    pitchingArc: string;              // "6-12 feet" etc.
    basePathFeet: number;             // 60, 65, 70 feet
    outfieldFence: number | null;     // Outfield fence distance in feet
  };
}

export const DEFAULT_LEAGUE_RULES: LeagueRules = {
  isCoed: false,
  coed: {
    minFemalesOnField: 4,
    maxConsecutiveMaleBatters: 3,
    requireFemaleInfield: true,
    requireFemaleOutfield: true,
  },
  hrRules: {
    maxHrsPerGame: null,
    hrOverLimitResult: "OUT",
    separateLimitMale: false,
    maxHrsMale: null,
    maxHrsFemale: null,
  },
  general: {
    inningsPerGame: 7,
    mercyRunLimit: 15,
    mercyInning: 4,
    extraInnings: true,
    timeLimit: null,
    pitchingArc: "6–12 feet",
    basePathFeet: 65,
    outfieldFence: null,
  },
};
