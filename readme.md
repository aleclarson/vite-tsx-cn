# vite-react-classname

This plugin adds a `className` prop to every React component in your project (including `node_modules`). Now you don't have to do the grunt work of defining a `className` prop for every component, merging class names via `cn(…)`, etc.

#### Example

Imagine you have a component like this:

```tsx
import { cn } from '@lib/utils'

export function Button({ className }) {
  return <div className={cn('btn', className)} />
}
```

With this plugin, you can now write:

```tsx
export function Button() {
  return <div className="btn" />
}
```

## Install

```
pnpm add vite-react-classname
```

## Usage

```tsx
import reactClassName from 'vite-react-classname'

export default defineConfig({
  plugins: [reactClassName()],
})
```

### Options

- `skipNodeModules`: Whether to skip transforming components in `node_modules`. Defaults to `false`.

### TypeScript

Add the following "triple-slash directive" to a module in your project (usually the entry module):

```ts
/// <reference types="vite-react-classname/types/react" />
```

This will add the `className` prop to the `React.Attributes` interface.

## FAQ

#### What's all supported?

- Function components of almost any kind (arrow syntax, `function` keyword, etc.), except if you're using [method definition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) syntax.
- Class components are **NOT** supported (PR welcome).

#### Is this React-specific?

Not really. It works with any JSX library, but currently, the package only ships with a `react` type definition. That doesn't mean you can't use it with other libraries; you'll just have to add your own type definitions. PRs welcome!

#### When is transformation skipped?

- When props destructuring is encountered, and the `className` prop is explicitly declared, it's assumed the `className` prop is being forwarded. No transformation is done in this case.
  ```tsx
  // ❌ Component is not transformed
  function Example({ className, ...props }) {
    return <div className={cn('btn', className)} {...props} />
  }
  ```
- When the `props` variable is spread into a JSX element, it's assumed the `className` prop is being forwarded. No transformation is done in this case.
  ```tsx
  // ❌ Component is not transformed
  function SpreadExample(props) {
    return <div {...props} />
  }
  ```
- Context providers are ignored. Their immediate JSX child is transformed instead.
  ```tsx
  // ✅ The props argument has className added
  function MyComponent({ xyz }) {
    return (
      // ❌ Provider is not transformed
      <MyContextProvider value={xyz}>
        // ✅ …but its child is forwarded the className value
        <div className="inset-0 bg-red-500" />
      </MyContextProvider>
    )
  }
  ```

## Roadmap

Contributions are welcome! Here are some ideas:

- Add support for class components
- Add support for other JSX libraries
- Allow overriding the `className` prop name
- Allow specifying a custom `cn(…)` function. Currently, the `className` is merely concatenated with the original `className` expression.

  ```tsx
  function Before({ onClick }) {
    return <div className="btn" onClick={onClick} />
  }

  // Here's what a component looks like after transformation.
  // Specifically, note the `$cn` variable.
  function After({ className: $cn, onClick }) {
    return <div className={'btn' + ($cn ? ' ' + $cn : '')} onClick={onClick} />
  }
  ```
