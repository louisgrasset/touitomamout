/**
 * A method to download the media
 */
export const downloadMedia = (url: string): Promise<Blob | null> => {
    return fetch(url)
        .then(res => res.blob())
        .catch(err => {
            console.error(`Unable to download media:\n${err}`);
            return null;
        });
};
