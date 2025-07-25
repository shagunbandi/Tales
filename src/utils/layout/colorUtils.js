import { COLOR_PALETTE } from '../../constants.js'

export const getRandomColor = () => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
}
