import { Markdown as ReactEmailMarkdown } from '@react-email/components';
import xss from 'xss';

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

type Props = { children: string; variables?: Record<string, string> };

export function EmailMarkdown({ children, variables = {} }: Props) {
  const interpolatedMarkdown = interpolateTemplate(children, variables);

  return (
    <ReactEmailMarkdown
      markdownCustomStyles={markdownCustomStyles}
      markdownContainerStyles={{ whiteSpace: 'pre-wrap' }}
    >
      {interpolatedMarkdown}
    </ReactEmailMarkdown>
  );
}

function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined) {
      return match;
    }

    // Sanitize the value - this removes all HTML tags and dangerous content
    const sanitized = xss(value, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });

    // Additional URL sanitization for markdown links
    if (sanitized.match(/^(javascript|data|vbscript):/i)) {
      return '';
    }

    return sanitized;
  });
}
