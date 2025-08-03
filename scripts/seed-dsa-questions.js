import { db } from '../lib/db';

const dsaQuestions = [
  // Array Questions
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    topic: "Array",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    platform: "LeetCode",
    tags: ["Hash Table", "Array"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Facebook"],
    frequency: 10,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    approach: "Use hash map to store complement values"
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find maximum profit.",
    topic: "Array",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    platform: "LeetCode",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Apple", "Bloomberg"],
    frequency: 9,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Keep track of minimum price and maximum profit"
  },
  {
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array.",
    topic: "Array",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    platform: "LeetCode",
    tags: ["Array", "Hash Table", "Sorting"],
    companies: ["Amazon", "Microsoft", "Apple"],
    frequency: 8,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    approach: "Use hash set to track seen elements"
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.",
    topic: "Array",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
    platform: "LeetCode",
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    companies: ["Amazon", "Microsoft", "LinkedIn", "Apple"],
    frequency: 9,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Kadane's Algorithm"
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    topic: "Array",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    platform: "LeetCode",
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    frequency: 8,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    approach: "Sort array and use two pointers"
  },

  // Linked List Questions
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    topic: "Linked List",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    platform: "LeetCode",
    tags: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "Facebook", "Google"],
    frequency: 9,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Iterative pointer manipulation"
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    topic: "Linked List",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    platform: "LeetCode",
    tags: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "Adobe"],
    frequency: 8,
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(1)",
    approach: "Two pointers comparison"
  },
  {
    title: "Linked List Cycle",
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
    topic: "Linked List",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
    platform: "LeetCode",
    tags: ["Hash Table", "Linked List", "Two Pointers"],
    companies: ["Amazon", "Microsoft", "Bloomberg", "Apple"],
    frequency: 7,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Floyd's Cycle Detection (Tortoise and Hare)"
  },

  // String Questions
  {
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    topic: "String",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    platform: "LeetCode",
    tags: ["Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    frequency: 7,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Character frequency comparison"
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    topic: "String",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    platform: "LeetCode",
    tags: ["String", "Stack"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple", "Google"],
    frequency: 9,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    approach: "Use stack to track opening brackets"
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    topic: "String",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    platform: "LeetCode",
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Microsoft", "Facebook", "Adobe", "Bloomberg"],
    frequency: 9,
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(m,n))",
    approach: "Sliding window with hash set"
  },

  // Tree Questions
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given the root of a binary tree, return its maximum depth.",
    topic: "Tree",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    platform: "LeetCode",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "LinkedIn", "Apple"],
    frequency: 8,
    timeComplexity: "O(n)",
    spaceComplexity: "O(log n)",
    approach: "Recursive DFS or iterative BFS"
  },
  {
    title: "Validate Binary Search Tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    topic: "Tree",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    platform: "LeetCode",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple", "Bloomberg"],
    frequency: 8,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    approach: "Inorder traversal or recursive validation with bounds"
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    topic: "Tree",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    platform: "LeetCode",
    tags: ["Stack", "Tree", "Depth-First Search", "Binary Tree"],
    companies: ["Microsoft", "Amazon", "Apple"],
    frequency: 7,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    approach: "Recursive or iterative with stack"
  },

  // Dynamic Programming
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    topic: "Dynamic Programming",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    platform: "LeetCode",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    companies: ["Amazon", "Microsoft", "Adobe", "Apple"],
    frequency: 8,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Fibonacci sequence pattern"
  },
  {
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected.",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/house-robber/",
    platform: "LeetCode",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "LinkedIn"],
    frequency: 7,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "DP with optimal substructure"
  },

  // Graph Questions
  {
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    topic: "Graph",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
    platform: "LeetCode",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    companies: ["Amazon", "Microsoft", "Facebook", "Google", "Apple"],
    frequency: 9,
    timeComplexity: "O(m × n)",
    spaceComplexity: "O(m × n)",
    approach: "DFS or BFS to mark connected components"
  },
  {
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.",
    topic: "Graph",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
    platform: "LeetCode",
    tags: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"],
    companies: ["Amazon", "Microsoft", "Facebook", "Google"],
    frequency: 7,
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(n)",
    approach: "DFS/BFS with hash map for node mapping"
  },

  // Two Pointers
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    topic: "Two Pointers",
    difficulty: "EASY",
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
    platform: "LeetCode",
    tags: ["Two Pointers", "String"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
    frequency: 7,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Two pointers from both ends"
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
    topic: "Two Pointers",
    difficulty: "MEDIUM",
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    platform: "LeetCode",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Microsoft", "Facebook", "Apple", "Bloomberg"],
    frequency: 8,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    approach: "Two pointers with greedy optimization"
  }
];

async function seedDSAQuestions() {
  try {
    console.log('Starting to seed DSA questions...');
    
    for (const questionData of dsaQuestions) {
      // Check if question already exists
      const existing = await db.dSAQuestion.findFirst({
        where: {
          title: questionData.title,
          topic: questionData.topic
        }
      });

      if (!existing) {
        await db.dSAQuestion.create({
          data: questionData
        });
        console.log(`✅ Created: ${questionData.title}`);
      } else {
        console.log(`⏭️ Skipped (exists): ${questionData.title}`);
      }
    }

    console.log(`🎉 Successfully seeded ${dsaQuestions.length} DSA questions!`);
  } catch (error) {
    console.error('❌ Error seeding DSA questions:', error);
  } finally {
    await db.$disconnect();
  }
}

seedDSAQuestions();
