
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, FileAudio, BookOpen } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'recording' | 'other';
  url: string;
  date: string;
}

const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Introduction to Math Concepts',
    description: 'PDF covering basic algebra concepts',
    type: 'document',
    url: '#',
    date: '2025-05-01'
  },
  {
    id: '2',
    title: 'Physics Lecture Recording',
    description: 'Recording of the latest physics lecture',
    type: 'recording',
    url: '#',
    date: '2025-05-02'
  },
  {
    id: '3',
    title: 'Chemistry Lab Instructions',
    description: 'Document with step-by-step lab procedures',
    type: 'document',
    url: '#',
    date: '2025-05-03'
  },
  {
    id: '4',
    title: 'History Class Recording',
    description: 'Recording of the recent history class',
    type: 'recording',
    url: '#',
    date: '2025-05-04'
  }
];

const LearningMaterials = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BookOpen className="mr-2 h-5 w-5 text-edu-purple-600" />
          Learning Materials
        </CardTitle>
        <CardDescription>Access your course materials and recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {mockMaterials.map(material => (
              <MaterialItem key={material.id} material={material} />
            ))}
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            {mockMaterials
              .filter(material => material.type === 'document')
              .map(material => (
                <MaterialItem key={material.id} material={material} />
              ))
            }
          </TabsContent>
          
          <TabsContent value="recordings" className="space-y-4">
            {mockMaterials
              .filter(material => material.type === 'recording')
              .map(material => (
                <MaterialItem key={material.id} material={material} />
              ))
            }
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const MaterialItem = ({ material }: { material: Material }) => {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div className="flex items-start">
        {material.type === 'document' ? (
          <FileText className="h-5 w-5 mt-1 mr-3 text-edu-purple-600" />
        ) : material.type === 'recording' ? (
          <FileAudio className="h-5 w-5 mt-1 mr-3 text-edu-purple-600" />
        ) : (
          <BookOpen className="h-5 w-5 mt-1 mr-3 text-edu-purple-600" />
        )}
        
        <div>
          <h4 className="font-medium">{material.title}</h4>
          <p className="text-sm text-gray-600">{material.description}</p>
          <span className="text-xs text-gray-500">Added: {new Date(material.date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <Button variant="outline" size="sm">
        {material.type === 'document' ? 'Download' : 'Play'}
      </Button>
    </div>
  );
};

export default LearningMaterials;
