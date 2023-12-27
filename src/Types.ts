// define types


export type Project = {
    previewTitle: string;
    title: string;
    blurb: string;
    images: {
        src: string;
        isThumb: boolean;
        isOnContentPage: boolean;
    }[];
    videos: string[]
    introText: string;
    paragraphs: string[];
    link: string;
    hidden?: boolean;
}


export type Projects = {
    [key: string]: Project;
}