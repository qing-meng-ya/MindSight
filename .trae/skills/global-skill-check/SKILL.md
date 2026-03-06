---
name: "global-skill-check"
description: "Mandatory global rule that checks for available skills before executing any task. Always invoke this skill first when starting any new task or operation."
---

# Global Skill Check Rule

## Purpose

This skill implements a mandatory global rule to check for available skills before executing any task. This ensures that we leverage existing specialized skills whenever possible, improving efficiency and accuracy.

## When to Use

**ALWAYS invoke this skill as the FIRST action when:**
- Starting any new task or operation
- User requests any type of work or assistance
- Before executing any command or code modification
- Before creating any new files or modifying existing ones
- Before performing any analysis or search operation

## Process

1. **Identify the Task Type**: Analyze what the user wants to accomplish
2. **Search for Relevant Skills**: Check available skills that might apply to this task type
3. **Skill Selection**: Determine if there's a skill that can handle the task better than general approaches
4. **Execution Decision**: 
   - If a relevant skill exists: Use that skill immediately
   - If no relevant skill exists: Proceed with general approach

## Skill Categories to Check

Based on available skills, check for these categories:

1. **File Operations**: 
   - PDF processing → `pdf` skill
   - Excel/spreadsheet → `xlsx` skill
   - Word documents → `docx` skill
   - PowerPoint → `pptx` skill

2. **Development Tasks**:
   - Frontend design → `frontend-design` skill
   - UI/UX design → `ui-ux-pro-max` skill
   - Theme creation → `theme-factory` skill
   - Canvas design → `canvas-design` skill

3. **API Integration**:
   - Claude API usage → `claude-api` skill
   - MCP building → `mcp-builder` skill

4. **Communication**:
   - Internal communications → `internal-comms` skill
   - Document collaboration → `doc-coauthoring` skill

5. **Testing**:
   - Web application testing → `webapp-testing` skill

6. **Creation Tasks**:
   - Creating new skills → `skill-creator` skill
   - Algorithmic art → `algorithmic-art` skill
   - Slack GIF creation → `slack-gif-creator` skill
   - Web artifacts → `web-artifacts-builder` skill

7. **Planning**:
   - File-based planning → `planning-with-files` skill

## Implementation

Before executing any task:

1. Analyze the user's request
2. Check if it matches any of the skill categories above
3. If a match is found, immediately invoke that skill
4. If no match is found, proceed with general approach

## Examples

**User Request**: "I need to extract data from this PDF file"
**Action**: Immediately invoke `pdf` skill

**User Request**: "Create a new skill for analyzing images"
**Action**: Immediately invoke `skill-creator` skill

**User Request**: "Help me design a better UI for this app"
**Action**: Immediately invoke `frontend-design` or `ui-ux-pro-max` skill

**User Request**: "What's the weather today?"
**Action**: No relevant skill found, proceed with general approach

## Priority

This skill has the highest priority and must be checked before any other operation. It serves as the gateway to all other skills and ensures optimal task execution.