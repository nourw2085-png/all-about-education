import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMaterials } from '@/data/mockData';
import { FileText, Video, Headphones, Link, Plus, Download, Play } from 'lucide-react';
import { toast } from 'sonner';

const Materials = () => {
  const { role } = useAuth();
  const [materials, setMaterials] = useState(mockMaterials);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'document' as 'document' | 'video' | 'recording' | 'link',
    url: ''
  });

  const canAddMaterials = role === 'teacher' || role === 'assistant';

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error('Please fill in all fields');
      return;
    }

    const material = {
      id: String(materials.length + 1),
      title: newMaterial.title,
      type: newMaterial.type,
      url: newMaterial.url,
      uploadedBy: 'Current User',
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setMaterials([...materials, material]);
    setNewMaterial({ title: '', type: 'document', url: '' });
    setIsDialogOpen(false);
    toast.success('Material added successfully');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'recording': return <Headphones className="h-5 w-5" />;
      case 'link': return <Link className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filterMaterials = (type?: string) => {
    if (!type || type === 'all') return materials;
    return materials.filter(m => m.type === type);
  };

  return (
    <DashboardLayout title="Learning Materials" activeNav="/materials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Access all learning resources and study materials</p>
          {canAddMaterials && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      placeholder="Enter material title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newMaterial.type}
                      onValueChange={(value: 'document' | 'video' | 'recording' | 'link') => 
                        setNewMaterial({ ...newMaterial, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="recording">Recording</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="url">URL / File Link</Label>
                    <Input
                      id="url"
                      value={newMaterial.url}
                      onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                      placeholder="Enter file URL or link"
                    />
                  </div>
                  <Button onClick={handleAddMaterial} className="w-full">
                    Add Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Materials Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="recording">Recordings</TabsTrigger>
          </TabsList>

          {['all', 'document', 'video', 'recording'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {filterMaterials(tabValue === 'all' ? undefined : tabValue).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No materials found in this category
                  </CardContent>
                </Card>
              ) : (
                filterMaterials(tabValue === 'all' ? undefined : tabValue).map((material) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full text-primary">
                            {getIcon(material.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{material.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Uploaded by {material.uploadedBy} • {new Date(material.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {material.type === 'video' || material.type === 'recording' ? (
                            <>
                              <Play className="h-4 w-4 mr-2" /> Play
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" /> Download
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Materials;
