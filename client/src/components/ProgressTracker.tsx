import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Lock,
  BookOpen,
  Brain,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Star,
  Award,
  Timer,
  BarChart3
} from "lucide-react";
import type { Enrollment, CourseModule, ModuleProgress } from "@shared/schema";

interface ProgressTrackerProps {
  enrollment: Enrollment;
  modules: CourseModule[];
  currentModuleIndex?: number;
  onModuleSelect?: (moduleIndex: number) => void;
}

interface ModuleProgressStats {
  completed: number;
  inProgress: number;
  locked: number;
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
}

export default function ProgressTracker({
  enrollment,
  modules = [],
  currentModuleIndex = 0,
  onModuleSelect
}: ProgressTrackerProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [progressStats, setProgressStats] = useState<ModuleProgressStats>({
    completed: 0,
    inProgress: 0,
    locked: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    completionRate: 0
  });

  // Calculate progress statistics
  useEffect(() => {
    if (!enrollment || !modules.length) return;

    const moduleProgress = enrollment.moduleProgress || [];
    const completed = moduleProgress.filter(p => p.completed).length;
    const inProgress = Math.min(currentModuleIndex + 1, modules.length) - completed;
    const locked = Math.max(0, modules.length - currentModuleIndex - 1);
    
    const totalTimeSpent = moduleProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const completionRate = modules.length > 0 ? (completed / modules.length) * 100 : 0;
    
    // Mock quiz scores - in real app this would come from quiz attempts
    const averageScore = 87; // Would be calculated from actual quiz results

    setProgressStats({
      completed,
      inProgress,
      locked,
      totalTimeSpent,
      averageScore,
      completionRate
    });
  }, [enrollment, modules, currentModuleIndex]);

  const getModuleStatus = (moduleIndex: number): 'completed' | 'current' | 'available' | 'locked' => {
    const moduleProgress = enrollment?.moduleProgress?.find(p => p.moduleId === modules[moduleIndex]?.id);
    
    if (moduleProgress?.completed) return 'completed';
    if (moduleIndex === currentModuleIndex) return 'current';
    if (moduleIndex <= currentModuleIndex) return 'available';
    return 'locked';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'current':
        return <Play className="h-5 w-5 text-primary" />;
      case 'available':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'current':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'available':
        return 'bg-muted hover:bg-muted/80 text-foreground border-border';
      case 'locked':
        return 'bg-muted/50 text-muted-foreground border-border cursor-not-allowed';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (!enrollment || !modules.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card data-testid="progress-overview">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm font-bold">{Math.round(progressStats.completionRate)}%</span>
          </div>
          <Progress value={progressStats.completionRate} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-accent/10 rounded-lg">
              <div className="text-lg font-bold text-accent">{progressStats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{modules.length - progressStats.completed}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Statistics */}
      <Card data-testid="study-statistics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Study Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Time Spent</p>
                <p className="text-lg font-bold">{formatTime(progressStats.totalTimeSpent)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Avg Score</p>
                <p className="text-lg font-bold">{progressStats.averageScore}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Days Active</p>
                <p className="text-lg font-bold">
                  {Math.ceil((Date.now() - new Date(enrollment.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Streak</p>
                <p className="text-lg font-bold">3 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Progress */}
      <Card data-testid="module-progress">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Module Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {modules.map((module, index) => {
            const status = getModuleStatus(index);
            const isAccessible = status !== 'locked';
            const moduleProgressData = enrollment.moduleProgress?.find(p => p.moduleId === module.id);
            
            return (
              <div
                key={module.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${getStatusColor(status)}`}
                onClick={() => isAccessible && onModuleSelect?.(index)}
                data-testid={`module-progress-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{module.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {module.duration || 15} min
                        </span>
                        {moduleProgressData?.timeSpent && (
                          <span className="text-xs text-muted-foreground">
                            Spent: {formatTime(moduleProgressData.timeSpent)}
                          </span>
                        )}
                        {status === 'current' && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status === 'completed' && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    {status === 'current' && moduleProgressData?.lastPosition && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {Math.round((moduleProgressData.lastPosition / ((module.duration || 15) * 60)) * 100)}%
                        </div>
                        <Progress 
                          value={(moduleProgressData.lastPosition / ((module.duration || 15) * 60)) * 100}
                          className="w-16 h-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Module Details */}
                {expandedModule === module.id && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-2 capitalize">{status}</span>
                      </div>
                      {moduleProgressData?.timeSpent && (
                        <div>
                          <span className="text-muted-foreground">Time Spent:</span>
                          <span className="ml-2">{formatTime(moduleProgressData.timeSpent)}</span>
                        </div>
                      )}
                      {moduleProgressData?.completedAt && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="ml-2">
                            {new Date(moduleProgressData.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-2">{module.description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Achievements & Milestones */}
      <Card data-testid="achievements">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressStats.completed >= 1 && (
              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg">
                <Trophy className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">First Module Complete</p>
                  <p className="text-xs text-muted-foreground">Great start!</p>
                </div>
              </div>
            )}
            
            {progressStats.completionRate >= 50 && (
              <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Halfway There</p>
                  <p className="text-xs text-muted-foreground">50% course completion</p>
                </div>
              </div>
            )}
            
            {progressStats.averageScore >= 90 && (
              <div className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">High Achiever</p>
                  <p className="text-xs text-muted-foreground">90%+ average score</p>
                </div>
              </div>
            )}

            {progressStats.completed === modules.length && (
              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg">
                <Award className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Course Complete!</p>
                  <p className="text-xs text-muted-foreground">Ready for certification</p>
                </div>
              </div>
            )}

            {progressStats.completed === 0 && progressStats.totalTimeSpent === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Complete modules to earn achievements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card data-testid="next-steps">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enrollment.status === "completed" ? (
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="font-medium text-accent">Course Complete!</p>
                <p className="text-sm text-muted-foreground">Download your certificate</p>
              </div>
            ) : progressStats.completed < modules.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Continue Learning:</p>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Next: {modules[currentModuleIndex]?.title || "Continue Course"}
                    </span>
                  </div>
                </div>
                {onModuleSelect && (
                  <Button 
                    onClick={() => onModuleSelect(currentModuleIndex)} 
                    className="w-full"
                    data-testid="button-continue-learning"
                  >
                    Continue Learning
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Ready for Final Assessment</p>
                <p className="text-sm text-muted-foreground">Complete the final quiz to earn your certificate</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
