import {Author, ExtraLink} from './index.js';

export type TweetMetadata = {
    id: string;
    url: string;
    title: string;
    content_html: string;
    date_published: string;
    authors: Author[];
    _extra?: {
        links: ExtraLink[];
    };
};
