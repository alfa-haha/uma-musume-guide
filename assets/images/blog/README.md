# 博客图片资源规范

## 📁 文件夹结构

```
assets/images/blog/
├── covers/          # 博客文章封面图（主要显示）
├── thumbnails/      # 缩略图（聚合页面卡片）
├── social/          # 社交媒体分享图
└── README.md        # 本规范文档
```

## 🖼️ 图片规格要求

### 1. 封面图 (covers/)
**用途**: 博客文章页面顶部的主要封面图
- **尺寸**: 1200x600px (2:1 比例)
- **格式**: WebP (首选) 或 JPG
- **文件大小**: < 200KB
- **命名规范**: `{article-slug}-cover.webp`
- **显示位置**: 文章标题下方，全宽显示

**示例文件名**:
- `beginner-guide-cover.webp`
- `daily-guide-cover.webp`
- `how-to-play-cover.webp`

### 2. 缩略图 (thumbnails/)
**用途**: 聚合页面的卡片缩略图
- **尺寸**: 400x200px (2:1 比例)
- **格式**: WebP (首选) 或 JPG
- **文件大小**: < 50KB
- **命名规范**: `{article-slug}-thumb.webp`
- **显示位置**: 聚合页面的指南卡片

**示例文件名**:
- `beginner-guide-thumb.webp`
- `daily-guide-thumb.webp`
- `how-to-play-thumb.webp`

### 3. 社交分享图 (social/)
**用途**: Open Graph 和 Twitter Card 分享图
- **尺寸**: 1200x630px (1.91:1 比例)
- **格式**: JPG (兼容性更好)
- **文件大小**: < 300KB
- **命名规范**: `{article-slug}-social.jpg`
- **显示位置**: 社交媒体分享时显示

**示例文件名**:
- `beginner-guide-social.jpg`
- `daily-guide-social.jpg`
- `how-to-play-social.jpg`

## 🎨 设计要求

### 视觉风格
- **主色调**: 使用网站的Uma Musume粉色主题 (#FF69B4, #FFB6C1)
- **辅助色**: 天空蓝 (#87CEEB), 草绿色 (#90EE90), 金色 (#FFD700)
- **字体**: 清晰易读，建议使用Poppins或类似无衬线字体
- **风格**: 现代、清新、符合Uma Musume的可爱风格

### 内容要求
- **标题文字**: 清晰可读，与文章标题一致
- **Uma Musume元素**: 可包含马娘角色剪影或相关图标
- **背景**: 渐变或纯色背景，避免过于复杂的图案
- **品牌一致性**: 保持与网站整体设计风格一致

### 技术要求
- **分辨率**: 至少72 DPI，建议144 DPI用于高清显示
- **色彩空间**: sRGB
- **压缩**: 在保证质量的前提下尽可能压缩文件大小
- **响应式**: 确保在不同设备上都能良好显示

## 📝 当前需要的图片文件

### 1. 新手指南系列
```
covers/beginner-guide-cover.webp     # 早期游戏攻略封面
covers/daily-guide-cover.webp        # 每日任务指南封面  
covers/how-to-play-cover.webp        # 游戏玩法指南封面

thumbnails/beginner-guide-thumb.webp # 早期游戏攻略缩略图
thumbnails/daily-guide-thumb.webp    # 每日任务指南缩略图
thumbnails/how-to-play-thumb.webp    # 游戏玩法指南缩略图

social/beginner-guide-social.jpg     # 早期游戏攻略分享图
social/daily-guide-social.jpg        # 每日任务指南分享图
social/how-to-play-social.jpg        # 游戏玩法指南分享图
```

## 🔧 HTML集成示例

### 博客文章页面
```html
<!-- 封面图 -->
<div class="blog-cover">
    <img src="assets/images/blog/covers/beginner-guide-cover.webp" 
         alt="Uma Musume Beginner Guide Cover" 
         class="cover-image">
</div>

<!-- Open Graph -->
<meta property="og:image" content="https://umamusumeguide.co/assets/images/blog/social/beginner-guide-social.jpg">
```

### 聚合页面卡片
```html
<!-- 缩略图 -->
<div class="guide-card-image">
    <img src="assets/images/blog/thumbnails/beginner-guide-thumb.webp" 
         alt="Beginner Guide Thumbnail" 
         class="card-thumbnail">
</div>
```

## 📋 制作清单

- [ ] beginner-guide-cover.webp (1200x600px)
- [ ] beginner-guide-thumb.webp (400x200px)  
- [ ] beginner-guide-social.jpg (1200x630px)
- [ ] daily-guide-cover.webp (1200x600px)
- [ ] daily-guide-thumb.webp (400x200px)
- [ ] daily-guide-social.jpg (1200x630px)
- [ ] how-to-play-cover.webp (1200x600px)
- [ ] how-to-play-thumb.webp (400x200px)
- [ ] how-to-play-social.jpg (1200x630px)

## 🎯 优化建议

1. **WebP格式优先**: 现代浏览器支持良好，文件更小
2. **懒加载**: 考虑为封面图添加懒加载以提升性能
3. **Alt文本**: 为所有图片添加描述性的alt属性
4. **响应式**: 考虑为不同屏幕尺寸提供不同大小的图片
5. **CDN**: 未来可考虑使用CDN加速图片加载

---

*最后更新: 2025-01-29*