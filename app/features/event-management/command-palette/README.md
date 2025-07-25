# Command Palette Component

A comprehensive command palette implementation for Conference Hall's event management system, built with HeadlessUI for accessibility and React Router v7.

## Overview

The Command Palette provides a unified search interface for proposals and speakers, with creation capabilities and keyboard navigation. It follows modern UX patterns similar to VS Code's command palette or GitHub's search.

## Architecture

### Core Components

#### `CommandPalette` (Main Component)
- **Location**: `command-palette.tsx`
- **Purpose**: Main orchestrator component managing state, search, and user interactions
- **Key Features**:
  - Debounced search (300ms) with async support
  - Internal suggestion management
  - Loading state handling
  - Keyboard shortcut support (Cmd/Ctrl+K for closing)
  - Grouped results display (Proposals, Speakers, Actions)

#### `CommandPaletteDemo` 
- **Location**: `command-palette-demo.tsx`
- **Purpose**: Demo page showcasing component usage and configurations
- **Features**:
  - Simple configuration example
  - Keyboard shortcut handling for opening (Cmd+K)
  - Async search simulation with 500ms delay

#### Utility Functions
- **Location**: `command-palette-utils.ts`
- **Purpose**: Search and filtering logic
- **Function**: `generateSuggestions()` - filters proposals/speakers and generates creation actions

#### Test Data
- **Location**: `command-palette-stub-data.ts`
- **Purpose**: Mock data for development and testing

### Component Structure

```
CommandPalette
├── CommandPaletteHeader (search input + loading state)
├── CommandPaletteSection (grouped results)
│   ├── ProposalItem
│   ├── SpeakerItem
│   └── ActionItem
└── EmptyState (no results or welcome state)
```

## API Design

### Props Interface
```typescript
type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, config: CommandPaletteSearchConfig) => Promise<CommandPaletteItem[]> | CommandPaletteItem[];
  onClick?: (item: CommandPaletteItem, query: string) => void;
  searchConfig?: CommandPaletteSearchConfig;
  className?: string;
};
```

### Configuration
```typescript
type CommandPaletteSearchConfig = {
  enableProposalCreation?: boolean;
  enableSpeakerCreation?: boolean;
  maxResults?: number;
  placeholder?: string;
};
```

### Data Types
```typescript
type CommandPaletteItem = {
  type: 'proposal' | 'speaker' | 'action';
  data: CommandPaletteProposal | CommandPaletteSpeaker | CommandPaletteAction;
  priority?: number;
};
```

## Key Features Implemented

### 1. Search & Filtering
- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Async Support**: Handles Promise-based search functions
- **Multi-field Search**: Searches across titles, names, emails, companies
- **No Results on Empty Query**: Only shows suggestions when user types

### 2. User Experience
- **Loading States**: 
  - LoadingIcon in header during search
  - Gradient border animation (removed to prevent flicker)
  - No suggestions hidden during loading
- **Keyboard Navigation**: HeadlessUI handles arrow keys, Enter, Escape
- **Global Shortcuts**: Cmd/Ctrl+K for opening/closing
- **Grouped Results**: Organized by type (Proposals, Speakers, Actions)

### 3. Visual Design
- **CVA Styling**: Component variants for theming
- **Focus States**: Enhanced focus indicators with subtle animations
- **Avatar Integration**: Speaker items show avatars using design system component
- **Status Indicators**: Proposal status badges (removed in latest version for simplification)
- **Empty States**: Helpful welcome screen and no-results state

### 4. Accessibility
- **HeadlessUI Foundation**: Built-in keyboard navigation and ARIA attributes
- **Screen Reader Support**: Proper labeling and role attributes
- **Focus Management**: Auto-focus on input when opened
- **Semantic HTML**: Proper use of dialog, combobox patterns

## Technical Decisions

### State Management
- **Internal State**: Component manages its own suggestions internally
- **Controlled Pattern**: Parent controls open/close state
- **Reset on Open**: Query and suggestions cleared when modal opens

### Performance Optimizations
- **Debounced Search**: Prevents excessive API calls during typing
- **Memoized Grouping**: Results grouped using useMemo
- **Efficient Filtering**: Early returns and slice for result limits

### API Evolution
The component API has been simplified through several iterations:

1. **Initial**: External suggestion management with complex config objects
2. **Enhanced**: Internal suggestion management with async search
3. **Flattened**: Moved callbacks from config to direct props
4. **Simplified**: Removed unnecessary onOpen/onOpenChange props

## Current Configuration

### Search Config (Simplified)
- Removed proposal/speaker search toggles (always enabled)
- Kept creation toggles and maxResults
- Simplified to essential configuration only

### Demo Setup
- **maxResults**: 3 (reduced from 5)
- **Creation Actions**: Both proposal and speaker creation enabled
- **Async Search**: 500ms simulated delay
- **Simple Handlers**: Direct alerts for demonstration

## Design System Integration

### Components Used
- `Avatar`: For speaker profile pictures
- `LoadingIcon`: Consistent loading indicator
- `Kbd`: Keyboard shortcut display
- `Text`: Typography system integration

### Styling Approach
- **Tailwind CSS**: Utility-first styling
- **CVA Variants**: Component theming system
- **Design Tokens**: Consistent spacing, colors, typography

## Future Improvement Areas

### 1. Enhanced Search
- Fuzzy search capabilities
- Search highlighting in results
- Advanced filtering options
- Search history/recents

### 2. Performance
- Virtual scrolling for large result sets
- Result caching strategies
- Optimistic updates

### 3. User Experience
- Recent items suggestion
- Keyboard shortcut customization
- Multi-select capabilities
- Bulk actions

### 4. Integration
- Deep linking to search results
- Analytics and tracking
- A11y improvements
- Mobile responsiveness enhancements

### 5. Extensibility
- Plugin system for custom item types
- Theming system enhancements
- Custom action providers
- Advanced configuration options

## Dependencies

- `@headlessui/react`: Accessibility and behavior
- `@heroicons/react`: Icon system
- `class-variance-authority`: Component variants
- `use-debounce`: Search debouncing
- Conference Hall design system components

## Testing Strategy

- Unit tests for search logic and filtering
- Integration tests for user interactions
- E2E tests for keyboard navigation
- Accessibility testing with screen readers