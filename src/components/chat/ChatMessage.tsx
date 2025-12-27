'use client';

import { UIMessage } from '@ai-sdk/react';
import { User, Bot, TrendingUp, Newspaper, GraduationCap, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Render message parts
  const renderMessageContent = () => {
    console.log('=== ChatMessage Render ===');
    console.log('Message ID:', message.id);
    console.log('Message role:', message.role);
    console.log('Message parts count:', message.parts?.length);
    console.log('All parts:', JSON.stringify(message.parts, null, 2));

    return message.parts.map((part: any, index: number) => {
      console.log(`Part ${index} type:`, part.type);

      // Text content
      if (part.type === 'text' || typeof part === 'string') {
        const text = typeof part === 'string' ? part : part.text;
        console.log(`Part ${index} text:`, text);

        // Skip empty text parts
        if (!text || text.trim() === '') {
          console.warn(`Skipping empty text part at index ${index}`);
          return null;
        }

        return (
          <div key={index} className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-sm dark:bg-white/10">
                    {children}
                  </code>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        );
      }

      // Tool call
      if (part.type === 'tool-call') {
        const toolName = part.toolName;
        return (
          <div
            key={index}
            className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {toolName === 'getExchangeRate' && 'Fetching exchange rate...'}
              {toolName === 'getNews' && 'Loading latest news...'}
              {toolName === 'educateCrypto' && 'Preparing explanation...'}
            </span>
          </div>
        );
      }

      // Tool result
      if (part.type === 'tool-result') {
        const toolName = part.toolName;
        const result = part.result;

        if (toolName === 'getExchangeRate' && result.success) {
          return (
            <div
              key={index}
              className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Exchange Rate
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-mono text-lg font-bold text-green-800 dark:text-green-200">
                  1 {result.from} = {parseFloat(result.rate).toFixed(2)} {result.to}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Last updated: {new Date(result.lastRefreshed).toLocaleString()}
                </p>
              </div>
            </div>
          );
        }

        if (toolName === 'getNews' && result.success) {
          return (
            <div
              key={index}
              className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  Latest News from {result.source}
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                Found {result.articleCount} articles
              </p>
            </div>
          );
        }

        if (toolName === 'educateCrypto' && result.success) {
          return (
            <div
              key={index}
              className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  Learning about: {result.topic}
                </span>
              </div>
            </div>
          );
        }

        // Error state
        if (!result.success) {
          return (
            <div
              key={index}
              className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              Error: {result.error}
            </div>
          );
        }
      }

      return null;
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {renderMessageContent()}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
}
