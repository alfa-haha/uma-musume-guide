# 🐴 Uma Musume Guide

> Your ultimate resource for Uma Musume Pretty Derby character comparison and beginner guides

[![Website](https://img.shields.io/badge/Website-umamusumeguide.co-FF69B4)](https://umamusumeguide.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## ✨ Features

### 🔍 Character Comparison Tool
- **Side-by-side comparison** of up to 4 Uma Musume characters
- **Detailed stats analysis** including Speed, Stamina, Power, Guts, and Wisdom
- **Aptitude ratings** for different track types, distances, and running styles
- **Skills overview** with unique skills and awakening abilities
- **Advanced filtering** by character type, rarity, and attributes
- **Search functionality** with both English and Japanese name support

### 📚 Comprehensive Beginner Guides
- **Complete starter guide** for new players (2025 Edition)
- **Gameplay mechanics** explained in detail
- **Daily optimization** strategies and must-do tasks
- **Training tips** and character building advice
- **Team composition** and Circle management

### 🎨 User Experience
- **Responsive design** optimized for desktop and mobile
- **Uma Musume themed** pink color palette
- **Image optimization** with WebP support and lazy loading
- **SEO optimized** with structured data and meta tags

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- Web server (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/uma-musume-guide.git
   cd uma-musume-guide
   ```

2. **Serve the files**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📁 Project Structure

```
uma-musume-guide/
├── assets/
│   ├── css/
│   │   └── style.css              # Main stylesheet with Uma Musume theme
│   ├── js/
│   │   └── main.js                # Core JavaScript functionality
│   ├── data/
│   │   └── characters.json        # Character database
│   └── images/
│       ├── characters/
│       │   ├── portraits/         # Character portrait images
│       │   └── thumbnails/        # Character thumbnail images
│       └── blog/
│           ├── covers/            # Blog post cover images
│           └── thumbnails/        # Blog post thumbnails
├── docs/
│   ├── uma_musume_beginner_guide.md
│   ├── How to Play The Uma Musume?.md
│   └── Daily Must-Do Guide for New Uma Musume Trainers.md
├── index.html                     # Main page with character comparison
├── beginner-guide.html           # Beginner guides collection page
├── blog-*.html                   # Individual blog post pages
└── README.md                     # This file
```

## 🎮 Character Data Structure

Each character in `assets/data/characters.json` contains:

```json
{
  "id": "character_id",
  "name": "Character Name",
  "nameJp": "キャラクター名",
  "version": "Original",
  "rarity": 3,
  "type": "speed",
  "stats": {
    "speed": 85,
    "stamina": 70,
    "power": 75,
    "guts": 80,
    "wisdom": 65
  },
  "bonuses": {
    "speed": 20,
    "stamina": 0,
    "power": 0,
    "guts": 10,
    "wisdom": 0
  },
  "aptitudes": {
    "turf": "A",
    "dirt": "G",
    "short": "F",
    "mile": "C",
    "medium": "A",
    "long": "A",
    "front": "G",
    "pace": "A",
    "late": "A",
    "end": "C"
  },
  "uniqueSkill": {
    "name": "Skill Name",
    "description": "Skill description"
  },
  "skills": [...],
  "image": "path/to/portrait.jpg",
  "thumbnail": "path/to/thumbnail.jpg"
}
```

## 🛠️ Development

### Adding New Characters

1. Add character data to `assets/data/characters.json`
2. Add character images to appropriate directories:
   - Portrait: `assets/images/characters/portraits/`
   - Thumbnail: `assets/images/characters/thumbnails/`
3. Follow the existing naming convention: `character_id_version_type.jpg`

### Customizing Styles

The project uses CSS custom properties for easy theming:

```css
:root {
  --primary-pink: #FF69B4;
  --light-pink: #FFB6C1;
  --soft-pink: #FFC0CB;
  /* ... more Uma Musume themed colors */
}
```

### Adding New Guides

1. Create a new Markdown file in the `docs/` directory
2. Add corresponding HTML page for web display
3. Update navigation links in `index.html` and `beginner-guide.html`

## 🌟 Contributing

We welcome contributions! Please feel free to:

- Report bugs and issues
- Suggest new features
- Add new character data
- Improve documentation
- Submit pull requests

### Guidelines

1. **Character Data**: Ensure accuracy when adding new characters
2. **Images**: Optimize images for web (WebP preferred, fallback to JPG)
3. **Code Style**: Follow existing JavaScript and CSS conventions
4. **Documentation**: Update README when adding new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This website is a fan-made project and is not affiliated with Cygames or Uma Musume Pretty Derby. All character names, images, and game-related content are the property of their respective owners.

## 🙏 Acknowledgments

- **Cygames** for creating Uma Musume Pretty Derby
- **Uma Musume community** for inspiration and feedback
- **Contributors** who help maintain and improve this project

## 📞 Contact

- **Website**: [umamusumeguide.co](https://umamusumeguide.co/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/uma-musume-guide/issues)

---

Made with ❤️ for the Uma Musume community