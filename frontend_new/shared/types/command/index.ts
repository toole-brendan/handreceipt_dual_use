/**
 * Command palette types shared between civilian and defense apps
 */

/**
 * Command type
 */
export interface Command {
  /** Unique command identifier */
  id: string;
  /** Command title */
  title: string;
  /** Command description */
  description?: string;
  /** Command icon */
  icon?: string;
  /** Command keyboard shortcut */
  shortcut?: string;
  /** Command category */
  category?: string;
  /** Required permissions to execute command */
  permissions?: string[];
  /** Command handler function */
  handler: () => void | Promise<void>;
  /** Whether command is currently disabled */
  disabled?: boolean;
  /** Whether command is currently hidden */
  hidden?: boolean;
  /** Command priority (for sorting) */
  priority?: number;
}

/**
 * Command group type
 */
export interface CommandGroup {
  /** Group identifier */
  id: string;
  /** Group title */
  title: string;
  /** Group commands */
  commands: Command[];
  /** Group priority (for sorting) */
  priority?: number;
}

/**
 * Command palette state
 */
export interface CommandPaletteState {
  /** Whether palette is open */
  isOpen: boolean;
  /** Current search query */
  searchQuery: string;
  /** Selected command index */
  selectedIndex: number;
  /** Recently used commands */
  recentCommands: Command[];
  /** Filtered commands */
  filteredCommands: Command[];
}

/**
 * Command palette options
 */
export interface CommandPaletteOptions {
  /** Maximum number of recent commands to show */
  maxRecentCommands?: number;
  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean;
  /** Whether to show command descriptions */
  showDescriptions?: boolean;
  /** Whether to show command icons */
  showIcons?: boolean;
  /** Whether to group commands by category */
  groupByCategory?: boolean;
  /** Whether to enable fuzzy search */
  fuzzySearch?: boolean;
  /** Whether to preserve search query between opens */
  preserveSearchQuery?: boolean;
  /** Whether to preserve selection between opens */
  preserveSelection?: boolean;
}
