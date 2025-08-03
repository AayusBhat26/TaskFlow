import { Howl } from "howler";

// Sound effect types for different actions
export enum CompletionSoundEffect {
  SUCCESS = "SUCCESS",
  ACHIEVEMENT = "ACHIEVEMENT", 
  TASK_COMPLETE = "TASK_COMPLETE",
  QUESTION_COMPLETE = "QUESTION_COMPLETE"
}

// Paths to completion sound effects
export const pathsToCompletionSounds = {
  SUCCESS: "/music/bell.mp3", // Using existing bell sound for success
  ACHIEVEMENT: "/music/fancy.mp3", // Using existing fancy sound for achievements
  TASK_COMPLETE: "/music/digital.mp3", // Using existing digital sound for tasks
  QUESTION_COMPLETE: "/music/bird.mp3", // Using existing bird sound for questions
} as const;

// Default volumes for different sound types
const DEFAULT_VOLUMES = {
  SUCCESS: 0.6,
  ACHIEVEMENT: 0.7,
  TASK_COMPLETE: 0.5,
  QUESTION_COMPLETE: 0.6,
} as const;

/**
 * Play a completion sound effect
 * @param soundType - Type of completion sound to play
 * @param volume - Volume level (0-1), defaults to sound-specific level
 */
export function playCompletionSound(
  soundType: CompletionSoundEffect,
  volume?: number
): void {
  try {
    const soundPath = pathsToCompletionSounds[soundType];
    const soundVolume = volume ?? DEFAULT_VOLUMES[soundType];

    const sound = new Howl({
      src: soundPath,
      html5: true,
      volume: soundVolume,
      onloaderror: (id, error) => {
        console.warn(`Failed to load completion sound ${soundType}:`, error);
      },
      onplayerror: (id, error) => {
        console.warn(`Failed to play completion sound ${soundType}:`, error);
      }
    });

    sound.play();
  } catch (error) {
    console.warn(`Error playing completion sound ${soundType}:`, error);
  }
}

/**
 * Play task completion sound
 * @param volume - Optional volume override
 */
export function playTaskCompletionSound(volume?: number): void {
  playCompletionSound(CompletionSoundEffect.TASK_COMPLETE, volume);
}

/**
 * Play DSA question completion sound
 * @param volume - Optional volume override
 */
export function playQuestionCompletionSound(volume?: number): void {
  playCompletionSound(CompletionSoundEffect.QUESTION_COMPLETE, volume);
}

/**
 * Play general success sound
 * @param volume - Optional volume override
 */
export function playSuccessSound(volume?: number): void {
  playCompletionSound(CompletionSoundEffect.SUCCESS, volume);
}

/**
 * Play achievement sound
 * @param volume - Optional volume override
 */
export function playAchievementSound(volume?: number): void {
  playCompletionSound(CompletionSoundEffect.ACHIEVEMENT, volume);
}
