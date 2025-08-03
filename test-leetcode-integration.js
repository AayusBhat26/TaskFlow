// Test script to verify the enhanced LeetCode service with real data integration
import { LeetCodeService } from './services/external/leetcode';
import { googleSheetsLeetCodeService } from './services/external/googleSheetsLeetCode';

async function testLeetCodeIntegration() {
  console.log('🧪 Testing Enhanced LeetCode Service with Real Data Integration\n');

  const leetcodeService = new LeetCodeService();
  const testUsername = 'testuser'; // Replace with a real username for testing

  try {
    console.log('1️⃣ Testing Google Sheets LeetCode Question Fetching...');
    const allQuestions = await googleSheetsLeetCodeService.getAllLeetCodeQuestions();
    console.log(`✅ Fetched ${allQuestions.length} questions from Google Sheets`);
    
    if (allQuestions.length > 0) {
      console.log('📝 Sample questions:');
      allQuestions.slice(0, 3).forEach(q => {
        console.log(`   - ${q.title} (${q.difficulty}) - Topics: ${q.topics.join(', ')}`);
      });
    }

    console.log('\n2️⃣ Testing Comprehensive User Submissions...');
    const submissions = await leetcodeService.getUserComprehensiveSubmissions(testUsername);
    console.log(`✅ Fetched ${submissions.length} submissions for ${testUsername}`);
    
    if (submissions.length > 0) {
      console.log('📊 Submission Statistics:');
      const byDifficulty = {
        Easy: submissions.filter(s => s.difficulty === 'Easy').length,
        Medium: submissions.filter(s => s.difficulty === 'Medium').length,
        Hard: submissions.filter(s => s.difficulty === 'Hard').length
      };
      console.log(`   Easy: ${byDifficulty.Easy}, Medium: ${byDifficulty.Medium}, Hard: ${byDifficulty.Hard}`);

      console.log('\n📝 Recent submissions:');
      submissions.slice(0, 5).forEach(sub => {
        console.log(`   - ${sub.title} (${sub.difficulty}) - ${sub.lang} - ${sub.topics.slice(0, 2).join(', ')}`);
      });
    }

    console.log('\n3️⃣ Testing User Stats Integration...');
    const userStats = await leetcodeService.getUserStats(testUsername);
    if (userStats) {
      console.log(`✅ User Stats for ${testUsername}:`);
      console.log(`   Total Solved: ${userStats.totalSolved}`);
      console.log(`   Easy: ${userStats.easySolved}, Medium: ${userStats.mediumSolved}, Hard: ${userStats.hardSolved}`);
      console.log(`   Acceptance Rate: ${userStats.acceptanceRate}%`);
      console.log(`   Recent Submissions: ${userStats.recentSubmissions.length}`);
    }

    console.log('\n4️⃣ Testing Topic-based Filtering...');
    const arrayQuestions = await googleSheetsLeetCodeService.getQuestionsByTopic('Array');
    console.log(`✅ Found ${arrayQuestions.length} Array questions`);

    const mediumQuestions = await googleSheetsLeetCodeService.getQuestionsByDifficulty('Medium');
    console.log(`✅ Found ${mediumQuestions.length} Medium questions`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   - Google Sheets Integration: ${allQuestions.length > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - LeetCode Query Package: ${submissions.length > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Comprehensive Data: ${userStats ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Real Submission Count: ${submissions.length} (Expected: 400+)`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Uncomment to run the test
// testLeetCodeIntegration();
