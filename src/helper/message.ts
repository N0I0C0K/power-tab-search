import { Action, Message } from '@/types'

export type MessageHandleFunc<T extends keyof Action> = (
  data: Action[T][0],
  sender: chrome.runtime.MessageSender,
  sendResponse: (data: Action[T][1]) => void
) => void

export async function sendMessage<T extends keyof Action>(
  action: T,
  data: Action[T][0],
  responseCallback?: (data: Action[T][1]) => void
) {
  const res = await chrome.runtime.sendMessage({
    action: action,
    data: data,
  })
  responseCallback?.(res)
}

export class MessageHandler {
  private messageHandleDict: {
    [action: string]: MessageHandleFunc<any>
  }
  constructor() {
    this.messageHandleDict = {}
    chrome.runtime.onMessage.addListener(this.onMessage)
  }

  private onMessage(
    message: Message<any>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (msg: any) => void
  ) {
    if (
      'actionName' in message &&
      message.actionName in this.messageHandleDict
    ) {
      this.messageHandleDict[message.actionName](
        message.data,
        sender,
        (data) => {
          sendResponse(data)
        }
      )
    } else {
      console.log('unknow message: ', message)
    }
  }

  public addHandler<T extends keyof Action>(
    action: T,
    func: MessageHandleFunc<T>
  ) {
    this.messageHandleDict[action] = func
  }
}
