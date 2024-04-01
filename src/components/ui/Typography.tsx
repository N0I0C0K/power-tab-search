import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

type SupportVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p'

export interface TypographyProps extends React.HtmlHTMLAttributes<HTMLHeadingElement> {
  variant?: SupportVariant
  highLihgt?: string[]
  children: string
}

const VarientClassName: {
  [key: string]: string
} = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-6',
}

type SplitResult = {
  text: string
  isSplit: boolean
}

function splitText(str: string, words: string[], combineSplit: boolean = true): SplitResult[] {
  const res: SplitResult[] = []
  if (words.length === 0) {
    return [{ text: str, isSplit: false }]
  }
  const reg = new RegExp(words.join('|'), 'g')
  let match: RegExpExecArray
  let lastIdx = 0

  const push = (item: SplitResult) => {
    if (item.text.trim().length === 0) {
      return
    }
    if (combineSplit && res.length > 0 && item.isSplit === res[res.length - 1].isSplit) {
      res[res.length - 1].text += item.text
    } else {
      res.push(item)
    }
  }

  while ((match = reg.exec(str)) !== null) {
    if (match.index > 0) {
      push({
        text: str.substring(lastIdx, match.index),
        isSplit: false,
      })
    }
    push({
      text: match[0],
      isSplit: true,
    })
    lastIdx = match.index + match[0].length
  }
  if (lastIdx != str.length) {
    push({
      text: str.substring(lastIdx),
      isSplit: false,
    })
  }
  console.log(res)
  return res
}

export const Typography: FC<TypographyProps> = ({ children, variant, highLihgt, className, ...rest }) => {
  const Com = variant ?? 'p'
  const ComclassName = VarientClassName[Com]
  return (
    <Com className={twMerge(ComclassName, className)} {...rest}>
      {highLihgt && highLihgt.length > 0
        ? splitText(children, highLihgt).map(({ text, isSplit }) => {
            return isSplit ? <span className="bg-red-400 rounded-md pl-1 pr-1">{text}</span> : <>{text}</>
          })
        : children}
    </Com>
  )
}
