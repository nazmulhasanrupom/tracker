# Programming Language Tracker

A multi-user web application for tracking progress in learning different programming languages.

## Features

- 🔐 **User Authentication**: Login/register with name and passcode
- 🌍 **Multi-Language Support**: Currently supports C, C++, Rust, and Python
- 🗺️ **Interactive Map**: Visual progression through language levels
- 📊 **Progress Tracking**: Track completion of levels for each language
- 🏆 **Leaderboard**: See how you compare with other users
- ❓ **Smart Questions**: Answer questions to unlock and complete levels
- 👥 **Multi-User**: Multiple users can track their progress independently

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Styling**: Gradient design with responsive layout

## Installation

### Option 1: Using Docker (Recommended)

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. To stop the application:
```bash
docker-compose down
```

### Option 2: Using Docker (Manual)

1. Build the Docker image:
```bash
docker build -t programming-tracker .
```

2. Run the container:
```bash
docker run -d -p 3000:3000 --name tracker programming-tracker
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Option 3: Traditional Node.js

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or specify a custom port:
```bash
PORT=5000 npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

Or if using a custom port:
```
http://localhost:5000
```

## How to Use

### 1. Login/Register
- Enter your name and a passcode
- If you're a new user, you'll be automatically registered
- If you're returning, you'll be logged in with your existing progress

### 2. Select a Language
- Choose from C, C++, Rust, or Python
- See your current progress for each language

### 3. Complete Levels
- Levels are unlocked sequentially
- Click on an unlocked level to see a challenge question
- Answer the question correctly to mark the level as complete
- Progress bar shows your overall completion percentage

### 4. View Leaderboard
- See all users' progress across different languages
- Compare your completion rates with others
- Rankings are based on level completion percentage

## Language Learning Path

Each language has 8 fundamental levels covering:

### C
1. Basic Syntax
2. Control Flow
3. Functions
4. Arrays
5. Pointers
6. Structures
7. File I/O
8. Memory Management

### C++
1. Basic Syntax
2. Control Flow
3. Functions
4. Classes & Objects
5. Inheritance
6. Templates
7. STL
8. Advanced OOP

### Rust
1. Basic Syntax
2. Control Flow
3. Functions
4. Ownership
5. Borrowing
6. Structs & Enums
7. Error Handling
8. Traits

### Python
1. Basic Syntax
2. Control Flow
3. Functions
4. Lists & Tuples
5. Dictionaries
6. Classes & Objects
7. Modules
8. File Handling

## Database Structure

The application uses SQLite with the following tables:
- `users`: User credentials and information
- `languages`: Available programming languages
- `levels`: Language-specific learning levels
- `questions`: Challenge questions for each level
- `user_progress`: Tracks user completion of levels

## API Endpoints

- `POST /api/auth` - Login/register user
- `GET /api/languages` - Get all available languages
- `GET /api/languages/:langId/levels` - Get levels for a language
- `GET /api/levels/:levelId/question` - Get a random question for a level
- `POST /api/submit-answer` - Submit answer to a question
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/user/:userId/progress` - Get user's overall progress

## Docker Commands

Useful Docker commands for managing the application:

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v

# Check running containers
docker ps

# Access container shell
docker exec -it programming-tracker sh
```

## Features Explained

### Level Unlocking
- Levels unlock sequentially as you complete them
- You must complete a level before accessing the next one
- Visual indicators show locked, unlocked, and completed states

### Question System
- Each level has multiple possible questions
- Questions are randomly selected when you start a level
- Answers are case-insensitive and flexible (partial matches accepted)

### Progress Persistence
- Your progress is saved in the database
- Login with the same name and passcode to continue where you left off
- Progress is tracked separately for each language

## Customization

To add more languages or levels, modify the `seedDatabase()` function in `server.js`.

To add more questions, expand the `generateQuestionsForLevel()` function.

## Future Enhancements

- Add more programming languages
- Implement difficulty levels for questions
- Add achievements and badges
- Include code execution challenges
- Add hints for difficult questions
- Implement streak tracking
- Add social features (challenges, competitions)

## License

ISC

## Author

Created as a learning progress tracker for programming enthusiasts.
