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
};

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
];

export const CATEGORY_LABEL = {
  construction: 'Construction',
  interiors: 'Interiors & Exteriors',
  sports: 'Sports Flooring',
};

export const imgName = (p, i) => `${p.slug}-${i + 1}`;
