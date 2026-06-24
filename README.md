# Codex List

一个使用 Electron、React 和 TypeScript 构建的桌面计划/待办客户端。

## Windows 启动

首次使用或依赖被删除后，先安装依赖：

```powershell
npm install
```

启动桌面客户端：

```powershell
npm run start
```

`npm run start` 会先检查 Electron 二进制、构建项目，然后打开 Electron 桌面窗口。

## 打包 Windows EXE

生成可双击运行的 Windows 便携版 exe：

```powershell
npm run package:win
```

打包完成后，到 `release/` 目录里打开 `Codex List-1.0.0-x64.exe`。

## Electron 安装修复

如果启动时报错 `Electron failed to install correctly`，说明 Electron 二进制没有下载或解压完整。运行：

```powershell
npm run repair:electron
npm run start
```

项目会使用 npmmirror 的 Electron 镜像，并把下载缓存放在本项目的 `.electron-cache/` 目录，避免写入 Windows AppData 缓存目录时出现权限问题。

## 常用命令

- `npm run dev`：启动 Vite 渲染进程开发服务
- `npm run start`：构建并启动 Electron 桌面客户端
- `npm run test`：运行核心逻辑和 React UI 测试
- `npm run build`：构建 Electron 主进程和前端资源
- `npm run package:win`：生成 Windows 便携版 exe
- `npm run repair:electron`：重新下载并修复 Electron 二进制
