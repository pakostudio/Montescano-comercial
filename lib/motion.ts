// One vocabulary: precise feedback, traveling indicators, slower editorial reveals.
export const FAST = .18;
export const NORMAL = .32;
export const SLOW = .52;
export const EASE = [.22, 1, .36, 1] as const;
export const SPRING = {type: 'spring' as const, stiffness: 380, damping: 34, mass: .8};
export const fade = {duration: NORMAL, ease: EASE};
export const sequence = {hidden: {}, visible: {transition: {staggerChildren: .07}}};
export const editorial = {hidden: {opacity: 0, y: 18}, visible: {opacity: 1, y: 0, transition: {duration: SLOW, ease: EASE}}};
