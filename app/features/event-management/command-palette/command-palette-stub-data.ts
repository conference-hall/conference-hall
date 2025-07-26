import type { CommandPaletteItemData } from './components/command-palette.tsx';

export type CommandPaletteStub = Pick<CommandPaletteItemData, 'id' | 'title' | 'description'>;

export const stubProposals: CommandPaletteStub[] = [
  {
    id: 'proposal-1',
    title: 'Building Scalable React Applications with TypeScript',
    description: 'Sarah Johnson, Mike Chen',
  },
  {
    id: 'proposal-2',
    title: 'The Future of Web Development: Beyond JavaScript',
    description: 'Alex Rodriguez',
  },
  {
    id: 'proposal-3',
    title: 'Advanced CSS: Modern Layout Techniques',
    description: 'Emma Thompson, David Lee',
  },
  {
    id: 'proposal-4',
    title: 'GraphQL vs REST: Making the Right Choice',
    description: 'Carlos Martinez',
  },
  {
    id: 'proposal-5',
    title: 'Database Performance Optimization Strategies',
    description: 'Jennifer Wilson, Tom Anderson',
  },
  {
    id: 'proposal-6',
    title: 'Introduction to Machine Learning for Web Developers',
    description: 'Priya Patel',
  },
  {
    id: 'proposal-7',
    title: 'Building Progressive Web Apps with Service Workers',
    description: "Ryan O'Connor, Lisa Zhang",
  },
  {
    id: 'proposal-8',
    title: 'Accessibility in Modern Web Applications',
    description: 'Maya Singh',
  },
  {
    id: 'proposal-9',
    title: 'Microservices Architecture: Lessons Learned',
    description: 'John Smith, Anna Kowalski',
  },
  {
    id: 'proposal-10',
    title: 'Testing Strategies for React Applications',
    description: 'Kevin Brown',
  },
];

export const stubSpeakers: CommandPaletteStub[] = [
  {
    id: 'speaker-1',
    title: 'Sarah Johnson',
    description: 'sarah.johnson@example.com',
  },
  {
    id: 'speaker-2',
    title: 'Mike Chen',
    description: 'mike.chen@example.com',
  },
  {
    id: 'speaker-3',
    title: 'Alex Rodriguez',
    description: 'alex.rodriguez@example.com',
  },
  {
    id: 'speaker-4',
    title: 'Emma Thompson',
    description: 'emma.thompson@example.com',
  },
  {
    id: 'speaker-5',
    title: 'David Lee',
    description: 'david.lee@example.com',
  },
  {
    id: 'speaker-6',
    title: 'Carlos Martinez',
    description: 'carlos.martinez@example.com',
  },
  {
    id: 'speaker-7',
    title: 'Jennifer Wilson',
    description: 'jennifer.wilson@example.com',
  },
  {
    id: 'speaker-8',
    title: 'Tom Anderson',
    description: 'tom.anderson@example.com',
  },
  {
    id: 'speaker-9',
    title: 'Priya Patel',
    description: 'priya.patel@example.com',
  },
  {
    id: 'speaker-10',
    title: "Ryan O'Connor",
    description: 'ryan.oconnor@example.com',
  },
  {
    id: 'speaker-11',
    title: 'Lisa Zhang',
    description: 'lisa.zhang@example.com',
  },
  {
    id: 'speaker-12',
    title: 'Maya Singh',
    description: 'maya.singh@example.com',
  },
  {
    id: 'speaker-13',
    title: 'John Smith',
    description: 'john.smith@example.com',
  },
  {
    id: 'speaker-14',
    title: 'Anna Kowalski',
    description: 'anna.kowalski@example.com',
  },
  {
    id: 'speaker-15',
    title: 'Kevin Brown',
    description: 'kevin.brown@example.com',
  },
];
