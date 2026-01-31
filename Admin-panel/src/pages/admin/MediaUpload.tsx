import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Upload, CheckCircle2 } from "lucide-react";

export default function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<
    { url: string; type: string }[]
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);

    const previewData = selected.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setPreviews(previewData);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      setFiles([]);
      setPreviews([]);
      alert("Upload successful ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  return (
    <AdminLayout
      title="Media Upload"
      description="Upload images and videos for content management"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Upload Media</CardTitle>
                <CardDescription>
                  Select images or videos to upload
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* File Selector */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Images & Videos</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, MP4 supported
                  </p>
                </div>
              </div>

              <label>
                <input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() => document.getElementById("media-upload")?.click()}
                >
                  Select Files
                </Button>
              </label>
            </div>

            {/* Selected Count */}
            {files.length > 0 && (
              <Badge className="w-fit bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {files.length} file(s) selected
              </Badge>
            )}

            {/* Upload Button */}
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!files.length}
            >
              Upload Media
            </Button>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Review selected media before upload
            </CardDescription>
          </CardHeader>

          <CardContent>
            {previews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No media selected
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((item, index) =>
                  item.type.startsWith("image") ? (
                    <img
                      key={index}
                      src={item.url}
                      className="h-24 w-full object-cover rounded-lg border"
                      alt="preview"
                    />
                  ) : (
                    <video
                      key={index}
                      src={item.url}
                      controls
                      className="h-24 w-full rounded-lg border"
                    />
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
