import { CheckCircleIcon } from '@heroicons/react/20/solid';
import type { ReviewFeeling } from '@prisma/client';
import { useFetcher, useParams } from '@remix-run/react';
import { useRef, useState } from 'react';

import { Button } from '~/design-system/Buttons';
import { TextArea } from '~/design-system/forms/TextArea';

import { options, ReviewNoteSelector } from './ReviewNoteSelector';

type FormValues = { note: number | null; feeling: ReviewFeeling | null; comment: string | null };

type Props = { initialValues: FormValues };

export function ReviewForm({ initialValues }: Props) {
  const [changed, setChanged] = useState<boolean>(false);
  const form = useRef<HTMLFormElement | null>(null);
  const params = useParams();
  const fetcher = useFetcher();

  const disabled = !changed || fetcher.state === 'submitting' || fetcher.state === 'loading';

  const handleClick = () => {
    // @ts-ignore
    const reviewIndex = form.current?.elements.review.value;
    // @ts-ignore
    const comment = form.current?.elements.comment.value;

    const review = options[reviewIndex];
    const note = String(review.value ?? '');
    const feeling = review.feeling;

    if (!feeling) return;

    fetcher.submit(
      { note, feeling, comment },
      { method: 'POST', action: `/team/${params.team}/${params.event}/review/${params.proposal}` },
    );
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

      <Button
        type="button"
        onClick={handleClick}
        variant="secondary"
        iconLeft={CheckCircleIcon}
        block
        disabled={disabled}
      >
        Save review
      </Button>
    </fetcher.Form>
  );
}
