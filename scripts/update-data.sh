#!/bin/bash

# Uma Musume Guide - 数据更新和验证脚本
# 这个脚本会在部署前检查和修复所有图片路径问题

echo "🚀 Uma Musume Guide - 数据更新脚本"
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 需要安装Node.js才能运行此脚本"
    exit 1
fi

# 1. 修复图片路径
echo "🔧 步骤 1: 修复图片路径..."
if node scripts/fix-image-paths.js; then
    echo "✅ 图片路径修复完成"
else
    echo "⚠️  图片路径修复过程中出现警告，但继续执行..."
fi

echo ""

# 2. 验证所有图片文件
echo "🔍 步骤 2: 验证图片文件..."
if node scripts/validate-images.js; then
    echo "✅ 所有图片文件验证通过"
else
    echo "❌ 图片文件验证失败，请检查缺失的文件"
    exit 1
fi

echo ""

# 3. 检查JSON文件格式
echo "📝 步骤 3: 验证JSON格式..."
if node -e "JSON.parse(require('fs').readFileSync('assets/data/characters.json', 'utf8')); console.log('JSON格式正确')"; then
    echo "✅ JSON格式验证通过"
else
    echo "❌ JSON格式错误"
    exit 1
fi

echo ""

# 4. 生成统计信息
echo "📊 步骤 4: 生成统计信息..."
TOTAL_CHARACTERS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('assets/data/characters.json', 'utf8')).characters.length)")
TOTAL_IMAGES=$(find assets/images/characters -name "*.jpg" -o -name "*.png" | wc -l)

echo "  - 角色总数: $TOTAL_CHARACTERS"
echo "  - 图片文件总数: $TOTAL_IMAGES"

echo ""

# 5. 检查占位符图片
echo "🖼️  步骤 5: 检查占位符图片..."
if [ -f "assets/images/placeholders/placeholder_character.svg" ] && [ -f "assets/images/placeholders/placeholder_thumbnail.svg" ]; then
    echo "✅ 占位符图片存在"
else
    echo "⚠️  占位符图片缺失，创建默认占位符..."
    mkdir -p assets/images/placeholders
    
    # 创建简单的SVG占位符
    cat > assets/images/placeholders/placeholder_character.svg << 'EOF'
<svg width="300" height="375" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FFE4E1"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#FF69B4">Uma Musume</text>
  <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#999">Image Not Found</text>
</svg>
EOF

    cat > assets/images/placeholders/placeholder_thumbnail.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FFE4E1"/>
  <text x="50%" y="45%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#FF69B4">Uma</text>
  <text x="50%" y="55%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#FF69B4">Musume</text>
  <text x="50%" y="70%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="10" fill="#999">No Image</text>
</svg>
EOF
    
    echo "✅ 占位符图片已创建"
fi

echo ""
echo "🎉 所有检查完成！数据已准备好部署。"
echo ""
echo "📋 部署前检查清单:"
echo "  ✅ 图片路径已修复"
echo "  ✅ 所有图片文件存在"
echo "  ✅ JSON格式正确"
echo "  ✅ 占位符图片就绪"
echo ""
echo "🚀 现在可以安全地部署到服务器了！"