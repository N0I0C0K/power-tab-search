import { Action, Message } from '@src/types'

export type MessageHandleFunc<T extends keyof Action> = (
  data: Action[T][0],
  sender: chrome.runtime.MessageSender,
  sendResponse: (data: Action[T][1]) => void,
) => Promise<void>

export async function sendMessage<T extends keyof Action>(
  action: T,
  data: Action[T][0],
  responseCallback?: (data: Action[T][1]) => void,
) {
  const res = await chrome.runtime.sendMessage<Message<any>>({
    actionName: action,
    data: data,
  })
  responseCallback?.(res)
}

export async function sendMessageToTab<T extends keyof Action>(
  tabId: number,
  action: T,
  data: Action[T][0],
  responseCallback?: (data: Action[T][1]) => void,
) {
  const res = await chrome.tabs.sendMessage<Message<any>>(tabId, {
    actionName: action,
    data: data,
  })
  responseCallback?.(res)
}

export class MessageHandler {
  private messageHandleDict: {
    [action: string]: MessageHandleFunc<any>
  } = {}
  constructor() {
    this.messageHandleDict = {}
    chrome.runtime.onMessage.addListener(this.onMessage)
  }

  private onMessage = async (
    message: Message<any>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (msg: any) => void,
  ) => {
    console.log(message)
    console.log(sender)
    if ('actionName' in message && message.actionName in this.messageHandleDict) {
      this.messageHandleDict[message.actionName](message.data, sender, data => {
        sendResponse(data)
      })
    } else {
      console.log('unknow message')
    }
  }

  public addHandler = <T extends keyof Action>(action: T, func: MessageHandleFunc<T>) => {
    this.messageHandleDict[action] = func
  }
}
