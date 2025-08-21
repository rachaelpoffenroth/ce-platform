import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon, Award, Download, Share2Icon, EyeIcon, ChevronDownIcon, ChevronLeftIcon } from "lucide-react";
import CertificateTemplate from "@/components/certificates/CertificateTemplate";

// Mock certificate data
const mockCertificates = [
  {
    id: "cert-1",
    courseTitle: "Insurance Ethics and Best Practices",
    completionDate: "2025-07-15",
    expirationDate: "2027-07-15",
    creditHours: 4,
    certificateNumber: "CE-INS-12345",
    state: "Ontario",
    category: "Insurance"
  },
  {
    id: "cert-2",
    courseTitle: "Real Estate Law Fundamentals",
    completionDate: "2025-06-22",
    expirationDate: "2027-06-22",
    creditHours: 6,
    certificateNumber: "CE-RE-78901",
    state: "British Columbia",
    category: "Real Estate"
  },
  {
    id: "cert-3",
    courseTitle: "Cybersecurity in Insurance",
    completionDate: "2025-05-10",
    expirationDate: "2027-05-10",
    creditHours: 3,
    certificateNumber: "CE-INS-56789",
    state: "Quebec",
    category: "Insurance"
  }
];

export default function Certificates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [filteredCertificates, setFilteredCertificates] = useState(mockCertificates);
  
  // Apply filters
  const applyFilters = () => {
    let filtered = [...mockCertificates];
    
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(cert => cert.category === categoryFilter);
    }
    
    if (stateFilter !== "all") {
      filtered = filtered.filter(cert => cert.state === stateFilter);
    }
    
    setFilteredCertificates(filtered);
  };
  
  // Handler for search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setTimeout(() => applyFilters(), 300);
  };
  
  // Handler for category filter
  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
    setTimeout(() => applyFilters(), 100);
  };
  
  // Handler for state filter
  const handleStateFilter = (value) => {
    setStateFilter(value);
    setTimeout(() => applyFilters(), 100);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Handler for download certificate
  const handleDownload = (cert) => {
    toast({
      title: "Certificate Downloaded",
      description: `${cert.courseTitle} certificate has been downloaded.`
    });
  };
  
  // Handler for share certificate
  const handleShare = (cert) => {
    toast({
      title: "Certificate Shared",
      description: `A link to your certificate has been copied to clipboard.`
    });
  };
  
  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
        </div>
        <Link to="/student-dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search certificates..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stateFilter} onValueChange={handleStateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                <SelectItem value="Alberta">Alberta</SelectItem>
                <SelectItem value="British Columbia">British Columbia</SelectItem>
                <SelectItem value="Manitoba">Manitoba</SelectItem>
                <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                <SelectItem value="Newfoundland">Newfoundland & Labrador</SelectItem>
                <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                <SelectItem value="Ontario">Ontario</SelectItem>
                <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                <SelectItem value="Quebec">Quebec</SelectItem>
                <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredCertificates.length} certificates found
          </div>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.length > 0 ? filteredCertificates.map(cert => (
              <Card key={cert.id} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">{cert.courseTitle}</CardTitle>
                  <Award className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-2 pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Certificate No.</div>
                    <div className="font-medium">{cert.certificateNumber}</div>
                    
                    <div className="text-muted-foreground">Completed</div>
                    <div>{formatDate(cert.completionDate)}</div>
                    
                    <div className="text-muted-foreground">Expires</div>
                    <div>{formatDate(cert.expirationDate)}</div>
                    
                    <div className="text-muted-foreground">Credit Hours</div>
                    <div>{cert.creditHours} hours</div>
                    
                    <div className="text-muted-foreground">Province</div>
                    <div>{cert.state}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCertificate(cert)}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                        <DialogDescription>
                          Your course completion certificate for {cert?.courseTitle}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-white p-4 overflow-auto max-h-[70vh]">
                        {selectedCertificate && (
                          <CertificateTemplate certificate={selectedCertificate} />
                        )}
                      </div>
                      <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => handleShare(cert)}>
                          <Share2Icon className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button onClick={() => handleDownload(cert)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleShare(cert)}>
                      <Share2Icon className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(cert)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No certificates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters or complete more courses to earn certificates.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="rounded-md border">
            <div className="grid grid-cols-8 gap-2 p-4 font-medium border-b">
              <div className="col-span-3">Course</div>
              <div>Certificate No.</div>
              <div>Province</div>
              <div>Completed</div>
              <div>Credit Hours</div>
              <div className="text-right">Actions</div>
            </div>
            
            {filteredCertificates.length > 0 ? filteredCertificates.map(cert => (
              <div key={cert.id} className="grid grid-cols-8 gap-2 p-4 items-center border-b">
                <div className="col-span-3">{cert.courseTitle}</div>
                <div>{cert.certificateNumber}</div>
                <div>{cert.state}</div>
                <div>{formatDate(cert.completionDate)}</div>
                <div>{cert.creditHours} hours</div>
                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCertificate(cert)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                        <DialogDescription>
                          Your course completion certificate for {cert?.courseTitle}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-white p-4 overflow-auto max-h-[70vh]">
                        {selectedCertificate && (
                          <CertificateTemplate certificate={selectedCertificate} />
                        )}
                      </div>
                      <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => handleShare(cert)}>
                          <Share2Icon className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button onClick={() => handleDownload(cert)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" size="sm" onClick={() => handleShare(cert)}>
                    <Share2Icon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(cert)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No certificates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters or complete more courses to earn certificates.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}