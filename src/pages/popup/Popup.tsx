import '@pages/popup/Popup.css'

import React, { useState, useMemo } from 'react'

import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'
import { SearchResult } from '@src/types'
import { Button } from '@src/components/ui/button'
import { Input } from '@src/components/ui/input'
import { sendMessage, sendMessageToTab } from '@shared/helper/message'

const ResultItem: React.FC<SearchResult> = res => {
  return (
    <div className="flex gap-2 p-2">
      <img src={res.icon} alt="img" />
      <div>
        <h3>{res.title}</h3>
        <p>{res.subTitle}</p>
      </div>
      <Button
        variant={'outline'}
        onClick={() => {
          chrome.tabs
            .update(res.tabId, {
              active: true,
            })
            .then(val => {
              sendMessageToTab(val.id!, 'jumpToTab', {
                tabId: val.id!,
                nodeId: res.nodeId,
              })
            })
        }}>
        Jump
      </Button>
    </div>
  )
}

const Popup = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SearchResult[]>()
  const [segment] = useState(new Intl.Segmenter('zh', { granularity: 'word' }))
  const splitText = useMemo(() => {
    return (text: string): string[] => {
      return Array.from(segment.segment(text), v => v.segment)
    }
  }, [segment])
  return (
    <div className="App p-4">
      <div className="flex gap-4">
        <Input
          value={text}
          onChange={ev => {
            setText(ev.target.value)
          }}
        />
        <Button
          onClick={() => {
            const words = splitText(text)
            console.log(words)
            sendMessage('searchFromWords', words, data => {
              setResult(data)
              console.log(data)
            })
          }}>
          Search
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {result?.map(v => {
          return <ResultItem key={v.nodeId} {...v} />
        })}
      </div>
    </div>
  )
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
