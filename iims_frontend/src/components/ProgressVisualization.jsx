import React from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star,
  Calendar,
  Target,
  Award
} from 'lucide-react';

export default function ProgressVisualization({ templates, phases, tasks, submissions }) {
  const getTemplateProgress = (templateId) => {
    const templatePhases = phases.filter(p => p.templateId === templateId);
    const templateTasks = tasks.filter(t => {
      const phase = phases.find(p => p.id === t.phaseId);
      return phase?.templateId === templateId;
    });
    
    const completedTasks = templateTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    
    return templateTasks.length > 0 ? Math.round((completedTasks.length / templateTasks.length) * 100) : 0;
  };

  const getPhaseProgress = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phaseId === phaseId);
    const completedTasks = phaseTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    return phaseTasks.length > 0 ? Math.round((completedTasks.length / phaseTasks.length) * 100) : 0;
  };

  const getOverallProgress = () => {
    const allTasks = tasks;
    const completedTasks = allTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    return allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
  };

  const getStats = () => {
    const allTasks = tasks;
    const completedTasks = allTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'COMPLETED';
    });
    const pendingTasks = allTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'PENDING';
    });
    const overdueTasks = allTasks.filter(task => {
      const submission = submissions.find(s => s.taskId === task.id);
      return submission?.status === 'OVERDUE';
    });

    return {
      total: allTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Progress Overview</h2>
            <p className="text-gray-600">Visual representation of your progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{getOverallProgress()}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${getOverallProgress()}, 100`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Template Progress */}
      {templates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Template Progress</h3>
          <div className="space-y-4">
            {templates.map(template => {
              const progress = getTemplateProgress(template.id);
              const templatePhases = phases.filter(p => p.templateId === template.id);
              
              return (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{templatePhases.length} phases</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Phase Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {templatePhases.map(phase => {
                      const phaseProgress = getPhaseProgress(phase.id);
                      const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
                      
                      return (
                        <div key={phase.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{phase.name}</h5>
                            <span className="text-sm font-bold text-blue-600">{phaseProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${phaseProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{phaseTasks.length} tasks</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Timeline</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const phaseProgress = getPhaseProgress(phase.id);
              const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
              const completedTasks = phaseTasks.filter(task => {
                const submission = submissions.find(s => s.taskId === task.id);
                return submission?.status === 'COMPLETED';
              });
              
              return (
                <div key={phase.id} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                    phaseProgress === 100 
                      ? 'bg-green-500 border-green-500' 
                      : phaseProgress > 0 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-gray-300 border-gray-300'
                  }`}></div>
                  
                  <div className="ml-12 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{phase.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">{phaseProgress}%</span>
                        <span className="text-sm text-gray-600">
                          {completedTasks.length}/{phaseTasks.length} tasks
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{phase.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          phaseProgress === 100 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${phaseProgress}%` }}
                      ></div>
                    </div>
                    
                    {/* Task Status */}
                    <div className="flex flex-wrap gap-2">
                      {phaseTasks.map(task => {
                        const submission = submissions.find(s => s.taskId === task.id);
                        const status = submission?.status || 'PENDING';
                        
                        return (
                          <span 
                            key={task.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800' 
                                : status === 'PENDING' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {task.taskName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.completed > 0 && (
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold">First Task Completed</h4>
                  <p className="text-sm opacity-90">Great start!</p>
                </div>
              </div>
            </div>
          )}
          
          {getOverallProgress() >= 50 && (
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold">Halfway There</h4>
                  <p className="text-sm opacity-90">50% progress achieved</p>
                </div>
              </div>
            </div>
          )}
          
          {getOverallProgress() === 100 && (
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold">All Tasks Complete</h4>
                  <p className="text-sm opacity-90">Excellent work!</p>
                </div>
              </div>
            </div>
          )}
          
          {stats.completed >= 5 && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold">Task Master</h4>
                  <p className="text-sm opacity-90">5+ tasks completed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 