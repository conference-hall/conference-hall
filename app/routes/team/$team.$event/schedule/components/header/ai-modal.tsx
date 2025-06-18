import { SparklesIcon } from '@heroicons/react/16/solid';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useParams, useRevalidator } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ScheduleGenerationErrorSchema, ScheduleGenerationResultSchema } from '../schedule.types.ts';

export function AIModalButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        size="square-m"
        aria-label={t('event-management.schedule.ai-assistant.open')}
      >
        <SparklesIcon className="size-5 text-indigo-500" />
      </Button>

      <AIModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type ChatMessage = { type: 'user' | 'bot'; content: string };

type ModalProps = { open: boolean; onClose: VoidFunction };

function AIModal({ open, onClose }: ModalProps) {
  const { revalidate } = useRevalidator();
  const { t } = useTranslation();
  const params = useParams();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Array<ChatMessage>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when chat updates
  useEffect(() => {
    const el = containerRef.current;
    if (el) requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
  }, [chat]);

  const handleGenerate = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);

    if (input.trim()) {
      setChat((prev) => [...prev, { type: 'user', content: input.trim() }]);
      setInput('');
    }

    try {
      const path = href('/team/:team/:event/schedule/ai/generate', { team: params.team!, event: params.event! });
      const res = await fetch(path, {
        method: 'POST',
        body: JSON.stringify({ instructions: input.trim() }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(t('error.global'));
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error(t('error.global'));
      }

      try {
        const decoder = new TextDecoder();
        let output = '';
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          setChunkCount((prev) => prev + 1);
          if (value) {
            output += decoder.decode(value, { stream: true });
          }
          done = readerDone;
        }
        output += decoder.decode();
        const jsonOutput = JSON.parse(output.trim());

        const parsedError = ScheduleGenerationErrorSchema.safeParse(jsonOutput);
        if (parsedError.success) {
          throw new Error(parsedError.data.error);
        }

        const parsedOutput = ScheduleGenerationResultSchema.safeParse(jsonOutput);
        if (parsedOutput.success) {
          setChat((prev) => [...prev, { type: 'bot', content: parsedOutput.data.response || '' }]);
        } else {
          throw new Error(parsedOutput.error.message);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setChunkCount(0);
    }

    await revalidate();
  };

  return (
    <SlideOver title={t('event-management.schedule.ai-assistant.heading')} size="m" open={open} onClose={onClose}>
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
              <Text variant="secondary">
                {t('event-management.schedule.ai-assistant.reasoning')} {` (${chunkCount})`}
              </Text>
            </div>
          ) : null}
        </div>
      </SlideOver.Content>

      <div className="flex shrink-0 px-4 py-4">
        <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600 w-full">
          <textarea
            name="instructions"
            aria-label={t('event-management.schedule.ai-assistant.instructions.label')}
            placeholder={t('event-management.schedule.ai-assistant.instructions.placeholder')}
            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm leading-6"
            value={input}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-multiline="true"
            rows={3}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await handleGenerate();
              }
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-4 right-4 flex justify-end py-2 pl-3 pr-2">
          <Button
            type="button"
            variant="secondary"
            size="square-m"
            onClick={handleGenerate}
            aria-label={t('common.send')}
          >
            <PaperAirplaneIcon className="size-5 text-gray-400" />
          </Button>
        </div>
      </div>
    </SlideOver>
  );
}
