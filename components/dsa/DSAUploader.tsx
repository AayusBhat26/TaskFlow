'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DSAUploaderProps {
  onUploadComplete?: () => void;
}

export function DSAUploader({ onUploadComplete }: DSAUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [importName, setImportName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate import name
    if (!importName.trim()) {
      toast({
        title: 'Import name required',
        description: 'Please provide a name for this import batch',
        variant: 'destructive'
      });
      return;
    }

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel (.xlsx, .xls) or CSV file',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      // Read the file
      const data = await file.arrayBuffer();
      setUploadProgress(40);

      // Parse the file
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setUploadProgress(60);

      if (jsonData.length === 0) {
        throw new Error('The file appears to be empty or has no valid data');
      }

      // Process and upload the data
      const response = await fetch('/api/dsa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questions: jsonData,
          fileName: file.name,
          importName: importName.trim()
        })
      });

      setUploadProgress(80);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);
      setUploadResult(result.results);

      toast({
        title: 'Upload successful!',
        description: result.message
      });

      // Reset form
      setImportName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        topic: 'Array',
        difficulty: 'EASY',
        leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
        platform: 'LeetCode',
        tags: 'Hash Table,Array',
        companies: 'Amazon,Google,Microsoft',
        frequency: 10,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        approach: 'Use hash map to store complement values'
      },
      {
        title: 'Reverse Linked List',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        topic: 'Linked List',
        difficulty: 'MEDIUM',
        leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
        platform: 'LeetCode',
        tags: 'Linked List,Recursion',
        companies: 'Amazon,Microsoft,Apple',
        frequency: 8,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        approach: 'Iterative pointer manipulation'
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'DSA Questions');

    // Save file
    XLSX.writeFile(wb, 'dsa_questions_template.xlsx');

    toast({
      title: 'Template downloaded',
      description: 'Use this template to format your DSA questions data'
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import DSA Questions
        </CardTitle>
        <CardDescription>
          Upload your Excel or CSV file containing DSA questions for placement preparation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Name Input */}
        <div className="space-y-2">
          <Label htmlFor="importName">Import Name *</Label>
          <Input
            id="importName"
            type="text"
            placeholder="e.g., 'Array Questions', 'LeetCode Top 100', 'Company Specific'"
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            disabled={isUploading}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Give this import batch a descriptive name to organize your questions
          </p>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload DSA Questions</h3>
          <p className="text-muted-foreground mb-4">
            Choose an Excel (.xlsx, .xls) or CSV file containing your questions
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !importName.trim()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading and processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Upload completed successfully!</p>
                <div className="text-sm space-y-1">
                  <p>✅ Created: {uploadResult.created} questions</p>
                  <p>⏭️ Skipped: {uploadResult.skipped} questions (duplicates)</p>
                  {uploadResult.errors.length > 0 && (
                    <div>
                      <p className="text-destructive">❌ Errors: {uploadResult.errors.length}</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground ml-4">
                        {uploadResult.errors.slice(0, 3).map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 3 && (
                          <li>... and {uploadResult.errors.length - 3} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Format Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Expected file format:</p>
              <div className="text-sm space-y-1">
                <p><strong>Required columns:</strong> title, topic</p>
                <p><strong>Optional columns:</strong> description, difficulty, leetcodeUrl, platform, tags, companies, frequency, timeComplexity, spaceComplexity, approach</p>
                <p><strong>Difficulty values:</strong> EASY, MEDIUM, HARD</p>
                <p><strong>Tips:</strong> Use comma-separated values for tags and companies</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
