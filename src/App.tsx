import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Wifi, WifiOff, Settings } from 'lucide-react'
import io from 'socket.io-client'
import './App.css'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface TelegramMessage {
  id: number
  chatId: number
  userId: number
  username: string
  text: string
  response: string
  timestamp: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [telegramMessages, setTelegramMessages] = useState<TelegramMessage[]>([])
  const [conversationId] = useState(`web_${Date.now()}`)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    // Connect to WebSocket
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001'
    socketRef.current = io(socketUrl)
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socketRef.current.on('cursor_response', (data: any) => {
      const newMessage: Message = {
        id: data.id,
        type: 'assistant',
        content: data.content,
        timestamp: data.timestamp
      }
      setMessages(prev => [...prev, newMessage])
    })

    socketRef.current.on('telegram_message', (data: TelegramMessage) => {
      setTelegramMessages(prev => [...prev, data])
    })

    socketRef.current.on('error', (error: any) => {
      console.error('Socket error:', error)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return

    const newMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    socketRef.current.emit('web_message', {
      message: inputMessage,
      conversationId: conversationId
    })
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Bot size={24} />
            <h1>Telegram-Cursor Relay</h1>
          </div>
          <div className="status">
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <div className="chat-container">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <Bot size={48} />
                <h2>Welcome to Telegram-Cursor Relay!</h2>
                <p>Start a conversation with the AI assistant below.</p>
                <p>You can also connect via Telegram bot for mobile access.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={1}
                disabled={!isConnected}
              />
              <button 
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                className="send-button"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Telegram Messages</h3>
            <div className="telegram-messages">
              {telegramMessages.length === 0 ? (
                <p className="no-messages">No Telegram messages yet</p>
              ) : (
                telegramMessages.map((msg) => (
                  <div key={msg.id} className="telegram-message">
                    <div className="telegram-header">
                      <span className="username">@{msg.username}</span>
                      <span className="time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="telegram-text">{msg.text}</div>
                    <div className="telegram-response">{msg.response}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Settings</h2>
            <div className="setting-item">
              <label>Connection Status:</label>
              <span className={isConnected ? 'status-connected' : 'status-disconnected'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="setting-item">
              <label>Conversation ID:</label>
              <span className="conversation-id">{conversationId}</span>
            </div>
            <div className="setting-item">
              <label>Messages Count:</label>
              <span>{messages.length}</span>
            </div>
            <button 
              className="close-settings"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App