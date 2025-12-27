'use client';

import { FormEvent, useRef, useEffect, useState } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  sendMessage: (message: any) => void;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({
  sendMessage,
  isLoading,
  stop,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crypto rates, news, or education..."
          rows={1}
          className="max-h-32 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {input.length > 0 && `${input.length}`}
        </div>
      </div>

      {isLoading ? (
        <button
          type="button"
          onClick={stop}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
          aria-label="Stop generating"
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
