import { COMPETITIONS, CompetitionType } from '../models/auth.model';

export interface CompetitionConfig {
    key: CompetitionType;
    label: string;
    home: Site;
    ranking: Site;
    score: Site;
    rules: Site;
    prizes: Site;
}

interface Site {
    backgroundImage: string;
    title: string;
}

export const COMPETITION_CONFIG: Record<CompetitionType, CompetitionConfig> = {
    [COMPETITIONS.CASE_STEYR]: {
        key: COMPETITIONS.CASE_STEYR,
        label: 'CASE / STEYR',
        home: {
            backgroundImage: '/images/backgrounds/case-bg-april.jpg',
            title: 'Saisonübersicht'
        },
        ranking: {
            backgroundImage: '/images/backgrounds/case-bg-april.jpg',
            title: 'Ranking'
        },
        score: {
            backgroundImage: '/images/backgrounds/case-bg-april.jpg',
            title: 'Mein Fortschritt'
        },
        rules: {
            backgroundImage: '/images/backgrounds/case-bg-april.jpg',
            title: 'Die Regeln'
        },
        prizes: {
            backgroundImage: '/images/backgrounds/case-bg-april.jpg',
            title: 'Die Reise'
        }
    },
    [COMPETITIONS.NEW_HOLLAND]: {
        key: COMPETITIONS.NEW_HOLLAND,
        label: 'NEW HOLLAND',
        home: {
            backgroundImage: '/images/backgrounds/new-holland-bg-april.jpg',
            title: 'Saisonübersicht'
        },
        ranking: {
            backgroundImage: '/images/backgrounds/new-holland-bg-april.jpg',
            title: 'Ranking'
        },
        score: {
            backgroundImage: '/images/backgrounds/new-holland-bg-april.jpg',
            title: 'Mein Fortschritt'
        },
        rules: {
            backgroundImage: '/images/backgrounds/new-holland-bg-april.jpg',
            title: 'Die Regeln'
        },
        prizes: {
            backgroundImage: '/images/backgrounds/new-holland-bg-april.jpg',
            title: 'Die Reise'
        }
    }
};