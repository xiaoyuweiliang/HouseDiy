# House AI - Expo Project

这是一个基于 Expo 和 React Native 的房屋设计应用。

## 项目结构

```
HouseAi/
├── app/                    # Expo Router 路由文件
│   ├── _layout.tsx        # 根布局
│   ├── index.tsx          # 入口页面
│   ├── splash.tsx          # 启动页
│   ├── welcome.tsx         # 欢迎页
│   └── (tabs)/            # Tab 导航
│       ├── _layout.tsx
│       ├── main.tsx        # 主页面（画布）
│       ├── history.tsx     # 历史记录
│       └── settings.tsx    # 设置
├── src/
│   ├── components/        # 组件
│   ├── data/              # 数据文件
│   ├── services/          # 服务
│   ├── styles/            # 样式
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── assets/                # 资源文件
└── package.json
```

## 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

## 运行项目

```bash
# 启动开发服务器
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## 项目特性

- ✅ Expo Router 文件路由
- ✅ React Native 组件
- ✅ TypeScript 支持
- ✅ 模块化架构
- ✅ 房间模块系统
- ✅ 画布编辑功能

## 注意事项

1. 图标资源目前使用远程 URL，后续可以替换为本地资源
2. 主页面画布功能需要进一步完善（拖拽、缩放等）
3. 需要配置 Gemini API Key 以使用 AI 功能
