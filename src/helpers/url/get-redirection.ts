export const getRedirectedUrl = async(url: string): Promise<string | null> => {
    try {
        const response = await fetch(url, { redirect: 'manual' });

        if (response.status >= 300 && response.status < 400) {
            const redirectedUrl = response.headers.get('location');
            return redirectedUrl || null;
        }

        return null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};
