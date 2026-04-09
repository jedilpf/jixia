/**
 * 存档槽位管理器增强版
 *
 * 功能：
 * - 存档槽位可视化展示
 * - 云同步状态指示器
 * - 槽位对比功能
 * - 删除槽位功能
 * - 自动存档开关
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveManager, type SaveSlotType, type SaveSlotInfo, type UnifiedSaveData } from '@/utils/SaveManager';
import { uiAudio } from '@/utils/audioManager';

interface SaveSlotManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSlotSelect?: (slot: SaveSlotType) => void;
  currentGameState?: UnifiedSaveData | null;
  mode?: 'manage' | 'save' | 'load';
}

const SLOT_CONFIG: Record<SaveSlotType, { label: string; icon: string; color: string }> = {
  autosave: { label: '自动存档', icon: '🔄', color: '#5ac972' },
  manual_1: { label: '存档槽位 1', icon: '📝', color: '#d4a520' },
  manual_2: { label: '存档槽位 2', icon: '📝', color: '#d4a520' },
  manual_3: { label: '存档槽位 3', icon: '📝', color: '#d4a520' },
};

function formatPlayTime(ms?: number): string {
  if (!ms) return '未知';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}小时${minutes}分钟`;
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '未知';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SaveSlotManager({
  isOpen,
  onClose,
  onSlotSelect,
  currentGameState,
  mode = 'manage',
}: SaveSlotManagerProps) {
  const [slots, setSlots] = useState<Record<SaveSlotType, SaveSlotInfo>>(() => saveManager.getAllSlotInfos());
  const [selectedSlot, setSelectedSlot] = useState<SaveSlotType | null>(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<SaveSlotType | null>(null);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 刷新槽位信息
  const refreshSlots = useCallback(() => {
    setSlots(saveManager.getAllSlotInfos());
  }, []);

  // 存档操作
  const handleSave = useCallback((slot: SaveSlotType) => {
    if (!currentGameState) {
      console.warn('[SaveSlotManager] 无当前游戏状态');
      return;
    }
    const success = saveManager.saveToSlot(slot, currentGameState);
    if (success) {
      refreshSlots();
      uiAudio.playClick();
    }
  }, [currentGameState, refreshSlots]);

  // 读档操作
  const handleLoad = useCallback((slot: SaveSlotType) => {
    const data = saveManager.loadFromSlot(slot);
    if (data && onSlotSelect) {
      onSlotSelect(slot);
      uiAudio.playClick();
    }
  }, [onSlotSelect]);

  // 删除槽位
  const handleDelete = useCallback((slot: SaveSlotType) => {
    if (slot === 'autosave') {
      console.warn('[SaveSlotManager] 不能删除自动存档');
      return;
    }
    saveManager.deleteSlot(slot);
    refreshSlots();
    setDeleteConfirmSlot(null);
    uiAudio.playClick();
  }, [refreshSlots]);

  // 云同步
  const handleCloudSync = useCallback(async () => {
    setIsSyncing(true);
    // TODO: 实现真实云同步
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    console.warn('[SaveSlotManager] 云同步功能预留');
  }, []);

  // 槽位对比数据
  const comparisonData = useMemo(() => {
    const existingSlots = Object.values(slots).filter(s => s.exists);
    if (existingSlots.length < 2) return null;

    return existingSlots.map(s => ({
      slot: s.id,
      chapter: s.chapter ?? 0,
      playTime: s.playTime ?? 0,
      nodeCount: s.nodeCount ?? 0,
    }));
  }, [slots]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,21,16,0.98), rgba(13,11,8,0.98))',
            border: '2px solid rgba(201,149,42,0.5)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* 标题区 */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(201,149,42,0.2)' }}
          >
            <div>
              <h2
                className="text-xl font-serif font-bold"
                style={{ color: '#d4a520' }}
              >
                存档管理
              </h2>
              <p className="text-sm mt-1" style={{ color: '#a7c5ba' }}>
                管理、备份和恢复游戏进度
              </p>
            </div>

            {/* 云同步状态 */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: cloudSyncEnabled ? 'rgba(90,201,114,0.15)' : 'rgba(100,100,100,0.15)',
                  border: `1px solid ${cloudSyncEnabled ? 'rgba(90,201,114,0.4)' : 'rgba(100,100,100,0.3)'}`,
                }}
              >
                <span className="text-sm" style={{ color: cloudSyncEnabled ? '#5ac972' : '#666' }}>
                  {isSyncing ? '同步中...' : cloudSyncEnabled ? '云同步已开启' : '云同步未开启'}
                </span>
                {isSyncing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: '#5ac972', borderTopColor: 'transparent' }}
                  />
                )}
              </div>
              <button
                onClick={handleCloudSync}
                disabled={!cloudSyncEnabled || isSyncing}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: 'rgba(201,149,42,0.15)',
                  border: '1px solid rgba(201,149,42,0.3)',
                  color: '#d4a520',
                  cursor: cloudSyncEnabled && !isSyncing ? 'pointer' : 'not-allowed',
                  opacity: cloudSyncEnabled && !isSyncing ? 1 : 0.5,
                }}
              >
                立即同步
              </button>
            </div>
          </div>

          {/* 自动存档开关 */}
          <div
            className="px-6 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(60,50,40,0.3)' }}
          >
            <span className="text-sm" style={{ color: '#c9b896' }}>
              自动存档（每30秒）
            </span>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="w-12 h-6 rounded-full relative transition-all"
              style={{
                background: autoSaveEnabled ? 'rgba(90,201,114,0.3)' : 'rgba(100,100,100,0.3)',
                border: `1px solid ${autoSaveEnabled ? '#5ac972' : '#666'}`,
              }}
            >
              <motion.div
                className="w-5 h-5 rounded-full absolute top-0.5"
                animate={{ x: autoSaveEnabled ? 28 : 4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: autoSaveEnabled ? '#5ac972' : '#888',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>

          {/* 槽位列表 */}
          <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto">
            {Object.entries(slots).map(([slotId, info]) => {
              const config = SLOT_CONFIG[slotId as SaveSlotType];
              const isSelected = selectedSlot === slotId;
              const isAutosave = slotId === 'autosave';

              return (
                <motion.button
                  key={slotId}
                  onClick={() => {
                    setSelectedSlot(slotId as SaveSlotType);
                    uiAudio.playHover();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-lg relative"
                  style={{
                    background: isSelected
                      ? 'rgba(201,149,42,0.15)'
                      : 'rgba(30,25,20,0.5)',
                    border: `2px solid ${
                      isSelected
                        ? 'rgba(201,149,42,0.6)'
                        : 'rgba(139,115,85,0.25)'
                    }`,
                    boxShadow: isSelected
                      ? '0 0 20px rgba(201,149,42,0.3)'
                      : 'none',
                  }}
                >
                  {/* 槽位头部 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span
                        className="font-serif font-bold"
                        style={{ color: '#f5e6b8' }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background: info.exists
                          ? 'rgba(90,201,114,0.15)'
                          : 'rgba(100,100,100,0.15)',
                        border: `1px solid ${
                          info.exists
                            ? 'rgba(90,201,114,0.4)'
                            : 'rgba(100,100,100,0.3)'
                        }`,
                        color: info.exists ? '#5ac972' : '#888',
                      }}
                    >
                      {info.exists ? '有数据' : '空槽位'}
                    </div>
                  </div>

                  {/* 槽位详情 */}
                  {info.exists ? (
                    <div
                      className="grid grid-cols-2 gap-2 text-xs"
                      style={{ color: '#a7c5ba' }}
                    >
                      <div>章节: {info.chapter === 0 ? '序章' : `第${info.chapter}章`}</div>
                      <div>时间: {formatPlayTime(info.playTime)}</div>
                      <div>节点: {info.nodeCount ?? 0}个</div>
                      <div>存档: {formatDate(info.timestamp)}</div>
                    </div>
                  ) : (
                    <div className="text-xs" style={{ color: '#888' }}>
                      当前没有存档数据
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex gap-2"
                    >
                      {mode === 'save' && !isAutosave && (
                        <button
                          onClick={() => handleSave(slotId as SaveSlotType)}
                          className="px-4 py-1.5 rounded-lg text-xs"
                          style={{
                            background: 'rgba(90,201,114,0.2)',
                            border: '1px solid rgba(90,201,114,0.4)',
                            color: '#5ac972',
                          }}
                        >
                          {info.exists ? '覆盖存档' : '保存到此'}
                        </button>
                      )}
                      {mode === 'load' && info.exists && (
                        <button
                          onClick={() => handleLoad(slotId as SaveSlotType)}
                          className="px-4 py-1.5 rounded-lg text-xs"
                          style={{
                            background: 'rgba(201,149,42,0.2)',
                            border: '1px solid rgba(201,149,42,0.4)',
                            color: '#d4a520',
                          }}
                        >
                          读取存档
                        </button>
                      )}
                      {!isAutosave && info.exists && (
                        <button
                          onClick={() => setDeleteConfirmSlot(slotId as SaveSlotType)}
                          className="px-4 py-1.5 rounded-lg text-xs"
                          style={{
                            background: 'rgba(141,47,47,0.2)',
                            border: '1px solid rgba(141,47,47,0.4)',
                            color: '#ff6666',
                          }}
                        >
                          删除
                        </button>
                      )}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 槽位对比 */}
          {comparisonData && comparisonData.length >= 2 && (
            <div
              className="px-6 py-4"
              style={{ borderTop: '1px solid rgba(60,50,40,0.3)' }}
            >
              <h3
                className="text-sm font-serif mb-3"
                style={{ color: '#a7c5ba' }}
              >
                存档对比
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {comparisonData.map((item, index) => (
                  <div
                    key={item.slot}
                    className="px-3 py-2 rounded-lg text-xs"
                    style={{
                      background: 'rgba(30,25,20,0.5)',
                      border: '1px solid rgba(139,115,85,0.25)',
                      color: '#c9b896',
                    }}
                  >
                    <div className="font-bold mb-1">{SLOT_CONFIG[item.slot].label}</div>
                    <div>章节{index === 0 ? '★' : ''}: {item.chapter}</div>
                    <div>时间: {formatPlayTime(item.playTime)}</div>
                    <div>节点: {item.nodeCount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作 */}
          <div
            className="px-6 py-4 flex justify-between"
            style={{ borderTop: '1px solid rgba(201,149,42,0.2)' }}
          >
            <button
              onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{
                background: 'rgba(90,201,114,0.15)',
                border: '1px solid rgba(90,201,114,0.3)',
                color: '#5ac972',
              }}
            >
              {cloudSyncEnabled ? '关闭云同步' : '开启云同步'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(201,149,42,0.2)',
                border: '1px solid rgba(201,149,42,0.4)',
                color: '#d4a520',
              }}
            >
              关闭
            </button>
          </div>

          {/* 删除确认对话框 */}
          <AnimatePresence>
            {deleteConfirmSlot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.8)' }}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="w-80 p-6 rounded-xl"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(26,21,16,0.98), rgba(13,11,8,0.98))',
                    border: '2px solid rgba(141,47,47,0.5)',
                  }}
                >
                  <div
                    className="text-lg font-serif font-bold mb-2"
                    style={{ color: '#ff6666' }}
                  >
                    确认删除存档
                  </div>
                  <div className="text-sm mb-4" style={{ color: '#a7c5ba' }}>
                    删除「{SLOT_CONFIG[deleteConfirmSlot].label}」后数据无法恢复。
                    确定要继续吗？
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirmSlot(null)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm"
                      style={{
                        background: 'rgba(100,100,100,0.2)',
                        border: '1px solid rgba(100,100,100,0.3)',
                        color: '#888',
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirmSlot)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm"
                      style={{
                        background: 'rgba(141,47,47,0.3)',
                        border: '1px solid rgba(141,47,47,0.5)',
                        color: '#ff6666',
                      }}
                    >
                      确认删除
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}