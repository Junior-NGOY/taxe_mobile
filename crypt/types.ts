export type Invoice = {
    number: string|number;
    name: string;
    date: Date|number;
    amount?: number;
    site?: { name: string };
    plate?: string;
    createdAt?: string;
};