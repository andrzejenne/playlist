export interface ItemInterface {
    sid: string;
    title: string;
    files: {
        name: string;
        progress: number;
    }[];
    thumbnail: string;
    status: string[];
    started: boolean;
    finished: boolean;
}