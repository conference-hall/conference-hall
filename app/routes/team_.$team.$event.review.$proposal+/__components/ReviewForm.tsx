import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import type { ReviewFeeling } from '@prisma/client';
import { useFetcher, useParams, useSearchParams } from '@remix-run/react';
import { useRef, useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { TextArea } from '~/design-system/forms/TextArea.tsx';

import { options, ReviewNoteSelector } from './ReviewNoteSelector.tsx';

type FormValues = { note: number | null; feeling: ReviewFeeling | null; comment: string | null };

type Props = { initialValues: FormValues; nextId?: string };

export function ReviewForm({ initialValues, nextId }: Props) {
  const [changed, setChanged] = useState<boolean>(false);
  const form = useRef<HTMLFormElement | null>(null);
  const params = useParams();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();

  const disabled = !changed || fetcher.state === 'submitting' || fetcher.state === 'loading';

  const nextPath = nextId ? `/team/${params.team}/${params.event}/review/${nextId}?${searchParams.toString()}` : null;

  const handleClick = (nextPath: string | null) => {
    // @ts-ignore
    const reviewIndex = form.current?.elements.review.value;
    // @ts-ignore
    const comment = form.current?.elements.comment.value;

    const review = options[reviewIndex];
    const note = String(review.value ?? '');
    const feeling = review.feeling;

    if (!feeling) return;

    const data: FormData = new FormData();
    data.append('note', note);
    data.append('feeling', feeling);
    data.append('comment', comment);
    if (nextPath) data.append('nextPath', nextPath);
    fetcher.submit(data, { method: 'POST', action: `/team/${params.team}/${params.event}/review/${params.proposal}` });
    setChanged(false);
  };

  return (
    <fetcher.Form ref={form} className="space-y-4">
      <ReviewNoteSelector value={initialValues} onChange={() => setChanged(true)} />

      <TextArea
        name="comment"
        aria-label="Review comment"
        defaultValue={initialValues.comment || ''}
        placeholder="Leave a comment"
        rows={3}
        onChange={() => setChanged(true)}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => handleClick(null)}
          variant="secondary"
          block
          disabled={disabled}
          className="basis-1/2"
        >
          Save review
        </Button>
        <Button
          type="button"
          onClick={() => handleClick(nextPath)}
          variant="primary"
          iconRight={ArrowRightCircleIcon}
          block
          disabled={disabled}
          className="basis-1/2"
        >
          Save & Next
        </Button>
      </div>
    </fetcher.Form>
  );
}
