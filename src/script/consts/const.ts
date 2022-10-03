export const REPO_NAME = "/graybox";
//for localhost debugging
//export const REPO_NAME = "";

export const SIMB_SHOW_IDX = 0;
export const HEX_SHOW_IDX = 1;
export const HINTS_SHOW_IDX = 2;
export const HELP_SHOW_IDX = 3;
export const PLAY_MUSIC_IDX = 4;
export const ONE_SCREEN_IDX = 5;

export const SIMB_SHOW_INIT_VAL = 1;
export const HEX_SHOW_INIT_VAL = 0;
export const HINTS_SHOW_INIT_VAL = 1;
export const HELP_SHOW_INIT_VAL = 1;
export const PLAY_MUSIC_INIT_VAL = 0;
export const ONE_SCREEN_INIT_VAL = 1;

export const MAX_STEP_COUNT = 100000;

export const HELP_PAGE_SRC = `${REPO_NAME}/yBasic.html`;
export const LS_OPT_ITEM = "options";
export const HELP_STRING_ATTRIBUTE_NAME = "helpString";
export const DISPLAY_ATTRIBUTE_NAME = "visible";
export const IDX_ATTRIBUTE_NAME = "idx";
export const LS_LEVEL_ITEM = "level";

export const MIN_WIDE_SCREEN_WIDTH = 1659;

export const BG_MUSIC_SRC = `${REPO_NAME}/bgmusic.mp3`;

//export const LEVELS_SRV = "http://185.117.153.193:43210/levels";
//CORS proxy
export const LEVELS_SRV = `https://api.allorigins.win/get?url=${encodeURIComponent(
  "http://185.117.153.193:43210/levels"
)}&rand=${Math.random()}`;
