#!/usr/bin/env node

/**
 * 验证所有角色图片是否存在
 * 这个脚本会检查JSON数据中引用的所有图片文件是否真实存在
 */

const fs = require('fs');
const path = require('path');

// 读取角色数据
const charactersPath = path.join(__dirname, '../assets/data/characters.json');
const charactersData = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

console.log('🔍 开始验证图片文件...\n');

let totalImages = 0;
let existingImages = 0;
let missingImages = [];

charactersData.characters.forEach((character, index) => {
    console.log(`检查角色: ${character.name} (${character.version || 'Original'})`);
    
    // 检查缩略图
    if (character.thumbnail) {
        totalImages++;
        const thumbnailPath = path.join(__dirname, '..', character.thumbnail);
        
        if (fs.existsSync(thumbnailPath)) {
            existingImages++;
            console.log(`  ✅ 缩略图: ${character.thumbnail}`);
        } else {
            console.log(`  ❌ 缩略图缺失: ${character.thumbnail}`);
            missingImages.push({
                character: character.name,
                type: 'thumbnail',
                path: character.thumbnail
            });
        }
    }
    
    // 检查肖像图
    if (character.image) {
        totalImages++;
        const imagePath = path.join(__dirname, '..', character.image);
        
        if (fs.existsSync(imagePath)) {
            existingImages++;
            console.log(`  ✅ 肖像图: ${character.image}`);
        } else {
            console.log(`  ❌ 肖像图缺失: ${character.image}`);
            missingImages.push({
                character: character.name,
                type: 'portrait',
                path: character.image
            });
        }
    }
    
    console.log(''); // 空行分隔
});

// 生成报告
console.log('📊 验证报告');
console.log('='.repeat(50));
console.log(`总图片数量: ${totalImages}`);
console.log(`存在的图片: ${existingImages}`);
console.log(`缺失的图片: ${missingImages.length}`);
console.log(`成功率: ${((existingImages / totalImages) * 100).toFixed(1)}%`);

if (missingImages.length > 0) {
    console.log('\n❌ 缺失的图片文件:');
    missingImages.forEach(missing => {
        console.log(`  - ${missing.character} (${missing.type}): ${missing.path}`);
    });
    
    console.log('\n💡 建议的解决方案:');
    console.log('1. 检查文件名大小写是否正确');
    console.log('2. 确认文件是否存在于正确的目录中');
    console.log('3. 运行 node scripts/fix-image-paths.js 自动修复路径');
    
    process.exit(1);
} else {
    console.log('\n🎉 所有图片文件都存在！');
    process.exit(0);
}