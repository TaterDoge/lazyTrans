# Agent Guidelines

本文件只记录 AI coding agents 在本仓库工作的执行约定；项目背景、架构和目录说明请阅读 `README.md`。

## 工作原则

- 先看 `README.md`、`package.json`、相关源码和配置，再修改代码。
- 查看代码时优先使用 `codegraph` 进行检索
- 只改与任务直接相关的文件，避免顺手重构和大范围格式化。
- 不回退用户已有改动；发现意外变更时先暂停并询问。
- 不新增 npm/yarn/pnpm 锁文件；依赖安装与脚本执行优先使用 Bun。
- 修改窗口、权限、设置 schema、Provider 配置时，同步检查相关配置、迁移逻辑和文档。

## 常用命令

根目录入口：

```bash
bun install
bun run dev:desktop
bun run dev
bun run build
bun run build:desktop
bun run typecheck
bun run check
bun run lint
bun run fix
bun run check-fix
bun run test
bun run clean
```

桌面应用入口：

```bash
bun run --cwd apps/desktop tauri:dev
bun run --cwd apps/desktop tauri:build
bun run --cwd apps/desktop typecheck
bun run --cwd apps/desktop test
```

命令选择：

- 桌面联调优先用 `bun run dev:desktop`。
- 只需要前端 Vite dev server 时用 `bun run dev`。
- 提交前至少跑 `bun run check`；涉及格式、lint 或文档时优先跑 `bun run check-fix`。
- 当前测试文件很少或可能为空；如果改动覆盖到可测试逻辑，补充或运行针对性 `bun test <file>`。

## 代码约定

- TypeScript 保持 strict，不用 `any`、`@ts-ignore`、`@ts-expect-error` 绕过类型系统。
- 导入类型使用 `import type`，本地模块优先使用 `@/*` 别名。
- SolidJS 局部状态优先 `createSignal` / `createMemo`，结构化设置状态使用现有 store actions。
- 异步关键路径使用带上下文的 `try/catch` 或明确错误信息；不要写无说明的空 `catch`。
- UI 改动复用 `components/ui`、现有 Tailwind token 和当前视觉语言。
- 保持文件 ASCII，除非文件已有非 ASCII 内容或业务文案需要中文。

## 配置与权限

- Tauri 窗口变更要同时检查 `apps/desktop/src-tauri/tauri.conf.json`、`apps/desktop/src-tauri/capabilities/default.json` 和 `apps/desktop/src/config/window.config.ts`。
- 新增 Tauri API 能力时，必须补齐 capability 权限声明。
- 新增或调整服务 Provider 时，同步检查 `services/service-config`、对应 store 默认值/迁移和设置页行为。
- 设置持久化结构变化时，在对应 store 中处理旧配置兼容。
