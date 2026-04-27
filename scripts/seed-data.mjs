import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedEmergencies() {
  console.log('Seeding emergencies in Mumbai...')

  const emergencies = [
    {
      reporter_name: 'Rahul Sharma',
      reporter_phone: '+91 98765 43210',
      severity: 'critical',
      status: 'active',
      latitude: 19.0760,
      longitude: 72.8777,
      volunteers_notified: 6,
      ambulance_dispatched: true
    },
    {
      reporter_name: 'Priya Patel',
      reporter_phone: '+91 91234 56789',
      severity: 'moderate',
      status: 'active',
      latitude: 19.0596,
      longitude: 72.8295,
      volunteers_notified: 4,
      ambulance_dispatched: false
    },
    {
      reporter_name: 'Amit Verma',
      reporter_phone: '+91 99887 77665',
      severity: 'minor',
      status: 'active',
      latitude: 19.1136,
      longitude: 72.8697,
      volunteers_notified: 3,
      ambulance_dispatched: false
    },
    {
      reporter_name: 'Sneha Iyer',
      reporter_phone: '+91 90000 11122',
      severity: 'critical',
      status: 'resolved',
      latitude: 19.2183,
      longitude: 72.9781,
      volunteers_notified: 8,
      ambulance_dispatched: true,
      resolved_at: new Date().toISOString()
    }
  ]

  const { data, error } = await supabase
    .from('emergencies')
    .insert(emergencies)
    .select()

  if (error) {
    console.error('Error seeding emergencies:', error)
  } else {
    console.log('Emergencies seeded successfully!')
    console.log(data)
  }
}

seedEmergencies()