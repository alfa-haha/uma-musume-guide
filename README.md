# Uma Musume Guide

一个全面的Uma Musume Pretty Derby角色比较工具和初学者指南。

## 🚀 功能特性

- **角色比较工具**: 并排比较最多4个Uma Musume角色
- **高级筛选**: 按类型、稀有度和名称搜索角色
- **响应式设计**: 在所有设备上完美运行
- **图片优化**: 智能图片加载和错误处理
- **专家指南**: 详细的初学者指南和策略

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: 自定义CSS，Uma Musume主题色彩
- **图片**: 优化的JPG/PNG格式，SVG占位符
- **数据**: JSON格式的角色数据

## 📁 项目结构

```
uma-musume-guide/
├── assets/
│   ├── css/
│   │   └── style.css              # 主样式文件
│   ├── js/
│   │   ├── main.js                # 主JavaScript文件
│   │   ├── theme-toggle.js        # 主题切换功能
│   │   ├── mobile-nav.js          # 移动端导航
│   │   └── back-to-top.js         # 返回顶部功能
│   ├── data/
│   │   └── characters.json        # 角色数据
│   └── images/
│       ├── characters/
│       │   ├── thumbnails/        # 角色缩略图
│       │   ├── portraits/         # 角色肖像图
│       │   └── full/              # 全尺寸图片
│       ├── placeholders/          # 占位符图片
│       ├── blog/                  # 博客相关图片
│       ├── meta/                  # SEO元数据图片
│       └── ui/                    # UI元素图片
├── scripts/
│   ├── fix-image-paths.js         # 图片路径修复脚本
│   ├── validate-images.js         # 图片验证脚本
│   └── update-data.sh             # 数据更新脚本
├── docs/                          # 文档文件
├── index.html                     # 主页面
├── beginner-guide.html            # 初学者指南页面
└── test-images.html               # 图片测试页面
```

## 🔧 开发和部署

### 本地开发

1. 克隆仓库
2. 使用本地服务器运行（如Live Server）
3. 访问 `index.html`

### 图片路径问题解决

如果遇到图片加载问题，特别是在服务器环境下：

```bash
# 运行完整的数据更新和验证脚本
./scripts/update-data.sh

# 或者单独运行各个脚本
node scripts/fix-image-paths.js      # 修复路径大小写问题
node scripts/validate-images.js      # 验证所有图片文件存在
```

### 常见问题

#### 为什么本地能正常显示但服务器上图片无法加载？

这是一个典型的**文件名大小写敏感性**问题：

- **本地环境** (macOS/Windows): 文件系统通常对大小写不敏感
- **服务器环境** (Linux): 文件系统对大小写敏感

**解决方案**:
1. 运行 `./scripts/update-data.sh` 自动修复所有路径问题
2. 确保JSON数据中的文件名与实际文件名完全匹配
3. 使用我们的图片错误处理机制作为备用方案

#### 图片加载优化

项目包含以下图片优化功能：

- **懒加载**: 只在需要时加载图片
- **WebP支持**: 自动检测并使用WebP格式
- **错误处理**: 自动尝试备用格式和路径
- **占位符**: 加载失败时显示友好的占位符
- **渐进式加载**: 先显示低质量版本，再加载高质量版本

## 📊 数据格式

角色数据存储在 `assets/data/characters.json` 中，包含：

```json
{
  "characters": [
    {
      "id": "character_id",
      "name": "Character Name",
      "nameJp": "日本語名前",
      "version": "Original",
      "rarity": 3,
      "type": "speed",
      "stats": { ... },
      "skills": [ ... ],
      "image": "assets/images/characters/portraits/character_portrait.jpg",
      "thumbnail": "assets/images/characters/thumbnails/character_thumb.jpg"
    }
  ]
}
```

## 🎨 主题和样式

项目使用Uma Musume的标志性粉色主题：

- **主色调**: #FF69B4 (Hot Pink)
- **辅助色**: #FFB6C1 (Light Pink)
- **背景色**: #FFE4E1 (Misty Rose)
- **字体**: Noto Sans, Poppins, Quicksand

## 🚀 部署

1. 运行预部署检查：
   ```bash
   ./scripts/update-data.sh
   ```

2. 确保所有检查通过后，将文件上传到服务器

3. 配置服务器以正确处理静态文件

## 📝 许可证

本项目仅用于教育和娱乐目的。Uma Musume Pretty Derby是Cygames的商标。

## 🤝 贡献

欢迎提交问题报告和功能请求！

---

**注意**: 如果在部署后遇到图片加载问题，请首先运行 `./scripts/update-data.sh` 脚本来自动修复路径问题。