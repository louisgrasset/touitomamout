import {Photo, Video} from '@the-convocation/twitter-scraper/dist/tweets.js';

export type Media = Photo & { type: 'image' } | Video & { type: 'video' }
