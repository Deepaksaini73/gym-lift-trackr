import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, ChevronRight, Calendar, Clock, Loader2, ImageIcon, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface ProgressPhoto {
  id: string;
  user_id: string;
  image_url: string;
  body_part: string;
  created_at: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const ProgressPhotos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const bodyParts = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Abs", "Full Body"];

  useEffect(() => {
    if (user) {
      fetchProgressPhotos();
    }
  }, [user]);

  const fetchProgressPhotos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProgressPhotos(data || []);
    } catch (error) {
      console.error("Error fetching progress photos:", error);
      toast({
        title: "Error",
        description: "Failed to load progress photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate total files (max 10 at once)
    if (selectedFiles.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 10 photos at once",
        variant: "destructive",
      });
      return;
    }

    const validFiles: FileWithPreview[] = [];

    files.forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileWithPreview: FileWithPreview = {
          file,
          preview: reader.result as string,
          id: Math.random().toString(36).substring(7),
        };
        
        setSelectedFiles((prev) => [...prev, fileWithPreview]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0 || !selectedBodyPart || !user) {
      toast({
        title: "Missing information",
        description: "Please select a body part and at least one image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      toast({
        title: "Uploading...",
        description: `Uploading ${totalFiles} photo${totalFiles > 1 ? 's' : ''}...`,
      });

      // Upload all files
      for (const fileData of selectedFiles) {
        try {
          // Upload to Cloudinary
          const imageUrl = await uploadToCloudinary(fileData.file);

          // Save to database
          const { error } = await supabase
            .from("progress_photos")
            .insert({
              user_id: user.id,
              image_url: imageUrl,
              body_part: selectedBodyPart,
            });

          if (error) throw error;

          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
        } catch (error) {
          console.error(`Error uploading ${fileData.file.name}:`, error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${fileData.file.name}`,
            variant: "destructive",
          });
        }
      }

      if (uploadedCount > 0) {
        toast({
          title: "Success! 📸",
          description: `${uploadedCount} ${selectedBodyPart} progress photo${uploadedCount > 1 ? 's' : ''} uploaded successfully.`,
        });

        // Refresh photos
        await fetchProgressPhotos();

        // Reset state
        setIsUploadDialogOpen(false);
        setSelectedBodyPart("");
        setSelectedFiles([]);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDeletePhoto = (id: string) => {
    setPhotoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      const { error } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photoToDelete);

      if (error) throw error;

      toast({
        title: "Photo deleted",
        description: "Progress photo has been removed.",
      });

      // Refresh photos
      await fetchProgressPhotos();
      
      // Close dialogs
      setSelectedPhoto(null);
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPhotosByBodyPart = (bodyPart: string) => {
    return progressPhotos.filter(photo => photo.body_part === bodyPart);
  };

  const toggleExpanded = (bodyPart: string) => {
    setExpandedPart(expandedPart === bodyPart ? null : bodyPart);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Progress Photos</h1>
              <p className="text-muted-foreground">Track your transformation</p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
              setIsUploadDialogOpen(open);
              if (!open) {
                setSelectedFiles([]);
                setSelectedBodyPart("");
                setUploadProgress(0);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2 shadow-lg">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/20 max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Upload Progress Photos</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Upload multiple photos for the same body part
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Select Body Part
                    </label>
                    <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Choose body part..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyParts.map((part) => (
                          <SelectItem key={part} value={part}>
                            {part}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="space-y-3">
                    {/* Preview Grid */}
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                        {selectedFiles.map((fileData) => (
                          <div key={fileData.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/30 bg-muted">
                              <img
                                src={fileData.preview}
                                alt={fileData.file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(fileData.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="mt-1 text-xs text-muted-foreground text-center truncate px-1">
                              {fileData.file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add More Button or Initial Upload */}
                    {selectedFiles.length < 10 && (
                      <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                        {selectedFiles.length > 0 ? (
                          <>
                            <Plus className="h-8 w-8 text-primary mb-2" />
                            <p className="text-sm text-foreground font-medium mb-1">Add More Photos</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedFiles.length} selected • {10 - selectedFiles.length} remaining
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-primary mb-2" />
                            <p className="text-sm text-foreground font-medium mb-1">Click to upload</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                            <p className="text-xs text-primary mt-1 font-medium">Max 10 photos at once</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}

                    {selectedFiles.length >= 10 && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-orange-500 font-medium">
                          Maximum limit reached (10 photos)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Tip:</span> Use consistent angle & lighting for best comparison
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="text-primary font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={handlePhotoUpload}
                    disabled={selectedFiles.length === 0 || !selectedBodyPart || uploading}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Card */}
        {progressPhotos.length > 0 && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{progressPhotos.length}</p>
                <p className="text-xs text-muted-foreground">Total Photos</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  {new Set(progressPhotos.map(p => p.body_part)).size}
                </p>
                <p className="text-xs text-muted-foreground">Body Parts</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {progressPhotos.length > 0 
                    ? Math.ceil((Date.now() - new Date(progressPhotos[progressPhotos.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Days Tracked</p>
              </div>
            </div>
          </Card>
        )}

        {/* Photos organized by body part */}
        {progressPhotos.length > 0 ? (
          <div className="space-y-3">
            {bodyParts.map((bodyPart) => {
              const photos = getPhotosByBodyPart(bodyPart);
              if (photos.length === 0) return null;
              
              const isExpanded = expandedPart === bodyPart;
              const latestPhoto = photos[0];
              
              return (
                <Card key={bodyPart} className="p-4 bg-card border-border hover:border-primary/30 transition-all">
                  <button
                    onClick={() => toggleExpanded(bodyPart)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary/20">
                          <img
                            src={latestPhoto.image_url}
                            alt={bodyPart}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-background">
                          {photos.length}
                        </div>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-foreground">{bodyPart}</h3>
                        <p className="text-sm text-muted-foreground">
                          {photos.length} photo{photos.length > 1 ? 's' : ''} • Latest: {format(new Date(latestPhoto.created_at), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div 
                            className="aspect-[3/4] rounded-lg overflow-hidden bg-muted border-2 border-border cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02] shadow-sm hover:shadow-lg"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <img
                              src={photo.image_url}
                              alt={`Progress ${photo.body_part}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeletePhoto(photo.id);
                            }}
                            className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(photo.created_at), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(photo.created_at), "hh:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 bg-card border-2 border-dashed border-border text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No progress photos yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Start documenting your transformation journey by uploading photos organized by body part
            </p>
            <Button 
              onClick={() => setIsUploadDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Upload First Photo
            </Button>
          </Card>
        )}
      </div>

      {/* Full Size Image Viewer */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-primary/20 p-0">
          {selectedPhoto && (
            <div className="relative">
              <div className="max-h-[60vh] w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                <img
                  src={selectedPhoto.image_url}
                  alt={`Progress ${selectedPhoto.body_part}`}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedPhoto.body_part}</h3>
                    <p className="text-sm text-muted-foreground">Progress Photo</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDeletePhoto(selectedPhoto.id)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{format(new Date(selectedPhoto.created_at), "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{format(new Date(selectedPhoto.created_at), "hh:mm a")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Progress Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your progress photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPhotoToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default ProgressPhotos;
