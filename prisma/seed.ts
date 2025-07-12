import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with demo users...')

  // Create skills first
  const skills = [
    // Technical Skills
    { name: 'React.js', category: 'Frontend Development' },
    { name: 'Next.js', category: 'Frontend Development' },
    { name: 'Angular', category: 'Frontend Development' },
    { name: 'Vue.js', category: 'Frontend Development' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'Node.js', category: 'Backend Development' },
    { name: 'Express.js', category: 'Backend Development' },
    { name: 'Django', category: 'Backend Development' },
    { name: 'Spring Boot', category: 'Backend Development' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    
    // Design Skills
    { name: 'Figma', category: 'Design' },
    { name: 'Adobe Photoshop', category: 'Design' },
    { name: 'Adobe Illustrator', category: 'Design' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Sketch', category: 'Design' },
    { name: 'Adobe XD', category: 'Design' },
    
    // DevOps & Cloud
    { name: 'AWS', category: 'Cloud Computing' },
    { name: 'Azure', category: 'Cloud Computing' },
    { name: 'Google Cloud', category: 'Cloud Computing' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'Jenkins', category: 'DevOps' },
    
    // Data & Analytics
    { name: 'Data Analysis', category: 'Data Science' },
    { name: 'Machine Learning', category: 'Data Science' },
    { name: 'Power BI', category: 'Analytics' },
    { name: 'Tableau', category: 'Analytics' },
    { name: 'Excel', category: 'Analytics' },
    
    // Marketing & Business
    { name: 'Digital Marketing', category: 'Marketing' },
    { name: 'SEO', category: 'Marketing' },
    { name: 'Content Writing', category: 'Content' },
    { name: 'Social Media Marketing', category: 'Marketing' },
    { name: 'Project Management', category: 'Management' },
    
    // Languages
    { name: 'English Speaking', category: 'Languages' },
    { name: 'Hindi', category: 'Languages' },
    { name: 'Tamil', category: 'Languages' },
    { name: 'Telugu', category: 'Languages' },
    { name: 'Bengali', category: 'Languages' },
    { name: 'German', category: 'Languages' },
    { name: 'French', category: 'Languages' },
    
    // Other Skills
    { name: 'Photography', category: 'Creative' },
    { name: 'Video Editing', category: 'Creative' },
    { name: 'Guitar', category: 'Music' },
    { name: 'Piano', category: 'Music' },
    { name: 'Cooking', category: 'Lifestyle' },
    { name: 'Yoga', category: 'Wellness' }
  ]

  console.log('Creating skills...')
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill
    })
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demoUsers = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      location: 'Bangalore, Karnataka',
      availability: 'Weekends and evenings after 7 PM',
      offeredSkills: ['React.js', 'TypeScript', 'Node.js'],
      wantedSkills: ['Figma', 'UI/UX Design', 'Adobe Photoshop']
    },
    {
      name: 'Arjun Patel',
      email: 'arjun.patel@example.com',
      location: 'Pune, Maharashtra',
      availability: 'Monday to Friday, 6-9 PM',
      offeredSkills: ['Figma', 'UI/UX Design', 'Adobe Illustrator'],
      wantedSkills: ['React.js', 'JavaScript', 'Frontend Development']
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      location: 'Hyderabad, Telangana',
      availability: 'Flexible timings, prefer evenings',
      offeredSkills: ['Python', 'Django', 'Data Analysis'],
      wantedSkills: ['Machine Learning', 'AWS', 'Docker']
    },
    {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      location: 'Delhi, NCR',
      availability: 'Weekends only',
      offeredSkills: ['Java', 'Spring Boot', 'MySQL'],
      wantedSkills: ['Python', 'Data Science', 'MongoDB']
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      location: 'Chennai, Tamil Nadu',
      availability: 'Tuesday & Thursday evenings',
      offeredSkills: ['Digital Marketing', 'Content Writing', 'SEO'],
      wantedSkills: ['Social Media Marketing', 'Photoshop', 'Video Editing']
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      location: 'Mumbai, Maharashtra',
      availability: 'Weekends and holidays',
      offeredSkills: ['AWS', 'Docker', 'Kubernetes'],
      wantedSkills: ['Azure', 'Jenkins', 'DevOps']
    },
    {
      name: 'Kavya Nair',
      email: 'kavya.nair@example.com',
      location: 'Kochi, Kerala',
      availability: 'Flexible, prefer mornings',
      offeredSkills: ['Angular', 'TypeScript', 'PostgreSQL'],
      wantedSkills: ['Vue.js', 'React.js', 'MongoDB']
    },
    {
      name: 'Aditya Gupta',
      email: 'aditya.gupta@example.com',
      location: 'Gurugram, Haryana',
      availability: 'Monday to Friday after 8 PM',
      offeredSkills: ['Photography', 'Adobe Photoshop', 'Video Editing'],
      wantedSkills: ['UI/UX Design', 'Figma', 'Digital Marketing']
    },
    {
      name: 'Pooja Joshi',
      email: 'pooja.joshi@example.com',
      location: 'Ahmedabad, Gujarat',
      availability: 'Weekends and Wednesday evenings',
      offeredSkills: ['Project Management', 'Excel', 'Data Analysis'],
      wantedSkills: ['Power BI', 'Tableau', 'Python']
    },
    {
      name: 'Karthik Menon',
      email: 'karthik.menon@example.com',
      location: 'Bangalore, Karnataka',
      availability: 'Saturday mornings and Sunday evenings',
      offeredSkills: ['Machine Learning', 'Python', 'Tableau'],
      wantedSkills: ['AWS', 'Docker', 'React.js']
    },
    {
      name: 'Riya Agarwal',
      email: 'riya.agarwal@example.com',
      location: 'Jaipur, Rajasthan',
      availability: 'Evenings after 6 PM',
      offeredSkills: ['Hindi', 'English Speaking', 'Content Writing'],
      wantedSkills: ['German', 'French', 'Digital Marketing']
    },
    {
      name: 'Suresh Pillai',
      email: 'suresh.pillai@example.com',
      location: 'Thiruvananthapuram, Kerala',
      availability: 'Weekend mornings',
      offeredSkills: ['Guitar', 'Piano', 'Music Theory'],
      wantedSkills: ['Photography', 'Video Editing', 'Cooking']
    },
    {
      name: 'Admin User',
      email: 'admin@skilldoo.com',
      location: 'Mumbai, Maharashtra',
      availability: 'Available for platform support',
      offeredSkills: ['Platform Management', 'User Support'],
      wantedSkills: [],
      role: 'admin'
    }
  ]

  console.log('Creating demo users...')
  for (const user of demoUsers) {
    // Create user
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        location: user.location,
        availability: user.availability,
        role: user.role || 'user',
        isActive: true,
        isPublic: true
      }
    })

    // Add offered skills
    for (const skillName of user.offeredSkills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (skill) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId_type: {
              userId: createdUser.id,
              skillId: skill.id,
              type: 'offered'
            }
          },
          update: {},
          create: {
            userId: createdUser.id,
            skillId: skill.id,
            type: 'offered',
            proficiencyLevel: Math.floor(Math.random() * 3) + 3 // 3-5 rating
          }
        })
      }
    }

    // Add wanted skills
    for (const skillName of user.wantedSkills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (skill) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId_type: {
              userId: createdUser.id,
              skillId: skill.id,
              type: 'wanted'
            }
          },
          update: {},
          create: {
            userId: createdUser.id,
            skillId: skill.id,
            type: 'wanted'
          }
        })
      }
    }

    console.log(`✅ Created user: ${user.name}`)
  }

  // Create some sample swap requests
  console.log('Creating sample swap requests...')
  
  const priya = await prisma.user.findUnique({ where: { email: 'priya.sharma@example.com' } })
  const arjun = await prisma.user.findUnique({ where: { email: 'arjun.patel@example.com' } })
  const sneha = await prisma.user.findUnique({ where: { email: 'sneha.reddy@example.com' } })
  const karthik = await prisma.user.findUnique({ where: { email: 'karthik.menon@example.com' } })
  
  const reactSkill = await prisma.skill.findUnique({ where: { name: 'React.js' } })
  const figmaSkill = await prisma.skill.findUnique({ where: { name: 'Figma' } })
  const pythonSkill = await prisma.skill.findUnique({ where: { name: 'Python' } })
  const mlSkill = await prisma.skill.findUnique({ where: { name: 'Machine Learning' } })

  if (priya && arjun && reactSkill && figmaSkill) {
    await prisma.swapRequest.create({
      data: {
        requesterId: priya.id,
        providerId: arjun.id,
        skillOffered: reactSkill.id,
        skillWanted: figmaSkill.id,
        message: 'Hi Arjun! I\'m a React developer and would love to learn Figma from you. I can teach you React.js in return. Let\'s connect!',
        status: 'pending'
      }
    })
  }

  if (sneha && karthik && pythonSkill && mlSkill) {
    await prisma.swapRequest.create({
      data: {
        requesterId: sneha.id,
        providerId: karthik.id,
        skillOffered: pythonSkill.id,
        skillWanted: mlSkill.id,
        message: 'Hello Karthik! I have good Python experience and want to learn ML. Can we do a skill exchange?',
        status: 'accepted'
      }
    })
  }

  console.log('🎉 Database seeded successfully!')
  console.log('\n📋 Demo Login Credentials:')
  console.log('Email: priya.sharma@example.com | Password: demo123')
  console.log('Email: arjun.patel@example.com | Password: demo123')
  console.log('Email: admin@skilldoo.com | Password: demo123 (Admin)')
  console.log('\n🚀 Ready for demo!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 