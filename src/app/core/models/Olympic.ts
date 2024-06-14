import { Participation } from './Participation';

export interface Olympic {
    id: number;
    country: string;
    totalMedal: number;
    participations: Participation[];
}
