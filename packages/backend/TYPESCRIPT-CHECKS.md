# TypeScript Checking Scripts

This document explains the available scripts for checking TypeScript errors in the backend codebase.

## Available Scripts

### Basic TypeScript Checking

```bash
npm run type-check
```

This runs the TypeScript compiler with the `--noEmit` flag to check your code for type errors without generating output files. It provides standard TypeScript error messages.

### Find TypeScript Errors (with enhanced output)

```bash
npm run find-ts-errors
```

This runs a custom script that provides more readable and colorful output for TypeScript errors. It shows:

- File paths with line numbers
- Error codes with descriptions
- Additional details for each error
- A summary of total errors and warnings

### Comprehensive Code Quality Check

```bash
npm run check:all
```

This runs both TypeScript and ESLint checks in sequence, providing a comprehensive view of all code quality issues. It includes:

- TypeScript compiler errors with strict checking enabled
- ESLint errors and warnings
- A summary of issues found
- Recommendations for fixing them

### Strict TypeScript Checking

```bash
npm run check:strict
```

This performs TypeScript checking with additional strict flags enabled:

- `--strict`: Enables all strict type-checking options
- `--strictNullChecks`: Makes handling of null and undefined more explicit
- `--strictFunctionTypes`: Enables more strict checking of function types
- `--strictBindCallApply`: Ensures that the arguments for 'bind', 'call', and 'apply' match the original function
- `--strictPropertyInitialization`: Ensures non-undefined properties are initialized in the constructor
- `--noImplicitAny`: Disallows expressions and declarations with an implied 'any' type
- `--noImplicitThis`: Raises error on 'this' expressions with an implied 'any' type

### Combined Checking

```bash
npm run check
```

This runs both TypeScript type checking and ESLint in sequence.

### Complete Validation

```bash
npm run validate
```

This performs type checking, linting, and runs all tests to fully validate your codebase.

## ESLint Integration

The ESLint configuration is set up to check for TypeScript-specific issues as well. You can run:

```bash
npm run lint         # Check for linting issues
npm run lint:fix     # Automatically fix linting issues where possible
```

## How to Fix Common Issues

### 1. Implicit 'any' Types

ESLint will complain about implicit 'any' types. Fix by specifying types for parameters:

```typescript
// Before - implicit any
function process(data) {
  return data.value;
}

// After - properly typed
function process(data: DataType): ResultType {
  return data.value;
}
```

### 2. Interface Naming Convention

ESLint is configured to enforce the 'I' prefix for interfaces:

```typescript
// Before - fails ESLint naming convention rule
interface User {
  id: string;
}

// After - follows naming convention
interface IUser {
  id: string;
}
```

### 3. Strict Boolean Expressions

ESLint enforces strict boolean expressions to prevent bugs:

```typescript
// Before - fails strict boolean check
if (someValue) {
  // code
}

// After - explicit check
if (someValue !== undefined && someValue !== null) {
  // code
}
// Or for strings
if (someString !== "" && someString !== null && someString !== undefined) {
  // code
}
```

### 4. Express Route Handlers with Promises

For Express route handlers that return promises, we've configured ESLint to ignore the `no-misused-promises` rule for arguments. This allows async route handlers:

```typescript
// This is now allowed with our ESLint configuration
router.get(
  "/",
  async (req, res: TypedResponse<IHabit[]>, next: NextFunction) => {
    try {
      const habits = await habitService.getAll();
      res.success(habits, "Habits retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
);
```

### 5. Function Return Types

Always specify return types for functions to keep the codebase well-typed:

```typescript
// Before - missing return type
function getUser(id: string) {
  return fetchUser(id);
}

// After - with return type
function getUser(id: string): Promise<IUser> {
  return fetchUser(id);
}
```

## Making TypeScript Work for You

1. **Don't use `any`**: The linter is configured to error on explicit `any` types.
2. **Use strict null checks**: Be explicit about when values might be null or undefined.
3. **Add type declarations**: For better IntelliSense and to catch errors early.
4. **Run checks regularly**: Run the validation scripts regularly during development.
5. **Follow naming conventions**: Interfaces should use the 'I' prefix.
6. **Use type guards**: Create type guards for safer type casting.
