import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void; // Discard changes and proceed
  onCancel: () => void; // Stay on current modal
  zIndex?: number; // Optional z-index for layering above different modals
}

export default function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
  zIndex = 50, // Default z-index
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onCancel()}
    >
      <AlertDialogPortal>
        {/* Custom overlay with dynamic z-index */}
        <AlertDialogOverlay style={{ zIndex: zIndex + 10 }} />

        {/* Custom content with dynamic z-index */}
        <AlertDialogContent style={{ zIndex: zIndex + 20 }}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              You have unsaved changes that will be lost if you proceed. Are you
              sure you want to discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
