```markdown
# ae-cli Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development conventions and workflows for the `ae-cli` TypeScript codebase. It covers file organization, code style, commit patterns, and testing approaches, providing clear examples and step-by-step guides for common developer tasks. This is ideal for contributors looking to quickly align with the project's standards.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `myCommand.ts`, `userInputHandler.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { parseArgs } from './utils/parseArgs';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In utils/parseArgs.ts
    export function parseArgs(args: string[]): Args { ... }
    ```

### Commit Patterns
- Follow **conventional commits** with a `chore` prefix for maintenance and tooling changes.
  - Example:
    ```
    chore: update dependencies to latest versions
    ```

## Workflows

### Code Contribution
**Trigger:** When adding or updating features or fixing bugs  
**Command:** `/contribute`

1. Create a new branch for your changes.
2. Follow camelCase naming for new files.
3. Use relative imports and named exports.
4. Write or update tests in `*.test.*` files.
5. Commit changes using the conventional commit format (e.g., `chore: ...`).
6. Open a pull request for review.

### Dependency Update
**Trigger:** When dependencies need to be updated  
**Command:** `/update-deps`

1. Run the package manager to update dependencies.
2. Test the project to ensure compatibility.
3. Commit with a message like `chore: update dependencies`.
4. Push changes and open a pull request.

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `parseArgs.test.ts`).
- The specific testing framework is not specified; follow the existing test file patterns.
- Place tests alongside the modules they test or in a dedicated test directory as per project structure.

**Example:**
```typescript
// parseArgs.test.ts
import { parseArgs } from './parseArgs';

test('parses arguments correctly', () => {
  expect(parseArgs(['--help'])).toEqual({ help: true });
});
```

## Commands
| Command         | Purpose                                   |
|-----------------|-------------------------------------------|
| /contribute     | Guide for contributing code changes        |
| /update-deps    | Steps to update project dependencies      |
```
