# CSS
@doc-version: 16.0.1


Next.js provides several ways to style your application using CSS, including:

* [Tailwind CSS](#tailwind-css)
* [CSS Modules](#css-modules)
* [Global CSS](#global-css)
* [External Stylesheets](#external-stylesheets)
* [Sass](/docs/app/guides/sass.md)
* [CSS-in-JS](/docs/app/guides/css-in-js.md)

## Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that provides low-level utility classes to build custom designs.

Install Tailwind CSS:

```bash package="pnpm"
pnpm add -D tailwindcss @tailwindcss/postcss
```

```bash package="npm"
npm install -D tailwindcss @tailwindcss/postcss
```

```bash package="yarn"
yarn add -D tailwindcss @tailwindcss/postcss
```

```bash package="bun"
bun add -D tailwindcss @tailwindcss/postcss
```

Add the PostCSS plugin to your `postcss.config.mjs` file:

```js filename="postcss.config.mjs"
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Import Tailwind in your global CSS file:

```css filename="app/globals.css"
@import 'tailwindcss';
```

Import the CSS file in your root layout:

```tsx filename="app/layout.tsx" switcher
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Now you can start using Tailwind's utility classes in your application:

```tsx filename="app/page.tsx" switcher
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
    </main>
  )
}
```

```jsx filename="app/page.js" switcher
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
    </main>
  )
}
```

> **Good to know:** If you need broader browser support for very old browsers, see the [Tailwind CSS v3 setup instructions](/docs/app/guides/tailwind-v3-css.md).

## CSS Modules

CSS Modules locally scope CSS by generating unique class names. This allows you to use the same class in different files without worrying about naming collisions.

To start using CSS Modules, create a new file with the extension `.module.css` and import it into any component inside the `app` directory:

```css filename="app/blog/blog.module.css"
.blog {
  padding: 24px;
}
```

```tsx filename="app/blog/page.tsx" switcher
import styles from './blog.module.css'

export default function Page() {
  return <main className={styles.blog}></main>
}
```

```jsx filename="app/blog/page.js" switcher
import styles from './blog.module.css'

export default function Layout() {
  return <main className={styles.blog}></main>
}
```

## Global CSS

You can use global CSS to apply styles across your application.

Create a `app/global.css` file and import it in the root layout to apply the styles to **every route** in your application:

```css filename="app/global.css"
body {
  padding: 20px 20px 60px;
  max-width: 680px;
  margin: 0 auto;
}
```

```tsx filename="app/layout.tsx" switcher
// These styles apply to every route in the application
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
// These styles apply to every route in the application
import './global.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

> **Good to know:** Global styles can be imported into any layout, page, or component inside the `app` directory. However, since Next.js uses React's built-in support for stylesheets to integrate with Suspense, this currently does not remove stylesheets as you navigate between routes which can lead to conflicts. We recommend using global styles for *truly* global CSS (like Tailwind's base styles), [Tailwind CSS](#tailwind-css) for component styling, and [CSS Modules](#css-modules) for custom scoped CSS when needed.

## External stylesheets

Stylesheets published by external packages can be imported anywhere in the `app` directory, including colocated components:

```tsx filename="app/layout.tsx" switcher
import 'bootstrap/dist/css/bootstrap.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
import 'bootstrap/dist/css/bootstrap.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
```

> **Good to know:** In React 19, `<link rel="stylesheet" href="..." />` can also be used. See the [React `link` documentation](https://react.dev/reference/react-dom/components/link) for more information.

## Ordering and Merging

Next.js optimizes CSS during production builds by automatically chunking (merging) stylesheets. The **order of your CSS** depends on the **order you import styles in your code**.

For example, `base-button.module.css` will be ordered before `page.module.css` since `<BaseButton>` is imported before `page.module.css`:

```tsx filename="page.tsx" switcher
import { BaseButton } from './base-button'
import styles from './page.module.css'

export default function Page() {
  return <BaseButton className={styles.primary} />
}
```

```jsx filename="page.js" switcher
import { BaseButton } from './base-button'
import styles from './page.module.css'

export default function Page() {
  return <BaseButton className={styles.primary} />
}
```

```tsx filename="base-button.tsx" switcher
import styles from './base-button.module.css'

export function BaseButton() {
  return <button className={styles.primary} />
}
```

```jsx filename="base-button.js" switcher
import styles from './base-button.module.css'

export function BaseButton() {
  return <button className={styles.primary} />
}
```

### Recommendations

To keep CSS ordering predictable:

* Try to contain CSS imports to a single JavaScript or TypeScript entry file
* Import global styles and Tailwind stylesheets in the root of your application.
* **Use Tailwind CSS** for most styling needs as it covers common design patterns with utility classes.
* Use CSS Modules for component-specific styles when Tailwind utilities aren't sufficient.
* Use a consistent naming convention for your CSS modules. For example, using `<name>.module.css` over `<name>.tsx`.
* Extract shared styles into shared components to avoid duplicate imports.
* Turn off linters or formatters that auto-sort imports like ESLint’s [`sort-imports`](https://eslint.org/docs/latest/rules/sort-imports).
* You can use the [`cssChunking`](/docs/app/api-reference/config/next-config-js/cssChunking.md) option in `next.config.js` to control how CSS is chunked.

## Development vs Production

* In development (`next dev`), CSS updates apply instantly with [Fast Refresh](/docs/architecture/fast-refresh.md).
* In production (`next build`), all CSS files are automatically concatenated into **many minified and code-split** `.css` files, ensuring the minimal amount of CSS is loaded for a route.
* CSS still loads with JavaScript disabled in production, but JavaScript is required in development for Fast Refresh.
* CSS ordering can behave differently in development, always ensure to check the build (`next build`) to verify the final CSS order.
## Next Steps

Learn more about the alternatives ways you can use CSS in your application.

- [Tailwind CSS v3](/docs/app/guides/tailwind-v3-css.md)
  - Style your Next.js Application using Tailwind CSS v3 for broader browser support.
- [Sass](/docs/app/guides/sass.md)
  - Style your Next.js application using Sass.
- [CSS-in-JS](/docs/app/guides/css-in-js.md)
  - Use CSS-in-JS libraries with Next.js


  # Installation
@doc-version: 16.0.1


Create a new Next.js app and run it locally.

## Quick start

1. Create a new Next.js app named `my-app`
2. `cd my-app` and start the dev server.
3. Visit `http://localhost:3000`.

```bash package="pnpm"
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
```

```bash package="npm"
npx create-next-app@latest my-app --yes
cd my-app
npm run dev
```

```bash package="yarn"
yarn create next-app@latest my-app --yes
cd my-app
yarn dev
```

```bash package="bun"
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

* `--yes` skips prompts using saved preferences or defaults. The default setup enables TypeScript, Tailwind, ESLint, App Router, and Turbopack, with import alias `@/*`.

## System requirements

Before you begin, make sure your development environment meets the following requirements:

* Minimum Node.js version: [20.9](https://nodejs.org/)
* Operating systems: macOS, Windows (including WSL), and Linux.

## Supported browsers

Next.js supports modern browsers with zero configuration.

* Chrome 111+
* Edge 111+
* Firefox 111+
* Safari 16.4+

Learn more about [browser support](/docs/architecture/supported-browsers.md), including how to configure polyfills and target specific browsers.

## Create with the CLI

The quickest way to create a new Next.js app is using [`create-next-app`](/docs/app/api-reference/cli/create-next-app.md), which sets up everything automatically for you. To create a project, run:

```bash filename="Terminal"
npx create-next-app@latest
```

On installation, you'll see the following prompts:

```txt filename="Terminal"
What is your project named? my-app
Would you like to use the recommended Next.js defaults?
    Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, Turbopack
    No, reuse previous settings
    No, customize settings - Choose your own preferences
```

If you choose to `customize settings`, you'll see the following prompts:

```txt filename="Terminal"
Would you like to use TypeScript? No / Yes
Which linter would you like to use? ESLint / Biome / None
Would you like to use React Compiler? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
```

After the prompts, [`create-next-app`](/docs/app/api-reference/cli/create-next-app.md) will create a folder with your project name and install the required dependencies.

## Manual installation

To manually create a new Next.js app, install the required packages:

```bash package="pnpm"
pnpm i next@latest react@latest react-dom@latest
```

```bash package="npm"
npm i next@latest react@latest react-dom@latest
```

```bash package="yarn"
yarn add next@latest react@latest react-dom@latest
```

```bash package="bun"
bun add next@latest react@latest react-dom@latest
```

> **Good to know**: The App Router uses [React canary releases](https://react.dev/blog/2023/05/03/react-canaries) built-in, which include all the stable React 19 changes, as well as newer features being validated in frameworks. The Pages Router uses the React version you install in `package.json`.

Then, add the following scripts to your `package.json` file:

```json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

These scripts refer to the different stages of developing an application:

* `next dev`: Starts the development server using Turbopack (default bundler).
* `next build`: Builds the application for production.
* `next start`: Starts the production server.
* `eslint`: Runs ESLint.

Turbopack is now the default bundler. To use Webpack run `next dev --webpack` or `next build --webpack`. See the [Turbopack docs](/docs/app/api-reference/turbopack.md) for configuration details.

### Create the `app` directory

Next.js uses file-system routing, which means the routes in your application are determined by how you structure your files.

Create an `app` folder. Then, inside `app`, create a `layout.tsx` file. This file is the [root layout](/docs/app/api-reference/file-conventions/layout.md#root-layout). It's required and must contain the `<html>` and `<body>` tags.

```tsx filename="app/layout.tsx" switcher
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Create a home page `app/page.tsx` with some initial content:

```tsx filename="app/page.tsx" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

```jsx filename="app/page.js" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

Both `layout.tsx` and `page.tsx` will be rendered when the user visits the root of your application (`/`).

![App Folder Structure](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/app-getting-started.png)

> **Good to know**:
>
> * If you forget to create the root layout, Next.js will automatically create this file when running the development server with `next dev`.
> * You can optionally use a [`src` folder](/docs/app/api-reference/file-conventions/src-folder.md) in the root of your project to separate your application's code from configuration files.

### Create the `public` folder (optional)

Create a [`public` folder](/docs/app/api-reference/file-conventions/public-folder.md) at the root of your project to store static assets such as images, fonts, etc. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

You can then reference these assets using the root path (`/`). For example, `public/profile.png` can be referenced as `/profile.png`:

```tsx filename="app/page.tsx" highlight={4} switcher
import Image from 'next/image'

export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

```jsx filename="app/page.js" highlight={4} switcher
import Image from 'next/image'

export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

## Run the development server

1. Run `npm run dev` to start the development server.
2. Visit `http://localhost:3000` to view your application.
3. Edit the `app/page.tsx` file and save it to see the updated result in your browser.

## Set up TypeScript

> Minimum TypeScript version: `v5.1.0`

Next.js comes with built-in TypeScript support. To add TypeScript to your project, rename a file to `.ts` / `.tsx` and run `next dev`. Next.js will automatically install the necessary dependencies and add a `tsconfig.json` file with the recommended config options.

### IDE Plugin

Next.js includes a custom TypeScript plugin and type checker, which VSCode and other code editors can use for advanced type-checking and auto-completion.

You can enable the plugin in VS Code by:

1. Opening the command palette (`Ctrl/⌘` + `Shift` + `P`)
2. Searching for "TypeScript: Select TypeScript Version"
3. Selecting "Use Workspace Version"

![TypeScript Command Palette](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/typescript-command-palette.png)

See the [TypeScript reference](/docs/app/api-reference/config/next-config-js/typescript.md) page for more information.

## Set up linting

Next.js supports linting with either ESLint or Biome. Choose a linter and run it directly via `package.json` scripts.

* Use **ESLint** (comprehensive rules):

```json filename="package.json"
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

* Or use **Biome** (fast linter + formatter):

```json filename="package.json"
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}
```

If your project previously used `next lint`, migrate your scripts to the ESLint CLI with the codemod:

```bash filename="Terminal"
npx @next/codemod@canary next-lint-to-eslint-cli .
```

If you use ESLint, create an explicit config (recommended `eslint.config.mjs`). ESLint supports both [the legacy `.eslintrc.*` and the newer `eslint.config.mjs` formats](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-eslint). See the [ESLint API reference](/docs/app/api-reference/config/eslint.md#with-core-web-vitals) for a recommended setup.

> **Good to know**: Starting with Next.js 16, `next build` no longer runs the linter automatically. Instead, you can run your linter through NPM scripts.

See the [ESLint Plugin](/docs/app/api-reference/config/eslint.md) page for more information.

## Set up Absolute Imports and Module Path Aliases

Next.js has in-built support for the `"paths"` and `"baseUrl"` options of `tsconfig.json` and `jsconfig.json` files.

These options allow you to alias project directories to absolute paths, making it easier and cleaner to import modules. For example:

```jsx
// Before
import { Button } from '../../../components/button'

// After
import { Button } from '@/components/button'
```

To configure absolute imports, add the `baseUrl` configuration option to your `tsconfig.json` or `jsconfig.json` file. For example:

```json filename="tsconfig.json or jsconfig.json"
{
  "compilerOptions": {
    "baseUrl": "src/"
  }
}
```

In addition to configuring the `baseUrl` path, you can use the `"paths"` option to `"alias"` module paths.

For example, the following configuration maps `@/components/*` to `components/*`:

```json filename="tsconfig.json or jsconfig.json"
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

Each of the `"paths"` are relative to the `baseUrl` location.