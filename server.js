const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new sqlite3.Database('./tracker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        passcode TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, passcode)
      )
    `);

    // Languages table
    db.run(`
      CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);

    // Levels table
    db.run(`
      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_id INTEGER,
        level_number INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (language_id) REFERENCES languages(id)
      )
    `);

    // Questions table
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        FOREIGN KEY (level_id) REFERENCES levels(id)
      )
    `);

    // User progress table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        language_id INTEGER,
        level_id INTEGER,
        completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (language_id) REFERENCES languages(id),
        FOREIGN KEY (level_id) REFERENCES levels(id),
        UNIQUE(user_id, level_id)
      )
    `);

    // Insert languages and levels
    seedDatabase();
  });
}

function seedDatabase() {
  // Check if languages already exist
  db.get('SELECT COUNT(*) as count FROM languages', (err, row) => {
    if (err || row.count > 0) return;

    const languages = [
      {
        name: 'C',
        levels: [
          { title: 'Basic Syntax', description: 'Variables, data types, operators' },
          { title: 'Control Flow', description: 'If statements, loops' },
          { title: 'Functions', description: 'Function declaration and usage' },
          { title: 'Arrays', description: 'Array operations' },
          { title: 'Pointers', description: 'Understanding pointers' },
          { title: 'Structures', description: 'Structs and unions' },
          { title: 'File I/O', description: 'File handling' },
          { title: 'Memory Management', description: 'malloc, free' }
        ]
      },
      {
        name: 'C++',
        levels: [
          { title: 'Basic Syntax', description: 'Variables, data types, operators' },
          { title: 'Control Flow', description: 'If statements, loops' },
          { title: 'Functions', description: 'Function declaration and usage' },
          { title: 'Classes & Objects', description: 'OOP basics' },
          { title: 'Inheritance', description: 'Inheritance and polymorphism' },
          { title: 'Templates', description: 'Template programming' },
          { title: 'STL', description: 'Standard Template Library' },
          { title: 'Advanced OOP', description: 'Virtual functions, abstraction' }
        ]
      },
      {
        name: 'Rust',
        levels: [
          { title: 'Basic Syntax', description: 'Variables, data types, operators' },
          { title: 'Control Flow', description: 'If statements, loops, match' },
          { title: 'Functions', description: 'Function declaration and usage' },
          { title: 'Ownership', description: 'Understanding ownership' },
          { title: 'Borrowing', description: 'References and borrowing' },
          { title: 'Structs & Enums', description: 'Data structures' },
          { title: 'Error Handling', description: 'Result and Option types' },
          { title: 'Traits', description: 'Trait system' }
        ]
      },
      {
        name: 'Python',
        levels: [
          { title: 'Basic Syntax', description: 'Variables, data types, operators' },
          { title: 'Control Flow', description: 'If statements, loops' },
          { title: 'Functions', description: 'Function declaration and usage' },
          { title: 'Lists & Tuples', description: 'Data structures' },
          { title: 'Dictionaries', description: 'Key-value pairs' },
          { title: 'Classes & Objects', description: 'OOP basics' },
          { title: 'Modules', description: 'Importing and using modules' },
          { title: 'File Handling', description: 'Reading and writing files' }
        ]
      }
    ];

    languages.forEach(lang => {
      db.run('INSERT INTO languages (name) VALUES (?)', [lang.name], function(err) {
        if (err) return;
        const langId = this.lastID;

        lang.levels.forEach((level, index) => {
          db.run(
            'INSERT INTO levels (language_id, level_number, title, description) VALUES (?, ?, ?, ?)',
            [langId, index + 1, level.title, level.description],
            function(err) {
              if (err) return;
              const levelId = this.lastID;
              
              // Add sample questions for each level
              const questions = generateQuestionsForLevel(lang.name, level.title);
              questions.forEach(q => {
                db.run(
                  'INSERT INTO questions (level_id, question, answer) VALUES (?, ?, ?)',
                  [levelId, q.question, q.answer]
                );
              });
            }
          );
        });
      });
    });
  });
}

function generateQuestionsForLevel(language, levelTitle) {
  const questions = {
    'Basic Syntax': [
      { question: 'What keyword is used to declare a variable in ' + language + '?', answer: getBasicSyntaxAnswer(language) },
      { question: 'What is the default value of an uninitialized variable?', answer: 'undefined or garbage' },
      { question: 'Which operator is used for assignment?', answer: '=' }
    ],
    'Control Flow': [
      { question: 'What keyword starts a conditional statement?', answer: 'if' },
      { question: 'What loop executes at least once?', answer: language === 'Rust' ? 'loop' : 'do-while' },
      { question: 'What keyword exits a loop prematurely?', answer: 'break' }
    ],
    'Functions': [
      { question: 'What keyword defines a function?', answer: getFunctionKeyword(language) },
      { question: 'Can functions return multiple values directly?', answer: language === 'Python' ? 'yes' : 'no' },
      { question: 'What is function overloading?', answer: 'multiple functions same name' }
    ],
    'Arrays': [
      { question: 'How do you access the first element of an array?', answer: 'arr[0]' },
      { question: 'Are array indices 0-based or 1-based?', answer: '0' },
      { question: 'What is array bounds checking?', answer: 'checking valid index' }
    ],
    'Pointers': [
      { question: 'What operator gets the address of a variable?', answer: '&' },
      { question: 'What operator dereferences a pointer?', answer: '*' },
      { question: 'What is a null pointer?', answer: 'pointer to nothing' }
    ],
    'Structures': [
      { question: 'What keyword defines a structure in C?', answer: 'struct' },
      { question: 'How do you access struct members?', answer: '.' },
      { question: 'Can structs contain functions in C?', answer: 'no' }
    ],
    'File I/O': [
      { question: 'What mode opens a file for writing?', answer: 'w' },
      { question: 'What function closes a file?', answer: 'fclose' },
      { question: 'What does EOF stand for?', answer: 'end of file' }
    ],
    'Memory Management': [
      { question: 'What function allocates memory?', answer: 'malloc' },
      { question: 'What function frees memory?', answer: 'free' },
      { question: 'What happens if you forget to free memory?', answer: 'memory leak' }
    ],
    'Classes & Objects': [
      { question: 'What is encapsulation?', answer: 'data hiding' },
      { question: 'What is an instance of a class called?', answer: 'object' },
      { question: 'What method initializes an object?', answer: 'constructor' }
    ],
    'Inheritance': [
      { question: 'What is inheritance?', answer: 'deriving from parent' },
      { question: 'Can a class have multiple parents in C++?', answer: 'yes' },
      { question: 'What is polymorphism?', answer: 'many forms' }
    ],
    'Templates': [
      { question: 'What are templates used for?', answer: 'generic programming' },
      { question: 'What keyword defines a template?', answer: 'template' },
      { question: 'Can templates work with any type?', answer: 'yes' }
    ],
    'STL': [
      { question: 'What does STL stand for?', answer: 'standard template library' },
      { question: 'Name a common STL container', answer: 'vector' },
      { question: 'What is an iterator?', answer: 'pointer to container' }
    ],
    'Advanced OOP': [
      { question: 'What is a virtual function?', answer: 'overridable function' },
      { question: 'What is an abstract class?', answer: 'class with pure virtual' },
      { question: 'What is a pure virtual function?', answer: 'virtual function = 0' }
    ],
    'Ownership': [
      { question: 'What is the ownership rule in Rust?', answer: 'one owner' },
      { question: 'What happens when owner goes out of scope?', answer: 'memory freed' },
      { question: 'Can you transfer ownership?', answer: 'yes' }
    ],
    'Borrowing': [
      { question: 'What symbol creates a reference?', answer: '&' },
      { question: 'Can you have multiple immutable references?', answer: 'yes' },
      { question: 'Can you have multiple mutable references?', answer: 'no' }
    ],
    'Structs & Enums': [
      { question: 'What keyword defines a struct?', answer: 'struct' },
      { question: 'What keyword defines an enum?', answer: 'enum' },
      { question: 'Can enums have data?', answer: 'yes' }
    ],
    'Error Handling': [
      { question: 'What type represents potential errors?', answer: 'result' },
      { question: 'What type represents optional values?', answer: 'option' },
      { question: 'What operator propagates errors?', answer: '?' }
    ],
    'Traits': [
      { question: 'What are traits?', answer: 'shared behavior' },
      { question: 'What keyword defines a trait?', answer: 'trait' },
      { question: 'What keyword implements a trait?', answer: 'impl' }
    ],
    'Lists & Tuples': [
      { question: 'Are Python lists mutable?', answer: 'yes' },
      { question: 'Are Python tuples mutable?', answer: 'no' },
      { question: 'What method adds to a list?', answer: 'append' }
    ],
    'Dictionaries': [
      { question: 'What are dictionary keys?', answer: 'unique identifiers' },
      { question: 'Can keys be mutable?', answer: 'no' },
      { question: 'What method gets all keys?', answer: 'keys' }
    ],
    'Modules': [
      { question: 'What keyword imports a module?', answer: 'import' },
      { question: 'What is __init__.py?', answer: 'package marker' },
      { question: 'What is pip?', answer: 'package installer' }
    ],
    'File Handling': [
      { question: 'What mode opens a file for reading?', answer: 'r' },
      { question: 'What keyword ensures file closure?', answer: 'with' },
      { question: 'What method reads all lines?', answer: 'readlines' }
    ]
  };

  return questions[levelTitle] || [
    { question: 'What is ' + levelTitle + '?', answer: 'basic concept' },
    { question: 'Why is ' + levelTitle + ' important?', answer: 'fundamental skill' },
    { question: 'How do you use ' + levelTitle + '?', answer: 'practice' }
  ];
}

function getBasicSyntaxAnswer(language) {
  const answers = {
    'C': 'int, char, float',
    'C++': 'int, char, auto',
    'Rust': 'let',
    'Python': 'no keyword needed'
  };
  return answers[language] || 'varies';
}

function getFunctionKeyword(language) {
  const keywords = {
    'C': 'type name',
    'C++': 'type name',
    'Rust': 'fn',
    'Python': 'def'
  };
  return keywords[language] || 'function';
}

// API Routes

// Register or login
app.post('/api/auth', (req, res) => {
  const { name, passcode } = req.body;

  if (!name || !passcode) {
    return res.status(400).json({ error: 'Name and passcode required' });
  }

  // Try to find existing user
  db.get('SELECT * FROM users WHERE name = ? AND passcode = ?', [name, passcode], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (user) {
      return res.json({ userId: user.id, name: user.name });
    }

    // Create new user
    db.run('INSERT INTO users (name, passcode) VALUES (?, ?)', [name, passcode], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Could not create user' });
      }
      res.json({ userId: this.lastID, name });
    });
  });
});

// Get all languages
app.get('/api/languages', (req, res) => {
  db.all('SELECT * FROM languages', (err, languages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(languages);
  });
});

// Get levels for a language
app.get('/api/languages/:langId/levels', (req, res) => {
  const { langId } = req.params;
  const { userId } = req.query;

  const query = `
    SELECT 
      l.id, 
      l.level_number, 
      l.title, 
      l.description,
      COALESCE(up.completed, 0) as completed
    FROM levels l
    LEFT JOIN user_progress up ON l.id = up.level_id AND up.user_id = ?
    WHERE l.language_id = ?
    ORDER BY l.level_number
  `;

  db.all(query, [userId, langId], (err, levels) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(levels);
  });
});

// Get question for a level
app.get('/api/levels/:levelId/question', (req, res) => {
  const { levelId } = req.params;

  db.get('SELECT id, question FROM questions WHERE level_id = ? ORDER BY RANDOM() LIMIT 1', [levelId], (err, question) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(question || {});
  });
});

// Submit answer
app.post('/api/submit-answer', (req, res) => {
  const { userId, levelId, questionId, answer } = req.body;

  db.get('SELECT answer FROM questions WHERE id = ?', [questionId], (err, question) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = answer.toLowerCase().trim().includes(question.answer.toLowerCase().trim()) ||
                     question.answer.toLowerCase().trim().includes(answer.toLowerCase().trim());

    if (isCorrect) {
      // Get language_id for this level
      db.get('SELECT language_id FROM levels WHERE id = ?', [levelId], (err, level) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Mark level as completed
        db.run(
          `INSERT INTO user_progress (user_id, language_id, level_id, completed, completed_at)
           VALUES (?, ?, ?, 1, datetime('now'))
           ON CONFLICT(user_id, level_id) 
           DO UPDATE SET completed = 1, completed_at = datetime('now')`,
          [userId, level.language_id, levelId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Could not update progress' });
            }
            res.json({ correct: true, message: 'Level completed!' });
          }
        );
      });
    } else {
      res.json({ correct: false, message: 'Incorrect answer. Try again!' });
    }
  });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const query = `
    SELECT 
      u.name,
      l.name as language,
      COUNT(CASE WHEN up.completed = 1 THEN 1 END) as completed_levels,
      COUNT(lv.id) as total_levels
    FROM users u
    LEFT JOIN user_progress up ON u.id = up.user_id
    LEFT JOIN languages l ON up.language_id = l.id
    LEFT JOIN levels lv ON up.language_id = lv.language_id
    GROUP BY u.id, l.id
    ORDER BY completed_levels DESC, u.name
  `;

  db.all(query, (err, leaderboard) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(leaderboard);
  });
});

// Get user's overall progress
app.get('/api/user/:userId/progress', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      l.name as language,
      COUNT(CASE WHEN up.completed = 1 THEN 1 END) as completed,
      (SELECT COUNT(*) FROM levels WHERE language_id = l.id) as total
    FROM languages l
    LEFT JOIN user_progress up ON l.id = up.language_id AND up.user_id = ?
    GROUP BY l.id
  `;

  db.all(query, [userId], (err, progress) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(progress);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
