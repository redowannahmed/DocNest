"use client"

import { useState, useRef } from "react"
import "../css/FileUpload.css"

export default function FileUpload({
  onFilesUploaded,
  uploadType = "prescription",
  maxFiles = 5,
  label = "Upload Files",
  accept = "image/*",
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const token = localStorage.getItem("token")

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    if (fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
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
        formData.append("reportType", "Other") // Can be made dynamic
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

      setUploadedFiles((prev) => [...prev, ...data.files])
      onFilesUploaded(data.files)
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
      if (publicId) {
        await fetch(`/api/upload/image/${publicId}`, {
          method: "DELETE",
          headers: { Authorization: token },
        })
      }

      const newFiles = uploadedFiles.filter((_, index) => index !== fileIndex)
      setUploadedFiles(newFiles)
      onFilesUploaded(newFiles)
    } catch (error) {
      console.error("Error removing file:", error)
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
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
              <p className="upload-limit">Max {maxFiles} files, JPG/PNG only</p>
            </>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files:</h4>
          <div className="files-grid">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="uploaded-file">
                <img src={file.url || "/placeholder.svg"} alt="Uploaded" className="file-thumbnail" />
                <button
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index, file.publicId)
                  }}
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
