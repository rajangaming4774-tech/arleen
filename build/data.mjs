// Site-wide data used by the image pipeline and the page generator.

export const SITE = {
  url: 'https://www.arleenbuilders.com',
  name: 'Arleen Builders',
  legalName: 'Arleen Builders India Pvt. Ltd',
  tagline: 'Goodness & Mercy Shall Follow',
  founded: '2007',
  email: 'info@arleenbuilders.com',
  phones: [
    { display: '+91 93833 41020', tel: '+919383341020' },
    { display: '+91 99403 58889', tel: '+919940358889' },
  ],
  whatsapp: '919383341020',
  address: {
    street: '#72, 2nd Floor, Pushpa Nagar Main Road',
    locality: 'Nungambakkam',
    city: 'Chennai',
    region: 'Tamil Nadu',
    postal: '600034',
    country: 'IN',
  },
  geo: { lat: 13.0569, lng: 80.2425 },
  mapQuery: 'Pushpa Nagar Main Road, Nungambakkam, Chennai 600034',
  // Stated once here and read everywhere, so the site cannot promise two different things.
  hours: { days: 'Monday – Saturday', opens: '09:30', closes: '18:30', display: 'Mon – Sat · 9:30 AM – 6:30 PM' },
  responsePromise: 'We reply within one working day.',
};

// Where we work. Used in the coverage section and in the search data.
export const SERVICE_AREAS = ['Nungambakkam', 'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Ashok Nagar',
  'Mylapore', 'Porur', 'OMR', 'ECR', 'Tambaram'];

// category: construction | interiors | sports
export const PROJECTS = [
  { slug: 'sacred-heart-indoor-shuttle-court', title: 'Sacred Heart Matriculation Hr. Sec. School', place: 'Church Park, Chennai', category: 'sports',
    work: 'Indoor synthetic badminton / shuttle court with steel roofing', dir: 'sacred-heart', files: ['1', '2', '3', '4', '5'], featured: true },
  { slug: 'stella-matutina-college-building', title: 'Stella Matutina College of Education (K.K. Nirmala School)', place: 'Ashok Nagar, Chennai', category: 'construction',
    work: 'Institutional building construction and glazed entrance block', dir: 'kk-nirmala-school', files: ['schools1', 'schools2', 'schools3', 'schools4', 'schools5'], featured: true },
  { slug: 'edensquare-structural-glazing', title: 'Eden Square', place: 'Chennai', category: 'interiors',
    work: 'Commercial facade with structural glazing', dir: 'edensquare', files: ['edensquare_1', 'edensquare_2', 'edensquare_3', 'edensquare_4', 'edensquare_5'], featured: true },
  { slug: 'recreation-centre-billiards-interior', title: 'Recreation Centre I – Billiards', place: 'Park Side Road, Nungambakkam', category: 'interiors',
    work: 'Billiards room interior, flooring, lighting and wall finishes', dir: 'recreationcentre-1', files: ['billards_1', 'billards_2', 'billards_3', 'billards_4', 'billards_5'], featured: true },
  { slug: 'sunil-residency-apartments', title: 'Sunil Residency', place: 'Nungambakkam, Chennai', category: 'construction',
    work: 'Residential apartment construction', dir: 'sunil', files: ['sunil1', 'sunil2', 'sunil3', 'sunil4'] },
  { slug: 'sreeleathers-glass-facade', title: 'Sreeleathers Showroom', place: 'Purasaiwakkam, Chennai', category: 'interiors',
    work: 'Showroom exterior with ACP cladding and spider glazing', dir: 'sree', files: ['sree1', 'sree2', 'sree3', 'sree4'], featured: true },
  { slug: 'naturals-salon-spa-interior', title: 'Naturals Salon & Spa', place: 'Infosys, Mahindra World City', category: 'interiors',
    work: 'Salon and spa interior fit-out with glass partitions', dir: 'naturtals', files: ['naturals_1', 'naturals_2', 'naturals_3', 'naturals_4', 'naturals_5'] },
  { slug: 'cavincare-refreshment-hall', title: 'CavinCare Refreshment Hall', place: 'Cavin Ville, Chennai', category: 'interiors',
    work: 'Corporate dining hall interiors, false ceiling and lighting', dir: 'cavincare', files: ['cavincare_1', 'cavincare_2', 'cavincare_3', 'cavincare_4', 'cavincare_5'] },
  { slug: 'recreation-centre-lake-area', title: 'Recreation Centre II', place: 'Lake Area, Nungambakkam', category: 'interiors',
    work: 'Recreation centre interiors', dir: 'recreationcentre-2', files: ['recreation_centre_II_large_1', 'recreation_centre_II_large_2', 'recreation_centre_II_large_3', 'recreation_centre_II_large_4'] },
  { slug: 'sweet-stall-acp-cladding', title: 'Sweet Stall', place: 'Nungambakkam, Chennai', category: 'interiors',
    work: 'Shop front ACP cladding and glazing', dir: 'sweetstall', files: ['sweetstall_1', 'sweetstall_2', 'sweetstall_3'] },
  { slug: 'cloudyshop-retail-interior', title: 'Cloudy Shop', place: 'Chennai', category: 'interiors',
    work: 'Retail interior with LED cove false ceiling', dir: 'cloudyshop', files: ['cloudyshop_1', 'cloudyshop_2', 'cloudyshop_3', 'cloudyshop_4', 'cloudyshop_5'] },
  { slug: 'dg-vaishnav-college-road-works', title: 'D.G. Vaishnav College – Road Works', place: 'Arumbakkam, Chennai', category: 'construction',
    work: 'Campus internal road works', dir: 'vysh', files: ['vysh1', 'vysh2', 'vysh3', 'vysh4'] },
  { slug: 'kaviya-garden-apartments', title: 'Kaviya Garden', place: 'Chennai', category: 'construction',
    work: 'Residential apartment project', dir: 'kaviyagarden', files: ['kaviyagarden_1'] },
  { slug: 'anna-nagar-residence', title: 'Anna Nagar Residence', place: 'Anna Nagar, Chennai', category: 'construction',
    work: 'Multi-storey residential building', dir: 'annanagar', files: ['annanagar_1'] },
  { slug: 'vengai-vasal-villa', title: 'Vengai Vasal Villa', place: 'Vengaivasal, Chennai', category: 'construction',
    work: 'Independent house / villa construction', dir: 'vengaivasal', files: ['vengai', 'vengai1-big'] },
  // From the September 2026 brochure (pages 24, 25, 27). The photos are the brochure's own small
  // JPEGs (691 px and 400 px wide) standing in until the owner sends the originals: overwrite
  // raw/projects/<dir>/big/<file>.jpg with the original, keep the name, then run
  // `node build/images.mjs` and `node build/build.mjs` — the page reads each file's real size.
  // Keep these at the END of the list: the home and service pages reach older projects by index.
  { slug: 'ram-nagar-velachery-residential-flat', title: 'Residential Flat', place: '8th Street, Ram Nagar, Velachery', category: 'construction',
    work: 'Residential flat construction', dir: 'velachery', files: ['velachery_1'] },
  { slug: 'ecr-uthandi-individual-house', title: 'Individual House', place: 'ECR, Uthandi', category: 'construction',
    work: 'Individual house construction', dir: 'ecr-uthandi', files: ['ecr_1', 'ecr_2'] },
  // Porur interior (brochure page 27): its brochure photos are 192–203 px and cannot survive the
  // project tile. Originals go in raw/projects/porur/big/ as porur_1.jpg … porur_9.jpg; then
  // uncomment this entry and rebuild.
  // { slug: 'porur-interior', title: 'Interior', place: 'Porur, Chennai', category: 'interiors',
  //   work: 'Residential interior work', dir: 'porur', files: ['porur_1', 'porur_2', 'porur_3', 'porur_4', 'porur_5', 'porur_6', 'porur_7', 'porur_8', 'porur_9'] },
];

export const CATEGORY_LABEL = {
  construction: 'Construction',
  interiors: 'Interiors & Exteriors',
  sports: 'Sports Flooring',
};

export const imgName = (p, i) => `${p.slug}-${i + 1}`;

/* ---------------------------------------------------------------------------
   Material the owner supplies. Every list below starts empty and each section
   renders ONLY when its data is filled in, so the site never shows a heading
   with nothing under it — and never shows anything invented.
   --------------------------------------------------------------------------- */

// Written client quotes. Add one only when the client has actually said it and
// agreed to it appearing on the site (keep the email or WhatsApp message).
// Never paraphrase and never write a sample.
export const TESTIMONIALS = [
  // {
  //   quote: '',        // their words, verbatim
  //   author: '',       // who said it                      (required)
  //   role: '',         // 'Correspondent', 'Facilities Manager'
  //   org: '',          // 'Sacred Heart Mat. Hr. Sec. School'
  //   projectSlug: '',  // a slug from PROJECTS above — links the quote to the work
  //   date: '',         // 'YYYY-MM'
  //   consent: false,   // true only when they agreed to publication
  // },
];

// The people who run the firm. `photo` is a file in assets/img/team/ without the
// extension; leave it out and the entry renders as text. No stock photos.
export const TEAM = [
  // { name: '', role: '', qualification: '', note: '', photo: '' },
];

// Statutory registrations. Fill each value from the certificate, not from memory.
// Empty values are skipped in the footer, on the pages and in the search data.
export const CREDENTIALS = {
  gst: '',    // 15-character GSTIN
  cin: '',    // 21-character CIN from the certificate of incorporation
  udyam: '',  // Udyam / MSME registration number
};
export const CREDENTIAL_LABELS = { gst: 'GSTIN', cin: 'CIN', udyam: 'Udyam registration' };

// Guards used by the page builder — the "is there anything to show?" test lives here.
export const publishedTestimonials = () =>
  TESTIMONIALS.filter((t) => t.consent && t.quote?.trim() && t.author?.trim());
export const filledCredentials = () =>
  Object.entries(CREDENTIAL_LABELS)
    .filter(([k]) => CREDENTIALS[k]?.trim())
    .map(([k, label]) => [label, CREDENTIALS[k].trim()]);
