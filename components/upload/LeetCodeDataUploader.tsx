"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Info,
  Code,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadStats {
  totalSubmissions: number;
  fileName: string;
  platform: string;
  stats: {
    totalSolved: number;
    byDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
    topLanguages: Array<{ language: string; count: number }>;
    topTopics: Array<{ topic: string; count: number }>;
  };
}

export const LeetCodeDataUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('leetcode');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leetcodeData', file);
      formData.append('platform', selectedPlatform);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-leetcode-data', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result.data);
      
      // Refresh the page data after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedPlatform]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const downloadSampleFile = () => {
    const sampleData = [
      {
        title: "Two Sum",
        questionId: 1,
        status: "Accepted",
        lang: "python3",
        timestamp: "2024-01-15T10:30:00Z",
        difficulty: "Easy",
        topics: ["Array", "Hash Table"],
        runtime: "52 ms",
        memory: "15.4 MB"
      },
      {
        title: "Add Two Numbers", 
        questionId: 2,
        status: "Accepted",
        lang: "javascript",
        timestamp: "2024-01-14T14:20:00Z",
        difficulty: "Medium",
        topics: ["Linked List", "Math", "Recursion"],
        runtime: "108 ms",
        memory: "47.3 MB"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leetcode_sample_format.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (uploadResult) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5" />
            Upload Successful!
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Your {uploadResult.platform} data has been processed and is now being used for real statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {uploadResult.stats.totalSolved}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Total Problems Solved
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                {uploadResult.stats.byDifficulty.easy}E / {uploadResult.stats.byDifficulty.medium}M / {uploadResult.stats.byDifficulty.hard}H
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Difficulty Breakdown
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                {uploadResult.stats.topLanguages[0]?.language || 'N/A'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Top Language
              </div>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Page will refresh automatically in a few seconds to show your real data across the dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Your Real LeetCode Data
          </CardTitle>
          <CardDescription>
            Upload your actual submission data to see real statistics instead of mock data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How to get your LeetCode data:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Go to your LeetCode profile page</li>
                <li>Use browser dev tools to export submission data, or</li>
                <li>Use LeetCode's API to get your submission history, or</li>
                <li>Export from third-party tools like LeetCode-Tracker</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSampleFile}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample Format
            </Button>
            <Badge variant="secondary">JSON or CSV supported</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['leetcode', 'codeforces', 'hackerrank'].map((platform) => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform(platform)}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                <div>
                  <div className="text-lg font-medium">Processing your data...</div>
                  <div className="text-sm text-muted-foreground">
                    Parsing and validating submissions
                  </div>
                  <Progress value={uploadProgress} className="mt-2 max-w-xs mx-auto" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <File className="mx-auto w-12 h-12 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    or click to browse (JSON or CSV)
                  </div>
                </div>
                <Button variant="outline">
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expected Format Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expected Data Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Required fields:</strong> title, status, difficulty
            </div>
            <div>
              <strong>Optional fields:</strong> questionId, lang, timestamp, topics, runtime, memory
            </div>
            <div className="bg-muted/50 dark:bg-muted/30 p-3 rounded font-mono text-xs overflow-x-auto">
              {JSON.stringify({
                title: "Two Sum",
                questionId: 1,
                status: "Accepted",
                lang: "python3",
                difficulty: "Easy",
                topics: ["Array", "Hash Table"],
                timestamp: "2024-01-15T10:30:00Z"
              }, null, 2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
