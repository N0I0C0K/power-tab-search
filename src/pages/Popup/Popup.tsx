import { sendMessage } from '@/helper/message'
import { SearchResult } from '@/types'
import React, { useMemo, useState } from 'react'
import './Popup.css'

const Popup = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SearchResult[]>()
  const [segment] = useState(new Intl.Segmenter('zh', { granularity: 'word' }))
  const splitText = useMemo(() => {
    return (text: string): string[] => {
      return Array.from(segment.segment(text), (v) => v.segment)
    }
  }, [segment])
  return (
    <div className="App">
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        <input
          value={text}
          onChange={(ev) => {
            setText(ev.target.value)
          }}
        />
        <button
          onClick={() => {
            const words = splitText(text)
            console.log(words)
            sendMessage('searchFromWords', words, (data) => {
              setResult(data)
              console.log(data)
            })
          }}
        >
          search
        </button>
      </div>
      <div>
        {result?.map((v) => {
          return (
            <div
              key={v.nodeId}
              style={{
                display: 'flex',
              }}
            >
              <img src={v.icon} alt="icon" />
              <div>
                <div>{v.title}</div>
                <div>{v.subTitle}</div>
              </div>
              <div>{v.score}</div>
              <button
                onClick={() => {
                  chrome.tabs.update(v.tabId, {
                    active: true,
                  })
                  console.log('success')
                }}
              >
                go
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Popup
