# PRD：Audit the Bot

## 1. 项目一句话

Audit the Bot 是一个基于两份 MSBA 7041 文稿设计的课堂模拟 Web 应用，用来训练学生的核心人机协作能力：批判性评估 AI 输出，并主动引导 AI 改进。

它不是一个普通的 AI 写作工具，而是一个教学模拟系统。学生需要先独立判断，再审计 AI 草稿，再写提示词引导 AI 修改，最后由人类完成最终编辑和解释。

## 2. 文稿依据

依据文件：

- MSBA 7041 Assignment 1 draft
- MSBA 7041 Assignment 2 draft

Assignment 1 定义了要训练的能力：评估 AI 输出的准确性、实用性、局限和影响，并通过修改、调整或拒绝来提升最终结果。

Assignment 2 定义了模拟活动：Audit the Bot。它包含学习目标、60 分钟课堂流程、Human-only baseline、AI-only audit、Coached AI revision、Human-AI final editing、debrief，以及 10 分制 rubric。

## 3. 核心用户

### 教师

创建课堂 session，发放参与链接，监控学生进度，查看学生审计结果和最终 memo，并在 debrief 环节使用班级数据。

### 学生

完成一轮完整模拟：独立写建议、审计 AI 建议、写改进 prompt、比较 AI 修改版、最终编辑并说明取舍理由。

### 助教

辅助评分、导出结果、整理课堂反馈。

## 4. 产品目标

- 把文稿里的纸面模拟活动变成可重复运行的数字课堂活动。
- 保留原始教学逻辑：先人类独立判断，再审计 AI，再引导 AI，再由人类最终把关。
- 让学生的判断过程可见，而不仅仅收集最终答案。
- 支持 Assignment 里给出的 10 分制评分标准。
- 给教师一个简单 dashboard，看进度、常见错误、分数变化和最终提交。

## 5. MVP 范围

第一版应该非常克制，只做一个完整活动，而不是平台化产品。

MVP 包含：

- 一个固定的 Audit the Bot 模拟模板；
- 一个固定商业案例；
- 一个预写好的有缺陷 AI memo；
- 一个教师用 answer key；
- 一个学生完整流程；
- 一个教师 dashboard；
- CSV 或 JSON 导出；
- 可选的 AI 修改功能，默认可以先用 mock 版本。

MVP 不做：

- 多课程平台；
- LMS 集成；
- 复杂账号系统；
- 多模板市场；
- 完全自动评分；
- 开放式 ChatGPT 聊天界面。

## 6. 学生端流程

1. 输入名字或匿名 ID 加入 session。
2. 阅读 business brief。
3. 在没看到 AI memo 前，先写 human-only baseline recommendation。
4. 查看有缺陷的 AI memo。
5. 标注 AI memo 里的问题，并选择 accept、question、revise、reject。
6. 给每个问题打标签，例如 factual error、unsupported claim、budget mismatch、vague recommendation。
7. 写 1-2 条有针对性的修改 prompt。
8. 查看 AI revised memo。
9. 比较原始 AI memo 和 revised memo。
10. 人类最终编辑 final memo。
11. 说明哪些 AI 内容被接受、修改或拒绝。
12. 提交。

## 7. 教师端流程

1. 创建或启动一个 Audit the Bot session。
2. 配置案例、AI memo、answer key、rubric 和时间。
3. 分享 session code 或链接。
4. 监控学生当前阶段。
5. 查看学生审计标注、prompt、最终 memo 和解释。
6. 按 rubric 评分。
7. 查看班级层面的常见问题和 debrief 数据。
8. 导出结果。

## 8. 核心功能需求

### R1：固定活动模板

系统内置六阶段活动：

- Introduction and briefing；
- Human-only baseline；
- AI-only audit；
- Coached AI revision；
- Human-AI final editing；
- Debrief and reflection。

### R2：商业案例展示

案例至少要包含：

- 目标用户；
- 预算限制；
- 竞品定位；
- 调研结果；
- 渠道限制；
- 品牌考虑；
- 最终决策目标。

### R3：独立判断锁定

学生必须先提交 baseline，才能看到 AI memo。这个约束很重要，因为它防止学生直接被 AI 输出锚定。

### R4：AI Memo 审计

学生可以对 AI memo 进行 statement-level 标注。每条标注应包含：

- 标注范围；
- accept/question/revise/reject；
- 问题类型；
- 简短解释。

建议问题类型：

- factual error；
- unsupported claim；
- budget mismatch；
- target market mismatch；
- vague recommendation；
- ethical or tone risk；
- missing evidence；
- logical weakness。

### R5：Prompt 改写

学生根据前面的审计结果写 prompt。界面需要引导学生写清楚：

- 要修复什么问题；
- 要遵守什么案例约束；
- 输出格式是什么；
- 哪些信息可以使用。

### R6：AI 修改输出

第一版可以有两种实现方式：

- mock 模式：根据固定 prompt 或阶段返回预写 revised memo；
- live 模式：调用真实 LLM API 生成 revised memo。

建议 MVP 默认 mock，live 作为可选项。

### R7：最终人工编辑

最终提交必须包含：

- final recommendation memo；
- 接受了哪些 AI 内容；
- 修改了哪些 AI 内容；
- 拒绝了哪些 AI 内容；
- 为什么这么处理。

### R8：Rubric 评分

沿用文稿里的 10 分制：

| 维度 | 分数 |
| --- | ---: |
| Verify Accuracy | 0-3 |
| Modification Quality | 0-3 |
| Guidance Effectiveness | 0-2 |
| Quality of Argumentation | 0-2 |

MVP 建议由教师手动或半自动评分，不建议第一版就做完全 AI 自动评分。

### R9：Dashboard

教师 dashboard 应展示：

- 学生当前阶段；
- 已识别问题数量；
- 常见问题类型；
- answer key 命中情况；
- 原始 AI memo 与 final memo 的质量差异；
- prompt 质量分布；
- 导出入口。

## 9. 推荐技术方案

如果要真正搭建，推荐：

- Next.js + TypeScript；
- React + Tailwind CSS；
- SQLite + Prisma 作为 MVP 数据层；
- session code 加匿名/昵称加入，不先做完整账号系统；
- AI provider 通过 adapter 封装；
- Vitest 做核心逻辑测试；
- Playwright 做端到端流程测试。

关键架构原则：教学流程和 AI provider 必须解耦。即使不接真实 AI，活动也应该能完整运行。

## 10. 成功标准

MVP 算成功，需要满足：

- 教师 3 分钟内能创建 session；
- 学生不需要额外说明就能走完整流程；
- 学生不能跳过 baseline 直接看 AI memo；
- 审计阶段能记录问题类型和理由；
- final memo 必须包含 accept/revise/reject 解释；
- 教师能看到全班进度；
- 教师能导出提交；
- 一次完整课堂模拟可以被复盘。

## 11. 当前最关键缺口

这两份文稿已经足够定义产品方向，但还不够直接开工做完整 MVP。最大缺口是内容包还没完全定稿：

- business brief 只是被描述了，还没有完整文本；
- flawed AI memo 还没有最终稿；
- answer key 还没有逐条定义；
- 高质量 prompt 示例还没有；
- revised AI memo 示例还没有；
- rubric 每个分数档的评分锚点还没有。

这些内容不补齐，代码可以写，但教学效果和评分会悬空。
