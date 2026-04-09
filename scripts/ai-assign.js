#!/usr/bin/env node
/**
 * AI任务分配助手
 * 根据任务类型自动分配到合适的Agent
 *
 * 使用: npm run ai:assign -- --task ai/tasks/TASK-XXX.json
 */

const fs = require('fs');
const path = require('path');

// 任务类型到Agent的映射
const TASK_TYPE_TO_AGENT = {
  'feature': ['designer', 'architect', 'developer', 'qa'],
  'bugfix': ['developer', 'qa'],
  'optimize': ['developer', 'qa'],
  'docs': ['architect'],
  'design': ['designer'],
  'ui': ['artist', 'developer'],
  'numeric': ['designer', 'developer'],
  'story': ['designer', 'developer'],
  'test': ['qa'],
  'deploy': ['devops'],
};

// 优先级颜色标识
const PRIORITY_COLORS = {
  P0: '🔴 紧急',
  P1: '🟠 高',
  P2: '🟡 中',
  P3: '🟢 低',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      result[args[i].slice(2)] = args[i + 1];
    }
  }
  return result;
}

function loadTask(taskPath) {
  const fullPath = path.resolve(taskPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ 任务文件不存在: ${fullPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function detectTaskType(task) {
  // 从taskId推断类型
  const taskId = task.metadata?.taskId || '';
  if (taskId.includes('bug') || taskId.includes('fix')) return 'bugfix';
  if (taskId.includes('ui') || taskId.includes('design')) return 'ui';
  if (taskId.includes('story') || taskId.includes('剧情')) return 'story';
  if (taskId.includes('numeric') || taskId.includes('数值')) return 'numeric';
  if (taskId.includes('test')) return 'test';
  if (taskId.includes('deploy')) return 'deploy';
  if (taskId.includes('doc')) return 'docs';

  // 从goal推断
  const goal = task.goal?.description || '';
  if (goal.includes('修复') || goal.includes('Bug')) return 'bugfix';
  if (goal.includes('优化') || goal.includes('性能')) return 'optimize';
  if (goal.includes('设计') || goal.includes('剧情')) return 'design';
  if (goal.includes('界面') || goal.includes('UI')) return 'ui';

  // 默认新功能
  return 'feature';
}

function assignAgents(task) {
  const taskType = detectTaskType(task);
  const agents = TASK_TYPE_TO_AGENT[taskType] || ['developer'];
  return { taskType, agents };
}

function generatePromptTemplate(agent, task) {
  const templatePath = path.resolve(`ai/agents/${agent}.md`);
  if (!fs.existsSync(templatePath)) {
    return `⚠️ 模板文件不存在: ${templatePath}`;
  }
  return templatePath;
}

function main() {
  const args = parseArgs();
  const taskPath = args.task;

  if (!taskPath) {
    console.log(`
使用方式:
  npm run ai:assign -- --task ai/tasks/TASK-XXX.json

功能:
  - 分析任务类型
  - 推荐合适的Agent
  - 输出Prompt模板路径

示例:
  npm run ai:assign -- --task ai/tasks/TASK-20260401-100.json
`);
    process.exit(0);
  }

  const task = loadTask(taskPath);
  const { taskType, agents } = assignAgents(task);
  const priority = task.metadata?.priority || 'P2';
  const priorityLabel = PRIORITY_COLORS[priority] || priority;

  console.log('\n========================================');
  console.log('📋 任务分配报告');
  console.log('========================================\n');

  console.log(`任务ID: ${task.metadata?.taskId || '未知'}`);
  console.log(`任务类型: ${taskType}`);
  console.log(`优先级: ${priorityLabel}`);
  console.log(`\n目标: ${task.goal?.title || '未知'}`);

  console.log('\n----------------------------------------');
  console.log('👥 推荐Agent链');
  console.log('----------------------------------------\n');

  agents.forEach((agent, index) => {
    const templatePath = generatePromptTemplate(agent, task);
    console.log(`${index + 1}. ${agent.toUpperCase()}`);
    console.log(`   模板: ${templatePath}`);
    if (index < agents.length - 1) {
      console.log('   ↓');
    }
  });

  console.log('\n----------------------------------------');
  console.log('📝 使用建议');
  console.log('----------------------------------------\n');

  console.log('1. 按Agent链顺序执行');
  console.log('2. 每个Agent完成后更新任务状态');
  console.log('3. 最终由Commander验收');
  console.log(`\n模板文件位置: ai/agents/`);

  console.log('\n========================================\n');
}

main();