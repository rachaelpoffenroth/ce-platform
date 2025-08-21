// Local storage for course data

// Define types
export interface Slide {
  id: string;
  type: string;
  startTime?: number;
  endTime?: number;
  // Title slide properties
  title?: string;
  subtitle?: string;
  // Content slide properties
  content?: string;
  // Image slide properties
  imageUrl?: string;
  caption?: string;
  // Quiz slide properties
  question?: string;
  options?: string[];
  correctAnswer?: number;
  // Video slide properties
  videoUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  audioFile?: File | null;
  audioUrl?: string | null;
  transcript?: string;
  slides: Slide[];
  status: "draft" | "published" | "archived";
  lastUpdated: string;
  students?: number;
  completion?: number;
  thumbnail?: string; // URL for course thumbnail image
}

// Get all courses from localStorage
export const getAllCourses = (): Course[] => {
  try {
    const coursesJSON = localStorage.getItem('courses');
    if (!coursesJSON) return [];
    
    const courses = JSON.parse(coursesJSON);
    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return [];
  }
};

// Get a specific course by ID
export const getCourseById = (id: string): Course | null => {
  try {
    const courses = getAllCourses();
    return courses.find(course => course.id === id) || null;
  } catch (error) {
    console.error(`Error retrieving course with ID ${id}:`, error);
    return null;
  }
};

// Save a course (create or update)
export const saveCourse = (course: Course): boolean => {
  try {
    const courses = getAllCourses();
    const existingCourseIndex = courses.findIndex(c => c.id === course.id);
    
    // Add metadata if it's missing
    const updatedCourse = {
      ...course,
      lastUpdated: new Date().toISOString(),
      status: course.status || "draft",
      students: course.students || 0,
      completion: course.completion || 0
    };
    
    // Either update existing or add new
    if (existingCourseIndex >= 0) {
      courses[existingCourseIndex] = updatedCourse;
    } else {
      courses.push(updatedCourse);
    }
    
    // Save back to localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    return true;
  } catch (error) {
    console.error('Error saving course:', error);
    return false;
  }
};

// Delete a course
export const deleteCourse = (id: string): boolean => {
  try {
    const courses = getAllCourses();
    const filteredCourses = courses.filter(course => course.id !== id);
    localStorage.setItem('courses', JSON.stringify(filteredCourses));
    return true;
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    return false;
  }
};