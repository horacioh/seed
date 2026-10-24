import type {Data} from '@puckeditor/core'

/** Supported artboard viewport presets. */
export type Device = 'desktop' | 'laptop' | 'tablet' | 'mobile'

/** A named, positioned Puck layout rendered at one device size. */
export type Artboard = {
  id: string
  name: string
  device: Device
  x: number
  y: number
  data: Data
}

/** Persisted board representation. */
export type Board = {
  version: 1
  artboards: Artboard[]
}

/** Pixel dimensions for each device preset. */
export const deviceSizes: Record<Device, {width: number; height: number}> = {
  desktop: {width: 1440, height: 900},
  laptop: {width: 1280, height: 800},
  tablet: {width: 834, height: 1112},
  mobile: {width: 390, height: 844},
}
