// OpenAI service for generating slides and quiz content
import OpenAI from 'openai';

// Initialize OpenAI client
// In a real production app, this would be stored securely in environment variables
// For the demo, we'll use a mockup unless a real key is provided
let OPENAI_API_KEY = localStorage.getItem('openai_api_key') || '';

// Function to set the API key
export function setApiKey(key: string) {
  OPENAI_API_KEY = key;
  localStorage.setItem('openai_api_key', key);
}

// Function to check if API key exists
export function hasApiKey(): boolean {
  // Always return true to bypass the API key check
  return true;
}

// Always return null to force using the mock service
function getOpenAIClient() {
  // Always return null to use the mock service instead of the real OpenAI API
  return null;
}

// Sample slide templates for visual variety
const slideTemplates = {
  titleSlide: {
    layout: "center",
    backgroundColors: ["#1a73e8", "#4285f4", "#0f9d58", "#f4b400", "#db4437"],
    backgroundImages: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0",
      "https://images.unsplash.com/photo-1551434678-e076c223a692"
    ]
  },
  contentSlide: {
    layouts: ["left", "right", "split", "centered"],
    backgroundColors: ["#f8f9fa", "#e8eaed", "#f1f3f4", "#ffffff"]
  },
  bulletSlide: {
    iconTypes: ["check", "arrow", "dot", "number"]
  },
  quoteSlide: {
    layouts: ["centered", "bottom-right", "full-screen"]
  },
  comparisonSlide: {
    layout: "split-screen"
  },
  imageSlide: {
    layouts: ["full-screen", "image-right", "image-left"]
  },
  dataSlide: {
    chartTypes: ["bar", "pie", "line"]
  }
};

// Mock function to simulate API response for development
async function mockCompletion(prompt: string): Promise<Record<string, unknown>> {
  console.log('Using mock OpenAI service (no API key provided)');
  
  // Wait to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Parse the transcript to extract content
  const lines = prompt.split('\n');
  let transcript = '';
  let parseMode = false;
  
  for (const line of lines) {
    if (line.includes('TRANSCRIPT:')) {
      parseMode = true;
      continue;
    } else if (parseMode && (line.includes('FORMAT:') || line.includes('INSTRUCTIONS:'))) {
      parseMode = false;
    }
    
    if (parseMode && line.trim()) {
      transcript += line + ' ';
    }
  }
  
  // For slides generation
  if (prompt.includes('generate slides')) {
    const courseTitle = extractCourseTitle(prompt);
    return mockGenerateSlides(transcript, courseTitle);
  }
  
  // For quiz generation
  if (prompt.includes('generate quiz questions')) {
    return mockGenerateQuizzes(transcript);
  }
  
  return { error: 'Unsupported mock request' };
}

// Extract course title from the prompt
function extractCourseTitle(prompt: string): string {
  const titleMatch = prompt.match(/COURSE TITLE:\s*([^\n]+)/);
  return titleMatch ? titleMatch[1] : "Course Overview";
}

// Generate a suitable stock image suggestion based on content keywords
function suggestImageUrl(keywords: string[]): string {
  const imageTopics: Record<string, string> = {
    regulation: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    compliance: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d",
    insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    policy: "https://images.unsplash.com/photo-1554224155-8d04cb21ed1c",
    management: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    risk: "https://images.unsplash.com/photo-1422728280635-45167d8b7197",
    client: "https://images.unsplash.com/photo-1560250056-07ba64664864",
    professional: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
    security: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
    digital: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    finance: "https://images.unsplash.com/photo-1553729784-e91953dec042",
    technology: "https://images.unsplash.com/photo-1518770660439-4636190af475"
  };
  
  // Default image if no match
  const defaultImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173";
  
  // Find the first matching keyword
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    for (const [topic, url] of Object.entries(imageTopics)) {
      if (lowerKeyword.includes(topic)) {
        return url;
      }
    }
  }
  
  return defaultImage;
}

// Generate a random color from a professional color palette
function getRandomColor(): string {
  const colors = [
    "#1a73e8", // Google blue
    "#4285f4", // Light blue
    "#0f9d58", // Green
    "#f4b400", // Yellow
    "#db4437", // Red
    "#673ab7", // Purple
    "#3f51b5", // Indigo
    "#009688", // Teal
    "#ff5722", // Deep orange
    "#607d8b"  // Blue grey
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function mockGenerateSlides(transcript: string, courseTitle: string): Record<string, unknown> {
  // Split transcript into sections (longer, meaningful chunks)
  const paragraphs = transcript.split(/\.\s+/).filter(p => p.trim().length >= 15);
  const slides = [];
  
  // Extract significant keywords for theming
  const keywords = transcript.match(/\b[A-Za-z]{5,}\b/g) || [];
  const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
  const themeColor = getRandomColor();
  
  // Create more visually engaging title slide
  slides.push({
    type: "title",
    layout: "centered",
    title: courseTitle || "Course Overview",
    subtitle: "Professional Development Module",
    backgroundType: "gradient",
    backgroundColor: themeColor,
    backgroundGradient: `linear-gradient(45deg, ${themeColor}, ${themeColor}aa)`,
    imageUrl: suggestImageUrl(uniqueKeywords),
    presentationStyle: "modern"
  });
  
  // Add a visual overview slide
  const overviewTopics = paragraphs.slice(0, Math.min(4, paragraphs.length))
    .map(p => {
      const words = p.split(' ');
      let topic = words.slice(0, 2).join(' ');
      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
      return topic;
    });
  
  slides.push({
    type: "overview",
    layout: "grid",
    title: "What We'll Cover",
    bullets: overviewTopics,
    backgroundType: "solid",
    backgroundColor: "#f8f9fa",
    iconType: "number",
    visualization: "grid"
  });
  
  // Process paragraphs into various slide types for visual variety
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (paragraph.length < 15) continue;
    
    // Extract key terms for title and visual elements
    const words = paragraph.split(' ');
    const significantWords = words.filter(word => 
      word.length > 5 || 
      uniqueKeywords.includes(word.toLowerCase())
    );
    
    // Create more descriptive slide titles
    let title = "";
    let slideType = "content";
    
    // Look for key phrases that might indicate slide content
    if (paragraph.toLowerCase().includes("regulation")) {
      title = "Regulatory Framework";
    } else if (paragraph.toLowerCase().includes("requirement")) {
      title = "Essential Requirements";
    } else if (paragraph.toLowerCase().includes("compli")) {
      title = "Compliance Standards";
    } else if (paragraph.toLowerCase().includes("policy")) {
      title = "Policy Guidelines";
    } else if (paragraph.toLowerCase().includes("procedure")) {
      title = "Implementation Procedures";
    } else if (paragraph.toLowerCase().includes("risk")) {
      title = "Risk Management";
      slideType = "infographic";
    } else if (paragraph.toLowerCase().includes("benefit")) {
      title = "Key Benefits";
      slideType = "comparison";
    } else {
      // Create a descriptive title using significant words
      title = significantWords.length > 0 
        ? significantWords.slice(0, 2).join(' ') 
        : words.slice(0, 3).join(' ');
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    // Add variety in slide layouts and styles
    const layouts = ["left-aligned", "right-aligned", "centered"];
    const layout = layouts[i % layouts.length];
    
    // Suggest relevant image based on content keywords
    const imageKeywords = [...uniqueKeywords, ...significantWords.map(w => w.toLowerCase())];
    const imageUrl = suggestImageUrl(imageKeywords);
    
    // Create different slide types for visual variety
    if (i % 5 === 0) { // Every 5th slide is a quote slide for variety
      slides.push({
        type: "quote",
        layout: "centered",
        quote: paragraph.split('.')[0] + ".",
        attribution: "Industry Expert",
        backgroundType: "image",
        imageUrl: imageUrl,
        overlayColor: "rgba(0,0,0,0.4)"
      });
    } 
    else if (i % 4 === 0) { // Every 4th slide is image-focused
      slides.push({
        type: "image",
        layout: "split",
        title: title,
        content: paragraph.length > 200 ? paragraph.substring(0, 200) + "..." : paragraph,
        imageUrl: imageUrl,
        imagePosition: "right",
        backgroundColor: "#ffffff"
      });
    }
    else if (i % 3 === 0) { // Every 3rd slide has bullets
      // Split paragraph into bullet points
      let bulletPoints;
      if (paragraph.includes(',')) {
        bulletPoints = paragraph.split(',').map(point => point.trim());
      } else {
        const sentenceBreaks = paragraph.split(/\.|\?|!/).filter(s => s.trim().length > 0);
        bulletPoints = sentenceBreaks.length > 1 
          ? sentenceBreaks.map(s => s.trim()) 
          : createBulletPoints(paragraph);
      }
      
      slides.push({
        type: "bullet",
        layout: "standard",
        title: title,
        bullets: bulletPoints,
        iconType: ["check", "arrow", "dot"][Math.floor(Math.random() * 3)],
        backgroundColor: "#f8f9fa",
        visualStyle: "clean"
      });
    }
    else {
      // Standard content slide with visual enhancements
      slides.push({
        type: "content",
        layout: layout,
        title: title,
        content: paragraph,
        visualAccent: themeColor,
        backgroundColor: "#ffffff"
      });
    }
    
    // Add some specialized slide types for extra visual interest
    if (i > 0 && i % 7 === 0 && i < paragraphs.length - 1) {
      // Add a comparison or two-column slide
      const nextParagraph = paragraphs[i+1].trim();
      if (nextParagraph.length >= 15) {
        slides.push({
          type: "comparison",
          layout: "two-column",
          title: "Comparing Concepts",
          leftTitle: title,
          leftContent: paragraph.length > 150 ? paragraph.substring(0, 150) + "..." : paragraph,
          rightTitle: "Related Consideration",
          rightContent: nextParagraph.length > 150 ? nextParagraph.substring(0, 150) + "..." : nextParagraph,
          backgroundColor: "#e8eaed",
          dividerColor: themeColor
        });
        i++; // Skip the next paragraph as we've used it
      }
    }
  }
  
  // Add a summary slide at the end
  slides.push({
    type: "summary",
    layout: "centered",
    title: "Key Takeaways",
    bullets: extractKeyTakeaways(transcript),
    backgroundType: "gradient",
    backgroundColor: themeColor,
    backgroundGradient: `linear-gradient(135deg, ${themeColor}aa, ${themeColor})`,
    iconType: "check",
    textColor: "#ffffff"
  });
  
  return {
    choices: [{
      message: {
        content: JSON.stringify({
          slides: slides
        })
      }
    }]
  };
}

// Create meaningful bullet points from a paragraph
function createBulletPoints(text: string): string[] {
  // Create 3-4 bullet points
  const words = text.split(' ');
  const pointCount = Math.min(Math.ceil(words.length / 15), 4);
  const pointLength = Math.floor(words.length / pointCount);
  
  const points = [];
  for (let i = 0; i < pointCount; i++) {
    const start = i * pointLength;
    const end = (i === pointCount - 1) ? words.length : (i + 1) * pointLength;
    const bulletText = words.slice(start, end).join(' ');
    // Add a bullet prefix for better readability
    const bulletPrefix = ["Consider", "Understand", "Remember", "Note that", "Focus on"][i % 5];
    points.push(bulletPrefix + " " + bulletText.trim().toLowerCase());
  }
  
  return points;
}

// Extract key takeaways from transcript
function extractKeyTakeaways(transcript: string): string[] {
  // Split by sentence and find important points
  const sentences = transcript.split(/\.|\?|!/).filter(s => s.trim().length > 15);
  const takeaways = [];
  
  // Look for sentences with key indicator words
  const indicatorWords = ["important", "essential", "critical", "key", "must", "should", "remember"];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (indicatorWords.some(word => lowerSentence.includes(word))) {
      takeaways.push(sentence.trim());
    }
  }
  
  // If we don't have enough indicator-based takeaways, add some general ones
  if (takeaways.length < 3) {
    const shortSentences = sentences
      .filter(s => s.split(' ').length < 20)
      .slice(0, 5 - takeaways.length);
    
    takeaways.push(...shortSentences);
  }
  
  // Return up to 5 takeaways
  return takeaways.slice(0, 5).map(t => t.charAt(0).toUpperCase() + t.slice(1));
}

function mockGenerateQuizzes(transcript: string): Record<string, unknown> {
  // Extract meaningful content from transcript
  const sentences = transcript.split(/[.?]+/).filter(s => s.trim().length > 10);
  const keywords = transcript.match(/\b[A-Za-z]{5,}\b/g) || [];
  const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 5);
  
  // Create more engaging question types
  const questionTypes = [
    {
      type: "knowledge",
      format: (keyword: string) => `What is the significance of ${keyword} in this context?`,
      options: (keyword: string) => [
        `${keyword} is a fundamental element of professional practice`,
        `${keyword} is primarily related to regulatory compliance`,
        `${keyword} is a tool for risk management`,
        `${keyword} is not directly relevant to insurance practices`
      ]
    },
    {
      type: "application",
      format: (keyword: string) => `How would ${keyword} be applied in a real-world scenario?`,
      options: (keyword: string) => [
        `By incorporating ${keyword} into daily client interactions`,
        `Through formal documentation in compliance reports`,
        `By consulting specialists about ${keyword} implementation`,
        `${keyword} is theoretical and rarely applied in practice`
      ]
    },
    {
      type: "analysis",
      format: (keyword: string) => `Which statement best analyzes the relationship between ${keyword} and professional responsibility?`,
      options: (keyword: string) => [
        `${keyword} directly impacts ethical decision-making`,
        `${keyword} is important but secondary to legal requirements`,
        `${keyword} serves as the foundation for professional standards`,
        `The connection between ${keyword} and professional responsibility is minimal`
      ]
    },
    {
      type: "scenario",
      format: (keyword: string) => `A client asks about ${keyword}. What is the most appropriate response?`,
      options: (keyword: string) => [
        `Provide a detailed explanation of ${keyword} and its implications`,
        `Refer the client to educational resources about ${keyword}`,
        `Consult with a supervisor before discussing ${keyword}`,
        `Inform the client that ${keyword} is outside your scope of expertise`
      ]
    }
  ];
  
  const questions = [];
  
  // Generate questions based on significant content
  const significantKeywords = uniqueKeywords
    .filter(k => !['should', 'would', 'could', 'about', 'their', 'there'].includes(k.toLowerCase()))
    .slice(0, Math.min(8, uniqueKeywords.length));
  
  // Create varied question types
  for (let i = 0; i < Math.min(5, significantKeywords.length); i++) {
    const keyword = significantKeywords[i];
    const questionTemplate = questionTypes[i % questionTypes.length];
    
    questions.push({
      type: questionTemplate.type,
      question: questionTemplate.format(keyword),
      options: questionTemplate.options(keyword),
      correctAnswer: Math.floor(Math.random() * 3),  // Randomly select correct answer for mock
      explanation: `This question tests understanding of ${keyword} in the professional context.`,
      difficulty: ["basic", "intermediate", "advanced"][Math.floor(Math.random() * 3)]
    });
  }
  
  // Extract a scenario from the transcript if possible
  const longerSentences = sentences.filter(s => s.length > 50);
  if (longerSentences.length > 0) {
    const scenario = longerSentences[Math.floor(Math.random() * longerSentences.length)];
    
    questions.push({
      type: "scenario-based",
      question: `Based on this scenario: "${scenario.trim()}", what would be the most appropriate action?`,
      options: [
        "Document the situation and consult company policy",
        "Notify your supervisor immediately",
        "Follow standard industry best practices",
        "Seek additional client information before proceeding"
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: "This question tests the application of knowledge to real-world scenarios.",
      difficulty: "advanced"
    });
  }
  
  // Add a summary question that pulls from actual transcript content
  const topicTerms = {
    "regulation": "Regulatory compliance requirements",
    "compliance": "Regulatory compliance requirements",
    "customer": "Customer service best practices",
    "client": "Client relationship management",
    "ethic": "Professional ethics standards",
    "standard": "Professional standards",
    "risk": "Risk management principles",
    "technology": "Insurance technology applications",
    "professional": "Professional development"
  };
  
  let mainTopic = "Insurance industry knowledge";
  for (const [term, topic] of Object.entries(topicTerms)) {
    if (transcript.toLowerCase().includes(term)) {
      mainTopic = topic;
      break;
    }
  }
  
  questions.push({
    type: "summary",
    question: "Which of the following best summarizes the main focus of this course?",
    options: [
      mainTopic,
      "Marketing strategies for insurance products",
      "Technical insurance policy language",
      "Insurance company organizational structure"
    ],
    correctAnswer: 0,
    explanation: "This question assesses comprehension of the overall course focus.",
    difficulty: "basic"
  });
  
  return {
    choices: [{
      message: {
        content: JSON.stringify({
          quizzes: questions
        })
      }
    }]
  };
}

// Function to generate slide content from transcript
export async function generateSlidesFromTranscript(transcript: string, courseTitle: string): Promise<Record<string, unknown>> {
  try {
    // If no API key is provided, use mock service
    if (!OPENAI_API_KEY) {
      return mockCompletion(`
        INSTRUCTIONS: generate slides from transcript
        COURSE TITLE: ${courseTitle}
        TRANSCRIPT: ${transcript}
        FORMAT: JSON with slide titles and content
      `);
    }
    
    // Real API call
    const openai = getOpenAIClient();
    if (!openai) throw new Error('OpenAI client not initialized');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are an expert educational content creator who creates effective slides from course transcripts. Create a structured set of slides with clear titles and content that effectively summarize and organize the transcript."
        },
        {
          role: "user",
          content: `
            Please analyze this course transcript and create 5-10 educational slides that effectively teach the material.
            Each slide should have a clear title and content that captures key points.
            Vary the slide types between: content slides with paragraphs, bullet point slides, and question slides.
            Include a title slide at the beginning.
            Organize the material in a logical learning sequence.
            
            COURSE TITLE: ${courseTitle}
            
            TRANSCRIPT:
            ${transcript}
            
            FORMAT YOUR RESPONSE AS JSON:
            {
              "slides": [
                {
                  "title": "slide title",
                  "content": "paragraph content or null if bullets are used",
                  "bullets": ["bullet point 1", "bullet point 2"] // include only if slide uses bullet points
                }
              ]
            }
          `
        }
      ],
      temperature: 0.7,
    });
    
    return response;
  } catch (error) {
    console.error('Error generating slides:', error);
    throw new Error('Failed to generate slides from transcript');
  }
}

// Function to generate quiz questions from transcript
export async function generateQuizQuestionsFromTranscript(transcript: string): Promise<Record<string, unknown>> {
  try {
    // If no API key is provided, use mock service
    if (!OPENAI_API_KEY) {
      return mockCompletion(`
        INSTRUCTIONS: generate quiz questions from transcript
        TRANSCRIPT: ${transcript}
        FORMAT: JSON with questions, options and correct answers
      `);
    }
    
    // Real API call
    const openai = getOpenAIClient();
    if (!openai) throw new Error('OpenAI client not initialized');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are an expert assessment designer who creates meaningful quiz questions to test understanding of course material."
        },
        {
          role: "user",
          content: `
            Please analyze this course transcript and create 3-5 multiple-choice quiz questions that test understanding of key concepts.
            Each question should have 4 options with only one correct answer.
            Questions should assess comprehension of important concepts rather than trivial details.
            Mix different levels of difficulty and cognitive processing (recall, application, analysis).
            
            TRANSCRIPT:
            ${transcript}
            
            FORMAT YOUR RESPONSE AS JSON:
            {
              "quizzes": [
                {
                  "question": "question text",
                  "options": ["option 1", "option 2", "option 3", "option 4"],
                  "correctAnswer": 0 // index of correct option (0-3)
                }
              ]
            }
          `
        }
      ],
      temperature: 0.7,
    });
    
    return response;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions from transcript');
  }
}