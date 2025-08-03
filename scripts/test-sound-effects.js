#!/usr/bin/env node

/**
 * Test script to verify sound effects implementation
 * This script checks that all sound effect files exist and the functions are properly exported
 */

const fs = require('fs');
const path = require('path');

console.log('🔊 Testing Sound Effects Implementation\n');

// Check if sound files exist
const soundFiles = [
  'public/music/analog.mp3',
  'public/music/bell.mp3', 
  'public/music/bird.mp3',
  'public/music/churchBell.mp3',
  'public/music/digital.mp3',
  'public/music/fancy.mp3'
];

console.log('📁 Checking sound files...');
soundFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check if soundEffects.ts exists and has proper exports
const soundEffectsPath = path.join(process.cwd(), 'lib/soundEffects.ts');
console.log('\n📄 Checking sound effects library...');

if (fs.existsSync(soundEffectsPath)) {
  const content = fs.readFileSync(soundEffectsPath, 'utf-8');
  
  const expectedExports = [
    'CompletionSoundEffect',
    'pathsToCompletionSounds',
    'playCompletionSound',
    'playTaskCompletionSound',
    'playQuestionCompletionSound',
    'playSuccessSound',
    'playAchievementSound'
  ];
  
  expectedExports.forEach(exportName => {
    if (content.includes(`export ${exportName}`) || 
        content.includes(`export function ${exportName}`) || 
        content.includes(`export enum ${exportName}`) ||
        content.includes(`export const ${exportName}`)) {
      console.log(`✅ ${exportName} - Exported`);
    } else {
      console.log(`❌ ${exportName} - Missing export`);
    }
  });
} else {
  console.log('❌ lib/soundEffects.ts - File not found');
}

// Check implementation in key files
const implementationFiles = [
  { 
    file: 'hooks/useTasks.tsx',
    shouldContain: ['import(\'@/lib/soundEffects\')']
  },
  {
    file: 'components/tasks/TaskCompleteButton.tsx', 
    shouldContain: ['playTaskCompletionSound']
  },
  {
    file: 'hooks/useCompleteTask.tsx',
    shouldContain: ['playTaskCompletionSound']
  },
  {
    file: 'components/tasks/TasksModal.tsx',
    shouldContain: ['playTaskCompletionSound']
  },
  {
    file: 'app/[locale]/dsa/page.tsx',
    shouldContain: ['playQuestionCompletionSound']
  }
];

console.log('\n🔍 Checking implementation in components...');
implementationFiles.forEach(({ file, shouldContain }) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    let hasAllImplementations = true;
    
    shouldContain.forEach(item => {
      if (!content.includes(item)) {
        hasAllImplementations = false;
      }
    });
    
    if (hasAllImplementations) {
      console.log(`✅ ${file} - Sound effects implemented`);
    } else {
      console.log(`⚠️  ${file} - Some sound effects missing:`);
      shouldContain.forEach(item => {
        if (!content.includes(item)) {
          console.log(`   ❌ Missing: ${item}`);
        }
      });
    }
  } else {
    console.log(`❌ ${file} - File not found`);
  }
});

// Check if Howler.js is imported properly
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  if (packageJson.dependencies && packageJson.dependencies.howler) {
    console.log('✅ howler.js - Installed');
  } else {
    console.log('❌ howler.js - Not found in dependencies');
  }
} else {
  console.log('❌ package.json - Not found');
}

console.log('\n🎉 Sound effects implementation check complete!');
console.log('\n📋 Summary:');
console.log('- Task completion sounds: Added to useTasks hook, TaskCompleteButton, useCompleteTask hook, and TasksModal');
console.log('- DSA question completion sounds: Added to DSA page component');
console.log('- Sound utility library: Created with multiple sound effect options');
console.log('- Uses existing music files from public/music/ directory');
console.log('\n🔊 Sounds will play when:');
console.log('- Tasks are marked as completed');
console.log('- DSA questions are marked as completed');
console.log('- Different sounds for different completion types');
