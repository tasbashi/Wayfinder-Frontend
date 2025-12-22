"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";

export interface FileUploadProps {
    /** Currently uploaded file URL */
    value?: string | null;
    /** Called when a file is selected */
    onFileSelect: (file: File) => Promise<void>;
    /** Called when the file should be removed */
    onRemove?: () => Promise<void>;
    /** Accepted file types */
    accept?: string;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Whether the component is disabled */
    disabled?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Helper text shown below the upload area */
    helperText?: string;
    /** Label text */
    label?: string;
    /** Error message */
    error?: string;
    /** Class name for the container */
    className?: string;
}

export function FileUpload({
    value,
    onFileSelect,
    onRemove,
    accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml",
    maxSizeMB = 20,
    disabled = false,
    placeholder = "Dosya yüklemek için tıkla veya sürükle bırak",
    helperText,
    label,
    error,
    className = "",
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayError = error || localError;

    const validateFile = (file: File): string | null => {
        // Check file type
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        if (!acceptedTypes.some((type) => file.type.match(type.replace("*", ".*")))) {
            return `Dosya türü geçersiz. Kabul edilen türler: ${acceptedTypes.join(", ")}`;
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB`;
        }

        return null;
    };

    const handleFile = useCallback(
        async (file: File) => {
            setLocalError(null);

            const validationError = validateFile(file);
            if (validationError) {
                setLocalError(validationError);
                return;
            }

            try {
                setIsUploading(true);
                await onFileSelect(file);
            } catch (err) {
                setLocalError(err instanceof Error ? err.message : "Dosya yüklenirken hata oluştu");
            } finally {
                setIsUploading(false);
            }
        },
        [onFileSelect, maxSizeMB, accept]
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            if (!disabled && !isUploading) {
                setIsDragging(true);
            }
        },
        [disabled, isUploading]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (disabled || isUploading) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                await handleFile(files[0]);
            }
        },
        [disabled, isUploading, handleFile]
    );

    const handleClick = useCallback(() => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    }, [disabled, isUploading]);

    const handleInputChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                await handleFile(files[0]);
            }
            // Reset input to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [handleFile]
    );

    const handleRemove = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (onRemove) {
                try {
                    setIsUploading(true);
                    await onRemove();
                } catch (err) {
                    setLocalError(err instanceof Error ? err.message : "Dosya silinirken hata oluştu");
                } finally {
                    setIsUploading(false);
                }
            }
        },
        [onRemove]
    );

    const getImageUrl = (url: string) => {
        // If it's a relative URL starting with /, prepend the API base URL
        if (url.startsWith("/")) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7014";
            return `${apiUrl}${url}`;
        }
        return url;
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">{label}</label>
            )}

            <div className="relative">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || isUploading}
                />

                {/* Preview or Upload Area */}
                {value ? (
                    /* Image Preview */
                    <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <div className="aspect-video relative">
                            <img
                                src={getImageUrl(value)}
                                alt="Uploaded preview"
                                className="w-full h-full object-contain bg-white"
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleClick}
                                    disabled={isUploading}
                                    className="bg-white text-gray-900 hover:bg-gray-100"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Değiştir
                                </Button>
                                {onRemove && (
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        onClick={handleRemove}
                                        disabled={isUploading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Kaldır
                                    </Button>
                                )}
                            </div>

                            {/* Loading overlay */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Drop zone */
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-8
              transition-all duration-200 ease-in-out
              ${isDragging
                                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                                : displayError
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                            }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    <p className="text-sm text-gray-600">Yükleniyor...</p>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`
                      p-4 rounded-full transition-colors
                      ${isDragging ? "bg-blue-100" : "bg-gray-100"}
                    `}
                                    >
                                        {displayError ? (
                                            <AlertCircle className="w-10 h-10 text-red-500" />
                                        ) : (
                                            <ImageIcon
                                                className={`w-10 h-10 ${isDragging ? "text-blue-600" : "text-gray-400"}`}
                                            />
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            {placeholder}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            PNG, JPG, GIF, WebP, SVG • Maks. {maxSizeMB}MB
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={disabled}
                                        className="pointer-events-none"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Dosya Seç
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Helper text or error */}
            {(helperText || displayError) && (
                <p
                    className={`text-sm ${displayError ? "text-red-600" : "text-gray-500"
                        }`}
                >
                    {displayError || helperText}
                </p>
            )}
        </div>
    );
}
