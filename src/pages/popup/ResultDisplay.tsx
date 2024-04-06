import { SearchResultValue } from '@src/types'
import { FC } from 'react'
import { ResultItem } from './ResultItem'
import { ScrollArea } from '@src/components/ui/scroll-area'

export const ResultDisplay: FC<{
  resultList: SearchResultValue[]
  query: string[]
}> = ({ resultList, query }) => {
  return (
    <ScrollArea className="h-80 mt-2 mb-2">
      <div className="flex flex-col gap-2">
        {resultList.map(item => {
          return <ResultItem key={item.tabInfo.title} res={item} query={query} />
        })}
      </div>
    </ScrollArea>
  )
}
