import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import type { ConfirmationStatus, DeliberationStatus, PublicationStatus } from '~/shared/types/proposals.types.ts';
import { ProposalStatusSelect } from './proposal-status-select.tsx';

// Mock the confirm function
const confirmMock = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: confirmMock,
  writable: true,
});

describe('ProposalStatusSelect component', () => {
  const defaultProps = {
    deliberationStatus: 'PENDING' as DeliberationStatus,
    confirmationStatus: null as ConfirmationStatus,
    publicationStatus: 'NOT_PUBLISHED' as PublicationStatus,
  };

  const renderComponent = (props = defaultProps) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <ProposalStatusSelect {...props} />
          </I18nextProvider>
        ),
        action: vi.fn(),
      },
    ]);
    return render(<RouteStub />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with pending status', async () => {
      const screen = renderComponent();

      await expect.element(screen.getByRole('heading', { name: 'Proposal status' })).toBeInTheDocument();
      await expect.element(screen.getByLabelText('Change proposal status')).toBeInTheDocument();
      await expect.element(screen.getByText('Not deliberated')).toBeInTheDocument();
    });

    it('renders with accepted status', async () => {
      const screen = renderComponent({ ...defaultProps, deliberationStatus: 'ACCEPTED' });

      await expect.element(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('renders with rejected status', async () => {
      const screen = renderComponent({ ...defaultProps, deliberationStatus: 'REJECTED' });

      await expect.element(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('renders with confirmation pending status', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
      });

      await expect.element(screen.getByText('Waiting for speaker confirmation')).toBeInTheDocument();
    });

    it('renders with confirmed status', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'CONFIRMED',
      });

      await expect.element(screen.getByText('Confirmed by speaker')).toBeInTheDocument();
    });

    it('renders with declined status', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'DECLINED',
      });

      await expect.element(screen.getByText('Declined by speaker')).toBeInTheDocument();
    });
  });

  describe('Status selection', () => {
    it('shows all appropriate options when no confirmation status', async () => {
      const screen = renderComponent();

      const selectButton = screen.getByRole('button', { name: /not deliberated/i });
      await userEvent.click(selectButton);

      await expect.element(screen.getByRole('option', { name: /Not deliberated/ })).toBeInTheDocument();
      await expect.element(screen.getByRole('option', { name: /Accepted/ })).toBeInTheDocument();
      await expect.element(screen.getByRole('option', { name: /Rejected/ })).toBeInTheDocument();

      // Confirmation status options should be hidden - let's check they're not in the DOM
      const allOptions = screen.getByRole('option').all();
      const optionTexts = allOptions.map((option) => option.element().textContent);
      expect(optionTexts).not.toContain('Waiting for speaker confirmation');
      expect(optionTexts).not.toContain('Confirmed by speaker');
      expect(optionTexts).not.toContain('Declined by speaker');
    });

    it('shows confirmation options when confirmation status exists', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
      });

      const selectButton = screen.getByRole('button', { name: /waiting for speaker confirmation/i });
      await userEvent.click(selectButton);

      await expect
        .element(screen.getByRole('option', { name: /Waiting for speaker confirmation/ }))
        .toBeInTheDocument();
      await expect.element(screen.getByRole('option', { name: /Confirmed by speaker/ })).toBeInTheDocument();
      await expect.element(screen.getByRole('option', { name: /Declined by speaker/ })).toBeInTheDocument();

      // Accepted option should be hidden when confirmation status exists
      const allOptions = screen.getByRole('option').all();
      const optionTexts = allOptions.map((option) => option.element().textContent);
      expect(optionTexts).not.toContain('Accepted');
    });

    it('changes displayed value when option is selected', async () => {
      const screen = renderComponent();

      const selectButton = screen.getByRole('button', { name: /not deliberated/i });
      await userEvent.click(selectButton);

      const acceptedOption = screen.getByRole('option', { name: /Accepted/ });
      await userEvent.click(acceptedOption);

      await expect.element(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });

  describe('Confirmation dialog', () => {
    it('shows confirmation dialog when changing published proposal status', async () => {
      confirmMock.mockReturnValue(true);

      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'PUBLISHED',
      });

      const selectButton = screen.getByRole('button', { name: /accepted/i });
      await userEvent.click(selectButton);

      const rejectedOption = screen.getByRole('option', { name: /Rejected/ });
      await userEvent.click(rejectedOption);

      expect(confirmMock).toHaveBeenCalledWith(
        "Attention: The proposal result has already been published. Any modifications will require re-publishing for the speakers' visibility.",
      );
    });

    it('does not show confirmation for non-published proposals', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'NOT_PUBLISHED',
      });

      const selectButton = screen.getByRole('button', { name: /accepted/i });
      await userEvent.click(selectButton);

      const rejectedOption = screen.getByRole('option', { name: /Rejected/ });
      await userEvent.click(rejectedOption);

      expect(confirmMock).not.toHaveBeenCalled();
    });
  });

  describe('Publication modal', () => {
    it('shows publication button when proposal can be published', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'NOT_PUBLISHED',
      });

      await expect.element(screen.getByRole('button', { name: /Publish result to speakers/i })).toBeInTheDocument();
    });

    it('does not show publication button when proposal is already published', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'PUBLISHED',
      });

      // Check that the publish button doesn't exist in the DOM
      const allButtons = screen.getByRole('button').all();
      const hasPublishButton = allButtons.some((button) =>
        button.element().textContent?.includes('Publish result to speakers'),
      );
      expect(hasPublishButton).toBe(false);
    });

    it('does not show publication button when deliberation is pending', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
      });

      // Check that the publish button doesn't exist in the DOM
      const allButtons = screen.getByRole('button').all();
      const hasPublishButton = allButtons.some((button) =>
        button.element().textContent?.includes('Publish result to speakers'),
      );
      expect(hasPublishButton).toBe(false);
    });

    it('opens publication modal when button is clicked', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'NOT_PUBLISHED',
      });

      const publishButton = screen.getByRole('button', { name: /Publish result to speakers/i });
      await userEvent.click(publishButton);

      const modal = screen.getByRole('dialog', { name: /Publish result to speakers/i });
      await expect.element(modal).toBeInTheDocument();

      const checkbox = modal.getByRole('checkbox', { name: /Notify speakers via email/i });
      await expect.element(checkbox).toBeChecked();
    });

    it('has submit button with correct intent value', async () => {
      const screen = renderComponent({
        ...defaultProps,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'NOT_PUBLISHED',
      });

      await userEvent.click(screen.getByRole('button', { name: /Publish result to speakers/i }));

      const modal = screen.getByRole('dialog', { name: /Publish result to speakers/i });
      const submitButtons = modal
        .getByRole('button')
        .all()
        .filter((btn) => btn.element().textContent?.includes('Publish result to speakers'));
      const submitButton = submitButtons[0];

      await expect.element(submitButton).toHaveAttribute('name', 'intent');
      await expect.element(submitButton).toHaveAttribute('value', 'publish-results');
      await expect.element(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
