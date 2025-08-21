"use client"

import { useState, useRef, useEffect } from "react"
import "../css/FileUpload.css"
import sessionManager from "../utils/SessionManager"

export default function FileUpload({
  onFilesUploaded,
  uploadType = "prescription",
  maxFiles = 5,
  label = "Upload Files",
  accept = "image/*",
  initialFiles = [],
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const token = sessionManager.getToken()

  // Initialize uploaded files only once when initialFiles changes
  useEffect(() => {
    const normalizedInitialFiles = initialFiles || []
    setUploadedFiles(normalizedInitialFiles)
  }, [initialFiles]) // Include initialFiles dependency to initialize uploadedFiles

  // Separate effect to handle initial files changes from parent
  useEffect(() => {
    if (initialFiles && initialFiles.length !== uploadedFiles.length) {
      setUploadedFiles(initialFiles)
    }
  }, [initialFiles]) // Depend on initialFiles to avoid unnecessary updates

  // Call parent callback when files change, but debounce it
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilesUploaded(uploadedFiles)
    }, 100) // Small debounce to prevent rapid calls

    return () => clearTimeout(timeoutId)
  }, [uploadedFiles]) // Remove onFilesUploaded from dependencies

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const totalFiles = uploadedFiles.length + fileArray.length

    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You currently have ${uploadedFiles.length} files.`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      fileArray.forEach((file) => {
        if (uploadType === "prescription") {
          formData.append("prescriptions", file)
        } else {
          formData.append("testReports", file)
        }
      })

      if (uploadType === "test-report") {
        formData.append("reportType", "Other")
      }

      const endpoint = uploadType === "prescription" ? "/api/upload/prescription" : "/api/upload/test-report"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Upload failed")
      }

      // Add new files to existing uploaded files
      setUploadedFiles((prev) => {
        const newFiles = [...prev, ...data.files]
        console.log("Updated uploaded files:", newFiles)
        return newFiles
      })

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = async (fileIndex, publicId) => {
    try {
      if (publicId && publicId !== "unknown") {
        await fetch(`/api/upload/image/${publicId}`, {
          method: "DELETE",
          headers: { Authorization: token },
        })
      }

      setUploadedFiles((prev) => {
        const newFiles = prev.filter((_, index) => index !== fileIndex)
        console.log("Files after removal:", newFiles)
        return newFiles
      })
    } catch (error) {
      console.error("Error removing file:", error)
      // Still remove from UI even if server deletion fails
      setUploadedFiles((prev) => prev.filter((_, index) => index !== fileIndex))
    }
  }

  // Function to get image URL from different data structures
  const getImageUrl = (file) => {
    if (typeof file === "string") return file
    if (file && typeof file === "object" && file.url) return file.url
    return "/placeholder.svg"
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={uploading}
        />

        <div className="upload-content">
          {uploading ? (
            <div className="upload-spinner">
              <div className="spinner"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <p className="upload-text">{label}</p>
              <p className="upload-subtext">Drag & drop files here or click to browse</p>
              <p className="upload-limit">
                Max {maxFiles} files, JPG/PNG only
                {uploadedFiles.length > 0 && ` (${uploadedFiles.length}/${maxFiles} uploaded)`}
              </p>
            </>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files:</h4>
          <div className="files-grid">
            {uploadedFiles.map((file, index) => (
              <div key={`${index}-${file.publicId || file.url}`} className="uploaded-file">
                <img
                  src={getImageUrl(file) || "/placeholder.svg"}
                  alt={`Uploaded file ${index + 1}`}
                  className="file-thumbnail"
                />
                <button
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index, file.publicId)
                  }}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
