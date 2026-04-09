/**
 * 剧情系统节点跳转测试
 * 验证选择后是否正确跳转到下一个节点
 */

import { getStoryEngine, type StoryNode } from '../src/game/story';

function runStoryTest() {
  console.log('=== 剧情系统节点跳转测试 ===\n');

  const engine = getStoryEngine();

  // 1. 获取初始节点
  const initialNode = engine.getCurrentNode();
  console.log('1. 初始节点:', initialNode?.id, '- type:', initialNode?.type);

  // 2. 获取可用选择
  const choices = engine.getAvailableChoices();
  console.log('2. 可用选择数量:', choices.length);
  choices.forEach((c, i) => {
    console.log(`   选择${i + 1}: ${c.text} -> ${c.nextNode}`);
  });

  // 3. 如果有选择，测试选择流程
  if (choices.length > 0) {
    const firstChoice = choices[0];
    console.log('\n3. 执行选择:', firstChoice.id);

    // 执行选择
    const result = engine.makeChoice(firstChoice.id);
    console.log('   makeChoice 返回:', result);

    // 检查当前节点
    const afterChoiceNode = engine.getCurrentNode();
    console.log('4. 选择后当前节点:', afterChoiceNode?.id, '- type:', afterChoiceNode?.type);
    console.log('   内容预览:', afterChoiceNode?.content?.substring(0, 50) + '...');

    // 5. 检查节点是否和选择的目标一致
    const expectedNextNode = firstChoice.nextNode;
    if (afterChoiceNode?.id === expectedNextNode) {
      console.log('✅ 节点跳转正确!');
    } else if (afterChoiceNode?.id === initialNode?.id) {
      console.log('❌ 节点没有跳转! 还在初始节点');
    } else {
      console.log(`⚠️  节点跳转异常: 期望 ${expectedNextNode}, 实际 ${afterChoiceNode?.id}`);
    }
  }

  // 6. 检查历史记录
  const history = engine.getHistory();
  console.log('\n5. 历史记录:');
  history.slice(-5).forEach((h, i) => {
    console.log(`   ${i + 1}. ${h.nodeId}${h.choiceId ? ' (选择: ' + h.choiceId + ')' : ''}`);
  });

  // 7. 检查是否有循环（同一个节点出现多次且没有选择）
  const nodeCounts = new Map<string, number>();
  history.forEach(h => {
    nodeCounts.set(h.nodeId, (nodeCounts.get(h.nodeId) || 0) + 1);
  });

  console.log('\n6. 节点出现频率:');
  nodeCounts.forEach((count, nodeId) => {
    if (count > 2) {
      console.log(`   ❌ ${nodeId}: 出现 ${count} 次 (可能循环!)`);
    } else {
      console.log(`   ✓ ${nodeId}: 出现 ${count} 次`);
    }
  });

  // 8. 测试 goToNext
  console.log('\n7. 测试 goToNext:');
  const currentBefore = engine.getCurrentNode()?.id;
  const goToNextResult = engine.goToNext();
  const currentAfter = engine.getCurrentNode()?.id;
  console.log(`   goToNext: ${currentBefore} -> ${currentAfter}, 结果: ${goToNextResult}`);
}

// 运行测试
try {
  runStoryTest();
} catch (error) {
  console.error('测试出错:', error);
}
