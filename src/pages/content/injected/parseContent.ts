import { nanoid } from 'nanoid'
import { SentenceDict, TransformDict, WordDict } from '@src/types'
import { MessageHandler, sendMessage } from '@src/shared/helper/message'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'
import { splitTextBySegment } from '@src/shared/helper/segment'
refreshOnUpdate('pages/content/injected/parseContent')

type TextElement = {
  text: string
  node: Node
}

let textElements: TextElement[] = []
let idNodeDict: {
  [key: string]: Node
} = {}

function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect()
  return rect.top >= 10 && rect.left >= 10
}

function getAllTextRecursion(node: Node | undefined) {
  if (node === undefined) {
    return
  }
  if (node.nodeType === Node.TEXT_NODE && isInViewport(node.parentElement)) {
    const text = node.textContent.trim().toLocaleLowerCase()
    if (text.length > 0) {
      textElements.push({
        text: text ?? '',
        node: node,
      })
    }
  }
  for (const child of node.childNodes) {
    getAllTextRecursion(child)
  }
}

async function refreshTextElemnts(element: Element) {
  textElements = []
  await getAllTextRecursion(element)
}

async function generateDictFromTexts(): Promise<TransformDict> {
  idNodeDict = {}
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  const wordDict: WordDict = {}
  const id2Sentence: SentenceDict = {}
  const ln = textElements.length
  textElements.forEach(({ node, text }, idx) => {
    const textId = nanoid(12)
    const insertObj = {
      id: textId,
      sentence: text,
    }
    idNodeDict[textId] = node
    if (text.length < 10) {
      id2Sentence[textId] =
        (idx > 0 ? textElements[idx - 1].text : '') + text + (idx < ln - 1 ? textElements[idx + 1].text : '')
    } else {
      id2Sentence[textId] = text
    }

    splitTextBySegment(text, segmenter).forEach(segText => {
      if (!(segText in wordDict)) {
        wordDict[segText] = []
      }
      wordDict[segText].push(insertObj)
    })
  })

  return {
    wordDict,
    sentenceDict: id2Sentence,
  }
}

const target = document.getElementsByTagName('body')[0]
target.onload = () => {
  refreshTextElemnts(target).then(async () => {
    const transformData = await generateDictFromTexts()
    for (const key of Object.keys(transformData.wordDict)) {
      if (key.length === 1 && transformData.wordDict[key].length > 10) {
        delete transformData.wordDict[key]
      }
    }
    await sendMessage('submitWordDict', transformData)
    console.log('parse content complete')
  })
}

const messageHandler = new MessageHandler()
messageHandler.addHandler('jumpToTab', async (data, sender, sendResp) => {
  if (data.nodeId !== undefined && data.nodeId in idNodeDict) {
    const node = idNodeDict[data.nodeId]
    node.parentElement.scrollIntoView()
    sendResp({
      success: true,
    })
    return
  }
  sendResp({
    success: false,
  })
})
