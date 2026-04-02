/**
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
  { text: '见礼', icon: '🙏' },
  { text: '请论', icon: '⚔️' },
  { text: '且慢', icon: '😰' },
  { text: '妙笔', icon: '🎉' },
  { text: '折服', icon: '💪' },
  { text: '受教', icon: '🙏' },
  { text: '研考', icon: '🤔' },
  { text: '再叙', icon: '🔄' },
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative bg-[#FDFBF7] rounded-[2.5rem] border-4 border-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] w-[360px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 pointer-events-auto">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]">
               <span className="text-[10px] font-black uppercase tracking-widest">声</span>
            </div>
            <span className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest">声息互通</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90 shadow-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-[#1A1A1A]/5 bg-white/40">
          {[
            { key: 'emoji', label: '表情', icon: '😊' },
            { key: 'message', label: '寒暄', icon: '🙏' },
            { key: 'history', label: '记录', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-4 text-xs font-black transition-all relative ${
                activeTab === tab.key
                  ? 'text-[#3A5F41]'
                  : 'text-[#5C4033]/40 hover:text-[#1A1A1A]'
              }`}
            >
              <span className="mr-1 opacity-60">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#3A5F41] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[320px] max-h-[400px] overflow-hidden flex flex-col relative">
           <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
          {activeTab === 'emoji' && (
            <>
              <div className="flex gap-2 px-6 py-3 border-b border-[#1A1A1A]/5 bg-white/20 overflow-x-auto scrollbar-hide">
                {EMOJI_CATEGORIES.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(index)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all shrink-0 uppercase ${
                      selectedCategory === index
                        ? 'bg-[#1A1A1A] text-white shadow-md'
                        : 'text-[#5C4033]/40 hover:text-[#1A1A1A] hover:bg-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-4 gap-3">
                  {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendEmoji(emoji)}
                      className="w-14 h-14 rounded-2xl bg-white border-2 border-[#1A1A1A]/5 hover:border-[#3A5F41] hover:shadow-xl transition-all text-2xl flex items-center justify-center transform hover:scale-110 active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'message' && (
            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {QUICK_MESSAGES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSendMessage(item.text)}
                    className="px-4 py-3 rounded-2xl bg-white border-2 border-[#1A1A1A]/5 text-sm font-bold text-[#1A1A1A] hover:border-[#3A5F41] hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    <span className="text-base grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>

              {!showInput ? (
                <button
                  onClick={() => setShowInput(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-[#1A1A1A]/10 text-[10px] font-black text-[#5C4033]/40 hover:border-[#3A5F41] hover:text-[#3A5F41] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <span>✏️</span>
                  自定义寒暄
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="请输入..."
                    maxLength={20}
                    className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-[#1A1A1A]/5 text-sm font-bold text-[#1A1A1A] placeholder-[#5C4033]/30 focus:border-[#3A5F41] focus:outline-none transition-all shadow-sm"
                  />
                   <div className="flex gap-2">
                    <button
                      onClick={() => setShowInput(false)}
                      className="flex-1 py-3.5 rounded-2xl bg-[#1A1A1A]/5 text-[10px] font-black text-[#1A1A1A]/40 hover:bg-[#1A1A1A]/10 transition-all uppercase tracking-widest"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => inputMessage.trim() && handleSendMessage(inputMessage.trim())}
                      disabled={!inputMessage.trim()}
                      className="flex-[2] py-3.5 rounded-2xl bg-[#3A5F41] text-white font-black hover:shadow-xl disabled:opacity-30 transition-all text-xs uppercase tracking-widest"
                    >
                      发送翰墨
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <div className="text-6xl font-black italic mb-4 text-[#1A1A1A]">静</div>
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase">虚位以待，墨香尚存于心</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender === 'player' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-[1.5rem] max-w-[85%] border-2 transition-all relative ${
                          msg.sender === 'player'
                            ? 'bg-white border-[#3A5F41]/10 shadow-sm'
                            : msg.sender === 'enemy'
                            ? 'bg-white border-[#8D2F2F]/10 shadow-sm'
                            : 'bg-[#FDFBF7] border-[#1A1A1A]/5 opacity-60'
                        }`}
                      >
                        <div className={`flex items-center gap-2 mb-2 ${msg.sender === 'player' ? 'flex-row-reverse text-right' : ''}`}>
                          <span
                            className={`w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-black text-white shadow-sm`}
                            style={{ 
                              backgroundColor: msg.sender === 'player' ? '#3A5F41' : msg.sender === 'enemy' ? '#8D2F2F' : '#1A1A1A',
                            }}
                          >
                            {msg.sender === 'player' ? '予' : msg.sender === 'enemy' ? '彼' : '司'}
                          </span>
                          <span className="text-[9px] font-black text-[#5C4033]/30 tabular-nums">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p
                          className={`font-black tracking-tight ${
                             msg.type === 'emoji' ? 'text-3xl' : 'text-sm text-[#1A1A1A]'
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
        </div>

        <div className="h-12 px-6 flex items-center justify-between border-t border-[#1A1A1A]/5 bg-white uppercase overflow-hidden">
          <div className="flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#3A5F41]" />
            <span className="text-[8px] font-black text-[#3A5F41] tracking-widest">CONNECTED TO ACADEMY</span>
          </div>
          <span className="text-[8px] font-black text-[#5C4033]/20 tracking-widest italic">V9 Refined Social</span>
        </div>
      </div>
    </div>
  );
};

export default ChatFloat;
