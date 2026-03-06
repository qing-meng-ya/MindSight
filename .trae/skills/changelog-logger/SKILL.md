---
name: "changelog-logger"
description: "Mandatory global rule that records all modifications and processes to CHANGELOG.md. Always invoke this skill after any file modification, code change, or significant action."
---

# Changelog Logger

## Purpose

This skill implements a mandatory global rule to automatically record all modifications, changes, and processes to a CHANGELOG.md file. This ensures comprehensive tracking of all project activities for documentation and review purposes.

## When to Use

**ALWAYS invoke this skill AFTER any:**
- File creation or modification
- Code changes or refactoring
- Configuration updates
- Project structure changes
- Installation of new dependencies
- Execution of significant commands
- Completion of any task that alters the project state

## Process

1. **Identify Change Type**: Determine what type of change occurred
2. **Extract Details**: Gather relevant information about the change
3. **Format Entry**: Create a properly formatted changelog entry
4. **Update CHANGELOG.md**: Append the new entry to the changelog file

## Change Categories

### Code Changes
- Added: New files, functions, features
- Modified: Updated existing code, refactoring
- Removed: Deleted files, functions, features
- Fixed: Bug fixes, error corrections

### Project Structure
- Created: New directories, project setup
- Reorganized: File/directory restructuring
- Cleaned: Removal of unnecessary files

### Configuration
- Updated: Configuration changes
- Added: New configuration files
- Removed: Deleted configuration options

### Dependencies
- Installed: New packages, libraries
- Updated: Version changes
- Removed: Uninstalled packages

## Changelog Format

Each entry should follow this format:

```markdown
## [YYYY-MM-DD HH:MM:SS] - [Change Type]: [Brief Description]

### Files Affected
- List of files that were modified

### Details
- Detailed description of what was changed
- Reason for the change
- Impact on the project

### Commands/Actions
- Any commands that were executed
- Actions taken to implement the change
```

## Implementation

After any modification:

1. Create or update `CHANGELOG.md` in the project root
2. Add a new entry with timestamp
3. Include all relevant details
4. Maintain chronological order (newest at top)

## Example Entry

```markdown
## [2026-03-06 14:30:00] - Modified: Updated color scheme in CSS

### Files Affected
- `src/index.css`
- `src/components/Layout.js`

### Details
- Changed color scheme from purple to blue tech-inspired theme
- Updated background colors from #667eea to #035974
- Modified text colors for better contrast
- Updated hover states and interactive elements

### Commands/Actions
- Modified CSS variables for consistent theming
- Updated component styles to match new theme
- Tested color contrast for accessibility
```

## Automation Rules

This skill should be triggered automatically by:

1. Any file write operation (Write tool)
2. Any file modification (SearchReplace tool)
3. Any file deletion (DeleteFile tool)
4. Any command execution that modifies project state

## Priority

This skill has the highest priority for post-task execution. It must be invoked after any modification to ensure complete project tracking.