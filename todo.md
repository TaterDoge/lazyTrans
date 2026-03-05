# LazyTrans Monorepo 架构演进计划

> **目标**：将 LazyTrans 重构为基于 Bun + Turborepo 的 monorepo 架构，提取翻译核心为独立 workspace 包（暂不进行发布流程）

---

## 📊 项目概览

### 当前架构（单体应用）

```
lazyTrans/
├── src/                    # 前端代码
│   ├── services/translate/ # 翻译服务（内嵌）
│   └── ...
├── src-tauri/              # Rust 后端
└── package.json
```

### 目标架构（Monorepo）

```
lazyTrans-monorepo/
├── apps/
│   └── desktop/              # Tauri 应用
│       ├── src/
│       ├── src-tauri/
│       └── package.json
│
├── packages/
│   └── translate-core/       # 翻译核心包（内部 workspace 包）
│       ├── src/
│       │   ├── core/         # 服务注册系统
│       │   ├── translate/    # 翻译实现
│       │   └── index.ts
│       └── package.json
│
├── package.json              # 根 workspace
├── turbo.json               # Turborepo 配置
├── tsconfig.base.json       # 共享 TS 配置
└── bunfig.toml             # Bun 配置
```

### 技术栈

- **包管理器**：Bun (v1.2.0+)
- **任务编排**：Turborepo (v2.5.0+)
- **构建工具**：tsup (translate-core) / Vite (desktop)
- **类型系统**：TypeScript 5.9+

---

## ✅ Phase 0: POC 验证（已完成）

**目标**：验证 Bun + Turborepo 配置可行性

### 任务清单

- [x] 创建 git 分支 `feat/monorepo-poc`
- [x] 创建目录结构 `apps/` `packages/`
- [x] 备份根 `package.json`
- [x] 创建根配置文件
  - [x] `package.json` (workspace 配置)
  - [x] `turbo.json` (任务编排)
  - [x] `tsconfig.base.json` (共享 TS 配置)
  - [x] `bunfig.toml` (Bun 配置)
- [x] 更新 `.gitignore` (添加 `.turbo`)
- [x] 安装根依赖 `bun install`
- [x] 验证 Turborepo 版本
- [x] 验证 workspace 识别

### 验证结果

```bash
✅ Turborepo: v2.8.13
✅ Bun workspace: 已识别
✅ 根配置: 完成
```

---

## ✅ Phase 1: 迁移 Desktop 应用（已完成）

**目标**：将现有应用迁移到 `apps/desktop/`

### 1.1 文件迁移

```bash
# 创建 desktop 目录
mkdir -p apps/desktop

# 迁移核心文件
git mv src apps/desktop/src
git mv src-tauri apps/desktop/src-tauri
git mv public apps/desktop/public
git mv index.html apps/desktop/index.html
git mv daemon.html apps/desktop/daemon.html
git mv vite.config.ts apps/desktop/vite.config.ts
git mv window.config.ts apps/desktop/window.config.ts

# 迁移配置文件
git mv components.json apps/desktop/components.json
git mv tsr.config.json apps/desktop/tsr.config.json
git mv biome.jsonc apps/desktop/biome.jsonc
```

### 1.2 创建 Desktop package.json

**文件**：`apps/desktop/package.json`

```json
{
  "name": "@lazytrans/desktop",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "vite",
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "typecheck": "bunx tsc --noEmit",
    "check": "bun run typecheck",
    "lint": "bunx ultracite check .",
    "fix": "bunx ultracite fix",
    "check-fix": "bun run check && bun run fix",
    "test": "bun test",
    "prepare": "husky"
  },
  "license": "MIT",
  "dependencies": {
    "@lazytrans/translate-core": "workspace:*",
    "@fontsource-variable/inter": "^5.2.8",
    "@kobalte/core": "^0.13.11",
    "@solid-primitives/i18n": "^2.2.1",
    "@solidjs/router": "^0.15.4",
    "@tanstack/history": "^1.154.14",
    "@tanstack/router-plugin": "^1.158.1",
    "@tanstack/solid-router": "^1.158.1",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-autostart": "~2",
    "@tauri-apps/plugin-clipboard-manager": "~2",
    "@tauri-apps/plugin-global-shortcut": "~2",
    "@tauri-apps/plugin-opener": "^2",
    "@tauri-apps/plugin-os": "~2",
    "@tauri-apps/plugin-process": "^2.3.1",
    "@tauri-apps/plugin-store": "~2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "hotkeys-js": "^4.0.0",
    "lucide-react": "^0.564.0",
    "lucide-solid": "^0.575.0",
    "radix-ui": "^1.4.3",
    "solid-js": "^1.9.3",
    "tailwind-merge": "^3.4.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.3.13",
    "@iconify-json/line-md": "^1.2.14",
    "@iconify-json/simple-icons": "^1.2.72",
    "@iconify-json/stash": "^1.2.4",
    "@iconify-json/tabler": "^1.2.26",
    "@iconify/tailwind4": "^1.2.1",
    "@jonasgeiler/tsc-files": "^2.3.1",
    "@tailwindcss/vite": "^4.1.18",
    "@tauri-apps/cli": "^2",
    "@types/node": "^22.0.0",
    "husky": "^9.1.7",
    "shadcn": "^3.8.4",
    "tailwindcss": "^4.1.18",
    "tw-animate-css": "^1.4.0",
    "typescript": "~5.9.3",
    "ultracite": "^7.1.3",
    "vite": "^7.3.1",
    "vite-plugin-solid": "^2.11.0"
  }
}
```

### 1.3 更新 Desktop tsconfig.json

**文件**：`apps/desktop/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "src/routeTree.gen.ts",
    "window.config.ts"
  ]
}
```

### 1.4 更新 Tauri 配置

**文件**：`apps/desktop/src-tauri/tauri.conf.json`

```json
{
  "build": {
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  // ... 其他配置保持不变
}
```

### 1.5 验证清单

- [x] 文件迁移完成
- [ ] `bun install` 成功（依赖 `@lazytrans/translate-core` 尚未创建，待 Phase 2 完成后恢复）
- [x] `cd apps/desktop && bun run typecheck` 通过
- [x] `bun run dev:desktop` 可启动 Tauri 开发流程
- [ ] 应用功能正常（待 Phase 2 集成后做完整回归）

---

## ✅ Phase 2: 创建 translate-core 包（已完成）

**目标**：提取翻译核心为独立包

### 2.1 创建包结构

```bash
# 创建目录
mkdir -p packages/translate-core/src

# 迁移源代码
cp -r apps/desktop/src/services/core packages/translate-core/src/core
cp -r apps/desktop/src/services/translate packages/translate-core/src/translate

# 创建入口文件
touch packages/translate-core/src/index.ts
```

### 2.2 创建 Package 配置

**文件**：`packages/translate-core/package.json`

```json
{
  "name": "@lazytrans/translate-core",
  "version": "0.1.0",
  "description": "LazyTrans translation core - A powerful translation library with multiple providers",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./translate/config": {
      "types": "./dist/translate/config.d.ts",
      "import": "./dist/translate/config.js",
      "require": "./dist/translate/config.cjs"
    },
    "./translate/types": {
      "types": "./dist/translate/types.d.ts",
      "import": "./dist/translate/types.js",
      "require": "./dist/translate/types.cjs"
    }
  },
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "biome check src",
    "test": "bun test",
    "clean": "rm -rf dist"
  },
  "keywords": [
    "translation",
    "translate",
    "translator",
    "google",
    "bing",
    "openai",
    "llm",
    "i18n"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/lazytrans/lazytrans",
    "directory": "packages/translate-core"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.3.13",
    "tsup": "^8.3.5",
    "typescript": "~5.9.3"
  },
  "dependencies": {
    "zod": "^3.0.0"
  }
}
```

### 2.3 创建 TSConfig

**文件**：`packages/translate-core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### 2.4 创建构建配置

**文件**：`packages/translate-core/tsup.config.ts`

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "translate/config": "src/translate/config.ts",
    "translate/types": "src/translate/types.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  splitting: false,
  treeshake: true
});
```

### 2.5 创建入口文件

**文件**：`packages/translate-core/src/index.ts`

```typescript
// 导出核心服务
export * from "./core";

// 导出翻译服务
export * from "./translate";
```

### 2.6 修复 import 路径

在 `packages/translate-core/src/translate/` 目录下：

**translate/index.ts**
```typescript
// 将 "@/services/core" 改为相对路径
import { serviceRegistry } from "../core";
// ... 其他代码
```

**translate/providers/*.ts**
```typescript
// 将 "@/services/core" 改为相对路径
import type { IProvider } from "../../core";
// ... 其他代码
```

### 2.7 创建 README

**文件**：`packages/translate-core/README.md`

```markdown
# @lazytrans/translate-core

> LazyTrans 翻译核心库 - 支持多翻译服务提供商

## 特性

- ✅ 多翻译服务支持（Google, Bing, OpenAI, DeepL）
- ✅ 流式翻译支持
- ✅ 统一的 API 接口
- ✅ TypeScript 原生支持
- ✅ 零依赖（除 zod）

## 安装

\`\`\`bash
bun add @lazytrans/translate-core
# 或
npm install @lazytrans/translate-core
\`\`\`

## 快速开始

\`\`\`typescript
import { translate, TranslateConfig } from '@lazytrans/translate-core';

const config: TranslateConfig = {
  provider: 'google',
  apiKey: 'your-api-key',
  sourceLang: 'en',
  targetLang: 'zh'
};

const result = await translate(config, { text: 'Hello World' });
console.log(result.text);
\`\`\`

## API 文档

### translate(config, options)

执行翻译

### translateStream(config, options, onChunk)

流式翻译

## License

MIT
```

### 2.8 验证清单

- [x] 包结构创建完成
- [x] import 路径修复完成
- [x] `bun run --cwd packages/translate-core typecheck` 通过
- [x] `bun run --cwd packages/translate-core build` 成功
- [x] `dist/` 目录生成正确

---

## 🚧 Phase 3: 集成与兼容（进行中）

**目标**：在 desktop 中集成 translate-core，创建兼容层

### 3.1 创建兼容层（短期方案）

**文件**：`apps/desktop/src/services/translate/index.ts`

```typescript
// 兼容层：re-export translate-core
export * from "@lazytrans/translate-core";
```

**文件**：`apps/desktop/src/services/translate/config.ts`

```typescript
export * from "@lazytrans/translate-core/translate/config";
```

**文件**：`apps/desktop/src/services/translate/types.ts`

```typescript
export * from "@lazytrans/translate-core/translate/types";
```

### 3.2 更新 services/index.ts

**文件**：`apps/desktop/src/services/index.ts`

```typescript
export * as TranslateService from "./translate";
export * as CoreService from "@lazytrans/translate-core";
```

### 3.3 移除本地 core（已迁移到包）

```bash
# 备份后删除
rm -rf apps/desktop/src/services/core
rm -rf apps/desktop/src/services/translate/providers
```

### 3.4 验证清单

- [x] 兼容层创建完成
- [x] `bun install` 成功
- [x] workspace 依赖链接正常
- [x] 类型检查通过
- [x] 应用启动正常
- [ ] 翻译功能正常

---

## 🚧 Phase 4: 验证与优化（进行中）

**目标**：全面验证 monorepo 功能

### 4.1 Turborepo 任务验证

```bash
# 类型检查（所有包）
bunx turbo run typecheck

# 构建（所有包）
bunx turbo run build

# 代码检查
bunx turbo run lint

# 测试
bunx turbo run test
```

### 4.2 应用功能验证

```bash
# 启动开发服务器
bun --cwd apps/desktop run tauri dev

# 测试翻译功能
# - 测试 Google 翻译
# - 测试 Bing 翻译
# - 测试 OpenAI 翻译
# - 测试流式翻译
```

### 4.3 构建验证

```bash
# 构建 desktop 应用
bun --cwd apps/desktop run tauri build

# 构建 translate-core 包
bun --cwd packages/translate-core run build
```

### 4.4 性能验证

- [x] Turborepo 缓存生效（`typecheck/build` 二次执行 `4/4 cache hit`）
- [x] 增量构建正常（`FULL TURBO`，总耗时约 `407ms`）
- [x] 依赖安装速度（`bun install --frozen-lockfile`：`real 2.44s`）
- [x] 应用启动速度（`tauri dev`：Vite ready ~`729ms`，Rust dev ~`0.71s`）

### 4.5 验证清单

- [ ] Turborepo 任务全部通过（当前 `lint`/`test` 失败）
- [ ] 应用功能完整（Google/Bing/OpenAI/流式仍需手工回归）
- [x] 构建产物正确
- [x] 性能符合预期

### 4.6 本次执行结果（2026-03-04）

- ✅ `typecheck` 通过
- ✅ `build` 通过
- ❌ `lint` 失败（`packages/translate-core/src` 共 9 个格式问题）
- ❌ `test` 失败（`@lazytrans/translate-core` 无测试文件，`bun test` 退出 1）
- ✅ 桌面端打包成功（生成 `.app` 与 `.dmg`）
---

## 🚧 Phase 5: 清理与文档（待执行）

**目标**：清理遗留文件，完善文档

### 5.1 清理遗留文件

```bash
# 删除备份文件
rm package.json.backup
rm package-lock.json

# 删除旧的 husky 配置（如果 desktop 有自己的）
# rm -rf .husky (保留根目录的)

# 清理 node_modules
bun run clean
bun install
```

### 5.2 更新根 README

**文件**：`README.md`

```markdown
# LazyTrans Monorepo
> 基于 Tauri 的桌面翻译工具

## 项目结构

```
lazyTrans/
├── apps/
│   └── desktop/          # Tauri 桌面应用
├── packages/
│   └── translate-core/   # 翻译核心库
└── ...
```

## 快速开始

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev:desktop

# 构建应用
bun run build:desktop
```

## 开发指南

- [Desktop 应用](./apps/desktop/README.md)
- [翻译核心库](./packages/translate-core/README.md)
```

### 5.3 更新 ARCHITECTURE.md

**文件**：`ARCHITECTURE.md`

添加 monorepo 架构说明章节。

### 5.4 创建 CONTRIBUTING.md

**文件**：`CONTRIBUTING.md`

```markdown
# 贡献指南

## 开发流程

1. Fork 本仓库
2. 创建特性分支
3. 进行开发
4. 提交 PR

## Monorepo 开发

### 添加新包

```bash
mkdir -p packages/new-package
cd packages/new-package
bun init
```

### 添加新应用

```bash
mkdir -p apps/new-app
```

## 发布流程

当前阶段暂不纳入 npm 包发布流程，后续按需补充。
```

### 5.5 验证清单

- [ ] 遗留文件清理完成
- [ ] 文档更新完成
- [ ] monorepo 结构清晰
- [ ] 贡献指南完整

---

## 📊 进度追踪

### 总体进度

- [x] Phase 0: POC 验证 ✅ **100%**
- [x] Phase 1: 迁移 Desktop 应用 ✅ **100%**
- [x] Phase 2: 创建 translate-core 包 ✅ **100%**
- [ ] Phase 3: 集成与兼容 - **83%**
- [ ] Phase 4: 验证与优化 - **60%**（lint/test 与手工回归待完成）
- [ ] Phase 5: 清理与文档 - **0%**

### 预计时间

| Phase | 预计时间 | 实际时间 | 状态 |
|-------|---------|---------|------|
| Phase 0 | 30分钟 | 15分钟 | ✅ 完成 |
| Phase 1 | 1小时 | 1小时 | ✅ 完成 |
| Phase 2 | 2小时 | 2小时 | ✅ 完成 |
| Phase 3 | 1小时 | 30分钟（兼容层接入+类型检查+启动验证） | 🚧 进行中 |
| Phase 4 | 1小时 | 约10分钟（自动化验证 + 打包） | 🚧 进行中 |
| Phase 5 | 30分钟 | - | ⏳ 待执行 |
| **总计** | **5小时30分钟** | **~3小时55分钟** | **~71%** |

---

## 🎯 下一步行动

### 立即执行

1. **Phase 3**: 完成 desktop 翻译功能回归验证（Google/Bing/OpenAI/流式）
   ```bash
   # 启动后手动验证各翻译 Provider 与流式输出
   bun --cwd apps/desktop run tauri dev
   ```

2. **Phase 4**: 修复阻塞项后重跑验证
   ```bash
   # 修复 translate-core 的 lint 与测试阻塞项后重跑
   bunx turbo run lint test
   ```

### 决策点

- [ ] **是否保留旧的 import 路径兼容层？**
  - 短期：保留（推荐）
  - 长期：逐步迁移到直接使用 `@lazytrans/translate-core`


- [ ] **是否需要添加更多共享包？**
  - `packages/ui` - 共享 UI 组件
  - `packages/utils` - 共享工具函数
  - `packages/config` - 共享配置

---

## 🚨 风险与缓解

### 高风险

1. **import 路径变更导致编译失败**
   - 缓解：使用兼容层 + 渐进式迁移
   - 验证：每个 Phase 后运行 typecheck

2. **Tauri 路径变更导致启动失败**
   - 缓解：更新 `tauri.conf.json` 中的路径
   - 验证：执行 `tauri dev` 测试

### 中风险

1. **Turborepo + Bun 兼容性问题**
   - 缓解：使用最新版本，监控官方 issue
   - 备选：回退到纯 Bun workspaces

2. **workspace 依赖链接失败**
   - 缓解：检查 `workspace:*` 协议
   - 验证：运行 `bun pm ls` 检查

### 低风险

1. **构建产物不正确**
   - 缓解：检查 `tsup.config.ts` 配置
   - 验证：检查 `dist/` 目录内容

---

## 📝 备注

### 技术决策记录

1. **为什么选择 Bun 而不是 pnpm？**
   - 用户明确要求使用 Bun
   - Bun 原生支持 workspace
   - 安装速度更快

2. **为什么使用 Turborepo 而不是 Nx？**
   - Turborepo 更轻量
   - 学习曲线更低
   - 足够满足项目需求

3. **为什么使用 tsup 构建包？**
   - 零配置，开箱即用
   - 支持 ESM/CJS 双格式
   - 自动生成类型声明

### 参考资料

- [Bun Workspaces 文档](https://bun.sh/docs/install/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [tsup 文档](https://tsup.egoist.dev/)

---

**最后更新**: 2026-03-04
**维护者**: @lazytrans/core-team
