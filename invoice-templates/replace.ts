

export function replace(template: string, values : TemplateValues) : string
{
    let newTemplate = template;
    if(values.title) newTemplate = newTemplate.replace(new RegExp('{{ title }}', 'ig'), values.title);

    if(values.site) newTemplate = newTemplate.replace(new RegExp('{{ site }}', 'ig'), values.site);

    if(values.matricule) newTemplate = newTemplate.replace(new RegExp('{{ matricule }}', 'ig'), values.matricule);

    if(values.number) newTemplate = newTemplate.replace(new RegExp('{{ number }}', 'ig'), values.number);

    if(values.vehicleType) newTemplate = newTemplate.replace(new RegExp('{{ vehicle_type }}', 'ig'), values.vehicleType);

    if(values.perceptor) newTemplate = newTemplate.replace(new RegExp('{{ perceptor }}', 'ig'), values.perceptor);

    if(values.price) newTemplate = newTemplate.replace(new RegExp('{{ price }}', 'ig'), values.price);

    if(values.date) newTemplate = newTemplate.replace(new RegExp('{{ date }}', 'ig'), values.date);
    
    if(values.hour) newTemplate = newTemplate.replace(new RegExp('{{ hour }}', 'ig'), values.hour);
    
    if(values.qrCode) newTemplate = newTemplate.replace(new RegExp('{{ qr_code }}', 'ig'), values.qrCode);
    
    if(values.place) newTemplate = newTemplate.replace(new RegExp('{{ place }}', 'ig'), values.place);
    
    if(values.street) newTemplate = newTemplate.replace(new RegExp('{{ street }}', 'ig'), values.street);

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