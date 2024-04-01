export function splitTextBySegment(text: string, segmenter: Intl.Segmenter): string[] {
  text = text.toLocaleLowerCase()
  const res = []
  for (const seg of segmenter.segment(text)) {
    const segText = seg.segment.trim()
    if (segText.length <= 1) {
      continue
    }
    res.push(segText)
  }
  return res
}
