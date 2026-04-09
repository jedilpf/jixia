/**
 * 剧情系统诊断脚本
 * 在浏览器控制台中运行，检查节点跳转
 */

// 复制到浏览器控制台运行
(function() {
  console.log('=== 剧情系统诊断 ===\n');

  // 假设 getStoryEngine 在全局可用
  const engine = window.getStoryEngine ? window.getStoryEngine() : null;

  if (!engine) {
    console.error('❌ 无法获取 StoryEngine，请确保在游戏内运行');
    return;
  }

  // 1. 检查当前节点
  const currentNode = engine.getCurrentNode();
  console.log('1. 当前节点:', currentNode?.id);
  console.log('   类型:', currentNode?.type);
  console.log('   内容:', currentNode?.content?.substring(0, 80) + '...');

  // 2. 检查可用选择
  const choices = engine.getAvailableChoices();
  console.log('\n2. 可用选择:', choices.length, '个');
  choices.forEach((c, i) => {
    console.log(`   [${i+1}] ${c.text}`);
    console.log(`       -> ${c.nextNode}`);
    console.log(`       条件: ${c.conditions?.length || 0}`);
  });

  // 3. 检查 nextNode
  console.log('\n3. 当前节点 nextNode:', currentNode?.nextNode || '无');

  // 4. 检查历史记录
  const history = engine.getHistory?.() || [];
  console.log('\n4. 历史记录:', history.length, '条');
  if (history.length > 0) {
    const last5 = history.slice(-5);
    last5.forEach((h, i) => {
      console.log(`   ${i+1}. ${h.nodeId}${h.choiceId ? ' [选择: ' + h.choiceId + ']' : ''}`);
    });
  }

  // 5. 检查节点是否存在
  if (currentNode?.nextNode) {
    const nodeMap = engine['nodeMap'];
    const exists = nodeMap?.has(currentNode.nextNode);
    console.log('\n5. nextNode 验证:', currentNode.nextNode, exists ? '✅ 存在' : '❌ 不存在');
  }

  // 6. 检查处理锁
  const isProcessing = engine['isProcessing'];
  console.log('\n6. 处理锁状态:', isProcessing ? '🔒 锁定中' : '✅ 未锁定');

  // 7. 建议
  console.log('\n=== 诊断建议 ===');
  if (isProcessing) {
    console.log('⚠️  处理锁被锁定，这可能导致无法跳转');
    console.log('   尝试: 刷新页面');
  }
  if (!currentNode?.nextNode && choices.length === 0) {
    console.log('⚠️  当前节点没有 nextNode 也没有选择');
    console.log('   这可能是 ending 节点');
  }
  if (choices.length > 0) {
    console.log('✅ 有可用的选择，请尝试选择一个选项');
  }

  console.log('\n诊断完成!');
})();
