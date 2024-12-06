# 影视文章整理工具

一个简单易用的网页工具,用于快速整理和格式化影视相关文章。

## 功能特点

- 一键格式化文章内容
- 自动提取电影名称
- 自动添加标准模板文本
- 支持复制格式化后的内容
- 历史记录功能
- 实时搜索历史记录

## 项目结构

```
project/
├── index.html          # 主页面
├── css/               
│   └── style.css      # 样式文件
├── js/               
│   └── main.js        # 功能实现
└── README.md          # 项目说明文档
```

## 使用说明

1. 文章格式化
   - 将原始文章粘贴到输入框
   - 点击"整理内容"按钮
   - 系统自动提取电影名称并套用模板
   - 点击"复制内容"获取格式化后的文章

2. 历史记录
   - 每次格式化的内容自动保存
   - 在右侧边栏显示历史记录
   - 可以搜索历史记录
   - 点击历史记录可以重新加载内容

3. 其他功能
   - 使用"清空输入"按钮快速清除内容
   - 实时搜索历史记录
   - 响应式设计,支持移动设备

## 技术实现

- 纯原生技术栈: HTML5 + CSS3 + JavaScript
- 使用 Grid 和 Flex 布局
- localStorage 存储历史记录
- 响应式设计适配移动端
- 毛玻璃效果设计风格

## 模板格式

格式化后的文章将按以下模板展示:
```
提示：电影《电影名》全集在线观看地址百度云/夸克网盘资源链接放在文章中间👇👇，往下翻就行
提示：电影《电影名》全集在线观看地址百度云/夸克网盘资源链接放在文章中间👇👇，往下翻就行

[原文剧情简介]

《电影名》（资源尽快保存，随时失效）

链接：

提示：复制上方网盘链接到浏览器搜索打开即可保存观看
资源完全免费；不会收取您任何费用，资源搜集于互联网公开分享资源，如有侵权，联系立删
```

## 注意事项

1. 输入文本需要包含:
   - 电影名称(使用《》标记)
   - 剧情简介(以"剧情简介："开头)

2. 历史记录最多保存20条
3. 建议使用现代浏览器以获得最佳体验

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge 