"use client"

import { useState, useEffect, useRef } from "react"
import { Send, X, Package, Clock } from "lucide-react"
import { chatApi } from "@/lib/api/chat"
import { chatSocket } from "@/lib/chat/socket"
import type { Chat, ChatMessage, CreateProductOfferDto } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useNotifications } from "@/lib/contexts/NotificationContext"

interface ChatWithUser extends Chat {
  user?: {
    firstName?: string
    lastName?: string
    phone?: string
  }
}

interface ChatWindowProps {
  chat: ChatWithUser
  isManager?: boolean
  onChatUpdate?: (chat: Chat) => void
  onClose?: () => void
}

export default function ChatWindow({
  chat,
  isManager,
  onChatUpdate,
  onClose,
}: ChatWindowProps) {
  const { accessToken, user } = useAuth()
  const { markAsRead, playNotificationSound } = useNotifications()
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerData, setOfferData] = useState<CreateProductOfferDto>({
    name: "",
    description: "",
    price: 0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mark chat as read when opened
  useEffect(() => {
    markAsRead(chat.id)
  }, [chat.id, markAsRead])

  useEffect(() => {
    setMessages(chat.messages)
  }, [chat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Join chat room
    chatSocket.joinChat(chat.id)

    // Socket event listeners
    const handleNewMessage = (data: {
      chatId: string
      message: ChatMessage
    }) => {
      if (data.chatId === chat.id) {
        setMessages(prev => [...prev, data.message])

        // Play notification sound if message is from other party
        if (user && data.message.senderId !== user.id) {
          playNotificationSound()
        }
      }
    }

    const handleNewOffer = (data: { chatId: string; offer: any }) => {
      if (data.chatId === chat.id && onChatUpdate) {
        // Reload chat to get updated offers
        chatApi
          .getChatById(
            chat.id,
            isManager && accessToken ? accessToken : undefined
          )
          .then(onChatUpdate)
      }
    }

    const handleMessageDelivered = (data: {
      chatId: string
      messageId: string
      deliveredAt: string
    }) => {
      if (data.chatId === chat.id) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId
              ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
              : msg
          )
        )
      }
    }

    const handleMessagesRead = (data: {
      chatId: string
      readerId: string
      readAt: string
    }) => {
      if (data.chatId === chat.id && user && data.readerId !== user.id) {
        setMessages(prev =>
          prev.map(msg =>
            msg.senderId === user.id && !msg.isRead
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        )
      }
    }

    chatSocket.on("newMessage", handleNewMessage)
    chatSocket.on("newOffer", handleNewOffer)
    chatSocket.on("messageDelivered", handleMessageDelivered)
    chatSocket.on("messagesRead", handleMessagesRead)

    return () => {
      chatSocket.off("newMessage", handleNewMessage)
      chatSocket.off("newOffer", handleNewOffer)
      chatSocket.off("messageDelivered", handleMessageDelivered)
      chatSocket.off("messagesRead", handleMessagesRead)
      chatSocket.leaveChat(chat.id)
    }
  }, [chat.id, onChatUpdate, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    try {
      setIsSending(true)
      await chatApi.sendMessage(
        chat.id,
        { content: message.trim() },
        isManager && accessToken ? accessToken : undefined
      )
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const assignToSelf = async () => {
    if (!isManager || !accessToken) return

    try {
      const updatedChat = await chatApi.assignManager(chat.id, accessToken)
      onChatUpdate?.(updatedChat)
    } catch (error) {
      console.error("Failed to assign chat:", error)
    }
  }

  const createOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isManager || !accessToken || !offerData.name || offerData.price <= 0)
      return

    try {
      await chatApi.createProductOffer(chat.id, offerData, accessToken)
      setShowOfferForm(false)
      setOfferData({ name: "", description: "", price: 0 })

      // Reload chat to get updated offers
      const updatedChat = await chatApi.getChatById(
        chat.id,
        isManager ? accessToken : undefined
      )
      onChatUpdate?.(updatedChat)
    } catch (error) {
      console.error("Failed to create offer:", error)
    }
  }

  const closeChat = async () => {
    if (
      !isManager ||
      !accessToken ||
      !window.confirm("Вы уверены, что хотите закрыть этот чат?")
    )
      return

    try {
      await chatApi.closeChat(chat.id, accessToken)
      onClose?.()
    } catch (error) {
      console.error("Failed to close chat:", error)
    }
  }

  const renderMessage = (msg: ChatMessage) => {
    const isMyMessage = user && msg.senderId === user.id
    const isSystem = msg.senderRole === "system"

    return (
      <div
        key={msg.id}
        className={`flex ${isMyMessage ? "justify-start" : "justify-end"} mb-4`}>
        <div
          className={`max-w-[70%] rounded-lg px-4 py-2 ${
            isSystem
              ? "bg-gray-100 text-gray-600 text-sm italic"
              : isMyMessage
                ? "bg-gray-200 text-gray-900"
                : "bg-blue-600 text-white"
          }`}>
          {!isSystem && (
            <div className="text-xs opacity-70 mb-1">{msg.senderName}</div>
          )}
          <div className="whitespace-pre-wrap">{msg.content}</div>
          <div
            className={`text-xs mt-1 flex items-center justify-between ${isMyMessage ? "text-gray-500" : "text-blue-100"}`}>
            <span>
              {formatDistanceToNow(new Date(msg.createdAt), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
            {isMyMessage && !isSystem && (
              <span className="ml-2">
                {msg.isRead ? (
                  <span
                    title={`Прочитано ${msg.readAt ? formatDistanceToNow(new Date(msg.readAt), { addSuffix: true, locale: ru }) : ""}`}>
                    ✓✓
                  </span>
                ) : msg.isDelivered ? (
                  <span
                    title={`Доставлено ${msg.deliveredAt ? formatDistanceToNow(new Date(msg.deliveredAt), { addSuffix: true, locale: ru }) : ""}`}>
                    ✓
                  </span>
                ) : (
                  <span title="Отправляется...">○</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">
            {chat.user
              ? `${chat.user.firstName || ""} ${chat.user.lastName || ""}`.trim()
              : "Аноним"}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Чат создан{" "}
            {formatDistanceToNow(new Date(chat.createdAt), {
              addSuffix: true,
              locale: ru,
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isManager && !chat.managerId && (
            <button
              onClick={assignToSelf}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              Взять чат
            </button>
          )}

          {isManager && chat.isActive && (
            <>
              <button
                onClick={() => setShowOfferForm(!showOfferForm)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Предложить товар
              </button>

              <button
                onClick={closeChat}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                Закрыть чат
              </button>
            </>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Product offer form */}
      {showOfferForm && isManager && (
        <form onSubmit={createOffer} className="p-4 border-b bg-gray-50">
          <h4 className="font-medium mb-3">Создать товарное предложение</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название товара"
              value={offerData.name}
              onChange={e =>
                setOfferData({ ...offerData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <textarea
              placeholder="Описание (необязательно)"
              value={offerData.description}
              onChange={e =>
                setOfferData({ ...offerData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
            <input
              type="number"
              placeholder="Цена"
              value={offerData.price || ""}
              onChange={e =>
                setOfferData({ ...offerData, price: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="0.01"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Отправить предложение
              </button>
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderMessage)}

        {/* Active offers */}
        {chat.offers.filter(o => o.isActive).length > 0 && (
          <div className="my-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium mb-3">Товарные предложения:</p>
            <div className="space-y-2">
              {chat.offers
                .filter(o => o.isActive)
                .map(offer => (
                  <div key={offer.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{offer.name}</p>
                        {offer.description && (
                          <p className="text-sm text-gray-600">
                            {offer.description}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-green-600">
                        {Number(offer.price).toLocaleString()} ₽
                      </p>
                    </div>
                    {!isManager && (
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                        Добавить в корзину
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {chat.isActive && (
        <form onSubmit={sendMessage} className="border-t p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
                placeholder="Введите сообщение..."
                className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-1">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}

      {!chat.isActive && (
        <div className="p-4 text-center text-gray-500 border-t">
          Этот чат закрыт
        </div>
      )}
    </div>
  )
}
