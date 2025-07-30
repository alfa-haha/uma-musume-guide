#!/bin/bash

# Uma Musume数据更新脚本
# 用于从API获取最新数据并更新本地JSON文件

echo "开始更新Uma Musume角色数据..."

# 检查Node.js是否可用
if ! command -v node &> /dev/null; then
    echo "错误: 需要安装Node.js来运行数据获取脚本"
    exit 1
fi

# 检查网络连接
if ! curl -s --head https://www.tracenacademy.com > /dev/null; then
    echo "警告: 无法连接到API服务器，使用现有数据"
    exit 0
fi

# 创建备份
BACKUP_DIR="assets/data/backup"
mkdir -p "$BACKUP_DIR"

if [ -f "assets/data/characters.json" ]; then
    cp "assets/data/characters.json" "$BACKUP_DIR/characters_$(date +%Y%m%d_%H%M%S).json"
    echo "已创建数据备份"
fi

# 运行数据获取脚本
echo "正在从API获取数据..."
if node scripts/data-fetcher.js; then
    echo "数据更新成功!"
    
    # 验证JSON格式
    if node -e "JSON.parse(require('fs').readFileSync('assets/data/characters.json', 'utf8'))"; then
        echo "JSON格式验证通过"
    else
        echo "错误: 生成的JSON格式无效，恢复备份"
        # 恢复最新备份
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/characters_*.json | head -n1)
        if [ -n "$LATEST_BACKUP" ]; then
            cp "$LATEST_BACKUP" "assets/data/characters.json"
            echo "已恢复备份数据"
        fi
        exit 1
    fi
else
    echo "数据获取失败，保持现有数据"
    exit 1
fi

echo "数据更新完成!"