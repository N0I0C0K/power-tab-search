import { nanoid } from 'nanoid'
import { TransformDict } from '../../types'

type TextElement = {
  text: string
  node: Node
}

var all_text: TextElement[] = []
var id_node_dict: {
  [key: string]: Node
} = {}

async function getAllTextRecursion(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    all_text.push({
      text: node.textContent ?? '',
      node: node,
    })
  } else {
    for (let child of node.childNodes) {
      await getAllTextRecursion(child)
    }
  }
}

async function refreshTextElemnts() {
  all_text = []
  await getAllTextRecursion(document.getElementsByTagName('body')[0])
}

async function generateDictFromTexts(): Promise<{
  transformData: TransformDict
}> {
  id_node_dict = {}
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  var res: TransformDict = {}
  for (let { node, text } of all_text) {
    for (let seg of segmenter.segment(text)) {
      if (!(seg.segment in res)) {
        res[seg.segment] = []
      }
      const text_id = nanoid()
      res[seg.segment].push({
        id: text_id,
        sentence: text,
      })
      id_node_dict[text_id] = node
    }
  }
  return {
    transformData: res,
  }
}

refreshTextElemnts().then(() => {
  generateDictFromTexts().then(({ transformData }) => {
    console.log(transformData)
    console.log(id_node_dict)
  })
})
