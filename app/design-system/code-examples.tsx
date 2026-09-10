import { useState } from 'react';
import { Button } from './button.tsx';
import { CodeBlock } from './code-block.tsx';

export type CodeExample = { id: string; label: string; code: string };

type Props = { examples: Array<CodeExample> };

export function CodeExamples({ examples }: Props) {
  const [activeId, setActiveId] = useState(examples[0]?.id);
  const active = examples.find((example) => example.id === activeId) ?? examples[0];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {examples.map((example) => (
          <Button
            key={example.id}
            type="button"
            size="sm"
            variant={example.id === active?.id ? 'primary' : 'secondary'}
            onClick={() => setActiveId(example.id)}
          >
            {example.label}
          </Button>
        ))}
      </div>
      {active ? <CodeBlock code={active.code} /> : null}
    </div>
  );
}
