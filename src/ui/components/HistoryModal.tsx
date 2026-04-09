import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { uiAudio } from '@/utils/audioManager';
import type { StoryNode } from '@/game/story/types';

interface HistoryModalProps {
  open: boolean;
  history: Array<{ nodeId: string; choiceId?: string }>;
  nodeMap: Map<string, StoryNode>;
  onJump: (nodeId: string) => void;
  onClose: () => void;
}

function formatChapterFromNodeId(nodeId: string): string {
  if (nodeId.startsWith('prolog_0')) return '序章';
  const match = /ch_([a-z]+)_(\d{3})/i.exec(nodeId);
  if (match) {
    const chapterNum = match[2];
    return `第${chapterNum}章`;
  }
  return '未知';
}

function getNodePreview(node: StoryNode): string {
  const content = node.content || '';
  const firstLine = content.split('\n').find(line => line.trim().length > 0) || '';
  return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
}

function getNodeTypeLabel(type: string): string {
  switch (type) {
    case 'narration': return '叙述';
    case 'dialogue': return '对话';
    case 'choice': return '抉择';
    case 'scene': return '场景';
    case 'transition': return '转场';
    case 'ending': return '结尾';
    case 'qte': return '考验';
    default: return type;
  }
}

export function HistoryModal({ open, history, nodeMap, onJump, onClose }: HistoryModalProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const reversedHistory = useMemo(() => {
    return [...history].reverse();
  }, [history]);

  const groupedByChapter = useMemo(() => {
    const groups: Record<string, typeof reversedHistory> = {};
    for (const entry of reversedHistory) {
      const chapter = formatChapterFromNodeId(entry.nodeId);
      if (!groups[chapter]) groups[chapter] = [];
      groups[chapter].push(entry);
    }
    return groups;
  }, [reversedHistory]);

  if (!open) return null;

  const handleJump = (nodeId: string) => {
    uiAudio.playClick();
    onJump(nodeId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => {
        uiAudio.playClick();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 680,
          maxWidth: '94vw',
          maxHeight: '85vh',
          borderRadius: 10,
          border: '1px solid rgba(139,115,85,0.55)',
          background: 'linear-gradient(160deg, #f0e8d5 0%, #e8dcc4 55%, #d6c9a8 100%)',
          boxShadow: '0 24px 56px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ padding: '18px 20px', borderBottom: '1px solid rgba(139,115,85,0.35)', flexShrink: 0 }}>
          <div style={{ fontSize: 22, letterSpacing: 1.5, color: '#2a1e0e', fontWeight: 700 }}>往圣之迹</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6f5a3f', lineHeight: 1.5 }}>
            已历 {history.length} 章节 · 点击可跳转至任意过往节点
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          {reversedHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a7a63' }}>
              尚无历史记录
            </div>
          ) : (
            Object.entries(groupedByChapter).map(([chapter, entries]) => (
              <div key={chapter} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#5e4a2f',
                  letterSpacing: '0.15em',
                  marginBottom: 8,
                  padding: '4px 8px',
                  background: 'rgba(139,115,85,0.15)',
                  borderRadius: 4,
                }}>
                  {chapter}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {entries.map((entry, idx) => {
                    const node = nodeMap.get(entry.nodeId);
                    if (!node) return null;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <motion.button
                        key={`${entry.nodeId}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => handleJump(entry.nodeId)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          padding: '10px 12px',
                          borderRadius: 6,
                          border: isHovered ? '1px solid rgba(139,115,85,0.5)' : '1px solid rgba(139,115,85,0.2)',
                          background: isHovered ? 'rgba(139,115,85,0.12)' : 'rgba(255,255,255,0.4)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10,
                              borderRadius: 3,
                              padding: '1px 5px',
                              background: 'rgba(139,115,85,0.2)',
                              color: '#5e4a2f',
                              fontWeight: 600,
                            }}>
                              {getNodeTypeLabel(node.type)}
                            </span>
                            {node.speaker && (
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#3b2c17' }}>
                                {node.speaker}
                              </span>
                            )}
                          </div>
                          {isHovered && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{ fontSize: 10, color: '#8a7a63' }}
                            >
                              点击跳转
                            </motion.span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#6f5a3f', lineHeight: 1.4 }}>
                          {getNodePreview(node)}
                        </div>
                        {entry.choiceId && node.choices && (
                          <div style={{
                            fontSize: 10,
                            color: '#8a7a63',
                            marginTop: 2,
                            fontStyle: 'italic',
                          }}>
                            → 选择了选项 #{node.choices.findIndex(c => c.id === entry.choiceId) + 1}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <footer style={{
          padding: '12px 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(139,115,85,0.2)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.2)',
        }}>
          <span style={{ fontSize: 12, color: '#6f5a3f' }}>提示：跳转后将中断当前进度</span>
          <button
            onClick={() => {
              uiAudio.playClick();
              onClose();
            }}
            onMouseEnter={() => uiAudio.playHover()}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid rgba(139,115,85,0.45)',
              background: '#f8f3e8',
              color: '#3b2c17',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            关闭
          </button>
        </footer>
      </motion.div>
    </div>
  );
}