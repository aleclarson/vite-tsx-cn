import fs from 'fs'
import path from 'path'
import { createServer } from 'vite'
import { describe, expect } from 'vitest'
import reactClassName, { Options } from '../src/index'

describe('vite-react-classname', () => {
  test('add className to function component', async () => {
    const result = await transform('function-component.tsx')
    expect(result).toMatchInlineSnapshot(`
      "function Component({ className: $cn }) {
        return <div className={$cn}>Test</div>
      }
      "
    `)
  })

  test('add className to arrow function component', async () => {
    const result = await transform('arrow-function-component.tsx')
    expect(result).toMatchInlineSnapshot(`
      "const Component = ({ className: $cn }) => {
        return <div className={$cn}>Test</div>
      }
      "
    `)
  })

  test('add className to forwardRef component', async () => {
    const result = await transform('forwardRef-component.tsx')
    expect(result).toMatchInlineSnapshot(`
      "import { forwardRef } from 'react'

      const Component = forwardRef(({className: $cn, }, ref: React.Ref<HTMLDivElement>) => {
        return <div ref={ref} className={$cn}>Test</div>
      })
      "
    `)
  })

  test('preserve existing className prop', async () => {
    const result = await transform('existing-classname.tsx')
    expect(result).toMatchInlineSnapshot(`
      "import clsx from 'clsx'

      function Component({ className: $cn }) {
        return <div className={"existing" + ($cn ? " " + $cn : "")}>Test</div>
      }

      function Component2({ className: $cn }) {
        return <div className={clsx('a', 'b', 'c') + ($cn ? " " + $cn : "")}>Test</div>
      }
      "
    `)
  })

  test('handle destructured props', async () => {
    const result = await transform('destructured-props.tsx')
    expect(result).toMatchInlineSnapshot(`
      "import { ReactNode } from 'react'

      function Component({className: $cn,  children }: { children: ReactNode }) {
        return <div className={$cn}>{children}</div>
      }
      "
    `)
  })

  test('skip when spread props are used', async () => {
    const result = await transform('spread-props.tsx')
    expect(result).toMatchInlineSnapshot(`
      "import React from 'react'

      function Component(props: React.HTMLAttributes<HTMLDivElement>) {
        return <div {...props}>Test</div>
      }
      "
    `)
  })

  test('skip node_modules when skipNodeModules is true', async () => {
    const result = await transform('node_modules/component.tsx', {
      skipNodeModules: true,
    })
    expect(result).toMatchInlineSnapshot(`
      "import React from 'react'

      function Component() {
        return <div>Test</div>
      }
      "
    `)
  })
})

async function transform(fixtureId: string, options: Options = {}) {
  const root = path.join(__dirname, 'fixtures')
  const fixturePath = path.join(root, fixtureId)

  let result = fs.readFileSync(fixturePath, 'utf-8')

  const server = await createServer({
    root,
    logLevel: 'silent',
    plugins: [
      reactClassName({
        ...options,
        onTransform(code) {
          result = code
        },
      }),
    ],
    environments: {
      client: {
        dev: {
          moduleRunnerTransform: false,
        },
      },
    },
  })

  await server.transformRequest('/@fs/' + fixturePath, {
    ssr: false,
  })

  return result
}
