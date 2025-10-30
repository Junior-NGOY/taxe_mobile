

// Cache des RegExp pour éviter de les recréer à chaque impression (optimisation performance)
const REGEX_CACHE = {
    title: /{{ title }}/ig,
    site: /{{ site }}/ig,
    matricule: /{{ matricule }}/ig,
    number: /{{ number }}/ig,
    vehicleType: /{{ vehicle_type }}/ig,
    perceptor: /{{ perceptor }}/ig,
    price: /{{ price }}/ig,
    date: /{{ date }}/ig,
    hour: /{{ hour }}/ig,
    qrCode: /{{ qr_code }}/ig,
    place: /{{ place }}/ig,
    street: /{{ street }}/ig
};

export function replace(template: string, values : TemplateValues) : string
{
    let newTemplate = template;
    
    // Utiliser les RegExp cachées au lieu d'en créer de nouvelles à chaque appel
    if(values.title) newTemplate = newTemplate.replace(REGEX_CACHE.title, values.title);
    if(values.site) newTemplate = newTemplate.replace(REGEX_CACHE.site, values.site);
    if(values.matricule) newTemplate = newTemplate.replace(REGEX_CACHE.matricule, values.matricule);
    if(values.number) newTemplate = newTemplate.replace(REGEX_CACHE.number, values.number);
    if(values.vehicleType) newTemplate = newTemplate.replace(REGEX_CACHE.vehicleType, values.vehicleType);
    if(values.perceptor) newTemplate = newTemplate.replace(REGEX_CACHE.perceptor, values.perceptor);
    if(values.price) newTemplate = newTemplate.replace(REGEX_CACHE.price, values.price);
    if(values.date) newTemplate = newTemplate.replace(REGEX_CACHE.date, values.date);
    if(values.hour) newTemplate = newTemplate.replace(REGEX_CACHE.hour, values.hour);
    if(values.qrCode) newTemplate = newTemplate.replace(REGEX_CACHE.qrCode, values.qrCode);
    if(values.place) newTemplate = newTemplate.replace(REGEX_CACHE.place, values.place);
    if(values.street) newTemplate = newTemplate.replace(REGEX_CACHE.street, values.street);

    return newTemplate;
}

export interface TemplateValues {
    matricule?: string, // Numéro matricule du véhicule
    number?: string, // Numéro de la facture
    vehicleType?: string, // Nom de la tarification
    perceptor?: string, // Nom du percepteur
    price?: string, // Prix de la facture
    site?: string, // Site ou lieu de facturation (Selon la structure au niveau de l'API)
    title?: string, // Entête de la facture
    date?: string, // Date de facturation
    hour?: string, // Heure de facturation
    qrCode?: string, // Code QR en dessous de la facture
    place?: string,
    street?: string
}