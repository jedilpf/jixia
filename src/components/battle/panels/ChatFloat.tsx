﻿﻿﻿﻿﻿﻿﻿/**
 * 消息/表情浮层
 * 轻量级社交功能 - 支持表情、快捷消息和自定义输入
 */

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'player' | 'enemy' | 'system';
  content: string;
  type: 'emoji' | 'text';
  timestamp: number;
}

interface ChatFloatProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onSendEmoji: (emoji: string) => void;
  messages?: ChatMessage[];
  playerName?: string;
  enemyName?: string;
}

const QUICK_MESSAGES = [
  { text: '你好', icon: '👋' },
  { text: '来吧', icon: '⚔️' },
  { text: '好险', icon: '😰' },
  { text: '精彩', icon: '🎉' },
  { text: '厉害', icon: '💪' },
  { text: '承让', icon: '🙏' },
  { text: '思考中', icon: '🤔' },
  { text: '再来一局', icon: '🔄' },
];

const EMOJI_CATEGORIES = [
  {
    name: '表情',
    emojis: ['😀', '😎', '🤔', '😤', '😂', '😅', '😊', '😍', '🤩', '😏', '😌', '🥳'],
  },
  {
    name: '手势',
    emojis: ['👍', '👎', '✌️', '🙏', '💪', '👏', '🤝', '👋', '🤙', '👊', '🙌', '✋'],
  },
  {
    name: '符号',
    emojis: ['🔥', '⭐', '💎', '🎯', '🏆', '💫', '✨', '💥', '⚡', '🌟', '❤️', '💯'],
  },
];

const ChatFloat: React.FC<ChatFloatProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  onSendEmoji,
  messages = [],
  playerName = '我方',
  enemyName = '敌方',
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'message' | 'history'>('emoji');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendEmoji = (emoji: string) => {
    onSendEmoji(emoji);
  };

  const handleSendMessage = (message: string) => {
    onSendMessage(message);
    setInputMessage('');
    setShowInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      handleSendMessage(inputMessage.trim());
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] rounded-2xl border border-[#5c4d3a]/50 shadow-2xl pointer-events-auto w-[340px] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#3d3225]/50 bg-gradient-to-r from-[#1a1510] to-[#151210]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9952a] to-[#8a6a1a] flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
            <span className="text-[#c9b896] font-medium">快捷交流</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#2a2318] border border-[#3d3225] text-[#8a7a6a] hover:text-[#c9725a] hover:border-[#c9725a]/50 transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-[#3d3225]/30">
          {[
            { key: 'emoji', label: '表情', icon: '😊' },
            { key: 'message', label: '消息', icon: '💬' },
            { key: 'history', label: '记录', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.key
                  ? 'text-[#c9952a]'
                  : 'text-[#8a7a6a] hover:text-[#b8a88a]'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#c9952a] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[280px] max-h-[360px] overflow-hidden flex flex-col">
          {activeTab === 'emoji' && (
            <>
              <div className="flex gap-1 px-4 py-2 border-b border-[#3d3225]/20 bg-[#0d0b08]/30">
                {EMOJI_CATEGORIES.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(index)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedCategory === index
                        ? 'bg-[#c9952a]/20 text-[#c9952a] border border-[#c9952a]/30'
                        : 'text-[#8a7a6a] hover:text-[#b8a88a] hover:bg-[#2a2318]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendEmoji(emoji)}
                      className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2a2318] to-[#1f1a12] border border-[#3d3225]/50 hover:border-[#c9952a]/50 hover:from-[#3d3225] hover:to-[#2a2318] transition-all text-xl flex items-center justify-center transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'message' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {QUICK_MESSAGES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSendMessage(item.text)}
                    className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#2a2318] to-[#1f1a12] border border-[#3d3225]/50 text-sm text-[#b8a88a] hover:border-[#c9952a]/50 hover:text-[#c9b896] transition-all flex items-center gap-2 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>

              {!showInput ? (
                <button
                  onClick={() => setShowInput(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#3d3225] text-[#8a7a6a] hover:border-[#c9952a]/50 hover:text-[#b8a88a] transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  自定义消息
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息..."
                    maxLength={20}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0d0b08] border border-[#3d3225] text-[#c9b896] placeholder-[#5c4d3a] focus:border-[#c9952a]/50 focus:outline-none transition-all text-sm"
                  />
                  <button
                    onClick={() => inputMessage.trim() && handleSendMessage(inputMessage.trim())}
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c9952a] to-[#a87a1a] text-white font-medium hover:from-[#d9a53a] hover:to-[#b88a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    发送
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#5c4d3a]">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1510] border border-[#3d3225]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-sm">暂无聊天记录</p>
                  <p className="text-xs mt-1 text-[#4a3d2a]">发送消息后将在此显示</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${
                        msg.sender === 'player' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-xl max-w-[80%] ${
                          msg.sender === 'player'
                            ? 'bg-gradient-to-r from-[#c9952a]/20 to-[#a87a1a]/20 border border-[#c9952a]/30'
                            : msg.sender === 'enemy'
                            ? 'bg-gradient-to-r from-[#5a3a2a]/20 to-[#4a2a1a]/20 border border-[#5a3a2a]/30'
                            : 'bg-[#1a1510] border border-[#3d3225]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium ${
                              msg.sender === 'player'
                                ? 'text-[#c9952a]'
                                : msg.sender === 'enemy'
                                ? 'text-[#c9725a]'
                                : 'text-[#8a7a6a]'
                            }`}
                          >
                            {msg.sender === 'player' ? playerName : msg.sender === 'enemy' ? enemyName : '系统'}
                          </span>
                          <span className="text-xs text-[#5c4d3a]">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p
                          className={`text-sm ${
                            msg.type === 'emoji' ? 'text-2xl' : 'text-[#c9b896]'
                          }`}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-10 px-4 flex items-center justify-between border-t border-[#3d3225]/30 bg-[#0d0b08]/50 text-xs text-[#5c4d3a]">
          <span>点击发送后自动关闭</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            在线
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatFloat;
