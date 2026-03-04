# LazyTrans Monorepo 迁移指南

> **目标**: 将现有的 Bun-based Tauri + SolidJS TypeScript 项目迁移到基于 **Bun workspaces + Turborepo** 的 monorepo 架构，并创建一个可发布的 npm 翻译核心逻辑包。
> ⚠️ **状态说明（2026-03-04）**: 本文档含历史草案内容，实际执行进度与最新状态请以 `todo.md` 为准。

## 📋 目录

- [当前项目分析](#当前项目分析)
- [目标架构概览](#目标架构概览)
- [第一阶段：基础 Monorepo 设置](#第一阶段基础-monorepo-设置)
- [第二阶段：包边界设计](#第二阶段包边界设计)
- [第三阶段：API 设计与实现](#第三阶段api-设计与实现)
- [第四阶段：双模式发布 (ESM/CJS)](#第四阶段双模式发布-esmcjs)
- [第五阶段：测试策略](#第五阶段测试策略)
- [第六阶段：分阶段迁移计划](#第六阶段分阶段迁移计划)
- [参考资源](#参考资源)

---

## 当前项目分析

### 现有结构
```
lazyTrans/
├── src/                          # 前端源代码
│   ├── config/
│   ├── utils/
│   ├── windows/                  # 各窗口独立入口
│   │   ├── translator/
│   │   ├── settings/
│   │   └── screenshot/
│   ├── tray.ts
│   └── index.tsx
├── src-tauri/                    # Tauri/Rust 后端
│   ├── src/
│   ├── capabilities/
│   └── tauri.conf.json
├── package.json                  # 使用 Bun
└── vite.config.ts
```

### 关键依赖
- **Tauri v2**: 桌面应用框架
- **SolidJS 1.9+**: 响应式 UI 框架
- **Bun**: 包管理器 + 运行时
- **TypeScript 5.9+**: 类型安全
- **Vite 7+**: 构建工具
- **Biome**: 代码格式化/检查

---

## 目标架构概览

### 推荐的 Monorepo 结构
```
lazytrans/
├── apps/
│   ├── desktop/                  # Tauri 桌面应用 (SolidJS)
│   └── web/                      # 未来可能的 Web 版本
├── packages/
│   ├── translation-core/         # 可发布的翻译核心包 ⭐
│   ├── ui/                       # 共享 UI 组件
│   ├── config/                   # 共享配置 (TS, ESLint, Biome)
│   └── types/                    # 共享类型定义
├── Cargo.toml                    # Rust workspace
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 工具链选择
| 层级 | 工具 | 说明 |
|------|------|------|
| 包管理器 | **pnpm** | 使用 workspaces，与 Turborepo 配合最佳 |
| 构建系统 | **Turborepo** | 任务编排、缓存、管道 |
| 版本管理 | **Changesets** | 自动化版本和 changelog |
| 测试 | **Vitest** | 单元测试 + 项目模式 |
| 构建工具 | **tsdown/tsup** | 双模式打包 (ESM/CJS) |

---

## 第一阶段：基础 Monorepo 设置

### 1.1 初始化 pnpm Workspace

创建 `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 1.2 根 package.json 配置
```json
{
  "name": "lazytrans",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "type": "module",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=...@lazytrans/translation-core... && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.28.0",
    "turbo": "^2.0.0",
    "typescript": "^5.9.0"
  }
}
```

### 1.3 Turborepo 配置
创建 `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 1.4 ⚠️ Bun 兼容性注意事项

**关键发现**: Turborepo 与 Bun 的集成存在一些限制（截至 2026 年）：

1. **Turborepo 不完全支持 Bun workspaces** - Turborepo 的 `prune` 命令在 Bun workspaces 上不可用
2. **Lockfile 兼容性** - Bun 的 `bun.lock` 与 Turborepo 的远程缓存系统配合不如 `pnpm-lock.yaml`
3. **脚本执行顺序** - Bun 在 workspace 中的任务依赖执行顺序有时不可靠

**推荐方案**: 迁移到 **pnpm** 作为包管理器，同时保留 Bun 作为运行时和构建工具：
```bash
# 使用 pnpm 管理依赖
pnpm install

# 使用 bun 运行脚本
bun run dev
bun run build
```

---

## 第二阶段：包边界设计

### 2.1 包边界设计原则

#### 推荐分层架构
```
┌─────────────────────────────────────────┐
│           Apps Layer                    │
│  ┌──────────┐ ┌──────────┐             │
│  │ desktop  │ │   web    │             │
│  │ (Tauri)  │ │ (Future) │             │
│  └────┬─────┘ └────┬─────┘             │
└───────┼────────────┼────────────────────┘
        │            │
┌───────▼────────────▼────────────────────┐
│        Packages Layer                   │
│  ┌──────────────┐  ┌──────────┐        │
│  │ translation- │  │    ui    │        │
│  │    core      │  │ (Solid)  │        │
│  └──────┬───────┘  └────┬─────┘        │
│         │               │              │
│  ┌──────▼───────┐       │              │
│  │    types     │◄──────┘              │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

### 2.2 包详情设计

#### @lazytrans/translation-core (可发布包)
```
packages/translation-core/
├── src/
│   ├── index.ts              # 主入口
│   ├── engines/              # 翻译引擎实现
│   │   ├── base.ts
│   │   ├── google.ts
│   │   ├── deepL.ts
│   │   └── index.ts
│   ├── types/                # 类型定义
│   │   ├── translation.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── cache/                # 缓存策略
│   │   ├── memory.ts
│   │   └── persistent.ts
│   └── utils/                # 工具函数
│       ├── text.ts
│       └── language.ts
├── package.json
├── tsconfig.json
└── tsdown.config.ts          # 构建配置
```

**package.json**:
```json
{
  "name": "@lazytrans/translation-core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./engines": {
      "types": "./dist/engines/index.d.ts",
      "import": "./dist/engines/index.js",
      "require": "./dist/engines/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "ofetch": "^1.4.0"
  },
  "devDependencies": {
    "@lazytrans/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "tsdown": "^0.10.0",
    "typescript": "^5.9.0"
  }
}
```

#### @lazytrans/ui (内部包 - Just-in-Time)
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── hooks/
│   │   └── useTheme.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

**package.json** (JIT Package - 不编译，直接导出 TS):
```json
{
  "name": "@lazytrans/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  },
  "devDependencies": {
    "@lazytrans/typescript-config": "workspace:*",
    "solid-js": "^1.9.3"
  },
  "peerDependencies": {
    "solid-js": "^1.9.0"
  }
}
```

#### @lazytrans/typescript-config (共享配置包)
```
packages/typescript-config/
├── base.json
├── node.json
├── solid.json
└── package.json
```

**base.json**:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 2.3 包命名规范

- **Apps**: `@lazytrans/desktop`, `@lazytrans/web`
- **内部包**: `@lazytrans/ui`, `@lazytrans/types`, `@lazytrans/config`
- **可发布包**: `@lazytrans/translation-core`
- **共享配置**: `@lazytrans/typescript-config`, `@lazytrans/biome-config`

---

## 第三阶段：API 设计与实现

### 3.1 翻译核心 API 设计

#### 核心接口定义
```typescript
// packages/translation-core/src/types/translation.ts

export interface TranslationEngine {
  readonly name: string;
  translate(params: TranslateParams): Promise<TranslationResult>;
  detectLanguage(text: string): Promise<DetectedLanguage>;
  getSupportedLanguages(): Promise<Language[]>;
}

export interface TranslateParams {
  text: string;
  sourceLang?: string;
  targetLang: string;
  options?: TranslationOptions;
}

export interface TranslationResult {
  text: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
  alternatives?: string[];
  metadata?: Record<string, unknown>;
}

export interface TranslationOptions {
  timeout?: number;
  cache?: boolean;
  retry?: number;
  context?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
```

#### 翻译服务类
```typescript
// packages/translation-core/src/index.ts

import type { TranslationEngine, TranslateParams, TranslationResult } from './types';

export interface TranslationServiceConfig {
  engines: TranslationEngine[];
  defaultEngine?: string;
  cache?: CacheStrategy;
  fallbackEnabled?: boolean;
}

export class TranslationService {
  private engines: Map<string, TranslationEngine> = new Map();
  private defaultEngine: string;
  private cache?: CacheStrategy;
  
  constructor(config: TranslationServiceConfig) {
    for (const engine of config.engines) {
      this.engines.set(engine.name, engine);
    }
    this.defaultEngine = config.defaultEngine || config.engines[0]?.name;
    this.cache = config.cache;
  }
  
  async translate(params: TranslateParams): Promise<TranslationResult> {
    const cacheKey = this.generateCacheKey(params);
    
    // 检查缓存
    if (this.cache && params.options?.cache !== false) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    const engine = this.engines.get(params.options?.engine || this.defaultEngine);
    if (!engine) throw new Error(`Engine not found: ${params.options?.engine}`);
    
    const result = await engine.translate(params);
    
    // 写入缓存
    if (this.cache && params.options?.cache !== false) {
      await this.cache.set(cacheKey, result);
    }
    
    return result;
  }
  
  // 批量翻译
  async translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResult[]> {
    return Promise.all(
      texts.map(text => this.translate({ text, targetLang, sourceLang }))
    );
  }
  
  private generateCacheKey(params: TranslateParams): string {
    return `${params.text}:${params.sourceLang}:${params.targetLang}`;
  }
}

export * from './types';
export * from './engines';
```

### 3.2 具体翻译引擎实现

#### Google Translate 引擎
```typescript
// packages/translation-core/src/engines/google.ts

import { ofetch } from 'ofetch';
import type { TranslationEngine, TranslateParams, TranslationResult } from '../types';

export class GoogleTranslateEngine implements TranslationEngine {
  readonly name = 'google';
  private apiKey?: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';
  
  constructor(config?: { apiKey?: string }) {
    this.apiKey = config?.apiKey;
  }
  
  async translate(params: TranslateParams): Promise<TranslationResult> {
    const response = await ofetch(this.baseUrl, {
      method: 'POST',
      query: { key: this.apiKey },
      body: {
        q: params.text,
        source: params.sourceLang,
        target: params.targetLang,
        format: 'text'
      }
    });
    
    const translation = response.data.translations[0];
    
    return {
      text: translation.translatedText,
      sourceLang: translation.detectedSourceLanguage || params.sourceLang!,
      targetLang: params.targetLang,
      confidence: translation.confidence
    };
  }
  
  // ... 其他方法
}
```

---

## 第四阶段：双模式发布 (ESM/CJS)

### 4.1 使用 tsdown 进行双模式打包

**tsdown.config.ts**:
```typescript
import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/engines/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    cjsInterop: true
  }
]);
```

### 4.2 package.json exports 配置详解

```json
{
  "name": "@lazytrans/translation-core",
  "version": "0.1.0",
  "type": "module",
  
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "types": {
        "import": "./dist/index.d.ts",
        "require": "./dist/index.d.cts"
      },
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./engines": {
      "types": {
        "import": "./dist/engines/index.d.ts",
        "require": "./dist/engines/index.d.cts"
      },
      "import": "./dist/engines/index.js",
      "require": "./dist/engines/index.cjs"
    },
    "./package.json": "./package.json"
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "sideEffects": false
}
```

### 4.3 Changesets 配置

**安装**:
```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

**.changeset/config.json**:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@lazytrans/desktop", "@lazytrans/web"]
}
```

**发布工作流** (`.github/workflows/release.yml`):
```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      
      - name: Install Dependencies
        run: pnpm install
      
      - name: Build Packages
        run: pnpm turbo run build --filter=@lazytrans/*
      
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 4.4 npm Trusted Publishing (OIDC)

1. 在 npm 包设置中启用 "Require two-factor authentication"
2. 配置 GitHub Actions 使用 OIDC 令牌
3. 无需长期存在的 NPM_TOKEN

```yaml
- name: Publish to npm
  run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ github.token }}
```

---

## 第五阶段：测试策略

### 5.1 测试架构

```
测试层级:
├── 单元测试 (Vitest)
│   ├── packages/translation-core
│   ├── packages/ui
│   └── 每个包的独立测试
├── 集成测试
│   └── apps/desktop 的 Tauri 命令测试
└── E2E 测试 (Playwright)
    └── 完整的用户场景测试
```

### 5.2 Vitest 项目配置

**根 vitest.workspace.ts**:
```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*/vitest.config.ts',
  'apps/*/vitest.config.ts'
]);
```

**packages/translation-core/vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'translation-core',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

### 5.3 测试文件组织

```
packages/translation-core/
├── src/
│   ├── __tests__/
│   │   ├── translation-service.test.ts
│   │   └── engines/
│   │       └── google.test.ts
│   ├── engines/
│   │   ├── google.ts
│   │   └── __tests__/
│   │       └── google.test.ts
```

### 5.4 Turborepo 测试任务

**turbo.json**:
```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 5.5 覆盖率合并

```bash
# 运行所有测试并合并覆盖率
pnpm vitest run --coverage
```

---

## 第六阶段：分阶段迁移计划

### 风险缓解策略

```
阶段 0 (准备期 - 1-2天)
├── ✅ 创建 monorepo 分支
├── ✅ 设置基础工具链
└── ✅ 验证 CI/CD 流程

阶段 1 (基础设施 - 2-3天)
├── ✅ 创建 packages/ 目录结构
├── ✅ 迁移 @lazytrans/typescript-config
├── ✅ 设置 Bun workspace
└── ✅ 验证 Turbo 任务

阶段 2 (核心包提取 - 3-5天)
├── ✅ 创建 @lazytrans/translation-core
├── ✅ 从现有代码提取翻译逻辑
├── ✅ 编写测试覆盖
└── ✅ 验证双模式打包

阶段 3 (应用迁移 - 2-3天)
├── ✅ 创建 apps/desktop
├── ✅ 迁移 SolidJS 代码
├── ✅ 更新 Tauri 配置
└── ✅ 集成 translation-core

阶段 4 (验证与发布 - 2-3天)
├── ✅ 完整功能测试
├── ✅ 设置 Changesets
├── ✅ 发布 v0.1.0 到 npm
└── ✅ 文档更新
```

### 回滚计划

1. **每个阶段完成后打 tag**:
   ```bash
   git tag monorepo-phase-1
   git push origin monorepo-phase-1
   ```

2. **保持原分支活跃** 直到 monorepo 完全稳定

3. **功能开关**: 使用环境变量控制新/旧代码路径

---

## 参考资源

### 官方文档
- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [Changesets 文档](https://github.com/changesets/changesets)

### 参考项目
- [Tauri v2 + Next.js Monorepo](https://github.com/Arbarwings/tauri-v2-nextjs-monorepo) - 优秀参考
- [shadcn/ui](https://github.com/shadcn-ui/ui) - 大型 Turborepo 项目
- [shadcn/ui Discussion #6465](https://github.com/shadcn-ui/ui/discussions/6465) - Turborepo + Bun 问题讨论

### 关键文章
- [Dual publish ESM and CJS with tsdown](https://dev.to/hacksore/dual-publish-esm-and-cjs-with-tsdown-2l75)
- [Type-Safe Shared Packages in Turborepo](https://www.magnumcode.com/blog/turborepo-shared-types-monorepo)
- [Turborepo Monorepo Guide 2026](https://latestfromtechguy.com/article/turborepo-monorepo-guide-2026)

---

## 下一步行动

1. [ ] 在 feature/monorepo 分支开始实施
2. [ ] 初始化 Bun workspace 并完成包拆分
3. [ ] 迁移 TypeScript 配置作为首个包
4. [ ] 提取 translation-core 核心逻辑
5. [ ] 设置 Changesets 并测试发布流程

