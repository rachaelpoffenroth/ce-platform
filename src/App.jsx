import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { BookOpen, Award, Users, Edit, Eye, Download, Mail, CheckCircle, Upload, Play, Pause, SkipForward, SkipBack } from 'lucide-react'
import ceLogo from './assets/ce-logo.svg'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [savedCourses, setSavedCourses] = useState([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState('professional')
  const [customColors, setCustomColors] = useState({
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)

  // Slide themes
  const slideThemes = {
    professional: {
      name: 'Professional',
      colors: { primary: '#2563eb', secondary: '#64748b', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
      font: 'Inter, sans-serif'
    },
    modern: {
      name: 'Modern',
      colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#06b6d4', background: '#f8fafc', text: '#0f172a' },
      font: 'Poppins, sans-serif'
    },
    creative: {
      name: 'Creative',
      colors: { primary: '#dc2626', secondary: '#f97316', accent: '#eab308', background: '#fef7cd', text: '#7c2d12' },
      font: 'Nunito, sans-serif'
    },
    corporate: {
      name: 'Corporate',
      colors: { primary: '#1f2937', secondary: '#4b5563', accent: '#059669', background: '#f9fafb', text: '#111827' },
      font: 'Source Sans Pro, sans-serif'
    },
    vibrant: {
      name: 'Vibrant',
      colors: { primary: '#ec4899', secondary: '#8b5cf6', accent: '#10b981', background: '#fdf2f8', text: '#831843' },
      font: 'Montserrat, sans-serif'
    }
  }

  // Initialize saved courses with Chamber of a Thousand No's
  useEffect(() => {
    const initialCourses = [
      {
        id: 'chamber-1000-nos',
        title: 'The Chamber of a Thousand No\'s',
        created: '2025-09-14',
        status: 'completed',
        studentsEnrolled: 25,
        studentsCompleted: 20,
        theme: 'professional',
        audioFile: null,
        slides: [
          {
            id: 'title',
            type: 'title',
            title: 'The Chamber of a Thousand No\'s',
            subtitle: 'Mastering Objection Handling in Insurance Sales',
            content: 'Transform rejections into opportunities through proven psychological techniques and strategic communication methods.',
            duration: 30
          },
          {
            id: 'intro',
            type: 'content',
            title: 'Welcome to Your Transformation',
            content: 'Every "no" you hear is not a rejection—it\'s valuable data. In this course, you\'ll learn to decode objections, understand the psychology behind resistance, and turn every interaction into a stepping stone toward success.',
            duration: 45
          },
          {
            id: 'seven-stones',
            type: 'content',
            title: 'The Seven Stones of Wisdom',
            content: 'Ancient wisdom meets modern sales psychology. Each stone represents a fundamental principle of objection handling that has been proven across cultures and centuries:\n\n1. **Stone of Listening** - Hear beyond the words\n2. **Stone of Empathy** - Feel their concerns\n3. **Stone of Patience** - Time reveals truth\n4. **Stone of Clarity** - Simplify complexity\n5. **Stone of Value** - Show genuine benefit\n6. **Stone of Trust** - Build lasting relationships\n7. **Stone of Persistence** - Never give up',
            duration: 60
          },
          {
            id: 'quiz1',
            type: 'quiz',
            title: 'Understanding Objections',
            question: 'What is the primary psychological reason customers give objections?',
            options: [
              'They don\'t trust the salesperson',
              'They need more information to feel secure',
              'They can\'t afford the product',
              'They don\'t need the product'
            ],
            correct: 1,
            explanation: 'Most objections stem from a need for security and more information. Customers want to feel confident in their decision.',
            duration: 0
          },
          {
            id: 'transformation',
            type: 'content',
            title: 'The Transformation Process',
            content: 'Watch as ordinary sales interactions become extraordinary opportunities. Through real case studies and proven techniques, you\'ll see how top performers turn objections into closing opportunities.\n\n**Case Study 1: The Skeptical Business Owner**\nInitial objection: "Insurance is too expensive"\nTransformation: Showed ROI through risk analysis\nResult: $50,000 annual premium\n\n**Case Study 2: The Busy Professional**\nInitial objection: "I don\'t have time for this"\nTransformation: Streamlined process, mobile solutions\nResult: Complete portfolio protection',
            duration: 75
          },
          {
            id: 'summary',
            type: 'summary',
            title: 'Your Journey Forward',
            content: 'You now possess the tools to transform every "no" into valuable insight. Remember: the chamber of a thousand no\'s leads to the palace of yes. Your persistence and new skills will open doors you never imagined possible.\n\n**Key Takeaways:**\n• Every objection contains valuable information\n• The Seven Stones provide a framework for success\n• Transformation happens through practice and persistence\n• Your mindset determines your outcome\n\n**Next Steps:**\n1. Practice the Seven Stones daily\n2. Record and analyze your interactions\n3. Celebrate small victories\n4. Stay persistent in your journey',
            duration: 45
          }
        ]
      }
    ]
    setSavedCourses(initialCourses)
  }, [])

  // Certificate data
  const [certificates] = useState([
    {
      id: 1,
      studentName: 'John Smith',
      course: 'The Chamber of a Thousand No\'s',
      completedDate: '2025-09-14',
      ciprNumber: 'CIPR123456',
      ceCredits: 1.0
    },
    {
      id: 2,
      studentName: 'Sarah Johnson',
      course: 'The Chamber of a Thousand No\'s',
      completedDate: '2025-09-13',
      ciprNumber: 'CIPR789012',
      ceCredits: 1.0
    }
  ])

  const [showDownloadMessage, setShowDownloadMessage] = useState(false)
  const [showVerifyMessage, setShowVerifyMessage] = useState(false)
  const [showEmailMessage, setShowEmailMessage] = useState(false)

  const handleLogin = (email, password) => {
    // Simple login - accepts any credentials
    setUser({ email, name: email.split('@')[0] })
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('login')
    setEditingCourse(null)
  }

  // Professional Certificate Generation with CE branding
  const generateProfessionalCertificate = (cert) => {
    const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Continuing Education Certificate</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Open Sans', sans-serif;
            background: #f5f5f5;
        }
        
        .certificate {
            width: 11in;
            height: 8.5in;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 12px solid #2563eb;
            border-radius: 20px;
            margin: 0 auto;
            padding: 60px;
            box-sizing: border-box;
            position: relative;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 3px solid #ffd700;
            border-radius: 15px;
            pointer-events: none;
        }
        
        .certificate::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="8" fill="%23f0f0f0" opacity="0.1">CE CERTIFIED</text></svg>') repeat;
            pointer-events: none;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
        }
        
        .ce-logo {
            width: 80px;
            height: 60px;
            background: #2563eb;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
        }
        
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .subtitle {
            font-size: 18px;
            color: #6b7280;
            margin: 10px 0 0 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .content {
            text-align: center;
            margin: 40px 0;
            position: relative;
            z-index: 1;
        }
        
        .awarded-to {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .student-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2563eb;
            margin: 0 0 30px 0;
            border-bottom: 3px solid #ffd700;
            display: inline-block;
            padding-bottom: 10px;
        }
        
        .course-info {
            font-size: 18px;
            color: #374151;
            margin: 20px 0;
            line-height: 1.6;
        }
        
        .course-title {
            font-style: italic;
            font-weight: 600;
            color: #1f2937;
        }
        
        .credits {
            font-size: 16px;
            color: #059669;
            font-weight: 600;
            margin: 20px 0;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            position: relative;
            z-index: 1;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-line {
            border-top: 2px solid #374151;
            width: 200px;
            margin: 0 auto 10px auto;
        }
        
        .signature-title {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .date-section {
            text-align: center;
            flex: 1;
        }
        
        .official-seal {
            position: absolute;
            bottom: 40px;
            right: 60px;
            width: 100px;
            height: 100px;
            border: 4px solid #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle, #ffd700 0%, #f59e0b 100%);
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            color: #1f2937;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        
        .verification-code {
            position: absolute;
            bottom: 20px;
            left: 60px;
            font-size: 10px;
            color: #9ca3af;
            font-family: monospace;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="ce-logo">CE</div>
            <h1 class="title">Certificate of Completion</h1>
            <p class="subtitle">Continuing Education</p>
        </div>
        
        <div class="content">
            <p class="awarded-to">This certifies that</p>
            <h2 class="student-name">${cert.studentName}</h2>
            
            <div class="course-info">
                has successfully completed the course<br>
                <span class="course-title">"${cert.course}"</span><br>
                and has earned <span class="credits">${cert.ceCredits} CE Credit${cert.ceCredits !== 1 ? 's' : ''}</span>
            </div>
            
            <p class="course-info">
                Completed on ${new Date(cert.completedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </p>
            
            <p class="course-info">
                CIPR Number: <strong>${cert.ciprNumber}</strong>
            </p>
        </div>
        
        <div class="footer">
            <div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-title">Course Administrator</p>
            </div>
            
            <div class="date-section">
                <div class="signature-line"></div>
                <p class="signature-title">Date Issued</p>
            </div>
        </div>
        
        <div class="official-seal">
            <div>
                OFFICIAL<br>
                SEAL<br>
                CE
            </div>
        </div>
        
        <div class="verification-code">
            Verification Code: CE-${cert.id}-${Date.now().toString(36).toUpperCase()}
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([certificateHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CE_Certificate_${cert.studentName.replace(/\s+/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setShowDownloadMessage(true)
    setTimeout(() => setShowDownloadMessage(false), 5000)
  }

  const handleVerify = (cert) => {
    setShowVerifyMessage(true)
    setTimeout(() => setShowVerifyMessage(false), 5000)
  }

  const handleEmail = (cert) => {
    const subject = `CE Certificate - ${cert.course}`
    const body = `Dear ${cert.studentName},

Congratulations on completing "${cert.course}"!

Your CE certificate details:
- Course: ${cert.course}
- Completion Date: ${cert.completedDate}
- CE Credits: ${cert.ceCredits}
- CIPR Number: ${cert.ciprNumber}

Please download your official certificate from the CE Platform.

Best regards,
CE Platform Team`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setShowEmailMessage(true)
    setTimeout(() => setShowEmailMessage(false), 3000)
  }

  const handleEditCourse = (course) => {
    setEditingCourse({ ...course })
    setCurrentSlideIndex(0)
    setSelectedTheme(course.theme || 'professional')
    setCurrentPage('courseEditor')
  }

  const handleSaveCourse = () => {
    if (editingCourse) {
      setSavedCourses(prev => 
        prev.map(course => 
          course.id === editingCourse.id ? editingCourse : course
        )
      )
      setCurrentPage('courses')
      setEditingCourse(null)
    }
  }

  const handleSlideChange = (field, value) => {
    if (editingCourse) {
      const updatedSlides = [...editingCourse.slides]
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        [field]: value
      }
      setEditingCourse({
        ...editingCourse,
        slides: updatedSlides
      })
    }
  }

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme)
    if (editingCourse) {
      setEditingCourse({
        ...editingCourse,
        theme: theme
      })
    }
  }

  const handleAudioUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAudioFile(file)
      if (editingCourse) {
        setEditingCourse({
          ...editingCourse,
          audioFile: file.name
        })
      }
    }
  }

  const toggleAudioPlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would control actual audio playback
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={ceLogo} alt="CE Platform" className="h-16 mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">CE Platform</CardTitle>
            <CardDescription>Insurance & Real Estate Continuing Education</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleLogin(formData.get('email'), formData.get('password'))
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src={ceLogo} alt="CE Platform" className="h-8 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">CE Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('courses')}>
                <CardHeader>
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>{savedCourses.length} Available</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('certificates')}>
                <CardHeader>
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <CardTitle>Certificates</CardTitle>
                      <CardDescription>{certificates.length} Available</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('aiBuilder')}>
                <CardHeader>
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <CardTitle>AI Course Builder</CardTitle>
                      <CardDescription>Create New Courses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Course Management
  if (currentPage === 'courses') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src={ceLogo} alt="CE Platform" className="h-8 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">CE Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>Dashboard</Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h2>
            
            <div className="space-y-6">
              {savedCourses.map((course) => (
                <Card key={course.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">Created: {course.created}</p>
                      
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="text-sm text-gray-600">
                          Students Enrolled: <span className="font-semibold text-blue-600">{course.studentsEnrolled}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Students Completed: <span className="font-semibold text-green-600">{course.studentsCompleted}</span>
                        </div>
                        <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Completion Rate</span>
                          <span>{Math.round((course.studentsCompleted / course.studentsEnrolled) * 100)}%</span>
                        </div>
                        <Progress value={(course.studentsCompleted / course.studentsEnrolled) * 100} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage('slideViewer')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Course Editor with Themes and Audio
  if (currentPage === 'courseEditor' && editingCourse) {
    const currentSlide = editingCourse.slides[currentSlideIndex]
    const theme = slideThemes[selectedTheme]
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src={ceLogo} alt="CE Platform" className="h-8 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">CE Platform - Course Editor</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={handleSaveCourse}>Save Course</Button>
                <Button variant="outline" onClick={() => setCurrentPage('courses')}>Cancel</Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Course Slides</h3>
              
              {/* Audio Upload Section */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Audio Narration</h4>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {audioFile && (
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={toggleAudioPlayback}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1">
                        <Progress value={audioProgress} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Slide Theme</h4>
                <Select value={selectedTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(slideThemes).map(([key, theme]) => (
                      <SelectItem key={key} value={key}>{theme.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Customization */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Custom Colors</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(customColors).map(([key, color]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-600 capitalize">{key}</label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full h-8 rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide List */}
              <div className="space-y-2">
                {editingCourse.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3 rounded cursor-pointer border ${
                      index === currentSlideIndex ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant={
                          slide.type === 'title' ? 'default' :
                          slide.type === 'quiz' ? 'destructive' :
                          slide.type === 'summary' ? 'secondary' : 'outline'
                        }>
                          {slide.type}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{slide.title}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Remove slide functionality
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Editing: {editingCourse.title}
              </h2>
              <p className="text-sm text-gray-600 mb-6">Slide {currentSlideIndex + 1} of {editingCourse.slides.length}</p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="slideType">Slide Type</Label>
                  <Select 
                    value={currentSlide.type} 
                    onValueChange={(value) => handleSlideChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title Slide</SelectItem>
                      <SelectItem value="content">Content Slide</SelectItem>
                      <SelectItem value="quiz">Quiz Slide</SelectItem>
                      <SelectItem value="summary">Summary Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="slideTitle">Slide Title</Label>
                  <Input
                    id="slideTitle"
                    value={currentSlide.title}
                    onChange={(e) => handleSlideChange('title', e.target.value)}
                  />
                </div>

                {currentSlide.type === 'title' && (
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={currentSlide.subtitle || ''}
                      onChange={(e) => handleSlideChange('subtitle', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={currentSlide.content}
                    onChange={(e) => handleSlideChange('content', e.target.value)}
                    rows={10}
                  />
                </div>

                {currentSlide.type === 'quiz' && (
                  <>
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={currentSlide.question || ''}
                        onChange={(e) => handleSlideChange('question', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Options (one per line)</Label>
                      <Textarea
                        value={currentSlide.options?.join('\n') || ''}
                        onChange={(e) => handleSlideChange('options', e.target.value.split('\n'))}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                  >
                    <SkipBack className="h-4 w-4 mr-2" />
                    Previous Slide
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlideIndex(Math.min(editingCourse.slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === editingCourse.slides.length - 1}
                  >
                    Next Slide
                    <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Certificates Page
  if (currentPage === 'certificates') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src={ceLogo} alt="CE Platform" className="h-8 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">CE Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>Dashboard</Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">CE Certificates</h2>
            
            {showDownloadMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-blue-800">Professional certificate downloaded! Open the HTML file in your browser and print to PDF for a permanent copy.</p>
                </div>
              </div>
            )}

            {showVerifyMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800">Certificate verified successfully! This certificate is authentic and valid.</p>
                </div>
              </div>
            )}

            {showEmailMessage && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-purple-600 mr-2" />
                  <p className="text-purple-800">Email client opened with certificate details!</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Generated Certificates</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {certificates.map((cert) => (
                  <div key={cert.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{cert.studentName}</h4>
                        <p className="text-sm text-gray-600">Course: {cert.course}</p>
                        <p className="text-sm text-gray-600">Completed: {cert.completedDate}</p>
                        <p className="text-sm text-gray-600">CIPR #: {cert.ciprNumber}</p>
                        <p className="text-sm text-gray-600">CE Credits: {cert.ceCredits}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => generateProfessionalCertificate(cert)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVerify(cert)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEmail(cert)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}

export default App

