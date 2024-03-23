import { nanoid } from 'nanoid'
import { SentenceDict, TransformDict, WordDict } from '../../types'

type TextElement = {
  text: string
  node: Node
}

var textElements: TextElement[] = []
var id_node_dict: {
  [key: string]: Node
} = {}

async function getAllTextRecursion(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    textElements.push({
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
  textElements = []
  await getAllTextRecursion(
    document.getElementsByClassName(
      'ace-editor selenium-ace-editor syntax notranslate zoneId-0 doesWrap'
    )[0]
  )
}

async function generateDictFromTexts(): Promise<TransformDict> {
  id_node_dict = {}
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  var wordDict: WordDict = {}
  var id2Sentence: SentenceDict = {}
  for (let { node, text } of textElements) {
    const textId = nanoid()
    const insertObj = {
      id: textId,
      sentence: text,
    }
    id_node_dict[textId] = node
    id2Sentence[textId] = text

    for (let seg of segmenter.segment(text)) {
      if (!(seg.segment in wordDict)) {
        wordDict[seg.segment] = []
      }
      wordDict[seg.segment].push(insertObj)
    }
  }
  return {
    wordDict,
    sentenceDict: id2Sentence,
  }
}

refreshTextElemnts().then(async () => {
  const transformData = await generateDictFromTexts()
  console.log(transformData)
  console.log(id_node_dict)
  await chrome.runtime.sendMessage(transformData)
})
