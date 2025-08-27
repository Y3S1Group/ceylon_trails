export const handleFileUpload = (req, res, next) => {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
        return next();
    }

    const boundary = req.headers['content-type'].split('boundary=')[1];
    if (!boundary) {
        return res.status(400).json({
            success: false,
            message: 'Invalid multipart data'
        });
    }

    let body = '';
    req.setEncoding('binary');

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const parts = body.split(`--${boundary}`);
            req.body = {};
            req.files = [];

            parts.forEach(part => {
                if (part.includes('Content-Disposition')) {
                    const lines = part.split('\r\n');
                    const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
 
                    if (dispositionLine) {
                        const nameMatch = dispositionLine.match(/name="([^"]+)"/);
                        const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
 
                        if (filenameMatch && nameMatch) {
                            // This is a file
                            const fieldname = nameMatch[1];
                            const filename = filenameMatch[1];
                            const contentTypeIndex = part.indexOf('Content-Type:');
                            let mimetype = 'application/octet-stream';
 
                            if (contentTypeIndex !== -1) {
                                const contentTypeLine = lines.find(line => line.includes('Content-Type:'));
                                if (contentTypeLine) {
                                    mimetype = contentTypeLine.split('Content-Type:')[1].trim();
                                }
                            }
 
                            const contentStart = part.indexOf('\r\n\r\n') + 4;
                            const contentEnd = part.lastIndexOf('\r\n');
 
                            if (contentStart < contentEnd) {
                                const fileContent = part.slice(contentStart, contentEnd);
                                const buffer = Buffer.from(fileContent, 'binary');
 
                                // Validate file
                                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                const maxSize = 5 * 1024 * 1024; // 5MB
 
                                if (!allowedTypes.includes(mimetype) &&
                                    !allowedTypes.some(type => filename.toLowerCase().includes(type.split('/')[1]))) {
                                    return res.status(400).json({
                                        success: false,
                                        message: `File ${filename}: Only JPEG, JPG, PNG, and WebP images are allowed`
                                    });
                                }
 
                                if (buffer.length > maxSize) {
                                    return res.status(400).json({
                                        success: false,
                                        message: `File ${filename}: File size exceeds 5MB limit`
                                    });
                                }
 
                                if (req.files.length >= 5) {
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Maximum 5 files allowed per upload'
                                    });
                                }
 
                                req.files.push({
                                    fieldname,
                                    originalname: filename,
                                    mimetype,
                                    buffer,
                                    size: buffer.length
                                });
                            }
                        } else if (nameMatch) {
                            // This is a regular field
                            const fieldName = nameMatch[1];
                            const contentStart = part.indexOf('\r\n\r\n') + 4;
                            const contentEnd = part.lastIndexOf('\r\n');
 
                            if (contentStart < contentEnd) {
                                const value = part.slice(contentStart, contentEnd).trim();
                                req.body[fieldName] = value;
                            }
                        }
                    }
                }
            });

            next();
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error parsing multipart data',
                error: error.message
            });
        }
    });

    req.on('error', (error) => {
        res.status(400).json({
            success: false,
            message: 'Error reading request data',
            error: error.message
        });
    });
}
