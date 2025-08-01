#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const blogFiles = [
    'guides/beginner-guide-2025.html',
    'guides/daily-tasks-new-trainers.html', 
    'guides/how-to-play-uma-musume.html'
];

console.log('🔍 Validating blog page resource paths...\n');

blogFiles.forEach(file => {
    console.log(`📄 Checking ${file}:`);
    
    if (!fs.existsSync(file)) {
        console.log(`   ❌ File not found: ${file}`);
        return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for absolute paths that should be relative
    const absolutePaths = [
        { pattern: /href="\/assets\//, description: 'CSS/Asset absolute paths' },
        { pattern: /src="\/assets\//, description: 'Image/JS absolute paths' },
        { pattern: /href="\/favicon/, description: 'Favicon absolute paths' },
        { pattern: /href="\/site\.webmanifest/, description: 'Manifest absolute paths' }
    ];
    
    let hasIssues = false;
    
    absolutePaths.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`   ❌ Found ${description}: ${matches.length} occurrences`);
            hasIssues = true;
        }
    });
    
    // Check for correct relative paths
    const relativePaths = [
        { pattern: /href="\.\.\/assets\/css\/style\.css"/, description: 'CSS relative path' },
        { pattern: /src="\.\.\/assets\/images\/blog\/covers\//, description: 'Cover image relative paths' },
        { pattern: /src="\.\.\/assets\/js\//, description: 'JavaScript relative paths' },
        { pattern: /href="\.\.\/favicon\.ico"/, description: 'Favicon relative path' }
    ];
    
    relativePaths.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`   ✅ ${description}: Found`);
        } else {
            console.log(`   ⚠️  ${description}: Not found`);
        }
    });
    
    if (!hasIssues) {
        console.log('   ✅ No absolute path issues found');
    }
    
    console.log('');
});

console.log('🎯 Validation complete!');