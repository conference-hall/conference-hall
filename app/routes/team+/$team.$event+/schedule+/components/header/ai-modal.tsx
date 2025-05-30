import { SparklesIcon } from '@heroicons/react/16/solid';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import { href, useFetcher, useParams } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { action } from '../../ai/generate.tsx';

export function AIModalButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="square-m">
        <SparklesIcon className="size-5 text-indigo-500" />
      </Button>

      <AIModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type ChatMessage = { type: 'user' | 'bot' | 'error'; content: string };

type ModalProps = { open: boolean; onClose: VoidFunction };

function AIModal({ open, onClose }: ModalProps) {
  const params = useParams();
  const fetcher = useFetcher<typeof action>();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Array<ChatMessage>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setChat((prev) => [...prev, { type: 'bot', content: fetcher.data?.response || '' }]);
    } else if (fetcher.state === 'idle' && fetcher.data?.error) {
      setError(fetcher?.data?.error || 'An error occurred.');
    }
  }, [fetcher.state, fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when chat updates
  useEffect(() => {
    const el = containerRef.current;
    if (el) requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
  }, [chat]);

  const onSubmit = async () => {
    if (loading) return;
    setError(null);

    if (input.trim()) {
      setChat((prev) => [...prev, { type: 'user', content: input.trim() }]);
      setInput('');
    }

    const action = href('/team/:team/:event/schedule/ai/generate', { team: params.team!, event: params.event! });
    await fetcher.submit({ instructions: input.trim() }, { method: 'POST', action });
  };

  const loading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <SlideOver title="Schedule AI assistant" size="m" open={open} onClose={onClose}>
      <SlideOver.Content ref={containerRef} className="space-y-4 flex flex-col">
        <div className="grow flex flex-col justify-end gap-4">
          {chat.map((message, index) =>
            message.type === 'user' ? (
              <Callout key={index} variant="neutral">
                <Markdown>{message.content}</Markdown>
              </Callout>
            ) : (
              <Markdown key={index} className="px-4">
                {message.content}
              </Markdown>
            ),
          )}

          {error ? <Callout variant="error">{error}</Callout> : null}

          {loading ? (
            <div className="flex justify-start items-center gap-2">
              <LoadingIcon className="size-4 text-gray-500" aria-hidden="true" />
              <Text variant="secondary">Reasoning...</Text>
            </div>
          ) : null}
        </div>
      </SlideOver.Content>

      <div className="flex shrink-0 px-4 py-4">
        <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600 w-full">
          <textarea
            name="instructions"
            aria-label="Instructions"
            placeholder="Add additional instructions for the AI to generate the schedule."
            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm leading-6"
            value={input}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-multiline="true"
            rows={3}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-4 right-4 flex justify-end py-2 pl-3 pr-2">
          <Button type="button" variant="secondary" size="square-m" onClick={onSubmit}>
            <PaperAirplaneIcon className="size-5 text-gray-400" />
          </Button>
        </div>
      </div>
    </SlideOver>
  );
}
