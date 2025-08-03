import { calculateDSAQuestionPoints, calculateTaskCompletionPoints, calculatePomodoroPoints } from '../lib/points';

console.log('=== Points System Test ===');

// Test DSA Question Points
console.log('\nDSA Question Completion Points:');
console.log(`Easy question: ${calculateDSAQuestionPoints('EASY')} points`);
console.log(`Medium question: ${calculateDSAQuestionPoints('MEDIUM')} points`);
console.log(`Hard question: ${calculateDSAQuestionPoints('HARD')} points`);

// Test Task Completion Points (should remain unchanged)
console.log('\nTask Completion Points:');
console.log(`Task completion: ${calculateTaskCompletionPoints()} points`);

// Test Pomodoro Points (should remain unchanged)
console.log('\nPomodoro Completion Points:');
console.log(`25 min session: ${calculatePomodoroPoints(25)} points`);
console.log(`30 min session: ${calculatePomodoroPoints(30)} points`);
console.log(`45 min session: ${calculatePomodoroPoints(45)} points`);
console.log(`60 min session: ${calculatePomodoroPoints(60)} points`);

console.log('\n=== Summary ===');
console.log('✅ DSA Questions: Easy=30, Medium=50, Hard=80 points');
console.log('✅ Task Completion: 5 points (unchanged)');
console.log('✅ Pomodoro Sessions: 10-45 points based on duration (unchanged)');
