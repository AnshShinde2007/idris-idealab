import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedHospitals() {
  console.log('Seeding hospitals in Mumbai...')
  const hospitals = [
    {
      name: 'City General Hospital',
      address: '123 Medical Plaza, Mumbai Central',
      phone: '+91 22 1234 5678',
      latitude: 18.9750,
      longitude: 72.8258,
      icu_beds_total: 50,
      icu_beds_available: 12,
      er_beds_total: 30,
      er_beds_available: 5,
      general_beds_total: 200,
      general_beds_available: 45,
      specialties: ['Cardiology', 'Neurology', 'Trauma'],
      status: 'available'
    },
    {
      name: 'St. Jude Emergency Center',
      address: '45 Health St, Bandra West, Mumbai',
      phone: '+91 22 8765 4321',
      latitude: 19.0596,
      longitude: 72.8295,
      icu_beds_total: 20,
      icu_beds_available: 0,
      er_beds_total: 40,
      er_beds_available: 2,
      general_beds_total: 100,
      general_beds_available: 10,
      specialties: ['Pediatrics', 'Emergency Medicine'],
      status: 'limited'
    },
    {
      name: 'Metro Care Hospital',
      address: '789 Life Ave, Andheri East, Mumbai',
      phone: '+91 22 1122 3344',
      latitude: 19.1136,
      longitude: 72.8697,
      icu_beds_total: 80,
      icu_beds_available: 25,
      er_beds_total: 50,
      er_beds_available: 15,
      general_beds_total: 300,
      general_beds_available: 120,
      specialties: ['Oncology', 'Orthopedics', 'Gastroenterology'],
      status: 'available'
    }
  ]

  const { error } = await supabase.from('hospitals').insert(hospitals)
  if (error) console.error('Error seeding hospitals:', error)
  else console.log('Hospitals seeded successfully!')
}

async function seedIncidentReports() {
  console.log('Seeding incident reports in Mumbai...')
  const reports = [
    {
      title: 'Large Water Logging',
      description: 'Heavy rains have caused significant water logging near the main junction. Vehicles are struggling to pass.',
      category: 'infrastructure',
      latitude: 19.0760,
      longitude: 72.8777,
      location_text: 'Western Express Highway Junction',
      verification_status: 'verified',
      confirmations: 24,
      reporter_name: 'Rahul Sharma'
    },
    {
      title: 'Minor Fire at Warehouse',
      description: 'A small fire has broken out at a warehouse near the docks. Fire engines are on the way.',
      category: 'fire',
      latitude: 18.9500,
      longitude: 72.8500,
      location_text: 'Dockyard Road',
      verification_status: 'unverified',
      confirmations: 5,
      reporter_name: 'Priya Patel'
    }
  ]

  const { error } = await supabase.from('incident_reports').insert(reports)
  if (error) console.error('Error seeding incident reports:', error)
  else console.log('Incident reports seeded successfully!')
}

async function main() {
  await seedHospitals()
  await seedIncidentReports()
  console.log('Seeding completed!')
}

main()
