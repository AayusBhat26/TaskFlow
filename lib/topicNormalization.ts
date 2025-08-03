// Topic normalization utility
export const STANDARD_TOPICS = {
  // Arrays
  'ARRAY': 'Array',
  'ARRAYS': 'Array',
  'array': 'Array',
  'arrays': 'Array',
  'Array': 'Array',
  'Arrays': 'Array',
  
  // Binary Search
  'BINARY SEARCH': 'Binary Search',
  'BINARY_SEARCH': 'Binary Search',
  'binary search': 'Binary Search',
  'binary_search': 'Binary Search',
  'BinarySearch': 'Binary Search',
  'Binary Search': 'Binary Search',
  
  // Binary Trees
  'BINARY TREE': 'Binary Tree',
  'BINARY TREES': 'Binary Tree',
  'BINARY_TREE': 'Binary Tree',
  'BINARY_TREES': 'Binary Tree',
  'binary tree': 'Binary Tree',
  'binary trees': 'Binary Tree',
  'binary_tree': 'Binary Tree',
  'binary_trees': 'Binary Tree',
  'BinaryTree': 'Binary Tree',
  'BinaryTrees': 'Binary Tree',
  'Binary Tree': 'Binary Tree',
  'Binary Trees': 'Binary Tree',
  'Tree': 'Binary Tree',
  'TREE': 'Binary Tree',
  'Trees': 'Binary Tree',
  'TREES': 'Binary Tree',
  
  // BST (Binary Search Tree) -> Binary Tree
  'BST': 'Binary Tree',
  'bst': 'Binary Tree',
  'BINARY SEARCH TREE': 'Binary Tree',
  'binary search tree': 'Binary Tree',
  
  // Dynamic Programming
  'DP': 'Dynamic Programming',
  'dp': 'Dynamic Programming',
  'DYNAMIC PROGRAMMING': 'Dynamic Programming',
  'dynamic programming': 'Dynamic Programming',
  'Dynamic Programming': 'Dynamic Programming',
  'DynamicProgramming': 'Dynamic Programming',
  
  // Graph
  'GRAPH': 'Graph',
  'graph': 'Graph',
  'Graph': 'Graph',
  'Graphs': 'Graph',
  'GRAPHS': 'Graph',
  'graphs': 'Graph',
  
  // Hash Table
  'HASH TABLE': 'Hash Table',
  'HASH_TABLE': 'Hash Table',
  'hash table': 'Hash Table',
  'hash_table': 'Hash Table',
  'HashTable': 'Hash Table',
  'Hash Table': 'Hash Table',
  'HASHTABLE': 'Hash Table',
  'hashtable': 'Hash Table',
  'HASH MAP': 'Hash Table',
  'hash map': 'Hash Table',
  'HashMap': 'Hash Table',
  'HASHMAP': 'Hash Table',
  'hashmap': 'Hash Table',
  
  // Heap
  'HEAP': 'Heap',
  'heap': 'Heap',
  'Heap': 'Heap',
  'Heaps': 'Heap',
  'HEAPS': 'Heap',
  'heaps': 'Heap',
  'PRIORITY QUEUE': 'Heap',
  'priority queue': 'Heap',
  'PriorityQueue': 'Heap',
  
  // Linked List
  'LINKED LIST': 'Linked List',
  'LINKED_LIST': 'Linked List',
  'linked list': 'Linked List',
  'linked_list': 'Linked List',
  'LinkedList': 'Linked List',
  'Linked List': 'Linked List',
  'LINKEDLIST': 'Linked List',
  'linkedlist': 'Linked List',
  
  // Stack
  'STACK': 'Stack',
  'stack': 'Stack',
  'Stack': 'Stack',
  'Stacks': 'Stack',
  'STACKS': 'Stack',
  'stacks': 'Stack',
  
  // Stack & Queue -> Stack (we'll treat queue problems as stack for simplicity)
  'STACK & QUEUE': 'Stack',
  'STACK AND QUEUE': 'Stack',
  'stack & queue': 'Stack',
  'stack and queue': 'Stack',
  'QUEUE': 'Stack',
  'queue': 'Stack',
  'Queue': 'Stack',
  'Queues': 'Stack',
  'QUEUES': 'Stack',
  'queues': 'Stack',
  
  // String
  'STRING': 'String',
  'string': 'String',
  'String': 'String',
  'Strings': 'String',
  'STRINGS': 'String',
  'strings': 'String',
  
  // Backtracking
  'BACKTRACKING': 'Backtracking',
  'backtracking': 'Backtracking',
  'Backtracking': 'Backtracking',
  'RECURSION': 'Backtracking',
  'recursion': 'Backtracking',
  'Recursion': 'Backtracking',
  'RECURSION & BACKTRACKING': 'Backtracking',
  'recursion & backtracking': 'Backtracking',
  'RECURSION AND BACKTRACKING': 'Backtracking',
  'recursion and backtracking': 'Backtracking',
  
  // Greedy -> We'll map this to Dynamic Programming for now
  'GREEDY': 'Dynamic Programming',
  'greedy': 'Dynamic Programming',
  'Greedy': 'Dynamic Programming',
  
  // Trie -> We'll map this to String for now
  'TRIE': 'String',
  'trie': 'String',
  'Trie': 'String',
  'Tries': 'String',
  'TRIES': 'String',
  'tries': 'String',
  
  // General/Other
  'GENERAL': 'Array',
  'general': 'Array',
  'General': 'Array',
  'OTHER': 'Array',
  'other': 'Array',
  'Other': 'Array',
  'MISC': 'Array',
  'misc': 'Array',
  'Misc': 'Array',
} as const;

export function normalizeTopicName(topic: string): string {
  if (!topic || typeof topic !== 'string') {
    return 'Array'; // Default fallback
  }
  
  const cleanTopic = topic.trim();
  
  // Direct mapping
  if (STANDARD_TOPICS[cleanTopic as keyof typeof STANDARD_TOPICS]) {
    return STANDARD_TOPICS[cleanTopic as keyof typeof STANDARD_TOPICS];
  }
  
  // Fallback: try to match by converting to title case
  const titleCase = cleanTopic
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  if (STANDARD_TOPICS[titleCase as keyof typeof STANDARD_TOPICS]) {
    return STANDARD_TOPICS[titleCase as keyof typeof STANDARD_TOPICS];
  }
  
  // If no match found, return Array as default
  console.warn(`Unknown topic "${topic}" normalized to "Array"`);
  return 'Array';
}
