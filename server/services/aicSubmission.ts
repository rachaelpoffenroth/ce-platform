import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ObjectStorageService } from '../objectStorage';
import type { User, Course, CourseModule, Quiz } from '@shared/schema';

interface AICSubmissionData {
  course: Course;
  modules: CourseModule[];
  quizzes: Quiz[];
  instructor: User;
}

export async function generateAICSubmissionPDF(data: AICSubmissionData): Promise<string> {
  try {
    const { course, modules, quizzes, instructor } = data;
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, left: 50, right: 50, bottom: 50 }
    });
    
    const tempPath = path.join('/tmp', `aic_submission_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);
    
    // Generate all sections of the AIC submission
    generateRequestForm(doc, data);
    doc.addPage();
    generateCECertificateTemplate(doc, data);
    doc.addPage();
    generateDetailedCourseOutline(doc, data);
    
    // Add course materials (slides) if available
    if (modules.length > 0) {
      doc.addPage();
      generateCourseMaterials(doc, data);
    }
    
    doc.end();
    
    // Wait for PDF generation to complete
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    // Upload to object storage
    const pdfBuffer = fs.readFileSync(tempPath);
    const objectStorageService = new ObjectStorageService();
    const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: pdfBuffer,
      headers: {
        'Content-Type': 'application/pdf'
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload AIC submission PDF');
    }
    
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    return uploadUrl.split('?')[0];
    
  } catch (error) {
    console.error('Error generating AIC submission PDF:', error);
    throw new Error('Failed to generate AIC submission PDF');
  }
}

function generateRequestForm(doc: PDFKit.PDFDocument, data: AICSubmissionData) {
  const { course, instructor } = data;
  
  // Header
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Alberta Accreditation Committee', 0, 50, { align: 'center' })
     .text('REQUEST FOR COURSE ACCREDITATION', 0, 70, { align: 'center' });
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('All questions must be answered for the request to be considered', 0, 90, { align: 'center' });
  
  // Checklist
  doc.fontSize(10)
     .font('Helvetica')
     .text('Please complete the following as acknowledgement that you have visited the Alberta Accreditation Committee website,', 50, 120)
     .text('reviewed the current Instructions and the submission meets all of the requirements:', 50, 135);
  
  const checklistItems = [
    'The Request Form is fully completed; all questions have been answered.',
    'The submission contains a sample CE Certificate compliant with the Course Guidelines (including licensee\'s CIPR#).',
    'The submission contains a detailed course outline/syllabus that also includes the purpose of the course.',
    'The submission is a combined single PDF document (Required Order: Request Form, CE Certificate, Outline, Word, PowerPoint, etc.).',
    'The submission is not scanned. PDF document is created from original files so that all content is searchable.',
    'The document does not exceed 100 pages.',
    'The file size does not exceed 10 MB.',
    'All font sizes (including copies of slides etc.) are 11 or higher. All content must be readable.'
  ];
  
  let currentY = 155;
  checklistItems.forEach((item, index) => {
    doc.fontSize(9)
       .font('Helvetica')
       .text('☑', 55, currentY)
       .text(`${index + 1}. ${item}`, 70, currentY);
    currentY += 20;
  });
  
  // Payment method
  doc.fontSize(9)
     .font('Helvetica')
     .text('☑', 55, currentY)
     .text('9. $100 non-refundable fee payment method', 70, currentY)
     .text('Cheque: ☐     Visa/MasterCard: ☑     Money on account: ☐', 200, currentY);
  
  currentY += 30;
  
  // Course details
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Name of Course/Seminar:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(course.title, 50, currentY + 15);
  
  currentY += 40;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Name of Course Provider:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(instructor.companyName || 'EASY CE', 50, currentY + 15);
  
  currentY += 25;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Contact person at Course Provider:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email || '', 50, currentY + 15);
  
  currentY += 25;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Phone number:', 50, currentY)
     .text('E-mail address:', 250, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(instructor.email || '', 250, currentY + 15);
  
  currentY += 40;
  
  // Course dates
  const startDate = new Date().toLocaleDateString('en-CA');
  const endDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'); // 3 years
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Start date of course:', 50, currentY)
     .text('End date of course:', 250, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(startDate, 50, currentY + 15)
     .text(endDate, 250, currentY + 15);
  
  currentY += 40;
  
  // Method of delivery
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Method of Delivery:', 50, currentY)
     .text('Attendance verified by: (Check all that apply)', 300, currentY);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('(Check all that apply)', 50, currentY + 15);
  
  currentY += 25;
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('☐ In-Person', 50, currentY)
     .text('☐ Sign-in and Sign-out', 300, currentY);
  
  currentY += 15;
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('☐ Webinar', 50, currentY)
     .text('☑ Electronic attendance tracking', 300, currentY);
  
  currentY += 15;
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('☑ Online/Self-Study', 50, currentY)
     .text('☑ Successfully passing an exam (min 60% pass)', 300, currentY);
  
  currentY += 30;
  
  // Target audience
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Target Audience (Which group of professionals is this presentation directed towards?):', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('General Insurance Agents', 50, currentY + 15);
  
  currentY += 35;
  
  // New product question
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Based on the content, is this presentation relating to a new product?', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('Yes ☐     ☑ No', 400, currentY);
  
  currentY += 25;
  
  // Hours requested
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Number of hours requested per Alberta class of insurance: (Indicate below the number of hours)', 50, currentY);
  
  currentY += 20;
  
  const classes = ['Life', 'Accident and Sickness', 'General (P&C)', 'Adjusters'];
  let colX = 50;
  classes.forEach((cls, index) => {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(cls, colX, currentY);
    
    if (cls === 'General (P&C)' && course.accreditationClass === 'General') {
      doc.fontSize(10)
         .font('Helvetica')
         .text(course.accreditationHours?.toString() || '1', colX, currentY + 15);
    } else {
      doc.fontSize(10)
         .font('Helvetica')
         .text('-', colX, currentY + 15);
    }
    
    colX += 120;
  });
  
  currentY += 50;
  
  // Course time (for online, this is N/A)
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Course time*: (Give example of start/end time)', 50, currentY)
     .text('Start time: N/A', 300, currentY)
     .text('End time: N/A', 400, currentY);
  
  doc.fontSize(9)
     .font('Helvetica')
     .text('* For in-person and/or webinar delivery only', 50, currentY + 15);
  
  currentY += 35;
  
  // Breaks and duration
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Duration of lunch: N/A', 200, currentY);
  
  currentY += 15;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Number of breaks / day: N/A')
     .text('Duration of breaks: N/A', 200, currentY)
     .text('Number of days in course: N/A', 350, currentY);
  
  // Add the rest of the form at bottom of page
  if (currentY > 650) {
    doc.addPage();
    currentY = 50;
  }
  
  currentY = doc.page.height - 150;
  
  // Acknowledgment
  doc.fontSize(10)
     .font('Helvetica')
     .text('By completing this application, I acknowledge that I have read the current Guidelines and will abide by all conditions', 50, currentY)
     .text('placed on me by the Alberta Accreditation Committee.', 50, currentY + 12)
     .text('Once the course has been approved, all CE Certificates must reference the Course Name, the assigned Alberta', 50, currentY + 24)
     .text('Accreditation Committee Course ID# and be issued within sixty (60) days of course approval or course completion', 50, currentY + 36)
     .text('date.', 50, currentY + 48);
  
  currentY += 70;
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('Submit Request by e-mail to: accreditation@abcouncil.ab.ca', 0, currentY, { align: 'center' });
  
  currentY += 25;
  
  // Signature and date
  const currentDate = new Date().toLocaleDateString('en-CA');
  const submitterName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email || '';
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(currentDate, 50, currentY)
     .text(submitterName, 300, currentY);
  
  doc.fontSize(9)
     .font('Helvetica')
     .text('Date', 50, currentY + 15)
     .text('Submitted by (Name) (Signature or typed names are acceptable)', 300, currentY + 15);
}

function generateCECertificateTemplate(doc: PDFKit.PDFDocument, data: AICSubmissionData) {
  const { course } = data;
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('CONTINUING EDUCATION CERTIFICATE', 0, 100, { align: 'center' });
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('EASY CE', 0, 150, { align: 'center' });
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('This is to certify that _____NAME OF ATTENDEE____________   (CIPR#________),', 50, 200);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`has completed ${course.title}`, 50, 230);
  
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('This course has been awarded credits for the following classes of certificate:', 50, 280);
  
  // Credits table
  const tableTop = 320;
  const leftCol = 200;
  const rightCol = 400;
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('CLASS OF INSURANCE', leftCol, tableTop)
     .text('# of Hours', rightCol, tableTop);
  
  const classes = [
    { name: 'LIFE INSURANCE', hours: course.accreditationClass === 'Life' ? course.accreditationHours?.toString() || '1' : '' },
    { name: 'ACCIDENT AND SICKNESS', hours: course.accreditationClass === 'A&S' ? course.accreditationHours?.toString() || '1' : '' },
    { name: 'GENERAL INSURANCE', hours: course.accreditationClass === 'General' ? course.accreditationHours?.toString() || '1' : '' },
    { name: 'INSURANCE ADJUSTER', hours: course.accreditationClass === 'Adjusters' ? course.accreditationHours?.toString() || '1' : '' }
  ];
  
  let currentY = tableTop + 20;
  classes.forEach(cls => {
    doc.fontSize(10)
       .font('Helvetica')
       .text(cls.name, leftCol, currentY)
       .text(cls.hours, rightCol, currentY);
    currentY += 15;
  });
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('The course was completed on __DATE COURSE COMPLETED__.', 50, currentY + 30);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('Alberta Accreditation Committee Course ID# __________', 50, currentY + 60);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('______________________________________________________', 50, currentY + 120)
     .text('Authorization Signature (electronic signatures accepted)', 50, currentY + 140);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('_______________________________________________________', 50, currentY + 170)
     .text('Printed Name', 50, currentY + 190);
}

function generateDetailedCourseOutline(doc: PDFKit.PDFDocument, data: AICSubmissionData) {
  const { course, modules, quizzes } = data;
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('DETAILED COURSE OUTLINE', 0, 50, { align: 'center' });
  
  let currentY = 100;
  
  // Course overview
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Course Overview', 50, currentY);
  
  currentY += 25;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Title/Course Name:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(course.title, 170, currentY);
  
  currentY += 20;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Description:', 50, currentY);
  
  if (course.description) {
    doc.fontSize(11)
       .font('Helvetica')
       .text(course.description, 50, currentY + 15, { width: 500 });
    currentY += 60;
  } else {
    currentY += 20;
  }
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Duration:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`${course.duration || 60} minutes (${course.accreditationHours || 1} hour)`, 120, currentY);
  
  currentY += 20;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Accreditation Class:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(course.accreditationClass || 'General Insurance (P&C)', 170, currentY);
  
  currentY += 20;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Method of Delivery:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('Online – on demand – Narrative-based continuing education', 170, currentY);
  
  currentY += 20;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Verification of Attendance:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('System verifies and quizzes with 75% passing requirement', 200, currentY);
  
  currentY += 20;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Target Audience:', 50, currentY);
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('General Insurance Brokers/Agents', 150, currentY);
  
  currentY += 40;
  
  // Learning objectives
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Learning Objectives', 50, currentY);
  
  currentY += 25;
  
  const objectives = [
    'Develop professional sales methodology and techniques',
    'Improve rejection resilience and emotional management',
    'Enhance client communication and needs assessment skills',
    'Build systematic follow-up and relationship management systems',
    'Advance career development and industry knowledge'
  ];
  
  objectives.forEach(objective => {
    doc.fontSize(11)
       .font('Helvetica')
       .text(`• ${objective}`, 70, currentY);
    currentY += 20;
  });
  
  currentY += 20;
  
  // Course modules
  if (modules.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Course Modules', 50, currentY);
    
    currentY += 25;
    
    modules.forEach((module, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Module ${index + 1}: ${module.title}`, 50, currentY);
      
      currentY += 20;
      
      if (module.description) {
        doc.fontSize(11)
           .font('Helvetica')
           .text(module.description, 70, currentY, { width: 450 });
        currentY += 40;
      }
      
      if (module.duration) {
        doc.fontSize(10)
           .font('Helvetica-Oblique')
           .text(`Duration: ${module.duration} minutes`, 70, currentY);
        currentY += 20;
      }
      
      currentY += 10;
    });
  }
  
  // Assessment information
  if (currentY > 650) {
    doc.addPage();
    currentY = 50;
  }
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Assessment Strategy', 50, currentY);
  
  currentY += 25;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('• Interactive quizzes throughout each module (3-4 questions per module)', 70, currentY);
  
  currentY += 18;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('• Final comprehensive assessment requiring 75% minimum pass rate', 70, currentY);
  
  currentY += 18;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('• Immediate feedback and remedial learning opportunities', 70, currentY);
  
  currentY += 18;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text('• Certificate generation upon successful completion', 70, currentY);
}

function generateCourseMaterials(doc: PDFKit.PDFDocument, data: AICSubmissionData) {
  const { course, modules } = data;
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('COURSE MATERIALS', 0, 50, { align: 'center' });
  
  let currentY = 100;
  
  doc.fontSize(12)
     .font('Helvetica')
     .text('This section contains the course materials including slide content, learning activities, and assessment materials.', 50, currentY, { width: 500 });
  
  currentY += 40;
  
  modules.forEach((module, moduleIndex) => {
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(`Module ${moduleIndex + 1}: ${module.title}`, 50, currentY);
    
    currentY += 25;
    
    // Add module content if available
    if (module.content && typeof module.content === 'object') {
      const content = module.content as any;
      
      if (content.slides && Array.isArray(content.slides)) {
        content.slides.forEach((slide: any, slideIndex: number) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
          
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`Slide ${slideIndex + 1}: ${slide.title || 'Untitled'}`, 70, currentY);
          
          currentY += 20;
          
          if (slide.content && Array.isArray(slide.content)) {
            slide.content.forEach((point: string) => {
              doc.fontSize(10)
                 .font('Helvetica')
                 .text(`• ${point}`, 90, currentY);
              currentY += 15;
            });
          }
          
          if (slide.notes) {
            doc.fontSize(9)
               .font('Helvetica-Oblique')
               .text(`Notes: ${slide.notes}`, 90, currentY);
            currentY += 20;
          }
          
          currentY += 10;
        });
      }
      
      if (content.learningObjectives && Array.isArray(content.learningObjectives)) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('Learning Objectives:', 70, currentY);
        
        currentY += 18;
        
        content.learningObjectives.forEach((objective: string) => {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`• ${objective}`, 90, currentY);
          currentY += 15;
        });
        
        currentY += 10;
      }
    }
    
    currentY += 20;
  });
}

export function validateAICSubmissionData(data: AICSubmissionData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.course.title) {
    errors.push('Course title is required');
  }
  
  if (!data.course.description) {
    errors.push('Course description is required');
  }
  
  if (!data.course.accreditationClass) {
    errors.push('Accreditation class is required');
  }
  
  if (!data.course.accreditationHours) {
    errors.push('Accreditation hours are required');
  }
  
  if (!data.instructor.firstName && !data.instructor.lastName) {
    errors.push('Instructor name is required');
  }
  
  if (!data.instructor.email) {
    errors.push('Instructor email is required');
  }
  
  if (data.modules.length === 0) {
    errors.push('At least one course module is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
