import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const MarkdownHelpModal = ({ isOpen, onClose }) => {
  const [copiedExample, setCopiedExample] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, exampleKey) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(exampleKey);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const examples = [
    {
      key: 'code',
      title: 'Code Formatting',
      description: 'For code snippets and technical terms',
      syntax: '`inline code` or ```code block```',
      example: `Here's a \`function()\` example:

\`\`\`
def solve_problem():
    return "solution"
\`\`\``,
      result: 'Renders code with syntax highlighting and proper spacing'
    },
    {
      key: 'bold',
      title: 'Bold Text',
      description: 'Emphasize important points',
      syntax: '**text**',
      example: '**Key Insight:** This is important!',
      result: 'Key Insight: This is important!'
    },
    {
      key: 'italic',
      title: 'Italic Text',
      description: 'For subtle emphasis',
      syntax: '*text*',
      example: 'Time complexity is *O(n log n)*',
      result: 'Time complexity is O(n log n)'
    },
    {
      key: 'lists',
      title: 'Lists',
      description: 'Organize information clearly',
      syntax: '- item or 1. item',
      example: `Approach steps:
- Sort the array
- Build prefix difference
- Use binary search

Or numbered:
1. First step
2. Second step
3. Final step`,
      result: 'Renders as properly formatted bullet points and numbered lists'
    },
    {
      key: 'headings',
      title: 'Subheadings',
      description: 'Structure your content',
      syntax: '### Heading',
      example: `### Algorithm Approach
Detailed explanation here...

### Complexity Analysis
Time and space complexity...`,
      result: 'Creates bold subheadings to organize content'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Markdown Formatting Guide</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Supported formatting options for technical content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {examples.map((example) => (
              <div key={example.key} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{example.title}</h3>
                  <button
                    onClick={() => copyToClipboard(example.example, example.key)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    {copiedExample === example.key ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Example</span>
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Syntax:</h4>
                    <code className="block bg-muted p-2 rounded text-sm font-mono">
                      {example.syntax}
                    </code>
                    
                    <h4 className="text-sm font-medium mb-2 mt-3">Example:</h4>
                    <pre className="bg-muted p-2 rounded text-sm font-mono whitespace-pre-wrap">
                      {example.example}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Result:</h4>
                    <div className="bg-background border border-border p-2 rounded text-sm">
                      {example.result}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Use the Preview toggle to see your formatting in real-time</li>
              <li>• Code blocks are perfect for algorithms and data structures</li>
              <li>• Break up long content with subheadings for better readability</li>
              <li>• Bold key insights and important points</li>
              <li>• Use lists to organize steps, approaches, or multiple solutions</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              This formatting will be applied to all text areas in experience forms
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownHelpModal;