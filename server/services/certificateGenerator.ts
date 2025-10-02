import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ObjectStorageService } from '../objectStorage';
import type { User, Course, Enrollment } from '@shared/schema';

interface CertificateData {
  user: User;
  course: Course;
  enrollment: Enrollment;
  isAICCompliant: boolean;
}

export async function generateCertificate(data: CertificateData): Promise<string> {
  try {
    const { user, course, enrollment, isAICCompliant } = data;
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margins: { top: 50, left: 50, right: 50, bottom: 50 }
    });
    
    const tempPath = path.join('/tmp', `certificate_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);
    
    if (isAICCompliant) {
      generateAICCompliantCertificate(doc, data);
    } else {
      generateStandardCertificate(doc, data);
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
      throw new Error('Failed to upload certificate');
    }
    
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    return uploadUrl.split('?')[0]; // Return URL without query params
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error('Failed to generate certificate');
  }
}

function generateAICCompliantCertificate(doc: PDFKit.PDFDocument, data: CertificateData) {
  const { user, course, enrollment } = data;
  
  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('CONTINUING EDUCATION CERTIFICATE', 0, 100, { align: 'center' });
  
  // Course provider name
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('EASY CE', 0, 150, { align: 'center' });
  
  // Student information
  const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student';
  const ciprNumber = user.ciprNumber || 'N/A';
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`This is to certify that ${studentName} (CIPR# ${ciprNumber}),`, 0, 200, { align: 'center' });
  
  // Course name
  doc.fontSize(12)
     .font('Helvetica')
     .text(`has completed ${course.title}`, 0, 230, { align: 'center' });
  
  // Credits table
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('This course has been awarded credits for the following classes of certificate:', 0, 280, { align: 'center' });
  
  // Table headers
  const tableTop = 320;
  const leftCol = 200;
  const rightCol = 400;
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('CLASS OF INSURANCE', leftCol, tableTop)
     .text('# of Hours', rightCol, tableTop);
  
  // Table rows
  const classes = [
    { name: 'LIFE INSURANCE', hours: course.accreditationClass === 'Life' ? course.accreditationHours?.toString() || '1' : '-' },
    { name: 'ACCIDENT AND SICKNESS', hours: course.accreditationClass === 'A&S' ? course.accreditationHours?.toString() || '1' : '-' },
    { name: 'GENERAL INSURANCE', hours: course.accreditationClass === 'General' ? course.accreditationHours?.toString() || '1' : '-' },
    { name: 'INSURANCE ADJUSTER', hours: course.accreditationClass === 'Adjusters' ? course.accreditationHours?.toString() || '1' : '-' }
  ];
  
  let currentY = tableTop + 20;
  classes.forEach(cls => {
    doc.fontSize(10)
       .font('Helvetica')
       .text(cls.name, leftCol, currentY)
       .text(cls.hours, rightCol, currentY);
    currentY += 15;
  });
  
  // Completion date
  const completionDate = enrollment.completedAt?.toLocaleDateString('en-CA') || new Date().toLocaleDateString('en-CA');
  doc.fontSize(12)
     .font('Helvetica')
     .text(`The course was completed on ${completionDate}.`, 0, currentY + 30, { align: 'center' });
  
  // AIC Course ID
  const aicCourseId = course.aicCourseId || 'PENDING';
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Alberta Accreditation Committee Course ID# ${aicCourseId}`, 0, currentY + 60, { align: 'center' });
  
  // Signature
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Rachael Poffenroth', 0, currentY + 120, { align: 'center' });
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('Authorization Signature (electronic signatures accepted)', 0, currentY + 140, { align: 'center' });
  
  // Footer
  doc.fontSize(8)
     .font('Helvetica')
     .text('Revised March 15, 2019', 50, doc.page.height - 50);
}

function generateStandardCertificate(doc: PDFKit.PDFDocument, data: CertificateData) {
  const { user, course, enrollment } = data;
  
  // Modern certificate design
  doc.fontSize(32)
     .font('Helvetica-Bold')
     .text('Certificate of Completion', 0, 100, { align: 'center' });
  
  // Decorative line
  doc.moveTo(150, 150)
     .lineTo(doc.page.width - 150, 150)
     .stroke();
  
  // Student name
  const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student';
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(studentName, 0, 200, { align: 'center' });
  
  // Completion text
  doc.fontSize(16)
     .font('Helvetica')
     .text('has successfully completed the course', 0, 250, { align: 'center' });
  
  // Course title
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text(course.title, 0, 290, { align: 'center' });
  
  // Course details
  if (course.description) {
    doc.fontSize(12)
       .font('Helvetica')
       .text(course.description, 100, 340, { 
         width: doc.page.width - 200, 
         align: 'center',
         lineGap: 5
       });
  }
  
  // Duration and completion date
  const duration = course.duration ? `${course.duration} minutes` : '1 hour';
  const completionDate = enrollment.completedAt?.toLocaleDateString() || new Date().toLocaleDateString();
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Duration: ${duration}`, 0, 420, { align: 'center' })
     .text(`Completed on: ${completionDate}`, 0, 440, { align: 'center' });
  
  // Certificate number
  const certNumber = `CERT-${Date.now()}`;
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Certificate #: ${certNumber}`, 50, doc.page.height - 50);
  
  // Date issued
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Issued: ${new Date().toLocaleDateString()}`, doc.page.width - 150, doc.page.height - 50);
}

export async function generateBulkCertificates(enrollments: { user: User; course: Course; enrollment: Enrollment }[]): Promise<string[]> {
  const certificateUrls: string[] = [];
  
  for (const data of enrollments) {
    try {
      const url = await generateCertificate({
        ...data,
        isAICCompliant: data.course.accreditationType === 'AIC'
      });
      certificateUrls.push(url);
    } catch (error) {
      console.error(`Failed to generate certificate for enrollment ${data.enrollment.id}:`, error);
      // Continue with other certificates
    }
  }
  
  return certificateUrls;
}

export function validateCertificateData(data: CertificateData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.user.firstName && !data.user.lastName && !data.user.email) {
    errors.push('Student name or email is required');
  }
  
  if (!data.course.title) {
    errors.push('Course title is required');
  }
  
  if (data.isAICCompliant && !data.user.ciprNumber) {
    errors.push('CIPR number is required for AIC-compliant certificates');
  }
  
  if (data.isAICCompliant && !data.course.accreditationClass) {
    errors.push('Accreditation class is required for AIC-compliant certificates');
  }
  
  if (!data.enrollment.completedAt) {
    errors.push('Course completion date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
