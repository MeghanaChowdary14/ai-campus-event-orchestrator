const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Resource = require('../models/Resource');
const Event = require('../models/Event');
const EventPlanVersion = require('../models/EventPlanVersion');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const aiOrchestrator = require('../ai/orchestrator');

const seedAll = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Clearing existing collections...');

    await User.deleteMany({});
    await Venue.deleteMany({});
    await Resource.deleteMany({});
    await Event.deleteMany({});
    await EventPlanVersion.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder] Creating admin and standard role users...');
    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@campus.edu',
        password: 'Admin@12345',
        role: 'Admin',
        department: 'Campus Administration',
        phone: '+1 (555) 012-0001',
        isApproved: true,
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'coordinator@campus.edu',
        password: 'Admin@123',
        role: 'Coordinator',
        department: 'Student Affairs & Campus Life',
        phone: '+1 (555) 012-4001',
        isApproved: true,
      },
      {
        name: 'Marcus Vance',
        email: 'venue@campus.edu',
        password: 'Venue@123',
        role: 'Venue Team',
        department: 'Campus Facilities & Operations',
        phone: '+1 (555) 012-4002',
        isApproved: true,
      },
      {
        name: 'Elena Rostova',
        email: 'tech@campus.edu',
        password: 'Tech@123',
        role: 'Technical Team',
        department: 'Information Technology Services',
        phone: '+1 (555) 012-4003',
        isApproved: true,
      },
      {
        name: 'Aiden Patel',
        email: 'volunteer@campus.edu',
        password: 'Volunteer@123',
        role: 'Volunteer Team',
        department: 'Student Council Leadership',
        phone: '+1 (555) 012-4004',
        isApproved: true,
      },
      {
        name: 'Chief Robert Stone',
        email: 'security@campus.edu',
        password: 'Security@123',
        role: 'Security Team',
        department: 'Campus Safety & Protection',
        phone: '+1 (555) 012-4005',
        isApproved: true,
      },
    ]);

    const adminUser = users[0];
    const coordinatorUser = users[1];
    const venueUser = users[2];
    const techUser = users[3];
    const volunteerUser = users[4];
    const securityUser = users[5];

    console.log('[Seeder] Creating campus venues...');
    const venues = await Venue.create([
      {
        name: 'Main Campus Auditorium',
        building: 'Academic Block A',
        capacity: 1000,
        type: 'Auditorium',
        facilities: [
          'Line Array Surround Sound',
          'Dual 4K Laser Projectors',
          'Motorized Screen',
          'DMX Stage Lighting',
          'Central Air Conditioning',
          'High-Speed Wi-Fi',
          'VIP Green Rooms',
        ],
        hourlyRate: 150,
        currentStatus: 'Available',
        contactPerson: { name: 'Marcus Vance', phone: '+1 (555) 012-4002', email: 'venue@campus.edu' },
      },
      {
        name: 'CS Turing Seminar Hall',
        building: 'Turing IT Wing',
        capacity: 250,
        type: 'Seminar Hall',
        facilities: [
          'High-Density Wi-Fi 6',
          'Laser Projector',
          'Digital Podium',
          'Air Conditioning',
          'Acoustic Paneling',
        ],
        hourlyRate: 80,
        currentStatus: 'Available',
        contactPerson: { name: 'Facilities Desk', phone: '+1 (555) 012-4110', email: 'facilities@campus.edu' },
      },
      {
        name: 'Open Air Amphitheatre',
        building: 'Student Activity Hub',
        capacity: 2000,
        type: 'Amphitheatre',
        facilities: [
          'High-Output Stadium Floodlights',
          'Elevated Concrete Stage',
          'Perimeter Sound Towers',
          'Open Seating Tiers',
        ],
        hourlyRate: 200,
        currentStatus: 'Available',
        contactPerson: { name: 'Events Desk', phone: '+1 (555) 012-4111', email: 'events@campus.edu' },
      },
      {
        name: 'Executive Conference Room 101',
        building: 'Administration Complex',
        capacity: 60,
        type: 'Conference Room',
        facilities: [
          'Polycom Video Conferencing',
          '75" Interactive 4K Touch Display',
          'Executive Leather Chairs',
          'Pristine Acoustic Isolation',
        ],
        hourlyRate: 50,
        currentStatus: 'Available',
        contactPerson: { name: 'Admin Secretary', phone: '+1 (555) 012-4112', email: 'admin@campus.edu' },
      },
      {
        name: 'Indoor Athletics & Sports Complex',
        building: 'Athletics Wing',
        capacity: 1500,
        type: 'Sports Complex',
        facilities: [
          'Electronic Multi-Sport Scoreboard',
          'Full Bleacher Seating',
          'Industrial PA System',
          'Locker Rooms',
        ],
        hourlyRate: 120,
        currentStatus: 'Available',
        contactPerson: { name: 'Coach Davis', phone: '+1 (555) 012-4115', email: 'sports@campus.edu' },
      },
      {
        name: 'Mechanical Robotics Prototyping Lab',
        building: 'Engineering Block C',
        capacity: 100,
        type: 'Lab',
        facilities: ['3D Printers', 'Soldering Benches', 'Overhead Exhaust'],
        hourlyRate: 90,
        currentStatus: 'Maintenance',
        maintenanceNotes: 'Annual electrical rewiring and equipment recalibration in progress until next week.',
        contactPerson: { name: 'Lab Tech John', phone: '+1 (555) 012-4118', email: 'englab@campus.edu' },
      },
    ]);

    console.log('[Seeder] Creating campus resources and hardware inventory...');
    const resources = await Resource.create([
      {
        name: 'HD Laser Projector (4K)',
        category: 'AudioVisual',
        totalStock: 10,
        availableStock: 8,
        unit: 'units',
        unitCost: 150,
        condition: 'Optimal',
        location: 'IT Services Warehouse B',
      },
      {
        name: 'Wireless Handheld / Lapel Mics',
        category: 'AudioVisual',
        totalStock: 25,
        availableStock: 20,
        unit: 'units',
        unitCost: 40,
        condition: 'Optimal',
        location: 'AV Equipment Cage A',
      },
      {
        name: 'Stage PA System & Line Array Speakers',
        category: 'AudioVisual',
        totalStock: 6,
        availableStock: 5,
        unit: 'sets',
        unitCost: 250,
        condition: 'Optimal',
        location: 'Main Auditorium Tech Storage',
      },
      {
        name: 'Stage LED Lighting Rig',
        category: 'AudioVisual',
        totalStock: 8,
        availableStock: 6,
        unit: 'sets',
        unitCost: 120,
        condition: 'Optimal',
        location: 'Main Auditorium Tech Storage',
      },
      {
        name: 'Ergonomic Auditorium Chairs',
        category: 'Furniture',
        totalStock: 1500,
        availableStock: 1350,
        unit: 'units',
        unitCost: 3,
        condition: 'Optimal',
        location: 'Central Campus Logistics Depot',
      },
      {
        name: 'Digital Podium with Teleprompter',
        category: 'Stage',
        totalStock: 4,
        availableStock: 3,
        unit: 'units',
        unitCost: 80,
        condition: 'Optimal',
        location: 'Academic Admin Storage',
      },
      {
        name: 'High-Density Wi-Fi 6 Access Points',
        category: 'Network',
        totalStock: 20,
        availableStock: 16,
        unit: 'units',
        unitCost: 60,
        condition: 'Optimal',
        location: 'IT Networking Rack Room',
      },
      {
        name: 'Security Handheld Metal Detectors',
        category: 'Safety',
        totalStock: 15,
        availableStock: 12,
        unit: 'units',
        unitCost: 35,
        condition: 'Optimal',
        location: 'Campus Security Head Office',
      },
      {
        name: 'Team Two-Way Walkie Talkies',
        category: 'Safety',
        totalStock: 30,
        availableStock: 24,
        unit: 'units',
        unitCost: 25,
        condition: 'Optimal',
        location: 'Campus Security Head Office',
      },
      {
        name: 'Digital Banner & Stage Backdrop',
        category: 'Signage',
        totalStock: 10,
        availableStock: 8,
        unit: 'units',
        unitCost: 100,
        condition: 'Optimal',
        location: 'Central Campus Logistics Depot',
      },
    ]);

    console.log('[Seeder] Creating sample events and orchestrating multi-agent plans...');

    // Event 1: Inter-College Hackathon 2026 (Approved, with active tasks)
    const hackathonStart = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    hackathonStart.setHours(9, 0, 0, 0);
    const hackathonEnd = new Date(hackathonStart.getTime() + 10 * 60 * 60 * 1000);

    const event1 = await Event.create({
      title: 'HackCampus 2026: 24-Hour AI Innovation Hackathon',
      description: 'Flagship inter-college hackathon bringing together over 350 student coders, designers, and AI creators to build breakthrough applications.',
      category: 'Hackathon',
      expectedAttendees: 350,
      durationHours: 10,
      startDate: hackathonStart,
      endDate: hackathonEnd,
      budget: 8500,
      numberOfActivities: 4,
      activities: [
        { name: 'Opening Ceremony & Problem Statement Pitching', durationMinutes: 60, preferredVenue: 'Main Campus Auditorium', order: 1 },
        { name: 'Mentorship Rounds & Architecture Reviews', durationMinutes: 180, preferredVenue: 'CS Turing Seminar Hall', order: 2 },
        { name: 'Midway Prototype Code Sprint', durationMinutes: 240, preferredVenue: 'Main Campus Auditorium', order: 3 },
        { name: 'Grand Finale Demo & Judging Showcase', durationMinutes: 120, preferredVenue: 'Main Campus Auditorium', order: 4 },
      ],
      preferredVenues: ['Main Campus Auditorium'],
      specialRequirements: 'Dedicated 1Gbps internet uplink, 4K multi-cam live stream, continuous beverage catering, high-draw power strips for 90 student teams.',
      status: 'Approved',
      createdBy: coordinatorUser._id,
      approvedBy: coordinatorUser._id,
    });

    // Run AI orchestrator for Event 1
    const orch1 = await aiOrchestrator.orchestrate(event1, {
      dbVenues: venues,
      dbResources: resources,
      existingEvents: [],
    });

    const plan1 = await EventPlanVersion.create({
      eventId: event1._id,
      versionNumber: 1,
      status: 'Approved',
      changeSummary: 'Initial Multi-Agent Orchestrated Plan - Approved by Dr. Sarah Jenkins',
      planData: orch1.planData,
      generatedBy: coordinatorUser._id,
      approvedBy: coordinatorUser._id,
    });

    event1.currentPlan = plan1._id;
    await event1.save();

    // Create live tasks for Event 1
    const tasks1 = [
      {
        title: 'Conduct Main Auditorium HVAC & Emergency Route Inspection',
        description: 'Verify optimal temperature control, stage access keys, and clear fire exit routes.',
        eventId: event1._id,
        planVersionId: plan1._id,
        assignedTeam: 'Venue Team',
        assignedTo: venueUser._id,
        priority: 'High',
        deadline: new Date(hackathonStart.getTime() - 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 60,
        notes: [
          { author: venueUser._id, authorName: 'Marcus Vance (Venue Team)', text: 'HVAC checked and set to 21°C. Main hall cleaned.', timestamp: new Date() },
        ],
        createdBy: coordinatorUser._id,
      },
      {
        title: 'Deploy High-Density Wi-Fi 6 Dedicated SSID "HackCampus2026"',
        description: 'Configure QoS bandwidth reservation: 5Mbps minimum guaranteed per team with failover secondary gateway.',
        eventId: event1._id,
        planVersionId: plan1._id,
        assignedTeam: 'Technical Team',
        assignedTo: techUser._id,
        priority: 'High',
        deadline: new Date(hackathonStart.getTime() - 12 * 60 * 60 * 1000),
        status: 'Completed',
        progress: 100,
        notes: [
          { author: techUser._id, authorName: 'Elena Rostova (Technical Team)', text: 'SSID live with WPA3 Enterprise, ping tests stable at 4ms.', timestamp: new Date() },
        ],
        createdBy: coordinatorUser._id,
      },
      {
        title: 'Setup Attendee Check-In Desks & NFC Badge Coding',
        description: 'Organize 4 registration lines with NFC encoders and welcome packs containing sponsor swag and lanyards.',
        eventId: event1._id,
        planVersionId: plan1._id,
        assignedTeam: 'Volunteer Team',
        assignedTo: volunteerUser._id,
        priority: 'Medium',
        deadline: new Date(hackathonStart.getTime() - 2 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 40,
        createdBy: coordinatorUser._id,
      },
      {
        title: 'Establish Security Screening & Overnight Perimeter Patrol',
        description: 'Deploy metal detector portals at Entry 1 & 2. Schedule rotating 2-officer night patrols for 24-hour event.',
        eventId: event1._id,
        planVersionId: plan1._id,
        assignedTeam: 'Security Team',
        assignedTo: securityUser._id,
        priority: 'Critical',
        deadline: new Date(hackathonStart.getTime() - 3 * 60 * 60 * 1000),
        status: 'Pending',
        progress: 15,
        createdBy: coordinatorUser._id,
      },
      {
        title: 'Stage Audio-Visual Dry Run & Livestream Calibration',
        description: 'Test all line-array audio feeds, presenter wireless mics, and YouTube Live 4K broadcast stream.',
        eventId: event1._id,
        planVersionId: plan1._id,
        assignedTeam: 'Technical Team',
        assignedTo: techUser._id,
        priority: 'High',
        deadline: new Date(hackathonStart.getTime() - 4 * 60 * 60 * 1000),
        status: 'Pending',
        progress: 0,
        createdBy: coordinatorUser._id,
      },
    ];

    await Task.insertMany(tasks1);

    // Event 2: National AI & Robotics Symposium (Under Review, with conflicts & recommendations)
    const symposiumStart = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    symposiumStart.setHours(10, 0, 0, 0);
    const symposiumEnd = new Date(symposiumStart.getTime() + 6 * 60 * 60 * 1000);

    const event2 = await Event.create({
      title: 'National AI & Autonomous Robotics Symposium 2026',
      description: 'Premier national symposium featuring distinguished research talks from robotics labs, industrial automation exhibits, and student paper awards.',
      category: 'Tech Symposium',
      expectedAttendees: 600,
      durationHours: 6,
      startDate: symposiumStart,
      endDate: symposiumEnd,
      budget: 12000,
      numberOfActivities: 3,
      activities: [
        { name: 'Inaugural Keynote: Frontiers in Autonomous Robotics', durationMinutes: 75, preferredVenue: 'Main Campus Auditorium', order: 1 },
        { name: 'Research Paper Presentation Track (Dual Sessions)', durationMinutes: 120, preferredVenue: 'CS Turing Seminar Hall', order: 2 },
        { name: 'Live Robotics Demo & Valedictory Honors', durationMinutes: 90, preferredVenue: 'Main Campus Auditorium', order: 3 },
      ],
      preferredVenues: ['Main Campus Auditorium'],
      specialRequirements: 'VIP reception protocol for 3 visiting keynote scientists, 2 wireless lapel mics, press media enclosure, teleprompter at podium.',
      status: 'Under Review',
      createdBy: coordinatorUser._id,
    });

    const orch2 = await aiOrchestrator.orchestrate(event2, {
      dbVenues: venues,
      dbResources: resources,
      existingEvents: [event1],
    });

    const plan2 = await EventPlanVersion.create({
      eventId: event2._id,
      versionNumber: 1,
      status: 'Under Review',
      changeSummary: 'Initial Multi-Agent Orchestrated Plan - Pending Coordinator Approval',
      planData: orch2.planData,
      generatedBy: coordinatorUser._id,
    });

    event2.currentPlan = plan2._id;
    await event2.save();

    // Event 3: Campus Spring Cultural Fest (Draft)
    const festStart = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    festStart.setHours(16, 0, 0, 0);
    const festEnd = new Date(festStart.getTime() + 8 * 60 * 60 * 1000);

    const event3 = await Event.create({
      title: 'Campus Spring Harmony Cultural Fest',
      description: 'Annual cultural extravaganza featuring battle of the bands, classical dance showcases, theatrical acts, and food festival.',
      category: 'Cultural Fest',
      expectedAttendees: 1800,
      durationHours: 8,
      startDate: festStart,
      endDate: festEnd,
      budget: 15000,
      numberOfActivities: 3,
      activities: [
        { name: 'Inter-College Music Battle & Band Showcase', durationMinutes: 180, preferredVenue: 'Open Air Amphitheatre', order: 1 },
        { name: 'Choreography Dance Extravaganza', durationMinutes: 120, preferredVenue: 'Open Air Amphitheatre', order: 2 },
        { name: 'Celebrity Musical Night & Awards', durationMinutes: 120, preferredVenue: 'Open Air Amphitheatre', order: 3 },
      ],
      preferredVenues: ['Open Air Amphitheatre'],
      specialRequirements: 'Stage fireworks safety clearance, ambulance stationed on-site, backstage green rooms for 12 performing groups.',
      status: 'Draft',
      createdBy: coordinatorUser._id,
    });

    // Create notifications for all teams
    console.log('[Seeder] Creating sample team notifications...');
    await Notification.create([
      {
        recipientTeam: 'Coordinator',
        title: 'Plan Ready for Review: "National AI & Autonomous Robotics Symposium 2026"',
        message: 'The AI Multi-Agent pipeline has finished generating schedules, venue allocations, and resource requirements. Please review and approve.',
        type: 'approval',
        eventId: event2._id,
      },
      {
        recipientTeam: 'Venue Team',
        title: 'Venue Task in Progress: "HackCampus 2026"',
        message: 'Please complete the HVAC inspection and access key verification for Main Campus Auditorium.',
        type: 'task_assignment',
        eventId: event1._id,
      },
      {
        recipientTeam: 'Technical Team',
        title: 'New Event Assigned: "HackCampus 2026"',
        message: 'Stage AV calibration and live-streaming dry run scheduled for tomorrow.',
        type: 'task_assignment',
        eventId: event1._id,
      },
      {
        recipientTeam: 'Volunteer Team',
        title: 'Check-in Desk Preparations: "HackCampus 2026"',
        message: '350 student welcome kits and badges are ready for assembly.',
        type: 'task_assignment',
        eventId: event1._id,
      },
      {
        recipientTeam: 'Security Team',
        title: 'Critical Task: Checkpoint Screening Protocol',
        message: 'Metal detector portals must be fully verified and exit routes unblocked before entry opens.',
        type: 'conflict',
        eventId: event1._id,
      },
    ]);

    console.log('[Seeder] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Accounts:');
    console.log('Admin:          admin@campus.edu        / Admin@12345');
    console.log('Coordinator:    coordinator@campus.edu  / Admin@123');
    console.log('Venue Team:     venue@campus.edu        / Venue@123');
    console.log('Technical Team: tech@campus.edu         / Tech@123');
    console.log('Volunteer Team: volunteer@campus.edu    / Volunteer@123');
    console.log('Security Team:  security@campus.edu     / Security@123');
    console.log('----------------------------------------------------');

    return true;
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
    throw err;
  }
};

if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedAll;
