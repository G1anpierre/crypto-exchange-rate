'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Add welcome message if no messages exist
  const displayMessages = messages.length === 0 ? [
    {
      id: 'welcome',
      role: 'assistant' as const,
      parts: [
        {
          type: 'text' as const,
          text: 'Hi there! 👋 Welcome to CryptoCurrent. I can help you with:\n\n• Real-time crypto exchange rates\n• Latest cryptocurrency news\n• Education about blockchain and crypto concepts\n\nHow can I assist you today?',
        },
      ],
      status: 'ready' as const,
    },
  ] : messages;

  const isLoading = status === 'submitted' || status === 'streaming';


  return (
    <>
      {/* Chat Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="fixed bottom-24 right-4 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-white" />
                <div>
                  <h3 className="font-semibold text-white">CryptoCurrent AI</h3>
                  <p className="text-xs text-blue-100">Powered by Llama 3.3 70B (Free)</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white transition-colors hover:bg-white/20"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <p className="font-semibold">Error</p>
                  <p>{error.message}</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <ChatInput
                sendMessage={sendMessage}
                isLoading={isLoading}
                stop={stop}
              />
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </>
  );
}
