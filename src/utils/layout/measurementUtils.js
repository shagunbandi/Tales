import { getPreviewDimensions, PAGE_SIZES } from '../../constants.js'

export const previewToMm = (px, settings = null) => {
  const { width: previewWidth } = getPreviewDimensions(settings)
  const pageSize = PAGE_SIZES[settings?.pageSize || 'a4']
  const orientation = settings?.orientation || 'landscape'
  const pageWidth =
    orientation === 'landscape' ? pageSize.width : pageSize.height
  return (px / previewWidth) * pageWidth
}
