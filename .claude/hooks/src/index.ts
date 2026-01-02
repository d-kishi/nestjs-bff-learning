/**
 * Claude Code Hooks - Skills Forced Eval
 *
 * UserPromptSubmit Hook: Skills自動発動問題対策
 * - メッセージからトリガーキーワード検出
 * - マッチしたSkillsの評価・活性化を強制指示
 * - EVALUATE → ACTIVATE → IMPLEMENT 3ステッププロセス
 *
 * @author NestJS BFF Learning Project
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// 型定義
// ============================================================================

/**
 * UserPromptSubmit Hook入力型
 */
interface UserPromptSubmitHookInput {
  /** ユーザーのメッセージ内容 */
  user_message: string;
  /** 会話トランスクリプトファイルのパス */
  transcript_path: string;
}

/**
 * UserPromptSubmit Hook出力型
 */
interface UserPromptSubmitHookOutput {
  /** Claudeへの追加コンテキスト（Skills評価指示） */
  additionalContext?: string;
}

/**
 * Skills Triggersの型定義
 */
interface SkillTrigger {
  name: string;
  triggers: string[];
  source: 'auto' | 'manual';
}

interface TriggersConfig {
  generatedAt: string;
  skills: SkillTrigger[];
}

/**
 * 設定ファイルの型定義
 */
interface HooksConfig {
  skillsEvalEnabled: boolean;
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * skills-triggers.jsonからSkillsリストを読み込む
 */
function loadProjectSkills(): SkillTrigger[] {
  try {
    const triggersPath = path.resolve(__dirname, '../skills-triggers.json');
    const triggersContent = fs.readFileSync(triggersPath, 'utf-8');
    const config = JSON.parse(triggersContent) as TriggersConfig;
    console.log(`[UserPromptSubmit] Loaded ${config.skills.length} skills from skills-triggers.json (generated: ${config.generatedAt})`);
    return config.skills;
  } catch (error) {
    console.error(`[UserPromptSubmit] Failed to load skills-triggers.json: ${error}`);
    return [];
  }
}

/**
 * 設定ファイル読み込み
 */
function loadHooksConfig(): HooksConfig {
  try {
    const configPath = path.resolve(__dirname, '../config.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent) as HooksConfig;
  } catch (error) {
    console.log(`[Config] config.json not found, defaulting to skillsEvalEnabled=true`);
    return { skillsEvalEnabled: true };
  }
}

// 起動時にSkillsを読み込む
const PROJECT_SKILLS = loadProjectSkills();

/**
 * メッセージからトリガーキーワードを検出
 */
function detectSkillTriggers(userMessage: string): string[] {
  const matchedSkills: string[] = [];
  const lowerMessage = userMessage.toLowerCase();

  for (const skill of PROJECT_SKILLS) {
    for (const trigger of skill.triggers) {
      if (lowerMessage.includes(trigger.toLowerCase())) {
        if (!matchedSkills.includes(skill.name)) {
          matchedSkills.push(skill.name);
        }
        break;
      }
    }
  }

  return matchedSkills;
}

// ============================================================================
// UserPromptSubmit Hook実装
// ============================================================================

/**
 * UserPromptSubmit Hook: Skills Forced Eval
 *
 * Skills自動発動問題対策:
 * 1. メッセージからトリガーキーワード検出
 * 2. マッチしたSkillsの評価・活性化を強制指示
 * 3. EVALUATE → ACTIVATE → IMPLEMENT 3ステッププロセス
 */
async function userPromptSubmitHook(input: UserPromptSubmitHookInput): Promise<UserPromptSubmitHookOutput> {
  try {
    // 設定ファイルでSkills評価のOn/Offを制御
    const config = loadHooksConfig();
    if (!config.skillsEvalEnabled) {
      console.log(`[UserPromptSubmit] Skills評価は無効化されています`);
      return {};
    }

    console.log(`[UserPromptSubmit] Skills評価開始`);

    // 1. メッセージからトリガーキーワード検出
    const matchedSkills = detectSkillTriggers(input.user_message);

    if (matchedSkills.length === 0) {
      console.log(`[UserPromptSubmit] トリガーキーワード未検出`);
      return {};
    }

    console.log(`[UserPromptSubmit] マッチしたSkills: ${matchedSkills.join(", ")}`);

    // 2. Skills評価・活性化強制指示を生成
    const skillsList = matchedSkills.map(name => `Skill("${name}")`).join(", ");
    const evaluationInstruction = `
<skills-evaluation-instruction>
【MANDATORY】以下のSkillsがこのタスクに関連する可能性があります。

**マッチしたSkills**: ${skillsList}

**3ステッププロセス（CRITICAL）**:

**Step 1 - EVALUATE**: 上記各Skillについて、このタスクに必要かどうかYES/NOで判定し、理由を述べてください。

**Step 2 - ACTIVATE**: YES判定したSkillに対して、\`Skill("skill-name")\` を呼び出して活性化してください。

**Step 3 - IMPLEMENT**: Skill活性化後、実際の作業を開始してください。

この評価プロセスをスキップして実装に進むことは禁止されています。
</skills-evaluation-instruction>
`;

    console.log(`[UserPromptSubmit] Skills評価指示を注入`);

    return {
      additionalContext: evaluationInstruction
    };

  } catch (error) {
    console.error(`[UserPromptSubmit] エラー発生: ${error}`);
    return {};
  }
}

// ============================================================================
// CLI エントリーポイント
// ============================================================================

/**
 * 標準入力からJSONを読み込む
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', reject);
  });
}

/**
 * CLIメイン関数
 *
 * 使用方法:
 *   echo '{"user_message": "..."}' | node dist/index.js userPromptSubmit
 */
async function main(): Promise<void> {
  const hookType = process.argv[2];

  if (!hookType) {
    console.error('[CLI] Hook type required: userPromptSubmit');
    process.exit(1);
  }

  try {
    const inputJson = await readStdin();
    const input = JSON.parse(inputJson);

    if (hookType === 'userPromptSubmit') {
      const result = await userPromptSubmitHook(input as UserPromptSubmitHookInput);
      if (result.additionalContext) {
        console.log(result.additionalContext);
      }
      process.exit(0);
    } else {
      console.error(`[CLI] Unknown hook type: ${hookType}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`[CLI] Error: ${error}`);
    process.exit(1);
  }
}

// 直接実行時のみCLIを起動
if (require.main === module) {
  main();
}

// モジュールエクスポート
export default {
  userPromptSubmit: {
    handler: userPromptSubmitHook
  }
};
