import type { AngleDefinition, ProductProfile } from "./types";

// ============================================================
// 系统角色定义
// ============================================================

export const NOVA_SYSTEM_PROMPT = `你是 SuperNovba 的 AI 创意营销策略师，代号 "Nova"。

你的风格特征：
- 大胆且富有创造力，不受传统营销框架束缚
- 文案像朋友聊天一样自然，不说套话
- 视觉思维优先：先用画面打动，再用文字说服
- 懂得网络热梗和当下年轻人的沟通方式
- 能在不同风格间灵活切换：可以深情、可以毒舌、可以理性、可以疯癫

输出规则：
- 标题不超过 80 个字符
- 正文不超过 200 个字符
- 始终返回合法的 JSON 格式
- 用中文生成，适当夹杂网络热词

你的使命不是做专业营销提案，而是帮助用户打开想象力——
让他们看到一款普通产品背后被忽视的可能性。`;

// ============================================================
// 阶段1：产品分析提示词
// ============================================================

export function buildProductAnalysisPrompt(input: {
  description: string;
  imageAnalysis?: string; // 如果有图片，这里是图片分析结果
}): string {
  const baseInfo = input.description;
  const visualInfo = input.imageAnalysis
    ? `\n\n[视觉信息]\n${input.imageAnalysis}`
    : "";

  return `分析以下产品信息，提取关键的营销要素：

[产品信息]
${baseInfo}${visualInfo}

请返回以下 JSON 格式的分析结果：
{
  "name": "产品名称（简短好记）",
  "features": ["特征1", "特征2", "特征3", "特征4", "特征5"],
  "targetAudience": "核心目标人群描述（年龄、兴趣、场景）",
  "uniqueSellingPoint": "最独特的卖点（一句话）",
  "category": "产品类别"
}

要求：
- features 需要有创意地提炼，不要只列参数
- targetAudience 要具体到使用场景和心理动机
- uniqueSellingPoint 要找到一个让人"哇"的角度`;
}

// ============================================================
// 阶段2：多角度创意生成提示词（核心差异化）
// ============================================================

export function buildAngleGenerationPrompt(
  product: ProductProfile,
  angle: AngleDefinition
): string {
  const angleGuides: Record<string, string> = {
    emotional: `【你的创意任务：情感叙事角度】
${angle.description}

具体思路：
- 找一个普通人使用该产品时的真实情感瞬间
- 可以是一个温暖的故事开头、一个让父母破防的画面、或一个独处时的自我对话
- 文案要有情绪钩子，让人看了想转发给"那个人"
- 避免鸡汤，要真实细腻

输出格式：
{
  "headline": "标题（有情感钩子）",
  "body": "文案正文（像朋友讲故事）",
  "visualConcept": "视觉概念描述（给图片AI的提示——构图、色调、关键元素、氛围）"
}`,

    data: `【你的创意任务：数据说话角度】
${angle.description}

具体思路：
- 把产品优势转化成可视化数字或对比
- 可以用"算一笔账"的方式：用了这个 vs 没用的差别
- 数据不一定要很严谨，但要有冲击力、让人想验证
- "每天多花X元，生活质量提升Y%"这种逻辑

输出格式：
{
  "headline": "标题（数字驱动）",
  "body": "文案正文（理性说服）",
  "visualConcept": "视觉概念描述（图表感、对比感、数据可视化风格）"
}`,

    humor: `【你的创意任务：幽默反差角度】
${angle.description}

具体思路：
- 制造意想不到的反差：产品 vs 传统方案的搞笑对比
- 可以用"你vs别人"的对比体
- 自嘲式营销：先承认产品的"缺点"，然后反转
- 梗要新、要有网感，不要网上用烂的段子

输出格式：
{
  "headline": "标题（幽默钩子）",
  "body": "文案正文（让人会心一笑）",
  "visualConcept": "视觉概念描述（幽默场景、反差画面、表情包风格）"
}`,

    social_proof: `【你的创意任务：社交认同角度】
${angle.description}

具体思路：
- 营造"圈内人都知道"的氛围
- 可以模仿热门评论/种草笔记的语气
- "第一批用的人都……了" 这种制造紧迫感
- 用小众优越感驱动：不是谁都能用好这个产品的

输出格式：
{
  "headline": "标题（社交驱动）",
  "body": "文案正文（种草体/测评体）",
  "visualConcept": "视觉概念描述（社交场景、使用场景、UGC感）"
}`,

    aspirational: `【你的创意任务：向往生活角度】
${angle.description}

具体思路：
- 不直接说产品，而是描绘使用产品后的理想生活
- 可以是北欧风、日系治愈风、赛博都市风……根据产品调性选择
- 让人产生"我想要过这样的生活"的向往
- 文案要有画面感，像电影预告片的旁白

输出格式：
{
  "headline": "标题（向往感）",
  "body": "文案正文（生活图景）",
  "visualConcept": "视觉概念描述（氛围感画面、生活场景、电影感构图）"
}`,
  };

  const guide =
    angleGuides[angle.type] || `按 ${angle.label} 的角度生成创意营销文案。`;

  return `${NOVA_SYSTEM_PROMPT}

现在我们针对以下产品，用【${angle.label}】的角度生成一个创意营销方向：

产品名称：${product.name}
产品特点：${product.features.join(" / ")}
目标人群：${product.targetAudience}
核心卖点：${product.uniqueSellingPoint}
产品类别：${product.category}

${guide}

记住：你要让用户看到后觉得 "原来这个产品还可以这样卖！"
请严格按 JSON 格式返回。`;
}

// ============================================================
// 阶段3：图片提示词生成
// ============================================================

export function buildImagePromptEnhancement(
  visualConcept: string,
  productName: string,
  angleLabel: string
): string {
  return `将以下营销视觉概念，优化为 Seedream 5.0 图片生成模型的提示词：

原始视觉概念：${visualConcept}
产品名称：${productName}
营销角度：${angleLabel}

要求：
- 使用英文（Seedream 对英文提示词效果更好）
- 长度控制在 50-100 词
- 明确构图、光线、色调、风格
- 包含画质关键词（cinematic lighting, 8k, professional photography）
- 品牌感要强，符合主流审美
- 不要包含任何文字/logo（Seedream 文字渲染效果差）

直接返回优化后的英文提示词，不要任何额外说明。`;
}
