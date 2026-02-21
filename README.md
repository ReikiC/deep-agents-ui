# Universal Agent Chat UI

> 适配 Universal Agent Backend 的前端界面

原项目 [langchain-ai/deep-agents-ui](https://github.com/langchain-ai/deep-agents-ui) 已改造为适配 [Universal Agent Backend](https://github.com/ReikiC/Universal-Agent-Backend)。

## ✨ 特性

- 🔐 **用户认证** - 支持注册、登录、JWT 认证
- 💬 **流式聊天** - 实时 SSE 流式响应
- 📝 **会话管理** - 持久化的多轮对话会话
- 🛠️ **工具调用** - 支持 MCP 工具集成
- ⏸️ **任务控制** - 取消和继续正在运行的任务

## 🚀 快速开始

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
# Universal Agent Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动后端服务

确保 [Universal Agent Backend](https://github.com/ReikiC/Universal-Agent-Backend) 正在运行：

```bash
cd /path/to/Universal-Agent-Backend
uv run python -m uvicorn app.main:app --reload
```

### 4. 启动前端服务

```bash
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 5. 注册和登录

首次使用需要注册账户：

1. 访问登录页面
2. 点击 "Don't have an account? Sign up"
3. 填写邮箱、密码和姓名
4. 注册后自动登录

## 📁 项目结构

```
src/
├── api/                    # API 客户端层
│   ├── client.ts          # 基础 API 客户端（fetch 封装）
│   ├── auth.ts            # 认证 API
│   ├── sessions.ts        # 会话管理 API
│   ├── chat.ts            # 聊天和 SSE 处理
│   └── index.ts
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts         # 认证状态管理
│   ├── useSessions.ts     # 会话列表（替换 useThreads）
│   └── useChat.new.ts     # 聊天逻辑
├── providers/              # Context Providers
│   ├── AuthProvider.tsx   # 认证上下文
│   └── ApiProvider.tsx    # API 客户端上下文
├── types/                  # TypeScript 类型定义
│   ├── auth.ts            # 认证类型
│   ├── api.ts             # API 类型
│   └── index.ts
└── app/                    # Next.js App Router
    ├── login/             # 登录页面
    ├── components/        # React 组件
    └── page.tsx           # 主页
```

## 🔧 开发

### 可用脚本

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器 |
| `yarn build` | 构建生产版本 |
| `yarn start` | 启动生产服务器 |
| `yarn lint` | 运行 ESLint |
| `yarn format` | 格式化代码 |

### API 端点

| 端点 | 说明 | 认证 |
|------|------|:----:|
| `POST /api/v1/auth/register` | 用户注册 | ❌ |
| `POST /api/v1/auth/login` | 用户登录 | ❌ |
| `GET /api/v1/sessions` | 列出会话 | ✅ |
| `POST /api/v1/sessions` | 创建会话 | ✅ |
| `POST /api/v1/chat/.../stream/v2` | 流式聊天 | ✅ |
| `DELETE /api/v1/task/{id}` | 取消任务 | ✅ |

详细 API 文档：[Universal Agent Backend README](https://github.com/ReikiC/Universal-Agent-Backend#api-概览)

## 🔄 从原项目迁移

如果你正在从原版 deep-agents-ui 迁移，请查看 [迁移指南](./MIGRATION_GUIDE.md)。

主要变更：

- ❌ 移除 `@langchain/langgraph-sdk` 依赖
- ✅ 添加 JWT 认证系统
- ✅ 重写 API 客户端层（REST + SSE）
- ✅ 添加登录/注册页面
- ⚠️ 简化配置（只需要 API URL）
- ⚠️ 移除 Debug 模式和 LangSmith 追踪

## ⚠️ 功能差异

与原版 deep-agents-ui 相比，以下功能不再支持：

- ❌ LangSmith 追踪集成
- ❌ Debug 模式（单步执行）
- ⚠️ 子代理嵌套展示（简化为线性展示）

新增功能：

- ✅ 用户认证和授权
- ✅ 数据库持久化的会话管理
- ✅ 任务取消和继续

## 📚 相关文档

- [适配方案详细文档](./ADAPTATION_PLAN.md)
- [迁移指南](./MIGRATION_GUIDE.md)
- [Universal Agent Backend](https://github.com/ReikiC/Universal-Agent-Backend)

## 📄 许可证

Apache License 2.0

## 🙏 致谢

本项目基于 [langchain-ai/deep-agents-ui](https://github.com/langchain-ai/deep-agents-ui) 改造而来。
