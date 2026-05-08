# 整体规划：Audit the Bot

## 1. 总体判断

这个项目可以搭建，而且方向是成立的。两份文稿已经给出了清晰的教学目标、活动流程和评分框架。

但我不建议马上进入完整工程开发。更稳的路径是：先补齐一套完整 simulation content pack，再做可点击原型，然后再做可运行 MVP。

核心原因是：这个项目的难点不在技术，而在教学内容、评分一致性和 AI 输出可控性。

## 2. 推荐推进路径

### 阶段 0：补齐内容包

目标：把课堂活动需要的材料一次性定稿。

需要产出：

- 一页 business brief；
- 原始 flawed AI memo；
- hidden answer key；
- 标准问题分类；
- sample high-quality prompt；
- sample revised AI memo；
- sample final memo；
- rubric 评分锚点。

验收标准：

- 教师不看代码也能拿这套材料线下跑一次；
- flawed AI memo 至少包含 6-8 个可识别问题；
- answer key 能对应每个问题的位置、类型和解释；
- rubric 每个维度都有 0/1/2/3 或 0/1/2 的判断标准。

### 阶段 1：可点击原型

目标：验证学生流程是否顺。

功能：

- 学生加入页；
- business brief 页；
- baseline 输入页；
- AI memo 审计页；
- prompt 输入页；
- revised memo 比较页；
- final memo 编辑页；
- 提交完成页；
- 简化教师 dashboard。

验收标准：

- 一个用户可以从开始走到提交；
- 顺序符合 60 分钟设计；
- 不接数据库也可以演示；
- 不接真实 AI 也可以演示。

### 阶段 2：MVP

目标：能支持一次真实小班课堂。

功能：

- session 创建；
- session code 加入；
- 多学生提交；
- 数据持久化；
- 教师查看进度；
- 教师查看单个学生提交；
- rubric 评分；
- CSV/JSON 导出。

验收标准：

- 多个学生可以同时加入同一个 session；
- 刷新后数据不丢；
- 教师可以完整复盘一节课；
- 导出文件包含 baseline、audit marks、prompt、final memo、rubric score。

### 阶段 3：AI Revision

目标：把 AI 引入，但不让 AI 破坏教学可控性。

功能：

- mock AI adapter；
- live AI adapter；
- prompt 和 AI output 记录；
- original vs revised 对比；
- 教师可关闭 live AI。

验收标准：

- mock 模式稳定可复现；
- live 模式输出能保存；
- 学生能看出 AI 修改是否真的改善；
- 教师能选择是否使用真实 AI。

### 阶段 4：课堂展示和打磨

目标：让它像一个能交付的项目。

功能：

- 响应式界面；
- 软计时器；
- loading/error/empty 状态；
- demo 数据；
- 基础测试；
- demo script。

验收标准：

- 本地一条命令可启动；
- 完整流程可演示；
- Playwright 能跑通学生主流程；
- UI 没有明显错位或遮挡。

## 3. 建议任务拆分

### Task 1：项目脚手架

搭 Next.js TypeScript 项目，配置基本路由、lint、build。

验证：

- `npm run dev`
- `npm run build`

### Task 2：结构化模拟内容

把 business brief、flawed AI memo、known issues、rubric 放成结构化 seed data。

验证：

- 页面能从数据渲染内容，而不是硬编码在组件里。

### Task 3：学生六阶段流程

实现 baseline、audit、prompt、revision、final memo、reflection。

验证：

- baseline 前不能看到 AI memo。

### Task 4：AI memo 审计交互

实现文本标注、问题类型、accept/question/revise/reject、备注。

验证：

- 至少能提交三条 audit mark。

### Task 5：数据持久化

实现 session、participant、submission 存储。

验证：

- 两个浏览器用户能加入同一 session，并提交不同答案。

### Task 6：教师 dashboard

展示学生进度、提交详情、导出入口。

验证：

- 教师能看到每个学生处于哪一步。

### Task 7：Rubric 评分

实现 10 分制评分表和总分计算。

验证：

- 给一份 submission 打分后，导出里能看到四个维度和总分。

### Task 8：AI adapter

先接 mock，再预留 live provider。

验证：

- prompt 提交后能生成 revised memo；
- output 会被记录。

### Task 9：测试和 demo

补核心逻辑测试、端到端测试和 demo script。

验证：

- `npm test`
- `npm run build`
- 学生流程 e2e 通过。

## 4. 关键卡点

### 卡点 1：内容包不完整

文稿描述了 beverage launch case，但还没有真正可使用的完整 case、AI 错误稿和 answer key。

风险等级：高。

建议：先写内容包，再写工程。

### 卡点 2：真实 AI 输出不可控

如果每组学生都调用真实 AI，输出可能差异很大，课堂复盘和评分会变难。

风险等级：高。

建议：MVP 默认 mock AI；真实 AI 作为可选功能。

### 卡点 3：Rubric 还不够可执行

现在 rubric 有四个维度和分数，但缺少评分锚点。例如 Verify Accuracy 的 2 分和 3 分怎么区分，还需要样例。

风险等级：中高。

建议：为每个维度补评分 anchor 和样例答案。

### 卡点 4：双人协作设计还没定

文稿说学生先独立，后面两人一组。但产品里到底要不要支持 pair mode，还没确定。

风险等级：中。

建议：MVP 先不做数字化组队，线下配对即可。

### 卡点 5：时间控制可能影响体验

活动是 60 分钟，但严格倒计时可能让学生焦虑；没有时间控制又会影响课堂节奏。

风险等级：中。

建议：做 soft timer，由教师控制进入下一阶段。

### 卡点 6：自动评分容易跑偏

AI 自动评分可能会奖励语言流畅度，而不是批判性判断质量。

风险等级：中高。

建议：教师评分为主，AI 最多作为辅助总结。

### 卡点 7：隐私和学生数据

如果真实课堂使用，学生提交内容属于教育数据。

风险等级：中。

建议：MVP 使用匿名 ID，不收集不必要个人信息。

### 卡点 8：范围容易膨胀

这个项目很容易扩展成 LMS、AI literacy platform、课程管理系统。

风险等级：高。

建议：第一版只做一个模板、一个案例、一次课堂。

## 5. 是否建议推进

建议推进，但推进方式要轻。

我建议的判断是：

- 如果只是作业或展示：先做 clickable prototype + mock AI，足够有说服力。
- 如果要真实课堂使用：至少做到 MVP + 数据持久化 + 导出 + 教师评分。
- 如果要做成长期产品：等一次真实课堂验证后，再考虑多模板、账号系统和 live AI。

## 6. 推进前必须确认的决定

开始写代码前建议先定这七件事：

- 这是 assignment demo、portfolio demo，还是要真实课堂使用？
- UI 用英文、中文，还是双语？
- 第一版用 mock AI、live AI，还是两者都支持？
- 学生是否匿名？
- pair work 在线上体现，还是线下处理？
- 是否需要部署到公网？
- 第一套 business case 由谁最终确认？

## 7. 我的推荐下一步

下一步先不要直接开工程。我建议先做 `simulation-content-pack.md`，把 case、AI 错误稿、answer key、sample prompt、sample final memo、rubric anchors 全部写出来。

这个内容包一旦过关，工程实现会非常顺；如果内容包不稳，后面即使页面做出来，也很难证明这个项目真的训练了文稿里说的能力。

