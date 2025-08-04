'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  FileText,
  ExternalLink,
  Search,
  Download,
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportedQuestion {
  id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  leetcodeUrl?: string;
  platform: string;
  tags: string[];
  companies: string[];
  isImported: boolean;
  importedAt: string;
  importBatchId: string;
  originalFileName: string;
  userProgress?: {
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW' | 'SKIPPED';
    attempts: number;
  };
}

interface ImportBatch {
  batchId: string;
  batchName: string;
  fileName: string;
  importedAt: string;
  questionCount: number;
}

interface ImportedQuestionsData {
  questions: ImportedQuestion[];
  importBatches: ImportBatch[];
  statistics: {
    totalImported: number;
    byTopic: { topic: string; count: number }[];
    byDifficulty: { difficulty: string; count: number }[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HARD: 'bg-red-100 text-red-800 border-red-200'
};

interface ImportedQuestionsTabProps {
  batchId?: string;
}

export function ImportedQuestionsTab({ batchId }: ImportedQuestionsTabProps = {}) {
  const [data, setData] = useState<ImportedQuestionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(batchId || 'all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchImportedQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      // Use batchId prop if provided, otherwise use selectedBatch state
      const batchToUse = batchId || selectedBatch;
      if (batchToUse !== 'all') params.append('batchId', batchToUse);
      if (selectedTopic !== 'all') params.append('topic', selectedTopic);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/dsa/imported?${params}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch imported questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchImportedQuestions();
  }, [selectedBatch, selectedTopic, selectedDifficulty, searchQuery, currentPage]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading imported questions...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load imported questions</p>
      </div>
    );
  }

  const uniqueTopics = [...new Set(data.questions.map(q => q.topic))].sort();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Imported</p>
                <p className="text-2xl font-bold">{data.statistics.totalImported}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Import Batches</p>
                <p className="text-2xl font-bold">{data.importBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Topics Covered</p>
                <p className="text-2xl font-bold">{data.statistics.byTopic.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Latest Import</p>
                <p className="text-sm font-medium">
                  {data.importBatches[0] ? formatDate(data.importBatches[0].importedAt).split(',')[0] : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Batches */}
      {!batchId && data.importBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import History</CardTitle>
            <CardDescription>Your imported question batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.importBatches.slice(0, 3).map((batch) => (
                <div key={batch.batchId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{batch.batchName}</p>
                      <p className="text-sm text-muted-foreground">
                        {batch.questionCount} questions • {formatDate(batch.importedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search imported questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {!batchId && (
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Import Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {data.importBatches.map(batch => (
                      <SelectItem key={batch.batchId} value={batch.batchId}>
                        {batch.batchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {uniqueTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {data.questions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Imported Questions</h3>
                <p className="text-muted-foreground">
                  Import questions using the "Import Questions" button to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            data.questions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(question.userProgress?.status)}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{question.title}</h3>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", difficultyColors[question.difficulty])}
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.topic}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.platform}
                          </Badge>
                        </div>
                        
                        {question.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {question.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>From: {question.originalFileName}</span>
                          <span>Imported: {formatDate(question.importedAt)}</span>
                          {question.userProgress && question.userProgress.attempts > 0 && (
                            <span>{question.userProgress.attempts} attempts</span>
                          )}
                        </div>
                        
                        {question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {question.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{question.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasPrev}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasNext}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
