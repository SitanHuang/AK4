// ============= inventory =============
const INIT_STOCKPILE = 100;
const OCCURENCE = {
  salt: 0.5,
  grain: 0.8,
  cattles: 0.4,
  lumber: 0.6,

  horses: 0.3,
  iron: 0.3,

  gold: 0.1
};
const MIN_PRODUCTION = 10;
const MAX_PRODUCTION = 100;

const GOLD_PRODUCTION_MIN = 0.5;
const GOLD_PRODUCTION_MAX = 2;
//     consumption rates
const MINIMUM_CONSUMPTION = 1400 / 2000; // min calorie to survive vs min to maintain weight
const MAXIMUM_CONSUMPTION = 2200 / 2000;
const POPULATION_PER_GRAIN = 2200;
const POPULATION_PER_SALT = 4800;
const POPULATION_PER_CATTLES = 6300;

const TURNLY_PRODUCTION_RANGE = 0.1; // plus or minus 10%
// ========= population growth =========
const MAX_POP_DECAY = 0.35;
const MAX_POP_GROWTH = 0.04;
// MAX_POP_GROWTH is dictated by MAXIMUM_CONSUMPTION
const MINORITY_HAPPINESS_DECREASE_FACTOR = 2;
// ========= development growth ========
const LUMBER_PER_DEVELOPMENT = 80;
const IRON_PER_DEVELOPMENT = 40;
const MIN_HAPPINESS_FOR_DEVELOPMENT = 0.75;
const REGULAR_CONSUMPTION = 0.5;
// ================ civ ================
const MAX_TAX_RATE = 5;
// =============== army ================
const FOOD_NEED_MULTIPLIER = 5;
const FOOD_CONSUMPTION_PER_ROUND = 0.2;
const MEN_PER_IRON = 1;
const MEN_PER_HORSES = 2;
const MAX_MEN_PER_ARMY = 2000;
// =============== world ===============
const TOTAL_PROVINCES = 100;
const TOTAL_CIVS = 50;
// =============== DEBUG ===============
var DISABLE_TRADES = false;
var PLAYER_SET_AI = false;
