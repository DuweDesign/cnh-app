import { COMPETITIONS, CompetitionType } from '../models/auth.model';

export interface CompetitionConfig {
    key: CompetitionType;
    label: string;
    news: Site;
    ranking: Site;
    bonus: Site;
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
        news: {
            backgroundImage: '',
            title: 'News'
        },
        ranking: {
            backgroundImage: '',
            title: 'Ranking'
        },
        bonus: {
            backgroundImage: '',
            title: 'Preise jeden Monat'
        },
        score: {
            backgroundImage: '',
            title: 'Mein Reisekonto'
        },
        rules: {
            backgroundImage: '',
            title: 'Die Regeln'
        },
        prizes: {
            backgroundImage: '',
            title: 'Die Reise'
        }
    },
    [COMPETITIONS.NEW_HOLLAND]: {
        key: COMPETITIONS.NEW_HOLLAND,
        label: 'NEW HOLLAND',
        news: {
            backgroundImage: '',
            title: 'News'
        },
        ranking: {
            backgroundImage: '',
            title: 'Ranking'
        },
        bonus: {
            backgroundImage: '',
            title: 'Preise jeden Monat'
        },
        score: {
            backgroundImage: '',
            title: 'Mein Fortschritt'
        },
        rules: {
            backgroundImage: '',
            title: 'Die Regeln'
        },
        prizes: {
            backgroundImage: '',
            title: 'Die Reise'
        }
    }
};