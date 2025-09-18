import React from 'react';
import { Monitor, Smartphone, ArrowRight } from 'lucide-react';

const DesktopOnlyPrompt = ({ 
  title = "Desktop Required", 
  message = "This feature is optimized for desktop use only.",
  feature = "feature"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          
          {/* Icon Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            
            {/* Mobile Icon with X */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-white rotate-45 absolute"></div>
                <div className="w-6 h-0.5 bg-white -rotate-45 absolute"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3 text-blue-700 dark:text-blue-300">
              <Monitor className="w-5 h-5" />
              <span className="text-sm font-medium">
                Please use a desktop or laptop computer to {feature}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Open this page on a desktop browser</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Ensure screen width is at least 1024px</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Full keyboard and mouse support available</span>
            </div>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => window.history.back()}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-6 py-3 font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <span>Go Back</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default DesktopOnlyPrompt;