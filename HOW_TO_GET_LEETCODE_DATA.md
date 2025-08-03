# How to Get Your LeetCode Submission Data

## 🎯 Quick Options (Easiest to Hardest)

### 1. **Browser Extension Method** (Recommended - Easiest)
Use existing browser extensions that can export your LeetCode data:

- **LeetCode Timer** - Chrome extension that tracks and exports submissions
- **LeetHub** - Automatically syncs your solutions to GitHub and can export data
- **LeetCode Enhancer** - Various data export features

### 2. **Manual Browser Console Method** (Medium)
Run JavaScript in your browser console to extract data:

```javascript
// Go to your LeetCode profile submissions page
// Open browser console (F12) and run this:

async function exportLeetCodeData() {
    const submissions = [];
    
    // Get all submission rows from the page
    const rows = document.querySelectorAll('[data-row-key]');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            submissions.push({
                title: cells[1]?.textContent?.trim(),
                status: cells[2]?.textContent?.trim(),
                runtime: cells[3]?.textContent?.trim(),
                timestamp: new Date().toISOString(), // You'll need to extract actual date
                difficulty: "Medium", // Extract from problem page
                lang: "python3" // Extract from submission details
            });
        }
    });
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(submissions, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leetcode_submissions.json';
    a.click();
}

exportLeetCodeData();
```

### 3. **Third-Party Tools**
Use existing tools that can extract your data:

- **LeetCode Stats API** - Some unofficial APIs
- **Web scrapers** - Tools like Scrapy or BeautifulSoup
- **LeetCode GraphQL** - Direct API calls (requires authentication)

### 4. **Export from LeetCode Premium** 
If you have LeetCode Premium, you may have access to better analytics and export features.

## 🔧 I'll Create Tools for You

Let me build some helper tools to make this easier:

### Option A: JavaScript Bookmarklet
A simple bookmarklet you can save in your browser and click to extract data.

### Option B: Python Script
A Python script that can scrape your submissions (you'll need to provide login).

### Option C: Manual CSV Template
A template you can fill out manually with your key submissions.

Which method would you prefer to start with?

## 📊 What Data Format We Need

The upload system expects data with these fields:

**Required:**
- `title` - Problem name (e.g., "Two Sum")
- `status` - Submission result (e.g., "Accepted")
- `difficulty` - Problem difficulty ("Easy", "Medium", "Hard")

**Optional but helpful:**
- `questionId` - LeetCode problem number
- `lang` - Programming language used
- `timestamp` - When you solved it
- `topics` - Problem categories/tags
- `runtime` - Execution time
- `memory` - Memory usage

## 🚀 Next Steps

1. Choose your preferred extraction method
2. I'll provide the specific tool/script
3. Run it to get your data file
4. Upload to the dashboard
5. See your real statistics!

Which approach sounds best for you?
