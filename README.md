# Setback Card Game

A modern web implementation of the classic Setback card game, featuring real-time gameplay, interactive tutorials, and a polished user interface. Built with Next.js and TypeScript, this application delivers a seamless and engaging card game experience.

## 🎮 Features

### Game Mechanics
- Complete implementation of Setback rules and scoring
- Partnership system with teams of two players
- Bidding system with pass/bid options
- Trump suit selection mechanics
- Trick-taking gameplay with proper card hierarchy
- Joker card implementation as highest trump

### User Interface
- Responsive design that works on desktop and mobile devices
- Smooth card animations for dealing, playing, and collecting
- Interactive drag-and-drop card play system
- Real-time game state updates
- Professional styling with modern aesthetics
- Clear visual indicators for current player, trump suit, and game phase

### Game Management
- Save and load game functionality
- Undo/Redo system with keyboard shortcuts (⌘Z/⌘⇧Z or Ctrl+Z/Ctrl+Y)
- Player name customization
- Game state persistence
- Partnership score tracking
- Round history tracking

### Learning & Assistance
- Interactive tutorial system for new players
- Contextual help and tooltips
- Visual guides for valid moves
- Clear feedback for illegal actions
- Game rules reference

## 🛠 Technical Architecture

### Frontend Technologies
- **Next.js 15**: React framework for production-grade applications
- **TypeScript**: Static typing for enhanced code reliability
- **Tailwind CSS**: Utility-first CSS framework for modern styling
- **React Context API**: State management solution
- **React DnD**: Drag and drop functionality for card interactions

### State Management
- Custom game state reducer for predictable state updates
- Context-based state distribution
- Action-based state modifications
- History tracking for undo/redo functionality

### Game Logic
- Modular game rule implementation
- Separate concerns for:
  - Card management
  - Bidding system
  - Trick resolution
  - Score calculation
  - Partnership handling

### Performance Optimizations
- Efficient re-rendering with React.memo
- Optimized animations
- Lazy loading of game components
- Memoized computation of game state

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/setback-njs.git
```

2. Install dependencies:
```bash
cd setback-njs
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Game Rules

Setback is a trick-taking card game played with a standard 52-card deck plus one Joker. The game is played between two partnerships of two players each.

### Scoring System
Points can be earned in several ways:
- **High Trump** (1 point): Highest trump card played
- **Low Trump** (1 point): Lowest trump card played
- **Jack of Trump** (1 point): Jack of the trump suit
- **Off Jack** (1 point): Jack of the same color as trump
- **Joker** (1 point): Always highest trump
- **Game Points** (1 point): Most total points from tricks

### Bidding
- Minimum bid of 2
- Players can pass or increase the bid
- Highest bidder names trump suit
- Bidding partnership must make their bid to score

### Gameplay Flow
1. Deal 6 cards to each player
2. Bidding round
3. Trump selection
4. Play of tricks
5. Score calculation
6. Next deal

## 🤝 Contributing

We welcome contributions to improve the Setback Card Game! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your PR description clearly describes the changes and their benefits.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
