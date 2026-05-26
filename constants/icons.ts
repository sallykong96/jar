import home from '@/assets/icons/home.png';
import travel from '@/assets/icons/travel.png';
import review from '@/assets/icons/review.png';
import dates from '@/assets/icons/dates.png';



export const icons = {
    home,
    travel,
    review,
    dates
} as const;

export type IconKey = keyof typeof icons;
