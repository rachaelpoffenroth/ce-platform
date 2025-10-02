import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tag, 
  Download, 
  Eye, 
  Settings, 
  MapPin,
  Calendar,
  User,
  Building,
  Award,
  FileText,
  Printer,
  Share,
  CheckCircle
} from "lucide-react";
import type { User as UserType, Course, Enrollment } from "@shared/schema";

interface CertificatePreviewProps {
  course?: Course;
  student?: UserType;
  enrollment?: Enrollment;
  isAICCompliant?: boolean;
  onDownload?: () => void;
  onGenerate?: () => void;
}

interface CertificateData {
  studentName: string;
  ciprNumber: string;
  courseName: string;
  completionDate: string;
  courseProvider: string;
  instructorName: string;
  aicCourseId: string;
  accreditationClass: string;
  accreditationHours: number;
  certificateNumber: string;
}

export default function CertificatePreview({
  course,
  student,
  enrollment,
  isAICCompliant = false,
  onDownload,
  onGenerate
}: CertificatePreviewProps) {
  const [certificateData, setCertificateData] = useState<CertificateData>({
    studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Student Name' : 'John Smith',
    ciprNumber: student?.ciprNumber || '12345678',
    courseName: course?.title || 'The Chamber of a Thousand No\'s',
    completionDate: enrollment?.completedAt ? new Date(enrollment.completedAt).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
    courseProvider: 'EASY CE',
    instructorName: 'Rachael Poffenroth',
    aicCourseId: course?.aicCourseId || 'ACC-2025-001',
    accreditationClass: course?.accreditationClass || 'General',
    accreditationHours: course?.accreditationHours || 1,
    certificateNumber: `CERT-${Date.now()}`
  });

  const [selectedTemplate, setSelectedTemplate] = useState<"aic" | "standard">(isAICCompliant ? "aic" : "standard");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("preview");

  const handleDataUpdate = (field: keyof CertificateData, value: string | number) => {
    setCertificateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const AICCertificateTemplate = () => (
    <div className="bg-white text-black p-8 rounded-lg border-2 border-gray-300 font-serif max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-6">CONTINUING EDUCATION CERTIFICATE</h1>
        
        <div className="mb-6">
          <p className="text-xl font-bold">{certificateData.courseProvider}</p>
        </div>

        <p className="mb-4 text-lg">
          This is to certify that <strong>{certificateData.studentName}</strong> (CIPR# <strong>{certificateData.ciprNumber}</strong>),
        </p>

        <p className="mb-8 text-lg">
          has completed <strong>{certificateData.courseName}</strong>
        </p>

        <div className="mb-8">
          <p className="font-bold text-lg mb-4">This course has been awarded credits for the following classes of certificate:</p>
          
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-4 text-left border border-black">
              {/* Table Header */}
              <div className="p-3 border-r border-b border-black font-bold bg-gray-100">
                CLASS OF INSURANCE
              </div>
              <div className="p-3 border-b border-black font-bold bg-gray-100">
                # of Hours
              </div>
              
              {/* Table Rows */}
              <div className="p-3 border-r border-b border-black">LIFE INSURANCE</div>
              <div className="p-3 border-b border-black text-center">
                {certificateData.accreditationClass === 'Life' ? certificateData.accreditationHours : '-'}
              </div>
              
              <div className="p-3 border-r border-b border-black">ACCIDENT AND SICKNESS</div>
              <div className="p-3 border-b border-black text-center">
                {certificateData.accreditationClass === 'A&S' ? certificateData.accreditationHours : '-'}
              </div>
              
              <div className="p-3 border-r border-b border-black">GENERAL INSURANCE</div>
              <div className="p-3 border-b border-black text-center">
                {certificateData.accreditationClass === 'General' ? certificateData.accreditationHours : '-'}
              </div>
              
              <div className="p-3 border-r border-black">INSURANCE ADJUSTER</div>
              <div className="p-3 border-black text-center">
                {certificateData.accreditationClass === 'Adjusters' ? certificateData.accreditationHours : '-'}
              </div>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg">
          The course was completed on <strong>{certificateData.completionDate}</strong>.
        </p>
        
        <p className="mb-8 text-lg">
          Alberta Accreditation Committee Course ID# <strong>{certificateData.aicCourseId}</strong>
        </p>

        <div className="border-t border-black pt-6 mt-8">
          <p className="text-xl font-bold mb-2">{certificateData.instructorName}</p>
          <p className="text-sm">Authorization Signature (electronic signatures accepted)</p>
        </div>
      </div>

      <div className="text-left mt-8 text-xs">
        <p>Tag #: {certificateData.certificateNumber}</p>
        <p>Revised March 15, 2019</p>
      </div>
    </div>
  );

  const StandardCertificateTemplate = () => (
    <div className="bg-white text-black p-8 rounded-lg border border-gray-300 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-primary">Tag of Completion</h1>
        
        <div className="w-32 h-1 bg-primary mx-auto mb-8"></div>
        
        <h2 className="text-3xl font-bold mb-6 text-primary">{certificateData.studentName}</h2>
        
        <p className="text-xl mb-6">has successfully completed the course</p>
        
        <h3 className="text-2xl font-bold mb-8">{certificateData.courseName}</h3>
        
        {course?.description && (
          <p className="text-base mb-8 max-w-2xl mx-auto text-gray-600 leading-relaxed">
            {course.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left max-w-2xl mx-auto">
          <div>
            <p className="text-sm font-semibold text-gray-600">Duration</p>
            <p className="text-lg">{course?.duration || 60} minutes</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Completion Date</p>
            <p className="text-lg">{certificateData.completionDate}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Accreditation Hours</p>
            <p className="text-lg">{certificateData.accreditationHours} hours</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Tag Number</p>
            <p className="text-lg">{certificateData.certificateNumber}</p>
          </div>
        </div>

        <div className="w-32 h-1 bg-primary mx-auto mb-8"></div>
        
        <p className="text-base text-gray-600">
          Issued by {certificateData.courseProvider} on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tag Preview & Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" data-testid="tab-certificate-preview">Preview</TabsTrigger>
              <TabsTrigger value="customize" data-testid="tab-certificate-customize">Customize</TabsTrigger>
              <TabsTrigger value="generate" data-testid="tab-certificate-generate">Generate</TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Tag Template</h3>
                  <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as any)}>
                    <SelectTrigger className="w-48" data-testid="select-certificate-template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aic">AIC Compliant</SelectItem>
                      <SelectItem value="standard">Standard Tag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" data-testid="button-edit-certificate">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-print-certificate">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button onClick={onDownload} data-testid="button-download-certificate">
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-muted/20">
                {selectedTemplate === "aic" ? <AICCertificateTemplate /> : <StandardCertificateTemplate />}
              </div>

              {/* Tag Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Tag Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant={selectedTemplate === "aic" ? "default" : "secondary"}>
                          {selectedTemplate === "aic" ? "AIC Compliant" : "Standard"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span>PDF (8.5" x 11")</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span>300 DPI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Security:</span>
                        <span>Digital Signature</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Accreditation Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours:</span>
                        <span>{certificateData.accreditationHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Class:</span>
                        <span>{certificateData.accreditationClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span>{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                      </div>
                      {selectedTemplate === "aic" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AIC Course ID:</span>
                          <span>{certificateData.aicCourseId}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Customize Tab */}
            <TabsContent value="customize" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Student Name</label>
                      <Input
                        value={certificateData.studentName}
                        onChange={(e) => handleDataUpdate('studentName', e.target.value)}
                        placeholder="Enter student name"
                        data-testid="input-student-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">CIPR Number</label>
                      <Input
                        value={certificateData.ciprNumber}
                        onChange={(e) => handleDataUpdate('ciprNumber', e.target.value)}
                        placeholder="Enter CIPR number"
                        data-testid="input-cipr-number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Completion Date</label>
                      <Input
                        type="date"
                        value={certificateData.completionDate}
                        onChange={(e) => handleDataUpdate('completionDate', e.target.value)}
                        data-testid="input-completion-date"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Course Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Course Name</label>
                      <Input
                        value={certificateData.courseName}
                        onChange={(e) => handleDataUpdate('courseName', e.target.value)}
                        placeholder="Enter course name"
                        data-testid="input-course-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Accreditation Class</label>
                      <Select 
                        value={certificateData.accreditationClass} 
                        onValueChange={(value) => handleDataUpdate('accreditationClass', value)}
                      >
                        <SelectTrigger data-testid="select-accreditation-class">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General Insurance</SelectItem>
                          <SelectItem value="Life">Life Insurance</SelectItem>
                          <SelectItem value="A&S">Accident & Sickness</SelectItem>
                          <SelectItem value="Adjusters">Insurance Adjusters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Accreditation Hours</label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="8"
                        value={certificateData.accreditationHours}
                        onChange={(e) => handleDataUpdate('accreditationHours', parseFloat(e.target.value) || 1)}
                        data-testid="input-accreditation-hours"
                      />
                    </div>

                    {selectedTemplate === "aic" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">AIC Course ID</label>
                        <Input
                          value={certificateData.aicCourseId}
                          onChange={(e) => handleDataUpdate('aicCourseId', e.target.value)}
                          placeholder="Enter AIC Course ID"
                          data-testid="input-aic-course-id"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Provider Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Provider Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Course Provider</label>
                      <Input
                        value={certificateData.courseProvider}
                        onChange={(e) => handleDataUpdate('courseProvider', e.target.value)}
                        placeholder="Enter course provider name"
                        data-testid="input-course-provider"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Instructor Name</label>
                      <Input
                        value={certificateData.instructorName}
                        onChange={(e) => handleDataUpdate('instructorName', e.target.value)}
                        placeholder="Enter instructor name"
                        data-testid="input-instructor-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Tag Number</label>
                      <Input
                        value={certificateData.certificateNumber}
                        onChange={(e) => handleDataUpdate('certificateNumber', e.target.value)}
                        placeholder="Auto-generated"
                        data-testid="input-certificate-number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Tag className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <p className="font-medium">{certificateData.studentName}</p>
                      <p className="text-sm text-muted-foreground">{certificateData.courseName}</p>
                      <Badge variant="outline" className="mt-2">
                        {certificateData.accreditationHours}h • {certificateData.accreditationClass}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tag Generation Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Generation Settings</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Output Format</label>
                        <Select defaultValue="pdf">
                          <SelectTrigger data-testid="select-output-format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF (Recommended)</SelectItem>
                            <SelectItem value="png">PNG Image</SelectItem>
                            <SelectItem value="jpg">JPEG Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Quality</label>
                        <Select defaultValue="high">
                          <SelectTrigger data-testid="select-quality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High (300 DPI)</SelectItem>
                            <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                            <SelectItem value="low">Low (72 DPI)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="digital-signature" className="rounded" defaultChecked />
                        <label htmlFor="digital-signature" className="text-sm">Include digital signature</label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="watermark" className="rounded" />
                        <label htmlFor="watermark" className="text-sm">Add security watermark</label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Distribution Options</h4>
                      
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="email-student" className="rounded" defaultChecked />
                        <label htmlFor="email-student" className="text-sm">Email to student</label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="store-records" className="rounded" defaultChecked />
                        <label htmlFor="store-records" className="text-sm">Store in student records</label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="aic-submission" className="rounded" />
                        <label htmlFor="aic-submission" className="text-sm">Include in AIC submission</label>
                      </div>

                      {isAICCompliant && (
                        <div className="p-3 bg-accent/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium">AIC Compliance</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This certificate meets Alberta Insurance Council formatting requirements and will be included in accreditation submissions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Tag will be generated with current settings and data
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" data-testid="button-preview-final">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Final
                      </Button>
                      <Button onClick={onGenerate} data-testid="button-generate-certificate">
                        <Award className="mr-2 h-4 w-4" />
                        Generate Tag
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Generation */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Tag Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Generate certificates for multiple students who have completed this course.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" data-testid="button-bulk-preview">
                      <FileText className="mr-2 h-4 w-4" />
                      Preview All ({enrollment?.course?.enrollments?.length || 0} students)
                    </Button>
                    <Button data-testid="button-bulk-generate">
                      <Award className="mr-2 h-4 w-4" />
                      Generate All Certificates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
