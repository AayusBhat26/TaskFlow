import { Metadata } from 'next';
import SimpleAchievements from '@/components/gaming/SimpleAchievements';

export const metadata: Metadata = {
  title: 'Gaming Dashboard - TaskFlow',
  description: 'Track your progress, unlock achievements, and compete with others in the TaskFlow gaming system.',
};

export default function GamingPage() {
  return <SimpleAchievements />;
}
