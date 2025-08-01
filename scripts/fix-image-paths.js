#!/usr/bin/env node

/**
 * 修复角色图片路径大小写不匹配问题
 * 这个脚本会检查JSON数据中的图片路径与实际文件名是否匹配
 */

const fs = require('fs');
const path = require('path');

// 读取角色数据
const charactersPath = path.join(__dirname, '../assets/data/characters.json');
const charactersData = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

// 获取实际的文件列表
const thumbnailsDir = path.join(__dirname, '../assets/images/characters/thumbnails');
const portraitsDir = path.join(__dirname, '../assets/images/characters/portraits');

let thumbnailFiles = [];
let portraitFiles = [];
let thumbnailFilesOriginal = [];
let portraitFilesOriginal = [];

try {
    thumbnailFilesOriginal = fs.readdirSync(thumbnailsDir)
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    thumbnailFiles = thumbnailFilesOriginal.map(file => file.toLowerCase());
        
    portraitFilesOriginal = fs.readdirSync(portraitsDir)
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    portraitFiles = portraitFilesOriginal.map(file => file.toLowerCase());
} catch (error) {
    console.error('Error reading directories:', error);
    process.exit(1);
}

console.log('Found thumbnail files:', thumbnailFiles.length);
console.log('Found portrait files:', portraitFiles.length);

// 创建文件名映射函数
function findMatchingFile(targetName, fileList, originalFileList) {
    const targetLower = targetName.toLowerCase();
    
    // 1. 精确匹配
    const exactIndex = fileList.findIndex(file => file === targetLower);
    if (exactIndex !== -1) {
        return originalFileList[exactIndex];
    }
    
    // 2. 基于角色名的模糊匹配
    const possibleMatches = [];
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const originalFile = originalFileList[i];
        
        // 移除扩展名进行比较
        const fileBase = path.basename(file, path.extname(file));
        const targetBase = path.basename(targetLower, path.extname(targetLower));
        
        // 检查是否包含相似的关键词
        if (fileBase.includes(targetBase) || targetBase.includes(fileBase)) {
            possibleMatches.push(originalFile);
        }
    }
    
    return possibleMatches.length > 0 ? possibleMatches[0] : null;
}

// 特殊映射表（处理特殊命名情况）
const specialMappings = {
    'nice_nature_original_portrait.jpg': 'Nicenaturegame_original_portrait.jpg',
    'tm_opera_o_original_portrait.jpg': 'T.M._Opera_O_original_portrait.jpg'
};

// 检查和修复路径
let fixedCount = 0;
let missingFiles = [];

charactersData.characters.forEach((character, index) => {
    // 检查缩略图
    if (character.thumbnail) {
        const thumbnailName = path.basename(character.thumbnail);
        const matchingThumbnail = findMatchingFile(thumbnailName, thumbnailFiles, thumbnailFilesOriginal);
        
        if (matchingThumbnail && matchingThumbnail !== thumbnailName) {
            const newPath = `assets/images/characters/thumbnails/${matchingThumbnail}`;
            console.log(`Fixing thumbnail for ${character.name}: ${thumbnailName} -> ${matchingThumbnail}`);
            character.thumbnail = newPath;
            fixedCount++;
        } else if (!matchingThumbnail) {
            missingFiles.push({
                character: character.name,
                type: 'thumbnail',
                expected: character.thumbnail,
                id: character.id
            });
        }
    }
    
    // 检查肖像图
    if (character.image) {
        const imageName = path.basename(character.image);
        let matchingImage = findMatchingFile(imageName, portraitFiles, portraitFilesOriginal);
        
        // 检查特殊映射
        if (!matchingImage && specialMappings[imageName.toLowerCase()]) {
            matchingImage = specialMappings[imageName.toLowerCase()];
        }
        
        if (matchingImage && matchingImage !== imageName) {
            const newPath = `assets/images/characters/portraits/${matchingImage}`;
            console.log(`Fixing portrait for ${character.name}: ${imageName} -> ${matchingImage}`);
            character.image = newPath;
            fixedCount++;
        } else if (!matchingImage) {
            missingFiles.push({
                character: character.name,
                type: 'portrait',
                expected: character.image,
                id: character.id
            });
        }
    }
});

// 保存修复后的数据
if (fixedCount > 0) {
    fs.writeFileSync(charactersPath, JSON.stringify(charactersData, null, 2));
    console.log(`\n✅ Fixed ${fixedCount} image paths`);
} else {
    console.log('\n✅ No paths needed fixing');
}

// 报告缺失的文件
if (missingFiles.length > 0) {
    console.log('\n⚠️  Missing files:');
    missingFiles.forEach(missing => {
        console.log(`  - ${missing.character} (${missing.type}): ${missing.expected}`);
    });
    
    console.log('\n📝 Available files that might match:');
    missingFiles.forEach(missing => {
        const searchTerm = missing.character.toLowerCase().replace(/\s+/g, '');
        const fileList = missing.type === 'thumbnail' ? portraitFilesOriginal : portraitFilesOriginal;
        const matches = fileList.filter(file => 
            file.toLowerCase().includes(searchTerm) || 
            searchTerm.includes(file.toLowerCase().replace(/[^a-z]/g, ''))
        );
        if (matches.length > 0) {
            console.log(`  - ${missing.character}: ${matches.join(', ')}`);
        }
    });
}

console.log('\n🎉 Image path fixing complete!');