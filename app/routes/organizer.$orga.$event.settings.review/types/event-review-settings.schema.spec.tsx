import { withZod } from '@remix-validated-form/with-zod';
import { EventReviewSettingsSchema } from './event-review-settings.schema';

describe('Validate EventReviewSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('displayOrganizersRatings', 'on');
    formData.append('displayProposalsSpeakers', 'on');

    const result = await withZod(EventReviewSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      displayOrganizersRatings: true,
      displayProposalsRatings: false,
      displayProposalsSpeakers: true,
    });
  });

  it('returns errors if values are invalid', async () => {
    const formData = new FormData();
    formData.append('displayOrganizersRatings', 'foo');
    formData.append('displayProposalsRatings', 'foo');
    formData.append('displayProposalsSpeakers', 'foo');

    const result = await withZod(EventReviewSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      displayOrganizersRatings: 'Invalid literal value, expected "on"',
      displayProposalsRatings: 'Invalid literal value, expected "on"',
      displayProposalsSpeakers: 'Invalid literal value, expected "on"',
    });
  });
});
