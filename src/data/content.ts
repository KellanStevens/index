export const profile = {
    name: 'Kellan Stevens',
    title: 'Fullstack Software Engineer with expertise in PHP, Laravel, and modern web stacks, passionate about building scalable applications.',
    location: 'Cape Town, South Africa',
    email: 'website@kellanstevens.com',
    linkedinUrl: 'https://linkedin.com/in/kellan-stevens',
    githubUrl: 'https://github.com/kellanstevens',
    initials: 'KS',
} as const;

export const about =
    'Fullstack Software Engineer with extensive experience in PHP-based web development, specializing in Laravel. Proven track record in building and maintaining scalable web and mobile applications using React, VueJS, MySQL. Adept at Linux server management, CI/CD pipelines, automation scripting, and infrastructure security. Strong background in Agile methodologies and client-focused development, with hands-on experience in Proxmox virtualization and containerisation. Committed to continuous learning and improving developer productivity through tooling and best practices.';

import tilloLogo from '@/images/tillo.jpeg';
import indieHackersLogo from '@/images/indie-hackers.jpeg';
import tripcoLogo from '@/images/tripco.jpeg';
import thamesSystemsLogo from '@/images/thames-systems.jpeg';
import wethinkcodeLogo from '@/images/wethinkcode.jpg';

export const workExperience = [
    {
        role: 'Full Stack Software Engineer',
        location: 'Cape Town, South Africa',
        dateRange: 'Jan 2026 - Present',
        company: 'Tillo',
        employmentType: 'Full-time',
        logo: tilloLogo,
        description:
            'Develop and maintain web and mobile applications using React, TypeScript, Vue, PHP (Laravel), and MySQL. Lead mobile development initiatives, ensuring performance, scalability, and user experience. Build automation scripts for internal workflows including content translation. Collaborate with cross-functional teams to design and optimize features. Improve site styling and responsiveness. Mentor new team members and support infrastructure improvements including CI/CD pipelines, data center migrations, and security hardening. Report progress to stakeholders and enhance team tooling for productivity.',
    },
    {
        role: 'Committee Member',
        location: 'Cape Town, South Africa',
        dateRange: 'Dec 2025 - Present',
        company: 'Indie Hackers | Cape Town',
        employmentType: 'Volunteer',
        logo: indieHackersLogo,
        description:
            'Actively participate in community-driven tech events and initiatives, fostering collaboration and knowledge sharing among local developers and entrepreneurs.',
    },
    {
        role: 'Facilitator',
        location: 'Cape Town, South Africa',
        dateRange: 'Jun 2025 - Present',
        company: 'City of Cape Town',
        employmentType: 'Volunteer',
        logo: indieHackersLogo,
        description:
            'Facilitate tech events, supporting an open and collaborative environment for developers, entrepreneurs and the likes.',
    },
    {
        role: 'Full Stack Software Engineer',
        location: 'Cape Town, South Africa',
        dateRange: 'Mar 2024 - Dec 2025',
        company: 'Tripco (Lekkeslaap)',
        employmentType: 'Full-time',
        logo: tripcoLogo,
        description:
            'Developed and maintained full-stack applications using PHP (Laravel), React, and MySQL. Collaborated on feature design, deployment, and system optimization. Contributed to backend architecture and frontend enhancements to improve user engagement and system reliability.',
    },
    {
        role: 'Software Developer',
        location: 'London, England, United Kingdom',
        dateRange: 'Jan 2023 - Feb 2024',
        company: 'Thames Systems',
        employmentType: 'Full-time',
        logo: thamesSystemsLogo,
        description:
            'Developed and maintained a SaaS platform using PHP, contributing to feature implementation, bug fixes, and client-facing solutions. Engaged directly with clients to understand requirements and deliver tailored solutions. Managed server maintenance, SSL certificates, and database operations. Utilized bash and batch scripting for internal automation and supported Microsoft SQL projects.',
    },
    {
        role: 'Junior Software Developer',
        location: 'London, England, United Kingdom',
        dateRange: 'Jan 2023 - Dec 2023',
        company: 'Thames Systems',
        employmentType: 'Full-time',
        logo: thamesSystemsLogo,
        description:
            'Supported development of PHP-based applications, participated in code reviews, and assisted in database design and deployment tasks. Gained exposure to full project lifecycle from requirement gathering to client demos, while learning modern development workflows and team collaboration practices.',
    },
    {
        role: 'Technical Mentor',
        location: 'Cape Town, South Africa',
        dateRange: 'Sep 2022 - Dec 2022',
        company: 'WeThinkCode_',
        employmentType: 'Contract',
        logo: wethinkcodeLogo,
        description:
            'Mentored first-year students in technical skills, guiding them through peer-to-peer learning and curriculum delivery. Onboarded new cohorts to Git and in-house LMS systems. Provided constructive feedback on projects and supported student success in a rigorous coding bootcamp environment.',
    },
    {
        role: 'Videographer, Photographer',
        location: 'Cape Town, South Africa',
        dateRange: 'Nov 2021 - Dec 2022',
        company: 'WeThinkCode_',
        employmentType: 'Contract',
        logo: wethinkcodeLogo,
        description:
            'Led the creation and rollout of student ID cards across the Cape Town campus. Collaborated with content teams in Johannesburg and Durban to produce social media content, including video and photography, enhancing institutional visibility and engagement.',
    },
    {
        role: 'Technical Support',
        location: 'Cape Town, South Africa',
        dateRange: 'Sep 2021 - Dec 2022',
        company: 'WeThinkCode_',
        employmentType: 'Contract',
        logo: wethinkcodeLogo,
        description:
            'Provided technical assistance and troubleshooting for internal systems and digital infrastructure, ensuring smooth operations and user support across departments.',
    },
] as const;

export const education = [
    {
        school: 'WeThinkCode',
        dateRange: '2021 - 2022',
        logo: wethinkcodeLogo,
        degree: 'Higher National Diploma, Information Technology in Systems Development',
    },
] as const;

export const skills = [
    'PHP',
    'Laravel',
    'Nuxt.js',
    'React',
    'VueJS',
    'TypeScript',
] as const;
