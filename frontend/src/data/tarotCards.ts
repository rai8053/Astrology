export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  meaning: string;
  reversedMeaning: string;
  keywords: string[];
  number?: string;
}

export const tarotCards: TarotCard[] = [
  { id: 0, name: 'The Fool', arcana: 'major', meaning: 'New beginnings, innocence, spontaneity, free spirit', reversedMeaning: 'Recklessness, risk-taking, holding back', keywords: ['beginnings', 'innocence', 'adventure'] },
  { id: 1, name: 'The Magician', arcana: 'major', meaning: 'Willpower, skill, resourcefulness, creativity', reversedMeaning: 'Manipulation, trickery, untapped potential', keywords: ['power', 'skill', 'creation'] },
  { id: 2, name: 'The High Priestess', arcana: 'major', meaning: 'Intuition, mystery, inner knowledge, subconscious', reversedMeaning: 'Secrets, withdrawal, silence', keywords: ['intuition', 'mystery', 'wisdom'] },
  { id: 3, name: 'The Empress', arcana: 'major', meaning: 'Fertility, abundance, nature, nurturing', reversedMeaning: 'Creative block, dependence, emptiness', keywords: ['abundance', 'nurture', 'beauty'] },
  { id: 4, name: 'The Emperor', arcana: 'major', meaning: 'Authority, structure, stability, protection', reversedMeaning: 'Tyranny, rigidity, lack of discipline', keywords: ['authority', 'structure', 'power'] },
  { id: 5, name: 'The Hierophant', arcana: 'major', meaning: 'Tradition, spiritual guidance, conformity', reversedMeaning: 'Rebellion, unconventionality, new approaches', keywords: ['tradition', 'guidance', 'wisdom'] },
  { id: 6, name: 'The Lovers', arcana: 'major', meaning: 'Love, harmony, relationships, choices', reversedMeaning: 'Imbalance, misalignment, separation', keywords: ['love', 'union', 'choices'] },
  { id: 7, name: 'The Chariot', arcana: 'major', meaning: 'Determination, willpower, victory, control', reversedMeaning: 'Lack of direction, aggression, defeat', keywords: ['victory', 'willpower', 'drive'] },
  { id: 8, name: 'Strength', arcana: 'major', meaning: 'Inner strength, courage, patience, compassion', reversedMeaning: 'Self-doubt, weakness, insecurity', keywords: ['strength', 'courage', 'patience'] },
  { id: 9, name: 'The Hermit', arcana: 'major', meaning: 'Soul-searching, introspection, solitude, wisdom', reversedMeaning: 'Isolation, loneliness, withdrawal', keywords: ['wisdom', 'solitude', 'introspection'] },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', meaning: 'Change, cycles, destiny, turning point', reversedMeaning: 'Bad luck, resistance to change, setbacks', keywords: ['change', 'destiny', 'cycles'] },
  { id: 11, name: 'Justice', arcana: 'major', meaning: 'Fairness, truth, cause and effect, law', reversedMeaning: 'Injustice, dishonesty, lack of accountability', keywords: ['justice', 'truth', 'balance'] },
  { id: 12, name: 'The Hanged Man', arcana: 'major', meaning: 'Surrender, new perspective, pause, sacrifice', reversedMeaning: 'Stalling, resistance, delay', keywords: ['surrender', 'perspective', 'pause'] },
  { id: 13, name: 'Death', arcana: 'major', meaning: 'Transformation, endings, change, transition', reversedMeaning: 'Resistance to change, stagnation, decay', keywords: ['transformation', 'change', 'rebirth'] },
  { id: 14, name: 'Temperance', arcana: 'major', meaning: 'Balance, moderation, patience, harmony', reversedMeaning: 'Imbalance, excess, lack of harmony', keywords: ['balance', 'moderation', 'harmony'] },
  { id: 15, name: 'The Devil', arcana: 'major', meaning: 'Bondage, materialism, obsession, shadow self', reversedMeaning: 'Release, liberation, reclaiming power', keywords: ['shadow', 'bondage', 'materialism'] },
  { id: 16, name: 'The Tower', arcana: 'major', meaning: 'Sudden upheaval, destruction, revelation', reversedMeaning: 'Avoidance of disaster, delayed change', keywords: ['upheaval', 'change', 'revelation'] },
  { id: 17, name: 'The Star', arcana: 'major', meaning: 'Hope, inspiration, serenity, renewal', reversedMeaning: 'Despair, hopelessness, lack of faith', keywords: ['hope', 'inspiration', 'peace'] },
  { id: 18, name: 'The Moon', arcana: 'major', meaning: 'Illusion, fear, subconscious, intuition', reversedMeaning: 'Release of fear, clarity, understanding', keywords: ['illusion', 'intuition', 'mystery'] },
  { id: 19, name: 'The Sun', arcana: 'major', meaning: 'Joy, success, vitality, positivity', reversedMeaning: 'Temporary sadness, blocked happiness', keywords: ['joy', 'success', 'vitality'] },
  { id: 20, name: 'Judgement', arcana: 'major', meaning: 'Rebirth, inner calling, absolution, reflection', reversedMeaning: 'Self-doubt, refusal of self-evaluation', keywords: ['rebirth', 'judgment', 'calling'] },
  { id: 21, name: 'The World', arcana: 'major', meaning: 'Completion, accomplishment, travel, fulfillment', reversedMeaning: 'Incompletion, delays, stagnation', keywords: ['completion', 'fulfillment', 'travel'] },
];
