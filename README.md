# LazyTrans

LazyTrans 是一个基于 Tauri v2 和 SolidJS 的桌面翻译应用。当前仓库的重点是桌面端：通过隐藏的后台窗口管理托盘、开机自启和全局快捷键，并提供一个轻量的悬浮翻译窗口与独立设置窗口。

> 当前项目仍处于开发阶段。翻译主链路可用；TTS、OCR 和截图翻译相关配置已经搭好，但完整执行链路尚未全部接入。

## 当前能力

- 悬浮翻译窗口：透明无边框窗口，支持拖动、置顶/取消置顶、隐藏、复制输入内容。
- 多服务翻译：一次输入可按启用顺序调用多个翻译 Provider，并在折叠面板中展示结果。
- 翻译 Provider：内置 OpenAI 兼容接口、Ollama、Google、Bing，并支持新增自定义 OpenAI 兼容服务。
- 设置窗口：包含通用、翻译、服务、快捷键、关于等页面。
- 服务配置：翻译、TTS、OCR 共用一套 Provider 配置 UI，可配置 API Key、Endpoint、模型、提示词和高级参数。
- 系统集成：隐藏后台 daemon 窗口负责托盘菜单、开机自启和全局快捷键注册。
- 持久化：用户设置写入 Tauri Store 的 `settings.json`，前端通过 Solid Store 响应式读取。

## 还未完成

- 截图翻译窗口没有在当前 Tauri 配置中注册，截图/OCR 执行流程尚未实现。
- TTS Provider 目前主要是类型、配置和服务入口，朗读按钮尚未接入真实播放流程。
- 仓库当前没有已提交的 `.test.ts` / `.spec.ts` 测试文件，`bun test` 脚本已预留。

## 技术栈

| 分类 | 使用内容 |
| --- | --- |
| 桌面框架 | Tauri v2、Rust |
| 前端框架 | SolidJS、TanStack Solid Router、Vite |
| 语言 | TypeScript strict、Rust 2021 |
| 样式 | Tailwind CSS v4、Iconify Tailwind、tw-animate-css、Inter Variable |
| UI 基础 | Kobalte、Corvu、项目内 `components/ui` 组件 |
| 状态与持久化 | Solid Store、`@tauri-apps/plugin-store` |
| 系统能力 | Tauri tray、global-shortcut、autostart、clipboard、http、opener、os、process |
| 工程化 | Bun workspace、Turbo、Ultracite / Biome |

## 项目结构

```text
lazyTrans/
├── apps/
│   └── desktop/
│       ├── index.html                 # 主前端入口：翻译窗口与设置路由
│       ├── daemon.html                # 后台 daemon 入口
│       ├── src/
│       │   ├── daemon.tsx             # 托盘、开机自启、全局快捷键
│       │   ├── index.tsx              # Solid Router 与设置初始化
│       │   ├── routes/                # TanStack Router 文件路由
│       │   ├── features/
│       │   │   ├── translator/        # 悬浮翻译窗口
│       │   │   └── settings/          # 设置窗口页面与布局
│       │   ├── services/
│       │   │   ├── translate-core/    # 内嵌翻译/TTS 核心与 Provider Registry
│       │   │   ├── translate/         # 应用层翻译服务入口
│       │   │   ├── tts/               # 应用层 TTS 服务入口
│       │   │   └── service-config/    # Provider 元信息与默认配置
│       │   ├── stores/settings/       # 设置模块、迁移与持久化
│       │   ├── config/                # 窗口、快捷键等配置
│       │   ├── hooks/                 # Tauri 与 UI 相关 hooks
│       │   ├── i18n/                  # 中英文文案
│       │   ├── components/ui/         # 通用 UI 组件
│       │   └── lib/utils/             # 工具函数
│       └── src-tauri/
│           ├── tauri.conf.json        # Tauri 窗口、构建、打包配置
│           ├── capabilities/          # Tauri v2 权限声明
│           └── src/                   # Rust 入口与插件注册
├── packages/
│   └── typescript-config/             # 共享 tsconfig
├── package.json                       # Bun workspace 与根脚本
├── turbo.json                         # Turbo 任务图
├── biome.jsonc                        # Ultracite / Biome 规则
├── tsconfig.base.json                 # 根 TypeScript 配置
└── bun.lock                           # Bun 锁文件
```

`apps/desktop/src/services/translate-core` 是桌面应用内部源码目录，不是独立 workspace package。当前唯一的 `packages/*` 包是共享 TypeScript 配置。

## 运行方式

### 环境要求

- Bun：仓库声明 `packageManager` 为 `bun@1.3.13`
- Rust：稳定版工具链
- Tauri 平台依赖：按目标系统安装 Tauri v2 所需依赖

### 安装依赖

```bash
bun install
```

### 启动桌面应用

```bash
bun run dev:desktop
```

这个命令会在 `apps/desktop` 中执行 `tauri dev`。Tauri 会按 `tauri.conf.json` 启动 Vite 开发服务器，并拉起桌面应用。

### 仅启动前端开发任务

```bash
bun run dev
```

根目录的 `dev` 是 Turbo 任务，会运行 workspace 的 `dev` 脚本；对当前桌面应用来说它只启动 Vite，不会打开 Tauri 桌面壳。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun run dev:desktop` | 启动 Tauri 桌面开发环境 |
| `bun run dev` | 运行 Turbo dev 任务；当前主要是 Vite 前端 dev |
| `bun run build` | 运行所有 workspace 的 build 任务 |
| `bun run build:desktop` | 只运行桌面 workspace 的 Vite build |
| `bun run --cwd apps/desktop tauri:build` | 构建 Tauri 桌面安装包/应用包 |
| `bun run typecheck` / `bun run check` | TypeScript 类型检查 |
| `bun run lint` | Ultracite / Biome 检查 |
| `bun run fix` | Ultracite / Biome 自动修复 |
| `bun run check-fix` | 先类型检查，再自动修复格式和 lint 问题 |
| `bun run test` | 运行 workspace 测试任务 |
| `bun run clean` | 运行 Turbo clean 任务 |

桌面应用内也可以直接执行：

```bash
bun run --cwd apps/desktop typecheck
bun run --cwd apps/desktop test
bun run --cwd apps/desktop tauri:dev
bun run --cwd apps/desktop tauri:build
```

## 架构概览

### 入口与窗口

当前 Tauri 配置静态声明 3 个窗口：

| 窗口 | URL | 作用 |
| --- | --- | --- |
| `daemon` | `daemon.html` | 隐藏后台窗口，初始化设置、托盘、开机自启、全局快捷键 |
| `translator` | `index.html/#/` | 悬浮翻译窗口 |
| `settings` | `index.html/#/settings` | 设置窗口 |

前端的 `src/config/window.config.ts` 维护同名窗口配置，供 hooks 和窗口工具函数读取。新增窗口时需要同时更新：

- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/capabilities/default.json`
- `apps/desktop/src/config/window.config.ts`
- 对应路由、入口或功能模块

当前 `src/lib/utils/window.ts` 主要负责 `show`、`hide`、`focus`、`alwaysOnTop` 等操作，不负责动态创建新窗口。

### 前端路由

`index.html` 加载 `src/index.tsx`，使用 TanStack Solid Router 的 hash history：

- `/`：翻译窗口页面 `features/translator`
- `/settings`：设置窗口布局 `features/settings/layout`
- `/settings/translate`：翻译语言设置
- `/settings/service`：翻译、TTS、OCR Provider 配置
- `/settings/shortcuts`：全局与应用内快捷键
- `/settings/about`：关于页

### Daemon 流程

`daemon.html` 加载 `src/daemon.tsx`。它不渲染 UI，只在 `onMount` 后初始化设置，并挂载三个系统能力：

- `useTray()`：创建托盘菜单，提供翻译、设置、重启、退出入口。
- `useAutoStart()`：同步开机自启设置。
- `useAppShortcuts()`：注册全局快捷键，默认打开翻译窗口。

### 翻译流程

```text
Translator UI
  -> useMultiTranslate(text)
  -> stores/settings/services/translate.store.ts
  -> services/translate/index.ts
  -> services/translate-core/core/service-runner.ts
  -> services/translate-core/translate/providers/*
  -> @tauri-apps/plugin-http 或 OpenAI 兼容接口
```

关键点：

- 翻译窗口中按 Enter 触发翻译，Shift + Enter 保留换行。
- `useMultiTranslate` 会读取已启用 Provider，并按 `providerOrder` 排序。
- 折叠的 Provider 会延迟执行，展开时再触发对应翻译请求。
- 自定义 OpenAI 兼容服务在应用层以 `custom:*` 表示，运行时会映射到核心 `openai` Provider。
- Google 和 Bing Provider 使用 Tauri HTTP 插件请求外部接口；OpenAI/Ollama 使用 OpenAI 兼容协议。

### 设置与持久化

设置模块位于 `apps/desktop/src/stores/settings`：

- `general.store.ts`：开机自启、语言、主题。
- `shortcuts.store.ts`：快捷键映射与旧配置迁移。
- `services/translate.store.ts`：翻译 Provider、启用状态、顺序、语言配置。
- `services/tts.store.ts`：TTS Provider 配置。
- `services/ocr.store.ts`：OCR Provider 配置。

所有模块通过 `createSettingsModule` 接入 `@tauri-apps/plugin-store`，并保存在 `settings.json` 中。

### 服务与 Provider

核心服务在 `apps/desktop/src/services/translate-core`：

- `core/registry.ts`：按服务类型注册 Provider。
- `core/service-runner.ts`：校验配置并执行 Provider。
- `translate/providers/*`：内置翻译 Provider 实现。
- `tts/*`：TTS 类型与服务入口。

应用层 Provider 元信息在 `apps/desktop/src/services/service-config`，用于设置页展示和默认配置生成。

## 开发约定

- 使用 Bun；以 `bun.lock` 为准，不要新增 npm/yarn/pnpm 锁文件。
- TypeScript 使用 strict 配置，避免用 `any` 或注释绕过类型系统。
- 前端路径别名为 `@/*`，指向 `apps/desktop/src/*`。
- SolidJS 状态优先使用 `createSignal`、`createMemo`、`createStore` 和 store actions。
- 修改窗口、权限、Provider、设置结构时，同步更新相关配置和迁移逻辑。
- 提交前建议至少运行 `bun run check`；涉及格式或 lint 时运行 `bun run check-fix`。

## 提交检查

仓库包含 Husky pre-commit hook。提交时会筛选已暂存的代码和文档文件，并执行：

```bash
bun check-fix <staged-files>
```

如果同一个已暂存文件还有未暂存修改，hook 会中止提交，避免自动修复导致索引和工作区不一致。

## 许可证

`apps/desktop/package.json` 标注为 MIT。当前仓库根目录没有独立 `LICENSE` 文件，如需正式发布建议补充。
