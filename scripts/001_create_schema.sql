-- CrisisSync Database Schema

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Volunteers table
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  response_radius_km DOUBLE PRECISION DEFAULT 3,
  total_responses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Volunteers viewable" ON public.volunteers;
CREATE POLICY "Volunteers viewable" ON public.volunteers FOR SELECT USING (true);
DROP POLICY IF EXISTS "volunteers_insert_own" ON public.volunteers;
CREATE POLICY "volunteers_insert_own" ON public.volunteers FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "volunteers_update_own" ON public.volunteers;
CREATE POLICY "volunteers_update_own" ON public.volunteers FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "volunteers_delete_own" ON public.volunteers;
CREATE POLICY "volunteers_delete_own" ON public.volunteers FOR DELETE USING (auth.uid() = user_id);

-- Hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  icu_beds_total INTEGER DEFAULT 0,
  icu_beds_available INTEGER DEFAULT 0,
  er_beds_total INTEGER DEFAULT 0,
  er_beds_available INTEGER DEFAULT 0,
  general_beds_total INTEGER DEFAULT 0,
  general_beds_available INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hospitals viewable" ON public.hospitals;
CREATE POLICY "Hospitals viewable" ON public.hospitals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Hospitals insert" ON public.hospitals;
CREATE POLICY "Hospitals insert" ON public.hospitals FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Hospitals update" ON public.hospitals;
CREATE POLICY "Hospitals update" ON public.hospitals FOR UPDATE USING (true);

-- Emergencies table
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reporter_phone TEXT,
  severity TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'active',
  ambulance_dispatched BOOLEAN DEFAULT false,
  volunteers_notified INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergencies viewable" ON public.emergencies;
CREATE POLICY "Emergencies viewable" ON public.emergencies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Emergencies insert" ON public.emergencies;
CREATE POLICY "Emergencies insert" ON public.emergencies FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Emergencies update" ON public.emergencies;
CREATE POLICY "Emergencies update" ON public.emergencies FOR UPDATE USING (true);

-- Ambulances table
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'available',
  current_emergency_id UUID REFERENCES public.emergencies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ambulances viewable" ON public.ambulances;
CREATE POLICY "Ambulances viewable" ON public.ambulances FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ambulances insert" ON public.ambulances;
CREATE POLICY "Ambulances insert" ON public.ambulances FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Ambulances update" ON public.ambulances;
CREATE POLICY "Ambulances update" ON public.ambulances FOR UPDATE USING (true);

-- Emergency Responses table
CREATE TABLE IF NOT EXISTS public.emergency_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id UUID NOT NULL REFERENCES public.emergencies(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'accepted',
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.emergency_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Responses viewable" ON public.emergency_responses;
CREATE POLICY "Responses viewable" ON public.emergency_responses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Responses insert" ON public.emergency_responses;
CREATE POLICY "Responses insert" ON public.emergency_responses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Responses update" ON public.emergency_responses;
CREATE POLICY "Responses update" ON public.emergency_responses FOR UPDATE USING (true);

-- Incident reports table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_text TEXT,
  verification_status TEXT DEFAULT 'unverified',
  confirmations INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reports viewable" ON public.incident_reports;
CREATE POLICY "Reports viewable" ON public.incident_reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Reports insert" ON public.incident_reports;
CREATE POLICY "Reports insert" ON public.incident_reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Reports update" ON public.incident_reports;
CREATE POLICY "Reports update" ON public.incident_reports FOR UPDATE USING (true);

-- Report confirmations table
CREATE TABLE IF NOT EXISTS public.report_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_confirmed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

ALTER TABLE public.report_confirmations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Confirmations viewable" ON public.report_confirmations;
CREATE POLICY "Confirmations viewable" ON public.report_confirmations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Confirmations insert" ON public.report_confirmations;
CREATE POLICY "Confirmations insert" ON public.report_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Confirmations update" ON public.report_confirmations;
CREATE POLICY "Confirmations update" ON public.report_confirmations FOR UPDATE USING (auth.uid() = user_id);
