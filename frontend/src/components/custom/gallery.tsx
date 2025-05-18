'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Info, ImagePlus, Trash2, X } from 'lucide-react';
import { tripsApi } from '@/services/trips-api';
import { toast } from 'sonner';

interface GalleryProps {
  imageData: string;
  tripName: string;
  tripId: string;
  onImagesUpdate?: (newImageData: string) => void;
}

export function Gallery({
  imageData,
  tripName,
  tripId,
  onImagesUpdate,
}: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false); // Flag to track deletion state
  const [isEditingImage, setIsEditingImage] = useState(false); // Flag to track editing state
  const [imageToEdit, setImageToEdit] = useState<string | null>(null); // Store the URL of the image being edited
  const [editImageUrl, setEditImageUrl] = useState(''); // New URL for edited image

  // Parse images if the data is a JSON string containing an array
  const getImages = () => {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Not a valid JSON array, treat as a single image
    }
    // Default case: treat as single image URL
    return [imageData];
  };

  // Get all potential images and track invalid ones
  const allImages = getImages();

  // Filter out invalid URLs and keep track of them
  const images = allImages.filter((img) => {
    try {
      new URL(img);
      return true;
    } catch (err) {
      console.warn(`Invalid image URL: ${img}`);
      return false;
    }
  });
  // Calculate how many invalid URLs we detected
  const invalidCount = allImages.length - images.length;
  if (images.length === 0 && !isAddingImage && !isEditingImage) {
    return (
      <div>
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">No valid images</AlertTitle>
          <AlertDescription className="text-amber-700">
            {invalidCount > 0
              ? `${invalidCount} invalid image URL${
                  invalidCount !== 1 ? 's' : ''
                } detected. Please check the image data.`
              : 'No images available for this trip.'}
          </AlertDescription>
        </Alert>

        {/* Always show add button when there are no valid images */}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-1"
            onClick={() => setIsAddingImage(!isAddingImage)}
          >
            <ImagePlus className="h-4 w-4" />
            {isAddingImage ? 'Cancel' : 'Add First Image'}
          </Button>

          {isAddingImage && (
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleAddImage}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  } // Function to add a new image URL to the trip
  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(newImageUrl); // Validate URL format
    } catch (err) {
      toast.error('Please enter a valid URL format');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the new images array
      let updatedImages: string[];

      try {
        const currentImages = JSON.parse(imageData);
        if (Array.isArray(currentImages)) {
          updatedImages = [...currentImages, newImageUrl];
        } else {
          updatedImages = [imageData, newImageUrl];
        }
      } catch (e) {
        // If imageData isn't a valid JSON array, treat it as a single image
        updatedImages = [imageData, newImageUrl];
      }

      // Update the trip with new images
      await tripsApi.updateTrip(tripId, {
        image: JSON.stringify(updatedImages),
      });

      // Update state or reload data
      if (onImagesUpdate) {
        onImagesUpdate(JSON.stringify(updatedImages));
      }

      toast.success('Image added successfully');
      setNewImageUrl('');
      setIsAddingImage(false);
    } catch (error) {
      console.error('Failed to add image:', error);
      toast.error('Failed to add image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Function to delete an image from the gallery
  const handleDeleteImage = async (imageUrlToDelete: string) => {
    setIsDeletingImage(true);

    try {
      // Get current images array
      let currentImageArray: string[];

      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          currentImageArray = parsed;
        } else {
          currentImageArray = [imageData];
        }
      } catch (e) {
        // If parsing fails, treat as a single image
        currentImageArray = [imageData];
      }

      // Filter out the image to delete
      const updatedImages = currentImageArray.filter(
        (img) => img !== imageUrlToDelete
      );

      // Update the trip with the filtered images
      await tripsApi.updateTrip(tripId, {
        image: JSON.stringify(updatedImages),
      });

      // Update state or reload data
      if (onImagesUpdate) {
        onImagesUpdate(JSON.stringify(updatedImages));
      }

      toast.success('Image deleted successfully');

      // If the deleted image was the selected one, close the preview
      if (selectedImage === imageUrlToDelete) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image. Please try again.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  // Function to start editing an image URL
  const startEditImage = (imageUrl: string) => {
    setImageToEdit(imageUrl);
    setEditImageUrl(imageUrl);
    setIsEditingImage(true);
    setSelectedImage(null); // Close the preview if it's open
  };

  // Function to update an image URL
  const handleUpdateImage = async () => {
    if (!imageToEdit) return;

    if (!editImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(editImageUrl); // Validate URL format
    } catch (err) {
      toast.error('Please enter a valid URL format');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current images array
      let currentImageArray: string[];

      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          currentImageArray = parsed;
        } else {
          currentImageArray = [imageData];
        }
      } catch (e) {
        // If parsing fails, treat as a single image
        currentImageArray = [imageData];
      }

      // Replace the old URL with the new one
      const updatedImages = currentImageArray.map((img) =>
        img === imageToEdit ? editImageUrl : img
      );

      // Update the trip with the updated images
      await tripsApi.updateTrip(tripId, {
        image: JSON.stringify(updatedImages),
      });

      // Update state or reload data
      if (onImagesUpdate) {
        onImagesUpdate(JSON.stringify(updatedImages));
      }

      toast.success('Image URL updated successfully');

      // Reset edit state
      setIsEditingImage(false);
      setImageToEdit(null);
      setEditImageUrl('');
    } catch (error) {
      console.error('Failed to update image URL:', error);
      toast.error('Failed to update image URL. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {invalidCount > 0 && (
        <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Some images couldn't be displayed
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            {invalidCount} of {allImages.length} image URL
            {invalidCount !== 1 ? 's' : ''} {invalidCount !== 1 ? 'are' : 'is'}{' '}
            invalid
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Photo Gallery</h3>
          {!isEditingImage && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => setIsAddingImage(!isAddingImage)}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {isAddingImage ? 'Cancel' : 'Add Image'}
            </Button>
          )}
        </div>

        {isAddingImage && !isEditingImage && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button onClick={handleAddImage} disabled={isSubmitting} size="sm">
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        )}

        {isEditingImage && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Update image URL"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleUpdateImage}
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
            <Button
              onClick={() => {
                setIsEditingImage(false);
                setImageToEdit(null);
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-md transition-shadow relative group"
          >
            <CardContent className="p-1">
              <div
                className="aspect-video rounded-md overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`${tripName} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x225?text=Image+Not+Available';
                  }}
                />
              </div>
              {/* Action buttons that appear on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Edit button */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditImage(image);
                  }}
                  disabled={isDeletingImage || isSubmitting}
                  title="Edit image URL"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image);
                  }}
                  disabled={isDeletingImage || isSubmitting}
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>{' '}
      {/* Image preview modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{tripName} - Image Preview</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    if (selectedImage) {
                      startEditImage(selectedImage);
                    }
                  }}
                  disabled={isDeletingImage || isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    if (selectedImage) {
                      handleDeleteImage(selectedImage);
                    }
                  }}
                  disabled={isDeletingImage || isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="h-[60vh] w-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt={`${tripName} photo fullscreen`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
