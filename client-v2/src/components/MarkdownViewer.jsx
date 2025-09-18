import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownViewer = ({ content, className = "" }) => {
  // Simple theme detection - you can replace this with your theme context
  const isDark = document.documentElement.classList.contains('dark');
  
  if (!content || content.trim() === '') {
    return null;
  }

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={isDark ? oneDark : oneLight}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" 
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-foreground mb-4 mt-6 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-foreground mb-3 mt-5 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold text-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium text-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="text-foreground mb-3 leading-relaxed last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 italic">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-secondary">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-secondary/50">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-foreground border-r border-border last:border-r-0">
        {children}
      </td>
    ),
    a: ({ children, href }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground">
        {children}
      </em>
    ),
    hr: () => (
      <hr className="border-border my-6" />
    ),
  };

  return (
    <div className={`prose prose-sm max-w-none text-foreground ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;