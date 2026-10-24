import type {Data} from '@puckeditor/core'

export type Device = 'desktop' | 'laptop' | 'tablet' | 'mobile'

export type Artboard = {
  id: string
  name: string
  device: Device
  x: number
  y: number
  data: Data
}

export type Board = {
  version: 1
  artboards: Artboard[]
}

export const deviceSizes: Record<Device, {width: number; height: number}> = {
  desktop: {width: 1440, height: 960},
  laptop: {width: 1280, height: 800},
  tablet: {width: 834, height: 1112},
  mobile: {width: 390, height: 844},
}
