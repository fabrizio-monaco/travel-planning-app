'use client';

import Image from 'next/image'; // Note: Standard <img> is used in the provided code for gallery items
import { useState, useEffect, useCallback } from 'react';
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
import {
  PlusCircle,
  Info,
  ImagePlus,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { tripsApi } from '@/services/trips-api';
import { destinationsApi } from '@/services/destinations-api';
import { toast } from 'sonner';

interface GalleryProps {
  imageData: string;
  tripName: string;
  tripId: string;
  onImagesUpdate?: (newImageData: string) => void;
  isDestination?: boolean;
}

export function Gallery({
  imageData,
  tripName,
  tripId,
  onImagesUpdate,
  isDestination = false,
}: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [modalImageLoading, setModalImageLoading] = useState(false);

  // Effect to manage modal loading/error states when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      // When a new image is selected (or modal is opened with an image)
      setModalImageLoading(true);
      setModalImageFailed(false); // Crucially reset failed state
    } else {
      // When modal is closed (selectedImage becomes null)
      setModalImageLoading(false);
      setModalImageFailed(false);
    }
  }, [selectedImage]);

  const getImages = useCallback(() => {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        return parsed.filter(String); // Ensure all items are strings
      }
    } catch (e) {
      // Not a valid JSON array, treat as a single image if imageData is a non-empty string
    }
    return imageData ? [imageData].filter(String) : [];
  }, [imageData]);

  useEffect(() => {
    // Reset modal-specific states when imageData changes significantly,
    // or when the selected image is cleared.
    setModalImageFailed(false);
    setModalImageLoading(false);

    const currentValidImages = getImages().filter((imgUrl) => {
      try {
        new URL(imgUrl);
        return true;
      } catch (err) {
        return false;
      }
    });

    // Update loadingImages state intelligently
    setLoadingImages((prevLoadingImages) => {
      const newLoadingState: Record<string, boolean> = {};
      currentValidImages.forEach((image) => {
        // Check using Object.prototype.hasOwnProperty.call for robustness
        if (Object.prototype.hasOwnProperty.call(prevLoadingImages, image)) {
          // Image existed, preserve its loading state
          newLoadingState[image] = prevLoadingImages[image];
        } else {
          // New image (not seen before or re-appearing), set to loading
          // This will also handle the initial load case where prevLoadingImages is empty
          newLoadingState[image] = true;
        }
      });
      // Entries for images that were in prevLoadingImages but not in currentValidImages
      // will be naturally excluded, effectively cleaning up the state for removed images.
      return newLoadingState;
    });

    // Update failedImages state: remove entries for images no longer present, preserve existing.
    setFailedImages((prevFailedImages) => {
      const newFailedImagesState: Record<string, boolean> = {};
      currentValidImages.forEach((image) => {
        if (Object.prototype.hasOwnProperty.call(prevFailedImages, image)) {
          newFailedImagesState[image] = prevFailedImages[image];
        }
        // If an image was failed but is no longer in currentValidImages, it's omitted.
        // New images won't be in prevFailedImages, so they aren't marked failed here.
      });
      return newFailedImagesState;
    });
  }, [imageData, getImages]); // getImages is memoized and changes when imageData changes

  // Handle image load complete
  const handleImageLoaded = (imageUrl: string) => {
    setLoadingImages((prev) => ({
      ...prev,
      [imageUrl]: false,
    }));
    // If it previously failed, clear the failed state upon successful load
    setFailedImages((prev) => {
      const newState = { ...prev };
      delete newState[imageUrl];
      return newState;
    });
  };

  // Handle image load error
  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
    setLoadingImages((prev) => ({
      ...prev,
      [imageUrl]: false, // Stop showing loader, error will be indicated by placeholder or failedImages state
    }));
  };

  // Handle modal image loaded
  const handleModalImageLoaded = () => {
    setModalImageLoading(false);
  };

  // Handle modal image load error
  const handleModalImageError = () => {
    setModalImageFailed(true);
    setModalImageLoading(false);
  };

  const allImagesRaw = getImages(); // Get images based on current imageData

  // Filter out invalid URLs for rendering and keep track of them
  // This 'images' list is what gets rendered.
  const images = allImagesRaw.filter((img) => {
    try {
      new URL(img);
      return true;
    } catch (err) {
      // console.warn(`Invalid image URL in images list: ${img}`); // Already handled by getImages filter in useEffect if needed
      return false;
    }
  });

  const invalidUrlCount = allImagesRaw.length - images.length;

  const handleCleanupInvalidImages = async () => {
    if (invalidUrlCount === 0) return;

    setIsSubmitting(true);
    try {
      // 'images' already contains only valid URLs
      const updatedImageData = JSON.stringify(images);

      if (isDestination) {
        await destinationsApi.updateDestination(tripId, {
          photos: updatedImageData,
        });
      } else {
        await tripsApi.updateTrip(tripId, {
          image: updatedImageData,
        });
      }

      if (onImagesUpdate) {
        onImagesUpdate(updatedImageData);
      }
      toast.success(`Removed ${invalidUrlCount} invalid image URL(s)`);
    } catch (error) {
      console.error('Failed to cleanup invalid images:', error);
      toast.error('Failed to cleanup invalid images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(newImageUrl); // Validate URL format
    } catch (err) {
      toast.error(
        'Please enter a valid URL format (e.g., http://example.com/image.png)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const currentImageArray = getImages(); // Get current images using the memoized function
      const updatedImages = [...currentImageArray, newImageUrl];

      // Explicitly set the new image to loading state *before* calling onImagesUpdate
      // This ensures its spinner shows immediately. The useEffect will then preserve this.
      setLoadingImages((prev) => ({
        ...prev,
        [newImageUrl]: true,
      }));
      // Clear potential previous failed state for this URL if it's being re-added
      setFailedImages((prev) => {
        const newState = { ...prev };
        delete newState[newImageUrl];
        return newState;
      });

      const newImageDataString = JSON.stringify(updatedImages);

      if (isDestination) {
        await destinationsApi.updateDestination(tripId, {
          photos: newImageDataString,
        });
      } else {
        await tripsApi.updateTrip(tripId, {
          image: newImageDataString,
        });
      }

      if (onImagesUpdate) {
        onImagesUpdate(newImageDataString);
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

  const handleDeleteImage = async (
    imageUrlToDelete: string,
    indexToDelete?: number
  ) => {
    setIsDeletingImage(true); // Set specific deleting flag

    try {
      let currentImageArray = getImages();
      let updatedImages: string[];

      if (
        indexToDelete !== undefined &&
        currentImageArray[indexToDelete] === imageUrlToDelete
      ) {
        updatedImages = currentImageArray.filter(
          (_, idx) => idx !== indexToDelete
        );
      } else {
        // Fallback or if index is not reliable, remove all instances of the URL
        updatedImages = currentImageArray.filter(
          (img) => img !== imageUrlToDelete
        );
      }

      const newImageDataString = JSON.stringify(updatedImages);

      if (isDestination) {
        await destinationsApi.updateDestination(tripId, {
          photos: newImageDataString,
        });
      } else {
        await tripsApi.updateTrip(tripId, {
          image: newImageDataString,
        });
      }

      if (onImagesUpdate) {
        onImagesUpdate(newImageDataString);
      }

      toast.success('Image deleted successfully');

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

  const startEditImage = (imageUrl: string) => {
    setImageToEdit(imageUrl);
    setEditImageUrl(imageUrl);
    setIsEditingImage(true);
    setSelectedImage(null);
  };

  const handleUpdateImage = async () => {
    if (!imageToEdit) return;

    if (!editImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(editImageUrl);
    } catch (err) {
      toast.error('Please enter a valid URL format');
      return;
    }

    if (imageToEdit === editImageUrl) {
      toast.info('Image URL is the same. No changes made.');
      setIsEditingImage(false);
      setImageToEdit(null);
      return;
    }

    setIsSubmitting(true);

    try {
      let currentImageArray = getImages();
      const updatedImages = currentImageArray.map((img) =>
        img === imageToEdit ? editImageUrl : img
      );

      // When an image URL changes, the old URL's states should be cleared,
      // and the new URL should be marked for loading.
      setLoadingImages((prev) => {
        const newState = { ...prev };
        delete newState[imageToEdit]; // Remove old URL's loading state
        newState[editImageUrl] = true; // Set new URL to loading
        return newState;
      });
      setFailedImages((prev) => {
        const newState = { ...prev };
        delete newState[imageToEdit]; // Remove old URL's failed state
        // New URL's failed state will be determined on load attempt
        return newState;
      });

      const newImageDataString = JSON.stringify(updatedImages);

      if (isDestination) {
        await destinationsApi.updateDestination(tripId, {
          photos: newImageDataString,
        });
      } else {
        await tripsApi.updateTrip(tripId, {
          image: newImageDataString,
        });
      }

      if (onImagesUpdate) {
        onImagesUpdate(newImageDataString);
      }

      toast.success('Image URL updated successfully');
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

  if (
    images.length === 0 &&
    !isAddingImage &&
    !isEditingImage &&
    invalidUrlCount === 0
  ) {
    return (
      <div>
        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
        >
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">
            Empty Gallery
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            No images available for this{' '}
            {isDestination ? 'destination' : 'trip'}. Add your first image to
            get started.
          </AlertDescription>
        </Alert>
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
                disabled={isSubmitting || !newImageUrl.trim()}
                size="sm"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {invalidUrlCount > 0 && (
        <Alert
          variant="destructive"
          className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">
            Invalid Image URLs Detected
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 flex flex-col gap-2">
            <span>
              {invalidUrlCount} of {allImagesRaw.length} image URL
              {invalidUrlCount !== 1 ? 's are' : ' is'} invalid or could not be
              processed. These URLs will not be displayed.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="self-start flex items-center gap-1 border-amber-300 hover:bg-amber-100 text-amber-700 dark:border-amber-600 dark:hover:bg-amber-800/50 dark:text-amber-400"
              onClick={handleCleanupInvalidImages}
              disabled={isSubmitting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Invalid URLs from Data
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
          {!isEditingImage && (
            <Button
              variant="outline"
              size="sm"
              className="text-sm flex items-center gap-1"
              onClick={() => setIsAddingImage(!isAddingImage)}
            >
              <ImagePlus className="h-4 w-4" />
              {isAddingImage ? 'Cancel' : 'Add Image'}
            </Button>
          )}
        </div>

        {isAddingImage && !isEditingImage && (
          <div className="flex gap-2 mb-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
            <Input
              placeholder="Enter image URL (e.g., https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleAddImage}
              disabled={isSubmitting || !newImageUrl.trim()}
              size="sm"
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        )}

        {isEditingImage && imageToEdit && (
          <div className="flex gap-2 mb-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
            <Input
              placeholder="Update image URL"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleUpdateImage}
              disabled={
                isSubmitting ||
                !editImageUrl.trim() ||
                editImageUrl === imageToEdit
              }
              size="sm"
            >
              {isSubmitting ? 'Updating...' : 'Update URL'}
            </Button>
            <Button
              onClick={() => {
                setIsEditingImage(false);
                setImageToEdit(null);
                setEditImageUrl('');
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(
          (
            image,
            index // `image` should be unique if used as key
          ) => (
            <Card
              key={`${image}-${index}`} // Use image URL + index for key if URLs might not be unique, otherwise just `image` is fine if unique
              className="overflow-hidden hover:shadow-lg transition-shadow relative group"
            >
              <CardContent className="p-0">
                {' '}
                {/* Usually CardContent has padding, p-0 to make image flush */}
                <div
                  className="aspect-video rounded-md overflow-hidden cursor-pointer relative bg-gray-100 dark:bg-gray-800" // Added bg-gray-100 for loading/error bg
                  onClick={() => setSelectedImage(image)}
                >
                  {loadingImages[image] && !failedImages[image] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/70 dark:bg-gray-700/70 z-10">
                      <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-blue-600 animate-spin"></div>
                    </div>
                  )}
                  {/* Using <img> tag as in the original. If Next.js Image component is desired for optimization, 
                  it would require width/height or fill, and domain whitelisting.
                */}
                  {failedImages[image] ? (
                    <img
                      src={'https://placehold.co/400x225/333/CCC?text=Error'} // Consistent placeholder
                      alt={`Failed to load image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1} for ${tripName}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      style={{
                        opacity:
                          loadingImages[image] && !failedImages[image]
                            ? 0.7
                            : 1,
                      }} // More precise opacity
                      onLoad={() => handleImageLoaded(image)}
                      onError={() => handleImageError(image)}
                    />
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditImage(image);
                    }}
                    disabled={isDeletingImage || isSubmitting}
                    title="Edit image URL"
                  >
                    {/* SVG for Edit */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      const imageIndexInFilteredList = images.findIndex(
                        (imgUrl) => imgUrl === image
                      );
                      handleDeleteImage(image, imageIndexInFilteredList);
                    }}
                    disabled={isDeletingImage || isSubmitting}
                    title="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImage(null); // This will trigger the useEffect to reset modal states
          }
          // The logic previously here (calling handleModalImageLoadStart)
          // is now handled by the useEffect hook listening to selectedImage.
        }}
      >
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex justify-between items-center text-lg">
              <span>Image Preview</span>
              <div className="flex gap-2 items-center mr-8">
                {' '}
                {/* Added mr-8 for spacing from dialog's own close button */}
                {selectedImage &&
                  !failedImages[selectedImage] && ( // Show edit only if not failed in main gallery view
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        if (selectedImage) startEditImage(selectedImage);
                      }}
                      disabled={isDeletingImage || isSubmitting}
                    >
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </Button>
                  )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    if (selectedImage) {
                      const selectedIndex = images.findIndex(
                        (img) => img === selectedImage
                      );
                      handleDeleteImage(
                        selectedImage,
                        selectedIndex !== -1 ? selectedIndex : undefined
                      );
                    }
                  }}
                  disabled={isDeletingImage || isSubmitting}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="h-[70vh] w-full flex items-center justify-center relative bg-black/80">
              {modalImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-gray-300 dark:border-gray-600 animate-spin"></div>
                </div>
              )}
              <img
                src={
                  modalImageFailed
                    ? 'https://placehold.co/800x600/111/FFF?text=Error%20Displaying%20Image'
                    : selectedImage
                }
                alt={`${tripName} photo fullscreen preview`}
                className="max-h-full max-w-full object-contain"
                style={{ display: modalImageLoading ? 'none' : 'block' }}
                onLoad={handleModalImageLoaded}
                onError={handleModalImageError}
              />
              {modalImageFailed && !modalImageLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 text-sm rounded-md shadow-lg text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>
                    This image could not be loaded. The URL might be invalid or
                    the image is unavailable.
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
