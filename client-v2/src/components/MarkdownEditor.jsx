import { useState } from 'react';
import { Eye, EyeOff, Info, Code, Bold, Italic, List, Hash } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  rows = 4,
  className = "",
  label = "",
  required = false 
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-muted/30 border border-border rounded-t-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
          >
            {isPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <div className="h-4 w-px bg-border" />
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Code className="w-3 h-3" />
            <Bold className="w-3 h-3" />
            <Italic className="w-3 h-3" />
            <List className="w-3 h-3" />
            <Hash className="w-3 h-3" />
          </div>
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>Formatting Help</span>
          </button>
          
          {/* Quick Help Tooltip */}
          {showQuickHelp && (
            <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg shadow-xl p-4 w-80 z-50">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground mb-2">Quick Formatting Reference</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">**bold**</code>
                    <span className="text-muted-foreground">Makes text <strong>bold</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">*italic*</code>
                    <span className="text-muted-foreground">Makes text <em>italic</em></span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">`code`</code>
                    <span className="text-muted-foreground">Inline code</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">```code```</code>
                    <span className="text-muted-foreground">Code block</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">- item</code>
                    <span className="text-muted-foreground">Bullet list</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">1. item</code>
                    <span className="text-muted-foreground">Numbered list</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-muted px-1 rounded">### heading</code>
                    <span className="text-muted-foreground">Subheading</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Use the Preview button to see your formatting in real-time
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="border border-t-0 border-border rounded-b-lg">
        {isPreview ? (
          <div className="min-h-[100px] p-3 bg-background">
            {value ? (
              <MarkdownViewer content={value} />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview...</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-3 py-3 bg-background border-0 resize-none focus:outline-none focus:ring-0 ${className}`}
            required={required}
          />
        )}
      </div>

      {/* Quick Reference */}
      {/* <div className="text-xs text-muted-foreground">
        <span>Quick: </span>
        <code className="bg-muted px-1 rounded">**bold**</code>
        <span className="mx-1">•</span>
        <code className="bg-muted px-1 rounded">*italic*</code>
        <span className="mx-1">•</span>
        <code className="bg-muted px-1 rounded">`code`</code>
        <span className="mx-1">•</span>
        <code className="bg-muted px-1 rounded">- list</code>
      </div> */}
    </div>
  );
};

export default MarkdownEditor;