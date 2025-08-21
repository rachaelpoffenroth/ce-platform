import React from 'react';

interface BaseSlide {
  id: string;
  type: string;
}

interface TitleSlide extends BaseSlide {
  type: 'title';
  title: string;
  subtitle?: string;
}

interface ContentSlide extends BaseSlide {
  type: 'content';
  title: string;
  content: string;
}

type Slide = TitleSlide | ContentSlide;

interface ProfessionalSlideRendererProps {
  slide: Slide;
  theme?: string;
  className?: string;
}

const THEMES = {
  professional: {
    titleBg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-blue-600',
    bulletColor: 'text-blue-600'
  },
  modern: {
    titleBg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600',
    contentBg: 'bg-gradient-to-br from-gray-50 to-white',
    titleText: 'text-white',
    contentText: 'text-gray-900',
    accent: 'text-purple-600',
    bulletColor: 'text-purple-600'
  },
  corporate: {
    titleBg: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-gray-700',
    bulletColor: 'text-gray-700'
  },
  vibrant: {
    titleBg: 'bg-gradient-to-br from-green-400 via-teal-500 to-blue-500',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-green-600',
    bulletColor: 'text-green-600'
  }
};

export default function ProfessionalSlideRenderer({ slide, theme = 'professional', className = '' }: ProfessionalSlideRendererProps) {
  const currentTheme = THEMES[theme as keyof typeof THEMES] || THEMES.professional;

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3">
            <div className={`w-2 h-2 rounded-full ${currentTheme.bulletColor} mt-3 flex-shrink-0`}></div>
            <span className={`text-lg ${currentTheme.contentText} leading-relaxed`}>
              {trimmedLine.replace(/^[•-]\s*/, '')}
            </span>
          </div>
        );
      }
      
      return (
        <p key={index} className={`text-lg ${currentTheme.contentText} leading-relaxed mb-4`}>
          {trimmedLine}
        </p>
      );
    }).filter(Boolean);
  };

  if (slide.type === 'title') {
    return (
      <div className={`w-full h-full ${currentTheme.titleBg} flex flex-col items-center justify-center p-12 rounded-lg shadow-2xl ${className}`}>
        <div className="text-center">
          <h1 className={`text-4xl md:text-5xl font-bold ${currentTheme.titleText} mb-6 leading-tight`}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className={`text-xl md:text-2xl ${currentTheme.titleText} opacity-90 font-light`}>
              {slide.subtitle}
            </p>
          )}
        </div>
        <div className="absolute bottom-8 left-8">
          <div className="w-16 h-1 bg-white opacity-30 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (slide.type === 'content') {
    return (
      <div className={`w-full h-full ${currentTheme.contentBg} rounded-lg shadow-2xl overflow-hidden ${className}`}>
        {/* Header */}
        <div className={`${currentTheme.titleBg} p-8`}>
          <h2 className={`text-2xl md:text-3xl font-bold ${currentTheme.titleText} leading-tight`}>
            {slide.title}
          </h2>
        </div>
        
        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-none">
            {formatContent(slide.content)}
          </div>
        </div>
        
        {/* Footer decoration */}
        <div className="h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>
    );
  }

  return null;
}