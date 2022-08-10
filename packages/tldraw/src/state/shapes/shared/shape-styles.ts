import { Utils } from '@tldraw/core'
import { AlignStyle, ColorStyle, DashStyle, FontStyle, ShapeStyles, SizeStyle, Theme } from '~types'

const canvasLight = '#f2f5f7'

const canvasDark = '#171d28'

const colors = {
  [ColorStyle.White]: '#f2f5f7',
  [ColorStyle.LightGray]: '#9faecc',
  [ColorStyle.Gray]: '#374362',
  [ColorStyle.Black]: '#171d28',
  [ColorStyle.Green]: '#46ff80',
  [ColorStyle.Cyan]: '#46ccff',
  [ColorStyle.Blue]: '#4680ff',
  [ColorStyle.Indigo]: '#8043f7',
  [ColorStyle.Violet]: '#ff80cc',
  [ColorStyle.Red]: '#ff4346',
  [ColorStyle.Orange]: '#ff8046',
  [ColorStyle.Yellow]: '#ffcc46',
}

export const stickyFills: Record<Theme, Record<ColorStyle, string>> = {
  light: {
    ...(Object.fromEntries(
      Object.entries(colors).map(([k, v]) => [k, Utils.lerpColor(v, canvasLight, 0.45)])
    ) as Record<ColorStyle, string>),
    [ColorStyle.White]: '#f2f5f7',
    [ColorStyle.Black]: '#171d28',
  },
  dark: {
    ...(Object.fromEntries(
      Object.entries(colors).map(([k, v]) => [
        k,
        Utils.lerpColor(Utils.lerpColor(v, '#999999', 0.3), canvasDark, 0.4),
      ])
    ) as Record<ColorStyle, string>),
    [ColorStyle.White]: '#06070a',
    [ColorStyle.Black]: '#f2f5f7',
  },
}

export const strokes: Record<Theme, Record<ColorStyle, string>> = {
  light: {
    ...colors,
    [ColorStyle.White]: '#171d28',
  },
  dark: {
    ...(Object.fromEntries(
      Object.entries(colors).map(([k, v]) => [k, Utils.lerpColor(v, canvasDark, 0.1)])
    ) as Record<ColorStyle, string>),
    [ColorStyle.White]: '#06070a',
    [ColorStyle.Black]: '#f2f5f7',
  },
}

export const fills: Record<Theme, Record<ColorStyle, string>> = {
  light: {
    ...(Object.fromEntries(
      Object.entries(colors).map(([k, v]) => [k, Utils.lerpColor(v, canvasLight, 0.82)])
    ) as Record<ColorStyle, string>),
    [ColorStyle.White]: '#f2f5f7',
  },
  dark: {
    ...(Object.fromEntries(
      Object.entries(colors).map(([k, v]) => [k, Utils.lerpColor(v, canvasDark, 0.82)])
    ) as Record<ColorStyle, string>),
    [ColorStyle.White]: '#06070a',
    [ColorStyle.Black]: '#f2f5f7',
  },
}

const strokeWidths = {
  [SizeStyle.Small]: 2,
  [SizeStyle.Medium]: 3.5,
  [SizeStyle.Large]: 5,
}

const fontSizes = {
  [SizeStyle.Small]: 28,
  [SizeStyle.Medium]: 48,
  [SizeStyle.Large]: 96,
  auto: 'auto',
}

const fontFaces = {
  [FontStyle.Script]: '"Caveat Brush"',
  [FontStyle.Sans]: '"Source Sans Pro"',
  [FontStyle.Serif]: '"Crimson Pro"',
  [FontStyle.Mono]: '"Source Code Pro"',
}

const fontSizeModifiers = {
  [FontStyle.Script]: 1,
  [FontStyle.Sans]: 1,
  [FontStyle.Serif]: 1,
  [FontStyle.Mono]: 1,
}

const stickyFontSizes = {
  [SizeStyle.Small]: 24,
  [SizeStyle.Medium]: 36,
  [SizeStyle.Large]: 48,
  auto: 'auto',
}

export function getStrokeWidth(size: SizeStyle): number {
  return strokeWidths[size]
}

export function getFontSize(size: SizeStyle, fontStyle: FontStyle = FontStyle.Script): number {
  return fontSizes[size] * fontSizeModifiers[fontStyle]
}

export function getFontFace(font: FontStyle = FontStyle.Script): string {
  return fontFaces[font]
}

export function getStickyFontSize(size: SizeStyle): number {
  return stickyFontSizes[size]
}

export function getFontStyle(style: ShapeStyles): string {
  const fontSize = getFontSize(style.size, style.font)
  const fontFace = getFontFace(style.font)
  const { scale = 1 } = style

  return `${fontSize * scale}px/1 ${fontFace}`
}

export function getStickyFontStyle(style: ShapeStyles): string {
  const fontSize = getStickyFontSize(style.size)
  const fontFace = getFontFace(style.font)
  const { scale = 1 } = style

  return `${fontSize * scale}px/1 ${fontFace}`
}

export function getStickyShapeStyle(style: ShapeStyles, isDarkMode = false) {
  const { color } = style

  const theme: Theme = isDarkMode ? 'dark' : 'light'
  const adjustedColor =
    color === ColorStyle.White || color === ColorStyle.Black ? ColorStyle.Yellow : color

  return {
    fill: stickyFills[theme][adjustedColor],
    stroke: strokes[theme][adjustedColor],
    color: isDarkMode ? '#f2f5f7' : '#f2f5f7',
  }
}

export function getShapeStyle(
  style: ShapeStyles,
  isDarkMode?: boolean
): {
  stroke: string
  fill: string
  strokeWidth: number
} {
  const { color, size, isFilled } = style

  const strokeWidth = getStrokeWidth(size)

  const theme: Theme = isDarkMode ? 'dark' : 'light'

  return {
    stroke: strokes[theme][color],
    fill: isFilled ? fills[theme][color] : 'none',
    strokeWidth,
  }
}

export const defaultStyle: ShapeStyles = {
  color: ColorStyle.Black,
  size: SizeStyle.Small,
  isFilled: false,
  dash: DashStyle.Draw,
  scale: 1,
}

export const defaultTextStyle: ShapeStyles = {
  ...defaultStyle,
  font: FontStyle.Script,
  textAlign: AlignStyle.Middle,
}
