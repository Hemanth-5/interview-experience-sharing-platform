import { useState } from 'react';
import { X, Clock, Building, Users, Star, ChevronRight, MessageCircle, ThumbsUp, Bookmark } from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import MarkdownViewer from './MarkdownViewer';

const ExperiencePreviewModal = ({ experience, isOpen, onClose, onViewFull }) => {
  if (!isOpen || !experience) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <CompanyLogo
                companyName={experience.companyInfo?.companyName || 'Unknown Company'}
                companyLogo={experience.companyInfo?.companyLogo}
                size={48}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {experience.companyInfo.companyName}
              </h2>
              <p className="text-lg font-semibold text-foreground">
                {experience.companyInfo.role}
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{experience.companyInfo.internshipType}</span>
                <span>•</span>
                <span>{experience.companyInfo.location}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-bold text-lg">{experience.overallRating}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-bold text-lg">{experience.preparationTime}</div>
              <div className="text-xs text-muted-foreground">Prep (weeks)</div>
            </div>
            
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-bold text-lg">{experience.rounds?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Rounds</div>
            </div>
            
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="font-bold text-lg">{experience.upvoteCount || 0}</span>
              </div>
              <div className="text-xs text-muted-foreground">Helpful</div>
            </div>
          </div>

          {/* Overall Experience Preview */}
          {experience.overallExperience && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Overall Experience</h3>
              <div className="bg-secondary/20 rounded-lg p-4 text-sm text-muted-foreground line-clamp-4">
                <MarkdownViewer content={experience.overallExperience.substring(0, 300) + '...'} />
              </div>
            </div>
          )}

          {/* Quick Rounds Overview */}
          {experience.rounds && experience.rounds.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Interview Rounds ({experience.rounds.length})</h3>
              <div className="space-y-2">
                {experience.rounds.slice(0, 3).map((round, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{round.roundType || `Round ${index + 1}`}</p>
                        {round.duration && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{round.duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {round.technicalQuestions?.length || 0} questions
                    </div>
                  </div>
                ))}
                {experience.rounds.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{experience.rounds.length - 3} more rounds
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Tips Preview */}
          {experience.keyTips && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Key Tips</h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-sm text-green-700 dark:text-green-400 line-clamp-3">
                  <MarkdownViewer content={experience.keyTips.substring(0, 200) + '...'} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-secondary/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Posted {new Date(experience.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onViewFull(experience._id)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>View Full Experience</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperiencePreviewModal;