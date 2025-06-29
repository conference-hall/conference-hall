import { Markdown as ReactEmailMarkdown } from '@react-email/components';

const markdownCustomStyles = {
  h1: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  h2: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  h3: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  h4: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  h5: {
    fontSize: '14px',
    fontWeight: 'medium',
    marginBottom: '6px',
  },
  h6: {
    fontSize: '14px',
    fontWeight: 'medium',
    marginBottom: '6px',
  },
  p: {
    fontSize: '14px',
    marginBottom: '12px',
  },
  a: {
    color: '#1a0dab',
    textDecoration: 'underline',
  },
  ul: {
    fontSize: '14px',
    marginLeft: '0px',
  },
};

export function EmailMarkdown({ children }: { children: string }) {
  return <ReactEmailMarkdown markdownCustomStyles={markdownCustomStyles}>{children}</ReactEmailMarkdown>;
}
