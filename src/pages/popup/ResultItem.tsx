import { FC } from 'react'
import { Button } from '@src/components/ui/button'
import { sendMessageToTab } from '@src/shared/helper/message'
import { SearchResultItem, SearchResultValue } from '@src/types'
import { Image } from '@src/components/ui/image'
import { Typography } from '@src/components/ui/Typography'

async function jumpToTab(result: SearchResultItem, windowId: number, tabId: number) {
  await chrome.windows.update(windowId, {
    focused: true,
  })
  await chrome.tabs
    .update(tabId, {
      active: true,
    })
    .then(val => {
      sendMessageToTab(val.id!, 'jumpToTab', {
        tabId: val.id!,
        nodeId: result.nodeId,
      })
    })
}

export const ResultItem: FC<{ res: SearchResultValue; query?: string[] }> = ({ res, query }) => {
  return (
    <div className="flex flex-col p-2 gap-2 border rounded-md">
      <div className="flex gap-2 items-center">
        <Image src={res.tabInfo.icon ?? ''} />
        <Typography variant="h4">{res.tabInfo.title}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        {res.match.map(val => {
          return (
            <div
              key={val.nodeId}
              className="group flex flex-row items-center rounded-sm pl-8 cursor-pointer hover:shadow-md hover:translate-x-1 duration-200">
              <Typography variant="p" highLihgt={query} className="flex-1">
                {val.subTitle}
              </Typography>
              <Button
                variant={'link'}
                onClick={() => {
                  jumpToTab(val, res.tabInfo.windowId, res.tabInfo.tabId)
                }}>
                Jump
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
