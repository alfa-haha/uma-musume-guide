/**
 * Uma Musume API数据获取和转换脚本
 * 用于从SimpleSandman/UmaMusumeAPI获取数据并转换为前端友好的JSON格式
 */

class UmaMusumeDataFetcher {
  constructor() {
    this.baseUrl = 'https://www.tracenacademy.com/api';
    this.endpoints = {
      characters: '/BasicCharaData',
      skills: '/BasicSkillData', 
      stats: '/BasicCharaStatusData'
    };
  }

  /**
   * 获取角色基础数据
   */
  async fetchCharacterData() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.characters}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取角色数据失败:', error);
      return null;
    }
  }

  /**
   * 获取技能数据
   */
  async fetchSkillData() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.skills}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取技能数据失败:', error);
      return null;
    }
  }

  /**
   * 获取属性数据
   */
  async fetchStatsData() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.stats}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取属性数据失败:', error);
      return null;
    }
  }

  /**
   * 转换API数据为前端格式
   */
  transformCharacterData(apiData, skillsData, statsData) {
    if (!apiData) return { characters: [] };

    const skillsMap = this.createSkillsMap(skillsData);
    const statsMap = this.createStatsMap(statsData);

    const characters = apiData.map(char => ({
      id: this.generateCharacterId(char.name || char.charaName),
      name: char.name || char.charaName || 'Unknown',
      nameJp: char.nameJp || char.charaNameJp || '',
      rarity: char.rarity || this.determineRarity(char),
      type: this.determineType(char, statsMap),
      stats: this.extractStats(char, statsMap),
      skills: this.extractSkills(char, skillsMap),
      image: this.generateImagePath(char),
      thumbnail: this.generateThumbnailPath(char)
    }));

    return {
      characters,
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        totalCharacters: characters.length,
        source: 'SimpleSandman/UmaMusumeAPI'
      }
    };
  }

  /**
   * 创建技能映射表
   */
  createSkillsMap(skillsData) {
    if (!skillsData) return new Map();
    
    const skillsMap = new Map();
    skillsData.forEach(skill => {
      skillsMap.set(skill.id, {
        name: skill.name || skill.skillName,
        description: skill.description || skill.skillDescription,
        type: skill.type || this.determineSkillType(skill)
      });
    });
    return skillsMap;
  }

  /**
   * 创建属性映射表
   */
  createStatsMap(statsData) {
    if (!statsData) return new Map();
    
    const statsMap = new Map();
    statsData.forEach(stat => {
      statsMap.set(stat.charaId, {
        speed: stat.speed || 0,
        stamina: stat.stamina || 0,
        power: stat.power || 0,
        guts: stat.guts || 0,
        wisdom: stat.wisdom || 0
      });
    });
    return statsMap;
  }

  /**
   * 生成角色ID
   */
  generateCharacterId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * 确定角色稀有度
   */
  determineRarity(char) {
    // 基于API数据结构确定稀有度逻辑
    if (char.rarity) return char.rarity;
    if (char.star) return char.star;
    return 3; // 默认3星
  }

  /**
   * 确定角色类型
   */
  determineType(char, statsMap) {
    const stats = statsMap.get(char.id) || {};
    const maxStat = Math.max(
      stats.speed || 0,
      stats.stamina || 0, 
      stats.power || 0,
      stats.guts || 0,
      stats.wisdom || 0
    );

    if (stats.speed === maxStat) return 'speed';
    if (stats.stamina === maxStat) return 'stamina';
    if (stats.power === maxStat) return 'power';
    if (stats.guts === maxStat) return 'guts';
    if (stats.wisdom === maxStat) return 'wisdom';
    
    return 'speed'; // 默认类型
  }

  /**
   * 提取角色属性
   */
  extractStats(char, statsMap) {
    const defaultStats = {
      speed: 70,
      stamina: 70,
      power: 70,
      guts: 70,
      wisdom: 70
    };

    return statsMap.get(char.id) || defaultStats;
  }

  /**
   * 提取角色技能
   */
  extractSkills(char, skillsMap) {
    const skills = [];
    
    // 假设API返回技能ID数组
    if (char.skills && Array.isArray(char.skills)) {
      char.skills.forEach(skillId => {
        const skill = skillsMap.get(skillId);
        if (skill) {
          skills.push(skill);
        }
      });
    }

    // 如果没有技能数据，提供默认技能
    if (skills.length === 0) {
      skills.push({
        name: 'Basic Skill',
        description: 'A basic skill for this character',
        type: 'basic'
      });
    }

    return skills;
  }

  /**
   * 确定技能类型
   */
  determineSkillType(skill) {
    const name = (skill.name || skill.skillName || '').toLowerCase();
    
    if (name.includes('speed')) return 'speed_boost';
    if (name.includes('stamina')) return 'stamina_boost';
    if (name.includes('power')) return 'power_boost';
    if (name.includes('guts')) return 'guts_boost';
    if (name.includes('wisdom')) return 'wisdom_boost';
    
    return 'basic';
  }

  /**
   * 生成角色图片路径
   */
  generateImagePath(char) {
    const id = this.generateCharacterId(char.name || char.charaName);
    return `/assets/images/characters/${id}.jpg`;
  }

  /**
   * 生成缩略图路径
   */
  generateThumbnailPath(char) {
    const id = this.generateCharacterId(char.name || char.charaName);
    return `/assets/images/characters/thumbnails/${id}_thumb.jpg`;
  }

  /**
   * 主要的数据获取和转换流程
   */
  async fetchAndTransformData() {
    console.log('开始获取Uma Musume数据...');
    
    try {
      // 并行获取所有数据
      const [charactersData, skillsData, statsData] = await Promise.all([
        this.fetchCharacterData(),
        this.fetchSkillData(),
        this.fetchStatsData()
      ]);

      if (!charactersData) {
        throw new Error('无法获取角色数据');
      }

      // 转换数据格式
      const transformedData = this.transformCharacterData(
        charactersData,
        skillsData,
        statsData
      );

      console.log(`成功转换 ${transformedData.characters.length} 个角色数据`);
      return transformedData;

    } catch (error) {
      console.error('数据获取和转换失败:', error);
      throw error;
    }
  }

  /**
   * 保存数据到文件
   */
  async saveToFile(data, filename = 'characters.json') {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const filePath = path.join(__dirname, '..', 'assets', 'data', filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`数据已保存到: ${filePath}`);
    } catch (error) {
      console.error('保存文件失败:', error);
      throw error;
    }
  }
}

// 使用示例
async function main() {
  const fetcher = new UmaMusumeDataFetcher();
  
  try {
    const data = await fetcher.fetchAndTransformData();
    await fetcher.saveToFile(data);
    console.log('数据获取和保存完成!');
  } catch (error) {
    console.error('处理失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = UmaMusumeDataFetcher;