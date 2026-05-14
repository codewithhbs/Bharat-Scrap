const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const fs = require('fs').promises;
const path = require('path');
const streamifier = require("stream").Readable;

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    cloud_name: process.env.CLOUD_NAME
});

const uploadFileToCloudinary = async (fileBuffer, fileType = "auto") => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "artists",
                    resource_type: fileType,
                    // "auto" → images, pdf, video, etc sab handle karega
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                            resource_type: result.resource_type,
                            format: result.format,
                            bytes: result.bytes,
                        });
                    }
                }
            );

            // Buffer → Stream → Cloudinary
            const bufferStream = streamifier.from(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error("Upload file error:", error);
        throw new Error("Failed to upload file");
    }
};

const uploadPDF = async (fileBuffer) => {
    try {
        return new Promise((resolve, reject) => {
            // Create upload stream for buffer
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'artists',
                    resource_type: 'auto' // Handles both images and PDFs
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve({
                            pdf: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            );

            // Convert buffer to stream and pipe to cloudinary
            const bufferStream = require('stream').Readable.from(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error('Upload PDF error:', error);
        throw new Error('Failed to upload PDF');
    }
};

const uploadPDFTwo = async (file) => {
    try {
        const pdf = await cloudinary.uploader.upload(file)
        return pdf.secure_url
    } catch (error) {
        console.log(error)
    }
}

// const uploadImage = async (file) => {
//     console.log('file',file)
//     try {
//         const result = await cloudinary.uploader.upload(file, {
//             folder: "artists"
//         });
//         return { image: result.secure_url, public_id: result.public_id };
//     } catch (error) {
//         console.error(error);
//         throw new Error('Failed to upload Image');
//     }
// };

const uploadImage = async (fileBuffer) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "artists",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary image upload error:", error);
                        reject(error);
                    } else {
                        resolve({
                            image: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            );

            const bufferStream = require("stream").Readable.from(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error("Upload image error:", error);
        throw new Error("Failed to upload Image");
    }
};

const uploadMultipleImages = async (fileBuffers, options = {}) => {
    const { parallel = true, folder = "artists" } = options;

    if (!Array.isArray(fileBuffers) || fileBuffers.length === 0) {
        throw new Error("fileBuffers array empty ya invalid hai");
    }

    const uploadSingle = (fileBuffer, index) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        console.error(`Image ${index + 1} upload error:`, error);
                        // reject ki jagah resolve with error (taaki baaki images fail na ho)
                        resolve({
                            index,
                            status: "failed",
                            error: error.message
                        });
                    } else {
                        resolve({
                            index,
                            status: "success",
                            image: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                }
            );

            const bufferStream = require("stream").Readable.from(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    };

    try {
        let results;

        if (parallel) {
            // Sab images ek saath upload (fast, but Cloudinary rate limit ka dhyan rakho)
            results = await Promise.all(
                fileBuffers.map((buf, i) => uploadSingle(buf, i))
            );
        } else {
            // Ek ke baad ek upload (slow, but safer)
            results = [];
            for (let i = 0; i < fileBuffers.length; i++) {
                const result = await uploadSingle(fileBuffers[i], i);
                results.push(result);
            }
        }

        const successful = results.filter(r => r.status === "success");
        const failed = results.filter(r => r.status === "failed");

        if (failed.length > 0) {
            console.warn(`${failed.length} image(s) upload fail hua:`, failed);
        }

        return {
            results,
            successful,
            failed,
            totalUploaded: successful.length,
            totalFailed: failed.length
        };

    } catch (error) {
        console.error("Multiple images upload error:", error);
        throw new Error("Failed to upload multiple images");
    }
};


const uploadVideo = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "artists",
            resource_type: "video"
        });
        // return result.secure_url;
        return { video: result.secure_url, public_id: result.public_id }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to upload video');
    }
};

const deleteVideoFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id)
    } catch (error) {
        console.error("Error deleting Video from Cloudinary:", error)
        throw new Error('Failed to delete video from Cloudinary');
    }
}

const deleteImageFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return;
        await cloudinary.uploader.destroy(public_id);
        console.log("Image Deleted:", public_id);
    } catch (error) {
        console.error("Error deleting Image from Cloudinary", error);
        throw new Error("Failed to delete Image from Cloudinary");
    }
};


const deletePdfFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log('Image Deleted')
    } catch (error) {
        console.error('Error in deleting PDF from Cloudinary', error)
        throw new Error('Failed to delete Pdf fron the Cloudinary')
    }
}

// Upload Voice Note to Cloudinary
const uploadVoiceNote = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "voice-notes",           // Store in 'voice-notes' folder
            resource_type: "video",          // Audio files treated as 'video' in Cloudinary
            public_id: `voice_${Date.now()}`, // Unique file name with timestamp
            format: "mp3"                    // Force mp3 format
        });

        return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error('Failed to upload voice note');
    }
};


// Delete Voice Note from Cloudinary
const deleteVoiceNoteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log("Voice note deleted");
    } catch (error) {
        console.error("Error deleting voice note from Cloudinary", error);
        throw new Error('Failed to delete voice note from Cloudinary');
    }
};

// const uploadPDF = async (filePath) => {
//     try {
//         const result = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'raw', // Important: Specify that the resource is raw (for non-image files)
//             eager: [{ width: 300, height: 300, crop: 'fit' }]
//         });
//         return {
//             pdf: result.secure_url, // URL to access the PDF
//             public_id: result.public_id
//         };
//     } catch (error) {
//         throw new Error('Failed to upload PDF: ' + error.message);
//     }
// };

module.exports = {
    uploadImage, uploadMultipleImages , deleteVideoFromCloudinary, uploadVideo, uploadVoiceNote, deleteVoiceNoteFromCloudinary, deleteImageFromCloudinary, uploadPDF, deletePdfFromCloudinary, uploadPDFTwo, uploadFileToCloudinary
};