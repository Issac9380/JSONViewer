import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPng(element: HTMLElement, filename: string = 'json-tree.png', isDark: boolean = true): Promise<void> {
  // 暂时移除滚动限制以捕获完整内容
  const originalOverflow = element.style.overflow
  const originalHeight = element.style.height
  const originalMaxHeight = (element.style as any).maxHeight

  element.style.overflow = 'visible'
  element.style.height = 'auto'
  ;(element.style as any).maxHeight = 'none'

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      pixelRatio: 2,
      cacheBust: true,
      skipAutoScale: true
    })
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  } finally {
    // 恢复原始样式
    element.style.overflow = originalOverflow
    element.style.height = originalHeight
    ;(element.style as any).maxHeight = originalMaxHeight
  }
}

export async function exportToPdf(element: HTMLElement, filename: string = 'json-tree.pdf', isDark: boolean = true): Promise<void> {
  // 暂时移除滚动限制以捕获完整内容
  const originalOverflow = element.style.overflow
  const originalHeight = element.style.height
  const originalMaxHeight = (element.style as any).maxHeight

  element.style.overflow = 'visible'
  element.style.height = 'auto'
  ;(element.style as any).maxHeight = 'none'

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      pixelRatio: 2,
      cacheBust: true,
      skipAutoScale: true
    })
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    })
    const imgProps = pdf.getImageProperties(dataUrl)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  } finally {
    // 恢复原始样式
    element.style.overflow = originalOverflow
    element.style.height = originalHeight
    ;(element.style as any).maxHeight = originalMaxHeight
  }
}
