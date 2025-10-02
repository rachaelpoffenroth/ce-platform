import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);

  // Add custom CSS to hide confusing drag-and-drop text
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .uppy-Dashboard-dropFilesHereHint,
      .uppy-Dashboard-browse,
      .uppy-Dashboard-dropFilesTitle,
      .uppy-Dashboard-dropFileImportBoth,
      .uppy-Dashboard-AddFilePanel,
      .uppy-Dashboard-AddFilesPanel,
      .uppy-Dashboard-AddFiles-title,
      .uppy-Dashboard-AddFiles-info,
      [data-uppy-drag-drop-supported="true"] .uppy-Dashboard-AddFiles,
      .uppy-Dashboard-note {
        display: none !important;
      }
      .uppy-Dashboard-inner {
        background: white !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 8px !important;
      }
      .uppy-Dashboard-AddFiles {
        padding: 20px !important;
        text-align: center !important;
      }
      .uppy-Dashboard-AddFiles::before {
        content: "Click 'Browse Files' to select your files" !important;
        display: block !important;
        color: #64748b !important;
        font-size: 14px !important;
        margin-bottom: 12px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <div 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        data-testid="button-upload-area"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowModal(true);
          }
        }}
      >
        {children}
      </div>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        disableLocalFiles={true}
        hideRetryButton={true}
        hidePauseResumeButton={true}
        hideCancelButton={false}
        hideUploadButton={false}
        note="Click 'Browse Files' to select your files"
        showSelectedFiles={true}
        showRemoveButtonAfterComplete={true}
        browserBackButtonClose={true}
      />
    </div>
  );
}
