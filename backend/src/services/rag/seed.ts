import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import { embeddingService } from './embedding.js';

interface SeedArticle {
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
}

const ARTICLES: SeedArticle[] = [
  {
    title: 'Introduction to Vedic Astrology (Jyotish)',
    content: `Vedic Astrology, known as Jyotish (the science of light), is an ancient Indian system of astrology that originated over 5,000 years ago. Unlike Western tropical astrology which uses the moving vernal equinox, Vedic astrology uses the fixed sidereal zodiac, accounting for the precession of the equinoxes (Ayanamsa). The core components include the 12 Rashis (signs), 9 Grahas (planets), 12 Bhavas (houses), and 27 Nakshatras (lunar mansions). Vedic astrology is considered a Vedanga (limb of the Vedas) and provides deep insights into karma, dharma, and life purpose. Key texts include Brihat Parashara Hora Shastra by Sage Parashara and Jaimini Sutras by Sage Jaimini.`,
    category: 'GENERAL',
    tags: ['vedic astrology', 'jyotish', 'introduction', 'history'],
  },
  {
    title: 'The Sidereal Zodiac vs Tropical Zodiac',
    content: `The sidereal zodiac used in Vedic astrology is fixed to the actual constellations in the sky, accounting for the precession of the equinoxes (approximately 1 degree every 72 years). The tropical zodiac used in Western astrology is based on the seasons and the vernal equinox. Due to precession, the two zodiacs are currently about 24 degrees apart (the Ayanamsa value). This means someone with a tropical Aries Sun likely has a sidereal Pisces Sun. Both systems are valid — they simply offer different perspectives. Vedic astrology's sidereal approach is considered more astronomically accurate and aligns with the actual positions of planets in the sky.`,
    category: 'GENERAL',
    tags: ['sidereal', 'tropical', 'zodiac', 'ayanamsa', 'precession'],
  },
  {
    title: 'Aries (Mesha Rashi) — The Ram',
    content: `Aries (Mesha) is the first sign of the Vedic zodiac, ruled by Mars (Mangal). Its element is Fire, and it is a cardinal, male, and movable sign. The Sanskrit name Mesha means "ram." Aries natives are natural leaders, courageous, impulsive, and competitive. They possess tremendous energy and initiative but can be impatient and aggressive. The ruling planet Mars gives them warrior-like qualities. Strengths: boldness, determination, leadership, enthusiasm. Weaknesses: impulsiveness, temper, recklessness. Aries governs the head and is associated with the color red. The nakshatras in Aries are Ashwini, Bharani, and Krittika (first pada). Career paths: military, sports, entrepreneurship, surgery.`,
    category: 'ZODIAC',
    tags: ['aries', 'mesha', 'fire', 'cardinal', 'mars'],
  },
  {
    title: 'Taurus (Vrishabha Rashi) — The Bull',
    content: `Taurus (Vrishabha) is the second sign, ruled by Venus (Shukra). Its element is Earth, and it is a fixed, female sign. Vrishabha means "bull" in Sanskrit. Taureans are stable, patient, practical, and sensuous. They value material security, comfort, and loyalty. Ruled by Venus, they appreciate beauty, art, and luxury. Strengths: reliability, patience, determination, loyalty. Weaknesses: stubbornness, possessiveness, resistance to change. Taurus governs the throat and neck. Nakshatras: Krittika (last 3 padas), Rohini, and Mrigashira (first 2 padas). Career paths: banking, finance, art, music, agriculture.`,
    category: 'ZODIAC',
    tags: ['taurus', 'vrishabha', 'earth', 'fixed', 'venus'],
  },
  {
    title: 'Gemini (Mithuna Rashi) — The Twins',
    content: `Gemini (Mithuna) is the third sign, ruled by Mercury (Budha). Its element is Air, and it is a dual, male, mutable sign. Mithuna means "twins" in Sanskrit. Geminis are communicative, intellectual, adaptable, and curious. They excel at multitasking, writing, and social interaction. Ruled by Mercury, they have sharp minds and quick wit. Strengths: versatility, intelligence, communication skills, adaptability. Weaknesses: inconsistency, restlessness, superficiality. Gemini governs the shoulders, arms, and lungs. Nakshatras: Mrigashira (last 2 padas), Ardra, and Punarvasu (first 3 padas). Career paths: writing, teaching, sales, media, communication.`,
    category: 'ZODIAC',
    tags: ['gemini', 'mithuna', 'air', 'mutable', 'mercury'],
  },
  {
    title: 'Cancer (Karka Rashi) — The Crab',
    content: `Cancer (Karka) is the fourth sign, ruled by the Moon (Chandra). Its element is Water, and it is a cardinal, female sign. Karka means "crab" in Sanskrit. Cancerians are emotional, nurturing, intuitive, and protective. They have strong family values and deep emotional intelligence. Ruled by the ever-changing Moon, their moods fluctuate. Strengths: empathy, loyalty, intuition, protectiveness. Weaknesses: moodiness, clinginess, oversensitivity. Cancer governs the chest and stomach. Nakshatras: Punarvasu (last 4 padas), Pushya, and Ashlesha. Career paths: healthcare, counseling, real estate, culinary arts.`,
    category: 'ZODIAC',
    tags: ['cancer', 'karka', 'water', 'cardinal', 'moon'],
  },
  {
    title: 'Leo (Simha Rashi) — The Lion',
    content: `Leo (Simha) is the fifth sign, ruled by the Sun (Surya). Its element is Fire, and it is a fixed, male sign. Simha means "lion" in Sanskrit. Leos are confident, creative, generous, and charismatic. They have natural leadership abilities and a warm, magnetic personality. Ruled by the Sun, they radiate vitality and command attention. Strengths: confidence, generosity, creativity, leadership. Weaknesses: pride, arrogance, need for attention. Leo governs the heart and spine. Nakshatras: Magha, Purva Phalguni, and Uttara Phalguni (first 2 padas). Career paths: entertainment, management, politics, creative arts.`,
    category: 'ZODIAC',
    tags: ['leo', 'simha', 'fire', 'fixed', 'sun'],
  },
  {
    title: 'Virgo (Kanya Rashi) — The Virgin',
    content: `Virgo (Kanya) is the sixth sign, ruled by Mercury (Budha). Its element is Earth, and it is a dual, female, mutable sign. Kanya means "maiden" in Sanskrit. Virgos are analytical, practical, detail-oriented, and service-minded. They excel at organization, analysis, and helping others. Ruled by Mercury, they have precise and logical minds. Strengths: analytical thinking, practicality, diligence, purity. Weaknesses: perfectionism, criticism, worry. Virgo governs the digestive system and abdomen. Nakshatras: Uttara Phalguni (last 2 padas), Hasta, and Chitra (first 2 padas). Career paths: healthcare, accounting, research, editing, analytics.`,
    category: 'ZODIAC',
    tags: ['virgo', 'kanya', 'earth', 'mutable', 'mercury'],
  },
  {
    title: 'Libra (Tula Rashi) — The Scales',
    content: `Libra (Tula) is the seventh sign, ruled by Venus (Shukra). Its element is Air, and it is a cardinal, male sign. Tula means "scales" or "balance" in Sanskrit. Librans are diplomatic, charming, fair-minded, and artistic. They seek harmony, balance, and beauty in all areas of life. Ruled by Venus, they have refined taste and social grace. Strengths: diplomacy, charm, fairness, artistic sense. Weaknesses: indecisiveness, people-pleasing, avoidance of conflict. Libra governs the kidneys and lower back. Nakshatras: Chitra (last 2 padas), Swati, and Vishakha (first 3 padas). Career paths: law, diplomacy, art, design, counseling.`,
    category: 'ZODIAC',
    tags: ['libra', 'tula', 'air', 'cardinal', 'venus'],
  },
  {
    title: 'Scorpio (Vrischika Rashi) — The Scorpion',
    content: `Scorpio (Vrischika) is the eighth sign, ruled by Mars (Mangal). Its element is Water, and it is a fixed, female sign. Vrischika means "scorpion" in Sanskrit. Scorpios are intense, passionate, mysterious, and transformative. They possess deep emotional power and investigative abilities. Ruled by Mars, they have strong will and determination. Strengths: passion, resourcefulness, bravery, depth. Weaknesses: jealousy, secrecy, intensity. Scorpio governs the reproductive system and excretory organs. Nakshatras: Vishakha (last 4 padas), Anuradha, and Jyeshtha. Career paths: investigation, research, psychology, occult sciences, surgery.`,
    category: 'ZODIAC',
    tags: ['scorpio', 'vrischika', 'water', 'fixed', 'mars'],
  },
  {
    title: 'Sagittarius (Dhanu Rashi) — The Archer',
    content: `Sagittarius (Dhanu) is the ninth sign, ruled by Jupiter (Guru). Its element is Fire, and it is a dual, male, mutable sign. Dhanu means "bow" in Sanskrit. Sagittarians are optimistic, adventurous, philosophical, and freedom-loving. They seek higher knowledge, travel, and spiritual understanding. Ruled by Jupiter (Guru), they are natural teachers and philosophers. Strengths: optimism, honesty, generosity, wisdom. Weaknesses: impatience, bluntness, restlessness. Sagittarius governs the hips and thighs. Nakshatras: Mula, Purva Ashadha, and Uttara Ashadha (first 2 padas). Career paths: teaching, travel, publishing, philosophy, law.`,
    category: 'ZODIAC',
    tags: ['sagittarius', 'dhanu', 'fire', 'mutable', 'jupiter'],
  },
  {
    title: 'Capricorn (Makara Rashi) — The Sea-Goat',
    content: `Capricorn (Makara) is the tenth sign, ruled by Saturn (Shani). Its element is Earth, and it is a cardinal, female sign. Makara means "sea-monster" or "crocodile" in Sanskrit. Capricorns are ambitious, disciplined, responsible, and persevering. They climb steadily toward their goals with patience and determination. Ruled by Saturn, they understand the value of hard work and time. Strengths: discipline, responsibility, ambition, practicality. Weaknesses: pessimism, rigidity, workaholism. Capricorn governs the knees and bones. Nakshatras: Uttara Ashadha (last 2 padas), Shravana, and Dhanishta (first 2 padas). Career paths: business, management, engineering, politics, real estate.`,
    category: 'ZODIAC',
    tags: ['capricorn', 'makara', 'earth', 'cardinal', 'saturn'],
  },
  {
    title: 'Aquarius (Kumbha Rashi) — The Water-Bearer',
    content: `Aquarius (Kumbha) is the eleventh sign, ruled by Saturn (Shani). Its element is Air, and it is a fixed, male sign. Kumbha means "water-pot" or "pitcher" in Sanskrit. Aquarians are innovative, humanitarian, independent, and progressive. They think outside the box and are driven by ideals of equality and social justice. Ruled by Saturn, they have disciplined intellect. Strengths: innovation, humanity, independence, intellect. Weaknesses: detachment, unpredictability, stubbornness. Aquarius governs the calves and ankles. Nakshatras: Dhanishta (last 2 padas), Shatabhisha, and Purva Bhadrapada (first 3 padas). Career paths: technology, science, social work, aviation, astrology.`,
    category: 'ZODIAC',
    tags: ['aquarius', 'kumbha', 'air', 'fixed', 'saturn'],
  },
  {
    title: 'Pisces (Meena Rashi) — The Fish',
    content: `Pisces (Meena) is the twelfth sign, ruled by Jupiter (Guru). Its element is Water, and it is a dual, female, mutable sign. Meena means "fish" in Sanskrit. Pisceans are compassionate, intuitive, artistic, and spiritual. They have deep emotional sensitivity and creative imagination. Ruled by Jupiter, they seek transcendence and universal love. Strengths: compassion, creativity, intuition, spirituality. Weaknesses: escapism, oversensitivity, lack of boundaries. Pisces governs the feet and lymphatic system. Nakshatras: Purva Bhadrapada (last 4 padas), Uttara Bhadrapada, and Revati. Career paths: arts, music, spirituality, healing arts, filmmaking.`,
    category: 'ZODIAC',
    tags: ['pisces', 'meena', 'water', 'mutable', 'jupiter'],
  },
  {
    title: 'Sun (Surya) — The Soul and Ego',
    content: `In Vedic astrology, Surya (the Sun) represents the soul (Atman), ego, vitality, leadership, authority, and father. The Sun is considered a malefic planet because of its intense and fiery nature. It rules the zodiac sign Leo (Simha) and is exalted in Aries (Mesha) at 10 degrees. The Sun's debilitation sign is Libra (Tula). Surya governs the heart, bones, eyes, and general vitality. A strong Sun in the chart gives confidence, leadership ability, name, fame, and a strong constitution. A weak or afflicted Sun can indicate low self-esteem, health issues, or difficulties with authority figures. The Sun's gemstone is the ruby (Manikya). Its day is Sunday, and its color is red or gold. The Sun's friendly planets are Moon, Mars, and Jupiter; enemies are Venus and Saturn. The Sun represents the father, government, authority figures, and one's career direction.`,
    category: 'PLANET',
    tags: ['sun', 'surya', 'planet', 'atman', 'soul', 'ego'],
  },
  {
    title: 'Moon (Chandra) — The Mind and Emotions',
    content: `In Vedic astrology, Chandra (the Moon) represents the mind (Manas), emotions, mother, nurturing, intuition, and public image. The Moon is a benefic planet and is considered the most important planet in Vedic astrology after the Sun. It rules the zodiac sign Cancer (Karka) and is exalted in Taurus (Vrishabha) at 3 degrees. The Moon's debilitation sign is Scorpio (Vrischika). Chandra governs the mind, emotions, breasts, stomach, and bodily fluids. A strong Moon gives emotional stability, mental clarity, intuition, popularity, and a nurturing nature. A weak Moon causes anxiety, mood swings, emotional instability, and sleep disorders. The Moon's gemstone is the natural pearl (Moti). Its day is Monday, and its color is white. The waxing Moon (Shukla Paksha) is generally favorable, while the waning Moon (Krishna Paksha) is less favorable. The Moon's nakshatra at birth determines one's Janma Nakshatra.`,
    category: 'PLANET',
    tags: ['moon', 'chandra', 'planet', 'mind', 'emotions', 'mother'],
  },
  {
    title: 'Mars (Mangal) — Energy and Courage',
    content: `In Vedic astrology, Mangal (Mars) represents energy, courage, ambition, passion, siblings, and assertiveness. Mars is a natural malefic planet and rules the signs Aries (Mesha) and Scorpio (Vrischika). It is exalted in Capricorn (Makara) at 28 degrees and debilitated in Cancer (Karka). Mars governs the blood, muscles, bone marrow, and excretory system. A strong Mars gives courage, leadership, physical strength, technical ability, and competitive spirit. A weak or afflicted Mars can cause anger, accidents, injuries, conflicts, and surgical issues. Mars also governs Manglik Dosha (Mangal Dosh), which occurs when Mars is placed in certain houses (1, 2, 4, 7, 8, 12) in the birth chart. The gemstone for Mars is red coral (Moonga). Its day is Tuesday, and its color is red. Mars represents land, property, engineering, sports, military, and surgery.`,
    category: 'PLANET',
    tags: ['mars', 'mangal', 'planet', 'energy', 'courage', 'anger'],
  },
  {
    title: 'Mercury (Budha) — Intellect and Communication',
    content: `In Vedic astrology, Budha (Mercury) represents intellect, communication, speech, education, business, and analytical ability. Mercury is a neutral planet (can be benefic or malefic depending on conjunction) and rules the signs Gemini (Mithuna) and Virgo (Kanya). It is exalted in Virgo (Kanya) at 15 degrees and debilitated in Pisces (Meena). Budha governs the skin, nervous system, and speech organs. A strong Mercury gives intelligence, wit, communication skills, mathematical ability, and business acumen. A weak Mercury can cause speech difficulties, learning disabilities, nervous disorders, and poor decision-making. The gemstone for Mercury is emerald (Panna). Its day is Wednesday, and its color is green. Mercury represents writers, teachers, merchants, accountants, and brokers. Mercury is most comfortable when in its own sign or in the sign of a friend.`,
    category: 'PLANET',
    tags: ['mercury', 'budha', 'planet', 'intellect', 'communication', 'business'],
  },
  {
    title: 'Jupiter (Guru) — Wisdom and Fortune',
    content: `In Vedic astrology, Guru (Jupiter) represents wisdom, knowledge, spirituality, wealth, children, and good fortune. Jupiter is the greatest benefic planet and rules the signs Sagittarius (Dhanu) and Pisces (Meena). It is exalted in Cancer (Karka) at 5 degrees and debilitated in Capricorn (Makara). Guru governs the liver, thighs, fat tissue, and ears. A strong Jupiter gives wisdom, optimism, generosity, spiritual inclination, wealth, and good fortune. It also indicates a happy marriage and children. A weak Jupiter can cause lack of wisdom, financial troubles, pessimism, and religious conflicts. The gemstone for Jupiter is yellow sapphire (Pukhraj). Its day is Thursday, and its color is yellow. Jupiter represents teachers, gurus, priests, judges, and advisors. Jupiter's dasha lasts 16 years — the longest of all planets, making it profoundly influential.`,
    category: 'PLANET',
    tags: ['jupiter', 'guru', 'planet', 'wisdom', 'fortune', 'spirituality'],
  },
  {
    title: 'Venus (Shukra) — Love and Luxury',
    content: `In Vedic astrology, Shukra (Venus) represents love, romance, beauty, luxury, arts, marriage, and relationships. Venus is a benefic planet and rules the signs Taurus (Vrishabha) and Libra (Tula). It is exalted in Pisces (Meena) at 27 degrees and debilitated in Virgo (Kanya). Shukra governs the reproductive system, semen, kidneys, and face. A strong Venus gives beauty, charm, artistic talent, material comforts, happy marriage, and luxurious lifestyle. A weak Venus can cause relationship problems, lack of creativity, financial instability, and skin issues. The gemstone for Venus is diamond (Heera). Its day is Friday, and its color is white or pink. Venus represents artists, musicians, lovers, luxury goods, vehicles, and the finer things in life. Venus is the guru (teacher) of the demons (Asuras) in Vedic mythology, representing material enjoyment.`,
    category: 'PLANET',
    tags: ['venus', 'shukra', 'planet', 'love', 'beauty', 'luxury', 'marriage'],
  },
  {
    title: 'Saturn (Shani) — Discipline and Karma',
    content: `In Vedic astrology, Shani (Saturn) represents discipline, karma, hard work, delays, longevity, and justice. Saturn is the greatest malefic planet and rules the signs Capricorn (Makara) and Aquarius (Kumbha). It is exalted in Libra (Tula) at 20 degrees and debilitated in Aries (Mesha). Shani governs the bones, teeth, hair, nerves, and legs. A strong Saturn gives discipline, endurance, wisdom through experience, longevity, and authority. A weak or afflicted Saturn can cause delays, depression, chronic illness, poverty, and hardships. Saturn's famous Sade Sati (7.5 years) period occurs when Saturn transits the 12th, 1st, and 2nd houses from the natal Moon. The gemstone for Saturn is blue sapphire (Neelam). Its day is Saturday, and its color is blue or black. Saturn represents laborers, servants, elderly people, and those in authority. Saturn's dasha lasts 19 years.`,
    category: 'PLANET',
    tags: ['saturn', 'shani', 'planet', 'karma', 'discipline', 'justice'],
  },
  {
    title: 'Rahu (North Node) — Ambition and Illusion',
    content: `In Vedic astrology, Rahu (the North Node of the Moon) represents ambition, obsession, foreign connections, illusion, and material desires. Rahu is a shadow planet with no physical form (a mathematical point) but is considered very powerful. It is always malefic and naturally malefic by nature. Rahu rules no sign but is exalted in Gemini (Mithuna) and debilitated in Sagittarius (Dhanu). Rahu governs the skin, smoking, addiction, technology, and unconventional things. A strong Rahu gives ambition, success in foreign lands, political power, mastery of technology, and sudden rise in life. A weak/afflicted Rahu causes confusion, deception, scandals, mental instability, and obsession. Rahu's gemstone is hessonite garnet (Gomed). Its color is smoky grey or black. Rahu represents foreigners, scientists, politicians, occultists, and rebels. Rahu's dasha lasts 18 years and often brings dramatic changes. Rahu has no specific day or direction.`,
    category: 'PLANET',
    tags: ['rahu', 'north node', 'shadow planet', 'ambition', 'illusion'],
  },
  {
    title: 'Ketu (South Node) — Spirituality and Detachment',
    content: `In Vedic astrology, Ketu (the South Node of the Moon) represents spirituality, detachment, past life karma, liberation, and mystical abilities. Like Rahu, Ketu is a shadow planet (mathematical point) and is naturally malefic. Ketu rules no sign but is exalted in Sagittarius (Dhanu) and debilitated in Gemini (Mithuna). Ketu governs the feet, psychic abilities, spiritual pursuits, and hidden knowledge. A strong Ketu gives spiritual wisdom, detachment, psychic abilities, healing powers, and a philosophical nature. A weak or afflicted Ketu can cause confusion, lack of direction, accidents, and erratic behavior. The gemstone for Ketu is cat's eye (Lehsunia). Its color is smoky or multi-colored. Ketu represents monks, mystics, healers, and those on the spiritual path. Ketu's dasha lasts 7 years and is often a period of spiritual growth and withdrawal from material pursuits. Ketu's influence is karmic and often relates to past life patterns.`,
    category: 'PLANET',
    tags: ['ketu', 'south node', 'shadow planet', 'spirituality', 'karma'],
  },
  {
    title: 'The 12 Houses (Bhavas) — Areas of Life',
    content: `In Vedic astrology, the 12 houses represent different areas of life. 1st House (Lagna/Tanu Bhava): Self, personality, physical appearance, health. 2nd House (Dhana Bhava): Wealth, speech, family, food, right eye. 3rd House (Sahaja Bhava): Siblings, courage, communication, short travels. 4th House (Bandhu/Sukha Bhava): Home, mother, vehicles, property, education. 5th House (Putra Bhava): Children, creativity, intelligence, romance, mantras. 6th House (Ripu/Shatru Bhava): Enemies, debts, disease, daily work, litigation. 7th House (Kalatra/Yuvati Bhava): Marriage, spouse, partnerships, business, public image. 8th House (Ayur/Mrityu Bhava): Longevity, occult, secrets, inheritance, sudden events. 9th House (Dharma/Guru Bhava): Fortune, guru, dharma, higher education, long journeys. 10th House (Karma Bhava): Career, profession, status, father, government. 11th House (Labha/Aya Bhava): Gains, income, fulfillment of desires, social networks. 12th House (Vyaya Bhava): Losses, expenses, sleep, foreign lands, liberation, hospital.`,
    category: 'HOUSE',
    tags: ['houses', 'bhavas', 'astrology houses', '1st house', '2nd house', '3rd house', '4th house', '5th house', '6th house', '7th house', '8th house', '9th house', '10th house', '11th house', '12th house'],
  },
  {
    title: 'Ashwini Nakshatra — The Star of Beginnings',
    content: `Ashwini is the first nakshatra, spanning 0°00' to 13°20' in Aries. Its symbol is a horse's head, and its ruling planet is Ketu. The deity is the Ashwini Kumaras, the divine twin horsemen and physicians of the gods. Ashwini represents speed, healing, and new beginnings. Natives are energetic, helpful, independent, and skilled in healing arts. They have a strong desire to be first and can be impulsive. Ashwini's power is to quickly bring things to life (kshipra). The animal symbol is the male horse. Each nakshatra is divided into 4 padas (quarters) of 3°20' each, each with different characteristics.`,
    category: 'NAKSHATRA',
    tags: ['ashwini', 'nakshatra', 'ketu', 'aries', 'star'],
  },
  {
    title: 'Rohini Nakshatra — The Star of Creation',
    content: `Rohini is the fourth nakshatra, spanning 10°00' to 23°20' in Taurus. Its symbol is a chariot or temple, and its ruling planet is the Moon. The deity is Brahma or Prajapati, the creator. Rohini represents creativity, fertility, beauty, and growth. Natives are charming, creative, artistic, and materially prosperous. They have a strong attraction to beauty and comfort. Rohini's power is the power of growth and creation. The animal symbol is the female serpent or cobra. Rohini is one of the most favorable nakshatras for marriage, procreation, and creative endeavors. Its energy is stable and nurturing.`,
    category: 'NAKSHATRA',
    tags: ['rohini', 'nakshatra', 'moon', 'taurus', 'star'],
  },
  {
    title: 'Magha Nakshatra — The Star of Power',
    content: `Magha is the tenth nakshatra, spanning 0°00' to 13°20' in Leo. Its symbol is a royal throne or palanquin, and its ruling planet is Ketu. The deity is the Pitris (ancestors). Magha represents power, authority, lineage, and ancestral heritage. Natives are proud, authoritative, regal, and deeply connected to their roots. They have strong leadership qualities and respect for tradition. Magha's power is the power to leave the body (or transcend material identity). The animal symbol is the male rat. Magha natives often hold positions of authority and are deeply concerned with their legacy and family name.`,
    category: 'NAKSHATRA',
    tags: ['magha', 'nakshatra', 'ketu', 'leo', 'star'],
  },
  {
    title: 'Mula Nakshatra — The Root Star',
    content: `Mula is the nineteenth nakshatra, spanning 0°00' to 13°20' in Sagittarius. Its symbol is a bunch of roots tied together or an elephant goad, and its ruling planet is Ketu. The deity is Nirriti (the goddess of dissolution). Mula represents destruction of illusions, deep investigation, and radical transformation. Natives are investigative, philosophical, independent, and capable of great destruction and regeneration. Mula's power is the power of rooting things out and destroying falsehood. The animal symbol is the male dog. Mula natives may experience ups and downs but ultimately achieve deep wisdom through life's challenges.`,
    category: 'NAKSHATRA',
    tags: ['mula', 'moola', 'nakshatra', 'ketu', 'sagittarius', 'star'],
  },
  {
    title: 'Uttara Phalguni Nakshatra — The Star of Patronage',
    content: `Uttara Phalguni is the twelfth nakshatra, spanning 26°40' Leo to 10°00' Virgo. Its symbol is a bed or hammock, and its ruling planet is the Sun. The deity is Bhaga (the god of marital bliss and prosperity). Uttara Phalguni represents marriage, prosperity, friendship, and charitable activities. Natives are generous, sociable, charitable, and enjoy comfortable lifestyles. They are natural patrons and hosts. Uttara Phalguni's power is the power of prosperity through union and cooperation. The animal symbol is the female cow (or red cow). This nakshatra is favorable for marriage ceremonies, partnerships, and charitable activities.`,
    category: 'NAKSHATRA',
    tags: ['uttara phalguni', 'nakshatra', 'sun', 'leo', 'virgo', 'star'],
  },
  {
    title: 'Shravana Nakshatra — The Star of Listening',
    content: `Shravana is the twenty-second nakshatra, spanning 10°00' to 23°20' in Capricorn. Its symbol is an ear or three footprints, and its ruling planet is the Moon. The deity is Vishnu, the preserver. Shravana represents listening, learning, and divine knowledge. Natives are good listeners, scholars, travelers, and spiritual seekers. They have excellent communication skills and a desire to spread knowledge. Shravana's power is the power of listening and connecting with the divine. The animal symbol is the female monkey. This nakshatra is considered highly auspicious for education, spiritual initiation, and travel.`,
    category: 'NAKSHATRA',
    tags: ['shravana', 'nakshatra', 'moon', 'capricorn', 'star'],
  },
  {
    title: 'Pushya Nakshatra — The Star of Nourishment',
    content: `Pushya is the eighth nakshatra, spanning 3°20' to 16°40' in Cancer. Its symbol is a cow's udder, a flower, or a circle, and its ruling planet is Saturn. The deity is Brihaspati (Jupiter), the guru of the gods. Pushya represents nourishment, growth, and spiritual wisdom. Natives are nurturing, intelligent, religious, and prosperous. Pushya is one of the most auspicious nakshatras for all important activities. Pushya's power is the power of spiritual energy (brahmavarchasa). The animal symbol is the male goat. Pushya is considered the best nakshatra for starting new ventures, ceremonies, and spiritual practices.`,
    category: 'NAKSHATRA',
    tags: ['pushya', 'nakshatra', 'saturn', 'cancer', 'star'],
  },
  {
    title: 'Raja Yoga — The Yoga of Power and Success',
    content: `Raja Yoga is one of the most powerful planetary combinations in Vedic astrology. It occurs when the lord of a Kendra (quadrant: houses 1, 4, 7, 10) and the lord of a Trikona (trine: houses 1, 5, 9) are in association (conjunction or mutual aspect). Raja Yoga grants wealth, power, fame, and success in life. The more Kendra and Trikona lords involved, the stronger the Raja Yoga. Special types include: 1) Dharmakarmadhipati Yoga: lord of 9th and 10th in conjunction. 2) Sasa Yoga: Saturn in own sign in a Kendra. 3) Budhaditya Yoga: Sun and Mercury in conjunction (gives intelligence and fame). 4) Neecha Bhanga Raja Yoga: cancellation of debilitation, turning a debilitated planet into a powerful one. Raja Yoga requires careful chart analysis - the house placements, planetary strength, and aspects all matter.`,
    category: 'YOGA',
    tags: ['raja yoga', 'yoga', 'kendra', 'trikona', 'power', 'success'],
  },
  {
    title: 'Dhana Yoga — The Yoga of Wealth',
    content: `Dhana Yoga refers to planetary combinations that bestow wealth and financial prosperity. The most common Dhana Yoga occurs when the lords of the 2nd house (wealth), 5th house (fortune), 9th house (luck), and 11th house (gains) are connected. Types of Dhana Yoga: 1) The 2nd lord in the 5th, 9th, or 11th house. 2) The 11th lord in the 2nd or 5th house. 3) A functional benefic planet in the 11th house. 4) Venus and Jupiter in the 2nd house (Gaja Kesari Yoga-like effect on wealth). 5) Multiple planets in the 2nd house. The 11th house is the primary house of financial gains, while the 2nd house shows accumulated wealth. For Dhana Yoga to fructify, the dasha of the involved planets must be active. Moon-Venus-Jupiter combinations are especially favorable for wealth creation.`,
    category: 'YOGA',
    tags: ['dhana yoga', 'yoga', 'wealth', 'prosperity', 'finance'],
  },
  {
    title: 'Gaja Kesari Yoga — The Yoga of Wisdom and Fame',
    content: `Gaja Kesari Yoga occurs when Jupiter (Guru) is in a Kendra (1st, 4th, 7th, or 10th house) from the Moon. This yoga bestows wisdom, intelligence, fame, wealth, and royal status. The person becomes learned, respected, influential, and prosperous. The yoga is stronger when: 1) Jupiter is in its own sign or exalted. 2) The Moon is bright (waxing). 3) Jupiter and the Moon are both in benefic houses. 4) The placement is in a movable sign. Gaja Kesari Yoga makes a person wise like an elephant (Gaja) and powerful like a lion (Kesari). This yoga can manifest at different levels depending on the strength of Jupiter and the Moon. When weak, it may simply give an interest in learning and spirituality without the full fame and wealth.`,
    category: 'YOGA',
    tags: ['gaja kesari yoga', 'yoga', 'jupiter', 'moon', 'wisdom'],
  },
  {
    title: 'Viparita Raja Yoga — The Yoga of Rise from Adversity',
    content: `Viparita Raja Yoga is a unique yoga that forms when lords of the 6th, 8th, or 12th houses (Dusthana houses) are in conjunction or mutual aspect in a Dusthana house. Paradoxically, this yoga gives success, power, and wealth through adversity. The person may rise from humble beginnings, face many struggles, but ultimately achieve great success. The key principle is that Dusthana lords in Dusthana houses become powerful. For example: 1) Lord of 6th in 8th house. 2) Lord of 8th in 12th house. 3) Lord of 12th in 6th house. This yoga is especially powerful during the dasha of the involved planets. Natives with this yoga often overcome major obstacles, have resilience, and achieve their goals through persistence and strategic thinking.`,
    category: 'YOGA',
    tags: ['viparita raja yoga', 'yoga', 'dusthana', 'adversity', 'success'],
  },
  {
    title: 'Vedic Compatibility — Kundli Matching for Marriage',
    content: `In Vedic astrology, compatibility (Guna Milan) is assessed primarily through the Ashta Kuta system — an 8-category compatibility scoring system with a maximum of 36 points. A score of 18 or below is considered poor, 18-24 average, 25-32 good, and 33-36 excellent. The 8 categories: 1) Varna (1 pt): spiritual compatibility based on the nature of the nakshatras. 2) Vashya (2 pts): mutual attraction and control. 3) Tara (3 pts): birth star compatibility assessing luck. 4) Yoni (4 pts): animal nature compatibility for sexual harmony. 5) Graha Maitri (5 pts): planetary friendship between Moon lords. 6) Gana (6 pts): temperament compatibility (Deva/Manushya/Rakshasa). 7) Bhakoota (7 pts): emotional and family compatibility based on Moon sign positions (this is the most critical category — 7 points). 8) Nadi (8 pts): health and genetic compatibility — if both are in the same Nadi (Aadi/Madhya/Antya), it is strongly discouraged. Additionally, Manglik Dosha must be checked — if both charts have Mars in the same problematic houses, the dosha cancels. Vedic matching is comprehensive but modern astrologers also consider the complete chart including 7th house, 7th lord, Venus, Jupiter, and planetary aspects.`,
    category: 'COMPATIBILITY',
    tags: ['compatibility', 'kundli matching', 'guna milan', 'marriage', 'ashta kuta'],
  },
  {
    title: 'Manglik Dosha (Mangal Dosh) — The Mars Affliction',
    content: `Manglik Dosha is one of the most important factors in Vedic marriage compatibility. It occurs when Mars (Mangal) is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Ascendant or Moon in the birth chart. This placement is believed to create energetic intensity that may cause marital discord if not properly matched. Factors that cancel Manglik Dosha: 1) If Mars is in its own sign (Aries/Scorpio) or exalted (Capricorn). 2) If Mars is conjunct Jupiter or Venus. 3) If the 7th lord is strong and well-placed. 4) Both partners having Manglik Dosha cancels it. 5) If Mars is retrograde or combust. Best remedies: 1) Marry another Manglik person. 2) Perform Mangal Dosh puja or remedial rituals. 3) Wear red coral (after testing). 4) Chant Mars mantras on Tuesdays. 5) Donate red items on Tuesdays. Note: Modern Vedic astrologers take a balanced view — Manglik Dosha should not be the sole deciding factor; the complete chart must be analyzed.`,
    category: 'DOSHA',
    tags: ['manglik dosha', 'mangal dosh', 'mars', 'marriage', 'dosha'],
  },
  {
    title: 'Kemadruma Yoga — The Challenge of Isolation',
    content: `Kemadruma Yoga occurs when there are no planets on either side of the Moon (i.e., the Moon is in an empty house with no planets in the 2nd or 12th from it). This yoga can indicate financial struggles, emotional isolation, lack of support, and difficulties in life. However, if the Moon is strong (waxing, in own/exalted sign, or with a full Moon), the negative effects are significantly reduced. Cancellation: If Jupiter or Venus aspects the Moon, the Kemadruma Yoga is fully canceled. Partial cancellation occurs if the Moon is in a Kendra or Trikona. This yoga emphasizes the importance of the Moon as the mind — a lonely Moon suggests a lonely path, but spiritual development through solitude.`,
    category: 'YOGA',
    tags: ['kemadruma yoga', 'moon', 'isolation', 'challenge', 'yoga'],
  },
  {
    title: 'Vedic Gemstone Recommendations',
    content: `In Vedic astrology, gemstones are prescribed to strengthen planets based on their placement in the birth chart, not just Sun sign. Each planet has a primary gemstone: Ruby (Manikya) for Sun, Natural Pearl (Moti) for Moon, Red Coral (Moonga) for Mars, Emerald (Panna) for Mercury, Yellow Sapphire (Pukhraj) for Jupiter, Diamond (Heera) for Venus, Blue Sapphire (Neelam) for Saturn, Hessonite Garnet (Gomed) for Rahu, Cat's Eye (Lehsunia) for Ketu. Guidelines: 1) Always consult a qualified Vedic astrologer before wearing any gemstone. 2) The stone should be tested on the body for 2-3 days before permanent wear. 3) Gemstones should be of good quality (natural, unheated) for effectiveness. 4) The recommended metal for rings is panchdhatu (5 metals) or silver/gold based on the planet. 5) Wearing a gemstone for a weak or malefic planet can cause harm — only wear stones for planets that need strengthening in your chart. 6) Fingers: index for Jupiter, middle for Saturn, ring for Sun, little for Mercury. 7) Stones should be set such that they touch the skin for maximum effect.`,
    category: 'GEMSTONE',
    tags: ['gemstone', 'ratna', 'ruby', 'pearl', 'coral', 'emerald', 'sapphire', 'diamond', 'remedy'],
  },
  {
    title: 'Kuja (Mangal) Dosha Details and Analysis',
    content: `Mangal Dosha requires careful delineation beyond just checking if Mars is in houses 1/2/4/7/8/12. Key considerations: 1) House placement: 7th house Mars is most problematic (directly afflicts marriage). 2) Sign: Mars in Capricorn (exaltation) or Aries/Scorpio (own sign) reduces dosha intensity. 3) Aspects: If Jupiter or Venus aspects Mars, the dosha is mitigated. 4) Nakshatra: Mars in certain nakshatras (like Anuradha, Mrigashira) behaves differently. 5) Dasha: Mangal Dosha manifests most during Mars dasha or Mars sub-periods. 6) The dosha is stronger for day births than night births. Two types of Mangal Dosha: A) Type A (most severe): Mars in 1st, 4th, 7th, or 8th from Ascendant. B) Type B (moderate): Mars in 2nd or 12th. C) Type C (mild): Only Mars in 1st/4th/7th/8th from Moon. Remedies beyond marriage to another Manglik: fast on Tuesdays, chant "Om Mangalaya Namah" 108 times, donate red lentils/cloth, perform Arghya to Sun on Tuesdays.`,
    category: 'DOSHA',
    tags: ['mangal dosha', 'kuja dosha', 'mars', 'analysis', 'remedy'],
  },
  {
    title: 'Pitta Dosha in Vedic Astrology',
    content: `While Pitta is primarily an Ayurvedic concept, it correlates with the Fire element in Vedic astrology. Fire signs (Aries, Leo, Sagittarius) and planets (Sun, Mars, Jupiter) are Pitta-dominant. Pitta represents transformation, metabolism, and heat. When imbalanced, it causes anger, inflammation, jealousy, and competitiveness. In the chart: 1) Strong Sun/Mars in fire signs increases Pitta. 2) 4th house (heart) and 6th house (disease) indicate potential Pitta imbalances. 3) Moon in fire signs creates fiery emotions. 4) Excess fire element in the Pancha Mahabhuta (five elements) analysis suggests Pitta dominance. Balancing: Moon and Venus (cooling planets) in favorable positions, water signs (Cancer, Scorpio, Pisces) with strong Moon, and cooling gemstones like pearl.`,
    category: 'DOSHA',
    tags: ['pitta dosha', 'ayurveda', 'fire', 'element', 'balance'],
  },
  {
    title: 'The Dasha System — Planetary Periods',
    content: `Vimshottari Dasha is the most widely used planetary period system in Vedic astrology. Based on the birth nakshatra, it divides a 120-year cycle into periods (mahadashas) ruled by the 9 planets in sequence: Ketu (7), Venus (20), Sun (6), Moon (10), Mars (7), Rahu (18), Jupiter (16), Saturn (19), Mercury (17). Each mahadasha is subdivided into antardashas (sub-periods) ruled by the same planets in the same sequence. The quality of each period depends on: 1) The natural nature of the planet (benefic/malefic). 2) The planet's placement in the birth chart. 3) The planet's functional nature for that ascendant. 4) Transits of the slow-moving planets during the period. Timing of events in dasha: fructification occurs when a significator (karaka) planet's dasha coincides with relevant transits. For example, marriage often occurs during Venus dasha when Jupiter transits the 7th house.`,
    category: 'GENERAL',
    tags: ['dasha', 'vimshottari', 'planetary periods', 'mahadasha', 'antardasha', 'timing'],
  },
  {
    title: 'Gochara — Planetary Transits',
    content: `Gochara (transits) show how current planetary movements affect the birth chart. The most important transits are: 1) Saturn's transit (approx 2.5 years per sign) — Sade Sati (7.5 years over Moon position) is the most influential. 2) Jupiter's transit (approx 1 year per sign) — brings expansion and opportunities in the house it transits. 3) Rahu/Ketu transit (approx 1.5 years per sign) — brings karmic events. 4) Sun's monthly transit — significant for daily timing. Transit interpretations: A transiting planet triggers the significations of the house it occupies based on the natal chart. When a benefic transits a favorable house, good results manifest. When a malefic transits a challenging house, delays and obstacles occur. The combination of dasha and transit (Dasha-Gochara Phala) is the most reliable predictive technique.`,
    category: 'GENERAL',
    tags: ['transits', 'gochara', 'sade sati', 'saturn', 'jupiter', 'prediction'],
  },
  {
    title: 'Kendra and Trikona — The Power Houses',
    content: `In Vedic astrology, Kendra houses (1st, 4th, 7th, 10th) are called Vishnu-sthanas or Lakshmi-sthanas and represent stability, foundation, and worldly success. Trikona houses (1st, 5th, 9th) are called Dharma-sthanas and represent fortune, luck, and spiritual growth. Together they form the Kendra-Trikona principle: connections between Kendra lords and Trikona lords create Raja Yoga (the most powerful wealth and success yoga). Kendras are material (the world), Trikonas are spiritual (the divine). When both are connected, the person gets both material success and spiritual fulfillment. The 1st house is both a Kendra and Trikona — making it the most important house in the chart. Kendra houses are also where planets gain directional strength (digbala).`,
    category: 'HOUSE',
    tags: ['kendra', 'trikona', 'houses', 'raja yoga', 'quadrant', 'trine'],
  },
  {
    title: 'Dusthana Houses — The Houses of Challenge',
    content: `The Dusthana houses (6th, 8th, 12th) are considered challenging houses in Vedic astrology. 6th house: enemies, disease, debts, litigation, daily struggles. 8th house: death, secrets, occult, inheritance, longevity, sudden changes. 12th house: expenses, losses, sleep, foreign travel, hospital, isolation, liberation. Despite their challenging nature, Dusthana houses have positive aspects: 1) Lords of these houses in Dusthana houses create Viparita Raja Yoga. 2) Planets in Dusthana houses give protection — they reduce the negative effects. 3) Well-placed Saturn in 6th is excellent (gives victory over enemies). 4) The 8th house gives hidden knowledge and occult powers. 5) The 12th house gives spiritual liberation (moksha). Functional benefic planets in Dusthana houses lose some of their beneficence, while functional malefics do well here.`,
    category: 'HOUSE',
    tags: ['dusthana', '6th house', '8th house', '12th house', 'challenge', 'houses'],
  },
  {
    title: 'Karakas — Planetary Significators',
    content: `In Vedic astrology, each planet has natural significations (kabatwa). The Chara Karaka system (from Jaimini astrology) assigns specific significations based on planetary degrees: 1) Atmakaraka (AK) — Sun or the planet with highest degree: represents the soul's purpose. 2) Amatyakaraka (AmK) — Mercury or 2nd highest: career and advisor role. 3) Bhratrukaraka (BK) — Mars or 3rd highest: siblings. 4) Matrukaraka (MK) — Moon or 4th highest: mother. 5) Putrakaraka (PK) — Jupiter or 5th highest: children. 6) Jnatrukaraka (JK) — Venus or 6th highest: spouse and knowledge. 7) Darakaraka (DK) — Saturn or lowest degree: spouse in Jaimini system. The Atmakaraka is the most important planet — its placement, nakshatra, and aspects reveal the soul's mission in this lifetime. Understanding karakas gives deep insight into karmic patterns and life purpose.`,
    category: 'GENERAL',
    tags: ['karaka', 'atmakaraka', 'significator', 'jaimini', 'soul purpose'],
  },
  {
    title: 'Shadbala — The Sixfold Strength of Planets',
    content: `Shadbala is a comprehensive system in Vedic astrology to measure planetary strength. It consists of six sources of strength: 1) Sthana Bala (positional strength): strength from being in own sign, exaltation, or friendly sign; also directional strength (digbala). 2) Dig Bala (directional strength): Jupiter and Mercury strong in 1st, Sun/Mars in 10th, Saturn/Venus in 7th, Moon in 4th. 3) Kala Bala (temporal strength): strength based on time — daytime strengthens Sun, nighttime strengthens Moon, etc. 4) Chesta Bala (motional strength): a planet's strength in its orbit — faster direct motion is stronger. 5) Naisargika Bala (natural strength): fixed strength values — Sun (4.5), Moon (3), Mars (2.5), Mercury (2), Jupiter (3.5), Venus (3), Saturn (2.5). 6) Sama/Drik Bala (aspect strength): strength from aspects received from benefic planets. A planet with total Shadbala above 1 is considered capable of giving its full results. Below 1 indicates weakness and requires strengthening measures.`,
    category: 'GENERAL',
    tags: ['shadbala', 'planetary strength', 'digbala', 'evaluation', 'analysis'],
  },
];

export async function seedKnowledgeBase(): Promise<{ created: number; skipped: number }> {
  const existing = await prisma.knowledgeArticle.count();
  if (existing > 0) {
    logger.info({ existingCount: existing }, 'Knowledge base already seeded, skipping');
    return { created: 0, skipped: existing };
  }

  logger.info({ totalArticles: ARTICLES.length }, 'Seeding knowledge base...');

  let created = 0;

  for (const article of ARTICLES) {
    try {
      const embedding = await embeddingService.generateEmbedding(article.content);

      const tagsArray = `{${article.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "KnowledgeArticle" (id, title, content, category, tags, source, embedding, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4::text[], $5, $6, NOW(), NOW())`,
        article.title,
        article.content,
        article.category,
        tagsArray,
        article.source || null,
        embedding,
      );

      created++;

      if (created % 10 === 0) {
        logger.info({ created, total: ARTICLES.length }, 'Knowledge base seeding progress');
      }
    } catch (err) {
      logger.warn({ err, title: article.title }, 'Failed to seed article');
    }
  }

  logger.info({ created, total: ARTICLES.length }, 'Knowledge base seeding complete');

  // Clean up the migration record if it exists
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260615220001_seed_knowledge_base'`
    );
  } catch { /* ignore */ }

  return { created, skipped: ARTICLES.length - created };
}
