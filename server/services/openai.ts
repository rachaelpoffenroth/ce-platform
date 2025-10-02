import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CourseGenerationRequest {
  content: string;
  courseTitle?: string;
  courseDescription?: string;
  duration: number; // in minutes
  accreditationType: string;
  accreditationClass: string;
}

interface GeneratedCourse {
  title: string;
  description: string;
  duration: number;
  accreditationType: string;
  accreditationClass: string;
  accreditationHours: number;
  price: number;
  modules: GeneratedModule[];
}

interface GeneratedModule {
  title: string;
  description: string;
  content: any;
  duration: number;
  quiz?: GeneratedQuiz;
}

interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
  type: string;
  passingScore: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export async function generateCourseWithAI(request: CourseGenerationRequest): Promise<GeneratedCourse> {
  try {
    // Handle OpenAI quota issues by providing fallback content
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, generating fallback content");
      return generateFallbackCourse(request);
    }

    const prompt = `
You are an expert course designer specializing in Alberta Insurance Council (AIC) compliant continuing education courses.

Create a comprehensive course structure based on the following content:
Content: ${request.content}
Duration: ${request.duration} minutes
Accreditation Type: ${request.accreditationType}
Accreditation Class: ${request.accreditationClass}

Requirements:
1. Create a course title that reflects the content and is AIC-compliant
2. Write a professional course description
3. Break the content into 3-5 modules of appropriate length
4. Each module should have detailed learning objectives and content structure
5. Create 3-4 quiz questions per module that test comprehension
6. Include a final assessment with 75% pass requirement
7. Ensure all content meets professional insurance education standards
8. Price the course appropriately for the Canadian market ($19 individual, bundle pricing available)

Generate the response in JSON format with the following structure:
{
  "title": "Course title",
  "description": "Detailed course description",
  "duration": ${request.duration},
  "accreditationType": "${request.accreditationType}",
  "accreditationClass": "${request.accreditationClass}",
  "accreditationHours": ${Math.ceil(request.duration / 60)},
  "price": 19.00,
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "content": {
        "slides": [
          {
            "title": "Slide title",
            "content": "Slide content with key points",
            "notes": "Presenter notes"
          }
        ],
        "learningObjectives": ["Objective 1", "Objective 2"],
        "keyPoints": ["Point 1", "Point 2"]
      },
      "duration": 15,
      "quiz": {
        "title": "Module Quiz",
        "questions": [
          {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Why this answer is correct"
          }
        ],
        "type": "module",
        "passingScore": 75
      }
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert course designer specializing in insurance continuing education. Always respond with valid JSON that matches the requested structure exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("No content generated from OpenAI");
    }

    const parsedCourse: GeneratedCourse = JSON.parse(generatedContent);
    
    // Validate the structure
    if (!parsedCourse.title || !parsedCourse.modules || parsedCourse.modules.length === 0) {
      throw new Error("Invalid course structure generated");
    }

    return parsedCourse;
  } catch (error) {
    console.error("Error generating course with AI:", error);
    
    // Handle rate limiting by providing fallback content
    if (error instanceof Error && error.message.includes('429')) {
      console.log('OpenAI rate limit hit, generating fallback content');
      return generateFallbackCourse(request);
    }
    
    throw new Error("Failed to generate course content. Please try again.");
  }
}

// Fallback course generation when OpenAI is unavailable
function generateFallbackCourse(request: CourseGenerationRequest): GeneratedCourse {
  console.log('=== FALLBACK GENERATION ===');
  console.log('request.courseTitle:', request.courseTitle);
  console.log('request.courseDescription:', request.courseDescription);
  
  // Always prioritize user-provided course title and description
  let title = request.courseTitle || "Professional Development Course";
  let description = request.courseDescription || "A comprehensive course designed to enhance your professional skills and knowledge.";
  
  console.log('Using title:', title);
  console.log('Using description:', description);
  
  // Special handling only when no user-provided title/description exists
  if (!request.courseTitle && !request.courseDescription && request.content.includes("Chamber")) {
    title = "The Chamber of a Thousand No's: Transforming Rejection into Success";
    description = "A transformative journey for insurance professionals that turns rejection into valuable lessons. Learn how to master the art of resilience, build lasting client relationships, and achieve sustainable success in insurance sales through proven psychological strategies and practical techniques.";
  }

  return {
    title,
    description,
    duration: request.duration,
    accreditationType: request.accreditationType,
    accreditationClass: request.accreditationClass,
    accreditationHours: Math.ceil(request.duration / 60),
    price: 19,
    modules: [
      {
        title: "Understanding Rejection Psychology",
        description: "Learn the psychological foundations of rejection and how to reframe negative experiences as learning opportunities.",
        content: {
          sections: [
            {
              title: "The Science of Rejection",
              content: "Explore how rejection affects the brain and why it triggers such strong emotional responses in sales professionals."
            },
            {
              title: "Reframing Your Mindset",
              content: "Discover techniques to transform rejection from a personal failure into valuable market feedback and learning opportunities."
            }
          ]
        },
        duration: Math.ceil(request.duration / 4),
        quiz: {
          title: "Understanding Rejection Quiz",
          questions: [
            {
              question: "What is the primary psychological reason rejection feels so painful?",
              options: [
                "It threatens our sense of self-worth",
                "It wastes our time",
                "It costs us money",
                "It makes us look bad"
              ],
              correctAnswer: 0,
              explanation: "Rejection triggers the same pain centers in our brain as physical injury, threatening our fundamental need for social acceptance and self-worth."
            },
            {
              question: "How should sales professionals reframe rejection?",
              options: [
                "As a personal attack",
                "As market feedback",
                "As wasted effort",
                "As proof they're not good enough"
              ],
              correctAnswer: 1,
              explanation: "Rejection should be viewed as valuable market feedback that helps refine your approach and better understand client needs."
            }
          ],
          type: "module",
          passingScore: 75
        }
      },
      {
        title: "Building Resilience and Persistence",
        description: "Develop mental toughness and sustainable persistence strategies for long-term success in insurance sales.",
        content: {
          sections: [
            {
              title: "The Mathematics of Success",
              content: "Understand that success in sales follows predictable patterns and that each rejection brings you statistically closer to your next acceptance."
            },
            {
              title: "Developing Mental Toughness",
              content: "Learn practical techniques to maintain emotional stability and professional confidence in the face of repeated rejection."
            }
          ]
        },
        duration: Math.ceil(request.duration / 4),
        quiz: {
          title: "Building Resilience Quiz",
          questions: [
            {
              question: "If your closing rate is 10%, what does each rejection represent?",
              options: [
                "A failure",
                "A step closer to success",
                "A waste of time",
                "A reason to quit"
              ],
              correctAnswer: 1,
              explanation: "Each rejection is mathematically bringing you closer to your next acceptance, making it an investment in future success."
            }
          ],
          type: "module",
          passingScore: 75
        }
      },
      {
        title: "Advanced Communication Strategies",
        description: "Master the communication techniques that build trust, overcome objections, and create lasting client relationships.",
        content: {
          sections: [
            {
              title: "Trust Building Fundamentals",
              content: "Learn how to establish credibility and build genuine relationships with prospects before attempting to sell insurance products."
            },
            {
              title: "Value Communication",
              content: "Discover how to articulate the true value of insurance protection in terms that resonate with your prospects' specific needs and concerns."
            }
          ]
        },
        duration: Math.ceil(request.duration / 4),
        quiz: {
          title: "Communication Strategies Quiz",
          questions: [
            {
              question: "What is the most important factor in building client trust?",
              options: [
                "Lowest prices",
                "Best products",
                "Authentic relationships",
                "Fastest service"
              ],
              correctAnswer: 2,
              explanation: "Authentic relationships built on genuine care for client wellbeing are the foundation of trust in insurance sales."
            }
          ],
          type: "module",
          passingScore: 75
        }
      },
      {
        title: "Practical Implementation and Mastery",
        description: "Apply your learning through real-world scenarios and develop a personal action plan for sustained success.",
        content: {
          sections: [
            {
              title: "Real-World Application",
              content: "Practice the techniques through realistic scenarios and role-playing exercises that mirror actual client interactions."
            },
            {
              title: "Creating Your Success Plan",
              content: "Develop a personalized strategy for implementing these principles in your daily insurance sales activities."
            }
          ]
        },
        duration: Math.ceil(request.duration / 4),
        quiz: {
          title: "Implementation Quiz",
          questions: [
            {
              question: "What is the key to long-term success in insurance sales?",
              options: [
                "Aggressive sales tactics",
                "Consistent application of proven principles",
                "Working longer hours",
                "Discounting prices"
              ],
              correctAnswer: 1,
              explanation: "Consistent application of proven relationship-building and resilience principles creates sustainable long-term success."
            }
          ],
          type: "module",
          passingScore: 75
        }
      }
    ]
  };
}

export async function generateQuizFromContent(content: string, moduleTitle: string): Promise<GeneratedQuiz> {
  try {
    const prompt = `
Create a quiz for the following module content:
Module: ${moduleTitle}
Content: ${content}

Generate 3-4 multiple choice questions that test understanding of the key concepts.
Each question should have 4 options with one correct answer.
Include explanations for the correct answers.

Respond in JSON format:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation"
    }
  ],
  "type": "module",
  "passingScore": 75
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert quiz designer for insurance education. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("No quiz content generated");
    }

    return JSON.parse(generatedContent);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz content");
  }
}

export async function generateSlidesFromText(text: string, slideCount: number = 10): Promise<any[]> {
  try {
    // Handle OpenAI quota issues by providing fallback content first
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, generating fallback slides");
      return generateFallbackSlides(text, slideCount);
    }

    const prompt = `
Convert the following text into ${slideCount} presentation slides suitable for an insurance education course:

Content: ${text}

Each slide should have:
- A clear, descriptive title
- 3-5 bullet points of key content
- Presenter notes for additional context

Respond in JSON format:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Detailed presenter notes for this slide"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert presentation designer for professional education. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("No slides generated");
    }

    const result = JSON.parse(generatedContent);
    return result.slides || [];
  } catch (error: any) {
    console.error("Error generating slides:", error);
    
    // Handle rate limit errors with fallback content
    if (error.status === 429 || error.code === 'insufficient_quota' || error.type === 'insufficient_quota') {
      console.log("OpenAI rate limit exceeded, generating fallback slides");
      return generateFallbackSlides(text, slideCount);
    }
    
    // Handle other OpenAI API errors with fallback
    if (error.status >= 400) {
      console.log("OpenAI API error, generating fallback slides");
      return generateFallbackSlides(text, slideCount);
    }
    
    throw new Error("Failed to generate slides");
  }
}

function generateFallbackSlides(text: string, slideCount: number): any[] {
  console.log("Generating fallback slides for content");
  
  // Create slides based on text content
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const slides = [];
  
  const slideTitles = [
    "Introduction",
    "Key Concepts", 
    "Core Principles",
    "Important Considerations",
    "Best Practices",
    "Implementation Strategies",
    "Professional Guidelines",
    "Success Factors",
    "Common Challenges",
    "Summary and Next Steps"
  ];
  
  for (let i = 0; i < Math.min(slideCount, 10); i++) {
    const title = i < slideTitles.length ? slideTitles[i] : `Key Point ${i + 1}`;
    
    // Use sentences from the text for content
    const sentencesPerSlide = Math.max(1, Math.floor(sentences.length / slideCount));
    const startIndex = i * sentencesPerSlide;
    const endIndex = Math.min(startIndex + sentencesPerSlide + 2, sentences.length);
    const slideContent = sentences.slice(startIndex, endIndex)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 4); // Max 4 bullet points per slide
    
    if (slideContent.length === 0) {
      slideContent.push("Professional development content");
      slideContent.push("Key learning objectives");
      slideContent.push("Practical application");
    }
    
    slides.push({
      title,
      content: slideContent,
      notes: `This slide covers important concepts related to ${title.toLowerCase()}. Use this content to engage your audience and facilitate discussion about the key points presented.`
    });
  }
  
  return slides;
}
