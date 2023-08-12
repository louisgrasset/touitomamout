interface BlobInfo {
    mimeType: string;
    blobData: Uint8Array;
}

export const mediaBlobParser = async (blob: Blob): Promise<BlobInfo> => {
    return new Promise<BlobInfo>((resolve, reject) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        const mimeType = blob.type;

        blob.arrayBuffer().then(ab => {
            const buffer = Buffer.from(ab);
            const data = new Uint8Array(buffer);

            if(!mimeType || !allowedMimeTypes.includes(mimeType)) {
                reject(`Media type not supported (${mimeType})`);
            } else {
                resolve({ mimeType, blobData :data });
            }
        });
    });
};
