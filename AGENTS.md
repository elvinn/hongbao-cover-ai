# AGENTS.md

This document provides guidelines for agents working on this codebase.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase (@supabase/ssr)
- **Testing**: Vitest + React Testing Library + MSW
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier

## Build, Lint, and Test Commands

### Development

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm analyze       # Build with bundle analysis
```

### Linting and Formatting

```bash
pnpm lint          # Run ESLint
pnpm lint-fix      # Run ESLint with auto-fix
pnpm format        # Format code with Prettier
pnpm format-check  # Check formatting without modifying
```

### Type Checking

```bash
pnpm type-check    # Run TypeScript type checking
```

### Testing

```bash
pnpm test              # Run all tests with watch mode
pnpm test:ci           # Run tests once (CI mode)
pnpm test:ui           # Run tests with Vitest UI
pnpm vitest run <file> # Run a single test file
```

## Code Style Guidelines

### General

- Use TypeScript for all code
- Use Prettier for formatting (configured in `.prettierrc.yaml`)
- Follow ESLint rules from `eslint.config.mjs` (extends `eslint-config-next`)

### Formatting (Prettier)

```yaml
trailingComma: all
tabWidth: 2
semi: false
singleQuote: true
printWidth: 80
```

### Imports

- Use the `@/` alias for imports:
  - `@/components/*` for React components
  - `@/utils/*` for utility functions
  - `@/hooks/*` for custom hooks
  - `@/supabase/*` for Supabase client/server utilities
- Group imports in this order: React, third-party, @/ aliases, relative imports

### Components

- Use `'use client'` directive at the top of client components
- Use named exports for components: `export function ComponentName`
- Use `React.forwardRef` for components that need refs
- Props should extend native HTML attributes when applicable

### Styling

- Use Tailwind CSS for all styling
- Use `cn()` utility from `@/utils/tailwind` for class merging
- shadcn/ui components use `@radix-ui/react-*` primitives
- Use `class-variance-authority` (CVA) for component variants

### Error Handling

- Use try/catch for async operations
- Type narrow errors properly: `error instanceof Error ? error.message : 'Fallback message'`
- Set error state in React components for user feedback

### Naming Conventions

- PascalCase for components: `LoginForm`, `AuthButton`
- camelCase for variables and functions: `handleLogin`, `isLoading`
- SCREAMING_SNAKE_CASE for constants if needed
- Use descriptive, full names (avoid abbreviations except common ones like `id`, `url`)

### Types

- Avoid `any` type; use proper TypeScript types
- Use `React.ComponentPropsWithoutRef<'element-type>` for component prop types
- Use `React.FormEvent` for form events, `React.ChangeEvent` for input changes

### UI Components Pattern

```typescript
// Example component structure
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### React Query

- Wrap app with `ReactQueryProvider` from `@/providers/ReactQueryProvider`
- Use `useQuery` and `useMutation` from `@tanstack/react-query`
- Access React Query devtools via `@tanstack/react-query-devtools`

### Supabase

- Use `@supabase/ssr` for server-side auth
- Create clients with `createBrowserClient` (client) or `createServerClient` (server)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Testing

- Use Vitest with React Testing Library and MSW (Mock Service Worker)
- Test files co-located with components: `ComponentName.test.tsx`
- Use `@testing-library/react` and `@testing-library/user-event`
- MSW handlers in `src/mocks/handlers.ts`

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change, no feature/fix
- `perf`: Performance improvement
- `test`: Add/correct tests
- `chore`: Build/tools changes
- `build`: Build system/external deps
- `ci`: CI configuration
- `revert`: Revert a commit

**Examples:**

```
feat(auth): add login form validation
fix: resolve memory leak in useQuery hook
docs: update API documentation
```

## Recent Changes
- 001-alibaba-image-api: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
