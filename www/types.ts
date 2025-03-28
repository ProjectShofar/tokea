export interface Template {
    type: string;
    name: string;
    description: string;
    init(): void;
    users(): Promise<any[]>;
}