function get_all_text() {
  const key_dict: Map<string, number> = new Map()
  const segmenterFr = new Intl.Segmenter('zh', { granularity: 'word' })
  const spans = document.querySelectorAll('span')

  const add_key = (key: string) => {
    const p = key_dict.get(key)
    key_dict.set(key, p === undefined ? 1 : p + 1)
  }

  for (let span of spans) {
    const span_str = span.textContent!.trim()
    if (span_str.length <= 8) {
      add_key(span_str)
    } else {
      const iterator1 = segmenterFr.segment(span_str)
      for (let x of iterator1) {
        add_key(x.segment)
      }
    }
  }
  console.log(key_dict)
}

var all_text = ''

async function get_all_text_recursion(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    all_text += node.textContent
  } else {
    for (let child of node.childNodes) {
      await get_all_text_recursion(child)
    }
  }
}

get_all_text()

get_all_text_recursion(
  document.getElementsByClassName(
    'ace-editor selenium-ace-editor syntax notranslate zoneId-0 doesWrap'
  )[0]
).then(() => {
  console.log(all_text)
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  const segs = segmenter.segment(all_text)
  for (let x of segs) {
    console.log(x)
  }
})
