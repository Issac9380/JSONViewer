import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPng(element: HTMLElement, filename: string = 'json-tree.png', isDark: boolean = true): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    pixelRatio: 2
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportToPdf(element: HTMLElement, filename: string = 'json-tree.pdf', isDark: boolean = true): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    pixelRatio: 2
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
}
