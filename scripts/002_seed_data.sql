-- Seed Dummy Data for CrisisSync (Mumbai Edition)

-- 1. Insert Hospitals
INSERT INTO public.hospitals (name, address, phone, latitude, longitude, icu_beds_total, icu_beds_available, er_beds_total, er_beds_available, general_beds_total, general_beds_available, specialties, status)
VALUES 
('City General Hospital', '123 Medical Plaza, Mumbai Central', '+91 22 1234 5678', 18.9750, 72.8258, 50, 12, 30, 5, 200, 45, ARRAY['Cardiology', 'Neurology', 'Trauma'], 'available'),
('St. Jude Emergency Center', '45 Health St, Bandra West, Mumbai', '+91 22 8765 4321', 19.0596, 72.8295, 20, 0, 40, 2, 100, 10, ARRAY['Pediatrics', 'Emergency Medicine'], 'limited'),
('Metro Care Hospital', '789 Life Ave, Andheri East, Mumbai', '+91 22 1122 3344', 19.1136, 72.8697, 80, 25, 50, 15, 300, 120, ARRAY['Oncology', 'Orthopedics', 'Gastroenterology'], 'available'),
('Unity Medical Center', '12 Unity Rd, Powai, Mumbai', '+91 22 4433 2211', 19.1176, 72.9060, 15, 2, 15, 0, 50, 5, ARRAY['General Surgery', 'Internal Medicine'], 'full'),
('Sunrise Childrens Hospital', '56 Dawn Blvd, Juhu, Mumbai', '+91 22 5566 7788', 19.1025, 72.8270, 30, 8, 20, 6, 80, 20, ARRAY['Pediatrics', 'Neonatology'], 'available');

-- 2. Insert Incident Reports
INSERT INTO public.incident_reports (title, description, category, latitude, longitude, location_text, verification_status, confirmations, reporter_name)
VALUES 
('Large Water Logging', 'Heavy rains have caused significant water logging near the main junction. Vehicles are struggling to pass.', 'Infrastructure', 19.0760, 72.8777, 'Western Express Highway Junction', 'verified', 24, 'Rahul Sharma'),
('Minor Fire at Warehouse', 'A small fire has broken out at a warehouse near the docks. Fire engines are on the way.', 'Fire', 18.9500, 72.8500, 'Dockyard Road', 'unverified', 5, 'Priya Patel'),
('Road Accident - Need Help', 'Two cars collided near the bridge. No major injuries but traffic is blocked.', 'Accident', 19.0500, 72.8500, 'Bandra-Worli Sea Link Entrance', 'verified', 12, 'Amit Verma'),
('Suspicious Package Found', 'A suspicious-looking bag has been left unattended near the metro station entrance for over an hour.', 'Security', 19.1200, 72.8400, 'Andheri Metro Station', 'unverified', 2, 'Suresh Kumar'),
('Power Outage in Area', 'Entire block has been without power for the last 3 hours. Electricians are working on it.', 'Infrastructure', 19.0800, 72.8800, 'Santacruz East', 'verified', 45, 'Deepa Gupta');

-- 3. Insert Emergencies
INSERT INTO public.emergencies (severity, description, latitude, longitude, address, status, reporter_name, reporter_phone)
VALUES 
('Critical', 'Cardiac arrest at a residential complex. Immediate medical assistance required.', 19.0600, 72.8300, '12 Highrise Apt, Bandra', 'active', 'John Doe', '+91 99887 76655'),
('High', 'Severe breathing difficulties for an elderly person.', 19.1100, 72.8700, '45 Green Park, Andheri', 'active', 'Jane Smith', '+91 98765 43210'),
('Medium', 'Fracture due to a fall from stairs.', 19.0900, 72.8900, 'Unity Society, Kurla', 'active', 'Mike Ross', '+91 91234 56789'),
('Critical', 'Multiple injuries from a construction site accident.', 19.1300, 72.9100, 'Skyline Project Site, Powai', 'active', 'Harvey Specter', '+91 90000 11111'),
('Low', 'Minor burn injury at a kitchen.', 19.1000, 72.8600, '78 Sunshine Colony, Vile Parle', 'resolved', 'Donna Paulsen', '+91 88888 77777');
