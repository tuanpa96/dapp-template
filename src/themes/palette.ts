import colors from "@/constants/colors";
import { PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette extends PaletteOptions {
    greenPrimary: string;
    darkPrimary: string;
    lightPrimary: string;
    simpleBackGroundColor: string;
    white: string;
    gray: string;
    grayLight: string;
    grayLightest: string;
    grayDark: string;
    grayCard: string;
    greenDark: string;
    black: string;
    blue: string;
    redLight: string;
    brown: string;
    blueGrayDark: string;
    blueGrayLight: string;
    slateGray: string;
    charcoal: string;
    frost: string;
    mintFrost: string;
    midnight: string;
    plum: string;
    steelGray: string;
    midnightBlue: string;
    roseWhite: string;
    plumPurple: string;
    slateBlue: string;
    coralPink: string;
    rubyRed: string;
    cream: string;
    amber: string;
    mintGreen: string;
    navyBlue: string;
    frostyBlue: string;
    emeraldGreen: string;
    reETH: string;
    reBTC: string;
    forestGreen: string;
    sapphireBlue: string;
    burntOrange: string;
  }
}

const paletteOptions = {
  greenPrimary: colors.primary.green,
  darkPrimary: colors.primary.dark,
  lightPrimary: colors.primary.light,
  simpleBackGroundColor: colors.simple.background,
  white: colors.primary.white,
  gray: colors.primary.gray,
  grayLight: colors.primary.gray,
  grayLightest: colors.primary.grayLightest,
  grayDark: colors.primary.grayDark,
  grayCard: colors.primary.grayCard,
  greenDark: colors.primary.greenDark,
  black: colors.primary.black,
  blue: colors.primary.blue,
  redLight: colors.primary.redLight,
  brown: colors.primary.brown,
  blueGrayDark: colors.primary.blueGrayDark,
  blueGrayLight: colors.primary.blueGrayLight,
  slateGray: colors.primary.slateGray,
  charcoal: colors.primary.charcoal,
  frost: colors.primary.frost,
  mintFrost: colors.primary.mintFrost,
  midnight: colors.primary.midnight,
  plum: colors.primary.plum,
  steelGray: colors.primary.steelGray,
  midnightBlue: colors.primarymidnightBlue,
  roseWhite: colors.primary.roseWhite,
  plumPurple: colors.primary.plumPurple,
  slateBlue: colors.primary.slateBlue,
  coralPink: colors.primary.coralPink,
  rubyRed: colors.primary.rubyRed,
  cream: colors.primary.cream,
  amber: colors.primary.amber,
  mintGreen: colors.primary.mintGreen,
  navyBlue: colors.primary.navyBlue,
  frostyBlue: colors.primary.frostyBlue,
  emeraldGreen: colors.primary.emeraldGreen,
  reETH: colors.primary.reETH,
  reBTC: colors.primary.reBTC,
  forestGreen: colors.primary.forestGreen,
  sapphireBlue: colors.primary.sapphireBlue,
  burntOrange: colors.primary.burntOrange,
};

export default paletteOptions;
